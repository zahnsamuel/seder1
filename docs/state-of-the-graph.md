# State of the JLA knowledge graph

*A one-page status of the skills-first Jewish-learning graph, modeled on Math Academy. Live numbers:
`npm run graph:quality`. Companion docs: [foundation-graph-schema.md](foundation-graph-schema.md)
(governance), [math-academy-way-graph.md](math-academy-way-graph.md) (the MA mapping).*

## What it is

A **skill-based** knowledge graph — a prerequisite DAG of discrete reading capabilities ("you can
separate a question from its answer"), not a catalog of sources or topics. This is the Math Academy
model: the graph is the source of truth, and the engine on top of it places each learner at the edge
of what they're ready to learn. (Source discovery — "where is this text?" — is a *separate* content
layer, Yochai; a skill node is never a source.)

It is a **v0.1 prototype, by design.** The structure and the adaptive engine are **built and tested**
(476 passing automated tests). Its **completeness, pedagogical claims, and effectiveness are not yet
validated** — that is the job of an educator audit and a six-week learner pilot, not more software.

## What is built (software — tested, honest, nothing fabricated)

- **Skill ontology** — 49 skills across 10 developmental layers; **100% are capabilities, 0 are
  content nodes** (a gate, `npm run graph:skills`, fails the build if a node drifts content-ward).
- **Typed prerequisite DAG** — 74 typed edges, **0 orphans**; every edge also carries an encompassing
  weight (for efficient review).
- **Content** — **49/49 skills** have ≥3 real source contexts spanning ≥2 source families (832
  first-class context nodes; every reference traces to a real source).
- **Assessment** — 18 authored items promoted to first-class nodes on 17 skills; **answer keys never
  ship to the client**.
- **Knowledge points** — 147 scaffolded sub-steps (introduce → practice → transfer), each proposing
  the key prerequisite it leans on.
- **The Math Academy engine** (pure functions, all tested):
  - *Knowledge frontier* + *learning path* — what a learner is ready to learn now, and the route to any goal.
  - *FIRe review* — an advanced task implicitly reviews the simpler ones below it (a 3-skill review chain collapses to 1 task).
  - *Targeted remediation* — struggle on a skill routes to a review of its **foundation**, not a re-drill.
  - *Adaptive diagnostic* — pins the **exact** frontier in ~8–21 questions instead of 49 (served at `POST /api/graph/diagnostic`).
  - *Placement* — a placement seeds the whole prerequisite chain of every demonstrated skill, so the learner **starts at their true frontier**.
- **Explainable next-step** — every recommendation says *why* ("because you've secured A, it unlocks C").

## What the educator audit needs (pedagogical claims — deliberately left unwritten)

These are real assertions about how people learn; we do not fabricate them. The tooling has them
staged and measurable:

| Item | Now |
|---|---|
| Prerequisite-edge **rationales** | 0 / 74 written |
| **Misconception** models | 0 / 49 (each skill has one repair string) |
| **Encompassing weights** | default-full; need domain-expert values |
| **Knowledge-point** depth + key-prereq confirmation | 147 KPs are a first scaffold; confirm & deepen |
| **Skill expansion** | 49 → ~150 → a few hundred: deepen the 10 domains and the under-covered midrash / tefillah / halakha families (6 graduation skills have no graph home yet) |

## What the pilot needs (empirical — needs real learners)

| Item | Now |
|---|---|
| **Item banks** (≥3 items/skill) + **transfer items** | 0 / 49 |
| Item **difficulty & discrimination** | none (needs response data) |
| Probabilistic **knowledge estimates** | none (a running score today) |
| **Empirical edge validation** — do prerequisites predict learning? | none (needs the pilot) |

## Bottom line

The engine and structure are done and proven in code. The next milestone is **not more pages** — it
is an **educator-reviewed, assessment-backed, pilot-calibrated** graph. Every remaining gap is exactly
the kind that requires people and learners, and each one is already tracked and measurable
(`npm run graph:quality`). The prototype is ready to hand to educators for audit and to run in a small
pilot.
