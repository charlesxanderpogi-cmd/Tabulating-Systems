"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Role = "admin" | "judge" | "tabulator";

export default function Home() {
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

    const identifierAsEmail = identifier.trim();

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: identifierAsEmail,
        password,
      });

    if (signInError) {
      setError(signInError.message || "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    if (!data?.user) {
      setError("No user account was found.");
      setIsSubmitting(false);
      return;
    }

    if (role === "admin") {
      setSuccess("Welcome back, administrator. Redirecting to admin console...");
    } else if (role === "tabulator") {
      setSuccess("Welcome tabulator. Redirecting to tabulation workspace...");
    } else {
      setSuccess("Welcome judge. Redirecting to scoring dashboard...");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <header className="mb-6 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Event Tabulating System
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Sign in to continue
          </h1>
          <p className="text-sm text-slate-500">
            Use the credentials assigned to you for this event.
          </p>
        </header>

        <div className="mb-5 inline-flex w-full rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setRole("judge")}
            className={`flex-1 rounded-full px-3 py-2 transition ${
              role === "judge" ? "bg-sky-600 text-white shadow-sm" : ""
            }`}
          >
            Judge
          </button>
          <button
            type="button"
            onClick={() => setRole("tabulator")}
            className={`flex-1 rounded-full px-3 py-2 transition ${
              role === "tabulator" ? "bg-sky-600 text-white shadow-sm" : ""
            }`}
          >
            Tabulator
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 rounded-full px-3 py-2 transition ${
              role === "admin" ? "bg-sky-600 text-white shadow-sm" : ""
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="block text-xs font-medium text-slate-800"
            >
              {role === "judge"
                ? "Judge email"
                : role === "tabulator"
                ? "Tabulator email"
                : "Admin email"}
            </label>
            <input
              id="identifier"
              name="identifier"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={
                role === "judge"
                  ? "judge@event.org"
                  : role === "tabulator"
                  ? "tabulator@event.org"
                  : "admin@organization.org"
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-sky-500/0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-800"
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-slate-500/0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="pt-1 text-[11px] text-slate-500">
            Forgot password? Contact the event administrator.
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-slate-500">
          Admins, judges and tabulators are managed in the database tables
          user_admin, user_judge and user_tabulator.
        </p>
      </div>
    </div>
  );
}
