import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ninety-day academy gives beginners a single sequenced, evidence-led entry into the canon', async () => {
  const [html, source] = await Promise.all(['academy.html', 'academy.js'].map((file) => readFile(file, 'utf8')));
  // The hub now leads with the next session + the foundations on-ramp; the full 90-day map,
  // milestones, and phases were removed from the page (mentor reset) but the sequencing engine
  // below still drives which session is next.
  for (const phrase of ['90-DAY ACADEMY', 'YOUR NEXT SESSION', 'integrated-path.html', 'Reading Orientation']) assert.match(html, new RegExp(phrase));
  for (const removed of ['YOUR 90-DAY COURSE', 'THE FIRST NINETY DAYS', 'id="milestones"']) assert.doesNotMatch(html, new RegExp(removed));
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
