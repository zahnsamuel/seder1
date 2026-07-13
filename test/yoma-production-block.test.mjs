import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Yoma connects procedure, limit, proof text, and transfer through a review-gated mastery loop', async () => {
  const [arc, page, mastery, recordsFile] = await Promise.all([
    'yoma-arc.js', 'yoma-arc.html', 'tractate-mastery.js', 'data/yoma-source-review.json'
  ].map((file) => readFile(file, 'utf8')));
  const records = JSON.parse(recordsFile);
  for (const skill of ['yoma-preparation-case', 'yoma-safeguard-risk', 'yoma-no-end-limit', 'yoma-verse-role', 'yoma-second-source-comparison', 'yoma-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /study distinct from personal guidance/i);
  assert.match(page, /course-engine\.js/);
  assert.match(mastery, /yoma-arc\.html/);
  assert.match(mastery, /tractate=yoma/);
  assert.equal(records.status, 'draft-awaiting-scholar-review');
  assert.equal(records.encounters.length, 2);
  for (const encounter of records.encounters) assert.equal(encounter.review.reviewStatus, 'awaiting-primary-text-and-translation-review');
});
