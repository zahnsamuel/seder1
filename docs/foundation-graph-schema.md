# Foundation graph schema & governance (v0.1)

The foundation skill graph is a **version 0.1 prototype**: a credible, structurally sound skill
ontology (49 skills, 74 prerequisite edges, 10 layers, all with teaching/transfer/repair language),
but not yet a Math-Academy-style adaptive learning engine. This document freezes it, defines the
formal schema it must grow into, and sets the governance for getting there. It is the reference for
steps 1–4 and 12 of the "what should happen next" plan.

Run `node scripts/graph-quality.mjs` for the live readiness report against everything below.

## 0. Freeze (step 1)

**The 49-node ontology is frozen for educator audit.** Until the audit (step 5) completes:

- Do **not** add, remove, split, or re-scope skills, and do **not** casually expand toward 150/300.
  The failure mode we are avoiding is "more pages." Expansion happens *after* the audit and only
  through the process in §7.
- Structural fixes that the audit surfaces (a missing prerequisite step, a too-large jump) are the
  intended output of the freeze, not violations of it — they are applied as reviewed edits, not
  casual authoring.
- The runtime, tooling, schema, and assessment scaffolding below may be built during the freeze;
  they do not change the ontology.

## 1. The five layers

An adaptive graph needs five layers. We have layer 1 in prototype, partial 2–3, elementary 4–5.

| Layer | Question | Artifact today | Status |
|---|---|---|---|
| 1 · Skill ontology | What can be learned? | `data/foundation-skill-graph.json` (49 skills) | Prototype |
| 2 · Content graph | Where can it be taught? | `data/foundation-content-map.json` (119 mappings) | Partial |
| 3 · Assessment graph | What demonstrates it? | one `check` string/skill; 24 academy items on a *separate* id space | Early |
| 4 · Learner model | What is likely known now? | running mastery score in the repository | Elementary |
| 5 · Sequencing policy | What happens next? | rule-based recommendation logic | Elementary |

## 2. Four node classes (step 3)

The current graph conflates these into one JSON object per skill. The schema separates them so
assessment items, content, and learner evidence are first-class and independently versioned.

### 2.1 Skill (the ontology)
```
id            fnd-<layer-slug>-<move>        stable, kebab-case
layer         integer                         developmental layer (1–10)
title         string                          learner-facing "you can …" move
statement     string                          precise capability description
capabilityStates  see §5                      emerging | secure | transferable | durable
durability    foundation | core | transfer    review-schedule tier
```
(Present today. `graduationThreshold` is retained as the state required to count toward graduation.)

### 2.2 Content context (layer 2) — *promote out of the skill node*
```
id            content-<unit>-<n>
skill         skill id it exercises
ref           source reference (e.g., "Mishnah Berakhot 1:1")
genre         one of graph.genres
family        derived source family (tanakh | rabbinic | halakhic | liturgical | thought | historical)
```
Today these are inline `sourceContexts` on the skill; the content map is the reverse index.
**Requirement (step 8):** every foundational skill has **≥3 contexts spanning ≥2 families**.
Current: only 6/49 have ≥3 contexts (45/49 already span ≥2 families).

### 2.3 Assessment item (layer 3) — *new node class*
```
id            item-<skill>-<n>
skill         skill id
type          recognition | production | transfer   (transfer = unfamiliar source/genre)
sourceFamily  the family this item draws from       (for §9 transfer coverage)
stem          the prompt
choices[]     { id, text }                           (production/transfer may be typed)
correct       choice id                              (server-held; never shipped to the client)
misconceptions[]  misconception ids a wrong answer signals
difficulty    null until calibrated from pilot data
discrimination null until calibrated
```
**Requirements:** an **item bank of ≥3 items** per foundational skill (step 10), and **every
graduation-critical skill has ≥1 `transfer` item drawing from an unfamiliar family** (step 9).
Current: 0/49 skills have an item bank; each has exactly one canonical `check` string. The 24
authored, server-scored academy items exist but key off the *slice* id space (`source-family-001`),
not the `fnd-*` graph — so **0 graph skills have a scorable item today**. Unifying these id spaces
is a named migration (§6).

### 2.4 Learner artifact (layer 4) — *lives in the learner record, never the graph*
```
skillId, status (capability state), evidence[] (per-context), earnedAt, nextReview,
knowledgeEstimate  (probability, null until a real learner model exists)
```
This is `capabilityEvidence` + `mastery` in `data/repository.mjs`. It must migrate safely when the
graph changes (§6).

## 3. Typed edges (step 4)

Today every edge is a bare prerequisite id with **no type and no rationale** (0/74 typed). The
schema requires a typed, rationalized edge:
```
{ from: skillId, to: skillId, type: EDGE_TYPE, rationale: "why an educator asserts this" }
```
Edge types:

| type | meaning |
|---|---|
| `prerequisite` | `to` cannot be learned before `from` is at least *secure* |
| `supports` | `from` helps but is not strictly required (soft edge) |
| `transfers-to` | the same move, exercised in a new family |
| `misconception-of` | a named wrong model that blocks `to` |
| `repaired-by` | remediation path for a misconception |
| `assessed-by` | skill → assessment item |
| `taught-by` | skill → content context |

**Every prerequisite/supports edge needs an educator-written rationale** (the audit, step 5). We do
not fabricate these — a rationale asserts a real pedagogical claim, and unbacked claims are the
thing the pilot is meant to test (§empirical validation).

## 4. Misconception & repair (layer 3)

Today each skill has a single `repair` string (49/49) but **no named misconception model** (0/49).
The schema:
```
misconception { id, skill, description, signal (what a learner does), repair (targeted move) }
```
A wrong answer on an assessment item references the misconception(s) it signals, so repair is
targeted rather than generic.

## 5. Capability states (step 11)

The graph already defines the states in `masteryScale`; the **learner UI does not use them** — it
shows mastery %, XP, and levels, which contradicts the 0→1 framing. Canonical states:

| state | meaning |
|---|---|
| emerging | can make the move with support |
| secure | can make the move unaided in two familiar genres |
| transferable | can make the move in an unfamiliar source/genre |
| durable | still transferable after spaced review |

Step 11 is to replace "% / XP / level" language across the learner UI with these states. (`durable`
is a new fourth state layering spaced-review survival on top of `transfer`.)

## 6. Governance: versioning & learner-record migration

The graph is a living artifact; learner records reference it. Rules:

- **Semantic versions.** `MAJOR` = skills added/removed/re-scoped or edges changed (needs a
  migration); `MINOR` = content/assessment/rationale added; `PATCH` = copy fixes.
- **Named migrations.** Any `MAJOR` ships a migration mapping old skill ids → new, so existing
  `capabilityEvidence` is preserved or remapped, never silently dropped. The first named migration
  is **unify the `fnd-*` graph ids and the `source-family-001` slice ids into one space** so authored
  items and the ontology line up.
- **Freeze gate.** No `MAJOR` during a freeze except reviewed audit output.
- **Quality gate.** `scripts/check-foundation-graph.mjs` (structural) must stay green;
  `scripts/graph-quality.mjs` (this readiness report) is tracked over time, not required to pass.

## 7. The sequence out of v0.1

1. **Freeze** (this doc). ✅
2. **Formalize schema** (this doc). ✅
3. **Node classes** defined (§2). ✅
4. **Typed edges** schema defined (§3); rationales authored during the audit.
5. **Educator audit** — 3–5 educators from different non-Haredi settings review the 49 skills and
   write edge rationales. *Needs people; cannot be done in software.*
6. **Missing-step repair** — split nodes where the audit finds too-large jumps.
7. **Expand to ~150** (not 300) and re-validate at that size.
8. **Content coverage** — ≥3 contexts / ≥2 families per skill (currently 6/49).
9. **Transfer items** for every graduation-critical skill.
10. **Item bank** — ≥3 items/skill, on the unified id space.
11. **Capability-state UI** — retire %/XP/level language.
12. **Graph-quality gates** — `scripts/graph-quality.mjs` (this is step 12). ✅
13. **Explainable recommendations** — surface "you see this because you have A, need B, B unlocks C."
14. **Six-week pilot** — the only source of difficulty, discrimination, knowledge estimates, decay,
    and empirical edge validation. *Needs learners.*
15. **Calibrate, then expand** toward several hundred skills and a K–12 simulation.

The honest conclusion is unchanged from the reframing that prompted this doc: the concept of a
skills-first Jewish learning graph is proven; its completeness, structural correctness, adaptivity,
and effectiveness are **not**. The next milestone is an educator-reviewed, assessment-backed,
empirically-revised graph — not more pages.
