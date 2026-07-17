# Supabase migration for Seder

## What these migrations protect

`001_learner_mastery.sql` creates private learner tables for profiles, aggregate mastery state, answer attempts, review items, placement results, and daily sessions. Every learner table has row-level security enabled and policies tied to `auth.uid()`. `002_learner_state_insert_policy.sql` backfills the insert policy for projects provisioned before it was folded into 001 (safe no-op on fresh installs). `003_source_evidence.sql` adds the `evidence` column that `learner_state` needs for the multi-context transfer-mastery bonus — required for the app to run; without it, recording a second-source-context answer fails. `004_delete_own_data.sql` adds the delete policies a learner needs to erase their own data (`attempts`, `learner_state`, `profiles` were previously select/insert/update only). `005_learning_artifacts.sql` adds the `artifacts` column `learner_state` needs for durable journey markers (course moves, capstones, canon bridges, unseen-source encounters) — required for the app to run; without it, recording a `journey_artifact_saved` event fails. `006_hosted_learning_parity.sql` adds the `mastery_updated_at`, `struggles`, `events`, `total_answered`, `daily_streak`, and `last_study_date` columns that `learner_state` needs so hosted learners get the same adaptive recommendations, streaks, and decay handling as local ones — **required for the app to run**; the hosted state upsert in `data/supabase-learner-repository.mjs` writes all six on every event, so without it every hosted write fails.

## Setup

1. Create a Supabase project in the intended production region.
2. Configure email confirmation and the chosen sign-in methods in Supabase Auth.
3. Run `migrations/001_learner_mastery.sql`, then `002_learner_state_insert_policy.sql`, then `003_source_evidence.sql`, then `004_delete_own_data.sql`, then `005_learning_artifacts.sql`, then `006_hosted_learning_parity.sql`, in that order, using the SQL editor or Supabase CLI. Run each migration exactly once on a fresh project (001's `create policy`/`create table` statements are not written to be idempotent on re-run; 002 is the one intentionally re-runnable backfill). `007_attempt_event_type.sql` is safe additive groundwork for a planned refactor (see `docs/events-storage-refactor-plan.md`); it does no harm to run now and the app runs with or without it — the current app does not yet read the new column.
4. Add the project URL and anon key to the deployment environment as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Keep the service-role key server-only.
5. In Auth > URL Configuration, add the production app URL and `http://127.0.0.1:4180` during local development. Enable email magic-link sign-in.
6. Verify account isolation before any real learner data is at risk — see "Account isolation verification" below.

## Account isolation verification

When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured, Seder's learner API requires a
valid Supabase bearer token. The shared local/demo learner is deliberately available only in
local-development mode; hosted deployments do not fall back to it for unsigned requests.

Code-review summary (2026-07-12): the isolation model has three independent layers, so a single missed check anywhere doesn't leak data.

1. **`data/supabase-adapter.mjs`** never holds or uses a service-role key. Every REST call (`supabaseRest`) authenticates as `apikey: <anon key>` + `Authorization: Bearer <the signed-in learner's own access token>` — never a server-side admin credential.
2. **`server.mjs`'s `learnerAccess`** verifies the bearer token against Supabase's real `/auth/v1/user` endpoint (`verifySupabaseAccessToken`) and throws if a URL-supplied learner ID doesn't match the token's actual verified user ID.
3. **`data/supabase-learner-repository.mjs`** never trusts a client-supplied ID for the Supabase queries themselves — `getHostedLearner`/`recordHostedEvent`/`deleteHostedLearnerData` all derive `id = user.id` from the verified token, not from the request URL.
4. **Postgres RLS** (all 6 tables, `001_learner_mastery.sql` + `004_delete_own_data.sql`) enforces `auth.uid() = user_id` at the database layer regardless of what the application code does — this is the backstop if layers 1–3 ever regress.

This is a sound design on paper, but **it has not been exercised against a live Supabase project** — no `SUPABASE_URL`/`SUPABASE_ANON_KEY` are configured in this environment, so this could not be verified end-to-end. Before real learner data is at risk, run this against your actual project:

1. Create two real test accounts (magic-link sign-in with two throwaway email addresses works). Sign in as each once so `handle_new_user()` provisions their `profiles`/`learner_state` rows.
2. Get each account's access token: sign in through the app, then in the browser console run `(await window.supabase.auth.getSession()).data.session.access_token` (or pull it from Supabase Auth's session storage). Call the two tokens `TOKEN_A` and `TOKEN_B`, and the two user UUIDs `UUID_A`/`UUID_B` (visible in Supabase Auth > Users, or in `(await getSession()).data.session.user.id`).
3. As learner A, do something that creates data — complete a placement question or a tractate-lab step — so `attempts`/`learner_state` rows exist for `UUID_A`.
4. From a terminal, attempt to read learner A's data using learner B's token:
   ```
   curl -s "$SUPABASE_URL/rest/v1/learner_state?user_id=eq.$UUID_A&select=*" \
     -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN_B"
   ```
   Expected: `[]` (empty array), not learner A's row. RLS should filter it out silently rather than erroring.
5. Repeat step 4 against `attempts`, `profiles`, `review_items`, `placement_results`, and `daily_sessions`.
6. Attempt a cross-account write: try to `POST`/`PATCH` a `learner_state` row with `user_id` set to `UUID_A` while authenticated as `TOKEN_B`. Expected: rejected (RLS `with check` clause fails).
7. Through the running app itself (not raw REST), sign in as learner B and call `GET /api/learners/UUID_A` with B's session. Expected: a 400/error from the `learnerAccess` check ("You can only access your own learner record"), confirming the app-layer guard also holds, independent of RLS.
8. Only once all of the above come back empty/rejected, mark "RLS policy tests pass" in the cutover checklist below as actually verified, not just present in migration files.

**Automated runner.** Steps 3–7 are scripted in `scripts/verify-account-isolation.mjs`. Do steps 1–2 manually (create the two accounts, create some data for A, grab both access tokens and UUIDs), then run the script once with those values in the environment — it checks every table for read leaks, attempts a cross-account write, optionally exercises the app-layer guard, and exits non-zero if anything leaks. It also preflights that each token really belongs to its claimed UUID, so an expired or swapped token can't produce a vacuous pass.

```
# PowerShell (one line): set the six vars, then run
$env:SUPABASE_URL="https://xxxx.supabase.co"; $env:SUPABASE_ANON_KEY="<anon>"; $env:TOKEN_A="<a>"; $env:TOKEN_B="<b>"; $env:UUID_A="<a-uuid>"; $env:UUID_B="<b-uuid>"; node scripts/verify-account-isolation.mjs
# add $env:APP_URL="http://127.0.0.1:4180" to also run step 7 against the live app
```

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
