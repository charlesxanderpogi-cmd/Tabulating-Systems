"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type EventRow = {
  id: number;
  name: string;
  code: string;
  year: number;
  is_active: boolean;
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

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  const raw = String(value ?? "").trim();
  if (!raw) return Number.POSITIVE_INFINITY;
  const n = Number.parseFloat(raw.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function hexWithOpacity(hex: string, opacity?: number) {
  const sanitized = hex.replace("#", "").trim();
  const alpha = opacity !== undefined ? clampNumber(opacity, 0, 1) : 1;
  if (sanitized.length !== 6) {
    return hex;
  }
  const r = Number.parseInt(sanitized.slice(0, 2), 16);
  const g = Number.parseInt(sanitized.slice(2, 4), 16);
  const b = Number.parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveThemeFontFamily(value?: string) {
  if (!value || value === "system") return undefined;
  if (value === "sans") {
    return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }
  if (value === "serif") {
    return "Georgia, 'Times New Roman', serif";
  }
  if (value === "mono") {
    return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
  }
  return undefined;
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
  card_url: string | null;
  gallery_photos: string | null;
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

type JudgeMessageRow = {
  id: number;
  event_id: number;
  judge_id: number | null;
  title: string | null;
  body: string;
  created_at: string;
  is_visible?: boolean | null;
};

type JudgeMessageSeenRow = {
  message_id: number;
};

type PostgrestResult = {
  data: unknown;
  error: { message?: string } | null;
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
  const [activeAwardFilterId, setActiveAwardFilterId] = useState<number | "all">("all");
  const [assignedContestIds, setAssignedContestIds] = useState<number[]>([]);
  const [screenVideoUrl, setScreenVideoUrl] = useState<string | null>(null);
  const [isScreenActive, setIsScreenActive] = useState<boolean>(false);
  const judgeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (screenVideoUrl) {
      console.log("Judge Loading Video URL:", screenVideoUrl);
      if (judgeVideoRef.current) {
        judgeVideoRef.current.load();
      }
    }
  }, [screenVideoUrl]);

  const [activeContestId, setActiveContestId] = useState<number | null>(null);
  const [scoringDivisionFilterId, setScoringDivisionFilterId] = useState<
    number | "all"
  >("all");
  const [rankingDivisionFilterId, setRankingDivisionFilterId] = useState<
    number | "all"
  >("all");
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingParticipantScores] = useState(false);
  const [isSubmittingParticipant, setIsSubmittingParticipant] = useState(false);
  const [, setSubmittedContestIds] = useState<number[]>([]);
  const [judgeScoringPermissions, setJudgeScoringPermissions] = useState<
    JudgeScoringPermissionRow[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState<string | null>(null);
  const [, setModalError] = useState<string | null>(null);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [contestLayoutTemplateKey, setContestLayoutTemplateKey] =
    useState<ContestLayoutTemplateKey>("standard");
  const [contestLayoutTheme, setContestLayoutTheme] =
    useState<ContestLayoutTheme | null>(null);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [gallerySlideIndex, setGallerySlideIndex] = useState(0);
  const [messageQueue, setMessageQueue] = useState<JudgeMessageRow[]>([]);
  const [activeMessage, setActiveMessage] = useState<JudgeMessageRow | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "tabulation" | "monitoring">("score");
  const [selectedMonitoringParticipantId, setSelectedMonitoringParticipantId] =
    useState<number | null>(null);
  const [lastSubmittedParticipantId, setLastSubmittedParticipantId] = useState<number | null>(null);
  const activeContestIdRef = useRef<number | null>(null);
  const isCriteriaSaved = useCallback(
    (participantId: number, criteriaId: number) => {
      if (!judge) return false;
      return scores.some(
        (s) =>
          s.judge_id === judge.id &&
          s.participant_id === participantId &&
          s.criteria_id === criteriaId,
      );
    },
    [scores, judge],
  );
  type SupabaseClient = ReturnType<typeof getSupabaseClient>;
  type RealtimeChannel = ReturnType<SupabaseClient["channel"]>;
  const scoresBroadcastRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;
    if (!event) return;
    const supabase = getSupabaseClient();
    const ch = supabase
      .channel(`event-${event.id}-scores`, {
        config: { broadcast: { ack: true } },
      })
      .on("broadcast", { event: "score-submitted" }, async () => {
        if (!judge) return;
        if (assignedContestIds.length === 0) return;
        try {
          const [totalsRes, scoresRes] = await Promise.all([
            supabase
              .from("judge_participant_total")
              .select("id, judge_id, participant_id, contest_id, total_score, created_at")
              .in("contest_id", assignedContestIds),
            supabase
              .from("score")
              .select(
                "id, judge_id, participant_id, criteria_id, score, created_at, criteria!inner(contest_id)",
              )
              .in("criteria.contest_id", assignedContestIds),
          ]);
          if (totalsRes.data) {
            setJudgeTotals(totalsRes.data as JudgeParticipantTotalRow[]);
          }
          if (scoresRes.data) {
            setScores(scoresRes.data as unknown as ScoreRow[]);
          }
        } catch {}
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[JUDGE-SCORES] Connected to scores channel');
        } else if (status === 'CHANNEL_ERROR' || err) {
          console.warn('[JUDGE-SCORES] Channel error:', err?.message || status);
        } else if (status === 'CLOSED') {
          console.log('[JUDGE-SCORES] Channel closed');
        }
      });
    scoresBroadcastRef.current = ch;
    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {}
      scoresBroadcastRef.current = null;
    };
  }, [event, assignedContestIds, judge]);

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

    const supabase = getSupabaseClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let scoringPermChannel: ReturnType<typeof supabase.channel> | null = null;
    let broadcastChannel: ReturnType<typeof supabase.channel> | null = null;
    let messageChannel: ReturnType<typeof supabase.channel> | null = null;

    const loadJudgeData = async () => {
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
        if (role !== "judge" || !username) {
          setError("No judge session found. Please sign in again.");
          setIsLoading(false);
          router.push("/");
          return;
        }
        storedUsername = username;
      } catch {
        setError("No judge session found. Please sign in again.");
        setIsLoading(false);
        router.push("/");
        return;
      }

      if (!storedUsername) {
        setError("No judge session found. Please sign in again.");
        setIsLoading(false);
        router.push("/");
        return;
      }

      const { data: judgeRows, error: judgeError } = await supabase
        .from("user_judge")
        .select("id, event_id, full_name, username, role, avatar_url, created_at")
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

      try {
        const visibilityMissing = (message: string) =>
          message.includes("judge_message") &&
          message.includes("is_visible") &&
          (message.includes("schema cache") ||
            message.includes("Could not find") ||
            message.includes("does not exist"));

        let result = (await supabase
          .from("judge_message")
          .select<string>(
            "id, event_id, judge_id, title, body, created_at, is_visible",
          )
          .eq("event_id", judgeRow.event_id)
          .or(`judge_id.is.null,judge_id.eq.${judgeRow.id}`)
          .eq("is_visible", true)
          .order("created_at", { ascending: false })
          .limit(50)) as unknown as PostgrestResult;

        if (result.error && visibilityMissing(result.error.message ?? "")) {
          result = (await supabase
            .from("judge_message")
            .select<string>("id, event_id, judge_id, title, body, created_at")
            .eq("event_id", judgeRow.event_id)
            .or(`judge_id.is.null,judge_id.eq.${judgeRow.id}`)
            .order("created_at", { ascending: false })
            .limit(50)) as unknown as PostgrestResult;
        }

        if (
          !result.error &&
          result.data &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const rows = result.data as JudgeMessageRow[];
          let unseen = rows;

          try {
            const ids = rows.map((m) => m.id);
            const { data: seenRows, error: seenError } = await supabase
              .from("judge_message_seen")
              .select("message_id")
              .eq("judge_id", judgeRow.id)
              .in("message_id", ids);

            if (!seenError && seenRows && Array.isArray(seenRows)) {
              const seenSet = new Set(
                (seenRows as JudgeMessageSeenRow[]).map((r) =>
                  Number(r.message_id),
                ),
              );
              unseen = rows.filter((m) => !seenSet.has(m.id));
            } else {
              const lastSeenRaw =
                typeof window !== "undefined"
                  ? window.localStorage.getItem(
                      `judge_last_seen_message_${judgeRow.id}`,
                    )
                  : null;
              const lastSeenId = lastSeenRaw
                ? Number.parseInt(lastSeenRaw, 10)
                : null;
              unseen = rows.filter((m) => (lastSeenId ? m.id > lastSeenId : true));
            }
          } catch {
            const lastSeenRaw =
              typeof window !== "undefined"
                ? window.localStorage.getItem(
                    `judge_last_seen_message_${judgeRow.id}`,
                  )
                : null;
            const lastSeenId = lastSeenRaw
              ? Number.parseInt(lastSeenRaw, 10)
              : null;
            unseen = rows.filter((m) => (lastSeenId ? m.id > lastSeenId : true));
          }

          if (unseen.length > 0) {
            const ordered = [...unseen].sort((a, b) => a.id - b.id);
            setMessageQueue(ordered);
            setActiveMessage(ordered[0]);
          }
        }
      } catch {}

      const totalQuery =
        supabase
          .from("judge_participant_total")
          .select(
            "id, judge_id, participant_id, contest_id, total_score, created_at, contest!inner(event_id)",
          )
          .eq("contest.event_id", judgeRow.event_id);

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
          .select("id, event_id, full_name, username, role, avatar_url, created_at")
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

      // Set up event status listener BEFORE checking if event is active
      // This allows judges to see real-time updates when event is activated
      channel = supabase
        .channel("judge-changes", {
          config: {
            broadcast: { self: true },
            presence: { key: `judge-${judgeRow.id}` },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "event",
            filter: `id=eq.${judgeRow.event_id}`,
          },
          (payload) => {
            console.log("[REALTIME] Event UPDATE received:", payload);
            const newRow = payload.new as EventRow;
            console.log("[REALTIME] Event is_active changed to:", newRow.is_active);
            setEvent(newRow);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contest",
            filter: `event_id=eq.${judgeRow.event_id}`,
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
          "broadcast",
          { event: "deactivate-event" },
          (payload) => {
            console.log("[REALTIME] Event deactivation broadcast received:", payload);
            if (payload.payload?.event_id === judgeRow.event_id) {
              alert("The event has been deactivated and is no longer available.");
              router.push("/judge");
            }
          },
        )
        .on(
          "broadcast",
          { event: "activate-event" },
          (payload) => {
            console.log("[REALTIME] Event activation broadcast received:", payload);
            if (payload.payload?.event_id === judgeRow.event_id) {
              console.log("[REALTIME] Event has been activated, UI will refresh automatically");
            }
          },
        );

      if (!event.is_active) {
        // Subscribe to event status listener even if event is inactive
        channel.subscribe((status, err) => {
          console.log('Event status channel subscription status:', status, err);
        });
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
              "id, contest_id, division_id, full_name, contestant_number, created_at, avatar_url, card_url, gallery_photos, gender, team_id",
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

      // Add remaining listeners to the existing judge-changes channel  
      channel
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
        .subscribe((status, err) => {
          console.log('Main judge-changes channel status:', status, err);
        });

      // Separate channel for judge_scoring_permission with dedicated listener
      scoringPermChannel = supabase
        .channel(`judge-scoring-perms-${judgeRow.event_id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "judge_scoring_permission",
          },
          async (payload) => {
            // Re-fetch all permissions on any change (DELETE events may not include full row data)
            console.log('[REALTIME] Judge scoring permission change detected:', payload.eventType, payload);
            try {
              const { data, error } = await supabase
                .from("judge_scoring_permission")
                .select("judge_id, contest_id, criteria_id, can_edit")
                .eq("judge_id", judgeRow.id);
              if (!error && data) {
                console.log('[REALTIME] Updated judge scoring permissions from postgres_changes');
                setJudgeScoringPermissions(data as JudgeScoringPermissionRow[]);
              } else {
                console.warn('[REALTIME] Error fetching permissions:', error);
              }
            } catch (error) {
              console.warn('[REALTIME] Failed to refresh permissions from postgres_changes:', error);
            }
          },
        )
        .subscribe((status, err) => {
          console.log('[REALTIME] Judge scoring permission channel status:', status, err);
        });

      // Listen for broadcast notifications from admin about permission updates
      broadcastChannel = supabase
        .channel(`permissions-update-${judgeRow.event_id}`, { config: { broadcast: { ack: true } } })
        .on('broadcast', { event: 'permissions-updated' }, async (message) => {
          console.log('[BROADCAST-LISTENER] Permission update broadcast received:', message.payload);
          try {
            const { data, error } = await supabase
              .from("judge_scoring_permission")
              .select("judge_id, contest_id, criteria_id, can_edit")
              .eq("judge_id", judgeRow.id);
            if (!error && data) {
              console.log('[BROADCAST-LISTENER] Updated permissions from broadcast notification');
              setJudgeScoringPermissions(data as JudgeScoringPermissionRow[]);
            }
          } catch (error) {
            console.warn('[BROADCAST-LISTENER] Failed to refresh permissions after broadcast:', error);
          }
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('[BROADCAST-LISTENER] Broadcast channel connected');
          } else if (status === 'CHANNEL_ERROR' || err) {
            console.warn('[BROADCAST-LISTENER] Broadcast channel error:', err?.message || status);
          } else if (status === 'CLOSED') {
            console.log('[BROADCAST-LISTENER] Broadcast channel closed');
          }
        });

      messageChannel = supabase
        .channel(`judge-messages-${judgeRow.event_id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "judge_message" },
          (payload) => {
            const newRow = payload.new as JudgeMessageRow;
            if (newRow.event_id !== judgeRow.event_id) return;
            if (newRow.judge_id !== null && newRow.judge_id !== judgeRow.id) return;
            if (newRow.is_visible === false) return;
            setMessageQueue((prev) => {
              if (prev.some((m) => m.id === newRow.id)) return prev;
              const next = [...prev, newRow].sort((a, b) => a.id - b.id);
              return next;
            });
            setActiveMessage((prev) => prev ?? newRow);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "judge_message" },
          async (payload) => {
            const updatedRow = payload.new as JudgeMessageRow;
            if (updatedRow.event_id !== judgeRow.event_id) return;
            if (updatedRow.judge_id !== null && updatedRow.judge_id !== judgeRow.id) return;

            const isVisible = updatedRow.is_visible !== false;

            if (!isVisible) {
              setMessageQueue((prev) => {
                const next = prev.filter((m) => m.id !== updatedRow.id);
                setActiveMessage((current) => {
                  if (!current) return next.length > 0 ? next[0] : null;
                  if (current.id !== updatedRow.id) return current;
                  return next.length > 0 ? next[0] : null;
                });
                return next;
              });
              return;
            }

            setMessageQueue((prev) => {
              const exists = prev.some((m) => m.id === updatedRow.id);
              if (!exists) return prev;
              return prev.map((m) => (m.id === updatedRow.id ? updatedRow : m));
            });
            setActiveMessage((current) =>
              current?.id === updatedRow.id ? updatedRow : current,
            );

            try {
              const { data: seenRows, error: seenError } = await supabase
                .from("judge_message_seen")
                .select("message_id")
                .eq("judge_id", judgeRow.id)
                .eq("message_id", updatedRow.id)
                .limit(1);

              if (!seenError && seenRows && Array.isArray(seenRows) && seenRows.length > 0) {
                return;
              }
            } catch {}

            setMessageQueue((prev) => {
              if (prev.some((m) => m.id === updatedRow.id)) return prev;
              const next = [...prev, updatedRow].sort((a, b) => a.id - b.id);
              return next;
            });
            setActiveMessage((prev) => prev ?? updatedRow);
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "judge_message" },
          (payload) => {
            const oldRow = payload.old as Partial<JudgeMessageRow>;
            const deletedId = typeof oldRow?.id === "number" ? oldRow.id : null;
            if (!deletedId) return;
            setMessageQueue((prev) => {
              const next = prev.filter((m) => m.id !== deletedId);
              setActiveMessage((current) => {
                if (!current) return next.length > 0 ? next[0] : null;
                if (current.id !== deletedId) return current;
                return next.length > 0 ? next[0] : null;
              });
              return next;
            });
          },
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("[REALTIME] Judge messages channel connected");
          } else if (status === "CHANNEL_ERROR" || err) {
            console.warn("[REALTIME] Judge messages channel error:", err?.message || status);
          }
        });

      setIsLoading(false);
    };

    loadJudgeData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (scoringPermChannel) {
        supabase.removeChannel(scoringPermChannel);
      }
      if (broadcastChannel) {
        supabase.removeChannel(broadcastChannel);
      }
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
    };
  }, [router]);

  // Screen Overlay Effect
  useEffect(() => {
    if (!judge) return;

    const supabase = getSupabaseClient();
    const eventId = judge.event_id;

    // Initial fetch
    supabase
      .from("event_screen")
      .select("video_url, is_active")
      .eq("event_id", eventId)
      .single()
      .then(({ data }) => {
        if (data) {
          const row = data as { video_url: string | null; is_active: boolean };
          setScreenVideoUrl(row.video_url);
          setIsScreenActive(row.is_active);
        } else {
          setScreenVideoUrl(null);
          setIsScreenActive(false);
        }
      });

    // Subscribe to changes
    const channel = supabase
      .channel(`screen-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_screen",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as { video_url: string | null; is_active: boolean };
            setScreenVideoUrl(newRow.video_url);
            setIsScreenActive(newRow.is_active);
          } else if (payload.eventType === "DELETE") {
             setScreenVideoUrl(null);
             setIsScreenActive(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [judge]);

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

    const supabase = getSupabaseClient();
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

  // Fallback polling and page visibility listener for permission changes
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !judge?.id) {
      return;
    }

    const supabase = getSupabaseClient();
    let cancelled = false;

    // Manual refresh function
    const refreshPermissions = async () => {
      if (cancelled || !judge?.id) return;
      try {
        console.log('[MANUAL-REFRESH] Checking permissions...');
        const { data, error } = await supabase
          .from("judge_scoring_permission")
          .select("judge_id, contest_id, criteria_id, can_edit")
          .eq("judge_id", judge.id);
        if (!error && data && JSON.stringify(data) !== JSON.stringify(judgeScoringPermissions)) {
          console.log('[MANUAL-REFRESH] Permission change detected, updating state');
          setJudgeScoringPermissions(data as JudgeScoringPermissionRow[]);
        }
      } catch (error) {
        console.warn('[MANUAL-REFRESH] Error refreshing permissions:', error);
      }
    };

    // Set up polling every 8 seconds
    const pollInterval = setInterval(refreshPermissions, 8000);

    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[PAGE-VISIBILITY] Page became visible, refreshing permissions');
        refreshPermissions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [judge?.id, judgeScoringPermissions]);

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

    if (activeTab === "score") {
      if (scoringDivisionFilterId !== "all") {
        forContest = forContest.filter(
          (participant) => participant.division_id === scoringDivisionFilterId,
        );
      }
    } else if (activeTab === "tabulation") {
      if (rankingDivisionFilterId !== "all") {
        forContest = forContest.filter(
          (participant) => participant.division_id === rankingDivisionFilterId,
        );
      }
    }

    return [...forContest].sort((a, b) => {
      const aNumber = parseNumber(a.contestant_number);
      const bNumber = parseNumber(b.contestant_number);

      if (aNumber !== bNumber) {
        return aNumber - bNumber;
      }

      return a.contestant_number.localeCompare(b.contestant_number);
    });
  }, [participants, activeContestId, scoringDivisionFilterId, rankingDivisionFilterId, activeTab]);

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

      let finalScore = 0;
      if (activeContestScoringType === "percentage") {
        finalScore = stats.count > 0 ? stats.sum / stats.count : 0;
      } else if (activeContestScoringType === "points") {
        finalScore = stats.sum;
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
        finalScore = sumRanks / judgeIdsForContest.length;
      }

      rows.push({
        participant,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        totalScore: Number(finalScore.toFixed(2)),
        rank: 0,
        judgeScores: stats.judgeScores,
      });
    }

    if (activeContestScoringType === "ranking") {
      rows.sort((a, b) => a.totalScore - b.totalScore);
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
    judgeTotals,
    categories,
    judge,
    teams,
    activeContestScoringType,
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

    // Use only the explicitly selected child criteria for award computation

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
  }, [selectedAwardResult, scores, judge, eventJudges]);

  const participantCategoryName = useCallback(
    (participant: ParticipantRow) => {
      const category = categories.find(
        (category) => category.id === participant.division_id,
      );
      return category ? category.name : "Uncategorized";
    },
    [categories],
  );

  const participantTeamName = useCallback(
    (participant: ParticipantRow) => {
      const team = teams.find((t) => t.id === participant.team_id);
      return team ? team.name : "—";
    },
    [teams],
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

  const scoringAvatarRef = useRef<HTMLButtonElement | null>(null);
  const [scoringAvatarSize, setScoringAvatarSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  useEffect(() => {
    const el = scoringAvatarRef.current;
    if (!el) return;
    const measure = () => {
      setScoringAvatarSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isScoringModalOpen]);

  const imageTransformFromUrl = (
    url: string | null,
    containerW?: number,
    containerH?: number,
  ): React.CSSProperties => {
    let scale = 1;
    let txPx = 0;
    let tyPx = 0;
    try {
      if (url) {
        const u = new URL(url);
        const tz = u.searchParams.get("tz");
        const txStr = u.searchParams.get("tx");
        const tyStr = u.searchParams.get("ty");
        const txpStr = u.searchParams.get("txp");
        const typStr = u.searchParams.get("typ");
        scale = tz ? Number(tz) : 1;
        if (txpStr && typStr && containerW && containerH) {
          txPx = Number(txpStr) * containerW;
          tyPx = Number(typStr) * containerH;
        } else {
          txPx = txStr ? Number(txStr) : 0;
          tyPx = tyStr ? Number(tyStr) : 0;
        }
      }
    } catch {}
    return { transform: `translate(${txPx}px, ${tyPx}px) scale(${scale})` };
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

      // 3. Fallback: No admin permissions set, always allow editing
      return true;
    },
    [judgeScoringPermissions],
  );

  const handleSubmitCurrentParticipant = async () => {
    if (!currentParticipant || !judge || !activeContest) {
      return;
    }

    setIsSubmittingParticipant(true);
    setModalError(null);
    setSuccess(null);

    try {
      // Allow partial submissions; any missing scores are treated as 0.
      for (const criteria of activeContestCriteria) {
        const key = `${currentParticipant.id}-${criteria.id}`;
        const value = scoreInputs[key];
        if (value === undefined || value === "") {
          continue;
        }
        const parsed = Number(value);
        const maxScore =
          activeContestScoringType === "points" ? criteria.percentage : 100;
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxScore) {
          setModalError(`Scores must be between 0 and ${maxScore}.`);
          setIsSubmittingParticipant(false);
          return;
        }
      }

      // Save all raw scores for this participant
      await Promise.all(
        activeContestCriteria.map((criteria) =>
          handleScoreBlur(currentParticipant.id, criteria.id),
        ),
      );

      // Calculate total score for this participant
      let total = 0;

      for (const criteria of activeContestCriteria) {
        const key = `${currentParticipant.id}-${criteria.id}`;
        const value = scoreInputs[key];
        const parsed = Number(value);

        if (!Number.isFinite(parsed)) continue;

        if (activeContestScoringType === "points") {
          total += parsed;
        } else {
          total += parsed * (criteria.percentage / 100);
        }
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Supabase is not configured.");
        setIsSubmittingParticipant(false);
        return;
      }

      const supabase = getSupabaseClient();

      // Delete existing total for this participant
      const { error: deleteError } = await supabase
        .from("judge_participant_total")
        .delete()
        .eq("judge_id", judge.id)
        .eq("contest_id", activeContest.id)
        .eq("participant_id", currentParticipant.id);

      if (deleteError) {
        setError(
          deleteError.message || "Unable to reset existing total score.",
        );
        setIsSubmittingParticipant(false);
        return;
      }

      // Insert new total for this participant
      const { error: totalError } = await supabase
        .from("judge_participant_total")
        .insert({
          judge_id: judge.id,
          participant_id: currentParticipant.id,
          contest_id: activeContest.id,
          total_score: Number(total.toFixed(2)),
        });

      if (totalError) {
        setError(
          totalError.message || "Unable to save total score.",
        );
        setIsSubmittingParticipant(false);
        return;
      }

      try {
        const ch = scoresBroadcastRef.current;
        if (ch) {
          await ch.send({
            type: "broadcast",
            event: "score-submitted",
            payload: {
              judgeId: judge.id,
              contestId: activeContest.id,
              participantId: currentParticipant.id,
              timestamp: Date.now(),
            },
          });
        }
      } catch {}

      // Update local state
      setJudgeTotals((previous) => {
        const filtered = previous.filter(
          (t) =>
            !(
              t.judge_id === judge.id &&
              t.participant_id === currentParticipant.id &&
              t.contest_id === activeContest.id
            ),
        );
        return [
          ...filtered,
          {
            id: Date.now(),
            judge_id: judge.id,
            participant_id: currentParticipant.id,
            contest_id: activeContest.id,
            total_score: Number(total.toFixed(2)),
            created_at: new Date().toISOString(),
          },
        ];
      });

      setLastSubmittedParticipantId(currentParticipant.id);
      setSuccess(
        `Score for ${currentParticipant.full_name} submitted to tabulation.`,
      );
    } finally {
      setIsSubmittingParticipant(false);
    }
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

    // Validate score doesn't exceed maximum
    if (value !== "" && value !== "-") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        const maxScore =
          activeContestScoringType === "points" ? criteria?.percentage ?? 100 : 100;

        if (parsed > maxScore) {
          setModalError(
            `Score cannot exceed ${maxScore}. Maximum allowed: ${maxScore} points.`,
          );
          return;
        }
        if (parsed < 0) {
          setModalError("Score cannot be negative.");
          return;
        }
        // Clear modal error if valid
        setModalError(null);
      }
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
      setModalError("Scores must be a valid number.");
      return;
    }

    const maxScore =
      activeContestScoringType === "points" ? criteria?.percentage ?? 100 : 100;

    if (parsed > maxScore) {
      setModalError(
        `Score cannot exceed ${maxScore}. Maximum allowed: ${maxScore} points.`,
      );
      return;
    }

    if (parsed < 0) {
      setModalError("Score cannot be negative.");
      return;
    }

    const scoreToSave = parsed;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setModalError("Supabase is not configured.");
      return;
    }

    setModalError(null);
    setSuccess(null);

    const supabase = getSupabaseClient();

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
        setModalError(error.message || "Unable to save score.");
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as ScoreRow;
        setScores((previous) => [...previous, created]);
        setSuccess("Score saved.");
        setModalError(null);
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
        setModalError(error.message || "Unable to update score.");
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as ScoreRow;
        setScores((previous) =>
          previous.map((score) => (score.id === updated.id ? updated : score)),
        );
        setSuccess("Score updated.");
        setModalError(null);
      }
    }
  };

  const handleSignOut = () => {
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("judge_username");
      }
      router.push("/");
    })();
  };

  const dismissActiveMessage = async () => {
    const current = activeMessage;
    if (!current) return;

    let saved = false;
    try {
      if (judge?.id) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.from("judge_message_seen").upsert(
          {
            judge_id: judge.id,
            message_id: current.id,
          },
          { onConflict: "judge_id,message_id" },
        );
        if (!error) saved = true;
      }
    } catch {}

    try {
      if (!saved && typeof window !== "undefined" && judge?.id) {
        window.localStorage.setItem(
          `judge_last_seen_message_${judge.id}`,
          String(current.id),
        );
      }
    } catch {}
    setMessageQueue((prev) => {
      const next = prev.filter((m) => m.id !== current.id);
      setActiveMessage(next.length > 0 ? next[0] : null);
      return next;
    });
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

  // Ensure an award is selected by default when viewing tabulation
  useEffect(() => {
    if (!event) return;
    if (activeAwardFilterId !== "all") return;
    const first = awards.find((a) => a.event_id === event.id && a.is_active) ?? null;
    if (first) {
      setActiveAwardFilterId(first.id);
    }
  }, [event, awards, activeAwardFilterId]);

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F1F5F9] text-slate-900">
      {/* Screen Overlay */}
      {isScreenActive && screenVideoUrl && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            key={screenVideoUrl}
            ref={judgeVideoRef}
            autoPlay
            loop
            playsInline
            controls={false}
            preload="auto"
            style={{ width: "100%", height: "100%" }}
            className="h-full w-full object-contain"
            onError={(e) => {
              const videoTarget = e.currentTarget;
              console.error("Judge screen video error details:", {
                code: videoTarget.error?.code,
                message: videoTarget.error?.message,
                src: videoTarget.currentSrc || videoTarget.src || screenVideoUrl
              });
            }}
          >
            {screenVideoUrl && (
              <source 
                src={screenVideoUrl} 
                type="video/mp4" 
                onError={() => {
                  console.error("Judge Source Error:", screenVideoUrl);
                }}
              />
            )}
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1F] blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1A] blur-[120px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="Tabulora"
              className="h-10 w-10 transition-transform duration-300 hover:scale-105"
            />
            <div>
              <div className="text-sm font-bold tracking-tight text-[#1F4D3A]">
                Tabulora
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Judge Console
              </div>
            </div>
          </div>

          <div className="hidden flex-1 justify-center px-8 sm:flex">
            <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100/50 p-1 text-[11px] font-bold sm:flex">
              <button
                type="button"
                onClick={() => setActiveTab("score")}
                className={
                  "rounded-xl px-5 py-2 transition-all duration-300 " +
                  (activeTab === "score"
                    ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                    : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")
                }
              >
                Scoring
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tabulation")}
                className={
                  "rounded-xl px-5 py-2 transition-all duration-300 " +
                  (activeTab === "tabulation"
                    ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                    : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")
                }
              >
                Ranking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("monitoring")}
                className={
                  "rounded-xl px-5 py-2 transition-all duration-300 " +
                  (activeTab === "monitoring"
                    ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                    : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")
                }
              >
                Monitoring
              </button>
            </nav>
          </div>

          <div className="ml-auto flex items-center justify-end gap-4">
            {judge && (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-500">
                  {judge.role === "chairman" ? "Chairman" : "Judge"} • @{judge.username}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="group flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 py-2 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
            >
              <span>Sign out</span>
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <div className="sm:hidden space-y-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {judge?.role === "chairman" ? "Chairman" : "Judge"} Dashboard
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {headerTitle}
            </h1>
          </div>
          <nav className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("score")}
              className={"flex-1 rounded-xl px-4 py-2 transition-all duration-300 " + (activeTab === "score"
                ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")}
            >
              Scoring
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tabulation")}
              className={"flex-1 rounded-xl px-4 py-2 transition-all duration-300 " + (activeTab === "tabulation"
                ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")}
            >
              Ranking
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monitoring")}
              className={"flex-1 rounded-xl px-4 py-2 transition-all duration-300 " + (activeTab === "monitoring"
                ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")}
            >
              Monitoring
            </button>
          </nav>
        </div>

        <div className="rounded-[32px] border border-white/40 bg-white/85 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
                  {event ? `Event: ${event.name}` : "No active event assigned"}
                </div>
                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-800">
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

            {/* success message removed from scoring page per requirement */}

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-1">
                <div className="flex flex-col gap-2 w-full max-w-md">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Contest
                  </span>
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
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
              </div>

              <div className="w-full rounded-[28px] border border-white/40 bg-white/80 p-6 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.10)] backdrop-blur-xl">
                {activeTab === "score" ? (
                  !activeContest ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
                      <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#1F4D3A] shadow-sm">
                        Scoring workspace
                      </div>
                      <p>Select a contest above to begin scoring participants.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="grid gap-4 md:grid-cols-1">
                          <div className="flex flex-col gap-2 w-full max-w-md">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Division filter
                          </span>
                          <select
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            value={
                              scoringDivisionFilterId === "all"
                                ? "all"
                                : String(scoringDivisionFilterId)
                            }
                            onChange={(event) => {
                              const value = event.target.value;
                              if (value === "all") {
                                setScoringDivisionFilterId("all");
                              } else {
                                setScoringDivisionFilterId(
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
                      </div>

                      <div
                        className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6"
                        style={
                          contestLayoutTheme?.workspaceBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  contestLayoutTheme.workspaceBg,
                                  (contestLayoutTheme.workspaceBgOpacity ?? 100) /
                                    100,
                                ),
                              }
                            : undefined
                        }
                      >
                        {activeContestParticipants.length === 0 ? (
                          <div className="text-sm text-slate-500">
                            No participants found for this contest.
                          </div>
                        ) : (contestLayoutTemplateKey as ContestLayoutTemplateKey) === "pageant" ? (
                          <div className="space-y-8">
                            {pageantGroups.map((group) => {
                              const labelLower = group.groupLabel.toLowerCase();

                              const baseContainerVariant =
                                labelLower === "female"
                                  ? "border-rose-100 bg-rose-50/60"
                                  : labelLower === "male"
                                    ? "border-sky-100 bg-sky-50/60"
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

                              const containerStyle =
                                labelLower === "female" && femaleBg
                                  ? {
                                      backgroundColor: hexWithOpacity(
                                        femaleBg,
                                        (contestLayoutTheme?.femaleGroupBgOpacity ??
                                          100) / 100,
                                      ),
                                    }
                                  : labelLower === "male" && maleBg
                                    ? {
                                        backgroundColor: hexWithOpacity(
                                          maleBg,
                                          (contestLayoutTheme?.maleGroupBgOpacity ??
                                            100) / 100,
                                        ),
                                      }
                                    : undefined;

                              const badgeStyle =
                                labelLower === "female" && femaleBadgeBg
                                  ? {
                                      backgroundColor: hexWithOpacity(
                                        femaleBadgeBg,
                                        (contestLayoutTheme?.femaleBadgeBgOpacity ??
                                          100) / 100,
                                      ),
                                      backgroundImage: "none",
                                    }
                                  : labelLower === "male" && maleBadgeBg
                                    ? {
                                        backgroundColor: hexWithOpacity(
                                          maleBadgeBg,
                                          (contestLayoutTheme?.maleBadgeBgOpacity ??
                                            100) / 100,
                                        ),
                                        backgroundImage: "none",
                                      }
                                    : undefined;

                              return (
                                <div
                                  key={group.groupLabel || "all"}
                                  className={`space-y-3 rounded-2xl border p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${baseContainerVariant}`}
                                  style={containerStyle}
                                >
                                  {group.groupLabel && (
                                    <div className="flex items-center justify-center">
                                      <div
                                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-[10px] font-semibold ${baseBadgeVariant}`}
                                        style={badgeStyle}
                                      >
                                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                                        <span>{group.groupLabel}</span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {group.items.map(({ participant, index }) => {
                                      return (
                                        <button
                                          key={participant.id}
                                          type="button"
                                          onClick={() => {
                                            setCurrentParticipantIndex(index);
                                            setIsScoringModalOpen(true);
                                          }}
                                          className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/95 p-3 text-[11px] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#1F4D3A] hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                                          style={
                                            contestLayoutTheme?.cardBg
                                              ? {
                                                  backgroundColor: hexWithOpacity(
                                                    contestLayoutTheme.cardBg,
                                                    (contestLayoutTheme.cardBgOpacity ?? 100) /
                                                      100,
                                                  ),
                                                }
                                              : undefined
                                          }
                                        >
                                          <div
                                            className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E3F2EA] via-white to-[#FDE68A] text-lg font-semibold text-[#1F4D3A]"
                                            style={
                                              contestLayoutTheme?.cardBg
                                                ? {
                                                    backgroundColor: hexWithOpacity(
                                                      contestLayoutTheme.cardBg,
                                                      (contestLayoutTheme.cardBgOpacity ?? 100) /
                                                        100,
                                                    ),
                                                    backgroundImage: "none",
                                                  }
                                                : undefined
                                            }
                                          >
                                            {(participant.card_url || participant.avatar_url) ? (
                                              <img
                                                src={participant.card_url || participant.avatar_url || ""}
                                                alt={participant.full_name}
                                                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                                style={imageTransformFromUrl(participant.card_url || participant.avatar_url || null)}
                                              />
                                            ) : (
                                              participantInitials(participant.full_name)
                                            )}
                                            <div
                                              className="pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur"
                                              style={{
                                                ...(contestLayoutTheme?.numberBadgeBg
                                                  ? {
                                                      backgroundColor: hexWithOpacity(
                                                        contestLayoutTheme.numberBadgeBg,
                                                        (contestLayoutTheme.numberBadgeBgOpacity ??
                                                          100) /
                                                          100,
                                                      ),
                                                    }
                                                  : {}),
                                                ...(contestLayoutTheme?.numberTextColor
                                                  ? {
                                                      color: hexWithOpacity(
                                                        contestLayoutTheme.numberTextColor,
                                                        (contestLayoutTheme.numberTextColorOpacity ??
                                                          100) /
                                                          100,
                                                      ),
                                                    }
                                                  : {}),
                                                ...(contestLayoutTheme?.numberFontSize
                                                  ? {
                                                      fontSize: `${contestLayoutTheme.numberFontSize}px`,
                                                    }
                                                  : {}),
                                                ...(contestLayoutTheme?.numberFontFamily
                                                  ? {
                                                      fontFamily: resolveThemeFontFamily(
                                                        contestLayoutTheme.numberFontFamily,
                                                      ),
                                                    }
                                                  : {}),
                                              }}
                                            >
                                              #{participant.contestant_number}
                                            </div>
                                          </div>
                                          <div className="w-full text-center">
                                            <div
                                              className="truncate text-[11px] font-semibold tracking-tight text-slate-800"
                                              style={{
                                                ...(contestLayoutTheme?.nameTextColor
                                                  ? {
                                                      color: hexWithOpacity(
                                                        contestLayoutTheme.nameTextColor,
                                                        (contestLayoutTheme.nameTextColorOpacity ??
                                                          100) /
                                                          100,
                                                      ),
                                                    }
                                                  : {}),
                                                ...(contestLayoutTheme?.nameFontSize
                                                  ? {
                                                      fontSize: `${contestLayoutTheme.nameFontSize}px`,
                                                    }
                                                  : {}),
                                                ...(contestLayoutTheme?.nameFontFamily
                                                  ? {
                                                      fontFamily: resolveThemeFontFamily(
                                                        contestLayoutTheme.nameFontFamily,
                                                      ),
                                                    }
                                                  : {}),
                                              }}
                                            >
                                              {participant.full_name}
                                            </div>
                                            <div className="truncate text-[10px] text-slate-500">
                                              {teams.find((team) => team.id === participant.team_id)?.name ?? "No team"}
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {activeContestParticipants.map((participant, index) => (
                              <button
                                key={participant.id}
                                type="button"
                                onClick={() => {
                                  setCurrentParticipantIndex(index);
                                  setIsScoringModalOpen(true);
                                }}
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/95 p-3 text-[11px] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#1F4D3A] hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                                style={
                                  contestLayoutTheme?.cardBg
                                    ? {
                                        backgroundColor: hexWithOpacity(
                                          contestLayoutTheme.cardBg,
                                          (contestLayoutTheme.cardBgOpacity ?? 100) /
                                            100,
                                        ),
                                      }
                                    : undefined
                                }
                              >
                                <div
                                  className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E3F2EA] via-white to-[#FDE68A] text-lg font-semibold text-[#1F4D3A]"
                                  style={
                                    contestLayoutTheme?.cardBg
                                      ? {
                                          backgroundColor: hexWithOpacity(
                                            contestLayoutTheme.cardBg,
                                            (contestLayoutTheme.cardBgOpacity ?? 100) /
                                              100,
                                          ),
                                          backgroundImage: "none",
                                        }
                                      : undefined
                                  }
                                >
                                  {(participant.card_url || participant.avatar_url) ? (
                                    <img
                                      src={participant.card_url || participant.avatar_url || ""}
                                      alt={participant.full_name}
                                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                      style={imageTransformFromUrl(participant.card_url || participant.avatar_url || null)}
                                    />
                                  ) : (
                                    participantInitials(participant.full_name)
                                  )}
                                  <div
                                    className="pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur"
                                    style={{
                                      ...(contestLayoutTheme?.numberBadgeBg
                                        ? {
                                            backgroundColor: hexWithOpacity(
                                              contestLayoutTheme.numberBadgeBg,
                                              (contestLayoutTheme.numberBadgeBgOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.numberTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              contestLayoutTheme.numberTextColor,
                                              (contestLayoutTheme.numberTextColorOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.numberFontSize
                                        ? {
                                            fontSize: `${contestLayoutTheme.numberFontSize}px`,
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.numberFontFamily
                                        ? {
                                            fontFamily: resolveThemeFontFamily(
                                              contestLayoutTheme.numberFontFamily,
                                            ),
                                          }
                                        : {}),
                                    }}
                                  >
                                    #{participant.contestant_number}
                                  </div>
                                </div>
                                <div className="w-full text-center">
                                  <div
                                    className="truncate text-[11px] font-semibold tracking-tight text-slate-800"
                                    style={{
                                      ...(contestLayoutTheme?.nameTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              contestLayoutTheme.nameTextColor,
                                              (contestLayoutTheme.nameTextColorOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.nameFontSize
                                        ? {
                                            fontSize: `${contestLayoutTheme.nameFontSize}px`,
                                          }
                                        : {}),
                                      ...(contestLayoutTheme?.nameFontFamily
                                        ? {
                                            fontFamily: resolveThemeFontFamily(
                                              contestLayoutTheme.nameFontFamily,
                                            ),
                                          }
                                        : {}),
                                    }}
                                  >
                                    {participant.full_name}
                                  </div>
                                  <div className="truncate text-[10px] text-slate-500">
                                    {teams.find((team) => team.id === participant.team_id)?.name ?? "No team"}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : activeTab === "tabulation" ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2 md:max-w-xl">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Division filter
                        </span>
                        <select
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          value={
                            rankingDivisionFilterId === "all"
                              ? "all"
                              : String(rankingDivisionFilterId)
                          }
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value === "all") {
                              setRankingDivisionFilterId("all");
                            } else {
                              setRankingDivisionFilterId(Number.parseInt(value, 10));
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
                      <div className="flex flex-col gap-2 md:max-w-xl">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Award
                        </span>
                        <select
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          value={String(activeAwardFilterId)}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value === "all") {
                              setActiveAwardFilterId("all");
                            } else {
                              setActiveAwardFilterId(Number.parseInt(value, 10));
                            }
                          }}
                          disabled={!activeContest}
                        >
                          <option value="all">Select an award</option>
                          {awardsForActiveContest.map((award) => (
                            <option key={award.id} value={award.id}>
                              {award.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    </div>

                    {!activeContest ? (
                      <div className="text-sm text-slate-500">
                        Select a contest above to view ranking.
                      </div>
                    ) : judgeTabulationRows.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No totals available yet for this contest.
                      </div>
                    ) : activeAwardFilterId === "all" ? (
                      <div className="text-sm text-slate-500">
                        Select an award above to view winners.
                      </div>
                    ) : awardRankingRows.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No award results available yet.
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                        <table className="min-w-full border-collapse text-left text-sm">
                          <thead className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-[#1F4D3A]">
                            <tr>
                              <th className="px-4 py-3 font-medium">College/University</th>
                              <th className="px-4 py-3 font-medium">Contestant</th>
                              <th className="px-4 py-3 text-right font-medium">Score</th>
                              <th className="px-4 py-3 text-right font-medium">Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {awardRankingRows
                              .filter((r) => r.criteriaTotal !== null)
                              .map((r) => (
                                <tr
                                  key={r.row.participant.id}
                                  className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                >
                                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                                    {r.row.teamName || "—"}
                                  </td>
                                  <td className="px-4 py-3 align-middle">
                                    <div className="text-sm font-semibold text-slate-800">
                                      {r.row.participant.full_name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Contestant #{r.row.participant.contestant_number}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 align-middle text-right text-sm text-slate-700">
                                    {typeof r.criteriaTotal === "number"
                                      ? r.criteriaTotal.toFixed(2)
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[#1F4D3A]">
                                    {r.rank ?? "—"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!activeContest ? (
                      <div className="text-sm text-slate-500">
                        Select a contest above to view monitoring.
                      </div>
                    ) : (
                      <div className="rounded-[28px] border border-slate-100 bg-white/70 p-6 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.10)] backdrop-blur-xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="space-y-0.5">
                            <div className="text-[13px] font-bold text-slate-800">
                              Your score completion
                            </div>
                            <div className="text-[11px] font-medium text-slate-500">
                              Expected entries = participants × criteria for this contest.
                            </div>
                          </div>
                        </div>
                        {(() => {
                          const criteriaForContest = criteriaList.filter(
                            (criteria) => criteria.contest_id === activeContest.id,
                          );
                          const criteriaIds = new Set(
                            criteriaForContest.map((criteria) => criteria.id),
                          );
                          const participantIds = new Set(activeContestParticipants.map((p) => p.id));
                          const expected = participantIds.size * criteriaIds.size;
                          const judgeId = judge?.id ?? null;
                          const filled =
                            judgeId === null
                              ? 0
                              : scores.filter(
                                  (s) =>
                                    s.judge_id === judgeId &&
                                    participantIds.has(s.participant_id) &&
                                    criteriaIds.has(s.criteria_id),
                                ).length;
                          const missing = Math.max(0, expected - filled);
                          const percent = expected === 0 ? 0 : Math.min(100, Math.round((filled / expected) * 100));
                          const participantProgressRows = activeContestParticipants.map((participant) => {
                            const filledCriteriaIds =
                              judgeId === null
                                ? new Set<number>()
                                : new Set(
                                    scores
                                      .filter(
                                        (score) =>
                                          score.judge_id === judgeId &&
                                          score.participant_id === participant.id &&
                                          criteriaIds.has(score.criteria_id),
                                      )
                                      .map((score) => score.criteria_id),
                                  );
                            const expectedPerParticipant = criteriaForContest.length;
                            const filledPerParticipant = filledCriteriaIds.size;
                            const missingPerParticipant = Math.max(
                              0,
                              expectedPerParticipant - filledPerParticipant,
                            );
                            const completionPercent =
                              expectedPerParticipant === 0
                                ? 0
                                : Math.min(
                                    100,
                                    Math.round(
                                      (filledPerParticipant / expectedPerParticipant) * 100,
                                    ),
                                  );

                            const missingCriteriaNames = criteriaForContest
                              .filter((criteria) => !filledCriteriaIds.has(criteria.id))
                              .map((criteria) => criteria.name);

                            return {
                              participant,
                              expectedPerParticipant,
                              filledPerParticipant,
                              missingPerParticipant,
                              completionPercent,
                              missingCriteriaNames,
                              filledCriteriaIds: Array.from(filledCriteriaIds),
                            };
                          });
                          const selectedParticipantProgressRow =
                            selectedMonitoringParticipantId === null
                              ? null
                              : participantProgressRows.find(
                                  (row) =>
                                    row.participant.id ===
                                    selectedMonitoringParticipantId,
                                ) ?? null;
                          return (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse text-left text-[11px]">
                                <thead>
                                  <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-2 font-medium">Contest</th>
                                    <th className="px-3 py-2 font-medium text-right">Participants</th>
                                    <th className="px-3 py-2 font-medium text-right">Criteria</th>
                                    <th className="px-3 py-2 font-medium text-right">Filled</th>
                                    <th className="px-3 py-2 font-medium text-right">Expected</th>
                                    <th className="px-3 py-2 font-medium text-right">Missing</th>
                                    <th className="px-3 py-2 font-medium text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-[#F1F5F9]">
                                    <td className="px-3 py-2 text-slate-700">{activeContest.name}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{participantIds.size.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{criteriaIds.size.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{filled.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{expected.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-slate-700">{missing.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right">
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                                          missing === 0 && expected > 0
                                            ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                            : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                                        }`}
                                        title={`${percent}% complete`}
                                      >
                                        {missing === 0 && expected > 0 ? "Complete" : `${percent}%`}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                              <div className="my-5 h-px bg-[#E2E8F0]" />

                              <div className="mb-2 text-[12px] font-bold text-slate-700">
                                Participant input completeness
                              </div>
                              <table className="min-w-full border-collapse text-left text-[11px]">
                                <thead>
                                  <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-2 font-medium">Participant</th>
                                    <th className="px-3 py-2 font-medium text-right">Filled</th>
                                    <th className="px-3 py-2 font-medium text-right">Expected</th>
                                    <th className="px-3 py-2 font-medium text-right">Missing</th>
                                    <th className="px-3 py-2 font-medium text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {participantProgressRows.map((row) => (
                                    <tr key={row.participant.id} className="border-b border-[#F1F5F9]">
                                      <td className="px-3 py-2 text-slate-700">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedMonitoringParticipantId((previous) =>
                                              previous === row.participant.id
                                                ? null
                                                : row.participant.id,
                                            )
                                          }
                                          className="text-left font-semibold text-slate-800 underline decoration-dotted underline-offset-2 hover:text-[#1F4D3A]"
                                        >
                                          {row.participant.full_name}
                                        </button>
                                        <div className="text-[10px] text-slate-500">
                                          Missing fields:{" "}
                                          {row.missingCriteriaNames.length > 0
                                            ? row.missingCriteriaNames.join(", ")
                                            : "None"}
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-700">
                                        {row.filledPerParticipant.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-700">
                                        {row.expectedPerParticipant.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-700">
                                        {row.missingPerParticipant.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <span
                                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                                            row.missingPerParticipant === 0 &&
                                            row.expectedPerParticipant > 0
                                              ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                              : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                                          }`}
                                          title={`${row.completionPercent}% complete`}
                                        >
                                          {row.missingPerParticipant === 0 &&
                                          row.expectedPerParticipant > 0
                                            ? "Complete"
                                            : `${row.completionPercent}%`}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {selectedParticipantProgressRow && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                                  <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
                                    <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                                      <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                          Participant Criteria Status
                                        </div>
                                        <div className="text-[15px] font-bold text-slate-800">
                                          {selectedParticipantProgressRow.participant.full_name}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMonitoringParticipantId(null)}
                                        className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-[#E2E8F0] hover:bg-slate-50"
                                      >
                                        Close
                                      </button>
                                    </div>
                                    <div className="max-h-[65vh] overflow-auto p-5">
                                      <table className="min-w-full border-collapse text-left text-[11px]">
                                        <thead>
                                          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] uppercase tracking-wide text-slate-500">
                                            <th className="px-3 py-2 font-medium">Criteria</th>
                                            <th className="px-3 py-2 font-medium text-right">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {criteriaForContest.map((criteria) => {
                                            const isFilled =
                                              selectedParticipantProgressRow.filledCriteriaIds.includes(
                                                criteria.id,
                                              );
                                            return (
                                              <tr key={criteria.id} className="border-b border-[#F1F5F9]">
                                                <td className="px-3 py-2 text-slate-700">
                                                  {criteria.name}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                  <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                                                      isFilled
                                                        ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                                        : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                                                    }`}
                                                  >
                                                    {isFilled ? "Filled" : "Not filled"}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
                </div>
            </div>
          </div>
      </main>

        {activeMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
              <div className="bg-gradient-to-r from-[#1F4D3A] via-[#24624A] to-[#1F4D3A] px-7 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-1 10l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                        Message
                      </div>
                      <div className="text-lg font-semibold leading-tight">
                        {activeMessage.title?.trim()
                          ? activeMessage.title
                          : "Announcement"}
                      </div>
                      <div className="text-[11px] text-white/75">
                        {(() => {
                          const d = new Date(activeMessage.created_at);
                          return Number.isNaN(d.getTime())
                            ? ""
                            : `Sent ${d.toLocaleString()}`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={dismissActiveMessage}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="px-7 py-6">
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                  <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700">
                    {activeMessage.body}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-7 py-4">
                <div className="text-[11px] font-medium text-slate-500">
                  {messageQueue.length > 1
                    ? `Message 1 of ${messageQueue.length}`
                    : "Message 1 of 1"}
                </div>
                <button
                  type="button"
                  onClick={dismissActiveMessage}
                  className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#163528]"
                >
                  {messageQueue.length > 1 ? "Next" : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Modal */}
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
                <button
                  type="button"
                  ref={scoringAvatarRef}
                  onClick={() => {
                    let photos: string[] = [];
                    try { photos = currentParticipant.gallery_photos ? JSON.parse(currentParticipant.gallery_photos) : []; } catch { photos = []; }
                    if (photos.length > 0) {
                      setGallerySlideIndex(0);
                      setIsGalleryModalOpen(true);
                    }
                  }}
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E2F3EC] text-lg font-semibold text-[#1F4D3A] shadow-sm md:h-24 md:w-24 md:text-xl ${(() => { let p: string[] = []; try { p = currentParticipant.gallery_photos ? JSON.parse(currentParticipant.gallery_photos) : []; } catch { p = []; } return p.length > 0 ? "cursor-pointer ring-2 ring-[#1F4D3A]/30 hover:ring-[#1F4D3A]/60 transition" : "cursor-default"; })()}`}
                >
                  {currentParticipant.avatar_url || currentParticipant.card_url ? (
                    <img
                      src={currentParticipant.avatar_url || currentParticipant.card_url || ""}
                      alt={currentParticipant.full_name}
                      className="h-full w-full object-contain"
                      style={imageTransformFromUrl(
                        currentParticipant.avatar_url || currentParticipant.card_url || null,
                        scoringAvatarSize.w,
                        scoringAvatarSize.h,
                      )}
                    />
                  ) : (
                    participantInitials(currentParticipant.full_name)
                  )}
                </button>
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
                      {participantTeamName(currentParticipant)}
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
                                    {isCriteriaSaved(currentParticipant.id, criteria.id) && (
                                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                                    )}
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
                                      onWheel={(event) => {
                                        event.currentTarget.blur();
                                      }}
                                      onBlur={() =>
                                        handleScoreBlur(currentParticipant.id, criteria.id)
                                      }
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
                                      {activeContestScoringType === "points" ||
                                      activeContestScoringType === "ranking"
                                        ? criteria.percentage
                                        : 100}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </tbody>
                  {/* Total score row removed */}
                </table>
              </div>

              <div
                className="sticky bottom-0 mt-5 flex items-center justify-end gap-3 bg-white pt-3 pb-4 relative"
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
                {currentParticipant &&
                  lastSubmittedParticipantId === currentParticipant.id && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Score for {currentParticipant.full_name} submitted to tabulation.</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitCurrentParticipant}
                    disabled={
                      isSubmittingParticipant ||
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
                    {isSubmittingParticipant ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {isGalleryModalOpen && currentParticipant && (() => {
          let galleryPhotos: string[] = [];
          try { galleryPhotos = currentParticipant.gallery_photos ? JSON.parse(currentParticipant.gallery_photos) : []; } catch { galleryPhotos = []; }
          if (galleryPhotos.length === 0) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setIsGalleryModalOpen(false)}>
              <div className="relative flex w-full max-w-3xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="absolute -top-2 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white backdrop-blur hover:bg-white/40 transition"
                >
                  X
                </button>
                <div className="relative w-full overflow-hidden rounded-2xl bg-black/40 shadow-2xl">
                  <img
                    src={galleryPhotos[gallerySlideIndex]}
                    alt={`${currentParticipant.full_name} gallery ${gallerySlideIndex + 1}`}
                    className="mx-auto max-h-[75vh] w-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGallerySlideIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white backdrop-blur hover:bg-white/40 transition"
                  >
                    &lt;
                  </button>
                  <span className="text-sm font-medium text-white/80">{gallerySlideIndex + 1} / {galleryPhotos.length}</span>
                  <button
                    type="button"
                    onClick={() => setGallerySlideIndex((prev) => (prev + 1) % galleryPhotos.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white backdrop-blur hover:bg-white/40 transition"
                  >
                    &gt;
                  </button>
                </div>
                {galleryPhotos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryPhotos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGallerySlideIndex(idx)}
                        className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${idx === gallerySlideIndex ? "border-white shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        <img src={url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
