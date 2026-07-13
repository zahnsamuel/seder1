import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Civil Reasoning accumulates the Bava Metzia and Bava Kamma reading habits', async () => {
  const [checkpoint, continuation] = await Promise.all(['civil-reasoning.js', 'gemara-continuation.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['civil-claims-evidence', 'civil-procedure-purpose', 'civil-category-difference', 'civil-common-principle']) assert.match(checkpoint, new RegExp(skill));
  assert.match(continuation, /civil-reasoning\.html/);
  assert.match(continuation, /bava-metzia-tractate-arc/);
  assert.match(continuation, /bava-kamma-tractate-arc/);
});
