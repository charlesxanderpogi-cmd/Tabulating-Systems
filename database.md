-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.award (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  contest_id bigint,
  name text NOT NULL,
  description text,
  award_type text NOT NULL CHECK (award_type = ANY (ARRAY['criteria'::text, 'special'::text])),
  criteria_id bigint,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  criteria_ids ARRAY,
  CONSTRAINT award_pkey PRIMARY KEY (id),
  CONSTRAINT award_event_fkey FOREIGN KEY (event_id) REFERENCES public.event(id),
  CONSTRAINT award_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id),
  CONSTRAINT award_criteria_fkey FOREIGN KEY (criteria_id) REFERENCES public.criteria(id)
);
CREATE TABLE public.award_recipient (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  award_id bigint NOT NULL,
  participant_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT award_recipient_pkey PRIMARY KEY (id),
  CONSTRAINT award_recipient_award_fkey FOREIGN KEY (award_id) REFERENCES public.award(id),
  CONSTRAINT award_recipient_participant_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id)
);
CREATE TABLE public.contest (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contest_code text,
  scoring_type text NOT NULL DEFAULT 'percentage'::text,
  CONSTRAINT contest_pkey PRIMARY KEY (id),
  CONSTRAINT contest_event_fkey FOREIGN KEY (event_id) REFERENCES public.event(id)
);
CREATE TABLE public.contest_layout (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id bigint NOT NULL UNIQUE,
  layout_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contest_layout_pkey PRIMARY KEY (id),
  CONSTRAINT contest_layout_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.criteria (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id bigint NOT NULL,
  name text NOT NULL,
  percentage numeric NOT NULL CHECK (percentage > 0::numeric AND percentage <= 100::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  criteria_code text,
  category text,
  CONSTRAINT criteria_pkey PRIMARY KEY (id),
  CONSTRAINT criteria_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.criteria_category (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id bigint NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT criteria_category_pkey PRIMARY KEY (id),
  CONSTRAINT criteria_category_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.division (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT division_pkey PRIMARY KEY (id),
  CONSTRAINT division_event_fkey FOREIGN KEY (event_id) REFERENCES public.event(id)
);
CREATE TABLE public.event (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  year integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean,
  CONSTRAINT event_pkey PRIMARY KEY (id)
);
CREATE TABLE public.judge_assignment (
  judge_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_assignment_pkey PRIMARY KEY (judge_id, contest_id),
  CONSTRAINT judge_assignment_judge_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_assignment_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.judge_contest_submission (
  judge_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_contest_submission_pkey PRIMARY KEY (judge_id, contest_id),
  CONSTRAINT judge_contest_submission_judge_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_contest_submission_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.judge_division_permission (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  judge_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  division_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_division_permission_pkey PRIMARY KEY (id),
  CONSTRAINT judge_division_permission_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_division_permission_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id),
  CONSTRAINT judge_division_permission_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division(id)
);
CREATE TABLE public.judge_participant_permission (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  judge_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  participant_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_participant_permission_pkey PRIMARY KEY (id),
  CONSTRAINT judge_participant_permission_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_participant_permission_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id),
  CONSTRAINT judge_participant_permission_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id)
);
CREATE TABLE public.judge_participant_total (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  judge_id bigint NOT NULL,
  participant_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  total_score numeric NOT NULL CHECK (total_score >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_participant_total_pkey PRIMARY KEY (id),
  CONSTRAINT judge_participant_total_judge_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_participant_total_participant_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id),
  CONSTRAINT judge_participant_total_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.judge_scoring_permission (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  judge_id bigint NOT NULL,
  contest_id bigint NOT NULL,
  criteria_id bigint,
  can_edit boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT judge_scoring_permission_pkey PRIMARY KEY (id),
  CONSTRAINT judge_scoring_permission_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT judge_scoring_permission_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id),
  CONSTRAINT judge_scoring_permission_criteria_id_fkey FOREIGN KEY (criteria_id) REFERENCES public.criteria(id)
);
CREATE TABLE public.layout_template (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  layout_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT layout_template_pkey PRIMARY KEY (id)
);
CREATE TABLE public.participant (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  contest_id bigint NOT NULL,
  division_id bigint NOT NULL,
  full_name text NOT NULL,
  contestant_number text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_url text,
  gender text,
  team_id bigint,
  CONSTRAINT participant_pkey PRIMARY KEY (id),
  CONSTRAINT participant_division_fkey FOREIGN KEY (division_id) REFERENCES public.division(id),
  CONSTRAINT participant_team_fkey FOREIGN KEY (team_id) REFERENCES public.team(id),
  CONSTRAINT participant_contest_fkey FOREIGN KEY (contest_id) REFERENCES public.contest(id)
);
CREATE TABLE public.score (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  judge_id bigint NOT NULL,
  participant_id bigint NOT NULL,
  criteria_id bigint NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT score_pkey PRIMARY KEY (id),
  CONSTRAINT score_participant_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id),
  CONSTRAINT score_judge_fkey FOREIGN KEY (judge_id) REFERENCES public.user_judge(id),
  CONSTRAINT score_criteria_fkey FOREIGN KEY (criteria_id) REFERENCES public.criteria(id)
);
CREATE TABLE public.team (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  division_id bigint,
  CONSTRAINT team_pkey PRIMARY KEY (id),
  CONSTRAINT team_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(id),
  CONSTRAINT team_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division(id)
);
CREATE TABLE public.user_admin (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_admin_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_judge (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  role text NOT NULL DEFAULT 'judge'::text CHECK (role = ANY (ARRAY['judge'::text, 'chairman'::text])),
  CONSTRAINT user_judge_pkey PRIMARY KEY (id),
  CONSTRAINT judge_event_fkey FOREIGN KEY (event_id) REFERENCES public.event(id)
);
CREATE TABLE public.user_tabulator (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_tabulator_pkey PRIMARY KEY (id),
  CONSTRAINT tabulator_event_fkey FOREIGN KEY (event_id) REFERENCES public.event(id)
);