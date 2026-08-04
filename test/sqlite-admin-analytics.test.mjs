import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Operator cohort analytics (/api/admin/analytics) in SQLite hosted mode: it reads across ALL
// learners, so it must require the operator admin token — and a learner's own token must not
// unlock it. Boots the real server with SEDER_ADMIN_TOKEN set.

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const ADMIN = 'test-admin-token-abc123';
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

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'seder-admin-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 'a.db'), SEDER_ADMIN_TOKEN: ADMIN, PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  await waitForSqliteHealth();
  learner = await (await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Cohort One' }) })).json();
  await fetch(`${base}/api/learners/${learner.id}/events`, { method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: 'skill-x', correct: true }) });
});

after(async () => {
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS reaps */ } }
});

test('operator analytics needs the admin token (unsigned and wrong-token rejected)', async () => {
  assert.equal((await fetch(`${base}/api/admin/analytics`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/analytics`, { headers: { Authorization: 'Bearer wrong' } })).status, 401);
});

test("a learner's own token does NOT unlock operator analytics", async () => {
  const res = await fetch(`${base}/api/admin/analytics`, { headers: { Authorization: `Bearer ${learner.token}` } });
  assert.equal(res.status, 401);
});

test('with the admin token, the operator sees cross-learner aggregates', async () => {
  const res = await fetch(`${base}/api/admin/analytics`, { headers: { Authorization: `Bearer ${ADMIN}` } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.available, true);
  assert.ok(data.totalLearners >= 1, 'cohort has the signed-up learner');
  assert.ok(data.totalAttempts >= 1, 'the recorded answer is counted');
  // The graph-pilot signal (item difficulty, edge validation) rides along for the dashboard.
  assert.ok(data.graphPilot && data.graphPilot.summary && Array.isArray(data.graphPilot.skills) && Array.isArray(data.graphPilot.edges), 'graph-pilot signal is included');
  assert.equal(data.graphPilot.summary.skillsTotal, 55, 'covers every graph skill');
});

test('learner feedback aggregates into operator analytics', async () => {
  await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'feedback', page: '/review.html', skillId: 'skill-x', sentiment: 'confusing', comment: 'the prompt was unclear' })
  });
  const data = await (await fetch(`${base}/api/admin/analytics`, { headers: { Authorization: `Bearer ${ADMIN}` } })).json();
  assert.ok(data.feedback && data.feedback.total >= 1, 'feedback is aggregated');
  assert.ok((data.feedback.bySentiment.confusing || 0) >= 1, 'counted by sentiment');
  assert.ok(data.feedback.recent.some((f) => f.comment === 'the prompt was unclear' && f.skillId === 'skill-x'), 'the comment is surfaced with context');
});

test('full flow over HTTP on SQLite: a JLA answer records graduation evidence + shows in analytics', async () => {
  const rec = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: { Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'answer_submitted', skillId: 'source-family-001', correct: true, jlaCapability: true, domain: 'source-navigation', graduationLevel: 'source-explorer', skillTitle: 'Recognize a source', evidenceStatement: 'I can recognize a source.', sourceRef: 'Genesis 1:1', sourceUrl: 'https://www.sefaria.org/Genesis.1.1' })
  });
  assert.equal(rec.status, 201);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: { Authorization: `Bearer ${learner.token}` } })).json();
  assert.ok((me.capabilityEvidence || []).some((e) => e.skillId === 'source-family-001' && e.status === 'earned'), 'graduation evidence persisted over HTTP');
  const pa = await (await fetch(`${base}/api/learners/${learner.id}/pilot-analytics`, { headers: { Authorization: `Bearer ${learner.token}` } })).json();
  assert.ok(pa.attempts >= 2, 'pilot-analytics counts the answers');
});
