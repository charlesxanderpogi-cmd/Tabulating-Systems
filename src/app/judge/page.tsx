"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type ContestScoringType = "percentage" | "points";

type ContestRow = {
  id: number;
  event_id: number;
  name: string;
  contest_code: string | null;
  created_at: string;
   scoring_type: ContestScoringType | null;
};

type CriteriaRow = {
  id: number;
  contest_id: number;
  name: string;
  percentage: number;
  description: string | null;
  criteria_code: string | null;
  created_at: string;
  category: string | null;
};

type CategoryRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type ContestLayoutTemplateKey = "standard" | "pageant";

type ContestLayoutTheme = {
  workspaceBg?: string;
  workspaceBgOpacity?: number;
  femaleGroupBg?: string;
  femaleGroupBgOpacity?: number;
  femaleBadgeBg?: string;
  femaleBadgeBgOpacity?: number;
  maleGroupBg?: string;
  maleGroupBgOpacity?: number;
  maleBadgeBg?: string;
  maleBadgeBgOpacity?: number;
  criteriaHeaderBg?: string;
  criteriaHeaderTextColor?: string;
  criteriaHeaderFontSize?: number;
  criteriaHeaderFontFamily?: string;
  criteriaHeaderBgOpacity?: number;
  criteriaHeaderTextColorOpacity?: number;
  cardBg?: string;
  cardBgOpacity?: number;
  numberTextColor?: string;
  numberTextColorOpacity?: number;
  numberFontSize?: number;
  numberFontFamily?: string;
  nameTextColor?: string;
  nameTextColorOpacity?: number;
  nameFontSize?: number;
  nameFontFamily?: string;
  numberBadgeBg?: string;
  numberBadgeBgOpacity?: number;
  criteriaTextColor?: string;
  criteriaTextFontSize?: number;
  criteriaTextFontFamily?: string;
  criteriaTextColorOpacity?: number;
  scoringTableBg?: string;
  scoringTableBgOpacity?: number;
  scoringCategoryRowBg?: string;
  scoringCategoryRowBgOpacity?: number;
  scoringTotalRowBg?: string;
  scoringTotalRowBgOpacity?: number;
  scoringTotalRowLabelTextColor?: string;
  scoringTotalRowLabelTextColorOpacity?: number;
  scoringTotalRowScoreTextColor?: string;
  scoringTotalRowScoreTextColorOpacity?: number;
  scoreInputBg?: string;
  scoreInputBgOpacity?: number;
  scoreInputBorderColor?: string;
  scoreInputBorderColorOpacity?: number;
  scoreInputTextColor?: string;
  scoreInputTextColorOpacity?: number;
  modalBodyBg?: string;
  modalBodyBgOpacity?: number;
  modalFooterBg?: string;
  modalFooterBgOpacity?: number;
  modalHeaderBg?: string;
  modalHeaderBgOpacity?: number;
  modalHeaderPrimaryTextColor?: string;
  modalHeaderPrimaryTextColorOpacity?: number;
  modalHeaderSecondaryTextColor?: string;
  modalHeaderSecondaryTextColorOpacity?: number;
  modalContestantBadgeBg?: string;
  modalContestantBadgeBgOpacity?: number;
  modalContestantBadgeTextColor?: string;
  modalContestantBadgeTextColorOpacity?: number;
  modalPrimaryButtonBg?: string;
  modalPrimaryButtonBgOpacity?: number;
  modalPrimaryButtonTextColor?: string;
  modalPrimaryButtonTextColorOpacity?: number;
  modalSecondaryButtonBg?: string;
  modalSecondaryButtonBgOpacity?: number;
  modalSecondaryButtonTextColor?: string;
  modalSecondaryButtonTextColorOpacity?: number;
};

function hexWithOpacity(hex: string, opacity?: number) {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return hex;
  }
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  const alpha =
    typeof opacity === "number"
      ? Math.min(1, Math.max(0, opacity))
      : 1;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type ContestLayout = {
  version: number;
  templateKey: ContestLayoutTemplateKey;
  templateId?: number | null;
  theme?: ContestLayoutTheme;
};

type ParticipantRow = {
  id: number;
  contest_id: number;
  division_id: number;
  full_name: string;
  contestant_number: string;
  created_at: string;
  avatar_url: string | null;
  gender: string | null;
  team_id: number | null;
};

type TeamRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
  division_id: number | null;
};

type ScoreRow = {
  id: number;
  judge_id: number;
  participant_id: number;
  criteria_id: number;
  score: number;
  created_at: string;
};

type JudgeParticipantTotalRow = {
  id: number;
  judge_id: number;
  participant_id: number;
  contest_id: number;
  total_score: number;
  created_at: string;
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

type JudgeTabulationRow = {
  participant: ParticipantRow;
  categoryName: string;
  teamName: string | null;
  totalScore: number;
  rank: number;
  judgeScores: Record<number, number>;
};

type AwardResult = {
  award: AwardRow;
  contestName: string;
  criteriaName: string | null;
  winners: JudgeTabulationRow[];
};

type AwardRankingRow = {
  row: JudgeTabulationRow;
  criteriaTotal: number | null;
  rank: number | null;
  judgeCriteriaScores: Record<number, number>;
};

type JudgeRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  role: "chairman" | "judge";
  created_at: string;
};

type JudgeContestSubmissionRow = {
  judge_id: number;
  contest_id: number;
  submitted_at: string;
};

type JudgeScoringPermissionRow = {
  judge_id: number;
  contest_id: number;
  criteria_id: number | null;
  can_edit: boolean;
};

type ContestLayoutRow = {
  contest_id: number;
  layout_json: ContestLayout;
};

export default function JudgeDashboardPage() {
  const router = useRouter();
  const [judge, setJudge] = useState<JudgeRow | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [criteriaList, setCriteriaList] = useState<CriteriaRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [eventJudges, setEventJudges] = useState<JudgeRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [judgeTotals, setJudgeTotals] = useState<JudgeParticipantTotalRow[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [assignedContestIds, setAssignedContestIds] = useState<number[]>([]);
  const [activeContestId, setActiveContestId] = useState<number | null>(null);
  const [activeDivisionFilterId, setActiveDivisionFilterId] = useState<
    number | "all"
  >("all");
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingParticipantScores, setIsSavingParticipantScores] =
    useState(false);
  const [isSubmitAllModalOpen, setIsSubmitAllModalOpen] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [submittedContestIds, setSubmittedContestIds] = useState<number[]>([]);
  const [judgeScoringPermissions, setJudgeScoringPermissions] = useState<
    JudgeScoringPermissionRow[]
  >([]);
  const [submitAllDivisionId, setSubmitAllDivisionId] = useState<number | null>(
    null,
  );
  const [submitAllDivisionName, setSubmitAllDivisionName] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [contestLayoutTemplateKey, setContestLayoutTemplateKey] =
    useState<ContestLayoutTemplateKey>("standard");
  const [contestLayoutTheme, setContestLayoutTheme] =
    useState<ContestLayoutTheme | null>(null);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [selectedJudgeForBreakdown, setSelectedJudgeForBreakdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "tabulation">("score");
  const [activeTabulationView, setActiveTabulationView] = useState<
    "overall" | "awards"
  >("awards");
  const [activeAwardFilterId, setActiveAwardFilterId] = useState<
    number | "all"
  >("all");
  const activeContestIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeContestIdRef.current = activeContestId;
  }, [activeContestId]);

  useEffect(() => {
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
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadJudgeData = async () => {
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
        .select("id, event_id, full_name, username, role, created_at")
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

      const totalQuery =
        judgeRow.role === "chairman"
          ? supabase
              .from("judge_participant_total")
              .select(
                "id, judge_id, participant_id, contest_id, total_score, created_at, contest!inner(event_id)",
              )
              .eq("contest.event_id", judgeRow.event_id)
          : supabase
              .from("judge_participant_total")
              .select(
                "id, judge_id, participant_id, contest_id, total_score, created_at",
              )
              .eq("judge_id", judgeRow.id);

      const [
        { data: eventRows, error: eventError },
        { data: assignmentRows },
        { data: submissionRows, error: submissionError },
        { data: permissionRows },
        { data: totalRows, error: totalError },
        { data: awardRows, error: awardError },
        { data: teamRows, error: teamError },
        { data: eventJudgesRows, error: eventJudgesError },
      ] = await Promise.all([
        supabase
          .from("event")
          .select("id, name, code, year, is_active, created_at")
          .eq("id", judgeRow.event_id)
          .limit(1),
        supabase
          .from("judge_assignment")
          .select("contest_id")
          .eq("judge_id", judgeRow.id),
        supabase
          .from("judge_contest_submission")
          .select("judge_id, contest_id, submitted_at")
          .eq("judge_id", judgeRow.id),
        supabase
          .from("judge_scoring_permission")
          .select("judge_id, contest_id, criteria_id, can_edit")
          .eq("judge_id", judgeRow.id),
        totalQuery,
        supabase
          .from("award")
          .select(
            "id, event_id, contest_id, name, description, award_type, criteria_id, criteria_ids, is_active, created_at",
          )
          .eq("event_id", judgeRow.event_id),
        supabase
          .from("team")
          .select("id, event_id, name, created_at, division_id")
          .eq("event_id", judgeRow.event_id),
        supabase
          .from("user_judge")
          .select("id, event_id, full_name, username, role, created_at")
          .eq("event_id", judgeRow.event_id),
      ]);

      if (
        eventError ||
        submissionError ||
        totalError ||
        awardError ||
        teamError ||
        eventJudgesError
      ) {
        const message =
          eventError?.message ||
          awardError?.message ||
          totalError?.message ||
          submissionError?.message ||
          teamError?.message ||
          eventJudgesError?.message ||
          "Unable to load event information.";
        setError(message);
        setIsLoading(false);
        return;
      }

      if (!eventRows || eventRows.length === 0) {
        setError("Assigned event not found. Please contact the administrator.");
        setIsLoading(false);
        return;
      }

      const event = eventRows[0] as EventRow;
      setEvent(event);

      if (!event.is_active) {
        setIsLoading(false);
        // We will handle the inactive event UI in the render method
        return;
      }

      const contestIds =
        assignmentRows?.map((row) => row.contest_id as number) ?? [];

      const submittedIds =
        submissionRows
          ?.map((row) => row as JudgeContestSubmissionRow)
          .map((row) => row.contest_id) ?? [];
      setSubmittedContestIds(submittedIds);

      const typedPermissions =
        (permissionRows ?? []) as JudgeScoringPermissionRow[];
      setJudgeScoringPermissions(typedPermissions);

      const typedTotals = (totalRows ?? []) as JudgeParticipantTotalRow[];
      setJudgeTotals(typedTotals);

      setAwards((awardRows ?? []) as AwardRow[]);
      setTeams((teamRows ?? []) as TeamRow[]);
      setEventJudges((eventJudgesRows ?? []) as JudgeRow[]);

      if (contestIds.length === 0) {
        setAssignedContestIds([]);
        setContests([]);
        setParticipants([]);
        setCriteriaList([]);
        setCategories([]);
        setScores([]);
        setIsLoading(false);
      } else {
        setAssignedContestIds(contestIds);

        // Load all scores for both chairman and judges to calculate correct totals in Awards
        const scoreQuery = supabase
          .from("score")
          .select(
            "id, judge_id, participant_id, criteria_id, score, created_at, criteria!inner(contest_id)",
          )
          .in("criteria.contest_id", contestIds);

        const [
          { data: contestRows, error: contestError },
          { data: participantRows, error: participantError },
          { data: criteriaRows, error: criteriaError },
          { data: categoryRows, error: categoryError },
          { data: scoreRows, error: scoreError },
        ] = await Promise.all([
          supabase
            .from("contest")
            .select("id, event_id, name, contest_code, created_at, scoring_type")
            .in("id", contestIds)
            .order("created_at", { ascending: false }),
          supabase
            .from("participant")
            .select(
              "id, contest_id, division_id, full_name, contestant_number, created_at, avatar_url, gender, team_id",
            )
            .in("contest_id", contestIds),
          supabase
            .from("criteria")
            .select(
              "id, contest_id, name, percentage, created_at, description, criteria_code, category",
            )
            .in("contest_id", contestIds)
            .order("created_at", { ascending: true }),
          supabase
            .from("division")
            .select("id, event_id, name, created_at")
            .eq("event_id", judgeRow.event_id),
          scoreQuery,
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

        // Initialize score inputs only for current judge's own scores
        const initialInputs: Record<string, string> = {};
        for (const score of typedScores) {
          if (score.judge_id === judgeRow.id) {
            const key = `${score.participant_id}-${score.criteria_id}`;
            initialInputs[key] = String(score.score);
          }
        }
        setScoreInputs(initialInputs);

        if (contestIds.length > 0) {
          setActiveContestId(contestIds[0]);
        }
      }

      channel = supabase
        .channel("judge-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "event",
            filter: `id=eq.${judgeRow.event_id}`,
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
            table: "judge_contest_submission",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newRow = payload.new as JudgeContestSubmissionRow;

              if (newRow.judge_id !== judgeRow.id) {
                return;
              }

              setSubmittedContestIds((previous) =>
                previous.includes(newRow.contest_id)
                  ? previous
                  : [...previous, newRow.contest_id],
              );
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as JudgeContestSubmissionRow | null;

              if (!oldRow || oldRow.judge_id !== judgeRow.id) {
                return;
              }

              setSubmittedContestIds((previous) =>
                previous.filter((id) => id !== oldRow.contest_id),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_judge",
          },
          (payload) => {
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as JudgeRow;

              if (newRow.id !== judgeRow.id) {
                return;
              }

              setJudge(newRow);
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;

              if (!oldRow || oldRow.id !== judgeRow.id) {
                return;
              }

              setJudge(null);
              setError("Judge account was removed. Please contact the administrator.");
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
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as ParticipantRow;

              if (!contestIds.includes(newRow.contest_id)) {
                return;
              }

              setParticipants((previous) => {
                const exists = previous.some(
                  (participant) => participant.id === newRow.id,
                );

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((participant) =>
                  participant.id === newRow.id ? newRow : participant,
                );
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;

              if (!oldRow) {
                return;
              }

              setParticipants((previous) =>
                previous.filter((participant) => participant.id !== oldRow.id),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "criteria",
          },
          (payload) => {
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as CriteriaRow;

              if (!contestIds.includes(newRow.contest_id)) {
                return;
              }

              setCriteriaList((previous) => {
                const exists = previous.some(
                  (criteria) => criteria.id === newRow.id,
                );

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((criteria) =>
                  criteria.id === newRow.id ? newRow : criteria,
                );
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;

              if (!oldRow) {
                return;
              }

              setCriteriaList((previous) =>
                previous.filter((criteria) => criteria.id !== oldRow.id),
              );
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "division",
          },
          (payload) => {
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as CategoryRow;

              if (newRow.event_id !== judgeRow.event_id) {
                return;
              }

              setCategories((previous) => {
                const exists = previous.some(
                  (category) => category.id === newRow.id,
                );

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((category) =>
                  category.id === newRow.id ? newRow : category,
                );
              });
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: number } | null;

              if (!oldRow) {
                return;
              }

              setCategories((previous) =>
                previous.filter((category) => category.id !== oldRow.id),
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
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as ScoreRow;

              // Update scores array for all judges (for total calculations)
              setScores((previous) => {
                const exists = previous.some((score) => score.id === newRow.id);

                if (payload.eventType === "INSERT" && !exists) {
                  return [newRow, ...previous];
                }

                return previous.map((score) =>
                  score.id === newRow.id ? newRow : score,
                );
              });

              // Only update score inputs for current judge's own scores
              if (newRow.judge_id === judgeRow.id) {
                const key = `${newRow.participant_id}-${newRow.criteria_id}`;
                setScoreInputs((previous) => ({
                  ...previous,
                  [key]: String(newRow.score),
                }));
              }
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as ScoreRow | null;

              if (!oldRow) {
                return;
              }

              setScores((previous) =>
                previous.filter((score) => score.id !== oldRow.id),
              );

              // Only update score inputs for current judge's own scores
              if (oldRow.judge_id === judgeRow.id) {
                const key = `${oldRow.participant_id}-${oldRow.criteria_id}`;
                setScoreInputs((previous) => {
                  const next = { ...previous };
                  delete next[key];
                  return next;
                });
              }
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
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as JudgeScoringPermissionRow;

              if (newRow.judge_id !== judgeRow.id) {
                return;
              }

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
              const oldRow = payload.old as JudgeScoringPermissionRow | null;

              if (!oldRow || oldRow.judge_id !== judgeRow.id) {
                return;
              }

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
            table: "contest_layout",
          },
          (payload) => {
            if (
              payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE"
            ) {
              const newRow = payload.new as ContestLayoutRow;

              if (newRow.contest_id !== activeContestIdRef.current) {
                return;
              }

              const layout = newRow.layout_json;

              if (
                layout.templateKey === "standard" ||
                layout.templateKey === "pageant"
              ) {
                setContestLayoutTemplateKey(layout.templateKey);
              } else {
                setContestLayoutTemplateKey("standard");
              }
            } else if (payload.eventType === "DELETE") {
              const oldRow = payload.old as ContestLayoutRow | null;

              if (!oldRow || oldRow.contest_id !== activeContestIdRef.current) {
                return;
              }

              setContestLayoutTemplateKey("standard");
            }
          },
        )
        .subscribe();

      setIsLoading(false);
    };

    loadJudgeData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    if (!activeContestId) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let cancelled = false;

    const fetchLayout = () => {
      supabase
        .from("contest_layout")
        .select("contest_id, layout_json")
        .eq("contest_id", activeContestId)
        .limit(1)
        .then(({ data }) => {
          if (cancelled) {
            return;
          }

          if (!data || data.length === 0) {
            setContestLayoutTemplateKey("standard");
            setContestLayoutTheme(null);
            return;
          }

          const layout = (data[0] as { layout_json: ContestLayout }).layout_json;

          if (
            layout.templateKey === "standard" ||
            layout.templateKey === "pageant"
          ) {
            setContestLayoutTemplateKey(layout.templateKey);
          } else {
            setContestLayoutTemplateKey("standard");
          }

          setContestLayoutTheme(layout.theme ?? null);
        });
    };

    fetchLayout();

    const intervalId = window.setInterval(fetchLayout, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeContestId]);

  const activeContest = useMemo(
    () => contests.find((contest) => contest.id === activeContestId) || null,
    [contests, activeContestId],
  );

  const activeContestScoringType: ContestScoringType =
    activeContest?.scoring_type ?? "percentage";

  const activeContestCriteria = useMemo(
    () =>
      criteriaList.filter(
        (criteria) => criteria.contest_id === activeContestId,
      ),
    [criteriaList, activeContestId],
  );

  const categoriesForActiveEvent = useMemo(
    () =>
      event === null
        ? categories
        : categories.filter((category) => category.event_id === event.id),
    [categories, event],
  );

  const activeContestParticipants = useMemo(() => {
    let forContest = participants.filter(
      (participant) => participant.contest_id === activeContestId,
    );

    if (activeDivisionFilterId !== "all") {
      forContest = forContest.filter(
        (participant) => participant.division_id === activeDivisionFilterId,
      );
    }

    const parseNumber = (value: string) => {
      const trimmed = value.trim();
      const parsed = Number.parseInt(trimmed, 10);

      if (Number.isNaN(parsed)) {
        return Number.MAX_SAFE_INTEGER;
      }

      return parsed;
    };

    return [...forContest].sort((a, b) => {
      const aNumber = parseNumber(a.contestant_number);
      const bNumber = parseNumber(b.contestant_number);

      if (aNumber !== bNumber) {
        return aNumber - bNumber;
      }

      return a.contestant_number.localeCompare(b.contestant_number);
    });
  }, [participants, activeContestId, activeDivisionFilterId]);

  const judgeTabulationRows = useMemo<JudgeTabulationRow[]>(() => {
    if (!activeContest || !judge) {
      return [];
    }

    let totalsForContest = judgeTotals.filter(
      (row) => row.contest_id === activeContest.id,
    );

    if (judge.role !== "chairman") {
      totalsForContest = totalsForContest.filter(
        (row) => row.judge_id === judge.id,
      );
    }

    if (
      totalsForContest.length === 0 ||
      activeContestParticipants.length === 0
    ) {
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

    const rows: JudgeTabulationRow[] = [];

    for (const participant of activeContestParticipants) {
      const stats = statsByParticipant.get(participant.id);

      if (!stats) {
        continue;
      }

      const category = categories.find(
        (categoryRow) => categoryRow.id === participant.division_id,
      );

      const team = teams.find(
        (teamRow) => teamRow.id === participant.team_id,
      );

      // If Chairman, show SUM. If normal judge, it's just their score (count is 1, so sum/1 = sum).
      // Wait, if Chairman, the user wants to see individual scores + Total.
      // The visual cue shows Total = Sum of judges.
      // So we should use Sum.
      const finalScore = judge.role === "chairman" ? stats.sum : (stats.count > 0 ? stats.sum / stats.count : 0);

      rows.push({
        participant,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        totalScore: Number(finalScore.toFixed(2)),
        rank: 0,
        judgeScores: stats.judgeScores,
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
  }, [
    activeContest,
    activeContestParticipants,
    judgeTotals,
    categories,
    judge,
    teams,
  ]);

  const currentParticipantTotalScore = useMemo(() => {
    if (!activeContest) {
      return null;
    }

    const participant = activeContestParticipants[currentParticipantIndex];

    if (!participant) {
      return null;
    }

    if (activeContestCriteria.length === 0) {
      return null;
    }

    let total = 0;
    let hasAny = false;

    for (const criteria of activeContestCriteria) {
      const key = `${participant.id}-${criteria.id}`;
      const inputValue = scoreInputs[key];

      let value: number | null = null;

      if (inputValue !== undefined && inputValue !== "") {
        const parsedInput = Number(inputValue);

        if (Number.isFinite(parsedInput)) {
          value = parsedInput;
        }
      }

      if (value === null) {
        const existing = scores.find(
          (score) =>
            score.participant_id === participant.id &&
            score.criteria_id === criteria.id,
        );

        if (existing) {
          const parsedExisting = Number(existing.score);

          if (Number.isFinite(parsedExisting)) {
            value = parsedExisting;
          }
        }
      }

      if (value === null) {
        continue;
      }

      hasAny = true;

      if (activeContestScoringType === "points") {
        total += value;
      } else {
        total += value * (criteria.percentage / 100);
      }
    }

    if (!hasAny) {
      return null;
    }

    return Number(total.toFixed(2));
  }, [
    activeContest,
    activeContestScoringType,
    activeContestCriteria,
    activeContestParticipants,
    currentParticipantIndex,
    scoreInputs,
    scores,
  ]);

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

  const criteriaScoreByParticipant = useMemo(() => {
    const map = new Map<string, number>();

    if (!activeContest) {
      return map;
    }

    const statsMap = new Map<string, { sum: number; count: number }>();

    for (const row of scores) {
      const criteria = criteriaList.find(
        (criteriaRow) => criteriaRow.id === row.criteria_id,
      );
      if (!criteria || criteria.contest_id !== activeContest.id) {
        continue;
      }
      const key = `${row.criteria_id}-${row.participant_id}`;
      const current = statsMap.get(key) ?? { sum: 0, count: 0 };
      statsMap.set(key, {
        sum: current.sum + Number(row.score),
        count: current.count + 1,
      });
    }

    for (const [key, stats] of statsMap) {
      // If Chairman, we want the SUM. If Judge, we want the Average (but since count=1, it's same).
      // Wait, if Chairman, 'criteriaScoreByParticipant' is used for ranking.
      // Ranking should be based on Total Score (Sum).
      const value = judge && judge.role === "chairman" ? stats.sum : (stats.count > 0 ? stats.sum / stats.count : 0);
      map.set(key, value);
    }

    return map;
  }, [scores, criteriaList, activeContest, judge]);

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

      if (judgeTabulationRows.length === 0) {
        continue;
      }

      results.push({
        award,
        contestName: activeContest.name,
        criteriaName: criteria ? criteria.name : null,
        winners: judgeTabulationRows,
      });
    }

    return results;
  }, [
    activeAwardFilterId,
    awardsForActiveContest,
    criteriaList,
    judgeTabulationRows,
    event,
    activeContest,
  ]);

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

    // NEW: Include all criteria from categories
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

    const scoresForCriteria = scores.filter(
      (s) => criteriaIds.includes(s.criteria_id),
    );

    const rowsWithTotals: AwardRankingRow[] = selectedAwardResult.winners.map(
      (row) => {
        let criteriaTotal = 0;
        let hasValue = false;

        // Calculate total for this judge (or all judges if chairman) based on EXPANDED criteriaIds
        if (judge && judge.role === "chairman") {
            // Chairman view: Sum of all judges for these criteria
            for (const judgeId of eventJudges.map(j => j.id)) {
                for (const cId of criteriaIds) {
                    // Find score in scores array directly as criteriaScoreByParticipant might be pre-aggregated or limited
                    const s = scores.find(s => s.judge_id === judgeId && s.participant_id === row.participant.id && s.criteria_id === cId);
                    if (s) {
                        criteriaTotal += Number(s.score);
                        hasValue = true;
                    }
                }
            }
        } else if (judge) {
            // Regular judge view: Sum of OWN scores for these criteria
            for (const cId of criteriaIds) {
                const s = scores.find(s => s.judge_id === judge.id && s.participant_id === row.participant.id && s.criteria_id === cId);
                if (s) {
                    criteriaTotal += Number(s.score);
                    hasValue = true;
                }
            }
        }

        const finalTotal = hasValue ? Number(criteriaTotal.toFixed(2)) : null;

        // For Chairman columns: calculate per-judge totals for this award
        const judgeCriteriaScores: Record<number, number> = {};
        for (const s of scoresForCriteria) {
          if (s.participant_id === row.participant.id) {
            judgeCriteriaScores[s.judge_id] = (judgeCriteriaScores[s.judge_id] || 0) + Number(s.score);
          }
        }

        return {
          row,
          criteriaTotal: finalTotal,
          rank: null,
          judgeCriteriaScores,
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
  }, [selectedAwardResult, criteriaScoreByParticipant, scores]);

  const participantCategoryName = useCallback(
    (participant: ParticipantRow) => {
      const category = categories.find(
        (category) => category.id === participant.division_id,
      );
      return category ? category.name : "Uncategorized";
    },
    [categories],
  );

  const participantInitials = (fullName: string) => {
    const parts = fullName.split(" ").filter(Boolean);

    if (parts.length === 0) {
      return "?";
    }

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();

    return `${first}${last}`;
  };

  const canEditCriteria = useCallback(
    (contestId: number | null, criteriaId: number): boolean => {
      if (contestId === null) {
        return true;
      }

      const permissionsForContest = judgeScoringPermissions.filter(
        (permission) => permission.contest_id === contestId,
      );

      // 1. Check for specific permission for this criteria
      const specificPermission = permissionsForContest.find(
        (permission) => permission.criteria_id === criteriaId,
      );
      if (specificPermission) {
        return specificPermission.can_edit;
      }

      // 2. Check for global permission for this contest
      const globalPermission = permissionsForContest.find(
        (permission) => permission.criteria_id === null,
      );
      if (globalPermission) {
        return globalPermission.can_edit;
      }

      // 3. Fallback: If no permissions are set, check if the contest is submitted
      // If submitted -> Locked (false)
      // If not submitted -> Open (true)
      return !submittedContestIds.includes(contestId);
    },
    [judgeScoringPermissions, submittedContestIds],
  );

  const isContestSubmitted = (contestId: number | null) => {
    if (contestId === null) {
      return false;
    }
    return submittedContestIds.includes(contestId);
  };

  const handleOpenSubmitAllModal = () => {
    if (!activeContest) {
      return;
    }
    if (activeContestParticipants.length === 0 || activeContestCriteria.length === 0) {
      return;
    }
    if (
      !activeContestCriteria.some((criteria) =>
        canEditCriteria(activeContest.id, criteria.id),
      )
    ) {
      return;
    }
    let divisionId: number | null = null;
    let divisionName: string | null = null;

    if (currentParticipant) {
      divisionId = currentParticipant.division_id;
      const division = categories.find(
        (category) => category.id === currentParticipant.division_id,
      );
      divisionName = division?.name ?? null;
    }

    setSubmitAllDivisionId(divisionId);
    setSubmitAllDivisionName(divisionName);
    setError(null);
    setSuccess(null);
    setIsSubmitAllModalOpen(true);
  };

  const handleConfirmSubmitAll = async () => {
    if (!judge || !activeContest) {
      setIsSubmitAllModalOpen(false);
      return;
    }

    // Prevent re-submission when contest is submitted and not unlocked by admin
    if (
      isContestSubmitted(activeContest.id) &&
      !activeContestCriteria.some((criteria) =>
        canEditCriteria(activeContest.id, criteria.id),
      )
    ) {
      setIsSubmitAllModalOpen(false);
      return;
    }

    setIsSubmittingAll(true);
    setError(null);
    setSuccess(null);

    const participantsForSubmit =
      submitAllDivisionId === null
        ? activeContestParticipants
        : activeContestParticipants.filter(
            (participant) => participant.division_id === submitAllDivisionId,
          );

    if (participantsForSubmit.length === 0) {
      setIsSubmittingAll(false);
      setIsSubmitAllModalOpen(false);
      setError("No participants found for this division to submit.");
      return;
    }

    for (const participant of participantsForSubmit) {
      for (const criteria of activeContestCriteria) {
        const key = `${participant.id}-${criteria.id}`;
        const value = scoreInputs[key];

        if (value === undefined || value === "") {
          setIsSubmittingAll(false);
          setIsSubmitAllModalOpen(false);
          setError(
            "Please enter a score for every participant and criteria before submitting all.",
          );
          return;
        }

        const parsed = Number(value);

        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
          setIsSubmittingAll(false);
          setIsSubmitAllModalOpen(false);
          setError("Scores must be between 0 and 100.");
          return;
        }
      }
    }

    await Promise.all(
      participantsForSubmit.flatMap((participant) =>
        activeContestCriteria.map((criteria) =>
          handleScoreBlur(participant.id, criteria.id),
        ),
      ),
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setIsSubmittingAll(false);
      setIsSubmitAllModalOpen(false);
      setError("Supabase is not configured.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const totalRows = participantsForSubmit.map((participant) => {
      let total = 0;

      for (const criteria of activeContestCriteria) {
        const key = `${participant.id}-${criteria.id}`;
        const value = scoreInputs[key];
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
          continue;
        }

        if (activeContestScoringType === "points") {
          total += parsed;
        } else {
          total += parsed * (criteria.percentage / 100);
        }
      }

      return {
        judge_id: judge.id,
        participant_id: participant.id,
        contest_id: activeContest.id,
        total_score: Number(total.toFixed(2)),
      };
    });

    const participantIdsForSubmit = participantsForSubmit.map(
      (participant) => participant.id,
    );

    const { error: deleteError } = await supabase
      .from("judge_participant_total")
      .delete()
      .eq("judge_id", judge.id)
      .eq("contest_id", activeContest.id)
      .in("participant_id", participantIdsForSubmit);

    if (deleteError) {
      setIsSubmittingAll(false);
      setIsSubmitAllModalOpen(false);
      setError(
        deleteError.message ||
          "Unable to reset existing total scores for contestants.",
      );
      return;
    }

    const { error: totalError } = await supabase
      .from("judge_participant_total")
      .insert(totalRows);

    if (totalError) {
      setIsSubmittingAll(false);
      setIsSubmitAllModalOpen(false);
      setError(
        totalError.message ||
          "Unable to save total scores for all contestants.",
      );
      return;
    }

    // Always mark the contest as submitted immediately
    const { data: existingSubmission, error: fetchSubmissionError } =
      await supabase
        .from("judge_contest_submission")
        .select("judge_id, contest_id")
        .eq("judge_id", judge.id)
        .eq("contest_id", activeContest.id)
        .limit(1);

    if (fetchSubmissionError) {
      setIsSubmittingAll(false);
      setIsSubmitAllModalOpen(false);
      setError(
        fetchSubmissionError.message || "Unable to check submission status.",
      );
      return;
    }

    if (!existingSubmission || existingSubmission.length === 0) {
      const { error } = await supabase
        .from("judge_contest_submission")
        .insert({
          judge_id: judge.id,
          contest_id: activeContest.id,
        });

      if (error) {
        setIsSubmittingAll(false);
        setIsSubmitAllModalOpen(false);
        setError(error.message || "Unable to submit all scores.");
        return;
      }
    }

    setIsSubmittingAll(false);
    setIsSubmitAllModalOpen(false);

    setSubmittedContestIds((previous) =>
      previous.includes(activeContest.id)
        ? previous
        : [...previous, activeContest.id],
    );
    setSuccess(
      "All scores for this contest have been submitted. Further changes are now locked.",
    );
  };

  const handleScoreChange = (
    participantId: number,
    criteriaId: number,
    value: string,
  ) => {
    const criteria = criteriaList.find((item) => item.id === criteriaId);
    if (criteria && !canEditCriteria(criteria.contest_id, criteria.id)) {
      return;
    }

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
    const criteria = criteriaList.find((item) => item.id === criteriaId);
    if (criteria && !canEditCriteria(criteria.contest_id, criteria.id)) {
      return;
    }

    const key = `${participantId}-${criteriaId}`;
    const value = scoreInputs[key];

    if (value === undefined || value === "") {
      return;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      setError("Scores must be a valid number.");
      return;
    }

    const maxScore =
      activeContestScoringType === "points"
        ? criteria?.percentage ?? 100
        : 100;

    const clamped = Math.min(Math.max(parsed, 0), maxScore);

    if (clamped !== parsed) {
      setScoreInputs((previous) => ({
        ...previous,
        [key]: clamped.toString(),
      }));
    }

    const scoreToSave = clamped;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase is not configured.");
      return;
    }

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
          score: scoreToSave,
        })
        .select(
          "id, judge_id, participant_id, criteria_id, score, created_at",
        );

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
        .update({ score: scoreToSave })
        .eq("id", existing.id)
        .select(
          "id, judge_id, participant_id, criteria_id, score, created_at",
        );

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

  const safeParticipantIndex =
    activeContestParticipants.length === 0
      ? 0
      : Math.min(
          currentParticipantIndex,
          activeContestParticipants.length - 1,
        );

  const currentParticipant: ParticipantRow | null =
    activeContestParticipants.length > 0
      ? activeContestParticipants[safeParticipantIndex]
      : null;

  const pageantGroups = useMemo(() => {
    if (activeContestParticipants.length === 0) {
      return [];
    }

    const groups = new Map<
      string,
      { groupLabel: string; items: { participant: ParticipantRow; index: number }[] }
    >();

    activeContestParticipants.forEach((participant, index) => {
      const division = categories.find(
        (category) => category.id === participant.division_id,
      );

      const rawLabel = division?.name?.trim() ?? "";
      const labelKey = rawLabel || "All";
      const displayLabel = rawLabel;
      const item = { participant, index };

      const existing = groups.get(labelKey);

      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(labelKey, {
          groupLabel: displayLabel,
          items: [item],
        });
      }
    });

    const result = Array.from(groups.values());

    if (result.length <= 1) {
      return [
        {
          groupLabel: "",
          items: activeContestParticipants.map((participant, index) => ({
            participant,
            index,
          })),
        },
      ];
    }

    const orderValue = (label: string) => {
      const lower = label.toLowerCase();
      if (lower === "female") return 0;
      if (lower === "male") return 1;
      return 2;
    };

    return result.sort(
      (a, b) => orderValue(a.groupLabel) - orderValue(b.groupLabel),
    );
  }, [activeContestParticipants, categories]);

  const criteriaByCategory = useMemo(() => {
    if (activeContestCriteria.length === 0) {
      return [];
    }

    const groups = new Map<string, CriteriaRow[]>();

    activeContestCriteria.forEach((criteria) => {
      const key = (criteria.category ?? "").trim() || "";
      const existing = groups.get(key);
      if (existing) {
        existing.push(criteria);
      } else {
        groups.set(key, [criteria]);
      }
    });

    return Array.from(groups.entries());
  }, [activeContestCriteria]);

  const handleBackToContestSelection = () => {
    if (
      activeContestParticipants.length === 0 ||
      currentParticipantIndex === 0
    ) {
      return;
    }
    setCurrentParticipantIndex((previous) =>
      Math.max(0, previous - 1),
    );
    setError(null);
    setSuccess(null);
  };

  const handleSaveCurrentParticipant = async () => {
    if (!currentParticipant) {
      return;
    }

    setIsSavingParticipantScores(true);

    try {
      await Promise.all(
        activeContestCriteria.map((criteria) =>
          handleScoreBlur(currentParticipant.id, criteria.id),
        ),
      );
    } finally {
      setIsSavingParticipantScores(false);
    }
  };

  const handleNextParticipant = () => {
    if (
      activeContestParticipants.length === 0 ||
      currentParticipantIndex + 1 >= activeContestParticipants.length
    ) {
      return;
    }
    setCurrentParticipantIndex(currentParticipantIndex + 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F4D3A] border-t-transparent" />
          <div className="text-sm font-medium text-slate-500">
            Loading judge profile...
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

  const headerTitle =
    judge && event
      ? `${event.name} • ${event.year}`
      : "Judge scoring dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1F4D3A]">
              {headerTitle}
            </h1>
            <p className="text-sm text-slate-600">
              Modern scoring workspace for judges of the tabulating system.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
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
          <div className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-full bg-[#E3F2EA] px-4 py-2 text-xs font-medium text-[#1F4D3A]">
                  {event ? `Event: ${event.name}` : "No active event assigned"}
                </div>
                <div className="rounded-full bg-[#F5F7FF] px-4 py-2 text-xs font-medium text-slate-700">
                  {assignedContestIds.length > 0
                    ? `${assignedContestIds.length} contest${
                        assignedContestIds.length > 1 ? "s" : ""
                      } assigned`
                    : "No contest assignments yet"}
                </div>
              </div>
              {isLoading && (
                <div className="text-sm text-slate-500">Loading data…</div>
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

            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] p-1 text-[11px] text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab("score")}
                  className={`rounded-full px-4 py-1.5 font-medium transition ${
                    activeTab === "score"
                      ? "bg-white text-[#1F4D3A] shadow-sm"
                      : "text-slate-600 hover:text-[#1F4D3A]"
                  }`}
                >
                  Score
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tabulation")}
                  className={`rounded-full px-4 py-1.5 font-medium transition ${
                    activeTab === "tabulation"
                      ? "bg-white text-[#1F4D3A] shadow-sm"
                      : "text-slate-600 hover:text-[#1F4D3A]"
                  }`}
                >
                  Tabulation
                </button>
              </div>

              <div className="grid gap-3 text-xs md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Contest
                  </span>
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

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
                    disabled={!activeContest}
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

              {activeTab === "score" && (
                <div
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6"
                  style={
                    contestLayoutTheme?.workspaceBg
                      ? {
                          backgroundColor: hexWithOpacity(
                            contestLayoutTheme.workspaceBg,
                            (contestLayoutTheme.workspaceBgOpacity ?? 100) / 100,
                          ),
                        }
                      : undefined
                  }
                >
                  {!activeContest || activeContestParticipants.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                      <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#1F4D3A] shadow-sm">
                        Scoring workspace
                      </div>
                      <p>Select a contest above to begin scoring participants.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {pageantGroups.map((group) => {
                        const labelLower = group.groupLabel.toLowerCase();
                        const baseContainerVariant =
                          labelLower === "female"
                            ? "border-rose-100 bg-gradient-to-b from-rose-50 via-white to-white"
                            : labelLower === "male"
                              ? "border-sky-100 bg-gradient-to-b from-sky-50 via-white to-white"
                              : "border-slate-100 bg-white/60";

                        const baseBadgeVariant =
                          labelLower === "female"
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                            : labelLower === "male"
                              ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700";

                        const femaleBg = contestLayoutTheme?.femaleGroupBg;
                        const femaleBadgeBg = contestLayoutTheme?.femaleBadgeBg;
                        const maleBg = contestLayoutTheme?.maleGroupBg;
                        const maleBadgeBg = contestLayoutTheme?.maleBadgeBg;
                        const cardBg = contestLayoutTheme?.cardBg;
                        const numberBadgeBg = contestLayoutTheme?.numberBadgeBg;
                        const numberTextColor = contestLayoutTheme?.numberTextColor;
                        const numberFontSize = contestLayoutTheme?.numberFontSize;
                        const numberFontFamily =
                          contestLayoutTheme?.numberFontFamily ?? "system";
                        const nameTextColor = contestLayoutTheme?.nameTextColor;
                        const nameFontSize = contestLayoutTheme?.nameFontSize;
                        const nameFontFamily =
                          contestLayoutTheme?.nameFontFamily ?? "system";

                        const containerStyle =
                          labelLower === "female" && femaleBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  femaleBg,
                                  (contestLayoutTheme?.femaleGroupBgOpacity ?? 100) /
                                    100,
                                ),
                                backgroundImage: "none",
                              }
                            : labelLower === "male" && maleBg
                              ? {
                                  backgroundColor: hexWithOpacity(
                                    maleBg,
                                    (contestLayoutTheme?.maleGroupBgOpacity ?? 100) /
                                      100,
                                  ),
                                  backgroundImage: "none",
                                }
                              : undefined;

                        const badgeStyle =
                          labelLower === "female" && femaleBadgeBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  femaleBadgeBg,
                                  (contestLayoutTheme?.femaleBadgeBgOpacity ?? 100) /
                                    100,
                                ),
                                backgroundImage: "none",
                              }
                            : labelLower === "male" && maleBadgeBg
                              ? {
                                  backgroundColor: hexWithOpacity(
                                    maleBadgeBg,
                                    (contestLayoutTheme?.maleBadgeBgOpacity ?? 100) /
                                      100,
                                  ),
                                  backgroundImage: "none",
                                }
                              : undefined;

                        return (
                          <div
                            key={group.groupLabel || "all"}
                            className={`space-y-4 rounded-2xl border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${baseContainerVariant}`}
                            style={containerStyle}
                          >
                            {group.groupLabel && (
                              <div className="flex items-center justify-center">
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold tracking-tight ${baseBadgeVariant}`}
                                  style={badgeStyle}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                                  <span>{group.groupLabel}</span>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                              {group.items.map(({ participant, index }) => (
                                <button
                                  key={participant.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentParticipantIndex(index);
                                    setIsScoringModalOpen(true);
                                  }}
                                  className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/95 p-3 text-[11px] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#1F4D3A] hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                                  style={
                                    cardBg
                                      ? {
                                          backgroundColor: hexWithOpacity(
                                            cardBg,
                                            (contestLayoutTheme?.cardBgOpacity ??
                                              100) / 100,
                                          ),
                                        }
                                      : undefined
                                  }
                                >
                                  <div
                                    className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E3F2EA] via-white to-[#FDE68A] text-lg font-semibold text-[#1F4D3A]"
                                    style={
                                      cardBg
                                        ? {
                                            backgroundColor: hexWithOpacity(
                                              cardBg,
                                              (contestLayoutTheme?.cardBgOpacity ??
                                                100) / 100,
                                            ),
                                            backgroundImage: "none",
                                          }
                                        : undefined
                                    }
                                  >
                                    {participant.avatar_url ? (
                                      <img
                                        src={participant.avatar_url}
                                        alt={participant.full_name}
                                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                      />
                                    ) : (
                                      participantInitials(participant.full_name)
                                    )}
                                    <div
                                      className="pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur"
                                      style={{
                                        backgroundColor: numberBadgeBg
                                          ? hexWithOpacity(
                                              numberBadgeBg,
                                              (contestLayoutTheme
                                                ?.numberBadgeBgOpacity ?? 100) /
                                                100,
                                            )
                                          : undefined,
                                        color: numberTextColor
                                          ? hexWithOpacity(
                                              numberTextColor,
                                              (contestLayoutTheme
                                                ?.numberTextColorOpacity ?? 100) /
                                                100,
                                            )
                                          : undefined,
                                        fontSize: numberFontSize
                                          ? `${numberFontSize}px`
                                          : undefined,
                                        fontFamily:
                                          numberFontFamily === "sans"
                                            ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                            : numberFontFamily === "serif"
                                              ? "Georgia, 'Times New Roman', serif"
                                              : numberFontFamily === "mono"
                                                ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                : undefined,
                                      }}
                                    >
                                      #{participant.contestant_number}
                                    </div>
                                  </div>
                                  <div className="w-full text-center">
                                    <div
                                      className="truncate text-[11px] font-semibold tracking-tight text-slate-800"
                                      style={{
                                        color: nameTextColor
                                          ? hexWithOpacity(
                                              nameTextColor,
                                              (contestLayoutTheme
                                                ?.nameTextColorOpacity ?? 100) /
                                                100,
                                            )
                                          : undefined,
                                        fontSize: nameFontSize
                                          ? `${nameFontSize}px`
                                          : undefined,
                                        fontFamily:
                                          nameFontFamily === "sans"
                                            ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                            : nameFontFamily === "serif"
                                              ? "Georgia, 'Times New Roman', serif"
                                              : nameFontFamily === "mono"
                                                ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                : undefined,
                                      }}
                                    >
                                      {participant.full_name}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tabulation" && (
                <div className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                  {!activeContest || judgeTabulationRows.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                      <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#1F4D3A] shadow-sm">
                        Tabulation workspace
                      </div>
                      <p>
                        Select a contest above to view your rankings once totals are
                        available.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* View switcher removed */}

                      {activeTabulationView === "overall" && (
                        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                          <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                              <tr>
                                <th className="px-4 py-3 font-medium">Rank</th>
                                <th className="px-4 py-3 font-medium">Represent</th>
                                <th className="px-4 py-3 font-medium">Contestant</th>
                                {judge && judge.role === "chairman" ? (
                                  eventJudges.map((j, index) => (
                                    <th
                                      key={j.id}
                                      className="px-4 py-3 text-center font-medium"
                                    >
                                      {j.id === judge.id ? "YOU" : j.username}
                                    </th>
                                  ))
                                ) : (
                                  <th className="px-4 py-3 text-center font-medium">Your Score</th>
                                )}
                                <th className="px-4 py-3 text-right font-medium">
                                  Total score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {judgeTabulationRows.map((row) => (
                                <tr
                                  key={row.participant.id}
                                  className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                >
                                  <td className="px-4 py-3 align-middle text-sm font-semibold text-slate-700">
                                    {row.rank}
                                  </td>
                                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                                    {row.teamName ?? "—"}
                                  </td>
                                  <td className="px-4 py-3 align-middle">
                                    <div className="text-sm font-semibold text-slate-800">
                                      {row.participant.full_name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Contestant #{row.participant.contestant_number}
                                    </div>
                                  </td>
                                  {judge && judge.role === "chairman" ? (
                                    eventJudges.map((j) => (
                                      <td
                                        key={j.id}
                                        className="px-4 py-3 align-middle text-center text-sm text-slate-600"
                                      >
                                        {row.judgeScores[j.id]
                                          ? row.judgeScores[j.id].toFixed(2)
                                          : "—"}
                                      </td>
                                    ))
                                  ) : (
                                    <td className="px-4 py-3 align-middle text-center text-sm text-slate-600">
                                      {judge && row.judgeScores[judge.id]
                                        ? row.judgeScores[judge.id].toFixed(2)
                                        : "—"}
                                    </td>
                                  )}
                                  <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                    {row.totalScore.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeTabulationView === "awards" && (
                        <div className="flex flex-col gap-4">
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4">
                            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                              <div>
                                <div className="text-sm font-semibold text-[#1F4D3A]">
                                  Awards ranking
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Select an award to view rankings based on your scores.
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
                            ) : selectedAwardResult.award.award_type !==
                                "criteria" ||
                              ((!selectedAwardResult.award.criteria_ids || selectedAwardResult.award.criteria_ids.length === 0) && selectedAwardResult.award.criteria_id === null) ? (
                              <div className="text-[11px] text-slate-400">
                                This is a special award. Criteria scores are not
                                available.
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                                <table className="min-w-full border-collapse text-left text-sm">
                                  <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                                    <tr>
                                      <th className="px-4 py-3 font-medium">Rank</th>
                                      <th className="px-4 py-3 font-medium">Represent</th>
                                      <th className="px-4 py-3 font-medium">
                                        Contestant
                                      </th>
                                      {judge && judge.role === "chairman" ? (
                                        eventJudges.map((j) => (
                                          <th
                                            key={j.id}
                                            className="px-4 py-3 text-center font-medium"
                                          >
                                            <div>{j.username}</div>
                                            <button
                                              type="button"
                                              onClick={() => setSelectedJudgeForBreakdown(j.id)}
                                              className="mt-1 rounded-full border border-[#1F4D3A33] bg-white px-2 py-0.5 text-[9px] font-medium text-[#1F4D3A] transition hover:bg-[#F0FDF4]"
                                            >
                                              show more
                                            </button>
                                          </th>
                                        ))
                                      ) : (
                                        <th className="px-4 py-3 text-center font-medium">
                                          <div>{judge?.username || "Score"}</div>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedJudgeForBreakdown(judge?.id || null)}
                                            className="mt-1 rounded-full border border-[#1F4D3A33] bg-white px-2 py-0.5 text-[9px] font-medium text-[#1F4D3A] transition hover:bg-[#F0FDF4]"
                                          >
                                            show more
                                          </button>
                                        </th>
                                      )}
                                      <th className="px-4 py-3 text-right font-medium">
                                        Total
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
                                          {item.row.teamName ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 align-middle">
                                          <div className="text-sm font-semibold text-slate-800">
                                            {item.row.participant.full_name}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            Contestant #
                                            {item.row.participant.contestant_number}
                                          </div>
                                        </td>
                                        {judge && judge.role === "chairman" ? (
                                          eventJudges.map((j) => (
                                            <td
                                              key={j.id}
                                              className="px-4 py-3 align-middle text-center text-sm text-slate-600"
                                            >
                                              {item.judgeCriteriaScores[j.id] !== undefined
                                                ? item.judgeCriteriaScores[j.id].toFixed(2)
                                                : "—"}
                                            </td>
                                          ))
                                        ) : (
                                          <td className="px-4 py-3 align-middle text-center text-sm font-semibold text-[#1F4D3A]">
                                            {item.criteriaTotal === null
                                              ? "—"
                                              : item.criteriaTotal.toFixed(2)}
                                          </td>
                                        )}
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
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Judge Breakdown Modal */}
      {selectedJudgeForBreakdown !== null && selectedAwardResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F4D3A]">
                    {judge?.role === 'chairman' ? (eventJudges.find(j => j.id === selectedJudgeForBreakdown)?.username || "Judge") : "My Scoring"} Breakdown
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
                        const originalAward = selectedAwardResult.award;
                        // Determine categories involved
                        let criteriaIds: number[] = [];
                        const rawIds = originalAward?.criteria_ids;

                        if (Array.isArray(rawIds)) {
                          criteriaIds = rawIds.map(id => Number(id));
                        } else if (typeof rawIds === 'string') {
                          const s = rawIds as string;
                          if (s.startsWith('{') && s.endsWith('}')) {
                            criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                          } else {
                            criteriaIds = s.split(',').map(n => Number(n.trim()));
                          }
                        } else if (originalAward?.criteria_id) {
                          criteriaIds = [Number(originalAward.criteria_id)];
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
                    {selectedAwardResult.winners.map((row) => (
                      <tr key={row.participant.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{row.participant.full_name}</div>
                            <div className="text-xs text-slate-500">#{row.participant.contestant_number} • {row.teamName ?? row.categoryName}</div>
                        </td>
                        {(() => {
                            const originalAward = selectedAwardResult.award;
                            // Re-calculate involved columns
                            let criteriaIds: number[] = [];
                            const rawIds = originalAward?.criteria_ids;

                            if (Array.isArray(rawIds)) {
                              criteriaIds = rawIds.map(id => Number(id));
                            } else if (typeof rawIds === 'string') {
                              const s = rawIds as string;
                              if (s.startsWith('{') && s.endsWith('}')) {
                                criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                              } else {
                                criteriaIds = s.split(',').map(n => Number(n.trim()));
                              }
                            } else if (originalAward?.criteria_id) {
                              criteriaIds = [Number(originalAward.criteria_id)];
                            }
                            
                            criteriaIds = criteriaIds.filter(n => !isNaN(n));
                            const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                            const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
                            
                            // Calculate scores for this participant and judge
                            const judgeId = selectedJudgeForBreakdown!;
                            
                            if (categories.length > 0) {
                                return categories.map(cat => {
                                    // Sum all criteria in this category
                                    const catCriteria = criteriaList.filter(c => c.category === cat);
                                    let catTotal = 0;
                                    let hasVal = false;
                                    
                                    for (const c of catCriteria) {
                                        const s = scores.find(s => s.judge_id === judgeId && s.participant_id === row.participant.id && s.criteria_id === c.id);
                                        if (s) {
                                            catTotal += Number(s.score);
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
                                    const s = scores.find(s => s.judge_id === judgeId && s.participant_id === row.participant.id && s.criteria_id === c.id);
                                    return (
                                        <td key={c.id} className="px-4 py-3 text-center text-slate-600">
                                            {s ? Number(s.score).toFixed(2) : "—"}
                                        </td>
                                    );
                                });
                            }
                        })()}
                        {(() => {
                             // Calculate total again for this judge
                             const originalAward = selectedAwardResult.award;
                             let criteriaIds: number[] = [];
                             const rawIds = originalAward?.criteria_ids;
 
                             if (Array.isArray(rawIds)) {
                               criteriaIds = rawIds.map(id => Number(id));
                             } else if (typeof rawIds === 'string') {
                               const s = rawIds as string;
                               if (s.startsWith('{') && s.endsWith('}')) {
                                 criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
                               } else {
                                 criteriaIds = s.split(',').map(n => Number(n.trim()));
                               }
                             } else if (originalAward?.criteria_id) {
                               criteriaIds = [Number(originalAward.criteria_id)];
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
                             
                             const judgeId = selectedJudgeForBreakdown!;
                             let total = 0;
                             let hasVal = false;
                             for (const cId of criteriaIds) {
                                 const s = scores.find(s => s.judge_id === judgeId && s.participant_id === row.participant.id && s.criteria_id === cId);
                                 if (s) {
                                     total += Number(s.score);
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

      {isScoringModalOpen && activeContest && currentParticipant && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div
            className="flex w-full max-w-3xl max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl"
            style={
              contestLayoutTheme?.modalBodyBg
                ? {
                    backgroundColor: hexWithOpacity(
                      contestLayoutTheme.modalBodyBg,
                      (contestLayoutTheme.modalBodyBgOpacity ?? 100) / 100,
                    ),
                  }
                : undefined
            }
          >
            <div
              className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4"
              style={
                contestLayoutTheme?.modalHeaderBg
                  ? {
                      backgroundColor: hexWithOpacity(
                        contestLayoutTheme.modalHeaderBg,
                        (contestLayoutTheme.modalHeaderBgOpacity ?? 100) / 100,
                      ),
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E2F3EC] text-lg font-semibold text-[#1F4D3A] shadow-sm md:h-24 md:w-24 md:text-xl">
                  {currentParticipant.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentParticipant.avatar_url}
                      alt={currentParticipant.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    participantInitials(currentParticipant.full_name)
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm font-semibold text-slate-800 md:text-base">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                      style={
                        contestLayoutTheme?.modalHeaderSecondaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderSecondaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderSecondaryTextColorOpacity ?? 100) /
                                  100,
                              ),
                            }
                          : undefined
                      }
                    >
                      Participant
                    </span>
                    <span
                      className="text-sm md:text-base"
                      style={
                        contestLayoutTheme?.modalHeaderPrimaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderPrimaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderPrimaryTextColorOpacity ?? 100) / 100,
                              ),
                            }
                          : undefined
                      }
                    >
                      {currentParticipant.full_name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-normal md:text-sm text-slate-500">
                    <span
                      style={
                        contestLayoutTheme?.modalHeaderSecondaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderSecondaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderSecondaryTextColorOpacity ?? 100) /
                                  100,
                              ),
                            }
                          : undefined
                      }
                    >
                      Category:
                    </span>
                    <span
                      style={
                        contestLayoutTheme?.modalHeaderPrimaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderPrimaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderPrimaryTextColorOpacity ?? 100) / 100,
                              ),
                            }
                          : undefined
                      }
                    >
                      {participantCategoryName(currentParticipant)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-normal md:text-sm text-slate-500">
                    <span
                      style={
                        contestLayoutTheme?.modalHeaderSecondaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderSecondaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderSecondaryTextColorOpacity ?? 100) /
                                  100,
                              ),
                            }
                          : undefined
                      }
                    >
                      Contest:
                    </span>
                    <span
                      style={
                        contestLayoutTheme?.modalHeaderPrimaryTextColor
                          ? {
                              color: hexWithOpacity(
                                contestLayoutTheme.modalHeaderPrimaryTextColor,
                                (contestLayoutTheme
                                  .modalHeaderPrimaryTextColorOpacity ?? 100) / 100,
                              ),
                            }
                          : undefined
                      }
                    >
                      {activeContest.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-slate-500 md:text-sm">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                    style={
                      contestLayoutTheme?.modalHeaderSecondaryTextColor
                        ? {
                            color: hexWithOpacity(
                              contestLayoutTheme.modalHeaderSecondaryTextColor,
                              (contestLayoutTheme
                                .modalHeaderSecondaryTextColorOpacity ?? 100) / 100,
                            ),
                          }
                        : undefined
                    }
                  >
                    Contestant No.
                  </div>
                  <div
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-white px-4 py-1 text-lg font-semibold tracking-[0.16em] shadow-sm md:text-2xl"
                    style={{
                      ...(contestLayoutTheme?.modalContestantBadgeBg
                        ? {
                            backgroundColor: hexWithOpacity(
                              contestLayoutTheme.modalContestantBadgeBg,
                              (contestLayoutTheme.modalContestantBadgeBgOpacity ??
                                100) / 100,
                            ),
                          }
                        : {}),
                      ...(contestLayoutTheme?.modalContestantBadgeTextColor
                        ? {
                            color: hexWithOpacity(
                              contestLayoutTheme.modalContestantBadgeTextColor,
                              (contestLayoutTheme
                                .modalContestantBadgeTextColorOpacity ?? 100) /
                                100,
                            ),
                          }
                        : {}),
                    }}
                  >
                    {currentParticipant.contestant_number}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScoringModalOpen(false)}
                  className="ml-2 rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] shadow-sm"
                  style={{
                    ...(contestLayoutTheme?.modalSecondaryButtonBg
                      ? {
                          backgroundColor: hexWithOpacity(
                            contestLayoutTheme.modalSecondaryButtonBg,
                            (contestLayoutTheme.modalSecondaryButtonBgOpacity ??
                              100) / 100,
                          ),
                        }
                      : { backgroundColor: "#ffffff" }),
                    ...(contestLayoutTheme?.modalSecondaryButtonTextColor
                      ? {
                          color: hexWithOpacity(
                            contestLayoutTheme.modalSecondaryButtonTextColor,
                            (contestLayoutTheme
                              .modalSecondaryButtonTextColorOpacity ?? 100) / 100,
                          ),
                        }
                      : { color: "#475569" }),
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-5 pt-4">
              <div
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
                style={
                  contestLayoutTheme?.scoringTableBg
                    ? {
                        backgroundColor: hexWithOpacity(
                          contestLayoutTheme.scoringTableBg,
                          (contestLayoutTheme.scoringTableBgOpacity ?? 100) / 100,
                        ),
                      }
                    : undefined
                }
              >
                <table className="min-w-full border-collapse text-left text-sm text-slate-800">
                  <thead
                    className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm"
                    style={{
                      ...(contestLayoutTheme?.criteriaHeaderBg
                        ? {
                            backgroundColor: hexWithOpacity(
                              contestLayoutTheme.criteriaHeaderBg,
                              (contestLayoutTheme.criteriaHeaderBgOpacity ?? 100) /
                                100,
                            ),
                          }
                        : {}),
                      ...(contestLayoutTheme?.criteriaHeaderTextColor
                        ? {
                            color: hexWithOpacity(
                              contestLayoutTheme.criteriaHeaderTextColor,
                              (contestLayoutTheme.criteriaHeaderTextColorOpacity ??
                                100) /
                                100,
                            ),
                          }
                        : {}),
                      ...(contestLayoutTheme?.criteriaHeaderFontSize
                        ? {
                            fontSize: `${contestLayoutTheme.criteriaHeaderFontSize}px`,
                          }
                        : {}),
                      ...(contestLayoutTheme?.criteriaHeaderFontFamily &&
                      contestLayoutTheme.criteriaHeaderFontFamily !== "system"
                        ? {
                            fontFamily:
                              contestLayoutTheme.criteriaHeaderFontFamily === "sans"
                                ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                : contestLayoutTheme.criteriaHeaderFontFamily ===
                                    "serif"
                                  ? "Georgia, 'Times New Roman', serif"
                                  : contestLayoutTheme.criteriaHeaderFontFamily ===
                                      "mono"
                                    ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                    : undefined,
                          }
                        : {}),
                    }}
                  >
                    <tr>
                      <th className="px-4 py-3 font-medium">Criteria</th>
                      <th className="px-4 py-3 text-right font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriaByCategory.map(([rawCategoryName, items]) => {
                      const trimmed = rawCategoryName.trim();
                      const isUncategorized = trimmed === "";
                      const headerLabel = isUncategorized ? "" : trimmed;

                      // Calculate subtotal for this category
                      const categorySubtotal = items.reduce((sum, criteria) => {
                        const key = `${currentParticipant.id}-${criteria.id}`;
                        const value = scoreInputs[key];
                        const numericValue = value ? Number.parseFloat(value) : 0;
                        return sum + (Number.isNaN(numericValue) ? 0 : numericValue);
                      }, 0);

                      return (
                        <Fragment key={trimmed || "uncategorized"}>
                          <tr
                            className="bg-[#F9FAFB]"
                            style={
                              contestLayoutTheme?.scoringCategoryRowBg
                                ? {
                                    backgroundColor: hexWithOpacity(
                                      contestLayoutTheme.scoringCategoryRowBg,
                                      (contestLayoutTheme
                                        .scoringCategoryRowBgOpacity ?? 100) / 100,
                                    ),
                                  }
                                : undefined
                            }
                          >
                            <td
                              colSpan={2}
                              className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span>{headerLabel || "\u00A0"}</span>
                              </div>
                            </td>
                          </tr>
                          {items.map((criteria) => {
                            const key = `${currentParticipant.id}-${criteria.id}`;
                            const value = scoreInputs[key] ?? "";

                            return (
                              <tr
                                key={criteria.id}
                                className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-4 py-3 align-middle">
                                  <div
                                    className="text-sm text-slate-800"
                                    style={{
                                      ...(contestLayoutTheme?.criteriaTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              contestLayoutTheme.criteriaTextColor,
                                              (contestLayoutTheme
                                                .criteriaTextColorOpacity ?? 100) / 100,
                                            ),
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.criteriaTextFontSize
                                        ? {
                                            fontSize: `${contestLayoutTheme.criteriaTextFontSize}px`,
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.criteriaTextFontFamily &&
                                      contestLayoutTheme.criteriaTextFontFamily !==
                                        "system"
                                        ? {
                                            fontFamily:
                                              contestLayoutTheme
                                                .criteriaTextFontFamily === "sans"
                                                ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                                : contestLayoutTheme
                                                      .criteriaTextFontFamily === "serif"
                                                  ? "Georgia, 'Times New Roman', serif"
                                                  : contestLayoutTheme
                                                        .criteriaTextFontFamily ===
                                                        "mono"
                                                    ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                    : undefined,
                                          }
                                        : {}),
                                    }}
                                  >
                                    <div className="font-medium">
                                      {criteria.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {activeContestScoringType === "points"
                                        ? `${criteria.percentage} pts`
                                        : `${criteria.percentage}% weight`}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                  <div className="flex items-center justify-end gap-2">
                                    <input
                                      type="number"
                                      min={0}
                                      max={
                                        activeContestScoringType === "points"
                                          ? criteria.percentage
                                          : 100
                                      }
                                      step={0.01}
                                      value={value}
                                      onChange={(event) =>
                                        handleScoreChange(
                                          currentParticipant.id,
                                          criteria.id,
                                          event.target.value,
                                        )
                                      }
                                      disabled={
                                        isSavingParticipantScores ||
                                        !canEditCriteria(activeContest.id, criteria.id)
                                      }
                                      className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      style={{
                                        ...(contestLayoutTheme?.scoreInputBg
                                          ? {
                                              backgroundColor: hexWithOpacity(
                                                contestLayoutTheme.scoreInputBg,
                                                (contestLayoutTheme
                                                  .scoreInputBgOpacity ?? 100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(contestLayoutTheme?.scoreInputBorderColor
                                          ? {
                                              borderColor: hexWithOpacity(
                                                contestLayoutTheme.scoreInputBorderColor,
                                                (contestLayoutTheme
                                                  .scoreInputBorderColorOpacity ?? 100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                        ...(contestLayoutTheme?.scoreInputTextColor
                                          ? {
                                              color: hexWithOpacity(
                                                contestLayoutTheme.scoreInputTextColor,
                                                (contestLayoutTheme
                                                  .scoreInputTextColorOpacity ?? 100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                      }}
                                    />
                                    <span className="text-xs text-slate-400">
                                      /
                                      {activeContestScoringType === "points"
                                        ? criteria.percentage
                                        : 100}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {!isUncategorized && (
                            <tr className="bg-[#F5F7FF]">
                              <td
                                className="px-4 py-3 text-right text-sm font-semibold text-slate-700"
                              >
                                Total
                              </td>
                              <td
                                className="px-4 py-3 text-right text-sm font-semibold text-[#1F4D3A]"
                              >
                                {categorySubtotal > 0 ? categorySubtotal.toFixed(2) : "—"}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                  {/* Total score row removed */}
                </table>
              </div>

              <div
                className="sticky bottom-0 mt-5 flex items-center justify-end gap-3 bg-white pt-3 pb-4"
                style={
                  contestLayoutTheme?.modalFooterBg
                    ? {
                        backgroundColor: hexWithOpacity(
                          contestLayoutTheme.modalFooterBg,
                          (contestLayoutTheme.modalFooterBgOpacity ?? 100) / 100,
                        ),
                      }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={handleSaveCurrentParticipant}
                  disabled={
                    isSavingParticipantScores ||
                    !activeContestCriteria.some((criteria) =>
                      canEditCriteria(activeContest.id, criteria.id),
                    )
                  }
                  className="rounded-full border px-5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    ...(contestLayoutTheme?.modalSecondaryButtonBg
                      ? {
                          backgroundColor: hexWithOpacity(
                            contestLayoutTheme.modalSecondaryButtonBg,
                            (contestLayoutTheme.modalSecondaryButtonBgOpacity ??
                              100) / 100,
                          ),
                        }
                      : { backgroundColor: "#ffffff" }),
                    ...(contestLayoutTheme?.modalSecondaryButtonTextColor
                      ? {
                          color: hexWithOpacity(
                            contestLayoutTheme.modalSecondaryButtonTextColor,
                            (contestLayoutTheme
                              .modalSecondaryButtonTextColorOpacity ?? 100) / 100,
                          ),
                        }
                      : { color: "#14532d" }),
                    borderColor: "#1F4D3A33",
                  }}
                >
                  {isSavingParticipantScores ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenSubmitAllModal();
                    setIsScoringModalOpen(false);
                  }}
                  disabled={
                    isSavingParticipantScores ||
                    !activeContestCriteria.some((criteria) =>
                      canEditCriteria(activeContest.id, criteria.id),
                    )
                  }
                  className="rounded-full px-5 py-2 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    ...(contestLayoutTheme?.modalPrimaryButtonBg
                      ? {
                          backgroundColor: hexWithOpacity(
                            contestLayoutTheme.modalPrimaryButtonBg,
                            (contestLayoutTheme.modalPrimaryButtonBgOpacity ?? 100) /
                              100,
                          ),
                        }
                      : { backgroundColor: "#14532d" }),
                    ...(contestLayoutTheme?.modalPrimaryButtonTextColor
                      ? {
                          color: hexWithOpacity(
                            contestLayoutTheme.modalPrimaryButtonTextColor,
                            (contestLayoutTheme
                              .modalPrimaryButtonTextColorOpacity ?? 100) / 100,
                          ),
                        }
                      : { color: "#ffffff" }),
                  }}
                >
                  {isContestSubmitted(activeContest.id) ? "Submitted" : "Submit all"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubmitAllModalOpen && activeContest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#1F4D3A1F] bg-white shadow-xl">
            <div className="border-b border-[#E2E8F0] px-6 py-4">
              <div className="text-base font-semibold text-[#1F4D3A]">
                Submit all scores?
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {submitAllDivisionName && submitAllDivisionName.trim().length > 0
                  ? `Are you sure you want to submit all scores for every contestant in the ${submitAllDivisionName} division of this contest? This will save all current scores for that division. Once all divisions are submitted, you will no longer be able to edit scores.`
                  : "Are you sure you want to submit all scores for every contestant in this contest? This will save all current scores and you may no longer be able to edit them after submission."}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (isSubmittingAll) {
                    return;
                  }
                  setIsSubmitAllModalOpen(false);
                }}
                className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-xs text-slate-600 hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitAll}
                disabled={isSubmittingAll}
                className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-xs font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingAll
                  ? "Submitting..."
                  : submitAllDivisionName && submitAllDivisionName.trim().length > 0
                    ? `Submit all (${submitAllDivisionName})`
                    : "Submit all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
