import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

// Behavioral test of the APP-LAYER account-isolation guard (`learnerAccess` in server.mjs) — the
// runbook's layers 2-3 (supabase/README.md > "Account isolation verification"). It boots the REAL
// server in hosted mode against a FAKE Supabase auth endpoint, so the guard's real code path runs
// end-to-end over HTTP without a live project.
//
// Scope, stated honestly: this proves the server rejects unsigned and cross-account requests
// BEFORE any learner data is read or written. It does NOT (and cannot) prove the Postgres RLS
// backstop (runbook layer 4) — that still requires `npm run verify:isolation` against a real
// Supabase project. It complements test/hosted-auth-boundary.test.mjs (which only greps the
// source) with actual request/response behavior.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// Fake Supabase. /auth/v1/user maps a bearer token to a verified user (as the real
// verifySupabaseAccessToken would); an unknown token gets 401. /rest/v1/* returns [] so a
// same-account read resolves to an empty learner — a clean 200 positive control that confirms the
// guard lets the owner through rather than over-blocking.
const USERS = {
  'token-a': { id: 'uuid-a', email: 'a@example.test' },
  'token-b': { id: 'uuid-b', email: 'b@example.test' }
};

let fake;
let server;
let base;

function startFake() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      if (req.url.startsWith('/auth/v1/user')) {
        const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const user = USERS[token];
        if (!user) { res.writeHead(401, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'invalid token' })); return; }
        res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(user));
        return;
      }
      if (req.url.startsWith('/rest/v1/')) { res.writeHead(200, { 'content-type': 'application/json' }); res.end('[]'); return; }
      res.writeHead(404); res.end();
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

// Grab a free port, then hand it to the spawned server via PORT (server.mjs reads process.env.PORT).
function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

async function waitForHostedHealth(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`);
      if (r.ok) { const j = await r.json(); if (j.persistence === 'supabase-ready') return; }
    } catch { /* server not listening yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server did not come up in hosted mode within the timeout');
}

before(async () => {
  fake = await startFake();
  const fakePort = fake.address().port;
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SUPABASE_URL: `http://127.0.0.1:${fakePort}`, SUPABASE_ANON_KEY: 'test-anon-key', PORT: String(port) },
    stdio: 'ignore'
  });
  await waitForHostedHealth();
});

after(() => {
  if (server) server.kill();
  if (fake) fake.close();
});

test('hosted mode is actually active (health reports supabase-ready)', async () => {
  const res = await fetch(`${base}/api/health`);
  const body = await res.json();
  assert.equal(body.persistence, 'supabase-ready');
});

test('an unsigned learner request is rejected (401)', async () => {
  const res = await fetch(`${base}/api/learners/uuid-a`);
  assert.equal(res.status, 401);
});

test('an invalid/expired token is rejected (401)', async () => {
  const res = await fetch(`${base}/api/learners/uuid-a`, { headers: { Authorization: 'Bearer not-a-real-token' } });
  assert.equal(res.status, 401);
});

test("learner B cannot READ learner A's record (403)", async () => {
  const res = await fetch(`${base}/api/learners/uuid-a`, { headers: { Authorization: 'Bearer token-b' } });
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.match(body.error, /only access your own/i);
});

test("learner B cannot WRITE an event to learner A's record (403)", async () => {
  const res = await fetch(`${base}/api/learners/uuid-a/events`, {
    method: 'POST',
    headers: { Authorization: 'Bearer token-b', 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'answer_submitted', skillId: 'fnd-orient-source-type', correct: true })
  });
  assert.equal(res.status, 403);
});

test('learner A CAN access its own record (the guard allows the owner; 200)', async () => {
  const res = await fetch(`${base}/api/learners/uuid-a`, { headers: { Authorization: 'Bearer token-a' } });
  assert.equal(res.status, 200);
  const learner = await res.json();
  assert.equal(learner.id, 'uuid-a');
});
