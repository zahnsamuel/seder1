import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('learner-facing Today links use the evidence-led daily router', async () => {
  const [auth, profile, path, daily] = await Promise.all(['seder-auth.js', 'profile.html', 'path.js', 'daily.html'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /querySelectorAll\('a\[href="today\.html"\]'\)/);
  assert.match(auth, /link\.href = 'daily-router\.html'/);
  assert.match(profile, /href="daily-router\.html">Today/);
  assert.match(path, /daily\.href = 'daily-router\.html'/);
  assert.match(daily, /daily-router\.html/);
});
