# QA intake and implementation log

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
Problem: `curriculum/berakhot-onramp.json` and `curriculum/berakhot-unit-1.json` are dead data -- confirmed no live HTML/JS references either file (only served by unused API routes). They appear to be superseded by `berakhot-deep.js` and friends.
Why it matters: No learner impact, but they're stale artifacts that could confuse a future contributor into thinking they're live content.
Recommended change: Delete both files and their now-unused `/api/curriculum/berakhot-onramp` and `/api/curriculum/berakhot-unit-1` routes in `server.mjs`, or explicitly document why they're kept.
Specific file: curriculum/berakhot-onramp.json, curriculum/berakhot-unit-1.json, server.mjs
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
