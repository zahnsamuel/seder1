# Foundation starter set (the teachable v1 slice)

**Frozen 2026-09-07.** Machine-readable list: [`data/foundation-starter-set.json`](../data/foundation-starter-set.json).
Guarded by `test/foundation-starter-set.test.mjs`. Freezes graph version `0.3.2` (55 skills, 11 layers).

This executes checklist item 4 of [`docs/skill-graph-north-star.md`](skill-graph-north-star.md):

> **Name a teachable starter set and freeze the rest.** Pick ~20–30 skills the daily loop
> can actually teach in the next slice (Layer 0 decoding + orientation through first
> argument/responsibility moves)… Do not grow toward 150 until the starter set has items,
> retrieval, and a working frontier router.

## What "starter" and "frozen" mean

- **Starter (29 skills):** the only skills we instrument in the next slice. Item banks,
  retrieval checks, educator edge-audit, and the `fnd-` frontier router all target *these
  first*. Placement may still diagnose across the whole graph, but Today teaches, reviews,
  and repairs inside the starter set until it is fully instrumented.
- **Frozen (26 skills):** real skills that stay in the graph but are **not taught yet and
  not grown**. No new item banks, no new siblings, no splitting the fat buckets — until
  every starter skill has ≥1 authored transfer item, a retrieval check, and a working
  frontier router. This is the "freeze the rest" the north-star asks for; it protects the
  slice from sprawling back toward 150 before the first 29 actually work.

The freeze is a product decision, not a deletion. Nothing is removed from
`foundation-skill-graph.json` (the brain); this file is a lens over it.

## How the set was chosen

- **Downward (prerequisite) closure** of a chosen set of target leaf moves. Closure
  guarantees the set is **prerequisite-closed** — no starter skill depends on a frozen one
  — so the frontier router can always walk it without hitting a frozen prerequisite. The
  guard test enforces this.
- **Span:** Layer 0 decoding + orientation, through the first argument moves and the
  study-vs-ruling responsibility anchor — exactly the north-star's named range.
- **Target leaves:** the five first-argument moves (`fnd-arg-*`), the core case moves
  (`fnd-case-what-happens/actors/restate/uncertainty`), the ruling-vs-discussion role, and
  the `fnd-resp-learning-vs-ruling` boundary. Their closure is 29 skills.
- Two skills come in only as prerequisites of the responsibility anchor rather than as
  leaves in their own right: `fnd-resp-learning-vs-ruling` ← `fnd-context-genre-expectations`
  (L7) ← `fnd-role-ruling-vs-discussion` (L3). They ride along so the anchor is reachable;
  the rest of Context, Compare, Independence, and Agency stay frozen.

The "leverage" column below is each skill's count of transitive dependents in the full
graph — how much of the DAG it unlocks. It confirms the closure front-loads the
highest-leverage moves (decoding unlocks 51–54; `orient-source-type` 50; `signal-known-words`
44), and is not used as the selection rule itself (closure is).

## The starter set — 29 skills

| Skill id | Band | Move | Unlocks (transitive deps) |
|---|---|---|---|
| `fnd-decode-letters` | Decode (L0) | Recognize the Hebrew letters | 54 |
| `fnd-decode-vowels` | Decode (L0) | Recognize the Hebrew vowels | 53 |
| `fnd-decode-blend` | Decode (L0) | Blend a letter and a vowel | 52 |
| `fnd-decode-word` | Decode (L0) | Read a vocalized Hebrew word | 51 |
| `fnd-orient-source-type` | Orient (L1) | Tell what kind of text you are looking at | 50 |
| `fnd-orient-speaker` | Orient (L1) | Identify who is speaking | 38 |
| `fnd-orient-question-present` | Orient (L1) | Notice when a source is asking, not telling | 36 |
| `fnd-orient-page-geography` | Orient (L1) | Find the main text and what surrounds it | 19 |
| `fnd-orient-unit-boundary` | Orient (L1) | Find where one idea starts and stops | 17 |
| `fnd-signal-known-words` | Signals (L2) | Recognize a bank of high-frequency words | 44 |
| `fnd-signal-question-words` | Signals (L2) | Recognize question-signal words | 35 |
| `fnd-signal-name-formulas` | Signals (L2) | Recognize attribution formulas | 29 |
| `fnd-signal-connectors` | Signals (L2) | Recognize argument connectors | 20 |
| `fnd-signal-quotation` | Signals (L2) | Notice when a source quotes another source | 18 |
| `fnd-role-question-vs-answer` | Roles (L3) | Label question, answer, or restatement | 34 |
| `fnd-role-example` | Roles (L3) | Recognize a worked example | 29 |
| `fnd-role-quotation-bounds` | Roles (L3) | Bound a quotation | 16 |
| `fnd-role-ruling-vs-discussion` | Roles (L3) | Distinguish a ruling from a discussion | 11 |
| `fnd-case-actors` | Case (L4) | Identify who acts | 28 |
| `fnd-case-what-happens` | Case (L4) | State what happens in plain language | 25 |
| `fnd-case-restate` | Case (L4) | Restate a case in your own words | 19 |
| `fnd-case-uncertainty` | Case (L4) | Name what is uncertain | 5 |
| `fnd-arg-claim` | Argument (L5) | State the claim | 18 |
| `fnd-arg-evidence-role` | Argument (L5) | Say what a cited source is doing | 15 |
| `fnd-arg-objection` | Argument (L5) | Mark an objection | 15 |
| `fnd-arg-response` | Argument (L5) | Follow the response | 14 |
| `fnd-arg-unresolved` | Argument (L5) | Recognize an open tension | 4 |
| `fnd-context-genre-expectations` | Context (L7) | Let the genre set your expectations | 6 |
| `fnd-resp-learning-vs-ruling` | Responsibility (L8) | Tell learning apart from a ruling | 4 |

This is the whole arc a 0→1 learner needs to open an unfamiliar source and get somewhere:
**decode the Hebrew → see what kind of text it is → read its signals → assign roles to its
lines → map the case → follow the first argument → and keep study distinct from a ruling.**

## Frozen — 26 skills (in the graph, not taught yet)

- **Signals (L2)** — Read the grammatical skeleton of a sentence.
- **Roles (L3)** — Tell primary text from commentary; Notice where a translation makes a choice.
- **Case (L4)** — Classify the case into a category; Identify who is obligated and who is exempt; Follow the order of a procedure; Find the factor that changes the outcome.
- **Compare (L6)** — Find the shared question; Name where readings diverge; State each side at its strongest; Tell a real dispute from a scope difference; Weigh a translation against the original.
- **Context (L7)** — Place a source in time and place; Ask who made it and for whom; Judge what evidence a source can give.
- **Responsibility (L8)** — Hold more than one view; Name the limits of what you learned; Know when to ask a person.
- **Independence (L9)** — Make a scaffolded first pass; Map each line's job; Use translation to check, not to skip; Carry a reading move across genres.
- **Agency (L10)** — Ask a good question; Use a source tool on purpose; Record what you don't yet understand; Choose your next study move.

## What this unblocks next (not done here)

The freeze is the *list + rationale*. It deliberately does **not** touch the live router
(that lane is owned separately). With the starter set named, the sequenced next steps are:

1. **Educator edge-audit** of the 29 starter skills' prerequisites (rationales are 0/76).
2. **≥1 authored transfer item per starter skill** (item banks are 0/55) — start here, not
   with new skills. Schema + 2 labeled EXAMPLE entries (not coverage, not loaded):
   [`docs/foundation-transfer-items.md`](foundation-transfer-items.md).
3. **Retrieval checks** citing these `fnd-` ids.
4. **Frontier router** scoped to the starter set (consumes
   `data/foundation-starter-set.json`), so Today teaches/reviews/repairs inside the slice.

Do not expand past 29 until the starter set has items, retrieval, and a working frontier
router (north-star item 4).
