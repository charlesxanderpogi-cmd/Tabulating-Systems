import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseDatabase";

type SupabaseClientType = ReturnType<typeof createClient<Database>>;

let supabaseClient: SupabaseClientType | null = null;

export function getSupabaseClient(): SupabaseClientType {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient!;
}
