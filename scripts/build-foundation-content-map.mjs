#!/usr/bin/env node
// Generates data/foundation-content-map.json: an index from each foundational (fnd-) skill to
// the real content units/steps that exercise it, and the reverse (unit -> fnd skills). This is
// the "tag content to the graph" layer — it lets the daily loop and academy sessions answer
// "to practice fnd-X, here is real source content," instead of only a synthetic graph session.
//
//   node scripts/build-foundation-content-map.mjs     # rewrites data/foundation-content-map.json
//
// Design mirrors build-skill-graph.mjs: content already encodes the fine-grained move in each
// step's `competency` and `mode`, so we DERIVE the fnd tag with one transparent, ordered rubric
// rather than hand-tagging 840 steps. The mapping is intentionally a v1 — the coverage report
// (and test/foundation-content-map.test.mjs) surface which fnd skills still lack real content so
// the rubric and the content can be tuned. Regenerate whenever content or the rubric changes.
import { writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadUnits } from './audit-content.mjs';

const loadGraph = () => JSON.parse(readFileSync('data/foundation-skill-graph.json', 'utf8'));

// unit-id -> canon genre (finer than build-skill-graph's track, to report canon breadth honestly).
export function genreOf(id) {
  if (/^lab:|-arc$|^berakhot|^aggadata|^shas-literacy|^gemara-|^daf-|^sugya|^cross-tractate/.test(id)) return 'gemara';
  if (/^halakha-/.test(id)) return 'halakha';
  if (/^(chumash|tanakh)-/.test(id)) return 'torah';
  if (/^tefillah-/.test(id)) return 'tefillah';
  if (/^mussar-/.test(id)) return 'mussar';
  if (/^chassidus-/.test(id)) return 'chassidus';
  if (/^(history|widerworld)-/.test(id)) return 'history';
  return 'thought'; // course:, philosophy, thought, canon, and other conceptual units
}

const routeOf = (unit) =>
  unit.kind === 'lab' ? `lab.html?tractate=${unit.id.replace(/^lab:/, '')}`
  : unit.kind === 'course' ? `canon-course.html?course=${unit.id.replace(/^course:/, '')}`
  : `${unit.id}.html`;

const labelOf = (id) => id.replace(/^(lab|course):/, '').replace(/-(arc|deep)$/, '')
  .split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

// Ordered rubric: first matching rule wins. Each step exercises exactly one primary fnd skill.
// Keyed off the stable `competency` (recognition|argument|sourceReasoning|translation) and the
// descriptive `mode`, plus the typed/independent flags and the unit's genre. Ordered specific ->
// general so a distinctive mode claims its precise skill before a competency default catches the
// rest. Skills with no matching content stay uncovered on purpose (real signal for authoring).
export function tagFor(step, genre) {
  const m = (step.mode || '').toUpperCase();
  const has = (re) => re.test(m);

  // L1/L2 — dedicated 0->1 orientation & signal moves. These bedrock micro-skills are the
  // PRIMARY move only in purpose-built foundation units (foundation-reading-orientation), never
  // in the source-reading arcs, where they are folded into larger argument/reading moves. Their
  // modes are distinctive tokens no arc uses, and they sit first so the general rules below don't
  // capture them (e.g. \bQUESTION\b -> arg-objection, \bBOUNDARY\b -> resp-name-limits).
  if (has(/PAGE GEOGRAPHY/)) return 'fnd-orient-page-geography';
  if (has(/UNIT BOUNDARY/)) return 'fnd-orient-unit-boundary';
  if (has(/ASK OR TELL/)) return 'fnd-orient-question-present';
  if (has(/SPEAKER MAP/)) return 'fnd-orient-speaker';
  if (has(/QUESTION WORDS/)) return 'fnd-signal-question-words';
  if (has(/CONNECTOR SIGNAL/)) return 'fnd-signal-connectors';
  if (has(/QUOTATION SIGNAL/)) return 'fnd-signal-quotation';
  if (has(/NAME FORMULA/)) return 'fnd-signal-name-formulas';

  // L3-L10 — the independent learner's own moves. Like the orientation micro-skills above, these
  // are the PRIMARY move only in a purpose-built unit (foundation-independent-reading), never in
  // the source-reading arcs, where they are means to an argument rather than the object of study.
  // Distinctive modes, placed first so the general rules below don't capture them (e.g.
  // \bQUESTION\b -> arg-objection would otherwise swallow "ASK A QUESTION").
  if (has(/TRANSLATION CHOICE/)) return 'fnd-role-translation-gap';
  if (has(/\bRESTATE\b/)) return 'fnd-case-restate';
  if (has(/STEELMAN|STRONGEST FORM/)) return 'fnd-compare-strongest-form';
  if (has(/WHEN TO ASK/)) return 'fnd-resp-when-to-ask';
  if (has(/PREDICT THEN CHECK/)) return 'fnd-indep-use-translation-to-check';
  if (has(/ASK A QUESTION/)) return 'fnd-agency-ask-question';
  if (has(/USE A TOOL|SOURCE TOOL/)) return 'fnd-agency-use-tools';
  if (has(/CHOOSE NEXT|NEXT MOVE/)) return 'fnd-agency-choose-next';

  // L8 — practice & responsibility
  if (has(/PRESERVE|ELU|\bTENSION\b/)) return 'fnd-resp-preserve-disagreement';
  if (has(/AGENCY LIMIT|REPRESENTATION LIMIT|TESTIMONY LIMIT|\bLIMITS\b|LIMITING PRINCIPLE/)) return 'fnd-resp-name-limits';
  if (has(/RESPONSIBLE|STUDY BOUNDARY|\bBOUNDARY\b|PRACTICE AND SOURCE/)) return 'fnd-resp-learning-vs-ruling';

  // L10 — learning agency
  if (has(/REFLECTION/)) return 'fnd-agency-record-uncertainty';

  // L9 — independent reading / transfer
  if (has(/TRANSFER|CROSS-TRACTATE/)) return 'fnd-indep-carry-across-genre';
  if (step.independent || has(/INDEPENDENT|UNFAMILIAR/)) return 'fnd-indep-map-lines';
  if (has(/SHAS LITERACY/)) return 'fnd-indep-first-pass';

  // L2 — text signals / translation recall
  if (step.typed || step.competency === 'translation' || has(/TRANSLATION ANCHOR|KEY WORD|GRAMMAR|SENTENCE MAP|SOURCE LANGUAGE|AMBIGUOUS WORD|\bCONNECTOR\b|\bLANGUAGE\b|SOURCE SIGNAL/)) return 'fnd-signal-known-words';

  // L6 — comparison
  if (has(/MACHLOKET|DISPUTE|REASONING DISPUTE|COMPARE REASONS/)) return 'fnd-compare-divergence';
  if (has(/COMPARISON|COMPARATIVE|COMPARING ACCOUNTS/)) return 'fnd-compare-shared-question';
  if (has(/DISTINCTION|CONTRAST/)) return 'fnd-compare-scope';

  // L7 — context
  if (has(/COMMUNITY|INSTITUTION|COMMUNAL|AUDIENCE/)) return 'fnd-context-who-audience';
  if (has(/EVIDENCE KIND|HISTORICAL JUDGMENT|EVENT AND MEMORY|EVIDENCE ORIENTATION|EVIDENTIARY/)) return 'fnd-context-evidence-kind';
  if (has(/RECEPTION/)) return 'fnd-context-genre-expectations';
  if (genre === 'history' || has(/CONTEXT|HISTOR|\bDATE\b|PLACE AND TIME|\bDOMAIN\b/)) return 'fnd-context-when-where';

  // L4 — case mapping
  if (has(/ROLE MAP|ROLE DISTINCTION|WITNESS DISTINCTION|AUTHORITY MAP|CONSENT AND AGENCY/)) return 'fnd-case-actors';
  if (has(/VALIDITY CONDITION|CONDITION MAP|\bEXCEPTION\b|LIMITING DETAIL|RULE AND EXCEPTION|CATEGORY LIMIT|STATUS EFFECT/)) return 'fnd-case-what-changes';
  if (has(/CASE MAP|CASE REASONING|REASONING MAP|CLAIM MAP|DISPUTE MAP|\bSITUATION\b/)) return 'fnd-case-uncertainty';
  if (has(/\bCASE\b|FACT PATTERN|CATEGORY|PROCEDURE|DELIVERY|OBLIGATION|EXEMPTION/)) return 'fnd-case-what-happens';

  // L5 — argument tracking
  if (has(/UNRESOLVED/)) return 'fnd-arg-unresolved';
  if (has(/PROOF|EVIDENCE|SOURCE LAYER|CITED|DERIVATION|SOURCE CHAIN|SECOND SOURCE/)) return 'fnd-arg-evidence-role';
  if (has(/CHALLENGE|PRESSURE|\bQUESTION\b|GEMARA PRESSURE/)) return 'fnd-arg-objection';
  if (has(/\bCLAIM\b|PROPOSAL|POSITION|FIRST PRINCIPLE|CONCLUSION/)) return 'fnd-arg-claim';
  if (step.competency === 'argument' || has(/ARGUMENT|REASON|GEMARA MOVE|GEMARA REASONING|\bRESPONSE\b|\bANSWER\b/)) return 'fnd-arg-response';

  // L3 — source roles
  if (has(/PRIMARY SOURCE|TORAH SOURCE|CITED SOURCE|SOURCE LAYER/)) return 'fnd-role-text-vs-commentary';
  if (has(/EXPLANATION|INTERPRETATION|CLARIFICATION|FUNCTIONAL ANSWER|SOURCE FUNCTION/)) return 'fnd-role-question-vs-answer';
  if (has(/DEFINITION|\bCONCEPT\b|\bDEEPEN\b|METAPHOR|LITERARY SHAPE|POETIC/)) return 'fnd-role-example';
  if (step.competency === 'sourceReasoning' || has(/\bRULE\b|LEGAL|FUNCTION|DEFAULT|CLOSE READING|SOURCE READING|VALIDITY/)) return 'fnd-role-ruling-vs-discussion';

  // L1 — orientation
  if (has(/QUESTION SIGNAL|TIMING QUESTION|PLACEMENT QUESTION|SOURCE QUESTION/)) return 'fnd-orient-question-present';
  if (has(/SPEAKER|ATTRIBUTION|\bWHO\b/)) return 'fnd-orient-speaker';
  return 'fnd-orient-source-type'; // recognition default
}

// Build the map object from the current content + graph. Pure (no side effects) so tests can
// recompute it and compare against the committed data/foundation-content-map.json.
export function buildMap(root = '.') {
  const graph = loadGraph();
  const graphIds = new Set(graph.skills.map((s) => s.id));
  const bySkill = {};
  const byUnit = {};
  for (const unit of loadUnits(root)) {
    const genre = genreOf(unit.id);
    const route = routeOf(unit);
    const label = labelOf(unit.id);
    const skills = new Set();
    for (const step of unit.steps) {
      if (!step.skill) continue;
      const fnd = tagFor(step, genre);
      if (!graphIds.has(fnd)) throw new Error(`rubric produced unknown fnd id: ${fnd}`);
      skills.add(fnd);
      (bySkill[fnd] ||= []).push({ unit: unit.id, label, route, genre, ref: step.ref || unit.id, contentSkill: step.skill });
    }
    byUnit[unit.id] = { label, route, genre, foundationSkills: [...skills] };
  }
  return { generatedBy: 'scripts/build-foundation-content-map.mjs', graphVersion: graph.version, bySkill, byUnit };
}

export const serialize = (map) => JSON.stringify(map, null, 0) + '\n';

// When run directly: rewrite the JSON and print a coverage report.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const graph = loadGraph();
  const map = buildMap('.');
  writeFileSync('data/foundation-content-map.json', serialize(map));
  const uncovered = graph.skills.filter((s) => !map.bySkill[s.id]);
  console.log(`foundation-content-map.json written: ${Object.keys(map.byUnit).length} units, ${graph.skills.length - uncovered.length}/${graph.skills.length} fnd skills have content.`);
  console.log('\nContent occurrences per fnd skill (with distinct genres):');
  for (const s of graph.skills) {
    const rows = map.bySkill[s.id] || [];
    const genres = new Set(rows.map((r) => r.genre));
    console.log(`  L${s.layer} ${s.id.padEnd(34)} ${String(rows.length).padStart(3)} units  ${[...genres].join(',') || '—'}`);
  }
  if (uncovered.length) console.log(`\nfnd skills with NO real content yet (${uncovered.length}): ${uncovered.map((s) => s.id).join(', ')}`);
}
