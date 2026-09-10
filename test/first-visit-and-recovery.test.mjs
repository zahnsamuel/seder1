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
  // The redirect still fires for non-public paths, carrying reason + next — but not for
  // best-effort (`optional: true`) calls such as the app badge or milestones.
  assert.match(auth, /response\.status === 401 && requiresAuth && !optional && !publicPages\.has/);
  assert.match(auth, /reason', 'session-expired/);
  assert.match(auth, /signIn\.searchParams\.set\('next'/);
});

test('a 401 from badge or milestones cannot bounce a visitor off diagnostic', async () => {
  const [auth, milestones, diagnosticJs, diagnosticHtml] = await Promise.all([
    read('seder-auth.js'), read('milestones.js'), read('diagnostic.js'), read('diagnostic.html')
  ]);
  // Best-effort learner calls opt out of the session-expired redirect.
  assert.match(auth, /\{ optional = false/);
  assert.match(auth, /!optional && !publicPages\.has\(location\.pathname\)/);
  assert.match(auth, /updateAppBadge[\s\S]*session\?\.access_token/);
  assert.match(auth, /pilot-analytics[\s\S]*optional:\s*true/);
  assert.match(auth, /session\?\.access_token && !document\.querySelector\('script\[data-seder-milestones\]'\)/);
  assert.match(milestones, /session\?\.access_token/);
  assert.match(milestones, /optional:\s*true/);
  // Unsigned hosted visitors stay on diagnostic with a signup CTA instead of a bounce.
  assert.match(diagnosticJs, /hostedSessionReady/);
  assert.match(diagnosticJs, /if \(!needsAuth\) return true/);
  assert.match(diagnosticJs, /if \(!Seder\.session\?\.access_token\)/);
  assert.match(diagnosticJs, /\/api\/auth\/session/);
  assert.match(diagnosticJs, /optional:\s*true/);
  assert.match(diagnosticHtml, /id="intro-cta"/);
  assert.match(diagnosticHtml, /sign-in\.html\?next=diagnostic\.html/);
  assert.match(diagnosticHtml, /Pick a name to start/);
  assert.doesNotMatch(diagnosticJs, /Could you do this reliably/);
});

test('token accounts can be recovered with a recovery code', async () => {
  const [auth, signIn, profile] = await Promise.all([read('seder-auth.js'), read('sign-in.html'), read('profile.js')]);
  assert.match(auth, /Seder\.recoverWithToken/);
  assert.match(auth, /\/api\/auth\/session/); // recovery validates the code server-side
  assert.match(signIn, /recoverWithToken/);
  assert.match(signIn, /Have a recovery code/);
  assert.match(profile, /recovery-code/); // profile surfaces the code to save
});
