import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../analytics.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../analytics.js', import.meta.url), 'utf8');

test('the operator dashboard surfaces the graph-pilot signal', () => {
  // The panel and its three sub-surfaces exist.
  assert.match(html, /class="panel graph-pilot"/);
  for (const id of ['pilotSummary', 'pilotSkills', 'pilotEdges']) assert.match(html, new RegExp(`id="${id}"`));
  // The renderer consumes the graphPilot payload and its key signals.
  assert.match(js, /renderGraphPilot\(data\.graphPilot\)/);
  for (const signal of ['difficulty', 'discrimination', 'lift', 'skillsWithEnoughData']) assert.match(js, new RegExp(signal));
});

test('the dashboard surfaces learner feedback, with comments escaped', () => {
  assert.match(html, /class="panel learner-feedback"/);
  for (const id of ['feedbackCounts', 'feedbackList']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(js, /renderFeedback\(data\.feedback\)/);
  // free learner text must be escaped in the operator view.
  assert.match(js, /escapeHtml\(f\.comment\)/);
});

test('the dashboard stays honest about sample size — sparse rows are held back, not read as signal', () => {
  // Only rows with enough responses are shown; the rest surface an explicit "awaiting data" message.
  assert.match(js, /\.filter\(\(x\) => x\.enough\)/);
  assert.match(js, /\.filter\(\(e\) => e\.enough\)/);
  assert.match(js, /awaiting pilot data/);
});
