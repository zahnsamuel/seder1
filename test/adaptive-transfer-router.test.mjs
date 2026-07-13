import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('daily router introduces unseen-source transfer after a completed capstone', async () => {
  const source = await readFile('daily-router.js', 'utf8');
  assert.match(source, /seder-capstone-/);
  assert.match(source, /seder-independent-reading-/);
  assert.match(source, /independent-reading\.html/);
});
