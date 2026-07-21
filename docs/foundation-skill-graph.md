# Foundational Skill Graph — spec & authoring contract

Seder · The Jewish Learning Academy is skills-first. The **foundational skill graph**
(`data/foundation-skill-graph.json`) is the canonical artifact of that reset: a directed graph
of transferable *reading capabilities*, deliberately separate from content. It is the thing the
mentor notes call the linchpin — "I need a skill-based graph … a few hundred interlocking
concepts." This is the first slice (45 skills across 10 layers); it grows from here.

## Why this exists separately from the other graphs

The repo already has three skill datasets. They are not the same thing:

| File | What it is | Grain |
|---|---|---|
| `data/foundation-skill-graph.json` | **New.** Capability-first foundational graph. Skills a learner *carries between genres*. | ~45 (growing to a few hundred) |
| `data/skill-graph.json` | Older hand-authored base, organized by *track* (gemara/thought/language). | ~16 |
| `data/non-gemara-skill-graph.mjs` | Per-course source-reading chains. | content-derived |
| `data/content-skill-graph.mjs` | **Generated** from each unit's steps — one node per source move. | ~800 |

The last three are **content-based**: each node is bound to a specific source. That is exactly
the shape the mentor critiqued ("overly focused on Gemara; overly focused on absolute mastery").
The foundational graph is **skill-based**: `fnd-arg-objection` ("mark an objection") is one
capability taught through Gemara, Rambam, or the Guide, and demonstrated by transferring it to a
source the learner has never seen. Content units *reference* foundational skills; they do not
define them.

> Rule of thumb: if a node could only ever be taught by one specific page, it belongs in the
> content graph, not here. A foundational skill must be teachable in at least two genres.

## The 10 layers

Layers are **thematic groupings**, not strict dependency rungs. A later skill may reach back
several layers (argument tracking builds on text signals). The only hard ordering rule: a skill
may never depend on a *higher* layer than itself.

1. **Orientation** — what is this, where am I, who speaks, is it asking?
2. **Text signals** — high-frequency words, connectors, quotation, attribution.
3. **Source roles** — text vs. translation vs. commentary; question/answer/example/ruling.
4. **Case mapping** — who acts, what happens, what's uncertain, what changes.
5. **Argument tracking** — claim, evidence, objection, response, open tension.
6. **Comparison** — shared question, divergence, strongest form, scope.
7. **Context** — when, where, by whom, for whom, what evidence.
8. **Practice & responsibility** — learning vs. ruling; hold disagreement; name limits.
9. **Independent reading** — supported first pass; carry a move across genres.
10. **Learning agency** — ask, use a tool, record uncertainty, choose the next move.

## Skill schema

Every skill is an object in `skills[]` with this shape (all fields required unless noted):

```jsonc
{
  "id": "fnd-arg-objection",          // MUST start with "fnd-" (keeps skill ids separate from content ids)
  "layer": 5,                          // must be a declared layer number
  "title": "Mark an objection",       // plain-language learner title
  "statement": "You can mark an objection and describe the pressure it puts on a claim.",
  "prerequisites": ["fnd-arg-claim", "fnd-signal-connectors"],  // fnd- ids; may be []
  "sourceContexts": [                  // >=2; span genres wherever possible
    {"ref": "Gemara Berakhot 2b", "genre": "gemara"},
    {"ref": "Guide for the Perplexed, selections", "genre": "thought"}
  ],
  "teachingMove": "…",                 // the one move that makes the implicit explicit
  "checks": ["…"],                     // >=1 low-friction guided demonstration
  "transfer": "…",                     // the same move in a new source or genre
  "repair": "…",                       // what to do when the learner is uncertain
  "graduationThreshold": "transfer",   // key in masteryScale: emerging | secure | transfer
  "durability": "core"                 // key in durabilityTiers: foundation | core | transfer
}
```

`genre` must be one of the declared `genres`: torah, mishnah, gemara, halakha, tefillah,
thought, mussar, chassidus, history.

## Authoring contract (Claude / Codex)

The graph is the shared source of truth, so edits must keep it valid. **After any change, run
the checker and do not commit red:**

```
npm run graph:foundation      # node scripts/check-foundation-graph.mjs
```

The checker fails the build on: duplicate ids, a non-`fnd-` id, an undeclared layer/genre/tier/
threshold, a missing teaching-contract field, fewer than 2 source contexts, an unresolvable
prerequisite, a dependency on a higher layer, a cycle, or a skill unreachable from a root. It
also prints a coverage report (skills per layer, roots, graduation leaves, canon-genre reach) so
you can see breadth at a glance. A single-genre skill is a *warning*, not an error — prefer to
fix it, since transfer is the whole point.

When you add a skill:

1. Give it a `fnd-` id and place it in the right layer.
2. Wire prerequisites to existing `fnd-` skills only; never point up a layer.
3. Give it **at least two source contexts in different genres.**
4. Fill the full teaching contract (move, check, transfer, repair, threshold, durability).
5. Run `npm run graph:foundation` and clear errors.

When you tag content to skills, reference `fnd-` ids from the content unit — do **not** copy
skill definitions into the content, and do **not** invent new `fnd-` ids inside a unit.

## Content → skill map (tagging content to the graph)

Content units are tagged to the `fnd-` skills they exercise so the graph can drive learners to
**real sources**, not only a synthetic session. This is a **generated** index (like
`content-skill-graph.mjs`), not hand-tagging:

- `scripts/build-foundation-content-map.mjs` (`npm run map:foundation`) reads every content unit
  via `loadUnits`, and for each assessed step derives one primary `fnd-` skill from a transparent,
  ordered rubric keyed on the step's `competency` (recognition/argument/sourceReasoning/
  translation) and `mode`, plus `typed`/`independent` flags and the unit's genre.
- Output: `data/foundation-content-map.json` — `bySkill` (fnd id → the units/steps that exercise
  it, with route + genre + source ref) and `byUnit` (unit → its `fnd-` skill set).
- `academy-session.js` reads it: for the session's `fnd-` skill it shows up to three
  genre-diverse real units ("Practice this skill in real sources"), and hides the section when the
  skill has no content yet.
- `test/foundation-content-map.test.mjs` fails if the committed JSON drifts from content+rubric
  (message tells you to rerun `map:foundation`), and checks every mapped id is a real graph skill.

**Coverage is intentionally partial (currently 29/45 skills).** The generator prints which `fnd-`
skills have no real content — that list is real authoring signal (the uncovered ones are mostly
fine-grained language micro-skills, page geography, and the L10 agency skills the daily loop
itself teaches). The rubric is a v1: refine it, or author content, to raise coverage.

> Workflow: whenever you add/rename assessed `skill:` steps in content, run **both**
> `npm run graph:build` (adaptive graph) **and** `npm run map:foundation` (foundation map), and
> commit the regenerated files. Both have drift tests that fail otherwise.

## How this feeds the product (next steps, per the roadmap)

- **Placement** samples these capabilities (not subjects) and returns a capability profile that
  names the first `fnd-` skill that unlocks the most. See
  `docs/seder-jewish-learning-academy-roadmap.md` → Placement.
- **The daily loop** presents one `fnd-` skill / one source / one move / one check at a time.
- **Graduation** is defined by `graduationContract` in the JSON: demonstrate the required skills
  across ≥3 genres including ≥1 unseen source. It is *not* Shas completion.
- **Canon breadth** is enforced at the session layer (target exposure distribution), not by the
  graph; the graph only guarantees each skill *can* be taught across genres.

## Open extension work

- Grow from 45 toward a few hundred skills as learner bottlenecks appear (roadmap Phase 5).
- Add a pre-Layer-1 alef-bet / phonetic zero-start ladder for true beginners (post-pilot moat).
- Decide whether to add per-skill exposure weights so the engine can balance canon coverage
  directly from the graph rather than from a separate session plan.
- Evaluate open-source graph tooling for *visualization/authoring* only; the JSON stays the
  canonical, versioned, testable source (roadmap → Technology direction).
