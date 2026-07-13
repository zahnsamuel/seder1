import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('long-form curriculum extends one integrated path beyond the first foundation steps', async () => {
  const [dataFile, html, source] = await Promise.all(['data/seder-curriculum-map.json', 'seder-curriculum.html', 'seder-curriculum.js'].map((file) => readFile(file, 'utf8')));
  const map = JSON.parse(dataFile);
  assert.equal(map.levels.length, 6);
  assert.equal(map.levels.flatMap((level) => level.milestones).length, 12);
  for (const level of map.levels) {
    assert.ok(level.promise && level.range);
    for (const milestone of level.milestones) assert.ok(milestone.capability && milestone.route && milestone.evidencePrefixes.length);
  }
  for (const phrase of ['ONE LONG-FORM CURRICULUM', 'BEYOND THE FIRST STEPS', 'HOW TO READ THIS MAP']) assert.match(html, new RegExp(phrase));
  assert.match(source, /evidenceCount/);
  assert.match(source, /EVIDENCE GROWING/);
});
