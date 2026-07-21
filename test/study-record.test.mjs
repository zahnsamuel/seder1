import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('study record collects learner-owned evidence from durable and local study artifacts', async () => {
  const [html, source, hub] = await Promise.all(['study-record.html', 'study-record.js', 'academy.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const id of ['metrics', 'skills', 'review', 'sourceWork', 'artifacts']) assert.match(html, new RegExp(`id="${id}"`));
  for (const phrase of ['decayedMastery', 'seder-personal-vocabulary-', 'seder-daf-argument-map-', 'seder-source-reader-', 'independent_encounter', 'academy-source-maps', 'academy-day-', 'capstone', 'bridge']) assert.match(source, new RegExp(phrase));
  // Study Record stays reachable from the Academy hub (it was removed from the simplified front door).
  assert.match(hub, /study-record\.html/);
});
