# Assignment for Codex — 2026-07-12

From Claude, coordinated with Sam. Context: the agreed product vision is a mastery-based
path into Jewish learning with Gemara at the center and a genuinely unified canon around it.
Claude is currently building "second foundation" units for the thin non-Gemara subjects
(Halakha, Chumash, Tefillah) and will then fix the History/Wider World dead-end links.
The items below are the highest-value complements to that work, in priority order.

## 1. Supabase completion (highest value — blocks the pilot)

Local mode silently shares one `demo` learner record between all visitors
(`Seder.currentLearnerId()` in `seder-auth.js` falls back to `'demo'`). No real pilot can
launch until hosted mode works. Sam was blocked by a Supabase site error on 2026-07-12;
when it resolves:

- Run migrations 001–005 in order (`005_learning_artifacts.sql` was missing from the
  README list at one point — it is required; the ordered list in `supabase/README.md` is
  now correct).
- Then run the 8-step account-isolation runbook in `supabase/README.md`
  ("Account isolation verification" section): two real test accounts, cross-account REST
  reads/writes, expect empty-array/rejected results on every cross-account attempt.
- Launch checklist is in `docs/pilot-readiness.md` — note the "Critical: do not share a
  local-mode link with real pilot participants" section.

## 2. Finish the tractate-mastery migration

`tractate-mastery.js` lists 10 tractates, but only shabbat and pesachim have their arc
`nextUrl` actually routed through the new mastery loop. The other 8 (eruvin, sukkah,
bava-metzia, bava-kamma, berakhot, ketubot, chullin, niddah — Claude added the last three
to the `arcs`/`caps` maps with verified skill IDs) still point at the old flow.
Half-migrated is the worst state: two navigation models coexist. Either finish the cutover
or revert to one model. Claude deliberately did not change any existing `nextUrl` to avoid
stepping on this system, which is yours.

## 3. Commit the analytics server code

`server.mjs` (route `GET /api/admin/analytics`, plus removal of 3 dead curriculum routes)
and `data/repository.mjs` (`listLearnersFull`) have working, tested changes sitting
uncommitted in the tree because they are entangled with your concurrent diff in those same
files. The exact code and rationale are documented verbatim in `docs/qa-intake.md`
(entry: local-mode analytics route). Please fold them into your next commit touching those
files. The frontend (`analytics.html/js/css`) is already committed and functional.

## 4. Decide the next-step topology (one decision, with Sam)

Completion links currently follow three different shapes:
- Halakha/Chumash/Tefillah arcs → funnel into Berakhot (hub model, Gemara-centered)
- Mussar/Chassidus → chain into each other and Jewish Thought (mesh model)
- History/Wider World → `canon-arc.html?track=...`, which re-teaches the same
  Jeremiah 29:7 material they just completed (dead-end; Claude is replacing these with
  real second units)

Pick one intentional shape — hub, mesh, or hub-with-lateral-links — and Claude will make
every completion link consistent with it. One sentence in this file or qa-intake.md is
enough.

## Claude's concurrent work (avoid collisions)

Claude is creating these new files (do not create files with these names):
- `halakha-honor-parents.js` / `.html`
- `chumash-akeidah.js` / `.html`
- `tefillah-kaddish.js` / `.html`
- plus one-line completion-copy link edits inside `halakha-arc.js`, `chumash-arc.js`,
  `tefillah-arc.js`, and later real continuations for `history-arc.js` /
  `widerworld-arc.js` nextUrls.
