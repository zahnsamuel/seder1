# Retiring the unbounded `learner_state.events` JSONB

## Problem

`recordHostedEvent` / `recordLearnerEvent` append every event to `learner.events`, and the
hosted `putState` rewrites the entire JSONB array on every write. Growth is unbounded (one entry
per answer) and each write is O(n) in a learner's history. **Severity is low at pilot scale**
(a few hundred KB in one row after thousands of answers), so this is a post-pilot cleanup, not a
launch blocker.

## Why there is no safe local-only fix

`events` is the source of truth for two different jobs, which is why a cap or dedup is unsafe:

- **Analytics (needs full, per-event history):** `server.mjs`
  - `/insights` (`:370`) — attempt count, correct count, accuracy.
  - `/pilot-analytics` (`:380`) — attempts, correct, per-skill misses, `Repair:`/`Independent encounter:`
    detection by `sourceContext` prefix, capstone count (`type==='source_annotation' && sourceContext~'capstone'`), last-activity timestamp.
  - `/admin/analytics` (`:406`, local-only) — cross-learner attempt/correct totals.
- **Mastery gating (needs specific subsets):** `data/curriculum-engine.mjs` `canMasterJourneyStage`
  - `:118` / `:135` — set of correct `sourceContext`s (`answer_submitted`/`source_annotation`[/`canon_lab` at :135]).
  - `:120` — an `academy-source-maps` `journey_artifact_saved` event **with its `note` text** (length ≥ 28).

A FIFO cap or dedup would undercount analytics and could age out a still-incomplete stage's
mastery evidence. So the fix must move these reads onto durable, indexed storage.

## Done (safe, additive, shipped)

- **Migration `007_attempt_event_type.sql`** — adds `attempts.type` (+ `(user_id, type)` index).
  The `attempts` table already has one row per answer with `skill_id`/`competency`/`correct`/
  `source_context`/`created_at`; `type` was the only missing field needed to derive all the
  analytics above from it. Inherits the table's `auth.uid()` RLS; additive and idempotent.
- **`supabase-learner-repository.mjs`** now writes `type` on every attempts row.
  Guarded by `test/supabase-attempt-type.test.mjs`. No reads changed yet, so behavior is identical.

## Remaining (needs a live Supabase project to verify — do at/after cutover)

1. **Move hosted analytics reads to `attempts`.** Rewrite `/insights`, `/pilot-analytics`,
   `/admin/analytics` to query `attempts` (count / filter by `type`, `correct`, `source_context`
   prefix; `max(created_at)` for last activity) instead of `learner.events`. With `007` in place
   every field above is available. `/admin/analytics` stays local-only (hosted RLS blocks
   cross-learner reads without a service-role key — by design).
2. **Move mastery-context reads to `attempts`.** In `canMasterJourneyStage`, derive the
   correct-`sourceContext` sets (`:118`/`:135`) from `attempts` (or from the already-bounded
   `learner.evidence` map, which accumulates exactly the correct contexts per skill — confirm the
   `canon_lab` inclusion difference between `:118` and `evidence` before switching).
3. **Give the academy weekly-map note a durable home (`:120`).** This is the one datum not in
   `attempts` (it is a `journey_artifact_saved` note, and those events do not create attempt
   rows). Options: add a `note` to the `artifacts` store, or a small `academy_source_maps` table.
   Until this is migrated, keep `journey_artifact_saved` events in `events`.
4. **Stop writing high-volume answer events to the `events` JSONB** once 1–3 read from `attempts`
   / `evidence` / the note store. Keep only low-volume, not-yet-migrated types if any remain.
5. **Local mode** (`repository.mjs`, one `learners.json`, no `attempts` table) is dev/demo only —
   either leave its `events` as-is or add a bounded local attempts list; not pilot-critical.

## Verification (required before shipping 1–5)

Run against a live project (the isolation-test flow already sets one up): sign in, answer several
questions, and confirm `/insights` + `/pilot-analytics` still report identical attempt/correct/
accuracy/capstone/streak numbers, and that stage mastery still gates correctly
(`test/academy-mastery-gate.test.mjs` covers the logic; re-run end to end against real data).
Do not ship 1–5 blind — this is the same hosted path that carried two silent ship-blockers.
