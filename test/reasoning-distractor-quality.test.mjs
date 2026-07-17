import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('core reasoning arcs make distractors diagnose real reading mistakes', async () => {
  const [chassidus, middot] = await Promise.all([
    readFile(new URL('../chassidus-arc.js', import.meta.url), 'utf8'),
    readFile(new URL('../gemara-middot.js', import.meta.url), 'utf8')
  ]);
  assert.match(chassidus, /const chassidusArcSteps=window\.SederCourse\.steps/);
  assert.match(middot, /const middotSteps=window\.SederCourse\.steps/);
  assert.match(chassidus, /real interpretive errors/);
  assert.match(middot, /substantive near-misses/);
});
