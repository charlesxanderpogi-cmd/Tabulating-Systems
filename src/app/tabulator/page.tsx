"use client";

import { useEffect, useMemo, useState, useRef, Fragment } from "react";
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

type ContestScoringType = "percentage" | "ranking" | "points";

type ContestRow = {
  id: number;
  event_id: number;
  name: string;
  contest_code: string | null;
  created_at: string;
  scoring_type: ContestScoringType | null;
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

type SubCriteriaCell = {
  judgeId: number;
  value: number | null;
};

type SubCriteriaRow = {
  participant: ParticipantRow;
  criteria: CriteriaRow;
  cells: SubCriteriaCell[];
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

type SignatureRow = {
  id: number;
  tabulator_id: number;
  event_id: number;
  title: string;
  name: string;
  created_at: string;
  updated_at: string;
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
  const [, setEvents] = useState<EventRow[]>([]);
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
  const [activeView, setActiveView] = useState<"awards" | "sub-criteria">("awards");
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
  const [hasUnsavedPermissionChanges, setHasUnsavedPermissionChanges] =
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

      let storedUsername: string | null = null;
      try {
        const response = await fetch("/api/auth/session");
        const payload = await response.json().catch(() => ({}));
        const role = payload?.session?.role;
        const username =
          typeof payload?.session?.username === "string"
            ? payload.session.username
            : null;
        if (role !== "tabulator" || !username) {
          setError("No tabulator session found. Please sign in again.");
          setIsLoading(false);
          router.push("/");
          return;
        }
        storedUsername = username;
      } catch {
        setError("No tabulator session found. Please sign in again.");
        setIsLoading(false);
        router.push("/");
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

      // load every event so the filter dropdown works like admin's
      const {
        data: eventRows,
        error: eventError,
      } = await supabase
        .from("event")
        .select("id, name, code, year, is_active, created_at");

      if (eventError) {
        setError(
          eventError.message ||
            "Unable to load events. Please contact the administrator.",
        );
        setIsLoading(false);
        return;
      }

      if (!eventRows || eventRows.length === 0) {
        setError(
          "No events found. Please contact the administrator.",
        );
        setIsLoading(false);
        return;
      }

      // restrict list to the tabulator's assigned event only
      const activeEvent = eventRows.find((e) => e.id === tabulatorRow.event_id);
      if (activeEvent) {
        setEvents([activeEvent]);
      }
      if (!activeEvent) {
        setError(
          "Assigned event not found. Please contact the administrator.",
        );
        setIsLoading(false);
        return;
      }
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
        .select("id, event_id, name, contest_code, created_at, scoring_type")
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
        { data: signatureRows, error: signatureError },
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
          .select("id, event_id, full_name, username, role, avatar_url, created_at")
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
        supabase
          .from("tabulator_signature")
          .select("id, tabulator_id, event_id, title, name, created_at, updated_at")
          .eq("event_id", activeEvent.id),
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
        participantPermissionError ||
        signatureError
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
          signatureError?.message ||
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
      setSignatures((signatureRows ?? []) as SignatureRow[]);

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
            table: "contest",
            filter: `event_id=eq.${activeEvent.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as ContestRow;
              setContests((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);
                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }
                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
              return;
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as ContestRow;
              setContests((previous) => previous.filter((row) => row.id !== oldRow.id));
            }
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
            table: "judge_scoring_permission",
          },
          (payload) => {
            // a full refetch would be simpler, but we can update incrementally like admin page
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as JudgeScoringPermissionRow;
              setJudgeScoringPermissions((previous) => {
                const exists = previous.some(
                  (permission) =>
                    permission.judge_id === newRow.judge_id &&
                    permission.contest_id === newRow.contest_id &&
                    permission.criteria_id === newRow.criteria_id,
                );

                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }

                return previous.map((permission) =>
                  permission.judge_id === newRow.judge_id &&
                  permission.contest_id === newRow.contest_id &&
                  permission.criteria_id === newRow.criteria_id
                    ? newRow
                    : permission,
                );
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as JudgeScoringPermissionRow;
              setJudgeScoringPermissions((previous) =>
                previous.filter(
                  (permission) =>
                    !(
                      permission.judge_id === oldRow.judge_id &&
                      permission.contest_id === oldRow.contest_id &&
                      permission.criteria_id === oldRow.criteria_id
                    ),
                ),
              );
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
              const oldRow = payload.old as JudgeScoringPermissionRow;
              setJudgeScoringPermissions((previous) =>
                previous.filter(
                  (permission) =>
                    !(
                      permission.judge_id === oldRow.judge_id &&
                      permission.contest_id === oldRow.contest_id &&
                      permission.criteria_id === oldRow.criteria_id
                    ),
                ),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "judge_division_permission",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as JudgeDivisionPermissionRow;
              setJudgeDivisionPermissions((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);
                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }
                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;
              if (!oldRow) return;
              setJudgeDivisionPermissions((previous) =>
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
            table: "judge_participant_permission",
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as JudgeParticipantPermissionRow;
              setJudgeParticipantPermissions((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);
                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }
                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;
              if (!oldRow) return;
              setJudgeParticipantPermissions((previous) =>
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
            table: "tabulator_signature",
            filter: `event_id=eq.${activeEvent.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const newRow = payload.new as SignatureRow;
              setSignatures((previous) => {
                const exists = previous.some((row) => row.id === newRow.id);
                if (payload.eventType === "INSERT" && !exists) {
                  return [...previous, newRow];
                }
                return previous.map((row) => (row.id === newRow.id ? newRow : row));
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;
              if (!oldRow) return;
              setSignatures((previous) => previous.filter((row) => row.id !== oldRow.id));
            }
          }
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
  }, [router]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;
    if (!event) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Setup separate realtime channels for each permission table
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Listen for scoring permission changes
    const scoringChannel = supabase
      .channel(`tabulator-scoring-perms-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'judge_scoring_permission',
        },
        async (payload) => {
          console.log('Scoring permission change detected (tabulator):', payload.eventType, payload);
          try {
            const { data, error } = await supabase
              .from("judge_scoring_permission")
              .select("judge_id, contest_id, criteria_id, can_edit, created_at");
            if (!error && data) {
              console.log('Updated scoring permissions from realtime (tabulator)');
              setJudgeScoringPermissions(data as JudgeScoringPermissionRow[]);
            }
          } catch (error) {
            console.warn('Failed to refresh scoring permissions (tabulator):', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Scoring channel status (tabulator):', status, err);
      });
    
    channels.push(scoringChannel);

    // Listen for division permission changes
    const divisionChannel = supabase
      .channel(`tabulator-division-perms-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'judge_division_permission',
        },
        async (payload) => {
          console.log('Division permission change detected (tabulator):', payload.eventType, payload);
          try {
            const { data, error } = await supabase
              .from("judge_division_permission")
              .select("id, judge_id, contest_id, division_id, created_at");
            if (!error && data) {
              console.log('Updated division permissions from realtime (tabulator)');
              setJudgeDivisionPermissions(data as JudgeDivisionPermissionRow[]);
            }
          } catch (error) {
            console.warn('Failed to refresh division permissions (tabulator):', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Division channel status (tabulator):', status, err);
      });
    
    channels.push(divisionChannel);

    // Listen for participant permission changes
    const participantChannel = supabase
      .channel(`tabulator-participant-perms-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'judge_participant_permission',
        },
        async (payload) => {
          console.log('Participant permission change detected (tabulator):', payload.eventType, payload);
          try {
            const { data, error } = await supabase
              .from("judge_participant_permission")
              .select("id, judge_id, contest_id, participant_id, created_at");
            if (!error && data) {
              console.log('Updated participant permissions from realtime (tabulator)');
              setJudgeParticipantPermissions(data as JudgeParticipantPermissionRow[]);
            }
          } catch (error) {
            console.warn('Failed to refresh participant permissions (tabulator):', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Participant channel status (tabulator):', status, err);
      });
    
    channels.push(participantChannel);

    // Listen for admin broadcasts about permission changes (criteria permissions)
    const adminPermissionsChannel = supabase
      .channel(`permissions-update-${event.id}`)
      .on(
        'broadcast',
        { event: 'permissions-updated' },
        async (payload) => {
          console.log('Admin permission update broadcast received (tabulator):', payload);
          try {
            // Refresh all permission data from database
            const [scoringRes, divisionRes, participantRes] = await Promise.all([
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
            
            if (scoringRes.data) {
              setJudgeScoringPermissions(scoringRes.data as JudgeScoringPermissionRow[]);
            }
            if (divisionRes.data) {
              setJudgeDivisionPermissions(divisionRes.data as JudgeDivisionPermissionRow[]);
            }
            if (participantRes.data) {
              setJudgeParticipantPermissions(participantRes.data as JudgeParticipantPermissionRow[]);
            }
            
            // Clear unsaved changes flag since we just synced with server
            setHasUnsavedPermissionChanges(false);
            
            console.log('Permission data refreshed from admin broadcast (tabulator)');
          } catch (error) {
            console.warn('Failed to refresh permissions from admin broadcast (tabulator):', error);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Admin permissions channel status (tabulator):', status, err);
      });
    
    channels.push(adminPermissionsChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [event]);

  // Fallback polling for permission changes to ensure sync across admins/tabulators
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !event?.id) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let cancelled = false;

    // Poll for permission changes every 7 seconds
    const pollInterval = setInterval(async () => {
      if (cancelled) return;
      try {
        const [scoringRes, divisionRes, participantRes] = await Promise.all([
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

        if (scoringRes.data && JSON.stringify(scoringRes.data) !== JSON.stringify(judgeScoringPermissions)) {
          console.log('[TABULATOR-POLL] Scoring permissions changed');
          setJudgeScoringPermissions(scoringRes.data as JudgeScoringPermissionRow[]);
        }
        if (divisionRes.data && JSON.stringify(divisionRes.data) !== JSON.stringify(judgeDivisionPermissions)) {
          console.log('[TABULATOR-POLL] Division permissions changed');
          setJudgeDivisionPermissions(divisionRes.data as JudgeDivisionPermissionRow[]);
        }
        if (participantRes.data && JSON.stringify(participantRes.data) !== JSON.stringify(judgeParticipantPermissions)) {
          console.log('[TABULATOR-POLL] Participant permissions changed');
          setJudgeParticipantPermissions(participantRes.data as JudgeParticipantPermissionRow[]);
        }
      } catch (error) {
        console.warn('[TABULATOR-POLL] Error polling permissions:', error);
      }
    }, 7000);

    // Also can refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[TABULATOR-VISIBILITY] Page visible, checking permissions');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [event?.id, judgeScoringPermissions, judgeDivisionPermissions, judgeParticipantPermissions]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;
    if (!event) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const ch = supabase
      .channel(`event-${event.id}-scores`, { config: { broadcast: { ack: true } } })
      .on('broadcast', { event: 'score-submitted' }, async () => {
        try {
          const [totalsRes, scoresRes] = await Promise.all([
            supabase
              .from("judge_participant_total")
              .select("id, judge_id, participant_id, contest_id, total_score, created_at"),
            supabase
              .from("score")
              .select("id, judge_id, participant_id, criteria_id, score, created_at"),
          ]);
          if (totalsRes.data) setTotals(totalsRes.data as TotalRow[]);
          if (scoresRes.data) setScores(scoresRes.data as ScoreRow[]);
        } catch {}
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [event]);

  const activeContest = useMemo(
    () => contests.find((contest) => contest.id === activeContestId) || null,
    [contests, activeContestId],
  );

  const activeContestScoringType: ContestScoringType =
    activeContest?.scoring_type ?? "percentage";

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

    const statsByParticipant = new Map<
      number,
      { sum: number; count: number; judgeScores: Record<number, number> }
    >();

    for (const totalRow of totalsForContest) {
      const current = statsByParticipant.get(totalRow.participant_id) ?? {
        sum: 0,
        count: 0,
        judgeScores: {},
      };
      current.sum += Number(totalRow.total_score);
      current.count += 1;
      current.judgeScores[totalRow.judge_id] = Number(totalRow.total_score);
      statsByParticipant.set(totalRow.participant_id, current);
    }

    const rows: RankingRow[] = [];
    const tieBreakerByParticipant = new Map<number, number>();

    const judgeIdsForContest = Array.from(
      new Set(totalsForContest.map((row) => row.judge_id)),
    ).sort((a, b) => a - b);

    const rankByJudgeAndParticipant = new Map<string, number>();
    if (activeContestScoringType === "ranking") {
      for (const judgeId of judgeIdsForContest) {
        const perJudge: Array<[number, number]> = [];
        for (const participant of activeContestParticipants) {
          const stats = statsByParticipant.get(participant.id);
          const score = stats?.judgeScores[judgeId];
          if (score == null) continue;
          perJudge.push([participant.id, score]);
        }
        perJudge.sort((a, b) => b[1] - a[1]);
        let prevScore: number | null = null;
        let rank = 0;
        let index = 0;
        for (const [participantId, score] of perJudge) {
          index += 1;
          if (prevScore === null || score < prevScore) {
            rank = index;
          }
          rankByJudgeAndParticipant.set(`${judgeId}-${participantId}`, rank);
          prevScore = score;
        }
      }
    }

    for (const participant of activeContestParticipants) {
      const stats = statsByParticipant.get(participant.id);

      if (!stats) {
        continue;
      }

      const category = categories.find(
        (categoryRow) => categoryRow.id === participant.division_id,
      );

      const team =
        participant.team_id === null
          ? null
          : teams.find((teamRow) => teamRow.id === participant.team_id) ?? null;

      let displayValue = 0;
      if (activeContestScoringType === "percentage") {
        displayValue = stats.count > 0 ? stats.sum / stats.count : 0;
      } else if (activeContestScoringType === "points") {
        displayValue = stats.sum;
      } else {
        if (judgeIdsForContest.length === 0) {
          continue;
        }
        let sumRanks = 0;
        let hasAll = true;
        for (const judgeId of judgeIdsForContest) {
          const r = rankByJudgeAndParticipant.get(`${judgeId}-${participant.id}`);
          if (r == null) {
            hasAll = false;
            break;
          }
          sumRanks += r;
        }
        if (!hasAll) {
          continue;
        }
        displayValue = sumRanks / judgeIdsForContest.length;
        tieBreakerByParticipant.set(participant.id, stats.sum);
      }

      rows.push({
        participant,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        totalScore: Number(displayValue.toFixed(2)),
        rank: 0,
      });
    }

    if (activeContestScoringType === "ranking") {
      rows.sort((a, b) => {
        if (a.totalScore !== b.totalScore) {
          return a.totalScore - b.totalScore;
        }
        const aTie = tieBreakerByParticipant.get(a.participant.id) ?? -Infinity;
        const bTie = tieBreakerByParticipant.get(b.participant.id) ?? -Infinity;
        return bTie - aTie;
      });
    } else {
      rows.sort((a, b) => b.totalScore - a.totalScore);
    }

    let previousScore: number | null = null;
    let currentRank = 0;
    let index = 0;

    for (const row of rows) {
      index += 1;
      if (activeContestScoringType === "ranking") {
        if (previousScore === null || row.totalScore > previousScore) {
          currentRank = index;
        }
      } else {
        if (previousScore === null || row.totalScore < previousScore) {
          currentRank = index;
        }
      }
      row.rank = currentRank;
      previousScore = row.totalScore;
    }

    return rows;
  }, [
    activeContest,
    activeContestParticipants,
    totals,
    categories,
    teams,
    activeContestScoringType,
  ]);

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

  const judgeUsernameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const j of judges) {
      map.set(j.id, j.username);
    }
    return map;
  }, [judges]);

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

  const selectedAwardCriteriaIds = useMemo(() => {
    if (!selectedAwardResult) return [];
    let criteriaIds: number[] = [];
    const rawIds = selectedAwardResult.award.criteria_ids;
    if (Array.isArray(rawIds)) {
      criteriaIds = rawIds.map((id) => Number(id));
    } else if (typeof rawIds === "string") {
      const s = rawIds as string;
      if (s.startsWith("{") && s.endsWith("}")) {
        criteriaIds = s
          .substring(1, s.length - 1)
          .split(",")
          .map((n) => Number(n.trim()));
      } else {
        criteriaIds = s.split(",").map((n) => Number(n.trim()));
      }
    } else if (selectedAwardResult.award.criteria_id) {
      criteriaIds = [Number(selectedAwardResult.award.criteria_id)];
    }
    criteriaIds = criteriaIds.filter((n) => !isNaN(n));
    return criteriaIds;
  }, [selectedAwardResult]);

  const awardTotalsByJudge = useMemo(() => {
    const outer = new Map<number, Map<number, number>>();
    if (!selectedAwardResult) return outer;
    for (const judgeId of judgeIdsForActiveContest) {
      const pmap = new Map<number, number>();
      for (const item of selectedAwardResult.winners) {
        let total = 0;
        let hasVal = false;
        for (const cId of selectedAwardCriteriaIds) {
          const key = `${cId}-${judgeId}-${item.participant.id}`;
          const val = criteriaScoreByJudgeAndParticipant.get(key);
          if (val !== undefined) {
            total += val;
            hasVal = true;
          }
        }
        if (hasVal) {
          pmap.set(item.participant.id, total);
        }
      }
      outer.set(judgeId, pmap);
    }
    return outer;
  }, [selectedAwardResult, judgeIdsForActiveContest, selectedAwardCriteriaIds, criteriaScoreByJudgeAndParticipant]);

  const awardRankByJudgeAndParticipant = useMemo(() => {
    const rankMap = new Map<string, number>();
    if (activeContestScoringType !== "ranking") {
      return rankMap;
    }
    for (const [judgeId, pmap] of awardTotalsByJudge.entries()) {
      const entries = Array.from(pmap.entries());
      entries.sort((a, b) => b[1] - a[1]);
      let currentRank = 1;
      for (let i = 0; i < entries.length; i++) {
        if (i > 0) {
          const prev = entries[i - 1][1];
          const curr = entries[i][1];
          if (curr < prev) {
            currentRank = i + 1;
          }
        }
        const participantId = entries[i][0];
        rankMap.set(`${judgeId}-${participantId}`, currentRank);
      }
    }
    return rankMap;
  }, [awardTotalsByJudge, activeContestScoringType]);

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

    // Use only explicitly selected criteria for award computation

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
          criteriaTotal: hasValue
            ? Number(
                (
                  activeContestScoringType === "percentage"
                    ? totalForCriteria / Math.max(judgeIdsForActiveContest.length, 1)
                    : totalForCriteria
                ).toFixed(2),
              )
            : null,
          rank: null,
        };
      },
    );

    if (activeContestScoringType !== "ranking") {
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
        const aTot = a.criteriaTotal ?? -Infinity;
        const bTot = b.criteriaTotal ?? -Infinity;
        return bTot - aTot;
      });

      return rowsWithTotals;
    }

    // Compute average rank across judges for each participant
    const averageByParticipant = new Map<number, number | null>();
    for (const item of rowsWithTotals) {
      let sum = 0;
      let count = 0;
      for (const judgeId of judgeIdsForActiveContest) {
        const r = awardRankByJudgeAndParticipant.get(
          `${judgeId}-${item.row.participant.id}`,
        );
        if (r != null) {
          sum += r;
          count += 1;
        }
      }
      averageByParticipant.set(
        item.row.participant.id,
        count > 0 ? sum / count : null,
      );
    }

    // Assign overall rank based on lowest average rank (Rank 1 = smallest average)
    const sortable = rowsWithTotals
      .map((it) => [it, averageByParticipant.get(it.row.participant.id)] as const)
      .filter((pair) => pair[1] !== null)
      .sort((a, b) => (a[1]! - b[1]!));

    let prevAvg: number | null = null;
    let overallRank = 0;
    let overallIndex = 0;
    for (const [it, avg] of sortable) {
      overallIndex += 1;
      if (prevAvg === null || avg! > prevAvg) {
        overallRank = overallIndex;
      }
      it.rank = overallRank;
      prevAvg = avg!;
    }

    // Sort winners by lowest average rank (winner on top). Fallback to criteriaTotal if averages are equal/missing.
    rowsWithTotals.sort((a, b) => {
      const aAvg = averageByParticipant.get(a.row.participant.id);
      const bAvg = averageByParticipant.get(b.row.participant.id);
      if (aAvg != null && bAvg != null && aAvg !== bAvg) {
        return aAvg - bAvg; // ascending: lowest average first
      }
      const aTot = a.criteriaTotal ?? -Infinity;
      const bTot = b.criteriaTotal ?? -Infinity;
      return bTot - aTot; // tie-breaker: higher total first
    });

    return rowsWithTotals;
  }, [
    selectedAwardResult,
    judgeIdsForActiveContest,
    criteriaScoreByJudgeAndParticipant,
    awardRankByJudgeAndParticipant,
    activeContestScoringType,
  ]);

  const handleAddSignature = async () => {
    if (!tabulator || !event) return;
    
    const title = signatureTitleInput.trim();
    const name = signatureNameInput.trim();
    
    if (!title && !name) return;
    
    setIsSavingSignature(true);
    setSignatureError(null);
    setSignatureSuccess(null);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setSignatureError("Supabase configuration is missing.");
        setIsSavingSignature(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from("tabulator_signature")
        .insert({
          tabulator_id: tabulator.id,
          event_id: event.id,
          title: title || "",
          name: name || "",
        })
        .select();
      
      if (error) throw error;
      
      // Add the inserted signature to local state
      if (data && data.length > 0) {
        const insertedSignature = data[0] as SignatureRow;
        setSignatures((previous) => [...previous, insertedSignature]);
      }
      
      setSignatureTitleInput("");
      setSignatureNameInput("");
      setSignatureSuccess("Signature added successfully.");
      
      setTimeout(() => setSignatureSuccess(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : null;
      setSignatureError(message ?? "Failed to add signature.");
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleDeleteSignature = async (signatureId: number) => {
    if (!event) return;
  
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
      if (!supabaseUrl || !supabaseAnonKey) {
        setSignatureError("Supabase configuration is missing.");
        return;
      }
  
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
      const { error } = await supabase
        .from("tabulator_signature")
        .delete()
        .eq("id", signatureId);
  
      if (error) throw error;
  
      // Immediately update local state to reflect deletion
      setSignatures((previous) => previous.filter((s) => s.id !== signatureId));
  
      setSignatureSuccess("Signature deleted successfully.");
      setTimeout(() => setSignatureSuccess(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : null;
      setSignatureError(message ?? "Failed to delete signature.");
    }
  };

  const handleStartEdit = (signature: SignatureRow) => {
    setEditingSignatureId(signature.id);
    setEditingTitle(signature.title);
    setEditingName(signature.name);
  };

  const handleCancelEdit = () => {
    setEditingSignatureId(null);
    setEditingTitle("");
    setEditingName("");
  };

  const handleSaveEdit = async (signatureId: number) => {
    if (!event) return;
    
    setIsSavingSignature(true);
    setSignatureError(null);
    setSignatureSuccess(null);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setSignatureError("Supabase configuration is missing.");
        setIsSavingSignature(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from("tabulator_signature")
        .update({
          title: editingTitle.trim() || "",
          name: editingName.trim() || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", signatureId)
        .select();
      
      if (error) throw error;
      
      // Update local state with the updated signature from the database
      if (data && data.length > 0) {
        const updatedSignature = data[0] as SignatureRow;
        setSignatures((previous) =>
          previous.map((s) => (s.id === signatureId ? updatedSignature : s))
        );
      }
      
      setEditingSignatureId(null);
      setEditingTitle("");
      setEditingName("");
      setSignatureSuccess("Signature updated successfully.");
      
      setTimeout(() => setSignatureSuccess(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : null;
      setSignatureError(message ?? "Failed to update signature.");
    } finally {
      setIsSavingSignature(false);
    }
  };

  const handleSignOut = () => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("tabulator_username");
      }
      router.push("/");
    })();
  };

  // selected event is always the one the tabulator is assigned to
  const selectedEventId = event?.id ?? null;

  const judgesForActiveEvent = useMemo(
    () => (event ? judges.filter((j) => j.event_id === event.id) : []),
    [judges, event],
  );

  // lists that respect the optional event filter
  // since selectedEventId === event?.id, this is effectively judgesForActiveEvent
  const judgesForSelectedEvent = useMemo(
    () =>
      selectedEventId === null
        ? []
        : judges.filter((j) => j.event_id === selectedEventId),
    [judges, selectedEventId],
  );

  const contestsForSelectedEvent = useMemo(
    () =>
      selectedEventId === null
        ? []
        : contests.filter((c) => c.event_id === selectedEventId),
    [contests, selectedEventId],
  );

  const participantsForSelectedEvent = useMemo(() => {
    if (selectedEventId === null) {
      return participants;
    }
    const contestIds = contestsForSelectedEvent.map((c) => c.id);
    return participants.filter((p) => contestIds.includes(p.contest_id));
  }, [participants, contestsForSelectedEvent, selectedEventId]);


  // Refs to table containers for printing only the rankings table
  const awardsTableRef = useRef<HTMLDivElement | null>(null);
  const subCriteriaTableRef = useRef<HTMLDivElement | null>(null);
  const [signatures, setSignatures] = useState<SignatureRow[]>([]);
  const [signatureTitleInput, setSignatureTitleInput] = useState("");
  const [signatureNameInput, setSignatureNameInput] = useState("");
  const [editingSignatureId, setEditingSignatureId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingName, setEditingName] = useState("");
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);

  function escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const contentEl =
      activeView === "awards" ? awardsTableRef.current : subCriteriaTableRef.current;

    if (!contentEl) {
      window.print();
      return;
    }
    const divisionName =
      activeDivisionFilterId === "all"
        ? null
        : categoriesForActiveEvent.find((c) => c.id === activeDivisionFilterId)?.name ?? null;
    const eventTitle = event ? `${event.name} • ${event.year}` : "Tabulation workspace";
    const selectedAwardName =
      activeView === "awards"
        ? activeAwardFilterId === "all"
          ? "All awards"
          : (selectedAwardResult?.award.name ?? null)
        : null;
    const subtitleText =
      activeView === "awards"
        ? `${selectedAwardName ? `${selectedAwardName}` : ""}${divisionName ? ` (${divisionName})` : ""}`
        : `${activeContest ? activeContest.name : ""}${divisionName ? ` (${divisionName})` : ""}`;

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(eventTitle)}</title>
        <style>
          html,body{margin:0;padding:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827}
          .print-container{padding:20px;}
          .header-space{height:100px}
          .footer-space{height:60px}
          .event{font-size:20px;font-weight:700;color:#1F4D3A;margin-bottom:6px;text-align:center}
          .subtitle{font-size:12px;color:#374151;margin-bottom:18px;text-align:center}
          table{width:100%;border-collapse:collapse;font-size:12px}
          thead{background:#F5F7FF;color:#1F4D3A;text-transform:uppercase;font-weight:700}
          th,td{padding:12px 10px;border-bottom:1px solid #E6EEF3;text-align:left}
          td.text-right, th.text-right{text-align:right}
          .table-root{margin-top:8px;margin-bottom:48px}
          .table-root button{display:none}
          .divider{width:85%;margin:0 auto 36px;border-top:1px solid #E6EEF3}
          .signatures{margin-top:30px}
          .sig-grid{display:flex;flex-wrap:wrap;gap:36px;max-width:780px;margin:0 auto;justify-content:center}
          .sig{width:220px;display:flex;flex-direction:column;align-items:center;gap:6px}
          .sig .line{width:200px;height:0;border-top:1px solid #374151}
          .sig .name{font-weight:600;color:#111827;font-size:12px;text-align:center}
          .sig .title{color:#6B7280;font-size:11px;text-align:center}
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header-space"></div>
          <div class="event">${escapeHtml(eventTitle)}</div>
          <div class="subtitle">${escapeHtml(subtitleText)}</div>
          <div class="table-root">${contentEl.innerHTML}</div>
          <div class="divider"></div>
          <div class="signatures">
            <div class="sig-grid">
              ${signatures
                .map(
                  (s) => `
                <div class="sig">
                  <div class="line"></div>
                  <div class="name">${escapeHtml(s.name || "")}</div>
                  <div class="title">${escapeHtml(s.title || "")}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          <div class="footer-space"></div>
        </div>
        <script>
          window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 100); };
        </script>
      </body>
      </html>`;

    const win = window.open("", "_blank", "width=1200,height=800");
    if (!win) {
      // fallback
      window.print();
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const judgesForActiveContest = useMemo(() => {
    if (!activeContest) return [];
    const byId = new Map<number, JudgeRow>();
    for (const j of judges) {
      byId.set(j.id, j);
    }
    return judgeIdsForActiveContest
      .map((id) => byId.get(id))
      .filter((j): j is JudgeRow => Boolean(j));
  }, [activeContest, judgeIdsForActiveContest, judges]);

  const subCriteriaRows = useMemo<SubCriteriaRow[]>(() => {
    if (!activeContest) return [];

    const participantsForContest = participants.filter(
      (p) => p.contest_id === activeContest.id,
    );

    const filteredParticipants =
      activeDivisionFilterId === "all"
        ? participantsForContest
        : participantsForContest.filter((p) => p.division_id === activeDivisionFilterId);

    const criteriaForContest = criteriaList.filter(
      (c) => c.contest_id === activeContest.id,
    );

    if (filteredParticipants.length === 0 || criteriaForContest.length === 0) {
      return [];
    }

    const judgeIds = judgesForActiveContest.map((j) => j.id);

    const scoreByKey = new Map<string, number>();
    for (const s of scores) {
      scoreByKey.set(`${s.participant_id}-${s.criteria_id}-${s.judge_id}`, Number(s.score));
    }

    const rows: SubCriteriaRow[] = [];
    for (const participant of filteredParticipants) {
      for (const criteria of criteriaForContest) {
        const cells: SubCriteriaCell[] = judgeIds.map((judgeId) => {
          const key = `${participant.id}-${criteria.id}-${judgeId}`;
          const val = scoreByKey.has(key) ? scoreByKey.get(key)! : null;
          return { judgeId, value: Number.isFinite(val as number) ? (val as number) : null };
        });
        rows.push({ participant, criteria, cells });
      }
    }

    rows.sort((a, b) => {
      const aNum = Number.parseFloat(
        String(a.participant.contestant_number).replace(/[^0-9.\-]/g, ""),
      );
      const bNum = Number.parseFloat(
        String(b.participant.contestant_number).replace(/[^0-9.\-]/g, ""),
      );
      const aN = Number.isFinite(aNum) ? aNum : Number.POSITIVE_INFINITY;
      const bN = Number.isFinite(bNum) ? bNum : Number.POSITIVE_INFINITY;
      if (aN !== bN) return aN - bN;
      const pn = a.participant.contestant_number.localeCompare(b.participant.contestant_number);
      if (pn !== 0) return pn;
      return a.criteria.name.localeCompare(b.criteria.name);
    });

    return rows;
  }, [
    activeContest,
    participants,
    activeDivisionFilterId,
    criteriaList,
    judgesForActiveContest,
    scores,
  ]);

  useEffect(() => {
    // always clear selections when contest is cleared
    if (selectedContestIdForPermissions === null) {
      setJudgeDivisionIds([]);
      setJudgeDivisionMode("all");
      setJudgeParticipantIds([]);
      setJudgeParticipantMode("all");
      setJudgePermissionsCriteriaIds([]);
      setJudgePermissionsMode("all");
      setHasUnsavedPermissionChanges(false);
      return;
    }

    // Don't overwrite local state if there are unsaved changes
    if (hasUnsavedPermissionChanges) {
      return;
    }

    const relevantJudges =
      selectedJudgeIdsForPermissions.length === 0
        ? judgesForSelectedEvent.map((j) => j.id)
        : selectedJudgeIdsForPermissions;

    // helper to compute division/participant settings based on one or many judges
    const computePermissionList = <
      T extends { judge_id: number; contest_id: number },
      K extends keyof T,
    >(
      list: T[],
      key: K,
    ) => {
      const perms =
        relevantJudges.length === 1
          ? list.filter(
              (p) => p.judge_id === relevantJudges[0] && p.contest_id === selectedContestIdForPermissions,
            )
          : list.filter((p) => p.contest_id === selectedContestIdForPermissions);
      if (perms.length === 0) {
        return { mode: "all" as const, ids: [] as number[] };
      }
      const ids = Array.from(
        new Set(
          perms.flatMap((p) => {
            const value = p[key] as unknown;
            return typeof value === "number" ? [value] : [];
          }),
        ),
      );
      return {
        mode: "custom" as const,
        ids,
      };
    };

    const divResult = computePermissionList(judgeDivisionPermissions, "division_id");
    setJudgeDivisionMode(divResult.mode);
    setJudgeDivisionIds(divResult.ids);

    const partResult = computePermissionList(judgeParticipantPermissions, "participant_id");
    setJudgeParticipantMode(partResult.mode);
    setJudgeParticipantIds(partResult.ids);

    // scoring permissions aggregation
    const allCriteriaIdsForContest =
      criteriaList
        .filter((c) => c.contest_id === selectedContestIdForPermissions)
        .map((c) => c.id);

    const scoringPerms =
      relevantJudges.length === 1
        ? judgeScoringPermissions.filter(
            (p) =>
              p.judge_id === relevantJudges[0] &&
              p.contest_id === selectedContestIdForPermissions,
          )
        : judgeScoringPermissions.filter(
            (p) => p.contest_id === selectedContestIdForPermissions,
          );

    if (scoringPerms.length === 0) {
      setJudgePermissionsMode("all");
      setJudgePermissionsCriteriaIds(allCriteriaIdsForContest);
    } else {
      const globalPermission = scoringPerms.find((p) => p.criteria_id === null);
      const perCriteriaUnlocks = scoringPerms
        .filter((p) => p.criteria_id !== null && p.can_edit)
        .map((p) => p.criteria_id as number);
      const uniqueCriteriaUnlocks = [...new Set(perCriteriaUnlocks)];

      if (globalPermission) {
        if (globalPermission.can_edit) {
          setJudgePermissionsMode("all");
          setJudgePermissionsCriteriaIds(allCriteriaIdsForContest);
        } else {
          setJudgePermissionsMode("custom");
          setJudgePermissionsCriteriaIds(uniqueCriteriaUnlocks);
        }
      } else {
        setJudgePermissionsMode("custom");
        setJudgePermissionsCriteriaIds(uniqueCriteriaUnlocks);
      }
    }
  }, [
    selectedContestIdForPermissions,
    selectedJudgeIdsForPermissions,
    judgeDivisionPermissions,
    judgeParticipantPermissions,
    judgeScoringPermissions,
    judgesForSelectedEvent,
    criteriaList,
    hasUnsavedPermissionChanges,
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

  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Tabulora"
              className="h-10 w-10 transition-transform duration-300 hover:scale-105"
            />
            <div className="space-y-0.5">
              <div className="text-sm font-bold tracking-tight text-[#1F4D3A]">
                Tabulora
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Tabulator Console
              </div>
            </div>
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

              <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="mb-2 text-xs font-semibold text-[#1F4D3A]">Signatures</div>
                <div className="flex flex-col gap-2 md:flex-row md:items-end">
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-500">Title</div>
                    <input
                      value={signatureTitleInput}
                      onChange={(e) => setSignatureTitleInput(e.target.value)}
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      placeholder="Chairman / Tabulator / Judge"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-500">Name</div>
                    <input
                      value={signatureNameInput}
                      onChange={(e) => setSignatureNameInput(e.target.value)}
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      placeholder="e.g., Juan Dela Cruz"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSignature}
                    disabled={isSavingSignature}
                    className="rounded-full bg-[#1F4D3A] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#163528] disabled:opacity-50"
                  >
                    {isSavingSignature ? "Adding..." : "Add signature"}
                  </button>
                </div>
                {(signatureError || signatureSuccess) && (
                  <div className={`mt-2 text-[11px] ${signatureError ? "text-red-500" : "text-emerald-600"}`}>
                    {signatureError || signatureSuccess}
                  </div>
                )}
                {signatures.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-3 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
                    {signatures.map((s) => (
                      <div key={s.id} className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                        {editingSignatureId === s.id ? (
                          <div className="space-y-2">
                            <div>
                              <div className="text-[11px] text-slate-500">Title</div>
                              <input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full rounded-lg border border-[#D0D7E2] bg-white px-2 py-1 text-xs outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A26]"
                              />
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-500">Name</div>
                              <input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="w-full rounded-lg border border-[#D0D7E2] bg-white px-2 py-1 text-xs outline-none focus:border-[#1F4D3A] focus:ring-1 focus:ring-[#1F4D3A26]"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(s.id)}
                                disabled={isSavingSignature}
                                className="flex-1 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                              >
                                {isSavingSignature ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isSavingSignature}
                                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] text-slate-600 hover:bg-[#F8FAFC] disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-700">{s.name || "\u00A0"}</div>
                              <div className="text-slate-500">{s.title || "\u00A0"}</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(s)}
                                className="rounded-full border border-[#E2E8F0] px-2 py-1 text-[10px] text-slate-600 hover:bg-[#F8FAFC]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSignature(s.id)}
                                className="rounded-full border border-[#E2E8F0] px-2 py-1 text-[10px] text-red-600 hover:bg-[#FDEDED]"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveView("awards")}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        activeView === "awards"
                          ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                          : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]"
                      }`}
                    >
                      Awards
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("sub-criteria")}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        activeView === "sub-criteria"
                          ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                          : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]"
                      }`}
                    >
                      Sub-Criteria
                    </button>
                  </div>

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
                          <div ref={awardsTableRef} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                            <table className="min-w-full border-collapse text-left text-sm">
                              <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                                <tr>
                                  <th className="px-4 py-3 font-medium">College/University</th>
                                  <th className="px-4 py-3 font-medium">Contestant</th>
                                  {judgeIdsForActiveContest.map((judgeId, index) => (
                                    <th
                                      key={judgeId}
                                      className="px-4 py-3 text-center font-medium"
                                      colSpan={activeContestScoringType === "ranking" ? 2 : 1}
                                    >
                                      {judgeUsernameById.get(judgeId) ?? `Judge ${index + 1}`}
                                    </th>
                                  ))}
                                  <th className="px-4 py-3 text-right font-medium">
                                    {activeContestScoringType === "ranking" ? "Rank total" : "Total"}
                                  </th>
                                </tr>
                                <tr className="bg-[#F5F7FF] text-[10px] font-semibold uppercase tracking-wide text-[#1F4D3A]">
                                  <th className="px-4 py-2"></th>
                                  <th className="px-4 py-2"></th>
                                  {judgeIdsForActiveContest.map((judgeId) => (
                                    <Fragment key={`hdr-${judgeId}`}>
                                      <th className="px-4 py-2 text-center">Score</th>
                                      {activeContestScoringType === "ranking" && (
                                        <th className="px-4 py-2 text-center">Rank</th>
                                      )}
                                    </Fragment>
                                  ))}
                                  <th className="px-4 py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {awardRankingRows.map((item) => (
                                  <tr
                                    key={item.row.participant.id}
                                    className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                  >
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
                                      const totalMap = awardTotalsByJudge.get(judgeId);
                                      const total = totalMap?.get(item.row.participant.id);
                                      const rank =
                                        awardRankByJudgeAndParticipant.get(
                                          `${judgeId}-${item.row.participant.id}`,
                                        ) ?? null;
                                      return (
                                        <Fragment key={`row-${judgeId}`}>
                                          <td className="px-4 py-3 align-middle text-center text-sm text-slate-700">
                                            {total !== undefined ? total.toFixed(2) : "—"}
                                          </td>
                                          {activeContestScoringType === "ranking" && (
                                            <td className="px-4 py-3 align-middle text-center text-sm font-semibold text-[#1F4D3A]">
                                              {rank ?? "—"}
                                            </td>
                                          )}
                                        </Fragment>
                                      );
                                    })}
                                    <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                      {activeContestScoringType === "ranking"
                                        ? (() => {
                                            let sum = 0;
                                            let count = 0;
                                            for (const judgeId of judgeIdsForActiveContest) {
                                              const r = awardRankByJudgeAndParticipant.get(
                                                `${judgeId}-${item.row.participant.id}`,
                                              );
                                              if (r != null) {
                                                sum += r;
                                                count += 1;
                                              }
                                            }
                                            return count === judgeIdsForActiveContest.length
                                              ? (sum / count).toFixed(2)
                                              : "—";
                                          })()
                                        : item.criteriaTotal !== null
                                          ? item.criteriaTotal.toFixed(2)
                                          : "—"}
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

                  {activeView === "sub-criteria" && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4">
                        <div className="text-sm font-semibold text-[#1F4D3A]">
                          Sub-Criteria breakdown
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Scores per participant, per criteria, per judge.
                        </div>
                      </div>

                      {subCriteriaRows.length === 0 ? (
                        <div className="text-sm text-slate-500">
                          No sub-criteria scores found for this contest.
                        </div>
                      ) : (
                        <div
                          ref={subCriteriaTableRef}
                          className="overflow-auto rounded-2xl border border-[#E2E8F0] bg-white"
                        >
                          <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-[#F5F7FF] text-[10px] font-semibold uppercase tracking-wide text-[#1F4D3A]">
                              <tr>
                                <th className="px-4 py-3 font-medium">Contestant</th>
                                <th className="px-4 py-3 font-medium">Criteria</th>
                                {judgesForActiveContest.map((j) => (
                                  <th
                                    key={j.id}
                                    className="px-4 py-3 text-right font-medium"
                                  >
                                    {j.username}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subCriteriaRows.map((row) => (
                                <tr
                                  key={`${row.participant.id}-${row.criteria.id}`}
                                  className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                >
                                  <td className="px-4 py-3 align-middle">
                                    <div className="text-sm font-semibold text-slate-800">
                                      {row.participant.full_name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Contestant #{row.participant.contestant_number}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                                    {row.criteria.name}
                                  </td>
                                  {row.cells.map((cell) => (
                                    <td
                                      key={cell.judgeId}
                                      className="px-4 py-3 align-middle text-right text-sm text-slate-700"
                                    >
                                      {typeof cell.value === "number"
                                        ? cell.value.toFixed(2)
                                        : "—"}
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                    {row.cells
                                      .reduce<number>((sum, cell) => {
                                        return typeof cell.value === "number" ? sum + cell.value : sum;
                                      }, 0)
                                      .toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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
                      disabled={judgesForSelectedEvent.length === 0}
                      options={judgesForSelectedEvent.map((judge) => ({
                        id: judge.id,
                        label: judge.full_name,
                      }))}
                      selectedIds={selectedJudgeIdsForPermissions}
                      onChange={(ids) => {
                        setSelectedJudgeIdsForPermissions(ids);
                        setHasUnsavedPermissionChanges(false);
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
                        setHasUnsavedPermissionChanges(false);
                        setJudgePermissionsError(null);
                        setJudgePermissionsSuccess(null);
                      }}
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    >
                      <option value="">Select contest</option>
                      {contestsForSelectedEvent.map((contest) => (
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
                        setHasUnsavedPermissionChanges(true);
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
                          : participantsForSelectedEvent
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
                        setHasUnsavedPermissionChanges(true);
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
                                    setHasUnsavedPermissionChanges(true);
                                    setJudgePermissionsError(null);
                                    setJudgePermissionsSuccess(null);
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
                        // collect the judge IDs we plan to update
                        let judgeIds =
                          selectedJudgeIdsForPermissions.length === 0
                            ? judgesForActiveEvent.map((judge) => judge.id)
                            : [...selectedJudgeIdsForPermissions];

                        // guard against stale/invalid ids (e.g. judge has been deleted)
                        const initialLength = judgeIds.length;
                        judgeIds = judgeIds.filter((id) =>
                          judgesForActiveEvent.some((j) => j.id === id),
                        );

                        if (judgeIds.length === 0) {
                          setJudgePermissionsError(
                            "There are no valid judges for this event.",
                          );
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        if (judgeIds.length < initialLength) {
                          // some selected judges were removed from the event list
                          setJudgePermissionsError(
                            "Some selected judges are no longer valid and were ignored.",
                          );
                        }

                        // Build scoring permission inserts
                        const scoringInserts: Array<{
                          judge_id: number;
                          contest_id: number;
                          criteria_id: number | null;
                          can_edit: boolean;
                        }> = [];
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

                        // Build division permission inserts
                        const divisionInserts: Array<{
                          judge_id: number;
                          contest_id: number;
                          division_id: number;
                        }> = [];
                        if (judgeDivisionMode === "custom" && judgeDivisionIds.length > 0) {
                          judgeDivisionIds.forEach(dId => {
                            judgeIds.forEach(jId => {
                              divisionInserts.push({
                                judge_id: jId, contest_id: selectedContestIdForPermissions, division_id: dId
                              });
                            });
                          });
                        }

                        // Build participant permission inserts
                        const participantInserts: Array<{
                          judge_id: number;
                          contest_id: number;
                          participant_id: number;
                        }> = [];
                        if (judgeParticipantMode === "custom" && judgeParticipantIds.length > 0) {
                          judgeParticipantIds.forEach(pId => {
                            judgeIds.forEach(jId => {
                              participantInserts.push({
                                judge_id: jId, contest_id: selectedContestIdForPermissions, participant_id: pId
                              });
                            });
                          });
                        }

                        // Execute all deletes in parallel
                        const [deleteScoringRes, deleteDivRes, deletePartRes] = await Promise.all([
                          supabase
                            .from("judge_scoring_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions),
                          supabase
                            .from("judge_division_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions),
                          supabase
                            .from("judge_participant_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions),
                        ]);

                        // Check for errors in parallel deletes
                        if (deleteScoringRes.error) {
                          setJudgePermissionsError(deleteScoringRes.error.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        if (deleteDivRes.error) {
                          setJudgePermissionsError(deleteDivRes.error.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }
                        if (deletePartRes.error) {
                          setJudgePermissionsError(deletePartRes.error.message);
                          setIsSavingJudgePermissions(false);
                          return;
                        }

                        // Execute all inserts in parallel (only if there's data to insert)
                        const insertPromises = [];
                        if (scoringInserts.length > 0) {
                          insertPromises.push(
                            supabase.from("judge_scoring_permission").insert(scoringInserts).select()
                          );
                        }
                        if (divisionInserts.length > 0) {
                          insertPromises.push(
                            supabase.from("judge_division_permission").insert(divisionInserts).select()
                          );
                        }
                        if (participantInserts.length > 0) {
                          insertPromises.push(
                            supabase.from("judge_participant_permission").insert(participantInserts).select()
                          );
                        }

                        if (insertPromises.length > 0) {
                          const insertResults = await Promise.all(insertPromises);
                          for (const result of insertResults) {
                            if (result.error) {
                              setJudgePermissionsError(result.error.message);
                              setIsSavingJudgePermissions(false);
                              return;
                            }
                          }
                        }

                        // clear earlier validation errors now that save succeeded
                        setJudgePermissionsError(null);
                        setJudgePermissionsSuccess("Access permissions updated successfully.");
                        setIsSavingJudgePermissions(false);
                        setHasUnsavedPermissionChanges(false);
                        
                        // Broadcast to admin so they refresh immediately
                        try {
                          if (event && selectedContestIdForPermissions !== null) {
                            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                            if (supabaseUrl && supabaseAnonKey) {
                              const supabase2 = createClient(supabaseUrl, supabaseAnonKey);
                              // Use same channel name as admin's broadcast for consistency
                              const ch = supabase2.channel(`permissions-update-${event.id}`, {
                                config: { broadcast: { ack: true } },
                              });
                              await ch.subscribe();
                              await ch.send({
                                type: "broadcast",
                                event: "permissions-updated",
                                payload: {
                                  contestId: selectedContestIdForPermissions,
                                  source: 'tabulator',
                                  timestamp: Date.now(),
                                },
                              });
                              supabase2.removeChannel(ch);
                            }
                          }
                        } catch {}
                        
                        // auto-clear success message after 3 seconds
                        setTimeout(() => {
                          setJudgePermissionsSuccess(null);
                        }, 3000);
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
                        return selectedCriteria.map(c => (
                          <th key={c.id} className="px-4 py-3 text-center font-medium">
                            {c.name}
                          </th>
                        ));
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
                            // Calculate scores for this participant and judge
                            const judgeId = selectedJudgeForBreakdown;
                            return selectedCriteria.map(c => {
                              const key = `${c.id}-${judgeId}-${item.row.participant.id}`;
                              const val = criteriaScoreByJudgeAndParticipant.get(key);
                              return (
                                <td key={c.id} className="px-4 py-3 text-center text-slate-600">
                                  {val !== undefined ? val.toFixed(2) : "—"}
                                </td>
                              );
                            });
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
 
                             // Use only selected criteria when computing totals
                             
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
