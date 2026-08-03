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

test('My Path explains why the next skill, grounded in the graph', () => {
  // Step 13: the recommendation is explainable — it names the secured move it builds on and the
  // move it unlocks (you can do A -> build B -> which opens C), computed from the real graph edges,
  // not a static blurb.
  assert.match(js, /why-next/);
  assert.match(js, /Builds on/);
  assert.match(js, /it unlocks/);
  // Unlocks are the graph successors: skills that list this skill as a prerequisite.
  assert.match(js, /prerequisites \|\| \[\]\)\.includes\(skill\.id\)/);
  // And the "builds on" side is the learner's own secured prerequisites, not any prerequisite.
  assert.match(js, /\.filter\(\(s\) => s && isSecure\(s\.id\)\)/);
});

test('My Path caps the retention preview instead of dumping every due card', () => {
  // One thing at a time: a learner can have 100+ skills due. The review section shows a few
  // previews plus a single way into the review session, not one linked card per due skill.
  // Guards against the overwhelming full-list dump returning.
  assert.match(js, /items\.slice\(0, 3\)/);
  assert.match(js, /fire\?\.practice\?\.length \? fire\.practice : review\.due/); // previews the FIRe-compressed set, capped
  assert.match(js, /Start review/);
  assert.doesNotMatch(js, /Review this skill/);
});
