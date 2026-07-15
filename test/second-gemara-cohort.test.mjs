import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('new Gemara cohorts have source-to-transfer evidence loops', async () => {
  const [page, source, dashboard, connections] = await Promise.all(['cohort-source-mastery.html', 'cohort-source-mastery.js', 'gemara-mastery.js', 'canon-connection.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /VISIBLE SOURCE MAP/);
  for (const tractate of ['berakhot', 'shabbat', 'yoma', 'ketubot', 'chullin', 'niddah']) {
    assert.match(source, new RegExp(`${tractate}:`));
    assert.match(dashboard, new RegExp(`id: '${tractate}'`));
    assert.match(connections, new RegExp(`${tractate}:`));
  }
  for (const marker of ['second_source_explanation', 'transfer_explanation', 'retrieval_scheduled', 'source_annotation']) assert.match(source, new RegExp(marker));
  assert.match(source, /sort\(\(\)=>Math\.random\(\)-\.5\)/);
  assert.match(dashboard, /STRUCTURES · REASONS · DISPUTES/);
});
