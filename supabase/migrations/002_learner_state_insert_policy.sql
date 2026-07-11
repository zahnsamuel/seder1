-- Backfills the insert policy for projects provisioned before it was folded into 001.
-- Idempotent: 001 now creates this same policy inline, so this is a no-op on fresh installs.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'learner_state' and policyname = 'learner inserts own state'
  ) then
    create policy "learner inserts own state" on public.learner_state
    for insert with check (auth.uid() = user_id);
  end if;
end $$;
