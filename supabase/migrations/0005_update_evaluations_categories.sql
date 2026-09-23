-- 0005_update_evaluations_categories.sql
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS ps_fit INT CHECK (ps_fit BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS ai_depth INT CHECK (ai_depth BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS tech_impl INT CHECK (tech_impl BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS innovation INT CHECK (innovation BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS impact INT CHECK (impact BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS business INT CHECK (business BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS presentation INT CHECK (presentation BETWEEN 1 AND 10);
