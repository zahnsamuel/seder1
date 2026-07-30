# Seder production cutover

> **This document is the Supabase cutover path.** The default pilot now runs on SQLite hosted mode —
> see **[sqlite-pilot.md](sqlite-pilot.md)** — which needs none of the steps below. Follow this only
> if you deliberately choose Postgres/Supabase over SQLite.

1. Run all Supabase migrations through `004_delete_own_data.sql`.
2. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the host environment.
3. Enable magic-link authentication and set production and localhost redirect URLs.
4. Confirm RLS isolation with two test learner accounts.
5. Complete a source annotation and confirm source-context evidence persists after reload.
6. Deploy with HTTPS, set privacy/support contacts, and test account deletion/export procedures.
7. Start a small private pilot using `docs/pilot-observation-sheet.md`.
