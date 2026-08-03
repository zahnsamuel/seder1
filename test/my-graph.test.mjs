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

test('the map surfaces the diagnostic frontier: a start-here move and a path to the placement', () => {
  assert.match(html, /id="placement-cta"/);
  // The start-here move is the frontier's highest-leverage skill — the same one the diagnostic
  // recommends — computed from transitive dependents.
  assert.match(js, /const startHere =/);
  assert.match(js, /descendantsOf/);
  assert.match(js, /state\.get\(s\.id\) === 'frontier'/);
  // It is marked on the map and named as where to begin.
  assert.match(js, /START HERE/);
  assert.match(js, /Start here/);
  // The frontier is tied back to the adaptive placement that finds it.
  assert.match(js, /diagnostic\.html/);
  assert.match(js, /from=diagnostic/);
});
