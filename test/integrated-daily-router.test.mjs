import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('daily router can deliberately return learners to Gemara alongside the wider canon', async () => {
  const source = await readFile(new URL('../daily-router.js', import.meta.url), 'utf8');
  assert.match(source, /gemaraCycle/);
  assert.match(source, /tractate-mastery\.html\?tractate=/);
  assert.match(source, /Today(?:&apos;|’|')s core source work is a Gemara move/);
});
