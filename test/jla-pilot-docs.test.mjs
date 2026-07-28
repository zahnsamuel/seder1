import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const observation = await read('../docs/jla-pilot-observation-sheet.md');
const survey = await read('../docs/jla-pilot-survey.md');
const criteria = await read('../docs/jla-pilot-success-criteria.md');

test('pilot observation captures the complete 0-to-1 learner flow', () => {
  for (const moment of [
    'placement',
    'capability profile',
    'one next step',
    'source window',
    'guided check',
    'I can'
  ]) {
    assert.match(observation.toLowerCase(), new RegExp(moment.toLowerCase()));
  }
  assert.match(observation, /Cognitive-load checks/);
  assert.match(observation, /Jewish-learning dignity checks/);
  assert.match(observation, /Keep:/);
  assert.match(observation, /Simplify:/);
});

test('pilot survey measures clarity, capability, confidence, rhythm, and return intent', () => {
  for (const signal of [
    'what to do next',
    'one manageable learning task',
    'regardless of how much Jewish education',
    'After today, I can',
    'ordinary week',
    'return for another session'
  ]) {
    assert.match(survey, new RegExp(signal, 'i'));
  }
  assert.doesNotMatch(survey, /required denominational identity/i);
});

test('pilot success criteria are quantitative and protect trust', () => {
  assert.match(criteria, /Two-account isolation verification passes/);
  assert.match(criteria, /At least 80%/);
  assert.match(criteria, /At least 75%/);
  assert.match(criteria, /at least 1 point above baseline/i);
  assert.match(criteria, /three non-Gemara source families/i);
  assert.match(criteria, /Stop and repair conditions/);
  assert.match(criteria, /seven of the\s+ten outcome thresholds/i);
});
