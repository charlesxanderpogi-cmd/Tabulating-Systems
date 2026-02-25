"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
type EventSubTab =
  | "addEvent"
  | "addContest"
  | "addCriteria"
  | "awards"
  | "template";
type ParticipantSubTab = "category" | "participant" | "judge";
type UserSubTab = "admin" | "judge" | "tabulator";

type EventRow = {
  id: number;
  name: string;
  code: string;
  year: number;
  is_active: boolean | null;
  created_at: string;
};

type ContestScoringType = "percentage" | "points";

type ContestRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
  contest_code: string | null;
  scoring_type: ContestScoringType | null;
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

type CategoryRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type AwardType = "criteria" | "special";

type AwardRow = {
  id: number;
  event_id: number;
  contest_id: number | null;
  name: string;
  description: string | null;
  award_type: AwardType;
  criteria_id: number | null;
  criteria_ids: number[] | null;
  is_active: boolean;
  created_at: string;
};

type AwardRecipientRow = {
  id: number;
  award_id: number;
  participant_id: number;
  created_at: string;
};

type TeamRow = {
  id: number;
  event_id: number;
  name: string;
  created_at: string;
};

type ContestLayoutTemplateKey = "standard" | "pageant";

type PageantSettingsSection =
  | "groupsAndBadges"
  | "cardsAndNames"
  | "participantName"
  | "criteriaHeaderAndRows"
  | "scoringTable"
  | "scoringModal";

type PageantSectionProps = {
  title: string;
  sectionKey: PageantSettingsSection;
  isOpen: boolean;
  onToggle: (section: PageantSettingsSection) => void;
  children: ReactNode;
};

function PageantSection({
  title,
  sectionKey,
  isOpen,
  onToggle,
  children,
}: PageantSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
      >
        <span>{title}</span>
        <span className="text-[10px] text-slate-400">
          {isOpen ? "Hide section" : "Show section"}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3">{children}</div>
      )}
    </div>
  );
}

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

const pageantDefaultLayout: ContestLayout = {
  version: 1,
  templateKey: "pageant",
  theme: {
    femaleGroupBg: "#f9fafb",
    femaleGroupBgOpacity: 100,
    femaleBadgeBg: "#f97316",
    femaleBadgeBgOpacity: 100,
    maleGroupBg: "#f9fafb",
    maleGroupBgOpacity: 100,
    maleBadgeBg: "#2563eb",
    maleBadgeBgOpacity: 100,
    cardBg: "#ffffff",
    cardBgOpacity: 100,
    numberTextColor: "#0f172a",
    numberTextColorOpacity: 100,
    nameTextColor: "#0f172a",
    nameTextColorOpacity: 100,
    criteriaHeaderBg: "#f9fafb",
    criteriaHeaderBgOpacity: 100,
    criteriaHeaderTextColor: "#0f172a",
    criteriaHeaderTextColorOpacity: 100,
    criteriaHeaderFontSize: 11,
    criteriaHeaderFontFamily: "sans",
    criteriaTextColor: "#111827",
    criteriaTextColorOpacity: 100,
    criteriaTextFontSize: 13,
    criteriaTextFontFamily: "sans",
    scoringTableBg: "#ffffff",
    scoringTableBgOpacity: 100,
    scoringCategoryRowBg: "#f9fafb",
    scoringCategoryRowBgOpacity: 100,
    scoringTotalRowBg: "#f9fafb",
    scoringTotalRowBgOpacity: 100,
    scoringTotalRowLabelTextColor: "#0f172a",
    scoringTotalRowLabelTextColorOpacity: 100,
    scoringTotalRowScoreTextColor: "#16a34a",
    scoringTotalRowScoreTextColorOpacity: 100,
    scoreInputBg: "#ffffff",
    scoreInputBgOpacity: 100,
    scoreInputBorderColor: "#e2e8f0",
    scoreInputBorderColorOpacity: 100,
    scoreInputTextColor: "#0f172a",
    scoreInputTextColorOpacity: 100,
    modalBodyBg: "#ffffff",
    modalBodyBgOpacity: 100,
    modalFooterBg: "#f9fafb",
    modalFooterBgOpacity: 100,
    modalHeaderBg: "#0f172a",
    modalHeaderBgOpacity: 100,
    modalHeaderPrimaryTextColor: "#f9fafb",
    modalHeaderPrimaryTextColorOpacity: 100,
    modalHeaderSecondaryTextColor: "#94a3b8",
    modalHeaderSecondaryTextColorOpacity: 100,
    modalContestantBadgeBg: "#e2f3ea",
    modalContestantBadgeBgOpacity: 100,
    modalContestantBadgeTextColor: "#14532d",
    modalContestantBadgeTextColorOpacity: 100,
    modalPrimaryButtonBg: "#16a34a",
    modalPrimaryButtonBgOpacity: 100,
    modalPrimaryButtonTextColor: "#ffffff",
    modalPrimaryButtonTextColorOpacity: 100,
    modalSecondaryButtonBg: "#ffffff",
    modalSecondaryButtonBgOpacity: 100,
    modalSecondaryButtonTextColor: "#0f172a",
    modalSecondaryButtonTextColorOpacity: 100,
  },
};

const pageantPlatinumMistLayout: ContestLayout = {
  version: 1,
  templateKey: "pageant",
  theme: {
    workspaceBg: "#2B2E33",
    workspaceBgOpacity: 100,
    femaleGroupBg: "#C1C4C8",
    femaleGroupBgOpacity: 100,
    femaleBadgeBg: "#7B7F85",
    femaleBadgeBgOpacity: 100,
    maleGroupBg: "#C1C4C8",
    maleGroupBgOpacity: 100,
    maleBadgeBg: "#2B2E33",
    maleBadgeBgOpacity: 100,
    cardBg: "#F5F6F7",
    cardBgOpacity: 100,
    numberTextColor: "#FFFFFF",
    numberTextColorOpacity: 100,
    numberBadgeBg: "#2B2E33",
    numberBadgeBgOpacity: 90,
    numberFontSize: 11,
    numberFontFamily: "sans",
    nameTextColor: "#2B2E33",
    nameTextColorOpacity: 100,
    nameFontSize: 11,
    nameFontFamily: "sans",
    criteriaHeaderBg: "#F5F6F7",
    criteriaHeaderBgOpacity: 100,
    criteriaHeaderTextColor: "#2B2E33",
    criteriaHeaderTextColorOpacity: 100,
    criteriaHeaderFontSize: 11,
    criteriaHeaderFontFamily: "sans",
    criteriaTextColor: "#2B2E33",
    criteriaTextColorOpacity: 100,
    criteriaTextFontSize: 13,
    criteriaTextFontFamily: "sans",
    scoringTableBg: "#FFFFFF",
    scoringTableBgOpacity: 100,
    scoringCategoryRowBg: "#F5F6F7",
    scoringCategoryRowBgOpacity: 100,
    scoringTotalRowBg: "#C1C4C8",
    scoringTotalRowBgOpacity: 100,
    scoringTotalRowLabelTextColor: "#2B2E33",
    scoringTotalRowLabelTextColorOpacity: 100,
    scoringTotalRowScoreTextColor: "#7B7F85",
    scoringTotalRowScoreTextColorOpacity: 100,
    scoreInputBg: "#FFFFFF",
    scoreInputBgOpacity: 100,
    scoreInputBorderColor: "#C1C4C8",
    scoreInputBorderColorOpacity: 100,
    scoreInputTextColor: "#2B2E33",
    scoreInputTextColorOpacity: 100,
    modalBodyBg: "#FFFFFF",
    modalBodyBgOpacity: 100,
    modalFooterBg: "#F5F6F7",
    modalFooterBgOpacity: 100,
    modalHeaderBg: "#2B2E33",
    modalHeaderBgOpacity: 100,
    modalHeaderPrimaryTextColor: "#F5F6F7",
    modalHeaderPrimaryTextColorOpacity: 100,
    modalHeaderSecondaryTextColor: "#C1C4C8",
    modalHeaderSecondaryTextColorOpacity: 100,
    modalContestantBadgeBg: "#7B7F85",
    modalContestantBadgeBgOpacity: 100,
    modalContestantBadgeTextColor: "#F5F6F7",
    modalContestantBadgeTextColorOpacity: 100,
    modalPrimaryButtonBg: "#2B2E33",
    modalPrimaryButtonBgOpacity: 100,
    modalPrimaryButtonTextColor: "#F5F6F7",
    modalPrimaryButtonTextColorOpacity: 100,
    modalSecondaryButtonBg: "#FFFFFF",
    modalSecondaryButtonBgOpacity: 100,
    modalSecondaryButtonTextColor: "#2B2E33",
    modalSecondaryButtonTextColorOpacity: 100,
  },
};

const pageantRoyalLayout: ContestLayout = {
  version: 1,
  templateKey: "pageant",
  theme: {
    workspaceBg: "#020617",
    workspaceBgOpacity: 100,
    femaleGroupBg: "#020617",
    femaleGroupBgOpacity: 100,
    femaleBadgeBg: "#EAB308",
    femaleBadgeBgOpacity: 100,
    maleGroupBg: "#020617",
    maleGroupBgOpacity: 100,
    maleBadgeBg: "#1D4ED8",
    maleBadgeBgOpacity: 100,
    cardBg: "#0B1120",
    cardBgOpacity: 100,
    numberTextColor: "#FACC15",
    numberTextColorOpacity: 100,
    numberBadgeBg: "#020617",
    numberBadgeBgOpacity: 100,
    numberFontSize: 11,
    numberFontFamily: "sans",
    nameTextColor: "#F9FAFB",
    nameTextColorOpacity: 100,
    nameFontSize: 11,
    nameFontFamily: "sans",
    criteriaHeaderBg: "#020617",
    criteriaHeaderBgOpacity: 100,
    criteriaHeaderTextColor: "#FACC15",
    criteriaHeaderTextColorOpacity: 100,
    criteriaHeaderFontSize: 11,
    criteriaHeaderFontFamily: "sans",
    criteriaTextColor: "#E5E7EB",
    criteriaTextColorOpacity: 100,
    criteriaTextFontSize: 13,
    criteriaTextFontFamily: "sans",
    scoringTableBg: "#020617",
    scoringTableBgOpacity: 100,
    scoringCategoryRowBg: "#020617",
    scoringCategoryRowBgOpacity: 100,
    scoringTotalRowBg: "#111827",
    scoringTotalRowBgOpacity: 100,
    scoringTotalRowLabelTextColor: "#E5E7EB",
    scoringTotalRowLabelTextColorOpacity: 100,
    scoringTotalRowScoreTextColor: "#FACC15",
    scoringTotalRowScoreTextColorOpacity: 100,
    scoreInputBg: "#020617",
    scoreInputBgOpacity: 100,
    scoreInputBorderColor: "#334155",
    scoreInputBorderColorOpacity: 100,
    scoreInputTextColor: "#F9FAFB",
    scoreInputTextColorOpacity: 100,
    modalBodyBg: "#020617",
    modalBodyBgOpacity: 100,
    modalFooterBg: "#020617",
    modalFooterBgOpacity: 100,
    modalHeaderBg: "#020617",
    modalHeaderBgOpacity: 100,
    modalHeaderPrimaryTextColor: "#FACC15",
    modalHeaderPrimaryTextColorOpacity: 100,
    modalHeaderSecondaryTextColor: "#9CA3AF",
    modalHeaderSecondaryTextColorOpacity: 100,
    modalContestantBadgeBg: "#111827",
    modalContestantBadgeBgOpacity: 100,
    modalContestantBadgeTextColor: "#FACC15",
    modalContestantBadgeTextColorOpacity: 100,
    modalPrimaryButtonBg: "#FACC15",
    modalPrimaryButtonBgOpacity: 100,
    modalPrimaryButtonTextColor: "#111827",
    modalPrimaryButtonTextColorOpacity: 100,
    modalSecondaryButtonBg: "#020617",
    modalSecondaryButtonBgOpacity: 100,
    modalSecondaryButtonTextColor: "#FACC15",
    modalSecondaryButtonTextColorOpacity: 100,
  },
};

const pageantImperialTopazLayout: ContestLayout = {
  version: 1,
  templateKey: "pageant",
  theme: {
    workspaceBg: "#FFD77A",
    workspaceBgOpacity: 100,
    femaleGroupBg: "#FFD77A",
    femaleGroupBgOpacity: 100,
    femaleBadgeBg: "#E6A520",
    femaleBadgeBgOpacity: 100,
    maleGroupBg: "#FFD77A",
    maleGroupBgOpacity: 100,
    maleBadgeBg: "#7A4A00",
    maleBadgeBgOpacity: 100,
    cardBg: "#FFF8E7",
    cardBgOpacity: 100,
    numberTextColor: "#FFF8E7",
    numberTextColorOpacity: 100,
    numberBadgeBg: "#E6A520",
    numberBadgeBgOpacity: 100,
    numberFontSize: 11,
    numberFontFamily: "sans",
    nameTextColor: "#7A4A00",
    nameTextColorOpacity: 100,
    nameFontSize: 11,
    nameFontFamily: "sans",
    criteriaHeaderBg: "#FFF8E7",
    criteriaHeaderBgOpacity: 100,
    criteriaHeaderTextColor: "#7A4A00",
    criteriaHeaderTextColorOpacity: 100,
    criteriaHeaderFontSize: 11,
    criteriaHeaderFontFamily: "sans",
    criteriaTextColor: "#7A4A00",
    criteriaTextColorOpacity: 100,
    criteriaTextFontSize: 13,
    criteriaTextFontFamily: "sans",
    scoringTableBg: "#FFFFFF",
    scoringTableBgOpacity: 100,
    scoringCategoryRowBg: "#FFF8E7",
    scoringCategoryRowBgOpacity: 100,
    scoringTotalRowBg: "#FFD77A",
    scoringTotalRowBgOpacity: 100,
    scoringTotalRowLabelTextColor: "#7A4A00",
    scoringTotalRowLabelTextColorOpacity: 100,
    scoringTotalRowScoreTextColor: "#E6A520",
    scoringTotalRowScoreTextColorOpacity: 100,
    scoreInputBg: "#FFFFFF",
    scoreInputBgOpacity: 100,
    scoreInputBorderColor: "#FFD77A",
    scoreInputBorderColorOpacity: 100,
    scoreInputTextColor: "#7A4A00",
    scoreInputTextColorOpacity: 100,
    modalBodyBg: "#FFFFFF",
    modalBodyBgOpacity: 100,
    modalFooterBg: "#FFF8E7",
    modalFooterBgOpacity: 100,
    modalHeaderBg: "#7A4A00",
    modalHeaderBgOpacity: 100,
    modalHeaderPrimaryTextColor: "#FFF8E7",
    modalHeaderPrimaryTextColorOpacity: 100,
    modalHeaderSecondaryTextColor: "#FFD77A",
    modalHeaderSecondaryTextColorOpacity: 100,
    modalContestantBadgeBg: "#E6A520",
    modalContestantBadgeBgOpacity: 100,
    modalContestantBadgeTextColor: "#7A4A00",
    modalContestantBadgeTextColorOpacity: 100,
    modalPrimaryButtonBg: "#E6A520",
    modalPrimaryButtonBgOpacity: 100,
    modalPrimaryButtonTextColor: "#7A4A00",
    modalPrimaryButtonTextColorOpacity: 100,
    modalSecondaryButtonBg: "#FFFFFF",
    modalSecondaryButtonBgOpacity: 100,
    modalSecondaryButtonTextColor: "#7A4A00",
    modalSecondaryButtonTextColorOpacity: 100,
  },
};

type ContestLayoutRow = {
  contest_id: number;
  layout_json: ContestLayout;
};

type LayoutTemplateRow = {
  id: number;
  name: string;
  layout_json: ContestLayout;
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

type AdminRow = {
  id: number;
  username: string;
  created_at: string;
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

type JudgeAssignmentRow = {
  judge_id: number;
  contest_id: number;
};

type TabulatorRow = {
  id: number;
  event_id: number;
  full_name: string;
  username: string;
  created_at: string;
};

type AdminPendingAction =
  | { type: "create" }
  | { type: "edit"; adminId: number }
  | { type: "delete"; adminId: number };

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
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [judges, setJudges] = useState<JudgeRow[]>([]);
  const [tabulators, setTabulators] = useState<TabulatorRow[]>([]);
  const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(
    null,
  );
  const [editingCriteriaCategory, setEditingCriteriaCategory] = useState<string>("");
  const [editingContestId, setEditingContestId] = useState<number | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingParticipantId, setEditingParticipantId] = useState<number | null>(
    null,
  );
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [editingJudgeId, setEditingJudgeId] = useState<number | null>(null);
  const [editingTabulatorId, setEditingTabulatorId] = useState<number | null>(
    null,
  );
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
  const [judgeRole, setJudgeRole] = useState<"chairman" | "judge">("judge");
  const [isSavingJudge, setIsSavingJudge] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);
  const [judgeSuccess, setJudgeSuccess] = useState<string | null>(null);
  const [selectedContestIdsForJudge, setSelectedContestIdsForJudge] = useState<
    number[]
  >([]);
  const [judgeAssignments, setJudgeAssignments] = useState<JudgeAssignmentRow[]>(
    [],
  );
  const [judgeScoringPermissions, setJudgeScoringPermissions] = useState<
    JudgeScoringPermissionRow[]
  >([]);
  const [isDeletingJudgeId, setIsDeletingJudgeId] = useState<number | null>(
    null,
  );
  const [tabulatorFullName, setTabulatorFullName] = useState("");
  const [tabulatorUsername, setTabulatorUsername] = useState("");
  const [tabulatorPassword, setTabulatorPassword] = useState("");
  const [isSavingTabulator, setIsSavingTabulator] = useState(false);
  const [tabulatorError, setTabulatorError] = useState<string | null>(null);
  const [tabulatorSuccess, setTabulatorSuccess] = useState<string | null>(null);
  const [isDeletingTabulatorId, setIsDeletingTabulatorId] = useState<
    number | null
  >(null);
  const [contestName, setContestName] = useState("");
  const [contestCategoryText, setContestCategoryText] = useState("");
  const [contestDivisionNames, setContestDivisionNames] = useState<string[]>(
    [],
  );
  const [contestScoringType, setContestScoringType] =
    useState<ContestScoringType>("percentage");
  const [isSavingContest, setIsSavingContest] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  const [contestSuccess, setContestSuccess] = useState<string | null>(null);
  const [selectedContestIdForCriteria, setSelectedContestIdForCriteria] =
    useState<number | null>(null);
  const [criteriaName, setCriteriaName] = useState("");
  const [criteriaWeight, setCriteriaWeight] = useState("");
  const [criteriaDescription, setCriteriaDescription] = useState("");
  const [criteriaCategory, setCriteriaCategory] = useState("");
  const [isSavingCriteria, setIsSavingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [criteriaSuccess, setCriteriaSuccess] = useState<string | null>(null);
  const [criteriaItems, setCriteriaItems] = useState<
    { name: string; weight: string }[]
  >([{ name: "", weight: "" }]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [awardRecipients, setAwardRecipients] = useState<AwardRecipientRow[]>(
    [],
  );
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState<number | null>(null);
  const [awardName, setAwardName] = useState("");
  const [awardType, setAwardType] = useState<AwardType>("criteria");
  const [awardContestId, setAwardContestId] = useState<number | null>(null);
  const [awardCriteriaIds, setAwardCriteriaIds] = useState<number[]>([]);
  const [expandedAwardCategories, setExpandedAwardCategories] = useState<Set<string>>(new Set());
  const [isAwardCriteriaDropdownOpen, setIsAwardCriteriaDropdownOpen] = useState(false);
  const awardCriteriaDropdownRef = useRef<HTMLDivElement>(null);
  const [awardDescription, setAwardDescription] = useState("");
  const [awardIsActive, setAwardIsActive] = useState(true);
  const [awardError, setAwardError] = useState<string | null>(null);
  const [awardSuccess, setAwardSuccess] = useState<string | null>(null);
  const [isSavingAward, setIsSavingAward] = useState(false);
  const [isDeletingAwardId, setIsDeletingAwardId] = useState<number | null>(
    null,
  );
  const [awardsTabulationError, setAwardsTabulationError] = useState<
    string | null
  >(null);
  const [awardsTabulationSuccess, setAwardsTabulationSuccess] = useState<
    string | null
  >(null);
  const [isConfirmingAwardId, setIsConfirmingAwardId] = useState<number | null>(
    null,
  );
  const [selectedContestIdForTemplate, setSelectedContestIdForTemplate] =
    useState<number | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] =
    useState<ContestLayoutTemplateKey>("standard");
  const [templateTheme, setTemplateTheme] = useState<ContestLayoutTheme>({});
  const pendingTemplateThemeRef = useRef<Partial<ContestLayoutTheme> | null>(
    null,
  );
  const templateThemeTimeoutRef = useRef<number | null>(null);
  const [openPageantSections, setOpenPageantSections] = useState<
    Record<PageantSettingsSection, boolean>
  >({
    groupsAndBadges: false,
    cardsAndNames: false,
    participantName: false,
    criteriaHeaderAndRows: false,
    scoringTable: false,
    scoringModal: false,
  });
  const updateTemplateTheme = useCallback(
    (partial: Partial<ContestLayoutTheme>) => {
      pendingTemplateThemeRef.current = {
        ...(pendingTemplateThemeRef.current ?? {}),
        ...partial,
      };

      if (templateThemeTimeoutRef.current === null) {
        templateThemeTimeoutRef.current = window.setTimeout(() => {
          const updates = pendingTemplateThemeRef.current;
          if (updates) {
            setTemplateTheme((previous) => ({
              ...previous,
              ...updates,
            }));
          }
          pendingTemplateThemeRef.current = null;
          templateThemeTimeoutRef.current = null;
        }, 50);
      }
    },
    [],
  );
  const handleTogglePageantSection = useCallback(
    (section: PageantSettingsSection) => {
      setOpenPageantSections((previous) => ({
        ...previous,
        [section]: !previous[section],
      }));
    },
    [],
  );
  const [templateModalParticipant, setTemplateModalParticipant] =
    useState<ParticipantRow | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templateSuccess, setTemplateSuccess] = useState<string | null>(null);
  const [layoutTemplates, setLayoutTemplates] = useState<LayoutTemplateRow[]>(
    [],
  );
  const [templateName, setTemplateName] = useState("");
  const [isDeletingTemplateId, setIsDeletingTemplateId] = useState<number | null>(
    null,
  );
  const [isSavingTemplateToLibrary, setIsSavingTemplateToLibrary] =
    useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [isDeletingCategoryId, setIsDeletingCategoryId] = useState<number | null>(
    null,
  );
  const [selectedContestIdForParticipant, setSelectedContestIdForParticipant] =
    useState<number | null>(null);
  const [selectedCategoryIdForParticipant, setSelectedCategoryIdForParticipant] =
    useState<number | null>(null);
  const [selectedTeamIdForParticipant, setSelectedTeamIdForParticipant] =
    useState<number | null>(null);
  const [participantFullName, setParticipantFullName] = useState("");
  const [participantNumber, setParticipantNumber] = useState("");
  const [participantAvatarUrl, setParticipantAvatarUrl] = useState("");
  const [participantAvatarZoom, setParticipantAvatarZoom] = useState(1.1);
  const [isUploadingParticipantAvatar, setIsUploadingParticipantAvatar] =
    useState(false);
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [participantSuccess, setParticipantSuccess] = useState<string | null>(
    null,
  );
  const [isDeletingParticipantId, setIsDeletingParticipantId] = useState<
    number | null
  >(null);
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

  const activeJudgeIdForPermissions =
    selectedJudgeIdsForPermissions.length === 1
      ? selectedJudgeIdsForPermissions[0]
      : null;
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [isDeletingAdminId, setIsDeletingAdminId] = useState<number | null>(
    null,
  );
  const [isAdminGuardModalOpen, setIsAdminGuardModalOpen] = useState(false);
  const [adminGuardPassword, setAdminGuardPassword] = useState("");
  const [adminGuardError, setAdminGuardError] = useState<string | null>(null);
  const [isVerifyingAdminGuard, setIsVerifyingAdminGuard] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] =
    useState<AdminPendingAction | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilterYear, setEventFilterYear] = useState("all");
  const [eventFilterMonth, setEventFilterMonth] = useState("all");
  const [isJudgeContestModalOpen, setIsJudgeContestModalOpen] = useState(false);
  const [judgeContestSearch, setJudgeContestSearch] = useState("");
  const [judgeContestSubmissions, setJudgeContestSubmissions] = useState<
    JudgeContestSubmissionRow[]
  >([]);
  const [tabulationEventFilterId, setTabulationEventFilterId] = useState<
    number | "all"
  >("all");
  const [tabulationContestFilterId, setTabulationContestFilterId] = useState<
    number | "all"
  >("all");
  const [selectedJudgeForBreakdown, setSelectedJudgeForBreakdown] = useState<number | null>(null);
  const [tabulationDivisionFilterId, setTabulationDivisionFilterId] = useState<
    number | "all"
  >("all");
  const [adminTabulationView, setAdminTabulationView] = useState<
    "overall" | "awards"
  >("awards");
  const [tabulationAwardFilterId, setTabulationAwardFilterId] = useState<
    number | "all"
  >("all");
  const [judgeTotals, setJudgeTotals] = useState<JudgeParticipantTotalRow[]>([]);

  const [scores, setScores] = useState<ScoreRow[]>([]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase
      .from("score")
      .select("id, judge_id, participant_id, criteria_id, score, created_at")
      .then(({ data }) => {
        if (data) {
          setScores(data as ScoreRow[]);
        }
      });

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
      .select("id, event_id, name, created_at, contest_code, scoring_type")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setContests(data as ContestRow[]);
        }
      });

    supabase
      .from("criteria")
      .select(
        "id, contest_id, name, percentage, created_at, description, criteria_code, category",
      )
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setCriteriaList(data as CriteriaRow[]);
        }
      });

    supabase
      .from("award")
      .select(
        "id, event_id, contest_id, name, description, award_type, criteria_id, criteria_ids, is_active, created_at",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAwards(data as AwardRow[]);
        }
      });

    supabase
      .from("award_recipient")
      .select("id, award_id, participant_id, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAwardRecipients(data as AwardRecipientRow[]);
        }
      });

    supabase
      .from("division")
      .select("id, event_id, name, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCategories(data as CategoryRow[]);
        }
      });

    supabase
      .from("team")
      .select("id, event_id, name, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTeams(data as TeamRow[]);
        }
      });

    supabase
      .from("participant")
      .select(
        "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setParticipants(data as ParticipantRow[]);
        }
      });

    supabase
      .from("user_admin")
      .select("id, username, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAdmins(data as AdminRow[]);
        }
      });

    supabase
      .from("user_judge")
      .select("id, event_id, full_name, username, role, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setJudges(data as JudgeRow[]);
        }
      });

    supabase
      .from("user_tabulator")
      .select("id, event_id, full_name, username, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTabulators(data as TabulatorRow[]);
        }
      });

    supabase
      .from("judge_assignment")
      .select("judge_id, contest_id")
      .then(({ data }) => {
        if (data) {
          setJudgeAssignments(data as JudgeAssignmentRow[]);
        }
      });

    supabase
      .from("judge_scoring_permission")
      .select("judge_id, contest_id, criteria_id, can_edit, created_at")
      .then(({ data }) => {
        if (data) {
          setJudgeScoringPermissions(data as JudgeScoringPermissionRow[]);
        }
      });

    supabase
      .from("judge_contest_submission")
      .select("judge_id, contest_id, submitted_at")
      .then(({ data }) => {
        if (data) {
          setJudgeContestSubmissions(data as JudgeContestSubmissionRow[]);
        }
      });

    supabase
      .from("judge_participant_total")
      .select(
        "id, judge_id, participant_id, contest_id, total_score, created_at",
      )
      .then(({ data }) => {
        if (data) {
          setJudgeTotals(data as JudgeParticipantTotalRow[]);
        }
      });

    supabase
      .from("judge_division_permission")
      .select("id, judge_id, contest_id, division_id, created_at")
      .then(({ data }) => {
        if (data) {
          setJudgeDivisionPermissions(data as JudgeDivisionPermissionRow[]);
        }
      });

    supabase
      .from("judge_participant_permission")
      .select("id, judge_id, contest_id, participant_id, created_at")
      .then(({ data }) => {
        if (data) {
          setJudgeParticipantPermissions(
            data as JudgeParticipantPermissionRow[],
          );
        }
      });

    supabase
      .from("layout_template")
      .select("id, name, layout_json, created_at")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          return;
        }

        if (data && data.length > 0) {
          const typed = data as LayoutTemplateRow[];

          const defaultTemplate = typed.find(
            (template) => template.name === "Pageant \u2013 Default",
          );

          if (defaultTemplate) {
            await supabase
              .from("layout_template")
              .update({ layout_json: pageantDefaultLayout })
              .eq("id", defaultTemplate.id);

            defaultTemplate.layout_json = pageantDefaultLayout;
          }

          const platinumTemplate = typed.find((template) => {
            const nameLower = template.name.toLowerCase();
            return nameLower.includes("platinum") && nameLower.includes("mist");
          });

          if (platinumTemplate) {
            await supabase
              .from("layout_template")
              .update({ layout_json: pageantPlatinumMistLayout })
              .eq("id", platinumTemplate.id);

            platinumTemplate.layout_json = pageantPlatinumMistLayout;
          } else {
            const { data: insertedPlatinum, error: insertPlatinumError } =
              await supabase
                .from("layout_template")
                .insert({
                  name: "Platinum Mist",
                  layout_json: pageantPlatinumMistLayout,
                })
                .select("id, name, layout_json, created_at")
                .single();

            if (!insertPlatinumError && insertedPlatinum) {
              typed.unshift(insertedPlatinum as LayoutTemplateRow);
            }
          }

          const imperialTemplate = typed.find((template) => {
            const nameLower = template.name.toLowerCase();
            return nameLower.includes("imperial") && nameLower.includes("topaz");
          });

          if (imperialTemplate) {
            await supabase
              .from("layout_template")
              .update({ layout_json: pageantImperialTopazLayout })
              .eq("id", imperialTemplate.id);

            imperialTemplate.layout_json = pageantImperialTopazLayout;
          } else {
            const { data: insertedImperial, error: insertImperialError } =
              await supabase
                .from("layout_template")
                .insert({
                  name: "Imperial Topaz",
                  layout_json: pageantImperialTopazLayout,
                })
                .select("id, name, layout_json, created_at")
                .single();

            if (!insertImperialError && insertedImperial) {
              typed.unshift(insertedImperial as LayoutTemplateRow);
            }
          }

          const royalTemplate = typed.find((template) => {
            const nameLower = template.name.toLowerCase();
            return nameLower.includes("royal");
          });

          if (royalTemplate) {
            await supabase
              .from("layout_template")
              .update({ layout_json: pageantRoyalLayout })
              .eq("id", royalTemplate.id);

            royalTemplate.layout_json = pageantRoyalLayout;
          } else {
            const { data: insertedRoyal, error: insertRoyalError } =
              await supabase
                .from("layout_template")
                .insert({
                  name: "Royal",
                  layout_json: pageantRoyalLayout,
                })
                .select("id, name, layout_json, created_at")
                .single();

            if (!insertRoyalError && insertedRoyal) {
              typed.unshift(insertedRoyal as LayoutTemplateRow);
            }
          }

          setLayoutTemplates(typed);
          return;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("layout_template")
          .insert([
            {
              name: "Pageant \u2013 Default",
              layout_json: pageantDefaultLayout,
            },
            {
              name: "Platinum Mist",
              layout_json: pageantPlatinumMistLayout,
            },
            {
              name: "Imperial Topaz",
              layout_json: pageantImperialTopazLayout,
            },
            {
              name: "Royal",
              layout_json: pageantRoyalLayout,
            },
          ])
          .select("id, name, layout_json, created_at");

        if (!insertError && inserted) {
          setLayoutTemplates(inserted as LayoutTemplateRow[]);
        }
      });

    const channel = supabase
      .channel("admin-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as EventRow;
            setEvents((previous) => {
              const exists = previous.some((event) => event.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((event) =>
                event.id === newRow.id ? newRow : event,
              );
            });

            if (newRow.is_active) {
              setActiveEventId(newRow.id);
            } else if (payload.eventType === "UPDATE") {
              setActiveEventId((current) =>
                current === newRow.id ? null : current,
              );
            }
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setEvents((previous) =>
              previous.filter((event) => event.id !== oldRow.id),
            );
            setActiveEventId((current) =>
              current === oldRow.id ? null : current,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contest",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as ContestRow;
            setContests((previous) => {
              const exists = previous.some((contest) => contest.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((contest) =>
                contest.id === newRow.id ? newRow : contest,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setContests((previous) =>
              previous.filter((contest) => contest.id !== oldRow.id),
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
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as CriteriaRow;
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
            const oldRow = payload.old as { id: number };
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
              const exists = previous.some((award) => award.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((award) =>
                award.id === newRow.id ? newRow : award,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setAwards((previous) =>
              previous.filter((award) => award.id !== oldRow.id),
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
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as CategoryRow;
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
            const oldRow = payload.old as { id: number };
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
          table: "team",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as TeamRow;
            setTeams((previous) => {
              const exists = previous.some((team) => team.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((team) =>
                team.id === newRow.id ? newRow : team,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setTeams((previous) =>
              previous.filter((team) => team.id !== oldRow.id),
            );
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
            const oldRow = payload.old as { id: number };
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
          table: "user_admin",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as AdminRow;
            setAdmins((previous) => {
              const exists = previous.some((admin) => admin.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((admin) =>
                admin.id === newRow.id ? newRow : admin,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setAdmins((previous) =>
              previous.filter((admin) => admin.id !== oldRow.id),
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
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as JudgeRow;
            setJudges((previous) => {
              const exists = previous.some((judge) => judge.id === newRow.id);

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((judge) =>
                judge.id === newRow.id ? newRow : judge,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setJudges((previous) =>
              previous.filter((judge) => judge.id !== oldRow.id),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_tabulator",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as TabulatorRow;
            setTabulators((previous) => {
              const exists = previous.some(
                (tabulator) => tabulator.id === newRow.id,
              );

              if (payload.eventType === "INSERT" && !exists) {
                return [newRow, ...previous];
              }

              return previous.map((tabulator) =>
                tabulator.id === newRow.id ? newRow : tabulator,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number };
            setTabulators((previous) =>
              previous.filter((tabulator) => tabulator.id !== oldRow.id),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "judge_assignment",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as JudgeAssignmentRow;
            setJudgeAssignments((previous) => {
              const exists = previous.some(
                (assignment) =>
                  assignment.judge_id === newRow.judge_id &&
                  assignment.contest_id === newRow.contest_id,
              );

              if (payload.eventType === "INSERT" && !exists) {
                return [...previous, newRow];
              }

              return previous.map((assignment) =>
                assignment.judge_id === newRow.judge_id &&
                assignment.contest_id === newRow.contest_id
                  ? newRow
                  : assignment,
              );
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as JudgeAssignmentRow;
            setJudgeAssignments((previous) =>
              previous.filter(
                (assignment) =>
                  !(
                    assignment.judge_id === oldRow.judge_id &&
                    assignment.contest_id === oldRow.contest_id
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
          table: "judge_scoring_permission",
        },
        (payload) => {
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
          table: "judge_participant_total",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as JudgeParticipantTotalRow;
            setJudgeTotals((previous) => {
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
            setJudgeTotals((previous) =>
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
          table: "judge_division_permission",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as JudgeDivisionPermissionRow;
            setJudgeDivisionPermissions((previous) => {
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
                return [newRow, ...previous];
              }

              return previous.map((row) => (row.id === newRow.id ? newRow : row));
            });
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: number } | null;
            if (!oldRow) {
              return;
            }
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
          table: "award_recipient",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newRow = payload.new as AwardRecipientRow;
            setAwardRecipients((previous) => {
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
            setAwardRecipients((previous) =>
              previous.filter((row) => row.id !== oldRow.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (
      activeJudgeIdForPermissions === null ||
      selectedContestIdForPermissions === null
    ) {
      setJudgeDivisionMode("all");
      setJudgeDivisionIds([]);
      setJudgeParticipantMode("all");
      setJudgeParticipantIds([]);
      return;
    }

    const divisionPermissionsForSelection = judgeDivisionPermissions.filter(
      (permission) =>
        permission.judge_id === activeJudgeIdForPermissions &&
        permission.contest_id === selectedContestIdForPermissions,
    );

    if (divisionPermissionsForSelection.length === 0) {
      setJudgeDivisionMode("all");
      setJudgeDivisionIds([]);
    } else {
      setJudgeDivisionMode("custom");
      setJudgeDivisionIds(
        divisionPermissionsForSelection.map((permission) => permission.division_id),
      );
    }

    const participantPermissionsForSelection =
      judgeParticipantPermissions.filter(
        (permission) =>
          permission.judge_id === activeJudgeIdForPermissions &&
          permission.contest_id === selectedContestIdForPermissions,
      );

    if (participantPermissionsForSelection.length === 0) {
      setJudgeParticipantMode("all");
      setJudgeParticipantIds([]);
    } else {
      setJudgeParticipantMode("custom");
      setJudgeParticipantIds(
        participantPermissionsForSelection.map(
          (permission) => permission.participant_id,
        ),
      );
    }
  }, [
    activeJudgeIdForPermissions,
    selectedJudgeIdsForPermissions,
    selectedContestIdForPermissions,
    judgeDivisionPermissions,
    judgeParticipantPermissions,
  ]);

  useEffect(() => {
    const allCriteriaIdsForContest =
      selectedContestIdForPermissions !== null
        ? criteriaList
            .filter((c) => c.contest_id === selectedContestIdForPermissions)
            .map((c) => c.id)
        : [];

    if (selectedContestIdForPermissions === null) {
      setJudgePermissionsCriteriaIds([]);
      setJudgePermissionsMode("all");
      return;
    }

    // When no single judge is selected, sample any judge's permissions for this contest
    const permissionsForSelection = activeJudgeIdForPermissions !== null
      ? judgeScoringPermissions.filter(
          (permission) =>
            permission.judge_id === activeJudgeIdForPermissions &&
            permission.contest_id === selectedContestIdForPermissions,
        )
      : judgeScoringPermissions.filter(
          (permission) =>
            permission.contest_id === selectedContestIdForPermissions,
        );

    if (permissionsForSelection.length === 0) {
      setJudgePermissionsMode("all");
      setJudgePermissionsCriteriaIds(allCriteriaIdsForContest);
      return;
    }

    const globalPermission = permissionsForSelection.find(
      (permission) => permission.criteria_id === null,
    );

    const perCriteriaUnlocks = permissionsForSelection
      .filter(
        (permission) =>
          permission.criteria_id !== null && permission.can_edit,
      )
      .map((permission) => permission.criteria_id as number);

    // Deduplicate (multiple judges may have the same criteria unlocked)
    const uniqueCriteriaUnlocks = [...new Set(perCriteriaUnlocks)];

    if (globalPermission) {
      if (globalPermission.can_edit) {
        setJudgePermissionsMode("all");
        setJudgePermissionsCriteriaIds(allCriteriaIdsForContest);
      } else {
        setJudgePermissionsMode("custom");
        setJudgePermissionsCriteriaIds(uniqueCriteriaUnlocks);
      }
      return;
    }

    setJudgePermissionsMode("custom");
    setJudgePermissionsCriteriaIds(uniqueCriteriaUnlocks);
  }, [
    activeJudgeIdForPermissions,
    selectedJudgeIdsForPermissions,
    selectedContestIdForPermissions,
    judgeScoringPermissions,
    criteriaList,
  ]);

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
    const initialDivisions = categoriesForActiveEvent
      .map((division) => division.name)
      .slice()
      .sort((a, b) => a.localeCompare(b));

    setEditingContestId(null);
    setContestName("");
    setContestCategoryText("");
    setContestDivisionNames(initialDivisions);
    setContestScoringType("percentage");
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
    setCriteriaCategory("");
    setCriteriaItems([{ name: "", weight: "" }]);
    setCriteriaError(null);
    setCriteriaSuccess(null);
    setIsCriteriaModalOpen(true);
  };

  const openCreateCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryError(null);
    setCategorySuccess(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (team: TeamRow) => {
    setEditingCategoryId(team.id);
    setCategoryName(team.name);
    setCategoryError(null);
    setCategorySuccess(null);
    setIsCategoryModalOpen(true);
  };

  const openCreateParticipantModal = () => {
    setEditingParticipantId(null);
    setSelectedContestIdForParticipant(null);
    setSelectedCategoryIdForParticipant(null);
    setSelectedTeamIdForParticipant(null);
    setParticipantFullName("");
    setParticipantNumber("");
    setParticipantAvatarUrl("");
    setParticipantAvatarZoom(1.1);
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsParticipantModalOpen(true);
  };

  const openEditParticipantModal = (participant: ParticipantRow) => {
    setEditingParticipantId(participant.id);
    setSelectedContestIdForParticipant(participant.contest_id);
    setSelectedCategoryIdForParticipant(participant.division_id);
    setSelectedTeamIdForParticipant(participant.team_id);
    setParticipantFullName(participant.full_name);
    setParticipantNumber(participant.contestant_number);
    setParticipantAvatarUrl(participant.avatar_url ?? "");
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsParticipantModalOpen(true);
  };

  const openCreateAdminModal = () => {
    setEditingAdminId(null);
    setAdminUsername("");
    setAdminPassword("");
    setAdminError(null);
    setAdminSuccess(null);
    setIsAdminModalOpen(true);
  };

  const openEditAdminModal = (admin: AdminRow) => {
    setEditingAdminId(admin.id);
    setAdminUsername(admin.username);
    setAdminPassword("");
    setAdminError(null);
    setAdminSuccess(null);
    setIsAdminModalOpen(true);
  };

  const openCreateJudgeModal = () => {
    setEditingJudgeId(null);
    setJudgeFullName("");
    setJudgeUsername("");
    setJudgePassword("");
    setJudgeRole("judge");
    setJudgeError(null);
    setJudgeSuccess(null);
    setSelectedContestIdsForJudge([]);
    setIsJudgeModalOpen(true);
  };

  const openEditJudgeModal = (judge: JudgeRow) => {
    setEditingJudgeId(judge.id);
    setJudgeFullName(judge.full_name);
    setJudgeUsername(judge.username);
    setJudgePassword("");
    setJudgeRole(judge.role || "judge");
    setJudgeError(null);
    setJudgeSuccess(null);
    setSelectedContestIdsForJudge(
      judgeAssignments
        .filter((assignment) => assignment.judge_id === judge.id)
        .map((assignment) => assignment.contest_id),
    );
    setIsJudgeModalOpen(true);
  };

  const openCreateTabulatorModal = () => {
    setEditingTabulatorId(null);
    setTabulatorFullName("");
    setTabulatorUsername("");
    setTabulatorPassword("");
    setTabulatorError(null);
    setTabulatorSuccess(null);
    setIsTabulatorModalOpen(true);
  };

  const openEditTabulatorModal = (tabulator: TabulatorRow) => {
    setEditingTabulatorId(tabulator.id);
    setTabulatorFullName(tabulator.full_name);
    setTabulatorUsername(tabulator.username);
    setTabulatorPassword("");
    setTabulatorError(null);
    setTabulatorSuccess(null);
    setIsTabulatorModalOpen(true);
  };

  const requireAdminGuard = (action: AdminPendingAction) => {
    setPendingAdminAction(action);
    setAdminGuardPassword("");
    setAdminGuardError(null);
    setIsAdminGuardModalOpen(true);
  };

  const handleVerifyAdminGuard = async () => {
    setAdminGuardError(null);

    if (!adminGuardPassword) {
      setAdminGuardError("Please enter your admin password.");
      return;
    }

    if (typeof window === "undefined") {
      setAdminGuardError("No admin session found. Please sign in again.");
      return;
    }

    const storedAdminUsername = window.localStorage.getItem("admin_username");

    if (!storedAdminUsername) {
      setAdminGuardError("No admin session found. Please sign in again.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAdminGuardError("Supabase is not configured.");
      return;
    }

    setIsVerifyingAdminGuard(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.rpc("authenticate_admin", {
      p_username: storedAdminUsername,
      p_password: adminGuardPassword,
    });

    setIsVerifyingAdminGuard(false);

    if (error) {
      setAdminGuardError(error.message || "Unable to verify admin credentials.");
      return;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      setAdminGuardError("Invalid admin password.");
      return;
    }

    const action = pendingAdminAction;
    setPendingAdminAction(null);
    setIsAdminGuardModalOpen(false);
    setAdminGuardPassword("");

    if (action) {
      if (action.type === "create") {
        openCreateAdminModal();
      } else if (action.type === "edit") {
        const target = admins.find((admin) => admin.id === action.adminId);
        if (target) {
          openEditAdminModal(target);
        }
      } else if (action.type === "delete") {
        await handleDeleteAdmin(action.adminId);
      }
    }
  };

  const openEditCriteriaModal = (criteria: CriteriaRow) => {
    setEditingCriteriaId(criteria.id);
    setSelectedContestIdForCriteria(criteria.contest_id);
    setCriteriaName(criteria.name);
    setCriteriaWeight(String(criteria.percentage));
    setCriteriaDescription(criteria.description ?? "");
    setCriteriaCategory(criteria.category ?? "");
    setCriteriaItems([
      { name: criteria.name, weight: String(criteria.percentage) },
    ]);
    setCriteriaCategory(criteria.category ?? "");
    setCriteriaError(null);
    setCriteriaSuccess(null);
    setIsCriteriaModalOpen(true);
  };

  const handleAddCriteriaItem = () => {
    setCriteriaItems((previous) => [...previous, { name: "", weight: "" }]);
  };

  const handleChangeCriteriaItem = (
    index: number,
    field: "name" | "weight",
    value: string,
  ) => {
    setCriteriaItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const openEditContestModal = (contest: ContestRow) => {
    const initialDivisions = categoriesForActiveEvent
      .map((division) => division.name)
      .slice()
      .sort((a, b) => a.localeCompare(b));

    setEditingContestId(contest.id);
    setContestName(contest.name);
    setContestCategoryText("");
    setContestDivisionNames(initialDivisions);
    setContestScoringType(contest.scoring_type ?? "percentage");
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

  // Force filters to respect active event
  useEffect(() => {
    if (activeEventId) {
        setTabulationEventFilterId(activeEventId);
    }
  }, [activeEventId]);

  const contestsForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? contests
        : contests.filter((contest) => contest.event_id === activeEventId),
    [contests, activeEventId],
  );

  const criteriaForActiveEvent = useMemo(() => {
    if (activeEventId === null) {
      return criteriaList;
    }

    const contestIdsForEvent = new Set(
      contests
        .filter((contest) => contest.event_id === activeEventId)
        .map((contest) => contest.id),
    );

    return criteriaList.filter((criteria) =>
      contestIdsForEvent.has(criteria.contest_id),
    );
  }, [criteriaList, contests, activeEventId]);

  const criteriaValueHeader = useMemo(() => {
    if (criteriaForActiveEvent.length === 0) {
      return "Weight (%)";
    }

    let hasPoints = false;
    let hasPercentage = false;

    for (const criteria of criteriaForActiveEvent) {
      const contest = contests.find(
        (contest) => contest.id === criteria.contest_id,
      );
      const scoringType = contest?.scoring_type ?? "percentage";

      if (scoringType === "points") {
        hasPoints = true;
      } else {
        hasPercentage = true;
      }
    }

    if (hasPoints && !hasPercentage) {
      return "Points";
    }
    if (!hasPoints && hasPercentage) {
      return "Weight (%)";
    }
    return "Weight / points";
  }, [criteriaForActiveEvent, contests]);

  const teamsForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? teams
        : teams.filter((team) => team.event_id === activeEventId),
    [teams, activeEventId],
  );

  const categoriesForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? categories
        : categories.filter((category) => category.event_id === activeEventId),
    [categories, activeEventId],
  );

  const participantsForActiveEvent = useMemo(() => {
    if (activeEventId === null) {
      return participants;
    }

    const contestIdsForEvent = new Set(
      contests
        .filter((contest) => contest.event_id === activeEventId)
        .map((contest) => contest.id),
    );

    return participants.filter((participant) =>
      contestIdsForEvent.has(participant.contest_id),
    );
  }, [participants, contests, activeEventId]);

  const judgesForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? judges
        : judges.filter((judge) => judge.event_id === activeEventId),
    [judges, activeEventId],
  );

  const tabulatorsForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? tabulators
        : tabulators.filter((tabulator) => tabulator.event_id === activeEventId),
    [tabulators, activeEventId],
  );

  const awardsForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? awards
        : awards.filter((award) => award.event_id === activeEventId),
    [awards, activeEventId],
  );

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    if (!selectedContestIdForTemplate) {
      setSelectedTemplateKey("standard");
      setTemplateTheme({});
      setSelectedTemplateId(null);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    supabase
      .from("contest_layout")
      .select("contest_id, layout_json")
      .eq("contest_id", selectedContestIdForTemplate)
      .limit(1)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          setSelectedTemplateKey("standard");
          setTemplateTheme({});
          return;
        }

        const row = data[0] as ContestLayoutRow;
        const layout = row.layout_json;
        const templateKey = layout.templateKey;

        if (templateKey === "standard" || templateKey === "pageant") {
          setSelectedTemplateKey(templateKey);
        } else {
          setSelectedTemplateKey("standard");
        }

        setSelectedTemplateId(layout.templateId ?? null);
        setTemplateTheme(layout.theme ?? {});
        setTemplateModalParticipant(null);
      });
  }, [selectedContestIdForTemplate]);

  const tabulationRows = useMemo(() => {
    const contestFilterId =
      tabulationContestFilterId === "all" ? null : tabulationContestFilterId;
    const eventFilterId =
      tabulationEventFilterId === "all" ? null : tabulationEventFilterId;

    const contestIds = new Set(
      contests
        .filter((contest) => {
          if (eventFilterId !== null && contest.event_id !== eventFilterId) {
            return false;
          }
          if (contestFilterId !== null && contest.id !== contestFilterId) {
            return false;
          }
          return true;
        })
        .map((contest) => contest.id),
    );

    if (contestIds.size === 0) {
      return [];
    }

    let relevantParticipants = participants.filter((participant) =>
      contestIds.has(participant.contest_id),
    );

    if (tabulationDivisionFilterId !== "all") {
      relevantParticipants = relevantParticipants.filter(
        (participant) => participant.division_id === tabulationDivisionFilterId,
      );
    }

    if (relevantParticipants.length === 0) {
      return [];
    }

    const totalsByParticipantAndContest = new Map<
      string,
      { sum: number; count: number; judgeScores: Record<number, number> }
    >();

    for (const totalRow of judgeTotals) {
      if (!contestIds.has(totalRow.contest_id)) {
        continue;
      }

      const key = `${totalRow.contest_id}-${totalRow.participant_id}`;
      const existing = totalsByParticipantAndContest.get(key) ?? {
        sum: 0,
        count: 0,
        judgeScores: {},
      };
      
      existing.judgeScores[totalRow.judge_id] = Number(totalRow.total_score);
      
      totalsByParticipantAndContest.set(key, {
        sum: existing.sum + Number(totalRow.total_score),
        count: existing.count + 1,
        judgeScores: existing.judgeScores,
      });
    }

    type Row = {
      contestId: number;
      contestName: string;
      categoryName: string;
      teamName: string | null;
      participantId: number;
      participantName: string;
      contestantNumber: string;
      totalScore: number;
      rank: number;
      judgeScores: Record<number, number>;
    };

    const rows: Row[] = [];

    for (const participant of relevantParticipants) {
      const key = `${participant.contest_id}-${participant.id}`;
      const totalsForParticipant = totalsByParticipantAndContest.get(key);

      if (!totalsForParticipant) {
        continue;
      }

      const contest = contests.find(
        (contestRow) => contestRow.id === participant.contest_id,
      );

      if (!contest) {
        continue;
      }

      const category = categories.find(
        (categoryRow) => categoryRow.id === participant.division_id,
      );

      const team = teams.find(
        (teamRow) => teamRow.id === participant.team_id,
      );

      const average =
        totalsForParticipant.count === 0
          ? 0
          : totalsForParticipant.sum / totalsForParticipant.count;

      rows.push({
        contestId: contest.id,
        contestName: contest.name,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        participantId: participant.id,
        participantName: participant.full_name,
        contestantNumber: participant.contestant_number,
        totalScore: Number(average.toFixed(2)),
        rank: 0,
        judgeScores: totalsForParticipant.judgeScores,
      });
    }

    const rowsByContest = new Map<number, Row[]>();

    for (const row of rows) {
      const group = rowsByContest.get(row.contestId) ?? [];
      group.push(row);
      rowsByContest.set(row.contestId, group);
    }

    const rankedRows: Row[] = [];

    for (const contestRows of rowsByContest.values()) {
      contestRows.sort((a, b) => b.totalScore - a.totalScore);

      let previousScore: number | null = null;
      let currentRank = 0;
      let index = 0;

      for (const row of contestRows) {
        index += 1;
        if (previousScore === null || row.totalScore < previousScore) {
          currentRank = index;
        }
        row.rank = currentRank;
        previousScore = row.totalScore;
      }

      rankedRows.push(
        ...contestRows.sort((a, b) => {
          if (a.rank !== b.rank) {
            return a.rank - b.rank;
          }
          return a.participantName.localeCompare(b.participantName);
        }),
      );
    }

    rankedRows.sort((a, b) => {
      if (a.contestName !== b.contestName) {
        return a.contestName.localeCompare(b.contestName);
      }
      return a.rank - b.rank;
    });

    return rankedRows;
  }, [
    contests,
    participants,
    categories,
    teams,
    judgeAssignments,
    judgeContestSubmissions,
    tabulationEventFilterId,
    tabulationContestFilterId,
    tabulationDivisionFilterId,
    judgeTotals,
  ]);

  const awardsResults = useMemo(() => {
    type AwardWinnerRow = {
      awardId: number;
      awardName: string;
      awardType: AwardType;
      contestName: string;
      criteriaName: string | null;
      winners: {
        participantId: number;
        participantName: string;
        contestantNumber: string;
        rank: number;
        totalScore: number;
        teamName: string | null;
        judgeCriteriaScores: Record<number, number>;
      }[];
      allParticipants: {
        participantId: number;
        participantName: string;
        contestantNumber: string;
        rank: number;
        totalScore: number;
        teamName: string | null;
        judgeCriteriaScores: Record<number, number>;
      }[];
      note: string | null;
    };

    const result: AwardWinnerRow[] = [];

    const activeAwards = awardsForActiveEvent.filter(
      (award) => award.is_active,
    );

    for (const award of activeAwards) {
      let criteriaIds: number[] = [];
      const rawIds = award.criteria_ids as any;

      if (Array.isArray(rawIds)) {
        criteriaIds = rawIds.map(id => Number(id));
      } else if (typeof rawIds === 'string') {
        const s = rawIds as string;
        if (s.startsWith('{') && s.endsWith('}')) {
          criteriaIds = s.substring(1, s.length - 1).split(',').map(n => Number(n.trim()));
        } else {
          criteriaIds = s.split(',').map(n => Number(n.trim()));
        }
      } else if (award.criteria_id) {
        criteriaIds = [Number(award.criteria_id)];
      }
      
      criteriaIds = criteriaIds.filter(n => !isNaN(n));

      // NEW: If the award has associated criteria, check if we need to include ALL criteria from the categories
      // that the selected criteria belong to.
      // This is because the user might have selected a Category in the UI, which saved specific IDs at that time,
      // but expects the award to cover "The Category" conceptually.
      // OR, the user explicitly said "all of the points of that category... because i set the linked criteria category".
      
      // Let's identify the categories involved in this award based on the saved criteria IDs.
      if (criteriaIds.length > 0) {
        const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
        const categories = Array.from(new Set(selectedCriteria.map(c => c.category).filter(Boolean)));
        
        // If there are categories, find ALL criteria in those categories and add their IDs if missing.
        // This ensures that if the award is conceptually "All criteria in Category X", we get them all.
        // This acts as a safeguard if the save operation missed some, or if new ones were added (though rare).
        // More importantly, it aligns with the user's mental model of "Category-based Award".
        
        if (categories.length > 0) {
            const allCriteriaInCategories = criteriaList.filter(c => categories.includes(c.category));
            const allIds = allCriteriaInCategories.map(c => c.id);
            // Merge unique IDs
            criteriaIds = Array.from(new Set([...criteriaIds, ...allIds]));
        }
      }

      if (award.award_type === "criteria" && criteriaIds.length > 0) {
        const criteriaListForAward = criteriaList.filter(c => criteriaIds.includes(c.id));

        if (criteriaListForAward.length === 0) {
          result.push({
            awardId: award.id,
            awardName: award.name,
            awardType: award.award_type,
            contestName: "Unknown contest",
            criteriaName: null,
            winners: [],
            allParticipants: [],
            note: "Criteria not found.",
          });
          continue;
        }

        const firstCriteria = criteriaListForAward[0];
        const contestId = award.contest_id ?? firstCriteria.contest_id;

        const contest = contests.find(
          (contestRow) => contestRow.id === contestId,
        );

        if (!contest) {
          result.push({
            awardId: award.id,
            awardName: award.name,
            awardType: award.award_type,
            contestName: "Unknown contest",
            criteriaName: criteriaListForAward.map(c => c.name).join(", "),
            winners: [],
            allParticipants: [],
            note: "Contest not found.",
          });
          continue;
        }

        const rowsForContest = tabulationRows.filter(
          (row) => row.contestId === contest.id,
        );

        if (rowsForContest.length === 0) {
          result.push({
            awardId: award.id,
            awardName: award.name,
            awardType: award.award_type,
            contestName: contest.name,
            criteriaName: criteriaListForAward.map(c => c.name).join(", "),
            winners: [],
            allParticipants: [],
            note: "No tabulation data yet.",
          });
          continue;
        }

        // Calculate scores specifically for this criteria
        const criteriaScoresMap = new Map<number, number>(); // participantId -> total criteria score
        const participantScoresMap = new Map<number, Record<number, number>>(); // participantId -> { judgeId: score }

        for (const row of rowsForContest) {
            // Find all scores for this criteria and participant
            // Note: 'scores' state contains ALL scores.
            // We need to filter scores based on the EXPANDED criteriaIds.
            
            const pScores = scores.filter(s => criteriaIds.includes(s.criteria_id) && s.participant_id === row.participantId);
            
            let total = 0;
            const judgeScores: Record<number, number> = {};
            
            for (const s of pScores) {
                const scoreVal = Number(s.score);
                judgeScores[s.judge_id] = (judgeScores[s.judge_id] || 0) + scoreVal;
                total += scoreVal;
            }
            
            criteriaScoresMap.set(row.participantId, total);
            participantScoresMap.set(row.participantId, judgeScores);
        }

        // Create a new list of participants with recalculated scores and ranks
        const participantsWithCriteriaScores = rowsForContest.map(row => {
            const score = criteriaScoresMap.get(row.participantId) ?? 0;
            const jScores = participantScoresMap.get(row.participantId) ?? {};
            return {
                ...row,
                criteriaTotalScore: score,
                judgeCriteriaScores: jScores
            };
        });

        // Sort by criteria score descending
        participantsWithCriteriaScores.sort((a, b) => b.criteriaTotalScore - a.criteriaTotalScore);

        // Assign ranks (handling ties properly)
        let currentRank = 1;
        for (let i = 0; i < participantsWithCriteriaScores.length; i++) {
            if (i > 0 && participantsWithCriteriaScores[i].criteriaTotalScore < participantsWithCriteriaScores[i-1].criteriaTotalScore) {
                currentRank = i + 1;
            } else if (i > 0 && participantsWithCriteriaScores[i].criteriaTotalScore === participantsWithCriteriaScores[i-1].criteriaTotalScore) {
                // Tie, keep same rank
                currentRank = (participantsWithCriteriaScores[i-1] as any).criteriaRank;
            }
            (participantsWithCriteriaScores[i] as any).criteriaRank = currentRank;
        }

        const winners = participantsWithCriteriaScores
          .filter((row) => (row as any).criteriaRank === 1)
          .map((row) => ({
            participantId: row.participantId,
            participantName: row.participantName,
            contestantNumber: row.contestantNumber,
            rank: (row as any).criteriaRank,
            totalScore: row.criteriaTotalScore,
            teamName: row.teamName,
            judgeCriteriaScores: row.judgeCriteriaScores,
          }));

        const allParticipants = participantsWithCriteriaScores.map((row) => ({
          participantId: row.participantId,
          participantName: row.participantName,
          contestantNumber: row.contestantNumber,
          rank: (row as any).criteriaRank,
          totalScore: row.criteriaTotalScore,
          teamName: row.teamName,
          judgeCriteriaScores: row.judgeCriteriaScores,
        }));

        result.push({
          awardId: award.id,
          awardName: award.name,
          awardType: award.award_type,
          contestName: contest.name,
          criteriaName: criteriaListForAward.map(c => c.name).join(", "),
          winners,
          allParticipants,
          note: null,
        });
      } else {
        let contestName = "All contests";

        if (award.contest_id !== null) {
          const contest = contests.find(
            (contestRow) => contestRow.id === award.contest_id,
          );
          contestName = contest ? contest.name : "Unknown contest";
        }

        result.push({
          awardId: award.id,
          awardName: award.name,
          awardType: award.award_type,
          contestName,
          criteriaName: null,
          winners: [],
          allParticipants: [],
          note: "Special award. Assign recipients manually.",
        });
      }
    }

    // Now populate judgeCriteriaScores after basic setup, because accessing 'scores' state
    // inside the loop above might be slow if we filter repeatedly.
    // However, we need 'scores' state.
    // Let's optimize: build a map of scores by (criteria_id, participant_id, judge_id) -> score
    // Or just (criteria_id, participant_id) -> { judge_id: score }

    const scoresMap = new Map<string, Record<number, number>>();
    // Key: `${criteriaId}-${participantId}`

    /* REMOVED PREVIOUS SCORE MAPPING LOGIC AS IT IS NOW HANDLED INSIDE THE LOOP ABOVE */
    /*
    if (scores.length > 0) {
      for (const s of scores) {
        const key = `${s.criteria_id}-${s.participant_id}`;
        if (!scoresMap.has(key)) {
          scoresMap.set(key, {});
        }
        const record = scoresMap.get(key)!;
        record[s.judge_id] = Number(s.score);
      }
    }

    for (const awardRow of result) {
      if (awardRow.awardType !== "criteria") continue;
      
      // Find the criteria ID from the original award list
      const originalAward = activeAwards.find(a => a.id === awardRow.awardId);
      if (!originalAward || !originalAward.criteria_id) continue;
      const cId = originalAward.criteria_id;

      for (const p of awardRow.allParticipants) {
        const key = `${cId}-${p.participantId}`;
        const judgeScores = scoresMap.get(key);
        if (judgeScores) {
          p.judgeCriteriaScores = judgeScores;
        }
      }
      
      // Also update winners array (it's a subset/copy)
      for (const w of awardRow.winners) {
         const key = `${cId}-${w.participantId}`;
         const judgeScores = scoresMap.get(key);
         if (judgeScores) {
           w.judgeCriteriaScores = judgeScores;
         }
      }
    }
    */

    return result;
  }, [awardsForActiveEvent, criteriaList, contests, tabulationRows, scores]);

  const selectedTabulationAwardResult = useMemo(() => {
    if (tabulationAwardFilterId === "all") {
      return null;
    }
    return (
      awardsResults.find(
        (awardResult) => awardResult.awardId === tabulationAwardFilterId,
      ) ?? null
    );
  }, [awardsResults, tabulationAwardFilterId]);

  const templatePreviewParticipants = useMemo(() => {
    if (selectedContestIdForTemplate === null) {
      return [];
    }

    const forContest = participants.filter(
      (participant) => participant.contest_id === selectedContestIdForTemplate,
    );

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
  }, [participants, selectedContestIdForTemplate]);

  const templatePreviewPageantGroups = useMemo(() => {
    if (templatePreviewParticipants.length === 0) {
      return [];
    }

    const groups = new Map<
      string,
      { groupLabel: string; items: ParticipantRow[] }
    >();

    templatePreviewParticipants.forEach((participant) => {
      const division = categories.find(
        (category) => category.id === participant.division_id,
      );

      const rawLabel = division?.name?.trim() ?? "";
      const labelKey = rawLabel || "All";
      const existing = groups.get(labelKey);

      if (existing) {
        existing.items.push(participant);
      } else {
        groups.set(labelKey, {
          groupLabel: rawLabel,
          items: [participant],
        });
      }
    });

    const result = Array.from(groups.values());

    if (result.length <= 1) {
      return [
        {
          groupLabel: "",
          items: templatePreviewParticipants,
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
  }, [templatePreviewParticipants, categories]);

  const templatePreviewCriteria = useMemo(() => {
    if (selectedContestIdForTemplate === null) {
      return [];
    }

    return criteriaList.filter(
      (criteria) => criteria.contest_id === selectedContestIdForTemplate,
    );
  }, [criteriaList, selectedContestIdForTemplate]);

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

    const rawDivisionNames = [
      ...contestDivisionNames,
      contestCategoryText.trim(),
    ];

    const parsedCategoryNames = rawDivisionNames
      .map((value) => value.trim())
      .filter((value, index, all) => {
        if (!value.length) {
          return false;
        }
        const lower = value.toLowerCase();
        return (
          all.findIndex(
            (other) => other.trim().toLowerCase() === lower,
          ) === index
        );
      });

    const syncDivisionsForEvent = async () => {
      if (activeEventId === null) {
        return;
      }

      const existingForEvent = categories.filter(
        (category) => category.event_id === activeEventId,
      );

      const existingNamesLower = existingForEvent.map((division) =>
        division.name.trim().toLowerCase(),
      );

      const desiredNamesLower = parsedCategoryNames.map((name) =>
        name.trim().toLowerCase(),
      );

      const namesToInsert = parsedCategoryNames.filter((name) => {
        const normalized = name.toLowerCase();
        return !existingNamesLower.includes(normalized);
      });

      const divisionsToDelete = existingForEvent.filter((division) => {
        const normalized = division.name.trim().toLowerCase();
        return !desiredNamesLower.includes(normalized);
      });

      if (namesToInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("division")
          .insert(
            namesToInsert.map((name) => ({
              event_id: activeEventId,
              name,
            })),
          )
          .select("id, event_id, name, created_at");

        if (insertError) {
          setContestError(
            insertError.message || "Unable to save new divisions for event.",
          );
        } else if (inserted) {
          setCategories((previous) => [
            ...(inserted as CategoryRow[]),
            ...previous,
          ]);
        }
      }

      if (divisionsToDelete.length > 0) {
        const idsToDelete = divisionsToDelete.map((division) => division.id);

        const { data: deleted, error: deleteError } = await supabase
          .from("division")
          .delete()
          .in("id", idsToDelete)
          .select("id");

        if (deleteError) {
          setContestError(
            deleteError.message ||
              "Some divisions could not be deleted. They may already be used by participants.",
          );
        } else if (deleted && deleted.length > 0) {
          const deletedIds = new Set(
            (deleted as { id: number }[]).map((row) => row.id),
          );

          setCategories((previous) =>
            previous.filter((division) => !deletedIds.has(division.id)),
          );
        }
      }
    };

    if (editingContestId === null) {
      const { data, error } = await supabase
        .from("contest")
        .insert({
          event_id: activeEventId,
          name: contestName.trim(),
          scoring_type: contestScoringType,
        })
        .select("id, event_id, name, created_at, contest_code, scoring_type")
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

          const generatedContestCode = `${eventCodeForContest}${typed.id}`;

          const { data: updatedContestData, error: updateError } = await supabase
            .from("contest")
            .update({
              contest_code: generatedContestCode,
            })
            .eq("id", typed.id)
            .select("id, event_id, name, created_at, contest_code");

          if (updateError) {
            setContestError(
              updateError.message ||
                "Contest was created but its code could not be saved. Check your database row-level security policies.",
            );

            setContests((previous) => [
              typed,
              ...previous.filter((contest) => contest.id !== typed.id),
            ]);
          } else {
            const updatedContestArray =
              (updatedContestData as ContestRow[] | null) ?? null;

            if (
              !updatedContestArray ||
              !Array.isArray(updatedContestArray) ||
              updatedContestArray.length === 0
            ) {
              setContestError(
                "Contest was created but its code could not be saved. Check your database row-level security policies.",
              );

              setContests((previous) => [
                typed,
                ...previous.filter((contest) => contest.id !== typed.id),
              ]);
            } else {
              const finalContest = updatedContestArray[0];
              setContests((previous) => [
                finalContest,
                ...previous.filter((contest) => contest.id !== finalContest.id),
              ]);
            }
          }
        } else {
          setContests((previous) => [
            typed,
            ...previous.filter((contest) => contest.id !== typed.id),
          ]);
        }
      }

      await syncDivisionsForEvent();

      setContestSuccess("Contest has been created.");
    } else {
      const { data, error } = await supabase
        .from("contest")
        .update({
          name: contestName.trim(),
          scoring_type: contestScoringType,
        })
        .eq("id", editingContestId)
        .select("id, event_id, name, created_at, contest_code, scoring_type")
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

      await syncDivisionsForEvent();

      if (data) {
        setContests((previous) =>
          previous.map((contest) =>
            contest.id === data.id ? (data as ContestRow) : contest,
          ),
        );
      }

      setContestSuccess("Contest has been updated.");
    }

    setIsSavingContest(false);
    setContestName("");
    setContestCategoryText("");
    setEditingContestId(null);
    setIsContestModalOpen(false);
  };

  const handleSaveTemplate = async () => {
    setTemplateError(null);
    setTemplateSuccess(null);

    if (selectedContestIdForTemplate === null) {
      setTemplateError("Select a contest first.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTemplateError("Supabase is not configured.");
      return;
    }

    setIsSavingTemplate(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const layout: ContestLayout = {
      version: 1,
      templateKey: selectedTemplateKey,
      templateId: selectedTemplateId,
      theme: templateTheme,
    };

    const { error } = await supabase
      .from("contest_layout")
      .upsert(
        {
          contest_id: selectedContestIdForTemplate,
          layout_json: layout,
        },
        { onConflict: "contest_id" },
      );

    setIsSavingTemplate(false);

    if (error) {
      setTemplateError(error.message || "Unable to save template.");
      return;
    }

    setTemplateSuccess("Template has been saved for this contest.");
  };

  const handleSaveTemplateToLibrary = async () => {
    setTemplateError(null);
    setTemplateSuccess(null);

    const trimmedName = templateName.trim();

    if (trimmedName === "") {
      setTemplateError("Enter a template name.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTemplateError("Supabase is not configured.");
      return;
    }

    setIsSavingTemplateToLibrary(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const layout: ContestLayout = {
      version: 1,
      templateKey: selectedTemplateKey,
      theme: templateTheme,
    };

    const { data, error } = await supabase
      .from("layout_template")
      .insert({
        name: trimmedName,
        layout_json: layout,
      })
      .select("id, name, layout_json, created_at")
      .single();

    setIsSavingTemplateToLibrary(false);

    if (error) {
      setTemplateError(error.message || "Unable to save template to library.");
      return;
    }

    if (!data) {
      setTemplateError("Unable to save template to library.");
      return;
    }

    const typed = data as LayoutTemplateRow;

    setLayoutTemplates((previous) => [typed, ...previous]);
    setSelectedTemplateId(typed.id);
    setTemplateSuccess("Template has been saved to the template library.");
    setTemplateName("");
  };

  const handleDeleteTemplateFromLibrary = async (id: number) => {
    setTemplateError(null);
    setTemplateSuccess(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTemplateError("Supabase is not configured.");
      return;
    }

    setIsDeletingTemplateId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("layout_template")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingTemplateId(null);

    if (error) {
      setTemplateError(error.message || "Unable to delete template.");
      return;
    }

    if (!data || data.length === 0) {
      setTemplateError(
        "Unable to delete template. Check your database row-level security policies.",
      );
      return;
    }

    setLayoutTemplates((previous) =>
      previous.filter((template) => template.id !== id),
    );

    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
    }
  };

  const handleLoadTemplateFromLibrary = (template: LayoutTemplateRow) => {
    const nameLower = template.name.toLowerCase();

    const layout =
      nameLower.includes("pageant") && nameLower.includes("default")
        ? pageantDefaultLayout
        : template.layout_json;
    const templateKey = layout.templateKey;

    if (templateKey === "standard" || templateKey === "pageant") {
      setSelectedTemplateKey(templateKey);
    } else {
      setSelectedTemplateKey("standard");
    }

    setSelectedTemplateId(template.id);
    setTemplateTheme(layout.theme ?? {});
    setTemplateModalParticipant(null);
    setTemplateError(null);
    setTemplateSuccess(`Template "${template.name}" loaded.`);
  };

  const handleApplyTemplateToContest = async (template: LayoutTemplateRow) => {
    setTemplateError(null);
    setTemplateSuccess(null);

    if (selectedContestIdForTemplate === null) {
      setTemplateError("Select a contest first.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTemplateError("Supabase is not configured.");
      return;
    }

    setIsSavingTemplate(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const nameLower = template.name.toLowerCase();

    const sourceLayout =
      nameLower.includes("pageant") && nameLower.includes("default")
        ? pageantDefaultLayout
        : template.layout_json;

    const layout: ContestLayout = {
      ...sourceLayout,
      templateId: template.id,
    };

    const { error } = await supabase
      .from("contest_layout")
      .upsert(
        {
          contest_id: selectedContestIdForTemplate,
          layout_json: layout,
        },
        { onConflict: "contest_id" },
      );

    setIsSavingTemplate(false);

    if (error) {
      setTemplateError(
        error.message || "Unable to apply template to selected contest.",
      );
      return;
    }

    const templateKey = layout.templateKey;

    if (templateKey === "standard" || templateKey === "pageant") {
      setSelectedTemplateKey(templateKey);
    } else {
      setSelectedTemplateKey("standard");
    }

    setSelectedTemplateId(template.id);
    setTemplateTheme(layout.theme ?? {});
    setTemplateModalParticipant(null);
    setTemplateSuccess("Template has been applied to the selected contest.");
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

    const { data, error } = await supabase
      .from("contest")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingContestId(null);

    if (error) {
      setContestError(error.message || "Unable to delete contest.");
      return;
    }

    if (!data || data.length === 0) {
      setContestError(
        "Unable to delete contest. Check your database row-level security policies.",
      );
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

    const categoryToUse = editingCriteriaId === null ? criteriaCategory.trim() : editingCriteriaCategory.trim();

    if (editingCriteriaId === null) {
      const cleanedItems = criteriaItems
        .map((item) => ({
          name: item.name.trim(),
          weight: item.weight.trim(),
        }))
        .filter((item) => item.name !== "" || item.weight !== "");

      if (cleanedItems.length === 0) {
        setCriteriaError("Add at least one criteria and points.");
        return;
      }

      for (const item of cleanedItems) {
        if (!item.name) {
          setCriteriaError("Each criteria must have a name.");
          return;
        }
        if (!item.weight) {
          setCriteriaError("Each criteria must have points.");
          return;
        }
        const parsed = Number(item.weight);
        if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
          setCriteriaError("Points must be a number between 0 and 100.");
          return;
        }
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setCriteriaError("Supabase is not configured.");
        return;
      }

      setIsSavingCriteria(true);

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const rowsToInsert = cleanedItems.map((item) => ({
        contest_id: selectedContestIdForCriteria,
        name: item.name,
        percentage: Number(item.weight),
        description: null,
        category: categoryToUse || null,
      }));

      const { data, error } = await supabase
        .from("criteria")
        .insert(rowsToInsert)
        .select(
          "id, contest_id, name, percentage, created_at, description, criteria_code, category",
        );

      if (error) {
        setCriteriaError(error.message || "Unable to add criteria.");
        setIsSavingCriteria(false);
        return;
      }

      const createdArray = (data as CriteriaRow[] | null) ?? null;

      if (createdArray && Array.isArray(createdArray) && createdArray.length > 0) {
        for (const created of createdArray) {
          let criteriaToUse = created;

          if (!created.criteria_code) {
            const contestForCriteria = contests.find(
              (contest) => contest.id === created.contest_id,
            );

            let baseContestCode = contestForCriteria?.contest_code ?? null;

            if (!baseContestCode && contestForCriteria) {
              const eventForContest = events.find(
                (event) => event.id === contestForCriteria.event_id,
              );
              if (eventForContest) {
                baseContestCode = `${eventForContest.code}${contestForCriteria.id}`;
              }
            }

            const generatedCriteriaCode = baseContestCode
              ? `${baseContestCode}${created.id}`
              : `CRIT${created.id}`;

            const { data: updatedCriteriaData, error: updateError } =
              await supabase
                .from("criteria")
                .update({
                  criteria_code: generatedCriteriaCode,
                })
                .eq("id", created.id)
                .select(
                  "id, contest_id, name, percentage, created_at, description, criteria_code, category",
                );

            if (!updateError) {
              const updatedArray =
                (updatedCriteriaData as CriteriaRow[] | null) ?? null;

              if (
                updatedArray &&
                Array.isArray(updatedArray) &&
                updatedArray.length > 0
              ) {
                criteriaToUse = updatedArray[0];
              }
            }
          }

          setCriteriaList((previous) => [
            criteriaToUse,
            ...previous.filter((criteria) => criteria.id !== criteriaToUse.id),
          ]);
        }
      }

      setCriteriaSuccess("Criteria have been added.");
      setIsSavingCriteria(false);
      setSelectedContestIdForCriteria(null);
      setCriteriaCategory("");
      setCriteriaItems([{ name: "", weight: "" }]);
      setCriteriaName("");
      setCriteriaWeight("");
      setCriteriaDescription("");
      setEditingCriteriaId(null);
      setIsCriteriaModalOpen(false);
      return;
    }

    if (!criteriaName.trim()) {
      setCriteriaError("Criteria name is required.");
      return;
    }

    if (!criteriaWeight.trim()) {
      setCriteriaError("Points are required.");
      return;
    }

    const parsedWeight = Number(criteriaWeight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 100) {
      setCriteriaError("Points must be a number between 0 and 100.");
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

    const { data, error } = await supabase
      .from("criteria")
      .update({
        contest_id: selectedContestIdForCriteria,
        name: criteriaName.trim(),
        percentage: parsedWeight,
        description: criteriaDescription.trim() || null,
        category: categoryToUse || null,
      })
      .eq("id", editingCriteriaId)
      .select(
        "id, contest_id, name, percentage, created_at, description, criteria_code, category",
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
    setIsSavingCriteria(false);
    setSelectedContestIdForCriteria(null);
    setCriteriaName("");
    setCriteriaWeight("");
    setCriteriaDescription("");
    setCriteriaCategory("");
    setCriteriaItems([{ name: "", weight: "" }]);
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

    const { data, error } = await supabase
      .from("criteria")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingCriteriaId(null);

    if (error) {
      setCriteriaError(error.message || "Unable to delete criteria.");
      return;
    }

    if (!data || data.length === 0) {
      setCriteriaError(
        "Unable to delete criteria. Check your database row-level security policies.",
      );
      return;
    }

    setCriteriaList((previous) =>
      previous.filter((criteria) => criteria.id !== id),
    );
  };

  const openCreateAwardModal = () => {
    setEditingAwardId(null);
    setAwardName("");
    setAwardType("criteria");
    setAwardContestId(null);
    setAwardCriteriaIds([]);
    setExpandedAwardCategories(new Set());
    setIsAwardCriteriaDropdownOpen(false);
    setAwardDescription("");
    setAwardIsActive(true);
    setAwardError(null);
    setAwardSuccess(null);
    setIsAwardModalOpen(true);
  };

  const openEditAwardModal = (award: AwardRow) => {
    setEditingAwardId(award.id);
    setAwardName(award.name);
    setAwardType(award.award_type);
    setAwardContestId(award.contest_id);
    setAwardCriteriaIds(award.criteria_ids ?? (award.criteria_id ? [award.criteria_id] : []));
    setExpandedAwardCategories(new Set());
    setIsAwardCriteriaDropdownOpen(false);
    setAwardDescription(award.description ?? "");
    setAwardIsActive(award.is_active);
    setAwardError(null);
    setAwardSuccess(null);
    setIsAwardModalOpen(true);
  };

  const handleSaveAward = async () => {
    setAwardError(null);
    setAwardSuccess(null);

    if (activeEventId === null) {
      setAwardError("Set an active event first in the Event tab.");
      return;
    }

    if (!awardName.trim()) {
      setAwardError("Award name is required.");
      return;
    }

    if (awardType === "criteria" && awardCriteriaIds.length === 0) {
      setAwardError("Select at least one criteria for this award.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAwardError("Supabase is not configured.");
      return;
    }

    setIsSavingAward(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const payload = {
      event_id: activeEventId,
      contest_id: awardContestId,
      name: awardName.trim(),
      description: awardDescription.trim() || null,
      award_type: awardType,
      criteria_ids: awardType === "criteria" ? awardCriteriaIds : null,
      criteria_id: awardType === "criteria" && awardCriteriaIds.length > 0 ? awardCriteriaIds[0] : null,
      is_active: awardIsActive,
    };

    if (editingAwardId === null) {
      const { data, error } = await supabase
        .from("award")
        .insert(payload)
        .select(
          "id, event_id, contest_id, name, description, award_type, criteria_id, criteria_ids, is_active, created_at",
        )
        .single();

      if (error) {
        setAwardError(error.message || "Unable to add award.");
        setIsSavingAward(false);
        return;
      }

      if (data) {
        setAwards((previous) => [
          data as AwardRow,
          ...previous.filter((award) => award.id !== (data as AwardRow).id),
        ]);
      }

      setAwardSuccess("Award has been added.");
    } else {
      const { data, error } = await supabase
        .from("award")
        .update(payload)
        .eq("id", editingAwardId)
        .select(
          "id, event_id, contest_id, name, description, award_type, criteria_id, criteria_ids, is_active, created_at",
        )
        .single();

      if (error) {
        setAwardError(error.message || "Unable to update award.");
        setIsSavingAward(false);
        return;
      }

      if (data) {
        setAwards((previous) =>
          previous.map((award) =>
            award.id === data.id ? (data as AwardRow) : award,
          ),
        );
      }

      setAwardSuccess("Award has been updated.");
    }

    setIsSavingAward(false);
    setIsAwardModalOpen(false);
    setEditingAwardId(null);
    setAwardName("");
    setAwardContestId(null);
    setAwardCriteriaIds([]);
    setExpandedAwardCategories(new Set());
    setIsAwardCriteriaDropdownOpen(false);
    setAwardDescription("");
    setAwardIsActive(true);
    setAwardError(null);
    setAwardSuccess(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        awardCriteriaDropdownRef.current &&
        !awardCriteriaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAwardCriteriaDropdownOpen(false);
      }
    };

    if (isAwardCriteriaDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAwardCriteriaDropdownOpen]);

  const handleDeleteAward = async (id: number) => {
    setAwardError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAwardError("Supabase is not configured.");
      return;
    }

    setIsDeletingAwardId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("award")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingAwardId(null);

    if (error) {
      setAwardError(error.message || "Unable to delete award.");
      return;
    }

    if (!data || data.length === 0) {
      setAwardError(
        "Unable to delete award. Check your database row-level security policies.",
      );
      return;
    }

    setAwards((previous) => previous.filter((award) => award.id !== id));
  };

  const handleConfirmAwardWinners = async (awardId: number) => {
    setAwardsTabulationError(null);
    setAwardsTabulationSuccess(null);

    const award = awardsForActiveEvent.find((item) => item.id === awardId);

    if (!award) {
      setAwardsTabulationError("Award not found.");
      return;
    }

    if (award.award_type !== "criteria") {
      setAwardsTabulationError(
        "Only criteria-based awards can be auto-confirmed.",
      );
      return;
    }

    const awardResult = awardsResults.find(
      (result) => result.awardId === awardId,
    );

    if (!awardResult || awardResult.winners.length === 0) {
      setAwardsTabulationError("No winners available to confirm for this award.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAwardsTabulationError("Supabase is not configured.");
      return;
    }

    const existingRecipientIds = new Set(
      awardRecipients
        .filter((row) => row.award_id === awardId)
        .map((row) => row.participant_id),
    );

    const winnersToSave = awardResult.winners.filter(
      (winner) => !existingRecipientIds.has(winner.participantId),
    );

    if (winnersToSave.length === 0) {
      setAwardsTabulationSuccess("Recipients for this award are already saved.");
      return;
    }

    setIsConfirmingAwardId(awardId);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const rowsToInsert = winnersToSave.map((winner) => ({
      award_id: awardId,
      participant_id: winner.participantId,
    }));

    const { data, error } = await supabase
      .from("award_recipient")
      .insert(rowsToInsert)
      .select("id, award_id, participant_id, created_at");

    setIsConfirmingAwardId(null);

    if (error) {
      setAwardsTabulationError(
        error.message || "Unable to confirm award recipients.",
      );
      return;
    }

    if (data && Array.isArray(data)) {
      setAwardRecipients((previous) => [
        ...data.map((row) => row as AwardRecipientRow),
        ...previous,
      ]);
    }

    setAwardsTabulationSuccess("Award recipients have been saved.");
  };

  const handleSaveCategory = async () => {
    setCategoryError(null);
    setCategorySuccess(null);

    if (activeEventId === null) {
      setCategoryError("Set an active event first in the Event tab.");
      return;
    }

    if (!categoryName.trim()) {
      setCategoryError("Team name is required.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setCategoryError("Supabase is not configured.");
      return;
    }

    setIsSavingCategory(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (editingCategoryId === null) {
      const { data, error } = await supabase
        .from("team")
        .insert({
          event_id: activeEventId,
          name: categoryName.trim(),
        })
        .select("id, event_id, name, created_at")
        .single();

      setIsSavingCategory(false);

      if (error) {
        setCategoryError(error.message || "Unable to save team.");
        return;
      }

      if (data) {
        setTeams((previous) => [data as TeamRow, ...previous]);
      }

      setCategorySuccess("Team has been added.");
    } else {
      const { data, error } = await supabase
        .from("team")
        .update({
          name: categoryName.trim(),
        })
        .eq("id", editingCategoryId)
        .select("id, event_id, name, created_at")
        .single();

      setIsSavingCategory(false);

      if (error) {
        setCategoryError(error.message || "Unable to update team.");
        return;
      }

      if (data) {
        setTeams((previous) =>
          previous.map((team) =>
            team.id === data.id ? (data as TeamRow) : team,
          ),
        );
      }

      setCategorySuccess("Team has been updated.");
    }

    setCategoryName("");
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: number) => {
    setCategoryError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setCategoryError("Supabase is not configured.");
      return;
    }

    setIsDeletingCategoryId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("team")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingCategoryId(null);

    if (error) {
      setCategoryError(error.message || "Unable to delete team.");
      return;
    }

    if (!data || data.length === 0) {
      setCategoryError(
        "Unable to delete team. Check your database row-level security policies.",
      );
      return;
    }

    setTeams((previous) => previous.filter((team) => team.id !== id));
  };

  const handleSaveParticipant = async () => {
    setParticipantError(null);
    setParticipantSuccess(null);

    if (activeEventId === null) {
      setParticipantError("Set an active event first in the Event tab.");
      return;
    }

    if (selectedContestIdForParticipant === null) {
      setParticipantError("Please select a contest.");
      return;
    }

    if (selectedCategoryIdForParticipant === null) {
      setParticipantError("Please select a division.");
      return;
    }

    if (selectedTeamIdForParticipant === null) {
      setParticipantError("Please select a team.");
      return;
    }

    if (!participantFullName.trim() || !participantNumber.trim()) {
      setParticipantError("Please fill in all fields.");
      return;
    }

    const normalizedNumber = participantNumber.trim();

    const hasDuplicateNumber = participants.some((participant) => {
      if (participant.contest_id !== selectedContestIdForParticipant) {
        return false;
      }

      if (participant.division_id !== selectedCategoryIdForParticipant) {
        return false;
      }

      if (
        editingParticipantId !== null &&
        participant.id === editingParticipantId
      ) {
        return false;
      }

      return participant.contestant_number.trim() === normalizedNumber;
    });

    if (hasDuplicateNumber) {
      setParticipantError(
        "This contestant number is already used for this contest and division.",
      );
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setParticipantError("Supabase is not configured.");
      return;
    }

    setIsSavingParticipant(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (editingParticipantId === null) {
      const { data, error } = await supabase
        .from("participant")
        .insert({
          contest_id: selectedContestIdForParticipant,
          division_id: selectedCategoryIdForParticipant,
          team_id: selectedTeamIdForParticipant,
          full_name: participantFullName.trim(),
          contestant_number: normalizedNumber,
          avatar_url: participantAvatarUrl.trim() || null,
        })
        .select(
          "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url",
        );

      setIsSavingParticipant(false);

      if (error) {
        if (
          typeof error.message === "string" &&
          error.message.includes("contestant_unique")
        ) {
          setParticipantError(
            "This contestant number is already used for this contest and division.",
          );
        } else {
          setParticipantError(error.message || "Unable to save participant.");
        }
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as ParticipantRow;
        setParticipants((previous) => [created, ...previous]);
      }

      setParticipantSuccess("Participant has been added.");
    } else {
      const { data, error } = await supabase
        .from("participant")
        .update({
          contest_id: selectedContestIdForParticipant,
          division_id: selectedCategoryIdForParticipant,
          team_id: selectedTeamIdForParticipant,
          full_name: participantFullName.trim(),
          contestant_number: normalizedNumber,
          avatar_url: participantAvatarUrl.trim() || null,
        })
        .eq("id", editingParticipantId)
        .select(
          "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url",
        );

      setIsSavingParticipant(false);

      if (error) {
        if (
          typeof error.message === "string" &&
          error.message.includes("contestant_unique")
        ) {
          setParticipantError(
            "This contestant number is already used for this contest and division.",
          );
        } else {
          setParticipantError(error.message || "Unable to update participant.");
        }
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as ParticipantRow;
        setParticipants((previous) =>
          previous.map((participant) =>
            participant.id === updated.id ? updated : participant,
          ),
        );
      }

      setParticipantSuccess("Participant has been updated.");
    }

    setSelectedContestIdForParticipant(null);
    setSelectedCategoryIdForParticipant(null);
    setSelectedTeamIdForParticipant(null);
    setParticipantFullName("");
    setParticipantNumber("");
    setParticipantAvatarUrl("");
    setEditingParticipantId(null);
    setIsParticipantModalOpen(false);
  };

  const handleDeleteParticipant = async (id: number) => {
    setParticipantError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setParticipantError("Supabase is not configured.");
      return;
    }

    setIsDeletingParticipantId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("participant").delete().eq("id", id);

    setIsDeletingParticipantId(null);

    if (error) {
      setParticipantError(error.message || "Unable to delete participant.");
      return;
    }

    setParticipants((previous) =>
      previous.filter((participant) => participant.id !== id),
    );
  };

  const handleSaveTabulator = async () => {
    setTabulatorError(null);
    setTabulatorSuccess(null);

    if (activeEventId === null) {
      setTabulatorError("Set an active event first in the Event tab.");
      return;
    }

    if (
      !tabulatorFullName.trim() ||
      !tabulatorUsername.trim() ||
      (editingTabulatorId === null && !tabulatorPassword)
    ) {
      setTabulatorError("Please fill in all fields.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTabulatorError("Supabase is not configured.");
      return;
    }

    setIsSavingTabulator(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let error = null;
    let data: unknown = null;

    if (editingTabulatorId === null) {
      const response = await supabase
        .from("user_tabulator")
        .insert({
          event_id: activeEventId,
          full_name: tabulatorFullName.trim(),
          username: tabulatorUsername.trim(),
          password_hash: tabulatorPassword,
        })
        .select("id, event_id, full_name, username, created_at");

      error = response.error;
      data = response.data;

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as TabulatorRow;
        setTabulators((previous) => [created, ...previous]);
      }
    } else {
      const updatePayload: {
        full_name: string;
        username: string;
        password_hash?: string;
      } = {
        full_name: tabulatorFullName.trim(),
        username: tabulatorUsername.trim(),
      };

      if (tabulatorPassword) {
        updatePayload.password_hash = tabulatorPassword;
      }

      const response = await supabase
        .from("user_tabulator")
        .update(updatePayload)
        .eq("id", editingTabulatorId)
        .select("id, event_id, full_name, username, created_at");

      error = response.error;
      data = response.data;

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as TabulatorRow;
        setTabulators((previous) =>
          previous.map((tabulator) =>
            tabulator.id === updated.id ? updated : tabulator,
          ),
        );
      }
    }

    if (error) {
      setTabulatorError(error.message || "Unable to save tabulator.");
      setIsSavingTabulator(false);
      return;
    }

    setTabulatorSuccess(
      editingTabulatorId === null
        ? "Tabulator has been added."
        : "Tabulator has been updated.",
    );
    setIsSavingTabulator(false);
    setEditingTabulatorId(null);
    setTabulatorFullName("");
    setTabulatorUsername("");
    setTabulatorPassword("");
    setIsTabulatorModalOpen(false);
  };

  const handleDeleteTabulator = async (id: number) => {
    setTabulatorError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setTabulatorError("Supabase is not configured.");
      return;
    }

    setIsDeletingTabulatorId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("user_tabulator")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingTabulatorId(null);

    if (error) {
      setTabulatorError(error.message || "Unable to delete tabulator.");
      return;
    }

    if (!data || data.length === 0) {
      setTabulatorError(
        "Unable to delete tabulator. Check your database row-level security policies.",
      );
      return;
    }

    setTabulators((previous) =>
      previous.filter((tabulator) => tabulator.id !== id),
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

    let error = null;
    let data: unknown = null;

    if (editingJudgeId === null) {
      const response = await supabase
        .from("user_judge")
        .insert({
          event_id: activeEventId,
          full_name: judgeFullName.trim(),
          username: judgeUsername.trim(),
          password_hash: judgePassword,
          role: judgeRole,
        })
        .select("id, event_id, full_name, username, role, created_at");

      error = response.error;
      data = response.data;

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as JudgeRow;
        setJudges((previous) => [created, ...previous]);
        if (selectedContestIdsForJudge.length > 0) {
          const inserts = selectedContestIdsForJudge.map((contestId) => ({
            judge_id: created.id,
            contest_id: contestId,
          }));
          const { data: assignments, error: assignmentError } = await supabase
            .from("judge_assignment")
            .insert(inserts)
            .select("judge_id, contest_id");
          if (assignmentError) {
            setJudgeError(
              assignmentError.message || "Unable to assign contests to judge.",
            );
          } else if (assignments && Array.isArray(assignments)) {
            setJudgeAssignments((previous) => [
              ...previous,
              ...(assignments as JudgeAssignmentRow[]),
            ]);
          }
        }
      }
    } else {
      const response = await supabase
        .from("user_judge")
        .update({
          full_name: judgeFullName.trim(),
          username: judgeUsername.trim(),
          password_hash: judgePassword,
          role: judgeRole,
        })
        .eq("id", editingJudgeId)
        .select("id, event_id, full_name, username, role, created_at");

      error = response.error;
      data = response.data;

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as JudgeRow;
        setJudges((previous) =>
          previous.map((judge) => (judge.id === updated.id ? updated : judge)),
        );
        await supabase.from("judge_assignment").delete().eq("judge_id", updated.id);
        if (selectedContestIdsForJudge.length > 0) {
          const inserts = selectedContestIdsForJudge.map((contestId) => ({
            judge_id: updated.id,
            contest_id: contestId,
          }));
          const { data: assignments, error: assignmentError } = await supabase
            .from("judge_assignment")
            .insert(inserts)
            .select("judge_id, contest_id");
          if (assignmentError) {
            setJudgeError(
              assignmentError.message || "Unable to assign contests to judge.",
            );
          } else if (assignments && Array.isArray(assignments)) {
            setJudgeAssignments((previous) => [
              ...previous.filter(
                (assignment) => assignment.judge_id !== updated.id,
              ),
              ...(assignments as JudgeAssignmentRow[]),
            ]);
          }
        } else {
          setJudgeAssignments((previous) =>
            previous.filter((assignment) => assignment.judge_id !== updated.id),
          );
        }
      }
    }

    if (error) {
      setJudgeError(error.message || "Unable to save judge.");
      setIsSavingJudge(false);
      return;
    }

    setJudgeSuccess(
      editingJudgeId === null ? "Judge has been added." : "Judge has been updated.",
    );
    setIsSavingJudge(false);
    setEditingJudgeId(null);
    setJudgeFullName("");
    setJudgeUsername("");
    setJudgePassword("");
    setIsJudgeModalOpen(false);
  };

  const handleSaveAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);

    if (!adminUsername.trim() || !adminPassword) {
      setAdminError("Please fill in all fields.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAdminError("Supabase is not configured.");
      return;
    }

    setIsSavingAdmin(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (editingAdminId === null) {
      const { data, error } = await supabase
        .from("user_admin")
        .insert({
          username: adminUsername.trim(),
          password_hash: adminPassword,
        })
        .select("id, username, created_at");

      if (error) {
        setAdminError(error.message || "Unable to save admin.");
        setIsSavingAdmin(false);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const created = data[0] as AdminRow;
        setAdmins((previous) => [created, ...previous]);
      }

      setAdminSuccess("Admin has been added.");
    } else {
      const { data, error } = await supabase
        .from("user_admin")
        .update({
          username: adminUsername.trim(),
          password_hash: adminPassword,
        })
        .eq("id", editingAdminId)
        .select("id, username, created_at");

      if (error) {
        setAdminError(error.message || "Unable to update admin.");
        setIsSavingAdmin(false);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const updated = data[0] as AdminRow;
        setAdmins((previous) =>
          previous.map((admin) => (admin.id === updated.id ? updated : admin)),
        );
      }

      setAdminSuccess("Admin has been updated.");
    }

    setIsSavingAdmin(false);
    setAdminUsername("");
    setAdminPassword("");
    setEditingAdminId(null);
    setIsAdminModalOpen(false);
  };

  const handleDeleteJudge = async (id: number) => {
    setJudgeError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setJudgeError("Supabase is not configured.");
      return;
    }

    setIsDeletingJudgeId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("user_judge")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingJudgeId(null);

    if (error) {
      setJudgeError(
        error.message ||
          "Unable to delete judge. Check your database row-level security policies.",
      );
      return;
    }

    if (!data || data.length === 0) {
      setJudgeError(
        "Unable to delete judge. Check your database row-level security policies.",
      );
      return;
    }

    setJudges((previous) => previous.filter((judge) => judge.id !== id));
    setJudgeAssignments((previous) =>
      previous.filter((assignment) => assignment.judge_id !== id),
    );
  };

  const handleDeleteAdmin = async (id: number) => {
    setAdminError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setAdminError("Supabase is not configured.");
      return;
    }

    setIsDeletingAdminId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("user_admin")
      .delete()
      .eq("id", id)
      .select("id");

    setIsDeletingAdminId(null);

    if (error) {
      setAdminError(error.message || "Unable to delete admin.");
      return;
    }

    if (!data || data.length === 0) {
      setAdminError(
        "Unable to delete admin. Check your database row-level security policies.",
      );
      return;
    }

    setAdmins((previous) => previous.filter((admin) => admin.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-[#E3F2EA] via-white to-[#E3F2EA] text-slate-900">
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
                  {events.filter((e) => e.is_active).length}
                </div>
              </div>
              <div className="rounded-2xl border border-[#1F4D3A14] bg-white px-4 py-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Judges
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1F4D3A]">
                  {activeEventId
                    ? judges.filter((j) => j.event_id === activeEventId).length
                    : 0}
                </div>
              </div>
              <div className="rounded-2xl border border-[#1F4D3A14] bg-white px-4 py-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Participants
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#1F4D3A]">
                  {activeEventId
                    ? participants.filter(
                        (p) =>
                          contests.find((c) => c.id === p.contest_id)
                            ?.event_id === activeEventId,
                      ).length
                    : 0}
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
                    <select
                      className="rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      value={
                        tabulationEventFilterId === "all"
                          ? "all"
                          : String(tabulationEventFilterId)
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        const next =
                          value === "all" ? "all" : Number.parseInt(value, 10);
                        setTabulationEventFilterId(next);
                        setTabulationContestFilterId("all");
                      }}
                    >
                      <option value="all">All events</option>
                      {events
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Contest</span>
                    <select
                      className="rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      value={
                        tabulationContestFilterId === "all"
                          ? "all"
                          : String(tabulationContestFilterId)
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        const next =
                          value === "all" ? "all" : Number.parseInt(value, 10);
                        setTabulationContestFilterId(next);
                      }}
                    >
                      <option value="all">All contests</option>
                      {contests
                        .filter((contest) =>
                          tabulationEventFilterId === "all"
                            ? true
                            : contest.event_id === tabulationEventFilterId,
                        )
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((contest) => (
                          <option key={contest.id} value={contest.id}>
                            {contest.name}
                          </option>
                        ))}
                    </select>
                  </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Division</span>
                  <select
                    className="rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    value={
                      tabulationDivisionFilterId === "all"
                        ? "all"
                        : String(tabulationDivisionFilterId)
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      const next =
                        value === "all" ? "all" : Number.parseInt(value, 10);
                      setTabulationDivisionFilterId(next);
                    }}
                  >
                    <option value="all">All divisions</option>
                    {(tabulationEventFilterId === "all"
                      ? categories
                      : categories.filter(
                          (category) => category.event_id === tabulationEventFilterId,
                        )
                    )
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {events.length === 0 || contests.length === 0
                    ? "No tabulation data yet"
                    : "Showing current tabulation from judges' submissions"}
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between gap-3">
                {/* View switcher removed */}
              </div>

              {adminTabulationView === "overall" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 font-medium">Represent</th>
                        <th className="px-3 py-2 font-medium">Contestant</th>
                        {/* Dynamic Judge Columns */}
                        {judges
                          .filter((judge) => {
                            // Filter judges relevant to the current view
                            // Since tabulationRows can span multiple contests if filters are 'all',
                            // showing specific judges is tricky.
                            // But usually tabulation is viewed per contest.
                            if (tabulationContestFilterId !== "all") {
                                // Find if judge is assigned to this contest
                                return judgeAssignments.some(ja => ja.judge_id === judge.id && ja.contest_id === tabulationContestFilterId);
                            }
                            if (tabulationEventFilterId !== "all") {
                                return judge.event_id === tabulationEventFilterId;
                            }
                            return true;
                          })
                          .sort((a, b) => a.username.localeCompare(b.username))
                          .map((judge) => (
                            <th key={judge.id} className="px-3 py-2 font-medium text-center">
                              {judge.username}
                            </th>
                          ))}
                        <th className="px-3 py-2 font-medium text-right">Total score</th>
                        <th className="px-3 py-2 font-medium text-right">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabulationRows.length === 0 ? (
                        <tr className="border-b border-[#F1F5F9]">
                          <td
                            className="px-3 py-2 text-slate-400"
                            colSpan={4 + judges.length} // Approx
                          >
                            Once judges submit totals for contests, scores and
                            rankings will appear here.
                          </td>
                        </tr>
                      ) : (
                        tabulationRows.map((row, index) => {
                            // Determine visible judges again to map scores
                            const visibleJudges = judges
                              .filter((judge) => {
                                if (tabulationContestFilterId !== "all") {
                                    return judgeAssignments.some(ja => ja.judge_id === judge.id && ja.contest_id === tabulationContestFilterId);
                                }
                                if (tabulationEventFilterId !== "all") {
                                    return judge.event_id === tabulationEventFilterId;
                                }
                                return true;
                              })
                              .sort((a, b) => a.username.localeCompare(b.username));

                            return (
                          <tr
                            key={`${row.contestName}-${row.contestantNumber}-${index}`}
                            className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                          >
                            <td className="px-3 py-2 text-slate-700">
                              {row.teamName ?? "—"}
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium text-slate-800">
                                {row.participantName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Contestant #{row.contestantNumber}
                              </div>
                            </td>
                            {visibleJudges.map(judge => (
                                <td key={judge.id} className="px-3 py-2 text-center text-slate-600">
                                    {row.judgeScores[judge.id] !== undefined 
                                        ? row.judgeScores[judge.id].toFixed(2) 
                                        : "—"}
                                </td>
                            ))}
                            <td className="px-3 py-2 font-semibold text-[#1F4D3A] text-right">
                              {row.totalScore.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-800 text-right">
                              {row.rank}
                            </td>
                          </tr>
                        )})
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {adminTabulationView === "awards" && (
              <div className="mt-4 rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#1F4D3A]">
                      Awards ranking
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Select an award to view its winners based on current tabulation.
                    </div>
                  </div>
                  <div className="w-full max-w-xs text-xs">
                    <span className="mb-1 block text-[11px] text-slate-500">
                      Award
                    </span>
                    <select
                      className="w-full rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      value={
                        tabulationAwardFilterId === "all"
                          ? ""
                          : String(tabulationAwardFilterId)
                      }
                      onChange={(event) => {
                        const value = event.target.value;
                        if (!value) {
                          setTabulationAwardFilterId("all");
                        } else {
                          setTabulationAwardFilterId(
                            Number.parseInt(value, 10),
                          );
                        }
                        setAwardsTabulationError(null);
                        setAwardsTabulationSuccess(null);
                      }}
                    >
                      <option value="">Select award</option>
                      {awardsResults.map((award) => (
                        <option key={award.awardId} value={award.awardId}>
                          {award.awardName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(awardsTabulationError || awardsTabulationSuccess) && (
                  <div
                    className={`mb-2 text-[10px] ${
                      awardsTabulationError
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    {awardsTabulationError ?? awardsTabulationSuccess}
                  </div>
                )}

                {awardsResults.length === 0 ? (
                  <div className="text-[11px] text-slate-400">
                    No awards configured for this event.
                  </div>
                ) : !selectedTabulationAwardResult ? (
                  <div className="text-[11px] text-slate-400">
                    Select an award above to view its winners.
                  </div>
                ) : selectedTabulationAwardResult.awardType !== "criteria" ? (
                  <div className="text-[11px] text-slate-400">
                    This is a special award. Confirm recipients manually in the Awards
                    tab.
                  </div>
                ) : selectedTabulationAwardResult.allParticipants.length === 0 ? (
                  <div className="text-[11px] text-slate-400">
                    No participants available yet for this award.
                  </div>
                ) : (
                  <div className="space-y-3 text-[11px]">
                    {(() => {
                      const award = selectedTabulationAwardResult;
                      const existingRecipients = awardRecipients.filter(
                        (row) => row.award_id === award.awardId,
                      );
                      const existingRecipientIds = new Set(
                        existingRecipients.map((row) => row.participant_id),
                      );
                      const allWinnersSaved =
                        award.winners.length > 0 &&
                        award.winners.every((winner) =>
                          existingRecipientIds.has(winner.participantId),
                        );

                      return (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800">
                                  {award.awardName}
                                </span>
                                <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[9px] font-medium text-[#166534]">
                                  Criteria-based
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {award.criteriaName
                                  ? `${award.contestName} • ${award.criteriaName}`
                                  : award.contestName}
                              </div>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                            <table className="min-w-full border-collapse text-left text-[11px]">
                              <thead>
                                <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                                  <th className="px-3 py-2 font-medium">Rank</th>
                                  <th className="px-3 py-2 font-medium">
                                    Represent
                                  </th>
                                  <th className="px-3 py-2 font-medium">
                                    Contestant
                                  </th>
                                  {/* Dynamic Judge Columns */}
                                  {(() => {
                                    const originalAward = awards.find(
                                      (a) => a.id === award.awardId,
                                    );

                                    const visibleJudges = judges
                                      .filter((judge) => {
                                        if (originalAward && originalAward.contest_id) {
                                          return judgeAssignments.some(
                                            (ja) =>
                                              ja.judge_id === judge.id &&
                                              ja.contest_id === originalAward.contest_id,
                                          );
                                        }
                                        return judge.event_id === activeEventId;
                                      })
                                      .sort((a, b) => a.username.localeCompare(b.username));

                                    return visibleJudges.map((judge) => (
                                      <th
                                        key={judge.id}
                                        className="px-3 py-2 font-medium text-center"
                                      >
                                        <div>{judge.username}</div>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedJudgeForBreakdown(judge.id)}
                                          className="mt-1 rounded-full border border-[#1F4D3A33] bg-white px-2 py-0.5 text-[9px] font-medium text-[#1F4D3A] transition hover:bg-[#F0FDF4]"
                                        >
                                          show more
                                        </button>
                                      </th>
                                    ));
                                  })()}
                                  <th className="px-3 py-2 font-medium text-right">
                                    Total score
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {award.allParticipants.map((participant, index) => {
                                  const originalAward = awards.find(
                                    (a) => a.id === award.awardId,
                                  );
                                  const visibleJudges = judges
                                    .filter((judge) => {
                                      if (originalAward && originalAward.contest_id) {
                                        return judgeAssignments.some(
                                          (ja) =>
                                            ja.judge_id === judge.id &&
                                            ja.contest_id === originalAward.contest_id,
                                        );
                                      }
                                      return judge.event_id === activeEventId;
                                    })
                                    .sort((a, b) => a.username.localeCompare(b.username));

                                  return (
                                    <tr
                                      key={`${participant.contestantNumber}-${index}`}
                                      className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${
                                        participant.rank === 1 ? "bg-[#F0FDF4]" : ""
                                      }`}
                                    >
                                      <td className="px-3 py-2 font-semibold text-slate-800">
                                        {participant.rank}
                                      </td>
                                      <td className="px-3 py-2 text-slate-700">
                                        {participant.teamName ?? "—"}
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="font-medium text-slate-800">
                                          {participant.participantName}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                          Contestant #{participant.contestantNumber}
                                        </div>
                                      </td>
                                      {visibleJudges.map((judge) => {
                                        // Find the judge's total score for this award
                                        const judgeScore = participant.judgeCriteriaScores[judge.id];

                                        return (
                                          <td
                                            key={judge.id}
                                            className="px-3 py-2 text-center text-slate-600"
                                          >
                                            {judgeScore !== undefined
                                              ? judgeScore.toFixed(2)
                                              : "—"}
                                          </td>
                                        );
                                      })}
                                      <td className="px-3 py-2 text-right font-semibold text-[#1F4D3A]">
                                        {participant.totalScore.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {selectedJudgeForBreakdown !== null && selectedTabulationAwardResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F4D3A]">
                    {judges.find(j => j.id === selectedJudgeForBreakdown)?.username} Breakdown
                  </h3>
                  <p className="text-sm text-slate-500">
                    Detailed scoring for {selectedTabulationAwardResult.awardName}
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
                        const originalAward = awards.find(a => a.id === selectedTabulationAwardResult.awardId);
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
                    {selectedTabulationAwardResult.allParticipants.map((participant) => (
                      <tr key={participant.contestantNumber} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{participant.participantName}</div>
                            <div className="text-xs text-slate-500">#{participant.contestantNumber} • {participant.teamName ?? "No Team"}</div>
                        </td>
                        {(() => {
                            const originalAward = awards.find(a => a.id === selectedTabulationAwardResult.awardId);
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
                                        const s = scores.find(s => s.judge_id === judgeId && s.participant_id === participant.participantId && s.criteria_id === c.id);
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
                                    const s = scores.find(s => s.judge_id === judgeId && s.participant_id === participant.participantId && s.criteria_id === c.id);
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
                             const originalAward = awards.find(a => a.id === selectedTabulationAwardResult.awardId);
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
                                 const s = scores.find(s => s.judge_id === judgeId && s.participant_id === participant.participantId && s.criteria_id === cId);
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
              <button
                type="button"
                onClick={() => setEventTab("awards")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  eventTab === "awards"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Awards
              </button>
              <button
                type="button"
                onClick={() => setEventTab("template")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  eventTab === "template"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Template
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
                        {contestsForActiveEvent.length === 0
                          ? "No contests yet"
                          : `${contestsForActiveEvent.length} contest${
                              contestsForActiveEvent.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    {(contestError || contestSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          contestError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {contestError ?? contestSuccess}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Divisions</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contestsForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={5}
                              >
                                Once you add contests, you can edit or delete
                                them here.
                              </td>
                            </tr>
                          ) : (
                            contestsForActiveEvent.map((contest) => (
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
                                  {categoriesForActiveEvent.length === 0 ? (
                                    <span className="text-[10px] text-slate-400">
                                      No divisions yet
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {categoriesForActiveEvent.map(
                                        (division) => (
                                          <span
                                            key={division.id}
                                            className="inline-flex items-center rounded-full bg-[#E3F2EA] px-2 py-0.5 text-[10px] text-[#1F4D3A]"
                                          >
                                            {division.name}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  )}
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
                                      onClick={() =>
                                        handleDeleteContest(contest.id)
                                      }
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
                        {criteriaForActiveEvent.length === 0
                          ? "No criteria yet"
                          : `${criteriaForActiveEvent.length} criteria`}
                      </span>
                    </div>
                    {(criteriaError || criteriaSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          criteriaError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {criteriaError ?? criteriaSuccess}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Category</th>
                            <th className="px-3 py-2 font-medium">Criteria</th>
                            <th className="px-3 py-2 font-medium">Code</th>
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">
                              {criteriaValueHeader}
                            </th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criteriaForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={6}
                              >
                                Once you add criteria, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            criteriaForActiveEvent.map((criteria) => (
                              <tr
                                key={criteria.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 text-slate-600">
                                  {criteria.category ?? "—"}
                                </td>
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

              {eventTab === "awards" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Awards
                    </div>
                    <button
                      type="button"
                      onClick={openCreateAwardModal}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add award
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-600">
                        Awards list
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {awardsForActiveEvent.length === 0
                          ? "No awards yet"
                          : `${awardsForActiveEvent.length} award${
                              awardsForActiveEvent.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    {(awardError || awardSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          awardError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {awardError ?? awardSuccess}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Name</th>
                            <th className="px-3 py-2 font-medium">Type</th>
                            <th className="px-3 py-2 font-medium">Contest</th>
                            <th className="px-3 py-2 font-medium">Category</th>
                            <th className="px-3 py-2 font-medium">Active</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {awardsForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={6}
                              >
                                Once you add awards, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            awardsForActiveEvent.map((award) => (
                              <tr
                                key={award.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {award.name}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {award.award_type === "criteria"
                                    ? "Criteria-based"
                                    : "Special"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {award.contest_id === null
                                    ? "All contests"
                                    : contests.find(
                                        (contest) =>
                                          contest.id === award.contest_id,
                                      )?.name ?? "Unknown contest"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {award.award_type === "criteria"
                                    ? (() => {
                                        const ids = award.criteria_ids ?? (award.criteria_id ? [award.criteria_id] : []);
                                        if (ids.length === 0) return "—";
                                        
                                        const categories = Array.from(new Set(ids
                                          .map(id => criteriaList.find(c => c.id === id)?.category || "Uncategorized")
                                          .filter(Boolean)));
                                          
                                        return categories.length > 0 ? categories.join(", ") : "Unknown category";
                                      })()
                                    : "—"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {award.is_active ? "Yes" : "No"}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => openEditAwardModal(award)}
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 text-slate-600 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAward(award.id)}
                                      disabled={isDeletingAwardId === award.id}
                                      className={`rounded-full border border-[#FCA5A5] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] ${
                                        isDeletingAwardId === award.id
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                    >
                                      {isDeletingAwardId === award.id
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

              {eventTab === "template" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Templates
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Choose how the judge scoring layout should look.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-3 grid gap-3 text-[10px] sm:grid-cols-2">
                      <div>
                        <div className="mb-1 text-slate-500">Contest</div>
                        <select
                          value={selectedContestIdForTemplate ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setSelectedContestIdForTemplate(
                              value ? Number.parseInt(value, 10) : null,
                            );
                          }}
                          className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1.5 text-[10px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        >
                          <option value="">Select contest</option>
                          {contestsForActiveEvent.map((contest) => (
                            <option key={contest.id} value={contest.id}>
                              {contest.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-slate-500">Template</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateKey("standard");
                              setSelectedTemplateId(null);
                            }}
                            className={`rounded-full border px-3 py-1.5 text-[10px] ${
                              selectedTemplateKey === "standard"
                                ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                                : "border-[#D0D7E2] bg-[#F5F7FF] text-[#1F4D3A]"
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateKey("pageant");
                              setSelectedTemplateId(null);
                            }}
                            className={`rounded-full border px-3 py-1.5 text-[10px] ${
                              selectedTemplateKey === "pageant"
                                ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                                : "border-[#D0D7E2] bg-[#F5F7FF] text-[#1F4D3A]"
                            }`}
                          >
                            Pageant
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedTemplateKey === "pageant" && (
                      <div className="mb-3 space-y-3 text-[10px]">
                        <PageantSection
                          title="Groups and badges"
                          sectionKey="groupsAndBadges"
                          isOpen={openPageantSections.groupsAndBadges}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                              <div className="text-slate-500">Workspace background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.workspaceBg ?? "#F8FAFC"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    workspaceBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.workspaceBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    workspaceBgOpacity: Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Female group background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.femaleGroupBg ?? "#ffe4e6"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    femaleGroupBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.femaleGroupBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    femaleGroupBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Female badge color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.femaleBadgeBg ?? "#ec4899"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    femaleBadgeBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.femaleBadgeBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    femaleBadgeBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Male group background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.maleGroupBg ?? "#e0f2fe"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    maleGroupBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.maleGroupBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    maleGroupBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Male badge color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.maleBadgeBg ?? "#0ea5e9"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    maleBadgeBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.maleBadgeBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    maleBadgeBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Card and number badge"
                          sectionKey="cardsAndNames"
                          isOpen={openPageantSections.cardsAndNames}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                              <div className="text-slate-500">Card background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.cardBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    cardBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.cardBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    cardBgOpacity: Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Number text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.numberTextColor ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    numberTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.numberTextColorOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    numberTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Number font size (px)</div>
                              <input
                                type="number"
                                min={8}
                                max={32}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.numberFontSize ?? 10}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    numberFontSize: Number(event.target.value) || 10,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Number font family</div>
                              <select
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.numberFontFamily ?? "system"}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    numberFontFamily: event.target.value,
                                  }))
                                }
                              >
                                <option value="system">Default</option>
                                <option value="sans">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="mono">Monospace</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Number badge background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.numberBadgeBg ?? "#000000"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    numberBadgeBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.numberBadgeBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    numberBadgeBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Participant name text"
                          sectionKey="participantName"
                          isOpen={openPageantSections.participantName}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <div className="text-slate-500">Name text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.nameTextColor ?? "#111827"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    nameTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.nameTextColorOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    nameTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Name font size (px)</div>
                              <input
                                type="number"
                                min={8}
                                max={32}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.nameFontSize ?? 10}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    nameFontSize: Number(event.target.value) || 10,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Name font family</div>
                              <select
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.nameFontFamily ?? "system"}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    nameFontFamily: event.target.value,
                                  }))
                                }
                              >
                                <option value="system">Default</option>
                                <option value="sans">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="mono">Monospace</option>
                              </select>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Scoring header and criteria rows"
                          sectionKey="criteriaHeaderAndRows"
                          isOpen={openPageantSections.criteriaHeaderAndRows}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                              <div className="text-slate-500">Header background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.criteriaHeaderBg ?? "#f5f7ff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaHeaderBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaHeaderBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaHeaderBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Header text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.criteriaHeaderTextColor ?? "#1f2937"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaHeaderTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaHeaderTextColorOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaHeaderTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Header font size (px)</div>
                              <input
                                type="number"
                                min={8}
                                max={20}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaHeaderFontSize ?? 11}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    criteriaHeaderFontSize:
                                      Number(event.target.value) || 11,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Header font family</div>
                              <select
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaHeaderFontFamily ?? "system"}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    criteriaHeaderFontFamily: event.target.value,
                                  }))
                                }
                              >
                                <option value="system">Default</option>
                                <option value="sans">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="mono">Monospace</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <div className="text-slate-500">Criteria text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.criteriaTextColor ?? "#111827"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaTextColorOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    criteriaTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Criteria font size (px)</div>
                              <input
                                type="number"
                                min={8}
                                max={20}
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaTextFontSize ?? 14}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    criteriaTextFontSize:
                                      Number(event.target.value) || 14,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Criteria font family</div>
                              <select
                                className="w-full rounded-full border border-[#D0D7E2] bg-white px-3 py-1 text-[10px] outline-none"
                                value={templateTheme.criteriaTextFontFamily ?? "system"}
                                onChange={(event) =>
                                  setTemplateTheme((previous) => ({
                                    ...previous,
                                    criteriaTextFontFamily: event.target.value,
                                  }))
                                }
                              >
                                <option value="system">Default</option>
                                <option value="sans">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="mono">Monospace</option>
                              </select>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Scoring table and inputs"
                          sectionKey="scoringTable"
                          isOpen={openPageantSections.scoringTable}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <div className="text-slate-500">Table background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.scoringTableBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringTableBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.scoringTableBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringTableBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Category row background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.scoringCategoryRowBg ?? "#f9fafb"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringCategoryRowBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.scoringCategoryRowBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringCategoryRowBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Total row background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.scoringTotalRowBg ?? "#f5f7ff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringTotalRowBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.scoringTotalRowBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoringTotalRowBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Score input background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.scoreInputBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.scoreInputBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Score input border</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.scoreInputBorderColor ?? "#cbd5e1"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputBorderColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.scoreInputBorderColorOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputBorderColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Score input text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.scoreInputTextColor ?? "#0f172a"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.scoreInputTextColorOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    scoreInputTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Scoring modal header and buttons"
                          sectionKey="scoringModal"
                          isOpen={openPageantSections.scoringModal}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                              <div className="text-slate-500">Header background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalHeaderBg ?? "#f8fafc"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.modalHeaderBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Header main text color</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalHeaderPrimaryTextColor ?? "#0f172a"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderPrimaryTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalHeaderPrimaryTextColorOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderPrimaryTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Header label text color
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.modalHeaderSecondaryTextColor ??
                                  "#64748b"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderSecondaryTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalHeaderSecondaryTextColorOpacity ??
                                  100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalHeaderSecondaryTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Contestant badge background
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalContestantBadgeBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalContestantBadgeBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalContestantBadgeBgOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalContestantBadgeBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Contestant badge text color
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.modalContestantBadgeTextColor ??
                                  "#14532d"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalContestantBadgeTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalContestantBadgeTextColorOpacity ??
                                  100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalContestantBadgeTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Primary button background
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalPrimaryButtonBg ?? "#14532d"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalPrimaryButtonBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalPrimaryButtonBgOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalPrimaryButtonBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Primary button text color
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.modalPrimaryButtonTextColor ?? "#ffffff"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalPrimaryButtonTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalPrimaryButtonTextColorOpacity ??
                                  100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalPrimaryButtonTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Secondary button background
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.modalSecondaryButtonBg ?? "#ffffff"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalSecondaryButtonBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalSecondaryButtonBgOpacity ?? 100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalSecondaryButtonBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">
                                Secondary button text color
                              </div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={
                                  templateTheme.modalSecondaryButtonTextColor ?? "#1f2937"
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalSecondaryButtonTextColor: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={
                                  templateTheme.modalSecondaryButtonTextColorOpacity ??
                                  100
                                }
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalSecondaryButtonTextColorOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Modal body background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalBodyBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalBodyBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.modalBodyBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalBodyBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-slate-500">Modal footer background</div>
                              <input
                                type="color"
                                className="h-8 w-full cursor-pointer rounded-full border border-[#D0D7E2] bg-white px-2"
                                value={templateTheme.modalFooterBg ?? "#ffffff"}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalFooterBg: event.target.value,
                                  })
                                }
                              />
                              <div className="text-[9px] text-slate-400">Opacity (%)</div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                className="w-full cursor-pointer"
                                value={templateTheme.modalFooterBgOpacity ?? 100}
                                onChange={(event) =>
                                  updateTemplateTheme({
                                    modalFooterBgOpacity:
                                      Number(event.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </PageantSection>
                      </div>
                    )}

                    {(templateError || templateSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          templateError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {templateError ?? templateSuccess}
                      </div>
                    )}

                    <div className="mb-4 grid gap-3 text-[10px] sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-[10px] font-medium text-slate-600">
                            Template name
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Shown only to admins
                          </div>
                        </div>
                        <input
                          type="text"
                          value={templateName}
                          onChange={(event) => setTemplateName(event.target.value)}
                          placeholder="e.g. Pageant – Imperial Topaz"
                          className="w-full rounded-full border border-[#D0D7E2] bg-[#F8FAFC] px-3 py-1.5 text-[10px] outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="text-[9px] text-slate-400">
                            Save this style to reuse across events and contests.
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveTemplateToLibrary}
                            disabled={isSavingTemplateToLibrary}
                            className="inline-flex items-center rounded-full bg-[#0F172A] px-3 py-1.5 text-[10px] font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSavingTemplateToLibrary ? "Saving..." : "Save as new template"}
                          </button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-[10px] font-medium text-slate-600">
                            Saved templates
                          </div>
                          {layoutTemplates.length > 0 && (
                            <div className="text-[9px] text-slate-400">
                              Load to edit, apply to use for this contest
                            </div>
                          )}
                        </div>
                            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-[#F8FAFC] p-2">
                          {layoutTemplates.length === 0 ? (
                            <div className="py-4 text-center text-[9px] text-slate-400">
                              No templates saved yet.
                            </div>
                          ) : (
                            layoutTemplates.map((template) => {
                            const isBuiltIn =
                                template.layout_json.templateKey === "pageant" &&
                                (template.name === "Pageant \u2013 Default" ||
                                  template.name === "Platinum Mist" ||
                                  template.name === "Imperial Topaz" ||
                                  template.name === "Royal");

                              return (
                                <div
                                  key={template.id}
                                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5 text-[10px]"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate font-medium text-slate-700">
                                      {template.name}
                                    </div>
                                    <div className="text-[9px] text-slate-400">
                                      {(template.layout_json.templateKey === "pageant"
                                        ? "Pageant"
                                        : "Standard") +
                                        " \u00b7 " +
                                        new Date(
                                          template.created_at,
                                        ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center gap-1.5">
                                    {!isBuiltIn && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteTemplateFromLibrary(template.id)
                                        }
                                        disabled={isDeletingTemplateId === template.id}
                                        className="rounded-full border border-transparent px-2 py-0.5 text-[9px] text-red-500 hover:border-red-100 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isDeletingTemplateId === template.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleLoadTemplateFromLibrary(template)}
                                      className="rounded-full border border-[#D0D7E2] px-2 py-0.5 text-[9px] text-slate-700 hover:bg-[#F8FAFC]"
                                    >
                                      Load
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyTemplateToContest(template)}
                                      disabled={
                                        isSavingTemplate ||
                                        selectedContestIdForTemplate === null
                                      }
                                      className="rounded-full bg-[#1F4D3A] px-2 py-0.5 text-[9px] font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isSavingTemplate ? "Applying..." : "Apply"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 space-y-3 text-[10px]">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-medium text-slate-600">
                          Preview
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveTemplate}
                          disabled={
                            isSavingTemplate || selectedContestIdForTemplate === null
                          }
                          className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSavingTemplate ? "Saving..." : "Save template"}
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-full max-w-5xl">
                          {selectedTemplateKey === "standard" && (
                            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                            {selectedContestIdForTemplate === null ? (
                              <div className="flex h-32 items-center justify-center text-[10px] text-slate-500">
                                Select a contest to see the standard judge view.
                              </div>
                            ) : templatePreviewParticipants.length === 0 ? (
                              <div className="flex h-32 items-center justify-center text-[10px] text-slate-500">
                                Add participants to this contest to see them here.
                              </div>
                            ) : (
                              <>
                                <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#E3F2EA] text-[11px] font-semibold text-[#1F4D3A]">
                                      {templatePreviewParticipants[0].avatar_url ? (
                                        <img
                                          src={templatePreviewParticipants[0].avatar_url}
                                          alt={templatePreviewParticipants[0].full_name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        participantInitials(
                                          templatePreviewParticipants[0].full_name,
                                        )
                                      )}
                                    </div>
                                    <div className="text-[11px] font-semibold text-slate-700">
                                      Participant: {templatePreviewParticipants[0].full_name}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[9px] uppercase tracking-wide text-slate-500">
                                      Contest
                                    </div>
                                    <div className="text-[11px] font-semibold text-[#1F4D3A]">
                                      {contests.find(
                                        (contest) =>
                                          contest.id === selectedContestIdForTemplate,
                                      )?.name ?? "Selected contest"}
                                    </div>
                                  </div>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
                                  <table className="min-w-full border-collapse text-left text-[11px]">
                                    <thead
                                      className="bg-[#F5F7FF] text-[10px] font-semibold uppercase tracking-wide text-[#1F4D3A]"
                                      style={{
                                        ...(templateTheme.criteriaHeaderBg
                                          ? {
                                              backgroundColor: hexWithOpacity(
                                                templateTheme.criteriaHeaderBg,
                                                (templateTheme.criteriaHeaderBgOpacity ??
                                                  100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.criteriaHeaderTextColor
                                          ? {
                                              color: hexWithOpacity(
                                                templateTheme.criteriaHeaderTextColor,
                                                (templateTheme.criteriaHeaderTextColorOpacity ??
                                                  100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.criteriaHeaderFontSize
                                          ? {
                                              fontSize: `${templateTheme.criteriaHeaderFontSize}px`,
                                            }
                                          : {}),
                                        ...(templateTheme.criteriaHeaderFontFamily &&
                                        templateTheme.criteriaHeaderFontFamily !== "system"
                                          ? {
                                              fontFamily:
                                                templateTheme.criteriaHeaderFontFamily ===
                                                "sans"
                                                  ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                                  : templateTheme.criteriaHeaderFontFamily ===
                                                      "serif"
                                                    ? "Georgia, 'Times New Roman', serif"
                                                    : templateTheme
                                                          .criteriaHeaderFontFamily === "mono"
                                                      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                      : undefined,
                                            }
                                          : {}),
                                      }}
                                    >
                                      <tr>
                                        <th className="px-3 py-2 font-medium">Criteria</th>
                                        <th className="px-3 py-2 text-right font-medium">
                                          Score
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {templatePreviewCriteria.length === 0 ? (
                                        <>
                                          <tr className="border-t border-[#E2E8F0]">
                                            <td className="px-3 py-2">Sample criteria</td>
                                            <td className="px-3 py-2 text-right text-[10px] text-slate-500">
                                              /20 pts
                                            </td>
                                          </tr>
                                          <tr className="border-t border-[#E2E8F0]">
                                            <td className="px-3 py-2">Another criteria</td>
                                            <td className="px-3 py-2 text-right text-[10px] text-slate-500">
                                              /10 pts
                                            </td>
                                          </tr>
                                        </>
                                      ) : (
                                        templatePreviewCriteria.map((criteria) => (
                                          <tr
                                            key={criteria.id}
                                            className="border-t border-[#E2E8F0]"
                                          >
                                            <td className="px-3 py-2">{criteria.name}</td>
                                            <td className="px-3 py-2 text-right text-[10px] text-slate-500">
                                              /{criteria.percentage} pts
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
                            </div>
                          )}
                          {selectedTemplateKey === "pageant" && (
                            <div
                              className="space-y-4 rounded-3xl border border-[#CBD5E1] bg-[#F8FAFC] p-4"
                              style={
                                templateTheme.workspaceBg
                                  ? {
                                      backgroundColor: hexWithOpacity(
                                        templateTheme.workspaceBg,
                                        (templateTheme.workspaceBgOpacity ?? 100) /
                                          100,
                                      ),
                                    }
                                  : undefined
                              }
                            >
                              {selectedContestIdForTemplate === null ? (
                                <div className="flex h-40 items-center justify-center text-[10px] text-slate-500">
                                  Select a contest to see the pageant judge view.
                                </div>
                              ) : templatePreviewPageantGroups.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-[10px] text-slate-500">
                                  Add participants and categories to see Female and Male groups.
                                </div>
                              ) : (
                                <div className="space-y-8">
                                  {templatePreviewPageantGroups.map((group) => {
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

                                  const femaleBg = templateTheme.femaleGroupBg;
                                  const femaleBadgeBg = templateTheme.femaleBadgeBg;
                                  const maleBg = templateTheme.maleGroupBg;
                                  const maleBadgeBg = templateTheme.maleBadgeBg;
                                  const cardBg = templateTheme.cardBg;
                                  const numberTextColor = templateTheme.numberTextColor;
                                    const numberFontSize = templateTheme.numberFontSize;
                                    const numberFontFamily =
                                      templateTheme.numberFontFamily ?? "system";
                                  const nameTextColor = templateTheme.nameTextColor;
                                    const nameFontSize = templateTheme.nameFontSize;
                                    const nameFontFamily =
                                      templateTheme.nameFontFamily ?? "system";
                                    const numberBadgeBg = templateTheme.numberBadgeBg;

                                  const containerStyle =
                                    labelLower === "female" && femaleBg
                                      ? {
                                          backgroundColor: hexWithOpacity(
                                            femaleBg,
                                            (templateTheme.femaleGroupBgOpacity ??
                                              100) / 100,
                                          ),
                                        }
                                      : labelLower === "male" && maleBg
                                        ? {
                                            backgroundColor: hexWithOpacity(
                                              maleBg,
                                              (templateTheme.maleGroupBgOpacity ??
                                                100) / 100,
                                            ),
                                          }
                                        : undefined;

                                  const badgeStyle =
                                    labelLower === "female" && femaleBadgeBg
                                      ? {
                                          backgroundColor: hexWithOpacity(
                                            femaleBadgeBg,
                                            (templateTheme.femaleBadgeBgOpacity ??
                                              100) / 100,
                                          ),
                                          backgroundImage: "none",
                                        }
                                      : labelLower === "male" && maleBadgeBg
                                        ? {
                                            backgroundColor: hexWithOpacity(
                                              maleBadgeBg,
                                              (templateTheme.maleBadgeBgOpacity ??
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
                                          {group.items.map((participant) => (
                                            <button
                                              key={participant.id}
                                              type="button"
                                              onClick={() => setTemplateModalParticipant(participant)}
                                              className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/95 p-3 text-[11px] text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[#1F4D3A] hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                                              style={
                                                cardBg
                                                  ? {
                                                      backgroundColor: hexWithOpacity(
                                                        cardBg,
                                                        (templateTheme.cardBgOpacity ??
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
                                                          (templateTheme.cardBgOpacity ??
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
                                                  className="pointer-events-none absolute left-1.5 top-1.5 inline-flex items-center rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur"
                                                  style={{
                                                    backgroundColor: numberBadgeBg
                                                      ? hexWithOpacity(
                                                          numberBadgeBg,
                                                          (templateTheme
                                                            .numberBadgeBgOpacity ??
                                                            100) / 100,
                                                        )
                                                      : undefined,
                                                    color: numberTextColor
                                                      ? hexWithOpacity(
                                                          numberTextColor,
                                                          (templateTheme
                                                            .numberTextColorOpacity ??
                                                            100) / 100,
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
                                                  className="truncate text-[10px] font-semibold tracking-tight text-slate-800"
                                                  style={{
                                                    color: nameTextColor
                                                      ? hexWithOpacity(
                                                          nameTextColor,
                                                          (templateTheme
                                                            .nameTextColorOpacity ??
                                                            100) / 100,
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
                        </div>
                      </div>
                    </div>
                                  </div>
                </div>
              )}
            </div>
            {templateModalParticipant && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div
                  className="flex w-full max-w-3xl max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xl"
                  style={
                    templateTheme.modalBodyBg
                      ? {
                          backgroundColor: hexWithOpacity(
                            templateTheme.modalBodyBg,
                            (templateTheme.modalBodyBgOpacity ?? 100) / 100,
                          ),
                        }
                      : undefined
                  }
                >
                  <div
                    className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4"
                    style={
                      templateTheme.modalHeaderBg
                        ? {
                            backgroundColor: hexWithOpacity(
                              templateTheme.modalHeaderBg,
                              (templateTheme.modalHeaderBgOpacity ?? 100) / 100,
                            ),
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E2F3EC] text-lg font-semibold text-[#1F4D3A] shadow-sm md:h-24 md:w-24 md:text-xl">
                        {templateModalParticipant.avatar_url ? (
                          <img
                            src={templateModalParticipant.avatar_url}
                            alt={templateModalParticipant.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          participantInitials(templateModalParticipant.full_name)
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-sm font-semibold text-slate-800 md:text-base">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                            style={
                              templateTheme.modalHeaderSecondaryTextColor
                                ? {
                                    color: hexWithOpacity(
                                      templateTheme.modalHeaderSecondaryTextColor,
                                      (templateTheme
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
                              templateTheme.modalHeaderPrimaryTextColor
                                ? {
                                    color: hexWithOpacity(
                                      templateTheme.modalHeaderPrimaryTextColor,
                                      (templateTheme
                                        .modalHeaderPrimaryTextColorOpacity ?? 100) /
                                        100,
                                    ),
                                  }
                                : undefined
                            }
                          >
                            {templateModalParticipant.full_name}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-normal md:text-sm text-slate-500">
                          <span
                            style={
                              templateTheme.modalHeaderSecondaryTextColor
                                ? {
                                    color: hexWithOpacity(
                                      templateTheme.modalHeaderSecondaryTextColor,
                                      (templateTheme
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
                              templateTheme.modalHeaderPrimaryTextColor
                                ? {
                                    color: hexWithOpacity(
                                      templateTheme.modalHeaderPrimaryTextColor,
                                      (templateTheme
                                        .modalHeaderPrimaryTextColorOpacity ?? 100) /
                                        100,
                                    ),
                                  }
                                : undefined
                            }
                          >
                            Pageant
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-slate-500 md:text-sm">
                        <div
                          className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                          style={
                            templateTheme.modalHeaderSecondaryTextColor
                              ? {
                                  color: hexWithOpacity(
                                    templateTheme.modalHeaderSecondaryTextColor,
                                    (templateTheme
                                      .modalHeaderSecondaryTextColorOpacity ?? 100) /
                                      100,
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
                            ...(templateTheme.modalContestantBadgeBg
                              ? {
                                  backgroundColor: hexWithOpacity(
                                    templateTheme.modalContestantBadgeBg,
                                    (templateTheme
                                      .modalContestantBadgeBgOpacity ?? 100) / 100,
                                  ),
                                }
                              : {}),
                            ...(templateTheme.modalContestantBadgeTextColor
                              ? {
                                  color: hexWithOpacity(
                                    templateTheme.modalContestantBadgeTextColor,
                                    (templateTheme
                                      .modalContestantBadgeTextColorOpacity ?? 100) /
                                      100,
                                  ),
                                }
                              : {}),
                          }}
                        >
                          {templateModalParticipant.contestant_number}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTemplateModalParticipant(null)}
                        className="ml-2 rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] shadow-sm"
                        style={{
                          ...(templateTheme.modalSecondaryButtonBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  templateTheme.modalSecondaryButtonBg,
                                  (templateTheme.modalSecondaryButtonBgOpacity ??
                                    100) / 100,
                                ),
                              }
                            : { backgroundColor: "#ffffff" }),
                          ...(templateTheme.modalSecondaryButtonTextColor
                            ? {
                                color: hexWithOpacity(
                                  templateTheme.modalSecondaryButtonTextColor,
                                  (templateTheme
                                    .modalSecondaryButtonTextColorOpacity ?? 100) /
                                    100,
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
                        templateTheme.scoringTableBg
                          ? {
                              backgroundColor: hexWithOpacity(
                                templateTheme.scoringTableBg,
                                (templateTheme.scoringTableBgOpacity ?? 100) / 100,
                              ),
                            }
                          : undefined
                      }
                    >
                      <table className="min-w-full border-collapse text-left text-sm text-slate-800">
                        <thead
                          className="bg-[#F5F7FF] text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm"
                          style={{
                            ...(templateTheme.criteriaHeaderBg
                              ? {
                                  backgroundColor: hexWithOpacity(
                                    templateTheme.criteriaHeaderBg,
                                    (templateTheme.criteriaHeaderBgOpacity ?? 100) / 100,
                                  ),
                                }
                              : {}),
                            ...(templateTheme.criteriaHeaderTextColor
                              ? {
                                  color: hexWithOpacity(
                                    templateTheme.criteriaHeaderTextColor,
                                    (templateTheme.criteriaHeaderTextColorOpacity ??
                                      100) /
                                      100,
                                  ),
                                }
                              : {}),
                            ...(templateTheme.criteriaHeaderFontSize
                              ? {
                                  fontSize: `${templateTheme.criteriaHeaderFontSize}px`,
                                }
                              : {}),
                            ...(templateTheme.criteriaHeaderFontFamily &&
                            templateTheme.criteriaHeaderFontFamily !== "system"
                              ? {
                                  fontFamily:
                                    templateTheme.criteriaHeaderFontFamily === "sans"
                                      ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                      : templateTheme.criteriaHeaderFontFamily === "serif"
                                        ? "Georgia, 'Times New Roman', serif"
                                        : templateTheme.criteriaHeaderFontFamily === "mono"
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
                          {templatePreviewCriteria.length === 0 ? (
                            <>
                              <tr className="border-t border-[#E2E8F0]">
                                <td className="px-4 py-3 align-middle">
                                  <div
                                    className="text-sm text-slate-800"
                                    style={{
                                      ...(templateTheme.criteriaTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              templateTheme.criteriaTextColor,
                                              (templateTheme.criteriaTextColorOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontSize
                                        ? {
                                            fontSize: `${templateTheme.criteriaTextFontSize}px`,
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontFamily &&
                                      templateTheme.criteriaTextFontFamily !== "system"
                                        ? {
                                            fontFamily:
                                              templateTheme.criteriaTextFontFamily ===
                                              "sans"
                                                ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                                : templateTheme.criteriaTextFontFamily ===
                                                    "serif"
                                                  ? "Georgia, 'Times New Roman', serif"
                                                  : templateTheme.criteriaTextFontFamily ===
                                                      "mono"
                                                    ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                    : undefined,
                                          }
                                        : {}),
                                    }}
                                  >
                                    <div className="font-medium">
                                      Face
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      20 pts
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                  <div className="flex items-center justify-end gap-2">
                                    <div
                                      className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-slate-400"
                                      style={{
                                        ...(templateTheme.scoreInputBg
                                          ? {
                                              backgroundColor: hexWithOpacity(
                                                templateTheme.scoreInputBg,
                                                (templateTheme.scoreInputBgOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputBorderColor
                                          ? {
                                              borderColor: hexWithOpacity(
                                                templateTheme.scoreInputBorderColor,
                                                (templateTheme
                                                  .scoreInputBorderColorOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputTextColor
                                          ? {
                                              color: hexWithOpacity(
                                                templateTheme.scoreInputTextColor,
                                                (templateTheme
                                                  .scoreInputTextColorOpacity ?? 100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                      }}
                                    >
                                      —
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      /20
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              <tr className="border-t border-[#E2E8F0]">
                                <td className="px-4 py-3 align-middle">
                                  <div
                                    className="text-sm text-slate-800"
                                    style={{
                                      ...(templateTheme.criteriaTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              templateTheme.criteriaTextColor,
                                              (templateTheme.criteriaTextColorOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontSize
                                        ? {
                                            fontSize: `${templateTheme.criteriaTextFontSize}px`,
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontFamily &&
                                      templateTheme.criteriaTextFontFamily !== "system"
                                        ? {
                                            fontFamily:
                                              templateTheme.criteriaTextFontFamily ===
                                              "sans"
                                                ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                                : templateTheme.criteriaTextFontFamily ===
                                                    "serif"
                                                  ? "Georgia, 'Times New Roman', serif"
                                                  : templateTheme.criteriaTextFontFamily ===
                                                      "mono"
                                                    ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                                                    : undefined,
                                          }
                                        : {}),
                                    }}
                                  >
                                    <div className="font-medium">
                                      Body
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      20 pts
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                  <div className="flex items-center justify-end gap-2">
                                    <div
                                      className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-slate-400"
                                      style={{
                                        ...(templateTheme.scoreInputBg
                                          ? {
                                              backgroundColor: hexWithOpacity(
                                                templateTheme.scoreInputBg,
                                                (templateTheme.scoreInputBgOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputBorderColor
                                          ? {
                                              borderColor: hexWithOpacity(
                                                templateTheme.scoreInputBorderColor,
                                                (templateTheme
                                                  .scoreInputBorderColorOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputTextColor
                                          ? {
                                              color: hexWithOpacity(
                                                templateTheme.scoreInputTextColor,
                                                (templateTheme
                                                  .scoreInputTextColorOpacity ?? 100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                      }}
                                    >
                                      —
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      /20
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            </>
                          ) : (
                            templatePreviewCriteria.map((criteria, index) => {
                              const previous =
                                index > 0 ? templatePreviewCriteria[index - 1] : null;
                              const currentCategory = (criteria.category ?? "").trim();
                              const previousCategory = previous
                                ? (previous.category ?? "").trim()
                                : null;
                              const showHeader =
                                index === 0 || currentCategory !== previousCategory;
                              return [
                                showHeader && (
                                  <tr
                                    key={"header-" + (currentCategory || "uncategorized")}
                                    className="bg-[#F9FAFB]"
                                    style={
                                      templateTheme.scoringCategoryRowBg
                                        ? {
                                            backgroundColor: hexWithOpacity(
                                              templateTheme.scoringCategoryRowBg,
                                              (templateTheme
                                                .scoringCategoryRowBgOpacity ?? 100) /
                                                100,
                                            ),
                                          }
                                        : undefined
                                    }
                                  >
                                    <td
                                      colSpan={2}
                                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm"
                                    >
                                      {currentCategory || "\u00A0"}
                                    </td>
                                  </tr>
                                ),
                                <tr
                                  key={criteria.id}
                                  className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]"
                                >
                                <td className="px-4 py-3 align-middle">
                                  <div
                                    className="text-sm text-slate-800"
                                    style={{
                                      ...(templateTheme.criteriaTextColor
                                        ? {
                                            color: hexWithOpacity(
                                              templateTheme.criteriaTextColor,
                                              (templateTheme.criteriaTextColorOpacity ??
                                                100) /
                                                100,
                                            ),
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontSize
                                        ? {
                                            fontSize: `${templateTheme.criteriaTextFontSize}px`,
                                          }
                                        : {}),
                                      ...(templateTheme.criteriaTextFontFamily &&
                                      templateTheme.criteriaTextFontFamily !== "system"
                                        ? {
                                            fontFamily:
                                              templateTheme.criteriaTextFontFamily ===
                                              "sans"
                                                ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                                                : templateTheme.criteriaTextFontFamily ===
                                                    "serif"
                                                  ? "Georgia, 'Times New Roman', serif"
                                                  : templateTheme.criteriaTextFontFamily ===
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
                                      {criteria.percentage} pts
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                  <div className="flex items-center justify-end gap-2">
                                    <div
                                      className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-slate-400"
                                      style={{
                                        ...(templateTheme.scoreInputBg
                                          ? {
                                              backgroundColor: hexWithOpacity(
                                                templateTheme.scoreInputBg,
                                                (templateTheme.scoreInputBgOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputBorderColor
                                          ? {
                                              borderColor: hexWithOpacity(
                                                templateTheme.scoreInputBorderColor,
                                                (templateTheme
                                                  .scoreInputBorderColorOpacity ??
                                                  100) / 100,
                                              ),
                                            }
                                          : {}),
                                        ...(templateTheme.scoreInputTextColor
                                          ? {
                                              color: hexWithOpacity(
                                                templateTheme.scoreInputTextColor,
                                                (templateTheme
                                                  .scoreInputTextColorOpacity ?? 100) /
                                                  100,
                                              ),
                                            }
                                          : {}),
                                      }}
                                    >
                                      —
                                    </div>
                                    <span className="text-xs text-slate-400">
                                      /
                                      {criteria.percentage}
                                    </span>
                                  </div>
                                </td>
                              </tr>,
                              ];
                          })
                          )}
                        </tbody>
                        <tfoot
                          className="bg-[#F5F7FF]"
                          style={
                            templateTheme.scoringTotalRowBg
                              ? {
                                  backgroundColor: hexWithOpacity(
                                    templateTheme.scoringTotalRowBg,
                                    (templateTheme.scoringTotalRowBgOpacity ?? 100) /
                                      100,
                                  ),
                                }
                              : undefined
                          }
                        >
                          <tr>
                            <td
                              className="px-4 py-3 text-right text-sm font-semibold text-slate-700"
                              style={
                                templateTheme.scoringTotalRowLabelTextColor
                                  ? {
                                      color: hexWithOpacity(
                                        templateTheme.scoringTotalRowLabelTextColor,
                                        (templateTheme
                                          .scoringTotalRowLabelTextColorOpacity ??
                                          100) / 100,
                                      ),
                                    }
                                  : undefined
                              }
                            >
                              Total points
                            </td>
                            <td
                              className="px-4 py-3 text-right text-sm font-semibold text-[#1F4D3A]"
                              style={
                                templateTheme.scoringTotalRowScoreTextColor
                                  ? {
                                      color: hexWithOpacity(
                                        templateTheme.scoringTotalRowScoreTextColor,
                                        (templateTheme
                                          .scoringTotalRowScoreTextColorOpacity ??
                                          100) / 100,
                                      ),
                                    }
                                  : undefined
                              }
                            >
                              —
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div
                      className="sticky bottom-0 mt-5 flex items-center justify-end gap-3 bg-white pt-3 pb-4"
                      style={
                        templateTheme.modalFooterBg
                          ? {
                              backgroundColor: hexWithOpacity(
                                templateTheme.modalFooterBg,
                                (templateTheme.modalFooterBgOpacity ?? 100) / 100,
                              ),
                            }
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setTemplateModalParticipant(null)}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                        style={{
                          ...(templateTheme.modalSecondaryButtonBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  templateTheme.modalSecondaryButtonBg,
                                  (templateTheme.modalSecondaryButtonBgOpacity ??
                                    100) / 100,
                                ),
                              }
                            : { backgroundColor: "#ffffff" }),
                          ...(templateTheme.modalSecondaryButtonTextColor
                            ? {
                                color: hexWithOpacity(
                                  templateTheme.modalSecondaryButtonTextColor,
                                  (templateTheme
                                    .modalSecondaryButtonTextColorOpacity ?? 100) /
                                    100,
                                ),
                              }
                            : { color: "#14532d" }),
                          borderColor: "#1F4D3A33",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-full px-5 py-2 text-sm font-medium shadow-sm"
                        style={{
                          ...(templateTheme.modalPrimaryButtonBg
                            ? {
                                backgroundColor: hexWithOpacity(
                                  templateTheme.modalPrimaryButtonBg,
                                  (templateTheme.modalPrimaryButtonBgOpacity ?? 100) /
                                    100,
                                ),
                              }
                            : { backgroundColor: "#14532d" }),
                          ...(templateTheme.modalPrimaryButtonTextColor
                            ? {
                                color: hexWithOpacity(
                                  templateTheme.modalPrimaryButtonTextColor,
                                  (templateTheme
                                    .modalPrimaryButtonTextColorOpacity ?? 100) /
                                    100,
                                ),
                              }
                            : { color: "#ffffff" }),
                        }}
                      >
                        Submit all
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Scoring system *
                      </div>
                      <div className="inline-flex rounded-full bg-[#F1F5F9] p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setContestScoringType("percentage")}
                          className={`flex-1 rounded-full px-3 py-1 text-xs ${
                            contestScoringType === "percentage"
                              ? "bg-white text-[#1F4D3A] shadow-sm"
                              : "text-slate-500"
                          }`}
                        >
                          Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setContestScoringType("points")}
                          className={`flex-1 rounded-full px-3 py-1 text-xs ${
                            contestScoringType === "points"
                              ? "bg-white text-[#1F4D3A] shadow-sm"
                              : "text-slate-500"
                          }`}
                        >
                          Points
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Percentage: scores are 0–100 with weighted criteria.
                        Points: scores are raw points per criteria.
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">Divisions (optional)</div>
                      <div className="flex gap-2">
                        <input
                          value={contestCategoryText}
                          onChange={(event) =>
                            setContestCategoryText(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              const value = contestCategoryText.trim();
                              if (!value) {
                                return;
                              }
                              const lower = value.toLowerCase();
                              const exists = contestDivisionNames.some(
                                (name) => name.toLowerCase() === lower,
                              );
                              if (!exists) {
                                setContestDivisionNames((previous) => [
                                  ...previous,
                                  value,
                                ]);
                              }
                              setContestCategoryText("");
                            }
                          }}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                          placeholder="Add a division, e.g., Male"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const value = contestCategoryText.trim();
                            if (!value) {
                              return;
                            }
                            const lower = value.toLowerCase();
                            const exists = contestDivisionNames.some(
                              (name) => name.toLowerCase() === lower,
                            );
                            if (!exists) {
                              setContestDivisionNames((previous) => [
                                ...previous,
                                value,
                              ]);
                            }
                            setContestCategoryText("");
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F4D3A] text-xs font-semibold text-white shadow-sm transition hover:bg-[#163528]"
                        >
                          +
                        </button>
                      </div>
                      {contestDivisionNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {contestDivisionNames.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() =>
                                setContestDivisionNames((previous) =>
                                  previous.filter((item) => item !== name),
                                )
                              }
                              className="flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-slate-700"
                            >
                              <span>{name}</span>
                              <span className="rounded-full bg-[#E2E8F0] px-1 text-[9px] text-slate-500">
                                ×
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        Add one division at a time and click +. They appear in
                        the participant division dropdown.
                      </div>
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
                      {isSavingContest
                        ? editingContestId === null
                          ? "Creating..."
                          : "Updating..."
                        : editingContestId === null
                        ? "Create contest"
                        : "Update contest"}
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
                    {editingCriteriaId === null ? (
                      <>
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
                            Criteria Category Name *
                          </div>
                          <input
                            value={criteriaCategory}
                            onChange={(event) =>
                              setCriteriaCategory(event.target.value)
                            }
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                            placeholder="e.g., Beauty"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[10px] text-slate-500">
                            Criteria list
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCriteriaItem}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#D0D7E2] text-xs font-semibold text-[#1F4D3A] hover:bg-[#F5F7FF]"
                          >
                            +
                          </button>
                        </div>
                        {criteriaItems.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                          >
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-500">
                                Criteria
                              </div>
                              <input
                                value={item.name}
                                onChange={(event) =>
                                  handleChangeCriteriaItem(
                                    index,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                                placeholder="Enter criteria name"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-500">
                                Points
                              </div>
                              <input
                                type="number"
                                value={item.weight}
                                onChange={(event) =>
                                  handleChangeCriteriaItem(
                                    index,
                                    "weight",
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                                placeholder="Enter points (0-100)"
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
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
                            Criteria Category Name
                          </div>
                          <input
                            value={editingCriteriaCategory}
                            onChange={(event) =>
                              setEditingCriteriaCategory(event.target.value)
                            }
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                            placeholder="e.g., Beauty"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500">
                            Criteria Name *
                          </div>
                          <input
                            value={criteriaName}
                            onChange={(event) =>
                              setCriteriaName(event.target.value)
                            }
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                            placeholder="e.g., Technique, Presentation, etc."
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500">
                            Points *
                          </div>
                          <input
                            type="number"
                            value={criteriaWeight}
                            onChange={(event) =>
                              setCriteriaWeight(event.target.value)
                            }
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                            placeholder="Enter points (0-100)"
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
                      </>
                    )}
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

            {isAwardModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1F4D3A]">
                        {editingAwardId === null ? "Add award" : "Edit award"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Configure awards for this event.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAwardModalOpen(false)}
                      className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3 px-5 py-4 text-[11px]">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Award name *
                      </div>
                      <input
                        value={awardName}
                        onChange={(event) => setAwardName(event.target.value)}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="e.g., Best in Talent"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">
                          Award type *
                        </div>
                        <select
                          value={awardType}
                          onChange={(event) =>
                            setAwardType(event.target.value as AwardType)
                          }
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        >
                          <option value="criteria">Criteria-based</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">
                          Limit to contest
                        </div>
                        <select
                          value={awardContestId ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setAwardContestId(
                              value ? Number.parseInt(value, 10) : null,
                            );
                          }}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        >
                          <option value="">All contests</option>
                          {contestsForActiveEvent.map((contest) => (
                            <option key={contest.id} value={contest.id}>
                              {contest.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {awardType === "criteria" && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">
                          Linked criteria category *
                        </div>
                        <div className="relative" ref={awardCriteriaDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsAwardCriteriaDropdownOpen(!isAwardCriteriaDropdownOpen)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                          >
                            <span className={awardCriteriaIds.length === 0 ? "text-slate-400" : "text-slate-900"}>
                              {(() => {
                                // Determine selected categories based on selected criteria IDs
                                const selectedCategories = Array.from(new Set(
                                  criteriaForActiveEvent
                                    .filter(c => awardCriteriaIds.includes(c.id))
                                    .map(c => c.category || "Uncategorized")
                                ));
                                
                                return selectedCategories.length === 0
                                  ? "Select category"
                                  : selectedCategories.length === 1
                                    ? selectedCategories[0]
                                    : `${selectedCategories.length} categories selected`;
                              })()}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={`h-4 w-4 text-slate-400 transition-transform ${isAwardCriteriaDropdownOpen ? "rotate-180" : ""}`}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                          
                          {isAwardCriteriaDropdownOpen && (
                            <div className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                              {criteriaForActiveEvent.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-400">No criteria available.</div>
                              ) : (
                                <div className="p-1">
                                  {Array.from(new Set(criteriaForActiveEvent.map(c => c.category || "Uncategorized"))).map((category) => {
                                    const criteriaInCategory = criteriaForActiveEvent.filter(c => (c.category || "Uncategorized") === category);
                                    const allSelected = criteriaInCategory.every(c => awardCriteriaIds.includes(c.id));
                                    const someSelected = criteriaInCategory.some(c => awardCriteriaIds.includes(c.id)) && !allSelected;
                                    const isExpanded = expandedAwardCategories.has(category);
                                    
                                    return (
                                      <div key={category} className="border-b border-[#F1F5F9] last:border-0">
                                        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F8FAFC]">
                                          <input
                                            type="checkbox"
                                            id={`category-${category}`}
                                            checked={allSelected}
                                            ref={(el) => {
                                              if (el) el.indeterminate = someSelected;
                                            }}
                                            onChange={(e) => {
                                              const ids = criteriaInCategory.map(c => c.id);
                                              if (e.target.checked) {
                                                setAwardCriteriaIds((prev) => Array.from(new Set([...prev, ...ids])));
                                              } else {
                                                setAwardCriteriaIds((prev) => prev.filter((id) => !ids.includes(id)));
                                              }
                                            }}
                                            className="h-3.5 w-3.5 rounded border-[#D0D7E2] text-[#1F4D3A] focus:ring-[#1F4D3A]"
                                          />
                                          <div 
                                            className="flex flex-1 cursor-pointer items-center justify-between py-0.5"
                                            onClick={() => {
                                              const next = new Set(expandedAwardCategories);
                                              if (next.has(category)) next.delete(category);
                                              else next.add(category);
                                              setExpandedAwardCategories(next);
                                            }}
                                          >
                                            <span className="text-xs font-medium text-slate-700">
                                              {category}
                                            </span>
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              strokeWidth={2}
                                              stroke="currentColor"
                                              className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                          </div>
                                        </div>
                                        
                                        {isExpanded && (
                                          <div className="bg-slate-50/50 py-1 pl-7 pr-2">
                                            {criteriaInCategory.map((criterion) => (
                                              <div key={criterion.id} className="flex items-center gap-2 py-1.5">
                                                <input
                                                  type="checkbox"
                                                  id={`criterion-${criterion.id}`}
                                                  checked={awardCriteriaIds.includes(criterion.id)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setAwardCriteriaIds((prev) => [...prev, criterion.id]);
                                                    } else {
                                                      setAwardCriteriaIds((prev) => prev.filter((id) => id !== criterion.id));
                                                    }
                                                  }}
                                                  className="h-3 w-3 rounded border-[#D0D7E2] text-[#1F4D3A] focus:ring-[#1F4D3A]"
                                                />
                                                <label 
                                                  htmlFor={`criterion-${criterion.id}`} 
                                                  className="cursor-pointer text-[11px] text-slate-600 hover:text-[#1F4D3A]"
                                                >
                                                  {criterion.name}
                                                </label>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Description
                      </div>
                      <textarea
                        value={awardDescription}
                        onChange={(event) =>
                          setAwardDescription(event.target.value)
                        }
                        className="min-h-[70px] w-full resize-none rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Describe this award"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="award-active"
                        type="checkbox"
                        checked={awardIsActive}
                        onChange={(event) =>
                          setAwardIsActive(event.target.checked)
                        }
                        className="h-3 w-3 rounded border-[#D0D7E2] text-[#1F4D3A] focus:ring-[#1F4D3A]"
                      />
                      <label
                        htmlFor="award-active"
                        className="text-[10px] text-slate-600"
                      >
                        Award is active
                      </label>
                    </div>
                    {(awardError || awardSuccess) && (
                      <div
                        className={`text-[10px] ${
                          awardError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {awardError ?? awardSuccess}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setIsAwardModalOpen(false)}
                      className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAward}
                      disabled={isSavingAward}
                      className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                        isSavingAward ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {isSavingAward
                        ? "Saving..."
                        : editingAwardId === null
                        ? "Add award"
                        : "Update award"}
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
                  Add teams and participants for each contest.
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
                Team
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
              <button
                type="button"
                onClick={() => setParticipantTab("judge")}
                className={`rounded-full border px-3 py-1.5 transition ${
                  participantTab === "judge"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white shadow-sm"
                    : "border-transparent bg-[#F5F7FF] text-[#1F4D3A] hover:bg-[#E3F2EA]"
                }`}
              >
                Judge
              </button>
            </div>

            <div>
              {participantTab === "category" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Teams
                    </div>
                    <button
                      type="button"
                      onClick={openCreateCategoryModal}
                      className="inline-flex items-center rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528]"
                    >
                      Add team
                    </button>
                  </div>

                  <div className="rounded-2xl border border-[#1F4D3A1F] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-medium text-slate-600">
                          Team list
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {teamsForActiveEvent.length === 0
                            ? "No teams yet"
                            : `${teamsForActiveEvent.length} team${
                                teamsForActiveEvent.length > 1 ? "s" : ""
                              }`}
                        </div>
                      </div>
                    </div>
                    {(categoryError || categorySuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          categoryError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {categoryError ?? categorySuccess}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Team name</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamsForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={3}
                              >
                                Once you add teams, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            teamsForActiveEvent.map((team) => (
                              <tr
                                key={team.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 text-slate-600">
                                  {events.find(
                                    (event) => event.id === team.event_id,
                                  )?.name ?? "Unknown event"}
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {team.name}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px] text-slate-500">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditCategoryModal(team)
                                      }
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 text-[10px] hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteCategory(team.id)
                                      }
                                      disabled={isDeletingCategoryId === team.id}
                                      className="rounded-full border border-[#FEE2E2] px-2 py-0.5 text-[10px] text-red-500 hover:bg-[#FEF2F2] disabled:opacity-60"
                                    >
                                      {isDeletingCategoryId === team.id
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

              {participantTab === "participant" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Participants
                    </div>
                    <button
                      type="button"
                      onClick={openCreateParticipantModal}
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
                        {participantsForActiveEvent.length === 0
                          ? "No participants yet"
                          : `${participantsForActiveEvent.length} participant${
                              participantsForActiveEvent.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    {(participantError || participantSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          participantError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {participantError ?? participantSuccess}
                      </div>
                    )}
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
                          {participantsForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={5}
                              >
                                Once you add participants, you can edit or
                                delete them here.
                              </td>
                            </tr>
                          ) : (
                            participantsForActiveEvent.map((participant) => (
                              <tr
                                key={participant.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 text-slate-600">
                                  {contests.find(
                                    (contest) =>
                                      contest.id === participant.contest_id,
                                  )?.name ?? "Unknown contest"}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {categories.find(
                                    (category) =>
                                      category.id === participant.division_id,
                                  )?.name ?? "Unknown category"}
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {participant.full_name}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {participant.contestant_number}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px] text-slate-500">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditParticipantModal(participant)
                                      }
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteParticipant(participant.id)
                                      }
                                      disabled={
                                        isDeletingParticipantId ===
                                        participant.id
                                      }
                                      className="rounded-full border border-[#FEE2E2] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] disabled:opacity-60"
                                    >
                                      {isDeletingParticipantId ===
                                      participant.id
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

              {participantTab === "judge" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Judge scoring access
                    </div>
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
                      {(judgePermissionsError || judgePermissionsSuccess) && (
                        <div
                          className={`mt-3 text-[10px] ${
                            judgePermissionsError ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {judgePermissionsError ?? judgePermissionsSuccess}
                        </div>
                      )}
                      <button
                        type="button"
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
                          const { error: deleteScoringError } = await supabase
                            .from("judge_scoring_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions);
                          if (deleteScoringError) {
                            setJudgePermissionsError(
                              deleteScoringError.message || "Unable to update judge permissions.",
                            );
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          const allCriteriaIdsForSave = criteriaList
                            .filter((c) => c.contest_id === selectedContestIdForPermissions)
                            .map((c) => c.id);
                          const isAllCriteriaSelected =
                            judgePermissionsMode === "all" ||
                            (allCriteriaIdsForSave.length > 0 &&
                              allCriteriaIdsForSave.every((id) =>
                                judgePermissionsCriteriaIds.includes(id),
                              ));
                          const scoringInserts: {
                            judge_id: number;
                            contest_id: number;
                            criteria_id: number | null;
                            can_edit: boolean;
                          }[] = [];
                          if (isAllCriteriaSelected) {
                            judgeIds.forEach((judgeId) => {
                              scoringInserts.push({
                                judge_id: judgeId,
                                contest_id: selectedContestIdForPermissions,
                                criteria_id: null,
                                can_edit: true,
                              });
                            });
                          } else {
                            judgeIds.forEach((judgeId) => {
                              scoringInserts.push({
                                judge_id: judgeId,
                                contest_id: selectedContestIdForPermissions,
                                criteria_id: null,
                                can_edit: false,
                              });
                            });
                            judgePermissionsCriteriaIds.forEach((criteriaId) => {
                              judgeIds.forEach((judgeId) => {
                                scoringInserts.push({
                                  judge_id: judgeId,
                                  contest_id: selectedContestIdForPermissions,
                                  criteria_id: criteriaId,
                                  can_edit: true,
                                });
                              });
                            });
                          }
                          if (scoringInserts.length > 0) {
                            const { data, error } = await supabase
                              .from("judge_scoring_permission")
                              .insert(scoringInserts)
                              .select("judge_id, contest_id, criteria_id, can_edit, created_at");
                            if (error) {
                              setJudgePermissionsError(
                                error.message || "Unable to update judge permissions.",
                              );
                              setIsSavingJudgePermissions(false);
                              return;
                            }
                            if (data && Array.isArray(data)) {
                              setJudgeScoringPermissions((previous) => [
                                ...previous.filter(
                                  (permission) =>
                                    !(
                                      judgeIds.includes(permission.judge_id) &&
                                      permission.contest_id === selectedContestIdForPermissions
                                    ),
                                ),
                                ...(data as JudgeScoringPermissionRow[]),
                              ]);
                            }
                          } else {
                            setJudgeScoringPermissions((previous) =>
                              previous.filter(
                                (permission) =>
                                  !(
                                    judgeIds.includes(permission.judge_id) &&
                                    permission.contest_id === selectedContestIdForPermissions
                                  ),
                              ),
                            );
                          }
                          const { error: deleteDivisionError } = await supabase
                            .from("judge_division_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions);
                          if (deleteDivisionError) {
                            setJudgePermissionsError(
                              deleteDivisionError.message || "Unable to update judge division access.",
                            );
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          if (judgeDivisionMode === "custom" && judgeDivisionIds.length > 0) {
                            const { error: insertDivisionError } = await supabase
                              .from("judge_division_permission")
                              .insert(
                                judgeDivisionIds.flatMap((divisionId) =>
                                  judgeIds.map((judgeId) => ({
                                    judge_id: judgeId,
                                    contest_id: selectedContestIdForPermissions,
                                    division_id: divisionId,
                                  })),
                                ),
                              );
                            if (insertDivisionError) {
                              setJudgePermissionsError(
                                insertDivisionError.message ||
                                  "Unable to update judge division access.",
                              );
                              setIsSavingJudgePermissions(false);
                              return;
                            }
                          }
                          const { error: deleteParticipantError } = await supabase
                            .from("judge_participant_permission")
                            .delete()
                            .in("judge_id", judgeIds)
                            .eq("contest_id", selectedContestIdForPermissions);
                          if (deleteParticipantError) {
                            setJudgePermissionsError(
                              deleteParticipantError.message ||
                                "Unable to update judge participant access.",
                            );
                            setIsSavingJudgePermissions(false);
                            return;
                          }
                          if (judgeParticipantMode === "custom" && judgeParticipantIds.length > 0) {
                            const { error: insertParticipantError } = await supabase
                              .from("judge_participant_permission")
                              .insert(
                                judgeParticipantIds.flatMap((participantId) =>
                                  judgeIds.map((judgeId) => ({
                                    judge_id: judgeId,
                                    contest_id: selectedContestIdForPermissions,
                                    participant_id: participantId,
                                  })),
                                ),
                              );
                            if (insertParticipantError) {
                              setJudgePermissionsError(
                                insertParticipantError.message ||
                                  "Unable to update judge participant access.",
                              );
                              setIsSavingJudgePermissions(false);
                              return;
                            }
                          }
                          if (isAllCriteriaSelected || judgePermissionsCriteriaIds.length > 0) {
                            const { error: resetSubmissionError } = await supabase
                              .from("judge_contest_submission")
                              .delete()
                              .in("judge_id", judgeIds)
                              .eq("contest_id", selectedContestIdForPermissions);
                            if (resetSubmissionError) {
                              setJudgePermissionsError(
                                resetSubmissionError.message ||
                                  "Unable to reset judge submission status.",
                              );
                              setIsSavingJudgePermissions(false);
                              return;
                            }
                            setJudgeContestSubmissions((previous) =>
                              previous.filter(
                                (submission) =>
                                  !(
                                    judgeIds.includes(submission.judge_id) &&
                                    submission.contest_id === selectedContestIdForPermissions
                                  ),
                              ),
                            );
                          }
                          setJudgePermissionsSuccess("Judge scoring access has been updated.");
                          setIsSavingJudgePermissions(false);
                        }}
                        disabled={isSavingJudgePermissions || selectedContestIdForPermissions === null}
                        className="mt-3 inline-flex items-center rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#163528] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingJudgePermissions ? "Saving..." : "Save access"}
                      </button>
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
                    Add team
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Create a team for an event.
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
                    Team name
                  </div>
                  <input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Team name"
                  />
                </div>
                {(categoryError || categorySuccess) && (
                  <div
                    className={`text-[10px] ${
                      categoryError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {categoryError ?? categorySuccess}
                  </div>
                )}
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
                  onClick={handleSaveCategory}
                  disabled={isSavingCategory || activeEventId === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingCategory ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isSavingCategory ? "Saving..." : "Save team"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isParticipantModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-3xl rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
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
              <div className="px-6 py-4 text-[11px]">
                <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Select contest
                      </div>
                      <select
                        value={selectedContestIdForParticipant ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedContestIdForParticipant(
                            value ? Number(value) : null,
                          );
                        }}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      >
                        <option value="">Select contest</option>
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
                        Select division
                      </div>
                      <select
                        value={selectedCategoryIdForParticipant ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          const parsed = value ? Number(value) : null;
                          setSelectedCategoryIdForParticipant(parsed);
                          setSelectedTeamIdForParticipant(null);
                        }}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      >
                        <option value="">Select division</option>
                        {categoriesForActiveEvent.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Select team
                      </div>
                      <select
                        value={selectedTeamIdForParticipant ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedTeamIdForParticipant(
                            value ? Number(value) : null,
                          );
                        }}
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      >
                        <option value="">Select team</option>
                        {teamsForActiveEvent.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Full name
                      </div>
                      <input
                        value={participantFullName}
                        onChange={(event) =>
                          setParticipantFullName(event.target.value)
                        }
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500">
                        Contestant number
                      </div>
                      <input
                        value={participantNumber}
                        onChange={(event) =>
                          setParticipantNumber(event.target.value)
                        }
                        className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        placeholder="Contestant number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-500">Avatar</div>
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#E3F2EA] text-[11px] font-semibold text-[#1F4D3A] shadow-sm">
                        {participantAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={participantAvatarUrl}
                            alt={
                              participantFullName ||
                              "Participant avatar preview"
                            }
                            className="h-full w-full object-cover"
                            style={{
                              transform: `scale(${participantAvatarZoom})`,
                            }}
                          />
                        ) : (
                          "Preview"
                        )}
                      </div>
                      <div className="flex w-full flex-col gap-1 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setParticipantAvatarZoom((previous) =>
                                Math.max(
                                  1,
                                  Number((previous - 0.1).toFixed(2)),
                                ),
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={1}
                            max={2.5}
                            step={0.05}
                            value={participantAvatarZoom}
                            onChange={(event) =>
                              setParticipantAvatarZoom(
                                Number(event.target.value),
                              )
                            }
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setParticipantAvatarZoom((previous) =>
                                Math.min(
                                  2.5,
                                  Number((previous + 0.1).toFixed(2)),
                                ),
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingParticipantAvatar}
                          onChange={async (event) => {
                            const file = event.target.files?.[0];

                            if (!file) {
                              return;
                            }

                            const cloudName =
                              process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                            const uploadPreset =
                              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                            if (!cloudName || !uploadPreset) {
                              setParticipantError(
                                "Cloudinary is not configured for uploads.",
                              );
                              return;
                            }

                            setParticipantError(null);
                            setIsUploadingParticipantAvatar(true);

                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("upload_preset", uploadPreset);

                              const response = await fetch(
                                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                                {
                                  method: "POST",
                                  body: formData,
                                },
                              );

                              if (!response.ok) {
                                setParticipantError(
                                  "Unable to upload avatar. Please try again.",
                                );
                                setIsUploadingParticipantAvatar(false);
                                return;
                              }

                              const json = (await response.json()) as {
                                secure_url?: string;
                              };

                              if (!json.secure_url) {
                                setParticipantError(
                                  "Upload did not return an image URL.",
                                );
                                setIsUploadingParticipantAvatar(false);
                                return;
                              }

                              setParticipantAvatarUrl(json.secure_url);
                            } catch {
                              setParticipantError(
                                "Unexpected error while uploading avatar.",
                              );
                            } finally {
                              setIsUploadingParticipantAvatar(false);
                            }
                          }}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[#1F4D3A] file:px-3 file:py-1 file:text-[10px] file:font-medium file:text-white hover:file:bg-[#163528] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        />
                        {participantAvatarUrl && (
                          <div className="text-[10px] text-slate-500">
                            Avatar uploaded. This picture will be visible to
                            judges.
                          </div>
                        )}
                        {isUploadingParticipantAvatar && (
                          <div className="text-[10px] text-slate-500">
                            Uploading avatar…
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {(participantError || participantSuccess) && (
                  <div
                    className={`mt-3 text-[10px] ${
                      participantError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {participantError ?? participantSuccess}
                  </div>
                )}
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
                  onClick={handleSaveParticipant}
                  disabled={isSavingParticipant || activeEventId === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingParticipant ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isSavingParticipant
                    ? "Saving..."
                    : editingParticipantId === null
                    ? "Save participant"
                    : "Update participant"}
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
                    {editingAdminId === null ? "Add admin" : "Edit admin"}
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
                  <div className="text-[10px] text-slate-500">
                    New admin username
                  </div>
                  <input
                    value={adminUsername}
                    onChange={(event) => setAdminUsername(event.target.value)}
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="New admin username"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    New admin password
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="New admin password"
                  />
                </div>
                {(adminError || adminSuccess) && (
                  <div
                    className={`text-[10px] ${
                      adminError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {adminError ?? adminSuccess}
                  </div>
                )}
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
                  onClick={handleSaveAdmin}
                  disabled={isSavingAdmin}
                  className="rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528]"
                >
                  {isSavingAdmin
                    ? "Saving..."
                    : editingAdminId === null
                    ? "Save admin"
                    : "Update admin"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdminGuardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xs rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="border-b border-[#E2E8F0] px-5 py-3">
                <div className="text-sm font-semibold text-[#1F4D3A]">
                  Admin password required
                </div>
                <div className="text-[11px] text-slate-500">
                  Enter your admin password to manage admin accounts.
                </div>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Admin password</div>
                  <input
                    type="password"
                    value={adminGuardPassword}
                    onChange={(event) =>
                      setAdminGuardPassword(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Enter admin password"
                  />
                </div>
                {adminGuardError && (
                  <div className="text-[10px] text-red-500">
                    {adminGuardError}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminGuardModalOpen(false);
                    setAdminGuardPassword("");
                    setAdminGuardError(null);
                    setPendingAdminAction(null);
                  }}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAdminGuard}
                  disabled={isVerifyingAdminGuard}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isVerifyingAdminGuard ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {isVerifyingAdminGuard ? "Verifying..." : "Continue"}
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
                    {editingJudgeId === null ? "Add judge" : "Edit judge"}
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
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Role</div>
                  <select
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    value={judgeRole}
                    onChange={(event) =>
                      setJudgeRole(event.target.value as "chairman" | "judge")
                    }
                  >
                    <option value="judge">Judge</option>
                    <option value="chairman">Chairman</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Assigned contests</span>
                    <button
                      type="button"
                      onClick={() => setIsJudgeContestModalOpen(true)}
                      className="rounded-full border border-[#D0D7E2] px-2 py-0.5 text-[10px] text-[#1F4D3A] hover:bg-[#F1F5F9]"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs text-slate-600">
                    {contests
                      .filter((contest) =>
                        selectedContestIdsForJudge.includes(contest.id),
                      )
                      .map((contest) => contest.name).length === 0
                      ? "No contests selected"
                      : contests
                          .filter((contest) =>
                            selectedContestIdsForJudge.includes(contest.id),
                          )
                          .map((contest) => contest.name)
                          .join(", ")}
                  </div>
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
                  onClick={() => {
                    setIsJudgeModalOpen(false);
                    setEditingJudgeId(null);
                  }}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveJudge}
                  disabled={isSavingJudge || activeEventId === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingJudge || activeEventId === null
                      ? "cursor-not-allowed opacity-70"
                      : ""
                  }`}
                >
                  {isSavingJudge
                    ? "Saving..."
                    : editingJudgeId === null
                    ? "Save judge"
                    : "Update judge"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isJudgeContestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#1F4D3A]">
                    Assign contests
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Select one or more contests for this judge.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJudgeContestModalOpen(false)}
                  className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] text-slate-500 hover:bg-[#E2E8F0]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-5 py-4 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">
                    Search contests
                  </div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Search by contest name"
                    value={judgeContestSearch}
                    onChange={(event) => setJudgeContestSearch(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs">
                    {contests
                      .filter(
                        (contest) => contest.event_id === activeEventId,
                      )
                      .filter((contest) =>
                        contest.name
                          .toLowerCase()
                          .includes(judgeContestSearch.toLowerCase()),
                      ).length === 0 ? (
                      <div className="text-[10px] text-slate-400">
                        No contests found.
                      </div>
                    ) : (
                      contests
                        .filter(
                          (contest) => contest.event_id === activeEventId,
                        )
                        .filter((contest) =>
                          contest.name
                            .toLowerCase()
                            .includes(judgeContestSearch.toLowerCase()),
                        )
                        .map((contest) => (
                          <label
                            key={contest.id}
                            className="flex items-center justify-between gap-2 py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-[#D0D7E2] text-[#1F4D3A] focus:ring-[#1F4D3A]"
                                checked={selectedContestIdsForJudge.includes(
                                  contest.id,
                                )}
                                onChange={(event) => {
                                  setSelectedContestIdsForJudge((previous) => {
                                    if (event.target.checked) {
                                      if (previous.includes(contest.id)) {
                                        return previous;
                                      }
                                      return [...previous, contest.id];
                                    }
                                    return previous.filter(
                                      (id) => id !== contest.id,
                                    );
                                  });
                                }}
                              />
                              <span className="text-[11px] text-slate-700">
                                {contest.name}
                              </span>
                            </div>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => setIsJudgeContestModalOpen(false)}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Done
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
                    {editingTabulatorId === null ? "Add tabulator" : "Edit tabulator"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Assign a tabulator to an event.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsTabulatorModalOpen(false);
                    setEditingTabulatorId(null);
                  }}
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
                    value={tabulatorFullName}
                    onChange={(event) =>
                      setTabulatorFullName(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Username</div>
                  <input
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Username"
                    value={tabulatorUsername}
                    onChange={(event) =>
                      setTabulatorUsername(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500">Password</div>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    placeholder="Password"
                    value={tabulatorPassword}
                    onChange={(event) =>
                      setTabulatorPassword(event.target.value)
                    }
                  />
                </div>
                {(tabulatorError || tabulatorSuccess) && (
                  <div
                    className={`text-[10px] ${
                      tabulatorError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {tabulatorError ?? tabulatorSuccess}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-[#E2E8F0] px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTabulatorModalOpen(false);
                    setEditingTabulatorId(null);
                  }}
                  className="rounded-full border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-slate-600 hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTabulator}
                  disabled={isSavingTabulator || activeEventId === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingTabulator || activeEventId === null
                      ? "cursor-not-allowed opacity-70"
                      : ""
                  }`}
                >
                  {isSavingTabulator
                    ? "Saving..."
                    : editingTabulatorId === null
                    ? "Save tabulator"
                    : "Update tabulator"}
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
                      onClick={() => requireAdminGuard({ type: "create" })}
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
                        {admins.length === 0
                          ? "No admins yet"
                          : `${admins.length} admin${
                              admins.length > 1 ? "s" : ""
                            }`}
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
                          {admins.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={3}
                              >
                                Once you add admins, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            admins.map((admin) => (
                              <tr
                                key={admin.id}
                                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {admin.username}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  Admin
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 text-[10px] text-slate-500">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        requireAdminGuard({
                                          type: "edit",
                                          adminId: admin.id,
                                        })
                                      }
                                      className="rounded-full border border-[#E2E8F0] px-2 py-0.5 hover:bg-[#F8FAFC]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        requireAdminGuard({
                                          type: "delete",
                                          adminId: admin.id,
                                        })
                                      }
                                      disabled={isDeletingAdminId === admin.id}
                                      className="rounded-full border border-[#FEE2E2] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] disabled:opacity-60"
                                    >
                                      {isDeletingAdminId === admin.id
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

              {userTab === "judge" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-600">
                      Judges
                    </div>
                    <button
                      type="button"
                      onClick={openCreateJudgeModal}
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
                        {judgesForActiveEvent.length === 0
                          ? "No judges yet"
                          : `${judgesForActiveEvent.length} judge${
                              judgesForActiveEvent.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] bg-[#F5F7FF] text-[10px] uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-2 font-medium">Full name</th>
                            <th className="px-3 py-2 font-medium">Username</th>
                            <th className="px-3 py-2 font-medium">Contests</th>
                            <th className="px-3 py-2 font-medium">Event</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {judgesForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={4}
                              >
                                Once you add judges, you can edit or delete them
                                here.
                              </td>
                            </tr>
                          ) : (
                            judgesForActiveEvent.map((judge) => {
                              const event = events.find(
                                (e) => e.id === judge.event_id,
                              );
                              const assignedContestNames = judgeAssignments
                                .filter(
                                  (assignment) =>
                                    assignment.judge_id === judge.id,
                                )
                                .map((assignment) => {
                                  const contest = contests.find(
                                    (contest) =>
                                      contest.id === assignment.contest_id,
                                  );
                                  return contest ? contest.name : null;
                                })
                                .filter(
                                  (name): name is string => name !== null,
                                );

                              return (
                                <tr
                                  key={judge.id}
                                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                                >
                                  <td className="px-3 py-2 font-medium text-slate-700">
                                    {judge.full_name}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {judge.username}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {assignedContestNames.length === 0
                                      ? "No contests"
                                      : assignedContestNames.join(", ")}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {event ? event.name : "Unknown event"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1.5 text-[10px] text-slate-500">
                                      <button
                                        type="button"
                                        onClick={() => openEditJudgeModal(judge)}
                                        className="rounded-full border border-[#E2E8F0] px-2 py-0.5 hover:bg-[#F8FAFC]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteJudge(judge.id)}
                                        disabled={isDeletingJudgeId === judge.id}
                                        className="rounded-full border border-[#FEE2E2] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] disabled:opacity-60"
                                      >
                                        {isDeletingJudgeId === judge.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
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
                      onClick={openCreateTabulatorModal}
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
                        {tabulatorsForActiveEvent.length === 0
                          ? "No tabulators yet"
                          : `${tabulatorsForActiveEvent.length} tabulator${
                              tabulatorsForActiveEvent.length > 1 ? "s" : ""
                            }`}
                      </span>
                    </div>
                    {(tabulatorError || tabulatorSuccess) && (
                      <div
                        className={`mb-2 text-[10px] ${
                          tabulatorError ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {tabulatorError ?? tabulatorSuccess}
                      </div>
                    )}
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
                          {tabulatorsForActiveEvent.length === 0 ? (
                            <tr className="border-b border-[#F1F5F9]">
                              <td
                                className="px-3 py-2 text-slate-400"
                                colSpan={4}
                              >
                                Once you add tabulators, they will appear here.
                              </td>
                            </tr>
                          ) : (
                            tabulatorsForActiveEvent.map((tabulator) => {
                              const event = events.find(
                                (e) => e.id === tabulator.event_id,
                              );

                              return (
                                <tr
                                  key={tabulator.id}
                                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]"
                                >
                                  <td className="px-3 py-2 font-medium text-slate-700">
                                    {tabulator.full_name}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {tabulator.username}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {event ? event.name : "Unknown event"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1.5 text-[10px] text-slate-500">
                                      <button
                                        type="button"
                                        onClick={() => openEditTabulatorModal(tabulator)}
                                        className="rounded-full border border-[#E2E8F0] px-2 py-0.5 hover:bg-[#F8FAFC]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTabulator(tabulator.id)}
                                        disabled={isDeletingTabulatorId === tabulator.id}
                                        className="rounded-full border border-[#FEE2E2] px-2 py-0.5 text-red-500 hover:bg-[#FEF2F2] disabled:opacity-60"
                                      >
                                        {isDeletingTabulatorId === tabulator.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
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
