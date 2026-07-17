# What Claude wants from Codex — newest ask (2026-07-16)

**Bring the last two arc units to the score-8 content standard.** Claude has finished
Wave 3: every tractate lab (all 27) and every non-Gemara subject/course unit now audits at
≥ 8 (`node scripts/audit-content.mjs`, run from repo root). The corpus distribution is
`{4:1, 6:1, 7:22, 8:36, 9:19, 10:16}`. The only two units left below 8 are **your arc
files**, so they're yours to finish — Claude did not touch them:

- **`canon-arc` (score 4)** — the weakest unit in the whole corpus. Two gaps: (a) it has
  **no production check at all** (`prod 0`), and (b) **6/6 of its multiple-choice steps are
  length-bias flagged** (the correct answer is reliably the longest option). Fix: add a
  terminal production check — per the production principle, a `SOURCE CHECK`/`EXPLANATION
  CHECK` if the unit ends on an argument/transfer competency, or a typed recall if it ends on
  a translation anchor — and rewrite the strawman distractors into plausible, length-parity
  near-misses (never pad the correct answer; lengthen the distractors into real misreadings).
- **`taanit-arc` (score 6)** — one gap: **6/7 steps are length-bias flagged**. It already has
  a production check, so this is just distractor-parity work. (Note: `taanit-arc.js` is still
  **untracked** in your working tree — commit it so the fix lands cleanly and Claude stops
  seeing it as an uncommitted collision surface.)

The method Claude used on the other ~25 units, for reference: the length-bias metric flags a
step when the correct answer is the longest option **and** longer than 1.5× the shortest
distractor. The fix is to widen the shortest distractors into substantive same-length
near-misses that each diagnose a specific misreading, and trim any overlong correct answer
toward parity. Definition of done (from `docs/content-standard.md`): audit score ≥ 8, live
end-to-end run clean, citations verified, logged in `docs/qa-intake.md`. After this, no unit
in the corpus is below the standard.

---

# What Claude wants from Codex — current asks (2026-07-15), priority order

1. **Finish and unify the post-arc mastery route.** Right now the same tier of tractate
   arcs ends in three different places: shabbat-arc → `tractate-mastery.html`; eruvin/
   pesachim/sukkah/bava-metzia/bava-kamma → `flagship-daf-workbench.html`; ketubot/chullin/
   niddah → `lab.html`. A learner finishing Shabbat, Eruvin, and Ketubot gets three
   different "what's next" experiences at the same level. If flagship-daf-workbench is the
   intended destination, move shabbat and (where they belong) ketubot/chullin/niddah onto
   it; if tractate-mastery.html is being retired, say so and delete it. Half-migrated is the
   worst state — this is the highest-value coherence fix on the board and it is your system.

2. **Supabase account-isolation — the actual pilot blocker.** Everything else is polish
   until hosted accounts isolate. Needs Sam's live credentials + the 8-step runbook in
   `supabase/README.md`. Local mode still shares a `demo` learner (there is now a
   "start with a fresh learner" CTA on the landing page, which helps, but real isolation is
   still the gate). Nothing ships to real pilot users on local mode.

3. **Honor the production principle** (just decided — see below). Your flagship explanation/
   source checks are correct for argument/transfer. The one ask: leave the *translation*-
   anchor recalls typed (yachloku, me'eimatai, and the like) — those close a translation
   competency. The auditor now credits both styles, so you lose no points either way.

4. **(Optional, low priority)** Claude's ~250 new skill IDs are not in `data/skill-graph.json`,
   so `nextGraphPractice` never surfaces them (mastery/review/decay handle them fine). If you
   want graph coverage, the IDs follow `<subject>-<unit>-<step>` inside the unit files.

---

# Resolved: production-check principle (Sam delegated to Claude, 2026-07-15)

The app had two production-check styles evolving in parallel — typed recall (Claude's
non-Gemara units + labs) and shuffled explanation/source checks (Codex's Gemara spine +
flagship). **Decision: match the check to the terminal competency, don't converge on one.**
Typed recall closes *translation* competency (recall a source phrase's meaning); explanation/
source checks close *argument/sourceReasoning* (judge a reading move). Full statement in
`docs/content-standard.md` → "The production principle." The auditor
(`scripts/audit-content.mjs`) now credits both styles, so converting a Gemara arc's terminal
step to a `SOURCE CHECK` no longer costs production points. One request: don't convert a
*translation*-anchor recall (e.g. the yachloku / me'eimatai anchor-line checks) into plain
recognition — those close a translation competency and should stay typed. Everything else in
your flagship direction is consistent with the principle.

# Assignment for Codex — 2026-07-12

## 0. COMMIT YOUR WORK — before anything else (directive from Sam via Claude)

The working tree currently has ~29 modified tracked files and dozens of never-committed
new files (your tractate-mastery migration, remediation/repair-router rewrite, canon
capstone system, and more). All 122 tests pass right now, so the tree is at a commitable
point. Land it in scoped commits today: one crash, bad edit, or accidental checkout loses
weeks of work, and the uncommitted surface blocks Claude from every shared file
(course-engine.js, curriculum-engine.mjs, repository.mjs, server.mjs, the arc files).
Batch suggestions: (a) tractate-mastery migration + its tests, (b) remediation/repair
router + its data, (c) canon capstone/bridge system, (d) everything else that is stable.
Fold in the analytics code from item 3 while you are in server.mjs/repository.mjs.

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

**Decision (Sam, 2026-07-12): hub-with-lateral-links.** Gemara remains the default
mastery spine; each completed non-Gemara unit should offer one clear return toward that
spine and, only when it deepens the learner's next move, one optional lateral connection.

**Implemented (Claude, 2026-07-12, commit 070f2b9).** All 17 non-Gemara completion
screens now follow the rule — no action needed from Codex on this item, except one
consequence: `canon-arc.html` is now fully unreferenced (its four tracks lost their last
inbound links). Delete or repurpose at leisure. Details in `docs/qa-intake.md`.

## 5. Subject-aware review fallback (found by Claude 2026-07-12; your file)

`sourceReviewItems` in `data/curriculum-engine.mjs` is skill-agnostic and correctly
non-orphaning: any due skillId not covered by the canon journey falls through to
`workbenchFallbacks`, so today's ~80 new non-Gemara skills (halakha-honor-*,
chumash-akeidah-*, tefillah-kaddish-*, history-yavneh-*, widerworld-encounter-*) DO get
scheduled and DO produce a review item — no bug. But that fallback is always a Daf-reading
prompt ("What job does this line perform?"), which is incoherent for a lapsed Kaddish or
Yavneh skill. Under Sam's "raise non-Gemara to the same standard," the fallback should be
subject-aware, keyed off the skillId prefix.

I did NOT patch this myself because `curriculum-engine.mjs` is currently dirty with your
in-flight remediation/repair-router + nextGraphPractice rewrite; staging it would drag
that unfinished work into my commit. Handing it to you since you already own the file.
Suggested shape (only the fallback branch changes; `mapped` and the return are unchanged):

```js
// subject prefix -> generic-but-on-topic retrieval; falls back to the Daf prompt for
// Gemara/unknown skills so existing behavior is preserved.
const SUBJECT_RETRIEVAL = {
  halakha:   { hebrew:'תּוֹרָה · מִשְׁנָה · גְּמָרָא · קוֹד', translation:'Torah · Mishnah · Gemara · code.',
    prompt:'When a practice is grounded across source layers, what is the first thing to identify?',
    answers:['Which genre each source is, and what role it plays in the chain.','Only the final ruling.','The longest word.'], correct:0,
    feedback:'Halakhic literacy starts by naming each layer’s role in the chain.' },
  tanakh:    { hebrew:'פְּשָׁט · הֶקְשֵׁר · קַבָּלָה', translation:'Plain sense · context · reception.',
    prompt:'Before bringing later readings, what should a close reader establish?',
    answers:['Speaker, audience, and the verse’s immediate claim.','Which commentator wins.','A final ruling.'], correct:0,
    feedback:'Read the verse in itself before tracing how later texts receive it.' },
  chumash:   /* alias of tanakh */ null,
  tefillah:  { hebrew:'בָּרוּךְ · חָנֵּנוּ · מוֹדִים', translation:'Blessed · grant us · we give thanks.',
    prompt:'Entering a section of prayer, what is the first move?',
    answers:['Name the kind of address it makes: praise, petition, or thanks.','Memorize every word first.','Assume all sections are identical.'], correct:0,
    feedback:'Prayer is read by the form of address its language performs.' },
  history:   { hebrew:'זִכָּרוֹן · עֵדוּת · רְאָיָה', translation:'Memory · testimony · evidence.',
    prompt:'Reading a historical source, what distinction comes first?',
    answers:['Whether it is evidence of an event, of how it was remembered, or both.','That every source is a neutral camera.','That memory has no value.'], correct:0,
    feedback:'Sources are windows and voices at once.' },
  widerworld:{ hebrew:'מָקוֹר · הֶקְשֵׁר · הַשְׁוָאָה', translation:'Source · context · comparison.',
    prompt:'Comparing a Jewish and a non-Jewish source, what is the responsible order?',
    answers:['Read each in context, name the shared question, then compare.','Start from a stereotype.','Assume comparison erases difference.'], correct:0,
    feedback:'Compare without flattening: context, shared question, then similarity and difference.' },
  mussar:    { hebrew:'מִדָּה · מְתִיחוּת · הֶרְגֵּל', translation:'Trait · tension · habit.',
    prompt:'Studying a middah, what makes it serious rather than a slogan?',
    answers:['Naming the trait, its real tension, and the case that tests it.','Picking the nicest-sounding word.','Turning reflection into self-judgment.'], correct:0,
    feedback:'A middah is traced from source, to tension, to a real situation.' },
  chassidus: { hebrew:'מָקוֹר · מוּשָׂג · הַשְׁלָכָה', translation:'Source · concept · implication.',
    prompt:'Reading a Chassidic source, what is the responsible order?',
    answers:['Read the source, define its concept, then consider an implication.','Begin with a feeling and make the text agree.','Skip the text for a slogan.'], correct:0,
    feedback:'Inner learning stays anchored in the text.' },
  thought:   { hebrew:'שְׁאֵלָה · קוֹל · פֵּרוּשׁ', translation:'Question · voice · interpretation.',
    prompt:'Holding several voices on a question, what is the first move?',
    answers:['State what each voice claims before ranking them.','Pick the most comfortable answer.','Assume the voices agree.'], correct:0,
    feedback:'Jewish Thought holds distinct voices without flattening them.' }
};
const subjectItem = (skillId) => {
  const key = Object.keys(SUBJECT_RETRIEVAL).find((k) => skillId.startsWith(k + '-'));
  const spec = key && (SUBJECT_RETRIEVAL[key] || SUBJECT_RETRIEVAL.tanakh); // chumash->tanakh
  if (!spec) return null;
  return { trueSkillId: skillId, label: `${key.toUpperCase()} RETRIEVAL`, ...spec,
    sourceContext:`retrieval for ${skillId}`, variantId:`subject-${skillId}` };
};
const workbenchFallbacks = skillIds.filter((s) => !covered.has(s)).map((s) =>
  subjectItem(s) || ({ /* existing Daf-retrieval object unchanged */ }));
```

A test in `test/*.test.mjs` asserting that a `history-yavneh-*` skill yields a
`HISTORY RETRIEVAL` item (not `DAF RETRIEVAL`) would lock it in.

## Claude's concurrent work (avoid collisions) — updated 2026-07-13

Claude has created and committed these units (all in git history now): second and third
foundations for every non-Gemara subject — halakha-honor-parents, halakha-machloket,
chumash-akeidah, chumash-tehillim, tefillah-kaddish, tefillah-amidah, mussar-truth (pre-
existing) + mussar-anger, chassidus-ahavat-yisrael (pre-existing) + chassidus-simcha,
history-yavneh, history-geniza, widerworld-encounter, widerworld-mean (each .js + .html);
plus the units lists in subject.js/subject.html, the deepenings map in daily-router.js,
test/daily-deepening.test.mjs (guards 15 stage pairs — if you rename any course stage ID,
this test will tell you), and typed production checks in canon-course.js + the six course
JSONs (now committed).

## When you finish committing (item 0), please signal

Append one line to this file or docs/qa-intake.md ("Codex: in-flight surface committed,
tree clean"). Claude has three tasks queued that need your files to be stable first:
typed production checks in the front-door Gemara arcs (shabbat-arc.js is mid-migration in
your tree), Sefaria deep links per course step (needs course-engine.js), and a full
new-learner funnel dry run (walks seder.html/js and placement.js). Also flagged: test
runs go flaky when test files are edited mid-run — one more reason scoped commits help
us both.

## Optional, low priority

The ~250 skill IDs from Claude's 14 new units are not registered in data/skill-graph.json,
so nextGraphPractice never recommends them (mastery/review/decay all work fine — the graph
is the only system that doesn't see them). If you want graph coverage, the IDs all follow
`<subject>-<unit>-<step>` naming inside the unit files.
