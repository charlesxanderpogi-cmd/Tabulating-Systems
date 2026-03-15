import {
  getSessionCookieName,
  getSessionSecret,
  verifySessionToken,
} from "@/lib/session";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    if (k !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

export async function GET(request: Request) {
  const cookieName = getSessionCookieName();
  const token = getCookieValue(request.headers.get("cookie"), cookieName);
  if (!token) {
    return new Response(JSON.stringify({ session: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const secret = getSessionSecret();
    const session = await verifySessionToken(token, secret);
    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ session: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

