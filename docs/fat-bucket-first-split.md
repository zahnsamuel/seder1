# Fat-bucket first split (north-star item 7)

**Status:** proposal. The live graph stays at version `0.3.2` (55 skills). Do not add
the child until the starter set has items and a starter-scoped frontier router — see
[`docs/foundation-starter-set.md`](foundation-starter-set.md).

Machine-readable twin: [`data/fat-bucket-first-split.json`](../data/fat-bucket-first-split.json).
Guarded by `test/fat-bucket-first-split.test.mjs`. Audit recomputed 2026-09-08 from
`scripts/build-foundation-content-map.mjs` over the current corpus.

Product law: split only where the daily loop would **route differently**, and only with a
rubric signal plus retagged units
([`docs/skill-graph-north-star.md`](skill-graph-north-star.md) §7,
[`docs/foundation-graph-growth-plan.md`](foundation-graph-growth-plan.md)).

## Audit — the three named buckets

| Skill | Tagged steps | What the rubric actually keys on | Verdict |
|---|---|---|---|
| `fnd-arg-response` | 90 | `competency === 'argument'` catch-all (32 steps have no mode) | **Split one child.** Parent teachingMove already names three response types; content already teaches one of them. |
| `fnd-role-ruling-vs-discussion` | 78 | `competency === 'sourceReasoning'` catch-all (41 steps have no mode) | **Do not split.** No distinctive mode cluster. A child would report 0 units. |
| `fnd-case-what-happens` | 41 | leftover `CASE ORIENTATION` (36) + `FACT PATTERN` (5) | **Already closed.** Graph 0.2.0 carved `category` / `procedure` / `obligation` / `what-changes`. The remainder is the skill’s own move. |

`fnd-indep-map-lines` (164) is fatter than any of these. It is a frozen L9 independent-read
catch-all, not a starter skill, and is out of scope for item 7.

### Why case is not the first split

The growth plan’s case children (`case-sequence`, `case-condition`, `case-quantity`) have
**no mode signal** in the leftover. The leftover tokens are homogeneous “state what happens.”
The existing children already have content (`LEGAL CATEGORY` 19, `PROCEDURE MAP` / `DELIVERY MAP`,
`OBLIGATION MAP` / `EXEMPTION LOGIC`). Further case siblings would be pedagogy sprawl.

Those children are **frozen**. Today’s unscoped router can already pick
`fnd-case-category` after `fnd-case-what-happens` is secured. That routing difference
already exists; it does not need a new skill.

### Why role is not the first split

Modes on the 78 `sourceReasoning` steps are `PRACTICE`, `SOURCE CHECK`, `BARAITA`,
`GEMARA CONNECTION`, `MIDDOT ORIENTATION` — production and orientation leftovers, not
“ruling vs analysis vs aside vs terminology.” Inventing those children without a remode
pass would violate the coupling rule: *a split is only real if content can distinguish
the pieces.*

## The one justified child

Keep `fnd-arg-response` as the general “follow the response” fallback.

Add **one** L5 child, not the growth plan’s three:

| Field | Value |
|---|---|
| id | `fnd-arg-resolve-distinction` |
| title | Answer by distinguishing cases |
| statement | You can recognize when a response answers an objection by showing the sources apply to different cases, not by denying the objection. |
| layer | 5 |
| prerequisites | `fnd-arg-response` |
| rubric token | `DISTINCTION ANSWER` |
| source contexts | Gemara Shabbat 2a (similar cases that differ); Rambam, Hilchot Deot 1:4–5 (middle path distinguished from extremes) |

**Deferred** (no mode in content, do not author): `fnd-arg-reinterpret` (`REINTERPRET`),
`fnd-arg-two-answers` (`SECOND ANSWER`). INTERPRETATION / CONCEPT steps in the fat
bucket are middot tools, aggadah themes, and close reading — not a single “re-read the
claim” move.

### Rubric (order matters)

`scripts/build-foundation-content-map.mjs` already maps any mode containing `DISTINCTION`
to frozen L6 `fnd-compare-scope` **before** the L5 argument rules. A bare `DISTINCTION`
retag would steal the compare skill, not close the argument bucket.

Place this rule **above** the L6 `DISTINCTION|CONTRAST` line:

```js
if (has(/DISTINCTION ANSWER/)) return 'fnd-arg-resolve-distinction';
```

Do **not** key on `DISTINCTION`, `DISTINCTION MAP`, `ROLE DISTINCTION`, or
`WITNESS DISTINCTION`. Those stay on compare-scope or (once order is fixed) their
existing L4 case skills.

### Content retag map

Remode only steps whose correct answer is “the reply distinguishes cases / practices /
situations,” not “keep two categories visible” or “reason controls how far a rule extends.”

| Unit | `contentSkill` | Today’s mode | Today’s `fnd-` | New mode |
|---|---|---|---|---|
| `berakhot-unit-5` | `baraita-distinction-response` | `RESPONSE` | `fnd-arg-response` | `DISTINCTION ANSWER` |
| `gemara-toolkit` | `distinction-signal` | `DISTINCTION` | `fnd-compare-scope` | `DISTINCTION ANSWER` |
| `shabbat-arc` | `shabbat-distinction` | `DISTINCTION` | `fnd-compare-scope` | `DISTINCTION ANSWER` |
| `taanit-arc` | `taanit-mention-request-distinction` | `DISTINCTION` | `fnd-compare-scope` | `DISTINCTION ANSWER` |

Leave these on `fnd-compare-scope` (scope / category visibility, not a reply-move):
`arakhin-vow-measure-distinction`, `bekhorot-status-redemption`,
`avodah-zarah-category-distinction`, `bava-kamma-av-toldot-stakes`,
`pesachim-distinction`, `eruvin-distinction-reason`, `thought-distinction`,
`daf-rashi-script`, and the `DISTINCTION MAP` “keep X distinct from Y” steps.

**Genre gap:** all four remode targets are Gemara. Before shipping the skill, author
**one new** `DISTINCTION ANSWER` step in a non-Gemara unit (Rambam Deot or a
responsum). Do not steal an existing `COMPARISON` step to fake breadth. Do not edit
`data/foundation-authored-items.json` in the same pass as Claude’s item banks.

## Why the daily loop routes differently

`pickFrontierFoundationSkill` (`data/next-action.mjs`) takes the knowledge frontier,
then the lowest layer, then alphabetical id. Review and practice resolve a content-step
id through `contentSkillToFoundationId` / `pickContentPracticeForSkill`.

### 1. Starter-scoped Today (the intended loop)

The starter set is not yet wired into the live router (that lane is separate). Once it
is, a learner who has secured every starter skill except `fnd-arg-unresolved` is sent to
**Recognize an open tension**.

After this split, with the child in the starter set and prereq `fnd-arg-response`:

- frontier at that moment = `{ fnd-arg-resolve-distinction, fnd-arg-unresolved }`
- alphabetical pick at L5 = **`fnd-arg-resolve-distinction`**
- href = `academy-session.html?skill=fnd-arg-resolve-distinction`

Today teaches “answer by distinguishing” **instead of** jumping from “follow the
response” to “the sugya left the tension open.” A learner can be secure on generic
response and still be assigned the finer move. That is the routing difference item 7
asks for.

The child must join the starter set (29 → 30, the documented cap) when implemented.
Adding it only to `frozen` would **not** change a starter-scoped Today.

### 2. Live full-graph Today (current router)

The live picker is **not** starter-scoped. After the `arg-response` closure is secured,
it currently picks frozen L2 `fnd-signal-sentence-structure` (lowest layer). Adding an
L5 child does **not** change that pick. Do not implement against this router expecting
an immediate Today change.

### 3. Practice and review (changes on remode day)

| Content skill | Today cites | After remode cites |
|---|---|---|
| `baraita-distinction-response` | `fnd-arg-response` | `fnd-arg-resolve-distinction` |
| `distinction-signal` | `fnd-compare-scope` | `fnd-arg-resolve-distinction` |
| `shabbat-distinction` | `fnd-compare-scope` | `fnd-arg-resolve-distinction` |
| `taanit-mention-request-distinction` | `fnd-compare-scope` | `fnd-arg-resolve-distinction` |

Review of those steps stops looking like “generic response” or “L6 scope compare.”
Academy “practice this skill in real sources” for the parent loses the one true
distinction-answer; the child gains the four (plus the future non-Gemara step).

`fnd-compare-scope` keeps 20+ DISTINCTION / CONTRAST steps. It is not hollowed out.

## Implementation checklist (later PR)

1. Add the skill to `data/foundation-skill-graph.json`; bump to `0.3.3`.
2. Add the prerequisite edge in the graph (edges JSON is generated — run the existing
   edge build, do not hand-edit if that is the workflow).
3. Insert the `DISTINCTION ANSWER` rubric rule above L6 `DISTINCTION`.
4. Remode the four steps; add one non-Gemara `DISTINCTION ANSWER` step.
5. Add the child as the 30th starter skill in `data/foundation-starter-set.json`
   (prereq is already a starter skill, so the set stays prerequisite-closed).
6. Run `npm run graph:foundation` and `npm run map:foundation`. Do **not** touch
   `data/foundation-authored-items.json` (Claude’s lane) — leave item-bank coverage
   at 0 for the new id until that lane authors a transfer check.
7. Keep next-action changes to the starter-set membership only. If another agent is
   wiring starter-scoped routing, do not rewrite `pickFrontierFoundationSkill` here.

## Why this PR does not implement the split

- Starter-set freeze: no new siblings until the 29 have items, retrieval, and a
  working frontier router.
- Live Today would not move (full-graph picker still lands on a frozen L2 skill).
- A child with no authored item adds another 0-bank skill while Claude is filling
  the starter banks.
- Axis C is unfinished: four remode targets are one genre.

The coupling is documented and test-locked so the implementer can land a small PR
without re-auditing the corpus.
