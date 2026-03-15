import { createClient } from "@supabase/supabase-js";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionSecret,
  isSameOrigin,
  type SessionRole,
} from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const role = body?.role;
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (
      role !== "admin" &&
      role !== "judge" &&
      role !== "tabulator"
    ) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Supabase is not configured" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const fn =
      role === "admin"
        ? "authenticate_admin"
        : role === "judge"
          ? "authenticate_judge"
          : "authenticate_tabulator";

    const { data, error } = await supabase.rpc(fn, {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const secret = getSessionSecret();
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = await createSessionToken(
      { role: role as SessionRole, username, exp },
      secret,
    );

    const cookieName = getSessionCookieName();
    const cookie = [
      `${cookieName}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=604800",
    ];
    if (process.env.NODE_ENV === "production") {
      cookie.push("Secure");
    }

    return new Response(JSON.stringify({ ok: true, role }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "set-cookie": cookie.join("; "),
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unable to sign in" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
