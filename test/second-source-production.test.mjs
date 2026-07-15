import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship deep-reading units use a shuffled source-grounded comparison check', async () => {
  const [auth, production] = await Promise.all(['seder-auth.js', 'second-source-production.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /second-source-production\.js/);
  for (const tractate of ['pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(production, new RegExp(`\\b${tractate}\\b`));
  for (const phrase of ['SECOND SOURCE', 'EXPLANATION CHECK', 'second-source-explanation-', 'second_source_explanation', 'source_annotation', 'source-choice-set', 'Math.random']) assert.ok(production.includes(phrase), `missing ${phrase}`);
  assert.doesNotMatch(production, /textarea|at least eight words|Write at least one complete sentence/);
});
