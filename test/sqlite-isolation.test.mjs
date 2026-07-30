import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// End-to-end account-isolation proof for the SQLite hosted mode. Boots the REAL server against a
// throwaway SQLite file, signs up two learners over HTTP (each gets a bearer token), gives A real
// data to protect, then asserts that B — and an unsigned caller — cannot read, write, delete, or
// export A's record. Unlike the Supabase path, this needs no external service, so it runs in CI
// and locally as the actual isolation gate for this backend.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
let server, base, dir;
let A, B; // { id, token }

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

async function waitForSqliteHealth(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`);
      if (r.ok) { const j = await r.json(); if (j.persistence === 'sqlite-ready') return; }
    } catch { /* not listening yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server did not come up in sqlite-ready mode within the timeout');
}

async function signup(displayName) {
  const r = await fetch(`${base}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName })
  });
  assert.equal(r.status, 201, `signup(${displayName}) should return 201`);
  const body = await r.json();
  return { id: body.id, token: body.token };
}

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'seder-sqlite-iso-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 'pilot.db'), PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  await waitForSqliteHealth();
  A = await signup('Learner A');
  B = await signup('Learner B');
  // Give A a real answer so "B sees nothing" is a true isolation result, not a vacuous empty read.
  const rec = await fetch(`${base}/api/learners/${A.id}/events`, {
    method: 'POST', headers: { Authorization: `Bearer ${A.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'answer_submitted', skillId: 'skill-x', competency: 'recognition', correct: true })
  });
  assert.equal(rec.status, 201);
});

after(async () => {
  // Wait for the child to fully exit so Windows releases the SQLite/WAL file handles before we
  // remove the temp dir; tolerate a lingering lock (a temp dir the OS will reap) rather than fail.
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir; OS reaps it */ } }
});

test('signup issued two distinct learners and tokens', () => {
  assert.ok(A.id && B.id && A.id !== B.id);
  assert.ok(A.token && B.token && A.token !== B.token);
});

test('A can read its own record, and its recorded answer persisted (not vacuous)', async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`, { headers: { Authorization: `Bearer ${A.token}` } });
  assert.equal(res.status, 200);
  const learner = await res.json();
  assert.equal(learner.id, A.id);
  assert.equal(learner.xp, 10, "A's answer was persisted to SQLite");
});

test('an unsigned request is rejected (401)', async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`);
  assert.equal(res.status, 401);
});

test('an invalid token is rejected (401)', async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`, { headers: { Authorization: 'Bearer not-a-real-token' } });
  assert.equal(res.status, 401);
});

test("B cannot READ A's record (403)", async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`, { headers: { Authorization: `Bearer ${B.token}` } });
  assert.equal(res.status, 403);
  assert.match((await res.json()).error, /only access your own/i);
});

test("B cannot WRITE an event to A's record (403)", async () => {
  const res = await fetch(`${base}/api/learners/${A.id}/events`, {
    method: 'POST', headers: { Authorization: `Bearer ${B.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'answer_submitted', skillId: 'skill-x', correct: true })
  });
  assert.equal(res.status, 403);
});

test("B cannot EXPORT A's data (403)", async () => {
  const res = await fetch(`${base}/api/learners/${A.id}/export`, { headers: { Authorization: `Bearer ${B.token}` } });
  assert.equal(res.status, 403);
});

test('an unsigned DELETE is rejected (401) — no data erased without auth', async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`, { method: 'DELETE' });
  assert.equal(res.status, 401);
});

test("B cannot DELETE A's data (403)", async () => {
  const res = await fetch(`${base}/api/learners/${A.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${B.token}` } });
  assert.equal(res.status, 403);
  // And A's data is still intact afterwards.
  const check = await fetch(`${base}/api/learners/${A.id}`, { headers: { Authorization: `Bearer ${A.token}` } });
  assert.equal((await check.json()).xp, 10);
});

test('B reading its OWN record works and is empty of A\'s data (200)', async () => {
  const res = await fetch(`${base}/api/learners/${B.id}`, { headers: { Authorization: `Bearer ${B.token}` } });
  assert.equal(res.status, 200);
  const learner = await res.json();
  assert.equal(learner.id, B.id);
  assert.equal(learner.xp, 0, 'B has none of A\'s xp');
});

test('operator analytics is OFF when no admin token is configured (403, not a public leak)', async () => {
  // This server was started without SEDER_ADMIN_TOKEN, so cross-learner reporting must be disabled.
  const res = await fetch(`${base}/api/admin/analytics`);
  assert.equal(res.status, 403);
  assert.match((await res.json()).error, /SEDER_ADMIN_TOKEN|disabled/i);
});

test('the sign-up endpoint rate-limits a burst (429 past the per-IP cap, never 500)', async () => {
  // `before` already used 2 of the cap; keep signing up until the throttle trips.
  let got429 = false;
  for (let i = 0; i < 20 && !got429; i++) {
    const r = await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: `Burst ${i}` }) });
    if (r.status === 429) got429 = true; else assert.equal(r.status, 201, 'pre-cap sign-ups succeed');
  }
  assert.ok(got429, 'expected a 429 once the per-IP sign-up cap is exceeded');
});

test('A can delete its own data (owner allowed; 200), and its token is then revoked', async () => {
  const del = await fetch(`${base}/api/learners/${A.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${A.token}` } });
  assert.equal(del.status, 200);
  assert.equal((await del.json()).deleted, true);
  // Token revoked on delete: the same token no longer authenticates.
  const after = await fetch(`${base}/api/learners/${A.id}`, { headers: { Authorization: `Bearer ${A.token}` } });
  assert.equal(after.status, 401);
});
