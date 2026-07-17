import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('a fresh learner creates a private local profile before placement', async () => {
  const [page, script] = await Promise.all(['profile.html', 'profile.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /Create learner profile/);
  assert.match(page, /first placement takes about three minutes/);
  assert.match(script, /get\('next'\)/);
  assert.match(script, /requestedNext === 'placement'/);
  assert.match(script, /location\.href = 'placement\.html'/);
  assert.match(script, /Create profile and find my starting point/);
});
