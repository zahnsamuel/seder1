# Seder pilot readiness gate

Before inviting the first learner cohort, confirm:

- Supabase migrations 001–005 are applied and `/api/health` reports `supabase-ready`.
- Two test accounts can sign in, answer, return on another device, see the same course/bridge progress, export data, and delete data. This checks persistence, not isolation — it does not by itself confirm account A cannot read account B's data.
- Account isolation is verified live, not just present in migration files: run the 8-step cross-account read/write runbook in `supabase/README.md`'s "Account isolation verification" section against the real project before any real learner data is at risk. (Code review 2026-07-12 confirmed a sound three-layer isolation design — anon-key-only server, app-layer ID check, RLS backstop on all 6 tables — but this environment has no live Supabase credentials to actually exercise it.)
- The source audit matrix has been completed for every encounter exposed in the pilot path.
- Mobile testing includes 320px-wide screens, browser zoom at 200%, keyboard-only navigation, and Hebrew/RTL text.
- Pilot analytics reports routine accuracy, independent-source accuracy, capstones submitted, repairs attempted, and due reviews.

## Critical: do not share a local-mode link with real pilot participants

Found while preparing for launch (2026-07-12): `Seder.currentLearnerId()` (`seder-auth.js`) falls back to a **shared `'demo'` account** for any visitor who is not signed in via Supabase and has not explicitly created a local profile via `profile.html`. `seder.html`'s header has no link to `profile.html` or `sign-in.html`, so a brand-new visitor lands directly on the homepage and silently starts using — and overwriting — the same `demo` learner record as everyone else who has ever done the same thing (this is exactly the account this whole session's testing has been running against).

This is fine for solo local development. It is **not safe** for multiple real people: if two pilot participants both open a local-mode link without first creating a distinct profile, they will see and corrupt each other's progress with no warning. **The real pilot must run in hosted (Supabase) mode**, where each participant signs in with their own email and gets a properly isolated account (verified separately — see the isolation runbook above). Do not send a bare local-mode URL to real participants as a shortcut before Supabase is live.

## Launch sequence, once Supabase is ready

1. Run the 8-step account-isolation runbook (`supabase/README.md`) against the real project. Do not skip this even under time pressure — it is the one thing in this checklist that has not been empirically verified anywhere in this codebase's history.
2. Confirm `/api/health` reports `persistence: "supabase-ready"` and a real test account can sign in, answer a question, and see it persist on reload.
3. Send real participants a link that requires sign-in (not a bare local-mode session) — e.g. `sign-in.html`, not `seder.html` with an unauthenticated first visit.
4. Content is not a blocker: as of 2026-07-12, all 37 Bavli tractates have real content (9 full multi-step arcs, 28 opening-Mishnah labs), plus 4 new foundational/narrative units (Gemara reading-signals toolkit, 13 Middot, daf-page literacy, the Oven of Akhnai aggada) and cross-tractate/Shas-literacy capstones.
5. After the pilot has run for a few days, check `/analytics.html` (local-mode only — see its own note about why this specific page cannot read hosted-mode data; a separate admin-side query against the live Supabase project is needed for real pilot-scale aggregate numbers) or the per-learner `pilot-analytics` data Codex's `learner-dashboard.js` already surfaces to each participant.

The first cohort should remain small (5–10 independent learners for 30 days). Success means learners return, repair uncertainty, and can orient to an unfamiliar source—not merely that they finish screens.
