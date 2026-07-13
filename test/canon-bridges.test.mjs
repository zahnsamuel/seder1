import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('canon bridges connect the six courses in one source-grounded sequence', async () => {
  const data = JSON.parse(await readFile('data/canon-bridges.json', 'utf8'));
  assert.equal(data.bridges.length, 5);
  assert.deepEqual(data.bridges.map((bridge) => bridge.from), ['shema-six', 'blessings-six', 'tefillah-six', 'freedom-six', 'history-six']);
  assert.ok(data.bridges.every((bridge) => bridge.fromSource && bridge.toSource && bridge.prompt && bridge.move));
});
