import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/preflight.mjs', 'utf8');

test('preflight checks accessible document basics on learner surfaces', () => {
  assert.match(source, /Accessible document basics/);
  assert.match(source, /<html\[\^>\]\+lang/);
  assert.match(source, /name=\["'\]viewport/);
  assert.match(source, /<title>/);
});
