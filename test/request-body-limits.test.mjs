import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The public POST endpoints buffer and JSON-parse the request body. These guard against two things
// on the live pilot URL: an oversized body (a cheap memory-exhaustion DoS) is rejected 413, and a
// malformed body is the caller's error (400 with a clean message), not a server 500. Both fire in
// readJsonBody before any auth, so /api/auth/signup exercises them without a token.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
let server, base, dir;

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'seder-body-limits-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 'pilot.db'), PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try { const r = await fetch(`${base}/api/health`); if (r.ok && (await r.json()).persistence === 'sqlite-ready') break; }
    catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }
});

after(async () => {
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ } }
});

test('a malformed JSON body is rejected 400, not 500', async () => {
  const res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{ not valid json'
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /valid JSON/);
});

test('an oversized body is rejected 413', async () => {
  // 512 KB — over the 256 KB cap. Valid JSON, so only the size guard can reject it.
  const huge = JSON.stringify({ displayName: 'x'.repeat(512 * 1024) });
  const res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: huge
  });
  assert.equal(res.status, 413);
  const body = await res.json();
  assert.match(body.error, /too large/);
});

test('a normal small body still works (guard does not over-reject)', async () => {
  const res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Body Limit Learner' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.ok(body.id && body.token);
});
