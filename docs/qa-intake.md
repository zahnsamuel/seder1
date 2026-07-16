# QA intake and implementation log

## 2026-07-15 — Codex: Bava Kamma Foundation Block 8

- Added an earned Bava Kamma loop: categories-and-principle source work, visible Daf mapping, retrieval, unseen transfer, and a Canon Connection.
- The post-connection bridge makes non-Gemara study an active next move: Halakha’s handling of disagreement and a wider responsibility course sit beside the return into Integration II.
- Checked Mishnah Bava Kamma 1:1, Bava Kamma 2a, and Exodus 22:5 on Sefaria. The block explicitly excludes deciding real liability or halakhic questions.

## 2026-07-15 — Codex: Sukkah Foundation Block 7

- Added an earned Sukkah loop from measure-and-validity source work through visible Daf mapping, retrieval, fresh transfer, and a Canon Connection.
- The completion bridge now makes the wider canon concrete: learners can deepen the structure-and-memory question through a Chumash reader and Chassidus on Simcha before continuing to Bava Kamma.
- Checked Mishnah Sukkah 1:1, Mishnah Sukkah 1:2, Sukkah 2a, and Leviticus 23:43 on Sefaria. The block explicitly distinguishes source study from practical Sukkot guidance.

## 2026-07-15 — Codex: Earned Foundation Consolidation I

- Replaced the static consolidation links with a five-move, source-grounded checkpoint: Berakhot question retrieval, Bava Metzia claims mapping, Mussar tension, Tefillah/Torah language, and fresh-source transfer into Sukkah.
- All checks shuffle their answers, record learner evidence, retain a study-not-advice boundary, and the final transfer writes a durable consolidation stage before the Sukkah handoff appears.
- Checked Berakhot 2a, Pirkei Avot 1:18, Deuteronomy 6:7, and the existing Sukkah opening citation on Sefaria before shipping the checkpoint.

## 2026-07-15 — Codex: Bava Metzia Foundation Block 5 and Consolidation I

- Added an earned Bava Metzia loop from claims-and-evidence source work into visible Daf mapping, retrieval, Bava Metzia-specific unseen transfer, an ethics-focused Canon Connection, and a cross-canon Consolidation I.
- Consolidation I makes non-Gemara learning part of the next move: daily retrieval, Mussar responsibility, Tefillah reading, and Chumash/Jewish Thought context work each remain explicit routes alongside the Gemara spine.
- Checked Mishnah Bava Metzia 1:1, Bava Metzia 2a, and Leviticus 19:18 on Sefaria. The block explicitly excludes resolution of real disputes and practical legal or halakhic advice.

## 2026-07-15 — Codex: Pesachim Foundation Block 4

- Added an earned Pesachim loop from the time-and-action source trail into visible Daf mapping, retrieval, Pesachim-specific unseen transfer, a Canon Connection, and Bava Metzia.
- Checked Mishnah Pesachim 1:1, Mishnah Pesachim 1:2, Pesachim 2a, and Exodus 12:14 on Sefaria. Its boundary keeps Passover practice and halakhic ruling outside Seder’s instructional scope.

## New content: second Chassidus arc, Ahavat Yisrael (2026-07-11)

Third non-Gemara addition this session, applying the Yochai `source-sheet` skill's role-based curation method explicitly for the first time (foundational → dominant reading → counter-voice → applied), now that Claude has read access to the Yochai KG repo and its documented methodology (no live API key yet -- user will request one later; this uses the method, not live graph calls).

**New files:** `chassidus-ahavat-yisrael.html`, `chassidus-ahavat-yisrael.js` (8 steps, course-engine.js).

**Sources, all verified via web search before writing:** Leviticus 19:18 (foundational command), Rabbi Akiva's "great principle of the Torah" framing from the Sifra (dominant reading), Ben Azzai's real, recorded counter-proposal via Genesis 5:1 -- a genuine Tannaitic disagreement about whether the command's reach is particular (fellow) or universal (shared human origin), not an invented tension. Hillel's Shabbat 31a formulation to the convert (applied/practical), and a Chassidic root via Tanya ch. 32 (all Israel as literally sharing one source) -- presented as the chapter's well-documented theme rather than an over-precise verbatim quote I couldn't fully verify character-by-character.

**Wiring:** bidirectional links with the original Joy/Awe arc, same pattern as Mussar's Truth arc.

**Verified end-to-end live:** all 8 steps in a single batched pass (no timeout issues this time), checkpoint completion, mastery recording (all 9 skill IDs including stage), link-back rendering. Full suite: 42/42 (Codex added 4 more tests concurrently while this was in progress -- confirms Codex is active again).

**Pivoting after this:** user asked to shift focus entirely to the Gemara section for an extended period -- see the next entry for the improvement plan.

---

## New content: second Mussar middah, Truth (2026-07-11)

Continuing "beef up the non-Gemara tracks" -- Mussar had exactly one arc (Humility). Built a second, on Truth, matching the exact quality bar and structure of the original.

**New files:** `mussar-truth.html`, `mussar-truth.js` (9 steps, course-engine.js).

**Content, verified against web search before writing:** Pirkei Avot 1:18 (the world stands on justice, truth, and peace), Shabbat 55a (truth as God's own seal), and the famous Ketubot 17a dispute between Beit Hillel and Beit Shammai over how to praise a bride at her wedding -- whether kindness may shape literal truth, and why the accepted halacha follows Hillel's more lenient view without that becoming a general license to lie (the Torah verse Beit Shammai cites, Exodus 23:7 "distance yourself from a false matter," is presented fairly, not as a straw man). This mirrors the original Humility arc's "notice the tension" structure precisely, applied to a real, famous, well-documented halakhic dispute rather than an invented one.

**Wiring:** the original `mussar-arc.js`'s completion screen now links to this second arc (same `completeCopy`-embeds-`<a>` pattern used for the Suffering arc). Routes forward to `chassidus-arc.html` on completion rather than looping back, since `subject.html?track=mussar` turned out to be a single foundational question page, not a hub -- checked this before wiring rather than assuming.

**Verified end-to-end live:** all 9 steps, the Hillel/Shammai tension step and its resolution step specifically checked for correct feedback wording, typed pass-through of every step confirmed via direct DOM interaction, checkpoint completion and both link directions (forward to Chassidus, backward link from the original Humility arc) confirmed working, `demo` learner's mastery shows all 9 `mussar-truth-*` skill IDs (10 including the stage). Full suite: 38/38.

Also pushed with minimal check-ins per explicit instruction to proceed with the least amount of permission-asking -- committed and pushed this alongside the Suffering arc without a separate approval round each time, consistent with the established pattern from prior commits this session.

---

## New content: Jewish Thought deep-dive on Suffering (2026-07-11)

User asked to beef up the non-Gemara tracks specifically. Found that `philosophy-questions.js` (the "question atlas") already surveys 7 durable questions (Revelation, Reason, Ethics, Prayer, Suffering, Peoplehood, Modernity) at one touch each, and its own completion text explicitly promises deep-dive courses for each field as "the next stage" -- `philosophy-unit-2.js` already fulfilled that promise for Freedom/Providence (not part of the 7, but the same idea), but none of the atlas's 7 fields had a real deep-dive yet. Built one for Suffering, matching `philosophy-unit-2.js`'s exact structural pattern (find tension → define → second source creating tension → state disagreement fairly → distinction → apply without overreaching → independent → typed recall).

**New files:** `thought-suffering.html`, `thought-suffering.js` (8 steps, course-engine.js).

**Content:** three primary-source voices held in tension without ranking one as more correct -- Job 1:21 (composed acceptance), Psalms 22:2 (raw protest), Lamentations 3:1 (communal/historical witness, read on Tisha B'Av). All three Hebrew citations verified via web search against Sefaria before writing, not recalled from memory. Explicitly scoped Job 1:21 as "Job's first recorded response," not a general rule, since the rest of the book is extended protest -- oversimplifying Job would have been a real accuracy risk.

**Handled the sensitivity of the topic deliberately:** this is a serious subject (grief, suffering) that could tip into pastoral territory if handled carelessly. Step 6 ("Apply without overreaching") is an explicit boundary step distinguishing text study from real personal/pastoral support -- correct answer is "Offer these texts as company across history, while making clear that real personal support needs a rabbi, counselor, or community — not a course," with a wrong-answer option that explicitly rejects treating the course as equivalent to emotional support. No content anywhere tries to explain why suffering happens or offers comfort as if that were the app's place.

**Wiring:** `philosophy-questions.js`'s completion screen now includes a real embedded link to the new arc (`completeCopy` renders via `innerHTML` in `course-engine.js`, confirmed this is safe and already how the shared completion template works).

**Verified end-to-end live:** all 8 steps click through correctly with shuffling, feedback, and the boundary step's exact wording confirmed; typed-recall accepts the expected answer; checkpoint completes and the atlas link-back renders as a real clickable link (confirmed via DOM query, not just visual inspection); `demo` learner's mastery shows all 8 `thought-suffering-*` skill IDs. Full suite: 38/38.

**For whoever picks up "beef up the non-Gemara tracks" next:** Mussar and Chassidus each still have only one arc (Humility; Joy/Awe) despite being paired subjects in `canon-journey.json`. A second Mussar middah (e.g. Emet/truth via Pirkei Avot 1:18, or Hakarat HaTov/gratitude) would be the next natural target using the same pattern.

---

## New content: full Bava Kamma tractate arc (2026-07-11)

The user asked to move past QA and expand content while Codex was unavailable. Built a complete 10-step arc for Bava Kamma, upgrading it from the existing 3-question lab (per `docs/gemara-canon-strategy.md` Stage 3's priority list) to match the depth of the other 6 gateway-tractate arcs.

**New files:** `bava-kamma-arc.html`, `bava-kamma-arc.js` (uses the shared `course-engine.js`, same pattern as Shabbat/Eruvin/Pesachim/Sukkah/Bava Metzia).

**Wiring:** added `"stage":"tractate-arc"` and `"arcUrl":"bava-kamma-arc.html"` to the Bava Kamma entry in `data/gemara-tractates.json` (Shas map now routes there instead of the lab, verified live), and appended a `bava-kamma-tractate-arc` step to `data/advanced-gemara-sequence.json`'s continuation sequence after Bava Metzia. Updated `README.md`'s tractate-arc count from five to six.

**Content, verified against Sefaria/web search before writing (not just recalled):** the Mishnah's full opening (four categories, the differentiation clauses "the ox is not like the maveh," and the shared-principle clause) is verbatim; the av/toldot (primary category / derivative) concept is real and central to the actual sugya, not invented; the Torah grounding is described generally as Exodus 21–22 rather than claiming a single verse, since that's what's actually accurate. Where I wasn't confident enough to claim a specific verbatim Gemara 2a line (unlike Berakhot, where I had that confidence), I used generic transferable phrases instead (`מַאי טַעְמָא`), matching the same conservative pattern the existing Bava Metzia arc already uses.

**Verified end-to-end live:** all 10 steps click through correctly with proper shuffling, feedback, and XP; the typed-recall step accepts the expected answer; the checkpoint-complete screen and routing to the lab work; `demo` learner's mastery now shows all 6 `bava-kamma-*` skill IDs with real values; Shas map click-through confirmed "Begin the Bava Kamma arc →" routes to the new page. Full test suite: 38/38 passing throughout.

---

## Seventh batch: canon_lab mastery-tracking bug, found and fixed (2026-07-11)

Went beyond the QA/curriculum lane since Codex was offline and the user said not to wait on the division of labor. Reviewed the newest content (`canon-labs.js` / `data/non-gemara-labs.json` -- the 7-subject, 21-prompt Canon Practice Labs) and found a real bug, not just a content issue.

Priority: High
Area: mastery
Problem: `canon-labs.js` posts learner events with `type:'canon_lab'`, but `data/repository.mjs`, `data/supabase-learner-repository.mjs`, and the `/api/learners/:id/insights` route in `server.mjs` all only credited `'answer_submitted'` or `'source_annotation'` events toward XP, mastery, competencies, evidence, review scheduling, and `totalAnswered`/streak. `canon_lab` events were recorded into `learner.events` (so they show up in raw history) but silently produced zero mastery/XP/competency change.
Why it matters: the labs reuse the exact same `skillId`s as `canon-journey.json` and the arcs (e.g. `historical-context`, `conceptual-application`, `liturgical-function`) -- they're explicitly meant to supply a third or fourth source-context toward the same skills tracked elsewhere. A learner could complete all 21 prompts, see "Strong reading" feedback and a completion counter, and their actual mastery/XP would never move. This is the same class of issue as the earlier mastery-gating bug, just inverted: instead of advancing without evidence, evidence was being generated and thrown away.
Fix applied: added `event.type === 'canon_lab'` alongside the existing checks in all 4 locations (`data/repository.mjs` x2, `data/supabase-learner-repository.mjs`, `server.mjs`'s insights route) plus `data/curriculum-engine.mjs`'s `canMasterJourneyStage` evidence check for future-proofing (no current sourceContext overlap with canon-journey, but same silent-gap risk if one is ever added).
Verified: `node --check` on all 4 touched files, full suite passes (38/38), and a live end-to-end test (POST a `canon_lab` event to a disposable test learner via a freshly-restarted server) confirmed `xp`, `mastery`, `evidence`, `competencies`, `totalAnswered`, `dailyStreak`, and the review queue all update correctly now. Content itself (all 21 Torah/Tefillah/Halakha/Thought/Mussar-Chassidus/History/Wider-World citations) checked against known text -- accurate.

Note for whoever picks this up next: **the server process caches its own backend module imports (`repository.mjs`, `curriculum-engine.mjs`, etc.) in memory at startup** -- unlike static frontend files, which `createReadStream` fresh on every request, edits to backend `.mjs` files do NOT take effect until the running `node server.mjs` process is restarted. I discovered this by testing against a stale long-running process first and seeing no effect. Worth remembering when verifying future backend fixes.

---

## Applied directly by Claude (2026-07-11) -- Codex was temporarily unavailable

Since Codex was out of tokens, Claude applied its own already-verified corrections directly rather than leaving them queued. **These are done, not just drafted** -- no need to re-implement:

- All 4 citation fixes (Third batch below + the canon-studio.js propagation from the Sixth batch): applied to `curriculum/canon-journey.json`, `canon-studio.js`, `tefillah-arc.js`, `halakha-arc.js` (all 3 occurrences, including the typed-recall `acceptable` answers array).
- All 11 Berakhot distractor revisions (Fourth batch below): applied across `berakhot-deep.js` and units 2-5.
- Both halakhic-boundary steps (Fifth batch below): inserted into `eruvin-arc.js` and `tefillah-arc.js`, verified live (step count and sidebar position correct on both pages).
- New finding while applying: `gemara-runway.json` is also dead data (folded into the existing dead-code finding near the bottom of this file).

All changes verified: every touched `.js` file passes `node --check`, `canon-journey.json` passes `JSON.parse`, live console-error checks clean on both arc pages, and the full test suite passes (38/38) after these edits. Not yet committed to git -- ask Claude to commit, or Codex/the user can commit alongside its own next batch.

The sections below are kept as the historical record of what was drafted and why; treat their "ready to apply" language as superseded by this note.

---

## Sixth batch: QA of newly added pages (2026-07-11), per coordinated plan P2

First: confirmed all 3 P0 code fixes (placement/phase-checkpoint shuffle, canon-session advancement gate) are already implemented and correct, with `test/assessment-integrity.test.mjs` and `test/gemara-workbench-integration.test.mjs` passing. Nice work -- the `currentEvidenceMet` fix in `canMasterJourneyStage` (checking real per-source-context correct-answer events, not just the prior skill's threshold) is exactly right. Full suite: 37/37 passing.

Reviewed every page added since the QA scope started: `daf-workbench.*`, `daf-notebook.*`, `remediation.*`, `phase-checkpoint.*`, `gemara-continuation.*`, `canon-continuation.html`, `canon-studio.*`, `sugya-checkpoint.*`, `cross-tractate.*`, and `data/advanced-gemara-sequence.json`. Read all content, live-checked every page for console errors (all clean), and exercised daf-workbench and canon-studio interactively.

---
**One real finding: the Rambam misattribution has propagated to a second file.**

Priority: High
Area: source accuracy
Problem: `canon-studio.js` line 10 contains the identical error already flagged in `curriculum/canon-journey.json`: `['Wider World · Guide for the Perplexed','קַבֵּל אֶת הָאֱמֶת מִמִּי שֶׁאֲמָרוֹ','Accept the truth from whoever says it.',...]` -- same quote, same wrong attribution to the Guide for the Perplexed instead of the introduction to Shemoneh Perakim.
Why it matters: This confirms the error was copied as source content into new material, not just sitting in one place. Any future new page built from this same source list would propagate it again.
Recommended change: Change the label from `'Wider World · Guide for the Perplexed'` to `'Wider World · Shemoneh Perakim'` in `canon-studio.js`, applying the same correction as the `canon-journey.json` fix in the Third batch above.
Specific file: canon-studio.js, line 10 (the `sources` array, last entry)

---

Everything else checked out clean:
- `daf-workbench.js`: verified 4 new citations not seen before (Eruvin's "מִשּׁוּם דְּלֹא שָׁלְטָא בֵּיהּ עֵינָא" reasoning, Sukkah's Leviticus 23:43 grounding "לְמַעַן יֵדְעוּ דּוֹרוֹתֵיכֶם", Pesachim's "נְהוֹרָא" as the proposed answer to the אור word-question, Shabbat's continuation "הֶעָנִי עוֹמֵד בַּחוּץ") -- all accurate, and genuinely more sophisticated than the arc versions (real halakhic reasoning, not just Mishnah text). The role dropdown includes "Objection" as a selectable-but-never-correct option across all 6 sources' opening lines -- not a bug, since none of these are actual objection-stage excerpts (objections come later in a sugya); it's a legitimate distractor in the same sense as a wrong multiple-choice answer.
- `sugya-checkpoint.js` / `canon-studio.js` interaction pattern (both use `<select>` dropdowns): not vulnerable to the shuffle-bug pattern, already confirmed in the Systemic shuffle-bug check.
- `canon-continuation.html`: pure static navigation hub, all 8 links resolve to real pages.
- `data/advanced-gemara-sequence.json`: pure navigation/sequencing data (titles, reasons, urls), no citations to verify, all URLs resolve.
- `phase-checkpoint.html?phase=phase-1` correctly redirects to `journey.html` for a learner who hasn't unlocked that checkpoint yet (`!phase?.checkpointReady` guard) -- verified live, working as intended, not a bug.
- `remediation.js`, `daf-notebook.js`, `gemara-continuation.js`: all read-only hub/summary pages with no exercise content to fact-check; loaded clean with no console errors.

---

## Fifth batch: Eruvin/Tefillah halakhic-boundary wording (2026-07-11)

Per the coordinated plan (P1, Claude drafts wording / Codex implements mechanically). Matched the existing pattern in `halakha-arc.js`'s "Keep the boundary" step (mode `RESPONSIBLE LEARNING`, `לִלְמוֹד · לְהָבִין · לִשְׁאוֹל`) rather than inventing a new style, and placed each new step in the same relative position halakha-arc.js uses it: after the last content step, immediately before the independent-read step. Used curly apostrophes (’) throughout to match this codebase's existing single-quoted-JS-string convention (straight `'` would break the string).

---
**eruvin-arc.js** -- insert as a new step after "Transfer the skill" and before "Independent case map":

```js
{short:'Keep the boundary',mode:'RESPONSIBLE LEARNING',title:'A measurement is not a ruling',ref:'Seder learning boundary',hebrew:'לִלְמוֹד · לְהָבִין · לִשְׁאוֹל',translation:'To learn · to understand · to ask.',prompt:'You now know the Mishnah’s twenty-cubit measure. What is Seder’s appropriate role from here?',answers:['Help learners trace the source and its reasoning while directing any real-world eruv or carrying question to qualified guidance.','Let a learner determine their own neighborhood’s eruv status from this measurement alone.','Avoid teaching measurements to prevent any practical questions.'],correct:0,skill:'eruvin-non-psak-boundary',competency:'sourceReasoning',feedback:'A number in the Mishnah is a starting point for study, not enough on its own to determine a real eruv’s validity — that always requires a qualified, on-the-ground rabbinic determination.'},
```
Tailored specifically to Eruvin's actual risk (a learner over-trusting a bare number to judge a real neighborhood eruv), rather than a generic copy of the Halakha arc's wording.

---
**tefillah-arc.js** -- insert as a new step after "Practice and intention" and before "Independent liturgy map":

```js
{short:'Keep the boundary',mode:'RESPONSIBLE LEARNING',title:'Understanding prayer is not a ruling',ref:'Seder learning boundary',hebrew:'לִלְמוֹד · לְהָבִין · לִשְׁאוֹל',translation:'To learn · to understand · to ask.',prompt:'You can now name praise, petition, and thanksgiving in the Siddur. What is Seder’s appropriate role here?',answers:['Help learners read and understand the liturgy while directing practical questions about prayer obligations to qualified guidance.','Issue a ruling about when or how a learner must pray.','Treat understanding the words as the same thing as knowing every practical requirement.'],correct:0,skill:'tefillah-non-psak-boundary',competency:'sourceReasoning',feedback:'Moral seriousness includes being clear that understanding what prayer means is not the same as resolving a practical question about performing it.'},
```

---
Note for whoever implements: both new steps will shift `completeCopy`'s implicit step count references if any exist (checked -- neither arc's `completeCopy` text states a specific step count, so no follow-up edit needed there). `journey.js`/`course-engine.js` render step count dynamically from `config.steps.length`, so no other code changes needed beyond inserting these two objects into their respective `steps` arrays.

---

## Fourth batch: Berakhot distractor revisions (2026-07-11), ready to apply

Per the coordinated plan (P1, Claude owns drafting / Codex owns implementing). Re-read all of berakhot-deep.js and units 2-5 and picked out the distractors that are eliminable by pure logic/structure without any Hebrew comprehension -- roughly 10 across ~42 total questions in these 5 files. Left the rest alone; most distractors in these files are already good (plausible confusions that require real vocabulary/grammar knowledge to rule out). Each entry below is a direct find/replace against the current live text.

---
**berakhot-deep.js, step "Orient to the Mishnah"**
```
'A narrative about someone praying.'
```
to:
```
'A description of how the evening Shema should be performed.'
```
Why: the old distractor is eliminable on structure alone (nothing here reads as a narrative). The new one requires actually distinguishing "asks when" from "describes how" -- a real beginner confusion.

---
**berakhot-deep.js, step "Separate Mishnah and Gemara"**
```
'A different tractate has begun.'
```
to:
```
'The Mishnah is restating its opening line word for word.'
```
Why: old distractor is arbitrary. New one tests whether the learner actually noticed a new voice/terminology entered, not just assumed repetition.

---
**berakhot-deep.js, step "Name the Gemara move"**
```
'The pronunciation of Shema.'
```
to:
```
'Whether the Mishnah is discussing evening or morning first.'
```
Why: old distractor is unrelated noise. New one is a genuine plausible mix-up between the Gemara's *meta*-question (why does the Mishnah open this way) and the Mishnah's *content* question (timing).

---
**berakhot-deep.js, step "Spot a source signal"**
```
'A personal example is beginning.'
```
to:
```
'A rabbi's personal opinion is being quoted.'
```
Why: tests the real distinction דִּכְתִיב marks (a *written*, scriptural citation) from a spoken citation of a Sage's view -- a distinction learners genuinely need for reading Gemara accurately.

---
**berakhot-deep.js, step "Explain the answer"**
```
'It changes the subject to a different mitzvah.'
```
to:
```
'It proves the Mishnah's law applies only to men.'
```
Why: old distractor is arbitrary. New one is a real overreach a learner might plausibly make from gendered-sounding phrasing ("when you lie down... when you rise") -- also doubles as a mild guard against the "overclaiming" pedagogical risk flagged in the coordinated plan.

---
**berakhot-deep.js, step "Trace the sequence"**
```
'A verse, a story, then an unrelated law.'
```
to:
```
'A timing question, a verse-based answer, then a question about context.'
```
Why: old distractor is implausible nonsense. New one has the *right pieces in the wrong order* -- a genuinely stronger test of whether the learner tracked the actual sequence of the sugya, not just recognized the pieces existed.

---
**berakhot-unit-2.js, step "Notice a second source"**
```
'It makes the first source disappear.'
```
to:
```
'It repeats the practical sign in different words.'
```
Why: old distractor is illogical (easy to eliminate without any Hebrew). New one tests whether the learner recognizes וְאוֹמֵר introduces a genuinely different *kind* of evidence (textual proof vs. the earlier practical sign), not just a restatement.

---
**berakhot-unit-3.js, step "Recognize a new question"**
```
'Find the page number.'
```
to:
```
'Restate the prior statement without adding anything new.'
```
Why: old distractor is a throwaway. New one tests the actual meaning of מַאי קָא מַשְׁמַע לָן (what does this *add*/teach us) against the plausible misreading that it's just asking for a repeat.

---
**berakhot-unit-3.js, step "See a pressure point"**
```
'A change in tractate.'
```
to:
```
'The next Mishnah that will be studied after this one.'
```
Why: old distractor is arbitrary. New one is a real beginner confusion -- mistaking an objection-source (which challenges something *earlier*) for simply "what comes next in sequence."

---
**berakhot-unit-4.js, step "Locate a measure"**
```
'Naming a source author.'
```
to:
```
'Providing a rough estimate that the ruling can round up or down.'
```
Why: old distractor is unrelated. New one tests a genuinely important halakhic-reading point -- that a stated measure (20 cubits) is a strict legal threshold, not an approximation.

---
**berakhot-unit-5.js, step "Cited teaching"**
```
'Which word is hardest to pronounce?'
```
to:
```
'Whether this teaching agrees completely with the Mishnah already taught.'
```
Why: old distractor is silly/throwaway. New one is the real first question a learner should actually ask about a תַּנְיָא -- and the correct answer (asking what *job* it does: support, clarify, or challenge) is a meaningfully different, better answer than just "agrees or not."

---

## Third batch: verified citation corrections (2026-07-11), ready to apply

Per the coordinated plan: Claude verified the three flagged citations against real sources (web search + Sefaria's own API, not just training recall). All three are confirmed. Exact drop-in corrections below -- current live text confirmed unchanged as of this writing, so these should apply cleanly.

---
**1. `curriculum/canon-journey.json`, session id `wider-world`**

Confirmed via multiple independent sources: "Accept the truth from whoever says it" (קַבֵּל אֶת הָאֱמֶת מִמִּי שֶׁאֲמָרוֹ) is from Rambam's introduction to *Shemoneh Perakim* (his introduction to his commentary on Pirkei Avot), where he explicitly defends drawing on non-Jewish philosophers. It is not from the introduction to the *Guide for the Perplexed*, which has a different, well-known framing (addressed to "my honored disciple Joseph," on the tension between philosophy and Torah).

Change:
```
"citation":"Guide for the Perplexed, introduction"
```
to:
```
"citation":"Introduction to Shemoneh Perakim"
```
The Hebrew, translation, and note fields are all accurate as-is -- only the citation needs to change. No other content in this session depends on the exact source name.

---
**2. `tefillah-arc.js`, step "Practice and intention"**

Confirmed via Sefaria: "הַקּוֹרֵא אֶת שְׁמַע וְלֹא הִשְׁמִיעַ לְאָזְנוֹ" ("one who recites Shema but does not make it audible to his own ear") is Mishnah Berakhot **2:3**, not 2:1. (Mishnah Berakhot 2:1 is actually about someone interrupted mid-Torah-reading by the time for Shema -- a different Mishnah entirely.)

Change:
```
ref:'Mishnah Berakhot 2:1'
```
to:
```
ref:'Mishnah Berakhot 2:3'
```
Hebrew and translation are both accurate as-is (matches Sefaria's text of 2:3 exactly) -- only the ref number needs to change.

---
**3. `halakha-arc.js`, step "Gemara reasoning"**

Confirmed via Sefaria's own text of Berakhot 35a: the actual verbatim source-derivation phrase on that daf is "מְנָא הָנֵי מִילֵּי" ("from where are these matters [derived]?") -- a very common, highly transferable generic Talmudic idiom that appears throughout Shas. The app's current "מִנַּיִן לִבְרָכָה?" ("from where do we know a blessing?") is an invented paraphrase, not verbatim Gemara text, even though it's on the right daf and captures the right idea. (For reference, the daf's actual derivation runs through Leviticus 19:24's "קֹדֶשׁ הִלּוּלִים" and Rabbi Akiva's statement that one may not taste anything before reciting a blessing, concluding "אָסוּר לוֹ לָאָדָם שֶׁיֵּהָנֶה מִן הָעוֹלָם הַזֶּה בְּלֹא בְּרָכָה.")

Recommend replacing with the real, transferable phrase rather than just relabeling as a paraphrase -- it's pedagogically more valuable since learners will hit "מנא הני מילי" constantly elsewhere in Shas:

Change:
```
hebrew:'מִנַּיִן לִבְרָכָה?',translation:'From where do we know a blessing?'
```
to:
```
hebrew:'מְנָא הָנֵי מִילֵּי?',translation:'From where are these matters derived?'
```
The `ref:'Berakhot 35a'` stays correct -- the daf is right, only the Hebrew/translation needed the fix. The prompt, answers, and feedback text all still work unchanged since they're asking about the Gemara's *move* (asking for a grounding source), not the specific wording.

---

## Intake rule

Claude’s findings are copied here or supplied in the standardized handoff format. Codex groups them by risk before making changes: learner blockers, source/pedagogy corrections, UX fixes, then future improvements.

## Fix workflow

1. Reproduce the issue in the local app.
2. Record affected learner states and source nodes.
3. Make the smallest safe implementation change.
4. Add or update an automated test when behavior is involved.
5. Verify the live local route.
6. Record the outcome, file changed, and residual question.

## First review batch

Status: complete. Claude QA report below (2026-07-11).

Scope: every page in the app (arcs, labs, utility pages, redirects), every internal link, every async event handler, plus a live click-through of representative flows (profile creation, placement, a canon-session lesson, a lab, review, Shabbat arc, mastery map navigation). Did not review `phase-checkpoint.*`, `gemara-continuation.*`, or `remediation.*` in depth -- those were mid-edit under Codex at the time of this pass.

### Learner blockers (fixed by Claude already, not Codex's queue)

- **profile.js: new-profile creation silently failed in the UI.** `event.currentTarget` was read after an `await fetch(...)`; the DOM spec nulls `currentTarget` once event dispatch completes, so `event.currentTarget.reset()` threw and aborted the handler after the network call succeeded. The learner's profile was created server-side but the UI stayed frozen on "Creating profile..." forever, with no error shown. Fixed by capturing the form reference before the `await`. Verified live: profile creation now updates status text and re-renders the list correctly. Already committed to the working tree (uncommitted at time of writing, in your control to commit).

### UX / housekeeping (not urgent, no learner impact)

- **`path.js` is dead code.** `path.html` was superseded by a redirect stub to `mastery.html` (intentional, documented in a comment), but `path.js` (2.4KB, real logic) is still sitting in the repo unreferenced by anything. Harmless but worth deleting next time someone's in that area.

### Clean

- Zero broken internal links (checked every href/src/url string against the filesystem, all ~40 HTML files + all JS).
- Zero orphaned `/api/...` calls -- every frontend API reference matches a route in `server.mjs`.
- Zero console errors across every page in the app (checked live, one page at a time).
- No other occurrence of the `currentTarget`-after-`await` pattern anywhere else in the codebase.
- The two intentional redirect stubs (`path.html`, `shas-map.html`, `index.html`) all work correctly and are clearly documented as such -- not bugs.
- The shared `course-engine.js` engine (used by 11 of the tractate/subject arcs) verified end-to-end live on the Shabbat arc: question rendering, answer feedback, XP, and advancement all correct.

## Second review batch: curriculum, source quality, pedagogy, mastery integrity

Status: complete. Claude curriculum-review report below (2026-07-11), per the review brief.

Scope sampled: the full live Berakhot runway (`berakhot-deep.js` + units 2-5), the full 18-session `curriculum/canon-journey.json` plus its gating code, `placement.js`, `bava-metzia-arc.js`, `mussar-arc.js`, and a sitewide grep for the halakhic-boundary language across every tractate/subject arc. Did not do a deep line-by-line pass on every remaining arc -- see "Not yet reviewed" at the bottom.

Confidence note: findings about pedagogical structure, mastery-gating logic, integration quality, and internal consistency are asserted with full confidence -- that's reasoning about the app's own logic and content. The one citation-accuracy finding below is asserted with high but not absolute confidence; worth a second check given the seriousness of misattributing a source on a Torah-learning platform.

### Immediate blockers

---
Priority: High
Area: mastery
Problem: `placement.js` renders its 8 answer choices in fixed array order with no shuffling (no `shuffle()` call or `Math.random()` sort anywhere in the file), and every single one of the 8 checks has `correct: 0` -- confirmed via `grep -o "correct: [0-9]" placement.js`, 8/8 are 0.
Why it matters: This is the very first interaction every learner has with the app. Anyone (a learner discovering the pattern, or a curious clicker) can click the first button 8 times in a row and score a perfect placement across Hebrew decoding, Mishnah orientation, vocabulary, Gemara moves, source reasoning, Halakha, Chumash, and Jewish Thought simultaneously -- seeding inflated starting mastery sitewide from the first minute of use. Directly violates `docs/content-quality-standard.md` requirement #4 ("correct answers are randomized in presentation"), which every other question-rendering file in the codebase (`course-engine.js`, `canon-session.js`, `lab.js`, `source-map.js`, `subject.js`) already honors.
Recommended change: Apply the same shuffle pattern already used in `course-engine.js` (`list.map((text,i)=>({text,i})).sort(()=>Math.random()-.5)`, checking correctness against original index, not display position) to `placement.js`'s render function.
Specific file: placement.js (the `render()` function, line ~35)
---
Priority: High
Area: mastery
Problem: `phase-checkpoint.js` (currently mid-development) has the identical bug: `questions.map(([prompt, choices], questionIndex) => ...)` renders `choices` in fixed array order with no shuffle, and every prompt's correct index (the third array element) is `0` for all 8 questions across all 4 phases.
Why it matters: Same mechanism as the placement bug above, applied to phase checkpoints -- a learner could click the first choice on every question and pass every phase gate without reading anything. Flagging now since it's live in the working tree, in case it helps to catch this before this feature ships rather than after.
Recommended change: Same as above -- shuffle choice order at render time, check correctness against original index.
Specific file: phase-checkpoint.js (the `#questions` render block)

Follow-up sweep (2026-07-11, later same day): checked all 59 JS files including everything added since this report started (`cross-tractate.js`, `daf-notebook.js`, `daf-workbench.js`, `gemara-continuation.js`, `remediation.js`, `pilot.html`) for the same pattern. Good news -- it's contained to exactly the two files above. `cross-tractate.js`/`daf-workbench.js` use `<select>` dropdown matching, which isn't vulnerable to a click-the-first-option exploit (the default option is a blank prompt). `daf-notebook.js`/`gemara-continuation.js`/`remediation.js` are read-only hub/summary pages with no answer input. `pilot.html` is static with no script.
---
Priority: High
Area: mastery
Problem: Traced `canMasterJourneyStage` in `data/curriculum-engine.mjs` (called when a `stage_mastered` event fires for a canon-journey session). It checks `prerequisiteStages` completion and `skillsReady`, but `skillsReady` only checks `session.skillRequirements` -- which in every session of `curriculum/canon-journey.json` references the **prior** session's skillId, never the current session's own skillId. Meanwhile, `canon-session.js`'s Continue button only requires a question to have been "answered" (`answered = true` is set on any click, right or wrong) before advancing, and the final "Complete this canon moment" action fires `stage_mastered` unconditionally once all questions have *a* response.
Why it matters: A learner who already cleared the mastery threshold for the prerequisite skill (from a genuinely-completed earlier session) can click every single answer wrong in the *current* session and the stage will still be marked mastered, unlocking the next step. This directly contradicts `docs/curriculum-blueprint.md`'s own evidence standard: "A lesson completion is not evidence by itself." Right now, for any session after the first, it effectively is.
Recommended change: Gate `stage_mastered` on the current session's own skillId(s) reaching a real threshold from *this* session's answers (e.g., require a minimum fraction of the current session's questions answered correctly), not only on the prior session's already-satisfied skill.
Specific file: data/curriculum-engine.mjs (`canMasterJourneyStage`, `skillsReady`), canon-session.js (the `answered` flag / continue handler), curriculum/canon-journey.json (the `skillRequirements` structure)
---
Priority: High
Area: source accuracy
Problem: In `curriculum/canon-journey.json`, the "wider-world" session cites the maxim "קַבֵּל אֶת הָאֱמֶת מִמִּי שֶׁאֲמָרוֹ" ("Accept the truth from whoever says it") as coming from "Guide for the Perplexed, introduction." To my knowledge this maxim is from Rambam's introduction to Shemoneh Perakim (his introduction to his commentary on Pirkei Avot), not the introduction to the Guide for the Perplexed, which has a different, well-known framing (addressed to "my honored disciple Joseph," about the tension between philosophy and Torah).
Why it matters: This is in the exact section (`docs/learning-expansion-sequence.md` item 6, "Judaism and the Wider World") that the project's own docs say needs the most precision, since comparative/intellectual-history claims are easy to get subtly wrong and hard for a beginner to catch. A misattributed Rambam quote undermines trust in a Torah-learning platform's source accuracy.
Recommended change: Verify against a second source and correct the citation to Shemoneh Perakim if confirmed (or keep "Guide for the Perplexed" if I'm wrong -- flagging with high but not absolute confidence, as noted above).
Specific file: curriculum/canon-journey.json, session id `wider-world`
---
Priority: Low
Area: source accuracy
Problem: Two lower-confidence citation items from a deeper pass through tefillah-arc.js and halakha-arc.js: (1) tefillah-arc.js cites "הַקּוֹרֵא אֶת שְׁמַע וְלֹא הִשְׁמִיעַ לְאָזְנוֹ" as Mishnah Berakhot 2:1 -- my recollection is this line is Mishnah Berakhot 2:3, and 2:1 is actually about someone interrupted mid-Torah-reading by Shema time. (2) halakha-arc.js cites "מִנַּיִן לִבְרָכָה?" as verbatim Berakhot 35a -- the daf is right for the topic (the biblical source for blessings before eating), but I'm not fully certain this exact phrasing is verbatim Gemara text versus a reasonable paraphrase.
Why it matters: Same category as the Rambam finding above but lower stakes and lower confidence -- worth a quick verification pass rather than treating as confirmed.
Recommended change: Verify Mishnah Berakhot 2:1 vs 2:3 against a text database; confirm or reword the Berakhot 35a phrase to match the actual Gemara language or relabel it as a paraphrase.
Specific file: tefillah-arc.js (step "Practice and intention"), halakha-arc.js (step "Gemara reasoning")
---

### High-value learner improvements

---
Priority: Medium
Area: curriculum
Problem: Across the Berakhot units, distractors are sometimes eliminable by general English test-taking logic without needing real Hebrew/source comprehension (e.g. a distractor like "A final ruling with no examples" is obviously wrong regardless of whether the learner understood the cited Hebrew).
Why it matters: `docs/content-quality-standard.md` requirement #4 asks for distractors that "represent plausible misunderstandings." Weak distractors let a learner pattern-match their way to a correct answer without demonstrating the comprehension the question is meant to evidence, quietly weakening the mastery signal across many otherwise well-built lessons.
Recommended change: Pass over distractors in the Berakhot units (and likely other arcs, since I only sampled Berakhot deeply) and replace the weakest ones with distractors built from real, plausible misreadings of the specific Hebrew/Aramaic in question -- e.g. a distractor that misidentifies the grammatical role of the actual word being tested, not a generic wrong answer.
Specific file: berakhot-deep.js, berakhot-unit-2.js through berakhot-unit-5.js (sampled); likely worth spot-checking other arcs too
---
Priority: Medium
Area: curriculum
Problem: `eruvin-arc.js`/`eruvin-arc.html` and `tefillah-arc.js`/`tefillah-arc.html` have zero occurrences of the study-aid/halakhic-boundary language anywhere in their lesson content or HTML template, unlike `shabbat-arc.js`, `sukkah-arc.js`, `pesachim-arc.js`, `bava-metzia-arc.js`, and `chumash-arc.js`, which all include it somewhere. The boundary line turns out to be authored per-page rather than inherited from the shared `course-engine.js` template, so this inconsistency wasn't automatic.
Why it matters: Eruvin specifically teaches concrete measurement thresholds (the 20-cubit rule) that determine real carrying-boundary validity -- exactly the kind of practically consequential detail a learner could mistake for enough information to judge their own neighborhood's eruv status. Tefillah is lower-stakes but still touches practical prayer questions.
Recommended change: Add the same boundary language pattern used in the other arcs (e.g., a closing step or footer note) to eruvin-arc and tefillah-arc. Might be worth checking the remaining un-sampled arcs (halakha, chumash already confirmed present) for the same gap while in there.
Specific file: eruvin-arc.js / eruvin-arc.html, tefillah-arc.js / tefillah-arc.html
---

### Future enhancements

---
Priority: Low
Area: curriculum
Problem: `curriculum/berakhot-onramp.json`, `curriculum/berakhot-unit-1.json`, and (confirmed in this later pass) `curriculum/gemara-runway.json` are all dead data -- no live HTML/JS references any of the three (only served by unused API routes). The first two appear superseded by `berakhot-deep.js` and friends; `gemara-runway.json` (a 5-stage tractate-sequencing roadmap -- content itself is fine, just unused) looks superseded by `data/advanced-gemara-sequence.json`, which `gemara-continuation.js` actually uses.
Why it matters: No learner impact, but they're stale artifacts that could confuse a future contributor into thinking they're live content, and there are now three of them instead of two.
Recommended change: Delete all three files and their now-unused `/api/curriculum/berakhot-onramp`, `/api/curriculum/berakhot-unit-1`, and `/api/curriculum/gemara-runway` routes in `server.mjs`, or explicitly document why they're kept.
Specific file: curriculum/berakhot-onramp.json, curriculum/berakhot-unit-1.json, curriculum/gemara-runway.json, server.mjs
---

### Not yet reviewed (out of scope for this pass)

Update after a follow-up deeper pass (2026-07-11, later same day): full content read-through completed for chassidus-arc, history-arc, widerworld-arc, chumash-arc, halakha-arc, tefillah-arc, pesachim-arc, sukkah-arc, eruvin-arc, plus `data/tractate-labs.json` (Shabbat/Pesachim/Eruvin/Bava Metzia/Sukkah/Ketubot/Bava Kamma/Chullin/Niddah) and `data/exercise-bank.json`. Genuinely still not reviewed: `curriculum/gemara-runway.json`'s actual question content, shabbat-arc.js content (only spot-checked live, not read in full), and anything in `phase-checkpoint.*` beyond the shuffle finding, `gemara-continuation.*`, `remediation.*`, `cross-tractate.*`, `daf-notebook.*`, or `daf-workbench.*`.

### Clean

- All Hebrew/Aramaic and citations checked against known text across this and the follow-up pass -- now roughly 20 distinct citations across 10 tractates (Berakhot, Shabbat, Eruvin, Pesachim, Sukkah, Bava Metzia, Bava Kamma, Ketubot, Chullin, Niddah) plus Tanakh (Genesis 22:1, Jeremiah 29:7, Deuteronomy 4:39/6:4/6:5/6:7/8:10, Micah 6:8, Psalms 27:4/2:11, Proverbs 20:27) and Pirkei Avot (1:2, 2:1, 2:5, 4:2) -- all accurate except the two flagged above. Notably, `tractate-labs.json`'s Chullin and Niddah labs both independently include their own explicit "keep the boundary" step for their sensitive subject matter (kosher slaughter, family purity) without being asked to -- good evidence the missing boundary language in eruvin-arc/tefillah-arc is a page-specific oversight, not a systemic disregard for the principle.
- Integration design in `canon-journey.json` is genuinely strong: every session is explicitly labeled by lens/discipline, and questions actively teach learners to preserve distinctions rather than collapse them (e.g. "It stops being a Torah verse" is a wrong answer when a verse enters the Siddur).
- The study-vs-personal-ruling boundary is taught as real content (not just a disclaimer) in canon-journey's `halakha-reasoning` session and in `halakha-arc.js`.
- Mussar and Chassidus arcs share sources deliberately (Pirkei Avot 2:1, 2:5) and each time explicitly name that the same source raises a different, equally serious question in the other subject -- disciplined, non-flattening integration, not just topical overlap.
- Wider-world arc (methodology aside from the one citation error) is a strong model of `docs/learning-expansion-sequence.md` item 6's comparative-precision standard: it explicitly teaches naming a shared question before claiming equivalence, and revisits the same verse (Jeremiah 29:7) with progressively more categories in view across the History and Wider-World arcs -- good spaced pedagogy, not just repetition.
- Every one of the 9 tractates sampled in `tractate-labs.json` (a format entirely separate from the course-engine arcs) opens with a verbatim, correctly-cited Mishnah line -- Bava Kamma's "אַרְבָּעָה אָבוֹת נְזִיקִין," Chullin's "הַכֹּל שׁוֹחֲטִין," Niddah's "כָּל הַנָּשִׁים בְּחֶזְקַת טָהֳרָה," and Ketubot's "בְּתוּלָה נִשֵּׂאת לְיוֹם הָרְבִיעִי" all checked out exactly.

---

## Claude: Gemara-focused deep-content batch (2026-07-12)

User directed a 3-hour focused session on Gemara-only content expansion (30-step internal plan; steps 1-5 completed and pushed so far). All commits verified live via click-through before pushing.

1. **`daf-workbench.js`/`.html`**: Added a `bava-kamma` source entry (4 lines mapped to the workbench's Mishnah case / Legal distinction / Context question / Response roles). Fixed a real staleness bug found while doing this: the `.tractates` button list was hardcoded to 2 of 6 supported tractates in the HTML, so eruvin/pesachim/sukkah/bava were only reachable via direct URL query param. Buttons now render dynamically from `Object.keys(sources)`.
2. **`data/canon-synthesis.json`**: Added a new checkpoint (`synthesis-damage`) pairing Exodus 21:28 (the goring-ox law, verified via Sefaria) with Bava Kamma's differentiation clause -- same case-to-category reading move as the existing Berakhot/Shema pairing. Updated `test/canon-synthesis.test.mjs`'s checkpoint-count assertion 8 -> 9.
3. **Ketubot, Chullin, Niddah promoted from 3-step opening-Mishnah labs to full 9-10 step tractate arcs** (`ketubot-arc.html/js`, `chullin-arc.html/js`, `niddah-arc.html/js`), each wired into `data/gemara-tractates.json` (`stage: tractate-arc`, `arcUrl` added). All new Hebrew/citations verified via WebSearch/Sefaria before writing:
   - **Ketubot**: extends the existing "why Wednesday" question to the real Gemara answer (courts sat Mon/Thu, Ketubot 2a) *and* the real counter-consideration (three days to prepare the wedding feast, out of concern for the bride's `כְּבוֹדָהּ`) -- a genuine two-values-balanced reading, not a single flat answer.
   - **Chullin**: builds out the Mishnah's own rule/exception/condition structure -- "all may slaughter," the exception for a deaf-mute/imbecile/minor ("lest they spoil it," `שֶׁמָּא יְקַלְקְלוּ`), and the supervision clause that reopens the rule (`וְכֻלָּן שֶׁשָּׁחֲטוּ וַאֲחֵרִים רוֹאִין אוֹתָן`) -- shows the concern was reliability, not fixed personal status.
   - **Niddah**: built on the tractate's *actual* opening, a three-way Tannaitic dispute (Shammai `דַּיָּהּ שְׁעָתָהּ` / Beit Hillel `מִפְּקִידָה לִפְקִידָה` / the Sages' middle position) about how far back to measure a period of uncertainty -- teaches holding three positions without flattening, mirroring the Akiva/Ben-Azzai machloket skill from the Chassidus arc.
   - **Found and fixed a citation error** in the process: `data/tractate-labs.json`'s niddah lab had labeled "`כָּל הַנָּשִׁים בְּחֶזְקַת טָהֳרָה`" as Mishnah Niddah 1:1; it's actually Mishnah Niddah 2:4 (the real 1:1 is the Shammai/Hillel dispute now used in the new arc). Corrected `ref` and `sourceUrl`.
4. Updated `README.md`'s tractate-arc count/description (six -> nine gateway tractates).

Full test suite passing (47/47) after each step. Next up per the 30-step plan: labs for uncovered tractates (Sanhedrin, Gittin, Kiddushin, Bava Batra, Yevamot, Avodah Zarah, Yoma, Rosh Hashanah, Taanit, Megillah), then deepening the 5 existing single-daf arcs beyond their opening page.

**Update (same session, steps 6-15 complete):** Added 3-step opening-Mishnah labs to `data/tractate-labs.json` for all 10 tractates listed above, wired via `labId` in `data/gemara-tractates.json` (they remain `stage: tractate-labs`, not promoted to full arcs -- that was intentionally out of scope for this batch). Every opening Mishnah and follow-on reasoning point verified via WebSearch/Sefaria: Sanhedrin's court-size scaling (3 vs. 23 judges), Gittin's overseas-get declaration (Rabbah/Rava's witness-availability reasoning), Kiddushin's 3-ways-in/2-ways-out asymmetry, Bava Batra's shared-wall-placement-encodes-obligation reading, Yevamot's 15-category exemption mechanism, Avodah Zarah's 3-day commercial restriction (explicitly framed as historical/legal literacy about an ancient context, not commentary on any living faith), Yoma's 7-day Kohen Gadol separation and its disqualification-risk reasoning, Rosh Hashanah's four new years each solving a distinct dating problem, Taanit's rain-prayer timing dispute (R. Yehoshua's Sukkot-symbolism reasoning), and Megillah's 5-day reading range (market-day logic that explicitly transfers back to the new Ketubot arc). Sanhedrin/Gittin/Kiddushin/Yevamot each include an explicit study-vs-practical-guidance boundary step given their subject matter (capital law, divorce, marriage, family status). Full test suite passing (49/49); live click-through confirmed on Sanhedrin and Megillah, API-shape verified on all 10.

Gemara tractate coverage is now: 9 full arcs (Berakhot's 5-unit course + Shabbat, Eruvin, Pesachim, Sukkah, Bava Metzia, Bava Kamma, Ketubot, Chullin, Niddah) + 15 opening-Mishnah labs (the original 9 sampled above, minus the 3 promoted to arcs, plus these 10 new ones) + 17 tractates still showing "Guided sugya selected by the editorial team" with no real content (Beitzah, Moed Katan, Chagigah, Nedarim, Nazir, Sotah, Makkot, Shevuot, Horayot, Zevachim, Menachot, Bekhorot, Arakhin, Temurah, Keritot, Meilah, Tamid -- mostly Kodashim/Taharot, lower pilot priority).

**Update (same session, steps 16-20 complete):** Deepened `shabbat-arc.js`, `eruvin-arc.js`, `pesachim-arc.js`, `sukkah-arc.js` beyond their opening Mishnah -- each previously stopped at Mishnah 1:1. Inserted 2 verified steps per arc drawn from each tractate's real Mishnah 1:2, before the existing Transfer step: Shabbat's pre-Mincha timing restriction (a genuine topic shift within the tractate, not a continuation of the domains case); Eruvin's Beit Shammai/Beit Hillel dispute over an alley's kashering markers (lechi/korah, a real "and" vs. "or" machloket); Pesachim's "אֵין לַדָּבָר סוֹף" (there is no end to the matter) limiting principle bounding the chametz-search obligation; Sukkah's Rabbi Eliezer/Sages dispute over a roofless, tent-shaped sukkah. Step counts rose to 10/12/11/11; HTML count placeholders updated to match. All Hebrew verified via WebSearch/Sefaria. Full click-through confirmed on all 4 arcs; full test suite passing (52/52).

**Update (same session, steps 21/23/24 complete -- foundational Gemara-logic content):**
- **`gemara-toolkit.js`** expanded from 10 to 13 steps: added `אִי הָכִי` (if so -- accept-the-premise-then-press-it), `וְהָתַנְיָא` (but it was taught -- a contradicting cited source), `אֶלָּא אָמַר` (rather, he said -- a prior answer replaced). HTML count fixed 10->13.
- **New `gemara-middot.html/js`** (12 steps): six of the thirteen middot from the Baraita d'Rabbi Yishmael (recited daily) -- kal vachomer (grounded in a real Torah example, Numbers 12:14's a fortiori argument about Miriam), gezeirah shavah, binyan av, and the three klal/prat patterns. The transfer step deliberately connects binyan av's "shared aspect" idea to the literal phrase `הַצַּד הַשָּׁוֶה שֶׁבָּהֶן` already used in the Bava Kamma arc, while explicitly flagging that shared language doesn't imply an identical technical procedure -- a close-reading caution, not a claimed equivalence. Includes a study-vs-halakhic-derivation boundary step. Linked from `gemara-toolkit.js`'s completion screen.
- **New `daf-literacy.html/js`** (10 steps): the standard printed Talmud page layout -- centered Mishnah/Gemara, Rashi (inner margin), Tosafot (outer margin), the Ein Mishpat/Masoret HaShas cross-reference columns, and the daf/amud citation convention. Includes a distinction step correcting the common misconception that "Rashi script" is Rashi's own handwriting (it's a later printers' typeface). Linked from `gemara-middot.js`'s completion screen.

All content verified via WebSearch/Sefaria before writing; live click-through confirmed on every new/expanded unit. **Flagging for Codex, not fixed (out of scope for this Gemara-only session):** `test/daily-canon-studio.test.mjs` now fails -- expects `data/daily-canon-studio.json`'s `paths.length` to be 4, actual is 6. Confirmed via `git log`/diff that this file was not touched by any of my Gemara work; looks like a path was added to the canon-studio rotation without updating the test's count assertion. Full suite otherwise passing (56/57). **Resolved on its own**: as of the next commit in this batch, this test passes again (56->57 total, all green) -- Codex must have fixed it independently mid-session.

**Update (same session, step 22 + step 26 complete; step 25 investigated and out of scope):**
- **New `aggadata-oven-of-akhnai.html/js`** (12 steps): the "lo bashamayim hi" narrative (Bava Metzia 59b) -- Rabbi Eliezer's escalating evidence (a carob tree, a Heavenly Voice), Rabbi Yehoshua's verse-grounded rejection of even divine-voice evidence, God's "My children have defeated Me" response, and -- treated with real gravity -- the story's own honest accounting of what the decision cost (Rabbi Eliezer's exclusion, crop damage, Rabbi Akiva's careful delivery of the news). Includes an aggadata-specific responsible-reading boundary step, distinct from the halakhic non-psak boundary language used elsewhere. Linked from `bava-metzia-arc.js`'s completion screen. All content verified via WebSearch/Sefaria; live click-through confirmed.
- **`data/advanced-gemara-sequence.json`** extended with `ketubot-tractate-arc`, `chullin-tractate-arc`, `niddah-tractate-arc`. This was a real, previously-unnoticed gap: these 3 tractates were promoted from labs to full arcs earlier in this session but were never added to this sequence, so `gemara-continuation.js`'s `nextGemaraArc` would never have routed a learner to them after Bava Kamma. Verified live via `/api/curriculum/advanced-gemara-sequence`; `curriculum-engine.test.mjs` still passing (4/4).
- **Step 25 (`data/exercise-bank.json` review-variant coverage) investigated and intentionally skipped**: confirmed via grep that this file has zero live consumers (no server route in `server.mjs`, no JS reference anywhere) -- it's dead design data, same category as `curriculum/berakhot-onramp.json`/`berakhot-unit-1.json`/`gemara-runway.json` flagged in an earlier QA pass. Adding content to it would have no learner-facing effect. Recommend either wiring it into the actual review-queue flow or deleting it alongside the other three dead files, at Codex's discretion.

---

## Claude: audit + cross-tractate + orphan sweep (2026-07-12, user-directed follow-up)

User asked for a prioritized "what's next" list; picked audit-Codex's-surfaces, finish-the-3-deferred-Gemara-steps, Supabase-isolation-testing, and dead-data-cleanup. This entry covers the first two (both in the Gemara/content lane).

**Auditing Codex's newer non-Gemara surfaces** (canon-labs, canon-synthesis, phase-checkpoint, remediation, daf-notebook, cross-tractate) found citations all clean (spot-checked `data/non-gemara-anchor-units.json`'s ~20 citations, all accurate) and phase-checkpoint's shuffle logic correctly safe -- but surfaced 2 real, live bugs, both fixed:
1. `daf-notebook.js`'s tractate-routing fallback used `context.includes('bava')`, which also matches `'bava-kamma'` source contexts (added earlier this session) -- a Bava Kamma annotation's "Open source again" link silently pointed back to the Bava Metzia workbench instead. Added an explicit `bava-kamma` check before the generic `bava` check.
2. `gemara-continuation.js` built its "Practice on the Daf Workbench" links from `workbenches[index]`, a hardcoded 6-entry array positionally matched against `advanced-gemara-sequence.json`'s steps. Bava Kamma (index 6) was already broken before this session; this session's 3 new sequence additions (Ketubot/Chullin/Niddah) would have produced 3 more silent `tractate=undefined` links. Replaced with an explicit `stageId -> tractate` map. Fixing this exposed that `daf-workbench.js` had no source entries for ketubot/chullin/niddah at all, so those links would have silently rendered Berakhot content under a mislabeled context -- added proper 4-line entries for all three, reusing verified content from their tractate arcs.

**Finishing the 3 deferred Gemara steps:**
- **Cross-tractate transfer**: `cross-tractate.html` already existed (Codex-built, functional) but was completely unlinked anywhere in the app -- a real orphan. Extended its exercise from 4 to 7 tractates (added Bava Kamma, Chullin, Ketubot) and linked it from `gemara-continuation.js`, gated behind 3+ completed tractates.
- **Shas literacy checkpoint**: new `shas-literacy-checkpoint.html/js`, a 12-tractate placement-recognition capstone (distinct skill from cross-tractate's role-recognition: "which tractate is this phrase from," not "what job is this line doing"). Covers all 10 sequence tractates plus Sanhedrin and Yoma. Linked from `gemara-continuation.js`, gated behind completing the entire sequence.
- **Full orphaned-reference sweep**: wrote a script checking all 99 `.html` files for zero inbound references (static or dynamic) anywhere else in the codebase. Found and fixed 5 more genuinely orphaned, fully-functional pages: `berakhot-lab.html` (deliberate-practice lab), `gemara-lexicon.html` (vocabulary glossary), `canon-studio.html` (cross-canon source studio -- confirms the Rambam-citation fix made earlier this session was landing on an unreachable page), `sugya-checkpoint.html` (independent whole-sugya checkpoint, also had a duplicate `href` attribute on its font `<link>`, now fixed). All 4 now linked into the Gemara-toolkit/berakhot/gemara-continuation flow. **Not fixed, flagged for Codex**: `daily-wrap.html` is also orphaned but belongs to a large, unrelated pilot/daily-flow subsystem (`learner-dashboard.html`, `notebook.html`, `daily-router.html`, `thirty-day.html`, etc.) outside this session's scope.
- While testing `berakhot-lab.html`, diagnosed a stale-process issue: its API route and data file were both correct on disk, but the long-running dev server predated the route being added, so it 404'd until restarted -- the same module-caching gotcha documented earlier this session, here affecting `server.mjs` itself rather than a data import.

**Note on concurrent activity**: this pass ran alongside substantial, still-uncommitted Codex work (`tractate-mastery.html/js`, a `thirty-day`/`daily-canon`/`learner-dashboard`/`pilot-path` subsystem, many new test files). Confirmed via `git status --short` before every commit that only files this session actually touched were staged. `shabbat-arc.js` and `pesachim-arc.js` were mid-edit by Codex (changing their `nextUrl` from `daf-workbench.html` to a new `tractate-mastery.html`) during this pass -- left untouched. Worth a fresh orphan-sweep re-run once Codex's current batch lands, since it will shift what's reachable.

Full test suite passing (75/75) throughout.

**Session summary so far:** Gemara went from 6 full tractate arcs / 9 opening-Mishnah labs / no foundational-logic content, to **9 full arcs + 4 deepened-beyond-opening-daf + 15 opening labs + 3 new foundational units** (Gemara-toolkit expansion, 13 Middot, daf-page literacy) **+ 1 Aggadata unit**, all cross-linked, all curriculum-sequence-wired, all verified live and via WebSearch/Sefaria before writing. Full test suite: 61/61 passing. Remaining from the original 30-step plan (steps 27-30: cross-tractate transfer exercises spanning 3+ tractates, a "Shas literacy" checkpoint, a final orphaned-reference sweep) are lighter-weight and can be picked up in a follow-up session.

---

## Claude: Supabase audit + dead-data cleanup (2026-07-12, same follow-up session)

Completing the last two items from the user's prioritized list (#5 Supabase isolation, #8 dead-data cleanup).

**#5 -- Supabase account-isolation audit**: no live Supabase credentials exist in this environment (`SUPABASE_URL`/`SUPABASE_ANON_KEY` unset), so a real cross-account test could not be run here. Did a full code/policy audit instead, confirming a sound three-layer design: `data/supabase-adapter.mjs` never holds a service-role key (every request uses the anon key + the learner's own access token); `server.mjs`'s `learnerAccess` verifies the bearer token against Supabase's real `/auth/v1/user` and rejects a URL-supplied ID that doesn't match the token's actual user; `data/supabase-learner-repository.mjs` never trusts a client-supplied ID for the Supabase queries themselves (always derives it from the verified token); RLS on all 6 tables backstops all of the above at the DB layer. This is a sound design on paper but genuinely unverified end-to-end. Wrote an 8-step runbook in `supabase/README.md` ("Account isolation verification") with exact curl commands for two-real-account cross-read/write testing -- **this still needs to be run by whoever has the live Supabase project** (updated `docs/pilot-readiness.md` to point at it and to distinguish "two accounts persist independently" from "two accounts can't see each other," which the old wording conflated). Also fixed a real setup-doc gap: `005_learning_artifacts.sql` was missing from the README's ordered migration list.

**#8 -- Dead-data cleanup**: re-verified (given how much changed mid-session) that `curriculum/berakhot-onramp.json`, `curriculum/berakhot-unit-1.json`, `curriculum/gemara-runway.json`, and `data/exercise-bank.json` were all still unreferenced by any frontend code. Deleted all 4 -- each is superseded by clearly-better live content (berakhot-deep.js + unit chain, advanced-gemara-sequence.json), not just unbuilt. **Also removed the 3 now-pointless server.mjs routes that served the 3 deleted curriculum files** (verified live: they now 404 cleanly instead of throwing a formatted 500 ENOENT) -- **but this server.mjs edit is only in the working tree, not committed**, since server.mjs currently carries ~94 lines of unrelated, uncommitted, in-progress Codex work (the new tractate-mastery/thirty-day/daily-canon/learner-dashboard/pilot-path subsystem) that shouldn't be bundled into a Claude-authored commit. **Codex: when you next commit server.mjs, the 3 dead routes (`berakhot-onramp`, `berakhot-unit-1`, `gemara-runway`) are already removed in your working copy -- no action needed, just confirm they don't reappear from an older buffer.**

Full test suite passing (76/76) after a server restart (the same module-caching gotcha again -- the running process pre-dated both my server.mjs edit and, it turned out, several of Codex's own recent server.mjs changes).

---

## Claude: navigation pass (2026-07-12, same session, "reconnect and continue")

Picked up item #4 from the original 8-point list (navigation/discoverability), since it's the only remaining item clearly in my own lane (#1 pilot and #6 mobile a11y need the user or Codex; #7 analytics not started).

Verified via `shas-map-v2.html` click-through that all 24 tractates touched this session (9 full arcs including Ketubot/Chullin/Niddah/Bava Kamma, 10 new labs) route correctly -- no gaps in the stable tractate picker. `gemara-toolkit.html` (entry to the toolkit -> middot -> daf-literacy -> sugya-checkpoint chain) is properly linked from `berakhot-arc.js` and `mastery.js`, so that chain is discoverable through the normal course flow, not just by luck.

One real gap found and fixed: `gemara-continuation.html` -- the hub carrying this session's cross-tractate transfer, Shas literacy checkpoint, and canon-studio links -- was only reachable via `daf-workbench.html`'s header or a new, uncommitted `tractate-capstone.html` (Codex WIP, see below). Added it to `seder.html`'s "go deeper" section.

**Flagging, not fixing -- actively mid-construction, high collision risk**: found `tractate-mastery.js` and `tractate-capstone.js` (new, uncommitted Codex files implementing a unified "Source trail -> Working Daf -> Deliberate practice -> Cross-tractate transfer -> Independent capstone" loop per tractate). Both have their own per-tractate data list covering 7 tractates (shabbat, pesachim, eruvin, sukkah, bava-metzia, bava-kamma, berakhot) -- missing Ketubot, Chullin, and Niddah, the 3 tractates promoted to full arcs this session. Did **not** add entries myself: only 2 of the 7 listed tractates (`shabbat-arc.js`, `pesachim-arc.js`) have actually had their `nextUrl` switched over to `tractate-mastery.html` so far, meaning this is clearly a migration Codex is actively working through tractate-by-tractate, not a finished feature with an oversight. Adding Ketubot/Chullin/Niddah myself risked either duplicating what Codex was about to do next or conflicting with a structure I don't have full visibility into mid-build. **Codex: when you get to migrating Ketubot/Chullin/Niddah, their skill IDs are `ketubot-schedule/ketubot-court-access/ketubot-second-concern/ketubot-structure/ketubot-independent-map`, `chullin-subject/chullin-scope/chullin-exception/chullin-reason/chullin-supervision/chullin-structure/chullin-independent-map`, and `niddah-opening-position/niddah-counter-position/niddah-middle-position/niddah-hold-three/niddah-presumption-source/niddah-connect-principle/niddah-independent-map` respectively (see the arc.js files for the full list) -- happy to help pick the representative 5 for `tractate-mastery.js`'s `skills` array if useful.**

Full test suite passing (76/76).

---

## Claude: mobile/accessibility pass (2026-07-12, same session, user said "go for it")

Picked up #6 from the original 8-point list. Note up front: this environment's browser tooling has real limitations -- `computer{action:"screenshot"}` timed out on every attempt, `resize_window` reports success but `window.innerWidth` doesn't actually follow the requested size (confirmed on two separate tabs; `outerWidth`/`screen.width` do change, but the content viewport doesn't), and synthetic Enter/Space keyboard events don't trigger native `<button>` default-action behavior. So this is a real but partial pass: static CSS analysis + simulated-width DOM testing + keyboard-structure verification, not full visual/device testing. A human should still do a real-device pass before a wide pilot.

**Found and fixed one real, concrete bug**: `daf-workbench.css`'s `.tractates{display:flex;gap:8px}` had no `flex-wrap`. This was low-risk when the button list was 2 hardcoded buttons, but this session's earlier fix (making the list render dynamically from `Object.keys(sources)`) grew it to 10 tractates -- flexbox defaults to `nowrap`, so all 10 buttons would try to fit on one line, guaranteeing horizontal overflow on any realistic screen width, not just mobile. Added `flex-wrap:wrap`. Verified via simulated 320px-width DOM testing (temporarily constrained the container, checked button `getBoundingClientRect()` positions): 10 buttons now wrap into 4 rows, zero overflow, versus all 10 forced onto one line before.

**Verified clean, no changes needed**:
- `deep-course.css` (used by all 9 tractate arcs + this session's foundational units) and `daf-workbench.css` have exactly one mobile breakpoint each (`max-width:720px`/`760px`) that correctly collapses two-column grids to single-column and hides/reflows secondary content. No unconditional fixed-widths wider than what those breakpoints allow for.
- `.status` bar (mode label + progress bar + step count) doesn't overflow at simulated 320px even with this session's longest mode label ("RESPONSIBLE LEARNING").
- All answer/continue/translate controls across the pages checked are native `<button>` elements with default tabIndex (not `<div onclick>`), correct visible Tab order (header nav -> XP -> translate toggle -> answer buttons -> continue), and no interfering `keydown`/`keypress` listeners anywhere except the one legitimate case (Enter-to-submit on the typed-recall text input in `course-engine.js:54`). Confirmed programmatic `.click()` on a focused button works correctly and updates feedback/XP/continue-button state as expected -- the gap is specifically synthetic-key-to-native-click translation in this tool, not the app.
- Hebrew text correctly carries `dir="rtl"` and `lang="he"` on both course-engine source cards (`#hebrew`) and Daf Workbench line buttons (`.daf-line span`), spot-checked on Ketubot and Chullin.

**Not done, still needed**: a real mobile device or working browser-zoom test (200%), and an actual physical/real-keyboard-only click-through, since this environment couldn't exercise either. The 320px/keyboard-structure checks above are a reasonable proxy but not a substitute.

Full test suite passing (80/80).

---

## Claude: aggregate analytics dashboard (2026-07-12, same session, #7)

User picked #7 from the "what's next" list. Before building anything, checked whether this already existed: confirmed via `test/pilot-analytics.test.mjs`/`test/pilot-transfer-metrics.test.mjs` and `server.mjs` that Codex already built solid **per-learner** analytics (`GET /api/learners/:id/pilot-analytics`, consumed by `learner-dashboard.js`) -- attempts, accuracy, misses-by-skill, repairs, independent-encounter accuracy, capstones, streak. Did not duplicate this. What was genuinely missing: **operator-facing aggregate** analytics (across all learners, not one) -- asked the user to pick a scope given the real architectural wrinkle (Supabase RLS correctly prevents any in-app cross-learner query in hosted mode); they chose "local-mode aggregate dashboard."

**Shipped and committed** (`analytics.html/js/css`, clean standalone files, no entanglement): an admin page at `/analytics.html` reading `GET /api/admin/analytics`. Shows total learners/XP/attempts/accuracy, overdue review backlog, per-Gemara-tractate engaged-vs-completed with drop-off highlighting, every completed stage across all learners, and aggregate top-struggling skills. Verified live against real accumulated session data (2 learners, 232 attempts) -- correctly showed Bava Metzia as engaged-but-not-completed (1 drop-off) while Shabbat/Eruvin/Pesachim/Sukkah/Ketubot/Bava Kamma/Chullin/Niddah all showed 0 drop-off, matching what was actually clicked through this session.

**Real bug caught while building this**: `tractate-labs.json` labs (served via `lab.js`) never emit any completion/`stage_mastered` event, unlike course-engine arcs -- only `answer_submitted`. So "completed" is genuinely untrackable for lab-only tractates (Yoma, Megillah, Sanhedrin, etc. in the current data), not just zero. Reports `null`/"—" for those instead of a misleading always-0/100%-drop-off, and labels them "(lab only — no completion signal)" in the UI.

**NOT committed -- entangled, same pattern as earlier in this session**: the actual server-side wiring --
- `server.mjs`: new `GET /api/admin/analytics` route (guards on `supabaseConfig().configured`, returns `{available:false, reason:...}` in hosted mode; otherwise computes the aggregates above from `listLearnersFull`)
- `data/repository.mjs`: new `listLearnersFull(root)` export (full local-mode learner records, explicitly documented as having no hosted-mode equivalent and why)
- `test/repository.test.mjs`: new `describe('listLearnersFull', ...)` block testing it returns full records (events array, real mastery data), not the `listLearners` summary shape

All three are fully written, syntax-checked, and verified live/via the full test suite (89/89 passing in the working tree) -- but both `server.mjs` and `data/repository.mjs` currently carry substantial unrelated, uncommitted Codex work (server.mjs: ~15 new curriculum routes; repository.mjs: a new `artifacts` journey-marker system) too interleaved with these specific hunks to extract cleanly via patch. **Codex: these three files' current working-tree content already includes this feature correctly -- no action needed beyond your normal next commit of server.mjs/repository.mjs picking it up. The exact new code**: `listLearnersFull` sits directly after `listLearners` in `data/repository.mjs` (returns `Object.values(learners).map(normalizedLearner)`, no summary-flattening); the `/api/admin/analytics` route sits directly after the existing `/api/learners/:id/pilot-analytics` route in `server.mjs`.

Full test suite passing (89/89). One incidental cleanup: killing a stale server process to reload route changes surfaced 21 accumulated `node.exe` processes on this machine (only one can hold port 4180; the rest were orphaned duplicates from this session's many restarts) -- killed them all, server came back up healthy. Not urgent, but worth knowing this session's restart pattern left that many zombies.

---

## Claude: full Shas coverage + pilot-launch prep (2026-07-12, same session, user said "Do 1 and 2, I'll handle Supabase with Codex")

**#1 -- full Gemara content coverage.** Added opening-Mishnah labs for the last 17 uncovered tractates (Beitzah, Moed Katan, Chagigah, Nedarim, Nazir, Sotah, Makkot, Shevuot, Horayot, and all 8 of Seder Kodashim: Zevachim, Menachot, Bekhorot, Arakhin, Temurah, Keritot, Meilah, Tamid). **All 37 Bavli tractates now have real content** -- zero remaining "Guided sugya selected by the editorial team" placeholders (verified programmatically). Same sourcing discipline as the rest of this session: every opening Mishnah and follow-on reasoning point verified via WebSearch/Sefaria before writing. Several genuine, previously-unnoticed cross-tractate connections found and used directly (not invented): Shevuot's "two that are four" opening is verbatim identical to Shabbat's; Nazir's opening is a structural repeat of Nedarim's; Chagigah reuses the exact "חוץ מחרש שוטה וקטן" exception clause already in the Chullin arc; Menachot deliberately parallels Zevachim's intention-versus-validity structure; Horayot's "exempt because he relied on the court" connects to the Oven of Akhnai aggada's institutional-authority theme. Sotah (a historically sensitive tractate) gets a dedicated boundary step. README updated to reflect full 37-tractate coverage. Live click-through confirmed on 2 tractates with different content shapes (Beitzah, Sotah); full test suite passing (93/93).

**#2 -- pilot-launch prep.** Traced the actual first-time-visitor experience live (cleared localStorage, reloaded) rather than assuming it works. Found a real, previously-undocumented risk: `Seder.currentLearnerId()` falls back to a **shared `demo` account** for anyone not signed in via Supabase without a locally-created profile, and `seder.html` has no visible link to `profile.html` or `sign-in.html` -- a brand-new visitor silently starts using (and overwriting) the same demo record this whole session's testing has accumulated into (confirmed live: a cleared-localStorage visit still showed Level 24, 217 source moves). Documented this clearly in `docs/pilot-readiness.md` as a hard requirement: **the real pilot must run in hosted Supabase mode**, not a bare local-mode link, since local mode has no per-visitor isolation at all. Added a concrete 5-step launch sequence tying together everything verified this session (the isolation runbook, health-check confirmation, sign-in-first invite links, full content readiness, where to check engagement data).

Also verified (no bug, just confirmation, prompted by re-examining `seder-auth.js`): Codex has its own mobile-responsive system, `Seder.applyMobileStudyStyles()`, injected globally via `seder-auth.js` on every page. Checked it against this session's earlier `daf-workbench.css` `.tractates` flex-wrap fix for a conflict -- there isn't one: mine (unconditional `flex-wrap:wrap`) covers >760px, Codex's (`@media(max-width:760px)`, `nowrap` + horizontal scroll) covers <=760px. Live-tested both ranges at their actual computed styles: zero button overflow either way.

Full test suite passing (93/93) throughout this batch. Session total from the original 30-step Gemara plan plus the 8-point "next level" list: 9 full tractate arcs, 4 deepened arcs, 28 opening-Mishnah labs (full 37-tractate Shas coverage), 4 new foundational/narrative units, cross-tractate transfer + Shas literacy checkpoint, an aggregate analytics dashboard, a full Supabase isolation audit + runbook, and roughly a dozen real bugs found and fixed across both my own and Codex's code.

---

## Claude: non-Gemara parity pass -- 2 severe mastery-integrity bugs found (2026-07-12, same session, Supabase blocked by a site error, user said "continue raising the non-Gemara tracks to the same standard")

While auditing Codex's pilot subsystem (`daily-router.js`, the homepage's primary "See today's next step" destination -- see previous entry), found `canon-course.js` (the non-Gemara six-session course engine: Tefillah, Jewish Thought, History, Responsibility, and the base canon courses) had the **exact same mastery-integrity bug** fixed in `placement.js`/`phase-checkpoint.js` earlier this session, just never caught in this file: multiple-choice answers rendered in fixed, unshuffled original order, checked against a fixed `correct` index. Checked the actual data across all 5 source files -- **all 36 sessions with a `correct` field have `correct: 0`** -- meaning a learner could click the first button on every question across every non-Gemara six-session course and score 100% with zero comprehension. Fixed with the established `shuffle({text, originalIndex})` pattern; live-tested choice order varies across reloads and the true correct answer is still credited regardless of shuffled position.

Ran a full systemic sweep for the same pattern across every JS file with choice-rendering logic (not just this one), the same discipline as the original session-wide shuffle-bug check. Found 9 suspects, resolved all: **`canon-synthesis.js` and `sugya-checkpoint.js`** use `<select>` dropdowns with text-value comparison (immune by construction, not a bug). **`anchor-unit.js`, `berakhot-lab.js`, `canon-deepening.js`, `canon-labs.js`, `canon-practice-lab.js`, `pilot-path.js`** all load `answer-shuffle.js` -- a clever, generic DOM-level shuffle utility (a `MutationObserver` that reorders any `.choices` container's children whenever one appears, independent of the page's own rendering code) -- and use the exact `.choices` class it targets; confirmed live on `canon-labs.html` (`sederShuffled: true`, genuinely randomized order across reloads). **`daily-canon.js`** (the "Daily Capstone" synthesis question, part of the four-step daily routine) does *not* load `answer-shuffle.js` and had the same real bug -- checked `data/daily-canon-studio.json`: all 6 daily paths have `correct: 0`. Fixed with the same shuffle pattern; live-tested the same way.

Also re-swept for the `&apos;`-in-`.textContent` bug (found and fixed once already in `daily-router.js`) across all JS files: only the two already-confirmed-safe `.innerHTML`-context instances (`source-reader.js`, `weekly-review.js`) remain -- that bug class is now fully closed.

Verified citation accuracy across all 5 non-Gemara six-session course data files (`canon-six-session-courses.json`, `tefillah-/thought-/history-/responsibility-six-session-course.json`) -- every citation (Deuteronomy 6:4-7/8:10/30:14/30:19, Mishnah Berakhot 1:1/7:1, Berakhot 2a/35a, Pirkei Avot 2:5/3:15, Psalms 100:2, Jeremiah 29:7/29) matches ones already verified via WebSearch/Sefaria earlier this session. No content errors found -- Codex's non-Gemara sourcing discipline is holding up consistently.

An exhaustive orphaned-link sweep (the same script used earlier in the session) timed out at the current file count (150+) -- not re-run; the targeted checks above were prioritized instead given the severity of what they found.

Full test suite passing (118/118). This closes the most severe outstanding gap between Gemara and non-Gemara QA rigor: both tracks now have the shuffle-bug class fully swept and fixed, not just Gemara.


## 2026-07-12 — Claude: second foundations for Halakha, Chumash, Tefillah (beef-up pass, part 1)

Vision-aligned expansion: the three thinnest non-Gemara subjects each had exactly one arc
and no deepening unit, unlike Mussar/Chassidus/Thought. Built one second-foundation unit
per subject, following the validated mussar-truth pattern (new course page + link embedded
in the first arc's completeCopy, which renders via innerHTML in course-engine.js).

New units (each 10 steps, each ending with a typed production check, all served by
course-engine.js which shuffles answers safely):

- halakha-honor-parents.js/.html — honoring parents as a second source chain:
  Exodus 20:12 (kibud) + Leviticus 19:3 (morah) -> Kiddushin 31b category definitions ->
  Kiddushin 31a Dama ben Netina narrative-as-evidence -> Kiddushin 32a mishel av o mishel
  ben edge case -> Rambam Mamrim 6:3. Sources verified via Sefaria/web search (Dama story,
  kibud/morah distinction, Rambam formulation). Includes RESPONSIBLE LEARNING boundary step
  (real family situations -> qualified guidance). nextUrl: lab.html?tractate=kiddushin
  (lab confirmed present in tractate-labs.json).

- chumash-akeidah.js/.html — narrative close reading as a second Chumash skill (first arc
  taught legal-verse reception): narrator's-knowledge gap (Gen 22:1), three hineni
  instances (22:1, 22:7, 22:11 — verified), escalating epithets (22:2), doubled "vayelchu
  shneihem yachdav" frame (22:6/22:8), load-bearing ambiguity of 22:8, reception via
  Rosh Hashanah 16a shofar-Akeidah link (verified). nextUrl: lab.html?tractate=rosh-hashanah
  (lab confirmed present).

- tefillah-kaddish.js/.html — one prayer in depth (first arc taught the service map):
  Aramaic register, Ezekiel 38:23 echo, Yehei Shemei Rabba as communal center,
  Shabbat 119b (answering with all one's strength — verified), Kaddish forms as service
  punctuation, the no-mention-of-death paradox (verified), minyan requirement. Includes
  boundary step directing real mourning questions to qualified guidance and community.
  nextUrl: berakhot-arc.html.

One-line completeCopy link edits: halakha-arc.js, chumash-arc.js, tefillah-arc.js
(each confirmed to contain only my diff before staging).

Verification: all three pages live-tested at localhost:4180 — 10/10 steps render, RTL
Hebrew renders, answers shuffle (correct answer observed at non-first position), correct
click credits +10 XP and enables Continue, structural data check (correct index valid,
typed steps have acceptable arrays, all steps carry skill/competency) returned zero issues
on all 30 steps. Full test suite: 121/121 pass.

Also wrote docs/codex-assignment.md — prioritized handoff (Supabase isolation runbook,
tractate-mastery migration completion, entangled analytics server code, next-step
topology decision) coordinated with Sam.

Still open in this pass: real continuations for history-arc.js / widerworld-arc.js
(their nextUrl currently points at canon-arc.html?track=..., which re-teaches the same
Jeremiah 29:7 material — flagged as dead-end, replacement units are the next work item).


## 2026-07-12 — Claude: second foundations for History and Wider World (beef-up pass, part 2)

Closed the dead-end flagged in part 1: history-arc.js and widerworld-arc.js pointed their
nextUrl at canon-arc.html?track=..., which re-teaches near-identical Jeremiah 29:7 material.
Both now route to genuine second units that apply the first arc's abstract method to real
primary sources.

- history-yavneh.js/.html — the destruction of the Temple and founding of Yavneh as a
  worked historical case: Gittin 55b (aKamtza uVar Kamtza — memory-claim vs chronicle),
  Bavli redaction context (locate the voice), Gittin 56b "ten li Yavneh v'chachameha"
  (foundation story), Josephus's rival self-attributed Vespasian prediction (comparing
  accounts), Mishnah Rosh Hashanah 4:1 "mishecharav... hitkin" (legal source as
  institutional evidence — different evidence-genre than narrative), Avot d'Rabbi Natan 4
  + Hosea 6:6 (meaning rebuilt; reception as a dated historical event), and a historical-
  judgment step (neither credulity nor dismissal). All sources verified via web search.
  nextUrl: lab.html?tractate=gittin (lab confirmed present).

- widerworld-encounter.js/.html — the tradition's own primary-source charters of
  encounter: Eicha Rabbah 2:13 (chochma bagoyim ta'amin / Torah bagoyim al ta'amin —
  verified), Nedarim 28a dina d'malkhuta dina with its limits (monetary matters,
  equitable application — verified; Shmuel, 3rd c. Babylonia setting as the History move),
  Rambam intro to Shemonah Perakim "accept the truth from whoever says it" plus his
  stated practice of omitting attributions so true ideas would not be rejected (verified —
  encounter as lived strategy, not slogan). Closing comparison: three genres, one
  question, each opening + bounding. nextUrl: lab.html?tractate=nedarim (lab confirmed).

nextUrl rewires (1-line diffs each, confirmed clean before staging): history-arc.js,
widerworld-arc.js. Grep confirms zero remaining references to
canon-arc.html?track=history|widerworld — those two canon-arc.js data tracks are now
unreachable except by direct URL. Left in place (harmless, and canon-arc still serves
chassidus/mussar tracks); Codex may delete the two stale track objects at leisure.

Verification: both pages live-tested (10/10 steps render, RTL ok, structural check zero
issues on all 20 steps, shuffle observed live — widerworld first step rendered order
[1,0,2] — correct click credits +10 XP and enables Continue). Test suite: 121/121 pass
(note: run from repo root; running node --test from elsewhere silently finds 0 tests).

All five single-arc subjects now have a genuine second foundation. Every non-Gemara track
ends in either a deeper companion unit or a Gemara lab — no more self-referential loops.


## 2026-07-12 — Claude: completion-link topology normalized to hub-with-lateral-links

Sam decided (docs/codex-assignment.md): Gemara remains the default mastery spine; each
completed non-Gemara unit offers ONE primary next step returning toward the spine and AT
MOST ONE optional lateral, only where it genuinely deepens the next move.

Normalized shape now uniform across all 17 non-Gemara completion screens:
- Primary (nextUrl): a Gemara arc/lab with a genuine source tie where one exists,
  otherwise gemara-continuation.html (the spine hub, which self-adjusts to progress).
- Lateral (one link embedded in completeCopy, rendered via innerHTML by course-engine.js):
  the subject's deeper companion unit, or a cross-subject connection per Sam's examples.

Changes (11 files, each a single-line diff, all confirmed clean of Codex work before
staging; node --check passed on all):
- mussar-arc, chassidus-arc: primary was canon-arc.html?track=... (near-duplicate rehash,
  same class as the history/widerworld dead-end) -> gemara-continuation.html. Laterals
  (mussar-truth / chassidus-ahavat-yisrael) already present.
- history-arc, widerworld-arc: second units moved from primary slot to completeCopy
  lateral; primary -> gemara-continuation.html. (Supersedes yesterday's wiring in 1468200.)
- mussar-truth: primary chassidus-arc (lateral-as-primary) -> ketubot-arc.html — the unit
  teaches Ketubot 17a, so the spine return is the very sugya studied. Chassidus moved to
  lateral.
- chassidus-ahavat-yisrael: primary was a backward loop to chassidus-arc -> shabbat-arc.html
  (unit teaches Hillel on Shabbat 31a). Return-to-companion moved to lateral.
- thought-suffering: primary was a backward loop to the atlas -> gemara-continuation.html;
  atlas moved to lateral.
- philosophy-questions: primary was seder.html (home, terminal) -> gemara-continuation.html;
  thought-suffering lateral already present.
- philosophy-unit-2: primary was the atlas -> gemara-continuation.html; atlas moved to
  lateral.
- history-yavneh: added lateral -> widerworld-encounter.html (Sam's example: History ->
  Wider World; the unit itself raises Josephus writing for Rome).
- widerworld-encounter: added lateral -> philosophy.html (Rambam's Shemonah Perakim rule
  opens reason-and-revelation, the Jewish Thought field).

Already compliant, untouched: halakha/chumash/tefillah first arcs (primary berakhot-arc +
second-unit lateral), all five new second units' primaries (kiddushin / rosh-hashanah /
gittin / nedarim labs, berakhot-arc).

Consequence for Codex: canon-arc.html is now fully unreferenced (grep: only a comment in
subject.js mentions it; its mussar/chassidus/history/widerworld tracks were its last live
entries). Left in place — delete at leisure or repurpose.

Verification: all 6 link targets exist on disk; topology audit greps show every primary
landing on the spine; 122/122 tests pass (count grew from 121 — Codex added a test
concurrently); node --check passed on all 11 edited files.


## 2026-07-12 — Claude: subject-page discoverability + full end-to-end run of a new unit

Discoverability gap: the five new second-foundation units were reachable only via
completion-screen laterals — a learner browsing subject.html?track=... could not see that
a subject had more than its entry prompt. Added a "UNITS READY NOW" section to the subject
page: units arrays for all 7 tracks in subject.js (title, url, one-line description for
both the first arc and the second unit), container + hidden-by-default header in
subject.html, rendered only when a track has units. Both files confirmed clean of Codex
work before editing; node --check passed; live-tested on halakha and history tracks
(2 units listed each, correct hrefs, zero console errors).

Also completed the deferred end-to-end verification: scripted a full 10-step run of
history-yavneh.html in the live browser — every step credited +10 XP including the typed
production check (accepted "give me yavneh and its sages"), and the completion screen
rendered the exact hub-with-lateral shape: primary link lab.html?tractate=gittin, exactly
one lateral (widerworld-encounter.html) rendered from completeCopy innerHTML. This
validates the whole completion pipeline for the pattern all 17 non-Gemara units now share.

Test suite: 122/122 pass.

## 2026-07-12 — Codex: release-readiness and integrated-path preparation

Worked around the blocked Supabase SQL editor and the need for source-review sign-off without claiming either was complete. Added Bava Kamma and Sanhedrin source-review records, both explicitly `draft-awaiting-scholar-review`; a release-review register; a no-secret Supabase execution sheet; an independent-learner QA script; and an eight-week integrated Gemara-plus-canon sequence.

No learner-facing Sanhedrin legal-content arc was shipped: its source record must clear all six release gates first. The Supabase execution sheet operationalizes migrations 001–005 and the two-account isolation checks once the dashboard accepts SQL input again.

Verification: every route named in the eight-week sequence exists. Full test suite passes: 124 tests, 0 failures. New files are deliberately uncommitted because the worktree remains shared and contains broad concurrent changes.

## 2026-07-12 — Codex: deepening-lesson interaction guard

Added `test/deepening-lesson-integrity.test.mjs`, covering Pesachim, Eruvin, Sukkah,
Bava Metzia, and Bava Kamma deepening lessons. The guard requires an answer area,
feedback, and a Continue control in the page; randomized answer presentation with retained
original identity; feedback; post-answer continuation; and a Sefaria source link in each
lesson. Full suite passes: 126 tests, 0 failures.

## 2026-07-12 — Codex: learner-facing integrated eight-week journey

Added `integrated-path.html`, `integrated-path.js`, and `integrated-path.css`. The page
renders the eight-week Gemara-spine/canon-connection journey as a vertical sequence with
Begin, In Progress, Ready for Review, and Coming Next states. It reads XP and established
skill evidence from the learner record, but keeps the learner's own week-review state
separate so a click is never presented as mastery. Each week contains direct Gemara,
canon, and retrieval/transfer routes and stores a durable journey artifact when started
or made ready for review.

Added `test/integrated-path.test.mjs`; every named route exists. Full suite: 127 tests,
0 failures. Local-server smoke test: `http://127.0.0.1:4180/integrated-path.html` returned
HTTP 200 and the expected journey heading.

## 2026-07-12 — Codex: Shas entry integrity audit

Added `test/shas-entry-audit.test.mjs`. It confirms all 37 tractates in
`gemara-tractates.json` have a learner-facing practice description; every non-Berakhot
tractate resolves to an existing lab; and every lab has a Sefaria URL, at least three
complete source steps, Hebrew, translation, prompt, feedback, three or more answer choices,
and a valid answer key. Full suite: 128 tests, 0 failures.

## 2026-07-12 — Codex: legacy My Path routing

Updated `path.html`, previously a redirect stub to the older static mastery map, to redirect
to `integrated-path.html`. This makes prior My Path bookmarks land on the learner-facing,
sequential eight-week journey. Verified the local route returns HTTP 200; full suite remains
128 tests, 0 failures.

## 2026-07-12 — Codex: evidence-led eight-week progression and discovery

Replaced self-reported week completion in `integrated-path.js` with demonstrated evidence.
Each week now declares two or more relevant skill-prefix requirements in
`data/eight-week-integrated-path.json`; it becomes **Retrieval Ready** only after the
learner has at least two matching recorded source moves at the repository's emerging-evidence
threshold. Earlier weeks remain revisitable, while later weeks display as Coming Next until
the preceding source work has evidence. Opening a link only records that a learner started
the week; it cannot unlock it.

Added an `8-Week Path` link in the active Seder landing header, plus test coverage for
evidence criteria and landing discoverability. Full suite: 128 tests, 0 failures.

## 2026-07-12 — Codex: deep Gemara language support

Added a shared deep-lesson language layer through `seder-auth.js` plus
`deep-language-support.css`. On every source-card-based deep lesson (Pesachim, Eruvin,
Sukkah, Bava Metzia, Bava Kamma), it renders immediately beneath the active Hebrew/Aramaic
excerpt and updates with each new step. It provides: a sentence-role cue based on the
current Gemara move; clickable context glosses; optional focus-word transliteration; and a
clear reminder that the aligned English checks rather than replaces first reading. The
observer is keyed to the current line to avoid redraw loops. Added
`test/deep-language-support.test.mjs`; full suite: 129 tests, 0 failures.

## 2026-07-13 — Codex: Yoma full mastery block

Added `yoma-arc.html` / `yoma-arc.js`: nine source-based moves from Mishnah Yoma 1:1
through Yoma 2a and Leviticus 8:34. The learner maps a Temple role and preparation
procedure, identifies the risk addressed by a replacement, holds Rabbi Yehuda's extension
beside the Rabbis' “no end to the matter” limit, asks for the Gemara's source, reads the
proof-text phrases, compares the red-heifer context, and transfers the map to a fresh
procedure source. Every step distinguishes text study from practical guidance.

Added Yoma to `tractate-mastery.js`, `course-engine.js`, and the source-sequence data;
the Yoma interactive lab serves as its current working-source stage while a dedicated Daf
workspace remains future work. Added `data/yoma-source-review.json`, explicitly
`draft-awaiting-scholar-review`, and `test/yoma-production-block.test.mjs`. Full suite:
130 tests, 0 failures. Local smoke test: `yoma-arc.html` returns HTTP 200.

## 2026-07-13 — Codex: Yoma interactive Daf workspace

Added `yoma-daf-workbench.html` / `.js` / `.css`, a dedicated visible-source workspace
for Mishnah Yoma 1:1 through Yoma 2a. It asks the learner to classify each source move:
case, preparation safeguard, stated concern, limiting objection, Gemara question,
proof text, and response. Correct classifications build a persistent on-page argument map,
record source-annotation evidence and XP, and unlock a clear continuation into the guided
Yoma source trail. The page includes translation toggling, reading clues, a Sefaria link,
and an explicit study-not-practical-guidance boundary.

Updated the Yoma mastery loop and source sequence to use this workspace as the first
working-source step, added a Yoma source packet and curriculum route mapping, and added
`test/yoma-daf-workbench.test.mjs`. Full suite: 131 tests, 0 failures. Local smoke tests:
`yoma-daf-workbench.html` and `tractate-mastery.html?tractate=yoma` both return HTTP 200.

## 2026-07-13 — Codex: flagship Daf workspaces and adaptive repair

Added `flagship-daf-workbench.html` / `.js`, a shared but tractate-specific visible-source
workspace for Shabbat, Pesachim, Eruvin, Sukkah, Bava Metzia, and Bava Kamma. Each opening
now has its own Hebrew source lines, guided translation reveal, reading clues, Sefaria link,
and argument map. A learner must classify each line’s source role before the source trail
continuation appears; each correct classification saves source-annotation evidence and XP.
After two incorrect classifications, the workspace exposes an explicit tractate-specific
repair route rather than leaving the learner without a next move.

Updated all six flagship mastery loops and source sequences to enter these workspaces.
`nextGraphPractice` now routes eligible source skills to the relevant workspace, including
the dedicated Yoma workspace, instead of sending every opening source to the older generic
reader. Added `test/flagship-daf-workbench.test.mjs` and updated mastery-loop tests.
Full suite: 132 tests, 0 failures. Local smoke tests for Shabbat and Bava Kamma workspace
URLs both return HTTP 200.

## 2026-07-13 — Codex: delayed retrieval after flagship Daf maps

Added a learner-visible retention handoff to the six flagship Daf workspaces. When a learner
completes an argument map, `flagship-daf-retention.js` schedules a 24-hour retrieval and
explains why it is happening before the learner continues into the next source trail.

Added `data/flagship-retrieval.json`: six tractate-specific retrieval prompts for Shabbat,
Pesachim, Eruvin, Sukkah, Bava Metzia, and Bava Kamma. The review API now selects these
instead of falling back to a generic “what job does this line do?” prompt, preserving the
actual source skill the learner practiced. `repository.mjs` records the explicit delayed
retrieval schedule without awarding false mastery or XP.

Added `test/flagship-retention.test.mjs`. Full suite: 133 tests, 0 failures. The server
must be restarted after this change because `server.mjs` imports the curriculum/repository
modules once at startup.

## 2026-07-13 — Codex: flagship transfer and wider-canon handoff

Added `flagship-transfer.html` / `.js` / `.css`: six short, shuffled, contrasting-source
checks for the flagship Daf skills. Each check records source-annotation evidence against
the learner’s original skill in a distinct source context, enabling the existing
multi-context transfer bonus rather than treating completion as a click-through.

After a correct transfer, the learner sees one concrete wider-canon connection: Shabbat and
responsibility, Pesachim and freedom, Eruvin and prayer, Sukkah and covenant, Bava Metzia
and responsibility, or Bava Kamma and covenant. Each bridge explains the shared reading
habit and gives a direct learner route into its non-Gemara source work.

The completed Daf-map panel now offers this transfer as an optional next move while retaining
the scheduled 24-hour retrieval as the recommended durability step. Added
`test/flagship-transfer.test.mjs`. Full suite: 134 tests, 0 failures; both new client scripts
pass Node syntax checks.

## 2026-07-13 — Codex: First Month Academy

Added `academy.html` / `.js` / `.css`: a learner-facing first-month program for independent
adult beginners. It turns the existing interleaved source assets into one clear 30-day entry
sequence, with a single next session, placement-aware starting language, four visible phases,
and evidence-led milestones. The sequence deliberately interleaves Hebrew orientation,
Gemara, Chumash/Torah source reading, prayer, thought/freedom, history, responsibility,
retrieval, repair, and unfamiliar-source transfer.

Added a First month link from the eight-week integrated journey so this is discoverable from
the learner’s primary path. Added `test/academy.test.mjs`. Full suite: 135 tests, 0 failures;
`academy.js` passes Node syntax check.

## 2026-07-13 — Codex: long-form integrated curriculum map

Added `seder-curriculum.html` / `.js` / `.css` plus
`data/seder-curriculum-map.json`. The learner-facing map extends Seder beyond the first
foundation moves without splitting it into independent subject tracks. It presents six
continuous levels—entering the page, source fluency, argument reading, canon in
conversation, responsible synthesis, and independent study—with twelve evidence-based
milestones. Each milestone names a capability, uses existing source-skill evidence prefixes,
and leads to a concrete next learner action.

Added a Long-term map link to the First Month Academy and `test/seder-curriculum.test.mjs`.
Full suite: 138 tests, 0 failures; `seder-curriculum.js` passes Node syntax check.


## 2026-07-13 — Claude: typed production checks now gate all six canon-course capstones

Production-over-recognition, applied to the six-session canon courses (previously 36
recognition-only questions). Per Sam's delegation, also issued directive 0 to Codex in
docs/codex-assignment.md: commit the ~29-file in-flight surface today.

- canon-course.js (tracked, was clean): after all six sessions are demonstrated, a typed
  PRODUCTION CHECK now gates the capstone link — the course's anchor Hebrew phrase shown
  without translation, meaning typed from memory. Wrong answers deliberately do NOT
  reveal the expected answer (instant retry would allow copying); they point back to the
  sessions. Correct answers set a per-learner localStorage flag, post an answer_submitted
  event (competency: translation) so mastery/review pick it up, and unlock the capstone.
  Revisit path handled: 6/6 sessions + no production on load lands on the check
  (?session= deep links still show sessions; nav buttons still work from the check).
  Courses without a production field degrade gracefully to the old direct-capstone flow.

- Added production data to all 6 courses across 5 JSONs (each anchor phrase is taught in
  the course's own Session 1, so recall is fair): shema-six (shema yisrael), blessings-six
  (v'achalta v'savata uverachta), tefillah-six (baruch atah), freedom-six (uvacharta
  bachayim), history-six (v'dirshu et shlom ha'ir), responsibility-six (hishtadel lihyot
  ish). Node validation: all 6 have complete production fields.

- Live-tested history-six end to end: 6 correct sessions -> "One production check
  remains" (not capstone), wrong typed answer -> no reveal + retry, correct answer ->
  capstone link + flag + event, flag-cleared reload -> lands on production check, session
  nav intact. Suite: 134/134 pass (up from 122; Codex added tests concurrently).

Note: the five course JSONs had never been committed (Codex-authored); committed here
with my production additions, per the protect-uncommitted-work directive, with
authorship noted in the commit message.


## 2026-07-13 — Claude: daily router now recommends second foundations

The recommendation engine did not know the eight deepening units exist: a learner who
finished a first arc never saw "your next step: Honoring Parents" on the daily page.

- daily-router.js (tracked, clean before edit): added a deepenings map pairing each first
  arc stage with its second unit stage/page (all 8 subjects, including the Thought
  atlas -> thought-suffering pair). New branch in the recommendation waterfall, placed
  after struggle/vocab/active-course/capstone/transfer and BEFORE the Gemara fallback,
  firing only when (a) a first arc is complete, (b) its second unit is not, and (c)
  day % 3 === 2 — so the Gemara spine keeps two of every three fallback days, per the
  hub topology. Multiple pending deepenings rotate by day.

- test/daily-deepening.test.mjs (new): cross-file consistency guard — every stage ID the
  router names must be the stage its unit file actually declares (8 pairs x both sides),
  every linked page must exist on disk, and regexes lock the gating conditions (has-first/
  not-second, day % 3, Gemara remains final default).

Verification: node --check clean; new test 2/2; full suite 137/137 (Codex adding tests
concurrently, all green); live page renders without console errors and correctly shows a
ready capstone outranking the deepening slot for the demo learner; branch logic verified
against 4 simulated scenarios (fires only in the exact intended case).

Blocked until Codex commits: Sefaria deep links on unit steps (needs course-engine.js,
dirty), typed checks in front-door Gemara arcs (shabbat-arc.js mid-migration).

## 2026-07-13 — Codex: 36-lesson integrated canon journey

- Expanded the learner-facing canon journey from 18 to 36 sequential source encounters.
  The second cycle is gated as four earned phases: Second foundation, Gemara across
  Shas, Canon and comparison, and Independent navigation.
- The added work returns to language, Tefillah, Torah reception, and historical context;
  then develops close reading across Pesachim, Eruvin, Sukkah, Bava Metzia, Bava Kamma,
  and Yoma; and culminates in source-chain synthesis, an unfamiliar-sugya map, and a
  responsible next-study decision.
- Added phase-five through phase-eight checkpoints. Questions are shuffled at render
  time and require all correct answers before opening the next phase.
- Kept flagship delayed-retrieval records authoritative for overlapping Gemara skill IDs,
  preventing the new journey sources from duplicating a scheduled flagship review.
- Verification: full test suite passes, 140 tests / 0 failures.

## 2026-07-13 — Codex: learner-facing 36-lesson journey framing

- Updated the Journey page so the 36 source encounters are visible as eight earned
  phases, each with a brief statement of the reading capability being built and a
  checkpoint expectation.
- Reframed the page from a “first” journey to a continuous canon journey, made the
  one-path premise explicit, and linked the learner to the longer-term mastery map.
- Added a UI regression guard for the 36-move / eight-phase presentation.
- Verification: full test suite passes, 141 tests / 0 failures.

## 2026-07-13 — Codex: 100-move canon mastery path

- Expanded the actual sequential Journey from 36 to 100 source encounters and from
  eight to sixteen earned phases. The added 64 sessions are not screen padding: they
  revisit eight representative Gemara and wider-canon sources through eight distinct
  deliberate-practice modes—signals, case maps, evidence, distinctions, reception,
  comparison, transfer, and independent synthesis.
- Every added session has visible Hebrew, translation, cited source, two shuffled source
  checks, distinct evidence contexts, sequential prerequisite evidence, and a phase gate.
- Added a generic advanced-phase checkpoint that assesses transfer and responsible
  independent navigation rather than rewarding recognition alone.
- Added cycle and learner-UI regression coverage. Verification: full suite passes,
  142 tests / 0 failures. Restart the server after this backend curriculum change.


## 2026-07-13 — Claude: third foundations for Halakha, Tefillah, Mussar (content expansion)

Per Sam's go-ahead to expand beyond the existing lessons, three third-foundation units,
each teaching a genuinely new skill on verified sources, each chained from its subject's
second unit and integrated into subject pages + daily router:

- halakha-machloket.js/.html — how the law handles disagreement: Eruvin 13b (three-year
  dispute, elu v'elu, halakha k'Beit Hillel because they were "nochin va'aluvin" and
  taught Shammai's words first — all verified), Mishnah Eduyot 1:5-6 (why rejected
  opinions are recorded), the Ketubot 17a pattern-recognition tie to mussar-truth, and
  an exceptions step (rule-with-tracked-scope, echoing Chullin). Primary: eruvin-arc.html
  (the sugya's home). Lateral: mussar-arc.html (the ruling's stated reason IS a middah).

- tefillah-amidah.js/.html — the service's center as architecture-with-history: the
  shevach/bakasha/hodaya structure (extends first arc's three moves), Berakhot 28b Shimon
  HaPakuli arranging the eighteen at Yavneh before Rabban Gamliel (verified; "arranged is
  not invented" distinction from the same sugya), the eighteen-that-are-nineteen name
  fossil, Mishnah Berakhot 4:4 keva warning, Berakhot 17a Elohai Netzor as the built-in
  personal opening. Primary: berakhot-arc.html. Lateral: history-yavneh.html — the same
  institution now appears in two subjects, exactly the integrated-canon vision.

- mussar-anger.js/.html — third middah, third structure: Rambam Deot 1:4 middle path,
  Deot 2:3 anger exception ("to the other extreme", "even over something fitting" —
  verified), Shabbat 105b tearing-garments/idolatry escalation psychology (verified with
  attribution chain), Avot 4:1 strength redefined, the show-without-feeling permission
  (Deot 2:3), and a three-middot structural comparison step. Primary: shabbat-arc.html.
  Lateral: widerworld-encounter.html (the middle path's Aristotelian backstory).

Chain wiring (one lateral each, per topology): halakha-honor-parents -> machloket;
tefillah-kaddish -> amidah; mussar-truth's lateral swapped from chassidus-arc to
mussar-anger (chassidus remains discoverable via its own track and mussar-arc's flow).
subject.js units lists now show 3 units for halakha/tefillah/mussar. daily-router
deepenings extended with the three second->third pairs (chain gating works unchanged);
test/daily-deepening.test.mjs extended to 11 pairs.

Verification: node --check on 8 files; all three units live-tested end to end (10/10
credited incl. typed check, completion renders, correct primary + exactly one lateral);
subject page shows 3 units; consistency test 2/2 (11 pairs). Full suite: one transient
2-fail run caused by Codex editing test files mid-run (count moved 137->138->140 across
runs); clean re-run 140/140 pass, my-surface tests 4/4 deterministic.


## 2026-07-13 — Claude: third foundations batch 2 — Chumash poetry, Geniza, Simcha, the Mean

Four more units, completing third foundations for 7 of 8 subjects (Thought's third layer
already exists via its atlas + suffering + unit-2 structure). All sources verified by
web search before writing; all pages live-tested end to end.

- chumash-tehillim.js/.html (9 steps) — biblical poetry as the third genre after law and
  narrative: synonymous parallelism (Psalm 19:2-3, verified), antithetic (Proverbs 10:1,
  verified), metaphor-as-claim (Psalm 23:1), the He->You pronoun turn at Psalm 23:4
  (verified), reception via Berakhot 4b Ashrei-three-times-daily, and a three-genres
  synthesis step. Primary: berakhot-arc.html. Lateral: none (chassidus-simcha laterals IN).

- history-geniza.js/.html — a second evidence-kind after Yavneh's memory-sources:
  Megillah 26b genizah rule (sefer torah shebalah gonzin oto), Ben Ezra/Fustat ~400k
  fragments, Schechter 1896 (with a discovery-as-event-with-perspectives step), everyday
  papers, curated-canon vs accidental-archive distinction, Goitein's Mediterranean
  Society, memory-vs-residue judgment step (all verified). Primary:
  lab.html?tractate=megillah (lab confirmed). Lateral: widerworld-encounter.html
  (moved here from history-yavneh, which now laterals to geniza — chain intact).

- chassidus-simcha.js/.html — joy as discipline: Psalm 100:2 command, Deut 28:47 rebuke
  for joyless service, Shabbat 30b simcha-shel-mitzvah as the Shechinah's condition (with
  the kalut-rosh exclusion as a built-in boundary), Likutei Moharan II:24 (verified at
  Sefaria Part II 24:1), practice step, and a RESPONSIBLE LEARNING step explicitly
  separating spiritual practice from mental-health judgment. Primary: shabbat-arc.html.
  Lateral: chumash-tehillim.html (the command is a psalm — cross-new-unit mesh).

- widerworld-mean.js/.html — the charters unit's method actually performed: Deot 1:4
  mean, Deot 1:5-6 vehalachta bidrachav grounding (verified), Sotah 14a imitatio Dei
  (verified), Aristotle NE II presented in its own terms, the documented influence via
  Shemonah Perakim, precise shared question, and the divergence (same architecture,
  covenantal vs rational foundations; the anger/arrogance exceptions as religious
  correctives). Primary: lab.html?tractate=sotah (lab confirmed). Lateral:
  mussar-anger.html (two-way mesh with anger's lateral to encounter — no cycles).

Chain wiring: chumash-akeidah -> tehillim (new lateral); history-yavneh lateral swapped
widerworld-encounter -> geniza; chassidus-ahavat-yisrael lateral swapped chassidus-arc ->
simcha; widerworld-encounter lateral swapped philosophy.html -> mean. subject.js: chumash/
history/chassidus/widerworld now list 3 units. daily-router: 4 new pairs (15 total).
test/daily-deepening.test.mjs: 15 pairs guarded.

Verification: 10/10 node --check; consistency test 2/2 (15 pairs x both sides + page
existence); all four units e2e in live browser (all steps credit incl. typed, completion
renders, correct primary + at most one lateral); suite 142/142.

## 2026-07-13 — Codex: active source maps in the advanced 100-move cycles

- Built the 64 added advanced encounters into active source-work sessions. After the
  two evidence checks, each requires a short learner-authored source map that names a
  concrete feature of the visible source before the stage can be completed.
- Source maps are stored as learner-owned study artifacts and local notes; they do not
  award false XP or substitute self-report for source-answer evidence.
- Added the responsive source-map writing interface and regression tests for its
  presence and the 64 practice prompts.
- Verification: full suite passes, 143 tests / 0 failures.

## 2026-07-13 — Codex: subject-aware retrieval

- Replaced the incoherent one-size-fits-all Daf fallback for non-Gemara review skills.
  A learner returning to History, Tefillah, Chumash, Wider World, Mussar, Chassidus, or
  Jewish Thought now receives a discipline-appropriate retrieval prompt and Hebrew cue.
- Kept the existing Daf retrieval intact for Gemara and unknown skills; no source review
  is orphaned.
- Added coverage across all seven subject prefixes. Verification: 145 tests / 0 failures.

## 2026-07-13 â€” Codex: earned-level transition

- Completing the second checkpoint in each of the eight journey levels now leads to a
  dedicated level-complete screen rather than an abrupt return to the full path.
- The handoff names the reading moves established, counts the learner's recorded mastery
  evidence for that level, previews the next level, and keeps review available. The final
  level resolves into continued independent practice rather than inventing a ninth level.
- Added a regression test for all eight final checkpoint routes and the completion-screen
  evidence/next-action contract. Verification: full suite passes, 148 tests / 0 failures.

## 2026-07-13 — Codex: advanced-level retrieval and source-specific checkpoints

- Replaced the former generic checkpoint prompts for Levels 5–8 with level-specific
  assessments of signals, cases, evidence, distinctions, reception, comparison, transfer,
  and independent source navigation.
- Added a three-move level retrieval screen from each completion handoff. It selects the
  learner's least-secure recorded skills from that level, credits new source evidence, and
  returns the learner to the journey without turning review into a punitive gate.
- Added regression coverage for the targeted retrieval route and advanced checkpoint
  coverage. Verification: full suite passes, 149 tests / 0 failures.

## 2026-07-13 — Codex: 90-day learner academy

- Extended the guided Academy from 30 to 90 sequenced daily sessions. Month 2 deepens
  Gemara across Shas while integrating Chumash, Halakha, Tefillah, History, Chassidus,
  Mussar, and Wider World units; Month 3 focuses on evidence, retrieval, portfolio work,
  independent reading, and setting the learner's next mastery horizon.
- The interface shows only the learner's current 30-day month, with completed/current/ahead
  month signals, so the long runway does not become a 90-card wall. Existing 30-day local
  progress migrates forward into the 90-day program automatically.
- Verified every Academy route exists locally and updated the Academy regression contract.
  Verification: full suite passes, 149 tests / 0 failures.

## 2026-07-13 — Codex: Academy mastery gates

- Replaced attendance-based Academy advancement with daily mastery markers. Opening a source
  now records study activity only; the following day remains locked until the learner earns
  two correct, source-grounded checks for the current day.
- Added a dedicated daily evidence page with shuffled answers, retry after an incorrect
  response, XP/evidence recording, and an unfamiliar-source transfer check every seventh day.
- Enforced the gate server-side: direct requests to mark `academy-day-1` through
  `academy-day-90` complete are rejected unless both expected correct evidence contexts are
  already present. Verification: full suite passes, 151 tests / 0 failures.

## 2026-07-13 — Codex: learner-produced Academy evidence

- Weekly Academy transfer days now require a learner-authored source map after the two
  source checks. The learner names a source feature, the move used, and a next question;
  the server requires this saved artifact before the weekly day can be mastered.
- Expanded the daily check rotation across Gemara, Torah/Halakha, history, comparative
  reading, and independent-study source prompts, all tied to unique daily evidence contexts.
- The Study Record now displays Academy days earned and weekly Academy source maps, so the
  learner can see an accumulating portfolio rather than a mere attendance count.
- Verification: full suite passes, 151 tests / 0 failures.

## 2026-07-13 — Codex: first-month source-specific evidence

- Replaced the rotating generic prompt for Academy Days 1–30 with a dedicated evidence
  card for each day. Cards now name the day’s exact text or study protocol and assess the
  corresponding reading move across Gemara, Torah, prayer, ethics, history, and comparison.
- Weekly transfer checks now show a fresh related-source cue rather than relabeling the
  original prompt, so the learner must carry the move into a new setting.
- Added regression coverage for the first-month evidence bank’s flagship Gemara citations.
  Verification: full suite passes, 151 tests / 0 failures.

## 2026-07-13 — Codex: live Academy learner QA

- Ran the Academy in the live local app as a learner. Day 1 recorded two correct source
  checks (+20 XP), showed the mastered state, and unlocked Day 2 while retaining all later
  days as evidence-gated.
- Found and fixed a learner-dashboard rendering fault (`sessionDay` was omitted from the
  current-month map calculation), which had incorrectly triggered the generic learner-state
  fallback and left the course map blank. Live re-test confirmed the full month map renders
  with Day 1 mastered, Day 2 current, and later days locked.

## 2026-07-13 — Codex: second-month source-specific evidence

- Added dedicated Academy evidence cards for Days 31–60: Berakhot/Shabbat/Pesachim/Eruvin/
  Bava Metzia/Bava Kamma returns, Akeidah, Kaddish, Sukkah, Halakhic disagreement, Yavneh,
  Ahavat Yisrael, Amidah, Psalm 23, and connected retrieval/independent-reading sessions.
- Each card names a concrete source and its matching reading move; weekly days retain the
  required unfamiliar-source transfer map. Added citation coverage to the Academy tests.

## 2026-07-13 — Codex: third-month source-specific evidence

- Added dedicated Academy evidence cards for Days 61–90, completing the full 90-day path.
  The final month moves from durable retrieval into unfamiliar Gemara, a Bava Kamma return,
  Chanukah disagreement, Cairo Geniza and comparative-reading evidence, source-map practice,
  portfolio reflection, and a deliberate next mastery horizon.
- Verified the named classical references used in this month against Sefaria and added
  regression coverage for the new evidence bank. Weekly transfer days retain their required
  learner-authored source map, so completion continues to require demonstrated reading rather
  than attendance.
- Verification: full suite passes, 151 tests / 0 failures.


## 2026-07-13 — Claude: Codex-down contingency — full tree preserved, retrieval verified, Sefaria links shipped

Codex went down with ~29 modified + 233 untracked files. Judgment calls made under Sam's
delegation ("do the most without Codex, make good judgment calls"):

1. PRESERVED CODEX'S WORK. Discovered Codex had prepared 14 run-*-commit.cmd batch
   scripts this morning (10:33-12:44) — its own commit plan, written for Sam to execute,
   never run. Executed their staging+commit steps in Codex's mtime order with attribution
   trailers. Parser imperfections collapsed the batches into 2 commits (693c5d6 "Strengthen
   learner mastery engine and hosted parity", b8de03a "Gate academy progress on source
   evidence") instead of 14 — imperfect batching, zero loss; every modified file verified
   committed. Then 7ed5e81 preserved all 233 remaining untracked files (pages, labs, data,
   tests, and the spent .cmd scripts) as one batch. Excluded: .tmp-presentation/, .zztest,
   outputs/ (artifacts). Pre-commit: node --check on 18 core dirty files (all OK), server
   restarted onto the tree's code, smoke tests 200 on seder/router/apis. Post-commit:
   suite 151/151 (Codex's committed tests included), tree clean for the first time this
   session.

2. ITEM 5 WAS ALREADY DONE. Codex implemented the subject-aware review fallback before
   going down — data/curriculum-engine.mjs now carries the SUBJECT_RETRIEVAL design from
   the assignment doc nearly verbatim, with test/subject-aware-retrieval.test.mjs covering
   all 8 subjects including the new units' skill prefixes. Verified passing; live
   /api/learners/demo/review-items returns 200. No action needed.

3. SEFARIA DEEP LINKS (course-engine.js, now stable): conservative ref->URL mapper links
   "Read the full source" on every step whose citation is unambiguous — Bavli daf (incl.
   two-word tractates -> underscores), Tanakh ch:v (Psalm->Psalms normalized), Mishnah
   x:y, Pirkei Avot x:y; first ref of multi-ref steps; method refs, en-dash ranges, and
   Rambam refs deliberately stay unlinked rather than guessed. Verified live on
   halakha-machloket (correct link/no-link decisions on all 10 steps) and 4 generated
   URLs confirmed 200 on sefaria.org. Suite 151/151.

Note for Codex on return: your 14 .cmd batch scripts are committed (spent — do not
re-run; they would create empty commits or unwanted pushes). Item 0 is complete. The
remaining open items from the assignment are Supabase verification (needs Sam) and the
optional skill-graph registration.


## 2026-07-13 — Claude: new-learner dry run — P0 front-door bug found and fixed

Walked the full funnel as a brand-new learner (fresh learner id, cleared localStorage):
seder.html landing (clean, onboarding visible, coherent CTAs, no console errors) ->
placement (completes, hands off correctly) -> integrated-path.html eight-week journey
(week 1 Berakhot open, weeks 2-8 locked, correct gating) -> berakhot-arc (stage 1 open,
rest locked) -> language.html first lesson.

P0 FOUND: language.js answer() referenced `item.source`, but `item` was scoped inside
render() — every answer click threw "Uncaught ReferenceError: item is not defined"
mid-handler. The button got colored (that line ran first), then the handler died: no
answer_submitted event ever posted (no XP, no mastery, no review scheduling from this
page), feedback never rendered, Continue never enabled. Every new learner was hard-stuck
on the first lesson of week one unless they reloaded. Reproduced deliberately (error
captured, feedback empty, continue disabled), fixed by passing `item` through the click
handler into answer() (and renaming the shadowing forEach param that camouflaged the
bug), verified live: no errors, feedback renders, Continue enables, event recorded,
+10 XP. Swept all 8 files sharing the answer(button, ...) pattern — level-review.js and
review.js pass item correctly; language.js was the only instance.

FRICTION FIXED: daily-router's date-rotation fallback recommended "Ketubot" to a day-one
learner (the rotation is level-blind). Added a brand-new branch: learners with zero
completed stages are routed to integrated-path.html ("Continue your first week") instead
of the rotating tractate cycle. Verified live: fresh learner now sees the journey.

Suite 151/151. This is the strongest argument yet for the dry-run habit: the bug was
invisible to the test suite (which checks file patterns and data, not DOM click paths)
and sat on the single most-traveled page of the funnel.


## 2026-07-13 — Claude: content sophistication program — standard, audit, Wave 1 batch 1

Sam's directive: raise ALL ~100 content units to the sophistication of the recent ones,
not just polish the new. Approach: codify the standard, measure everything, upgrade in
ranked waves.

- docs/content-standard.md: six scored dimensions (depth, production/typed, no
  length-bias exploit, teaching feedback, boundary-where-lived, no duplicate options)
  plus the two engine-enforced requirements (shuffle, verified citations + Sefaria
  links). Definition of done: audit score >= 8 + live run + citations verified.

- scripts/audit-content.mjs: parses every SederCourse unit file, all 36 labs, all 6
  canon courses (91 units total) and scores them 0-10. Key systemic findings on first
  run: (1) correct-answer-length bias is near-universal (~85% of MC questions — the
  correct answer is longest by >1.5x the shortest distractor; a learner can pass by
  always picking the longest option; the fix is substantive near-miss distractors, not
  padding); (2) the 27 lab-only tractates are the thin tail (3 steps, no typed, full
  bias); (3) 18 units had zero production checks. Also fixed an auditor blind spot:
  labs store `kind` not `mode`, so their boundary steps (e.g. Sotah's) were invisible.

- Wave 1 batch 1: appended a typed production check (targeting each unit's own anchor
  Hebrew, all previously verified) to 8 zero-production units: mussar-arc (Micah 6:8),
  mussar-truth (Exodus 23:7), chassidus-arc (Psalms 27:4), chassidus-ahavat-yisrael
  (Leviticus 19:18), tefillah-arc (Modim), history-arc + widerworld-arc (Jeremiah 29:7 —
  the shared anchor of both tracks), philosophy-questions (Deuteronomy 4:36). Scores
  moved 5-6 -> 7-8; all 8 node --check clean; mussar-arc live-run end to end (typed step
  fires, all credited, completion renders). Suite 151/151.

Remaining waves (see content-standard.md): Wave 1 batch 2 = Berakhot chain
(berakhot-deep, units 2-5, grammar, gemara-toolkit, shas-literacy) — Codex-authored,
needs reading before editing; Wave 2 = distractor rewrites (~500 questions, retires the
length-bias exploit, highest-traffic first); Wave 3 = lab deepening (27 labs, 3 -> 6+
steps with typed + boundaries).


## 2026-07-13 — Claude: Wave 1 complete — every reachable unit now has a production check

Batch 2 appended typed recall steps to the nine remaining zero-production units, all
Codex-authored, each read before editing, each typed target drawn from the unit's own
verified Hebrew: berakhot-deep (me-eimatai korin et shema b'arvin), berakhot-unit-2
(tahar yoma), berakhot-unit-3 (ta shema), berakhot-unit-4 (korin et shema),
berakhot-unit-5 (meitivei), grammar (b'arvin), gemara-toolkit (ela), shas-literacy-
checkpoint (shtayim shehen arba), philosophy.js (v'yadata hayom — Deut 4:39, the
unit's own anchor).

Audit movement: berakhot-unit-3/5 and philosophy 4 -> 7; unit-2/4 and grammar -> 8;
berakhot-deep -> 9; shas-literacy-checkpoint -> 10 (first perfect score in the corpus).
Post-Wave-1 distribution: {3:26, 4:7, 5:4, 6:6, 7:36, 8:10, 9:1, 10:1} — the 26 threes
are the labs (Wave 3), the sevens are dominated by the length-bias dimension (Wave 2).
The only remaining zero-typed unit is canon-arc, which is unreachable (no inbound
links) and intentionally skipped.

Verification: 9/9 node --check; berakhot-deep live end-to-end (10 steps incl. typed,
all credited, completion renders); suite 151/151.

Wave 2 begins next: distractor rewrites, highest-traffic first (berakhot chain, first
arcs, canon courses). The auditor's longest-bias column is the progress meter.


## 2026-07-13 — Claude: Wave 2 batch 1 — diagnostic distractors in the Gemara-signals core

First distractor-sophistication batch, targeting the three worst-biased high-traffic
files. Method: keep every correct answer unchanged; replace each curt strawman
distractor with a same-register near-miss that encodes a SPECIFIC misreading — for the
signals toolkit, the natural near-miss is another signal's function (mistaking ela for
ta shema, meitivei for la kashya, mai ka mashma lan for mena hanei milei or an
attribution question). Feedback upgraded in step where the contrast itself teaches
(teyuvta fells a position; kashya leaves it wounded but standing; distinctions re-map
cases rather than compromising or tie-breaking).

- gemara-toolkit.js: all 13 MC questions rewritten. Audit longest-bias 13/13 -> 0/13,
  score 7 -> 10.
- berakhot-unit-3.js: all 7 rewritten (incl. the mastery-reflection step, whose old
  distractors were absurd rather than tempting — now "translate first and let structure
  emerge" and "read the conclusion first", both genuinely tempting wrong strategies).
  7/7 -> 0/7, score 7 -> 10.
- berakhot-unit-5.js: all 7 rewritten. 7/7 -> 0/7, score 7 -> 10.

Corpus distribution now {3:26, 4:7, 5:4, 6:6, 7:33, 8:10, 9:1, 10:4} — four perfect
scores. Verification: 3/3 node --check; gemara-toolkit live end-to-end (14 steps, all
credited, completion renders — correct answers still credit against shuffled rewritten
options); suite 151/151.

Next batches: berakhot-deep + unit-2/4 + grammar (front door, partially biased), then
first arcs, then canon courses, then deepening units (~430 questions remaining).


## 2026-07-13 — Claude: Wave 2 batch 2 — the whole Berakhot front door now scores 10/10

Diagnostic-distractor rewrites for berakhot-deep (9 MC), berakhot-unit-2 (8),
berakhot-unit-4 (7), grammar.js (8) — 32 more questions. Correct answers unchanged;
every distractor now a same-register near-miss encoding a real confusion. The best
diagnostics in this batch:

- me'eimatai: "asking for a concluding deadline" (from-when vs until-when) and "asking
  for the reason" (vs mai taama) — the two adjacent question-words a learner actually
  mixes up.
- dikhtiv (twice): "a rabbinic teaching is entering" — the verse-vs-baraita confusion
  that matters halakhically — and "a practical sign is offered" (vs siman).
- korin: "hearing Shema read aloud" — reciting vs hearing, a distinction with real
  halakhic weight.
- pesulah: "describes the structure's physical condition" — verdict vs description.
- Evidence-weighing steps now tempt with real bad heuristics: "rank sources by age,"
  "count the citations," "accept once the sign confirms."
- Feedback upgraded throughout to teach the contrast the wrong answer revealed.

Audit: all four 0 length-bias, 10/10. The ENTIRE Berakhot front-door chain (deep,
units 2-5, grammar, gemara-toolkit, shas-literacy-checkpoint) now scores a perfect 10 —
8 units at 10 corpus-wide, distribution {3:26, 4:7, 5:4, 6:6, 7:33, 8:7, 10:8}.
Verification: 4/4 node --check, berakhot-unit-4 live end-to-end, suite 151/151.

Wave 2 continues: first arcs next (halakha/chumash/tefillah/mussar/chassidus/history/
widerworld + second/third foundations), then canon courses, then remaining Gemara arcs.


## 2026-07-13 — Claude: Wave 2 batch 3 — all six first arcs rewritten

Diagnostic-distractor rewrites for the six non-Gemara entry arcs (~48 questions):
halakha-arc, chumash-arc, tefillah-arc, mussar-arc, history-arc, widerworld-arc.
Correct answers unchanged; every "obviously wrong" distractor replaced with a
subject-appropriate near-miss. Highlights:

- halakha-arc: Torah-verse step now tempts with "a fixed formula" and "a category
  system" — exactly what the later layers add, testing whether the learner can keep the
  layers apart; case-reasoning tempts with closest-match-in-the-codes and
  always-follow-the-stricter, two real bad habits.
- chumash-arc: v'ahavta tempts with promise/description readings (love-as-feeling);
  reception steps tempt with "the Gemara supplies the clock times" and "the Mishnah
  glosses word-by-word" — plausible category errors about what each layer does.
- tefillah-arc: each liturgical-move step now tempts with the OTHER two moves applied to
  the same theme (praise/petition/thanks confusions); modim feedback notes the same root
  carries confession elsewhere.
- mussar-arc: reflection step tempts with "resolve to try harder" and "balance against
  recent successes to keep a score" — the two most common substitutes for actual Mussar
  practice; tension step tempts with shyness-as-humility.
- history-arc: memory step tempts with eyewitness-beats-later-account (proximity
  fallacy) and facts-first-interpretation-later; comparison tempts with harmonization.
- widerworld-arc: order-of-comparison step now offers two wrong ORDERS (line-by-line
  first; shared-question first) — the method itself is the content being tested.

Boundary steps in halakha/tefillah now tempt with self-psak ("provide the sources so
learners reach their own rulings") and avoidance ("keep practical topics out") — the two
opposite ways of erasing the boundary, replacing cartoon distractors.

Audit: halakha/chumash/tefillah/widerworld 10/10; mussar/history 9 (residual flags are
long-correct-answer artifacts; distractors substantive). Corpus: twelve 10s,
distribution {3:26, 4:7, 5:4, 6:6, 7:29, 8:5, 9:2, 10:12}. Verification: 6/6 node
--check; tefillah-arc live end-to-end (10 steps, typed fires, completion + lateral
render); suite 151/151.


## 2026-07-13 — Claude: Wave 2 batch 4 — flagship Gemara arcs (Shabbat, Bava Metzia, Bava Kamma)

Diagnostic-distractor rewrites for the three most-traveled tractate arcs (~28 questions).
Legal content demanded extra care that near-misses stay WRONG while sounding learned:

- shabbat-arc (10/10 bias -> 1/10, score 10): domains step tempts with ownership and
  permitted/forbidden readings of inside/outside; the barber-Mishnah step tempts with
  "applies the domains framework to the barbershop" and "introduces the exception" —
  plausible continuity readings against the real topic-shift; Shabbat 9b reason step
  tempts with dignity-of-the-hour and runs-into-Shabbat — plausible guessed reasons vs
  the Gemara's stated one (lest he forget to pray). Transfer step now tests
  skill-transfer vs label-transfer (carrying inside/outside to Eruvin is the trap).

- bava-metzia-arc (7/8 -> 2/8, score 9): opening tempts with partnership-division and
  finder-vs-owner abandonment (both live nearby in the tractate, neither is this case);
  two-claims step tempts with "someone must be lying" — which the Gemara itself refuses;
  mai-taama step reframed: the Gemara asks why to map a ruling's reach, not to discredit
  it. Transfer step distinguishes carrying a habit from carrying conclusions.

- bava-kamma-arc (8/9 -> 2/9, score 9): avot term tempts with severity-ranking and
  sage-attribution; the counting distractor is honest — feedback notes the Gemara really
  does meet 13-category teachings later; Torah-source step tempts with "laws in one
  verse" and "narratives" (mishpatim are scattered laws); the claims-vs-categories
  transfer step now offers the exact inverse order as the trap.

Care taken to avoid arguably-correct distractors: dropped a draft "avot = written
explicitly in the Torah" distractor because Bava Kamma 2a makes that definition
genuinely defensible.

Corpus: thirteen 10s, four 9s, 7s down to 26. Verification: 3/3 node --check,
shabbat-arc live end-to-end (11 steps incl. typed, completion renders), suite 151/151.


## 2026-07-13 — Claude: Wave 2 batch 5 — second foundations (Honor, Akeidah, Kaddish)

Diagnostic-distractor rewrites for the three most-traveled second-foundation units
(~27 questions). These units carry rich interpretive content, so the near-misses are
subtler than the signals batches:

- halakha-honor-parents: Dama ben Netina step tempts with "financial loss is the outer
  limit" and "exceptional piety beyond the law" — the two classic misreadings of
  narrative-as-evidence; chain-comparison tempts with "the blessings chain is the
  standard model" and "no Mishnah stage means a weaker foundation."
- chumash-akeidah: narrator step tempts with "reassurance that softens the story" (the
  test-disclosure makes it heavier, not lighter); ambiguity step now offers the two
  RESOLUTIONS as distractors — each with a reason — so holding the ambiguity must be
  chosen against genuinely tempting closures; reception step tempts with legal
  derivation vs detachable homily around the Gemara's own memory-language.
- tefillah-kaddish: paradox step's best distractor is TRUE but question-dissolving
  ("the prayer predates its mourning role" — real history that answers the wrong
  question); minyan step tempts with witnessing-for-the-dead and substitution readings
  against the ten-who-answer-the-mourner.

Process lesson logged for future batches: write distractors at length-parity from the
start. The first pass of this batch had substantive-but-short distractors and the
audit's parity trigger kept firing (kaddish 8/9); a follow-up pass extended each with
diagnostic clauses (never filler), taking kaddish to 0/9 and 10/10.

Scores: kaddish 7 -> 10, akeidah 7 -> 8, honor-parents 7 -> 8. Corpus: fourteen 10s,
7s down to 23. Verification: 3/3 node --check, kaddish live end-to-end, suite 151/151.


## 2026-07-13 — Claude: Wave 2 batch 6 — third foundations (Machloket, Amidah, Anger)

~27 questions rewritten at length-parity from the start (batch-5 lesson applied — no
follow-up pass needed). The diagnostics lean on adjacent-source confusions:

- halakha-machloket: the three-year-dispute step tempts with "arguing for the honor of
  victory" (Avot 5:17 says the opposite of these very houses) and "must wait for heaven"
  (halakha is not in heaven — the Akhnai theme, which the feedback flags as coming);
  the why-question step tempts with the actual lo-bashamayim challenge, explicitly
  distinguished from this sugya's merit-question; elu-v'elu tempts with the
  accuracy-reading and community-choice readings the line itself refuses; Eduyot step's
  original draft distractor was replaced — "useful to a future court seeking to
  overturn" is close to the Mishnah's own stated answer, so it was dropped for
  procedural and vindication misreadings instead (accuracy outranks difficulty,
  second application of the precedent).
- tefillah-amidah: centrality step tempts with age-claim and obligation-claim readings
  of "THE prayer"; the Yavneh step tempts with over-proceduralized authority and
  memorial-composition readings; keva step tempts with a fabricated Eliezer-vs-Yavneh
  dispute and an eras-distinction — both resolving the tension the Mishnah means to
  leave standing; the personal-prayer step tempts with deficiency and margins readings.
- mussar-anger: escalation step tempts with the literalist juridical reading (the text
  says "in your eyes," not in court) and property-to-violence (the road runs to
  surrender of will, hence idolatry); display-permission tempts with catharsis and
  role-exemption — two modern-tempting misreadings; Avot 4:1 tempts with
  calm-temperament-as-strength (kovesh means conquest, honoring struggle).

Scores: machloket 7 -> 10, amidah 7 -> 9, anger 7 -> 8 (its remaining audit flag is the
sensitive-topic heuristic tripping on the unit id; the reflection and case steps carry
the responsible-learning weight by design). Corpus: fifteen 10s, 7s down to 21.
Verification: 3/3 node --check, mussar-anger live end-to-end, suite 151/151.


## 2026-07-13 — Claude: Wave 3 begins — the unit-to-lab cliff, Kiddushin and Gittin first

Highest-value call: the eight new units send learners into tractate labs as their PRIMARY
next step, and those labs were the thinnest content in the app (3 steps, audit score 3).
A learner finishing the polished Machloket unit landed on three taps. Wave 3 deepens the
six destination labs first; this batch: kiddushin and gittin.

- gittin lab 3 -> 6 steps: the existing step already taught Rava's reason (witness
  availability); the extension completes the sugya's famous machloket — Rabbah's lishmah
  concern (verified: Gittin 2a, "lefi she'ein bekiin lishmah"), a TWO REASONS ONE LAW
  step on what a machloket about reasons (not rules) produces (edge-case outcomes; the
  Gemara later has Rabbah accept Rava's concern and add his own — verified), and a
  READ BACKWARD transfer step naming the lab's remedy-to-risk method explicitly.

- kiddushin lab 3 -> 7 steps: completes the Mishnah's own structure (the three methods
  b'chesef bishtar uv'viah; the two exits b'get uv'mitat habaal), adds the chapter-1 vs
  chapter-2 language shift (ha'isha niknit vs ha'ish mekadesh — acquisition-language vs
  consecration-language, verified as the Gemara's own discussion), and the kicha-kicha
  gezeira shava from the field of Ephron (verified) — which also gives the gezeira shava
  a second live appearance after gemara-middot. TRACE THE SOURCE feedback explicitly
  blocks the wife-equals-field misreading.

Both labs keep KEEP THE BOUNDARY as the final step (marriage/divorce sensitivity).
Parity pass applied to the original steps' short distractors in the same batch.
Scores 3 -> 6 each; the remaining gap to 8+ is structural — lab.js has no typed-step
support, so no lab can currently earn the production points. That engine extension
(mirroring course-engine's typed flow, one change benefiting all 36 labs) is the next
Wave 3 investment, before the remaining four destination labs (nedarim, sotah, megillah,
rosh-hashanah).

Verification: JSON valid, boundary-last confirmed programmatically for both labs,
kiddushin lab live end-to-end (7 lines on the working Daf, all steps credit, completion
reached), suite 151/151.


## 2026-07-13 — Claude: lab engine gains typed production steps; both deepened labs past bar

- lab.js: added typed-step support mirroring course-engine.js — renderTypedStep with
  normalize/compare against an acceptable list, Enter-key submit, XP + event POST
  (skillId lab-<id>-typed, competency translation, sourceContext = lab ref so the
  transfer-evidence bonus applies), daf-line solved marking. The expected answer IS
  revealed on a miss here (unlike canon-course production gates) because labs advance
  forward with no retry loop — no copy exploit exists. One engine change; all 36 labs
  can now carry production checks.

- kiddushin + gittin labs each gained a PRODUCTION CHECK step (typed recall of the lab's
  own anchor line: ha'isha niknit b'shalosh drachim; b'fanai nichtav uv'fanai nechtam),
  placed before the KEEP THE BOUNDARY step, which stays last.

Audit: kiddushin lab 3 -> 9, gittin lab 3 -> 8 — the first labs past the done-bar.
Verification: node --check clean, JSON valid, gittin lab live end-to-end in the browser
including the new typed flow (7/7 credit, typed step accepts, continue enables,
boundary last), suite 151/151.

Remaining Wave 3 destinations: nedarim, sotah, megillah, rosh-hashanah (same treatment:
+3-4 verified sugya steps + typed + parity). Then the 21 non-destination labs in batches.


## 2026-07-13 -- Claude: Wave 3 batch 3 -- the four remaining destination labs

Deepened nedarim, sotah, megillah, rosh-hashanah (the labs the new units route into as
their primary next step). Each 3 -> 7-8 steps with a typed production check; all sources
verified before writing; distractors written at length-parity, then a parity sweep on the
originals' short options (batch-5 lesson, applied up front and in cleanup).

- nedarim 3 -> 8: added the Rabbi Yochanan / Reish Lakish machloket on the origin of
  kinuyim (foreign usage vs sages' coinage -- Nedarim 10a, verified), then the vow-to-
  tax-collectors sugya and its dina d'malkhuta objection + resolution (unfixed-rate /
  self-appointed collector -- Nedarim 28a, verified). The dina d'malkhuta step deliberately
  ties back to the widerworld-encounter unit: charter there, legal machinery here.
- sotah 3 -> 7: added the Gemara's aggadic opening (bat kol matching couples 40 days
  before formation -- Sotah 2a, verified), the Nazir-juxtaposition tractate-order teaching,
  and Sotah 14a imitatio Dei (clothe the naked) -- the exact sugya the widerworld-mean unit
  stands on, met in its home. Boundary step stays last (sensitive tractate).
- megillah 3 -> 7: walled-cities-from-Joshua anchor (why an anchor a millennium before the
  Persian story), the two-dates-from-Esther-9 encoding, and the genizah rule later in the
  tractate -- the practice that filled the Cairo Geniza (ties to history-geniza unit).
- rosh-hashanah 3 -> 7: completed the four new years (Tishrei), the Tu BiShvat Shammai-
  Hillel dispute, and RH 16a shofar-of-the-ram / akeidat Yitzchak -- the sugya the
  chumash-akeidah unit promised.

Design note logged: these four extensions lean on cross-unit ties, so a learner arriving
from a foundation unit now meets its promised sugya in the tractate's own home -- the canon
feels connected in both directions.

Verification: JSON valid, boundary-last confirmed for nedarim+sotah, rosh-hashanah lab
live end-to-end incl. typed step (7/7 credit), audit nedarim 8 / sotah 9 / megillah 9 /
rosh-hashanah 9, suite 151/151. All six destination labs now past bar; fifteen 10s, nine
9s corpus-wide.

## 2026-07-14 — Codex: Journey current-focus handoff

- Added a learner-specific focus panel to the 100-move Canon Journey. It names the one
  currently available source encounter, explains its reading purpose, shows progress, and
  makes the retrieval obligation visible without forcing the learner to scan the whole map.
- The Journey retains its earned-level structure below the focus panel. This makes progress
  legible while preserving the central design: one connected canon path, with Gemara at its
  reasoning spine rather than separate subject tracks.
- Verification: full suite passes, 153 tests / 0 failures.

## 2026-07-14 — Codex: public Friday demo deployment readiness

- Made the server bind to `0.0.0.0`, which preserves local use while allowing a container
  host to route public traffic to Seder. Added a Render Docker Blueprint using the existing
  `/api/health` endpoint and a concise deployment guide.
- The guide explicitly limits this to a presentation demo: without Supabase, local-mode
  learner data is shared and not appropriate for an actual learner pilot.

## 2026-07-14 — Codex: Academy graduation into the next mastery cycle

- Replaced the Day 90 dead end with a dedicated, learner-facing graduation handoff. A learner
  who has earned every Academy day now sees that the foundation is complete and can enter a
  next mastery cycle or their study record directly from the Academy.
- Added `academy-next.html`, which reads demonstrated mastery by broad evidence group and
  recommends one next move: Gemara reasoning, source orientation, or a canon connection.
  The rest of the cycle deliberately interleaves deepening, retrieval, cross-canon transfer,
  and a learner-owned record rather than splitting the learner into disconnected tracks.
- Verification: full suite passes, 152 tests / 0 failures.


## 2026-07-13 -- Claude: Wave 2/canon courses -- all six six-session courses to 9/9

The daily router sends new learners to these six courses, and they still carried curt
strawman distractors (A court; A named rabbi; A historical date). Rewrote all 36 sessions'
distractors into diagnostic near-misses at length parity, correct answers unchanged;
skills, explanations, and the typed production gates preserved. Each course's explanations
now name the contrast the wrong answer revealed.

Highlights: shema-six session 1 tempts with the individual reciter and with God-as-
addressee (both plausible for a prayer, both wrong for a verse that addresses Israel);
freedom-six's argument-vs-topic step tempts with a topic label and an authority appeal --
the two things students mistake for arguments; history-six and responsibility-six tempt
with recruiting a verse for modern policy and with flattening-by-slogan, the real failure
modes of comparative and historical reading.

Audit: all six 6 -> 9 (length-bias 0/6 each). Corpus distribution
{3:21, 4:6, 5:4, 6:1, 7:20, 8:9, 9:15, 10:15} -- the score-6 bucket is now nearly empty.
Verification: all five JSONs valid, history-six live end-to-end (6 rewritten sessions +
production gate + capstone unlock), suite 151/151.

## 2026-07-14 — Codex: presentation front-door QA

- Found that the Seder landing page still rendered the entire 100-moment canon map, despite
  the dedicated Journey page already grouping it into eight earned levels. This made the
  first screen read like a catalog rather than a course.
- The landing page now shows only the current source move and its immediate neighbors, with
  a clear link to the full eight-level journey. The header’s My Journey link also now opens
  that earned-level view directly.
- Live browser check: landing page presents four first moves for a new journey state and the
  full-map link reaches `journey.html`. Full suite: 154 tests / 0 failures.

## 2026-07-14 — Codex: first-learner presentation pass

- Consolidated the 100-move canon journey from eight earned levels to six, preserving all
  sixteen phases and their checkpoints. The home-page overview now uses the same six-level
  language.
- Added a clear fresh-learner route through the local learner-profile screen, so a Friday
  demonstration can begin with empty evidence rather than a previous demo record.
- Fixed a first-day routing flaw found in live QA: an unplaced learner could reach the daily
  router and be sent into a rotating tractate. The router now makes placement the only new
  learner action and hides retrieval, graph, and cross-canon panels until placement exists.
- Aligned the placement screen and entry copy to its actual 12 source checks. Live browser
  verification reached the placement screen from the clean landing path. Full suite: 154
  tests / 0 failures.

## 2026-07-14 — Codex: placement-to-Gemara handoff

- Placement now hands a learner directly into the guided Berakhot 2a lesson rather than
  pausing at a broad curriculum map. The lesson keeps the Hebrew excerpt, in-place
  translation control, source-specific feedback, XP, and an enabled Continue action in one
  reading flow.
- The eight-week journey remains available from the main navigation, but the first action
  after placement now proves the product's central promise: a beginner can begin reading a
  real opening sugya immediately.
- Verification: full suite, 154 tests / 0 failures.

## 2026-07-14 — Codex: interactive Berakhot Daf rail

- Added a readable, text-based Daf rail beside the first Berakhot 2a lesson. It keeps the
  Mishnah, the Gemara's framing question, the scriptural signal, and the cited verse in one
  visible source sequence rather than relying on a blurry page image.
- The active lesson move highlights its related source line. Learners can also select any
  line to see its transliteration and its role in the sugya, while the lesson's translation,
  feedback, XP, and Continue action remain in the same reading flow.
- Live browser QA confirmed correct Hebrew rendering, the active-line reading aid, and the
  existing in-place source support. Full suite: 155 tests / 0 failures.

## 2026-07-14 — Codex: flagship tractate Daf rails

- Extended the interactive, readable Daf rail from Berakhot to Pesachim, Eruvin, Sukkah,
  Bava Metzia, and Bava Kamma. Each rail is source-specific and maps the current lesson
  mode to the relevant case, question, ruling, distinction, or source signal.
- Learners can select any visible line for transliteration and a concise explanation of its
  reading job; source translation, feedback, XP, and Continue remain in the active lesson.
- Live browser QA verified Pesachim’s rail, readable Hebrew, and click-to-inspect reading
  aid. Full suite: 156 tests / 0 failures.

## 2026-07-14 — Codex: required flagship sugya-map handoffs

- Standardized Pesachim, Eruvin, Sukkah, Bava Metzia, and Bava Kamma completion links.
  Each now enters its matching flagship Daf workspace immediately after the source trail.
- The workspace requires every visible source line to be classified, then asks the learner
  to explain one transition in the sugya. It saves the source map and written explanation
  as learner-owned evidence before returning to the full mastery loop.
- Verification: full suite, 157 tests / 0 failures.

## 2026-07-14 — Codex: flagship transfer mastery loop

- A completed flagship source map now frames contrasting-source work as the learner's next
  mastery move, while retaining its 24-hour delayed retrieval schedule.
- Successful transfer now requires a learner-owned sentence explaining the structural habit
  carried into the unfamiliar source. That explanation is saved as a learning artifact;
  transfer evidence continues to earn mastery and XP through a distinct source context.
- A missed transfer no longer sends the learner to generic review. It links directly back
  to the matching tractate's Daf map so the exact case-and-move skill can be rebuilt.
- Verification: full suite, 158 tests / 0 failures.

## 2026-07-14 — Codex: second-source production gates

- The five flagship deep-reading units now end with a less-scaffolded production task that
  asks learners to compare the opening source encounter with the deeper argument encounter.
- Learners must write at least one complete comparison sentence naming both continuity and
  the new reasoning move. The explanation is saved as a learner-owned artifact and recorded
  as source-annotation evidence before the next stage opens.
- Verification: full suite, 159 tests / 0 failures.

## 2026-07-14 — Codex: Gemara mastery journey dashboard

- Added a dedicated learner-facing Gemara dashboard for Pesachim, Eruvin, Sukkah, Bava
  Metzia, and Bava Kamma. Each tractate visibly moves through first source map, second
  source explanation, contrasting-source transfer, and retrieval.
- The dashboard reads saved learner artifacts and review state rather than showing a generic
  progress bar. Every tractate has one next action: begin guided reading, deepen, transfer,
  retrieve, or continue its mastery loop.
- Added a direct entry from the existing Mastery Map. Verification: full suite, 160 tests /
  0 failures.
## 2026-07-14 — Codex: source-based Canon Connections

- Added a short Canon Connection immediately after a learner completes a flagship Gemara transfer explanation. Each connection keeps the Gemara habit visible while introducing one relevant Torah source: freedom and ritual time (Pesachim), Shabbat covenant (Eruvin), embodied memory (Sukkah), ethics (Bava Metzia), or damage and restitution (Bava Kamma).
- Each encounter includes readable Hebrew, guided English, a direct Sefaria source link, shuffled answers, XP-bearing source-annotation evidence, and one appropriate onward route into the wider canon. It does not provide practical legal advice.
- The connection only appears after the learner has completed the underlying transfer work; it is not a shortcut around Gemara evidence.
- Verification: full suite, 161 tests / 0 failures; `git diff --check` clean.
## 2026-07-14 — Codex: second Gemara mastery cohort

- Added a complete source-to-transfer evidence loop for Berakhot, Shabbat, and Yoma: visible source mapping, a typed second-source comparison, an unseen-source transfer check, scheduled retrieval, and a Canon Connection.
- Grouped the Gemara mastery dashboard into an earned Foundations cohort followed by the flagship legal-world cohort, so learners encounter a manageable progression rather than one undifferentiated list.
- Source links were verified on Sefaria for Berakhot 2a, Shabbat 2a, Deuteronomy 6:7, Exodus 20:9–10, and Leviticus 16:29. The Shabbat and Yoma units retain explicit study-versus-practice boundaries.
## 2026-07-14 — Codex: third Gemara mastery cohort

- Extended the same source-based mastery loop to Ketubot, Chullin, and Niddah: source map, written comparison, shuffled transfer, retrieval, and Canon Connection.
- The Gemara journey now has three legible learning cohorts: Foundations (Berakhot, Shabbat, Yoma), Structures / Reasons / Disputes (Ketubot, Chullin, Niddah), and the flagship legal worlds.
- Chullin and Niddah retain explicit boundaries: learners study source architecture and do not receive practical halakhic guidance. Sefaria verification completed for Ketubot 2a, Chullin 2a, Niddah 2a, Genesis 2:18, Deuteronomy 12:21, and Leviticus 19:15.
## 2026-07-15 — Codex: guided Gemara path and cohort gates

- The Gemara dashboard now gives the learner one explicit recommended next move, with a short explanation of the reading habit it develops.
- Tractates now open in one earned sequence: each source-transfer demonstration opens the next tractate, and a complete cohort opens the next cohort. Earlier work remains reviewable; future work is visible as upcoming rather than presented as a choice overload.
- Each gate is tied to learner-owned source-map, second-source, and transfer evidence rather than self-reported completion.
## 2026-07-15 — Codex: Canon Connection mastery gate

- Canon Connections now save durable `canon_connection` evidence after a learner correctly connects a Gemara reading habit with a wider Torah source.
- The guided Gemara path now requires that evidence before it opens the next tractate or cohort. The dashboard visibly includes the Canon link as a sixth stage, alongside source mapping, comparison, transfer, and retrieval.
- This makes the unified-canon model instructional rather than decorative: Gemara remains the spine, but every step also demonstrates a real link into the wider Jewish canon.
## 2026-07-15 — Codex: Canon Connection return handoff

- Completing a Canon Connection now opens an evidence-earned handoff rather than leaving the learner inside a detached wider-canon route.
- The primary action continues to the newly opened next Gemara tractate; the associated wider-canon course remains a clearly optional deeper exploration.
- The final current tractate returns the learner to the Gemara mastery journey for retrieval and extension.

## 2026-07-15 — Codex: in-source language support for beginner Gemara learners

- Added optional English visibility, click-to-inspect reading help, and concise transliteration, meaning, and reading-job cues directly above each shared cohort source map.
- Learners can save an encountered key word to their private source vocabulary; it returns through the existing vocabulary recall page with an initial one-day interval.
- The support is intentionally subordinate to source mapping: English is explicitly framed as a way to check a reading, not replace it. All six cohort tractates have three contextual aids.

## 2026-07-15 — Codex: daily recall queue

- Added a learner-facing Daily Recall Queue that combines due personally saved source words with the existing due Gemara retrieval queue.
- A correct typed word recall doubles its interval up to 30 days; a miss returns it tomorrow. The page names the source where each word was saved and awards normal learner XP through the existing event path.
- Today now recommends this queue whenever either kind of recall is due, before new material, while retaining the usual study, transfer, and connection routine.

## 2026-07-15 — Codex: public time, testimony, and reading cohort

- Added Rosh Hashanah, Taanit, and Megillah as an earned fourth Gemara cohort: each has a visible primary source, optional in-text reading support, written second-source comparison, shuffled transfer check, scheduled retrieval, and Canon Connection.
- Source links and excerpts were verified on Sefaria: Mishnah Rosh Hashanah 2:1, Mishnah Ta'anit 1:1, Mishnah Megillah 1:1, Deuteronomy 17:4, Deuteronomy 11:14, and Esther 9:28.
- Rosh Hashanah, Taanit, and Megillah explicitly frame live-practice implications as source study rather than calendar or prayer instruction.

## 2026-07-15 — Codex: public-time cohort retrieval closure

- Added three shuffled Retrieval Room variants each for Rosh Hashanah, Taanit, and Megillah: evidence and procedure; disagreement and distinction; shared practice, place, and access.
- Completing one of these retrieval sets now returns learners to the Gemara mastery journey rather than the unrelated Berakhot arc.
- This closes the delayed-retrieval loop attached to the cohort’s source-transfer evidence.

## 2026-07-15 — Codex: visible second-source comparison

- Replaced explanation-only comparison with a visible second-source panel across all nine shared source-mastery units.
- Each panel provides Hebrew, optional English, a direct Sefaria link, and three learner-selectable relationship lenses before the written comparison.
- The design keeps two sources legible in the same learning room, so comparison is anchored in text rather than a summary alone.

## 2026-07-15 — Codex: active source-pair workspace

- Added an active comparison workspace to the source-mastery room: learners select the exact Source A line that the visible Source B supports, changes, or complicates.
- The selected line remains visually paired with the displayed second source before the learner writes their explanation.


## 2026-07-13 -- Claude: Wave 3 batch 4 -- Bava Kamma and Chullin labs deepened

Two labs whose full arcs already route learners toward them, so sources were pre-verified
in the arcs. Each 3 -> 6-7 steps with a typed production check; distractors at parity.

- bava-kamma lab 3 -> 9 (7 steps): added the lo-harei differentiation step and the
  tzad-hashaveh shared-principle step (the arc's core moves, now on the working Daf), a
  typed recall of "arba'ah avot nezikin", and the categories-are-not-a-verdict boundary.
- chullin lab 3 -> 9 (6 steps): completed the hakol/chutz-mecheresh-shoteh-vekatan rule
  with its exception and the shema-yekalkelu functional reason (competence, not identity
  -- tied back to the honor-parents functional-category move), a typed recall of "hakol
  shochtin", and the study-not-psak boundary framed as the middle path between self-ruling
  and avoidance.

Note: Codex is active again -- it rerouted bava-kamma-arc and bava-metzia-arc nextUrls to
flagship-daf-workbench.html. That touches the arc JS, not data/tractate-labs.json
(confirmed git status shows only my change to the labs file), so no collision. The labs
remain reachable via the Shas map and daily cycle regardless of the arc reroute.

Audit: both labs 3 -> 9 (length-bias 0). Corpus distribution
{3:19, 4:6, 5:4, 6:1, 7:20, 8:9, 9:17, 10:15}. Verification: JSON valid, chullin lab live
end-to-end incl. typed step (6/6 credit, boundary last), suite green.

## 2026-07-15 — Codex: guided source comparison

- Replaced the required typed second-source comparison in shared Gemara source-mastery units with a shuffled, source-grounded explanation choice. Learners must first select a relevant Source A line; a missed choice can be retried, and the correct choice earns the same source-annotation evidence.
- This keeps the intellectual work in the text pair without making keyboard fluency or blank-page writing a condition of early progress. Free-form notes may remain optional learner tools, never a mastery gate.

## 2026-07-15 — Codex: flagship guided explanation checks

- Replaced typed production gates in the five flagship second-source deep readings and their contrasting-source transfer handoffs with retryable, shuffled explanation checks.
- The learner now identifies the best account of a source’s new move and the transferable reading habit; success still writes the same durable source evidence and artifacts before the next step opens.

## 2026-07-15 — Codex: no-required-typing shared engines

- Converted the shared front-door course engine, working-Daf lab engine, and six-session canon-course production gate to show shuffled source-grounded choices instead of asking learners to type an answer.
- Existing typed data remains backward-compatible, but learner-facing progress now uses the same reading, distinction, retry, and evidence loop across Gemara and the wider canon.

## 2026-07-15 — Codex: Berakhot independent source check

- Replaced the final Berakhot practice-lab text input with a shuffled translation choice that keeps the learner on the source line and retains the same repair path and mastery evidence.

## 2026-07-15 — Codex: Foundations guided reading-plan check

- Replaced the Foundations 25-word writing gate with a shuffled, source-grounded reading-plan choice. The same source evidence and Foundations artifact are recorded after the learner identifies the correct reading sequence.

## 2026-07-15 — Codex: Berakhot independent source check

- Replaced the final Berakhot practice-lab text input with a shuffled translation choice that keeps the learner on the source line and retains the same repair path and mastery evidence.


## 2026-07-13 -- Claude: Wave 3 batch 5 -- Yoma, Bava Batra, Avodah Zarah labs

Three major, widely-known floor labs, each 3 -> 6 steps with a typed production check;
sources verified before writing; distractors at parity (one residual soft flag each on
bava-batra/yoma, both still score 8).

- bava-batra 3 -> 8: added the hezek re'iyah dispute (is being seen a legal harm? -- BB 2a,
  verified) and the four-cubit height that is engineered to defeat exactly that sightline;
  typed recall of "bonin et hakotel ba'emtza".
- yoma 3 -> 8: added the derivation of the seven days from the milu'im / Leviticus 8:34
  "ka'asher asah... tzivah" (one phrase read for both parah and Yom Kippur -- verified) and
  the prepared backup priest that answers the stated risk; typed recall of "shema ye'era
  bo pesul".
- avodah-zarah 3 -> 9: added the tractate's famous eschatological opening (God brings the
  Torah scroll, the nations claim reward, Rome answers "we built markets and bathhouses...
  for Israel's sake" -- AZ 2a, verified) and what the Gemara does by voicing Rome's own
  self-justification before testing it; typed recall of "lifnei eideihen shelosha yamim".
  The existing historical-literacy framing (not commentary on any living faith) is
  preserved.

Note: browser classifier was temporarily unavailable at ship time, so this batch was
verified structurally (JSON valid, all steps well-formed, typed step present, boundary/
summary placement correct) rather than by a live click-through -- the identical lab typed-
flow was live-tested on gittin, rosh-hashanah, and chullin earlier today.

Audit: bava-batra 8, yoma 8, avodah-zarah 9. Corpus floor (score 3) down to 16.
Distribution {3:16, 4:6, 5:4, 6:1, 7:20, 8:11, 9:18, 10:15}. Suite 170/170.

## 2026-07-15 — Codex: Berakhot Foundation Year Block 1

- Organized Berakhot as one earned ten-session foundation block: one visible next move, completed moves available for review, and later moves locked until their prerequisite evidence is earned.
- Corrected the block gates to use skill IDs the linked units actually record, and repaired the unit-three handoff so independent reading leads into Mishnah grammar rather than leaving the block.
- Replaced the unseen-sugya typing field with shuffled, source-grounded choices; the learner can still demonstrate transfer without having to type an answer.

## 2026-07-15 — Codex: Guided checks across front-door Gemara

- Replaced the final typed-production wording and data in Shabbat, Pesachim, Eruvin, Sukkah, Bava Metzia, Bava Kamma, and Yoma with source-grounded guided choices. The shared engine shuffles every answer set at render time.
- Verified the Shabbat block’s cited source pages on Sefaria: Mishnah Shabbat 1:1, Mishnah Shabbat 1:2, and Shabbat 9b. The block retains its explicit study-not-personal-ruling boundary.

## 2026-07-15 — Codex: Shabbat Foundation Block 2

- Added an earned learner loop after the Shabbat source trail: interactive Daf mapping, retrieval practice, unseen-sugya transfer, Canon Connection, and a clear handoff into Eruvin.
- The loop evaluates durable learner evidence: completed stage, correct workbench/lab/transfer events, and the saved Shabbat Canon Connection artifact.

## 2026-07-15 — Codex: Eruvin Foundation Block 3

- Added an earned Eruvin loop from the measured case into visible Daf mapping, retrieval, an Eruvin-specific unseen transfer, Canon Connection, and Pesachim.

## 2026-07-15 — Codex: Foundation Capstone

- Added a five-move, no-required-typing capstone after Integration III. Learners map a Gemara case, read Torah in context, repair a flattened Mussar reading, distinguish historical evidence from memory, and transfer the sequence to an unseen Mishnah.
- Every move is Sefaria-linked, shuffles choices, records evidence, and shows the practical-guidance boundary. The full suite passes 185/185.
- Verified the block’s cited source pages on Sefaria: Mishnah Eruvin 1:1, Mishnah Eruvin 1:2, and Eruvin 2a. The study boundary explicitly excludes real-world eruv determination.


## 2026-07-15 -- Claude: dry run of the migrated spine + coordination note

Codex has migrated five arcs (bava-kamma, bava-metzia, eruvin, pesachim, sukkah) to
flagship-daf-workbench.html and replaced typed production gates with shuffled explanation/
source checks across the flagship path and several arcs (converting some of my typed steps
to recognition, keeping the skill IDs). This is a deliberate, owner-endorsed design choice
(commits authored under Sam's identity). I am staying off the arcs and flagship files
while Codex is active there.

Verification pass (read-only) on the current tree:
- Sitewide link sweep: 147 html + 164 js scanned, zero broken local page links.
- node --check clean on flagship-daf-workbench.js, flagship-transfer-mastery.js,
  second-source-production.js.
- Fresh-learner dry run (cleared storage, new learner id): landing renders with no JS
  errors and now offers a "start with a fresh learner" CTA (addresses the old shared-demo
  risk); flagship-daf-workbench loads Bava Kamma 2a as an interactive Sugya Map with no JS
  errors; daily-router correctly routes a placement-less learner to placement.html.
- Full suite 170/170 at last run.

Open coordination question for Sam (unchanged, now sharper): the app now has two
production-check philosophies -- typed recall (non-Gemara units + labs, mine) and
shuffled explanation/source checks (Gemara spine + flagship, Codex). Both are defensible
for their surface, but a one-line principle on which belongs where would let us make it
consistent. No code change made pending that decision.

## 2026-07-16 -- Codex: unified Foundation tractate post-arc route

- Chose the tractate-specific flagship Daf workbench as the canonical post-arc destination
  for all nine Foundation tractates: Shabbat, Eruvin, Pesachim, Sukkah, Bava Metzia,
  Bava Kamma, Ketubot, Chullin, and Niddah.
- Added tractate-specific opening packets for Ketubot 2a, Chullin 2a, and Mishnah Niddah
  1:1, each with a Sefaria source link, visible translation control, and line-role mapping.
  The Niddah packet remains text-focused and does not offer practical guidance.
- A completed source map now goes forward to the tractate's targeted practice set instead
  of returning to the just-completed arc. `tractate-mastery.html` remains an optional
  reference dashboard, not a competing post-arc route.
- Added a regression test covering all nine stage-to-workbench mappings and source packets.
  Yoma is intentionally outside this Foundation cohort and remains on its advanced
  procedure-focused route pending a dedicated workbench packet.

## 2026-07-16 -- Codex: adaptive graph coverage for deeper canon units

- Added the 50 assessed source skills from the new Halakha, Chumash, Tefillah, History,
  and Wider World units to the adaptive recommendation graph, preserving each unit's
  internal skill sequence.
- Each graph recommendation returns learners to the relevant source course rather than a
  generic Gemara fallback. Translation-anchor steps remain translation-recall skills.
- Kept `data/tractate-labs.json` out of this change because it contains separate uncommitted
  work. Focused recommendation tests pass before the full-suite check.

## 2026-07-16 -- Codex: learner-flow QA and course-resume repair

- Live fresh-learner QA passed through profile creation, daily routing, placement, answer
  progression, a Halakha source lesson, and its visible Continue action at a mobile viewport.
- Found that the shared course engine lost its in-course position on reload while retaining
  XP. It now saves the next source step locally per learner and course, then clears that
  saved position after the earned checkpoint.
- Restored actual text entry for `typed:true` translation-anchor checks. Argument and
  source-reasoning checks remain shuffled choices; this follows the production principle.


## 2026-07-15 -- Claude: floor labs Nazir/Taanit/Makkot deepened + lab.js render conflict flagged

Deepened three non-destination floor labs (sources verified before writing):
- taanit 3 -> 8: added the gevurot-geshamim/techiyat-hametim placement (why rain sits in
  the resurrection blessing; Taanit 2a) + typed recall.
- nazir 3 -> 9: added the three Numbers 6 restrictions (wine/hair/corpse) and the 30-day
  default for an unspecified vow + typed recall of the kinuyim opening.
- makkot 3 -> 8: added the ka'asher-zamam-v'lo-asah close reading (Makkot 2a: the reciprocal
  law triggers on the scheme, not the deed) and the hazama-vs-hakhasha distinction + typed
  recall of the Deut 19:19 source phrase.
All distractors at parity; JSON valid; audit taanit 8 / nazir 9 / makkot 8.

CONFLICT FLAGGED (not mine to resolve): Codex has shipped lab.js?v=3 (+ milestones.js),
which now renders `typed:true` lab steps as auto-generated guided multiple-choice (correct
answer + generic distractors "A question the line raises...", "A final ruling not stated
here"). Verified it works end to end (credits, advances) — but it contradicts the
production principle decided hours earlier, which places tractate labs in the typed-recall
(translation) camp. Side effect: every lab typed step now shows "Typing an answer from
memory..." feedback on a click interaction, which reads wrong. Needs a Sam/Codex decision:
either lab.js honors typed recall for labs, or the principle is amended to put labs in the
guided-check camp (in which case the lab typed-step feedback lines want a sweep). I left the
lab DATA as typed:true (correct per the current principle) and did not touch lab.js.


## 2026-07-15 -- Claude: Option A applied — labs render typed recall again

Sam chose Option A on the lab-render conflict: tractate labs close a translation
competency, so their terminal check is typed recall, not guided multiple-choice. Codex's
lab.js v3 had inserted a button-rendering block plus an early `return;` into
renderTypedStep, which left the original text-input implementation intact but unreachable.
Removed the inserted block so the function falls through to the real typed input again.
No test asserted the button behavior (the only lab-typed test is data-level: acceptable[]
present). Verified live: gittin's typed step now renders a text input, accepts the answer,
credits +10 XP. Suite 189/189.

Note for Codex: lab.js is now aligned with the production principle. If you still want a
recognition-style check somewhere in labs, add it as its own explicit MC step (competency
argument/sourceReasoning) rather than reinterpreting typed steps — per the principle,
don't convert a translation-anchor recall into recognition.


## 2026-07-15 -- Claude: floor labs Yevamot/Shevuot/Horayot deepened (all to 8)

Three more Nashim/Nezikin floor labs, sources verified:
- yevamot 3 -> 8: added the tzarat-ervah mechanism (yibum lifts only the brother's-widow
  prohibition, so an ervah and her co-wife both drop out — the chapter's engine) + typed
  recall of the fifteen-women opening.
- shevuot 3 -> 8: filled in the shtayim-she'hen-arba oaths of bittui (I will/will not eat;
  I ate/did not — two Torah cases extended to past and future) + typed recall of the
  opening line. Reinforces the cross-tractate "two that are four" pattern shared with
  Shabbat.
- horayot 3 -> 8: added the scholar-who-knew-is-liable limit on reliance and the par
  he'elem davar communal offering (the law's built-in admission that even the high court
  can err) + typed recall of "patur mipnei shetala b'beit din."

All distractors brought to length parity (my concept-step correct answers had run long;
trimmed). Live-verified horayot end to end incl. the typed input rendering correctly under
the Option-A lab.js. Score-3 floor now down to 10 labs (all Kodashim + Beitzah/Moed Katan).
Suite green.

## 2026-07-16 -- Codex: canonical mastery-route registry

Replaced the stacked post-arc route overrides in `course-engine.js` with one
`masteryRouteByStage` registry. Every current tractate arc now resolves once to a visible
source workspace: Berakhot uses its Daf workbench, Yoma its dedicated workspace, and the
nine Foundation blocks use tractate-specific flagship workbenches. `tractate-mastery.html`
is no longer a post-arc destination; it remains an optional dashboard/reference surface.

Added a route-matrix test and updated the Foundation block tests to assert the canonical
destination rather than the retired first-block handoff. Targeted route suite: 8/8 green.

## 2026-07-16 -- Codex: adaptive graph reaches every non-Gemara source course

Added the nine previously unrepresented Mussar, Chassidus, and later-foundation course
sequences to `nonGemaraSkillGraph`. The graph now sees all 14 active non-Gemara courses:
each later unit opens only after the prior unit's translation-anchor recall, while first
Mussar and Chassidus units remain gated by conceptual-reading foundations. This gives
`nextGraphPractice` a real route into those courses rather than merely recording their
progress after a learner finds them elsewhere. Targeted curriculum-engine suite: 7/7 green.

## 2026-07-16 -- Codex: learner-flow QA and daily Gemara route repair

- Live fresh-learner QA confirmed that the landing page can create a distinct local learner
  profile and that placement deliberately hands a beginner straight to the guided Berakhot
  2a source, with the eight-week journey still visible from the main navigation.
- Corrected a remaining route inconsistency: daily Gemara rotation was still linking to the
  retired `tractate-mastery.html` dashboard while earned tractate arcs use the canonical
  interactive Daf workbenches. Daily rotation now uses those same tractate-specific
  workspaces, including the dedicated Berakhot Daf workbench.
- Added a regression test so the daily recommendation cannot quietly return to the retired
  dashboard route.

## 2026-07-16 -- Codex: Term Three source-based canon integration

- Kept the existing ten-step Niddah source trail as the Term Three Gemara anchor rather
  than duplicating its sensitive material in a second course.
- Added an earned four-source integration: Mishnah Niddah 1:1, Eruvin 13b, and Pirkei
  Avot 4:1 build one transferable reading habit — preserve each voice, identify the
  exact distinction, then compare responsibly. All choices shuffle at render time; no
  typing is required.
- Reworked the Term Three page into a visible source trail → Gemara practice → canon
  integration → transfer sequence. The transfer now returns to the term rather than
  looping a learner back into the already-completed Niddah source trail.
- Verified cited references on Sefaria before writing; Term Three retains an explicit
  study-only boundary for personal, health, family, ritual, and legal questions.

## 2026-07-16 -- Codex: Sanhedrin full source trail

- Promoted Sanhedrin from a one-step entry to a ten-step beginner tractate arc based on
  Mishnah Sanhedrin 1:1 and Sanhedrin 2a: category → named cases → wording question →
  “what are these?” reading proposal → source layer → transfer.
- Added a Sanhedrin packet to the interactive flagship Daf workspace and registered the
  post-arc mastery route, so completion follows the same source-workbench model as the
  other Foundation arcs.
- Added Sanhedrin to the Gemara continuation sequence and the Shas map’s full-arc route.
  The terminal translation recall remains typed; argument and source-reasoning checks are
  shuffled choices. All learner-facing court material retains an explicit study-only,
  non-adjudicative boundary.

## 2026-07-16 -- Claude: floor labs Beitzah / Moed Katan / Zevachim to 8

Deepened three score-3 floor labs with verified sugya content + a typed translation-anchor
production check (Option-A style), each placed before any boundary step:
Beitzah 2a (Beit Hillel forbids the festival-laid egg -- Rabbah's hachana vs Rav Nachman's
nolad/muktzeh), Moed Katan 2a (davar ha'aved permits chol hamoed labor, capped by the
tircha limit), Zevachim 2a (shelo lishman offerings are valid but uncredited, except pesach
and chatat -- the lishmah thread back to the Gittin lab). Widened concept-step distractors
to length parity (my correct answers had run 150-212 chars vs 30-90 char distractors);
final audit 0/4 length flags on all three. Audit: beitzah 8, moed-katan 8, zevachim 8.
Live-verified Beitzah end to end -- five-line daf renders, line 5 typed step renders the
Option-A text input, valid answer graded +10 with teaching feedback. Full suite 191/191
green (Codex's canonical mastery-route registry resolved the prior transient failure).
Score-3 floor now down to 7 labs (remaining obscure Kodashim: Menachot, Bekhorot, Arakhin,
Temurah, Keritot, Meilah, Tamid).

## 2026-07-16 -- Codex: Foundation Synthesis checkpoint

- Added an earned, source-first Foundation Synthesis after the Niddah transfer. It retrieves
  distinct moves from Ketubot (reason), Chullin (scope), Niddah (voices), and Sanhedrin
  (category/specification), then makes a bounded connection to Pirkei Avot 1:6 on charitable
  judgment without flattening source distinctions.
- Each source includes Hebrew, a short English orientation, a Sefaria deep link, shuffled
  choices, learner events, and a study-only boundary. Completion returns to the next Gemara
  source trail rather than ending the learner journey.

## 2026-07-16 -- Codex: Foundation Year path

- Connected the first three Foundation Terms through a learner-facing Foundation Year map with
  earned/current/locked states based on recorded term checkpoints. My Journey now links there
  directly.
- First Term completion now opens the Foundation Year map, Term Two’s capstone records an
  explicit checkpoint and hands into Term Three, and Term Three exposes the final Foundation
  Synthesis as its fifth earned step.

## 2026-07-16 -- Codex: Foundation-aware daily recommendation

- Today’s browser router and the server recommendation API now both recognize the earliest
  unearned Foundation Year checkpoint. They prioritize the current Foundation Term after
  placement, while preserving urgent retrieval and targeted remediation ahead of new study.
- This makes Seder, Today, and Foundation Year agree on one next move instead of rotating a
  learner into an unrelated tractate during an unfinished term.
