import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/preflight.mjs', 'utf8');

test('preflight checks the promises made by trust pages', () => {
  for (const marker of ['Learner privacy', 'Terms of use', 'Data requests', 'mailto:']) assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
  assert.match(source, /Trust pages contain required learner promises/);
});
