import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Yoma is a first-class arc in the official sequence and before the Foundation checkpoint', async () => {
  const [tractatesFile, sequenceFile, continuation] = await Promise.all([
    readFile('data/gemara-tractates.json', 'utf8'),
    readFile('data/advanced-gemara-sequence.json', 'utf8'),
    readFile('gemara-continuation.js', 'utf8')
  ]);
  const yoma = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Yoma');
  const steps = JSON.parse(sequenceFile).steps;
  assert.equal(yoma.stage, 'tractate-arc');
  assert.equal(yoma.arcUrl, 'yoma-arc.html');
  assert.ok(steps.findIndex((step) => step.stageId === 'yoma-tractate-arc') > steps.findIndex((step) => step.stageId === 'sukkah-tractate-arc'));
  assert.match(continuation, /'yoma-tractate-arc': 'yoma'/);
  assert.match(continuation, /four Foundations tractates/);
});
