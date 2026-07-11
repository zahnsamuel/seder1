-- Seder production learner model. Run in the Supabase SQL editor or with the Supabase CLI.
-- Learner data is private: every table below is protected by auth.uid()-based RLS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learner_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  mastery jsonb not null default '{}'::jsonb,
  competencies jsonb not null default jsonb_build_object('recognition', 0, 'translation', 0, 'argument', 0, 'sourceReasoning', 0),
  completed_stages text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id text not null,
  competency text not null check (competency in ('recognition', 'translation', 'argument', 'sourceReasoning')),
  correct boolean not null,
  source_context text,
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_created_idx on public.attempts (user_id, created_at desc);
create index if not exists attempts_user_skill_idx on public.attempts (user_id, skill_id);

create table if not exists public.review_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id text not null,
  due_at timestamptz not null,
  attempts integer not null default 1 check (attempts > 0),
  reason text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);
create index if not exists review_items_due_idx on public.review_items (user_id, due_at);

create table if not exists public.placement_results (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  scores jsonb not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.daily_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null default current_date,
  plan jsonb not null,
  started_at timestamptz,
  completed_at timestamptz,
  unique (user_id, session_date)
);

alter table public.profiles enable row level security;
alter table public.learner_state enable row level security;
alter table public.attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.placement_results enable row level security;
alter table public.daily_sessions enable row level security;

create policy "learner reads own profile" on public.profiles for select using (auth.uid() = id);
create policy "learner updates own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "learner reads own state" on public.learner_state for select using (auth.uid() = user_id);
create policy "learner inserts own state" on public.learner_state for insert with check (auth.uid() = user_id);
create policy "learner updates own state" on public.learner_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learner reads own attempts" on public.attempts for select using (auth.uid() = user_id);
create policy "learner inserts own attempts" on public.attempts for insert with check (auth.uid() = user_id);
create policy "learner reads own review" on public.review_items for select using (auth.uid() = user_id);
create policy "learner updates own review" on public.review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learner reads own placement" on public.placement_results for select using (auth.uid() = user_id);
create policy "learner updates own placement" on public.placement_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learner reads own sessions" on public.daily_sessions for select using (auth.uid() = user_id);
create policy "learner updates own sessions" on public.daily_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Signup trigger: creates the sole profile/state pair for an authenticated user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, 'Learner'), '@', 1)));
  insert into public.learner_state (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
