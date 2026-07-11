# Supabase migration for Seder

## What these migrations protect

`001_learner_mastery.sql` creates private learner tables for profiles, aggregate mastery state, answer attempts, review items, placement results, and daily sessions. Every learner table has row-level security enabled and policies tied to `auth.uid()`. `002_learner_state_insert_policy.sql` backfills the insert policy for projects provisioned before it was folded into 001 (safe no-op on fresh installs). `003_source_evidence.sql` adds the `evidence` column that `learner_state` needs for the multi-context transfer-mastery bonus — required for the app to run; without it, recording a second-source-context answer fails. `004_delete_own_data.sql` adds the delete policies a learner needs to erase their own data (`attempts`, `learner_state`, `profiles` were previously select/insert/update only).

## Setup

1. Create a Supabase project in the intended production region.
2. Configure email confirmation and the chosen sign-in methods in Supabase Auth.
3. Run `migrations/001_learner_mastery.sql`, then `002_learner_state_insert_policy.sql`, then `003_source_evidence.sql`, then `004_delete_own_data.sql`, in that order, using the SQL editor or Supabase CLI.
4. Add the project URL and anon key to the deployment environment as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Keep the service-role key server-only.
5. In Auth > URL Configuration, add the production app URL and `http://127.0.0.1:4180` during local development. Enable email magic-link sign-in.
6. Verify in the Supabase policy tester that one account cannot read another account's rows.

## Account deletion boundary

`DELETE /api/learners/:id` (hosted mode) erases every row of a learner's data — profile, mastery state, attempts, reviews, placement, sessions — using the learner's own access token, scoped by the RLS policies above. It does **not** delete the `auth.users` row itself (the sign-in identity/email), because that requires Supabase's admin API and a service-role key, which this server intentionally never holds server-side (see `data/supabase-adapter.mjs`). A learner who wants their sign-in credential fully removed needs that done through Supabase directly (dashboard, admin API from a trusted context, or a support request) — reflect this honestly in any privacy copy or deletion-confirmation UI rather than promising full account erasure.

## Local data migration

The current local profiles use non-UUID identifiers and are not authenticated accounts. Do not copy them blindly into production. Existing learners should create a real account; any desired local-progress import must explicitly map each local identifier to that authenticated user's Supabase UUID and run server-side only.

## Production cutover criteria

- HTTPS on the app domain
- Email verification enabled
- RLS policy tests pass
- Service-role key stored only in the server/deployment secret store
- Database backups and deletion/export process documented
- Privacy and minor-account policy reviewed
- `GET /api/health` reports `persistence: "supabase-ready"`
- A signed-in learner completes a placement, reloads, and sees the same XP, mastery, and review record
