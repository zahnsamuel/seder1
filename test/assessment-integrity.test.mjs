import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('placement and phase checkpoints shuffle presentation while preserving original answer indices', async () => {
  for (const file of ['placement.js', 'phase-checkpoint.js']) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /shuffle/);
    assert.match(source, /originalIndex/);
  }
});
