# Skill graph north star

Product law for the Jewish Learning Academy skill graph. This is the product brain,
not a content catalog and not a reading of someone else’s book.

Learner-facing chrome follows [`docs/ui-principles.md`](ui-principles.md). Authoring
and schema follow [`docs/foundation-skill-graph.md`](foundation-skill-graph.md) and
[`docs/foundation-graph-schema.md`](foundation-graph-schema.md). Status numbers live
in [`docs/state-of-the-graph.md`](state-of-the-graph.md) and `npm run graph:quality`.
This file decides **what the graph is for**.

## The product this graph serves

Jewish Learning Academy takes an adult from Jewish-learning insecurity to **0→1
literacy**: roughly the comfort of a day-school high-school graduate who can open
a Jewish source, see what kind of text it is, follow its basic moves, ask a good
question, and keep going.

The emotional win is **love of Jewish learning** — ease in non-Haredi Jewish space,
not a trophy for finishing a catalog.

The daily surface stays Duolingo-simple: one next move, a short sitting, a reason
to come back tomorrow. The graph is allowed to be dense. The screen is not.

## What a skill is

A **skill** is a transferable *reading capability* — a move the learner can perform
on a source they have not already memorized.

Examples that belong:

- Recognize the Hebrew letters and their sounds.
- Separate a question from a statement.
- Mark an objection and say what pressure it puts on a claim.
- Keep study distinct from personal ruling.

A skill has a stable `fnd-` id, plain-language title, prerequisites, a teaching
move, a check, a transfer in a new source or genre, and a repair path. It is
teachable in more than one genre. If it can only ever be taught from one page, it
is not a skill — it is a lesson.

## What a skill is not

| Not this | Why it fails |
|---|---|
| A **text** (Berakhot 2a, the Shema, a responsum) | Sources are laboratories. The same skill should travel. |
| A **concept** or topic (“the Oven of Aknai”, “free will”) | Concepts are things sources talk about. Skills are things learners *do*. |
| A **course, tractate, or session** | Those are vehicles. Completing a page is not evidence. |
| A **content-step id** (`gittin-source-check`, `mussar-truth-3`) | Those bind a move to one authored unit. Useful as a content index; not the DAG. |
| A **Yochai corpus node** | That graph answers “where is this in the library?” Ours answers “what can you do now?” |

The `graph:skills` gate already fails the build if a foundation node is named after
a source. Keep that line.

## Scope: 0→1, not Shas, not a few thousand topics

The first academy is a **foundational** graph: a few hundred interlocking literacy
skills, not thousands of topics and not the Bavli as a completionist map.

- **In:** Hebrew decoding, orientation, text signals, source roles, case mapping,
  argument tracking, comparison, context, responsibility, a first independent pass,
  and the agency to choose a next move.
- **Out of the first graph:** absolute Gemara mastery, every midrashic figure,
  every halakhic detail, every historical episode, every Yochai concept.
- **Gemara’s job:** a powerful laboratory for question, case, evidence, dispute,
  and transfer. It must not crowd out the rest of the canon or define graduation.

Graduation means the learner has demonstrated the baseline set **across several
source families, including at least one unfamiliar source**. It does not mean they
have finished the Shas.

Grow the graph from observed bottlenecks (a coarse skill the daily loop cannot
teach precisely), not from a desire to catalog Judaism.

## Placement, then the frontier

Placement diagnoses **capabilities**, not identity, denomination, or worthiness.

It estimates the **frontier**: skills whose prerequisites are already secure and
which are not themselves secure. Demonstrating a mid-layer skill may seed the
prerequisite chain beneath it. The learner starts at the first useful move they
cannot yet do, not at lesson one of a fixed syllabus and not at a subject picker.

After placement, the engine has four honest jobs:

1. **Recover** a lapsed rhythm with one small retrieval.
2. **Review** a skill whose evidence has faded.
3. **Repair** a snag by strengthening the prerequisite it leans on.
4. **Teach** the next frontier skill.

If a recommendation is not one of those four, it is leftover curriculum routing
and should not own Today.

## One next skill

The learner sees **one skill, one source, one move, one check**. The graph holds
the rest.

Today is the recommendation surface. Academy and path pages are progress
references. The shell must not invent a second “next step.” The learner should
never have to understand the curriculum map in order to begin.

The public next-action contract should **cite the skill id** it is teaching,
reviewing, or repairing (`fnd-…`). A title and a URL without a skill are a page
recommendation, not a skill recommendation.

## Evidence, not streaks-as-truth

Capability states (from the graph’s own scale):

| State | Meaning |
|---|---|
| **emerging** | Can make the move with support. |
| **secure** | Can make it unaided in two familiar genres. |
| **transferable** | Can make it in an unfamiliar source or genre. |
| **durable** | Still transferable after spaced time away. |

A running 0–1 score, XP, or a single multiple-choice hit is **instrumentation**,
not the product language. Advance on evidence. Retrieve before the skill fades.
Do not treat “opened the page” as mastery.

Sensitive subjects (mourning, family, practical halakha) keep a
responsible-learning boundary. Literacy is not pesak.

## Relationship to Yochai

Yochai’s knowledge graph is a **source substrate** — a way to find, cluster, and
sheet real texts. It is optional infrastructure behind a skill.

It is **not** the skill DAG. Do not import tens of thousands of concepts as
skills. Do not let source discovery choose the next learner action. A Yochai hit
may supply a passage *for* `fnd-arg-objection`; it must not become a node named
after that passage.

If the two graphs ever share identifiers, the skill id remains `fnd-…` and the
source id remains a citation.

## Which file is the brain

| Artifact | Role | Product status |
|---|---|---|
| `data/foundation-skill-graph.json` | Capability DAG (`fnd-…`) | **The brain.** Placement, frontier, daily teaching, graduation. |
| `data/foundation-skill-edges.json` + knowledge points, items, contexts | Engine layers on that DAG | Keep; do not fork a second ontology. |
| `data/skill-graph.json` | Older 15-node track graph | Legacy. Do not extend. |
| `data/content-skill-graph.mjs` + `non-gemara-skill-graph.mjs` | One node per authored source move (~850) | Content index. May tag `fnd-…`; must not *be* the frontier. |
| `data/jla-foundation-skill-slice.json` | Graduation-slice ids (`source-family-001`) | Translation layer. Do not mint a third taxonomy. |
| Yochai / `search_corpus` | Source finding | Optional substrate. Never the skill graph. |

When these disagree, **the foundation graph wins**. Content is retagged. Slice ids
are mapped. Legacy graphs are not consulted for “what should the learner do now?”

## Next-build checklist

Ordered for the current repo, not a fantasy greenfield. Do these before authoring
another hundred skills.

1. **Point Today at a frontier `fnd-` skill, not back at Today.** Done (PR #13).
   Foundation and frontier actions open `academy-session.html?skill=<fnd-id>`
   (Layer 0 → `hebrew-decoding.html`). `skillId` is on the public next-action
   contract.

2. **Replace the hardcoded 14-skill ladder with `knowledgeFrontier()`.** Done (PR #13).
   Daily routing teaches a frontier skill, retrieves a fading one, or repairs a
   key prerequisite — exclusively on `fnd-` ids.

3. **Stop letting the content-move graph choose the next action.**
   `nextGraphPractice` no longer merges `skill-graph.json` + content + non-Gemara
   nodes (~850 source-bound ids) as Today's fallback. After a `fnd-` id is
   chosen, it looks up `foundation-content-map` and returns “practice this skill
   in a real unit.” Content graphs stay indexes.

4. **Name a teachable starter set and freeze the rest.**
   Live graph: 55 skills, 11 layers. Item banks are 0/55. Pick ~20–30 skills the
   daily loop can actually teach in the next slice (Layer 0 decoding +
   orientation through first argument/responsibility moves). Educator-audit
   those edges. Do not grow toward 150 until the starter set has items,
   retrieval, and a working frontier router.

5. **One placement, one id space.**
   Done: `diagnostic.html` + `/api/graph/diagnostic` + `jla-placement-router.js`
   now leave a capability profile and one `fnd-` start on the same next-action
   path as Today. Graduation-slice ids (`source-family-001`) remain a
   translation layer only — they are not the learner’s “start here” id.

6. **Retrieval checks on the same ids.**
   Done (PR #18). Review, decay, and welcome-back recall cite `fnd-` skills
   and open `academy-session.html?skill=<fnd-id>` (Layer 0 → `hebrew-decoding.html`).
   The check is an authored item when present, else a graph-derived retrieval or
   a mapped real-source step — not a generic Daf prompt and not a vanished
   content-step id.

7. **Close the fat buckets before adding siblings.**
   `fnd-arg-response`, `fnd-role-ruling-vs-discussion`, and
   `fnd-case-what-happens` still swallow most tagged content. Split only where
   the daily loop would route differently, and only with a rubric signal plus
   retagged units (`docs/foundation-graph-growth-plan.md`).

8. **Capability-state language on the learner surfaces that already show
   progress.** Retire leftover % / XP / level copy on path and academy
   references in favor of emerging / secure / transferable / durable. Today
   stays one action, not a scoreboard.

9. **Educator pass on the starter edges, then item banks.**
   Rationales are 0/76; named misconceptions 0/55; authored transfer items 0/55.
   Software cannot invent those. Staged: [`educator-edge-audit.html`](../educator-edge-audit.html)
   lists the 29 starter skills and 38 closed prerequisite edges against
   [`data/foundation-edge-audit.json`](../data/foundation-edge-audit.json) (empty but for
   labeled EXAMPLE stubs). Write ≥1 real transfer item per starter skill before expanding.

10. **Hosted decay timestamps.**
    Done: hosted `learner_state.mastery_updated_at` round-trips as
    `masteryUpdatedAt`. `getHostedLearner` attaches `decayedMastery` so
    review urgency is not demo-only.

Do not start a parallel graph. Do not paste a concept catalog into
`foundation-skill-graph.json`. Do not ship another content unit as if it were a
skill.
