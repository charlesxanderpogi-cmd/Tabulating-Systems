"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

type JudgeRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  role: "chairman" | "judge";
  created_at: string;
};

type JudgeScoringPermissionRow = {
  judge_id: number;
  contest_id: number;
  criteria_id: number | null;
  can_edit: boolean;
  created_at: string;
};

type JudgeDivisionPermissionRow = {
  id: number;
  judge_id: number;
  contest_id: number;
  division_id: number;
  created_at: string;
};

type JudgeParticipantPermissionRow = {
  id: number;
  judge_id: number;
  contest_id: number;
  participant_id: number;
  created_at: string;
};

type MultiSelectOption = {
  id: number;
  label: string;
};

type MultiSelectDropdownProps = {
  placeholder: string;
  options: MultiSelectOption[];
  selectedIds: number[];
  disabled?: boolean;
  onChange: (ids: number[]) => void;
};

function MultiSelectDropdown({
  placeholder,
  options,
  selectedIds,
  disabled,
  onChange,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabels = options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.label);

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels[0]} + ${selectedLabels.length - 1} more`;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }
          setIsOpen((open) => !open);
        }}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs outline-none transition ${
          disabled
            ? "cursor-not-allowed border-[#E2E8F0] bg-slate-50 text-slate-400"
            : "border-[#D0D7E2] bg-white text-slate-700 focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
        }`}
      >
        <span
          className={
            selectedLabels.length === 0 ? "text-slate-400" : "text-slate-700"
          }
        >
          {displayText}
        </span>
        <span className="ml-2 text-[10px] text-slate-400">▾</span>
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[#E2E8F0] bg-white py-1 text-xs shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-slate-400">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const checked = selectedIds.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-[#F8FAFC]"
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-[#D0D7E2] text-[#1F4D3A] focus:ring-[#1F4D3A]"
                    checked={checked}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      onChange(
                        isChecked
                          ? [...selectedIds, option.id]
                          : selectedIds.filter((id) => id !== option.id),
                      );
                    }}
                  />
                  <span className="text-[11px] text-slate-700">
                    {option.label}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

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

  const [activeTab, setActiveTab] = useState<"tabulation" | "access">("tabulation");
  const [judges, setJudges] = useState<JudgeRow[]>([]);
  const [judgeScoringPermissions, setJudgeScoringPermissions] = useState<
    JudgeScoringPermissionRow[]
  >([]);
  const [judgeDivisionPermissions, setJudgeDivisionPermissions] = useState<
    JudgeDivisionPermissionRow[]
  >([]);
  const [judgeParticipantPermissions, setJudgeParticipantPermissions] =
    useState<JudgeParticipantPermissionRow[]>([]);
  const [selectedJudgeIdsForPermissions, setSelectedJudgeIdsForPermissions] =
    useState<number[]>([]);
  const [selectedContestIdForPermissions, setSelectedContestIdForPermissions] =
    useState<number | null>(null);
  const [judgePermissionsMode, setJudgePermissionsMode] = useState<
    "all" | "none" | "custom"
  >("all");
  const [judgePermissionsCriteriaIds, setJudgePermissionsCriteriaIds] =
    useState<number[]>([]);
  const [judgePermissionsError, setJudgePermissionsError] = useState<
    string | null
  >(null);
  const [judgePermissionsSuccess, setJudgePermissionsSuccess] = useState<
    string | null
  >(null);
  const [isSavingJudgePermissions, setIsSavingJudgePermissions] =
    useState(false);
  const [judgeDivisionMode, setJudgeDivisionMode] =
    useState<"all" | "custom">("all");
  const [judgeDivisionIds, setJudgeDivisionIds] = useState<number[]>([]);
  const [judgeParticipantMode, setJudgeParticipantMode] =
    useState<"all" | "custom">("all");
  const [judgeParticipantIds, setJudgeParticipantIds] = useState<number[]>([]);

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
        { data: judgeRows, error: judgeError },
        { data: scoringPermissionRows, error: scoringPermissionError },
        { data: divisionPermissionRows, error: divisionPermissionError },
        { data: participantPermissionRows, error: participantPermissionError },
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
        supabase
          .from("user_judge")
          .select("id, event_id, full_name, username, role, created_at")
          .eq("event_id", activeEvent.id),
        supabase
          .from("judge_scoring_permission")
          .select("judge_id, contest_id, criteria_id, can_edit, created_at"),
        supabase
          .from("judge_division_permission")
          .select("id, judge_id, contest_id, division_id, created_at"),
        supabase
          .from("judge_participant_permission")
          .select("id, judge_id, contest_id, participant_id, created_at"),
      ]);

      if (
        categoryError ||
        teamError ||
        participantError ||
        totalError ||
        criteriaError ||
        awardError ||
        scoreError ||
        judgeError ||
        scoringPermissionError ||
        divisionPermissionError ||
        participantPermissionError
      ) {
        const message =
          categoryError?.message ||
          teamError?.message ||
          participantError?.message ||
          totalError?.message ||
          criteriaError?.message ||
          awardError?.message ||
          scoreError?.message ||
          judgeError?.message ||
          scoringPermissionError?.message ||
          divisionPermissionError?.message ||
          participantPermissionError?.message ||
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
      setJudges((judgeRows ?? []) as JudgeRow[]);
      setJudgeScoringPermissions((scoringPermissionRows ?? []) as JudgeScoringPermissionRow[]);
      setJudgeDivisionPermissions((divisionPermissionRows ?? []) as JudgeDivisionPermissionRow[]);
      setJudgeParticipantPermissions((participantPermissionRows ?? []) as JudgeParticipantPermissionRow[]);

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

  const judgesForActiveEvent = useMemo(
    () => (event ? judges.filter((j) => j.event_id === event.id) : []),
    [judges, event],
  );

  const contestsForActiveEvent = useMemo(
    () => (event ? contests.filter((c) => c.event_id === event.id) : []),
    [contests, event],
  );

  const judgeDivisionIdsForContest = useMemo(() => {
    if (selectedContestIdForPermissions === null) return [];
    return judgeDivisionPermissions
      .filter(
        (p) =>
          p.contest_id === selectedContestIdForPermissions &&
          (selectedJudgeIdsForPermissions.length === 0 ||
            selectedJudgeIdsForPermissions.includes(p.judge_id)),
      )
      .map((p) => p.division_id);
  }, [
    judgeDivisionPermissions,
    selectedContestIdForPermissions,
    selectedJudgeIdsForPermissions,
  ]);

  const judgeParticipantIdsForContest = useMemo(() => {
    if (selectedContestIdForPermissions === null) return [];
    return judgeParticipantPermissions
      .filter(
        (p) =>
          p.contest_id === selectedContestIdForPermissions &&
          (selectedJudgeIdsForPermissions.length === 0 ||
            selectedJudgeIdsForPermissions.includes(p.judge_id)),
      )
      .map((p) => p.participant_id);
  }, [
    judgeParticipantPermissions,
    selectedContestIdForPermissions,
    selectedJudgeIdsForPermissions,
  ]);

  useEffect(() => {
    if (selectedContestIdForPermissions === null) {
      setJudgeDivisionIds([]);
      setJudgeDivisionMode("all");
      setJudgeParticipantIds([]);
      setJudgeParticipantMode("all");
      setJudgePermissionsCriteriaIds([]);
      setJudgePermissionsMode("all");
      return;
    }

    const relevantJudges =
      selectedJudgeIdsForPermissions.length === 0
        ? judgesForActiveEvent.map((j) => j.id)
        : selectedJudgeIdsForPermissions;

    if (relevantJudges.length === 1) {
      const judgeId = relevantJudges[0];
      
      const divIds = judgeDivisionPermissions
        .filter(p => p.judge_id === judgeId && p.contest_id === selectedContestIdForPermissions)
        .map(p => p.division_id);
      setJudgeDivisionIds(divIds);
      setJudgeDivisionMode(divIds.length > 0 ? "custom" : "all");

      const partIds = judgeParticipantPermissions
        .filter(p => p.judge_id === judgeId && p.contest_id === selectedContestIdForPermissions)
        .map(p => p.participant_id);
      setJudgeParticipantIds(partIds);
      setJudgeParticipantMode(partIds.length > 0 ? "custom" : "all");

      const scoringPerms = judgeScoringPermissions.filter(
        p => p.judge_id === judgeId && p.contest_id === selectedContestIdForPermissions
      );
      
      const hasFullAccess = scoringPerms.some(p => p.criteria_id === null && p.can_edit === true);
      if (hasFullAccess) {
        setJudgePermissionsMode("all");
        setJudgePermissionsCriteriaIds([]);
      } else {
        const critIds = scoringPerms.filter(p => p.criteria_id !== null && p.can_edit === true).map(p => p.criteria_id as number);
        setJudgePermissionsMode("custom");
        setJudgePermissionsCriteriaIds(critIds);
      }
    } else {
      setJudgeDivisionIds([]);
      setJudgeDivisionMode("all");
      setJudgeParticipantIds([]);
      setJudgeParticipantMode("all");
      setJudgePermissionsCriteriaIds([]);
      setJudgePermissionsMode("all");
    }
  }, [
    selectedContestIdForPermissions,
    selectedJudgeIdsForPermissions,
    judgeDivisionPermissions,
    judgeParticipantPermissions,
    judgeScoringPermissions,
    judgesForActiveEvent,
  ]);

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
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1 rounded-full bg-[#1F4D3A0A] p-1 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("tabulation")}
                className={`rounded-full px-4 py-1.5 transition ${
                  activeTab === "tabulation"
                    ? "bg-[#1F4D3A] text-white shadow-sm"
                    : "text-[#1F4D3A] hover:bg-[#1F4D3A14]"
                }`}
              >
                Tabulation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("access")}
                className={`rounded-full px-4 py-1.5 transition ${
                  activeTab === "access"
                    ? "bg-[#1F4D3A] text-white shadow-sm"
                    : "text-[#1F4D3A] hover:bg-[#1F4D3A14]"
                }`}
              >
                Access
              </button>
            </nav>
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
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4">
          {activeTab === "tabulation" && (
            <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45_rgba(0,0,0,0.05)]">
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
        )}

          {activeTab === "access" && (
            <section className="relative space-y-4 rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45_rgba(0,0,0,0.05)]">
              <div className="mb-2">
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Judge scoring access
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage which criteria, divisions, and participants each judge can score.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)]">
                <div className="space-y-3 rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-medium text-slate-600">
                      Select judge
                    </div>
                    <MultiSelectDropdown
                      placeholder="Select judge(s)"
                      disabled={judgesForActiveEvent.length === 0}
                      options={judgesForActiveEvent.map((judge) => ({
                        id: judge.id,
                        label: judge.full_name,
                      }))}
                      selectedIds={selectedJudgeIdsForPermissions}
                      onChange={(ids) => {
                        setSelectedJudgeIdsForPermissions(ids);
                        setJudgePermissionsError(null);
                        setJudgePermissionsSuccess(null);
                      }}
                    />
                    <div className="text-[10px] text-slate-500">
                      Leave empty to select all judges.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-medium text-slate-600">
                      Select contest
                    </div>
                    <select
                      value={selectedContestIdForPermissions ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        const parsed = value ? Number(value) : null;
                        setSelectedContestIdForPermissions(parsed);
                        setJudgePermissionsError(null);
                        setJudgePermissionsSuccess(null);
                      }}
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    >
                      <option value="">Select contest</option>
                      {contestsForActiveEvent.map((contest) => (
                        <option key={contest.id} value={contest.id}>
                          {contest.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-medium text-slate-600">
                      Divisions that judge can edit
                    </div>
                    <MultiSelectDropdown
                      placeholder="Select division(s)"
                      disabled={selectedContestIdForPermissions === null}
                      options={
                        selectedContestIdForPermissions === null
                          ? []
                          : categories
                              .filter((category) =>
                                participants.some(
                                  (participant) =>
                                    participant.contest_id ===
                                      selectedContestIdForPermissions &&
                                    participant.division_id === category.id,
                                ),
                              )
                              .map((category) => ({
                                id: category.id,
                                label: category.name,
                              }))
                      }
                      selectedIds={judgeDivisionIds}
                      onChange={(ids) => {
                        setJudgeDivisionIds(ids);
                        setJudgeDivisionMode(
                          ids.length === 0 ? "all" : "custom",
                        );
                      }}
                    />
                    <div className="text-[10px] text-slate-500">
                      Leave empty to allow judge to edit all divisions.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-medium text-slate-600">
                      Participants that judge can edit
                    </div>
                    <MultiSelectDropdown
                      placeholder="Select participant(s)"
                      disabled={selectedContestIdForPermissions === null}
                      options={
                        selectedContestIdForPermissions === null
                          ? []
                          : participants
                              .filter(
                                (participant) =>
                                  participant.contest_id ===
                                  selectedContestIdForPermissions,
                              )
                              .map((participant) => ({
                                id: participant.id,
                                label: participant.full_name,
                              }))
                      }
                      selectedIds={judgeParticipantIds}
                      onChange={(ids) => {
                        setJudgeParticipantIds(ids);
                        setJudgeParticipantMode(
                          ids.length === 0 ? "all" : "custom",
                        );
                      }}
                    />
                    <div className="text-[10px] text-slate-500">
                      Leave empty to allow judge to edit all participants.
                    </div>
                  </div>

                  {(judgePermissionsError || judgePermissionsSuccess) && (
                    <div
                      className={`text-[10px] ${
                        judgePermissionsError ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {judgePermissionsError ?? judgePermissionsSuccess}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                  <div className="mb-1 text-[11px] font-medium text-slate-600">
                    Criteria permissions
                  </div>
                  <div className="mb-3 text-[10px] text-slate-500">
                    {selectedContestIdForPermissions === null
                      ? "Select a contest to manage criteria access."
                      : "Toggle which criteria the judge is allowed to score."}
                  </div>
                  <div>
                    {selectedContestIdForPermissions === null ? (
                      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] text-[10px] text-slate-400">
                        No contest selected
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {criteriaList
                          .filter(
                            (criteria) =>
                              criteria.contest_id ===
                              selectedContestIdForPermissions,
                          )
                          .map((criteria) => {
                            const isAllowed =
                              judgePermissionsMode === "all"
                                ? true
                                : judgePermissionsCriteriaIds.includes(
                                    criteria.id,
                                  );
                            const isInteractive = true;

                            return (
                              <div
                                key={criteria.id}
                                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                                  isAllowed
                                    ? "border border-emerald-200 bg-emerald-50/60"
                                    : "border border-slate-200 bg-slate-50/60"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isAllowed ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  />
                                  <span
                                    className={`text-[11px] font-medium ${
                                      isAllowed ? "text-slate-800" : "text-slate-400"
                                    }`}
                                  >
                                    {criteria.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (judgePermissionsMode === "all") {
                                      const allCriteriaIds = criteriaList
                                        .filter(
                                          (c) =>
                                            c.contest_id ===
                                            selectedContestIdForPermissions,
                                        )
                                        .map((c) => c.id);
                                      setJudgePermissionsMode("custom");
                                      setJudgePermissionsCriteriaIds(
                                        allCriteriaIds.filter(
                                          (id) => id !== criteria.id,
                                        ),
                                      );
                                    } else {
                                      setJudgePermissionsCriteriaIds(
                                        (previous) =>
                                          previous.includes(criteria.id)
                                            ? previous.filter(
                                                (id) => id !== criteria.id,
                                              )
                                            : [...previous, criteria.id],
                                      );
                                    }
                                  }}
                                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                                    !isInteractive
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  } ${
                                    isAllowed ? "bg-emerald-500" : "bg-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                                      isAllowed
                                        ? "translate-x-[18px]"
                                        : "translate-x-[2px]"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingJudgePermissions || selectedContestIdForPermissions === null}
                      onClick={async () => {
                        if (selectedContestIdForPermissions === null) {
                          setJudgePermissionsError("Select a contest first.");
                          setJudgePermissionsSuccess(null);
                          return;
                        }
                        setIsSavingJudgePermissions(true);
                        setJudgePermissionsError(null);
                        setJudgePermissionsSuccess(null);
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                        if (!supabaseUrl || !supabaseAnonKey) {
                          setJudgePermissionsError("Supabase configuration is missing.");
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        const supabase = createClient(supabaseUrl, supabaseAnonKey);
                        const judgeIds =
                          selectedJudgeIdsForPermissions.length === 0
                            ? judgesForActiveEvent.map((judge) => judge.id)
                            : selectedJudgeIdsForPermissions;
                        if (judgeIds.length === 0) {
                          setJudgePermissionsError("There are no judges for this event.");
                          setIsSavingJudgePermissions(false);
                          return;
                        }

                        // 1. Update Scoring Permissions
                        const { error: deleteScoringError } = await supabase
                          .from("judge_scoring_permission")
                          .delete()
                          .in("judge_id", judgeIds)
                          .eq("contest_id", selectedContestIdForPermissions);
                        if (deleteScoringError) {
                          setJudgePermissionsError(deleteScoringError.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }

                        const allCriteriaIdsForSave = criteriaList
                          .filter((c) => c.contest_id === selectedContestIdForPermissions)
                          .map((c) => c.id);
                        
                        const scoringInserts: any[] = [];
                        if (judgePermissionsMode === "all") {
                          judgeIds.forEach(jId => scoringInserts.push({
                            judge_id: jId, contest_id: selectedContestIdForPermissions, criteria_id: null, can_edit: true
                          }));
                        } else {
                          judgeIds.forEach(jId => {
                            scoringInserts.push({
                              judge_id: jId, contest_id: selectedContestIdForPermissions, criteria_id: null, can_edit: false
                            });
                            judgePermissionsCriteriaIds.forEach(cId => scoringInserts.push({
                              judge_id: jId, contest_id: selectedContestIdForPermissions, criteria_id: cId, can_edit: true
                            }));
                          });
                        }

                        if (scoringInserts.length > 0) {
                          const { data: sData, error: sErr } = await supabase
                            .from("judge_scoring_permission")
                            .insert(scoringInserts)
                            .select();
                          if (sErr) {
                            setJudgePermissionsError(sErr.message);
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          if (sData) {
                            setJudgeScoringPermissions(prev => [
                              ...prev.filter(p => !(judgeIds.includes(p.judge_id) && p.contest_id === selectedContestIdForPermissions)),
                              ...sData
                            ]);
                          }
                        }

                        // 2. Update Division Permissions
                        const { error: deleteDivError } = await supabase
                          .from("judge_division_permission")
                          .delete()
                          .in("judge_id", judgeIds)
                          .eq("contest_id", selectedContestIdForPermissions);
                        if (deleteDivError) {
                          setJudgePermissionsError(deleteDivError.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        if (judgeDivisionMode === "custom" && judgeDivisionIds.length > 0) {
                          const divInserts = judgeIds.flatMap(jId => judgeDivisionIds.map(dId => ({
                            judge_id: jId, contest_id: selectedContestIdForPermissions, division_id: dId
                          })));
                          const { data: dData, error: dErr } = await supabase
                            .from("judge_division_permission")
                            .insert(divInserts)
                            .select();
                          if (dErr) {
                            setJudgePermissionsError(dErr.message);
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          if (dData) {
                            setJudgeDivisionPermissions(prev => [
                              ...prev.filter(p => !(judgeIds.includes(p.judge_id) && p.contest_id === selectedContestIdForPermissions)),
                              ...dData
                            ]);
                          }
                        }

                        // 3. Update Participant Permissions
                        const { error: deletePartError } = await supabase
                          .from("judge_participant_permission")
                          .delete()
                          .in("judge_id", judgeIds)
                          .eq("contest_id", selectedContestIdForPermissions);
                        if (deletePartError) {
                          setJudgePermissionsError(deletePartError.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        if (judgeParticipantMode === "custom" && judgeParticipantIds.length > 0) {
                          const partInserts = judgeIds.flatMap(jId => judgeParticipantIds.map(pId => ({
                            judge_id: jId, contest_id: selectedContestIdForPermissions, participant_id: pId
                          })));
                          const { data: pData, error: pErr } = await supabase
                            .from("judge_participant_permission")
                            .insert(partInserts)
                            .select();
                          if (pErr) {
                            setJudgePermissionsError(pErr.message);
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          if (pData) {
                            setJudgeParticipantPermissions(prev => [
                              ...prev.filter(p => !(judgeIds.includes(p.judge_id) && p.contest_id === selectedContestIdForPermissions)),
                              ...pData
                            ]);
                          }
                        }

                        setJudgePermissionsSuccess("Access permissions updated successfully.");
                        setIsSavingJudgePermissions(false);
                      }}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-6 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#163528] disabled:opacity-50"
                    >
                      {isSavingJudgePermissions ? "Saving..." : "Save access"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
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
