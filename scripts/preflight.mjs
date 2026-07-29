#!/usr/bin/env node
// Launch preflight: run every automatable pilot-readiness gate and print one go/no-go,
// so you're not eyeballing docs/launch-checklist.md + docs/pilot-readiness.md by hand
// before inviting learners. Composes the existing tools; changes no state.
//
//   node scripts/preflight.mjs            # content + tests + (server gates if one is running)
//   SEDER_BASE_URL=https://your-app node scripts/preflight.mjs   # point at a deployed server
//
// Exit 0 = every automatable gate passed (manual gates still need your confirmation);
// exit 1 = at least one automatable gate is red. Run from the repo root.
import { execFileSync } from 'node:child_process';
import { auditAll } from './audit-content.mjs';

const gates = [];
const add = (name, status, detail) => gates.push({ name, status, detail }); // status: 'pass' | 'fail' | 'manual' | 'skip'

// --- Gate: content standard (no server needed) ---
try {
  const units = auditAll('.');
  const below = units.filter((u) => u.score < 8);
  add('Content standard — every unit ≥ 8', below.length === 0 ? 'pass' : 'fail',
    below.length === 0 ? `${units.length} units, all ≥ 8` : `${below.length} below 8: ${below.map((u) => `${u.id}(${u.score})`).join(', ')}`);
} catch (err) {
  add('Content standard — every unit ≥ 8', 'fail', `audit threw: ${err.message}`);
}

// --- Gate: foundational skill graph is structurally sound (no server needed) ---
try {
  const out = execFileSync(process.execPath, ['scripts/check-foundation-graph.mjs'], { cwd: '.', encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const count = (out.match(/skills (\d+)/) || [])[1];
  add('Foundational skill graph integrity', 'pass', `${count || 'all'} skills: ids/prereqs/cycles/reachability/contract ok`);
} catch (err) {
  const out = `${err.stdout || ''}${err.stderr || ''}`;
  const first = (out.match(/^  x .+$/m) || [])[0]?.trim();
  add('Foundational skill graph integrity', 'fail', first || 'check-foundation-graph.mjs reported errors');
}

// --- Gate: automated test suite ---
try {
  const out = execFileSync(process.execPath, ['--test'], { cwd: '.', encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const pass = (out.match(/^# pass (\d+)/m) || out.match(/pass (\d+)/) || [])[1];
  add('Automated test suite', 'pass', `${pass || 'all'} tests pass`);
} catch (err) {
  const out = `${err.stdout || ''}${err.stderr || ''}`;
  const fail = (out.match(/^# fail (\d+)/m) || out.match(/fail (\d+)/) || [])[1];
  const failing = [...out.matchAll(/^# Subtest: (.+)$/gm)].slice(0, 3).map((m) => m[1]);
  add('Automated test suite', 'fail', `${fail || 'some'} tests failing${failing.length ? ` (e.g. ${failing.join('; ')})` : ''}`);
}

// --- Gates: server-dependent (only if a server answers) ---
const base = (process.env.SEDER_BASE_URL || 'http://127.0.0.1:4180').replace(/\/$/, '');
let health = null;
try {
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(4000) });
  health = res.ok ? await res.json() : null;
} catch { /* server not running */ }

if (!health) {
  add(`Server reachable (${base})`, 'skip', 'no server answered — start `npm start` (or set SEDER_BASE_URL) to include the server gates');
} else {
  add(`Server reachable (${base})`, 'pass', `health: ${health.status}`);
  const hostedPersistence = health.persistence === 'supabase-ready' || health.persistence === 'sqlite-ready';
  add('Persistence is hosted (supabase-ready or sqlite-ready)', hostedPersistence ? 'pass' : 'fail',
    `persistence: ${health.persistence}${hostedPersistence ? '' : ' — a real pilot must run in hosted mode, not local (shared demo learner)'}`);
  // smoke a few learner-facing routes
  const routes = [
    '/seder.html', '/demo.html', '/sign-in.html', '/placement.html', '/daily-router.html', '/path.html',
    '/lab.html?tractate=shabbat', '/profile.html', '/privacy.html', '/terms.html', '/support.html'
  ];
  const bad = [];
  for (const r of routes) {
    try { const res = await fetch(`${base}${r}`, { signal: AbortSignal.timeout(4000) }); if (!res.ok) bad.push(`${r}=${res.status}`); }
    catch (e) { bad.push(`${r}=${e.name}`); }
  }
  add('Key learner routes serve 200', bad.length === 0 ? 'pass' : 'fail', bad.length === 0 ? `${routes.length}/${routes.length} ok` : `failing: ${bad.join(', ')}`);
  const trustPages = [
    ['/privacy.html', ['Learner privacy', 'export', 'delete']],
    ['/terms.html', ['Terms of use', 'halakhic rulings', 'support']],
    ['/support.html', ['Support', 'mailto:', 'Data requests']]
  ];
  const missingTrust = [];
  for (const [route, markers] of trustPages) {
    try {
      const text = await (await fetch(`${base}${route}`, { signal: AbortSignal.timeout(4000) })).text();
      if (markers.some((marker) => !text.toLowerCase().includes(marker.toLowerCase()))) missingTrust.push(route);
    } catch { missingTrust.push(route); }
  }
  add('Trust pages contain required learner promises', missingTrust.length === 0 ? 'pass' : 'fail', missingTrust.length === 0 ? `${trustPages.length}/${trustPages.length} checked` : `incomplete: ${missingTrust.join(', ')}`);
  const a11yRoutes = ['/seder.html', '/sign-in.html', '/placement.html', '/daily-router.html', '/path.html', '/profile.html'];
  const a11yBad = [];
  for (const route of a11yRoutes) {
    try {
      const text = await (await fetch(`${base}${route}`, { signal: AbortSignal.timeout(4000) })).text();
      if (!/<html[^>]+lang=["'][^"']+/.test(text) || !/<meta[^>]+name=["']viewport["']/.test(text) || !/<title>[^<]+<\/title>/.test(text)) a11yBad.push(route);
    } catch { a11yBad.push(route); }
  }
  add('Accessible document basics', a11yBad.length === 0 ? 'pass' : 'fail', a11yBad.length === 0 ? `${a11yRoutes.length}/${a11yRoutes.length} checked` : `missing metadata: ${a11yBad.join(', ')}`);
}

// --- Manual gates (cannot be auto-verified here) ---
if (health?.persistence === 'sqlite-ready') {
  add('Account isolation verified', 'pass', 'SQLite hosted mode — covered by test/sqlite-isolation.test.mjs in the suite above (real server, two learners, cross-access refused)');
} else {
  add('Account isolation verified live', 'manual', 'run `npm run verify:isolation` against the real Supabase project (needs two test accounts + creds)');
}
add('Human read of privacy / terms / support', 'manual', 'tone + legal accuracy — a person, not Claude (see docs/launch-checklist.md)');

// --- Report ---
const icon = { pass: '\x1b[32m✓\x1b[0m', fail: '\x1b[31m✗\x1b[0m', manual: '\x1b[33m•\x1b[0m', skip: '\x1b[90m–\x1b[0m' };
console.log('\nSeder launch preflight\n' + '─'.repeat(60));
for (const g of gates) console.log(`  ${icon[g.status]} ${g.name}\n      ${g.detail}`);
console.log('─'.repeat(60));

const failed = gates.filter((g) => g.status === 'fail');
const manual = gates.filter((g) => g.status === 'manual');
const skipped = gates.filter((g) => g.status === 'skip');
if (failed.length === 0) {
  console.log('\x1b[32mAutomatable gates: GO.\x1b[0m ' +
    `${manual.length} manual gate(s) still need your confirmation${skipped.length ? `; ${skipped.length} skipped (no server)` : ''}.`);
} else {
  console.log(`\x1b[31mNOT READY: ${failed.length} gate(s) red —\x1b[0m ${failed.map((g) => g.name).join('; ')}.`);
}

// Close global fetch's keep-alive pool before exit. On Windows, exiting with those undici
// sockets still open trips a libuv assertion and corrupts the exit code, so drain and let the
// process exit naturally via process.exitCode (never process.exit here).
try {
  const dispatcher = globalThis[Symbol.for('undici.globalDispatcher.1')];
  if (dispatcher && typeof dispatcher.close === 'function') await dispatcher.close();
} catch { /* fall back to keep-alive timeout draining the loop */ }
process.exitCode = failed.length === 0 ? 0 : 1;
