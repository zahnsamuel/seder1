#!/usr/bin/env node
// Go-live check: verify a running JLA instance is pilot-ready. Hits a live base URL and exercises the
// pilot-critical paths end to end — health (confirms SQLite hosted mode), learner signup, a recorded
// answer, recommendation + review, the adaptive diagnostic, feedback capture, account ISOLATION (one
// learner must not be able to read another's data), and the admin-gated cohort analytics (with and
// without the operator token). Prints PASS/FAIL per check and exits non-zero on any failure, so it can
// gate a deploy. Read-only-ish: it creates two throwaway pilot learners.
//
//   node scripts/go-live-check.mjs [baseUrl]                              (default http://localhost:PORT)
//   SEDER_ADMIN_TOKEN=… node scripts/go-live-check.mjs https://your-app.onrender.com
const base = (process.argv[2] || `http://localhost:${process.env.PORT || 4180}`).replace(/\/$/, '');
const admin = process.env.SEDER_ADMIN_TOKEN || '';

const results = [];
let failed = 0;
async function check(name, fn) {
  try { results.push(['PASS', name, (await fn()) || '']); }
  catch (e) { failed++; results.push(['FAIL', name, e.message]); }
}
const body = async (res) => { const t = await res.text(); try { return JSON.parse(t); } catch { return t; } };
const post = (path, data, token) => fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(data) });
const get = (path, token) => fetch(`${base}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

let A, B;
await check('health reports SQLite hosted mode', async () => {
  const res = await get('/api/health'); const d = await body(res);
  if (!res.ok) throw new Error(`status ${res.status}`);
  if (d.persistence !== 'sqlite-ready') throw new Error(`persistence is "${d.persistence}", expected sqlite-ready — is SEDER_DB set?`);
  return `commit ${d.commit || 'n/a'}`;
});
await check('learner signup issues a token', async () => {
  A = await body(await post('/api/auth/signup', { displayName: 'Go-Live A' }));
  if (!A || !A.id || !A.token) throw new Error('no id/token returned'); return A.id;
});
await check('a recorded answer is accepted', async () => {
  const res = await post(`/api/learners/${A.id}/events`, { type: 'answer_submitted', skillId: 'fnd-arg-claim', correct: true, sourceContext: 'go-live' }, A.token);
  if (res.status !== 201) throw new Error(`status ${res.status}`);
});
await check('recommendation and review load', async () => {
  const [rec, rev] = await Promise.all([get(`/api/learners/${A.id}/recommendation`, A.token), get(`/api/learners/${A.id}/review`, A.token)]);
  if (!rec.ok || !rev.ok) throw new Error(`recommendation ${rec.status}, review ${rev.status}`);
});
await check('adaptive diagnostic responds', async () => {
  const d = await body(await post('/api/graph/diagnostic', { responses: {} }));
  if (!d || (!d.nextProbe && !d.complete)) throw new Error('no probe or completion returned');
  return d.nextProbe ? `first probe ${d.nextProbe.id}` : 'complete';
});
await check('feedback is accepted', async () => {
  const res = await post(`/api/learners/${A.id}/events`, { type: 'feedback', page: '/go-live', sentiment: 'great', comment: 'go-live check' }, A.token);
  if (res.status !== 201) throw new Error(`status ${res.status}`);
});
await check('account isolation: one learner cannot read another', async () => {
  B = await body(await post('/api/auth/signup', { displayName: 'Go-Live B' }));
  if (!B || !B.token) throw new Error('B signup failed');
  const res = await get(`/api/learners/${A.id}`, B.token);
  if (res.ok) throw new Error(`B READ A's data (status ${res.status}) — ISOLATION IS BROKEN`);
  return `B blocked with ${res.status}`;
});
await check('operator analytics is gated (no token rejected)', async () => {
  const res = await get('/api/admin/analytics');
  if (res.status !== 401 && res.status !== 403) throw new Error(`expected 401/403, got ${res.status}`);
});
if (admin) {
  await check('operator analytics works with the admin token', async () => {
    const res = await get('/api/admin/analytics', admin); const d = await body(res);
    if (!res.ok || !d.available) throw new Error(`status ${res.status}, available=${d && d.available}`);
    if (!d.graphPilot || !d.feedback) throw new Error('missing graphPilot / feedback signal');
    return `${d.totalLearners} learners · ${d.feedback.total} feedback · ${d.graphPilot.summary.skillsTotal} graph skills`;
  });
} else {
  results.push(['SKIP', 'operator analytics with admin token', 'set SEDER_ADMIN_TOKEN to include this check']);
}

// Clean up after ourselves — self-delete the throwaway learners via their own tokens (the DELETE
// /api/learners/:id endpoint), so a go-live run never leaves test accounts in the pilot DB. Best-
// effort: a cleanup hiccup is reported but never fails the readiness gate.
try {
  const del = (id, token) => fetch(`${base}/api/learners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  const a = A && A.token ? await del(A.id, A.token) : null;
  const b = B && B.token ? await del(B.id, B.token) : null;
  const ok = (!a || a.ok) && (!b || b.ok);
  results.push([ok ? 'PASS' : 'SKIP', 'throwaway learners cleaned up', `${A ? A.id : ''}${B ? ' + ' + B.id : ''}`]);
} catch (error) {
  results.push(['SKIP', 'throwaway learner cleanup', `could not delete: ${error.message}`]);
}

const color = { PASS: '\x1b[32m✓\x1b[0m', FAIL: '\x1b[31m✗\x1b[0m', SKIP: '\x1b[33m∙\x1b[0m' };
console.log(`\nGo-live check · ${base}\n`);
for (const [status, name, detail] of results) console.log(`  ${color[status]} ${status.padEnd(4)} ${name}${detail ? `  — ${detail}` : ''}`);
console.log(failed ? `\n\x1b[31m${failed} check(s) failed — NOT go-live ready.\x1b[0m` : `\n\x1b[32mAll checks passed — ${base} is pilot-ready.\x1b[0m`);
process.exit(failed ? 1 : 0);
