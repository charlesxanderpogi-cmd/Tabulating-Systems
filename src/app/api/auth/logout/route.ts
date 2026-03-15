import { getSessionCookieName, isSameOrigin } from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  const cookieName = getSessionCookieName();
  const expired = [
    `${cookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") {
    expired.push("Secure");
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": expired.join("; "),
    },
  });
}
