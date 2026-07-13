import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('first-month academy gives beginners a single sequenced, evidence-led entry into the canon', async () => {
  const [html, source] = await Promise.all(['academy.html', 'academy.js'].map((file) => readFile(file, 'utf8')));
  for (const phrase of ['FIRST MONTH ACADEMY', 'YOUR 30-DAY COURSE', 'MILESTONES', 'THE FIRST MONTH', 'integrated-path.html']) assert.match(html, new RegExp(phrase));
  for (const route of ['language.html', 'tractate-mastery.html?tractate=berakhot', 'canon-course.html?course=tefillah-six', 'independent-reading.html', 'weekly-review.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /const plan = \[/);
  assert.match(source, /placement\.html/);
  assert.match(source, /source evidence/);
  assert.match(source, /whyNext\(day\)/);
  assert.match(source, /dayMap/);
});
