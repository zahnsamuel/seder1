import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { foundationFrontierRecommendation } from '../data/next-action.mjs';
import { readFileSync } from 'node:fs';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));

test('friend click path: landing → name signup → placement, not a homepage dead-end', async () => {
  const [landing, front, onboarding, signIn] = await Promise.all([
    read('seder.html'), read('seder.js'), read('onboarding.js'), read('sign-in.html')
  ]);
  assert.match(landing, /NO BACKGROUND NEEDED/);
  assert.match(landing, /Start where you are/);
  assert.match(landing, /A few questions, then one short lesson/);
  assert.match(front, /sign-in\.html/);
  assert.match(front, /next.*diagnostic\.html|searchParams\.set\('next', 'diagnostic\.html'\)/);
  assert.match(front, /Start learning/);
  assert.match(onboarding, /Pick a name/);
  assert.match(onboarding, /Answer a few questions/);
  assert.match(onboarding, /Do one short lesson/);
  assert.match(onboarding, /href="diagnostic\.html"/);
  assert.match(signIn, /return 'daily-router\.html'/);
  assert.match(signIn, /No email, no password/);
  assert.match(signIn, /\[hidden\].*display:\s*none\s*!important/);
  assert.doesNotMatch(signIn, /return 'seder\.html'/);
});

test('friend click path: placement copy is a starting point, then one Today lesson', async () => {
  const [html, js, server] = await Promise.all([
    read('diagnostic.html'), read('diagnostic.js'), read('server.mjs')
  ]);
  assert.match(html, /Let’s find where to start/);
  assert.doesNotMatch(html, /knowledge frontier/i);
  assert.doesNotMatch(html, /The graph infers/);
  assert.match(html, /See today’s lesson/);
  assert.match(html, /href="daily-router.html"/);
  assert.match(html, /OPTIONAL · HOW OFTEN YOU STUDY/);
  assert.match(js, /begin\.href = 'daily-router\.html'/);
  assert.doesNotMatch(js, /academy-session\.html\?skill=/);
  assert.doesNotMatch(js, /hebrew-decoding\.html/);
  assert.match(server, /Find where to start/);
  assert.match(server, /Start the questions/);
  assert.doesNotMatch(server, /Find your Gemara starting point/);
});

test('friend click path: Today is one lesson CTA, not Academy Foundation jargon', async () => {
  const [html, client, css] = await Promise.all([
    read('daily-router.html'), read('jla-next-action.js'), read('jla-next-action.css')
  ]);
  assert.match(html, /Finding today’s lesson/);
  assert.match(html, /One thing to do next/);
  assert.doesNotMatch(html, /most useful next move/);
  assert.match(client, /jla-next-action__hint/);
  assert.match(client, /This is the only thing to do right now/);
  assert.match(css, /jla-next-action__hint/);
  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-08' },
    foundationScores: {}
  }, graph);
  assert.ok(rec);
  assert.doesNotMatch(rec.title, /Academy Foundation ·/);
  assert.match(rec.reason, /About 15 minutes|see it/i);
  assert.equal(rec.url, 'hebrew-decoding.html');
});

test('friend click path: academy session is See-it then ask on this page, then back to Today', async () => {
  const [html, js, lesson] = await Promise.all([
    read('academy-session.html'), read('academy-session.js'), read('academy-session-lesson.mjs')
  ]);
  assert.match(html, /SEE IT, THEN ANSWER/);
  assert.match(html, /<span>See it<\/span>/);
  assert.match(html, /YOUR QUESTION/);
  assert.match(html, /ON THIS PAGE/);
  assert.match(html, /Look up later \(optional\)/);
  assert.match(html, /Continue to Today/);
  assert.match(html, /href="daily-router.html"/);
  assert.doesNotMatch(html, /path\.html/);
  assert.doesNotMatch(html, /Open full text in Sefaria/);
  assert.match(js, /hideOutbound/);
  assert.match(js, /Continue to Today/);
  assert.doesNotMatch(lesson, /sefaria\.org\/search/);
  assert.doesNotMatch(lesson, /TODAY’S SOURCE WINDOW|TODAY'S SOURCE WINDOW/);
});
