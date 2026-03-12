import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body?.id;

    if (typeof id !== "number" || !Number.isFinite(id)) {
      return new Response(JSON.stringify({ error: "Invalid message id" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_KEY ??
      process.env.SUPABASE_SERVICE_ROLE;

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing Supabase configuration. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-side only).",
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const attemptDeleteMessage = async () =>
      supabase
        .from("judge_message")
        .delete()
        .eq("id", id)
        .select("id")
        .limit(1);

    let { data, error } = await attemptDeleteMessage();

    if (error) {
      const msg = typeof error.message === "string" ? error.message.toLowerCase() : "";
      const looksLikeFk =
        msg.includes("foreign key") ||
        msg.includes("violates foreign key") ||
        msg.includes("constraint");

      if (looksLikeFk) {
        await supabase.from("judge_message_seen").delete().eq("message_id", id);
        ({ data, error } = await attemptDeleteMessage());
      }
    }

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Not found or blocked by policy" }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ deletedId: data[0].id }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
