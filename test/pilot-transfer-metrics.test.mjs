import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('pilot analytics distinguish unseen-source transfer from routine attempts', async () => {
  const source = await readFile('server.mjs', 'utf8');
  assert.match(source, /independentAttempts/);
  assert.match(source, /independentAccuracy/);
  assert.match(source, /capstonesSubmitted/);
});
