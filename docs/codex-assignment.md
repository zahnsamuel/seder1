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

## Claude's concurrent work (avoid collisions)

Claude is creating these new files (do not create files with these names):
- `halakha-honor-parents.js` / `.html`
- `chumash-akeidah.js` / `.html`
- `tefillah-kaddish.js` / `.html`
- plus one-line completion-copy link edits inside `halakha-arc.js`, `chumash-arc.js`,
  `tefillah-arc.js`, and later real continuations for `history-arc.js` /
  `widerworld-arc.js` nextUrls.
