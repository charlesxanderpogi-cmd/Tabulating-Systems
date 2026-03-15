export type SessionRole = "admin" | "judge" | "tabulator";

export type SessionPayload = {
  role: SessionRole;
  username: string;
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSha256(secret: string, data: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(signature);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a[i] ^ b[i];
  }
  return out === 0;
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp"> & { exp: number }, secret: string) {
  const json = JSON.stringify(payload);
  const data = base64UrlEncode(new TextEncoder().encode(json));
  const sig = base64UrlEncode(await hmacSha256(secret, data));
  return `${data}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expected = await hmacSha256(secret, data);
  const actual = base64UrlDecodeToBytes(sig);
  if (!timingSafeEqual(expected, actual)) return null;

  try {
    const decoded = new TextDecoder().decode(base64UrlDecodeToBytes(data));
    const parsed = JSON.parse(decoded) as SessionPayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (
      parsed.role !== "admin" &&
      parsed.role !== "judge" &&
      parsed.role !== "tabulator"
    ) {
      return null;
    }
    if (typeof parsed.username !== "string" || !parsed.username.trim()) return null;
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) return null;
    if (Date.now() / 1000 >= parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    (() => {
      throw new Error("SESSION_SECRET is not configured");
    })()
  );
}

export function getSessionCookieName() {
  return "ts_session";
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
