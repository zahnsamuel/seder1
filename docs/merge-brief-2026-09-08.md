# Merge brief — 2026-09-08

For Sam, returning to the queue. Verified against `main` at `c6d2175`
(merge of PR #29) and live GitHub PRs the same day. Companion:
[`docs/skill-graph-north-star.md`](skill-graph-north-star.md) checklist.

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
on main. Item **8** is done only on the path/academy references. Items **7**
and **9** are still open.

## Open PRs — recommended merge order

### 1. Merge first: [#30](https://github.com/zahnsamuel/seder1/pull/30) (draft)

**Scope Today / frontier routing to the frozen starter set.**

Real Today bug. After starter Layers 0–2 are secured, unrestricted
`knowledgeFrontier()` still returns frozen `fnd-signal-sentence-structure`,
and the picker teaches that instead of starter `fnd-role-question-vs-answer`.
Placement/diagnostic stay whole-graph; only the daily picker is sliced.

Draft, mergeable, no reviews. Lands engine + tests + a north-star note that
the router consumes the freeze list. Merge this before any graph-growth
judgment so Today matches the freeze Sam already shipped in #14.

### 2. Safe next: [#31](https://github.com/zahnsamuel/seder1/pull/31) (ready)

**Deepen 11 thin L2–L5 starter item banks (quality, not count).**

Claude, off current `main`. Replaces a weak abstract/meta item in 11 banks
with a source-grounded application item; strips untaught terms from asks.
Does not touch Today, next-action, or the three fat-bucket skills
(`arg-response`, `role-ruling-vs-discussion`, `case-what-happens`).
Independent of #30. Merge whenever; no product judgment required beyond
“these 11 replacements look right.”

### 3. Judgment: [#32](https://github.com/zahnsamuel/seder1/pull/32) (draft)

**Propose one fat-bucket split: distinction-answers.**

Docs + `data/fat-bucket-first-split.json` + a guard test. **Does not add a
skill to the live graph, does not remode content, does not change Today.**

Proposal: keep `fnd-arg-response`; add child `fnd-arg-resolve-distinction`
behind a `DISTINCTION ANSWER` rubric token; retag four existing Gemara
steps; still needs one new non-Gemara step before a live split. The other
two named fat buckets: `role-ruling-vs-discussion` — no split (would have
0 units); `case-what-happens` — already closed in graph 0.2.0.

**Decision:** accept as the written plan (merge the docs), reject / rewrite
the child, or hold. A live split stays deferred until this call.

### Close without merging: [#10](https://github.com/zahnsamuel/seder1/pull/10)

Stale “fix red main” derived-file regen from 2026-09-03. Superseded by
merged **#24**. Leave it open and it will keep looking like a live fix.

## Still blocked on people, not a PR

| Item | State on main |
|---|---|
| **Educator edge rationales** | 0/76. Workbench HTML already on main (`docs/educator-audit-workbench.html`). No landing PR is open. |
| **Named misconceptions** | 0/55 (`npm run graph:quality`). |
| **Authored transfer items** | 0/55 on the first-class assessment graph. Recognition banks exist for 25/29 starters; they are not tagged transfer. |
| **L0 decode banks** | Still held. The four `fnd-decode-*` skills have 0 authored items; decode stays `hebrew-decoding.html`. |
| **Fat-bucket live split** | Deferred pending #32. |
| **Item 8 leftovers** | No PR. Many content / arc / recall pages still show `0 XP` in headers. Path / academy / academy-next are converted. |
| **`graph:quality` bank counter** | Still 0/55. It reads `data/foundation-assessment-items.json`, not Claude’s `data/foundation-authored-items.json` (25 skills / 78 items). Do not treat that 0 as “banks never landed.” |

## Suggested sequence when you sit down

1. Merge **#30** (Today teaches the freeze list). Mark ready-for-review if you
   want a last look; it is the only open *behavior* bug in this pile.
2. Merge **#31** (bank quality). Or merge it in parallel with #30 — no file
   overlap except append-only `docs/qa-intake.md`.
3. Read **#32** and decide. Merge only if you want the distinction-answer
   plan on paper. Do not ask anyone to implement the live split until then.
4. Close **#10**.
5. Leave educator rationales, L0 decode banks, and leftover XP chrome for
   explicit next assignments. The workbench does not need a merge to exist.

## Collision notes for whoever is still writing

PRs **#30** and **#32** both edit `docs/skill-graph-north-star.md` and
`docs/foundation-starter-set.md`. This brief’s companion north-star update
is current-`main` truth (freeze + banks done; router and fat-bucket split
still open). Expect a small docs conflict when #30 / #32 land; keep the
checklist’s *Done / Open / Partial* lines and fold their one-sentence
additions under the matching item.
