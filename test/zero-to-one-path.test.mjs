import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  STARTER_SKILL_IDS,
  foundationFrontierRecommendation,
  foundationSessionHref,
  pickFrontierFoundationSkill
} from '../data/next-action.mjs';
import {
  buildScaffoldSteps,
  hasSeeItMaterials
} from '../academy-session-lesson.mjs';
import { buildJlaPlacementResult } from '../jla-placement-router.js';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const load = (file) => JSON.parse(read(file));

const graph = load('data/foundation-skill-graph.json');
const starterDoc = load('data/foundation-starter-set.json');
const authored = load('data/foundation-authored-items.json');
const excerpts = load('data/foundation-source-excerpts.json');
const teachBank = load('data/foundation-teach.json');
const kpLayer = load('data/foundation-knowledge-points.json');
const ctxLayer = load('data/foundation-content-contexts.json');
const map = load('data/foundation-content-map.json');

const starterSkills = starterDoc.starterSet;
const starterIds = new Set(starterSkills.map((skill) => skill.id));
const frozenIds = new Set(starterDoc.frozen.map((skill) => skill.id));
const decodeIds = starterSkills.filter((skill) => skill.layer === 0).map((skill) => skill.id);
const SELF_RATING = /Could you do this reliably/;
const isLiveHref = (href) => href === 'hebrew-decoding.html'
  || (typeof href === 'string' && href.startsWith('academy-session.html?skill=fnd-'));
const secure = (ids) => Object.fromEntries(ids.map((id) => [id, 0.8]));
const cyclingRandom = () => {
  let n = 0;
  return () => {
    n += 1;
    return (n % 7) / 7;
  };
};

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

let server, base, dir;
async function waitForSqliteHealth(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/api/health`);
      if (r.ok && (await r.json()).persistence === 'sqlite-ready') return;
    } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server did not reach sqlite-ready');
}

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'seder-zero-one-'));
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
  if (server) {
    server.kill();
    await new Promise((r) => { server.once('exit', r); setTimeout(r, 1500); });
  }
  if (dir) {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS reaps */ }
  }
});

const signup = async (name) => (await fetch(`${base}/api/auth/signup`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName: name })
})).json();
const auth = (learner) => ({ Authorization: `Bearer ${learner.token}`, 'content-type': 'application/json' });

const nonL0WithSeeIt = starterSkills
  .filter((entry) => entry.layer > 0)
  .map((entry) => graph.skills.find((skill) => skill.id === entry.id))
  .filter(Boolean)
  .filter((skill) => hasSeeItMaterials({
    skill,
    authoredBank: authored.items[skill.id] || [],
    excerpts,
    teachBank
  }));

test('placed beginner next teach skill is in the frozen starter set', async () => {
  const beginner = pickFrontierFoundationSkill(graph, { foundationScores: {} });
  assert.equal(beginner.id, 'fnd-decode-letters');
  assert.ok(starterIds.has(beginner.id));
  assert.ok(STARTER_SKILL_IDS.has(beginner.id));
  assert.ok(!frozenIds.has(beginner.id));

  const rec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-09' },
    foundationScores: {}
  }, graph, map);
  const placement = buildJlaPlacementResult({ graph, foundationScores: {} });
  assert.equal(rec.skillId, beginner.id);
  assert.equal(placement.skillId, rec.skillId);
  assert.ok(starterIds.has(rec.skillId));

  const learner = await signup('Zero One Beginner');
  const placed = await fetch(`${base}/api/learners/${learner.id}/events`, {
    method: 'POST',
    headers: auth(learner),
    body: JSON.stringify({ type: 'placement_completed', source: 'adaptive-diagnostic', scores: {}, foundationScores: {} })
  });
  assert.equal(placed.status, 201);
  const action = await (await fetch(`${base}/api/learners/${learner.id}/next-action`, { headers: auth(learner) })).json();
  assert.equal(action.type, 'foundation');
  assert.ok(starterIds.has(action.skillId), `${action.skillId} must be in the starter set`);
  assert.ok(!frozenIds.has(action.skillId), `${action.skillId} is frozen and must not be Today's teach`);
  assert.equal(action.skillId, rec.skillId);
  assert.equal(action.href, foundationSessionHref(action.skillId));
});

test('academy session for a non-L0 starter with teach+excerpt builds See-it then ask', () => {
  assert.ok(nonL0WithSeeIt.length >= 1, 'expected at least one non-L0 starter with teach and excerpt');
  const canonical = nonL0WithSeeIt.find((skill) => skill.id === 'fnd-orient-source-type') || nonL0WithSeeIt[0];
  assert.ok(canonical.layer > 0);
  assert.ok(!canonical.id.startsWith('fnd-decode-'));

  for (const skill of nonL0WithSeeIt) {
    const steps = buildScaffoldSteps({
      skill,
      graph,
      kpLayer,
      ctxLayer,
      authoredBank: authored.items[skill.id] || [],
      excerpts,
      teachBank,
      random: cyclingRandom()
    });
    assert.ok(steps.length >= 1, `${skill.id} should build a session`);
    const seeIt = steps[0];
    assert.equal(seeIt.kind, 'introduce', `${skill.id} first step is See-it, not a self-rating`);
    assert.equal(seeIt.chrome.label, 'SEE IT');
    assert.equal(seeIt.chrome.continueTeach, 'Got it — ask me');
    assert.ok(seeIt.teach, `${skill.id} needs a See-it mini-lesson`);
    assert.equal(seeIt.holdAsk, true, `${skill.id} must hold the ask until See-it is done`);
    assert.equal(seeIt.guidance, '');
    assert.ok(seeIt.prompt, `${skill.id} must then ask a real question`);
    assert.doesNotMatch(seeIt.prompt, SELF_RATING);
    assert.ok(seeIt.sourceWindow.hasOnPageSource, `${skill.id} See-it needs Hebrew or translation on the page`);
    assert.ok(seeIt.sourceWindow.hebrew || seeIt.sourceWindow.translation);
    assert.ok(seeIt.choices.length >= 3);
    assert.ok(seeIt.correctId);
    assert.ok(seeIt.choices.some((choice) => choice.id === seeIt.correctId));
    assert.equal(seeIt.choices.some((choice) => SELF_RATING.test(choice.text)), false);
  }
});

test('diagnostic surfaces do not ask “Could you do this reliably”', async () => {
  const surfaces = [
    'academy-session.html',
    'academy-session.js',
    'academy-session-lesson.mjs',
    'daily-router.html',
    'jla-next-action.js',
    'hebrew-decoding.html',
    'pesachim-diagnostic.html',
    'pesachim-diagnostic.js',
    'eruvin-diagnostic.html',
    'eruvin-diagnostic.js'
  ];
  for (const file of surfaces) {
    assert.doesNotMatch(read(file), SELF_RATING, `${file} must not use placement self-rating copy`);
  }

  const probe = await (await fetch(`${base}/api/graph/diagnostic`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ responses: {} })
  })).json();
  assert.ok(probe.nextProbe?.id);
  assert.doesNotMatch(JSON.stringify(probe.nextProbe), SELF_RATING);
  assert.doesNotMatch(String(probe.nextProbe.title || ''), SELF_RATING);
  assert.doesNotMatch(String(probe.nextProbe.statement || ''), SELF_RATING);
  assert.doesNotMatch(String(probe.nextProbe.check || ''), SELF_RATING);
});

test('Today CTA points at academy-session or hebrew-decoding appropriately', async () => {
  assert.equal(foundationSessionHref('fnd-decode-letters'), 'hebrew-decoding.html');
  assert.equal(foundationSessionHref('fnd-decode-vowels'), 'hebrew-decoding.html');
  assert.equal(foundationSessionHref('fnd-orient-source-type'), 'academy-session.html?skill=fnd-orient-source-type');
  assert.ok(isLiveHref(foundationSessionHref('fnd-arg-claim')));

  const beginnerRec = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-09' },
    foundationScores: {}
  }, graph, map);
  assert.equal(beginnerRec.url, 'hebrew-decoding.html');
  assert.equal(beginnerRec.url, foundationSessionHref(beginnerRec.skillId));

  const afterDecode = foundationFrontierRecommendation({
    placement: { completedAt: '2026-09-09' },
    foundationScores: secure(decodeIds)
  }, graph, map);
  assert.ok(afterDecode);
  assert.ok(starterIds.has(afterDecode.skillId));
  assert.ok(afterDecode.skillId.startsWith('fnd-'));
  assert.ok(!afterDecode.skillId.startsWith('fnd-decode-'));
  assert.equal(afterDecode.url, `academy-session.html?skill=${afterDecode.skillId}`);
  assert.equal(afterDecode.url, foundationSessionHref(afterDecode.skillId));

  const beginner = await signup('Zero One Today Beginner');
  assert.equal((await fetch(`${base}/api/learners/${beginner.id}/events`, {
    method: 'POST',
    headers: auth(beginner),
    body: JSON.stringify({ type: 'placement_completed', scores: {}, foundationScores: {} })
  })).status, 201);
  const beginnerAction = await (await fetch(`${base}/api/learners/${beginner.id}/next-action`, { headers: auth(beginner) })).json();
  assert.equal(beginnerAction.href, 'hebrew-decoding.html');
  assert.ok(isLiveHref(beginnerAction.href));

  const placed = await signup('Zero One Today Orient');
  assert.equal((await fetch(`${base}/api/learners/${placed.id}/events`, {
    method: 'POST',
    headers: auth(placed),
    body: JSON.stringify({
      type: 'placement_completed',
      scores: secure(decodeIds),
      foundationScores: secure(decodeIds)
    })
  })).status, 201);
  const placedAction = await (await fetch(`${base}/api/learners/${placed.id}/next-action`, { headers: auth(placed) })).json();
  assert.equal(placedAction.type, 'foundation');
  assert.ok(starterIds.has(placedAction.skillId));
  assert.match(placedAction.href, /^academy-session\.html\?skill=fnd-/);
  assert.equal(placedAction.href, foundationSessionHref(placedAction.skillId));
  assert.ok(isLiveHref(placedAction.href));
  assert.doesNotMatch(placedAction.href, /hebrew-decoding\.html/);
});
