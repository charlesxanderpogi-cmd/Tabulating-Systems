"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const navItems = [
  { key: "home", label: "Home" },
  { key: "tabulation", label: "Tabulation" },
  { key: "event", label: "Event" },
  { key: "participants", label: "Participants" },
  { key: "users", label: "Add user" },
];

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

type AdminTab = "home" | "tabulation" | "event" | "participants" | "users";
type EventSubTab = "addEvent" | "addContest" | "addCriteria";
type ParticipantSubTab = "category" | "participant";
type UserSubTab = "admin" | "judge" | "tabulator";

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
  created_at: string;
  contest_code: string | null;
};

type CriteriaRow = {
  id: number;
  contest_id: number;
  name: string;
  percentage: number;
  created_at: string;
  description: string | null;
  criteria_code: string | null;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [eventTab, setEventTab] = useState<EventSubTab>("addEvent");
  const [participantTab, setParticipantTab] =
    useState<ParticipantSubTab>("category");
  const [userTab, setUserTab] = useState<UserSubTab>("admin");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isTabulatorModalOpen, setIsTabulatorModalOpen] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [criteriaList, setCriteriaList] = useState<CriteriaRow[]>([]);
  const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(
    null,
  );
  const [editingContestId, setEditingContestId] = useState<number | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [eventYear, setEventYear] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isDeletingEventId, setIsDeletingEventId] = useState<number | null>(
    null,
  );
  const [isDeletingContestId, setIsDeletingContestId] = useState<number | null>(
    null,
  );
  const [isDeletingCriteriaId, setIsDeletingCriteriaId] = useState<
    number | null
  >(null);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [isSettingActiveEventId, setIsSettingActiveEventId] = useState<
    number | null
  >(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);
  const [judgeFullName, setJudgeFullName] = useState("");
  const [judgeUsername, setJudgeUsername] = useState("");
  const [judgePassword, setJudgePassword] = useState("");
  const [isSavingJudge, setIsSavingJudge] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);
  const [judgeSuccess, setJudgeSuccess] = useState<string | null>(null);
  const [contestName, setContestName] = useState("");
  const [isSavingContest, setIsSavingContest] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  const [contestSuccess, setContestSuccess] = useState<string | null>(null);
  const [selectedContestIdForCriteria, setSelectedContestIdForCriteria] = useState<number | null>(null);
  const [criteriaName, setCriteriaName] = useState("");
  const [criteriaWeight, setCriteriaWeight] = useState("");
  const [criteriaDescription, setCriteriaDescription] = useState("");
  const [isSavingCriteria, setIsSavingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [criteriaSuccess, setCriteriaSuccess] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilterYear, setEventFilterYear] = useState("all");
  const [eventFilterMonth, setEventFilterMonth] = useState("all");

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase
      .from("event")
      .select("id, name, code, year, is_active, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const typed = data as EventRow[];
          setEvents(typed);

          const active = typed.find((event) => event.is_active);
          if (active) {
            setActiveEventId(active.id);
          }
        }
      });

    supabase
      .from("contest")
      .select("id, event_id, name, created_at, contest_code")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setContests(data as ContestRow[]);
        }
      });

    supabase
      .from("criteria")
      .select(
        "id, contest_id, name, percentage, created_at, description, criteria_code",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCriteriaList(data as CriteriaRow[]);
        }
      });

    const channel = supabase
      .channel("event-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as EventRow;
            setEvents((prev) => [newRow, ...prev]);
            if (newRow.is_active) {
              setActiveEventId(newRow.id);
            }
          } else if (payload.eventType === "UPDATE") {
            const newRow = payload.new as EventRow;
            setEvents((prev) =>
              prev.map((event) => (event.id === newRow.id ? newRow : event)),
            );
            if (newRow.is_active) {
              setActiveEventId(newRow.id);
            } else {
              setActiveEventId((current) =>
                current === newRow.id ? null : current,
              );
            }
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setEvents((prev) =>
              prev.filter((event) => event.id !== oldRow.id),
            );
            setActiveEventId((current) =>
              current === oldRow.id ? null : current,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateEventModal = () => {
    setEditingEventId(null);
    setEventName("");
    setEventCode("");
    setEventYear("");
    setEventError(null);
    setEventSuccess(null);
    setIsEventModalOpen(true);
  };

  const openCreateContestModal = () => {
    setEditingContestId(null);
    setContestName("");
    setContestError(null);
    setContestSuccess(null);
    setIsContestModalOpen(true);
  };

  const openCreateCriteriaModal = () => {
    setEditingCriteriaId(null);
    setSelectedContestIdForCriteria(null);
    setCriteriaName("");
    setCriteriaWeight("");
    setCriteriaDescription("");
    setCriteriaError(null);
    setCriteriaSuccess(null);
    setIsCriteriaModalOpen(true);
  };

  const openEditCriteriaModal = (criteria: CriteriaRow) => {
    setEditingCriteriaId(criteria.id);
    setSelectedContestIdForCriteria(criteria.contest_id);
    setCriteriaName(criteria.name);
    setCriteriaWeight(String(criteria.percentage));
    setCriteriaDescription(criteria.description ?? "");
    setCriteriaError(null);
    setCriteriaSuccess(null);
    setIsCriteriaModalOpen(true);
  };

  const openEditContestModal = (contest: ContestRow) => {
    setEditingContestId(contest.id);
    setContestName(contest.name);
    setContestError(null);
    setContestSuccess(null);
    setIsContestModalOpen(true);
  };

  const openEditEventModal = (event: EventRow) => {
    setEditingEventId(event.id);
    setEventName(event.name);
    setEventCode(event.code);
    setEventYear(String(event.year));
    setEventError(null);
    setEventSuccess(null);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    setEventError(null);
    setEventSuccess(null);

    if (!eventName.trim() || !eventCode.trim() || !eventYear.trim()) {
      setEventError("Please fill in all fields.");
      return;
    }

    const parsedYear = Number(eventYear);

    if (!Number.isInteger(parsedYear)) {
      setEventError("Year must be a whole number.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setEventError("Supabase is not configured.");
      return;
    }

    setIsSavingEvent(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let error = null;

    if (editingEventId === null) {
      const { data, error: insertError } = await supabase
        .from("event")
        .insert({
          name: eventName.trim(),
          code: eventCode.trim(),
          year: parsedYear,
          is_active: false,
        })
        .select("id, name, code, year, is_active, created_at");

      error = insertError;

      if (!insertError && data && Array.isArray(data) && data.length > 0) {
        setEvents((prev) => [data[0] as EventRow, ...prev]);
      }
    } else {
      const { data, error: updateError } = await supabase
        .from("event")
        .update({
          name: eventName.trim(),
          code: eventCode.trim(),
          year: parsedYear,
        })
        .eq("id", editingEventId)
        .select("id, name, code, year, is_active, created_at")
        .single();

      error = updateError;

      if (!updateError && data) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === data.id ? (data as EventRow) : event,
          ),
        );
      }
    }

    if (error) {
      setEventError(error.message || "Unable to save event.");
      setIsSavingEvent(false);
      return;
    }

    setEventSuccess(
      editingEventId === null ? "Event has been added." : "Event has been updated.",
    );
    setIsSavingEvent(false);
    setEditingEventId(null);
    setEventName("");
    setEventCode("");
    setEventYear("");
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = async (id: number) => {
    setEventError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setEventError("Supabase is not configured.");
      return;
    }

    setIsDeletingEventId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("event").delete().eq("id", id);

    setIsDeletingEventId(null);

    if (error) {
      setEventError(error.message || "Unable to delete event.");
      return;
    }

    setEvents((prev) => prev.filter((event) => event.id !== id));
    setActiveEventId((current) => (current === id ? null : current));
  };

  const handleSetActiveEvent = async (id: number) => {
    setEventError(null);
    setEventSuccess(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setEventError("Supabase is not configured.");
      return;
    }

    setIsSettingActiveEventId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: clearError } = await supabase
      .from("event")
      .update({ is_active: false })
      .eq("is_active", true);

    if (clearError) {
      setIsSettingActiveEventId(null);
      setEventError(clearError.message || "Unable to clear active event.");
      return;
    }

    const { error: setError } = await supabase
      .from("event")
      .update({ is_active: true })
      .eq("id", id);

    setIsSettingActiveEventId(null);

    if (setError) {
      setEventError(setError.message || "Unable to set active event.");
      return;
    }

    setActiveEventId(id);
    setEvents((prev) =>
      prev.map((event) => ({
        ...event,
        is_active: event.id === id,
      })),
    );
    setEventSuccess("Active event has been updated.");
  };

  const filteredEvents = events.filter((event) => {
    const term = eventSearch.trim().toLowerCase();
    if (term) {
      const matchesSearch =
        event.name.toLowerCase().includes(term) ||
        event.code.toLowerCase().includes(term);
      if (!matchesSearch) {
        return false;
      }
    }

    if (eventFilterYear !== "all") {
      const yearNumber = Number(eventFilterYear);
      if (event.year !== yearNumber) {
        return false;
      }
    }

    if (eventFilterMonth !== "all") {
      const date = new Date(event.created_at);
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      const monthNumber = date.getMonth() + 1;
      if (monthNumber !== Number(eventFilterMonth)) {
        return false;
      }
    }

    return true;
  });

  const activeEvent =
    activeEventId === null
      ? null
      : events.find((event) => event.id === activeEventId) ?? null;

  const handleSaveContest = async () => {
    setContestError(null);
    setContestSuccess(null);

    if (activeEventId === null) {
      setContestError("Set an active event first in the Event tab.");
      return;
    }

    if (!contestName.trim()) {
      setContestError("Contest name is required.");
      return;
    }

    const normalizedName = contestName.trim().toLowerCase();

    const hasDuplicateName = contests.some((contest) => {
      if (contest.event_id !== activeEventId) {
        return false;
      }
      if (editingContestId !== null && contest.id === editingContestId) {
        return false;
      }
      return contest.name.trim().toLowerCase() === normalizedName;
    });

    if (hasDuplicateName) {
      setContestError(
        "A contest with this name already exists for the active event.",
      );
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setContestError("Supabase is not configured.");
      return;
    }

    setIsSavingContest(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (editingContestId === null) {
      const { data, error } = await supabase
        .from("contest")
        .insert({
          event_id: activeEventId,
          name: contestName.trim(),
        })
        .select("id, event_id, name, created_at, contest_code")
        .single();

      if (error) {
        if (
          typeof error.message === "string" &&
          error.message.includes("contest_name_event_unique")
        ) {
          setContestError(
            "A contest with this name already exists for the active event.",
          );
        } else {
          setContestError(error.message || "Unable to create contest.");
        }
        setIsSavingContest(false);
        return;
      }

      if (data) {
        const typed = data as ContestRow;

        if (!typed.contest_code) {
          const eventForContest = events.find(
            (event) => event.id === typed.event_id,
          );
          const eventCodeForContest = eventForContest?.code ?? "EVT";

          const generatedContestCode = `${eventCodeForContest}-${typed.id}`;

          const { data: updatedContest } = await supabase
            .from("contest")
            .update({
              contest_code: generatedContestCode,
            })
            .eq("id", typed.id)
            .select("id, event_id, name, created_at, contest_code")
            .single();

          const finalContest = (updatedContest as ContestRow | null) ?? {
            ...typed,
            contest_code: generatedContestCode,
          };

          setContests((previous) => [finalContest, ...previous]);
        } else {
          setContests((previous) => [typed, ...previous]);
        }
      }

      setContestSuccess("Contest has been created.");
    } else {
      const { data, error } = await supabase
        .from("contest")
        .update({
          name: contestName.trim(),
        })
        .eq("id", editingContestId)
        .select("id, event_id, name, created_at, contest_code")
        .single();

      if (error) {
        if (
          typeof error.message === "string" &&
          error.message.includes("contest_name_event_unique")
        ) {
          setContestError(
            "A contest with this name already exists for the active event.",
          );
        } else {
          setContestError(error.message || "Unable to update contest.");
        }
        setIsSavingContest(false);
        return;
      }

      if (data) {
        setContests((previous) =>
          previous.map((contest) =>
            contest.id === data.id ? (data as ContestRow) : contest,
          ),
        );
      }

      setContestSuccess("Contest has been updated.");
    }

    setContestName("");
    setEditingContestId(null);
    setIsContestModalOpen(false);
  };

  const handleDeleteContest = async (id: number) => {
    setContestError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setContestError("Supabase is not configured.");
      return;
    }

    setIsDeletingContestId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("contest").delete().eq("id", id);

    setIsDeletingContestId(null);

    if (error) {
      setContestError(error.message || "Unable to delete contest.");
      return;
    }

    setContests((previous) => previous.filter((contest) => contest.id !== id));
    setCriteriaList((previous) =>
      previous.filter((criteria) => criteria.contest_id !== id),
    );
  };


  const handleSaveCriteria = async () => {
    setCriteriaError(null);
    setCriteriaSuccess(null);

    if (activeEventId === null) {
      setCriteriaError("Set an active event first in the Event tab.");
      return;
    }

    if (selectedContestIdForCriteria === null) {
      setCriteriaError("Please select a contest.");
      return;
    }

    if (!criteriaName.trim()) {
      setCriteriaError("Criteria name is required.");
      return;
    }

    if (!criteriaWeight.trim()) {
      setCriteriaError("Weight is required.");
      return;
    }

    const parsedWeight = Number(criteriaWeight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 100) {
      setCriteriaError("Weight must be a number between 0 and 100.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setCriteriaError("Supabase is not configured.");
      return;
    }

    setIsSavingCriteria(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (editingCriteriaId === null) {
      const { data, error } = await supabase
        .from("criteria")
        .insert({
          contest_id: selectedContestIdForCriteria,
          name: criteriaName.trim(),
          percentage: parsedWeight,
          description: criteriaDescription.trim() || null,
        })
        .select(
          "id, contest_id, name, percentage, created_at, description, criteria_code",
        )
        .single();

      if (error) {
        setCriteriaError(error.message || "Unable to add criteria.");
        setIsSavingCriteria(false);
        return;
      }

      if (data) {
        const typed = data as CriteriaRow;

        if (!typed.criteria_code) {
          const contestForCriteria = contests.find(
            (contest) => contest.id === typed.contest_id,
          );

          let baseContestCode = contestForCriteria?.contest_code ?? null;

          if (!baseContestCode && contestForCriteria) {
            const eventForContest = events.find(
              (event) => event.id === contestForCriteria.event_id,
            );
            if (eventForContest) {
              baseContestCode = `${eventForContest.code}-${contestForCriteria.id}`;
            }
          }

          const generatedCriteriaCode = baseContestCode
            ? `${baseContestCode}-${typed.id}`
            : `CRIT-${typed.id}`;

          const { data: updatedCriteria } = await supabase
            .from("criteria")
            .update({
              criteria_code: generatedCriteriaCode,
            })
            .eq("id", typed.id)
            .select(
              "id, contest_id, name, percentage, created_at, description, criteria_code",
            )
            .single();

          const finalCriteria = (updatedCriteria as CriteriaRow | null) ?? {
            ...typed,
            criteria_code: generatedCriteriaCode,
          };

          setCriteriaList((previous) => [finalCriteria, ...previous]);
        } else {
          setCriteriaList((previous) => [typed, ...previous]);
        }
      }

      setCriteriaSuccess("Criteria has been added.");
    } else {
      const { data, error } = await supabase
        .from("criteria")
        .update({
          contest_id: selectedContestIdForCriteria,
          name: criteriaName.trim(),
          percentage: parsedWeight,
          description: criteriaDescription.trim() || null,
        })
        .eq("id", editingCriteriaId)
        .select(
          "id, contest_id, name, percentage, created_at, description, criteria_code",
        )
        .single();

      if (error) {
        setCriteriaError(error.message || "Unable to update criteria.");
        setIsSavingCriteria(false);
        return;
      }

      if (data) {
        setCriteriaList((previous) =>
          previous.map((criteria) =>
            criteria.id === data.id ? (data as CriteriaRow) : criteria,
          ),
        );
      }

      setCriteriaSuccess("Criteria has been updated.");
    }
    setIsSavingCriteria(false);
    setSelectedContestIdForCriteria(null);
    setCriteriaName("");
    setCriteriaWeight("");
    setCriteriaDescription("");
    setEditingCriteriaId(null);
    setIsCriteriaModalOpen(false);
  };

  const handleDeleteCriteria = async (id: number) => {
    setCriteriaError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setCriteriaError("Supabase is not configured.");
      return;
    }

    setIsDeletingCriteriaId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("criteria").delete().eq("id", id);

    setIsDeletingCriteriaId(null);

    if (error) {
      setCriteriaError(error.message || "Unable to delete criteria.");
      return;
    }

    setCriteriaList((previous) =>
      previous.filter((criteria) => criteria.id !== id),
    );
  };

  const handleSaveJudge = async () => {
    setJudgeError(null);
    setJudgeSuccess(null);

    if (activeEventId === null) {
      setJudgeError("Set an active event first in the Event tab.");
      return;
    }

    if (
      !judgeFullName.trim() ||
      !judgeUsername.trim() ||
      !judgePassword
    ) {
      setJudgeError("Please fill in all fields.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setJudgeError("Supabase is not configured.");
      return;
    }

    setIsSavingJudge(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("user_judge").insert({
      event_id: activeEventId,
      full_name: judgeFullName.trim(),
      username: judgeUsername.trim(),
      password_hash: judgePassword,
    });

    if (error) {
      setJudgeError(error.message || "Unable to save judge.");
      setIsSavingJudge(false);
      return;
    }

    setJudgeSuccess("Judge has been added.");
    setIsSavingJudge(false);
    setJudgeFullName("");
    setJudgeUsername("");
    setJudgePassword("");
    setIsJudgeModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] text-slate-900">
      <header className="border-b border-[#1F4D3A1F] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4D3A] text-xs font-semibold uppercase text-white">
              TS
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                Tabulating System
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#4A3F35]">
                Admin Dashboard
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <nav className="hidden text-[11px] font-medium text-[#1F4D3A] sm:flex">
              <div className="inline-flex items-center gap-1 rounded-full bg-[#E3F2EA] p-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key as AdminTab)}
                    className={`rounded-full px-4 py-2.5 transition ${
                      activeTab === item.key
                        ? "bg-[#1F4D3A] text-white shadow-sm"
                        : "hover:bg-[#1F4D3A0D]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="hidden text-xs font-medium text-[#1F4D3A] sm:inline">
              Admin
            </span>
            <Link
              href="/"
              className="rounded-full border border-[#1F4D3A26] px-3.5 py-1.5 text-[11px] font-medium text-[#1F4D3A] transition hover:border-[#1F4D3A] hover:bg-[#1F4D3A] hover:text-white"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-6">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-32 top-10 h-48 w-48 rounded-full bg-[#1F4D3A12] blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-[#F4C43010] blur-3xl" />
        </div>

        {activeTab === "home" && (
          <>
            <section className="relative grid gap-5 md:grid-cols-[2fr,1.1fr]">
              <div className="rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Overview
                </h2>
                <p className="text-[11px] text-slate-500">
                  Quick snapshot of your current tabulation events.
                </p>
              </div>
              <span className="rounded-full bg-[#E3F2EA] px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[#1F4D3A]">
                Admin
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#1F4D3A14] bg-[#F5F7FF] px-4 py-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Active events
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1F4D3A]">
                  0
                </div>
              </div>
              <div className="rounded-2xl border border-[#1F4D3A14] bg-white px-4 py-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Judges
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1F4D3A]">
                  0
                </div>
              </div>
              <div className="rounded-2xl border border-[#1F4D3A14] bg-white px-4 py-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Participants
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1F4D3A]">
                  0
                </div>
              </div>
            </div>
              </div>
            </section>

            <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
              Recent activity
            </h2>
            <span className="text-[11px] text-slate-500">
              No activity yet
            </span>
          </div>
              <p className="text-[11px] text-slate-500">
                Once you start creating events and tabulating scores, a summary
                of recent actions will appear here.
              </p>
            </section>
          </>
        )}

        {activeTab === "tabulation" && (
          <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Tabulation
                </h2>
                <p className="text-[11px] text-slate-500">
                  Review scores and rankings for each contest.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Event</span>
                    <select className="rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]">
                      <option>All events</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Contest</span>
                    <select className="rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]">
                      <option>All contests</option>
                    </select>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  No tabulation data yet
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">Contest</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Contestant</th>
                      <th className="px-3 py-2 font-medium">Total score</th>
                      <th className="px-3 py-2 font-medium">Rank</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#F1F5F9]">
                      <td
                        className="px-3 py-2 text-slate-400"
                        colSpan={6}
                      >
                        Once you start tabulating, scores and rankings will
                        appear here.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "event" && (
          <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Event setup
                </h2>
                <p className="text-[11px] text-slate-500">
                  Add events, contests, and criteria used for scoring.
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/90 px-3 py-1 text-[10px] text-slate-600 shadow-sm sm:inline-flex">
                <span className="uppercase tracking-wide text-[9px] text-slate-400">
                  Active event
                </span>
                <span className="font-semibold text-[#1F4D3A]">
                  {activeEvent ? activeEvent.name : "None selected"}
                </span>
              </div>
            </div>

            <div className="mb-4 flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setEventTab("addEvent")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  eventTab === "addEvent"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Event
              </button>
              <button
                type="button"
                onClick={() => setEventTab("addContest")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  eventTab === "addContest"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Contest
              </button>
              <button
                type="button"
                onClick={() => setEventTab("addCriteria")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  eventTab === "addCriteria"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Criteria
              </button>
            </div>

            <div>
              {eventTab === "addEvent" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Events
                    </div>
                    <button
                      type="button"
                      onClick={openCreateEventModal}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add event
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Event list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {events.length === 0
                          ? "No events yet"
                          : `${events.length} event${events.length > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <div className="mb-3 grid gap-2 text-[10px] md:grid-cols-3">
                      <div>
                        <div className="mb-1 text-slate-500">Search</div>
                        <input
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-1.5 text-[10px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                          placeholder="Search by name or code"
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-slate-500">Year</div>
                        <select
                          value={eventFilterYear}
                          onChange={(e) => setEventFilterYear(e.target.value)}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-1.5 text-[10px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        >
                          <option value="all">All years</option>
                          {Array.from(
                            new Set(events.map((event) => event.year)),
                          )
                            .sort((a, b) => b - a)
                            .map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-slate-500">Month</div>
                        <select
                          value={eventFilterMonth}
                          onChange={(e) => setEventFilterMonth(e.target.value)}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-1.5 text-[10px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        >
                          <option value="all">All months</option>
                          {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(eventError || eventSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          eventError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {eventError ?? eventSuccess}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Event name</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Year</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={5}
                              >
                                Once you add events, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : filteredEvents.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={5}
                              >
                                No events match your search or filters.
                              </td>
                            </tr>
                          ) : (
                            filteredEvents.map((event) => (
                              <tr
                                key={event.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {event.name}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {event.code}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {event.year}
                                </td>
                                <td className="px-3 py-2">
                                  {event.is_active ? (
                                    <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[10px] font-medium text-[#166534]">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                                      Not active
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => handleSetActiveEvent(event.id)}
                                      disabled={
                                        event.is_active ||
                                        isSettingActiveEventId === event.id
                                      }
                                      className={`rounded-full border border-[#1F4D3A26] px-2 py-0.5 text-[#1F4D3A] hover:bg-[#E3F2EA] ${
                                        event.is_active ||
                                        isSettingActiveEventId === event.id
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {event.is_active
                                        ? "Active"
                                        : isSettingActiveEventId === event.id
                                        ? "Setting..."
                                        : "Set as active"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditEventModal(event)}
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 text-slate-600 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvent(event.id)}
                                      disabled={isDeletingEventId === event.id}
                                      className={`rounded-full border border-[#FCA5A5] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] ${
                                        isDeletingEventId === event.id
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {isDeletingEventId === event.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {eventTab === "addContest" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Contests
                    </div>
                    <button
                      type="button"
                      onClick={openCreateContestModal}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add contest
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Contest list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {contests.length === 0
                          ? "No contests yet"
                          : `${contests.length} contest${
                              contests.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contests.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={4}
                              >
                                Once you add contests, you can edit or delete
                                them here.
                              </td>
                            </tr>
                          ) : (
                            contests.map((contest) => (
                              <tr
                                key={contest.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {contest.name}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {contest.contest_code ?? "—"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {events.find(
                                    (event) => event.id === contest.event_id,
                                  )?.name ?? "Unknown event"}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => openEditContestModal(contest)}
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 text-slate-600 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteContest(contest.id)}
                                      disabled={isDeletingContestId === contest.id}
                                      className={`rounded-full border border-[#FCA5A5] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] ${
                                        isDeletingContestId === contest.id
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {isDeletingContestId === contest.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {eventTab === "addCriteria" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Criteria
                      </div>
                      <button
                        type="button"
                        onClick={openCreateCriteriaModal}
                        className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                      >
                        Add criteria
                      </button>
                    </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Criteria list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {criteriaList.length === 0
                          ? "No criteria yet"
                          : `${criteriaList.length} criteria`}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Criteria</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">Weight (%)</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criteriaList.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={5}
                              >
                                Once you add criteria, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            criteriaList.map((criteria) => (
                              <tr
                                key={criteria.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {criteria.name}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {criteria.criteria_code ?? "—"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {contests.find(
                                    (contest) => contest.id === criteria.contest_id,
                                  )?.name ?? "Unknown contest"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {criteria.percentage}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => openEditCriteriaModal(criteria)}
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 text-slate-600 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCriteria(criteria.id)}
                                      disabled={isDeletingCriteriaId === criteria.id}
                                      className={`rounded-full border border-[#FCA5A5] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] ${
                                        isDeletingCriteriaId === criteria.id
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {isDeletingCriteriaId === criteria.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {isEventModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1F4D3A]">
                        {editingEventId === null ? "Add event" : "Edit event"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {editingEventId === null
                          ? "Create a new event for tabulation."
                          : "Update the details of this event."}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3 px-5 py-4 text-[11px]">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">Event name</div>
                      <input
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      placeholder="Event name"
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                    />
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1/2 space-y-1">
                        <div className="text-[10px] text-slate-500">Code</div>
                        <input
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Code"
                        value={eventCode}
                        onChange={(event) => setEventCode(event.target.value)}
                      />
                      </div>
                      <div className="w-1/2 space-y-1">
                        <div className="text-[10px] text-slate-500">Year</div>
                        <input
                        type="number"
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Year"
                        value={eventYear}
                        onChange={(event) => setEventYear(event.target.value)}
                      />
                      </div>
                    </div>
                  {(eventError || eventSuccess) && (
                    <div
                      className={`text-[10px] ${
                        eventError ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {eventError ?? eventSuccess}
                    </div>
                  )}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEvent}
                      disabled={isSavingEvent}
                      className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                        isSavingEvent ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {isSavingEvent
                        ? "Saving..."
                        : editingEventId === null
                        ? "Save event"
                        : "Update event"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isContestModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1F4D3A]">
                        {editingContestId === null ? "Add contest" : "Edit contest"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Link a new contest to an event.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsContestModalOpen(false)}
                      className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3 px-5 py-4 text-[11px]">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Current active event
                      </div>
                      <div className="w-full rounded-xl border border-[#D0D7E2] bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        {activeEvent ? activeEvent.name : "No active event selected"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Contest Name *
                      </div>
                      <input
                        value={contestName}
                        onChange={(event) => setContestName(event.target.value)}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Enter contest name"
                      />
                    </div>
                    {(contestError || contestSuccess) && (
                      <div
                        className={`text-[10px] ${
                          contestError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {contestError ?? contestSuccess}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setIsContestModalOpen(false)}
                      className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveContest}
                      disabled={isSavingContest || activeEventId === null}
                      className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                        isSavingContest ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {isSavingContest ? "Creating..." : "Create contest"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isCriteriaModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1F4D3A]">
                        {editingCriteriaId === null
                          ? "Add criteria"
                          : "Edit criteria"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Define how this contest will be scored.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCriteriaModalOpen(false)}
                      className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3 px-5 py-4 text-[11px]">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Select contest *
                      </div>
                      <select
                        value={selectedContestIdForCriteria ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedContestIdForCriteria(
                            value ? Number(value) : null,
                          );
                        }}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      >
                        <option value="">-- Select Contest --</option>
                        {contests
                          .filter(
                            (contest) =>
                              activeEventId === null ||
                              contest.event_id === activeEventId,
                          )
                          .map((contest) => (
                            <option key={contest.id} value={contest.id}>
                              {contest.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Criteria Name *
                      </div>
                      <input
                        value={criteriaName}
                        onChange={(event) => setCriteriaName(event.target.value)}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="e.g., Technique, Presentation, etc."
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Weight (%) *
                      </div>
                      <input
                        type="number"
                        value={criteriaWeight}
                        onChange={(event) => setCriteriaWeight(event.target.value)}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Enter percentage (0-100)"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Description
                      </div>
                      <textarea
                        value={criteriaDescription}
                        onChange={(event) =>
                          setCriteriaDescription(event.target.value)
                        }
                        className="min-h-[70px] w-full resize-none rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Enter criteria description"
                      />
                    </div>
                    {(criteriaError || criteriaSuccess) && (
                      <div
                        className={`text-[10px] ${
                          criteriaError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {criteriaError ?? criteriaSuccess}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setIsCriteriaModalOpen(false)}
                      className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCriteria}
                      disabled={isSavingCriteria}
                      className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                        isSavingCriteria ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {isSavingCriteria
                        ? "Saving..."
                        : editingCriteriaId === null
                        ? "Add criteria"
                        : "Update criteria"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "participants" && (
          <section className="relative space-y-4 rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Participants
                </h2>
                <p className="text-[11px] text-slate-500">
                  Add categories and participants for each contest.
                </p>
              </div>
            </div>

            <div className="mb-4 flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setParticipantTab("category")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  participantTab === "category"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setParticipantTab("participant")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  participantTab === "participant"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Participant
              </button>
            </div>

            <div>
              {participantTab === "category" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Categories
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add category
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Category list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        No categories yet
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">
                              Category name
                            </th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#F1F5F9]">
                            <td
                              className="px-3 py-2 text-slate-400"
                              colSpan={3}
                            >
                              Once you add categories, you can edit or delete
                              them here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {participantTab === "participant" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Participants
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsParticipantModalOpen(true)}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add participant
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Participant list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        No participants yet
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">Category</th>
                            <th className="px-3 py-2 font-medium">Full name</th>
                            <th className="px-3 py-2 font-medium">
                              Contestant #
                            </th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#F1F5F9]">
                            <td
                              className="px-3 py-2 text-slate-400"
                              colSpan={5}
                            >
                              Once you add participants, you can edit or delete
                              them here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Add category
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Create a category for an event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Current active event
                  </div>
                  <div className="w-full rounded-xl border border-[#D0D7E2] bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {activeEvent ? activeEvent.name : "No active event selected"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Category name
                  </div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Category name"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={activeEventId === null}
                  className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528]"
                >
                  Save category
                </button>
              </div>
            </div>
          </div>
        )}

        {isParticipantModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Add participant
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Register a contestant for a contest.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsParticipantModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Select contest</div>
                  <select className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]">
                    <option>Select contest</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Select category
                  </div>
                  <select className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]">
                    <option>Select category</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Full name</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Contestant number
                  </div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Contestant number"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsParticipantModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528]"
                >
                  Save participant
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdminModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Add admin
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Create an administrator account for the system.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Username</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Password</div>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Password"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528]"
                >
                  Save admin
                </button>
              </div>
            </div>
          </div>
        )}

        {isJudgeModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Add judge
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Assign a judge to an event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJudgeModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Current active event
                  </div>
                  <div className="w-full rounded-xl border border-[#D0D7E2] bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {activeEvent ? activeEvent.name : "No active event selected"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Full name</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Full name"
                    value={judgeFullName}
                    onChange={(event) => setJudgeFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Username</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Username"
                    value={judgeUsername}
                    onChange={(event) => setJudgeUsername(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Password</div>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Password"
                    value={judgePassword}
                    onChange={(event) => setJudgePassword(event.target.value)}
                  />
                </div>
                {(judgeError || judgeSuccess) && (
                  <div
                    className={`text-[10px] ${
                      judgeError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {judgeError ?? judgeSuccess}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsJudgeModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveJudge}
                  disabled={isSavingJudge || activeEventId === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingJudge ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isSavingJudge ? "Saving..." : "Save judge"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isTabulatorModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Add tabulator
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Assign a tabulator to an event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTabulatorModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Current active event
                  </div>
                  <div className="w-full rounded-xl border border-[#D0D7E2] bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {activeEvent ? activeEvent.name : "No active event selected"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Full name</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Username</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Password</div>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Password"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsTabulatorModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={activeEventId === null}
                  className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528]"
                >
                  Save tabulator
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <section className="relative rounded-3xl border border-[#1F4D3A1F] bg-white/95 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-[#1F4D3A]">
                  Add user
                </h2>
                <p className="text-[11px] text-slate-500">
                  Create admin, judge, and tabulator accounts for this system.
                </p>
              </div>
            </div>

            <div className="mb-4 flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setUserTab("admin")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  userTab === "admin"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setUserTab("judge")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  userTab === "judge"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Judge
              </button>
              <button
                type="button"
                onClick={() => setUserTab("tabulator")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  userTab === "tabulator"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Tabulator
              </button>
            </div>

            <div>
              {userTab === "admin" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Admins
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAdminModalOpen(true)}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add admin
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Admin list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        No admins yet
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Username</th>
                            <th className="px-3 py-2 font-medium">Role</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#F1F5F9]">
                            <td
                              className="px-3 py-2 text-slate-400"
                              colSpan={3}
                            >
                              Once you add admins, you can edit or delete them
                              here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {userTab === "judge" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Judges
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsJudgeModalOpen(true)}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add judge
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Judge list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        No judges yet
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Full name</th>
                            <th className="px-3 py-2 font-medium">Username</th>
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#F1F5F9]">
                            <td
                              className="px-3 py-2 text-slate-400"
                              colSpan={4}
                            >
                              Once you add judges, you can edit or delete them
                              here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {userTab === "tabulator" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Tabulators
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTabulatorModalOpen(true)}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add tabulator
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Tabulator list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        No tabulators yet
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Full name</th>
                            <th className="px-3 py-2 font-medium">Username</th>
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#F1F5F9]">
                            <td
                              className="px-3 py-2 text-slate-400"
                              colSpan={4}
                            >
                              Once you add tabulators, you can edit or delete
                              them here.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
