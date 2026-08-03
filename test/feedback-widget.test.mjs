import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../feedback.js', import.meta.url), 'utf8');
const pages = ['academy-session.html', 'review.html', 'decoding-lesson.html', 'diagnostic.html', 'daily-router.html', 'path.html', 'my-graph.html'];

test('the feedback widget posts a contextual feedback event, only for a signed-in learner', () => {
  assert.match(js, /Seder\.session && Seder\.session\.access_token/); // gated on a real session so posting works
  assert.match(js, /type: 'feedback'/);
  assert.match(js, /\/api\/learners\/\$\{learnerId\}\/events/);
  // it records the page and the skill/lesson in context
  assert.match(js, /page: location\.pathname/);
  assert.match(js, /params\.get\('skill'\)/);
  assert.match(js, /params\.get\('lesson'\)/);
});

test('the widget ships on every learner surface', () => {
  for (const page of pages) {
    assert.match(readFileSync(new URL(`../${page}`, import.meta.url), 'utf8'), /feedback\.js/, `${page} should include the feedback widget`);
  }
});
