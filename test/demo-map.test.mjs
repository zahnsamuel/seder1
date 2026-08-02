import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

test('the demo map regenerates as a self-contained, login-free page', () => {
  execFileSync(process.execPath, ['scripts/build-demo-map.mjs'], { cwd: repoRoot });
  const html = readFileSync(new URL('../docs/demo-map.html', import.meta.url), 'utf8');
  assert.ok(html.startsWith('<!doctype html>'));
  // No external scripts or stylesheets — CSS and the renderer are inlined; nothing to fetch.
  assert.doesNotMatch(html, /<script src=/);
  assert.doesNotMatch(html, /<link[^>]+href=["'](?!https:\/\/fonts)/); // only the (optional) font link
  assert.match(html, /id="demo-data"/);
});

test('the baked learner is realistic (a green base, a gold frontier, the rest ahead)', () => {
  const html = readFileSync(new URL('../docs/demo-map.html', import.meta.url), 'utf8');
  const data = JSON.parse(html.match(/id="demo-data">(.*?)<\/script>/s)[1]);
  const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
  const secured = new Set(Object.keys(data.learner.foundationScores));
  // The secured set is prerequisite-closed — no skill is "mastered" while a prerequisite isn't.
  for (const s of graph.skills) if (secured.has(s.id)) for (const p of s.prerequisites || []) assert.ok(secured.has(p), `${s.id} secured but prerequisite ${p} is not`);
  assert.ok(secured.size > 5 && secured.size < graph.skills.length, 'mid-journey, not empty or complete');
  // A frontier exists (skills not secured whose prerequisites all are).
  const frontier = graph.skills.filter((s) => !secured.has(s.id) && (s.prerequisites || []).every((p) => secured.has(p)));
  assert.ok(frontier.length > 0, 'there are ready-now moves to show');
});

test('the demo reuses the live renderer (single source of truth)', () => {
  const html = readFileSync(new URL('../docs/demo-map.html', import.meta.url), 'utf8');
  const liveJs = readFileSync(new URL('../my-graph.js', import.meta.url), 'utf8');
  // my-graph.js runs from embedded demo data when present, else fetches the signed-in learner.
  assert.match(liveJs, /getElementById\('demo-data'\)/);
  assert.match(liveJs, /function render\(learner, graph\)/);
  // and its render body is what the demo page ships.
  assert.match(html, /function render\(learner, graph\)/);
});
