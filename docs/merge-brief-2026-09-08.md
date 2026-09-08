# Merge brief — 2026-09-08

For Sam, returning to the queue. Companion:
[`docs/skill-graph-north-star.md`](skill-graph-north-star.md) checklist.

**Verified live on GitHub the afternoon of 2026-09-08** (`main` still `c6d2175`,
PR #29). **None of #30–#40 are merged.** Do not treat the morning three-PR
list as the current pile.

## Already on main — do not re-merge

| PR | What landed |
|---|---|
| #13 | Today → frontier `fnd-`; `knowledgeFrontier()` replaces the 14-skill ladder |
| #14 | Starter-set freeze (29 teach / 26 hold) |
| #15 | Content-move graph demoted; practice a chosen `fnd-` skill |
| #17 | Placement unified onto one `fnd-` start |
| #18 | Review / decay / welcome-back cite `fnd-` ids |
| #19 | Academy clear ask + on-page source |
| #20 | See-it is a mini-lesson, then the ask |
| #21 | Dropped “NO TYPING REQUIRED” chrome |
| #22 | Genre-literacy teach (`foundation-teach.json`) |
| #16 | L2–L5 starter item banks |
| #23 | Hosted `masteryUpdatedAt` / `decayedMastery` |
| #24 | Derived-file greens (stale contexts / drift lock) |
| #25 | Capability-state language on path / academy / academy-next |
| #26 | Sefaria demoted to a quiet academy-session footer |
| #27 | Genre-identification checks for `fnd-orient-source-type` |
| #28 | Starter checks for context (L7) + responsibility (L8) |
| #29 | Teach-a-term-before-you-test-it product law |

North-star items **1, 2, 3, 4 (freeze + non-decode banks), 5, 6, 10** are done
on main. Item **8** is still only the #25 surfaces until #34 lands. Items **7**
and **9** stay open even if their staging PRs merge (proposal / empty fields /
EXAMPLE only).

## Full open pile — recommended merge order

All mergeable as of this check. Drafts are marked. Ready (not draft): #31, #39,
and stale #10.

### 1. Merge first: [#30](https://github.com/zahnsamuel/seder1/pull/30) (draft)

**Scope Today / frontier routing to the frozen starter set.**

Real Today bug. After starter Layers 0–2 are secured, unrestricted
`knowledgeFrontier()` still returns frozen `fnd-signal-sentence-structure`,
and the picker teaches that instead of starter `fnd-role-question-vs-answer`.

Also edits `data/next-action.mjs` and `server.mjs`, which **#36** also
touches. Merge #30 before #36 and rebase #36.

### 2. Safe: [#31](https://github.com/zahnsamuel/seder1/pull/31) (ready)

**Deepen 11 thin L2–L5 starter item banks (quality, not count).**

Independent of routing. Does not touch the three fat-bucket skills. Merge
whenever after or beside #30 (`qa-intake.md` only shared file).

### 3. See-it teach: [#35](https://github.com/zahnsamuel/seder1/pull/35) (draft)

**Close See-it teach coverage for 23 non-L0 starters.**

Only current editor of `data/foundation-teach.json`. Merge before any later
teach-JSON work. Does not edit authored items. L0 decode still held.

### 4. On-page source: [#38](https://github.com/zahnsamuel/seder1/pull/38) (draft)

**Starter academy excerpts** (`data/foundation-source-excerpts.json` only).

No file overlap with #35, but See-it *uses* both teach copy and excerpts.
Merge #35 then #38 so a friend hitting academy-session gets a mini-lesson
*and* Hebrew/translation on the page. Teach-before-ask unchanged (excerpts
may show terms; asks stay as authored).

### 5. Friend/demo path: [#36](https://github.com/zahnsamuel/seder1/pull/36) (draft)

**First-run polish: landing → placement → Today → See-it → ask.**

Copy/chrome, not the frontier picker. **Rebase onto #30** (`next-action.mjs`,
`server.mjs`). Also overlaps **#34** on `diagnostic.js` and
`test/adaptive-diagnostic.test.mjs` — first-run placement copy vs
capability-state copy. If the friend demo is the next sitting, merge #36
after #30/#35/#38, then rebase #34. If leftover XP chrome is the next
sitting, merge #34 first and rebase #36 so friend copy wins on shared
placement strings.

### 6. Leftover scoreboard: [#34](https://github.com/zahnsamuel/seder1/pull/34) (draft)

**Retire leftover XP / % / level** on evidence, recall, review, map, journey,
study-record, placement. Completes north-star #8 beyond path/academy.
Does not rewrite the #30 picker (`daily-router.js` is copy-only). Rebase
against #36 as above.

### 7. Schema only: [#40](https://github.com/zahnsamuel/seder1/pull/40) (draft)

**Transfer-item schema + 2 EXAMPLE entries.** Coverage stays 0/55 until
someone writes `status: ready`. Safe to merge as staging; **does not close
north-star #9.** Overlaps north-star / starter-set / graph-schema docs with
#33/#37.

### 8. Workbench staging: [#37](https://github.com/zahnsamuel/seder1/pull/37) (draft)

**Educator starter-set edge / misconception workbench.** Real rationale and
misconception fields are **empty**. Two EXAMPLE stubs on fake `example-*`
ids, never imported. Live graph edges stay `rationale: null`. Safe to merge
as tooling; **does not close #9.** Overlaps the same docs as #40.

### 9. This map: [#33](https://github.com/zahnsamuel/seder1/pull/33) (draft — this PR)

North-star checklist + this brief. Docs only. Merge whenever you want the
map on main; expect small north-star conflicts with #30/#32/#34/#37/#40.
Keep Done / Open / Partial and fold their one-liners under the matching
item.

### 10. Docs, independent: [#39](https://github.com/zahnsamuel/seder1/pull/39) (ready)

**Foundation item-bank authoring conventions** (`docs/foundation-item-authoring.md`
only). Complements #29 and #31. No code/data. Merge anytime.

### 11. Judgment: [#32](https://github.com/zahnsamuel/seder1/pull/32) (draft)

**Propose one fat-bucket split: distinction-answers.** Docs + data proposal.
**Not the live graph.** Decision: accept as the written plan, reject /
rewrite the child, or hold. Do not implement a live split until this call.

### Close without merging: [#10](https://github.com/zahnsamuel/seder1/pull/10)

Stale “fix red main” from 2026-09-03. Superseded by merged **#24**.

## Conflicts to watch (rebase order)

| Collision | Why | What to do |
|---|---|---|
| **#30 vs #36** | `data/next-action.mjs`, `server.mjs` | Merge #30 first; rebase #36 |
| **#35 vs later teach JSON** | Only #35 edits `data/foundation-teach.json` today | Merge #35 before any new teach PR |
| **#35 vs #38** | No shared files; See-it consumes both | Merge #35 then #38 (product order) |
| **#36 vs #34** | `diagnostic.js`, adaptive-diagnostic tests; first-run copy vs capability copy | Rebase the later one; pick whose placement sentence wins |
| **#33 / #30 / #32 / #34 / #37 / #40** | `docs/skill-graph-north-star.md` | Docs-only conflicts; keep checklist status lines |
| **#30 / #32 / #37 / #40** | `docs/foundation-starter-set.md` | Same: fold, don’t revert the freeze list |
| **#34 / #37 / #40** | `docs/foundation-graph-schema.md` | Fold |
| Almost everyone | `docs/qa-intake.md` | Append-only; should merge |

#31 and #38 share nothing material with the engine PRs except qa-intake.
#39 shares nothing.

## Still blocked on people, not a merge

| Item | State |
|---|---|
| **Educator edge rationales** | Still 0/76 on the live graph. #37 stages a workbench with empty real fields. |
| **Named misconceptions** | Still 0/55. Same #37. |
| **Authored transfer items** | Still 0/55. #40 is schema + EXAMPLE only; academy does not load them. |
| **L0 decode banks** | Still held. Four `fnd-decode-*` skills; on-ramp stays `hebrew-decoding.html`. |
| **Fat-bucket live split** | Still deferred until #32 judgment. |
| **`graph:quality` bank counter** | Still 0/55 first-class nodes. Authored JSON on main is 25 skills / 78 items. |

## Suggested sitting

1. Merge **#30** (Today bug). Rebase anything that touches `next-action.mjs`.
2. Merge **#31** (bank quality) and **#39** (authoring guide) — no judgment.
3. Merge **#35** then **#38** (See-it teach + on-page source).
4. Choose demo vs leftovers: **#36** (friend path, rebase onto #30) and
   **#34** (XP chrome, rebase against #36).
5. Merge staging **#40** and **#37** if you want the empty workbench / EXAMPLE
   schema on main — they do not fill #9.
6. Merge **#33** when you want this map on main.
7. Read **#32** and decide. Close **#10**.
