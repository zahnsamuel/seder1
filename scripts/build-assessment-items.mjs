#!/usr/bin/env node
// Materialize the assessment layer of the foundation knowledge graph (docs/foundation-graph-schema.md
// §2.3, layer 3). The 24 authored, server-scored academy items key off the SLICE id space
// (source-family-001 …); Migration 001 (data/graduation-skill-map.json) links them to fnd-* graph
// skills. This promotes each linked item into a first-class assessment-item node attached to its
// GRAPH skill, so the assessment graph is queryable from the ontology.
//
// Client-safe by construction: the node carries stem, choices, type, and sourceFamily, but NEVER the
// answer key — `correct` stays authoritative in data/jla-academy-sessions.json (server-only), and
// each node records `scoredBy` pointing there. This formalizes the items that EXIST; it does not
// reach the >=3-item bank (step 10) — that needs new authored items, not derivation. Nothing is
// invented: stems/choices are the authored items, skill comes from the map, family from the ref.
//
//   node scripts/build-assessment-items.mjs   (npm run graph:items)
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const graph = read('data/foundation-skill-graph.json');
const sessions = read('data/jla-academy-sessions.json');
const gradMap = read('data/graduation-skill-map.json').map;
const skillIds = new Set(graph.skills.map((s) => s.id));

const TANAKH = /^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Isaiah|Jeremiah|Ezekiel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Psalms?|Proverbs|Job|Song of Songs|Ruth|Lamentations|Ecclesiastes|Esther|Daniel|Ezra|Nehemiah|Chronicles)\b/;
// Source family this item draws from (§2.3, for transfer coverage). Deterministic over the refs the
// authored items actually use; returns null for anything unrecognized so the test can catch it.
function sourceFamily(ref) {
  const r = ref || '';
  if (TANAKH.test(r)) return 'tanakh';
  if (/^Mishnah\b/.test(r)) return 'rabbinic';
  if (/^Pirkei Avot\b/.test(r)) return 'thought';
  if (/^(Shulchan Aruch|Mishneh Torah|Tur|Arukh HaShulchan|Rambam)\b/.test(r)) return 'halakhic';
  if (/^Siddur\b/.test(r)) return 'liturgical';
  if (/^[A-Z][a-z]+ \d+[ab]\b/.test(r)) return 'rabbinic'; // Talmud daf, e.g. "Berakhot 2a"
  return null;
}

const items = [];
const perGraphSkill = {};
for (const session of sessions) {
  const entry = gradMap[session.skillId];
  if (!entry?.graphSkill || !skillIds.has(entry.graphSkill)) continue; // unmapped slice item — no graph home yet
  const skill = entry.graphSkill;
  perGraphSkill[skill] = (perGraphSkill[skill] || 0) + 1;
  items.push({
    id: `item-${skill}-${perGraphSkill[skill]}`,
    skill,
    sliceItem: session.skillId,
    type: 'recognition', // every authored academy item is single-source multiple-choice recognition
    sourceFamily: sourceFamily(session.sourceWindow?.sourceRef),
    sourceRef: session.sourceWindow?.sourceRef || null,
    stem: session.prompt,
    choices: (session.choices || []).map((c) => ({ id: c.id, text: c.text })), // no `correct` — server-held
    misconceptions: [], // named misconceptions come from the educator audit (§4)
    difficulty: null,    // calibrated from pilot response data
    discrimination: null,
    confidence: entry.confidence, // Migration 001 pairing confidence (clear | approximate)
    scoredBy: { file: 'data/jla-academy-sessions.json', skillId: session.skillId } // where `correct` lives
  });
}

const bankSizes = Object.values(perGraphSkill);
const output = {
  generatedBy: 'scripts/build-assessment-items.mjs',
  graphVersion: graph.version,
  note: 'Assessment-item layer (docs/foundation-graph-schema.md §2.3): the authored academy items, '
    + 'promoted to first-class nodes attached to their fnd-* graph skill via Migration 001. Client-safe '
    + '— `correct` is never included; it stays in data/jla-academy-sessions.json (server-only) and each '
    + 'node records `scoredBy`. Formalizes what exists; does NOT reach the >=3-item bank (step 10) — '
    + 'that needs new authored items. misconceptions/difficulty/discrimination await the audit and pilot.',
  coverage: {
    items: items.length,
    graphSkillsWithItem: Object.keys(perGraphSkill).length,
    graphSkillsWithItemBank: bankSizes.filter((n) => n >= 3).length,
    maxBankSize: bankSizes.length ? Math.max(...bankSizes) : 0
  },
  perGraphSkill,
  items
};

writeFileSync(new URL('../data/foundation-assessment-items.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${items.length} assessment-item nodes across ${Object.keys(perGraphSkill).length} graph skills to data/foundation-assessment-items.json`);
console.log(`  item banks (>=3 items): ${output.coverage.graphSkillsWithItemBank}/${graph.skills.length} (max bank ${output.coverage.maxBankSize}) — banks need new authored items, not derivation`);
console.log('  no answer key shipped — `correct` stays in data/jla-academy-sessions.json (server-only)');
