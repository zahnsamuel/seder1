import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

// Client-JS behavior that can't be unit-tested without a browser, guarded by source patterns
// (the same approach as hosted-session-recovery.test.mjs). Kept loose so formatting churn is fine.

test('a first-time visitor gets the landing (not a bounce) and a sign-up CTA in token mode', async () => {
  const [auth, front] = await Promise.all([read('seder-auth.js'), read('seder.js')]);
  // Public pages are exempt from the 401 -> sign-in redirect, so an anonymous visitor is not bounced.
  assert.match(auth, /publicPages/);
  assert.match(auth, /'\/seder\.html'/);
  assert.match(auth, /!publicPages\.has\(location\.pathname\)/);
  // The front door routes an anonymous hosted visitor into sign-up rather than calling the learner API.
  assert.match(front, /needsAuth && !Seder\.session\?\.access_token/);
  assert.match(front, /Start learning/);
  assert.match(front, /sign-in\.html/);
});

test('interior pages still redirect a 401 into sign-in (deep links prompt sign-up)', async () => {
  const auth = await read('seder-auth.js');
  // The redirect still fires for non-public paths, carrying reason + next.
  assert.match(auth, /response\.status === 401 && requiresAuth && !publicPages\.has/);
  assert.match(auth, /reason', 'session-expired/);
  assert.match(auth, /signIn\.searchParams\.set\('next'/);
});

test('token accounts can be recovered with a recovery code', async () => {
  const [auth, signIn, profile] = await Promise.all([read('seder-auth.js'), read('sign-in.html'), read('profile.js')]);
  assert.match(auth, /Seder\.recoverWithToken/);
  assert.match(auth, /\/api\/auth\/session/); // recovery validates the code server-side
  assert.match(signIn, /recoverWithToken/);
  assert.match(signIn, /Have a recovery code/);
  assert.match(profile, /recovery-code/); // profile surfaces the code to save
});
