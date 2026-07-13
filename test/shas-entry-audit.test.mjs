import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('every tractate on the Shas map has a concrete, source-linked entry experience', async () => {
  const [tractatesFile, labsFile] = await Promise.all([
    readFile('data/gemara-tractates.json', 'utf8'),
    readFile('data/tractate-labs.json', 'utf8')
  ]);
  const tractates = JSON.parse(tractatesFile).tractates;
  const labs = JSON.parse(labsFile).labs;
  const labById = new Map(labs.map((lab) => [lab.id, lab]));

  assert.equal(tractates.length, 37);
  for (const tractate of tractates) {
    assert.ok(tractate.practice, `${tractate.title} needs a learner-facing practice description`);
    if (tractate.entry) {
      assert.equal(tractate.title, 'Berakhot');
      continue;
    }
    assert.ok(tractate.labId, `${tractate.title} needs a lab or equivalent entry route`);
    const lab = labById.get(tractate.labId);
    assert.ok(lab, `${tractate.title} references a missing lab: ${tractate.labId}`);
    assert.ok(lab.sourceUrl.startsWith('https://www.sefaria.org/'), `${tractate.title} needs a primary-text link`);
    assert.ok(lab.steps.length >= 3, `${tractate.title} needs at least orientation, a reading move, and transfer-ready practice`);
    for (const step of lab.steps) {
      assert.ok(step.hebrew && step.translation && step.prompt && step.feedback, `${tractate.title} has an incomplete source step`);
      assert.ok(step.answers.length >= 3, `${tractate.title} needs plausible answer choices`);
      assert.ok(step.correct >= 0 && step.correct < step.answers.length, `${tractate.title} has an invalid answer key`);
    }
  }
});
