import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('unseen source encounters assess transfer across core non-Gemara domains', async () => {
  const data = JSON.parse(await readFile('data/independent-source-encounters.json', 'utf8'));
  assert.equal(data.encounters.length, 5);
  assert.deepEqual(data.encounters.map((encounter) => encounter.domain), ['Torah', 'Tefillah', 'Mishnah and practice', 'Jewish Thought', 'History and wider world']);
  assert.ok(data.encounters.every((encounter) => encounter.questions.length === 2 && encounter.questions.every((question) => question.choices.filter((choice) => choice.correct).length === 1)));
});
