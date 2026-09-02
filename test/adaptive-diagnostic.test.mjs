import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { estimateFrontierFromDiagnostic, nextDiagnosticProbe } from '../data/knowledge-graph.mjs';

const html = await readFile(new URL('../diagnostic.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../diagnostic.js', import.meta.url), 'utf8');
const graph = JSON.parse(await readFile(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const layerOf = (id) => graph.skills.find((s) => s.id === id)?.layer ?? 99;

test('adaptive diagnostic page has the probe loop, gauge, results and rhythm surfaces', () => {
  for (const marker of ['id="probe-shell"', 'id="gauge-fill"', 'id="answers"', 'id="results"', 'data-rhythm="daily"']) {
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(html, /src="diagnostic\.js/);
  assert.match(html, /src="seder-auth\.js/);
  // Simplification: the diagnostic no longer offers the worked-example placement as an alternative —
  // the adaptive diagnostic is the single navigable placement. (daily-router still protects the
  // placement-first entry; that guarantee lives in daily-router.test.mjs.)
  assert.doesNotMatch(html, /placement\.html/);
});

test('diagnostic results push one next CTA on the shared shell, not a menu of destinations', () => {
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  assert.match(html, /class="jla-main"/);
  assert.match(html, /id="results-begin" class="jla-btn jla-btn-primary"/);
  assert.equal((html.match(/id="results-begin"/g) || []).length, 1);
  assert.doesNotMatch(html, /results-secondary|results-continue/);
  assert.match(html, /<details class="results-map">/);
  assert.match(html, /<summary>See the foundation map<\/summary>/);
  assert.ok(html.indexOf('id="results-begin"') < html.indexOf('id="results-grid"'));
  assert.doesNotMatch(html, /<header>/);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const pageOrder = html.indexOf('diagnostic.js');
  assert.ok(authOrder < shellOrder && shellOrder < pageOrder);
});

test('diagnostic.js drives the stateless estimator and seeds through the placement path', () => {
  assert.match(js, /\/api\/graph\/diagnostic/);
  assert.match(js, /responses\[probe\.id\] = option\.passed/);
  assert.match(js, /type: 'placement_completed'/);
  // self-report seeds at a provisional secure level, never a graded 1.0
  assert.match(js, /\[id, 0\.8\]/);
  assert.ok(!/\[id, 1\]|\[id, 1\.0\]/.test(js), 'self-report must not seed a perfect 1.0');
  // decode skills route to the real drills; everything else into the scaffolded lesson
  assert.match(js, /fnd-decode-[\s\S]*hebrew-decoding\.html/);
  assert.match(js, /foundationSkill=/);
  assert.match(js, /jla-choice/);
  assert.match(js, /intro\) intro\.hidden = true/);
});

test('the estimator pins a mid-graph frontier in far fewer questions than there are skills, inferring prerequisites', () => {
  // A learner who can do everything through layer 3, nothing above it. Drive the real adaptive loop.
  const canDo = (id) => layerOf(id) <= 3;
  const responses = {};
  for (let i = 0; i < graph.skills.length + 5; i++) {
    const probe = nextDiagnosticProbe(graph, responses);
    if (!probe) break;
    responses[probe] = canDo(probe);
  }
  const asked = Object.keys(responses).length;
  const { known, frontier } = estimateFrontierFromDiagnostic(graph, responses);

  // Converged without probing anywhere near every skill (binary search + inference).
  assert.ok(asked < 25, `expected a handful of questions, asked ${asked} of ${graph.skills.length}`);
  // Downward inference: the Layer-0 decoding on-ramp is known even though a fluent reader is never
  // asked to name a letter — it is a transitive prerequisite of the skills they did pass.
  assert.ok(known.some((id) => layerOf(id) === 0), 'decoding layer inferred into the known set');
  // The estimated frontier sits just above the band the learner has mastered.
  assert.ok(frontier.length > 0, 'a non-empty frontier');
  assert.ok(frontier.every((id) => layerOf(id) >= 4), 'frontier is above the known (<=3) band');
});
