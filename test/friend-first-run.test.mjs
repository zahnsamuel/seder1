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
  assert.match(landing, /reading Jewish sources yourself/);
  assert.match(landing, /Find your way on a page/);
  assert.match(landing, /Notice who’s speaking/);
  assert.match(landing, /Spot questions versus claims/);
  assert.match(landing, /Follow a case/);
  assert.match(landing, /See how arguments work/);
  assert.match(landing, /id="nextAction"/);
  assert.equal((landing.match(/id="nextAction"/g) || []).length, 1);
  assert.doesNotMatch(landing, /even from the Hebrew letters/);
  assert.doesNotMatch(landing, /Gemara|sugya/i);
  assert.match(front, /sign-in\.html/);
  assert.match(front, /next.*diagnostic\.html|searchParams\.set\('next', 'diagnostic\.html'\)/);
  assert.match(front, /Start learning/);
  assert.match(front, /if \(hasProgress\)/);
  assert.match(front, /learnMoves/);
  assert.match(landing, /id="todayStats" hidden/);
  assert.match(onboarding, /Pick a name/);
  assert.match(onboarding, /Answer a few questions/);
  assert.match(onboarding, /At most six short checks/);
  assert.match(onboarding, /Do one short lesson/);
  assert.match(onboarding, /Learn to read Jewish sources yourself/);
  assert.match(onboarding, /href="sign-in\.html\?next=diagnostic\.html"/);
  assert.match(signIn, /return 'daily-router\.html'/);
  assert.match(signIn, /No email, no password/);
  assert.match(signIn, /reading Jewish sources yourself/);
  assert.match(signIn, /\[hidden\].*display:\s*none\s*!important/);
  assert.doesNotMatch(signIn, /return 'seder\.html'/);
});

test('friend click path: placement copy is a starting point, then one Today lesson', async () => {
  const [html, js, server] = await Promise.all([
    read('diagnostic.html'), read('diagnostic.js'), read('server.mjs')
  ]);
  assert.match(html, /Let’s find where to start/);
  assert.match(html, /reading Jewish sources yourself/);
  assert.doesNotMatch(html, /knowledge frontier/i);
  assert.doesNotMatch(html, /The graph infers/);
  assert.match(html, /See today’s lesson|Start today’s lesson/);
  assert.match(html, /At most six checks/);
  assert.match(html, /href="daily-router.html"/);
  assert.match(html, /OPTIONAL · HOW OFTEN YOU STUDY/);
  assert.match(js, /begin\.href = 'daily-router\.html'/);
  assert.match(js, /Start today’s lesson/);
  assert.doesNotMatch(js, /academy-session\.html\?skill=/);
  assert.doesNotMatch(js, /hebrew-decoding\.html/);
  assert.match(server, /Find where to start/);
  assert.match(server, /Start the questions/);
  assert.doesNotMatch(server, /Find your Gemara starting point/);
});

test('friend click path: unsigned diagnostic deep-link offers name signup, not a session-expired bounce', async () => {
  const [html, js, auth] = await Promise.all([
    read('diagnostic.html'), read('diagnostic.js'), read('seder-auth.js')
  ]);
  assert.match(html, /id="intro-cta"/);
  assert.match(html, /Pick a name to start/);
  assert.match(html, /sign-in\.html\?next=diagnostic\.html/);
  assert.match(js, /hostedSessionReady/);
  assert.match(js, /showSignupCta/);
  assert.match(js, /if \(!needsAuth\) return true/);
  assert.match(js, /if \(!Seder\.session\?\.access_token\)/);
  assert.match(js, /\/api\/graph\/diagnostic/);
  assert.match(js, /optional:\s*true/);
  assert.doesNotMatch(html, /Could you do this reliably right now\?/);
  assert.doesNotMatch(js, /Yes — I can do this reliably/);
  assert.match(auth, /optional:\s*true/);
  assert.match(auth, /!optional && !publicPages\.has/);
});

test('friend click path: Today is one lesson CTA, not Academy Foundation jargon', async () => {
  const [html, client, css] = await Promise.all([
    read('daily-router.html'), read('jla-next-action.js'), read('jla-next-action.css')
  ]);
  assert.match(html, /Finding today’s lesson/);
  assert.match(html, /One thing to do next/);
  assert.match(html, /Start this lesson/);
  assert.doesNotMatch(html, /Open Today →/);
  assert.doesNotMatch(html, /most useful next move/);
  assert.match(client, /jla-next-action__hint/);
  assert.match(client, /Then you’ll come back here/);
  assert.match(client, /Start the next lesson/);
  assert.match(client, /That’s the next short lesson if you want it/);
  assert.doesNotMatch(client, /This is the only thing to do right now/);
  assert.match(css, /jla-next-action__hint/);
  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-08' },
    foundationScores: {}
  }, graph);
  assert.ok(rec);
  assert.doesNotMatch(rec.title, /Academy Foundation ·/);
  assert.match(rec.reason, /About 15 minutes/);
  assert.match(rec.reason, /see a short source/i);
  assert.doesNotMatch(rec.reason, /You can say whether/);
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
  assert.match(html, /Continue on Today/);
  assert.match(html, /LESSON DONE/);
  assert.match(html, /Today has the next short lesson if you want it/);
  assert.match(html, /See your progress later/);
  assert.match(html, /href="daily-router.html"/);
  assert.doesNotMatch(html, /path\.html/);
  assert.doesNotMatch(html, /Open full text in Sefaria/);
  assert.doesNotMatch(html, /THIS CAPABILITY/);
  assert.doesNotMatch(html, /See this on Academy/);
  assert.match(js, /hideOutbound/);
  assert.match(js, /Continue on Today/);
  assert.match(js, /LESSON DONE/);
  assert.match(js, /Today has the next short lesson if you want it/);
  assert.doesNotMatch(js, /state\.blurb/);
  assert.doesNotMatch(js, /can make the move/);
  assert.doesNotMatch(lesson, /sefaria\.org\/search/);
  assert.doesNotMatch(lesson, /TODAY’S SOURCE WINDOW|TODAY'S SOURCE WINDOW/);
});
