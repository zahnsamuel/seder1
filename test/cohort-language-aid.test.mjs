import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('cohort source mastery provides optional in-source language help and recall saving', async () => {
  const [page, source, vocabulary] = await Promise.all(['cohort-source-mastery.html', 'cohort-source-mastery.js', 'canon-vocabulary.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const marker of ['wordBank', 'wordAid', 'toggleTranslation', 'English is here to check your reading']) assert.match(page, new RegExp(marker));
  assert.match(source, /const languageAids=/);
  for (const tractate of ['berakhot', 'shabbat', 'yoma', 'ketubot', 'chullin', 'niddah']) assert.match(source, new RegExp(`${tractate}:\\[`));
  for (const marker of ['reading:', 'meaning:', 'job:', 'Save for vocabulary recall', 'seder-personal-vocabulary-', 'saved_source_word']) assert.match(source, new RegExp(marker));
  assert.match(source, /translation-hidden/);
  assert.match(vocabulary, /seder-personal-vocabulary-/);
  assert.match(vocabulary, /Your source vocabulary/);
});
