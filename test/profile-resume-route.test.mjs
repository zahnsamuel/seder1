import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('profile sends a learner to placement only when placement is absent', async () => {
  const script = await readFile(new URL('../profile.js', import.meta.url), 'utf8');
  assert.match(script, /const needsPlacement = !learner\.placement/);
  assert.match(script, /begin\.href = needsPlacement \? 'diagnostic\.html' : 'daily-router\.html'/);
  assert.match(script, /Find my starting point/);
  assert.match(script, /Continue today/);
});
