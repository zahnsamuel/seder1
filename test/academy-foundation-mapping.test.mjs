import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mapping = JSON.parse(fs.readFileSync(new URL('../data/academy-foundation-mapping.json', import.meta.url), 'utf8'));
const graph = JSON.parse(fs.readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const pilot = JSON.parse(fs.readFileSync(new URL('../data/pilot-foundations.json', import.meta.url), 'utf8'));

test('first Academy content maps to canonical foundational skills', () => {
  const known = new Set(graph.skills.map((skill) => skill.id));
  const units = new Set(pilot.units.map((unit) => unit.id));
  assert.equal(mapping.units.length, pilot.units.length);
  for (const unit of mapping.units) {
    assert.ok(units.has(unit.contentUnitId), `unknown content unit ${unit.contentUnitId}`);
    assert.ok(unit.foundationSkillIds.length >= 2);
    for (const skillId of unit.foundationSkillIds) assert.ok(known.has(skillId), `unknown foundation skill ${skillId}`);
  }
});

test('the first Academy session is one 20-minute skill progression', () => {
  const known = new Set(graph.skills.map((skill) => skill.id));
  assert.equal(mapping.firstSession.durationMinutes, 20);
  assert.equal(mapping.firstSession.steps.reduce((sum, step) => sum + step.minutes, 0), 20);
  assert.deepEqual(mapping.firstSession.steps.map((step) => step.mode), ['retrieve', 'encounter', 'demonstrate', 'transfer', 'orient']);
  for (const step of mapping.firstSession.steps) assert.ok(known.has(step.skillId));
});
