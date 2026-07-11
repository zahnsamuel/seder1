-- Lets a signed-in learner erase their own learning data (account deletion / export flow).
-- review_items, placement_results, and daily_sessions already have "for all" policies from
-- 001, which cover delete. attempts, learner_state, and profiles were select/insert/update
-- only, so a learner could not previously remove their own rows.
create policy "learner deletes own attempts" on public.attempts for delete using (auth.uid() = user_id);
create policy "learner deletes own state" on public.learner_state for delete using (auth.uid() = user_id);
create policy "learner deletes own profile" on public.profiles for delete using (auth.uid() = id);
