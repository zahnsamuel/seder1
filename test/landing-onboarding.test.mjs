import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('landing page makes daily study and the learner journey explicit', async () => {
  const html = await readFile(new URL('../seder.html', import.meta.url), 'utf8');
  for (const label of ['Today’s Study', 'My Journey', 'Gemara', 'Courses']) assert.match(html, new RegExp(label));
  assert.match(html, /onboarding\.js/);
});

test('first-time orientation explains the mastery loop and can be dismissed', async () => {
  const source = await readFile(new URL('../onboarding.js', import.meta.url), 'utf8');
  for (const phrase of ['WELCOME TO SEDER', 'See why it is next', 'Return until it transfers', 'seder-onboarding-seen-v1', 'Got it']) assert.match(source, new RegExp(phrase));
});
