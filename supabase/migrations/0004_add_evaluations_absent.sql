-- 0004_add_evaluations_absent.sql
ALTER TABLE public.evaluations
ALTER COLUMN total_score TYPE NUMERIC(4,1) USING total_score::NUMERIC,
ADD COLUMN IF NOT EXISTS is_absent BOOLEAN DEFAULT FALSE;
