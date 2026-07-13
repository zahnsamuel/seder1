import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('release artifacts protect review, hosted cutover, and a coherent eight-week learner journey', async () => {
  const [register, cutover, journeyQa, pathFile, bavaKammaFile] = await Promise.all([
    'docs/release-review-register.md', 'docs/supabase-execution-sheet.md', 'docs/learner-journey-qa.md',
    'data/eight-week-integrated-path.json', 'data/bava-kamma-source-review.json'
  ].map((file) => readFile(file, 'utf8')));
  const path = JSON.parse(pathFile);
  const bavaKamma = JSON.parse(bavaKammaFile);
  assert.match(register, /Sanhedrin/);
  assert.match(cutover, /Cross-account write is rejected/);
  assert.match(journeyQa, /local shared `demo` profile/);
  assert.equal(path.weeks.length, 8);
  for (const week of path.weeks) {
    assert.match(week.gemara, /\.html$/);
    assert.match(week.canon, /\.html$/);
    assert.match(week.review, /\.html$/);
  }
  assert.equal(bavaKamma.status, 'draft-awaiting-scholar-review');
  assert.equal(bavaKamma.encounters.length, 2);
  for (const encounter of bavaKamma.encounters) assert.equal(encounter.review.reviewStatus, 'awaiting-primary-text-and-translation-review');
});
