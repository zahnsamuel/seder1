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

**Built:** `data/foundation-content-contexts.json` (`npm run graph:contexts`,
`scripts/build-content-contexts.mjs`) promotes contexts into this first-class node class, merging the
curated inline `sourceContexts` (family-diverse) with the content map (context-rich), deduped by
`ref` with provenance in `sources`. It invents no references. This lifts step-8 coverage from **6/49
→ 41/49** from existing data alone; the remaining **8** skills were then closed to **49/49** by
`data/foundation-context-supplements.json` — a small hand-authored file adding one real,
family-extending source to each (e.g. a Siddur Amidah page for "find the main text and what surrounds
it", Pirkei Avot 1:2 for attribution formulas). These are asserted content claims, tagged `authored`,
subject to the educator audit like any other. `test/foundation-content-contexts.test.mjs` guards that
every context traces to a real source and that the authored ones do real work (add a new family).

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

**Built (layer materialized, banks not yet):** `data/foundation-assessment-items.json`
(`npm run graph:items`, `scripts/build-assessment-items.mjs`) promotes the 18 authored academy items
that Migration 001 links into **first-class assessment-item nodes attached to their `fnd-*` graph
skill** (17 graph skills; one already has a 2-item mini-bank spanning two families). The nodes are
**client-safe by construction — `correct` is never included**; the key stays in
`data/jla-academy-sessions.json` (server-only) and each node records `scoredBy`. `difficulty`/
`discrimination` are `null` (pilot), `misconceptions` `[]` (audit). This formalizes the items that
exist; it does **not** manufacture the ≥3-item bank (step 10) — that needs new authored items, not
derivation, and the report keeps that gap visible (0/49 banks). The 6 unmapped academy items get no
node (no graph home yet — audit/expansion candidates).

### 2.4 Learner artifact (layer 4) — *lives in the learner record, never the graph*
```
skillId, status (capability state), evidence[] (per-context), earnedAt, nextReview,
knowledgeEstimate  (probability, null until a real learner model exists)
```
This is `capabilityEvidence` + `mastery` in `data/repository.mjs`. It must migrate safely when the
graph changes (§6).

## 3. Typed edges (step 4)

The graph JSON still carries adjacency as bare prerequisite id strings (the runtime reads them), but
the **typed-edge layer is now built**: `data/foundation-skill-edges.json`
(`npm run graph:edges`, `scripts/build-skill-edges.mjs`) materializes **74 `prerequisite` + 18
`assessed-by` = 92 typed edges** derived from existing data. It never fabricates: `rationale` is
`null` on every edge (pending the audit — see below), and the judgment edges
(`supports`/`transfers-to`/`misconception-of`/`repaired-by`) are intentionally absent until then.
`taught-by` is not duplicated — it already lives in `data/foundation-content-map.json` (§2.2). A test
(`test/foundation-skill-edges.test.mjs`) guards that the prerequisite edges mirror the graph exactly
(no drift) and that nothing judgment-based was invented during the freeze.

The schema requires a typed, rationalized edge:
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
  `capabilityEvidence` is preserved or remapped, never silently dropped.

**Migration 001 — graduation/academy id space → graph (BUILT, translation layer).**
`data/graduation-skill-map.json` links each of the 24 graduation-slice / academy skills
(`source-family-001` …) to its `fnd-*` graph skill. It is a **translation layer, not a rename**:
slice ids are unchanged, so no learner record is re-keyed — the safe, reversible first step. It
makes graph coverage computable (`npm run graph:quality`) and, honestly, records that the two
taxonomies do **not** map 1:1: **18/24 link to the graph** (12 clear, 6 approximate), **17/49 graph
skills gain a scorable authored item** (up from 0), and **6 graduation skills have no graph home** —
citation-reading, repetition, narrative-vs-command, a midrashic move, a prayer move, and a study
habit. Several of those are the reduce-Gemara-dominance gap: the graph is argument-shaped and
under-covers midrash/tefillah. The pairings are **proposed, not authoritative** — educators confirm
or correct them in the audit, and only after that does a *rename* (re-keying slice ids to `fnd-*`,
with a `capabilityEvidence` remap) become safe.
- **Freeze gate.** No `MAJOR` during a freeze except reviewed audit output.
- **Quality gate.** `scripts/check-foundation-graph.mjs` (structural) must stay green;
  `scripts/graph-quality.mjs` (this readiness report) is tracked over time, not required to pass.

## 7. The sequence out of v0.1

1. **Freeze** (this doc). ✅
2. **Formalize schema** (this doc). ✅
3. **Node classes** defined (§2). ✅
4. **Typed edges** — schema (§3) and the derivable structure **built**
   (`data/foundation-skill-edges.json`: 74 `prerequisite` + 18 `assessed-by`, typed); rationales and
   the judgment edges are authored during the audit. ✅ (structure)
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
    ✅ `data/recommendation-why.mjs`: every recommendation carries a structured `{ because, build,
    unlocks }` with a machine-readable `basis`, graph-grounded where typed edges exist (prerequisite/
    sequence). Rendered on My Path and the front door.
14. **Six-week pilot** — the only source of difficulty, discrimination, knowledge estimates, decay,
    and empirical edge validation. *Needs learners.*
15. **Calibrate, then expand** toward several hundred skills and a K–12 simulation.

The honest conclusion is unchanged from the reframing that prompted this doc: the concept of a
skills-first Jewish learning graph is proven; its completeness, structural correctness, adaptivity,
and effectiveness are **not**. The next milestone is an educator-reviewed, assessment-backed,
empirically-revised graph — not more pages.
