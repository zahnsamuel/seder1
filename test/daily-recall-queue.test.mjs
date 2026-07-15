import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('daily recall queue combines saved source words with due Gemara retrieval', async () => {
  const [page, source, router] = await Promise.all(['daily-recall.html', 'daily-recall.js', 'daily-router.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const marker of ['DAILY RECALL QUEUE', 'wordCard', 'reviewCard', 'QUEUE COMPLETE', 'Today']) assert.match(page, new RegExp(marker));
  for (const marker of ['seder-personal-vocabulary-', 'reviewDue', 'intervalDays', 'Daily recall:', 'answer_submitted']) assert.match(source, new RegExp(marker));
  assert.match(router, /daily-recall\.html/);
  assert.match(router, /personalDue/);
  assert.match(router, /Bring back source words and Gemara moves due today/);
});
