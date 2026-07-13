import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Daf map captures a learner explanation and keeps it as a study artifact', async () => {
  const source = await readFile(new URL('../daf-argument-map.js', import.meta.url), 'utf8');
  for (const phrase of ['Explain one transition in this sugya', 'seder-daf-map-explanation-', 'source_map_explanation']) assert.match(source, new RegExp(phrase));
});

test('practice and transfer routes are ready to focus on a wider-canon domain', async () => {
  const source = await readFile(new URL('../canon-practice-lab.js', import.meta.url), 'utf8');
  assert.match(source, /requestedSubject/);
  assert.match(source, /URLSearchParams/);
});

test('global focus visibility and production readiness documentation are present', async () => {
  const [auth, readiness, qa] = await Promise.all(['seder-auth.js', 'docs/production-readiness.md', 'docs/ux-accessibility-qa.md'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /focus-visible/);
  assert.match(readiness, /001.*006/s);
  assert.match(readiness, /supabase-ready/);
  assert.match(qa, /390px/);
});
