 "use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type EventRow = {
  id: number;
  name: string;
  code: string;
  year: number;
  is_active: boolean;
  created_at: string;
};

type ContestRow = {
  id: number;
  event_id: number;
  name: string;
  contest_code: string | null;
  created_at: string;
};

type CriteriaRow = {
  id: number;
  contest_id: number;
  name: string;
  percentage: number;
  description: string | null;
  criteria_code: string | null;
  created_at: string;
};

type CategoryRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type ParticipantRow = {
  id: number;
  contest_id: number;
  group_id: number;
  full_name: string;
  contestant_number: string;
  created_at: string;
};

type ScoreRow = {
  id: number;
  judge_id: number;
  participant_id: number;
  criteria_id: number;
  score: number;
  created_at: string;
};

type JudgeRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  created_at: string;
};

export default function JudgeDashboardPage() {
  const router = useRouter();
  const [judge, setJudge] = useState<JudgeRow | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [criteriaList, setCriteriaList] = useState<CriteriaRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [assignedContestIds, setAssignedContestIds] = useState<number[]>([]);
  const [activeContestId, setActiveContestId] = useState<number | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingScoreKey, setIsSavingScoreKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadJudgeData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setError(
          "Supabase is not configured. Contact the administrator of this system.",
        );
        setIsLoading(false);
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (typeof window === "undefined") {
        setError("No browser session found. Please sign in again.");
        setIsLoading(false);
        return;
      }

      const storedUsername = window.localStorage.getItem("judge_username");

      if (!storedUsername) {
        setError("No judge session found. Please sign in again.");
        setIsLoading(false);
        router.push("/");
        return;
      }

      const { data: judgeRows, error: judgeError } = await supabase
        .from("user_judge")
        .select("id, event_id, full_name, username, created_at")
        .eq("username", storedUsername)
        .limit(1);

      if (judgeError) {
        setError(judgeError.message || "Unable to load judge profile.");
        setIsLoading(false);
        return;
      }

      if (!judgeRows || judgeRows.length === 0) {
        setError("Judge account not found. Please contact the administrator.");
        setIsLoading(false);
        return;
      }

      const judgeRow = judgeRows[0] as JudgeRow;
      setJudge(judgeRow);

      const [{ data: eventRows, error: eventError }, { data: assignmentRows }] =
        await Promise.all([
        supabase
          .from("event")
          .select("id, name, code, year, is_active, created_at")
          .eq("id", judgeRow.event_id)
          .limit(1),
        supabase
          .from("judge_assignment")
          .select("contest_id")
          .eq("judge_id", judgeRow.id),
        ]);

      if (eventError) {
        setError(eventError.message || "Unable to load event information.");
        setIsLoading(false);
        return;
      }

      if (!eventRows || eventRows.length === 0) {
        setError("Assigned event not found. Please contact the administrator.");
        setIsLoading(false);
        return;
      }

      setEvent(eventRows[0] as EventRow);

      const contestIds =
        assignmentRows?.map((row) => row.contest_id as number) ?? [];

      if (contestIds.length === 0) {
        setAssignedContestIds([]);
        setContests([]);
        setParticipants([]);
        setCriteriaList([]);
        setCategories([]);
        setScores([]);
        setIsLoading(false);
        return;
      }

      setAssignedContestIds(contestIds);

      const [
        { data: contestRows, error: contestError },
        { data: participantRows, error: participantError },
        { data: criteriaRows, error: criteriaError },
        { data: categoryRows, error: categoryError },
        { data: scoreRows, error: scoreError },
      ] = await Promise.all([
        supabase
          .from("contest")
          .select("id, event_id, name, contest_code, created_at")
          .in("id", contestIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("participant")
          .select(
            "id, contest_id, group_id, full_name, contestant_number, created_at",
          )
          .in("contest_id", contestIds),
        supabase
          .from("criteria")
          .select(
            "id, contest_id, name, percentage, created_at, description, criteria_code",
          )
          .in("contest_id", contestIds),
        supabase
          .from("group_category")
          .select("id, event_id, name, created_at")
          .eq("event_id", judgeRow.event_id),
        supabase
          .from("score")
          .select(
            "id, judge_id, participant_id, criteria_id, score, created_at",
          )
          .eq("judge_id", judgeRow.id),
      ]);

      if (
        contestError ||
        participantError ||
        criteriaError ||
        categoryError ||
        scoreError
      ) {
        const message =
          contestError?.message ||
          participantError?.message ||
          criteriaError?.message ||
          categoryError?.message ||
          scoreError?.message ||
          "Unable to load judging data.";
        setError(message);
        setIsLoading(false);
        return;
      }

      setContests((contestRows ?? []) as ContestRow[]);
      setParticipants((participantRows ?? []) as ParticipantRow[]);
      setCriteriaList((criteriaRows ?? []) as CriteriaRow[]);
      setCategories((categoryRows ?? []) as CategoryRow[]);
      const typedScores = (scoreRows ?? []) as ScoreRow[];
      setScores(typedScores);

      const initialInputs: Record<string, string> = {};
      for (const score of typedScores) {
        const key = `${score.participant_id}-${score.criteria_id}`;
        initialInputs[key] = String(score.score);
      }
      setScoreInputs(initialInputs);

      if (contestIds.length > 0) {
        setActiveContestId(contestIds[0]);
      }

      setIsLoading(false);
    };

    loadJudgeData();
  }, [router]);

  const activeContest = useMemo(
    () => contests.find((contest) => contest.id === activeContestId) || null,
    [contests, activeContestId],
  );

  const activeContestCriteria = useMemo(
    () =>
      criteriaList.filter(
        (criteria) => criteria.contest_id === activeContestId,
      ),
    [criteriaList, activeContestId],
  );

  const activeContestParticipants = useMemo(
    () =>
      participants.filter(
        (participant) => participant.contest_id === activeContestId,
      ),
    [participants, activeContestId],
  );

  const participantCategoryName = (participant: ParticipantRow) => {
    const category = categories.find(
      (category) => category.id === participant.group_id,
    );
    return category ? category.name : "Uncategorized";
  };

  const contestProgress = (contestId: number) => {
    const contestParticipants = participants.filter(
      (participant) => participant.contest_id === contestId,
    );
    const contestCriteria = criteriaList.filter(
      (criteria) => criteria.contest_id === contestId,
    );

    if (contestParticipants.length === 0 || contestCriteria.length === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

    const totalCells = contestParticipants.length * contestCriteria.length;
    const filledCells = scores.filter((score) => {
      const participant = contestParticipants.find(
        (p) => p.id === score.participant_id,
      );
      const criteria = contestCriteria.find(
        (c) => c.id === score.criteria_id,
      );
      return Boolean(participant && criteria);
    }).length;

    return {
      completed: filledCells,
      total: totalCells,
      percent: totalCells === 0 ? 0 : Math.round((filledCells / totalCells) * 100),
    };
  };

  const handleScoreChange = (
    participantId: number,
    criteriaId: number,
    value: string,
  ) => {
    const key = `${participantId}-${criteriaId}`;
    setScoreInputs((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleScoreBlur = async (
    participantId: number,
    criteriaId: number,
  ) => {
    if (!judge) {
      return;
    }

    const key = `${participantId}-${criteriaId}`;
    const value = scoreInputs[key];

    if (value === undefined || value === "") {
      return;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setError("Scores must be between 0 and 100.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase is not configured.");
      return;
    }

    setIsSavingScoreKey(key);
    setError(null);
    setSuccess(null);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const existing = scores.find(
      (score) =>
        score.judge_id === judge.id &&
        score.participant_id === participantId &&
        score.criteria_id === criteriaId,
    );

    if (!existing) {
      const { data, error } = await supabase
        .from("score")
        .insert({
          judge_id: judge.id,
          participant_id: participantId,
          criteria_id: criteriaId,
          score: parsed,
        })
        .select(
          "id, judge_id, participant_id, criteria_id, score, created_at",
        );

      setIsSavingScoreKey(null);

      if (error) {
        setError(error.message || "Unable to save score.");
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as ScoreRow;
        setScores((previous) => [...previous, created]);
        setSuccess("Score saved.");
      }
    } else {
      const { data, error } = await supabase
        .from("score")
        .update({ score: parsed })
        .eq("id", existing.id)
        .select(
          "id, judge_id, participant_id, criteria_id, score, created_at",
        );

      setIsSavingScoreKey(null);

      if (error) {
        setError(error.message || "Unable to update score.");
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as ScoreRow;
        setScores((previous) =>
          previous.map((score) => (score.id === updated.id ? updated : score)),
        );
        setSuccess("Score updated.");
      }
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("judge_username");
    }
    router.push("/");
  };

  const headerTitle =
    judge && event
      ? `${event.name} • ${event.year}`
      : "Judge scoring dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1F4D3A]">
              {headerTitle}
            </h1>
            <p className="text-xs text-slate-600">
              Modern scoring workspace for judges of the tabulating system.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {judge && (
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[#1F4D3A]">
                  {judge.full_name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Judge • @{judge.username}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-[#1F4D3A33] px-3 py-1.5 text-[11px] font-medium text-[#1F4D3A] hover:bg-[#1F4D3A0A]"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4">
          <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="rounded-full bg-[#E3F2EA] px-3 py-1.5 text-[10px] font-medium text-[#1F4D3A]">
                  {event ? `Event: ${event.name}` : "No active event assigned"}
                </div>
                <div className="rounded-full bg-[#F5F7FF] px-3 py-1.5 text-[10px] font-medium text-slate-700">
                  {assignedContestIds.length > 0
                    ? `${assignedContestIds.length} contest${
                        assignedContestIds.length > 1 ? "s" : ""
                      } assigned`
                    : "No contest assignments yet"}
                </div>
              </div>
              {isLoading && (
                <div className="text-[11px] text-slate-500">Loading data…</div>
              )}
            </div>

            {error && (
              <div className="mb-3 rounded-xl border border-[#C0392B] bg-[#FDECEA] px-3 py-2 text-[11px] text-[#C0392B]">
                {error}
              </div>
            )}

            {success && !error && (
              <div className="mb-3 rounded-xl border border-[#2ECC71] bg-[#E9F9F1] px-3 py-2 text-[11px] text-[#1E9C57]">
                {success}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,2fr)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                  <span>Assigned contests</span>
                  <span className="text-[10px] text-slate-400">
                    Tap a contest to start scoring
                  </span>
                </div>

                <div className="space-y-2">
                  {contests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center text-[11px] text-slate-500">
                      Once the administrator assigns contests to you, they will
                      appear here.
                    </div>
                  ) : (
                    contests.map((contest) => {
                      const progress = contestProgress(contest.id);
                      const isActive = contest.id === activeContestId;

                      return (
                        <button
                          key={contest.id}
                          type="button"
                          onClick={() => setActiveContestId(contest.id)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left text-[11px] transition ${
                            isActive
                              ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                              : "border-[#E2E8F0] bg-white hover:border-[#1F4D3A33] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={
                                isActive
                                  ? "font-semibold"
                                  : "font-semibold text-slate-800"
                              }
                            >
                              {contest.name}
                            </span>
                            <span
                              className={
                                isActive
                                  ? "text-[10px] text-[#E2F8EC]"
                                  : "text-[10px] text-slate-500"
                              }
                            >
                              {progress.total === 0
                                ? "Waiting for participants or criteria"
                                : `${progress.completed}/${progress.total} scores recorded`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-20 rounded-full bg-black/5">
                              <div
                                className={`h-8 rounded-full ${
                                  isActive ? "bg-[#E9F9F1]" : "bg-[#E3F2EA]"
                                }`}
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                            <span
                              className={
                                isActive
                                  ? "text-[10px] font-semibold text-[#E9F9F1]"
                                  : "text-[10px] font-semibold text-slate-700"
                              }
                            >
                              {progress.percent}%
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                {!activeContest || activeContestParticipants.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-[11px] text-slate-500">
                    <div className="rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#1F4D3A] shadow-sm">
                      Scoring workspace
                    </div>
                    <p>
                      Select a contest on the left to begin scoring participants.
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-[#1F4D3A]">
                          {activeContest.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Score each participant across all criteria below.
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-700">
                        {activeContestCriteria.length} criteria •{" "}
                        {activeContestParticipants.length} participants
                      </div>
                    </div>

                    <div className="mt-1 max-h-[420px] overflow-auto rounded-xl border border-[#E2E8F0] bg-white">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead className="sticky top-0 z-10 bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-medium">Participant</th>
                            <th className="px-3 py-2 font-medium">Category</th>
                            {activeContestCriteria.map((criteria) => (
                              <th
                                key={criteria.id}
                                className="px-3 py-2 font-medium"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span>{criteria.name}</span>
                                  <span className="text-[9px] text-slate-400">
                                    {criteria.percentage}% weight
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeContestParticipants.map((participant) => (
                            <tr
                              key={participant.id}
                              className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                            >
                              <td className="px-3 py-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800">
                                    {participant.full_name}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    #{participant.contestant_number}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {participantCategoryName(participant)}
                              </td>
                              {activeContestCriteria.map((criteria) => {
                                const key = `${participant.id}-${criteria.id}`;
                                const value = scoreInputs[key] ?? "";
                                const isSaving = isSavingScoreKey === key;

                                return (
                                  <td key={criteria.id} className="px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        value={value}
                                        onChange={(event) =>
                                          handleScoreChange(
                                            participant.id,
                                            criteria.id,
                                            event.target.value,
                                          )
                                        }
                                        onBlur={() =>
                                          handleScoreBlur(
                                            participant.id,
                                            criteria.id,
                                          )
                                        }
                                        className="w-20 rounded-lg border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                                      />
                                      <span className="text-[9px] text-slate-400">
                                        /100
                                      </span>
                                      {isSaving && (
                                        <span className="text-[9px] text-[#1F4D3A]">
                                          Saving…
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
