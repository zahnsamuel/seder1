import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Server-side scoring for JLA academy answers: the session is served with the answer key stripped,
// and correctness + graduation evidence are computed on the server from the shipped data — never
// trusted from the client. Boots the real SQLite server.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
let server, base, dir, learner;

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
    try { const r = await fetch(`${base}/api/health`); if (r.ok && (await r.json()).persistence === 'sqlite-ready') return; }
    catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server did not reach sqlite-ready');
}
const auth = () => ({ Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' });

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'seder-scoring-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 's.db'), PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  await waitForSqliteHealth();
  learner = await (await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Scorer' }) })).json();
});
after(async () => {
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS reaps */ } }
});

test('GET session ships no answer key (no correctChoiceId, no feedback) and includes the domain', async () => {
  const res = await fetch(`${base}/api/jla/academy-session/source-family-001`);
  assert.equal(res.status, 200);
  const session = await res.json();
  assert.equal('correctChoiceId' in session, false, 'answer key is not exposed');
  assert.equal('feedback' in session, false, 'feedback text is not exposed');
  assert.ok(Array.isArray(session.choices) && session.choices.length >= 2);
  assert.ok(session.choices.every((c) => !('correct' in c)));
  assert.equal(session.domain, 'source-navigation');
});

test('the raw answer-key file is not reachable over HTTP (served only via the stripped endpoint)', async () => {
  const res = await fetch(`${base}/data/jla-academy-sessions.json`);
  assert.equal(res.status, 404);
});

test('a correct answer scores true server-side and records earned graduation evidence', async () => {
  const res = await fetch(`${base}/api/jla/academy-session/source-family-001/answer`, { method: 'POST', headers: auth(), body: JSON.stringify({ choiceId: 'name-family' }) });
  assert.equal(res.status, 201);
  const result = await res.json();
  assert.equal(result.correct, true);
  assert.match(result.feedback, /\S/);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: auth() })).json();
  const evidence = (me.capabilityEvidence || []).find((e) => e.skillId === 'source-family-001');
  assert.ok(evidence && evidence.status === 'earned', 'evidence recorded server-side, not client-asserted');
});

test('a wrong answer scores false (client cannot fake correctness)', async () => {
  const learner2 = await (await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Wrong' }) })).json();
  const res = await fetch(`${base}/api/jla/academy-session/source-family-001/answer`, { method: 'POST', headers: { Authorization: `Bearer ${learner2.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ choiceId: 'seek-ruling' }) });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).correct, false);
});

test('scoring requires authentication (unsigned answer → 401)', async () => {
  const res = await fetch(`${base}/api/jla/academy-session/source-family-001/answer`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choiceId: 'name-family' }) });
  assert.equal(res.status, 401);
});

test('unknown choice → 400, unknown skill → 404', async () => {
  const badChoice = await fetch(`${base}/api/jla/academy-session/source-family-001/answer`, { method: 'POST', headers: auth(), body: JSON.stringify({ choiceId: 'nope' }) });
  assert.equal(badChoice.status, 400);
  const badSkillGet = await fetch(`${base}/api/jla/academy-session/does-not-exist`);
  assert.equal(badSkillGet.status, 404);
});
