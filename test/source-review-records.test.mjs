import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const files = [
  'data/pesachim-source-review.json',
  'data/eruvin-source-review.json',
  'data/sukkah-source-review.json',
  'data/bava-metzia-source-review.json',
  'data/bava-kamma-source-review.json',
  'data/yoma-source-review.json',
  'data/sanhedrin-source-review.json'
];

test('every tracked Gemara review record satisfies Seder’s source-release contract', async () => {
  const [schemaFile, ...recordFiles] = await Promise.all([
    readFile('data/source-review-schema.json', 'utf8'),
    ...files.map((file) => readFile(file, 'utf8'))
  ]);
  const schema = JSON.parse(schemaFile);
  const records = recordFiles.map(JSON.parse);

  for (const record of records) {
    assert.equal(record.status, 'draft-awaiting-scholar-review', `${record.tractate} must remain review-gated`);
    assert.ok(record.encounters.length >= 2, `${record.tractate} needs more than one source encounter`);
    for (const encounter of record.encounters) {
      for (const field of schema.required) assert.ok(encounter[field] !== undefined, `${record.tractate}/${encounter.id} needs ${field}`);
      assert.ok(Array.isArray(encounter.prerequisiteSkillIds));
      assert.ok(Array.isArray(encounter.languageSupport.glosses));
      assert.ok(Array.isArray(encounter.assessment.misconceptions));
      assert.ok(encounter.primaryTextUrl.startsWith('https://www.sefaria.org/'));
      assert.equal(encounter.review.reviewStatus, 'awaiting-primary-text-and-translation-review');
      assert.deepEqual(Object.keys(encounter.review.releaseGates).sort(), [...schema.releaseGates].sort());
      assert.equal(encounter.review.releaseGates['accessibility-checked'], true);
      assert.equal(encounter.review.releaseGates['safety-boundary-checked'], true);
    }
  }
});
