import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const pilot = JSON.parse(await readFile(new URL('../data/pilot-foundations.json', import.meta.url), 'utf8'));
const repairs = JSON.parse(await readFile(new URL('../data/pilot-repairs.json', import.meta.url), 'utf8'));
test('pilot path links seven integrated source moves to targeted repairs', () => {
  assert.equal(pilot.units.length, 7);
  for (const unit of pilot.units) {
    assert.ok(repairs.repairs[unit.skillId], `${unit.skillId} needs a targeted repair`);
    assert.ok(unit.choices[unit.correct]);
  }
});
