import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('gateway readers use substantive near-miss distractors rather than answer-length cues', async () => {
  const [daf, independent] = await Promise.all([
    readFile(new URL('../daf-literacy.js', import.meta.url), 'utf8'),
    readFile(new URL('../independent-read.js', import.meta.url), 'utf8')
  ]);
  assert.match(daf, /const dafSteps=window\.SederCourse\.steps/);
  assert.match(independent, /const independentSteps=window\.SederCourse\.steps/);
  assert.match(daf, /plausible page-reading errors/);
  assert.match(independent, /distinct reading mistake/);
});
