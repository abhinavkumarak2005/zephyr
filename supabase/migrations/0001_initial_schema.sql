-- 0001_initial_schema.sql

-- 1. profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. teams table
CREATE TABLE public.teams (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id                TEXT UNIQUE NOT NULL,  -- e.g., MS-2026-0001
  team_name              TEXT NOT NULL,
  problem_statement_id   INT,
  college                TEXT NOT NULL,
  department             TEXT,
  payment_status         TEXT DEFAULT 'pending'
                         CHECK (payment_status IN ('pending', 'pending_verification', 'paid', 'rejected')),
  payment_utr_number     TEXT,                  -- 12-digit UTR ID
  registration_confirmed BOOLEAN DEFAULT FALSE,
  current_round          INT DEFAULT 0,
  is_eliminated          BOOLEAN DEFAULT FALSE,
  presentation_link      TEXT,                  -- Phase 2 update: Drive link for PPT
  project_link           TEXT,                  -- Phase 2 update: Drive link for Project
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 3. team_members table
CREATE TABLE public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  college     TEXT NOT NULL,
  department  TEXT,
  year        TEXT,           
  is_leader   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. problem_statements table
CREATE TABLE public.problem_statements (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  domain      TEXT,
  is_active   BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.teams ADD CONSTRAINT fk_ps FOREIGN KEY (problem_statement_id) REFERENCES public.problem_statements(id);

-- 5. rounds table
CREATE TABLE public.rounds (
  id                 SERIAL PRIMARY KEY,
  round_number       INT NOT NULL,
  name               TEXT NOT NULL,
  description        TEXT,
  start_time         TIMESTAMPTZ,
  end_time           TIMESTAMPTZ,
  is_active          BOOLEAN DEFAULT FALSE,
  is_completed       BOOLEAN DEFAULT FALSE,
  results_published  BOOLEAN DEFAULT FALSE
);

-- 6. evaluations table (Phase 2 update: Grade first, then mark)
CREATE TABLE public.evaluations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id               UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  round_number          INT NOT NULL,
  
  grade                 TEXT CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  total_score           INT, -- Validate range in backend based on grade
  
  remarks               TEXT,
  is_selected           BOOLEAN DEFAULT FALSE,
  is_published          BOOLEAN DEFAULT FALSE,
  evaluated_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (team_id, round_number)
);

-- 7. admin_users table
CREATE TABLE public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'judge' CHECK (role IN ('superadmin', 'judge')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 8. notifications table
CREATE TABLE public.notifications (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID REFERENCES public.teams(id),
  type      TEXT,
  email_to  TEXT,
  subject   TEXT,
  status    TEXT DEFAULT 'sent',
  sent_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 2 Update: Triggers for enforcing min 2, max 4 members
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
DECLARE
  member_count INT;
BEGIN
  SELECT count(*) INTO member_count FROM public.team_members WHERE team_id = NEW.team_id;
  
  IF TG_OP = 'INSERT' THEN
    IF member_count >= 4 THEN
      RAISE EXCEPTION 'A team can have a maximum of 4 members.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_members
BEFORE INSERT ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION check_team_size();
