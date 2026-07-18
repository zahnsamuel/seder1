import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('path.html', 'utf8');
const js = fs.readFileSync('path.js', 'utf8');

test('My Path milestones are keyed to learner evidence', () => {
  for (const stage of ['source', 'sugya', 'foundation', 'canon', 'transfer', 'reader']) assert.match(html, new RegExp(`data-stage="${stage}"`));
  assert.match(js, /completedStages/);
  assert.match(js, /stageState/);
  assert.match(js, /aria-current/);
});
