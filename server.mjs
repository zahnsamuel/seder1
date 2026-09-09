import { createReadStream, existsSync, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callYochaiTool } from './yochai-adapter.mjs';
import { createLearner, decayingSkills, deleteLearner, fireReviewPlan, getLearner, listLearners, listLearnersFull, recordLearnerEvent, reviewStatus } from './data/repository.mjs';
import { supabaseConfig, verifySupabaseAccessToken } from './data/supabase-adapter.mjs';
import { deleteHostedLearnerData, getHostedLearner, recordHostedEvent } from './data/supabase-learner-repository.mjs';
import { initSqlite, sqliteEnabled, issueToken, verifyToken, revokeTokens, closeSqlite } from './data/sqlite-store.mjs';
import { loadJlaAcademySession, checkJlaAcademyChoice } from './jla-academy-session.js';
import { canMasterJourneyStage, canonJourney, journeyStatus, nextGemaraArc, nextGraphPractice, nextJourneyRecommendation, remediationFor, sourceReviewItems } from './data/curriculum-engine.mjs';
import { explainRecommendation, whySentence } from './data/recommendation-why.mjs';
import { foundationRecommendation, gemaraYearRecommendation, moedExpansionRecommendation } from './data/term-recommendations.mjs';
import { keyPrerequisiteRemediation, estimateFrontierFromDiagnostic, nextDiagnosticProbe } from './data/knowledge-graph.mjs';
import { probeableSkillIds, pickDiagnosticItem, diagnosticTeachFor } from './data/diagnostic-items.mjs';
import { computeGraphPilotAnalytics } from './data/pilot-analytics.mjs';
import { citedSkillId, foundationFrontierRecommendation, foundationRetrievalRecommendation, normalizeNextAction, resolveFoundationSkillId, selectNextAction, STARTER_SKILL_IDS } from './data/next-action.mjs';
import { resolvePlacementStart } from './jla-placement-router.js';
import { isTestLearner } from './scripts/scrub-test-learners.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4180);
// Hosted pilot persistence: point SEDER_DB at a SQLite file to store learners there and turn
// on per-learner bearer-token auth (see data/sqlite-store.mjs). Unset = local JSON dev store.
if (process.env.SEDER_DB) {
  initSqlite(process.env.SEDER_DB);
} else if (process.env.NODE_ENV === 'production' && !supabaseConfig().configured) {
  // Fail closed: local-development mode has no per-learner auth, no account isolation, and an OPEN
  // analytics endpoint — it must never back a real deploy. Refusing to start (rather than quietly
  // serving an insecure instance) turns a missing SEDER_DB into a loud, obvious deploy failure.
  console.error('FATAL: NODE_ENV=production but no persistent store is configured. Set SEDER_DB to a SQLite file on a mounted disk (e.g. /data/seder.db) for hosted mode, or configure Supabase. Refusing to start in local-development mode: it has no auth, no isolation, and an open analytics endpoint.');
  process.exit(1);
}

// Best-effort per-IP throttle on the open sign-up endpoint so a public deploy can't be flooded
// with junk accounts. In-memory (resets on restart), which is fine at pilot scale.
const signupHits = new Map();
function signupRateLimited(ip, max = Number(process.env.SEDER_SIGNUP_LIMIT) || 8, windowMs = 3600000) {
  const now = Date.now();
  const hits = (signupHits.get(ip) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) { signupHits.set(ip, hits); return true; }
  hits.push(now);
  signupHits.set(ip, hits);
  return false;
}
const clientIp = (request) => (request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket?.remoteAddress || 'unknown';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json; charset=utf-8' };

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function sendPrivateJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' });
  response.end(JSON.stringify(body));
}
// Every learner payload (events, answers, feedback, placement scores) is small JSON, so cap the
// body well above any legitimate request. Without a cap, a single large POST to a public endpoint
// could buffer unbounded memory — a cheap DoS on the pilot URL. A malformed body is the caller's
// error (400), not the server's (500); both are surfaced via the top-level handler's statusCode path.
const MAX_BODY_BYTES = 256 * 1024;

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

let cachedFoundationGraph = null, cachedKpLayer = null, cachedGraphSkills = null, cachedContentMap = null, cachedGraduationMap = null;
let cachedAuthoredItems = null, cachedFoundationTeach = null;

async function loadAuthoredItems() {
  if (!cachedAuthoredItems) {
    const data = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-authored-items.json'), 'utf8'));
    cachedAuthoredItems = data.items || {};
  }
  return cachedAuthoredItems;
}

async function loadFoundationTeach() {
  if (!cachedFoundationTeach) {
    cachedFoundationTeach = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-teach.json'), 'utf8'));
  }
  return cachedFoundationTeach;
}

async function loadFoundationGraph() {
  if (!cachedFoundationGraph) {
    cachedFoundationGraph = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-skill-graph.json'), 'utf8'));
    cachedGraphSkills = cachedFoundationGraph.skills;
  }
  return cachedFoundationGraph;
}

async function loadFoundationContentMap() {
  if (!cachedContentMap) cachedContentMap = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-content-map.json'), 'utf8'));
  return cachedContentMap;
}

async function loadGraduationMap() {
  if (!cachedGraduationMap) {
    const data = JSON.parse(await fs.readFile(join(root, 'data', 'graduation-skill-map.json'), 'utf8'));
    cachedGraduationMap = data.map || {};
  }
  return cachedGraduationMap;
}

async function academyFoundationRecommendation(learner) {
  return foundationFrontierRecommendation(learner, await loadFoundationGraph(), await loadFoundationContentMap());
}

async function foundationRetrievalFor(learner, options = {}) {
  const due = reviewStatus(learner).due;
  const faded = decayingSkills(learner).filter((skill) => skill.freshness === 'faded');
  return foundationRetrievalRecommendation(learner, await loadFoundationGraph(), await loadFoundationContentMap(), {
    dueIds: due.map((item) => item.skillId),
    fadedIds: faded.map((skill) => skill.skillId),
    ...options
  });
}

// Build the Math-Academy-Way key-prerequisite remediation from the knowledge-point layer: a struggled
// skill routes to a review of the foundation its knowledge points most directly use.
async function keyPrerequisiteRemediationFor(root, learner) {
  if (!cachedKpLayer) cachedKpLayer = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-knowledge-points.json'), 'utf8'));
  const result = keyPrerequisiteRemediation({ knowledgePoints: cachedKpLayer.knowledgePoints, struggles: learner.struggles, knowledgePointStruggles: learner.knowledgePointStruggles, mastery: learner.mastery, among: STARTER_SKILL_IDS });
  if (!result) return null;
  if (!cachedGraphSkills) cachedGraphSkills = (await loadFoundationGraph()).skills;
  const titleOf = (id) => cachedGraphSkills.find((s) => s.id === id)?.title || id;
  // When the struggle is pinned to a specific knowledge point, name it ("the practice step of X").
  const where = result.knowledgePointKind ? `the ${result.knowledgePointKind} step of “${titleOf(result.strugglingSkill)}”` : `“${titleOf(result.strugglingSkill)}”`;
  return {
    skillId: result.keyPrerequisite,
    strugglingSkill: result.strugglingSkill,
    knowledgePoint: result.knowledgePoint,
    count: result.count,
    title: `Shore up the foundation: ${titleOf(result.keyPrerequisite)}`,
    reason: `You have hit ${result.count} snags on ${where}. The move it leans on most — ${titleOf(result.keyPrerequisite)} — is worth a quick review before you try again.`,
    url: `academy-session.html?skill=${encodeURIComponent(result.keyPrerequisite)}`,
    repairMode: 'key-prerequisite-review'
  };
}

// Placement wiring (The Math Academy Way — the diagnostic estimates the knowledge frontier). A
// placement records the skills a learner demonstrated; apply the knowledge graph's DOWNWARD INFERENCE
// so the prerequisites of those skills are seeded as known too. The learner then starts at their true
// knowledge frontier, not only at the handful of skills the placement checks directly probed. Purely
// additive: it seeds inferred prerequisites to a secure level, never lowers a directly-earned score.
async function enrichPlacementWithFrontier(root, event) {
  const graph = await loadFoundationGraph();
  const graduationMap = await loadGraduationMap();
  const resolved = resolvePlacementStart({
    graph,
    scores: event.scores,
    foundationScores: event.foundationScores,
    recommendedSkill: event.recommendedSkill,
    graduationMap
  });
  const SECURE_SEED = 0.8; // secure enough to unlock dependents, below 1 so spaced review still applies
  const foundationScores = { ...resolved.foundationScores };
  const scores = { ...resolved.scores };
  for (const id of resolved.known) {
    foundationScores[id] = Math.max(foundationScores[id] || 0, SECURE_SEED);
    scores[id] = Math.max(scores[id] || 0, SECURE_SEED);
  }
  event.foundationScores = foundationScores;
  event.scores = scores;
  event.recommendedSkill = resolved.recommendedSkill;
  event.frontierInferred = resolved.known.length; // transparency: how many skills the frontier inference covers
}

async function chooseRecommendation(learner, { skipReview = false } = {}) {
  if (!learner.placement) return { kind: 'placement', title: 'Find where to start', reason: 'A few short questions so we start in the right place — not too hard, not too easy.', url: 'diagnostic.html' };
  if (!skipReview) {
    // Recover / review before teaching the next frontier skill. Only fire when the
    // due or faded id resolves to a live fnd- skill — never a generic Daf card or a
    // vanished content-step. Unmappable leftovers fall through to foundation teach.
    const retrieval = await foundationRetrievalFor(learner);
    if (retrieval) return retrieval;
  }
  const academyFoundation = await academyFoundationRecommendation(learner);
  if (academyFoundation) return academyFoundation;
  // Math-Academy-Way targeted remediation: repeated struggle on a foundation skill routes to a
  // review of the KEY PREREQUISITE its knowledge points lean on most (strengthen the foundation
  // before re-drilling), ahead of the generic repair-router remediation.
  const keyPrereqRemediation = await keyPrerequisiteRemediationFor(root, learner);
  if (keyPrereqRemediation) return { kind: 'remediation', ...keyPrereqRemediation };
  const remediation = await remediationFor(root, learner);
  if (remediation) return { kind: 'remediation', ...remediation, url: 'remediation.html' };
  const foundationTerm = foundationRecommendation(learner);
  if (foundationTerm) return { kind: 'foundation-term', ...foundationTerm };
  const gemaraYearTerm = gemaraYearRecommendation(learner);
  if (gemaraYearTerm) return { kind: 'gemara-year-term', ...gemaraYearTerm };
  const moedExpansion = moedExpansionRecommendation(learner);
  if (moedExpansion) return { kind: 'moed-expansion', ...moedExpansion };
  // Content-move graphs are indexes, not a next-action picker. Practice in a real
  // unit is selected only after a fnd- skill is chosen (see nextGraphPractice).
  const journeyRecommendation = await nextJourneyRecommendation(root, learner);
  if (journeyRecommendation) return journeyRecommendation;
  const gemaraArc = await nextGemaraArc(root, learner);
  if (gemaraArc) return { kind: 'gemara-arc', ...gemaraArc };
  return { kind: 'shas-map', title: 'Choose your next Shas practice field', reason: 'Your current foundations are ready for broader tractate exploration.', url: 'shas-map-v2.html' };
}

// Every recommendation carries a structured, learner-facing `why` (explainRecommendation): the
// evidence that makes it the right move now, and what it unlocks. Kept as a thin wrapper so the
// selection logic above stays focused on choosing, and every return path is explained uniformly.
async function recommendFor(learner, options = {}) {
  const recommendation = await chooseRecommendation(learner, options);
  recommendation.why = explainRecommendation(recommendation, learner);
  // Pre-render the one-line sentence server-side so every client shares one phrasing source.
  recommendation.why.sentence = whySentence(recommendation.why);
  return recommendation;
}

async function nextActionFor(learner) {
  const recommendation = await recommendFor(learner);
  const daysSinceStudy = learner.lastStudyDate ? Math.floor((Date.now() - new Date(learner.lastStudyDate).getTime()) / 86400000) : 0;
  const recoveryWindow = learner.rhythm === 'weekly' ? 8 : learner.rhythm === 'three-times-weekly' ? 4 : 3;
  const skillId = citedSkillId(recommendation);
  const base = { title: recommendation.title, reason: recommendation.reason, href: recommendation.url, cta: 'Start this step', skillId };
  const candidates = {};
  if (daysSinceStudy >= recoveryWindow) {
    const retrieval = recommendation.kind === 'review' && recommendation.skillId
      ? recommendation
      : await foundationRetrievalFor(learner, { allowSecuredFallback: true, mode: 'recovery' });
    if (retrieval?.skillId) {
      candidates.recovery = {
        title: 'Welcome back with one small step',
        reason: retrieval.reason,
        href: retrieval.url,
        cta: 'Begin a short recall',
        skillId: retrieval.skillId
      };
    }
  }
  if (recommendation.kind === 'review' && skillId) candidates.review = { ...base, cta: 'Review now' };
  else if (recommendation.kind === 'placement') candidates.foundation = { ...base, cta: 'Start the questions' };
  else if (['academy-foundation', 'foundation-term'].includes(recommendation.kind)) candidates.foundation = { ...base, cta: 'Start this lesson' };
  else if (recommendation.kind === 'academy-session') candidates.academy = base;
  else if (recommendation.kind === 'graph-practice' && /transfer/i.test(`${recommendation.skill?.id || ''} ${recommendation.context || ''}`)) candidates.transfer = { ...base, cta: 'Try it in a new source' };
  else if (recommendation.kind === 'graph-practice') candidates.frontier = { ...base, cta: 'Learn a new reading move' };
  else if (recommendation.kind === 'shas-map') candidates.completion = { title: 'Choose what to deepen next', reason: 'You completed the current sequence. Continue from what you can now do.', href: 'academy.html', cta: 'See your progress' };
  else candidates.continuation = base;
  return normalizeNextAction(selectNextAction(candidates));
}
async function learnerAccess(request, requestedId) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (sqliteEnabled()) {
    // Hosted SQLite mode: the learner id comes ONLY from the verified token, never from the
    // URL, and a request for anyone else's id is refused. This app-layer check is the account
    // isolation guarantee here (SQLite has no row-level security).
    if (!token) { const error = new Error('A sign-in session is required.'); error.statusCode = 401; throw error; }
    const owner = verifyToken(token);
    if (!owner) { const error = new Error('Your sign-in session is not valid.'); error.statusCode = 401; throw error; }
    if (requestedId && requestedId !== owner.id) { const error = new Error('You can only access your own learner record.'); error.statusCode = 403; throw error; }
    return { hosted: false, authed: true, id: owner.id };
  }
  if (supabaseConfig().configured) {
    if (!token) {
      const error = new Error('A sign-in session is required in hosted mode.');
      error.statusCode = 401;
      throw error;
    }
    let user;
    try { user = await verifySupabaseAccessToken(token); }
    catch (cause) {
      const error = new Error(cause.message || 'Your sign-in session is not valid.');
      error.statusCode = 401;
      throw error;
    }
    if (requestedId && requestedId !== user.id) { const error = new Error('You can only access your own learner record.'); error.statusCode = 403; throw error; }
    return { hosted: true, user, token, id: user.id };
  }
  return { hosted: false, id: requestedId || 'demo' };
}

async function readLearner(request, id) {
  const access = await learnerAccess(request, id);
  return { access, learner: access.hosted ? await getHostedLearner(access.user, access.token) : await getLearner(root, access.id) };
}

async function handleApi(request, response, url) {
  if (url.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok', yochai: process.env.YOCHAI_API_KEY ? 'configured' : 'demo-mode', persistence: sqliteEnabled() ? 'sqlite-ready' : supabaseConfig().configured ? 'supabase-ready' : 'local-development', commit: process.env.RENDER_GIT_COMMIT || process.env.SEDER_COMMIT || null });
    return true;
  }
  if (request.method === 'GET' && url.pathname === '/api/public-config') {
    const config = supabaseConfig();
    const mode = sqliteEnabled() ? 'token' : config.configured ? 'supabase' : 'local';
    sendJson(response, 200, { mode, supabaseUrl: config.url || null, supabaseAnonKey: config.anonKey || null });
    return true;
  }
  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (sqliteEnabled()) {
      const owner = token && verifyToken(token);
      if (!owner) { sendJson(response, 401, { error: 'A sign-in session is required.' }); return true; }
      sendJson(response, 200, { user: { id: owner.id } });
      return true;
    }
    if (!supabaseConfig().configured) { sendJson(response, 503, { error: 'Supabase sign-in is not configured yet.' }); return true; }
    if (!token) { sendJson(response, 401, { error: 'A sign-in session is required.' }); return true; }
    try { sendJson(response, 200, { user: await verifySupabaseAccessToken(token) }); }
    catch (error) { sendJson(response, 401, { error: error.message }); }
    return true;
  }
  // Hosted SQLite mode: claim a learner and receive a bearer token (kept client-side). This is
  // the sign-up for the token model — no password, no external auth service.
  if (request.method === 'POST' && url.pathname === '/api/auth/signup') {
    if (!sqliteEnabled()) { sendJson(response, 503, { error: 'Token sign-up is not enabled in this environment.' }); return true; }
    if (signupRateLimited(clientIp(request))) { sendJson(response, 429, { error: 'Too many sign-ups from here just now. Please wait a few minutes and try again.' }); return true; }
    const body = await readJsonBody(request);
    if (!body.displayName?.trim()) { sendJson(response, 400, { error: 'Enter a name to start learning.' }); return true; }
    const learner = await createLearner(root, body.displayName.trim());
    const token = issueToken(learner.id);
    sendJson(response, 201, { id: learner.id, token, learner });
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-journey') {
    sendJson(response, 200, await canonJourney(root));
    return true;
  }
  if (url.pathname === '/api/curriculum/advanced-gemara-sequence') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'advanced-gemara-sequence.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/gemara-source-packets') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'gemara-source-packets.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/gemara-source-sequences') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'gemara-source-sequences.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-source-sequences') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'canon-source-sequences.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-labs') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-labs.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-synthesis') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'canon-synthesis.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-deepening') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-deepening.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-retrieval') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-retrieval.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-anchor-units') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-anchor-units.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/pilot-foundations') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'pilot-foundations.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/pilot-repairs') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'pilot-repairs.json'), 'utf8')));
    return true;
  }
  // Adaptive diagnostic as a knowledge-frontier estimator (The Math Academy Way). Stateless graph
  // computation: POST the responses so far ({ responses: { skillId: passed } }); get the current
  // frontier estimate plus the next skill to probe as a real authored MC (never a self-rate), or
  // complete:true when the frontier is pinned. Only skills with an authored item are probed; L0
  // decode is skipped (no invented glyph banks). Downward inference still fills the rest.
  if (request.method === 'POST' && url.pathname === '/api/graph/diagnostic') {
    const body = await readJsonBody(request);
    const responses = (body && typeof body.responses === 'object' && body.responses) || {};
    const graph = await loadFoundationGraph();
    const items = await loadAuthoredItems();
    const teachFile = await loadFoundationTeach();
    const probeable = probeableSkillIds(graph, items);
    const estimate = estimateFrontierFromDiagnostic(graph, responses);
    const probeId = nextDiagnosticProbe(graph, responses, { probeable });
    const probe = probeId ? graph.skills.find((s) => s.id === probeId) : null;
    const item = probeId ? pickDiagnosticItem(probeId, items, Object.keys(responses).length) : null;
    sendJson(response, 200, {
      estimate: { known: estimate.known, frontier: estimate.frontier, tested: estimate.tested },
      nextProbe: probe && item ? {
        id: probe.id,
        title: probe.title,
        teach: diagnosticTeachFor(probe.id, teachFile),
        item
      } : null,
      complete: !(probe && item)
    });
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-source-reader') {
    const primary = JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-source-reader.json'), 'utf8'));
    const additional = JSON.parse(await fs.readFile(join(root, 'data', 'additional-source-reader.json'), 'utf8'));
    sendJson(response, 200, { collections: [...primary.collections, ...additional.collections] });
    return true;
  }
  if (url.pathname === '/api/curriculum/berakhot-practice-lab') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'berakhot-practice-lab.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/non-gemara-practice-lab') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'non-gemara-practice-lab.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/daily-canon-studio') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'daily-canon-studio.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-mastery-arcs') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'canon-mastery-arcs.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/contrasting-repairs') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'contrasting-repairs.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-six-session-courses') {
    const base = JSON.parse(await fs.readFile(join(root, 'data', 'canon-six-session-courses.json'), 'utf8'));
    const tefillah = JSON.parse(await fs.readFile(join(root, 'data', 'tefillah-six-session-course.json'), 'utf8'));
    const thought = JSON.parse(await fs.readFile(join(root, 'data', 'thought-six-session-course.json'), 'utf8'));
    const history = JSON.parse(await fs.readFile(join(root, 'data', 'history-six-session-course.json'), 'utf8'));
    const responsibility = JSON.parse(await fs.readFile(join(root, 'data', 'responsibility-six-session-course.json'), 'utf8'));
    sendJson(response, 200, { courses: [...base.courses, ...tefillah.courses, ...thought.courses, ...history.courses, ...responsibility.courses] });
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-vocabulary') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'canon-vocabulary.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/repair-router') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'repair-router.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/course-capstones') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'course-capstones.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/canon-bridges') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'canon-bridges.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/independent-source-encounters') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'independent-source-encounters.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/source-glossary') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'source-glossary.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/curriculum/language-ladder') {
    sendJson(response, 200, JSON.parse(await fs.readFile(join(root, 'data', 'language-ladder.json'), 'utf8')));
    return true;
  }
  if (url.pathname === '/api/catalog') {
    const catalog = JSON.parse(await fs.readFile(join(root, 'data', 'seder-catalog.json'), 'utf8'));
    sendJson(response, 200, catalog);
    return true;
  }
  if (url.pathname === '/api/skill-graph') {
    const graph = JSON.parse(await fs.readFile(join(root, 'data', 'skill-graph.json'), 'utf8'));
    sendJson(response, 200, graph);
    return true;
  }
  if (url.pathname === '/api/gemara/tractates') {
    const tractates = JSON.parse(await fs.readFile(join(root, 'data', 'gemara-tractates.json'), 'utf8'));
    sendJson(response, 200, tractates);
    return true;
  }
  if (request.method === 'GET' && url.pathname === '/api/profiles') {
    const access = await learnerAccess(request);
    if (access.hosted) {
      const learner = await getHostedLearner(access.user, access.token);
      sendJson(response, 200, { profiles: [{ id: learner.id, profile: learner.profile, xp: learner.xp, updatedAt: learner.updatedAt }] });
    } else sendJson(response, 200, { profiles: await listLearners(root) });
    return true;
  }
  if (request.method === 'POST' && url.pathname === '/api/profiles') {
    const access = await learnerAccess(request);
    if (access.hosted) { sendJson(response, 409, { error: 'Your signed-in account already has a private learner profile.' }); return true; }
    const body = await readJsonBody(request);
    if (!body.displayName?.trim()) { sendJson(response, 400, { error: 'Enter a name for this learner profile.' }); return true; }
    sendJson(response, 201, { learner: await createLearner(root, body.displayName) });
    return true;
  }
  const labMatch = url.pathname.match(/^\/api\/labs\/([a-z-]+)$/);
  if (request.method === 'GET' && labMatch) {
    const library = JSON.parse(await fs.readFile(join(root, 'data', 'tractate-labs.json'), 'utf8'));
    const lab = library.labs.find((item) => item.id === labMatch[1]);
    if (!lab) { sendJson(response, 404, { error: 'Tractate lab not found.' }); return true; }
    sendJson(response, 200, lab);
    return true;
  }
  const learnerMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)$/);
  if (request.method === 'GET' && learnerMatch) {
    const { learner } = await readLearner(request, learnerMatch[1]);
    sendJson(response, 200, learner);
    return true;
  }
  if (request.method === 'DELETE' && learnerMatch) {
    const access = await learnerAccess(request, learnerMatch[1]);
    if (access.hosted) {
      await deleteHostedLearnerData(access.user, access.token);
      sendJson(response, 200, { deleted: true, note: 'Your learning data was deleted. This does not remove your sign-in identity; contact support for that.' });
    } else {
      const existed = await deleteLearner(root, access.id);
      if (sqliteEnabled()) revokeTokens(access.id);
      if (existed) sendJson(response, 200, { deleted: true });
      else sendJson(response, 404, { error: 'Learner profile not found.' });
    }
    return true;
  }
  const exportMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/export$/);
  if (request.method === 'GET' && exportMatch) {
    const { learner } = await readLearner(request, exportMatch[1]);
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="seder-learner-${exportMatch[1]}.json"`,
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify(learner, null, 2));
    return true;
  }
  const reviewMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/review$/);
  if (request.method === 'GET' && reviewMatch) {
    const { learner } = await readLearner(request, reviewMatch[1]);
    // FIRe (The Math Academy Way): alongside the full due/upcoming queue, the compressed plan — the
    // smallest set to actually retrieve and which due skills each covers implicitly.
    sendJson(response, 200, { ...reviewStatus(learner), fire: fireReviewPlan(learner) });
    return true;
  }
  const reviewItemsMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/review-items$/);
  if (request.method === 'GET' && reviewItemsMatch) {
    const { learner } = await readLearner(request, reviewItemsMatch[1]);
    // FIRe: retrieve only the compressed practice set — the simpler skills each one covers are refreshed
    // implicitly (see creditImplicitReviews). Report the saving so the UI can show what it removed.
    const status = reviewStatus(learner);
    const plan = fireReviewPlan(learner);
    const graph = await loadFoundationGraph();
    const map = await loadFoundationContentMap();
    const skillIds = plan.practice.map((item) => resolveFoundationSkillId(graph, map, item.skillId) || item.skillId);
    const items = await sourceReviewItems(root, skillIds);
    sendJson(response, 200, {
      items: items.slice(0, 4),
      fire: { dueCount: status.due.length, practiceCount: plan.practice.length, saved: plan.saved, covered: plan.covered }
    });
    return true;
  }
  const remediationMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/remediation$/);
  if (request.method === 'GET' && remediationMatch) {
    const { learner } = await readLearner(request, remediationMatch[1]);
    sendJson(response, 200, { remediation: await remediationFor(root, learner) });
    return true;
  }
  const graphPracticeMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/graph-practice$/);
  if (request.method === 'GET' && graphPracticeMatch) {
    const { learner } = await readLearner(request, graphPracticeMatch[1]);
    sendJson(response, 200, { practice: await nextGraphPractice(root, learner) });
    return true;
  }
  const recommendationMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/recommendation$/);
  if (request.method === 'GET' && recommendationMatch) {
    const { learner } = await readLearner(request, recommendationMatch[1]);
    sendJson(response, 200, { recommendation: await recommendFor(learner), learner });
    return true;
  }
  const nextActionMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/next-action$/);
  if (request.method === 'GET' && nextActionMatch) {
    const { learner } = await readLearner(request, nextActionMatch[1]);
    sendPrivateJson(response, 200, await nextActionFor(learner));
    return true;
  }
  const journeyMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/journey$/);
  if (request.method === 'GET' && journeyMatch) {
    const { learner } = await readLearner(request, journeyMatch[1]);
    sendJson(response, 200, await journeyStatus(root, learner));
    return true;
  }
  const insightsMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/insights$/);
  if (request.method === 'GET' && insightsMatch) {
    const { learner } = await readLearner(request, insightsMatch[1]);
    const answers = (learner.events || []).filter((event) => event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab');
    const correct = answers.filter((event) => event.correct).length;
    const contexts = Object.values(learner.evidence || {}).reduce((total, list) => total + list.length, 0);
    const journey = await journeyStatus(root, learner);
    sendJson(response, 200, { attempts: answers.length, correct, accuracy: answers.length ? Math.round((correct / answers.length) * 100) : null, sourceContexts: contexts, currentCanonMoment: journey.next?.title || 'First Canon Journey complete', completedMoments: journey.completed, totalMoments: journey.total, reviewDue: reviewStatus(learner).due.length, needsSupport: Object.entries(learner.struggles || {}).filter(([, count]) => count >= 2).map(([skillId]) => skillId) });
    return true;
  }
  const pilotAnalyticsMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/pilot-analytics$/);
  if (request.method === 'GET' && pilotAnalyticsMatch) {
    const { learner } = await readLearner(request, pilotAnalyticsMatch[1]);
    const events = (learner.events || []).filter((event) => event.type === 'answer_submitted');
    const attempts = events.length;
    const correct = events.filter((event) => event.correct).length;
    const misses = events.filter((event) => !event.correct).reduce((all, event) => { all[event.skillId] = (all[event.skillId] || 0) + 1; return all; }, {});
    const repairs = events.filter((event) => String(event.sourceContext || '').startsWith('Repair:'));
    const independent = events.filter((event) => String(event.sourceContext || '').startsWith('Independent encounter:'));
    const independentCorrect = independent.filter((event) => event.correct).length;
    const capstones = (learner.events || []).filter((event) => event.type === 'source_annotation' && String(event.sourceContext || '').includes('capstone')).length;
    const last = events.at(-1)?.at || null;
    sendJson(response, 200, { attempts, correct, accuracy: attempts ? Math.round((correct / attempts) * 100) : null, repairsAttempted: repairs.length, independentAttempts: independent.length, independentAccuracy: independent.length ? Math.round((independentCorrect / independent.length) * 100) : null, capstonesSubmitted: capstones, needsRepair: Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([skillId, misses]) => ({ skillId, misses })), lastActivityAt: last, streak: learner.dailyStreak || 0, xp: learner.xp || 0, reviewDue: reviewStatus(learner).due.length });
    return true;
  }
  // Aggregate, cross-learner reporting for the operator, not any individual learner. Local-mode
  // only: in hosted mode, RLS scopes every query to auth.uid(), so there is no safe way for this
  // server to read across learners without a service-role key, which it intentionally never holds
  // (see data/supabase-adapter.mjs). Real hosted-pilot aggregate reporting needs a separate
  // admin-side tool run with actual Supabase dashboard access, not this endpoint.
  if (url.pathname === '/api/admin/scrub-test-learners' && request.method === 'POST') {
    // Operator cleanup of test-artifact accounts (go-live-*, Learner A/B, Demo …) — the network
    // equivalent of scripts/scrub-test-learners.mjs, for operators without Render Shell access.
    // Admin-token-gated exactly like /api/admin/analytics; isTestLearner spares every real learner
    // AND the demo fixture, so even a leaked token can only remove test-pattern rows. Default is a
    // DRY RUN; ?confirm=1 deletes. Optional repeatable ?name=/?id= target extras explicitly.
    if (sqliteEnabled()) {
      const admin = process.env.SEDER_ADMIN_TOKEN;
      if (!admin) { sendJson(response, 403, { error: 'Set SEDER_ADMIN_TOKEN to enable operator cleanup.' }); return true; }
      const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (token !== admin) { sendJson(response, 401, { error: 'Operator (admin) authorization required.' }); return true; }
    }
    const names = url.searchParams.getAll('name');
    const ids = url.searchParams.getAll('id');
    const confirm = url.searchParams.get('confirm') === '1';
    const all = await listLearnersFull(root);
    const matches = all.filter((learner) => isTestLearner(learner, { names, ids }));
    let deleted = 0;
    if (confirm) {
      for (const learner of matches) {
        const existed = await deleteLearner(root, learner.id);
        if (existed) { revokeTokens(learner.id); deleted += 1; }
      }
    }
    sendPrivateJson(response, 200, {
      dryRun: !confirm,
      scanned: all.length,
      matched: matches.map((learner) => ({ id: learner.id, name: (learner.profile && learner.profile.displayName) || '' })),
      deleted
    });
    return true;
  }
  if (url.pathname === '/api/admin/analytics') {
    if (supabaseConfig().configured) {
      sendJson(response, 200, { available: false, reason: 'Aggregate analytics only works in local/demo mode. In hosted mode, row-level security correctly prevents this server from reading across learners without a service-role key it does not hold.' });
      return true;
    }
    // In hosted SQLite mode this endpoint reads across ALL learners, so it must be gated by an
    // operator admin token (SEDER_ADMIN_TOKEN). Without one set, cohort reporting stays off rather
    // than exposing learner aggregates publicly. Local/demo mode (no hosting) stays open.
    if (sqliteEnabled()) {
      const admin = process.env.SEDER_ADMIN_TOKEN;
      if (!admin) { sendJson(response, 403, { error: 'Operator analytics is disabled: set SEDER_ADMIN_TOKEN to enable cross-learner reporting.' }); return true; }
      const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (token !== admin) { sendJson(response, 401, { error: 'Operator (admin) authorization required.' }); return true; }
    }
    const learners = await listLearnersFull(root);
    const tractateGraph = JSON.parse(await fs.readFile(join(root, 'data', 'gemara-tractates.json'), 'utf8'));
    const totalLearners = learners.length;
    const totalXp = learners.reduce((sum, l) => sum + (l.xp || 0), 0);
    const allAnswerEvents = learners.flatMap((l) => (l.events || []).filter((e) => e.type === 'answer_submitted' || e.type === 'source_annotation' || e.type === 'canon_lab'));
    const totalAttempts = allAnswerEvents.length;
    const totalCorrect = allAnswerEvents.filter((e) => e.correct).length;
    const overallAccuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    // Labs (tractate-labs.json, served via lab.js) only ever emit answer_submitted events --
    // they have no stage_mastered/completion signal at all, unlike course-engine arcs. So
    // completedLearners/dropOff are only meaningful for tractates with a real arc; for
    // lab-only tractates they are reported as null rather than a misleading always-0/100%.
    const tractateStats = tractateGraph.tractates.filter((t) => t.labId).map((t) => {
      const stageId = t.arcUrl ? `${t.labId}-tractate-arc` : null;
      const completedLearners = stageId ? learners.filter((l) => (l.completedStages || []).includes(stageId)).length : null;
      const engagedLearners = learners.filter((l) => (l.events || []).some((e) => (e.skillId || '').includes(t.labId))).length;
      return { title: t.title, labId: t.labId, hasArc: Boolean(t.arcUrl), engagedLearners, completedLearners, dropOff: completedLearners === null ? null : Math.max(0, engagedLearners - completedLearners) };
    }).filter((t) => t.engagedLearners > 0).sort((a, b) => b.engagedLearners - a.engagedLearners);
    const stageCounts = {};
    learners.forEach((l) => (l.completedStages || []).forEach((stageId) => { stageCounts[stageId] = (stageCounts[stageId] || 0) + 1; }));
    const stageCompletion = Object.entries(stageCounts).sort((a, b) => b[1] - a[1]).map(([stageId, count]) => ({ stageId, count }));
    const struggleTotals = {};
    learners.forEach((l) => Object.entries(l.struggles || {}).forEach(([skillId, count]) => { if (count > 0) struggleTotals[skillId] = (struggleTotals[skillId] || 0) + count; }));
    const topStruggles = Object.entries(struggleTotals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skillId, count]) => ({ skillId, count }));
    const now = Date.now();
    const overdueReviews = learners.reduce((sum, l) => sum + (l.reviewQueue || []).filter((item) => new Date(item.dueAt).getTime() <= now).length, 0);
    // Pilot instrumentation: the psychometrics the graph needs a pilot to produce — per-skill
    // difficulty & discrimination and empirical prerequisite validation (does securing a prereq
    // predict passing the dependent skill?). Computed from the answer log over the foundation graph.
    const foundationGraph = JSON.parse(await fs.readFile(join(root, 'data', 'foundation-skill-graph.json'), 'utf8'));
    const graphPilot = computeGraphPilotAnalytics(learners, foundationGraph);
    // Learner feedback (feedback.js): the qualitative pilot signal — a reaction tied to a page and skill.
    const feedbackEvents = learners.flatMap((l) => (l.events || []).filter((e) => e.type === 'feedback').map((e) => ({ learner: l.id, sentiment: e.sentiment || 'unspecified', comment: e.comment || '', page: e.page || null, skillId: e.skillId || null, at: e.at || null })));
    const feedbackBySentiment = {};
    for (const f of feedbackEvents) feedbackBySentiment[f.sentiment] = (feedbackBySentiment[f.sentiment] || 0) + 1;
    const feedback = {
      total: feedbackEvents.length,
      bySentiment: feedbackBySentiment,
      recent: feedbackEvents.filter((f) => f.comment).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 25)
    };
    sendJson(response, 200, { available: true, totalLearners, totalXp, totalAttempts, overallAccuracy, tractateStats, stageCompletion, topStruggles, overdueReviews, graphPilot, feedback });
    return true;
  }
  const todayMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/today$/);
  if (request.method === 'GET' && todayMatch) {
    const { learner } = await readLearner(request, todayMatch[1]);
    const rhythmMinutes = { daily: 20, 'three-times-weekly': 20, weekly: 30 }[learner.rhythm] || 20;
    const review = reviewStatus(learner);
    const recommendation = await recommendFor(learner);
    const steps = [];
    if (recommendation.kind === 'placement') steps.push({ type: 'placement', label: 'Starting point', title: recommendation.title, reason: recommendation.reason, why: recommendation.why, minutes: 5, url: recommendation.url });
    else {
      const retrieval = recommendation.kind === 'review' && recommendation.skillId
        ? recommendation
        : await foundationRetrievalFor(learner);
      if (retrieval?.skillId) {
        steps.push({ type: 'review', label: 'Retrieve', title: retrieval.title, reason: retrieval.reason, minutes: 3, url: retrieval.url, skillId: retrieval.skillId });
      }
      const newLearning = recommendation.kind === 'review' ? await recommendFor(learner, { skipReview: true }) : recommendation;
      steps.push({ type: 'new', label: 'New learning', title: newLearning.title, reason: newLearning.reason, why: newLearning.why, minutes: Math.max(7, rhythmMinutes - (review.due.length ? 3 : 0) - 2), url: newLearning.url });
      steps.push({ type: 'mastery', label: 'Close the loop', title: 'Return to your path', reason: 'See what changed and what is ready next.', minutes: 2, url: 'mastery.html' });
    }
    const fading = decayingSkills(learner);
    const sessionTitle = recommendation.kind === 'placement' ? 'Your starting session' : recommendation.kind === 'remediation' ? 'Strengthen one source move' : 'Today’s canon session';
    sendJson(response, 200, { title: sessionTitle, totalMinutes: steps.reduce((total, step) => total + step.minutes, 0), xp: learner.xp, dailyStreak: learner.dailyStreak || 0, totalAnswered: learner.totalAnswered || 0, fadingCount: fading.length, steps });
    return true;
  }
  // JLA academy session, served with the answer key stripped and choices shuffled — the client
  // never receives correctChoiceId or the feedback text. Scoring is authoritative at /answer below.
  const jlaSessionMatch = url.pathname.match(/^\/api\/jla\/academy-session\/([a-zA-Z0-9-]+)$/);
  if (request.method === 'GET' && jlaSessionMatch) {
    const sessions = JSON.parse(await fs.readFile(join(root, 'data', 'jla-academy-sessions.json'), 'utf8'));
    let session;
    try { session = loadJlaAcademySession({ skillId: jlaSessionMatch[1], sessions }); }
    catch { sendJson(response, 404, { error: 'No Academy session for that skill.' }); return true; }
    const slice = JSON.parse(await fs.readFile(join(root, 'data', 'jla-foundation-skill-slice.json'), 'utf8'));
    sendJson(response, 200, { ...session, domain: slice.find((s) => s.id === jlaSessionMatch[1])?.domain || null });
    return true;
  }
  // Score a JLA academy answer server-side and record the graduation evidence for the authenticated
  // learner. correctness is computed here (not trusted from the client), and the JLA capability
  // mapping is derived from the shipped session + skill slice, not sent by the browser.
  const jlaAnswerMatch = url.pathname.match(/^\/api\/jla\/academy-session\/([a-zA-Z0-9-]+)\/answer$/);
  if (request.method === 'POST' && jlaAnswerMatch) {
    const skillId = jlaAnswerMatch[1];
    const sessions = JSON.parse(await fs.readFile(join(root, 'data', 'jla-academy-sessions.json'), 'utf8'));
    const session = sessions.find((s) => s.skillId === skillId);
    if (!session) { sendJson(response, 404, { error: 'No Academy session for that skill.' }); return true; }
    const body = await readJsonBody(request);
    let result;
    try { result = checkJlaAcademyChoice({ skillId, choiceId: body.choiceId, sessions }); }
    catch { sendJson(response, 400, { error: 'Unknown choice for this session.' }); return true; }
    const slice = JSON.parse(await fs.readFile(join(root, 'data', 'jla-foundation-skill-slice.json'), 'utf8'));
    const domain = slice.find((s) => s.id === skillId)?.domain || null;
    const access = await learnerAccess(request);
    const event = {
      type: 'answer_submitted', skillId, foundationSkillId: skillId, correct: result.correct,
      competency: 'sourceReasoning', sourceContext: session.sourceWindow.sourceRef,
      jlaCapability: Boolean(domain), domain, graduationLevel: session.graduationLevel,
      skillTitle: session.title, evidenceStatement: session.evidencePreview,
      sourceRef: session.sourceWindow.sourceRef, sourceUrl: session.sourceWindow.sourceUrl
    };
    if (access.hosted) await recordHostedEvent(access.user, access.token, event);
    else await recordLearnerEvent(root, access.id, event);
    sendJson(response, 201, { correct: result.correct, feedback: result.feedback, evidenceStatement: result.evidencePreview });
    return true;
  }
  const eventMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/events$/);
  if (request.method === 'POST' && eventMatch) {
    const event = await readJsonBody(request);
    if (!event.type) { sendJson(response, 400, { error: 'Learning event type is required.' }); return true; }
    const access = await learnerAccess(request, eventMatch[1]);
    const currentLearner = access.hosted ? await getHostedLearner(access.user, access.token) : await getLearner(root, access.id);
    if (event.type === 'stage_mastered' && !(await canMasterJourneyStage(root, currentLearner, event.stageId))) {
      sendJson(response, 409, { error: 'Complete the source evidence and prerequisite canon moments before advancing.' });
      return true;
    }
    if (event.type === 'placement_completed') await enrichPlacementWithFrontier(root, event);
    sendJson(response, 201, access.hosted ? await recordHostedEvent(access.user, access.token, event) : await recordLearnerEvent(root, access.id, event));
    return true;
  }
  if (url.pathname === '/api/yochai/search') {
    if (!process.env.YOCHAI_API_KEY) {
      sendJson(response, 503, { error: 'Yochai is in demo mode. Add YOCHAI_API_KEY to enable source discovery.' });
      return true;
    }
    const query = url.searchParams.get('q')?.trim();
    if (!query) { sendJson(response, 400, { error: 'Provide a search query.' }); return true; }
    try {
      const result = await callYochaiTool('search_corpus', { query, limit: 8 });
      sendJson(response, 200, { result });
    } catch (error) {
      sendJson(response, 502, { error: error.message });
    }
    return true;
  }
  return false;
}

// Deliberately minimal: a timestamped line to stderr. In a real deployment the host
// (Docker, systemd, PM2, the hosting platform) captures stderr on its own, so this is
// enough to make a pilot bug discoverable without needing the learner to describe it
// (see docs/launch-checklist.md). Not a replacement for a real error-tracking service.
function logError(context, error) {
  console.error(`[${new Date().toISOString()}] ${context}`, error?.stack || error);
}

process.on('uncaughtException', (error) => logError('uncaughtException', error));
process.on('unhandledRejection', (reason) => logError('unhandledRejection', reason));

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  // Baseline security headers on every response (safe/non-breaking: no CSP, since the app uses
  // inline scripts). setHeader persists through the writeHead calls in the handlers below.
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Strict-Transport-Security', 'max-age=15552000');
  try {
    if (url.pathname.startsWith('/api/') && await handleApi(request, response, url)) return;
    const redirects = { '/today.html': '/daily-router.html', '/daily.html': '/daily-router.html', '/index.html': '/seder.html' };
    if (redirects[url.pathname]) { response.writeHead(307, { Location: `${redirects[url.pathname]}${url.search}`, 'Cache-Control': 'no-store' }); response.end(); return; }
    const relativePath = url.pathname === '/' ? 'seder.html' : url.pathname.slice(1);
    // The academy answer key must not be reachable over HTTP — it is served only via the
    // key-stripped /api/jla/academy-session endpoint. (Tests and the link checker read it from
    // the filesystem, not the network, so this does not affect them.)
    if (relativePath === 'data/jla-academy-sessions.json') { response.writeHead(404); response.end('Not found'); return; }
    const target = normalize(join(root, relativePath));
    if (!target.startsWith(root) || !existsSync(target)) { response.writeHead(404); response.end('Not found'); return; }
    const ext = extname(target);
    // HTML is the app shell — keep it uncached so a redeploy is picked up immediately. Other static
    // assets (js/css/json data, images, fonts) change only on deploy, so cache them briefly. This
    // stops the 60KB skill-graph JSON and the scripts being re-downloaded on every pageload, which
    // serialized into multi-second waits under concurrent load. /api responses stay no-store (above).
    const cacheControl = ext === '.html' ? 'no-store' : 'public, max-age=300';
    response.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': cacheControl });
    createReadStream(target).pipe(response);
  } catch (error) {
    logError(`${request.method} ${url.pathname}`, error);
    sendJson(response, error.statusCode || 500, { error: error.message });
  }
}).listen(port, '0.0.0.0', () => console.log(`Seder is running at http://127.0.0.1:${port}`));

// Close SQLite cleanly on the SIGTERM/SIGINT a host sends on redeploy, so the WAL is
// checkpointed into the main .db file (a clean, consistent snapshot to back up).
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => { try { closeSqlite(); } catch { /* best effort */ } process.exit(0); });
}
