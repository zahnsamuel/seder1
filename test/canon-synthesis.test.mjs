import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const synthesis = JSON.parse(await readFile(new URL('../data/canon-synthesis.json', import.meta.url), 'utf8'));

test('Canon synthesis checkpoints connect distinct source forms and retain valid assessment structure', () => {
  assert.equal(synthesis.checkpoints.length, 9);
  for (const checkpoint of synthesis.checkpoints) {
    assert.equal(checkpoint.sources.length, 2, `${checkpoint.id} should require a cross-source reading`);
    assert.equal(checkpoint.choices.length, 3);
    assert.ok(checkpoint.correct >= 0 && checkpoint.correct < checkpoint.choices.length);
    assert.notEqual(checkpoint.sources[0].citation, checkpoint.sources[1].citation);
  }
});
