import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildMap, serialize } from '../scripts/build-foundation-content-map.mjs';
import { loadUnits } from '../scripts/audit-content.mjs';

const committed = readFileSync('data/foundation-content-map.json', 'utf8');
const graph = JSON.parse(readFileSync('data/foundation-skill-graph.json', 'utf8'));
const graphIds = new Set(graph.skills.map((s) => s.id));

test('foundation-content-map.json is in sync with content + rubric', () => {
  assert.equal(committed, serialize(buildMap('.')),
    'data/foundation-content-map.json is stale — run: node scripts/build-foundation-content-map.mjs');
});

test('every mapped foundation skill exists in the graph, and every unit is tagged', () => {
  const map = JSON.parse(committed);
  for (const id of Object.keys(map.bySkill)) assert.ok(graphIds.has(id), `bySkill has non-graph id: ${id}`);
  for (const [unit, entry] of Object.entries(map.byUnit)) {
    for (const id of entry.foundationSkills) assert.ok(graphIds.has(id), `${unit} tagged with non-graph id: ${id}`);
  }
  // Every loadable content unit is represented, and a unit is tagged with >=1 fnd skill exactly
  // when it has >=1 assessed (skill-bearing) step.
  const units = loadUnits('.');
  assert.equal(Object.keys(map.byUnit).length, units.length, 'byUnit must cover every content unit');
  for (const unit of units) {
    const hasAssessedStep = unit.steps.some((s) => s.skill);
    const tagged = (map.byUnit[unit.id]?.foundationSkills.length ?? 0) >= 1;
    assert.equal(tagged, hasAssessedStep, `${unit.id}: tagged=${tagged} but hasAssessedStep=${hasAssessedStep}`);
  }
});

// Coverage guardrail: every foundation skill must map to real source content, EXCEPT the
// Layer-0 decoding on-ramp (fnd-decode-*), which is served by the dedicated decoding drill
// (decoding-engine.js / hebrew-decoding.html), not the source-unit corpus. This turns a silent
// authoring gap into a failing signal — if a future rubric or content change drops a non-decode
// skill back to zero units, this fails and names it, the way fnd-role-quotation-bounds and
// fnd-compare-translation-choice were once silently uncovered.
test('every non-decode foundation skill has real mapped content', () => {
  const map = JSON.parse(committed);
  const servedByDecodingDrill = (id) => id.startsWith('fnd-decode-');
  const uncovered = graph.skills
    .filter((s) => !servedByDecodingDrill(s.id))
    .filter((s) => !(map.bySkill[s.id]?.length));
  assert.deepEqual(uncovered.map((s) => s.id), [],
    `these foundation skills have zero content units — author a step whose mode the rubric tags to them:\n  ${uncovered.map((s) => `L${s.layer} ${s.id}`).join('\n  ')}`);
});
