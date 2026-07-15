import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Gemara journey gives one recommended move and gates later evidence cohorts', async () => {
  const [page, source] = await Promise.all(['gemara-mastery.html', 'gemara-mastery.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /id="recommendation"/);
  for (const marker of ['YOUR RECOMMENDED NEXT MOVE', 'finishedBefore', 'locked-cohort', 'UPCOMING', 'const gate = locked']) assert.match(source, new RegExp(marker.replace(/[?${}]/g, '\\$&')));
  assert.match(source, /transfer_explanation/);
});
