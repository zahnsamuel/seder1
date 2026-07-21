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
