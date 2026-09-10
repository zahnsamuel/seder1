# Merge brief — 2026-09-10

**Do not merge while Sam is away. Hosted `main` stays untouched.**

Away-day map for Sam’s return. Docs only. Do not merge this pile onto
`main` until he is back. Render auto-deploys on `main` commits, so a
merge today would replace the live share-path tip.

This is not a 0→1 sitting. The 09-09 queue already landed. Do not treat
[`docs/merge-brief-2026-09-09.md`](merge-brief-2026-09-09.md) as a live
merge list.

Verified live on GitHub **2026-09-10** against `main`
`75b1e4c` (merge of [#58](https://github.com/zahnsamuel/seder1/pull/58)).
Open drafts: [#59](https://github.com/zahnsamuel/seder1/pull/59) (3→4
banks), stacked [#62](https://github.com/zahnsamuel/seder1/pull/62)
(L1/L2 banks 4→5), sibling [#61](https://github.com/zahnsamuel/seder1/pull/61)
(friend-path chrome), and this brief [#60](https://github.com/zahnsamuel/seder1/pull/60).
#59, #61, and #62 are `MERGEABLE` / `CLEAN` vs `main` (#62 because it
already contains #59). A later-bank 4→5 agent is running with **no PR
yet**.

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

Render auto-deploys on `main` commits. **Do not merge, do not push
`main`, while Sam is away.** Leave this deploy as the colleague-share
tip. Draft PRs may open; none of them should merge until he returns.

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

**#59 → #62 → later bank thicken PRs → friend-path polish (#61) → this
brief last** (or fold #60 into a docs-only merge; it is not a product
gate).

Do not merge #62 as a substitute for reviewing #59. Do not merge
anything while Sam is away.

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
`test/teach-before-ask.test.mjs`, `docs/qa-intake.md`. **#62 is already
branched from this tip** (`8fbdca4`).

### 2. After #59 (stacked): [#62](https://github.com/zahnsamuel/seder1/pull/62) (draft)

**Thicken nine earliest starter banks 4 → 5 items.**

Branch `cursor/thicken-l1-l2-starter-banks-c4a1`, **off #59**, not off
`main`. After #59, 24 non-L0 starters were still at 4. This takes the
earliest path — L1 orient except `fnd-orient-source-type` (already 7)
and all five L2 signal skills — to 5. Does **not** re-thicken #59’s
nine L3–L7 skills (those stay at 4).

| Skill | New fifth item |
|---|---|
| `fnd-orient-page-geography` | Rashi on Genesis 1:1 — side column that quotes a word vs the verse |
| `fnd-orient-speaker` | Psalm 23:1 — named psalmist vs God |
| `fnd-orient-unit-boundary` | Mishnah Bava Metzia 1:1 — all-vs-all vs all-vs-half |
| `fnd-orient-question-present` | Genesis 1:1 — telling, not asking |
| `fnd-signal-known-words` | Mishnah Berakhot 1:1 — `אוֹמֵר` as “says” |
| `fnd-signal-question-words` | Mishnah Berakhot 1:1 — `לָמָה` wants a reason |
| `fnd-signal-name-formulas` | Mishnah Berakhot 1:1 — `דִּבְרֵי רַבִּי אֱלִיעֶזֶר` |
| `fnd-signal-connectors` | Berakhot 2a — `וְתוּ` as an adding connector |
| `fnd-signal-quotation` | Berakhot 2a — `דִּכְתִיב` plus Genesis 1:5 |

Light See-it edits on question-words and name-formulas only. New guard
`test/foundation-l1-l2-banks.test.mjs`. No L0 banks, no self-rate, no
Today / diagnostic chrome.

**Merge #59 first, then this.** Merging #62 to `main` without #59 would
still land #59’s commits (it is stacked) and leave #59 looking empty —
review them as two diffs. GitHub: `MERGEABLE` / `CLEAN` vs `main`
because the stack already includes #59.

Later 4→5 bank PRs (roles / case / argument / context) should rebase
onto **#62**, not onto #59 alone, so they keep these L1/L2 fifth items.

### 3. Later bank thicken PRs (after #62, before chrome)

**Slot for further 4→5 (or 5→n) bank drafts.** Same authored-items
file as #59/#62. Merge the bank stack before friend-path polish so
excerpts and teach-before-ask stay one tree.

A sibling agent is already running with **no PR yet**:
[Away-day: thicken later banks 4→5](https://cursor.com/agents/bc-5ef04014-ff7d-4dbb-b4fd-39f1f109ab6c).
Expected lane: the L3–L7 / L8 banks #62 left at 4 (roles, case,
argument, genre-expectations, learning-vs-ruling) — **not** a rewrite
of #59’s fourth items or #62’s L1/L2 fifths. **TODO: PR #____** when
it opens. Rebase onto #62. Prefer #59/#62 items on any overlapping
`fnd-`. No L0 banks.

If more bank drafts land today, stack them here in the same way:
rebase onto the previous bank tip, then merge before #61.

### 4. Friend-path polish: [#61](https://github.com/zahnsamuel/seder1/pull/61) (draft)

**Clarify the friend 0→1 Today ↔ lesson handoff.** Copy/chrome only.

Branch `cursor/friend-first-run-handoff-79f8`. After placement, Today
names a short source-then-questions lesson (**Start this lesson →**),
academy complete says **LESSON DONE** + **Continue on Today**, and a
finished skill makes Today offer **Start the next lesson** instead of
repeating the first CTA. Real-source accordion waits until complete.
**Got it — ask me** and teach-before-ask are unchanged. No mastery math,
no item banks, no L0 banks, no diagnostic API.

Files: `daily-router.html`, `jla-next-action.js`, `data/next-action.mjs`,
`academy-session.html` / `.js` / `.css`, `test/friend-first-run.test.mjs`,
`test/academy-session.test.mjs`, `test/lesson-two-today.test.mjs`,
`docs/qa-intake.md`.

**No shared product files with #59 or #62.** Slot after the **bank
stack** (#59 → #62 → later thicken PRs) so restored `Psalm 19` /
`Job 38:4` excerpts (which #61’s branch still reports as pre-existing
reds on main, 716/719) are on the tree before the friend walk. Rebase
only if `qa-intake.md` concatenates. GitHub: `MERGEABLE` / `CLEAN` vs
current `main`.

### 5. This map last: [#60](https://github.com/zahnsamuel/seder1/pull/60) (draft)

Docs only. **Merge last**, after the product drafts, **or fold** the
brief into a docs-only sitting (keep-both `qa-intake.md` / drop this
PR if the map is already copied elsewhere). It is not a learner-path
gate. Expect a keep-both on `docs/qa-intake.md` if #59 / #61 / #62 /
later bank PRs also appended.

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
| **Merging #59 / #62 / #61 / #60 (or anything else) to `main`** | Hosted tip stays `75b1e4c`. Drafts may queue. Do not merge while Sam is away. |
| **L0 decode banks** | Same hold as every sitting since the starter freeze. Glyph UI, not JSON banks. |
| **Fat-bucket live split** | #32 is a written plan, not graph 0.3.3. #49 deepenings (on main) thickened the three banks in place; they did not split the DAG. |
| **Educator edge rationales / named misconceptions** | Still 0/76 and 0/55 on the live graph (#37 staging). |
| **Authored transfer items** | Still 0/55. Schema + EXAMPLE only (#40). |
| **`graph:quality` bank counter** | Still reads `foundation-assessment-items.json` (0/55), not the authored JSON. |

Closed this sitting, do not resurrect:

- **[#47](https://github.com/zahnsamuel/seder1/pull/47)** — count-not-quality 4th items. Closed unmerged 2026-09-10. Superseded by #55 / #49-on-main / now #59.
- **[#49](https://github.com/zahnsamuel/seder1/pull/49)** — GitHub **CLOSED** (not merged). Deepenings already on `main` via repair commits. Do not re-merge.

---

## Sibling away-day PRs — later arrivals

Three Cursor away-day agents launched together on **2026-09-10**; a
fourth (**later banks 4→5**) started after #62 opened. Fill new bank
PRs into slot 3 above rather than starting a second brief.

| Draft | Agent | PR | Merge slot | Shared files |
|---|---|---|---|---|
| **3→4 remaining banks** | [Thicken 3-item banks + See-it](https://cursor.com/agents/bc-849aa7ef-a949-4448-94a1-af1b117d844e) | [#59](https://github.com/zahnsamuel/seder1/pull/59) | **First** | authored-items, teach, excerpts, teach-before-ask test |
| **L1/L2 banks 4→5** | [Away-day: thicken 4→5 early banks](https://cursor.com/agents/bc-5a6900a8-080e-4ef6-b71d-7fd4871bc4a1) | [#62](https://github.com/zahnsamuel/seder1/pull/62) | **After #59** (stacked on #59 tip `8fbdca4`). L1/L2 only; does not rewrite #59’s nine L3–L7 fourth items. | same bank files as #59 + new `test/foundation-l1-l2-banks.test.mjs` |
| **Later bank thicken 4→5** | [Away-day: thicken later banks 4→5](https://cursor.com/agents/bc-5ef04014-ff7d-4dbb-b4fd-39f1f109ab6c) | **TODO: PR #____** — running, no PR at this scan | **After #62**, before #61. Rebase onto #62. Leave #59/#62 items intact. No L0. | **TODO: files / overlapping `fnd-` ids** |
| **Friend-path polish** | [Away-day: Today/academy friend-path polish](https://cursor.com/agents/bc-24c97d76-a77d-43dd-85d6-9360854d79f8) | [#61](https://github.com/zahnsamuel/seder1/pull/61) | **After the bank stack.** No bank files. | Today / academy-session / next-action chrome + friend-path tests; `docs/qa-intake.md` |
| **This brief** | [Away-day merge brief 2026-09-10](https://cursor.com/agents/bc-72b2be74-ced6-4357-8b80-2d1f771111ab) | [#60](https://github.com/zahnsamuel/seder1/pull/60) | **Last**, or fold into a docs-only merge | `docs/qa-intake.md` |
| **Later arrivals** | — | **TODO: PR #____** | Bank PRs after #62; chrome after banks; docs last | **TODO: files** |

Paste-ready for a later bank draft:

```
### 3b. After #62: [#__](https://github.com/zahnsamuel/seder1/pull/__) (draft)

**TODO: one-line product intent (which layers, N→N+1).**

TODO: stacked on #62? overlapping fnd- ids vs #59 / #62?
TODO: what it does not touch (Today / diagnostic / L0 / fat-bucket).
GitHub mergeability at last check: TODO.
```

Conflicts:

| Collision | Why | What to do |
|---|---|---|
| **#59 vs #62** | Same authored-items / teach / excerpts files; #62 is stacked on #59 | Merge **#59 first**, then #62. Do not merge #62 as a substitute for reviewing #59. No overlapping `fnd-` rewrites (#59 = L3–L7 3→4; #62 = L1–L2 4→5). |
| **#62 vs later bank thicken** | Same JSON files; later PR should add fifths on *other* skills | Rebase later bank PR onto **#62**. Keep #59 fourths and #62 L1/L2 fifths. |
| **Bank stack vs #61** | Only `docs/qa-intake.md` on product-adjacent files | Keep-both / concatenate. Chrome vs banks do not share session files. Merge banks first so #61’s excerpt reds can clear. |
| Almost everyone | `docs/qa-intake.md` | Append-only; should merge. |

---

## Suggested sitting (when Sam is back)

Do **not** do this sitting until Sam is back. Hosted main stays
`75b1e4c`.

1. Confirm hosted health is still `75b1e4c` (or a SHA Sam knowingly
   shipped). If a stray `main` push happened, stop and inspect Render
   before merging anything else.
2. Merge **#59** (3→4 on the last thin non-L0 starter banks). Walk one
   of those nine skills in academy-session: See-it names the tell, then
   shuffled ask, Hebrew on the newest item.
3. Merge **#62** (L1/L2 banks 4→5, stacked on #59). Confirm it did not
   rewrite #59’s nine L3–L7 fourth items.
4. Merge **later bank thicken PRs** (rebase onto #62). Fill the TODO
   row if a PR exists by then.
5. Merge **#61** (friend-path polish). Confirm Today says **Start this
   lesson**, complete says **LESSON DONE**, and a second visit offers
   **Start the next lesson**.
6. Merge **#60 last**, or fold this brief into a docs-only merge. It
   is not a product gate.
7. Do **not** author L0 banks, do **not** live-split fat buckets, do
   **not** treat empty educator fields as done.

Walk once after step 5: name signup → six-check placement → Today →
decode skip or finish → `fnd-orient-source-type` See-it → **Got it —
ask me** → Continue on Today → next-lesson CTA. Confirm a hosted
`/diagnostic.html` share still shows **Pick a name to start**, not
session-expired.
