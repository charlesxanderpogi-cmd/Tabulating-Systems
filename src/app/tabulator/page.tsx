"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type EventRow = {
  id: number;
  name: string;
  code: string;
  year: number;
  is_active: boolean | null;
  created_at: string;
};

type ContestRow = {
  id: number;
  event_id: number;
  name: string;
  contest_code: string | null;
  created_at: string;
};

type CategoryRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type TeamRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type CriteriaRow = {
  id: number;
  contest_id: number;
  name: string;
  percentage: number;
  created_at: string;
  description: string | null;
  criteria_code: string | null;
  category: string | null;
};

type AwardRow = {
  id: number;
  event_id: number;
  contest_id: number | null;
  name: string;
  description: string | null;
  award_type: "criteria" | "special";
  criteria_id: number | null;
  criteria_ids: number[] | null;
  is_active: boolean;
  created_at: string;
};

type ParticipantRow = {
  id: number;
  contest_id: number;
  division_id: number;
  team_id: number | null;
  full_name: string;
  contestant_number: string;
  created_at: string;
  avatar_url: string | null;
};

type ScoreRow = {
  id: number;
  judge_id: number;
  participant_id: number;
  criteria_id: number;
  score: number;
  created_at: string;
};

type TabulatorRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  created_at: string;
};

type TotalRow = {
  id: number;
  judge_id: number;
  participant_id: number;
  contest_id: number;
  total_score: number;
  created_at: string;
};

type RankingRow = {
  participant: ParticipantRow;
  categoryName: string;
  teamName: string | null;
  totalScore: number;
  rank: number;
};

type AwardResult = {
  award: AwardRow;
  contestName: string;
  criteriaName: string | null;
  winners: RankingRow[];
};

type AwardRankingRow = {
  row: RankingRow;
  criteriaTotal: number | null;
  rank: number | null;
};

export default function TabulatorPage() {
  const router = useRouter();
  const [tabulator, setTabulator] = useState<TabulatorRow | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [criteriaList, setCriteriaList] = useState<CriteriaRow[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [totals, setTotals] = useState<TotalRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [activeContestId, setActiveContestId] = useState<number | null>(null);
  const [activeDivisionFilterId, setActiveDivisionFilterId] = useState<number | "all">(
    "all",
  );
  const [activeView, setActiveView] = useState<"overall" | "awards">("awards");
  const [activeAwardFilterId, setActiveAwardFilterId] = useState<number | "all">(
    "all",
  );
  const [selectedJudgeForBreakdown, setSelectedJudgeForBreakdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<
      ReturnType<typeof createClient>["channel"]
    > | null = null;

    const loadTabulatorData = async () => {
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

      const storedUsername = window.localStorage.getItem("tabulator_username");

      if (!storedUsername) {
        setError("No tabulator session found. Please sign in again.");
        setIsLoading(false);
        return;
      }

      const { data: tabulatorRows, error: tabulatorError } = await supabase
        .from("user_tabulator")
        .select("id, event_id, full_name, username, created_at")
        .eq("username", storedUsername)
        .limit(1);

      if (tabulatorError) {
        setError(tabulatorError.message || "Unable to load tabulator account.");
        setIsLoading(false);
        return;
      }

      if (!tabulatorRows || tabulatorRows.length === 0) {
        setError("Tabulator account not found. Please contact the administrator.");
        setIsLoading(false);
        return;
      }

      const tabulatorRow = tabulatorRows[0] as TabulatorRow;
      setTabulator(tabulatorRow);

      const {
        data: activeEvents,
        error: activeEventError,
      } = await supabase
        .from("event")
        .select("id, name, code, year, is_active, created_at")
        .eq("id", tabulatorRow.event_id)
        .limit(1);

      if (activeEventError) {
        setError(
          activeEventError.message ||
            "Unable to load assigned event. Please contact the administrator.",
        );
        setIsLoading(false);
        return;
      }

      if (!activeEvents || activeEvents.length === 0) {
        setError(
          "No event is assigned to this tabulator. Please contact the administrator.",
        );
        setIsLoading(false);
        return;
      }

      const activeEvent = activeEvents[0] as EventRow;
      setEvent(activeEvent);

      if (!activeEvent.is_active) {
        setIsLoading(false);
        return;
      }

      const {
        data: contestRows,
        error: contestError,
      } = await supabase
        .from("contest")
        .select("id, event_id, name, contest_code, created_at")
        .eq("event_id", activeEvent.id)
        .order("created_at", { ascending: false });

      if (contestError) {
        setError(contestError.message || "Unable to load contests for event.");
        setIsLoading(false);
        return;
      }

      const contestIdsForEvent =
        contestRows?.map((row) => (row as ContestRow).id) ?? [];

      const [
        { data: categoryRows, error: categoryError },
        { data: teamRows, error: teamError },
        { data: participantRows, error: participantError },
        { data: totalRows, error: totalError },
        { data: criteriaRows, error: criteriaError },
        { data: awardRows, error: awardError },
        { data: scoreRows, error: scoreError },
      ] = await Promise.all([
        supabase
          .from("division")
          .select("id, event_id, name, created_at")
          .eq("event_id", activeEvent.id),
        supabase
          .from("team")
          .select("id, event_id, name, created_at")
          .eq("event_id", activeEvent.id),
        supabase
          .from("participant")
          .select(
            "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url",
          )
          .in("contest_id", contestIdsForEvent),
        supabase
          .from("judge_participant_total")
          .select(
            "id, judge_id, participant_id, contest_id, total_score, created_at",
          ),
        supabase
          .from("criteria")
          .select(
            "id, contest_id, name, percentage, created_at, description, criteria_code, category",
          )
          .in("contest_id", contestIdsForEvent),
        supabase
          .from("award")
          .select(
            "id, event_id, contest_id, name, description, award_type, criteria_id, criteria_ids, is_active, created_at",
          )
          .eq("event_id", activeEvent.id),
        supabase
          .from("score")
          .select(
            "id, judge_id, participant_id, criteria_id, score, created_at",
          ),
      ]);

      if (
        categoryError ||
        teamError ||
        participantError ||
        totalError ||
        criteriaError ||
        awardError ||
        scoreError
      ) {
        const message =
          categoryError?.message ||
          teamError?.message ||
          participantError?.message ||
          totalError?.message ||
          criteriaError?.message ||
          awardError?.message ||
          scoreError?.message ||
          "Unable to load tabulation data.";
        setError(message);
        setIsLoading(false);
        return;
      }

      setContests((contestRows ?? []) as ContestRow[]);
      setCategories((categoryRows ?? []) as CategoryRow[]);
      setTeams((teamRows ?? []) as TeamRow[]);
      setParticipants((participantRows ?? []) as ParticipantRow[]);
      setTotals((totalRows ?? []) as TotalRow[]);
      setCriteriaList((criteriaRows ?? []) as CriteriaRow[]);
      setAwards((awardRows ?? []) as AwardRow[]);
      setScores((scoreRows ?? []) as ScoreRow[]);

      if (contestRows && contestRows.length > 0) {
        setActiveContestId((contestRows[0] as ContestRow).id);
      }

      channel = supabase
        .channel("tabulator-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "event",
            filter: `id=eq.${activeEvent.id}`,
          },
          (payload) => {
            const newRow = payload.new as EventRow;
            setEvent(newRow);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "participant",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as ParticipantRow;
              setParticipants((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;
              if (!oldRow) {
                return;
              }
              setParticipants((previous) =>
                previous.filter((row) => row.id !== oldRow.id),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "judge_participant_total",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as TotalRow;
              setTotals((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;
              if (!oldRow) {
                return;
              }
              setTotals((previous) => previous.filter((row) => row.id !== oldRow.id));
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "score",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as ScoreRow;
              setScores((previous) => {
                const exists = previous.some((score) => score.id === newRow.id);

                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }

                return previous.map((score) =>
                  score.id === newRow.id ? newRow : score,
                );
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number };
              setScores((previous) =>
                previous.filter((score) => score.id !== oldRow.id),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "award",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as AwardRow;
              setAwards((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);

                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }

                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number };
              setAwards((previous) =>
                previous.filter((row) => row.id !== oldRow.id),
              );
            }
          },
        )
        .subscribe();

      setIsLoading(false);
    };

    loadTabulatorData();

    return () => {
      if (!channel) return;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) return;

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      supabase.removeChannel(channel);
    };
  }, []);

  const activeContest = useMemo(
    () => contests.find((contest) => contest.id === activeContestId) || null,
    [contests, activeContestId],
  );

  const categoriesForActiveEvent = useMemo(
    () =>
      event === null
        ? categories
        : categories.filter((category) => category.event_id === event.id),
    [categories, event],
  );

  const activeContestParticipants = useMemo(() => {
    let filtered = participants.filter(
      (participant) => participant.contest_id === activeContestId,
    );

    if (activeDivisionFilterId !== "all") {
      filtered = filtered.filter(
        (participant) => participant.division_id === activeDivisionFilterId,
      );
    }

    return filtered;
  }, [participants, activeContestId, activeDivisionFilterId]);

  const rankings = useMemo<RankingRow[]>(() => {
    if (!activeContest) {
      return [];
    }

    const totalsForContest = totals.filter(
      (row) => row.contest_id === activeContest.id,
    );

    if (totalsForContest.length === 0 || activeContestParticipants.length === 0) {
      return [];
    }

    const sumByParticipant = new Map<number, number>();

    for (const totalRow of totalsForContest) {
      const current = sumByParticipant.get(totalRow.participant_id) ?? 0;
      sumByParticipant.set(
        totalRow.participant_id,
        current + Number(totalRow.total_score),
      );
    }

    const rows: RankingRow[] = [];

    for (const participant of activeContestParticipants) {
      const sum = sumByParticipant.get(participant.id);

      if (sum === undefined) {
        continue;
      }

      const category = categories.find(
        (categoryRow) => categoryRow.id === participant.division_id,
      );

      const team =
        participant.team_id === null
          ? null
          : teams.find((teamRow) => teamRow.id === participant.team_id) ?? null;

      rows.push({
        participant,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        totalScore: Number(sum.toFixed(2)),
        rank: 0,
      });
    }

    rows.sort((a, b) => b.totalScore - a.totalScore);

    let previousScore: number | null = null;
    let currentRank = 0;
    let index = 0;

    for (const row of rows) {
      index += 1;
      if (previousScore === null || row.totalScore < previousScore) {
        currentRank = index;
      }
      row.rank = currentRank;
      previousScore = row.totalScore;
    }

    return rows;
  }, [activeContest, activeContestParticipants, totals, categories, teams]);

  const judgeIdsForActiveContest = useMemo<number[]>(() => {
    if (!activeContest) {
      return [];
    }

    const ids = totals
      .filter((row) => row.contest_id === activeContest.id)
      .map((row) => row.judge_id);

    const uniqueIds = Array.from(new Set(ids));
    uniqueIds.sort((a, b) => a - b);
    return uniqueIds;
  }, [activeContest, totals]);

  const totalScoreByJudgeAndParticipant = useMemo(() => {
    const map = new Map<string, number>();

    if (!activeContest) {
      return map;
    }

    for (const row of totals) {
      if (row.contest_id !== activeContest.id) {
        continue;
      }
      const key = `${row.judge_id}-${row.participant_id}`;
      map.set(key, Number(row.total_score));
    }

    return map;
  }, [activeContest, totals]);

  const criteriaScoreByJudgeAndParticipant = useMemo(() => {
    const map = new Map<string, number>();

    for (const row of scores) {
      // Note: key includes criteria_id
      const key = `${row.criteria_id}-${row.judge_id}-${row.participant_id}`;
      map.set(key, Number(row.score));
    }

    return map;
  }, [scores]);

  const awardsForActiveContest = useMemo(() => {
    if (!event || !activeContest) {
      return [];
    }

    const awardsForEvent = awards.filter(
      (award) => award.event_id === event.id && award.is_active,
    );

    const filtered: AwardRow[] = [];

    for (const award of awardsForEvent) {
      const criteriaIds = award.criteria_ids ?? (award.criteria_id ? [award.criteria_id] : []);
      const firstCriteriaId = criteriaIds.length > 0 ? criteriaIds[0] : null;

      const criteria =
        firstCriteriaId === null
          ? null
          : criteriaList.find((criteriaRow) => criteriaRow.id === firstCriteriaId) ??
            null;

      const contestId = award.contest_id ?? criteria?.contest_id ?? null;

      if (contestId !== activeContest.id) {
        continue;
      }

      filtered.push(award);
    }

    return filtered;
  }, [awards, criteriaList, event, activeContest]);

  const awardsResults = useMemo<AwardResult[]>(() => {
    if (!event || !activeContest) {
      return [];
    }

    const sourceAwards =
      activeAwardFilterId === "all"
        ? awardsForActiveContest
        : awardsForActiveContest.filter(
            (award) => award.id === activeAwardFilterId,
          );

    const results: AwardResult[] = [];

    for (const award of sourceAwards) {
      const criteriaIds = award.criteria_ids ?? (award.criteria_id ? [award.criteria_id] : []);
      const firstCriteriaId = criteriaIds.length > 0 ? criteriaIds[0] : null;

      const criteria =
        firstCriteriaId === null
          ? null
          : criteriaList.find((criteriaRow) => criteriaRow.id === firstCriteriaId) ??
            null;

      if (rankings.length === 0) {
        continue;
      }

      results.push({
        award,
        contestName: activeContest.name,
        criteriaName: criteria ? criteria.name : null,
        winners: rankings,
      });
    }

    return results;
  }, [awardsForActiveContest, criteriaList, rankings, event, activeContest, activeAwardFilterId]);

  const selectedAwardResult = useMemo(() => {
    if (activeAwardFilterId === "all") {
      return null;
    }
    return (
      awardsResults.find((result) => result.award.id === activeAwardFilterId) ??
      null
    );
  }, [awardsResults, activeAwardFilterId]);

  const awardRankingRows = useMemo<AwardRankingRow[]>(() => {
    if (!selectedAwardResult) {
      return [];
    }

    let criteriaIds: number[] = [];
    const rawIds = selectedAwardResult.award.criteria_ids;

    if (Array.isArray(rawIds)) {
      criteriaIds = rawIds.map(id => Number(id));
    } else if (typeof rawIds === 'string') {
      // Handle potential string format
      const s = rawIds as string;
      if (s.startsWith('{') && s.endsWith('}')) {
        criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
      } else {
        criteriaIds = s.split(',').map(n => Number(n.trim()));
      }
    } else if (selectedAwardResult.award.criteria_id) {
      criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
    }

    // Filter out NaNs if any parsing failed
    criteriaIds = criteriaIds.filter(n => !isNaN(n));

    // NEW: If the award has associated criteria, check if we need to include ALL criteria from the categories
    // that the selected criteria belong to.
    if (criteriaIds.length > 0) {
      const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
      const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
      
      if (categories.length > 0) {
          const allCriteriaInCategories = criteriaList.filter(c => categories.includes(c.category));
          const allIds = allCriteriaInCategories.map(c => c.id);
          criteriaIds = Array.from(new Set([...criteriaIds, ...allIds]));
      }
    }

    if (
      selectedAwardResult.award.award_type !== "criteria" ||
      criteriaIds.length === 0
    ) {
      return [];
    }

    const rowsWithTotals: AwardRankingRow[] = selectedAwardResult.winners.map(
      (row) => {
        let totalForCriteria = 0;
        let hasValue = false;

        // Sum up all judge scores for all criteria linked to this award
        for (const judgeId of judgeIdsForActiveContest) {
          // Accumulate judge's total score for this award
          let judgeTotal = 0;
          for (const cId of criteriaIds) {
            const key = `${cId}-${judgeId}-${row.participant.id}`;
            const value = criteriaScoreByJudgeAndParticipant.get(key);
            if (value !== undefined) {
              judgeTotal += value;
              hasValue = true;
            }
          }
          // Add judge's total to overall total
          totalForCriteria += judgeTotal;
        }

        return {
          row,
          criteriaTotal: hasValue ? Number(totalForCriteria.toFixed(2)) : null,
          rank: null,
        };
      },
    );

    const ranked = rowsWithTotals
      .filter((item) => item.criteriaTotal !== null)
      .sort((a, b) => (b.criteriaTotal! - a.criteriaTotal!));

    let previousScore: number | null = null;
    let currentRank = 0;
    let index = 0;

    for (const item of ranked) {
      index += 1;
      if (previousScore === null || item.criteriaTotal! < previousScore) {
        currentRank = index;
      }
      item.rank = currentRank;
      previousScore = item.criteriaTotal!;
    }

    rowsWithTotals.sort((a, b) => {
      if (a.criteriaTotal === null && b.criteriaTotal === null) {
        return 0;
      }
      if (a.criteriaTotal === null) {
        return 1;
      }
      if (b.criteriaTotal === null) {
        return -1;
      }
      return b.criteriaTotal - a.criteriaTotal;
    });

    return rowsWithTotals;
  }, [
    selectedAwardResult,
    judgeIdsForActiveContest,
    criteriaScoreByJudgeAndParticipant,
    criteriaList,
  ]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tabulator_username");
    }
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F4D3A] border-t-transparent" />
          <div className="text-sm font-medium text-slate-500">
            Loading tabulator workspace...
          </div>
        </div>
      </div>
    );
  }

  if (event && !event.is_active) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FF] text-3xl">
          🛑
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-800">
            Event is not active
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            The event <span className="font-medium text-slate-700">{event.name}</span> is currently inactive. Please wait for the administrator to start the event.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 rounded-full border border-[#D0D7E2] bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.print();
  };

  const headerTitle =
    tabulator && event
      ? `${event.name} • ${event.year}`
      : "Tabulation workspace";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1F4D3A]">
              {headerTitle}
            </h1>
            <p className="text-sm text-slate-600">
              Realtime rankings and medals for tabulators.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {tabulator && (
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[#1F4D3A]">
                  {tabulator.full_name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Tabulator • @{tabulator.username}
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
          <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-full bg-[#E3F2EA] px-4 py-2 text-xs font-medium text-[#1F4D3A]">
                  {event ? `Event: ${event.name}` : "No active event assigned"}
                </div>
                <div className="rounded-full bg-[#F5F7FF] px-4 py-2 text-xs font-medium text-slate-700">
                  {contests.length > 0
                    ? `${contests.length} contest${contests.length > 1 ? "s" : ""} available`
                    : "No contests for this event yet"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isLoading && (
                  <div className="text-sm text-slate-500">Loading data…</div>
                )}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-full border border-[#1F4D3A33] px-4 py-2 text-xs font-medium text-[#1F4D3A] hover:bg-[#1F4D3A0A]"
                >
                  Print rankings
                </button>
              </div>
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

            <div className="flex flex-col gap-4">
              <div className="space-y-2 text-sm">
                {contests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center text-sm text-slate-500">
                    Once the administrator creates contests for this event, they will
                    appear here.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex w-full flex-col gap-1 text-xs md:flex-1">
                      <span className="text-[11px] text-slate-500">Contest</span>
                      <select
                        className="w-full rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        value={activeContestId ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setActiveContestId(
                            value ? Number.parseInt(value, 10) : null,
                          );
                        }}
                      >
                        <option value="">Select a contest</option>
                        {contests.map((contest) => (
                          <option key={contest.id} value={contest.id}>
                            {contest.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex w-full flex-col gap-1 text-xs md:flex-1">
                      <span className="text-[11px] text-slate-500">
                        Division filter
                      </span>
                      <select
                        className="w-full rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        value={
                          activeDivisionFilterId === "all"
                            ? "all"
                            : String(activeDivisionFilterId)
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value === "all") {
                            setActiveDivisionFilterId("all");
                          } else {
                            setActiveDivisionFilterId(
                              Number.parseInt(value, 10),
                            );
                          }
                        }}
                      >
                        <option value="all">All divisions</option>
                        {categoriesForActiveEvent.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {!activeContest || rankings.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                  <div className="rounded-full bg-[#F5F7FF] px-4 py-2 text-xs font-medium text-[#1F4D3A] shadow-sm">
                    Tabulation workspace
                  </div>
                  <p>
                    Select a contest above to view rankings once judges have
                    submitted their scores.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* View switcher removed as per request */}

                  {activeView === "overall" && (
                    <div className="flex flex-col gap-6">
                      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                        <table className="min-w-full border-collapse text-left text-sm">
                          <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                            <tr>
                              <th className="px-4 py-3 font-medium">Rank</th>
                              <th className="px-4 py-3 font-medium">Represent</th>
                              <th className="px-4 py-3 font-medium">Contestant</th>
                              {judgeIdsForActiveContest.map((_, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-3 text-right font-medium"
                                >
                                  Judge {index + 1}
                                </th>
                              ))}
                              <th className="px-4 py-3 text-right font-medium">
                                Total score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rankings.map((row) => (
                              <tr
                                key={row.participant.id}
                                className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-4 py-3 align-middle text-sm font-semibold text-slate-700">
                                  {row.rank}
                                </td>
                                <td className="px-4 py-3 align-middle text-sm text-slate-700">
                                  {row.teamName ?? row.categoryName}
                                </td>
                                <td className="px-4 py-3 align-middle">
                                  <div className="text-sm font-semibold text-slate-800">
                                    {row.participant.full_name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Contestant #{row.participant.contestant_number}
                                  </div>
                                </td>
                                {judgeIdsForActiveContest.map((judgeId) => {
                                  const key = `${judgeId}-${row.participant.id}`;
                                  const value = totalScoreByJudgeAndParticipant.has(
                                    key,
                                  )
                                    ? totalScoreByJudgeAndParticipant
                                        .get(key)!
                                        .toFixed(2)
                                    : "—";
                                  return (
                                    <td
                                      key={judgeId}
                                      className="px-4 py-3 align-middle text-right text-sm text-slate-700"
                                    >
                                      {value}
                                    </td>
                                  );
                                })}
                                <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                  {row.totalScore.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeView === "awards" && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4">
                        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-[#1F4D3A]">
                              Awards ranking
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Select an award to view its winners using the same ranking
                              format as overall.
                            </div>
                          </div>
                          <div className="w-full max-w-xs text-xs">
                            <span className="mb-1 block text-[11px] text-slate-500">
                              Award
                            </span>
                            <select
                              className="w-full rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                              value={
                                activeAwardFilterId === "all"
                                  ? ""
                                  : String(activeAwardFilterId)
                              }
                              onChange={(event) => {
                                const value = event.target.value;
                                if (!value) {
                                  setActiveAwardFilterId("all");
                                } else {
                                  setActiveAwardFilterId(
                                    Number.parseInt(value, 10),
                                  );
                                }
                              }}
                            >
                              <option value="">Select award</option>
                              {awardsForActiveContest.map((award) => (
                                <option key={award.id} value={award.id}>
                                  {award.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {awardsForActiveContest.length === 0 ? (
                          <div className="text-[11px] text-slate-400">
                            No awards configured for this contest.
                          </div>
                        ) : !selectedAwardResult ? (
                          <div className="text-[11px] text-slate-400">
                            Select an award above to view its ranking.
                          </div>
                        ) : selectedAwardResult.winners.length === 0 ? (
                          <div className="text-[11px] text-slate-400">
                            No winners available yet for this award.
                          </div>
                        ) : selectedAwardResult.award.award_type !== "criteria" ||
                          ((selectedAwardResult.award.criteria_ids === null || selectedAwardResult.award.criteria_ids.length === 0) && selectedAwardResult.award.criteria_id === null) ? (
                          <div className="text-[11px] text-slate-400">
                            This is a special award. Criteria scores per judge are not
                            available.
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                            <table className="min-w-full border-collapse text-left text-sm">
                              <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                                <tr>
                                  <th className="px-4 py-3 font-medium">Rank</th>
                                  <th className="px-4 py-3 font-medium">Represent</th>
                                  <th className="px-4 py-3 font-medium">Contestant</th>
                                  {judgeIdsForActiveContest.map((judgeId, index) => (
                                    <th
                                      key={judgeId}
                                      className="px-4 py-3 text-center font-medium"
                                    >
                                      <div>Judge {index + 1}</div>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedJudgeForBreakdown(judgeId)}
                                        className="mt-1 rounded-full border border-[#1F4D3A33] bg-white px-2 py-0.5 text-[9px] font-medium text-[#1F4D3A] transition hover:bg-[#F0FDF4]"
                                      >
                                        show more
                                      </button>
                                    </th>
                                  ))}
                                  <th className="px-4 py-3 text-right font-medium">
                                    Total score
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {awardRankingRows.map((item) => (
                                  <tr
                                    key={item.row.participant.id}
                                    className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                  >
                                    <td className="px-4 py-3 align-middle text-sm font-semibold text-slate-700">
                                      {item.rank ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                                      {item.row.teamName ?? item.row.categoryName}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                      <div className="text-sm font-semibold text-slate-800">
                                        {item.row.participant.full_name}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Contestant #{item.row.participant.contestant_number}
                                      </div>
                                    </td>
                                    {judgeIdsForActiveContest.map((judgeId) => {
                                      // Logic to calculate total judge score for this award
                                      let criteriaIds: number[] = [];
                                      const rawIds = selectedAwardResult.award.criteria_ids;

                                      if (Array.isArray(rawIds)) {
                                        criteriaIds = rawIds.map(id => Number(id));
                                      } else if (typeof rawIds === 'string') {
                                        const s = rawIds as string;
                                        if (s.startsWith('{') && s.endsWith('}')) {
                                          criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                                        } else {
                                          criteriaIds = s.split(',').map(n => Number(n.trim()));
                                        }
                                      } else if (selectedAwardResult.award.criteria_id) {
                                        criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
                                      }
                                      
                                      criteriaIds = criteriaIds.filter(n => !isNaN(n));

                                      // Include all criteria from categories
                                      if (criteriaIds.length > 0) {
                                        const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                                        const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
                                        
                                        if (categories.length > 0) {
                                            const allCriteriaInCategories = criteriaList.filter(c => categories.includes(c.category));
                                            const allIds = allCriteriaInCategories.map(c => c.id);
                                            criteriaIds = Array.from(new Set([...criteriaIds, ...allIds]));
                                        }
                                      }

                                      let total = 0;
                                      let hasVal = false;
                                      for (const cId of criteriaIds) {
                                          const key = `${cId}-${judgeId}-${item.row.participant.id}`;
                                          const value = criteriaScoreByJudgeAndParticipant.get(key);
                                          if (value !== undefined) {
                                              total += value;
                                              hasVal = true;
                                          }
                                      }
                                      return (
                                        <td
                                          key={judgeId}
                                          className="px-4 py-3 align-middle text-center text-sm text-slate-700"
                                        >
                                          {hasVal
                                            ? total.toFixed(2)
                                            : "—"}
                                        </td>
                                      );
                                    })}
                                    <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                      {item.criteriaTotal === null
                                        ? "—"
                                        : item.criteriaTotal.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
        
        {/* Judge Score Breakdown Modal */}
        {selectedJudgeForBreakdown !== null && selectedAwardResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F4D3A]">
                    Judge {judgeIdsForActiveContest.indexOf(selectedJudgeForBreakdown) + 1} Breakdown
                  </h3>
                  <p className="text-sm text-slate-500">
                    Detailed scoring for {selectedAwardResult.award.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJudgeForBreakdown(null)}
                  className="rounded-full bg-[#F1F5F9] p-2 text-slate-500 hover:bg-[#E2E8F0]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Contestant</th>
                      {(() => {
                        // Determine categories involved
                        let criteriaIds: number[] = [];
                        const rawIds = selectedAwardResult.award.criteria_ids;

                        if (Array.isArray(rawIds)) {
                          criteriaIds = rawIds.map(id => Number(id));
                        } else if (typeof rawIds === 'string') {
                          const s = rawIds as string;
                          if (s.startsWith('{') && s.endsWith('}')) {
                            criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                          } else {
                            criteriaIds = s.split(',').map(n => Number(n.trim()));
                          }
                        } else if (selectedAwardResult.award.criteria_id) {
                          criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
                        }
                        
                        criteriaIds = criteriaIds.filter(n => !isNaN(n));
                        
                        // Expand to categories
                        const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                        const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
                        
                        // If categories exist, show columns for each category
                        if (categories.length > 0) {
                            return categories.map(cat => (
                                <th key={cat} className="px-4 py-3 text-center font-medium">
                                    {cat}
                                </th>
                            ));
                        } else {
                            // If no categories, maybe just show criteria names? Or just one "Score" column
                            return selectedCriteria.map(c => (
                                <th key={c.id} className="px-4 py-3 text-center font-medium">
                                    {c.name}
                                </th>
                            ));
                        }
                      })()}
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardRankingRows.map((item) => (
                      <tr key={item.row.participant.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{item.row.participant.full_name}</div>
                            <div className="text-xs text-slate-500">#{item.row.participant.contestant_number} • {item.row.teamName ?? item.row.categoryName}</div>
                        </td>
                        {(() => {
                            // Re-calculate involved columns
                            let criteriaIds: number[] = [];
                            const rawIds = selectedAwardResult.award.criteria_ids;

                            if (Array.isArray(rawIds)) {
                              criteriaIds = rawIds.map(id => Number(id));
                            } else if (typeof rawIds === 'string') {
                              const s = rawIds as string;
                              if (s.startsWith('{') && s.endsWith('}')) {
                                criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                              } else {
                                criteriaIds = s.split(',').map(n => Number(n.trim()));
                              }
                            } else if (selectedAwardResult.award.criteria_id) {
                              criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
                            }
                            
                            criteriaIds = criteriaIds.filter(n => !isNaN(n));
                            const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                            const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
                            
                            // Calculate scores for this participant and judge
                            const judgeId = selectedJudgeForBreakdown;
                            
                            if (categories.length > 0) {
                                return categories.map(cat => {
                                    // Sum all criteria in this category
                                    const catCriteria = criteriaList.filter(c => c.category === cat);
                                    let catTotal = 0;
                                    let hasVal = false;
                                    
                                    for (const c of catCriteria) {
                                        const key = `${c.id}-${judgeId}-${item.row.participant.id}`;
                                        const val = criteriaScoreByJudgeAndParticipant.get(key);
                                        if (val !== undefined) {
                                            catTotal += val;
                                            hasVal = true;
                                        }
                                    }
                                    
                                    return (
                                        <td key={cat} className="px-4 py-3 text-center text-slate-600">
                                            {hasVal ? catTotal.toFixed(2) : "—"}
                                        </td>
                                    );
                                });
                            } else {
                                return selectedCriteria.map(c => {
                                    const key = `${c.id}-${judgeId}-${item.row.participant.id}`;
                                    const val = criteriaScoreByJudgeAndParticipant.get(key);
                                    return (
                                        <td key={c.id} className="px-4 py-3 text-center text-slate-600">
                                            {val !== undefined ? val.toFixed(2) : "—"}
                                        </td>
                                    );
                                });
                            }
                        })()}
                        {(() => {
                             // Calculate total again for this judge
                             let criteriaIds: number[] = [];
                             const rawIds = selectedAwardResult.award.criteria_ids;
 
                             if (Array.isArray(rawIds)) {
                               criteriaIds = rawIds.map(id => Number(id));
                             } else if (typeof rawIds === 'string') {
                               const s = rawIds as string;
                               if (s.startsWith('{') && s.endsWith('}')) {
                                 criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                               } else {
                                 criteriaIds = s.split(',').map(n => Number(n.trim()));
                               }
                             } else if (selectedAwardResult.award.criteria_id) {
                               criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
                             }
                             
                             criteriaIds = criteriaIds.filter(n => !isNaN(n));
 
                             // Include all criteria from categories
                             if (criteriaIds.length > 0) {
                               const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                               const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
                               
                               if (categories.length > 0) {
                                   const allCriteriaInCategories = criteriaList.filter(c => categories.includes(c.category));
                                   const allIds = allCriteriaInCategories.map(c => c.id);
                                   criteriaIds = Array.from(new Set([...criteriaIds, ...allIds]));
                               }
                             }
                             
                             const judgeId = selectedJudgeForBreakdown;
                             let total = 0;
                             let hasVal = false;
                             for (const cId of criteriaIds) {
                                 const key = `${cId}-${judgeId}-${item.row.participant.id}`;
                                 const value = criteriaScoreByJudgeAndParticipant.get(key);
                                 if (value !== undefined) {
                                     total += value;
                                     hasVal = true;
                                 }
                             }
                             
                            return (
                                <td className="px-4 py-3 text-right font-semibold text-[#1F4D3A]">
                                    {hasVal ? total.toFixed(2) : "—"}
                                </td>
                            );
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-[#E2E8F0] p-6 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedJudgeForBreakdown(null)}
                  className="rounded-full bg-[#F1F5F9] px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
