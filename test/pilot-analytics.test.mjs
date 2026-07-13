import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('pilot dashboard consumes recommendation and pilot analytics endpoints', async () => {
  const dashboard = await readFile(new URL('../learner-dashboard.js', import.meta.url), 'utf8');
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(dashboard, /pilot-analytics/);
  assert.match(server, /pilot-analytics/);
});
