import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Sanhedrin is review-gated before a learner-facing court-structure block ships', async () => {
  const [specification, recordsFile] = await Promise.all([
    readFile('docs/sanhedrin-mastery-block.md', 'utf8'),
    readFile('data/sanhedrin-source-review.json', 'utf8')
  ]);
  const records = JSON.parse(recordsFile);
  assert.equal(records.status, 'draft-awaiting-scholar-review');
  assert.equal(records.encounters.length, 2);
  assert.match(specification, /does not adjudicate disputes/i);
  for (const encounter of records.encounters) {
    assert.equal(encounter.review.reviewStatus, 'awaiting-primary-text-and-translation-review');
    assert.equal(encounter.review.releaseGates['safety-boundary-checked'], true);
    assert.ok(encounter.primaryTextUrl.toLowerCase().includes('sefaria.org/sanhedrin.2a'));
  }
});
