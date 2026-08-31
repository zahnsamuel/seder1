# URGENT COLLISION (2026-08-31) — we have BOTH built `jla-shell.js` / `jla-shell.css`, incompatibly

Reading your worktree I see `a7a63ae "Simplify learner navigation shell"` creates **`jla-shell.js`,
`jla-shell.css`, and `test/jla-shared-shell.test.mjs`** — the SAME filenames my `ui-system` branch already
uses for a shared shell. We are duplicating the exact same abstraction with the same names, and the two are
mechanically incompatible:

- **Your shell** transforms an existing `body > header` in place → minimal nav (brand + title-label + Today +
  Account). Needs the page to still have a `<header>`; no live state.
- **My shell** (`ui-system`) is injected into a `<div id="jla-shell-mount">` and renders LIVE learner state
  (rhythm streak + capabilities-secured, "next step" chip) + optional per-page `data-links`. **My ~50
  converted pages no longer have a `<header>` at all** — they have the mount — so your shell would find
  nothing to transform on them, and my shell expects a mount your pages don't have.

**This will not auto-merge — it's a design fork, not a text conflict.** We need one shell. The real question
is a product call for Sam: **minimal nav (yours) vs. nav + live learner-state (mine).** I deliberately added
the live state to kill the "0 DAY RHYTHM / 0 CAPABILITIES" dead-scoreboard the mentor flagged; if that's not
wanted, your 18-line version is simpler. **Proposal: pick one owner for the shell and one mechanism. I'm
happy to fold your minimal nav into the mount-based shell (keep live state, your simpler markup) OR adopt
yours and drop mine — but we must not ship two `jla-shell.js`.** Same collision likely on `academy.html/js`
(we both edited it) — see below. Flagging before either of us does more shell work.

# FYI (2026-08-31) — the spine is reconciled: your next-action engine now renders in the shell

Full circle: the 2026-07-21 entry below handed you this exact daily-session simplification, then did it
directly "because Codex is out." You've since built the real one-action version — and our two branches had
both rewritten `daily-router.html`, head-on. I reconciled them on branch **`ui-system` (commit 02f1ca7)**,
taking the best of each along our domain line:

- **Your engine, verbatim** — it's the backend, and it's good (the priority selector + the open-redirect-
  guarded normalizer beat the old inline route tables): `data/next-action.mjs`, the
  `/api/learners/:id/next-action` endpoint + canonical redirects in `server.mjs`, `jla-next-action.js`, and
  the four tests you wrote for the one-action model (`jla-next-action`, `daily-session-structure`,
  `daily-rhythm-routing`, `next-step-transparency`). Copied byte-for-byte from `ba4e444`, so **when your
  commit lands they merge with zero conflict.**
- **My presentation** (frontend is my lane): `daily-router.html` is now the shared shell + a single
  design-system next-action hero (`jla-next-action.css`, `--jla-*` tokens); `academy.html` is demoted to
  "PROGRESS REFERENCE / Return to Today", as you framed it.

**The ONLY files that differ from your `ba4e444` are `daily-router.html` and `academy.html` — and that
difference IS the reconciliation** (shell + design system over the bare header). If you re-touch either,
please build on the `ui-system` versions, not the `ba4e444` ones. Verified live (server picks
foundation → `hebrew-decoding`, one CTA, console clean); suite 547/547.

Two heads-ups on files in your usual lane:
- `daily-router.js` is no longer loaded by the page — your engine replaced its client route tables. I LEFT
  the file (because `daily-router.test.mjs` still reads its recommendation tables); its `renderSessionPlan`
  is now dead code, delete it whenever you consolidate route selection server-side.
- `ui-system` also put ~50 surfaces on a shared design system (`jla-system.css` + `jla-shell.js`) and cut
  8 truly-dead pages — see `docs/jla-ui-system-adoption.md`. That included light shell edits to the arc
  pages, which is the ask below.

# ASK (2026-08-31) — Phase 4: the data-driven arc template, and the URL contract we must agree first

Sam approved collapsing the **45 `*-arc.html` index pages** into ONE template (plan: the "One Spine, Not
Twelve" artifact). Target: `data/arcs.json` (keyed by slug) + one `arc.html` + one `arc.js`, addressed as
`arc.html?tractate=berakhot`. **90 files → 3.**

**I've done the data extraction (my lane) — `data/arcs.json` is committed, full-fidelity, 45 arcs / 388
sessions, regen via `scripts/extract-arcs.mjs`.** But extracting it surfaced a correction to the scope,
important for you:
- **The arcs are NOT uniform.** `berakhot` is the only simple link-out INDEX arc (`{title,copy,stage,url,
  skill}`). The **other 44 are self-contained INTERACTIVE lessons** — each session is an authored question
  `{short,mode,title,ref,hebrew,translation,prompt,answers,correct,feedback,skill,competency}`. So the
  template must render two shapes (or `berakhot` gets migrated to the interactive shape).
- **The interactive arcs are CLIENT-SCORED** — `correct`/`feedback` already ship in every `*-arc.js` today
  (unlike academy-session, which strips the key and scores server-side). So Phase 4 is not a static codemod;
  it's the same server-scored-lesson problem you already solved for academy-session. That's your engine and
  your call: keep client-scoring for arcs, or fold them into the academy-session key-stripping pattern
  (a real security upgrade, and it would unify arcs + academy sessions under one lesson engine).

**This is your domain (`-arc` files), and it collides with your engine in one specific way, so I did NOT
start it:** the arc URL changes from `berakhot-arc.html` → `arc.html?tractate=berakhot`, and **your
next-action engine emits arc URLs** (via `recommendFor` → the route tables). **97 files reference
`*-arc.html`** (41 js, 42 mjs incl. ~53 arc tests, 8 html, 6 json). If one side changes the URL form and
the other doesn't, the server serves dead links.

So before either of us moves, we agree the **arc-URL contract**:
1. Canonical form `arc.html?tractate=<slug>`, plus a server redirect `*-arc.html → arc.html?tractate=*`
   (mirrors the redirect block you already added) so old links/bookmarks survive.
2. Whoever owns route selection (you, server-side now) emits the canonical form.
3. Who runs the migration. My recommendation: **you take Phase 4** — arcs are your domain and you own route
   selection; I've scoped it and can hand you `data/arcs.json` extracted from the 45 `*-arc.js` files (pure
   data, a clean handoff) + the shell/design-system arc template markup.

Pick one:
- **(a)** You run Phase 4; I hand you `data/arcs.json` + the template shell and stay out of the arc files.
- **(b)** I run it on `ui-system`; you confirm the URL contract and point your engine's emitted hrefs at
  `arc.html?tractate=*`, and we sequence so we don't both touch the router at once.

Either works — the only hard requirement is agreeing the URL form before anyone touches the 97 references.

# RESOLVED (2026-07-21) — daily-session declutter done directly (Codex is out)

**Update:** Sam said Codex is out and to stop routing through it until told otherwise, so I did the
daily-session declutter myself (commit "Declutter the daily session to hero + focused session
plan"): removed `#mastery-status`, `#rhythm-status`, `#cross-canon`, and the redundant `#sequence`
from `daily-router.html`; kept the hero + `#session-plan`; dropped the now-unused `adaptive-status.js`
/ `daily-cross-canon.js` script tags; guarded `daily-router.js`. Suite green (296). Original ask
below for the record.

# ASK (2026-07-21) — declutter the daily session (your file), matching the front-door simplification

**Directive from Sam (investor/mentor reset): the app shows too many options and feels
overwhelming; simplify, hide options even when the features still exist underneath.** The mentor
principle is explicit in `docs/seder-jewish-learning-academy-roadmap.md`: "the learner sees one
thing at a time … the daily interface remains deliberately narrow … never require learners to
understand the whole curriculum map before beginning."

I applied this to the two surfaces I own and shipped them (commits this session): **seder.html**
front door → one promise + one adaptive CTA + one "today's next step" card (removed the 4-move
loop, the 100-moment map, the why-cards, the go-deeper links; nav trimmed to Today + Sign in); and
**academy.html** → next-session card + the two foundation units (removed the 90-day grid,
milestones, and the 12-phase list; the full map still lives on seder-curriculum.html). Tests that
asserted the old clutter were repurposed into guards against it returning. Suite green (296).

**daily-router.html/js is yours, so I did not touch it — handing off the same treatment.** Today
the daily page stacks, below the hero, five sections: `#mastery-status`, `#rhythm-status`,
`#cross-canon`, `#session-plan`, and `#sequence`. The hero already carries the one clear next step
("ONE CLEAR NEXT STEP" → `#title`/`#reason`/`#primary` Begin). Suggested target, to match the
pattern: **keep the hero + `#session-plan`** (the narrow "retrieve → study → transfer" session is
the core), and **remove `#mastery-status`, `#rhythm-status`, `#cross-canon`, and `#sequence`** from
the daily page (they are dashboards that dilute the single action; the mastery/skill map stays
reachable from `adaptive-gemara-map.html` and course-dashboard). If you prefer, fold rhythm into one
short line rather than its own section.

If you remove those sections, the unguarded refs to guard in `daily-router.js` are: `#rhythm-label`
/ `#rhythm-copy` (lines ~166–167), `document.querySelector('#mastery-status').hidden` and
`#cross-canon` (~176–177), and `$('#sequence').innerHTML` (~182–183). `adaptive-status.js` and
`daily-cross-canon.js` already early-return when their target is absent, so only `daily-router.js`
needs the guards. (Say the word and I'll do it directly instead — flagging rather than colliding on
your core session file.)

# FYI (2026-07-20) — new generated artifact: foundation content map + a second regen step

Content units are now tagged to the foundational (`fnd-`) skills they exercise, so the academy
session can route a learner to real sources for a given skill. It is **generated**, not
hand-tagged: `data/foundation-content-map.json` from `scripts/build-foundation-content-map.mjs`
(`npm run map:foundation`), via a transparent competency/mode rubric. `academy-session.js` reads
it to show "Practice this skill in real sources." Drift test: `test/foundation-content-map.test.mjs`.

**One workflow change for you:** when you add or rename assessed `skill:` steps in content, run
**both** `npm run graph:build` **and** `npm run map:foundation`, and commit both regenerated files
— each has a drift test that fails otherwise. (Coverage is a v1: 29/45 `fnd-` skills have content;
the generator prints the uncovered ones as authoring signal.)

# HANDOFF (2026-07-20) — meilah-arc content floor (you just fixed its twin, tamid)

While doing the brand rename I found **meilah-arc.js and tamid-arc.js had unescaped apostrophes
in transliteration `hebrew:` values** (`yedi'ah`, `ta'ut`) — a real JS syntax error, so both
files threw on load and were silently skipped by `loadUnits` (which is why the audit was green
without them). I escaped the apostrophes to `’` so both now parse, and rebuilt the graph
(`npm run graph:build`) so their skills are registered.

That exposed both arcs to the content floor. **You already brought tamid-arc to score 10 — thank
you.** `meilah-arc` is still **score 7** (length-bias 7/8, prod 1): same two-move fix you just
applied to tamid — (1) add/confirm a SOURCE CHECK production step, (2) even out distractor lengths
so the correct answer isn't the longest. I did **not** touch meilah's content (it's yours and you
were mid-workstream on this exact pair); handing it off so we don't collide. The suite currently
has one red gate on this (`content-standard-floor`). My rename left meilah's brand strings already
updated to "Jewish Learning Academy", so only the distractor/production work remains.

# FYI (2026-07-20) — brand rename: "Seder" → "Jewish Learning Academy" (learner-facing)

Per Sam, the learner-facing brand is now **Jewish Learning Academy** (dropping "Seder"). I
swept visible text only: all HTML `<title>`s, header/nav brand marks, and prose; `.js` string
content; and the PWA manifest (`name` → "Jewish Learning Academy", `short_name` → "JLA").
**Code was left untouched on purpose:** the `Seder.` JS namespace, `window.SederCourse`,
`seder-auth.js`, filenames (`seder.html`, `seder.css`), and the `seder-static-v1` cache key all
stay — renaming them is a risky refactor with no learner benefit. Two tests that pinned the old
brand were updated (`pwa.test` short_name, `sanhedrin-tractate-arc.test` boundary string). If you
add learner-facing copy, use "Jewish Learning Academy" (or "the Academy" conversationally),
never "Seder".

# FYI (2026-07-20) — new artifact: the foundational skill graph (the Academy reset)

Per the "Jewish Learning Academy" reframe (`docs/seder-jewish-learning-academy-roadmap.md`),
there is now a **capability-first foundational skill graph**: `data/foundation-skill-graph.json`
— 45 transferable reading skills across 10 layers, ids namespaced `fnd-`, each with ≥2
cross-genre source contexts and a full teaching contract. This is **separate from** the
content/adaptive graph you know:

- `data/content-skill-graph.mjs` (yours, generated by `npm run graph:build`) = one node per
  *source move*, content-bound. Unchanged; keep your `graph:build` workflow exactly as is.
- `data/foundation-skill-graph.json` (new) = genre-independent *capabilities* a learner carries
  between sources. Hand-authored. Validated by `npm run graph:foundation`
  (`scripts/check-foundation-graph.mjs`), now also a gate inside `npm run preflight`.

If you extend the foundational graph, follow `docs/foundation-skill-graph.md` (the authoring
contract) and keep `npm run graph:foundation` green. Content units should *reference* `fnd-` ids,
not redefine them. No action required unless you touch that file. — Claude, 2026-07-20

---

# CLOSED (2026-07-18) — arc Hebrew: done by you, three small defects fixed by Claude

Your override-block fixes landed real Hebrew in all four flagged arcs — the escalation below
is resolved. Three small defects in those fixes were corrected directly (clean tree, tiny
diffs): (1) horayot's pushed SOURCE CHECK step had mojibake separators (`Â·`); (2) keritot's
translations still read "principal categories" after the Hebrew was corrected to כְּרֵתוֹת —
now "thirty-six excisions"; (3) keritot's distractor fix appended one identical boilerplate
sentence to every wrong answer, which is a stronger tell than the length bias it removed —
replaced with per-step near-miss pairs in your own horayot pattern. All four arcs audit 10
with 0 length-bias flags. (Note: while verifying, your in-flight `path.html` edit is
currently failing `test/integrated-path.test.mjs` — assuming you're mid-rework there.)

# ASK (2026-07-18) — two additions to your in-flight daily-router session panel

You're mid-edit on `daily-router.js`/`.html` adding the timed session plan (nice structure —
I deliberately did not touch those files). Two additions that belong in exactly that panel,
handed off rather than collided:

1. **A frontier-practice slot.** `GET /api/learners/:id/graph-practice` now recommends across
   the full 832-skill graph (see FYI below) and returns `{ practice: { skill.title, url,
   context } }`. An optional fifth session step ("Frontier · 5 min — one skill the graph says
   is ready") pointing at `practice.url` would put adaptive practice inside the daily habit
   loop, complementing the narrative recommendation rather than replacing it. `gemara-continuation.js`
   lines 22–26 already render this response if you want a pattern to copy.

2. **A welcome-back ramp for lapsed learners.** The learner object already carries
   `lastStudyDate` and `dailyStreak`. When `lastStudyDate` is 3+ days old, shrink the session
   plan to a single recall step ("Welcome back — one 3-minute retrieval restarts your
   rhythm") instead of the full four-step plan. Duolingo's single most effective retention
   surface is the lapsed re-entry ramp; ours currently greets a returner with the same full
   plan that may have felt heavy enough to cause the lapse.

# FYI (2026-07-17, evening) — adaptive skill graph now covers the whole corpus

All 822 assessed skill IDs are now in the merged graph (`skill-graph.json` + `non-gemara-skill-graph.mjs` + new generated `content-skill-graph.mjs`), so `nextGraphPractice` can recommend any content unit, not just the 152 previously registered skills (commit `c65ed80`). **One workflow change for you:** when you add or rename assessed `skill:` IDs in content, run `npm run graph:build` and commit the regenerated `data/content-skill-graph.mjs` alongside — `test/skill-graph-coverage.test.mjs` fails with exactly that instruction if the graph drifts. Your item-4 "optional graph coverage" ask from 2026-07-15 is now closed.

---

# ACTIVE (2026-07-17) — seven new tractate arcs are below the content floor; suite is RED

`npm test` currently fails on `every content unit meets the score-8 content standard`.
Seven arcs built in today's batch audit below 8 (`node scripts/audit-content.mjs`):

| arc(s) | score | gap |
|--------|-------|-----|
| gittin-arc, horayot-arc, kiddushin-arc, sotah-arc, yevamot-arc | 5 | no production step (`prod=0`) **and** full answer-length bias (correct answer is the longest option in 8/8 MC steps) |
| avodah-zarah-arc | 7 | no production step; length bias 3/8 |
| keritot-arc | 7 | has a production step; length bias 8/8 |

> **UPDATE (2026-07-17, later): scores fixed, Hebrew still placeholder.** Codex brought all
> seven arcs to ≥8 and the suite is green again — thank you. But the audit does not check
> Hebrew authenticity, and **four arcs still show English/transliteration in the `hebrew:`
> field** where every other arc shows real Hebrew (e.g. chagigah `הַכֹּל חַיָּבִין`). This is
> learner-facing in a Gemara app. Sefaria-verified openings to drop in; pull the rest from
> each arc's own cited ref:
> - `gittin-arc` (Mishnah Gittin 1:1): `הַמֵּבִיא גֵט מִמְּדִינַת הַיָּם` and the agent's line `בְּפָנַי נִכְתַּב וּבְפָנַי נֶחְתָּם` — currently full English sentences ("A get from overseas").
> - `yevamot-arc` (Mishnah Yevamot 1:1): `חֲמֵשׁ עֶשְׂרֵה נָשִׁים פּוֹטְרוֹת צָרוֹתֵיהֶן` — currently `chamesh-esreh nashim potrot tzareihoten`.
> - `horayot-arc` (Mishnah Horayot 1:1): `הוֹרוּ בֵית דִּין לַעֲבֹר עַל אַחַת מִכָּל מִצְוֹת הָאֲמוּרוֹת בַּתּוֹרָה … שׁוֹגֵג עַל פִּיהֶם` — currently `horaat bet din be-shogeg`.
> - `keritot-arc` (Mishnah Keritot 1:1): `שְׁלֹשִׁים וָשֵׁשׁ כְּרֵתוֹת בַּתּוֹרָה`. **Also a content error**, not just script: one step's Hebrew reads `shloshim veshesh · avot melachot` — "avot melachot" is Shabbat's 39 categories of *labor*; Keritot is 36 *karetot* (excisions). Fix the concept, not only the transliteration.
>
> Replace every transliteration/English `hebrew:` value across these four arcs with the actual
> Hebrew from the Sefaria ref each step already cites. (Claude can do this directly and
> Sefaria-verified instead if you'd prefer — say the word.)

Two fixes bring each to ≥8 (10 if both done fully) — the same two moves that took all 36
tractate labs to ≥8 this session (commits `32661e9` / `4ae2000` / `730622b` / `d79c769`):

1. **Add one `SOURCE CHECK` production step** to the six arcs that lack one. Per the
   production principle (below), a shuffled source/explanation check closes the
   argument/sourceReasoning competency these arcs terminate on, and the auditor credits it
   (`prod` 0→2). Worked draft for `gittin-arc`, in handoff format:

   - Prompt: "You meet an unfamiliar Gittin passage where a document changes hands through a
     messenger. Which move does this arc train you to make first?"
   - Correct: "Separate the instrument, the authorized agent, the purpose it was written for,
     and the delivery, then ask which validity condition each step still has to meet."
   - Distractor: "Decide whether the divorce is valid at once, before you have located the
     document, the agent, the intent, or the act of delivery in the passage."
   - Distractor: "Read writing, agency, intent, and delivery as one single undifferentiated
     act that the source is expected to resolve with a single yes-or-no answer at the end."
   - Feedback: "Right. Gittin is read by separating instrument, agent, purpose, and delivery
     and asking what each requires — not by rushing to a verdict."
   - Hebrew: שְׁלִיחוּת · כַּוָּנָה · מְסִירָה  · translation: "Agency · intent · delivery."
   - skill: `gittin-source-check` · competency: `sourceReasoning`
   (The three options are deliberately similar in length — see fix 2.)

2. **Kill the answer-length tell.** In these arcs the correct answer (index 0) is the long,
   full one and the distractors are short glib wrongs, so a test-wise learner picks the
   longest without reading. Lengthen the distractors into genuinely plausible wrong readings
   until the correct answer is no longer the longest (auditor flags a step when
   `len(correct) === max` **and** `len(correct) > 1.5 * len(shortest)`). This is the same
   rebalancing you already did via the `middotSteps` / `genizaSteps` answer overrides.

**Concern (critical-reader hat):** four of the seven have English/transliteration in the
`hebrew:` field instead of real Hebrew — gittin ("A get from overseas"), horayot ("horaat
bet din be-shogeg"), yevamot ("chamesh-esreh nashim potrot tzareihoten"), keritot ("keret ·
shogeg · chatat"). The audit doesn't check this, but kiddushin / sotah / avodah-zarah have
real Hebrew and these should match. Worth fixing in the same pass.

I did **not** touch the arc files — they're yours and you may still be finishing them (our
handoff model is written artifacts, not live shared control). Flagging so the ask isn't
missed. — Claude, 2026-07-17

Ground truth for context: after this session's lab pass, `node scripts/audit-content.mjs`
reads `{5:5, 7:2, 8:1, 9:26, 10:81}` over 115 units. All 36 tractate labs and every
non-Gemara unit are now ≥8; the only sub-8 units left are these seven arcs. (Also shipped
this session, FYI, no action needed: a keyboard skip-to-content link injected from
`seder-auth.js`, commit `16cea6b`.)

---

# RESOLVED (2026-07-16) — canon-arc and taanit-arc content standard

Claude had flagged these two arc units as the last below the score-8 standard, but Codex
had already fixed them in commit `3fb9c23` ("Strengthen Canon and Taanit source checks")
— it landed in the shared tree the same afternoon. Both now audit at **9** (each: 7 steps,
a `SOURCE CHECK` production step, 0/7 length-bias flags). No action needed; recorded here
so the ask isn't relayed twice. Current corpus distribution `{7:22, 8:36, 9:21, 10:16}` —
**every unit is now ≥ 7**, and every tractate lab + non-Gemara unit is ≥ 8. The content
floor is fully cleared.

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
