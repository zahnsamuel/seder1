import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const anchors = JSON.parse(await readFile(new URL('../data/non-gemara-anchor-units.json', import.meta.url), 'utf8'));
test('anchor units provide multi-source depth across every non-Gemara domain', () => {
  assert.equal(anchors.courses.length, 7);
  for (const course of anchors.courses) {
    assert.equal(course.units.length, 4);
    for (const unit of course.units) assert.ok(unit.citation && unit.hebrew && unit.translation && unit.skillId);
  }
});
