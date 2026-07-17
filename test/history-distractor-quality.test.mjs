import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('History source arcs use substantive alternatives about evidence, memory, and archives', async () => {
  const [yavneh, geniza] = await Promise.all([
    readFile(new URL('../history-yavneh.js', import.meta.url), 'utf8'),
    readFile(new URL('../history-geniza.js', import.meta.url), 'utf8')
  ]);
  assert.match(yavneh, /const yavnehSteps=window\.SederCourse\.steps/);
  assert.match(geniza, /const genizaSteps=window\.SederCourse\.steps/);
  assert.match(yavneh, /Historical near-misses/);
  assert.match(geniza, /selection, and evidence/);
});
