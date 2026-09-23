-- Add check-in metadata tracking to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS check_in_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS checked_in_by text;
