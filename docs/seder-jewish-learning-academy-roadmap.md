# Jewish Learning Academy · The Jewish Learning Academy

## Product reset

Jewish Learning Academy is an opinionated, skills-based path from Jewish-learning insecurity to Jewish literacy.

The product is not trying to help an already-advanced learner finish the canon. It is designed to help an adult who has never had a clear on-ramp become someone who can open a Jewish source, understand what kind of text it is, follow its basic moves, ask a good question, and continue learning independently.

The core promise:

> Become someone who can learn the Jewish canon.

The emotional promise:

> Open your letter in the scroll.

## What changes

### From content-first to skill-first

Content is the vehicle. Skills are the product. A learner may encounter Gemara, Torah, Halakha, prayer, Jewish thought, Chassidus, Mussar, or history, but each encounter should teach an explicit capability that transfers to another source.

### From “master the whole canon” to “reach a meaningful 0→1”

The first product is a foundational academy, not an infinite completionist curriculum. Learners graduate from the academy with a durable baseline and can continue into specialized study if they want more.

### From Gemara as destination to Gemara as laboratory

Gemara remains a powerful laboratory because it exposes question, case, evidence, dispute, interpretation, and transfer. It should no longer crowd out the wider canon or define success as maximal Gemara mastery.

### From many simultaneous choices to one clear next move

The learner sees one thing at a time: one skill, one source, one action, one reason why it matters. The graph handles complexity behind the scenes; the interface reduces cognitive load.

## Academy learner

The first learner is an adult who:

- wants to feel comfortable in a non-Hareidi Jewish space;
- may read Hebrew phonetically but lacks source fluency;
- feels insecure about not having gone to day school or yeshiva;
- has limited time and wants a reliable 20-minute daily practice;
- wants to learn something meaningful now, not first complete years of prerequisites;
- may later choose a denominational, intellectual, or text-specific direction.

Seder should be welcoming without pretending that Jewish texts are frictionless. It should make the implicit explicit, preserve disagreement, and avoid presenting practical authority where it is teaching literacy.

## Foundational skill graph

The next core artifact is a directed graph of a few hundred interlocking skills. Each skill needs:

- a stable ID and plain-language learner title;
- the prerequisite skills that make it teachable;
- source contexts in which it can be learned;
- a short teaching move;
- one or more guided checks;
- a transfer check in a new source or genre;
- a repair path when the learner is uncertain;
- a graduation threshold and durability review schedule.

### Proposed first graph layers

1. **Orientation** — identify a source, page, section, speaker, and question.
2. **Text signals** — recognize Hebrew words, recurring connectors, quotation marks, and structural cues.
3. **Source roles** — distinguish text, translation, commentary, question, answer, example, and ruling.
4. **Case mapping** — identify who acts, what happens, what is uncertain, and what changes.
5. **Argument tracking** — follow claim, objection, evidence, response, and unresolved tension.
6. **Comparison** — place two sources side by side and name agreement, difference, or scope.
7. **Context** — ask when, where, by whom, and for what community a source was formed.
8. **Practice and responsibility** — distinguish learning a source from receiving personal or practical guidance.
9. **Independent reading** — make a supported first pass through an unfamiliar short source.
10. **Learning agency** — choose a question, use a source tool, record uncertainty, and select a next study move.

These are capabilities, not courses. A single skill can be taught through Berakhot, a Torah verse, a blessing, a halakhic case, a philosophical passage, or a historical document.

## Academy learner loop

Every session should make the following visible:

1. **You are here** — the current skill and why it is next.
2. **One source** — a short, carefully framed encounter.
3. **One move** — the reading action to perform.
4. **One check** — a low-friction demonstration of understanding.
5. **One transfer** — the same skill in a new context when appropriate.
6. **One reflection** — what the learner can now do.
7. **One next step** — the graph-selected continuation.

The system should never require learners to understand the whole curriculum map before beginning. The full graph is for the engine, educators, and progress views; the daily interface remains deliberately narrow.

## Placement and graduation

### Placement Exam

Placement should diagnose foundational capabilities, not Jewish identity, denomination, or worthiness. It should sample:

- source orientation;
- Hebrew recognition;
- translation comparison;
- case and argument tracking;
- source comparison;
- context and responsibility boundaries;
- independent next-move selection.

The output should be a readable capability profile: “Here is what you can already do; here is the first skill that will unlock the most.”

### Academy graduation

Graduation means the learner has demonstrated the baseline skill set across multiple source forms, including at least one unfamiliar source. It does not mean the learner has completed the Shas or mastered every Jewish subject.

Graduation should produce:

- a durable capability profile;
- a portfolio of source maps and transfer evidence;
- a clear set of next academies or electives;
- language that celebrates agency rather than ranking learners.

## Daily rhythm

The default rhythm should be 20 minutes, with flexible shorter and longer variants:

- **3 minutes — retrieve:** bring back one prior move;
- **10 minutes — encounter:** study one source with scaffolding;
- **5 minutes — demonstrate:** make one guided reading decision;
- **2 minutes — orient:** see what changed and what comes next.

The product can offer a 5-minute minimum and a 30-minute deepening mode, but the academy promise should be simple: small pieces every day compound into confidence.

## Canon architecture

The learner should encounter a deliberate mix of sources rather than a Gemara-only funnel. The first academy should define a target exposure distribution and report it transparently, for example:

- Gemara as the argument laboratory;
- Torah as text, story, law, and address;
- Halakha as source chains, categories, and responsibility;
- Tefillah as form, attention, and communal language;
- Jewish Thought and Chassidus as claims, tensions, and interpretation;
- History and the wider world as context, evidence, memory, and encounter.

The exact percentages should be tested with learners. The principle is fixed: breadth is not a collection of side courses; it is repeated transfer of shared reading skills across genres.

## Roadmap

> **Build status (2026-07-20).** The foundational skill graph now exists as a real artifact:
> `data/foundation-skill-graph.json` — 45 capability-first skills across all 10 layers, each with
> ≥2 cross-genre source contexts and a full teaching contract (move, check, transfer, repair,
> graduation threshold, durability). Skill IDs are namespaced `fnd-` and kept separate from
> content IDs (Phase 0). Integrity + coverage checker: `npm run graph:foundation`
> (`scripts/check-foundation-graph.mjs`), now also a gate in `npm run preflight`. Authoring
> contract for Claude/Codex: `docs/foundation-skill-graph.md`. Graduation contract is encoded in
> the JSON (demonstrate the required skills across ≥3 genres incl. ≥1 unseen source). This is the
> first slice of Phase 1; remaining Phase 1/2/3 work below.

### Phase 0 — Reframe and measure (now)

- Rename learner-facing language to **Seder · The Jewish Learning Academy**.
- Freeze the academy’s foundational skill vocabulary and definitions.
- Separate skill IDs from content IDs in the data model.
- Establish the 0→1 graduation contract.
- Add a graph coverage report: skills, prerequisites, source contexts, checks, and transfers.
- Conduct five structured interviews with learners who feel Jewish-learning insecurity.

### Phase 1 — Build the first graph slice

- Implement 40–60 foundational skills across the first ten graph layers.
- Give every skill at least two source contexts and one repair path.
- Build a graph editor/import format that Claude and Codex can maintain safely.
- Keep current curriculum content, but tag it to skills rather than treating each unit as a destination.
- Add graph integrity checks for duplicate IDs, cycles, unreachable skills, and missing assessments.

### Phase 2 — Rebuild placement around skills

- Replace broad subject placement with capability sampling.
- Make the profile explain strengths, gaps, and first recommendation in plain language.
- Test whether placement predictions match human educator judgments.
- Ensure the first session begins immediately after placement.

### Phase 3 — Ship the Academy core

- Present one skill/source/action at a time.
- Set the default daily rhythm to 20 minutes.
- Add “You are here,” “Why this matters,” and “You can now…” language to every session.
- Interleave sources across the canon according to the tested exposure plan.
- Add a visible graduation track without exposing the entire graph at once.

### Phase 4 — Human feedback loop

- Run a 5–10 learner formative cohort before broad pilot release.
- Observe where learners hesitate, misread, or lose confidence.
- Review every wrong answer as product evidence, not only learner error.
- Have educators review the skill definitions, placement interpretations, and graduation threshold.
- Measure time-to-first-success, return rate, repair success, unseen-source transfer, and learner confidence.

### Phase 5 — Hosted pilot and expansion

- Complete Supabase account isolation and cross-device persistence.
- Invite a small cohort only after hosted preflight is green.
- Add educator/mentor review tools without making the product dependent on a live teacher.
- Expand the graph from 60 to a few hundred skills based on observed bottlenecks.
- Add elective academies for learners who graduate and want deeper Gemara, Halakha, prayer, thought, history, or other paths.

## Technology direction

The graph should remain portable. Evaluate open-source graph software for visualization and authoring, but keep Seder’s canonical skill data in a versioned, testable format first. A graph database can be added when query complexity justifies it; adopting infrastructure before the skill model is stable would make iteration slower.

The Math Academy materials should inform the learning-engine design—prerequisites, spacing, mastery estimates, and scheduling—but should not be copied mechanically. Jewish learning has genre, interpretation, community, and responsibility boundaries that require human judgment.

## Success metrics

### Learner outcomes

- time from landing to first successful source move;
- placement-to-first-session completion;
- percentage returning on days 2, 7, and 30;
- foundational skill evidence across at least three source forms;
- unseen-source transfer success;
- repair success after uncertainty;
- self-reported confidence and belonging in Jewish learning.

### Product quality

- graph reachability and prerequisite integrity;
- source citation and translation review;
- balance of canon exposure;
- accessibility and mobile completion;
- percentage of sessions with one clear next action;
- human educator agreement with placement and graduation decisions.

### Business and pilot readiness

- hosted account isolation;
- cross-device persistence;
- privacy and trust review;
- learner cohort retention;
- willingness to recommend or continue into a next academy.

## Decision principles

- Make the first learner feel capable without making the learning shallow.
- Teach skills explicitly, then let content make them meaningful.
- Prefer one excellent next move to a crowded dashboard.
- Do not make perfect content coverage a prerequisite for useful learning.
- Use Gemara as a laboratory, not as the definition of Jewish literacy.
- Keep the academy welcoming across non-Hareidi Jewish spaces.
- Let human feedback change the graph.
- Build for durable independence, not maximum time in the product.
