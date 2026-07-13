# Supabase cutover checklist

The application code already supports Supabase magic-link authentication and hosted learner persistence. It is currently in local-development mode because `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not present in the running server environment.

Before external pilot:

1. Apply every migration in `supabase/migrations/` to the intended Supabase project.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the deployment environment; never put service-role credentials in the app.
3. Configure the production and local redirect URLs in Supabase Auth.
4. Test magic-link sign-in, a new learner record, answer persistence, review scheduling, note saving, export, and deletion with two separate accounts.
5. Confirm `/api/health` reports `persistence: "supabase-ready"`.

This cutover cannot be completed from the repository alone: it requires the project URL/key and permission to apply the migrations in the user-owned Supabase project.
