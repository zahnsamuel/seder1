import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Berakhot Block 1 gives a learner one earned next move across ten sessions', async () => {
  const source = await readFile(new URL('../berakhot-mastery.js', import.meta.url), 'utf8');
  assert.match(source, /const first = steps\.findIndex/);
  assert.match(source, /YOUR NEXT MOVE/);
  assert.match(source, /UPCOMING/);
  assert.match(source, /completedStages/);
  assert.match(source, /berakhot-2a-depth/);
  assert.match(source, /canon-connection\.html\?tractate=berakhot/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 10);
});

test('unseen Gemara check uses shuffled choices rather than required typing', async () => {
  const source = await readFile(new URL('../gemara-unseen-check.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /textarea/);
  assert.match(source, /sort\(\(\) => Math\.random\(\) - 0\.5\)/);
  assert.match(source, /skillId: 'unseen-sugya-reading'/);
});
