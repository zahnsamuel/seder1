-- Source-context evidence lets mastery reflect transfer across distinct passages.
alter table public.learner_state add column if not exists evidence jsonb not null default '{}'::jsonb;
