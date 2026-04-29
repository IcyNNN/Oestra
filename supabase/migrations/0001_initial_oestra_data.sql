create extension if not exists "pgcrypto";

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Oestra conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hormone_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_year integer check (birth_year between 1900 and extract(year from now())::integer),
  typical_cycle_length_days integer check (typical_cycle_length_days between 15 and 60),
  typical_period_length_days integer check (typical_period_length_days between 1 and 14),
  goals text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date,
  flow_intensity text check (flow_intensity in ('light', 'medium', 'heavy')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end is null or period_end >= period_start)
);

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  symptom text not null,
  severity integer check (severity between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_id_created_at_idx
  on public.chat_sessions(user_id, created_at desc);

create index if not exists chat_messages_session_id_created_at_idx
  on public.chat_messages(session_id, created_at asc);

create index if not exists cycle_logs_user_id_period_start_idx
  on public.cycle_logs(user_id, period_start desc);

create index if not exists symptom_logs_user_id_logged_on_idx
  on public.symptom_logs(user_id, logged_on desc);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.hormone_profiles enable row level security;
alter table public.cycle_logs enable row level security;
alter table public.symptom_logs enable row level security;

create policy "Users can read their chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their chat sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their chat sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their chat messages"
  on public.chat_messages for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their sessions"
  on public.chat_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can read their hormone profile"
  on public.hormone_profiles for select
  using (auth.uid() = user_id);

create policy "Users can upsert their hormone profile"
  on public.hormone_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their hormone profile"
  on public.hormone_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their cycle logs"
  on public.cycle_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their cycle logs"
  on public.cycle_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their cycle logs"
  on public.cycle_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their symptom logs"
  on public.symptom_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their symptom logs"
  on public.symptom_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their symptom logs"
  on public.symptom_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
