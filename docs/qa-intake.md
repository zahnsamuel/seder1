# QA intake and implementation log

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
