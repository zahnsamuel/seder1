import { createReadStream, existsSync, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callYochaiTool } from './yochai-adapter.mjs';
import { createLearner, decayingSkills, deleteLearner, getLearner, listLearners, listLearnersFull, recordLearnerEvent, reviewStatus } from './data/repository.mjs';
import { supabaseConfig, verifySupabaseAccessToken } from './data/supabase-adapter.mjs';
import { deleteHostedLearnerData, getHostedLearner, recordHostedEvent } from './data/supabase-learner-repository.mjs';
import { initSqlite, sqliteEnabled, issueToken, verifyToken, revokeTokens, closeSqlite } from './data/sqlite-store.mjs';
import { loadJlaAcademySession, checkJlaAcademyChoice } from './jla-academy-session.js';
import { canMasterJourneyStage, canonJourney, journeyStatus, nextGemaraArc, nextGraphPractice, nextJourneyRecommendation, remediationFor, sourceReviewItems } from './data/curriculum-engine.mjs';
import { explainRecommendation, whySentence } from './data/recommendation-why.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4180);
// Hosted pilot persistence: point SEDER_DB at a SQLite file to store learners there and turn
// on per-learner bearer-token auth (see data/sqlite-store.mjs). Unset = local JSON dev store.
if (process.env.SEDER_DB) initSqlite(process.env.SEDER_DB);

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
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json; charset=utf-8' };

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function foundationRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  const terms = [
    { stage: 'foundation-capstone', title: 'Foundation Year · Term I: build the reading repertoire', reason: 'Begin with the connected source sequence that builds case mapping, question reading, evidence, and reception before its capstone.', url: 'integrated-path.html' },
    { stage: 'term-two-capstone', title: 'Foundation Year · Term II: reason, scope, and responsibility', reason: 'Your first-term checkpoint is earned. Next, trace reasons, exceptions, and institutional responsibility through new sources.', url: 'second-foundation-term.html' },
    { stage: 'second-foundation-synthesis', title: 'Foundation Year · Term III: disagreement and synthesis', reason: 'Your second-term checkpoint is earned. Now preserve distinct voices, compare carefully, and carry the habit into synthesis.', url: 'term-three-journey.html' }
  ];
  return terms.find((term) => !completed.has(term.stage)) || null;
}

function gemaraYearRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  const terms = [
    { title: 'Gemara Year · Term I: time, space, and practice', reason: 'Continue the first post-Foundation term by carrying your reading repertoire through concrete cases of domain, measure, time, validity, and source-grounded preparation.', steps: [['shabbat-tractate-arc', 'Shabbat: map a legal case', 'shabbat-arc.html'], ['eruvin-tractate-arc', 'Eruvin: boundary and measure', 'eruvin-arc.html'], ['pesachim-tractate-arc', 'Pesachim: word, time, and source', 'pesachim-arc.html'], ['sukkah-tractate-arc', 'Sukkah: validity and purpose', 'sukkah-arc.html'], ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'], ['gemara-foundations-checkpoint', 'Gemara Foundations checkpoint', 'gemara-foundations.html']] },
    { title: 'Gemara Year · Term II: claims, responsibility, and institutions', reason: 'Continue the civil-reasoning term: map claims, identify categories of responsibility, and read institutions through their stated reasons.', steps: [['bava-metzia-tractate-arc', 'Bava Metzia: claims and evidence', 'bava-metzia-arc.html'], ['bava-kamma-tractate-arc', 'Bava Kamma: categories of damage', 'bava-kamma-arc.html'], ['ketubot-tractate-arc', 'Ketubot: schedule and reason', 'ketubot-arc.html'], ['sanhedrin-tractate-arc', 'Sanhedrin: category and specification', 'sanhedrin-arc.html'], ['civil-reasoning-checkpoint', 'Civil Reasoning checkpoint', 'civil-reasoning.html']] },
    { title: 'Gemara Year · Term III: rule and disagreement', reason: 'Trace a rule through its exceptions and preserve disagreement before taking those reading habits into a new legal field.', steps: [['chullin-tractate-arc', 'Chullin: rule and exception', 'chullin-arc.html'], ['niddah-tractate-arc', 'Niddah: three positions', 'niddah-arc.html']] },
    { title: 'Gemara Year · Term IV: speech, status, and transfer', reason: 'Read how language creates a legal category, how a default gives it shape, and how a reading move transfers across tractates without erasing their differences.', steps: [['moed-katan-tractate-arc', 'Moed Katan: rule and bounded exception', 'moed-katan-arc.html'], ['nedarim-tractate-arc', 'Nedarim: legal speech and function', 'nedarim-arc.html'], ['nazir-tractate-arc', 'Nazir: carry the language move across', 'nazir-arc.html'], ['gemara-year-synthesis', 'Gemara Year synthesis', 'gemara-year-synthesis.html']] }
  ];
  for (const term of terms) {
    const step = term.steps.find(([stage]) => !completed.has(stage));
    if (step) return { title: `${term.title} · ${step[1]}`, reason: term.reason, url: step[2] };
  }
  return null;
}

function moedExpansionRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  const gemaraYearStages = [
    'shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint',
    'bava-metzia-tractate-arc', 'bava-kamma-tractate-arc', 'ketubot-tractate-arc', 'sanhedrin-tractate-arc', 'civil-reasoning-checkpoint',
    'chullin-tractate-arc', 'niddah-tractate-arc', 'moed-katan-tractate-arc', 'nedarim-tractate-arc', 'nazir-tractate-arc', 'gemara-year-synthesis'
  ];
  if (!gemaraYearStages.every((stage) => completed.has(stage))) return null;
  const chapters = [
    ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'],
    ['rosh-hashanah-tractate-arc', 'Rosh Hashanah: calendar and public record', 'rosh-hashanah-arc.html'],
    ['megillah-tractate-arc', 'Megillah: public schedule and accommodation', 'megillah-arc.html'],
    ['taanit-tractate-arc', 'Taanit: timing dispute and distinction', 'taanit-arc.html'],
    ['chagigah-tractate-arc', 'Chagigah: rule, exception, and historical context', 'chagigah-arc.html'],
    ['moed-expansion-synthesis', 'Moed Expansion synthesis', 'moed-expansion-synthesis.html']
  ];
  const chapter = chapters.find(([stage]) => !completed.has(stage));
  if (!chapter) return null;
  return {
    title: `Moed Expansion Â· ${chapter[1]}`,
    reason: 'Your Gemara Year is complete. Extend the same source-reading habits through the calendar, public reading, and communal response.',
    url: chapter[2]
  };
}

function academyFoundationRecommendation(learner) {
  const scores = learner.foundationScores || {};
  if (!Object.keys(scores).length || learner.foundationGraduated) return null;
  const sequence = [
    ['fnd-orient-source-type', 'Orient to a Jewish source', 'Start by recognizing what kind of source you are looking at.'],
    ['fnd-signal-question-words', 'Find the question signal', 'A recurring Hebrew signal gives you a foothold in the first source.'],
    ['fnd-orient-question-present', 'Notice when a source is asking', 'Separate a question from a statement before trying to solve it.'],
    ['fnd-arg-claim', 'Name the source’s claim', 'Practice identifying what a source is actually saying.'],
    ['fnd-arg-evidence-role', 'Match evidence to a claim', 'Learn to point to the line that makes an argument move.'],
    ['fnd-context-who-audience', 'Find the source’s audience', 'Ask who is being addressed before applying a source.'],
    ['fnd-resp-learning-vs-ruling', 'Keep study and ruling distinct', 'Read halakhic sources seriously without mistaking literacy for personal guidance.'],
    ['fnd-compare-scope', 'Compare sources responsibly', 'Name what is shared while preserving each source’s scope and difference.'],
    ['fnd-indep-first-pass', 'Make a first pass through a new source', 'Carry the reading move into an unfamiliar short passage.'],
    ['fnd-agency-choose-next', 'Choose your next learning move', 'Use your evidence to decide what to study next.']
  ];
  const nextIndex = sequence.findIndex(([skill]) => Math.max(scores[skill] || 0, learner.mastery?.[skill] || 0) < .67);
  if (nextIndex === -1) return null;
  const next = sequence[nextIndex];
  // Explanation beats: the prior move in the sequence (if the learner has secured it) and the one
  // this unlocks next, so the recommendation can say what it builds on and what it opens.
  const prior = nextIndex > 0 ? sequence[nextIndex - 1] : null;
  const priorSecured = prior && Math.max(scores[prior[0]] || 0, learner.mastery?.[prior[0]] || 0) >= .67;
  const upcoming = sequence[nextIndex + 1] || null;
  return { kind: 'academy-foundation', title: `Academy Foundation · ${next[1]}`, reason: next[2], url: `daily-router.html?foundationSkill=${encodeURIComponent(next[0])}`, skillId: next[0], foundation: true, builtOn: priorSecured ? prior[1] : null, unlocks: upcoming ? upcoming[1] : null };
}

async function chooseRecommendation(learner, { skipReview = false } = {}) {
  if (!learner.placement) return { kind: 'placement', title: 'Find your Gemara starting point', reason: 'A short source-based placement will identify what you already know and what to build next.', url: 'placement.html' };
  const academyFoundation = academyFoundationRecommendation(learner);
  if (academyFoundation) return academyFoundation;
  if (!skipReview) {
    // A skill that reaches strong raw mastery (>= .85) is dropped from the formal
    // spaced-repetition queue for good (see repository.mjs recordLearnerEvent), so
    // the schedule alone will never resurface it again. Decay can still quietly eat
    // into it, so gating on the schedule alone would let a "mastered" skill go stale
    // forever without ever being recommended again. Treat severe, silent decay as
    // its own trigger for a review recommendation, on top of the formal due queue.
    const due = reviewStatus(learner).due;
    if (due.length) return { kind: 'review', title: 'Retrieve a skill before it fades', reason: 'Mastery grows through timely retrieval, especially after an uncertain answer.', url: 'review.html' };
    const badlyFaded = decayingSkills(learner).filter((skill) => skill.freshness === 'faded');
    if (badlyFaded.length) return { kind: 'review', decayTriggered: true, title: 'Refresh a skill that has faded', reason: `${badlyFaded.length === 1 ? 'A previously mastered skill has' : `${badlyFaded.length} previously mastered skills have`} faded well below their peak. A quick retrieval restores it faster than relearning from scratch.`, url: 'review.html' };
  }
  const remediation = await remediationFor(root, learner);
  if (remediation) return { kind: 'remediation', ...remediation, url: 'remediation.html' };
  const foundationTerm = foundationRecommendation(learner);
  if (foundationTerm) return { kind: 'foundation-term', ...foundationTerm };
  const gemaraYearTerm = gemaraYearRecommendation(learner);
  if (gemaraYearTerm) return { kind: 'gemara-year-term', ...gemaraYearTerm };
  const moedExpansion = moedExpansionRecommendation(learner);
  if (moedExpansion) return { kind: 'moed-expansion', ...moedExpansion };
  const graphPractice = await nextGraphPractice(root, learner);
  if (graphPractice) return { kind: 'graph-practice', title: graphPractice.skill.title, reason: graphPractice.reason, url: graphPractice.url, skill: graphPractice.skill, context: graphPractice.context, mastery: graphPractice.mastery, builtOn: graphPractice.builtOn, unlocks: graphPractice.unlocks };
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
    sendJson(response, 200, reviewStatus(learner));
    return true;
  }
  const reviewItemsMatch = url.pathname.match(/^\/api\/learners\/([a-zA-Z0-9_-]+)\/review-items$/);
  if (request.method === 'GET' && reviewItemsMatch) {
    const { learner } = await readLearner(request, reviewItemsMatch[1]);
    const due = reviewStatus(learner).due.map((item) => item.skillId);
    const items = await sourceReviewItems(root, due);
    sendJson(response, 200, { items: items.slice(0, 4) });
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
    sendJson(response, 200, { available: true, totalLearners, totalXp, totalAttempts, overallAccuracy, tractateStats, stageCompletion, topStruggles, overdueReviews });
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
      if (review.due.length) {
        review.due.slice(0, 1).forEach((item) => steps.push({ type: 'review', label: 'Retrieve', title: `Review ${item.skillId.replace(/^lab-/, '').replaceAll('-', ' ')}`, reason: item.reason, minutes: 3, url: 'review.html' }));
      } else if (recommendation.kind === 'review') {
        // Decay-triggered review recommendation (see recommendFor): the skill already
        // graduated out of the formal spaced-repetition queue, so there is no queue
        // item to read a step from -- build the step from the recommendation itself
        // so the plan still surfaces an actionable "Retrieve" step, not just a badge.
        steps.push({ type: 'review', label: 'Retrieve', title: recommendation.title, reason: recommendation.reason, minutes: 3, url: 'review.html' });
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
    const relativePath = url.pathname === '/' ? 'seder.html' : url.pathname.slice(1);
    // The academy answer key must not be reachable over HTTP — it is served only via the
    // key-stripped /api/jla/academy-session endpoint. (Tests and the link checker read it from
    // the filesystem, not the network, so this does not affect them.)
    if (relativePath === 'data/jla-academy-sessions.json') { response.writeHead(404); response.end('Not found'); return; }
    const target = normalize(join(root, relativePath));
    if (!target.startsWith(root) || !existsSync(target)) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
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
