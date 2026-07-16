import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Term Three connects Niddah source work to an earned, source-based canon integration', async () => {
  const [journey, html, source, transfer] = await Promise.all([
    readFile(new URL('../term-three-journey.html', import.meta.url), 'utf8'),
    readFile(new URL('../term-three-integration.html', import.meta.url), 'utf8'),
    readFile(new URL('../term-three-integration.js', import.meta.url), 'utf8'),
    readFile(new URL('../niddah-transfer.html', import.meta.url), 'utf8')
  ]);
  for (const route of ['niddah-foundation.html', 'niddah-arc.html', 'term-three-integration.html', 'niddah-transfer.html']) assert.match(journey, new RegExp(route));
  for (const phrase of ['Niddah 1:1', 'Eruvin 13b', 'Pirkei Avot 4:1', 'STUDY BOUNDARY']) assert.match(html + source, new RegExp(phrase));
  assert.match(source, /sort\(\(\) => Math\.random\(\) - 0\.5\)/);
  assert.match(source, /stageId: 'term-three-disagreement-integration'/);
  assert.match(source, /niddah-transfer\.html/);
  assert.match(transfer, /term-three-journey\.html/);
});
