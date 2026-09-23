-- 0007_mega_update.sql

-- 1. Add new columns to the teams table for Phase 1 conditionals and Round 3 check-in
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS conditional_selection_reason TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS check_in_status BOOLEAN DEFAULT FALSE;

-- 2. Create a table for Global Settings (for Broadcast Notifications)
CREATE TABLE IF NOT EXISTS public.global_settings (
  id INT PRIMARY KEY DEFAULT 1,
  broadcast_notice TEXT
);

-- Initialize the global settings row if it doesn't exist
INSERT INTO public.global_settings (id, broadcast_notice) 
VALUES (1, '') 
ON CONFLICT (id) DO NOTHING;

-- 3. Atomic Sequence for Team ID generation to prevent concurrent race conditions
CREATE SEQUENCE IF NOT EXISTS team_id_seq START 1;

CREATE OR REPLACE FUNCTION generate_team_id() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL OR NEW.team_id = '' THEN
    NEW.team_id := 'MS-2026-' || LPAD(nextval('team_id_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to prevent duplicates on re-runs
DROP TRIGGER IF EXISTS trigger_generate_team_id ON public.teams;

CREATE TRIGGER trigger_generate_team_id
BEFORE INSERT ON public.teams
FOR EACH ROW EXECUTE FUNCTION generate_team_id();
