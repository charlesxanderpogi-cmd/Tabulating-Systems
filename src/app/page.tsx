"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Role = "admin" | "judge" | "tabulator";

type UserTabulatorRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
};

type EventRow = {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
};

type JudgeRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  avatar_url: string | null;
};

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("judge");
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for Judge login
  const [events, setEvents] = useState<EventRow[]>([]);
  const [judges, setJudges] = useState<JudgeRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<number | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) return;

      const supabase = getSupabaseClient();

      // Fetch active events
      const { data: eventsData } = await supabase
        .from("event")
        .select("id, name, year, is_active")
        .eq("is_active", true)
        .order("year", { ascending: false });

      if (eventsData) setEvents(eventsData as unknown as EventRow[]);

      // Fetch judges
      const { data: judgesData } = await supabase
        .from("user_judge")
        .select("id, event_id, full_name, username, avatar_url");

      if (judgesData) setJudges(judgesData as unknown as JudgeRow[]);
    };

    fetchInitialData();
  }, []);

  const selectedJudge = useMemo(() => {
    return judges.find((j) => j.id === selectedJudgeId) || null;
  }, [judges, selectedJudgeId]);

  const filteredJudges = useMemo(() => {
    if (!selectedEventId) return [];
    return judges.filter((j) => j.event_id === selectedEventId);
  }, [judges, selectedEventId]);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
    setIdentifier("");
    setPassword("");
    setError(null);
    setSuccess(null);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
    setSuccess(null);
  };

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

    const supabase = getSupabaseClient();

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
        document.cookie = `admin_username=${encodeURIComponent(username)}; path=/`;
      } catch {}
      setSuccess("Welcome back, administrator. Redirecting to admin console...");
      router.push("/admin");
    } else if (role === "tabulator") {
      try {
        window.localStorage.setItem("tabulator_username", username);
        document.cookie = `tabulator_username=${encodeURIComponent(username)}; path=/`;
      } catch {}
      setSuccess("Welcome tabulator. Redirecting to tabulation workspace...");
      router.push("/tabulator");
    } else {
      try {
        window.localStorage.setItem("judge_username", username);
        document.cookie = `judge_username=${encodeURIComponent(username)}; path=/`;
      } catch {}
      setSuccess("Welcome judge. Redirecting to scoring dashboard...");
      router.push("/judge");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F5F9] px-4 text-slate-900">
      {/* Background patterns */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1F] blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1A] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] border border-white/40 bg-white/80 px-10 py-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.18)]">
        {!(step === 2 && role === "judge") && (
          <header className="relative mb-8 text-center">
            <div className="flex items-center justify-center gap-8">
              <div className="flex h-32 items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex h-20 items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src="/cite.png"
                  alt="Cite"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </header>
        )}

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-700">Select your role</h2>
              <p className="text-[13px] text-slate-400">Choose an account type to continue</p>
            </div>

            <div className="grid gap-4">
              {[
                { id: "admin", label: "Administrator", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "bg-[#1F4D3A]", hover: "hover:border-[#1F4D3A] hover:bg-[#1F4D3A]/5" },
                { id: "judge", label: "Judge", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3", color: "bg-[#1F4D3A]", hover: "hover:border-[#1F4D3A] hover:bg-[#1F4D3A]/5" },
                { id: "tabulator", label: "Tabulator", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-[#1F4D3A]", hover: "hover:border-[#1F4D3A] hover:bg-[#1F4D3A]/5" }
              ].map((roleOption) => (
                <button
                  key={roleOption.id}
                  onClick={() => handleRoleSelect(roleOption.id as Role)}
                  className={`group flex w-full items-center gap-5 rounded-2xl border-2 border-slate-100 bg-white p-4 text-left transition-all duration-300 ${roleOption.hover}`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors duration-300 group-hover:bg-[#1F4D3A] group-hover:text-white`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={roleOption.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="block text-base font-bold text-slate-700 transition-colors group-hover:text-[#1F4D3A]">
                      {roleOption.label}
                    </span>
                    <span className="text-xs text-slate-400 leading-none">
                      Access {roleOption.id} dashboard
                    </span>
                  </div>
                  <svg className="h-5 w-5 translate-x-0 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#1F4D3A] group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {role === "judge" ? (
              /* Judge Custom Login View */
              <div className="flex flex-col items-center pt-4">
                <div className="mb-8 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-2xl ring-1 ring-slate-200">
                  {selectedJudge?.avatar_url ? (
                    <img
                      src={selectedJudge.avatar_url}
                      alt="Judge Avatar"
                      className="h-full w-full object-contain"
                      style={(() => {
                        try {
                          const u = new URL(selectedJudge.avatar_url);
                          const txp = u.searchParams.get("txp");
                          const typ = u.searchParams.get("typ");
                          const tz = u.searchParams.get("tz");
                          if (txp !== null && typ !== null && tz !== null) {
                            // We use percentages for translate to make it responsive to the container size
                            return {
                              transform: `translate(${parseFloat(txp) * 100}%, ${parseFloat(typ) * 100}%) scale(${parseFloat(tz)})`,
                            };
                          }
                        } catch (e) {}
                        return { objectFit: "cover" };
                      })()}
                    />
                  ) : (
                    <svg
                      className="h-20 w-20 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-3">
                  <div className="space-y-1">
                    <label className="ml-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Select Event
                    </label>
                    <select
                      value={selectedEventId || ""}
                      onChange={(e) => {
                        setSelectedEventId(Number(e.target.value));
                        setSelectedJudgeId(null); // Reset judge when event changes
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                      required
                    >
                      <option value="">Choose an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} ({event.year})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      JUDGES
                    </label>
                    <select
                      value={selectedJudgeId || ""}
                      onChange={(e) => {
                        const jid = Number(e.target.value);
                        setSelectedJudgeId(jid);
                        const j = judges.find((item) => item.id === jid);
                        if (j) setIdentifier(j.username);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                      disabled={!selectedEventId}
                      required
                    >
                      <option value="">Choose Judge</option>
                      {filteredJudges.map((judge) => (
                        <option key={judge.id} value={judge.id}>
                          {judge.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-2.5 text-[11px] font-medium text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-[11px] font-medium text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {success}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] py-3 text-xs font-bold text-white shadow-lg shadow-[#1F4D3A30] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        "Sign in to Dashboard"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="group flex items-center justify-center gap-1.5 py-0.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-[#1F4D3A]"
                    >
                      <svg
                        className="h-3 w-3 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Switch role
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Admin/Tabulator Login Form View */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-5 text-center">
                  <h2 className="text-base font-bold text-slate-800">
                    {role.charAt(0).toUpperCase() + role.slice(1)} Login
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Please enter your credentials below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="identifier"
                      className="ml-1 text-[9px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        placeholder={`Enter ${role} username`}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="ml-1 text-[9px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-2.5 text-[11px] font-medium text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-[11px] font-medium text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {success}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F4D3A] py-3 text-xs font-bold text-white shadow-lg shadow-[#1F4D3A30] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="h-3.5 w-3.5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        "Sign in to Dashboard"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleBack}
                      className="group flex items-center justify-center gap-1.5 py-0.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-[#1F4D3A]"
                    >
                      <svg
                        className="h-3 w-3 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Switch role
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
