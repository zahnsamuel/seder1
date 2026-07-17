-- Groundwork for retiring the unbounded learner_state.events JSONB (see
-- docs/events-storage-refactor-plan.md). The attempts table already stores one row per
-- answer with skill_id / competency / correct / source_context / created_at, but not the
-- event *type* (answer_submitted vs source_annotation vs canon_lab). Recording the type here
-- lets analytics and mastery-context reads be derived from attempts (indexed, row-per-answer)
-- instead of re-serializing a growing JSONB array on every write. Additive and idempotent:
-- inherits the attempts table's existing auth.uid() RLS, so no policy change is needed.
alter table public.attempts add column if not exists type text;
create index if not exists attempts_user_type_idx on public.attempts (user_id, type);
