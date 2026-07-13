-- Durable learner journey markers: course moves, capstones, canon bridges, and unseen-source encounters.
-- Kept as a private JSONB document because these are learner-facing progress markers, not public curriculum data.
alter table public.learner_state add column if not exists artifacts jsonb not null default '{}'::jsonb;
