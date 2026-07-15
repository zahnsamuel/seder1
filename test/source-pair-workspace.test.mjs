import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('comparison workspace lets a learner pair a first-source line with the second source', async () => {
  const [source, styles] = await Promise.all(['cohort-source-mastery.js', 'cohort-source-mastery.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const marker of ['PAIR THE TEXTS', 'source-a-pair', 'pair-target', 'data-pair', 'pairedLine']) assert.match(source, new RegExp(marker));
  for (const marker of ['source-pair', 'source-a-pair button.active', 'pair-target']) assert.match(styles, new RegExp(marker));
});
