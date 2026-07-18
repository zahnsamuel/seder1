import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const doc = fs.readFileSync('docs/pilot-manual-qa.md', 'utf8');

test('pilot manual QA covers the non-automatable launch checks', () => {
  for (const phrase of ['Fresh learner flow', 'Keyboard-only pass', 'Responsive and reading pass', 'Trust and boundary pass', '320px', '200%', 'Daf/source text and translation']) assert.match(doc, new RegExp(phrase.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
});
