import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('hosted Seder directs unsigned learners into secure sign-in', async () => {
  const [page, script, signIn] = await Promise.all(['seder.html', 'hosted-sign-in-front-door.js', 'sign-in.html'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  // The account link is now rendered by the shared app shell (jla-shell.js) from the mount's
  // data-links, so it appears as JSON on seder.html rather than a static <a>. Same guarantee:
  // an accountAction entry pointing at sign-in.html.
  assert.match(page, /"href":"sign-in\.html","id":"accountAction"/);
  assert.match(page, /hosted-sign-in-front-door\.js/);
  assert.match(script, /Seder\.config\(\)\.then/);
  assert.match(script, /action\.href = 'sign-in\.html'/);
  assert.match(script, /Sign in to begin/);
  assert.match(script, /private learning path awaits/);
  assert.match(signIn, /Send secure sign-in link/);
});
