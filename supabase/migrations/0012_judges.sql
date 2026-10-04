-- Create judges table
create table public.judges (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null unique,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for judges
alter table public.judges enable row level security;
create policy "Judges are viewable by everyone" on public.judges for select using (true);
create policy "Judges are insertable by everyone" on public.judges for insert with check (true);
create policy "Judges are updatable by everyone" on public.judges for update using (true);
create policy "Judges are deletable by everyone" on public.judges for delete using (true);

-- Create judge assignments table (many-to-many relationship)
create table public.judge_assignments (
    id uuid default gen_random_uuid() primary key,
    judge_id uuid references public.judges(id) on delete cascade,
    team_id uuid references public.teams(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(judge_id, team_id)
);

-- Enable RLS for judge assignments
alter table public.judge_assignments enable row level security;
create policy "Judge assignments are viewable by everyone" on public.judge_assignments for select using (true);
create policy "Judge assignments are insertable by everyone" on public.judge_assignments for insert with check (true);
create policy "Judge assignments are deletable by everyone" on public.judge_assignments for delete using (true);

-- Update evaluations table to track which judge graded
alter table public.evaluations add column if not exists judge_id uuid references public.judges(id) on delete set null;
