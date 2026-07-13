import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Pesachim has auditable source records and a source-based starting diagnostic', async () => {
  const [recordsFile, diagnostic, mastery, deepening] = await Promise.all([
    readFile(new URL('../data/pesachim-source-review.json', import.meta.url), 'utf8'),
    readFile(new URL('../pesachim-diagnostic.js', import.meta.url), 'utf8'),
    readFile(new URL('../tractate-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../pesachim-deepening.js', import.meta.url), 'utf8')
  ]);
  const records = JSON.parse(recordsFile);
  assert.equal(records.status, 'draft-awaiting-scholar-review');
  assert.equal(records.encounters.length, 3);
  for (const encounter of records.encounters) {
    for (const field of ['reference', 'primaryText', 'translation', 'learningObjective', 'assessment', 'safetyBoundary', 'review', 'primaryTextUrl']) assert.ok(encounter[field]);
    assert.equal(encounter.review.reviewStatus, 'awaiting-primary-text-and-translation-review');
  }
  for (const skill of ['pesachim-action', 'pesachim-case-map', 'pesachim-ambiguous-word', 'pesachim-no-end-principle', 'pesachim-transfer']) assert.match(diagnostic, new RegExp(skill));
  assert.match(mastery, /pesachim-diagnostic\.html/);
  assert.match(mastery, /pesachim-deepening\.html/);
  for (const skill of ['pesachim-word-question', 'pesachim-hold-claims', 'pesachim-evidence-pressure', 'pesachim-grammar-response', 'pesachim-evidence-transfer']) assert.match(deepening, new RegExp(skill));
});
