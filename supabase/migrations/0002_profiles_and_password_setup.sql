create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  password_set_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their profile" on public.profiles;
create policy "Users can create their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
