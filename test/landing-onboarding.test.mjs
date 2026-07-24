import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('landing page makes daily study and the learner journey explicit', async () => {
  const html = await readFile(new URL('../seder.html', import.meta.url), 'utf8');
  // Front door simplified to one clear entry: daily study + secure sign-in (mentor reset).
  assert.match(html, /Today’s Study/);
  assert.match(html, /sign-in\.html/);
  assert.match(html, /onboarding\.js/);
  // The extra top-level destinations were removed from the front door to cut cognitive load.
  for (const removed of ['8-Week Path', 'href="course-dashboard\\.html"', 'Open the full six-level journey']) assert.doesNotMatch(html, new RegExp(removed));
});

test('first-time orientation explains the mastery loop and can be dismissed', async () => {
  const source = await readFile(new URL('../onboarding.js', import.meta.url), 'utf8');
  for (const phrase of ['WELCOME TO THE ACADEMY', 'See why it is next', 'Return until it transfers', 'seder-onboarding-seen-v1', 'Got it']) assert.match(source, new RegExp(phrase));
});
