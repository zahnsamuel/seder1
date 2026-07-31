# A knowledge graph for JLA, built the Math Academy Way

Source: *The Math Academy Way* (Working Draft), esp. **Ch. 4 — Core Technology: the Knowledge
Graph**, and the chapters on the knowledge frontier and encompassings/FIRe. This doc translates that
model into the JLA foundation skill graph and records what is built vs. what remains.

The guiding decisions (from direction notes): the graph must be **skill-based** like Math Academy —
*"an interconnected structure of thousands of topics… each linkage… a prerequisite for another"* —
**not content-based** like Yochai's corpus graph (which the app queries via `search_corpus` to *find
sources*). Content is a **different layer**; a skill node is a learnable move, never a source. The
`graph:skills` gate enforces this. The target is **a few hundred interlocking skills** (MA runs
thousands; step 7 of the freeze plan targets ~150 → ~300).

## The Math Academy model, feature by feature

| MA feature | What it is (MA Way) | JLA status |
|---|---|---|
| **Prerequisite DAG** | Topics linked by prerequisite edges; arrows are learning paths. A course is just a *section* of the one graph. | **Have** — 49 skills, 74 typed prerequisite edges (`data/foundation-skill-edges.json`). Skill-based, 0 orphans. |
| **Knowledge frontier** | *"The edge of the knowledge profile"* — you know every prerequisite below it; the frontier skills are what you're ready to learn now. New lessons always sit on the frontier. | **Built** — `knowledgeFrontier()` in `data/knowledge-graph.mjs`. |
| **Learning path** | Follow prerequisite arrows from the frontier to any goal. | **Built** — `learningPath()`. |
| **Scaffolded mastery learning** | Each topic = a lesson of **knowledge points** (worked example + questions), basic → advanced; master each KP to unlock more advanced topics. | **Built (scaffold)** — `data/foundation-knowledge-points.json` (`npm run graph:kp`): 147 KPs, each skill decomposed introduce → practice → transfer, recast from its own `teachingMove` / `check` / `transfer`. Deeper decomposition = audit. |
| **Key-prerequisite remediation** | Each KP links to the *key* prerequisite it most directly uses; fail twice at a KP → auto remedial review of that key prerequisite. | **Built + wired** — a skill struggled ≥ twice routes to its practice KP's key prerequisite (`keyPrerequisiteRemediation`), ahead of the generic repair, unless the foundation is already strong. (KP-*granular* failure tracking still needs the answer flow to record which KP failed.) |
| **Encompassings + FIRe** | Advanced problems implicitly practice ("encompass") simpler ones. Serve the *smallest set of tasks that encompasses all due review*. Weights (0–1) are set by a domain expert **along direct/key prerequisites**; flow propagates the rest. | **Built (engine + proposed weights)** — every prerequisite edge carries an `encompassing.weight` (default full, `pending-expert`); `encompassingReviewSet()` computes the FIRe set with an audit trail. Weights need the expert pass. |
| **Diagnostic → frontier estimate** | An adaptive placement exam estimates the frontier; refined as lessons complete. | **Built** — `estimateFrontierFromDiagnostic` + `nextDiagnosticProbe` (`data/knowledge-graph.mjs`), served at `POST /api/graph/diagnostic`. Downward inference + balanced-split probing pins the exact frontier in ~8–21 questions, not 49. Seeding it into the placement flow is the remaining wiring. |
| **Scale** | Thousands of atomic topics. | **Prototype** — 49 (target: a few hundred). |

## What was built here (`data/knowledge-graph.mjs`, pure functions)

- **`knowledgeFrontier(graph, mastered)`** → `{ mastered, frontier, blocked }`. `frontier` = skills
  with every prerequisite mastered but not themselves mastered (ready now); `blocked` lists the
  missing prerequisites per skill. A brand-new learner's frontier is exactly the graph roots.
- **`learningPath(graph, goal, mastered)`** → the topologically-ordered not-yet-mastered
  prerequisites to reach `goal`.
- **`encompassingReviewSet(due, edges)`** → `{ practice, covered }`: the FIRe set. A due simpler
  skill is dropped from `practice` only when a due advanced skill fully encompasses it, and `covered`
  records which one — the saving is always auditable, never silent.

All three are pure and fabrication-free: they compute over the existing prerequisite DAG. The
encompassing **weights** are the one asserted piece, and they are marked `pending-expert` exactly as
MA prescribes ("weights are set by a domain expert").

## Build order toward the few-hundred-skill graph

1. **Expand skill-based, not content-based** — deepen the 10 domains and add the under-covered
   families (midrash / tefillah / halakha; see Migration 001's 6 unmapped) into more atomic skills,
   through the educator audit — never as content nodes (`graph:skills` gate holds the line).
2. **Knowledge points** — *started* (`data/foundation-knowledge-points.json`): a 3-KP introduce →
   practice → transfer scaffold per skill with proposed key prerequisites. Next: deepen into more
   advanced-case KPs where a skill needs them, and confirm the key-prerequisite links, in the audit.
3. **Expert encompassing weights** — replace the default-full weights with domain-expert values along
   direct/key prerequisites; then FIRe review is safe to activate.
4. **Diagnostic as a frontier estimator** — turn placement into a graph-frontier estimate.
5. **Pilot** — difficulty, discrimination, knowledge estimates, and empirical prerequisite validation
   (the only source of these; needs learners).

The order matters: MA's power is not the number of topics but the *interlocking* — prerequisites that
predict readiness, encompassings that make review efficient, a frontier that always gives the learner
exactly the next thing they can learn. JLA now has that machinery on 49 skills; scaling it is an
educator-audited expansion, not "more pages."
