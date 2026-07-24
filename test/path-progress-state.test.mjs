import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('path.html', 'utf8');
const js = fs.readFileSync('path.js', 'utf8');

test('My Path milestones are keyed to learner evidence', () => {
  for (const stage of ['source', 'sugya', 'foundation', 'canon', 'transfer', 'reader']) assert.match(html, new RegExp(`data-stage="${stage}"`));
  assert.match(js, /completedStages/);
  assert.match(js, /stageState/);
  assert.match(html, /id="path-status"/);
  assert.match(js, /milestones established/);
  assert.match(js, /aria-current/);
  assert.match(js, /foundation-skill-graph\.json/);
  assert.match(js, /skill-progress-card/);
});

test('My Path caps the retention preview instead of dumping every due card', () => {
  // One thing at a time: a learner can have 100+ skills due. The review section shows a few
  // previews plus a single way into the review session, not one linked card per due skill.
  // Guards against the overwhelming full-list dump returning.
  assert.match(js, /review\.due\.slice\(/);
  assert.match(js, /Start review/);
  assert.doesNotMatch(js, /Review this skill/);
});
