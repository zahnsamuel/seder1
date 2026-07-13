import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Eruvin has review-ready sources, a starting diagnostic, and a deep argument chain', async () => {
  const [recordsFile, diagnostic, deepening, mastery] = await Promise.all(['data/eruvin-source-review.json','eruvin-diagnostic.js','eruvin-deepening.js','tractate-mastery.js'].map((file) => readFile(file, 'utf8')));
  const records = JSON.parse(recordsFile); assert.equal(records.status, 'draft-awaiting-scholar-review'); assert.equal(records.encounters.length, 2);
  for (const item of records.encounters) { assert.ok(item.assessment.transferPrompt); assert.equal(item.review.reviewStatus, 'awaiting-primary-text-and-translation-review'); }
  for (const skill of ['eruvin-case-measure','eruvin-case-response','eruvin-shammai-hillel','eruvin-formulation-question','eruvin-transfer']) assert.match(diagnostic, new RegExp(skill));
  for (const skill of ['eruvin-deep-case-map','eruvin-deep-formulation','eruvin-deep-reason','eruvin-deep-source-basis','eruvin-deep-transfer']) assert.match(deepening, new RegExp(skill));
  assert.match(mastery, /eruvin-diagnostic\.html/); assert.match(mastery, /eruvin-deepening\.html/);
});
