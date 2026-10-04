-- SQL Script to wipe all participant, team, and volunteer data, while keeping the Admin intact.
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Delete all Teams
-- Note: Because team_members, evaluations, and notifications have foreign keys referencing the teams table 
-- with ON DELETE CASCADE (or we delete them directly), deleting teams will wipe related records.
DELETE FROM public.teams;

-- Just to be absolutely thorough and clean up any orphaned records:
DELETE FROM public.team_members;
DELETE FROM public.evaluations;
DELETE FROM public.notifications;

-- 2. Delete all Volunteers
DELETE FROM public.volunteers;

-- 3. Delete all Users from Authentication EXCEPT the Admin
-- IMPORTANT: Replace 'YOUR_ADMIN_EMAIL@example.com' with your actual admin email address before running this!
DELETE FROM auth.users WHERE email != 'YOUR_ADMIN_EMAIL@example.com';

-- Note: Deleting from auth.users will automatically cascade and delete their corresponding rows in the public.profiles table.

 
