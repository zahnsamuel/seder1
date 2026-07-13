import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const labs = JSON.parse(await readFile(new URL('../data/non-gemara-labs.json', import.meta.url), 'utf8'));

test('Canon Practice Labs cover seven non-Gemara domains with three source checks each', () => {
  assert.equal(labs.labs.length, 7);
  assert.equal(labs.labs.flatMap((lab) => lab.lessons).length, 21);
  for (const lab of labs.labs) {
    assert.equal(lab.lessons.length, 3, `${lab.subject} should have a compact three-source practice set`);
    for (const lesson of lab.lessons) {
      assert.ok(lesson.citation && lesson.translation && lesson.context);
      assert.equal(lesson.choices.length, 3);
      assert.ok(Number.isInteger(lesson.correct) && lesson.correct >= 0 && lesson.correct < lesson.choices.length);
      assert.ok(lesson.explanation.length > 20);
    }
  }
});
