import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  citedSkillId,
  foundationFrontierRecommendation,
  foundationRetrievalRecommendation,
  foundationSessionHref,
  normalizeNextAction,
  pickRetrievalFoundationSkill,
  resolveFoundationSkillId,
  selectNextAction
} from '../data/next-action.mjs';
import { sourceReviewItems } from '../data/curriculum-engine.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));
const decode = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const isLiveHref = (href) => href === 'hebrew-decoding.html' || (typeof href === 'string' && href.startsWith('academy-session.html?skill=fnd-'));
const DAF_PROMPT = 'Before deciding whether a line is correct, what should you identify in a sugya?';

test('a content-step id maps onto the fnd- skill it tags, not a vanished step', () => {
  assert.equal(resolveFoundationSkillId(graph, map, 'fnd-orient-source-type'), 'fnd-orient-source-type');
  assert.equal(resolveFoundationSkillId(graph, map, 'berakhot-orientation'), 'fnd-orient-source-type');
  assert.equal(resolveFoundationSkillId(graph, map, 'vanished-content-step'), null);
  assert.equal(resolveFoundationSkillId(graph, map, 'habit-recovery-001'), null);
});

test('due and faded retrieval pick a fnd- skill, including mapped content-steps', () => {
  const dueFnd = pickRetrievalFoundationSkill(graph, map, { dueIds: ['fnd-arg-claim', 'berakhot-orientation'] });
  assert.equal(dueFnd.skillId, 'fnd-arg-claim');
  assert.equal(dueFnd.trigger, 'due');
  const mapped = pickRetrievalFoundationSkill(graph, map, { dueIds: ['berakhot-orientation'] });
  assert.equal(mapped.skillId, 'fnd-orient-source-type');
  const faded = pickRetrievalFoundationSkill(graph, map, { fadedIds: ['fnd-orient-speaker'] });
  assert.equal(faded.skillId, 'fnd-orient-speaker');
  assert.equal(faded.trigger, 'decay');
  assert.equal(pickRetrievalFoundationSkill(graph, map, { dueIds: ['vanished-content-step'] }), null);
});

test('welcome-back falls back to a secured fnd- skill when nothing is due', () => {
  const learner = {
    foundationScores: secure([...decode, 'fnd-orient-source-type']),
    mastery: { 'fnd-orient-source-type': 0.8 },
    masteryUpdatedAt: { 'fnd-orient-source-type': '2026-08-20T12:00:00.000Z' }
  };
  const pick = pickRetrievalFoundationSkill(graph, map, { learner, allowSecuredFallback: true });
  assert.equal(pick.skillId, 'fnd-orient-source-type');
  assert.equal(pick.trigger, 'welcome-back');
  assert.equal(pickRetrievalFoundationSkill(graph, map, { learner, allowSecuredFallback: false }), null);
});

test('review and welcome-back recommendations cite fnd- and a live session href', () => {
  const review = foundationRetrievalRecommendation({ mastery: {} }, graph, map, { dueIds: ['berakhot-orientation'] });
  assert.equal(review.kind, 'review');
  assert.equal(review.skillId, 'fnd-orient-source-type');
  assert.equal(review.url, foundationSessionHref('fnd-orient-source-type'));
  assert.ok(isLiveHref(review.url));
  assert.doesNotMatch(review.url, /review\.html|daily-recall\.html/);
  assert.ok(review.practice);
  assert.notEqual(review.practice.contentSkill, review.skillId);

  const recovery = foundationRetrievalRecommendation({
    foundationScores: secure([...decode, 'fnd-orient-source-type']),
    mastery: { 'fnd-orient-source-type': 0.8 }
  }, graph, map, { allowSecuredFallback: true, mode: 'recovery' });
  assert.equal(recovery.skillId, 'fnd-orient-source-type');
  assert.match(recovery.title, /Welcome back/);
  assert.ok(isLiveHref(recovery.url));
  const action = normalizeNextAction({
    type: 'recovery',
    title: 'Welcome back with one small step',
    reason: recovery.reason,
    href: recovery.url,
    cta: 'Begin a short recall',
    skillId: recovery.skillId
  });
  assert.equal(action.type, 'recovery');
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal(action.href, recovery.url);
});

test('citedSkillId refuses leftover content-step ids on review and recovery', () => {
  assert.equal(citedSkillId({ kind: 'review', skillId: 'fnd-arg-claim' }), 'fnd-arg-claim');
  assert.equal(citedSkillId({ kind: 'review', skillId: 'source-signals' }), null);
  assert.equal(citedSkillId({ kind: 'recovery', skillId: 'habit-recovery-001' }), null);
});

test('sourceReviewItems resolves a real item for a fnd- skill and a mapped content-step', async () => {
  const [authored, mapped] = await Promise.all([
    sourceReviewItems(repoRoot, ['fnd-orient-source-type']),
    sourceReviewItems(repoRoot, ['berakhot-orientation'])
  ]);
  const authoredItem = authored.find((item) => item.trueSkillId === 'fnd-orient-source-type');
  assert.ok(authoredItem);
  assert.notEqual(authoredItem.label, 'DAF RETRIEVAL');
  assert.notEqual(authoredItem.prompt, DAF_PROMPT);
  assert.ok(authoredItem.answers?.length >= 3);
  assert.ok(Number.isInteger(authoredItem.correct));

  const mappedItem = mapped.find((item) => item.trueSkillId === 'fnd-orient-source-type');
  assert.ok(mappedItem, 'a content-step id must resolve to the fnd- item, not a generic Daf card');
  assert.notEqual(mappedItem.label, 'DAF RETRIEVAL');
  assert.notEqual(mappedItem.prompt, DAF_PROMPT);
  assert.equal(mapped.some((item) => item.trueSkillId === 'berakhot-orientation' && item.label === 'DAF RETRIEVAL'), false);
});

test('welcome-back beats foundation teach and still cites one fnd- next move', () => {
  const learner = { placement: { completedAt: '2026-09-01' }, foundationScores: secure(decode) };
  const teach = foundationFrontierRecommendation(learner, graph, map);
  const retrieve = foundationRetrievalRecommendation({
    ...learner,
    foundationScores: secure([...decode, 'fnd-orient-source-type'])
  }, graph, map, { allowSecuredFallback: true, mode: 'recovery' });
  const action = normalizeNextAction(selectNextAction({
    recovery: { title: 'Welcome back with one small step', reason: retrieve.reason, href: retrieve.url, cta: 'Begin a short recall', skillId: retrieve.skillId },
    foundation: { title: teach.title, reason: teach.reason, href: teach.url, cta: 'Start this step', skillId: teach.skillId }
  }));
  assert.equal(action.type, 'recovery');
  assert.match(action.skillId, /^fnd-/);
  assert.ok(isLiveHref(action.href));
  assert.equal(action.href, foundationSessionHref(action.skillId));
});

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
  dir = mkdtempSync(join(tmpdir(), 'seder-retrieve-'));
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

test('HTTP review next-action cites a fnd- skill and a live item href, not a generic Daf page', async () => {
  const learner = await signup('Retrieve Review');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: {} })
  });
  assert.equal(placed.status, 201);
  const missed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({ type: 'answer_submitted', skillId: 'fnd-orient-source-type', competency: 'recognition', sourceContext: 'retrieval check', correct: false })
  });
  assert.equal(missed.status, 201);
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.type, 'review');
  assert.equal(action.skillId, 'fnd-orient-source-type');
  assert.equal(action.href, 'academy-session.html?skill=fnd-orient-source-type');
  assert.doesNotMatch(action.href, /review\.html|daily-recall\.html/);

  const items = await (await fetch(`${base}/api/learners/${learner.id}/review-items`, { headers: auth(learner) })).json();
  const item = (items.items || []).find((entry) => entry.trueSkillId === 'fnd-orient-source-type');
  assert.ok(item, 'review-items must resolve an item for the due fnd- skill');
  assert.notEqual(item.label, 'DAF RETRIEVAL');
  assert.notEqual(item.prompt, DAF_PROMPT);
  assert.ok(item.answers?.length >= 3);
});

test('HTTP welcome-back next-action cites a secured fnd- skill, not daily-recall', async () => {
  const learner = await signup('Welcome Back');
  await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({
      type: 'placement_completed',
      scores: secure([...decode, 'fnd-orient-source-type']),
      foundationScores: secure([...decode, 'fnd-orient-source-type'])
    })
  });
  for (let i = 0; i < 3; i += 1) {
    await fetch(`${base}/api/learners/${learner.id}/events`, {
      method: 'POST', headers: auth(learner),
      body: JSON.stringify({
        type: 'answer_submitted',
        skillId: 'fnd-orient-source-type',
        competency: 'recognition',
        sourceContext: `welcome-back ${i}`,
        correct: true
      })
    });
  }
  const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');
  const db = new DatabaseSync(join(dir, 's.db'));
  const row = db.prepare('select doc from learners where id = ?').get(learner.id);
  const doc = JSON.parse(row.doc);
  doc.lastStudyDate = '2026-08-01';
  db.prepare('update learners set doc = ? where id = ?').run(JSON.stringify(doc), learner.id);
  db.close();

  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.type, 'recovery');
  assert.match(action.skillId, /^fnd-/);
  assert.ok(graph.skills.some((skill) => skill.id === action.skillId));
  assert.ok(isLiveHref(action.href));
  assert.equal(action.href, foundationSessionHref(action.skillId));
  assert.doesNotMatch(action.href, /daily-recall\.html|review\.html/);
});
