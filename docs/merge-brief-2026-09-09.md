# Merge brief — 2026-09-09

**Product intent: 0→1 learner success.** A complete beginner should leave
placement with a few real checks, land on Today, finish or skip Hebrew
decode, and meet a See-it then ask on `fnd-orient-source-type` — without
self-rating, leftover XP chrome, or a bounce back into decode.

This is Sam’s return map for the **open 0→1 pile**. Docs only. Do not treat
[`docs/merge-brief-2026-09-08.md`](merge-brief-2026-09-08.md) as a live
queue — that sitting already landed.

Verified live on GitHub **2026-09-09** against `main` `4b61c0c` (docs
hygiene after the `c81517c` union-merge of #30–#45). Nine open PRs, **all
drafts**. Independently, #48–#55 are `MERGEABLE` / `CLEAN` vs current
`main`. Sequential merge will still conflict on shared files — rebase in
the order below.

Companion: [`docs/skill-graph-north-star.md`](skill-graph-north-star.md).

## Already on main — do not re-merge

The 2026-09-08 sitting union-merged **#30–#45** (keep-both on docs). Close
hygiene for stale **#10** still belongs in the 09-08 brief if that PR is
open in the UI; it is not part of this pile.

North-star items 1–6 and 8 (path/academy surfaces) are on main. Item 7
(fat-bucket live split) is still judgment-only (#32 landed as a
**proposal**). Item 9 (educator edges / transfer items) is still staging.
L0 decode banks are still held.

## Full open pile — recommended merge order

Expected 0→1 pile, all confirmed live. Extra PR **#47** is called out
after the order; do not merge it in this sitting.

### 1. Merge first: [#50](https://github.com/zahnsamuel/seder1/pull/50) (draft)

**Replace placement self-ratings with real authored MC checks.**

This is the diagnostic for whether 0→1 placement is honest. Before: skill
card + “Could you do this reliably right now?” + Yes / Not reliably / Not
sure. After: shuffled authored item, See-it teach first when present,
feedback, Continue. Seeds the frontier at 0.8 and hands off to Today
(`begin.href = 'daily-router.html'`, label still **See today’s lesson →**).
Does not invent L0 glyph banks.

Also edits `diagnostic.html` / `.js` / `.css`, `server.mjs`,
`data/knowledge-graph.mjs`, `data/diagnostic-items.mjs`. **#51** and **#48**
touch the same diagnostic chrome. Merge this before either of them.

### 2. After #50: [#51](https://github.com/zahnsamuel/seder1/pull/51) (draft)

**Cap first-day placement at six checks and hand off to Today.**

Complementary to #50: does not rewrite `renderProbe`. Stops the estimator
at `DIAGNOSTIC_PROBE_CAP = 6`, chrome is **Check N of 6**, intro “At most
six checks. Then one lesson today.” Results CTA **Start today’s lesson →**
on `daily-router.html`.

**Rebase onto #50.** Keep both server options in one call:

```js
nextDiagnosticProbe(graph, responses, { probeable, maxProbes: DIAGNOSTIC_PROBE_CAP })
```

Keep `maxProbes` in the JSON so the client can show Check N of 6. Do not
drop the Today href. On results copy, **#51 wins**: “Start today’s lesson →”.

### 3. Green suite: [#48](https://github.com/zahnsamuel/seder1/pull/48) (draft)

**Fix keep-both chrome. Suite 689/689.**

Restores the intended #36 / #44 / #45 product: academy-session
**SEE IT, THEN ANSWER · ABOUT 15 MINUTES**, YOUR QUESTION / Got it — ask me,
complete **Continue on Today** with emerging/secure, placement CTA on
Today, and a short teiku excerpt window so every starter sourceRef
resolves. Honest fat-bucket test update after starter-scoped Today (#30).

**Rebase onto #50+#51.** Drop or rewrite the `diagnostic.js` hunk — #50
already pins `begin.href = 'daily-router.html'`, and #51 already retitles
the button. Keep academy-session HTML/JS, `test/academy-session.test.mjs`,
`test/friend-first-run.test.mjs` (accept #51’s “Start today’s lesson”),
the teiku excerpt, and the fat-bucket fixture/docs.

Git-easier alternative, same product: merge #48 **before** #50 if you want
the suite green first. Then rebase #50 (take its probe rewrite, keep Today
href) and #51. Do not merge #48 *after* #50 without that diagnostic rebase
— #48’s `diagnostic.js` is written against pre-#50 self-rate chrome and
will conflict.

### 4. After #48 (product, not files): [#53](https://github.com/zahnsamuel/seder1/pull/53) (draft)

**Decode skip/complete lands on the first non-L0 See-it session.**

Today currently bounces a skip/finish back to `hebrew-decoding.html`
because eight parallel `answer_submitted` events queue due-now L0 reviews,
and review outranks foundation. After: one `decoding_completed` event
secures the four `fnd-decode-*` skills, clears those reviews, ignores L0
on Today retrieval, and opens
`academy-session.html?skill=fnd-orient-source-type`.

**No shared chrome files with #48** (`decoding-*` / `hebrew-decoding.html`
/ `next-action.mjs` vs academy-session / diagnostic). Slot after #48 so
the landing session already has See-it chrome. Rebase
`test/placement-foundation-handoff.test.mjs` against #50/#51 (all three
append; hunks are different tests).

### 5. After #48: [#52](https://github.com/zahnsamuel/seder1/pull/52) (draft)

**0→1 path contract tests.** Product files unchanged.

Pins: placed beginner next teach is a starter `fnd-`; non-L0 session with
teach + excerpt is See-it then ask; “Could you do this reliably” is absent
from academy-session / Today / hebrew-decoding / tractate diagnostics /
graph probe payload; Today CTA is decode for L0 and `academy-session.html?skill=`
after. The four new tests already pass on red `main`; merge after #48 so
the rest of the suite is green around them.

Comment in the PR still says placement HTML has the self-rate line. After
#50 that line is gone — fold a `diagnostic.html` assertion into this test
on rebase. Does not pin “I can see it”, so **#54** can land after without
breaking these contracts.

### 6. After #50: [#54](https://github.com/zahnsamuel/seder1/pull/54) (draft)

**Purge leftover self-rate copy outside diagnostic.**

Academy See-it continue becomes **Try it →**; practice chrome drops unearned
“I can / You can”; academy 90-day card, evidence, map, and path graduation
promise stop asking the learner to speculate. **Got it — ask me** stays.
New guard `test/no-self-assessment-ui.test.mjs`.

Does **not** edit `diagnostic.*` (explicitly left for #50). Merge after
#50 so the keep-list is honest. Rebase `test/academy-session.test.mjs`
against #48 (keep both: Continue **on** Today, and no `I can see it`).

### 7. Banks, later in the sitting: [#49](https://github.com/zahnsamuel/seder1/pull/49) (draft)

**Deepen the six thinnest non-L0 starter banks**, including the three
fat-bucket skills #47 left alone:

| Skill | 3 → 4 |
|---|---|
| `fnd-arg-objection` | yes |
| `fnd-arg-response` | fat-bucket |
| `fnd-case-what-happens` | fat-bucket |
| `fnd-resp-learning-vs-ruling` | yes |
| `fnd-role-ruling-vs-discussion` | fat-bucket |
| `fnd-signal-connectors` | yes (also in #55) |

Also patches two excerpt windows (Shulchan Aruch OC 1:1, Rambam Deot 1:4)
and adds the same teiku window as #48. Teach-before-ask skip list no
longer holds the old #31 peer-lane banks.

Independent of diagnostic chrome. Rebase excerpts onto #48 so the teiku
window is not duplicated. Collides with **#55** and **#47** on
`data/foundation-authored-items.json`.

### 8. After #49: [#55](https://github.com/zahnsamuel/seder1/pull/55) (draft)

**Deepen the earliest non-L0 frontier sessions** (orientation + first
signals/roles) — the slice a 0→1 learner actually meets after decode.

Eleven banks, Hebrew in every early stem, teach-before-ask, no meta-asks.
`fnd-orient-source-type` 6→7; the other ten 3→4. Content fix: Mishnah
Berakhot 1:1 (`מֵאֵימָתַי`) is asking, not telling.

**Rebase onto #49** (and #48’s teiku excerpt). The only authored-item
skill both rewrite is `fnd-signal-connectors` — keep **#55’s** early-path
item (Hebrew-in-stem / no meta-ask) unless the #49 connectors item is
clearly stronger. Also rebase `test/teach-before-ask.test.mjs` and
`data/foundation-source-excerpts.json` (Psalm 19, Job 38:4, Avot 4:1,
plus #49’s two window fixes).

Does not touch Today / next-action / academy-session chrome.

## Close without merging: [#47](https://github.com/zahnsamuel/seder1/pull/47) (draft, CONFLICTING)

**Add a source-varied 4th item to each of 21 starter banks.** Claude,
opened 2026-09-09 03:06Z. GitHub: `DIRTY` / `CONFLICTING` vs `main`.

This is **count, not the 0→1 quality pass.** It overlaps #55 on ten early
banks and #49 on three later ones. Merging it before the deepen PRs
duplicates fourth items; merging it after will not auto-resolve. The
fat-bucket trio is in **#49**, not here.

**Close, do not merge.** If a unique source family from #47 is still
missing after #49+#55, cherry-pick that item in a follow-up. Paste-ready:

```
Closing as superseded — do not merge.

This adds a 4th item to 21 starter banks (count). The 0→1 sitting deepens
those banks in PR #55 (earliest orientation/signals/roles) and PR #49
(thin + fat-bucket), with Hebrew-in-stem / teach-before-ask guards.

This branch is already CONFLICTING vs main. Merging would fight both
deepen PRs on data/foundation-authored-items.json. Close this PR. If a
source-varied item is still missing after #49 and #55, cherry-pick that
one item.

See docs/merge-brief-2026-09-09.md.
```

## Conflicts to watch (rebase order)

| Collision | Why | What to do |
|---|---|---|
| **#50 vs #51** | `diagnostic.html` / `.js` / `.css`, `data/knowledge-graph.mjs`, `server.mjs`, adaptive-diagnostic + placement-handoff tests | Merge #50 first. Rebase #51. Keep `{ probeable, maxProbes: 6 }`. #51 wins button label **Start today’s lesson →**. |
| **#48 vs #50/#51** | `diagnostic.js`; #48 also vs #51 on `test/friend-first-run.test.mjs` | #48’s diagnostic hunk is a subset of #50+#51. Rebase #48 after them and drop `diagnostic.js`. Friend-path pin: “Start today’s lesson”. |
| **#48 vs #53** | No shared chrome files | Product order only: merge #48 first so skip lands on restored See-it chrome. |
| **#50/#51 vs #53** | `test/placement-foundation-handoff.test.mjs` | Three additive tests. Rebase; keep all three. |
| **#48 vs #54** | `test/academy-session.test.mjs` | Keep both: Continue **on** Today (#48) and no `I can see it` (#54). |
| **#48 vs #49 vs #55** | `data/foundation-source-excerpts.json` all add **A dispute closed with teiku** | One teiku window. Then #49’s two cited-window fixes, then #55’s Psalm 19 / Job 38:4 / Avot 4:1. |
| **#49 vs #55** | `data/foundation-authored-items.json`, `test/teach-before-ask.test.mjs` | Merge #49, rebase #55. Only overlapping skill: `fnd-signal-connectors` — prefer #55’s early-path rewrite. |
| **#47 vs #49/#55** | same authored-items file; #47 is already CONFLICTING | **Close #47.** Do not rebase it into this sitting. |
| **#52 vs #50** | #52 still documents self-rate HTML on diagnostic | After #50, extend the contract test to `diagnostic.html`. |
| Almost everyone | `docs/qa-intake.md` | Append-only; should merge. Keep-both if GitHub concatenates again — do not ship a 16th copy of this log. |

#52 shares no product files. #54 shares no diagnostic files with #50/#51.

## What the 0→1 sitting is for

One click path, after this pile:

1. Signup → placement: **at most six real MC checks**, teach-before-ask, no
   Yes / Not sure.
2. Results → **Today** (not a skipped academy URL).
3. Today → Hebrew decoding (true beginner) **or** the frontier See-it.
4. Skip or finish decode → `fnd-orient-source-type` See-it → Got it — ask me
   → shuffled MC on an on-page excerpt → **Continue on Today**.
5. Early orientation / signal / role asks are Hebrew-on-the-page, not
   meta-asks. Fat-bucket banks are no longer 3-item thin.

That is learner success for this sitting. It does not grow the frozen
starter set and it does not author L0 banks.

## Still blocked on people, not this merge

| Item | State |
|---|---|
| **L0 decode banks** | Still held. Four `fnd-decode-*` skills; on-ramp stays `hebrew-decoding.html`. #53 only changes the handoff. |
| **Fat-bucket live split** | Proposal already on main (#32). #49 deepens the three banks in place; it does not split the graph. |
| **Educator edge rationales / named misconceptions** | Still empty on the live graph (#37 staging landed 09-08). |
| **Authored transfer items** | Still 0/55. Schema + EXAMPLE only (#40 landed). |
| **`graph:quality` bank counter** | Still reads `foundation-assessment-items.json` (0/55), not the authored JSON. |

## Suggested sitting

1. **Close #47** in the GitHub UI (paste the comment above). Do not merge.
2. Merge **#50** (real placement checks).
3. Rebase and merge **#51** (six-check first day). Confirm Today is the
   only primary results CTA.
4. Rebase and merge **#48** (green suite / See-it chrome). Drop its
   `diagnostic.js` if #50+#51 already own that file.
5. Rebase and merge **#53** (decode → orient). Click skip once.
6. Merge **#52** (path contracts). Add `diagnostic.html` to the self-rate
   scan now that #50 landed.
7. Rebase and merge **#54** (purge leftover “I can”).
8. Merge **#49**, then rebase **#55** (`fnd-signal-connectors`: keep #55).
9. Merge **this brief** whenever you want the map on main.

Walk the beginner path once after step 5: placement → Today → I already
read Hebrew → source-type See-it → Continue on Today.
