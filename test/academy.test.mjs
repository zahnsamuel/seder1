import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ninety-day academy gives beginners a single sequenced, evidence-led entry into the canon', async () => {
  const [html, source] = await Promise.all(['academy.html', 'academy.js'].map((file) => readFile(file, 'utf8')));
  for (const phrase of ['90-DAY ACADEMY', 'YOUR 90-DAY COURSE', 'MILESTONES', 'THE FIRST NINETY DAYS', 'integrated-path.html', 'monthNav']) assert.match(html, new RegExp(phrase));
  for (const route of ['language.html', 'tractate-mastery.html?tractate=berakhot', 'halakha-chanukah.html', 'history-geniza.html', 'independent-reading.html', 'weekly-review.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /const plan = \[/);
  assert.match(source, /placement\.html/);
  assert.match(source, /source evidence/);
  assert.match(source, /whyNext\(day\)/);
  assert.match(source, /dayMap/);
  assert.match(source, /continuationBlocks/);
  assert.match(source, /seder-90-day/);
  assert.match(source, /Month 3 · Independence/);
});
