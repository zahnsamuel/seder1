import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const content = JSON.parse(await readFile(new URL('../data/non-gemara-deepening.json', import.meta.url), 'utf8'));
test('deepening sequence gives every non-Gemara domain three source-based next-level encounters', () => {
  assert.equal(content.courses.length, 7);
  assert.equal(content.courses.flatMap((course) => course.units).length, 21);
  for (const course of content.courses) for (const unit of course.units) {
    assert.equal(unit.choices.length, 3);
    assert.ok(unit.correct >= 0 && unit.correct < unit.choices.length);
    assert.ok(unit.citation && unit.hebrew && unit.translation && unit.context);
  }
});
