-- Add evaluation_enabled column to judges table
alter table public.judges add column if not exists evaluation_enabled boolean default false not null;

-- Ensure evaluations table can store selected_status for this specific judge
alter table public.evaluations add column if not exists selected_status boolean;

-- Enable judges to update evaluations
drop policy if exists "Evaluations are insertable by everyone" on public.evaluations;
create policy "Evaluations are insertable by everyone" on public.evaluations for insert with check (true);

drop policy if exists "Evaluations are updatable by everyone" on public.evaluations;
create policy "Evaluations are updatable by everyone" on public.evaluations for update using (true);
