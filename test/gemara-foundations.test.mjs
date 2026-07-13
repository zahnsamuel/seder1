import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Gemara Foundations interleaves three tractate habits and captures a typed reading plan', async () => {
  const [source, continuation] = await Promise.all(['gemara-foundations.js', 'gemara-continuation.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['foundations-word-context', 'foundations-measure-case', 'foundations-purpose-reasons', 'foundations-formulation', 'foundations-evidence-chain', 'foundations-typed-synthesis']) assert.match(source, new RegExp(skill));
  assert.match(source, /at least 25 words/);
  assert.match(source, /gemara_foundations_explanation/);
  assert.match(continuation, /gemara-foundations\.html/);
});
