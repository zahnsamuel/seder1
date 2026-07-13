import { createReadStream, existsSync, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callYochaiTool } from './yochai-adapter.mjs';
import { createLearner, decayingSkills, deleteLearner, getLearner, listLearners, listLearnersFull, recordLearnerEvent, reviewStatus } from './data/repository.mjs';
import { supabaseConfig, verifySupabaseAccessToken } from './data/supabase-adapter.mjs';
import { deleteHostedLearnerData, getHostedLearner, recordHostedEvent } from './data/supabase-learner-repository.mjs';
import { canMasterJourneyStage, canonJourney, journeyStatus, nextGemaraArc, nextGraphPractice, nextJourneyRecommendation, remediationFor, sourceReviewItems } from './data/curriculum-engine.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4180);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

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

async function recommendFor(learner, { skipReview = false } = {}) {
  if (!learner.placement) return { kind: 'placement', title: 'Find your Gemara starting point', reason: 'A short source-based placement will identify what you already know and what to build next.', url: 'placement.html' };
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
    if (badlyFaded.length) return { kind: 'review', title: 'Refresh a skill that has faded', reason: `${badlyFaded.length === 1 ? 'A previously mastered skill has' : `${badlyFaded.length} previously mastered skills have`} faded well below their peak. A quick retrieval restores it faster than relearning from scratch.`, url: 'review.html' };
  }
  const remediation = await remediationFor(root, learner);
  if (remediation) return { kind: 'remediation', ...remediation, url: 'remediation.html' };
  const graphPractice = await nextGraphPractice(root, learner);
  if (graphPractice) return { kind: 'graph-practice', title: graphPractice.skill.title, reason: graphPractice.reason, url: graphPractice.url, skill: graphPractice.skill, context: graphPractice.context, mastery: graphPractice.mastery };
  const journeyRecommendation = await nextJourneyRecommendation(root, learner);
  if (journeyRecommendation) return journeyRecommendation;
  const gemaraArc = await nextGemaraArc(root, learner);
  if (gemaraArc) return { kind: 'gemara-arc', ...gemaraArc };
  return { kind: 'shas-map', title: 'Choose your next Shas practice field', reason: 'Your current foundations are ready for broader tractate exploration.', url: 'shas-map-v2.html' };
}

async function learnerAccess(request, requestedId) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token && supabaseConfig().configured) {
    const user = await verifySupabaseAccessToken(token);
    if (requestedId && requestedId !== user.id) throw new Error('You can only access your own learner record.');
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
    sendJson(response, 200, { status: 'ok', yochai: process.env.YOCHAI_API_KEY ? 'configured' : 'demo-mode', persistence: supabaseConfig().configured ? 'supabase-ready' : 'local-development' });
    return true;
  }
  if (request.method === 'GET' && url.pathname === '/api/public-config') {
    const config = supabaseConfig();
    sendJson(response, 200, { supabaseUrl: config.url || null, supabaseAnonKey: config.anonKey || null });
    return true;
  }
  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    if (!supabaseConfig().configured) { sendJson(response, 503, { error: 'Supabase sign-in is not configured yet.' }); return true; }
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) { sendJson(response, 401, { error: 'A sign-in session is required.' }); return true; }
    try { sendJson(response, 200, { user: await verifySupabaseAccessToken(token) }); }
    catch (error) { sendJson(response, 401, { error: error.message }); }
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
    const review = reviewStatus(learner);
    const recommendation = await recommendFor(learner);
    const steps = [];
    if (recommendation.kind === 'placement') steps.push({ type: 'placement', label: 'Starting point', title: recommendation.title, reason: recommendation.reason, minutes: 5, url: recommendation.url });
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
      steps.push({ type: 'new', label: 'New learning', title: newLearning.title, reason: newLearning.reason, minutes: 7, url: newLearning.url });
      steps.push({ type: 'mastery', label: 'Close the loop', title: 'Return to your path', reason: 'See what changed and what is ready next.', minutes: 2, url: 'mastery.html' });
    }
    const fading = decayingSkills(learner);
    const sessionTitle = recommendation.kind === 'placement' ? 'Your starting session' : recommendation.kind === 'remediation' ? 'Strengthen one source move' : 'Today’s canon session';
    sendJson(response, 200, { title: sessionTitle, totalMinutes: steps.reduce((total, step) => total + step.minutes, 0), xp: learner.xp, dailyStreak: learner.dailyStreak || 0, totalAnswered: learner.totalAnswered || 0, fadingCount: fading.length, steps });
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
  try {
    if (url.pathname.startsWith('/api/') && await handleApi(request, response, url)) return;
    const relativePath = url.pathname === '/' ? 'seder.html' : url.pathname.slice(1);
    const target = normalize(join(root, relativePath));
    if (!target.startsWith(root) || !existsSync(target)) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(target).pipe(response);
  } catch (error) {
    logError(`${request.method} ${url.pathname}`, error);
    sendJson(response, 500, { error: error.message });
  }
}).listen(port, '127.0.0.1', () => console.log(`Seder is running at http://127.0.0.1:${port}`));
