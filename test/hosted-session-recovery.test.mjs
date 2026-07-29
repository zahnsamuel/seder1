import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('an expired hosted session returns a learner to sign-in and then to the interrupted page', async () => {
  const [auth, signIn] = await Promise.all(['seder-auth.js', 'sign-in.html'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(auth, /reason', 'session-expired/);
  assert.match(auth, /signIn\.searchParams\.set\('next'/);
  assert.match(auth, /localStorage\.removeItem\(authKey\)/);
  assert.match(auth, /const config = await Seder\.config\(\)/);
  assert.match(auth, /const requiresAuth = config\.mode === 'token' \|\| \(config\.supabaseUrl && config\.supabaseAnonKey\)/);
  assert.match(auth, /response\.status === 401 && requiresAuth/);
  assert.match(auth, /new URL\(next, location\.origin\)/);
  assert.match(auth, /safeNext\?\.origin === location\.origin/);
  assert.match(auth, /nextUrl \|\|= new URLSearchParams\(location\.search\)\.get\('next'\)/);
  assert.match(auth, /returnUrl\.searchParams\.set\('next', nextUrl\)/);
  assert.match(signIn, /Seder\.sendMagicLink\(data\.get\('email'\), data\.get\('name'\)\)/);
});
