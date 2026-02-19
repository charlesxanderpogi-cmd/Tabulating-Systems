"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Role = "admin" | "judge" | "tabulator";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("judge");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const username = identifier.trim();
    const functionName =
      role === "admin"
        ? "authenticate_admin"
        : role === "judge"
        ? "authenticate_judge"
        : "authenticate_tabulator";

    const { data, error: authError } = await supabase.rpc(functionName, {
      p_username: username,
      p_password: password,
    });

    if (authError) {
      setError(authError.message || "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      setError("Invalid username or password.");
      setIsSubmitting(false);
      return;
    }

    if (role === "admin") {
      try {
        window.localStorage.setItem("admin_username", username);
      } catch {}
      setSuccess("Welcome back, administrator. Redirecting to admin console...");
      router.push("/admin");
    } else if (role === "tabulator") {
      try {
        window.localStorage.setItem("tabulator_username", username);
      } catch {}
      setSuccess("Welcome tabulator. Redirecting to tabulation workspace...");
      router.push("/tabulator");
    } else {
      try {
        window.localStorage.setItem("judge_username", username);
      } catch {}
      setSuccess("Welcome judge. Redirecting to scoring dashboard...");
      router.push("/judge");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] px-4 text-slate-900">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#1F4D3A33] bg-white/95 px-10 py-9 shadow-[0_22px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#1F4D3A14] blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[#F4C43012] blur-3xl" />
        </div>

        <header className="relative mb-6 space-y-1 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F4D3A]">
            Tabulating System
          </h1>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4A3F35]">
            Admin • Judge • Tabulator
          </p>
        </header>

        <div className="relative space-y-6">
          <div className="flex gap-2 rounded-full bg-[#E3F2EA] p-1 text-[11px] font-medium text-[#1F4D3A]">
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 rounded-full px-4 py-2.5 transition ${
                role === "admin"
                  ? "bg-[#1F4D3A] text-white shadow-sm"
                  : "hover:bg-[#1F4D3A0D]"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("judge")}
              className={`flex-1 rounded-full px-4 py-2.5 transition ${
                role === "judge"
                  ? "bg-[#1F4D3A] text-white shadow-sm"
                  : "hover:bg-[#1F4D3A0D]"
              }`}
            >
              Judge
            </button>
            <button
              type="button"
              onClick={() => setRole("tabulator")}
              className={`flex-1 rounded-full px-4 py-2.5 transition ${
                role === "tabulator"
                  ? "bg-[#1F4D3A] text-white shadow-sm"
                  : "hover:bg-[#1F4D3A0D]"
              }`}
            >
              Tabulator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-[11px] font-medium text-[#1F4D3A]"
              >
                {role === "judge"
                  ? "Judge username"
                  : role === "tabulator"
                  ? "Tabulator username"
                  : "Admin username"}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={
                  role === "judge"
                    ? "judge_username"
                    : role === "tabulator"
                    ? "tabulator_username"
                    : "admin_username"
                }
                className="w-full rounded-xl border border-[#D0D7E2] bg-[#F5F7FF] px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-[#1F4D3A]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#D0D7E2] bg-[#F5F7FF] px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[#C0392B] bg-[#FDECEA] px-3 py-2 text-[11px] text-[#C0392B]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-[#2ECC71] bg-[#E9F9F1] px-3 py-2 text-[11px] text-[#1E9C57]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1F4D3A] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-[0_10px_25px_rgba(31,77,58,0.35)] transition hover:bg-[#163528] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
