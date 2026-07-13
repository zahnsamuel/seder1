-- Keeps hosted learners capable of the same adaptive recommendations and source-evidence gates as local learners.
alter table public.learner_state add column if not exists mastery_updated_at jsonb not null default '{}'::jsonb;
alter table public.learner_state add column if not exists struggles jsonb not null default '{}'::jsonb;
alter table public.learner_state add column if not exists events jsonb not null default '[]'::jsonb;
alter table public.learner_state add column if not exists total_answered integer not null default 0;
alter table public.learner_state add column if not exists daily_streak integer not null default 0;
alter table public.learner_state add column if not exists last_study_date date;
