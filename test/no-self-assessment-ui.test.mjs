import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STEP_CHROME, practiceLine } from '../academy-session-lesson.mjs';

const load = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

// Learner-facing surfaces named in the 0→1 audit: practice, academy, path, evidence, map.
// Diagnostic self-ratings are out of scope (placement PR). Do not scan diagnostic.* here.
const SURFACES = [
  'jla-practice.html',
  'jla-practice.js',
  'academy.html',
  'academy.js',
  'academy-session.html',
  'academy-session.js',
  'academy-session-lesson.mjs',
  'academy-evidence.html',
  'academy-evidence.js',
  'academy-next.html',
  'academy-next.js',
  'path.html',
  'path.js',
  'my-graph.html',
  'my-graph.js',
  'adaptive-gemara-map.html',
  'adaptive-gemara-map.js',
  'source-map.html',
  'source-map.js'
];

const SELF_ASSESSMENT_UI = [
  ['I can see it CTA', /I can see it/i],
  ['Could you do this', /Could you do this/i],
  ['I can do this reliably', /I can do this reliably/i],
  ['Not reliably yet option', /Not reliably yet/i],
  ['reliably right now', /reliably right now/i],
  ['how confident', /how confident/i],
  ['self-assess', /self-assess/i],
  ['Yes — I can', /Yes — I can/i],
  ['You will practice I can', /You'll practice:\s*I can /i],
  ['You will practice You can', /You'll practice:\s*You can /i],
  ['Where you are: I-can milestone', /Where you are:/],
  ['Not sure where you are', /Not sure where you are/i],
  ['Can you use the move again', /Can you use the move again/i]
];

test('practice / academy / path / evidence / map have no leftover self-assessment UI', async () => {
  for (const file of SURFACES) {
    const source = await load(file);
    for (const [label, pattern] of SELF_ASSESSMENT_UI) {
      assert.doesNotMatch(source, pattern, `${file} still has ${label}`);
    }
  }
});

test('See-it continue teaches then asks; Try-it does not self-rate', () => {
  assert.equal(STEP_CHROME.introduce.next, 'Try it →');
  assert.equal(STEP_CHROME.introduce.continueTeach, 'Got it — ask me');
  assert.doesNotMatch(STEP_CHROME.introduce.next, /I can/i);
  assert.doesNotMatch(practiceLine('I can recognize a Jewish source family before I interpret it.'), /I can /i);
  assert.doesNotMatch(practiceLine('You can say whether a source is Torah.'), /You can /i);
});

test('Academy 90-day chrome names the stretch, not an unearned I-can claim', async () => {
  const source = await load('academy.js');
  assert.match(source, /This stretch trains:/);
  assert.doesNotMatch(source, /'I can /);
  assert.match(source, /not this placement alone/);
});

test('My Path says evidence, not self-report, moves the path', async () => {
  const js = await load('path.js');
  assert.match(js, /evidence, not self-report/);
});
