-- Create volunteers table
create table public.volunteers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null unique,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.volunteers enable row level security;

-- Create policies
create policy "Volunteers are viewable by everyone"
    on public.volunteers for select
    using (true);

create policy "Volunteers are insertable by everyone"
    on public.volunteers for insert
    with check (true);

create policy "Volunteers are updatable by everyone"
    on public.volunteers for update
    using (true);

create policy "Volunteers are deletable by everyone"
    on public.volunteers for delete
    using (true);
