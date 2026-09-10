import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { STARTER_SKILL_IDS, foundationSessionHref } from '../data/next-action.mjs';
import { buildJlaPlacementResult } from '../jla-placement-router.js';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const starterDoc = JSON.parse(readFileSync(new URL('../data/foundation-starter-set.json', import.meta.url), 'utf8'));
const starterIds = new Set(starterDoc.starterSet.map((skill) => skill.id));
const frozenIds = new Set(starterDoc.frozen.map((skill) => skill.id));
const starterThrough = (maxLayer) => starterDoc.starterSet.filter((skill) => skill.layer <= maxLayer).map((skill) => skill.id);
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const sliceSkills = JSON.parse(readFileSync(new URL('../data/jla-foundation-skill-slice.json', import.meta.url), 'utf8'));
const sliceIds = new Set(sliceSkills.map((skill) => skill.id));
const { map: graduationMap } = JSON.parse(readFileSync(new URL('../data/graduation-skill-map.json', import.meta.url), 'utf8'));

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

let server, base, dir;
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
  dir = mkdtempSync(join(tmpdir(), 'seder-place-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 's.db'), PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  await waitForSqliteHealth();
});
after(async () => {
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS reaps */ } }
});

const signup = async (name) => (await fetch(`${base}/api/auth/signup`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: name })
})).json();
const auth = (learner) => ({ Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' });
const isLiveSession = (href) => href === 'hebrew-decoding.html' || (typeof href === 'string' && href.startsWith('academy-session.html?skill=fnd-'));

test('diagnostic API probes fnd- skills, never graduation-slice ids', async () => {
  const data = await (await fetch(`${base}/api/graph/diagnostic`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ responses: {} })
  })).json();
  assert.ok(data.nextProbe?.id);
  assert.match(data.nextProbe.id, /^fnd-/);
  assert.ok(!sliceIds.has(data.nextProbe.id));
  assert.ok(!data.nextProbe.id.startsWith('fnd-decode-'), 'placement does not invent L0 glyph checks');
  assert.ok(data.nextProbe.item?.stem);
  assert.ok(Array.isArray(data.nextProbe.item.choices) && data.nextProbe.item.choices.length >= 2);
  assert.equal(typeof data.nextProbe.item.correct, 'number');
  assert.doesNotMatch(JSON.stringify(data.nextProbe), /Could you do this reliably/);
  assert.ok((data.estimate.frontier || []).every((id) => id.startsWith('fnd-')));
  assert.equal(data.maxProbes, 6);
  assert.equal(data.complete, false);
});

test('anonymous hosted learner APIs 401 while diagnostic still returns authored MC probes', async () => {
  const learner = await fetch(`${base}/api/learners/demo`);
  assert.equal(learner.status, 401);
  const analytics = await fetch(`${base}/api/learners/demo/pilot-analytics`);
  assert.equal(analytics.status, 401);
  const events = await fetch(`${base}/api/learners/demo/events`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'placement_completed', scores: {} })
  });
  assert.equal(events.status, 401);
  const signed = await signup('Friend Deep Link');
  const data = await (await fetch(`${base}/api/graph/diagnostic`, {
    method: 'POST',
    headers: auth(signed),
    body: JSON.stringify({ responses: {} })
  })).json();
  assert.ok(data.nextProbe?.item?.stem);
  assert.ok(Array.isArray(data.nextProbe.item.choices) && data.nextProbe.item.choices.length >= 2);
  assert.equal(typeof data.nextProbe.item.correct, 'number');
  assert.equal(data.nextProbe.check, undefined);
  assert.doesNotMatch(JSON.stringify(data.nextProbe), /Could you do this reliably/);
});

test('first-day diagnostic API completes at the probe cap', async () => {
  const responses = {};
  let last = null;
  for (let i = 0; i < 12; i++) {
    last = await (await fetch(`${base}/api/graph/diagnostic`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ responses })
    })).json();
    assert.equal(last.maxProbes, 6);
    if (last.complete || !last.nextProbe) break;
    assert.match(last.nextProbe.id, /^fnd-/);
    responses[last.nextProbe.id] = false;
  }
  assert.ok(last);
  assert.equal(last.complete, true);
  assert.equal(last.nextProbe, null);
  assert.ok(Object.keys(responses).length <= 6, `asked ${Object.keys(responses).length}`);
  assert.ok((last.estimate.frontier || []).length > 0);
});

test('a placed beginner next-action cites the same fnd- start as the placement CTA', async () => {
  const learner = await signup('Place Beginner');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'placement_completed', source: 'adaptive-diagnostic', scores: {}, foundationScores: {} })
  });
  assert.equal(placed.status, 201);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: auth(learner) })).json();
  const expected = buildJlaPlacementResult({ graph, foundationScores: me.foundationScores || {} });
  assert.match(me.placement.recommendedSkill, /^fnd-/);
  assert.equal(me.placement.recommendedSkill, expected.skillId);
  assert.ok(!sliceIds.has(me.placement.recommendedSkill));
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.skillId, expected.skillId);
  assert.equal(action.href, expected.firstSession);
  assert.equal(action.href, foundationSessionHref(action.skillId));
  assert.ok(isLiveSession(action.href));
  assert.ok(!sliceIds.has(action.skillId));
});

test('legacy slice-id placement scores rewrite onto fnd- and still open a live session', async () => {
  const learner = await signup('Place Slice');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({
      type: 'placement_completed',
      scores: { 'source-family-001': 0.9 },
      recommendedSkill: 'source-family-001'
    })
  });
  assert.equal(placed.status, 201);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: auth(learner) })).json();
  assert.equal(me.placement.scores['source-family-001'], undefined);
  assert.ok(me.placement.scores['fnd-orient-source-type'] >= 0.8);
  assert.match(me.placement.recommendedSkill, /^fnd-/);
  assert.notEqual(me.placement.recommendedSkill, 'source-family-001');
  const mapped = graduationMap['source-family-001'].graphSkill;
  assert.ok(me.foundationScores[mapped] >= 0.8 || me.mastery[mapped] >= 0.8);
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.match(action.skillId, /^fnd-/);
  assert.ok(!sliceIds.has(action.skillId));
  assert.ok(isLiveSession(action.href));
  assert.doesNotMatch(action.href, /source-family-001/);
  const expected = buildJlaPlacementResult({
    graph,
    foundationScores: { ...(me.foundationScores || {}), ...(me.placement.scores || {}) }
  });
  assert.equal(action.skillId, expected.skillId);
  assert.equal(action.href, expected.firstSession);
});

test('after decode skip/complete, next-action teaches fnd-orient-source-type not hebrew-decoding', async () => {
  const learner = await signup('Decode Then Orient');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: {} })
  });
  assert.equal(placed.status, 201);
  const before = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(before.href, 'hebrew-decoding.html');

  const done = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'decoding_completed' })
  });
  assert.equal(done.status, 201);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: auth(learner) })).json();
  assert.ok(me.mastery['fnd-decode-word'] >= 0.8);
  assert.ok(me.foundationScores['fnd-decode-word'] >= 0.8);
  assert.equal((me.reviewQueue || []).some((item) => String(item.skillId).startsWith('fnd-decode-')), false);

  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.type, 'foundation');
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal(action.href, 'academy-session.html?skill=fnd-orient-source-type');
});

test('due-now decode reviews after fake glyph answers still yield the non-L0 session', async () => {
  const learner = await signup('Decode Review Bounce');
  await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: {} })
  });
  for (const skillId of ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word']) {
    for (let i = 0; i < 2; i += 1) {
      const posted = await fetch(`${base}/api/learners/${learner.id}/events`, {
        method: 'POST', headers: auth(learner),
        body: JSON.stringify({ type: 'answer_submitted', skillId, correct: true, sourceContext: 'Decoding · skip' })
      });
      assert.equal(posted.status, 201);
    }
  }
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal(action.href, 'academy-session.html?skill=fnd-orient-source-type');
  assert.notEqual(action.href, 'hebrew-decoding.html');
});

test('a placed learner with unsecured starters is taught a starter skill, not a frozen sibling', async () => {
  const known = starterThrough(2);
  assert.ok(known.includes('fnd-decode-letters'));
  const learner = await signup('Place Starter Slice');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({
      type: 'placement_completed',
      scores: secure(known),
      foundationScores: secure(known)
    })
  });
  assert.equal(placed.status, 201);
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.type, 'foundation');
  assert.ok(STARTER_SKILL_IDS.has(action.skillId), `${action.skillId} must be in the starter set`);
  assert.ok(!frozenIds.has(action.skillId), `${action.skillId} is frozen and must not be Today's teach`);
  assert.notEqual(action.skillId, 'fnd-signal-sentence-structure');
  assert.equal(action.href, foundationSessionHref(action.skillId));
  assert.ok(isLiveSession(action.href));
  const expected = buildJlaPlacementResult({ graph, known });
  assert.ok(starterIds.has(expected.skillId));
  assert.equal(action.skillId, expected.skillId);
});
