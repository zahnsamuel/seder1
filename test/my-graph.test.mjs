import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, js, path] = await Promise.all(
  ['my-graph.html', 'my-graph.js', 'path.html'].map((f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8'))
);

test('the map page loads the graph and its own script/style', () => {
  assert.match(html, /my-graph\.js/);
  assert.match(html, /my-graph\.css/);
  assert.match(html, /id="map"/);
  assert.match(html, /id="summary"/);
  assert.match(html, /id="detail"/);
  // The three-state legend is the whole point — mastered / ready-now / ahead.
  for (const k of ['mastered', 'frontier', 'locked']) assert.match(html, new RegExp(`class="k ${k}"`));
});

test('the map colours every skill by the learner\'s state, computed from evidence', () => {
  assert.match(js, /foundation-skill-graph\.json/);
  assert.match(js, /Math\.max\(foundationScores\[id\] \|\| 0, mastery\[id\] \|\| 0\) >= 0\.67/);
  // The frontier is the same rule as My Path: not secured, but every prerequisite is.
  assert.match(js, /\(s\.prerequisites \|\| \[\]\)\.every\(isSecure\)/);
  for (const s of ['mastered', 'frontier', 'locked']) assert.match(js, new RegExp(`'${s}'`));
  // Clicking a node explains how it connects (builds on / unlocks).
  assert.match(js, /Builds on/);
  assert.match(js, /Unlocks/);
  assert.match(js, /successors/);
});

test('My Path links out to the whole-graph map', () => {
  assert.match(path, /href="my-graph\.html"/);
});
