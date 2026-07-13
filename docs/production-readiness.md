# Seder production readiness

## Complete in the application

- Secure learner-state model and RLS-first Supabase migrations are prepared through `006_hosted_learning_parity.sql`.
- The hosted repository retains mastery, source evidence, review queue, adaptive struggles, learner events, study artifacts, streak, and answer totals.
- Magic-link sign-in, export, and learner-data deletion routes are implemented without a service-role key in the app.
- The learner-facing Study Record surfaces locally and will read the same durable artifacts once hosted persistence is enabled.

## Required external cutover actions

1. Run migrations `001` through `006` in the Supabase SQL editor, in order.
2. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the server environment only.
3. Add the local and production URLs to Supabase Authentication redirect settings.
4. Test two separate accounts: sign in, answer a source question, save a Daf map explanation, confirm a scheduled review, export data, and delete learner data.
5. Deploy behind HTTPS and set the final production URL.

## Release gate

Do not call the hosted cutover complete until `/api/health` reports `supabase-ready` and the two-account acceptance check passes. The Supabase dashboard migration step requires project-owner action; never place a service-role key in Seder code or browser assets.
