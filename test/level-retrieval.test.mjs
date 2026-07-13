import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('level handoffs offer targeted retrieval instead of a generic review link', async () => {
  const [completion, html, script, styles, checkpoint] = await Promise.all(['level-complete.js', 'level-review.html', 'level-review.js', 'level-review.css', 'phase-checkpoint.js'].map((file) => readFile(file, 'utf8')));
  assert.match(completion, /level-review\.html\?level=/);
  for (const phrase of ['SHORT, TARGETED RETURN', 'RETRIEVAL COMPLETE', 'Return to your journey']) assert.match(html + script, new RegExp(phrase));
  assert.match(script, /learner\.mastery/);
  assert.match(script, /source_annotation/);
  assert.match(styles, /\.answers button\.correct/);
  for (const phase of ['phase-9', 'phase-10', 'phase-11', 'phase-12', 'phase-13', 'phase-14', 'phase-15', 'phase-16']) assert.match(checkpoint, new RegExp(`'${phase}':`));
});
