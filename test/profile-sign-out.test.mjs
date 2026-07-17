import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('secure learner profiles expose a sign-out action and hide local profile creation', async () => {
  const [page, script, auth] = await Promise.all(['profile.html', 'profile.js', 'seder-auth.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /id="sign-out" hidden>Sign out/);
  assert.match(page, /id="profile-note"/);
  assert.match(script, /#sign-out/);
  assert.match(script, /Seder\.signOut\(\)/);
  assert.match(script, /#new-profile'\)\.hidden = true/);
  assert.match(script, /secure learner account/);
  assert.match(auth, /auth\/v1\/logout/);
  assert.match(auth, /scope: 'local'/);
  assert.match(auth, /Authorization: `Bearer \$\{session\.access_token\}`/);
});
