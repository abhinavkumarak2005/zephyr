ALTER TABLE public.global_settings 
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'auto';
