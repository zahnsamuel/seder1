# Authoring foundation item banks

How to write learner-facing check items for the foundation skill graph so they are
consistent, honest, and safe to ship. Companion to
[`docs/ui-principles.md`](ui-principles.md) (the learner-UI law, including "teach a term
before you test it") and [`docs/skill-graph-north-star.md`](skill-graph-north-star.md)
(what the graph is for). This file is about the **item banks** specifically:
`data/foundation-authored-items.json`.

## The pipeline

Items are **client-scorable recognition items** attached to a `fnd-` skill:
`{ sourceRef, stem, choices[2–5], correct, feedback }`.

1. Author an export `{ items: { "<fnd-id>": [ item, … ] } }` (a scratchpad file, or the
   workbench at `docs/item-authoring-workbench.html`).
2. Import it: `npm run graph:import-items -- <export.json>`. The validator
   (`data/item-authoring-fold.mjs`) rejects malformed items and **replaces a skill's whole
   bank** with the validated set (skills absent from the export keep theirs), then writes
   `data/foundation-authored-items.json`.
3. `authoredReviewItem` / `sourceReviewItems` (`data/curriculum-engine.mjs`) prefer an
   authored item over a graph-derived retrieval, so a bank upgrades a skill's reviews the
   moment it lands.

Target: **≥3 items per skill.** `foundation-authored-items.json` is keyed by skill id and is
**not** graph-version-stamped, so item work does not drift when the graph changes.

## The quality bar

1. **Source-grounded application, not abstract "meta."** A good item presents a concrete
   source situation and asks the learner to *make the move*. Avoid stems that ask *about* the
   skill in the abstract ("Why does recognizing an example matter?", "How do you locate the
   uncertainty?", "To follow a response well, the question to ask is…"). Those test
   knowing-about, not doing.
2. **Carry the on-page substance.** When the item hinges on a text, put a short excerpt
   (Hebrew + translation) in the stem — never "go look it up on Sefaria." Ground each item in
   the skill's own `sourceContexts`, and **vary** the source family across a bank.
3. **No length-bias exploit.** The correct answer must not be reliably the longest option:
   `len(correct) ≤ 1.5 × len(shortest choice)`. The fix is never padding the correct answer —
   it is writing distractors that are substantive near-misses (a specific plausible misreading),
   of comparable length.
4. **Feedback teaches.** Every item's `feedback` is ≥25 characters and says *why* the answer
   is right / what the move is — not just "correct."
5. **Distinct, non-duplicative choices**, and one defensible correct answer.

## Teach a term before you test it (hard law)

A learner-facing **ask** (stem + choices) must not use a Jewish or technical term the learner
has not been taught earlier in the path — *Torah* (as a genre label), *Mishnah*, *Gemara*,
*commentary*, *halakhah*, *aggadah*, *sugya*, work titles, etc. See `docs/ui-principles.md`,
"Teach a term before you test it."

- Teach the term first — in the skill's See-it teach (`data/foundation-teach.json`, keyed by
  skill id, or its `genres` block, or an `item.teach`) — **then** ask; or ask in plain English
  and only use the term once it is defined.
- A term may appear in **teaching text** and in **post-answer feedback**. Never in an untaught
  ask.
- Terms taught by a **prior** skill count as taught (e.g. `fnd-orient-source-type` teaches
  Torah / Mishnah / Gemara / commentary, so later skills may use them).
- Guard each bank with a regex over stems+choices (see
  `test/deepened-l2-l5-quality.test.mjs`, `test/orient-genre-checks.test.mjs`).

## What software must NOT author (the §3 freeze)

**Edge rationales** (`data/foundation-skill-edges.json`) and **misconception models**
(`data/foundation-misconceptions.json`) are **educator judgments**. They stay `null` / empty
until a real educator authors them through the audit workbench
(`docs/educator-audit-workbench.html` → `npm run graph:import` →
`npm run graph:edges` / `npm run graph:misconceptions`). This is enforced by tests
("pedagogical rationales are null — they are educator-authored, never fabricated"). **Do not
have an AI invent them** and do not edit those guard tests to let fabricated content through —
the whole point is that these are honest human judgments, not plausible-sounding filler.

Authored *check items* are different: they are content, and drafting them (clearly marked
"draft for educator audit") is expected. Rationales and misconceptions are not.

## Scope discipline

- **Respect the frozen starter set** ([`docs/foundation-starter-set.md`](foundation-starter-set.md)):
  author for those skills; do not grow past the 29 until the set has items, retrieval, and a
  working frontier router.
- **L0 decode** skills are reviewed by glyph re-drilling in the decoding ladder and are kept
  out of the source-review queue — do not author review-item banks for them unless explicitly
  asked.
- **One writer per file set; single-concern PRs.** When another agent is actively reworking a
  skill (e.g. a fat-bucket split), leave that skill's bank alone to avoid collisions.
- Item banks are **drafts for educator audit**, not final calibrated assessments.
