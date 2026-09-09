import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildScaffoldSteps,
  hasSeeItMaterials
} from '../academy-session-lesson.mjs';
import {
  foundationFrontierRecommendation,
  foundationRetrievalRecommendation,
  foundationSessionHref,
  normalizeNextAction,
  pickFrontierFoundationSkill,
  selectNextAction,
  shouldDeferSameSittingRetrieval
} from '../data/next-action.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));
const authored = JSON.parse(readFileSync(new URL('../data/foundation-authored-items.json', import.meta.url), 'utf8'));
const excerpts = JSON.parse(readFileSync(new URL('../data/foundation-source-excerpts.json', import.meta.url), 'utf8'));
const teachBank = JSON.parse(readFileSync(new URL('../data/foundation-teach.json', import.meta.url), 'utf8'));
const kpLayer = JSON.parse(readFileSync(new URL('../data/foundation-knowledge-points.json', import.meta.url), 'utf8'));
const ctxLayer = JSON.parse(readFileSync(new URL('../data/foundation-content-contexts.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../academy-session.html', import.meta.url), 'utf8');
const sessionJs = readFileSync(new URL('../academy-session.js', import.meta.url), 'utf8');
const todayHtml = readFileSync(new URL('../daily-router.html', import.meta.url), 'utf8');

const decode = ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word'];
const LESSON_ONE = 'fnd-orient-source-type';
const LESSON_TWO = 'fnd-orient-page-geography';
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const nowIso = () => new Date().toISOString();

test('lesson 1 → lesson 2 chrome is one skill, See-it → ask, Continue on Today', () => {
  assert.match(html, /SEE IT, THEN ANSWER/);
  assert.match(html, /YOUR QUESTION/);
  assert.match(html, /Got it — ask me|id="advance"/);
  assert.match(html, /Continue on Today/);
  assert.match(html, /id="complete-next"[^>]*href="daily-router\.html"/);
  assert.doesNotMatch(html, /data-links='[^']*path\.html/);
  assert.doesNotMatch(html, /Back to your path/);
  assert.doesNotMatch(html, /Could you do this reliably/i);
  assert.doesNotMatch(sessionJs, /Could you do this reliably/i);
  assert.doesNotMatch(todayHtml, /Could you do this reliably/i);
  assert.match(sessionJs, /skillCapabilityState/);
  assert.match(sessionJs, /hideOutbound/);
  assert.match(sessionJs, /jla-last-foundation-skill/);
});

test('the skill after the first academy session has See-it teach + on-page excerpt', () => {
  const afterDecode = pickFrontierFoundationSkill(graph, {
    placement: { completedAt: '2026-09-09' },
    foundationScores: secure(decode)
  });
  assert.equal(afterDecode.id, LESSON_ONE);

  const afterLessonOne = pickFrontierFoundationSkill(graph, {
    placement: { completedAt: '2026-09-09' },
    foundationScores: secure([...decode, LESSON_ONE]),
    mastery: { [LESSON_ONE]: 0.67 },
    masteryUpdatedAt: { [LESSON_ONE]: nowIso() }
  });
  assert.equal(afterLessonOne.id, LESSON_TWO);
  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-09' },
    foundationScores: secure([...decode, LESSON_ONE])
  }, graph, map);
  assert.equal(rec.skillId, LESSON_TWO);
  assert.equal(rec.url, foundationSessionHref(LESSON_TWO));
  assert.doesNotMatch(rec.url, /mode=/);
  assert.doesNotMatch(rec.url, /path\.html/);

  const skill = graph.skills.find((item) => item.id === LESSON_TWO);
  const bank = authored.items[LESSON_TWO] || [];
  assert.equal(hasSeeItMaterials({ skill, authoredBank: bank, excerpts, teachBank }), true);
  const steps = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, teachBank, random: () => 0.2
  });
  assert.equal(steps[0].kind, 'introduce');
  assert.equal(steps[0].chrome.label, 'SEE IT');
  assert.equal(steps[0].holdAsk, true);
  assert.ok(steps[0].teach);
  assert.ok(steps[0].sourceWindow.hasOnPageSource);
  assert.ok(steps[0].sourceWindow.hebrew || steps[0].sourceWindow.translation);
  assert.ok(steps[0].choices.length >= 3);
  assert.ok(steps[0].correctId);
});

test('a just-secured academy skill does not steal Today as a due-now review', () => {
  const learner = {
    placement: { completedAt: '2026-09-09' },
    foundationScores: secure([...decode, LESSON_ONE]),
    mastery: { [LESSON_ONE]: 0.67 },
    masteryUpdatedAt: { [LESSON_ONE]: nowIso() }
  };
  assert.equal(shouldDeferSameSittingRetrieval(learner, LESSON_ONE), true);
  const retrieve = foundationRetrievalRecommendation(learner, graph, map, {
    dueIds: [LESSON_ONE]
  });
  assert.equal(retrieve, null);
  const teach = foundationFrontierRecommendation(learner, graph, map);
  assert.equal(teach.skillId, LESSON_TWO);
  const action = normalizeNextAction(selectNextAction({
    foundation: { title: teach.title, reason: teach.reason, href: teach.url, cta: 'Start this lesson', skillId: teach.skillId }
  }));
  assert.equal(action.type, 'foundation');
  assert.equal(action.skillId, LESSON_TWO);
  assert.equal(action.href, foundationSessionHref(LESSON_TWO));
  assert.doesNotMatch(action.href, /mode=review/);
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
  dir = mkdtempSync(join(tmpdir(), 'seder-l2-'));
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

test('click path: first academy session then Today opens the next frontier See-it lesson', async () => {
  const learner = await signup('Lesson Two Path');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({
      type: 'placement_completed',
      scores: secure(decode),
      foundationScores: secure(decode)
    })
  });
  assert.equal(placed.status, 201);
  const first = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(first.skillId, LESSON_ONE);
  assert.equal(first.href, foundationSessionHref(LESSON_ONE));
  assert.doesNotMatch(first.href, /mode=/);

  const answered = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST', headers: auth(learner),
    body: JSON.stringify({
      type: 'answer_submitted',
      skillId: LESSON_ONE,
      foundationSkillId: LESSON_ONE,
      competency: 'sourceReasoning',
      correct: true,
      sourceContext: 'Deuteronomy 6:4'
    })
  });
  assert.equal(answered.status, 201);
  const me = await (await fetch(`${base}/api/learners/${learner.id}`, { headers: auth(learner) })).json();
  assert.ok(me.mastery[LESSON_ONE] >= 0.67);
  assert.equal((me.reviewQueue || []).filter((item) => new Date(item.dueAt).getTime() <= Date.now()).length, 0);

  const second = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(second.type, 'foundation');
  assert.equal(second.skillId, LESSON_TWO);
  assert.equal(second.href, foundationSessionHref(LESSON_TWO));
  assert.doesNotMatch(second.href, /mode=review|mode=welcome-back/);
  assert.doesNotMatch(second.href, /path\.html/);
});
