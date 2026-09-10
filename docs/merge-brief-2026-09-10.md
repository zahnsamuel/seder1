# Merge brief — 2026-09-10

**Away-day map for Sam’s return. Docs only. Do not merge this pile onto
`main` until Sam is back.** The hosted demo must stay on the current tip.

This is not a 0→1 sitting. The 09-09 queue already landed. Do not treat
[`docs/merge-brief-2026-09-09.md`](merge-brief-2026-09-09.md) as a live
merge list.

Verified live on GitHub **2026-09-10** against `main`
`75b1e4c` (merge of [#58](https://github.com/zahnsamuel/seder1/pull/58)).
Open PRs at that scan: **one draft**, [#59](https://github.com/zahnsamuel/seder1/pull/59).
Independently `MERGEABLE` / `CLEAN` vs current `main`.

Companion: [`docs/skill-graph-north-star.md`](skill-graph-north-star.md).

---

## Hosted tip — do not touch today

Live demo: **https://seder-demo.onrender.com**

`GET /api/health` at the scan:

```json
{"status":"ok","yochai":"demo-mode","persistence":"sqlite-ready","commit":"75b1e4c2f49bf8afc59c646329df7cd5af04808f"}
```

That SHA is `main` and is the merge of **[#58](https://github.com/zahnsamuel/seder1/pull/58)**
(*Fix hosted diagnostic share bounce from badge/milestones 401s*).

What #58 shipped on the share path:

- Unsigned `/diagnostic.html` no longer bounces to
  `sign-in.html?reason=session-expired` from badge / milestones 401s.
- Visitors get **Pick a name to start →** then authored MC probes
  (stem + choices), not a self-rate `check`.
- `DIAGNOSTIC_PROBE_CAP` stays 6. No L0 glyph banks.

Render auto-deploys on `main` commits. **Do not push `main` while Sam is
away.** Leave this deploy as the colleague-share tip. Draft PRs may open;
none of them should merge until he returns.

---

## Already on main — do not re-merge

The 2026-09-09 sitting is **landed**. Close hygiene for stale **#47**
(closed, do not merge) still belongs in the 09-09 brief.

| PR | What landed |
|---|---|
| #48 | Green post-merge suite / See-it chrome |
| #50 | Placement is authored MC, not self-rate |
| #51 | First-day placement cap of six checks → Today |
| #52 | 0→1 path contract tests |
| #53 | Decode skip/complete → `fnd-orient-source-type` See-it |
| #54 | Leftover self-rate copy purged outside diagnostic |
| #55 | Earliest non-L0 orientation / signal / role banks deepened |
| #56 | 09-09 merge brief (historical queue) |
| #57 | Second Today lesson as clear as the first |
| #49 content | Thin / fat-bucket bank deepenings folded via repair commits (`6be75b2` / `8b618f6` / `7417f7d`). The GitHub PR was **closed unmerged** — do not re-open or re-merge it. |
| #58 | Hosted diagnostic share bounce (current hosted tip) |

North-star items 1–6, 8, and 10 are on main. Item 7 (fat-bucket live
split) is still judgment-only (#32 proposal). Item 9 (educator edges /
transfer items) is still staging. L0 decode banks are still held.

---

## Full open pile — recommended merge order when Sam returns

Start with **#59** if it is still open. Then this brief. Then any
sibling away-day drafts that land later today (fill the TODO section
below; rebase anything that shares `data/foundation-authored-items.json`
onto #59).

### 1. Merge first: [#59](https://github.com/zahnsamuel/seder1/pull/59) (draft)

**Thicken nine remaining foundation starter banks 3 → 4 items.**

Branch `cursor/thicken-foundation-banks-844e`. After `main` @ `75b1e4c`
these were the only non-L0 starter banks still at 3 items:

| Layer | Skill | New fourth item |
|---|---|---|
| L3 | `fnd-role-example` | Mishnah Bava Metzia 1:1 — two holding a garment as a worked case |
| L3 | `fnd-role-quotation-bounds` | Rashi on Genesis 1:1 — dash as the quote/comment edge |
| L4 | `fnd-case-actors` | Gittin 55b — host, intended guest, mistaken guest |
| L4 | `fnd-case-restate` | Pirkei Avot 4:1 — faithful restatement of “who is wise” |
| L4 | `fnd-case-uncertainty` | Sukkah 2a — whether a booth above twenty cubits still counts |
| L5 | `fnd-arg-claim` | Deuteronomy 6:4 — claim vs question / citation / attribution |
| L5 | `fnd-arg-evidence-role` | Pirkei Avot 3:2 — cited verse as proof (“from here they said”) |
| L5 | `fnd-arg-unresolved` | Eruvin 13b — both views left standing |
| L7 | `fnd-context-genre-expectations` | Amidah opening — praise, not a damages ruling |

Also rewrites those nine See-it teaches (2–3 sentences, preview the
tell) and restores short on-page windows `Psalm 19`, `Job 38:4`, and
`Pirkei Avot 4:1`. New guard `test/foundation-l3-l7-banks.test.mjs`.
Removes the leftover peer-lane skip in `test/teach-before-ask.test.mjs`.

**Does not** edit Today / router chrome, the diagnostic API, L0 glyph
banks, or the fat-bucket graph. GitHub: `MERGEABLE` / `CLEAN` vs
current `main` at the scan.

Shared files later drafts will hit: `data/foundation-authored-items.json`,
`data/foundation-teach.json`, `data/foundation-source-excerpts.json`,
`test/teach-before-ask.test.mjs`, `docs/qa-intake.md`.

### 2. This map: (this PR, draft)

Docs only. Merge whenever you want the away-day map on main. Expect a
keep-both on `docs/qa-intake.md` if #59 or a sibling also appended.

---

## Standing product laws — do not regress

These already hold on `main`. Later drafts must keep them; they are
not reopenable product questions for this sitting.

1. **Teach-before-ask.** A stem or choice must not use a Gemara /
   Mishnah / Torah / commentary / halakhah / aggadah term the See-it
   has not named. Product law #29; suite gate #41
   (`data/teach-before-ask.mjs`). See-it is a mini-lesson, then the
   ask. Genre-expectations still names **halakhah** and **aggadah**
   before those words appear in feedback.

2. **No self-rate.** Placement is shuffled authored MC, not
   “Could you do this reliably right now?” (#50). Leftover “I can /
   You can / I can see it” copy is gone outside diagnostic (#54).
   Hosted share path still must not fall back to a self-rate `check`
   (#58). Advance on evidence, not a learner’s guess about themselves.

3. **Hold L0 banks.** Four `fnd-decode-*` skills stay without authored
   glyph banks. The on-ramp is `hebrew-decoding.html`. #53 only changed
   the skip/complete handoff onto the first non-L0 See-it. Do not
   invent L0 items in `foundation-authored-items.json`.

Also still true, not this sitting: do not grow the frozen starter set;
do not implement the fat-bucket live split until the #32 proposal is
accepted into the DAG; do not ship empty educator rationales as if
north-star #9 were done.

---

## What was held on purpose

Sam is away. **No `main` push today**, so Render does not redeploy over
the #58 share-path fix.

Held, not forgotten:

| Item | Why it waits |
|---|---|
| **Merging #59 (or anything else) to `main`** | Hosted tip stays `75b1e4c`. Drafts may queue. |
| **L0 decode banks** | Same hold as every sitting since the starter freeze. Glyph UI, not JSON banks. |
| **Fat-bucket live split** | #32 is a written plan, not graph 0.3.3. #49 deepenings (on main) thickened the three banks in place; they did not split the DAG. |
| **Educator edge rationales / named misconceptions** | Still 0/76 and 0/55 on the live graph (#37 staging). |
| **Authored transfer items** | Still 0/55. Schema + EXAMPLE only (#40). |
| **`graph:quality` bank counter** | Still reads `foundation-assessment-items.json` (0/55), not the authored JSON. |

Closed this sitting, do not resurrect:

- **[#47](https://github.com/zahnsamuel/seder1/pull/47)** — count-not-quality 4th items. Closed unmerged 2026-09-10. Superseded by #55 / #49-on-main / now #59.
- **[#49](https://github.com/zahnsamuel/seder1/pull/49)** — GitHub **CLOSED** (not merged). Deepenings already on `main` via repair commits. Do not re-merge.

---

## Sibling away-day PRs — fill in as they land

Three Cursor away-day agents were launched together on **2026-09-10**.
This brief is one of them. The other two had **no pull request yet** at
the scan (agents still running). Leave this section as the slot they
(or Sam) fill. Do not invent PR numbers.

If a sibling opens before this PR is reviewed, **update the table and
the merge order above** rather than starting a second brief.

| Expected draft | Agent | PR | Merge slot vs #59 | Shared files |
|---|---|---|---|---|
| **This brief** | [Away-day merge brief 2026-09-10](https://cursor.com/agents/bc-72b2be74-ced6-4357-8b80-2d1f771111ab) | *this PR* | Anytime after or beside #59 (docs only) | `docs/qa-intake.md` (append-only) |
| **Today / academy friend-path polish** | [Away-day: Today/academy friend-path polish](https://cursor.com/agents/bc-24c97d76-a77d-43dd-85d6-9360854d79f8) | **TODO: PR #____** — not open at scan | **TODO:** likely independent of #59 (chrome, not banks). Confirm files. Slot after #59 if `qa-intake.md` is the only overlap; rebase if academy-session / Today files also moved. | **TODO: list files** |
| **Thicken early banks 4 → 5** | [Away-day: thicken 4→5 early banks](https://cursor.com/agents/bc-5a6900a8-080e-4ef6-b71d-7fd4871bc4a1) | **TODO: PR #____** — not open at scan | **TODO: rebase onto #59.** Same `data/foundation-authored-items.json` (and likely teach JSON / teach-before-ask test). #59 owns the last 3-item L3–L7 banks; this sibling should deepen *early* banks already at 4 after #55, not re-thicken #59’s nine. Prefer #59’s fourth item on any overlapping skill. | **TODO: list files / overlapping `fnd-` ids** |

Paste-ready for a sibling to drop in:

```
### N. After #59: [#__](https://github.com/zahnsamuel/seder1/pull/__) (draft)

**TODO: one-line product intent.**

TODO: what changed, what it does not touch (Today / diagnostic / L0 / fat-bucket).
TODO: rebase notes vs #59 and vs the other sibling.
GitHub mergeability at last check: TODO.
```

Conflicts to expect once those land:

| Collision | Why | What to do |
|---|---|---|
| **#59 vs 4→5 sibling** | `data/foundation-authored-items.json` (and likely `foundation-teach.json`, excerpts, teach-before-ask test) | Merge **#59 first**. Rebase 4→5. Keep #59’s new fourth items on the nine L3–L7 skills. |
| **#59 vs friend-path polish** | Probably none on product files; both may append `docs/qa-intake.md` | Keep-both / concatenate. Do not ship another duplicated log. |
| **4→5 vs friend-path polish** | **TODO** if both edit academy-session or tests | Rebase the later one; chrome wins on copy, banks win on JSON. |
| Almost everyone | `docs/qa-intake.md` | Append-only; should merge. |

---

## Suggested sitting (when Sam is back)

1. Confirm hosted health is still `75b1e4c` (or a SHA Sam knowingly
   shipped). If a stray `main` push happened, stop and inspect Render
   before merging anything else.
2. Merge **#59** (3→4 on the last thin non-L0 starter banks). Walk one
   of those nine skills in academy-session: See-it names the tell, then
   shuffled ask, Hebrew on the newest item.
3. Fill the sibling table if PRs exist. Rebase the 4→5 bank PR onto
   #59. Merge friend-path polish if it is chrome-only and green.
4. Merge **this brief** whenever you want the map on main.
5. Do **not** author L0 banks, do **not** live-split fat buckets, do
   **not** treat empty educator fields as done.

Walk once after step 2 (and after polish if it landed): name signup →
six-check placement → Today → decode skip or finish →
`fnd-orient-source-type` See-it → Continue on Today. Confirm a hosted
`/diagnostic.html` share still shows **Pick a name to start**, not
session-expired.
