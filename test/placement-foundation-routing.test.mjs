import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../placement.js', import.meta.url), 'utf8');

test('placement preserves legacy scores while emitting foundational skill evidence', () => {
  assert.match(source, /foundationSkillByLegacy/);
  for (const skill of ['fnd-signal-question-words', 'fnd-orient-source-type', 'fnd-arg-claim', 'fnd-resp-learning-vs-ruling', 'fnd-context-who-audience', 'fnd-compare-scope']) {
    assert.match(source, new RegExp(skill));
  }
  assert.match(source, /scores, foundationScores/);
});
