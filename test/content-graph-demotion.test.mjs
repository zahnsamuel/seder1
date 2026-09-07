import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  citedSkillId,
  foundationFrontierRecommendation,
  foundationSessionHref,
  normalizeNextAction,
  pickContentPracticeForSkill
} from '../data/next-action.mjs';
import { nextGraphPractice } from '../data/curriculum-engine.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));
const decode = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

test('content practice is selected only for a chosen fnd- skill', () => {
  const mini = {
    bySkill: {
      'fnd-orient-source-type': [
        { unit: 'unit-a', label: 'Unit A', route: 'unit-a.html', ref: 'Ref A', genre: 'gemara', contentSkill: 'step-a' },
        { unit: 'unit-b', label: 'Unit B', route: 'unit-b.html', ref: 'Ref B', genre: 'torah', contentSkill: 'step-b' }
      ]
    }
  };
  const first = pickContentPracticeForSkill(mini, 'fnd-orient-source-type', { mastery: {} });
  assert.equal(first.contentSkill, 'step-a');
  assert.equal(first.href, 'unit-a.html');
  const skipped = pickContentPracticeForSkill(mini, 'fnd-orient-source-type', { mastery: { 'step-a': 0.9 } });
  assert.equal(skipped.contentSkill, 'step-b');
  assert.equal(pickContentPracticeForSkill(mini, 'gittin-source-check', {}), null);
  assert.equal(pickContentPracticeForSkill(mini, 'hebrew-page-orientation', {}), null);
  assert.equal(pickContentPracticeForSkill(mini, 'lab-shabbat-count', {}), null);
});

test('a foundation recommendation cites the fnd- skill and only then attaches a mapped unit', () => {
  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-07' },
    foundationScores: secure(decode)
  }, graph, map);
  assert.equal(rec.skillId, 'fnd-orient-source-type');
  assert.equal(rec.url, foundationSessionHref(rec.skillId));
  assert.equal(rec.url, 'academy-session.html?skill=fnd-orient-source-type');
  assert.ok(rec.practice);
  assert.equal(rec.practice.href, 'berakhot-deep.html');
  assert.equal(rec.practice.contentSkill, 'berakhot-orientation');
  assert.notEqual(rec.practice.contentSkill, rec.skillId);
  const action = normalizeNextAction({ type: 'foundation', title: rec.title, reason: rec.reason, href: rec.url, skillId: rec.skillId, practice: rec.practice });
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal('practice' in action, false);
});

test('citedSkillId refuses content-move ids from graph-practice and foundation paths', () => {
  assert.equal(citedSkillId({ kind: 'academy-foundation', skillId: 'fnd-orient-source-type' }), 'fnd-orient-source-type');
  assert.equal(citedSkillId({ kind: 'academy-foundation', skillId: 'hebrew-page-orientation' }), null);
  assert.equal(citedSkillId({ kind: 'graph-practice', skill: { id: 'lab-shabbat-count' } }), null);
  assert.equal(citedSkillId({ kind: 'graph-practice', skillId: 'fnd-arg-claim', skill: { id: 'tentative-inference' } }), 'fnd-arg-claim');
  assert.equal(citedSkillId({ kind: 'review', skillId: 'source-signals' }), null);
  assert.equal(citedSkillId({ kind: 'review', skillId: 'fnd-arg-claim' }), 'fnd-arg-claim');
});

test('nextGraphPractice never treats an unmastered content-step as the skill', async () => {
  const unmasteredMoves = await nextGraphPractice(repoRoot, {
    mastery: {},
    foundationScores: secure(decode)
  });
  assert.match(unmasteredMoves.skill.id, /^fnd-/);
  assert.notEqual(unmasteredMoves.skill.id, unmasteredMoves.contentSkill);
  assert.ok(map.bySkill[unmasteredMoves.skill.id].some((row) => row.contentSkill === unmasteredMoves.contentSkill));
});

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

let server, base, dir, learner;
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
  dir = mkdtempSync(join(tmpdir(), 'seder-demote-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, SEDER_DB: join(dir, 's.db'), PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    stdio: 'ignore'
  });
  await waitForSqliteHealth();
  learner = await (await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Frontier' }) })).json();
});
after(async () => {
  if (server) { server.kill(); await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); }); }
  if (dir) { try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS reaps */ } }
});

test('placed foundation learner next-action cites a fnd- skill, not a content-step id', async () => {
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(),
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: {} })
  });
  assert.equal(placed.status, 201);
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth() })).json();
  assert.match(action.skillId, /^fnd-/);
  assert.equal(action.skillId.startsWith('fnd-'), true);
  assert.notEqual(action.skillId, 'hebrew-page-orientation');
  assert.notEqual(action.skillId, 'berakhot-orientation');
  assert.notEqual(action.skillId, 'lab-shabbat-count');
  assert.ok(graph.skills.some((skill) => skill.id === action.skillId));
  assert.equal(action.href, foundationSessionHref(action.skillId));
});

test('graph-practice API practices the chosen fnd- skill in a mapped unit', async () => {
  const learner2 = await (await fetch(`${base}/api/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: 'Practice' }) })).json();
  const headers = { Authorization: `Bearer ${learner2.token}`, 'content-type': 'application/json' };
  await fetch(`${base}/api/learners/${learner2.id}/events`, {
    method: 'POST', headers,
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: secure(decode) })
  });
  const action = await (await fetch(`${base}/api/learners/${learner2.id}/next-action`, { headers })).json();
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal(action.href, 'academy-session.html?skill=fnd-orient-source-type');
  const graphPractice = await (await fetch(`${base}/api/learners/${learner2.id}/graph-practice`, { headers })).json();
  assert.equal(graphPractice.practice.skill.id, 'fnd-orient-source-type');
  assert.equal(graphPractice.practice.url, 'berakhot-deep.html');
  assert.equal(graphPractice.practice.contentSkill, 'berakhot-orientation');
  assert.notEqual(graphPractice.practice.skill.id, graphPractice.practice.contentSkill);
});
