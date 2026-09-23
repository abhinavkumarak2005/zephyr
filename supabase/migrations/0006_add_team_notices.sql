-- 0006_add_team_notices.sql
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS admin_notice TEXT;
