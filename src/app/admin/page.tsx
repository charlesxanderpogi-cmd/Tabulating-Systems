"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LottieIcon from "@/components/LottieIcon";
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
  { key: "monitor", label: "Monitor" },
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

type AdminTab = "home" | "tabulation" | "event" | "participants" | "monitor" | "users";
type EventSubTab =
  | "addEvent"
  | "addContest"
  | "addCriteria"
  | "awards"
  | "template";
type ParticipantSubTab = "category" | "participant";
type MonitorSubTab = "permissions" | "monitoring" | "message";
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
    <div className={"overflow-hidden rounded-2xl border transition-all duration-300 " + (isOpen ? "border-emerald-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/50")}>
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-emerald-600"
      >
        <span>{title}</span>
        <div className={"flex h-5 w-5 items-center justify-center rounded-lg transition-all duration-300 " + (isOpen ? "bg-emerald-100 text-emerald-600 rotate-180" : "bg-white text-slate-400 shadow-sm")}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-emerald-50 bg-white p-4 animate-in slide-in-from-top-2 duration-300">{children}</div>
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
  card_url: string | null;
  gallery_photos: string | null;
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
  avatar_url: string | null;
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [eventTab, setEventTab] = useState<EventSubTab>("addEvent");
  const [participantTab, setParticipantTab] =
    useState<ParticipantSubTab>("category");
  const [monitorTab, setMonitorTab] = useState<MonitorSubTab>("permissions");
  const [monitorMessageRecipientJudgeId, setMonitorMessageRecipientJudgeId] =
    useState<number | null>(null);
  const [monitorMessageTitle, setMonitorMessageTitle] = useState("");
  const [monitorMessageBody, setMonitorMessageBody] = useState("");
  const [monitorMessageError, setMonitorMessageError] = useState<string | null>(
    null,
  );
  const [monitorMessageSuccess, setMonitorMessageSuccess] = useState<
    string | null
  >(null);
  const [isSendingMonitorMessage, setIsSendingMonitorMessage] = useState(false);
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    const username = window.localStorage.getItem("admin_username");
    if (!username) {
      router.push("/");
    }
  }, [router]);
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
  const [isDeactivatingEventId, setIsDeactivatingEventId] = useState<
    number | null
  >(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);
  const [selectedEventIdForContest, setSelectedEventIdForContest] = useState<
    number | null
  >(null);
  const [selectedEventIdForTeam, setSelectedEventIdForTeam] = useState<
    number | null
  >(null);
  const [selectedEventIdForJudge, setSelectedEventIdForJudge] = useState<
    number | null
  >(null);
  const [selectedEventIdForTabulator, setSelectedEventIdForTabulator] =
    useState<number | null>(null);
  const [judgeFullName, setJudgeFullName] = useState("");
  const [judgeUsername, setJudgeUsername] = useState("");
  const [judgePassword, setJudgePassword] = useState("");
  const [judgeRole, setJudgeRole] = useState<"chairman" | "judge">("judge");
  const [judgeAvatarUrl, setJudgeAvatarUrl] = useState<string>("");
  const [judgeAvatarZoom, setJudgeAvatarZoom] = useState(1);
  const [judgeAvatarOffset, setJudgeAvatarOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [judgeAvatarImageDims, setJudgeAvatarImageDims] = useState<{ w: number; h: number } | null>(null);
  const [isUploadingJudgeAvatar, setIsUploadingJudgeAvatar] = useState(false);
  const [isDraggingJudgeAvatar, setIsDraggingJudgeAvatar] = useState(false);
  const [lastJudgeAvatarPointer, setLastJudgeAvatarPointer] = useState<{ x: number; y: number } | null>(null);
  const judgeAvatarFrameRef = useRef<HTMLDivElement | null>(null);
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
  const tabulationContestAutoSelectedRef = useRef(false);
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
  const [editingDivisionIdForEvent, setEditingDivisionIdForEvent] = useState<number | null>(null);
  const [editingDivisionNameForEvent, setEditingDivisionNameForEvent] = useState("");
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
  const [participantAvatarZoom, setParticipantAvatarZoom] = useState(1);
  const [participantAvatarImageDims, setParticipantAvatarImageDims] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [participantAvatarOffset, setParticipantAvatarOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [lastAvatarPointer, setLastAvatarPointer] = useState<{ x: number; y: number } | null>(null);
  const [isUploadingParticipantAvatar, setIsUploadingParticipantAvatar] =
    useState(false);
  const [participantCardUrl, setParticipantCardUrl] = useState("");
  const [participantCardZoom, setParticipantCardZoom] = useState(1);
  const [participantCardImageDims, setParticipantCardImageDims] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const avatarFrameRef = useRef<HTMLDivElement | null>(null);
  const [participantCardOffset, setParticipantCardOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [lastCardPointer, setLastCardPointer] = useState<{ x: number; y: number } | null>(null);
  const [isUploadingParticipantCard, setIsUploadingParticipantCard] =
    useState(false);
  const cardFrameRef = useRef<HTMLDivElement | null>(null);
  const [participantGalleryPhotos, setParticipantGalleryPhotos] = useState<string[]>([]);
  const [isUploadingParticipantGallery, setIsUploadingParticipantGallery] =
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

  const parseTransform = (url: string) => {
    try {
      const u = new URL(url);
      const tz = u.searchParams.get("tz");
      const tx = u.searchParams.get("tx");
      const ty = u.searchParams.get("ty");
      const txp = u.searchParams.get("txp");
      const typ = u.searchParams.get("typ");
      return {
        tz: tz ? Number(tz) : null,
        tx: tx ? Number(tx) : null,
        ty: ty ? Number(ty) : null,
        txp: txp ? Number(txp) : null,
        typ: typ ? Number(typ) : null,
      };
    } catch {
      return { tz: null, tx: null, ty: null, txp: null, typ: null };
    }
  };
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
    "awards" | "sub-criteria"
  >("awards");
  const [tabulationAwardFilterId, setTabulationAwardFilterId] = useState<
    number | "all"
  >("all");
  const [eventTabEventFilterId, setEventTabEventFilterId] = useState<number | null>(null);
  const [participantsTabEventFilterId, setParticipantsTabEventFilterId] = useState<number | null>(null);
  // filter used specifically in the "Add user" section when viewing judges/tabulators
  const [userTabEventFilterId, setUserTabEventFilterId] = useState<number | null>(null);
  const [selectedEventIdForParticipant, setSelectedEventIdForParticipant] = useState<number | null>(null);
  const [selectedEventIdForAward, setSelectedEventIdForAward] = useState<number | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [judgeSearch, setJudgeSearch] = useState("");
  const [tabulatorSearch, setTabulatorSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [awardSearch, setAwardSearch] = useState("");
  const [judgeTotals, setJudgeTotals] = useState<JudgeParticipantTotalRow[]>([]);

  const [scores, setScores] = useState<ScoreRow[]>([]);

  const cleanText = (value: string) =>
    value.replace(/[\u0000-\u001F<>]/g, "").trim();

  const parseAwardCriteriaIds = (award: AwardRow): number[] => {
    const raw = award.criteria_ids as unknown;
    let criteriaIds: number[] = [];

    if (Array.isArray(raw)) {
      criteriaIds = raw.map((id) => Number(id));
    } else if (typeof raw === "string") {
      const s = raw;
      criteriaIds = s.startsWith("{") && s.endsWith("}")
        ? s
            .slice(1, -1)
            .split(",")
            .map((n) => Number(n.trim()))
        : s.split(",").map((n) => Number(n.trim()));
    } else if (award.criteria_id) {
      criteriaIds = [Number(award.criteria_id)];
    }

    return criteriaIds.filter((n) => Number.isFinite(n));
  };

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
        "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url, card_url, gallery_photos",
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
      .select("id, event_id, full_name, username, role, avatar_url, created_at")
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
    setSelectedEventIdForContest(
      activeEventId || (events.length > 0 ? events[0].id : null),
    );
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
    setSelectedEventIdForTeam(
      activeEventId || (events.length > 0 ? events[0].id : null),
    );
    setCategoryName("");
    setCategoryError(null);
    setCategorySuccess(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (team: TeamRow) => {
    setEditingCategoryId(team.id);
    setSelectedEventIdForTeam(team.event_id);
    setCategoryName(team.name);
    setCategoryError(null);
    setCategorySuccess(null);
    setIsCategoryModalOpen(true);
  };

  const openCreateParticipantModal = () => {
    setEditingParticipantId(null);
    setSelectedEventIdForParticipant(activeEventId || (events.length > 0 ? events[0].id : null));
    setSelectedContestIdForParticipant(null);
    setSelectedCategoryIdForParticipant(null);
    setSelectedTeamIdForParticipant(null);
    setParticipantFullName("");
    setParticipantNumber("");
    setParticipantAvatarUrl("");
    setParticipantAvatarZoom(1);
    setParticipantAvatarImageDims(null);
    setParticipantCardUrl("");
    setParticipantCardZoom(1);
    setParticipantCardImageDims(null);
    setParticipantGalleryPhotos([]);
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsParticipantModalOpen(true);
  };

  const openEditParticipantModal = (participant: ParticipantRow) => {
    setEditingParticipantId(participant.id);
    setSelectedEventIdForParticipant(
      participant.contest_id
        ? (contests.find((c) => c.id === participant.contest_id)?.event_id ?? activeEventId)
        : activeEventId,
    );
    setSelectedContestIdForParticipant(participant.contest_id);
    setSelectedCategoryIdForParticipant(participant.division_id);
    setSelectedTeamIdForParticipant(participant.team_id);
    setParticipantFullName(participant.full_name);
    setParticipantNumber(participant.contestant_number);
    setParticipantAvatarUrl(participant.avatar_url ?? "");
    setParticipantAvatarZoom(1);
    setParticipantAvatarImageDims(null);
    setParticipantCardUrl(participant.card_url ?? "");
    setParticipantCardZoom(1);
    setParticipantCardImageDims(null);
    try {
      setParticipantGalleryPhotos(participant.gallery_photos ? JSON.parse(participant.gallery_photos) : []);
    } catch {
      setParticipantGalleryPhotos([]);
    }
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
    setSelectedEventIdForJudge(
      userTabEventFilterId ?? (activeEventId || (events.length > 0 ? events[0].id : null)),
    );
    setJudgeFullName("");
    setJudgeUsername("");
    setJudgePassword("");
    setJudgeRole("judge");
    setJudgeAvatarUrl("");
    setJudgeAvatarZoom(1);
    setJudgeAvatarOffset({ x: 0, y: 0 });
    setJudgeAvatarImageDims(null);
    setJudgeError(null);
    setJudgeSuccess(null);
    setSelectedContestIdsForJudge([]);
    setIsJudgeModalOpen(true);
  };

  const openEditJudgeModal = (judge: JudgeRow) => {
    setEditingJudgeId(judge.id);
    setSelectedEventIdForJudge(judge.event_id);
    setJudgeFullName(judge.full_name);
    setJudgeUsername(judge.username);
    setJudgePassword("");
    setJudgeRole(judge.role || "judge");
    setJudgeAvatarUrl(judge.avatar_url ?? "");
    setJudgeAvatarZoom(1);
    setJudgeAvatarOffset({ x: 0, y: 0 });
    setJudgeAvatarImageDims(null);
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
    setSelectedEventIdForTabulator(
      userTabEventFilterId ?? (activeEventId || (events.length > 0 ? events[0].id : null)),
    );
    setTabulatorFullName("");
    setTabulatorUsername("");
    setTabulatorPassword("");
    setTabulatorError(null);
    setTabulatorSuccess(null);
    setIsTabulatorModalOpen(true);
  };

  const openEditTabulatorModal = (tabulator: TabulatorRow) => {
    setEditingTabulatorId(tabulator.id);
    setSelectedEventIdForTabulator(tabulator.event_id);
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

    // remove dependent rows in tables that reference event_id
    // this mirrors an ON DELETE CASCADE that isn't configured for team
    {
      let result;

      // remove any user accounts tied to this event (judges, tabulators)
      // note: the table names are user_judge and user_tabulator; there is no
      // table called "judge". the superscript error about a missing table
      // comes from running incorrect SQL in the editor. we delete here to
      // keep the database tidy when an event is purged.
      result = await supabase.from("user_judge").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related judge accounts.",
        );
        return;
      }

      result = await supabase.from("user_tabulator").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related tabulator accounts.",
        );
        return;
      }

      // now delete the other dependent rows as before
      result = await supabase.from("team").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }

      result = await supabase.from("division").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }

      result = await supabase.from("contest").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }

      result = await supabase.from("award").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }

      // remove judge user accounts; table is user_judge not judge
      result = await supabase.from("user_judge").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related judge accounts before removing event.",
        );
        return;
      }

      result = await supabase.from("user_tabulator").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }

      result = await supabase.from("user_judge").delete().eq("event_id", id);
      if (result.error) {
        setIsDeletingEventId(null);
        setEventError(
          result.error.message || "Unable to delete related records before removing event.",
        );
        return;
      }
    }

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

    const { error } = await supabase
      .from("event")
      .update({ is_active: true })
      .eq("id", id);

    setIsSettingActiveEventId(null);

    if (error) {
      setEventError(error.message || "Unable to activate event.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, is_active: true } : event,
      ),
    );
    setEventSuccess("Event activated successfully.");
  };

  const handleDeactivateEvent = async (id: number) => {
    setEventError(null);
    setEventSuccess(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setEventError("Supabase is not configured.");
      return;
    }

    setIsDeactivatingEventId(id);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from("event")
      .update({ is_active: false })
      .eq("id", id);

    setIsDeactivatingEventId(null);

    if (error) {
      setEventError(error.message || "Unable to deactivate event.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, is_active: false } : event,
      ),
    );
    setActiveEventId((current) => (current === id ? null : current));
    setEventSuccess("Event deactivated successfully.");
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
        setEventTabEventFilterId(activeEventId);
        setParticipantsTabEventFilterId(activeEventId);
        setSelectedEventIdForParticipant(activeEventId);
        setSelectedEventIdForAward(activeEventId);
    } else {
        setTabulationEventFilterId("all");
        setEventTabEventFilterId(null);
        setParticipantsTabEventFilterId(null);
        setSelectedEventIdForParticipant(null);
        setSelectedEventIdForAward(null);
        setUserTabEventFilterId(null);
    }
  }, [activeEventId]);

  useEffect(() => {
    if (activeEventId === null && eventTabEventFilterId === null && events.length > 0) {
      setEventTabEventFilterId(events[0].id);
    }
  }, [activeEventId, eventTabEventFilterId, events]);

  const contestsForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? []
        : contests.filter((contest) => contest.event_id === activeEventId),
    [contests, activeEventId],
  );

  const criteriaForActiveEvent = useMemo(() => {
    if (activeEventId === null) {
      return [];
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
        ? []
        : teams.filter((team) => team.event_id === activeEventId),
    [teams, activeEventId],
  );

  const categoriesForActiveEvent = useMemo(
    () =>
      activeEventId === null
        ? []
        : categories.filter((category) => category.event_id === activeEventId),
    [categories, activeEventId],
  );

  // For Event Tab - show contests for selected event (not just active)
  const contestsForEventTab = useMemo(
    () =>
      eventTabEventFilterId === null
        ? []
        : contests.filter((contest) => contest.event_id === eventTabEventFilterId),
    [contests, eventTabEventFilterId],
  );

  // For Event Tab - show criteria for selected event (not just active)
  const criteriaForEventTab = useMemo(() => {
    if (eventTabEventFilterId === null) {
      return [];
    }

    const contestIdsForEvent = new Set(
      contests
        .filter((contest) => contest.event_id === eventTabEventFilterId)
        .map((contest) => contest.id),
    );

    return criteriaList.filter((criteria) =>
      contestIdsForEvent.has(criteria.contest_id),
    );
  }, [criteriaList, contests, eventTabEventFilterId]);

  // For Event Tab - show awards for selected event (not just active)
  const awardsForEventTab = useMemo(
    () =>
      eventTabEventFilterId === null
        ? []
        : awards.filter((award) => award.event_id === eventTabEventFilterId),
    [awards, eventTabEventFilterId],
  );

  // For Participants Tab - show teams for selected event (not just active)
  const teamsForParticipantsTab = useMemo(
    () =>
      participantsTabEventFilterId === null
        ? []
        : teams.filter((team) => team.event_id === participantsTabEventFilterId),
    [teams, participantsTabEventFilterId],
  );

  // For Participants Tab - show contests for selected event (not just active)
  const contestsForParticipantsTab = useMemo(
    () =>
      participantsTabEventFilterId === null
        ? []
        : contests.filter((contest) => contest.event_id === participantsTabEventFilterId),
    [contests, participantsTabEventFilterId],
  );

  const participantsForActiveEvent = useMemo(() => {
    const effectiveEventId = participantsTabEventFilterId ?? activeEventId;
    if (effectiveEventId === null) {
      const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
      const activeContestIds = new Set(contests.filter(c => activeEventIds.has(c.event_id)).map(c => c.id));
      return participants.filter((participant) => activeContestIds.has(participant.contest_id));
    }

    const contestIdsForEvent = new Set(
      contests
        .filter((contest) => contest.event_id === effectiveEventId)
        .map((contest) => contest.id),
    );

    return participants.filter((participant) =>
      contestIdsForEvent.has(participant.contest_id),
    );
  }, [participants, contests, activeEventId, participantsTabEventFilterId, events]);

  const effectiveTabulationEventId =
    tabulationEventFilterId === "all"
      ? activeEventId === null
        ? null
        : activeEventId
      : tabulationEventFilterId;

  const effectiveTabulationContestId =
    tabulationContestFilterId === "all" ? null : tabulationContestFilterId;

  useEffect(() => {
    tabulationContestAutoSelectedRef.current = false;
  }, [effectiveTabulationEventId]);

  useEffect(() => {
    if (effectiveTabulationEventId === null) {
      return;
    }

    if (tabulationContestAutoSelectedRef.current) {
      return;
    }

    if (tabulationContestFilterId !== "all") {
      tabulationContestAutoSelectedRef.current = true;
      return;
    }

    const contestsForEvent = contests
      .filter((c) => c.event_id === effectiveTabulationEventId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    if (contestsForEvent.length > 0) {
      tabulationContestAutoSelectedRef.current = true;
      setTabulationContestFilterId(contestsForEvent[0].id);
    }
  }, [contests, effectiveTabulationEventId, tabulationContestFilterId]);

  useEffect(() => {
    setTabulationAwardFilterId("all");
  }, [tabulationContestFilterId]);

  const debugTabulationInfo = useMemo(() => {
    const eventId = effectiveTabulationEventId;
    const contestIds = eventId === null
      ? []
      : contests.filter((c) => c.event_id === eventId).map((c) => c.id);

    const participantCount = participants.filter((p) => contestIds.includes(p.contest_id)).length;
    const judgeTotalsCount = judgeTotals.filter((t) => contestIds.includes(t.contest_id)).length;

    return {
      eventId,
      contestCount: contestIds.length,
      participantCount,
      judgeTotalsCount,
    };
  }, [effectiveTabulationEventId, contests, participants, judgeTotals]);

  const awardsForTabulationEvent = useMemo(() => {
    const eventId = effectiveTabulationEventId;
    if (eventId === null) return awards;
    return awards.filter((a) => a.event_id === eventId);
  }, [awards, effectiveTabulationEventId]);

  const awardsForTabulationContest = useMemo(() => {
    if (effectiveTabulationEventId === null || effectiveTabulationContestId === null) {
      return [];
    }

    const filtered: AwardRow[] = [];
    const awardsForEvent = awardsForTabulationEvent.filter((award) => award.is_active);

    for (const award of awardsForEvent) {
      const criteriaIds = parseAwardCriteriaIds(award);
      const criteria = criteriaIds.length > 0
        ? criteriaList.find((c) => c.id === criteriaIds[0]) ?? null
        : null;
      const contestId = award.contest_id ?? criteria?.contest_id ?? null;

      if (contestId === effectiveTabulationContestId) {
        filtered.push(award);
      }
    }

    return filtered;
  }, [
    awardsForTabulationEvent,
    criteriaList,
    effectiveTabulationContestId,
    effectiveTabulationEventId,
  ]);

  // derive judges/tabulators using the add‑user-specific event filter, falling back to the global active event
  const judgesForUserEvent = useMemo(
    () => {
      const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
      // when filter is null, show judges from active events only
      if (userTabEventFilterId === null) return judges.filter(j => activeEventIds.has(j.event_id));
      return judges.filter((judge) => judge.event_id === userTabEventFilterId);
    },
    [judges, userTabEventFilterId, events],
  );

  const tabulatorsForUserEvent = useMemo(
    () => {
      const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
      if (userTabEventFilterId === null) return tabulators.filter(t => activeEventIds.has(t.event_id));
      return tabulators.filter((tabulator) => tabulator.event_id === userTabEventFilterId);
    },
    [tabulators, userTabEventFilterId, events],
  );

  const judgesForActiveEvent = useMemo(
    () => {
      const effectiveEventId = participantsTabEventFilterId ?? activeEventId;
      if (effectiveEventId === null) {
        const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
        return judges.filter(j => activeEventIds.has(j.event_id));
      }
      return judges.filter((judge) => judge.event_id === effectiveEventId);
    },
    [judges, activeEventId, participantsTabEventFilterId, events],
  );



  const tabulatorsForActiveEvent = useMemo(
    () => {
      if (activeEventId === null) {
        const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
        return tabulators.filter(t => activeEventIds.has(t.event_id));
      }
      return tabulators.filter((tabulator) => tabulator.event_id === activeEventId);
    },
    [tabulators, activeEventId, events],
  );

  const awardsForActiveEvent = useMemo(
    () => {
      if (activeEventId === null) {
        const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));
        return awards.filter(a => activeEventIds.has(a.event_id));
      }
      return awards.filter((award) => award.event_id === activeEventId);
    },
    [awards, activeEventId, events],
  );

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) => a.username.toLowerCase().includes(q));
  }, [admins, adminSearch]);

  const filteredJudges = useMemo(() => {
    const q = judgeSearch.trim().toLowerCase();
    if (!q) return judgesForUserEvent;
    return judgesForUserEvent.filter(
      (j) => j.full_name.toLowerCase().includes(q) || j.username.toLowerCase().includes(q),
    );
  }, [judgesForUserEvent, judgeSearch]);

  const filteredTabulators = useMemo(() => {
    const q = tabulatorSearch.trim().toLowerCase();
    if (!q) return tabulatorsForUserEvent;
    return tabulatorsForUserEvent.filter(
      (t) => t.full_name.toLowerCase().includes(q) || t.username.toLowerCase().includes(q),
    );
  }, [tabulatorsForUserEvent, tabulatorSearch]);

  const filteredParticipants = useMemo(() => {
    const q = participantSearch.trim().toLowerCase();
    if (!q) return participantsForActiveEvent;
    return participantsForActiveEvent.filter(
      (p) => p.full_name.toLowerCase().includes(q) || p.contestant_number.toLowerCase().includes(q),
    );
  }, [participantsForActiveEvent, participantSearch]);

  const filteredAwards = useMemo(() => {
    const q = awardSearch.trim().toLowerCase();
    if (!q) return awardsForActiveEvent;
    return awardsForActiveEvent.filter(
      (a) => a.name.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q),
    );
  }, [awardsForActiveEvent, awardSearch]);

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
      tabulationEventFilterId === "all"
        ? (activeEventId === null ? null : activeEventId)
        : tabulationEventFilterId;

    const activeEventIds = new Set(events.filter(e => e.is_active).map(e => e.id));

    const contestIds = new Set(
      contests
        .filter((contest) => {
          if (eventFilterId !== null) {
            if (contest.event_id !== eventFilterId) return false;
          } else {
            // No specific event filter, only show active events
            if (!activeEventIds.has(contest.event_id)) return false;
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

      // Match Tabulator logic: use SUM of judge totals per participant (not average)
      const totalSum = totalsForParticipant.sum;

      rows.push({
        contestId: contest.id,
        contestName: contest.name,
        categoryName: category ? category.name : "Uncategorized",
        teamName: team ? team.name : null,
        participantId: participant.id,
        participantName: participant.full_name,
        contestantNumber: participant.contestant_number,
        totalScore: Number(totalSum.toFixed(2)),
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
    events,
  ]);

  const awardsResults = useMemo(() => {
    type AwardWinnerRow = {
      awardId: number;
      awardName: string;
      awardType: AwardType;
      contestId: number | null;
      contestName: string;
      criteriaName: string | null;
      criteriaIds: number[];
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

    const activeAwards = awardsForTabulationEvent.filter(
      (award) => award.is_active,
    );

    for (const award of activeAwards) {
      // Use only the explicitly linked criteria IDs for this award
      const criteriaIds = parseAwardCriteriaIds(award);

      if (award.award_type === "criteria" && criteriaIds.length > 0) {
        const criteriaListForAward = criteriaList.filter(c => criteriaIds.includes(c.id));

        if (criteriaListForAward.length === 0) {
          result.push({
            awardId: award.id,
            awardName: award.name,
            awardType: award.award_type,
            contestId: award.contest_id ?? null,
            contestName: "Unknown contest",
            criteriaName: null,
            criteriaIds,
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
            contestId,
            contestName: "Unknown contest",
            criteriaName: criteriaListForAward.map(c => c.name).join(", "),
            criteriaIds,
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
            contestId: contest.id,
            contestName: contest.name,
            criteriaName: criteriaListForAward.map(c => c.name).join(", "),
            criteriaIds,
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

        type CriteriaScoreRow = (typeof rowsForContest)[number] & {
          criteriaTotalScore: number;
          judgeCriteriaScores: Record<number, number>;
          criteriaRank: number;
        };

        const participantsWithCriteriaScores: CriteriaScoreRow[] = rowsForContest.map((row) => {
          const score = criteriaScoresMap.get(row.participantId) ?? 0;
          const jScores = participantScoresMap.get(row.participantId) ?? {};
          return {
            ...row,
            criteriaTotalScore: score,
            judgeCriteriaScores: jScores,
            criteriaRank: 1,
          };
        });

        // Sort by criteria score descending
        participantsWithCriteriaScores.sort((a, b) => b.criteriaTotalScore - a.criteriaTotalScore);

        // Assign ranks (handling ties properly)
        let currentRank = 1;
        for (let i = 0; i < participantsWithCriteriaScores.length; i++) {
          if (
            i > 0 &&
            participantsWithCriteriaScores[i].criteriaTotalScore <
              participantsWithCriteriaScores[i - 1].criteriaTotalScore
          ) {
            currentRank = i + 1;
          } else if (
            i > 0 &&
            participantsWithCriteriaScores[i].criteriaTotalScore ===
              participantsWithCriteriaScores[i - 1].criteriaTotalScore
          ) {
            currentRank = participantsWithCriteriaScores[i - 1].criteriaRank;
          }
          participantsWithCriteriaScores[i].criteriaRank = currentRank;
        }

        const winners = participantsWithCriteriaScores
          .filter((row) => row.criteriaRank === 1)
          .map((row) => ({
            participantId: row.participantId,
            participantName: row.participantName,
            contestantNumber: row.contestantNumber,
            rank: row.criteriaRank,
            totalScore: row.criteriaTotalScore,
            teamName: row.teamName,
            judgeCriteriaScores: row.judgeCriteriaScores,
          }));

        const allParticipants = participantsWithCriteriaScores.map((row) => ({
          participantId: row.participantId,
          participantName: row.participantName,
          contestantNumber: row.contestantNumber,
          rank: row.criteriaRank,
          totalScore: row.criteriaTotalScore,
          teamName: row.teamName,
          judgeCriteriaScores: row.judgeCriteriaScores,
        }));

        result.push({
          awardId: award.id,
          awardName: award.name,
          awardType: award.award_type,
          contestId: contest.id,
          contestName: contest.name,
          criteriaName: criteriaListForAward.map(c => c.name).join(", "),
          criteriaIds,
          winners,
          allParticipants,
          note: null,
        });
      } else {
        let contestName = "All contests";
        const contestId = award.contest_id ?? null;

        if (contestId !== null) {
          const contest = contests.find(
            (contestRow) => contestRow.id === contestId,
          );
          contestName = contest ? contest.name : "Unknown contest";
        }

        result.push({
          awardId: award.id,
          awardName: award.name,
          awardType: award.award_type,
          contestId,
          contestName,
          criteriaName: null,
          criteriaIds: [],
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

  const tabulationAwardsTable = useMemo(() => {
    if (
      !selectedTabulationAwardResult ||
      selectedTabulationAwardResult.awardType !== "criteria" ||
      selectedTabulationAwardResult.contestId === null
    ) {
      return null;
    }

    const contestId = selectedTabulationAwardResult.contestId;
    const assignedJudgeIds = new Set(
      judgeAssignments
        .filter((ja) => ja.contest_id === contestId)
        .map((ja) => ja.judge_id),
    );

    const visibleJudges =
      assignedJudgeIds.size > 0
        ? judges.filter((j) => assignedJudgeIds.has(j.id))
        : effectiveTabulationEventId === null
          ? judges
          : judges.filter((j) => j.event_id === effectiveTabulationEventId);

    const orderedJudges = [...visibleJudges].sort((a, b) =>
      a.username.localeCompare(b.username),
    );
    const judgeIds = orderedJudges.map((j) => j.id);

    const totalsByJudge = new Map<number, Map<number, number>>();
    for (const p of selectedTabulationAwardResult.allParticipants) {
      for (const jid of judgeIds) {
        const val = p.judgeCriteriaScores[jid];
        if (val !== undefined) {
          const map = totalsByJudge.get(jid) ?? new Map<number, number>();
          map.set(p.participantId, val);
          totalsByJudge.set(jid, map);
        }
      }
    }

    const rankByJudgeAndParticipant = new Map<string, number>();
    for (const [jid, pmap] of totalsByJudge.entries()) {
      const entries = Array.from(pmap.entries()).sort((a, b) => b[1] - a[1]);
      let currentRank = 1;
      for (let i = 0; i < entries.length; i++) {
        if (i > 0 && entries[i][1] < entries[i - 1][1]) {
          currentRank = i + 1;
        }
        rankByJudgeAndParticipant.set(jid + "-" + entries[i][0], currentRank);
      }
    }

    const rows = [...selectedTabulationAwardResult.allParticipants]
      .map((p) => {
        let sum = 0;
        let count = 0;
        for (const jid of judgeIds) {
          const r = rankByJudgeAndParticipant.get(jid + "-" + p.participantId);
          if (r != null) {
            sum += r;
            count += 1;
          }
        }
        const avg = count === judgeIds.length ? sum / count : Number.POSITIVE_INFINITY;
        return { participant: p, avg };
      })
      .sort((a, b) => {
        if (a.avg !== b.avg) return a.avg - b.avg;
        return a.participant.participantName.localeCompare(b.participant.participantName);
      });

    return {
      judges: orderedJudges,
      judgeIds,
      rankByJudgeAndParticipant,
      rows,
    };
  }, [
    effectiveTabulationEventId,
    judgeAssignments,
    judges,
    selectedTabulationAwardResult,
  ]);

  const tabulationSubCriteriaTable = useMemo(() => {
    if (effectiveTabulationContestId === null) {
      return null;
    }

    const contestId = effectiveTabulationContestId;
    const criteriaForContest = criteriaList
      .filter((c) => c.contest_id === contestId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    const participantsForContest = participants
      .filter((p) => p.contest_id === contestId)
      .filter((p) =>
        tabulationDivisionFilterId === "all"
          ? true
          : p.division_id === tabulationDivisionFilterId,
      );

    const assignedJudgeIds = new Set(
      judgeAssignments
        .filter((ja) => ja.contest_id === contestId)
        .map((ja) => ja.judge_id),
    );

    const visibleJudges =
      assignedJudgeIds.size > 0
        ? judges.filter((j) => assignedJudgeIds.has(j.id))
        : effectiveTabulationEventId === null
          ? judges
          : judges.filter((j) => j.event_id === effectiveTabulationEventId);

    const orderedJudges = [...visibleJudges].sort((a, b) =>
      a.username.localeCompare(b.username),
    );
    const judgeIds = orderedJudges.map((j) => j.id);

    const participantIds = new Set(participantsForContest.map((p) => p.id));
    const criteriaIds = new Set(criteriaForContest.map((c) => c.id));

    const scoreSums = new Map<string, number>();
    for (const s of scores) {
      if (!participantIds.has(s.participant_id) || !criteriaIds.has(s.criteria_id)) {
        continue;
      }
      if (judgeIds.length > 0 && !judgeIds.includes(s.judge_id)) {
        continue;
      }
      const key = s.participant_id + "-" + s.criteria_id + "-" + s.judge_id;
      scoreSums.set(key, (scoreSums.get(key) ?? 0) + Number(s.score));
    }

    const parseNumber = (value: string) => {
      const parsed = Number.parseInt(value.trim(), 10);
      return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
    };

    const orderedParticipants = [...participantsForContest].sort((a, b) => {
      const an = parseNumber(a.contestant_number);
      const bn = parseNumber(b.contestant_number);
      if (an !== bn) return an - bn;
      return a.full_name.localeCompare(b.full_name);
    });

    const rows = orderedParticipants.flatMap((participant) =>
      criteriaForContest.map((criteria) => {
        const cells = judgeIds.map((jid) => {
          const key = participant.id + "-" + criteria.id + "-" + jid;
          const value = scoreSums.get(key);
          return { judgeId: jid, value: value === undefined ? null : value };
        });
        return { participant, criteria, cells };
      }),
    );

    return {
      judges: orderedJudges,
      rows,
    };
  }, [
    criteriaList,
    effectiveTabulationContestId,
    effectiveTabulationEventId,
    judgeAssignments,
    judges,
    participants,
    scores,
    tabulationDivisionFilterId,
  ]);

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

    if (selectedEventIdForContest === null) {
      setContestError("Please select an event.");
      return;
    }

    if (!contestName.trim()) {
      setContestError("Contest name is required.");
      return;
    }

    const normalizedName = contestName.trim().toLowerCase();

    const hasDuplicateName = contests.some((contest) => {
      if (contest.event_id !== selectedEventIdForContest) {
        return false;
      }
      if (editingContestId !== null && contest.id === editingContestId) {
        return false;
      }
      return contest.name.trim().toLowerCase() === normalizedName;
    });

    if (hasDuplicateName) {
      setContestError(
        "A contest with this name already exists for the selected event.",
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
      if (selectedEventIdForContest === null) {
        return;
      }

      const existingForEvent = categories.filter(
        (category) => category.event_id === selectedEventIdForContest,
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
              event_id: selectedEventIdForContest,
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
        const contestIdsForEvent = contests
          .filter((c) => c.event_id === selectedEventIdForContest)
          .map((c) => c.id);
        const usedDivisionIds = new Set(
          participants
            .filter((p) => contestIdsForEvent.includes(p.contest_id))
            .map((p) => p.division_id),
        );
        const deletableIds = divisionsToDelete
          .map((d) => d.id)
          .filter((id) => !usedDivisionIds.has(id));
        const keptIds = divisionsToDelete
          .map((d) => d.id)
          .filter((id) => usedDivisionIds.has(id));

        if (deletableIds.length > 0) {
          const { data: deleted, error: deleteError } = await supabase
            .from("division")
            .delete()
            .in("id", deletableIds)
            .select("id");

          if (deleteError) {
            setContestError(
              deleteError.message ||
                "Some divisions could not be deleted.",
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

        if (keptIds.length > 0) {
          setContestSuccess(
            "Some divisions were kept because participants are already assigned to them. You can rename them below.",
          );
        }
      }
    };

    if (editingContestId === null) {
      const { data, error } = await supabase
        .from("contest")
        .insert({
          event_id: selectedEventIdForContest,
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
            "A contest with this name already exists for the selected event.",
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

  const handleSaveDivisionNameForEvent = async () => {
    setContestError(null);
    setContestSuccess(null);
    if (selectedEventIdForContest === null || editingDivisionIdForEvent === null) {
      return;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setContestError("Supabase is not configured.");
      return;
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const newName = editingDivisionNameForEvent.trim();
    if (!newName) {
      setContestError("Division name cannot be empty.");
      return;
    }
    const { data, error } = await supabase
      .from("division")
      .update({ name: newName })
      .eq("id", editingDivisionIdForEvent)
      .select("id, event_id, name, created_at");
    if (error) {
      setContestError(error.message || "Unable to rename division.");
      return;
    }
    const updated = (data as CategoryRow[] | null) ?? null;
    if (updated && updated.length > 0) {
      setCategories((prev) =>
        prev.map((d) => (d.id === updated[0].id ? updated[0] : d)),
      );
      setContestSuccess("Division name has been updated.");
    }
    setEditingDivisionIdForEvent(null);
    setEditingDivisionNameForEvent("");
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
    setSelectedEventIdForAward(
      (eventTabEventFilterId ?? activeEventId) || (events.length > 0 ? events[0].id : null),
    );
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
    setSelectedEventIdForAward(award.event_id ?? (eventTabEventFilterId ?? activeEventId));
    setIsAwardModalOpen(true);
  };

  const handleSaveAward = async () => {
    setAwardError(null);
    setAwardSuccess(null);
    const effectiveEventId = selectedEventIdForAward ?? activeEventId;

    if (effectiveEventId === null) {
      setAwardError("Set an active event first in the Event tab or select an event.");
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

    // build insert/update payload carefully so it cannot violate the check constraint
    const payload: {
      event_id: number;
      contest_id: number | null;
      name: string;
      description: string | null;
      award_type: "criteria" | "special";
      is_active: boolean;
      criteria_ids: number[] | null;
      criteria_id: number | null;
    } = {
      event_id: effectiveEventId,
      contest_id: awardContestId,
      name: awardName.trim(),
      description: awardDescription.trim() || null,
      award_type: awardType,
      is_active: awardIsActive,
      criteria_ids: null,
      criteria_id: null,
    };

    if (awardType === "criteria") {
      // criteria awards must have at least one criteria id (validated above)
      payload.criteria_ids = awardCriteriaIds;
      payload.criteria_id =
        awardCriteriaIds.length > 0 ? awardCriteriaIds[0] : null;
    } else {
      // special awards should not send any criteria reference fields
      payload.criteria_ids = null;
      payload.criteria_id = null;
    }

    // sanity check before sending; should never fail if logic above is correct
    if (
      (payload.award_type === "criteria" && payload.criteria_id == null) ||
      (payload.award_type === "special" && payload.criteria_id != null)
    ) {
      setAwardError("Internal error: award data is inconsistent.");
      setIsSavingAward(false);
      return;
    }

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

    if (selectedEventIdForTeam === null) {
      setCategoryError("Please select an event.");
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
          event_id: selectedEventIdForTeam,
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

    const effectiveEventId = selectedEventIdForParticipant ?? activeEventId;

    if (effectiveEventId === null) {
      setParticipantError("Set an active event first in the Event tab or select an event.");
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
          avatar_url: (() => {
            const raw = participantAvatarUrl.trim();
            if (!raw) return null;
            try {
              const u = new URL(raw);
              u.searchParams.set("tz", String(Number(participantAvatarZoom.toFixed(2))));
              const frameW = avatarFrameRef.current?.offsetWidth ?? 1;
              const frameH = avatarFrameRef.current?.offsetHeight ?? 1;
              const txp = frameW ? participantAvatarOffset.x / frameW : 0;
              const typ = frameH ? participantAvatarOffset.y / frameH : 0;
              u.searchParams.set("txp", String(Number(txp.toFixed(4))));
              u.searchParams.set("typ", String(Number(typ.toFixed(4))));
              return u.toString();
            } catch { return raw; }
          })(),
          card_url: (() => {
            const raw = participantCardUrl.trim();
            if (!raw) return null;
            try {
              const u = new URL(raw);
              u.searchParams.set("tz", String(Number(participantCardZoom.toFixed(2))));
              const frameW = cardFrameRef.current?.offsetWidth ?? 1;
              const frameH = cardFrameRef.current?.offsetHeight ?? 1;
              const txp = frameW ? participantCardOffset.x / frameW : 0;
              const typ = frameH ? participantCardOffset.y / frameH : 0;
              u.searchParams.set("txp", String(Number(txp.toFixed(4))));
              u.searchParams.set("typ", String(Number(typ.toFixed(4))));
              return u.toString();
            } catch { return raw; }
          })(),
          gallery_photos: participantGalleryPhotos.length > 0 ? JSON.stringify(participantGalleryPhotos) : null,
        })
        .select(
          "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url, card_url, gallery_photos",
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
          avatar_url: (() => {
            const raw = participantAvatarUrl.trim();
            if (!raw) return null;
            try {
              const u = new URL(raw);
              u.searchParams.set("tz", String(Number(participantAvatarZoom.toFixed(2))));
              const frameW = avatarFrameRef.current?.offsetWidth ?? 1;
              const frameH = avatarFrameRef.current?.offsetHeight ?? 1;
              const txp = frameW ? participantAvatarOffset.x / frameW : 0;
              const typ = frameH ? participantAvatarOffset.y / frameH : 0;
              u.searchParams.set("txp", String(Number(txp.toFixed(4))));
              u.searchParams.set("typ", String(Number(typ.toFixed(4))));
              return u.toString();
            } catch { return raw; }
          })(),
          card_url: (() => {
            const raw = participantCardUrl.trim();
            if (!raw) return null;
            try {
              const u = new URL(raw);
              u.searchParams.set("tz", String(Number(participantCardZoom.toFixed(2))));
              const frameW = cardFrameRef.current?.offsetWidth ?? 1;
              const frameH = cardFrameRef.current?.offsetHeight ?? 1;
              const txp = frameW ? participantCardOffset.x / frameW : 0;
              const typ = frameH ? participantCardOffset.y / frameH : 0;
              u.searchParams.set("txp", String(Number(txp.toFixed(4))));
              u.searchParams.set("typ", String(Number(typ.toFixed(4))));
              return u.toString();
            } catch { return raw; }
          })(),
          gallery_photos: participantGalleryPhotos.length > 0 ? JSON.stringify(participantGalleryPhotos) : null,
        })
        .eq("id", editingParticipantId)
        .select(
          "id, contest_id, division_id, team_id, full_name, contestant_number, created_at, avatar_url, card_url, gallery_photos",
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
    setParticipantCardUrl("");
    setParticipantGalleryPhotos([]);
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

    if (selectedEventIdForTabulator === null) {
      setTabulatorError("Please select an event.");
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
          event_id: selectedEventIdForTabulator,
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

    if (selectedEventIdForJudge === null) {
      setJudgeError("Please select an event.");
      return;
    }

    if (editingJudgeId === null) {
      if (
        !judgeFullName.trim() ||
        !judgeUsername.trim() ||
        !judgePassword
      ) {
        setJudgeError("Please fill in all fields.");
        return;
      }
    } else {
      if (!judgeFullName.trim() || !judgeUsername.trim()) {
        setJudgeError("Please fill in required fields.");
        return;
      }
    }

    const fullNameSanitized = cleanText(judgeFullName);
    const usernameSanitized =
      editingJudgeId === null
        ? cleanText(judgeUsername).toLowerCase()
        : cleanText(judgeUsername);
    if (editingJudgeId === null) {
      const usernameOk = /^[a-z0-9_]{3,32}$/.test(usernameSanitized);
      if (!usernameOk) {
        setJudgeError("Please enter a valid username.");
        return;
      }
      if (judgePassword.length < 8) {
        setJudgeError("Password must be at least 8 characters.");
        return;
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setJudgeError("Supabase is not configured.");
      return;
    }

    const judgeAvatarUrlToSave = (() => {
      const raw = judgeAvatarUrl.trim();
      if (!raw) {
        return null;
      }
      try {
        const url = new URL(raw);
        const frameWidth = judgeAvatarFrameRef.current?.offsetWidth ?? 1;
        const frameHeight = judgeAvatarFrameRef.current?.offsetHeight ?? 1;
        const txp = frameWidth ? judgeAvatarOffset.x / frameWidth : 0;
        const typ = frameHeight ? judgeAvatarOffset.y / frameHeight : 0;
        url.searchParams.set("tz", String(Number(judgeAvatarZoom.toFixed(2))));
        url.searchParams.set("txp", String(Number(txp.toFixed(4))));
        url.searchParams.set("typ", String(Number(typ.toFixed(4))));
        return url.toString();
      } catch {
        return raw;
      }
    })();

    setIsSavingJudge(true);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let error = null;
    let data: unknown = null;

    if (editingJudgeId === null) {
      const response = await supabase
        .from("user_judge")
        .insert({
          event_id: selectedEventIdForJudge,
          full_name: fullNameSanitized,
          username: usernameSanitized,
          password_hash: judgePassword,
          role: judgeRole,
          avatar_url: judgeAvatarUrlToSave,
        })
        .select("id, event_id, full_name, username, role, avatar_url, created_at");

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
        .update((() => {
          const payload: { full_name: string; username: string; role: "chairman" | "judge"; avatar_url: string | null; password_hash?: string } = {
            full_name: fullNameSanitized,
            username: usernameSanitized,
            role: judgeRole,
            avatar_url: judgeAvatarUrlToSave,
          };
          if (judgePassword && judgePassword.length > 0) {
            payload.password_hash = judgePassword;
          }
          return payload;
        })())
        .eq("id", editingJudgeId)
        .select("id, event_id, full_name, username, role, avatar_url, created_at");

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
    setJudgeAvatarUrl("");
    setJudgeAvatarZoom(1);
    setJudgeAvatarOffset({ x: 0, y: 0 });
    setJudgeAvatarImageDims(null);
    setIsJudgeModalOpen(false);
  };

  const handleSaveAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);

    if (!adminUsername.trim() || !adminPassword) {
      setAdminError("Please fill in all fields.");
      return;
    }

    const adminUser = cleanText(adminUsername).toLowerCase();
    const userOk = /^[a-z0-9_]{3,32}$/.test(adminUser);
    if (!userOk) {
      setAdminError("Username must be 3-32 characters, lowercase letters, digits or _");
      return;
    }
    if (adminPassword.length < 8) {
      setAdminError("Password must be at least 8 characters.");
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
          username: adminUser,
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
          username: adminUser,
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

    try {
      // Remove dependent rows to avoid foreign key or RLS issues
      await supabase.from("judge_assignment").delete().eq("judge_id", id);
      await supabase.from("judge_scoring_permission").delete().eq("judge_id", id);
      await supabase.from("judge_division_permission").delete().eq("judge_id", id);
      await supabase.from("judge_participant_permission").delete().eq("judge_id", id);
      await supabase.from("judge_contest_submission").delete().eq("judge_id", id);
      await supabase.from("judge_participant_total").delete().eq("judge_id", id);
      await supabase.from("score").delete().eq("judge_id", id);

      const { data, error } = await supabase
        .from("user_judge")
        .delete()
        .eq("id", id)
        .select("id");

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
    } catch (e) {
      const message = e instanceof Error ? e.message : null;
      setJudgeError(message ?? "Unable to delete judge due to an unexpected error.");
    } finally {
      setIsDeletingJudgeId(null);
    }
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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F1F5F9] text-slate-900">
      {/* Background patterns */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1F] blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#1F4D3A1A] blur-[120px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
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
                Admin Console
              </div>
            </div>
          </div>

          <div className="flex flex-1 justify-center px-8">
            <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100/50 p-1 text-[11px] font-bold sm:flex">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key as AdminTab)}
                  className={"rounded-xl px-5 py-2 transition-all duration-300 " + (activeTab === item.key
                    ? "bg-[#1F4D3A] text-white shadow-lg shadow-[#1F4D3A30]"
                    : "text-slate-500 hover:bg-white hover:text-[#1F4D3A]")}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500">
                Administrator
              </span>
            </div>
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 py-2 text-[11px] font-bold text-slate-600 transition-all duration-300 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
            >
              <span>Sign out</span>
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                      System Overview
                    </h2>
                    <p className="max-w-4xl text-[15px] font-medium leading-relaxed text-slate-400">
                      Real-time summary of your tabulation events and participants.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#1F4D3A]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1F4D3A]">
                    Live Status
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Active Events", value: events.filter((e) => e.is_active).length, lottiePath: "/Confetti.json" },
                    { label: "Total Judges", value: activeEventId ? judges.filter((j) => j.event_id === activeEventId).length : 0, lottiePath: "/Scales.json" },
                    { label: "Participants", value: activeEventId ? participants.filter((p) => contests.find((c) => c.id === p.contest_id)?.event_id === activeEventId).length : 0, lottiePath: "/Fashionable%20girl%20in%20red%20dress.json" }
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {stat.label}
                          </div>
                          <div className="mt-1 text-2xl font-bold text-slate-800">
                            {stat.value}
                          </div>
                        </div>
                        <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/70 ring-1 ring-white/60 shadow-sm transition-transform duration-300 group-hover:scale-[1.03] md:h-40 md:w-40">
                          <LottieIcon path={stat.lottiePath} className="h-full w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "tabulation" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">
                    Tabulation Dashboard
                  </h2>
                  <p className="text-[13px] text-slate-400">
                    Monitor real-time scores and rankings for all contests.
                  </p>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Event</span>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] min-w-[200px]"
                    value={tabulationEventFilterId === "all" ? "all" : String(tabulationEventFilterId)}
                    onChange={(event) => {
                      const value = event.target.value;
                      const next = value === "all" ? "all" : Number.parseInt(value, 10);
                      setTabulationEventFilterId(next);
                      setTabulationContestFilterId("all");
                    }}
                  >
                    <option value="all">All Events</option>
                    {events.filter((e) => e.is_active).slice().sort((a, b) => a.name.localeCompare(b.name)).map((event) => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contest</span>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] min-w-[200px]"
                    value={tabulationContestFilterId === "all" ? "all" : String(tabulationContestFilterId)}
                    onChange={(event) => {
                      const value = event.target.value;
                      const next = value === "all" ? "all" : Number.parseInt(value, 10);
                      setTabulationContestFilterId(next);
                    }}
                  >
                    <option value="all">All Contests</option>
                    {contests.filter((contest) => tabulationEventFilterId === "all" ? true : contest.event_id === tabulationEventFilterId).slice().sort((a, b) => a.name.localeCompare(b.name)).map((contest) => (
                      <option key={contest.id} value={contest.id}>{contest.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Division</span>
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] min-w-[200px]"
                    value={tabulationDivisionFilterId === "all" ? "all" : String(tabulationDivisionFilterId)}
                    onChange={(event) => {
                      const value = event.target.value;
                      const next = value === "all" ? "all" : Number.parseInt(value, 10);
                      setTabulationDivisionFilterId(next);
                    }}
                  >
                    <option value="all">All Divisions</option>
                    {(tabulationEventFilterId === "all" ? categories : categories.filter((category) => category.event_id === tabulationEventFilterId)).slice().sort((a, b) => a.name.localeCompare(b.name)).map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTabulationView("awards")}
                  className={"rounded-full border px-4 py-2 text-xs font-semibold transition " + (adminTabulationView === "awards"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                    : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]")}
                >
                  Awards
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTabulationView("sub-criteria")}
                  className={"rounded-full border px-4 py-2 text-xs font-semibold transition " + (adminTabulationView === "sub-criteria"
                    ? "border-[#1F4D3A] bg-[#1F4D3A] text-white"
                    : "border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F8FAFC]")}
                >
                  Sub-Criteria
                </button>
              </div>
            </div>

            {adminTabulationView === "awards" && (
              <div className="mt-8 rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">Awards Ranking</h2>
                    <p className="text-[13px] text-slate-400">View judge totals, ranks, and overall award ranking.</p>
                  </div>
                  <div className="w-full max-w-sm">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">Award</label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10]"
                      value={tabulationAwardFilterId === "all" ? "" : String(tabulationAwardFilterId)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setTabulationAwardFilterId(value ? Number.parseInt(value, 10) : "all");
                        setAwardsTabulationError(null);
                        setAwardsTabulationSuccess(null);
                      }}
                    >
                      <option value="">Select award</option>
                      {awardsForTabulationContest.slice().sort((a, b) => a.name.localeCompare(b.name)).map((award) => (
                        <option key={award.id} value={award.id}>{award.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(awardsTabulationError || awardsTabulationSuccess) && (
                  <div className={"mb-6 rounded-xl p-4 text-xs font-medium " + (awardsTabulationError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600")}>
                    {awardsTabulationError ?? awardsTabulationSuccess}
                  </div>
                )}
                {effectiveTabulationContestId === null ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    Select a contest to view awards ranking.
                  </div>
                ) : awardsForTabulationContest.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    No awards configured for this contest.
                  </div>
                ) : !selectedTabulationAwardResult ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    Select an award above to view its ranking.
                  </div>
                ) : selectedTabulationAwardResult.awardType !== "criteria" ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    This is a special award. Criteria score ranking is not available.
                  </div>
                ) : tabulationAwardsTable === null || tabulationAwardsTable.rows.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    No tabulation data available for this award yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Represent</th>
                          <th className="px-6 py-4">Contestant</th>
                          {tabulationAwardsTable.judges.map((judge) => (
                            <th key={judge.id} className="px-6 py-4 text-center" colSpan={2}>{judge.username}</th>
                          ))}
                          <th className="px-6 py-4 text-right">Rank Total</th>
                        </tr>
                        <tr className="border-t border-slate-100 bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="px-6 py-2"></th>
                          <th className="px-6 py-2"></th>
                          {tabulationAwardsTable.judges.flatMap((judge) => ([
                            <th key={"hdr-s-" + judge.id} className="px-6 py-2 text-center">Score</th>,
                            <th key={"hdr-r-" + judge.id} className="px-6 py-2 text-center">Rank</th>,
                          ]))}
                          <th className="px-6 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tabulationAwardsTable.rows.map(({ participant, avg }, index) => (
                          <tr key={participant.participantId} className="group transition-colors hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-slate-500 font-medium">{participant.teamName ?? "—"}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{participant.participantName}</div>
                              <div className="text-[11px] font-medium text-slate-400">Contestant #{participant.contestantNumber}</div>
                            </td>
                            {tabulationAwardsTable.judges.flatMap((judge) => {
                              const score = participant.judgeCriteriaScores[judge.id];
                              const rank = tabulationAwardsTable.rankByJudgeAndParticipant.get(judge.id + "-" + participant.participantId) ?? null;
                              return ([
                                <td key={"cell-s-" + participant.participantId + "-" + judge.id} className="px-6 py-4 text-center text-slate-600 font-medium">
                                  {score !== undefined ? score.toFixed(2) : "—"}
                                </td>,
                                <td key={"cell-r-" + participant.participantId + "-" + judge.id} className="px-6 py-4 text-center font-bold text-[#1F4D3A]">
                                  {rank ?? "—"}
                                </td>,
                              ]);
                            })}
                            <td className="px-6 py-4 text-right">
                              <span className={"inline-flex h-8 w-12 items-center justify-center rounded-xl text-[11px] font-bold " + (index < 3 ? "bg-[#1F4D3A] text-white shadow-sm" : "bg-slate-100 text-slate-600")}>
                                {avg !== Number.POSITIVE_INFINITY ? avg.toFixed(2) : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {adminTabulationView === "sub-criteria" && (
              <div className="mt-8 rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
                <div className="mb-6 flex flex-col gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">Sub-Criteria Breakdown</h2>
                  <p className="text-[13px] text-slate-400">Scores per participant, per criteria, per judge.</p>
                </div>

                {effectiveTabulationContestId === null ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    Select a contest to view sub-criteria scores.
                  </div>
                ) : tabulationSubCriteriaTable === null || tabulationSubCriteriaTable.rows.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs font-medium text-slate-400">
                    No sub-criteria scores found for this contest.
                  </div>
                ) : (
                  <div className="overflow-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Contestant</th>
                          <th className="px-6 py-4">Criteria</th>
                          {tabulationSubCriteriaTable.judges.map((judge) => (
                            <th key={judge.id} className="px-6 py-4 text-right">{judge.username}</th>
                          ))}
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tabulationSubCriteriaTable.rows.map((row) => (
                          <tr key={row.participant.id + "-" + row.criteria.id} className="group transition-colors hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{row.participant.full_name}</div>
                              <div className="text-[11px] font-medium text-slate-400">Contestant #{row.participant.contestant_number}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{row.criteria.name}</td>
                            {row.cells.map((cell) => (
                              <td key={cell.judgeId} className="px-6 py-4 text-right text-slate-600 font-medium">
                                {typeof cell.value === "number" ? cell.value.toFixed(2) : "—"}
                              </td>
                            ))}
                            <td className="px-6 py-4 text-right font-bold text-[#1F4D3A]">
                              {row.cells.reduce<number>((sum, cell) => typeof cell.value === "number" ? sum + cell.value : sum, 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            </section>
        )}

        {selectedJudgeForBreakdown !== null && selectedTabulationAwardResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm">
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
                    {selectedTabulationAwardResult.allParticipants.map((participant) => (
                      <tr key={participant.participantId} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{participant.participantName}</div>
                            <div className="text-xs text-slate-500">#{participant.contestantNumber} • {participant.teamName ?? "No Team"}</div>
                        </td>
                        {(() => {
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
                            const selectedCriteria = criteriaList.filter(c => criteriaIds.includes(c.id));
                            // Calculate scores for this participant and judge
                            const judgeId = selectedJudgeForBreakdown!;
                            return selectedCriteria.map(c => {
                              const s = scores.find(s => s.judge_id === judgeId && s.participant_id === participant.participantId && s.criteria_id === c.id);
                              return (
                                <td key={c.id} className="px-4 py-3 text-center text-slate-600">
                                  {s ? Number(s.score).toFixed(2) : "—"}
                                </td>
                              );
                            });
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
                             // Do not expand to categories; sum only the explicitly linked criteria
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
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">
                    Event Management
                  </h2>
                  <p className="text-[13px] text-slate-400">
                    Configure events, contests, scoring criteria, and award categories.
                  </p>
                </div>
                <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white/50 px-4 py-2 shadow-sm sm:flex">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Event</span>
                  <span className="text-xs font-bold text-[#1F4D3A]">
                    {activeEvent ? activeEvent.name : "None Selected"}
                  </span>
                </div>
              </div>

              <div className="mb-8 flex gap-2 rounded-2xl bg-slate-100/50 p-1.5 text-[11px] font-bold w-fit">
                {[
                  { key: "addEvent", label: "Events" },
                  { key: "addContest", label: "Contests" },
                  { key: "addCriteria", label: "Criteria" },
                  { key: "awards", label: "Awards" },
                  { key: "template", label: "Templates" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setEventTab(tab.key as EventSubTab)}
                    className={`rounded-xl px-5 py-2 transition-all duration-300 ${
                      eventTab === tab.key
                        ? "bg-white text-[#1F4D3A] shadow-sm"
                        : "text-slate-500 hover:text-[#1F4D3A]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {eventTab === "addEvent" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-700">Events Directory</h3>
                      <button
                        type="button"
                        onClick={openCreateEventModal}
                        className="group flex items-center gap-2 rounded-xl bg-[#1F4D3A] px-5 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-[#1F4D3A30] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add New Event</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                      <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <div className="space-y-1.5">
                          <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Search</label>
                          <div className="relative">
                            <input
                              value={eventSearch}
                              onChange={(e) => setEventSearch(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] focus:bg-white"
                              placeholder="Name or code..."
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter Year</label>
                          <select
                            value={eventFilterYear}
                            onChange={(e) => setEventFilterYear(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] focus:bg-white"
                          >
                            <option value="all">All Years</option>
                            {Array.from(new Set(events.map((e) => e.year))).sort((a, b) => b - a).map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter Month</label>
                          <select
                            value={eventFilterMonth}
                            onChange={(e) => setEventFilterMonth(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs font-medium outline-none transition-all duration-300 focus:border-[#1F4D3A] focus:ring-4 focus:ring-[#1F4D3A10] focus:bg-white"
                          >
                            <option value="all">All Months</option>
                            {monthOptions.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(eventError || eventSuccess) && (
                        <div className={`mb-6 rounded-xl p-4 text-xs font-medium ${eventError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                          {eventError ?? eventSuccess}
                        </div>
                      )}

                      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                        <table className="min-w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="px-6 py-4">Event Name</th>
                              <th className="px-6 py-4">Code</th>
                              <th className="px-6 py-4">Year</th>
                              <th className="px-6 py-4 text-center">Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {events.length === 0 || filteredEvents.length === 0 ? (
                              <tr>
                                <td className="px-6 py-12 text-center text-slate-400" colSpan={5}>
                                  <div className="flex flex-col items-center gap-2">
                                    <span className="text-[13px] font-medium">No events found</span>
                                    <span className="text-[11px] opacity-70">Start by adding a new event to the system.</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredEvents.map((event) => (
                                <tr key={event.id} className="group transition-colors hover:bg-slate-50/50">
                                  <td className="px-6 py-4 font-bold text-slate-800">{event.name}</td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{event.code}</td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{event.year}</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                      {event.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => event.is_active ? handleDeactivateEvent(event.id) : handleSetActiveEvent(event.id)}
                                        disabled={isSettingActiveEventId === event.id || isDeactivatingEventId === event.id}
                                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                          event.is_active
                                            ? "border-2 border-red-100 text-red-500 hover:bg-red-50"
                                            : "border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                        }`}
                                      >
                                        {event.is_active ? "Deactivate" : "Activate"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openEditEventModal(event)}
                                        className="rounded-lg border-2 border-slate-100 p-1.5 text-slate-400 transition-all duration-300 hover:border-[#1F4D3A] hover:bg-[#1F4D3A]/5 hover:text-[#1F4D3A]"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEvent(event.id)}
                                        disabled={isDeletingEventId === event.id}
                                        className="rounded-lg border-2 border-slate-100 p-1.5 text-slate-400 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                      <div className="relative max-w-md">
                        <select
                          value={eventTabEventFilterId ?? ""}
                          onChange={(e) => setEventTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">All Events</option>
                          {events.filter(e => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} ({event.year})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateContestModal}
                      className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Contest
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-slate-800">Contest List</h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {contestsForEventTab.length} Total
                        </span>
                      </div>
                    </div>

                    {(contestError || contestSuccess) && (
                      <div className={`m-6 rounded-xl p-4 text-[13px] font-medium ${contestError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        {contestError ?? contestSuccess}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-8 py-4">Contest Name</th>
                            <th className="px-8 py-4">Code</th>
                            <th className="px-8 py-4">Event</th>
                            <th className="px-8 py-4">Divisions</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {contestsForEventTab.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg className="mb-2 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                  <span className="text-sm">No contests found for this selection.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            contestsForEventTab.map((contest) => (
                              <tr key={contest.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <div className="text-[13px] font-bold text-slate-800">{contest.name}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                    {contest.contest_code ?? "—"}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-[13px] text-slate-600">
                                  {events.find(e => e.id === contest.event_id)?.name ?? "Unknown"}
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex flex-wrap gap-1.5">
                                    {categories.filter(c => c.event_id === contest.event_id).length === 0 ? (
                                      <span className="text-[11px] italic text-slate-400">No divisions</span>
                                    ) : (
                                      categories.filter(c => c.event_id === contest.event_id).map((division) => (
                                        <span key={division.id} className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/10">
                                          {division.name}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditContestModal(contest)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContest(contest.id)}
                                      disabled={isDeletingContestId === contest.id}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {isDeletingContestId === contest.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      )}
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
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                      <div className="relative max-w-md">
                        <select
                          value={eventTabEventFilterId ?? ""}
                          onChange={(e) => setEventTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">All Events</option>
                          {events.filter(e => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} ({event.year})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateCriteriaModal}
                      className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Criteria
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-slate-800">Criteria List</h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {criteriaForEventTab.length} Total
                        </span>
                      </div>
                    </div>

                    {(criteriaError || criteriaSuccess) && (
                      <div className={`m-6 rounded-xl p-4 text-[13px] font-medium ${criteriaError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        {criteriaError ?? criteriaSuccess}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-8 py-4">Category</th>
                            <th className="px-8 py-4">Criteria Name</th>
                            <th className="px-8 py-4">{criteriaValueHeader}</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {criteriaForEventTab.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-8 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg className="mb-2 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  <span className="text-sm">No criteria found for this selection.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            criteriaForEventTab.map((criteria) => (
                              <tr key={criteria.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5 text-[13px] text-slate-600">
                                  {criteria.category ?? "—"}
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-[13px] font-bold text-slate-800">{criteria.name}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/10">
                                    {criteria.percentage}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditCriteriaModal(criteria)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCriteria(criteria.id)}
                                      disabled={isDeletingCriteriaId === criteria.id}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {isDeletingCriteriaId === criteria.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      )}
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
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                      <div className="relative max-w-md">
                        <select
                          value={eventTabEventFilterId ?? ""}
                          onChange={(e) => setEventTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">All Events</option>
                          {events.filter(e => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} ({event.year})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateAwardModal}
                      className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Award
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-[15px] font-bold text-slate-800">Awards List</h3>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              placeholder="Search awards..."
                              value={awardSearch}
                              onChange={(e) => setAwardSearch(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-[12px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {awardsForEventTab.length} Total
                          </span>
                        </div>
                      </div>
                    </div>

                    {(awardError || awardSuccess) && (
                      <div className={`m-6 rounded-xl p-4 text-[13px] font-medium ${awardError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        {awardError ?? awardSuccess}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-8 py-4">Award Name</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4">Contest</th>
                            <th className="px-8 py-4">Criteria Category</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {awardsForEventTab.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg className="mb-2 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                  <span className="text-sm">No awards found for this selection.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            awardsForEventTab.map((award) => (
                              <tr key={award.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <div className="text-[13px] font-bold text-slate-800">{award.name}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${award.award_type === "criteria" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10" : "bg-purple-50 text-purple-700 ring-1 ring-purple-600/10"}`}>
                                    {award.award_type === "criteria" ? "Criteria-based" : "Special"}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-[13px] text-slate-600">
                                  {award.contest_id === null ? (
                                    <span className="italic">All contests</span>
                                  ) : (
                                    contests.find(c => c.id === award.contest_id)?.name ?? "Unknown"
                                  )}
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-[13px] text-slate-600">
                                    {award.award_type === "criteria" ? (() => {
                                      const ids = award.criteria_ids ?? (award.criteria_id ? [award.criteria_id] : []);
                                      if (ids.length === 0) return "—";
                                      const cats = Array.from(new Set(ids.map(id => criteriaList.find(c => c.id === id)?.category || "Uncategorized").filter(Boolean)));
                                      return cats.length > 0 ? cats.join(", ") : "Unknown category";
                                    })() : "—"}
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditAwardModal(award)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAward(award.id)}
                                      disabled={isDeletingAwardId === award.id}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {isDeletingAwardId === award.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      )}
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
                <div className="space-y-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex-1">
                      <label className="mb-2 block text-[13px] font-bold text-slate-700">Select Contest</label>
                      <div className="relative max-w-md">
                        <select
                          value={selectedContestIdForTemplate ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setSelectedContestIdForTemplate(
                              value ? Number.parseInt(value, 10) : null,
                            );
                          }}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">Choose contest</option>
                          {contestsForEventTab.map((contest) => (
                            <option key={contest.id} value={contest.id}>
                              {contest.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-slate-700">Layout Theme</label>
                      <div className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateKey("standard");
                            setSelectedTemplateId(null);
                          }}
                          className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all duration-300 ${
                            selectedTemplateKey === "standard"
                              ? "bg-white text-emerald-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
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
                          className={`rounded-xl px-5 py-2 text-[13px] font-semibold transition-all duration-300 ${
                            selectedTemplateKey === "pageant"
                              ? "bg-white text-emerald-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Pageant
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    {selectedTemplateKey === "pageant" && (
                      <div className="space-y-4">
                        <PageantSection
                          title="Groups and badges"
                          sectionKey="groupsAndBadges"
                          isOpen={openPageantSections.groupsAndBadges}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace Background</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.workspaceBg ?? "#F8FAFC"}
                                  onChange={(event) => updateTemplateTheme({ workspaceBg: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-slate-500">Opacity</span>
                                    <span className="text-[11px] font-bold text-slate-700">{templateTheme.workspaceBgOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.workspaceBgOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ workspaceBgOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Female Group Theme</label>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.femaleGroupBg ?? "#ffe4e6"}
                                    onChange={(event) => updateTemplateTheme({ femaleGroupBg: event.target.value })}
                                  />
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.femaleBadgeBg ?? "#ec4899"}
                                    onChange={(event) => updateTemplateTheme({ femaleBadgeBg: event.target.value })}
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Group Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.femaleGroupBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-pink-500"
                                      value={templateTheme.femaleGroupBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ femaleGroupBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Badge Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.femaleBadgeBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-pink-600"
                                      value={templateTheme.femaleBadgeBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ femaleBadgeBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Male Group Theme</label>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.maleGroupBg ?? "#e0f2fe"}
                                    onChange={(event) => updateTemplateTheme({ maleGroupBg: event.target.value })}
                                  />
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.maleBadgeBg ?? "#0ea5e9"}
                                    onChange={(event) => updateTemplateTheme({ maleBadgeBg: event.target.value })}
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Group Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.maleGroupBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-blue-500"
                                      value={templateTheme.maleGroupBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ maleGroupBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Badge Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.maleBadgeBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-blue-600"
                                      value={templateTheme.maleBadgeBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ maleBadgeBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Card and number badge"
                          sectionKey="cardsAndNames"
                          isOpen={openPageantSections.cardsAndNames}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Card Background</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.cardBg ?? "#ffffff"}
                                  onChange={(event) => updateTemplateTheme({ cardBg: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.cardBgOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.cardBgOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ cardBgOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Number Badge</label>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.numberBadgeBg ?? "#000000"}
                                    onChange={(event) => updateTemplateTheme({ numberBadgeBg: event.target.value })}
                                  />
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.numberTextColor ?? "#ffffff"}
                                    onChange={(event) => updateTemplateTheme({ numberTextColor: event.target.value })}
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Badge Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.numberBadgeBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-slate-700"
                                      value={templateTheme.numberBadgeBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ numberBadgeBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Text Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.numberTextColorOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-slate-400"
                                      value={templateTheme.numberTextColorOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ numberTextColorOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Typography</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-medium text-slate-500">Size (px)</span>
                                  <input
                                    type="number"
                                    min={8}
                                    max={32}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                    value={templateTheme.numberFontSize ?? 10}
                                    onChange={(event) => setTemplateTheme(prev => ({ ...prev, numberFontSize: Number(event.target.value) || 10 }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-medium text-slate-500">Family</span>
                                  <select
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                    value={templateTheme.numberFontFamily ?? "system"}
                                    onChange={(event) => setTemplateTheme(prev => ({ ...prev, numberFontFamily: event.target.value }))}
                                  >
                                    <option value="system">Default</option>
                                    <option value="sans">Sans-serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Participant name text"
                          sectionKey="participantName"
                          isOpen={openPageantSections.participantName}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Name Text Color</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.nameTextColor ?? "#111827"}
                                  onChange={(event) => updateTemplateTheme({ nameTextColor: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.nameTextColorOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.nameTextColorOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ nameTextColorOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Typography</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-medium text-slate-500">Size (px)</span>
                                  <input
                                    type="number"
                                    min={8}
                                    max={32}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                    value={templateTheme.nameFontSize ?? 10}
                                    onChange={(event) => setTemplateTheme(prev => ({ ...prev, nameFontSize: Number(event.target.value) || 10 }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-medium text-slate-500">Family</span>
                                  <select
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                    value={templateTheme.nameFontFamily ?? "system"}
                                    onChange={(event) => setTemplateTheme(prev => ({ ...prev, nameFontFamily: event.target.value }))}
                                  >
                                    <option value="system">Default</option>
                                    <option value="sans">Sans-serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Scoring header and criteria rows"
                          sectionKey="criteriaHeaderAndRows"
                          isOpen={openPageantSections.criteriaHeaderAndRows}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Header Background</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.criteriaHeaderBg ?? "#f5f7ff"}
                                    onChange={(event) => updateTemplateTheme({ criteriaHeaderBg: event.target.value })}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.criteriaHeaderBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                      value={templateTheme.criteriaHeaderBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ criteriaHeaderBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Header Text</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.criteriaHeaderTextColor ?? "#1f2937"}
                                    onChange={(event) => updateTemplateTheme({ criteriaHeaderTextColor: event.target.value })}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.criteriaHeaderTextColorOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-slate-700"
                                      value={templateTheme.criteriaHeaderTextColorOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ criteriaHeaderTextColorOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Header Typography</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-medium text-slate-500">Size (px)</span>
                                    <input
                                      type="number"
                                      min={8}
                                      max={20}
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                      value={templateTheme.criteriaHeaderFontSize ?? 11}
                                      onChange={(event) => setTemplateTheme(prev => ({ ...prev, criteriaHeaderFontSize: Number(event.target.value) || 11 }))}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-medium text-slate-500">Family</span>
                                    <select
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                      value={templateTheme.criteriaHeaderFontFamily ?? "system"}
                                      onChange={(event) => setTemplateTheme(prev => ({ ...prev, criteriaHeaderFontFamily: event.target.value }))}
                                    >
                                      <option value="system">Default</option>
                                      <option value="sans">Sans-serif</option>
                                      <option value="serif">Serif</option>
                                      <option value="mono">Monospace</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Criteria Text</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.criteriaTextColor ?? "#111827"}
                                    onChange={(event) => updateTemplateTheme({ criteriaTextColor: event.target.value })}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.criteriaTextColorOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                      value={templateTheme.criteriaTextColorOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ criteriaTextColorOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Criteria Typography</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-medium text-slate-500">Size (px)</span>
                                    <input
                                      type="number"
                                      min={8}
                                      max={20}
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                      value={templateTheme.criteriaTextFontSize ?? 14}
                                      onChange={(event) => setTemplateTheme(prev => ({ ...prev, criteriaTextFontSize: Number(event.target.value) || 14 }))}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-medium text-slate-500">Family</span>
                                    <select
                                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold outline-none transition-all focus:border-emerald-500 focus:bg-white"
                                      value={templateTheme.criteriaTextFontFamily ?? "system"}
                                      onChange={(event) => setTemplateTheme(prev => ({ ...prev, criteriaTextFontFamily: event.target.value }))}
                                    >
                                      <option value="system">Default</option>
                                      <option value="sans">Sans-serif</option>
                                      <option value="serif">Serif</option>
                                      <option value="mono">Monospace</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PageantSection>

                        <PageantSection
                          title="Scoring table and inputs"
                          sectionKey="scoringTable"
                          isOpen={openPageantSections.scoringTable}
                          onToggle={handleTogglePageantSection}
                        >
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Table Background</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.scoringTableBg ?? "#ffffff"}
                                  onChange={(event) => updateTemplateTheme({ scoringTableBg: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.scoringTableBgOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.scoringTableBgOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ scoringTableBgOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category Row</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.scoringCategoryRowBg ?? "#f9fafb"}
                                  onChange={(event) => updateTemplateTheme({ scoringCategoryRowBg: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.scoringCategoryRowBgOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.scoringCategoryRowBgOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ scoringCategoryRowBgOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Row</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.scoringTotalRowBg ?? "#f5f7ff"}
                                  onChange={(event) => updateTemplateTheme({ scoringTotalRowBg: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.scoringTotalRowBgOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                    value={templateTheme.scoringTotalRowBgOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ scoringTotalRowBgOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Score Input</label>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.scoreInputBg ?? "#ffffff"}
                                    onChange={(event) => updateTemplateTheme({ scoreInputBg: event.target.value })}
                                  />
                                  <input
                                    type="color"
                                    className="h-8 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                    value={templateTheme.scoreInputBorderColor ?? "#cbd5e1"}
                                    onChange={(event) => updateTemplateTheme({ scoreInputBorderColor: event.target.value })}
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Bg Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.scoreInputBgOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-emerald-500"
                                      value={templateTheme.scoreInputBgOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ scoreInputBgOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-slate-500">Border Opacity</span>
                                      <span className="font-bold text-slate-700">{templateTheme.scoreInputBorderColorOpacity ?? 100}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-slate-400"
                                      value={templateTheme.scoreInputBorderColorOpacity ?? 100}
                                      onChange={(event) => updateTemplateTheme({ scoreInputBorderColorOpacity: Number(event.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Input Text</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:scale-105"
                                  value={templateTheme.scoreInputTextColor ?? "#0f172a"}
                                  onChange={(event) => updateTemplateTheme({ scoreInputTextColor: event.target.value })}
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-slate-500">Opacity</span>
                                    <span className="font-bold text-slate-700">{templateTheme.scoreInputTextColorOpacity ?? 100}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-slate-700"
                                    value={templateTheme.scoreInputTextColorOpacity ?? 100}
                                    onChange={(event) => updateTemplateTheme({ scoreInputTextColorOpacity: Number(event.target.value) || 0 })}
                                  />
                                </div>
                              </div>
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
                      <div className={`mb-6 rounded-xl p-4 text-[13px] font-medium ${templateError ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        {templateError ?? templateSuccess}
                      </div>
                    )}

                    <div className="mb-8 grid gap-6 lg:grid-cols-2">
                      <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-[13px] font-bold text-slate-700">Template Library</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Name</span>
                        </div>
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                              placeholder="e.g. Pageant – Emerald Theme"
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[11px] leading-relaxed text-slate-400">
                              Save this configuration as a reusable template for other contests.
                            </p>
                            <button
                              type="button"
                              onClick={handleSaveTemplateToLibrary}
                              disabled={isSavingTemplateToLibrary}
                              className="whitespace-nowrap rounded-xl bg-slate-800 px-4 py-2 text-[11px] font-bold text-white transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-50"
                            >
                              {isSavingTemplateToLibrary ? "Saving..." : "Save to Library"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-[13px] font-bold text-slate-700">Saved Presets</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{layoutTemplates.length} Available</span>
                        </div>
                        <div className="max-h-[160px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                          {layoutTemplates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                              <svg className="mb-2 h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                              <span className="text-[11px]">No saved presets found.</span>
                            </div>
                          ) : (
                            layoutTemplates.map((template) => {
                              const isBuiltIn = template.layout_json.templateKey === "pageant" && 
                                ["Pageant \u2013 Default", "Platinum Mist", "Imperial Topaz", "Royal"].includes(template.name);
                              return (
                                <div key={template.id} className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md">
                                  <div className="min-w-0">
                                    <div className="truncate text-[12px] font-bold text-slate-700">{template.name}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {template.layout_json.templateKey === "pageant" ? "Pageant" : "Standard"} • {new Date(template.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {!isBuiltIn && (
                                      <button
                                        onClick={() => handleDeleteTemplateFromLibrary(template.id)}
                                        disabled={isDeletingTemplateId === template.id}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleLoadTemplateFromLibrary(template)}
                                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleApplyTemplateToContest(template)}
                                      disabled={isSavingTemplate || selectedContestIdForTemplate === null}
                                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                    >
                                      Apply
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
                                                {(participant.card_url || participant.avatar_url) ? (
                                                  <img
                                                    src={participant.card_url || participant.avatar_url || ""}
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
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-md scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">
                        {editingEventId === null ? "Create Event" : "Edit Event"}
                      </h3>
                      <p className="text-[13px] font-medium text-slate-500">
                        {editingEventId === null ? "Launch a new tabulation event." : "Update event configuration."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsEventModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Event Name</label>
                      <input
                        placeholder="e.g. Annual Sports Fest 2026"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Code</label>
                        <input
                          placeholder="ASF-26"
                          value={eventCode}
                          onChange={(e) => setEventCode(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Year</label>
                        <input
                          type="number"
                          placeholder="2026"
                          value={eventYear}
                          onChange={(e) => setEventYear(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    {(eventError || eventSuccess) && (
                      <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                        eventError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {eventError ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                        {eventError ?? eventSuccess}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsEventModalOpen(false)}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEvent}
                        disabled={isSavingEvent}
                        className="flex-[1.5] rounded-2xl bg-slate-900 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                      >
                        {isSavingEvent ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          editingEventId === null ? "Create Event" : "Update Event"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {isContestModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-md scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">
                        {editingContestId === null ? "Add Contest" : "Edit Contest"}
                      </h3>
                      <p className="text-[13px] font-medium text-slate-500">
                        Configure a contest for this event.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsContestModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Select Event *</label>
                      <div className="relative">
                        <select
                          value={selectedEventIdForContest ?? ""}
                          onChange={(e) => setSelectedEventIdForContest(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">Choose an event</option>
                          {events.filter(e => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>{event.name} ({event.year})</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Contest Name *</label>
                      <input
                        placeholder="e.g. Swimsuit Competition"
                        value={contestName}
                        onChange={(e) => setContestName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-bold text-slate-700">Scoring System *</label>
                      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
                        <button
                          onClick={() => setContestScoringType("percentage")}
                          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
                            contestScoringType === "percentage" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Percentage
                        </button>
                        <button
                          onClick={() => setContestScoringType("points")}
                          className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
                            contestScoringType === "points" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Raw Points
                        </button>
                      </div>
                      <p className="px-2 text-[11px] font-medium text-slate-400 italic">
                        {contestScoringType === "percentage" 
                          ? "Scores are 0–100 with weighted criteria percentages." 
                          : "Scores are total points based on raw criteria values."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[13px] font-bold text-slate-700">Divisions (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          placeholder="e.g. Male / Female"
                          value={contestCategoryText}
                          onChange={(e) => setContestCategoryText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = contestCategoryText.trim();
                              if (val && !contestDivisionNames.includes(val)) {
                                setContestDivisionNames(prev => [...prev, val]);
                                setContestCategoryText("");
                              }
                            }
                          }}
                          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                        <button
                          onClick={() => {
                            const val = contestCategoryText.trim();
                            if (val && !contestDivisionNames.includes(val)) {
                              setContestDivisionNames(prev => [...prev, val]);
                              setContestCategoryText("");
                            }
                          }}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-90"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>

                      {contestDivisionNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {contestDivisionNames.map((name) => (
                            <button
                              key={name}
                              onClick={() => setContestDivisionNames(prev => prev.filter(n => n !== name))}
                              className="group flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700 ring-1 ring-emerald-600/10 transition-all hover:bg-red-50 hover:text-red-700 hover:ring-red-600/10"
                            >
                              <span>{name}</span>
                              <svg className="h-3 w-3 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {(contestError || contestSuccess) && (
                      <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                        contestError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {contestError ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                        {contestError ?? contestSuccess}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsContestModalOpen(false)}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveContest}
                        disabled={isSavingContest}
                        className="flex-[1.5] rounded-2xl bg-slate-900 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                      >
                        {isSavingContest ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          editingContestId === null ? "Create Contest" : "Update Contest"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {isCriteriaModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-lg scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">
                        {editingCriteriaId === null ? "Add Criteria" : "Edit Criteria"}
                      </h3>
                      <p className="text-[13px] font-medium text-slate-500">
                        {editingCriteriaId === null ? "Define scoring criteria categories and items." : "Update criteria details."}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCriteriaModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    {editingCriteriaId === null ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Select Contest *</label>
                          <div className="relative">
                            <select
                              value={selectedContestIdForCriteria ?? ""}
                              onChange={(e) => setSelectedContestIdForCriteria(e.target.value ? Number(e.target.value) : null)}
                              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            >
                              <option value="">Choose a contest</option>
                              {contests.filter(c => activeEventId === null || c.event_id === activeEventId).map((contest) => (
                                <option key={contest.id} value={contest.id}>{contest.name}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Criteria Category Name *</label>
                          <input
                            placeholder="e.g. Technical Skills"
                            value={criteriaCategory}
                            onChange={(e) => setCriteriaCategory(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[13px] font-bold text-slate-700">Criteria Items</label>
                            <button
                              onClick={handleAddCriteriaItem}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                              Add Item
                            </button>
                          </div>

                          <div className="space-y-3">
                            {criteriaItems.map((item, index) => (
                              <div key={index} className="group relative grid grid-cols-[1fr_100px_40px] gap-3 rounded-3xl border border-slate-100 bg-slate-50/30 p-4 transition-all hover:bg-white hover:shadow-sm">
                                <div className="space-y-1">
                                  <input
                                    placeholder="Criteria Name"
                                    value={item.name}
                                    onChange={(e) => handleChangeCriteriaItem(index, "name", e.target.value)}
                                    className="w-full bg-transparent text-[13px] font-bold text-slate-800 outline-none placeholder:text-slate-300"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <input
                                    type="number"
                                    placeholder="Points"
                                    value={item.weight}
                                    onChange={(e) => handleChangeCriteriaItem(index, "weight", e.target.value)}
                                    className="w-full bg-transparent text-[13px] font-bold text-emerald-600 outline-none placeholder:text-slate-300"
                                  />
                                </div>
                                <button
                                  onClick={() => setCriteriaItems(prev => prev.filter((_, i) => i !== index))}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Contest</label>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3.5 text-[14px] font-bold text-slate-400">
                            {contests.find(c => c.id === selectedContestIdForCriteria)?.name ?? "Unknown Contest"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Category Name</label>
                          <input
                            value={editingCriteriaCategory}
                            onChange={(e) => setEditingCriteriaCategory(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Criteria Name *</label>
                          <input
                            value={criteriaName}
                            onChange={(e) => setCriteriaName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Points *</label>
                          <input
                            type="number"
                            value={criteriaWeight}
                            onChange={(e) => setCriteriaWeight(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Description</label>
                          <textarea
                            rows={3}
                            value={criteriaDescription}
                            onChange={(e) => setCriteriaDescription(e.target.value)}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 space-y-4">
                    {(criteriaError || criteriaSuccess) && (
                      <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                        criteriaError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {criteriaError ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                        {criteriaError ?? criteriaSuccess}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsCriteriaModalOpen(false)}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCriteria}
                        disabled={isSavingCriteria}
                        className="flex-[1.5] rounded-2xl bg-slate-900 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                      >
                        {isSavingCriteria ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          editingCriteriaId === null ? "Save Criteria" : "Update Criteria"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {isAwardModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
                <div className="w-full max-w-lg scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">
                        {editingAwardId === null ? "Add Award" : "Edit Award"}
                      </h3>
                      <p className="text-[13px] font-medium text-slate-500">
                        Configure awards for this event.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAwardModalOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Award Name *</label>
                      <input
                        placeholder="e.g. Best in Talent"
                        value={awardName}
                        onChange={(e) => setAwardName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Select Event *</label>
                      <div className="relative">
                        <select
                          value={selectedEventIdForAward ?? ""}
                          onChange={(e) => setSelectedEventIdForAward(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">Choose an event</option>
                          {events.filter(e => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>{event.name} ({event.year})</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Award Type *</label>
                        <select
                          value={awardType}
                          onChange={(e) => setAwardType(e.target.value as AwardType)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="criteria">Criteria-based</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Limit to Contest</label>
                        <select
                          value={awardContestId ?? ""}
                          onChange={(e) => setAwardContestId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">All contests</option>
                          {contests.filter(c => (selectedEventIdForAward ?? activeEventId) === null ? true : c.event_id === (selectedEventIdForAward ?? activeEventId)).map((contest) => (
                            <option key={contest.id} value={contest.id}>{contest.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {awardType === "criteria" && (
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Linked Criteria *</label>
                        <div className="relative" ref={awardCriteriaDropdownRef}>
                          <button
                            onClick={() => setIsAwardCriteriaDropdownOpen(!isAwardCriteriaDropdownOpen)}
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white"
                          >
                            <span className={awardCriteriaIds.length === 0 ? "text-slate-400" : "text-slate-900"}>
                              {awardCriteriaIds.length === 0 ? "Select criteria" : `${awardCriteriaIds.length} criteria selected`}
                            </span>
                            <svg className={`h-4 w-4 text-slate-400 transition-transform ${isAwardCriteriaDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          
                          {isAwardCriteriaDropdownOpen && (
                            <div className="absolute left-0 top-full z-[110] mt-2 max-h-60 w-full overflow-auto rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                              {criteriaForActiveEvent.length === 0 ? (
                                <div className="px-4 py-3 text-[13px] text-slate-400">No criteria available.</div>
                              ) : (
                                Array.from(new Set(criteriaForActiveEvent.map(c => c.category || "Uncategorized"))).map((category) => {
                                  const criteriaInCategory = criteriaForActiveEvent.filter(c => (c.category || "Uncategorized") === category);
                                  const isExpanded = expandedAwardCategories.has(category);
                                  return (
                                    <div key={category} className="mb-1">
                                      <button
                                        onClick={() => {
                                          const next = new Set(expandedAwardCategories);
                                          if (next.has(category)) next.delete(category);
                                          else next.add(category);
                                          setExpandedAwardCategories(next);
                                        }}
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                                      >
                                        <span className="text-[12px] font-bold text-slate-700">{category}</span>
                                        <svg className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                      </button>
                                      {isExpanded && (
                                        <div className="ml-2 mt-1 space-y-1 pl-4 border-l-2 border-slate-100">
                                          {criteriaInCategory.map((criterion) => (
                                            <label key={criterion.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-emerald-50/50 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={awardCriteriaIds.includes(criterion.id)}
                                                onChange={(e) => {
                                                  if (e.target.checked) setAwardCriteriaIds(prev => [...prev, criterion.id]);
                                                  else setAwardCriteriaIds(prev => prev.filter(id => id !== criterion.id));
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                                              />
                                              <span className="text-[12px] font-medium text-slate-600">{criterion.name}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Description</label>
                      <textarea
                        rows={3}
                        value={awardDescription}
                        onChange={(e) => setAwardDescription(e.target.value)}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        placeholder="Describe this award"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
                      <input
                        id="award-active"
                        type="checkbox"
                        checked={awardIsActive}
                        onChange={(e) => setAwardIsActive(e.target.checked)}
                        className="h-5 w-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <label htmlFor="award-active" className="text-[13px] font-bold text-slate-700 cursor-pointer">Award is active</label>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {(awardError || awardSuccess) && (
                      <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                        awardError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {awardError ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                        {awardError ?? awardSuccess}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsAwardModalOpen(false)}
                        className="flex-1 rounded-2xl border border-slate-200 py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAward}
                        disabled={isSavingAward}
                        className="flex-[1.5] rounded-2xl bg-slate-900 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                      >
                        {isSavingAward ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          editingAwardId === null ? "Add Award" : "Update Award"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                )}
              </div>
            </section>
          )}

        {activeTab === "participants" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1.5 backdrop-blur-sm">
                {[
                  { id: "category", label: "Teams", icon: "Group" },
                  { id: "participant", label: "Participants", icon: "User" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setParticipantTab(tab.id as ParticipantSubTab)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
                      participantTab === tab.id
                        ? "bg-white text-emerald-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {participantTab === "category" && (
                <button
                  onClick={openCreateCategoryModal}
                  className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Team
                </button>
              )}
              {participantTab === "participant" && (
                <button
                  onClick={openCreateParticipantModal}
                  className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Participant
                </button>
              )}
            </div>

            <div className="grid gap-6">
              {participantTab === "category" && (
                <div className="space-y-6">
                  {/* Filter Section */}
                  <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                        <div className="relative">
                          <select
                            value={participantsTabEventFilterId ?? ""}
                            onChange={(e) => setParticipantsTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">All Events</option>
                            {events.filter(e => e.is_active).map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name} ({event.year})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                      <h3 className="text-[15px] font-bold text-slate-800">Team List</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-8 py-4">Event</th>
                            <th className="px-8 py-4">Team Name</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teamsForParticipantsTab.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-8 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg className="mb-2 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                  <span className="text-sm">No teams found for this event.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            teamsForParticipantsTab.map((team) => (
                              <tr key={team.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                    {events.find(e => e.id === team.event_id)?.name ?? "Unknown"}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="text-[13px] font-bold text-slate-800">{team.name}</div>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditCategoryModal(team)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"
                                      title="Edit Team"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(team.id)}
                                      disabled={isDeletingCategoryId === team.id}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                      title="Delete Team"
                                    >
                                      {isDeletingCategoryId === team.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      )}
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
                <div className="space-y-6">
                  {/* Filter & Search Section */}
                  <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
                      <div className="flex-1">
                        <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                        <div className="relative">
                          <select
                            value={participantsTabEventFilterId ?? ""}
                            onChange={(e) => setParticipantsTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">All Events</option>
                            {events.filter(e => e.is_active).map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name} ({event.year})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="mb-2 block text-[13px] font-bold text-slate-700">Search Participant</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name or number..."
                            value={participantSearch}
                            onChange={(e) => setParticipantSearch(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-11 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-slate-800">Participant List</h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {filteredParticipants.length} Total
                        </span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-8 py-4">Participant</th>
                            <th className="px-8 py-4">Contest</th>
                            <th className="px-8 py-4">Team</th>
                            <th className="px-8 py-4">Number</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredParticipants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <svg className="mb-2 h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  <span className="text-sm">No participants found.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredParticipants.map((participant) => (
                              <tr key={participant.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[13px] font-bold text-emerald-700 ring-1 ring-emerald-600/10">
                                      {participant.full_name.charAt(0)}
                                    </div>
                                    <div className="text-[13px] font-bold text-slate-800">{participant.full_name}</div>
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-[13px] text-slate-600">
                                  {contests.find(c => c.id === participant.contest_id)?.name ?? "Unknown"}
                                </td>
                                <td className="px-8 py-5">
                                  <span className="text-[13px] font-medium text-slate-600">
                                    {categories.find(c => c.id === participant.division_id)?.name ?? "Unknown"}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                    #{participant.contestant_number}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditParticipantModal(participant)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParticipant(participant.id)}
                                      disabled={isDeletingParticipantId === participant.id}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                      {isDeletingParticipantId === participant.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      )}
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
          </div>
        )}

        {activeTab === "monitor" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1.5 backdrop-blur-sm">
                {[
                  { id: "permissions", label: "Judge Permissions" },
                  { id: "monitoring", label: "Live Monitoring" },
                  { id: "message", label: "Message" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMonitorTab(tab.id as MonitorSubTab)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
                      monitorTab === tab.id
                        ? "bg-white text-emerald-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              {monitorTab === "permissions" && (
                <div className="space-y-6">
                  <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="flex-1">
                      <label className="mb-2 block text-[13px] font-bold text-slate-700">Select Event</label>
                      <div className="relative max-w-md">
                        <select
                          value={participantsTabEventFilterId ?? ""}
                          onChange={(e) =>
                            setParticipantsTabEventFilterId(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                          <option value="">Choose an event</option>
                          {events.filter((e) => e.is_active).map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} ({event.year})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6 rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
                          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                          Assignment Details
                        </h4>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Select Judges</label>
                          <MultiSelectDropdown
                            placeholder="All Judges"
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
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Select Contest</label>
                          <div className="relative">
                            <select
                              value={selectedContestIdForPermissions ?? ""}
                              onChange={(e) => {
                                setSelectedContestIdForPermissions(
                                  e.target.value ? Number(e.target.value) : null,
                                );
                                setJudgePermissionsError(null);
                                setJudgePermissionsSuccess(null);
                              }}
                              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            >
                              <option value="">Choose contest</option>
                              {contestsForParticipantsTab.map((contest) => (
                                <option key={contest.id} value={contest.id}>
                                  {contest.name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Custom Division Access</label>
                          <MultiSelectDropdown
                            placeholder="All Divisions"
                            disabled={selectedContestIdForPermissions === null}
                            options={
                              selectedContestIdForPermissions === null
                                ? []
                                : categories
                                    .filter((c) =>
                                      participants.some(
                                        (p) =>
                                          p.contest_id === selectedContestIdForPermissions &&
                                          p.division_id === c.id,
                                      ),
                                    )
                                    .map((c) => ({ id: c.id, label: c.name }))
                            }
                            selectedIds={judgeDivisionIds}
                            onChange={(ids) => {
                              setJudgeDivisionIds(ids);
                              setJudgeDivisionMode(ids.length === 0 ? "all" : "custom");
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-700">Custom Participant Access</label>
                          <MultiSelectDropdown
                            placeholder="All Participants"
                            disabled={selectedContestIdForPermissions === null}
                            options={
                              selectedContestIdForPermissions === null
                                ? []
                                : participants
                                    .filter((p) => p.contest_id === selectedContestIdForPermissions)
                                    .map((p) => ({ id: p.id, label: p.full_name }))
                            }
                            selectedIds={judgeParticipantIds}
                            onChange={(ids) => {
                              setJudgeParticipantIds(ids);
                              setJudgeParticipantMode(ids.length === 0 ? "all" : "custom");
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
                            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Criteria Access
                          </h4>
                          {selectedContestIdForPermissions && (
                            <button
                              onClick={() => {
                                const allIds = criteriaList
                                  .filter((c) => c.contest_id === selectedContestIdForPermissions)
                                  .map((c) => c.id);
                                if (judgePermissionsMode === "all") {
                                  setJudgePermissionsCriteriaIds([]);
                                  setJudgePermissionsMode("custom");
                                } else {
                                  setJudgePermissionsCriteriaIds(allIds);
                                  setJudgePermissionsMode("all");
                                }
                              }}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              {judgePermissionsMode === "all" ? "Deselect All" : "Select All"}
                            </button>
                          )}
                        </div>

                        {!selectedContestIdForPermissions ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <svg className="mb-3 h-12 w-12 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-sm font-medium">Select a contest to manage criteria</p>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            {criteriaList
                              .filter((c) => c.contest_id === selectedContestIdForPermissions)
                              .map((criteria) => {
                                const isAllowed =
                                  judgePermissionsMode === "all"
                                    ? true
                                    : judgePermissionsCriteriaIds.includes(criteria.id);
                                return (
                                  <button
                                    key={criteria.id}
                                    onClick={() => {
                                      const allIds = criteriaList
                                        .filter((c) => c.contest_id === selectedContestIdForPermissions)
                                        .map((c) => c.id);
                                      let nextSelected;
                                      if (judgePermissionsMode === "all") {
                                        nextSelected = allIds.filter((id) => id !== criteria.id);
                                      } else {
                                        nextSelected = judgePermissionsCriteriaIds.includes(criteria.id)
                                          ? judgePermissionsCriteriaIds.filter((id) => id !== criteria.id)
                                          : [...judgePermissionsCriteriaIds, criteria.id];
                                      }
                                      const isAllNow = nextSelected.length === allIds.length;
                                      setJudgePermissionsCriteriaIds(isAllNow ? allIds : nextSelected);
                                      setJudgePermissionsMode(isAllNow ? "all" : "custom");
                                    }}
                                    className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                                      isAllowed
                                        ? "border-emerald-200 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm"
                                        : "border-slate-100 bg-white hover:border-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`h-2 w-2 rounded-full ${isAllowed ? "bg-emerald-500" : "bg-slate-300"}`} />
                                      <span className={`text-[13px] font-bold ${isAllowed ? "text-emerald-900" : "text-slate-600"}`}>
                                        {criteria.name}
                                      </span>
                                    </div>
                                    <div className={`h-5 w-9 rounded-full transition-colors relative ${isAllowed ? "bg-emerald-500" : "bg-slate-200"}`}>
                                      <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all shadow-sm ${isAllowed ? "right-1" : "left-1"}`} />
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                        {(judgePermissionsError || judgePermissionsSuccess) && (
                          <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                            judgePermissionsError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {judgePermissionsError ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                            {judgePermissionsError ?? judgePermissionsSuccess}
                          </div>
                        )}

                        <button
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
                            let judgeIds =
                              selectedJudgeIdsForPermissions.length === 0
                                ? judgesForActiveEvent.map((judge) => judge.id)
                                : [...selectedJudgeIdsForPermissions];

                            judgeIds = judgeIds.filter((id) =>
                              judgesForActiveEvent.some((j) => j.id === id),
                            );

                            if (judgeIds.length === 0) {
                              setJudgePermissionsError("No valid judges for this event.");
                              setIsSavingJudgePermissions(false);
                              return;
                            }

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
                            const isAllCriteriaSelected =
                              judgePermissionsMode === "all" ||
                              (allCriteriaIdsForSave.length > 0 &&
                                allCriteriaIdsForSave.every((id) =>
                                  judgePermissionsCriteriaIds.includes(id),
                                ));

                            const scoringInserts: Omit<JudgeScoringPermissionRow, "created_at">[] = [];
                            if (isAllCriteriaSelected) {
                              judgeIds.forEach((jid) =>
                                scoringInserts.push({
                                  judge_id: jid,
                                  contest_id: selectedContestIdForPermissions,
                                  criteria_id: null,
                                  can_edit: true,
                                }),
                              );
                            } else {
                              judgeIds.forEach((jid) =>
                                scoringInserts.push({
                                  judge_id: jid,
                                  contest_id: selectedContestIdForPermissions,
                                  criteria_id: null,
                                  can_edit: false,
                                }),
                              );
                              judgePermissionsCriteriaIds.forEach((cid) =>
                                judgeIds.forEach((jid) =>
                                  scoringInserts.push({
                                    judge_id: jid,
                                    contest_id: selectedContestIdForPermissions,
                                    criteria_id: cid,
                                    can_edit: true,
                                  }),
                                ),
                              );
                            }

                            if (scoringInserts.length > 0) {
                              const { error } = await supabase
                                .from("judge_scoring_permission")
                                .insert(scoringInserts);
                              if (error) {
                                setJudgePermissionsError(error.message);
                                setIsSavingJudgePermissions(false);
                                return;
                              }
                            }

                            await supabase
                              .from("judge_division_permission")
                              .delete()
                              .in("judge_id", judgeIds)
                              .eq("contest_id", selectedContestIdForPermissions);
                            if (judgeDivisionMode === "custom" && judgeDivisionIds.length > 0) {
                              await supabase
                                .from("judge_division_permission")
                                .insert(
                                  judgeDivisionIds.flatMap((did) =>
                                    judgeIds.map((jid) => ({
                                      judge_id: jid,
                                      contest_id: selectedContestIdForPermissions,
                                      division_id: did,
                                    })),
                                  ),
                                );
                            }

                            await supabase
                              .from("judge_participant_permission")
                              .delete()
                              .in("judge_id", judgeIds)
                              .eq("contest_id", selectedContestIdForPermissions);
                            if (
                              judgeParticipantMode === "custom" &&
                              judgeParticipantIds.length > 0
                            ) {
                              await supabase
                                .from("judge_participant_permission")
                                .insert(
                                  judgeParticipantIds.flatMap((pid) =>
                                    judgeIds.map((jid) => ({
                                      judge_id: jid,
                                      contest_id: selectedContestIdForPermissions,
                                      participant_id: pid,
                                    })),
                                  ),
                                );
                            }

                            if (isAllCriteriaSelected || judgePermissionsCriteriaIds.length > 0) {
                              await supabase
                                .from("judge_contest_submission")
                                .delete()
                                .in("judge_id", judgeIds)
                                .eq("contest_id", selectedContestIdForPermissions);
                              setJudgeContestSubmissions((prev) =>
                                prev.filter(
                                  (s) =>
                                    !(
                                      judgeIds.includes(s.judge_id) &&
                                      s.contest_id === selectedContestIdForPermissions
                                    ),
                                ),
                              );
                            }

                            setJudgePermissionsSuccess("Permissions updated successfully.");
                            setIsSavingJudgePermissions(false);
                            setTimeout(() => setJudgePermissionsSuccess(null), 3000);
                          }}
                          disabled={isSavingJudgePermissions || selectedContestIdForPermissions === null}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[13px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSavingJudgePermissions ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                          Save Permissions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {monitorTab === "monitoring" && (
                <div className="space-y-6">
                  <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <label className="mb-2 block text-[13px] font-bold text-slate-700">Filter by Event</label>
                        <div className="relative max-w-md">
                          <select
                            value={participantsTabEventFilterId ?? ""}
                            onChange={(e) =>
                              setParticipantsTabEventFilterId(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">All Events</option>
                            {events.filter((e) => e.is_active).map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name} ({event.year})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(() => {
                      const effectiveEventId = participantsTabEventFilterId ?? activeEventId;
                      const rows: Array<{
                        contestName: string;
                        judgeName: string;
                        filled: number;
                        expected: number;
                      }> = [];
                      for (const contest of contestsForParticipantsTab) {
                        if (effectiveEventId !== null && contest.event_id !== effectiveEventId) continue;
                        const pIds = new Set(participants.filter(p => p.contest_id === contest.id).map(p => p.id));
                        const cIds = new Set(criteriaList.filter(c => c.contest_id === contest.id).map(c => c.id));
                        const expected = pIds.size * cIds.size;
                        if (expected === 0) continue;
                        const assignedJudgeIds = new Set(judgeAssignments.filter(ja => ja.contest_id === contest.id).map(ja => ja.judge_id));
                        for (const judge of judgesForActiveEvent) {
                          if (!assignedJudgeIds.has(judge.id)) continue;
                          const filled = scores.filter(s => s.judge_id === judge.id && pIds.has(s.participant_id) && cIds.has(s.criteria_id)).length;
                          rows.push({ contestName: contest.name, judgeName: judge.full_name, filled, expected });
                        }
                      }

                      if (rows.length === 0) {
                        return (
                          <div className="col-span-full rounded-[32px] border border-white/40 bg-white/80 p-12 text-center backdrop-blur-xl">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <svg className="mb-2 h-10 w-10 opacity-20 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                              <span className="text-sm font-medium">No live monitoring data available.</span>
                            </div>
                          </div>
                        );
                      }

                      return rows.map((row, idx) => {
                        const complete = row.filled >= row.expected;
                        const percent = Math.round((row.filled / row.expected) * 100);
                        return (
                          <div key={idx} className="group relative overflow-hidden rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                            <div className="mb-4 flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{row.contestName}</div>
                                <div className="text-[15px] font-bold text-slate-800">{row.judgeName}</div>
                              </div>
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${complete ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600 animate-pulse"}`}>
                                {complete ? (
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" /></svg>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">PROGRESS</span>
                                <span className={complete ? "text-emerald-600" : "text-slate-700"}>{percent}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full transition-all duration-1000 ease-out ${complete ? "bg-emerald-500" : "bg-emerald-500"}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                                <span>{row.filled} Filled</span>
                                <span>{row.expected} Expected</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {monitorTab === "message" && (
                <div className="space-y-6">
                  <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="space-y-2">
                      <div className="text-[15px] font-bold text-slate-800">
                        Send message to judges
                      </div>
                      <div className="text-[12px] font-medium text-slate-500">
                        Sends a realtime message that appears as a modal in the judge
                        dashboard.
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6 rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                          Event
                        </label>
                        <div className="relative">
                          <select
                            value={participantsTabEventFilterId ?? ""}
                            onChange={(e) =>
                              setParticipantsTabEventFilterId(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">Choose an event</option>
                            {events.filter((e) => e.is_active).map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name} ({event.year})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                          Recipient
                        </label>
                        <div className="relative">
                          <select
                            value={monitorMessageRecipientJudgeId ?? ""}
                            onChange={(e) =>
                              setMonitorMessageRecipientJudgeId(
                                e.target.value ? Number(e.target.value) : null,
                              )
                            }
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">All judges</option>
                            {judgesForActiveEvent.map((judge) => (
                              <option key={judge.id} value={judge.id}>
                                {judge.full_name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                          Title
                        </label>
                        <input
                          value={monitorMessageTitle}
                          onChange={(e) => setMonitorMessageTitle(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          placeholder="e.g. Announcement"
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                          Message
                        </label>
                        <textarea
                          value={monitorMessageBody}
                          onChange={(e) => setMonitorMessageBody(e.target.value)}
                          rows={6}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          placeholder="Type your message for judges…"
                        />
                      </div>

                      {(monitorMessageError || monitorMessageSuccess) && (
                        <div
                          className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                            monitorMessageError
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {monitorMessageError ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            )}
                          </svg>
                          {monitorMessageError ?? monitorMessageSuccess}
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          setMonitorMessageError(null);
                          setMonitorMessageSuccess(null);

                          const eventId =
                            participantsTabEventFilterId ?? activeEventId;
                          if (eventId === null) {
                            setMonitorMessageError("Please select an event.");
                            return;
                          }
                          if (!monitorMessageBody.trim()) {
                            setMonitorMessageError("Please type a message.");
                            return;
                          }

                          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                          const supabaseAnonKey =
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                          if (!supabaseUrl || !supabaseAnonKey) {
                            setMonitorMessageError("Supabase is not configured.");
                            return;
                          }

                          setIsSendingMonitorMessage(true);

                          const supabase = createClient(
                            supabaseUrl,
                            supabaseAnonKey,
                          );

                          const { error } = await supabase
                            .from("judge_message")
                            .insert({
                              event_id: eventId,
                              judge_id: monitorMessageRecipientJudgeId,
                              title: monitorMessageTitle.trim() || null,
                              body: monitorMessageBody.trim(),
                            });

                          setIsSendingMonitorMessage(false);

                          if (error) {
                            setMonitorMessageError(
                              error.message || "Unable to send message.",
                            );
                            return;
                          }

                          setMonitorMessageSuccess("Message sent.");
                          setMonitorMessageTitle("");
                          setMonitorMessageBody("");
                        }}
                        disabled={isSendingMonitorMessage}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[13px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSendingMonitorMessage ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10l9-6 9 6-9 6-9-6zm0 0v10l9 6 9-6V10"
                            />
                          </svg>
                        )}
                        {isSendingMonitorMessage ? "Sending…" : "Send message"}
                      </button>
                    </div>
                    <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                      <div className="text-[13px] font-bold text-slate-800">
                        Realtime behavior
                      </div>
                      <div className="mt-2 space-y-2 text-[12px] font-medium text-slate-500">
                        <div>
                          - Judges connected to the dashboard will immediately
                          receive the message.
                        </div>
                        <div>
                          - If you select a recipient, only that judge sees it.
                        </div>
                        <div>
                          - If you choose All judges, everyone in the event sees it.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">Add Team</h3>
                  <p className="text-[13px] font-medium text-slate-500">Create a team for an event.</p>
                </div>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700">Select Event *</label>
                  <div className="relative">
                    <select
                      value={selectedEventIdForTeam ?? ""}
                      onChange={(e) => setSelectedEventIdForTeam(e.target.value ? Number(e.target.value) : null)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value="">Choose an event</option>
                      {events.filter(e => e.is_active).map((event) => (
                        <option key={event.id} value={event.id}>{event.name} ({event.year})</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700">Team Name *</label>
                  <input
                    placeholder="e.g. Team Emerald"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {(categoryError || categorySuccess) && (
                  <div className={`rounded-2xl px-4 py-3 text-[13px] font-bold flex items-center gap-2 ${
                    categoryError ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {categoryError ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      )}
                    </svg>
                    {categoryError ?? categorySuccess}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 rounded-2xl border border-slate-200 py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    disabled={isSavingCategory}
                    className="flex-[1.5] rounded-2xl bg-slate-900 py-4 text-[14px] font-bold text-white shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
                  >
                    {isSavingCategory ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save Team"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {isParticipantModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-4xl scale-100 rounded-[40px] border border-white/40 bg-white/90 p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-in zoom-in-95 duration-300">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">Add Participant</h3>
                  <p className="text-[13px] font-medium text-slate-500">Register a contestant for a contest.</p>
                </div>
                <button 
                  onClick={() => setIsParticipantModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="px-6 py-4 text-[11px]">
                <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Select Event *</label>
                        <div className="relative">
                          <select
                            value={selectedEventIdForParticipant ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              setSelectedEventIdForParticipant(value ? Number(value) : null);
                              setSelectedContestIdForParticipant(null);
                            }}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">Choose event</option>
                            {events.filter((e) => e.is_active).map((event) => (
                              <option key={event.id} value={event.id}>{event.name} ({event.year})</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Select Contest *</label>
                        <div className="relative">
                          <select
                            value={selectedContestIdForParticipant ?? ""}
                            onChange={(event) => setSelectedContestIdForParticipant(event.target.value ? Number(event.target.value) : null)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">Choose contest</option>
                            {contests.filter((contest) => (selectedEventIdForParticipant ?? activeEventId) === null ? true : contest.event_id === (selectedEventIdForParticipant ?? activeEventId)).map((contest) => (
                              <option key={contest.id} value={contest.id}>{contest.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Select Division</label>
                        <div className="relative">
                          <select
                            value={selectedCategoryIdForParticipant ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              setSelectedCategoryIdForParticipant(value ? Number(value) : null);
                              setSelectedTeamIdForParticipant(null);
                            }}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">Choose division</option>
                            {categoriesForActiveEvent.map((division) => (
                              <option key={division.id} value={division.id}>{division.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Select Team</label>
                        <div className="relative">
                          <select
                            value={selectedTeamIdForParticipant ?? ""}
                            onChange={(event) => setSelectedTeamIdForParticipant(event.target.value ? Number(event.target.value) : null)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                          >
                            <option value="">Choose team</option>
                            {teamsForActiveEvent.map((team) => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Full Name *</label>
                      <input
                        placeholder="e.g. John Doe"
                        value={participantFullName}
                        onChange={(event) => setParticipantFullName(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">Contestant Number *</label>
                      <input
                        placeholder="e.g. 01"
                        value={participantNumber}
                        onChange={(event) => setParticipantNumber(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-slate-600">Card Image</div>
                      <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                        <div
                          className="flex w-full items-center justify-center overflow-hidden rounded-lg bg-[#E3F2EA] text-[11px] font-semibold text-[#1F4D3A] shadow-sm select-none"
                          style={{
                            aspectRatio: participantCardImageDims ? `${participantCardImageDims.w}/${participantCardImageDims.h}` : undefined,
                            touchAction: "none",
                            cursor: isDraggingCard ? "grabbing" : "grab",
                          }}
                          onMouseDown={(e) => { setIsDraggingCard(true); setLastCardPointer({ x: e.clientX, y: e.clientY }); }}
                          onMouseMove={(e) => {
                            if (!isDraggingCard || !lastCardPointer) return;
                            const dx = e.clientX - lastCardPointer.x;
                            const dy = e.clientY - lastCardPointer.y;
                            setParticipantCardOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                            setLastCardPointer({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseUp={() => { setIsDraggingCard(false); setLastCardPointer(null); }}
                          onMouseLeave={() => { setIsDraggingCard(false); setLastCardPointer(null); }}
                          onTouchStart={(e) => {
                            const t = e.touches[0];
                            setIsDraggingCard(true);
                            setLastCardPointer({ x: t.clientX, y: t.clientY });
                          }}
                          onTouchMove={(e) => {
                            if (!isDraggingCard || !lastCardPointer) return;
                            const t = e.touches[0];
                            const dx = t.clientX - lastCardPointer.x;
                            const dy = t.clientY - lastCardPointer.y;
                            setParticipantCardOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                            setLastCardPointer({ x: t.clientX, y: t.clientY });
                          }}
                          onTouchEnd={() => { setIsDraggingCard(false); setLastCardPointer(null); }}
                        >
                          {participantCardUrl ? (
                            <img
                              src={participantCardUrl}
                              alt="Card preview"
                              className="h-full w-full object-contain select-none"
                              style={{ transform: `translate(${participantCardOffset.x}px, ${participantCardOffset.y}px) scale(${participantCardZoom})` }}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                setParticipantCardImageDims({ w: img.naturalWidth, h: img.naturalHeight });
                                const t = parseTransform(participantCardUrl);
                                if (t.tz !== null) setParticipantCardZoom(t.tz);
                                const frameW = cardFrameRef.current?.offsetWidth ?? 0;
                                const frameH = cardFrameRef.current?.offsetHeight ?? 0;
                                if (frameW && frameH) {
                                  if (t.txp !== null && t.typ !== null) {
                                    setParticipantCardOffset({ x: t.txp * frameW, y: t.typ * frameH });
                                  } else if (t.tx !== null && t.ty !== null) {
                                    setParticipantCardOffset({ x: t.tx, y: t.ty });
                                  }
                                }
                              }}
                            />
                          ) : (
                            "Card Preview"
                          )}
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {participantCardImageDims ? (
                              <>
                                <button type="button" onClick={() => setParticipantCardZoom((p) => Math.max(1, Number((p - 0.1).toFixed(2))))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white">-</button>
                                <div className="text-left flex-1">
                                  <input type="range" min="1" max="3" step="0.05" value={participantCardZoom} onChange={(event) => setParticipantCardZoom(Number(event.target.value))} className="w-full" />
                                  <div className="text-[9px] text-slate-400 mt-1">{participantCardImageDims.w}x{participantCardImageDims.h}px</div>
                                </div>
                                <button type="button" onClick={() => setParticipantCardZoom((p) => Math.min(3, Number((p + 0.1).toFixed(2))))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white">+</button>
                              </>
                            ) : (
                              <div className="text-[10px] text-slate-500">Upload an image to enable zoom controls</div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingParticipantCard}
                            onChange={async (event) => {
                              let file = event.target.files?.[0];
                              if (!file) return;
                              const processImage = (file: File): Promise<Blob> =>
                                new Promise((resolve, reject) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const MAX_DIM = 1024;
                                    let w = img.width;
                                    let h = img.height;
                                    if (w > MAX_DIM || h > MAX_DIM) {
                                      const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
                                      w = w * ratio;
                                      h = h * ratio;
                                    }
                                    const canvas = document.createElement("canvas");
                                    canvas.width = w;
                                    canvas.height = h;
                                    const ctx = canvas.getContext("2d");
                                    if (!ctx) { reject(new Error("Cannot get canvas context")); return; }
                                    ctx.drawImage(img, 0, 0, w, h);
                                    canvas.toBlob(
                                      (blob) => { if (blob) resolve(blob); else reject(new Error("Blob creation failed")); },
                                      "image/jpeg", 0.8,
                                    );
                                  };
                                  img.onerror = reject;
                                  img.src = URL.createObjectURL(file);
                                });
                              try { file = (await processImage(file)) as File; } catch { /* fallback */ }
                              const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                              const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                              if (!cloudName || !uploadPreset) { setParticipantError("Cloudinary is not configured for uploads."); return; }
                              setParticipantError(null);
                              setIsUploadingParticipantCard(true);
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("upload_preset", uploadPreset);
                                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
                                if (!response.ok) { setParticipantError("Unable to upload card image."); setIsUploadingParticipantCard(false); return; }
                                const json = (await response.json()) as { secure_url?: string };
                                if (!json.secure_url) { setParticipantError("Upload did not return an image URL."); setIsUploadingParticipantCard(false); return; }
                                setParticipantCardUrl(json.secure_url);
                                setParticipantCardZoom(1);
                                setParticipantCardOffset({ x: 0, y: 0 });
                                setParticipantCardImageDims(null);
                              } catch { setParticipantError("Unexpected error while uploading card image."); } finally { setIsUploadingParticipantCard(false); }
                            }}
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[#1F4D3A] file:px-3 file:py-1 file:text-[10px] file:font-medium file:text-white hover:file:bg-[#163528] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                          />
                          {participantCardUrl && (
                            <div className="text-[10px] text-slate-500">Card image uploaded. Shown on the participant card.</div>
                          )}
                          {isUploadingParticipantCard && (
                            <div className="text-[10px] text-slate-500">Uploading card image...</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-slate-600">Avatar</div>
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                        <div
                          ref={avatarFrameRef}
                          className="flex w-full items-center justify-center overflow-hidden rounded-full bg-[#E3F2EA] text-[11px] font-semibold text-[#1F4D3A] shadow-sm select-none"
                          style={{
                            aspectRatio: "1 / 1",
                            touchAction: "none",
                            cursor: isDraggingAvatar ? "grabbing" : "grab",
                          }}
                          onMouseDown={(e) => { setIsDraggingAvatar(true); setLastAvatarPointer({ x: e.clientX, y: e.clientY }); }}
                          onMouseMove={(e) => {
                            if (!isDraggingAvatar || !lastAvatarPointer) return;
                            const dx = e.clientX - lastAvatarPointer.x;
                            const dy = e.clientY - lastAvatarPointer.y;
                            setParticipantAvatarOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                            setLastAvatarPointer({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseUp={() => { setIsDraggingAvatar(false); setLastAvatarPointer(null); }}
                          onMouseLeave={() => { setIsDraggingAvatar(false); setLastAvatarPointer(null); }}
                          onTouchStart={(e) => {
                            const t = e.touches[0];
                            setIsDraggingAvatar(true);
                            setLastAvatarPointer({ x: t.clientX, y: t.clientY });
                          }}
                          onTouchMove={(e) => {
                            if (!isDraggingAvatar || !lastAvatarPointer) return;
                            const t = e.touches[0];
                            const dx = t.clientX - lastAvatarPointer.x;
                            const dy = t.clientY - lastAvatarPointer.y;
                            setParticipantAvatarOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                            setLastAvatarPointer({ x: t.clientX, y: t.clientY });
                          }}
                          onTouchEnd={() => { setIsDraggingAvatar(false); setLastAvatarPointer(null); }}
                        >
                          {participantAvatarUrl ? (
                            <img
                              src={participantAvatarUrl}
                              alt={participantFullName || "Participant avatar preview"}
                              className="h-full w-full object-contain select-none"
                              style={{ transform: `translate(${participantAvatarOffset.x}px, ${participantAvatarOffset.y}px) scale(${participantAvatarZoom})` }}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                setParticipantAvatarImageDims({ w: img.naturalWidth, h: img.naturalHeight });
                                const t = parseTransform(participantAvatarUrl);
                                if (t.tz !== null) setParticipantAvatarZoom(t.tz);
                                const frameW = avatarFrameRef.current?.offsetWidth ?? 0;
                                const frameH = avatarFrameRef.current?.offsetHeight ?? 0;
                                if (frameW && frameH) {
                                  if (t.txp !== null && t.typ !== null) {
                                    setParticipantAvatarOffset({ x: t.txp * frameW, y: t.typ * frameH });
                                  } else if (t.tx !== null && t.ty !== null) {
                                    setParticipantAvatarOffset({ x: t.tx, y: t.ty });
                                  }
                                }
                              }}
                            />
                          ) : (
                            "Avatar"
                          )}
                        </div>
                        <div className="flex w-full flex-col gap-1 text-left">
                          <div className="flex items-center gap-2">
                            {participantAvatarImageDims ? (
                              <>
                                <button type="button" onClick={() => setParticipantAvatarZoom((p) => Math.max(1, Number((p - 0.1).toFixed(2))))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white">−</button>
                                <div className="text-left flex-1">
                                  <input type="range" min="1" max="3" step="0.05" value={participantAvatarZoom} onChange={(event) => setParticipantAvatarZoom(Number(event.target.value))} className="w-full" />
                                  <div className="text-[9px] text-slate-400 mt-1">{participantAvatarImageDims.w}x{participantAvatarImageDims.h}px</div>
                                </div>
                                <button type="button" onClick={() => setParticipantAvatarZoom((p) => Math.min(3, Number((p + 0.1).toFixed(2))))} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#CBD5E1] text-[11px] text-slate-600 hover:bg-white">+</button>
                              </>
                            ) : (
                              <div className="text-[10px] text-slate-500">Upload an image to enable zoom controls</div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingParticipantAvatar}
                            onChange={async (event) => {
                              let file = event.target.files?.[0];
                              if (!file) return;
                              const processImage = (file: File): Promise<Blob> =>
                                new Promise((resolve, reject) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const MAX_DIM = 1024;
                                    let w = img.width;
                                    let h = img.height;
                                    if (w > MAX_DIM || h > MAX_DIM) {
                                      const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
                                      w = w * ratio;
                                      h = h * ratio;
                                    }
                                    const canvas = document.createElement("canvas");
                                    canvas.width = w;
                                    canvas.height = h;
                                    const ctx = canvas.getContext("2d");
                                    if (!ctx) { reject(new Error("Cannot get canvas context")); return; }
                                    ctx.drawImage(img, 0, 0, w, h);
                                    canvas.toBlob(
                                      (blob) => { if (blob) resolve(blob); else reject(new Error("Blob creation failed")); },
                                      "image/jpeg", 0.8,
                                    );
                                  };
                                  img.onerror = reject;
                                  img.src = URL.createObjectURL(file);
                                });
                              try { file = (await processImage(file)) as File; } catch { /* fallback */ }
                              const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                              const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                              if (!cloudName || !uploadPreset) { setParticipantError("Cloudinary is not configured for uploads."); return; }
                              setParticipantError(null);
                              setIsUploadingParticipantAvatar(true);
                              try {
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("upload_preset", uploadPreset);
                                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
                                if (!response.ok) { setParticipantError("Unable to upload avatar."); setIsUploadingParticipantAvatar(false); return; }
                                const json = (await response.json()) as { secure_url?: string };
                                if (!json.secure_url) { setParticipantError("Upload did not return an image URL."); setIsUploadingParticipantAvatar(false); return; }
                                setParticipantAvatarUrl(json.secure_url);
                                setParticipantAvatarZoom(1);
                                setParticipantAvatarOffset({ x: 0, y: 0 });
                                setParticipantAvatarImageDims(null);
                              } catch { setParticipantError("Unexpected error while uploading avatar."); } finally { setIsUploadingParticipantAvatar(false); }
                            }}
                            className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[#1F4D3A] file:px-3 file:py-1 file:text-[10px] file:font-medium file:text-white hover:file:bg-[#163528] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                          />
                          {participantAvatarUrl && (
                            <div className="text-[10px] text-slate-500">Avatar uploaded. Shown in the scoring modal.</div>
                          )}
                          {isUploadingParticipantAvatar && (
                            <div className="text-[10px] text-slate-500">Uploading avatar…</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-slate-600">Gallery Photos</div>
                      <div className="flex flex-col gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                        {participantGalleryPhotos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {participantGalleryPhotos.map((url, idx) => (
                              <div key={idx} className="group relative">
                                <img src={url} alt={`Gallery ${idx + 1}`} className="h-20 w-full rounded-lg object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setParticipantGalleryPhotos((prev) => prev.filter((_, i) => i !== idx))}
                                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white opacity-0 shadow transition group-hover:opacity-100"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isUploadingParticipantGallery}
                          onChange={async (event) => {
                            const files = event.target.files;
                            if (!files || files.length === 0) return;
                            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                            if (!cloudName || !uploadPreset) { setParticipantError("Cloudinary is not configured for uploads."); return; }
                            setParticipantError(null);
                            setIsUploadingParticipantGallery(true);
                            const processImage = (file: File): Promise<Blob> =>
                              new Promise((resolve, reject) => {
                                const img = new Image();
                                img.onload = () => {
                                  const MAX_DIM = 1024;
                                  let w = img.width;
                                  let h = img.height;
                                  if (w > MAX_DIM || h > MAX_DIM) {
                                    const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
                                    w = w * ratio;
                                    h = h * ratio;
                                  }
                                  const canvas = document.createElement("canvas");
                                  canvas.width = w;
                                  canvas.height = h;
                                  const ctx = canvas.getContext("2d");
                                  if (!ctx) { reject(new Error("Cannot get canvas context")); return; }
                                  ctx.drawImage(img, 0, 0, w, h);
                                  canvas.toBlob(
                                    (blob) => { if (blob) resolve(blob); else reject(new Error("Blob creation failed")); },
                                    "image/jpeg", 0.8,
                                  );
                                };
                                img.onerror = reject;
                                img.src = URL.createObjectURL(file);
                              });
                            try {
                              const newUrls: string[] = [];
                              for (let i = 0; i < files.length; i++) {
                                let file: File | Blob = files[i];
                                try { file = await processImage(files[i]); } catch { /* fallback */ }
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("upload_preset", uploadPreset);
                                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
                                if (!response.ok) continue;
                                const json = (await response.json()) as { secure_url?: string };
                                if (json.secure_url) newUrls.push(json.secure_url);
                              }
                              if (newUrls.length > 0) {
                                setParticipantGalleryPhotos((prev) => [...prev, ...newUrls]);
                              } else {
                                setParticipantError("Unable to upload gallery photos.");
                              }
                            } catch { setParticipantError("Unexpected error while uploading gallery photos."); } finally { setIsUploadingParticipantGallery(false); }
                            event.target.value = "";
                          }}
                          className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-[#1F4D3A] file:px-3 file:py-1 file:text-[10px] file:font-medium file:text-white hover:file:bg-[#163528] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                        />
                        {participantGalleryPhotos.length > 0 && (
                          <div className="text-[10px] text-slate-500">{participantGalleryPhotos.length} photo(s) in gallery. Shown when avatar is clicked.</div>
                        )}
                        {isUploadingParticipantGallery && (
                          <div className="text-[10px] text-slate-500">Uploading gallery photos…</div>
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
                  disabled={isSavingParticipant || (selectedEventIdForParticipant ?? activeEventId) === null}
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
                    autoComplete="off"
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
                    autoComplete="new-password"
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
                    autoComplete="off"
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
            <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#1F4D3A1F] bg-white shadow-xl max-h-[calc(100vh-2rem)]">
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
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-4 text-[11px] md:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500">
                      Select Event *
                    </div>
                    <select
                      value={selectedEventIdForJudge ?? ""}
                      onChange={(e) =>
                        setSelectedEventIdForJudge(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                    >
                      <option value="">-- Choose an event --</option>
                      {events.filter((event) => event.is_active).map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} ({event.year})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500">Full name</div>
                    <input
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      placeholder="Full name"
                      value={judgeFullName}
                      onChange={(event) => setJudgeFullName(event.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500">Username</div>
                    <input
                      className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                      placeholder="Username"
                      value={judgeUsername}
                      onChange={(event) => setJudgeUsername(event.target.value)}
                      autoComplete="off"
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
                      autoComplete="new-password"
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
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Assigned contests
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsJudgeContestModalOpen(true)}
                        className="rounded-full border border-[#D0D7E2] bg-white px-2 py-0.5 text-[10px] font-medium text-[#1F4D3A] hover:bg-[#F1F5F9]"
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
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Avatar
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setJudgeAvatarUrl("");
                          setJudgeAvatarZoom(1);
                          setJudgeAvatarOffset({ x: 0, y: 0 });
                          setJudgeAvatarImageDims(null);
                        }}
                        className="rounded-full border border-[#D0D7E2] bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-[#F1F5F9]"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div
                        ref={judgeAvatarFrameRef}
                        className="h-44 w-44 overflow-hidden rounded-full border border-[#E2E8F0] bg-white shadow-sm select-none touch-none"
                        onMouseDown={(event) => {
                          if (!judgeAvatarUrl) return;
                          setIsDraggingJudgeAvatar(true);
                          setLastJudgeAvatarPointer({ x: event.clientX, y: event.clientY });
                        }}
                        onMouseMove={(event) => {
                          if (!isDraggingJudgeAvatar || !lastJudgeAvatarPointer) return;
                          const dx = event.clientX - lastJudgeAvatarPointer.x;
                          const dy = event.clientY - lastJudgeAvatarPointer.y;
                          setJudgeAvatarOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                          setLastJudgeAvatarPointer({ x: event.clientX, y: event.clientY });
                        }}
                        onMouseUp={() => {
                          setIsDraggingJudgeAvatar(false);
                          setLastJudgeAvatarPointer(null);
                        }}
                        onMouseLeave={() => {
                          setIsDraggingJudgeAvatar(false);
                          setLastJudgeAvatarPointer(null);
                        }}
                        onTouchStart={(event) => {
                          if (!judgeAvatarUrl) return;
                          const t = event.touches[0];
                          setIsDraggingJudgeAvatar(true);
                          setLastJudgeAvatarPointer({ x: t.clientX, y: t.clientY });
                        }}
                        onTouchMove={(event) => {
                          if (!isDraggingJudgeAvatar || !lastJudgeAvatarPointer) return;
                          const t = event.touches[0];
                          const dx = t.clientX - lastJudgeAvatarPointer.x;
                          const dy = t.clientY - lastJudgeAvatarPointer.y;
                          setJudgeAvatarOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                          setLastJudgeAvatarPointer({ x: t.clientX, y: t.clientY });
                        }}
                        onTouchEnd={() => {
                          setIsDraggingJudgeAvatar(false);
                          setLastJudgeAvatarPointer(null);
                        }}
                      >
                        {judgeAvatarUrl ? (
                          <img
                            src={judgeAvatarUrl}
                            alt={judgeFullName || "Judge avatar preview"}
                            className="h-full w-full object-contain select-none"
                            style={{
                              transform: `translate(${judgeAvatarOffset.x}px, ${judgeAvatarOffset.y}px) scale(${judgeAvatarZoom})`,
                            }}
                            onLoad={(event) => {
                              const img = event.target as HTMLImageElement;
                              setJudgeAvatarImageDims({ w: img.naturalWidth, h: img.naturalHeight });
                              const t = parseTransform(judgeAvatarUrl);
                              if (t.tz !== null) setJudgeAvatarZoom(t.tz);
                              const frameW = judgeAvatarFrameRef.current?.offsetWidth ?? 0;
                              const frameH = judgeAvatarFrameRef.current?.offsetHeight ?? 0;
                              if (frameW && frameH) {
                                if (t.txp !== null && t.typ !== null) {
                                  setJudgeAvatarOffset({ x: t.txp * frameW, y: t.typ * frameH });
                                } else if (t.tx !== null && t.ty !== null) {
                                  setJudgeAvatarOffset({ x: t.tx, y: t.ty });
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-slate-400">
                            No avatar
                          </div>
                        )}
                      </div>

                      <div className="w-full max-w-sm space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <span>Zoom</span>
                          <span className="normal-case font-medium text-slate-600">
                            {Math.round(judgeAvatarZoom * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => setJudgeAvatarZoom((p) => Math.min(3, Number((p + 0.1).toFixed(2))))}
                            disabled={!judgeAvatarImageDims}
                            className={"flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[14px] font-semibold text-slate-700 shadow-sm hover:bg-[#F8FAFC] " + (!judgeAvatarImageDims ? "opacity-50 cursor-not-allowed" : "")}
                          >
                            +
                          </button>
                          <div className="flex h-10 flex-1 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[11px] font-semibold text-slate-600">
                            {Math.round(judgeAvatarZoom * 100)}%
                          </div>
                          <button
                            type="button"
                            onClick={() => setJudgeAvatarZoom((p) => Math.max(1, Number((p - 0.1).toFixed(2))))}
                            disabled={!judgeAvatarImageDims}
                            className={"flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[14px] font-semibold text-slate-700 shadow-sm hover:bg-[#F8FAFC] " + (!judgeAvatarImageDims ? "opacity-50 cursor-not-allowed" : "")}
                          >
                            −
                          </button>
                        </div>

                        <label className={"mx-auto block w-full max-w-[220px] cursor-pointer rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-center text-[11px] font-medium text-slate-700 shadow-sm hover:bg-[#F8FAFC] " + (isUploadingJudgeAvatar ? "opacity-70 cursor-not-allowed" : "")}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingJudgeAvatar}
                            onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setJudgeError(null);

                                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                                if (!cloudName || !uploadPreset) {
                                  setJudgeError("Cloudinary is not configured.");
                                  return;
                                }

                                setIsUploadingJudgeAvatar(true);

                                const processImage = async (imageFile: File, maxDim: number) => {
                                  const objectUrl = URL.createObjectURL(imageFile);
                                  const img = new Image();
                                  img.src = objectUrl;
                                  await new Promise((resolve, reject) => {
                                    img.onload = resolve;
                                    img.onerror = reject;
                                  });

                                  const srcW = img.width;
                                  const srcH = img.height;
                                  const minSide = Math.min(srcW, srcH);
                                  const cropX = (srcW - minSide) / 2;
                                  const cropY = (srcH - minSide) / 2;
                                  const targetDim = Math.min(maxDim, minSide);

                                  const canvas = document.createElement("canvas");
                                  canvas.width = targetDim;
                                  canvas.height = targetDim;
                                  const ctx = canvas.getContext("2d");
                                  if (!ctx) {
                                    URL.revokeObjectURL(objectUrl);
                                    throw new Error("Unable to process image");
                                  }

                                  ctx.drawImage(img, cropX, cropY, minSide, minSide, 0, 0, targetDim, targetDim);

                                  const blob: Blob = await new Promise((resolve) =>
                                    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9),
                                  );

                                  URL.revokeObjectURL(objectUrl);

                                  return new File([blob], imageFile.name.replace(/\.\w+$/, ".jpg"), {
                                    type: "image/jpeg",
                                  });
                                };

                                try {
                                  const processed = await processImage(file, 1200);

                                  const formData = new FormData();
                                  formData.append("file", processed);
                                  formData.append("upload_preset", uploadPreset);

                                  const response = await fetch(
                                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                                    {
                                      method: "POST",
                                      body: formData,
                                    },
                                  );

                                  const data = await response.json();
                                  if (!response.ok) {
                                    throw new Error(data?.error?.message || "Upload failed");
                                  }

                                  setJudgeAvatarUrl(data.secure_url);
                                  setJudgeAvatarZoom(1);
                                  setJudgeAvatarOffset({ x: 0, y: 0 });
                                } catch (err) {
                                  setJudgeError(
                                    err instanceof Error ? err.message : "Unable to upload avatar.",
                                  );
                                } finally {
                                  setIsUploadingJudgeAvatar(false);
                                  event.target.value = "";
                                }
                              }}
                          />
                          {isUploadingJudgeAvatar ? "Uploading..." : "Upload avatar"}
                        </label>

                        <div className="text-[10px] text-center text-slate-400">
                          Drag photo to position.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(judgeError || judgeSuccess) && (
                  <div
                    className={`md:col-span-2 text-[10px] ${
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
                  disabled={isSavingJudge || selectedEventIdForJudge === null}
                  className={`rounded-full bg-[#1F4D3A] px-4 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-[#163528] ${
                    isSavingJudge || selectedEventIdForJudge === null
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
                    Select Event *
                  </div>
                  <select
                    value={selectedEventIdForTabulator ?? ""}
                    onChange={(e) =>
                      setSelectedEventIdForTabulator(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full rounded-xl border border-[#D0D7E2] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A26]"
                  >
                    <option value="">-- Choose an event --</option>
                    {events.filter((event) => event.is_active).map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} ({event.year})
                      </option>
                    ))}
                  </select>
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
                    autoComplete="off"
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
                    autoComplete="off"
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
                    autoComplete="new-password"
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Sub-tab Navigation & Global Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1.5 backdrop-blur-sm">
                {[
                  { id: "admin", label: "Administrators", icon: "ShieldCheck" },
                  { id: "judge", label: "Judges", icon: "Gavel" },
                  { id: "tabulator", label: "Tabulators", icon: "Calculator" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUserTab(tab.id as UserSubTab)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
                      userTab === tab.id
                        ? "bg-white text-emerald-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {(userTab === "judge" || userTab === "tabulator") && (
                  <div className="relative">
                    <select
                      value={userTabEventFilterId ?? ""}
                      onChange={(e) => setUserTabEventFilterId(e.target.value ? Number(e.target.value) : null)}
                      className="appearance-none rounded-2xl border border-slate-200 bg-white px-10 py-2.5 text-[13px] font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
                    >
                      <option value="">All Events</option>
                      {events.filter(e => e.is_active).map((event) => (
                        <option key={event.id} value={event.id}>{event.name} ({event.year})</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (userTab === "admin") requireAdminGuard({ type: "create" });
                    else if (userTab === "judge") openCreateJudgeModal();
                    else openCreateTabulatorModal();
                  }}
                  className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_12px_25px_-4px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add {userTab.charAt(0).toUpperCase() + userTab.slice(1)}
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6">
              {/* Search Header */}
              <div className="rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder={`Search ${userTab}s by name or username...`}
                    value={userTab === "admin" ? adminSearch : userTab === "judge" ? judgeSearch : tabulatorSearch}
                    onChange={(e) => {
                      if (userTab === "admin") setAdminSearch(e.target.value);
                      else if (userTab === "judge") setJudgeSearch(e.target.value);
                      else setTabulatorSearch(e.target.value);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-11 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-hidden rounded-[32px] border border-white/40 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-8 py-4">User Details</th>
                        <th className="px-8 py-4">{userTab === "admin" ? "Role" : "Event Assignment"}</th>
                        {userTab === "judge" && <th className="px-8 py-4">Assigned Contests</th>}
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userTab === "admin" && (
                        filteredAdmins.length === 0 ? (
                          <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-400">No administrators found.</td></tr>
                        ) : (
                          filteredAdmins.map((admin) => (
                            <tr key={admin.id} className="group transition-colors hover:bg-slate-50/50">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[13px] font-bold text-slate-700">{admin.username.charAt(0).toUpperCase()}</div>
                                  <div className="text-[13px] font-bold text-slate-800">{admin.username}</div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/10">Administrator</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => requireAdminGuard({ type: "edit", adminId: admin.id })} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                  <button onClick={() => requireAdminGuard({ type: "delete", adminId: admin.id })} disabled={isDeletingAdminId === admin.id} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                                    {isDeletingAdminId === admin.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )
                      )}

                      {userTab === "judge" && (
                        filteredJudges.length === 0 ? (
                          <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400">No judges found.</td></tr>
                        ) : (
                          filteredJudges.map((judge) => {
                            const event = events.find(e => e.id === judge.event_id);
                            const contestsAssigned = judgeAssignments.filter(ja => ja.judge_id === judge.id).map(ja => contests.find(c => c.id === ja.contest_id)?.name).filter(Boolean);
                            return (
                              <tr key={judge.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[13px] font-bold text-emerald-700 ring-1 ring-emerald-600/10">{judge.full_name.charAt(0)}</div>
                                    <div>
                                      <div className="text-[13px] font-bold text-slate-800">{judge.full_name}</div>
                                      <div className="text-[11px] font-medium text-slate-400">@{judge.username}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-inset ring-slate-200">{event?.name ?? "No Event"}</span>
                                </td>
                                <td className="px-8 py-5">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {contestsAssigned.length > 0 ? contestsAssigned.map((c, i) => (
                                      <span key={i} className="text-[10px] font-bold bg-white border border-slate-100 px-1.5 py-0.5 rounded-md text-slate-500 shadow-sm">{c}</span>
                                    )) : <span className="text-[11px] italic text-slate-400">No assignments</span>}
                                  </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => openEditJudgeModal(judge)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDeleteJudge(judge.id)} disabled={isDeletingJudgeId === judge.id} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                                      {isDeletingJudgeId === judge.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}

                      {userTab === "tabulator" && (
                        filteredTabulators.length === 0 ? (
                          <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400">No tabulators found.</td></tr>
                        ) : (
                          filteredTabulators.map((tabulator) => {
                            const event = events.find(e => e.id === tabulator.event_id);
                            return (
                              <tr key={tabulator.id} className="group transition-colors hover:bg-slate-50/50">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[13px] font-bold text-blue-700 ring-1 ring-blue-600/10">{tabulator.full_name.charAt(0)}</div>
                                    <div>
                                      <div className="text-[13px] font-bold text-slate-800">{tabulator.full_name}</div>
                                      <div className="text-[11px] font-medium text-slate-400">@{tabulator.username}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-inset ring-slate-200">{event?.name ?? "No Event"}</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => openEditTabulatorModal(tabulator)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-emerald-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDeleteTabulator(tabulator.id)} disabled={isDeletingTabulatorId === tabulator.id} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                                      {isDeletingTabulatorId === tabulator.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
