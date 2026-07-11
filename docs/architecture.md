# Seder architecture

Seder is a source-first mastery-learning program, not a generic chat application. No build step: vanilla JS/HTML/CSS served by a single Node `http` server (`server.mjs`).

## Product layers

1. Curriculum catalog: subjects, skills, prerequisite graphs, reviewed content, and source references.
2. Learner model: attempts, mastery estimates, decayed mastery, XP, competencies, evidence/context tracking, review queue, goal, and unlocked stages.
3. Learning experience: course rooms (`course-engine.js`), visible primary text, translation help, multiple-choice and typed-recall practice, feedback, decay-aware review, and a mastery dashboard.
4. Curriculum boundary: source selection and instructional review remain internal to Seder; learners receive only the fixed, curated curriculum. Every legal-study track carries an explicit "this is learning, not psak" boundary, most visibly in Halakha and Shabbat.

## Data layer (`data/`)

- `seder-catalog.json` — canonical subject and Gemara-stage catalog.
- `gemara-tractates.json` — the full Bavli curriculum graph: every tractate has a seder, entry requirements, a recommended stage, and a first practice field. A tractate may additionally carry `labId` (a single-Mishnah practice lab) and/or `arcUrl` (a full multi-step course arc); `shas-map-v2.js` prefers `arcUrl` when present so a built arc is never orphaned behind just a lab link. Served through `GET /api/gemara/tractates`.
- `tractate-labs.json` — reviewed, source-first single-Mishnah practice sequences, one per tractate, served through `GET /api/labs/:id`. Currently covers Shabbat, Eruvin, Pesachim, Bava Metzia, Sukkah, Ketubot, Bava Kamma, Chullin, and Niddah.
- `tractate-course-sequences.json` / `non_gemara_sequences.json` / `exercise-bank.json` — roadmap and cross-context review-bank planning files describing the intended shape of not-yet-built or in-progress tractate/subject arcs (entry unit, language bank, source-map sequence, retrieval set, independent checkpoint) and shared skill-transfer contexts. Treat these as the build spec before adding a new arc.
- `mastery-decay.mjs` — models forgetting with a 21-day half-life and a 0.12 minimum retention floor; `freshnessOf()` classifies a skill as fresh (≥.85 of raw mastery), fading (≥.5), faded, or none.
- `repository.mjs` — persists learner records and learning events (local JSON by default). `recordLearnerEvent` is the single place mastery, XP, competencies, evidence, and the review queue update together for `answer_submitted` / `source_annotation` events; `decayingSkills()` flags established skills (raw ≥ .67) that have quietly faded even though nothing is formally due yet.

## Mastery mechanics

- **Decay-aware review queue**: incorrect answers are immediately eligible for retrieval review; correct answers below .85 mastery get a durability review spaced by attempt count (0h → 24h → 72h → 168h → 336h); a skill is removed from the formal queue once it reaches .67, but is re-flagged by `decayingSkills()` if it later fades below "fresh."
- **Multi-context evidence / transfer bonus**: `learner.evidence[skillId]` tracks the distinct `sourceContext` values a skill has been correctly answered in (e.g. a course lesson plus a tractate lab). A second distinct context adds a +.08 mastery bonus and doubles the spacing on the next durability review; the Mastery page (`mastery.js`) surfaces this as "confirmed across N sources."
- **Two exercise types**: standard multiple-choice, and typed free-response recall (`typed:true`, matched against an `acceptable` list) so recognition and production are both exercised. Both are driven by the same `course-engine.js` runtime and `window.SederCourse` step config used by every lesson page.
- **Review-variant bank**: `review.js`'s `variantBank` maps a skill id to 2-3 differently-worded review questions (often reusing already-reviewed text from a different tractate as a transfer exercise), so a learner revisiting a missed or decayed skill never sees the exact screen they missed. `bankKeyFor()` does an exact-or-substring match; any newly introduced skill id needs a bank entry or it silently falls back to whatever partial match exists.
- **Placement and goals**: `placement.js` seeds real starting mastery across Gemara, Chumash, Halakha, and Jewish Thought (8 checks, all keyed to real course skill ids) and rolls scores into the four competencies (`recognition`, `translation`, `argument`, `sourceReasoning`) that gate `recommendFor()`. `goals.html`/`goals.js` let a learner state prayer / thought / canon / Gemara as a goal, which `recommendFor()` uses as an early short-circuit ahead of the default competency funnel.

## Testing

`test/*.test.mjs` (run via `npm test` / `node --test`) covers the decay math and the full `recordLearnerEvent` behavior: mastery gain/cap, review scheduling, the evidence/transfer bonus (single, double, and repeated context), placement seeding and non-regression, and decay detection.

## Production replacements

Local JSON storage remains the anonymous/demo development mode. With `SUPABASE_URL` and `SUPABASE_ANON_KEY` configured, Seder offers passwordless email sign-in and writes signed-in learners' attempts, mastery state, XP, reviews, placement, evidence, and stage completion to authenticated Supabase tables protected by row-level security. The event schema and catalog identifiers remain stable across both modes; see `docs/production-cutover.md` for the switch-over steps.

## Curriculum model

Seder owns the curriculum and its source selection. Content is developed and updated as part of the product itself, not contributed through the learner experience. Learners encounter a coherent, carefully sequenced path rather than an open teaching marketplace. `docs/gemara-canon-strategy.md` and `docs/learning-expansion-sequence.md` describe how new tractates and subjects get prioritized; `docs/content-quality-standard.md` sets the bar new material has to meet (source fidelity, no fabricated citations, explicit study-vs-psak boundary where relevant).
