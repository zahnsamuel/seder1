import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('second-source comparison is a retryable guided choice, not a required writing task', async () => {
  const source = await readFile(new URL('../cohort-source-mastery.js', import.meta.url), 'utf8');
  for (const marker of [
    "document.querySelector('label[for=\"comparison\"]').hidden=true",
    "$('#comparison').hidden=true",
    "$('#saveComparison').hidden=true",
    'CHOOSE THE BEST EXPLANATION',
    'pairedLine<0',
    'original===0',
    '.sort(()=>Math.random()-.5)',
  ]) assert.ok(source.includes(marker), `missing ${marker}`);
  assert.ok(source.includes("button.disabled=true;$('#compareFeedback').textContent='Not yet"));
  assert.ok(source.includes("comparisonCheck.querySelectorAll('button').forEach(item=>item.disabled=true);$('#comparison').value="));
  assert.ok(!source.includes('Use at least eight words to name continuity and the new move.'));
});
