import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildLineCheck, MOVE_TEMPLATES, shuffleChoices } from '../source-reader-checks.mjs';

const primary = JSON.parse(await readFile(new URL('../data/non-gemara-source-reader.json', import.meta.url), 'utf8'));
const additional = JSON.parse(await readFile(new URL('../data/additional-source-reader.json', import.meta.url), 'utf8'));
const collections = [...primary.collections, ...additional.collections];

test('every source-reader line has a 2–3 choice retrieval check', () => {
  for (const collection of collections) {
    for (const line of collection.lines) {
      const check = buildLineCheck(line, collection);
      assert.ok(check.answers.length >= 2 && check.answers.length <= 3, `${collection.id} ${line.ref}`);
      assert.equal(new Set(check.answers).size, check.answers.length, `${collection.id} ${line.ref} unique`);
      assert.ok(check.answers[check.correct], `${collection.id} ${line.ref} correct`);
      assert.ok(check.feedback);
    }
  }
});

test('fallback checks use sibling translations or fixed reading-move templates', () => {
  const collection = primary.collections[0];
  const line = { ...collection.lines[0] };
  delete line.answers;
  delete line.correct;
  delete line.feedback;
  const check = buildLineCheck(line, collection);
  assert.equal(check.answers[check.correct], line.translation);
  const allowed = new Set([
    line.translation,
    ...collection.lines.slice(1).map((other) => other.translation),
    ...MOVE_TEMPLATES
  ]);
  for (const answer of check.answers) assert.ok(allowed.has(answer), answer);
  assert.ok(check.answers.length >= 2 && check.answers.length <= 3);
});

test('shuffleChoices keeps the original index so the correct choice can move', () => {
  const answers = ['a', 'b', 'c'];
  const shuffled = shuffleChoices(answers);
  assert.equal(shuffled.length, 3);
  assert.deepEqual(shuffled.map(({ text }) => text).sort(), answers.slice().sort());
  assert.ok(shuffled.every(({ text, index }) => answers[index] === text));
});
