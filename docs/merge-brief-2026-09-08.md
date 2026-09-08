# Merge brief — 2026-09-08

For Sam. Companion: [`docs/skill-graph-north-star.md`](skill-graph-north-star.md).

Verified live on GitHub against `main` `c6d2175` (PR #29). This note is the
**close-hygiene lock**. Draft [PR #33](https://github.com/zahnsamuel/seder1/pull/33)
has the full still-live merge order; if both land, **keep this Close section at
the top** and fold #33’s order under it. Do not drop the paste-ready comment.

---

## Close without merging — do this first

### [#10](https://github.com/zahnsamuel/seder1/pull/10) — CLOSE. Do not merge.

**Superseded by merged [PR #24](https://github.com/zahnsamuel/seder1/pull/24)**
(green derived-file suite).

| | |
|---|---|
| Title | Regenerate foundation derived files to match merged source (fix red main) |
| Branch | `fix-foundation-derived-files` |
| Opened | 2026-09-03 — one commit (`bc14e9e`), **55 commits behind** current `main` |
| Files | `data/foundation-content-map.json`, `data/content-skill-graph.mjs`, `data/foundation-content-contexts.json` |
| Why it existed | Post-#8 `main` had source changes with pre-regen derived files (red map / graph / coverage tests) |
| Why it is done | **#24 merged 2026-09-07** (`826665f` / merge `f7cac3a`). Map + content-skill-graph were already in sync on then-`main`; #24 rebuilt stale `foundation-content-contexts.json` and locked drift with LF-normalized identity tests. Suite was **612/612**. |
| Why merge is the wrong action | GitHub still shows a 33-line “fix.” The three files at #10’s tip already **match current `main` byte-for-byte**. Merging would only add a 5-day-old branch (55 commits behind) as noise. The PR description still claims `main` is red. |

This agent did **not** close #10 via API (no merge-rights drama). A top-level
comment with the paste below was posted on #10 so the close instruction is
visible on the PR itself. Sam: close it in the GitHub UI, **Close pull
request**, not Merge. The PR is still open until you do.

#### Paste-ready GitHub comment for #10

```
Closing as superseded — do not merge.

This regen targeted post-#8 main (2026-09-03). The green derived-file suite is
PR #24 (merged 2026-09-07): it rebuilt foundation-content-contexts.json from
then-current main, confirmed map + content-skill-graph already in sync, and
locked drift with LF-normalized file-identity tests (612/612).

This branch is 55 commits behind main. The three derived files at this tip
already match current main; merging would only add history noise. Close this
PR. Do not merge it.

See docs/merge-brief-2026-09-08.md.
```

**Already closed, not mergeable:** [#9](https://github.com/zahnsamuel/seder1/pull/9)
(`foundation-content-coverage`) was closed unmerged on 2026-09-03. No action.

---

## Other open PRs scanned — none else clearly superseded

Scanned every open PR on 2026-09-08 (including #41 and #42, which arrived after
#33’s afternoon pass). **Only #10 duplicates work that already merged.**

| PR | State | Verdict |
|---|---|---|
| [#10](https://github.com/zahnsamuel/seder1/pull/10) | OPEN | **Close, do not merge.** Superseded by #24. |
| [#30](https://github.com/zahnsamuel/seder1/pull/30) | draft | Keep. Starter-set frontier routing (Today bug). |
| [#31](https://github.com/zahnsamuel/seder1/pull/31) | ready | Keep. Deepen thin L2–L5 banks. |
| [#32](https://github.com/zahnsamuel/seder1/pull/32) | draft | Keep. Fat-bucket split **proposal** — not live graph. Judgment, not a close. |
| [#33](https://github.com/zahnsamuel/seder1/pull/33) | draft | Keep. Full merge-order map. Fold with this close-hygiene note. |
| [#34](https://github.com/zahnsamuel/seder1/pull/34) | draft | Keep. XP/% leftovers after #25 — continuation, not a duplicate of #25. |
| [#35](https://github.com/zahnsamuel/seder1/pull/35) | draft | Keep. See-it teach coverage for non-L0 starters. |
| [#36](https://github.com/zahnsamuel/seder1/pull/36) | draft | Keep. Friend/demo first-run polish. |
| [#37](https://github.com/zahnsamuel/seder1/pull/37) | draft | Keep. Educator edge workbench **staging** (empty real fields). Not superseded by the older workbench HTML on main. |
| [#38](https://github.com/zahnsamuel/seder1/pull/38) | draft | Keep. On-page source excerpts. Continuation of #19, not a duplicate. |
| [#39](https://github.com/zahnsamuel/seder1/pull/39) | ready | Keep. Item-bank authoring guide (new docs file). |
| [#40](https://github.com/zahnsamuel/seder1/pull/40) | draft | Keep. Transfer-item schema + EXAMPLE only. Does not close north-star #9. |
| [#41](https://github.com/zahnsamuel/seder1/pull/41) | draft | Keep. Teach-before-ask **guard** (tests + helper). Complements #29’s product-law docs; does not duplicate them. Collides with **#31** on `data/foundation-authored-items.json`. |
| [#42](https://github.com/zahnsamuel/seder1/pull/42) | draft | Keep. Layer 0 Hebrew decoding UX for the friend/demo path. |

Not close-candidates even though they look “empty” or overlapping:

- **#32 / #37 / #40** are staging or judgment. Close only after Sam decides, not
  because a prior PR landed.
- **#34** vs merged **#25**, **#35** vs **#20/#22**, **#38** vs **#19**, **#41**
  vs **#29**: later PRs extend the earlier merge; they are not the same diff.

---

## Suggested sitting (close hygiene only)

1. **Close #10** in the GitHub UI (paste the comment above). Do not merge.
2. Use [PR #33](https://github.com/zahnsamuel/seder1/pull/33) for merge order of
   the still-live pile. Add **#41** and **#42** to that order when folding:
   #41 after or beside #31 (shared item-bank file); #42 with the friend-demo
   sitting (#36), not instead of it.
