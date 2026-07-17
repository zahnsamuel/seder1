import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('hosted Seder directs unsigned learners into secure sign-in', async () => {
  const [page, script, signIn] = await Promise.all(['seder.html', 'hosted-sign-in-front-door.js', 'sign-in.html'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(page, /id="accountAction" href="sign-in\.html"/);
  assert.match(page, /hosted-sign-in-front-door\.js/);
  assert.match(script, /Seder\.config\(\)\.then/);
  assert.match(script, /action\.href = 'sign-in\.html'/);
  assert.match(script, /Sign in to begin/);
  assert.match(script, /private learning path awaits/);
  assert.match(signIn, /Send secure sign-in link/);
});
