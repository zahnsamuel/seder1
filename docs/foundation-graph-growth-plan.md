# Foundational Skill Graph — growth plan (45 → a few hundred)

Scoping doc for expanding `data/foundation-skill-graph.json` from its first slice (45 skills, one
representative capability per reading move) toward the "few hundred interlocking concepts" the
roadmap calls the linchpin. This is a **plan, not an implementation** — it names the growth axes,
recommends a sequence grounded in real content traffic, and defines the authoring guardrails so the
graph stays valid and every new skill stays *coverable* by real sources.

Read alongside `docs/foundation-skill-graph.md` (the schema + authoring contract) and
`docs/seder-jewish-learning-academy-roadmap.md` (Phase 5: "expand from 60 to a few hundred skills
based on observed bottlenecks").

## Where we are

- **Shape:** a thin *spine* — 10 thematic layers, 4–5 skills each, 70 prerequisite edges, max 3
  prereqs on any skill. Each skill is the single representative move for its slot.
- **Content behind it:** all 45 skills now have real content (45/45 in `foundation-content-map.json`),
  tagged by the generated rubric in `scripts/build-foundation-content-map.mjs`.
- **The daily loop, placement, and academy sessions** already consume `fnd-` skills. Growth flows
  straight into them — a finer graph means a sharper placement profile and a more precise "next
  skill" — **if** each new skill can be tagged to content.

### The coupling that governs everything (read this first)

The graph and the content map are joined at the hip. A `fnd-` skill only becomes *useful* (shows up
in placement, gets "practice in real sources") when the rubric can tag real steps to it. The rubric
derives one primary skill per step from the step's `mode`/`competency`. So:

> **Splitting a skill is only real if content can distinguish the pieces.** Adding `fnd-arg-rebuttal`
> next to `fnd-arg-response` does nothing unless some steps carry a signal (a distinct `mode`) that
> the rubric can key on. Graph growth must travel with either (a) a rubric rule that finds the finer
> signal already present in content, or (b) new/re-moded content that carries it. Otherwise the new
> skill reports 0 units and the coverage gate flags it.

Practically: every graph-growth sprint pairs with a content-map sprint. Budget for both.

## The evidence: where the corpus already concentrates

Content units currently exercising each skill (a proxy for learner traffic and for how *coarse* a
bucket is). A few skills are doing enormous, undifferentiated work:

| Skill | Units | Genres | Reading |
|---|---|---|---|
| `fnd-indep-map-lines` (L9) | 164 | 8 | catch-all for "independent/unfamiliar" steps |
| `fnd-arg-response` (L5) | 90 | 7 | every "answer / gemara move" step lands here |
| `fnd-role-ruling-vs-discussion` (L3) | 78 | 7 | the sourceReasoning default |
| `fnd-case-what-happens` (L4) | 71 | 1 | every "case / fact pattern" step |
| `fnd-signal-known-words` (L2) | 52 | 4 | all translation/known-word steps |
| `fnd-orient-source-type` (L1) | 45 | 3 | the recognition default |
| `fnd-resp-learning-vs-ruling` (L8) | 42 | 7 | all boundary steps |

These fat buckets are the highest-leverage places to grow: each is a coarse label the daily loop
cannot teach precisely, and each already has abundant content to re-tag. The thin/single-genre
skills (many at 1 unit) are the opposite — they are fine already; they need *content breadth*, not
splitting.

## Four growth axes

### Axis A — Thicken the fat buckets (depth within existing layers) ★ recommended first

Split the coarse, high-traffic skills into the finer moves they actually conflate. Every piece stays
a genuine cross-genre capability, reuses the current content model and audit unchanged, and
immediately sharpens placement + daily routing. Highest leverage, lowest integration risk.

Examples (illustrative, not final):
- **L5 `arg-response` → ** `arg-resolve-distinction` (answer by drawing a distinction),
  `arg-reinterpret` (re-read the challenged claim), `arg-concede-and-narrow`, `arg-two-answers`
  (the sugya offers more than one). Gemara-rich but each is demonstrable in Rambam / Guide / a
  halakhic responsum too.
- **L3 `role-ruling-vs-discussion` → ** `role-ruling` vs `role-analysis` vs `role-aside/story`
  (aggadic digression) vs `role-terminology` (a term-of-art definition).
- **L4 `case-what-happens` → ** `case-sequence` (order of events), `case-condition` (the "if"),
  `case-quantity/measure`, `case-status-change`. (Note: this bucket is single-genre today — splitting
  it is also a chance to add non-Gemara case sources and fix that.)
- **L2 `signal-known-words` → ** split by function: `signal-verb-of-saying`, `signal-legal-terms`,
  `signal-measure-words`, `signal-pronoun-reference`.
- **Estimated yield:** ~4–6 fat buckets × 3–4 children ≈ **20–30 new skills**, each with content to
  re-tag. Repeatable across layers.

### Axis B — Pre-Layer-0 Hebrew / alef-bet decoding ladder (the roadmap moat)

A new sub-graph *below* Layer 1 for the true beginner who "reads Hebrew phonetically but lacks
fluency": letter recognition, final forms, look-alike letters, nikud/vowels, syllable blending,
high-frequency function words, shoresh (root) spotting, binyan basics. This is the roadmap's named
post-pilot moat and the truest 0→1 on-ramp.
- **Estimated yield: 30–60 skills** — a whole self-contained ladder.
- **Integration cost is real and different:** decoding is not 3-option source-reasoning. It needs a
  new content/exercise type (letter/vowel drills, audio) that the current `loadUnits`/audit model
  does not describe, and the `genre`/`sourceContexts` rules assume canon text. Treat as its own
  track with its own content model. Best sequenced after Axis A, as a deliberate product bet.

### Axis C — Genre-instance breadth (fix the Gemara skew, honor "carry across genres")

`sourceContexts` today skew hard to Gemara (32 refs) with Halakha/Tefillah/Mussar/Chassidus/History
thin (12/4/2/2/3). This axis does **not** add many new skills; it deepens existing ones by adding
genre-diverse source contexts and content, so every capability is genuinely taught in ≥2–3 genres
(the whole transfer thesis). Where a genre *changes the move* (e.g. reading a piyyut's acrostic vs a
sugya's dialectic), a genuine new sibling skill is justified — but only when it clears the "teachable
in ≥2 genres, not one-page-bound" bar. Mostly a **content + sourceContexts** effort, ~5–15 new skills.

### Axis D — Extend past the current terminal moves

Richer branches at the top of the graph: a synthesis/chavruta layer (articulate a source to another
person, hold a question over days), or deeper L6–L10 moves (compare across *three* sources; build a
personal source map; choose an elective direction). ~10–20 skills. Lower urgency; do once the middle
of the graph is dense.

## Recommended sequence

1. **Axis A, sprint 1** — split the top 3 buckets (`arg-response`, `role-ruling-vs-discussion`,
   `case-what-happens`) into ~10–12 children; add rubric rules keyed on finer modes; re-tag content;
   keep `graph:foundation`, `map:foundation`, and the suite green. This proves the split-plus-retag
   loop end to end and immediately sharpens the densest part of the graph.
2. **Axis A, sprint 2** — `signal-known-words`, `orient-source-type`, `resp-learning-vs-ruling`.
3. **Axis C, woven through** — as each bucket is split, give the new skills genre-diverse
   sourceContexts and (where thin) non-Gemara content; retire single-genre warnings.
4. **Axis B** — the Hebrew ladder, as a scoped product bet with its own content model.
5. **Axis D** — top-of-graph synthesis, last.

This is deliberately "grow where the traffic is" rather than "author a hundred skills up front":
each sprint is a few dozen skills that the content and the daily loop can actually use the next day.

## Concrete first slice (proposed — Axis A sprint 1)

Splitting `fnd-arg-response` (90 units) is the single highest-leverage move. Candidate children (all
L5, prereq `fnd-arg-objection`, each teachable in Gemara **and** Rambam/Guide/responsum):

| new id | move | rubric signal (mode) |
|---|---|---|
| `fnd-arg-resolve-distinction` | answer by distinguishing two cases | `DISTINCTION ANSWER` |
| `fnd-arg-reinterpret` | answer by re-reading the challenged claim | `REINTERPRET` |
| `fnd-arg-two-answers` | recognize the sugya gives multiple answers | `SECOND ANSWER` |
| `fnd-arg-response` (kept) | the general "answers the objection" move | (existing default) |

`fnd-arg-response` stays as the fallback so nothing regresses; the finer skills claim steps whose
mode carries the signal. **Content step needed:** most existing arc "answer" steps use a generic
mode, so this sprint includes a light content-mode pass (or new steps) so the finer skills get real
coverage rather than reporting 0. Repeat the pattern for `role-ruling-vs-discussion` and
`case-what-happens`.

## Authoring guardrails (per skill, non-negotiable)

From `docs/foundation-skill-graph.md`, enforced by `npm run graph:foundation`:
- `fnd-` id, declared `layer`, plain-language `title` + `statement`.
- Prereqs point only to existing `fnd-` skills, **never up a layer**; no cycles; reachable from a root.
- **≥2 `sourceContexts` in different genres** — a single-genre skill is a warning and defeats the point.
- Full teaching contract: `teachingMove`, `checks`, `transfer`, `repair`, `graduationThreshold`,
  `durability`.
- Then the coupling: add the rubric rule in `build-foundation-content-map.mjs`, run **both**
  `graph:build` and `map:foundation`, confirm the new skill shows real units, and keep the drift
  tests + content floor green.

## Open decisions for Sam

1. **Lead axis.** Recommendation: **Axis A (thicken fat buckets)** first — highest leverage, reuses
   the content model, sharpens what already ships. The alternative is leading with **Axis B (Hebrew
   ladder)** if reaching absolute beginners now matters more than sharpening the current reader path.
   These serve different learners; the sequence above assumes A-first.
2. **How aggressively to split.** A light thickening (~120 skills total) vs a deep one (~300+). More
   skills = finer placement but more content-tagging work; each split is only worth it if the daily
   loop would actually route differently.
3. **Exposure weights (from the schema's open list).** Whether to add per-skill genre-exposure
   weights so the engine balances canon breadth from the graph rather than a separate session plan.
   Relevant once Axis C is underway.
4. **Hebrew-ladder content model (blocks Axis B).** Decoding drills need a content type the current
   `loadUnits`/audit does not cover. Deciding that model is a prerequisite to scoping B in detail.

## What I can do next on your word

- Detail-scope any one axis into a named skill list with prereqs + rubric modes + content plan.
- Or implement Axis A sprint 1 (the `arg-response` split above) end to end — graph + rubric + content
  re-tag + regen + tests — as the first concrete increment.
