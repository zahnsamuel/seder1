import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('canon bridges connect the six courses in one source-grounded sequence', async () => {
  const [dataText, bridge] = await Promise.all(['data/canon-bridges.json', 'canon-bridge.js'].map((file) => readFile(file, 'utf8')));
  const data = JSON.parse(dataText);
  assert.equal(data.bridges.length, 5);
  assert.deepEqual(data.bridges.map((bridge) => bridge.from), ['shema-six', 'blessings-six', 'tefillah-six', 'freedom-six', 'history-six']);
  assert.ok(data.bridges.every((bridge) => bridge.fromSource && bridge.toSource && bridge.prompt && bridge.move));
  assert.match(bridge, /guided independent capstone/);
  assert.doesNotMatch(bridge, /write its independent capstone/);
});
