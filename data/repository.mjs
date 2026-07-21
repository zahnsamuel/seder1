import { existsSync, promises as fs } from 'node:fs';
import { join } from 'node:path';
import { decayedMasteryMap, freshnessOf } from './mastery-decay.mjs';

const learnerFile = (root) => join(root, 'data', 'learners.json');
const defaultLearner = (id) => ({
  id,
  xp: 0,
  mastery: {},
  evidence: {},
  masteryUpdatedAt: {},
  struggles: {},
  competencies: { recognition: 0, translation: 0, argument: 0, sourceReasoning: 0 },
  profile: { displayName: id === 'demo' ? 'Demo learner' : 'Learner', createdAt: new Date().toISOString() },
  goal: null,
  completedStages: [],
  reviewQueue: [],
  placement: null,
  foundationScores: {},
  rhythm: null,
  artifacts: {},
  events: [],
  dailyStreak: 0,
  lastStudyDate: null,
  totalAnswered: 0,
  updatedAt: new Date().toISOString(),
});

async function readLearners(root) {
  const file = learnerFile(root);
  if (!existsSync(file)) return {};
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeLearners(root, learners) {
  await fs.writeFile(learnerFile(root), JSON.stringify(learners, null, 2), 'utf8');
}

// Local-mode persistence is a single shared learners.json per root, read fully, mutated
// in memory, then written back whole. Without serialization, two concurrent requests for
// the same learner (e.g. two answers submitted back-to-back before the first response
// returns) can both read the same pre-write snapshot and the second write silently
// clobbers the first -- a genuine lost-update race, not just a theoretical one, since the
// server has no other concurrency control. Every read-modify-write call in this module is
// funneled through this per-root queue so they execute strictly one at a time. Keyed by
// root (rather than one global queue) so unrelated learner stores -- e.g. separate test
// roots -- never block on each other.
const writeQueues = new Map();
function withWriteLock(root, fn) {
  const run = (writeQueues.get(root) || Promise.resolve()).then(fn, fn);
  writeQueues.set(root, run.then(() => {}, () => {}));
  return run;
}

function normalizedLearner(learner) {
  if (!learner) return null;
  const base = defaultLearner(learner.id);
  const merged = { ...base, ...learner, profile: { ...base.profile, ...(learner.profile || {}) }, competencies: { ...base.competencies, ...(learner.competencies || {}) }, evidence: { ...(learner.evidence || {}) }, masteryUpdatedAt: { ...(learner.masteryUpdatedAt || {}) }, struggles: { ...(learner.struggles || {}) }, artifacts: { ...(learner.artifacts || {}) }, foundationScores: { ...(learner.foundationScores || {}) }, reviewQueue: normalizedReviewQueue(learner.reviewQueue) };
  merged.decayedMastery = decayedMasteryMap(merged.mastery, merged.masteryUpdatedAt);
  return merged;
}

function normalizedReviewQueue(queue = []) {
  return queue.map((item) => typeof item === 'string' ? { skillId: item, dueAt: new Date().toISOString(), attempts: 1, reason: 'A previous answer was uncertain.' } : item);
}

function competencyFor(event) {
  if (event.competency) return event.competency;
  if (/proof|canon|source/i.test(event.skillId || '')) return 'sourceReasoning';
  if (/moves|question|flow/i.test(event.skillId || '')) return 'argument';
  if (/translation|language/i.test(event.skillId || '')) return 'translation';
  return 'recognition';
}

function queueReview(learner, skillId, { delayHours = 0, reason } = {}) {
  learner.reviewQueue = normalizedReviewQueue(learner.reviewQueue);
  const dueAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
  const existing = learner.reviewQueue.find((item) => item.skillId === skillId);
  if (existing) Object.assign(existing, { dueAt, reason, attempts: (existing.attempts || 0) + 1 });
  else learner.reviewQueue.push({ skillId, dueAt, reason, attempts: 1 });
}

function reviewDelayHours(learner, skillId) {
  const prior = normalizedReviewQueue(learner.reviewQueue).find((item) => item.skillId === skillId);
  const repetitions = prior?.attempts || 0;
  return [0, 24, 72, 168, 336][Math.min(repetitions, 4)];
}

export function reviewStatus(learner) {
  const now = Date.now();
  const queue = normalizedReviewQueue(learner.reviewQueue);
  return {
    due: queue.filter((item) => new Date(item.dueAt).getTime() <= now),
    upcoming: queue.filter((item) => new Date(item.dueAt).getTime() > now)
  };
}

// Skills a learner once established (raw evidence >= .67) that have quietly faded
// with time, even though nothing is formally "due" per the review schedule yet.
// This is the Math-Academy-style signal that a shown mastery percentage is not
// the same thing as current, reliable knowledge.
export function decayingSkills(learner) {
  const mastery = learner.mastery || {};
  const masteryUpdatedAt = learner.masteryUpdatedAt || {};
  return Object.keys(mastery)
    .filter((skillId) => (mastery[skillId] || 0) >= .67)
    .map((skillId) => {
      const decayed = (decayedMasteryMap(mastery, masteryUpdatedAt))[skillId];
      return { skillId, raw: mastery[skillId], decayed, freshness: freshnessOf(mastery[skillId], decayed) };
    })
    .filter((entry) => entry.freshness !== 'fresh');
}

export async function getLearner(root, id) {
  const learners = await readLearners(root);
  return normalizedLearner(learners[id]) || defaultLearner(id);
}

export async function listLearners(root) {
  const learners = await readLearners(root);
  return Object.values(learners).map((learner) => { const normalized = normalizedLearner(learner); return { id: normalized.id, profile: normalized.profile, xp: normalized.xp || 0, updatedAt: normalized.updatedAt }; });
}

// Full local-mode learner records, for aggregate/operator-facing reporting only (see
// /api/admin/analytics in server.mjs). This intentionally has no hosted-mode equivalent:
// Supabase RLS scopes every query to auth.uid(), so there is no safe way for the running
// app to read across hosted learners without a service-role key, which it never holds.
export async function listLearnersFull(root) {
  const learners = await readLearners(root);
  return Object.values(learners).map((learner) => normalizedLearner(learner));
}

export async function deleteLearner(root, id) {
  return withWriteLock(root, async () => {
    const learners = await readLearners(root);
    const existed = id in learners;
    delete learners[id];
    await writeLearners(root, learners);
    return existed;
  });
}

export async function createLearner(root, displayName) {
  return withWriteLock(root, async () => {
    const learners = await readLearners(root);
    const id = `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'learner'}-${Date.now().toString().slice(-6)}`;
    const learner = defaultLearner(id);
    learner.profile = { displayName: displayName.trim(), createdAt: new Date().toISOString() };
    learners[id] = learner;
    await writeLearners(root, learners);
    return learner;
  });
}

export async function recordLearnerEvent(root, id, event) {
  return withWriteLock(root, () => recordLearnerEventUnlocked(root, id, event));
}

async function recordLearnerEventUnlocked(root, id, event) {
  const learners = await readLearners(root);
  const learner = learners[id] || defaultLearner(id);
  learner.reviewQueue = normalizedReviewQueue(learner.reviewQueue);
  learner.competencies ||= { recognition: 0, translation: 0, argument: 0, sourceReasoning: 0 };
  learner.evidence ||= {};
  learner.struggles ||= {};
  learner.artifacts ||= {};
  const recorded = { ...event, at: new Date().toISOString() };
  learner.events.push(recorded);
  if (event.type === 'retrieval_scheduled' && event.skillId) {
    queueReview(learner, event.skillId, {
      delayHours: Number.isFinite(event.delayHours) ? Math.max(1, event.delayHours) : 24,
      reason: event.reason || 'Return to retrieve this source move before it fades.'
    });
  }
  const today = recorded.at.slice(0, 10);
  if (event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab') {
    learner.totalAnswered = (learner.totalAnswered || 0) + 1;
    if (learner.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      learner.dailyStreak = learner.lastStudyDate === yesterday ? (learner.dailyStreak || 0) + 1 : 1;
      learner.lastStudyDate = today;
    }
  }
  if (event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab') {
    learner.xp += event.correct ? 10 : 5;
    const contexts = new Set(learner.evidence[event.skillId] || []);
    if (event.correct && event.sourceContext) contexts.add(event.sourceContext);
    learner.evidence[event.skillId] = [...contexts];
    const transferBonus = event.correct && contexts.size > 1 ? .08 : 0;
    learner.mastery[event.skillId] = Math.min(1, (learner.mastery[event.skillId] || 0) + (event.correct ? .34 + transferBonus : .08));
    learner.masteryUpdatedAt ||= {};
    learner.masteryUpdatedAt[event.skillId] = recorded.at;
    const competency = competencyFor(event);
    learner.competencies[competency] = Math.min(1, (learner.competencies[competency] || 0) + (event.correct ? 0.22 : 0.04));
    learner.struggles[event.skillId] = Math.max(0, (learner.struggles[event.skillId] || 0) + (event.correct ? -1 : 1));
    if (!event.correct) queueReview(learner, event.skillId, { delayHours: reviewDelayHours(learner, event.skillId), reason: 'Revisit this source move while it is still fresh.' });
    if (event.correct && learner.mastery[event.skillId] < .85) {
      // Read the delay (which depends on this skill's prior attempts in the review
      // queue) BEFORE clearing the queue entry below. Clearing first and computing
      // the delay after always found an empty queue, so every durability review was
      // silently scheduled as "due now" instead of properly spaced out.
      const contexts = learner.evidence?.[event.skillId]?.length || 0;
      const delay = reviewDelayHours(learner, event.skillId) * (contexts > 1 ? 2 : 1);
      if (learner.mastery[event.skillId] >= .67) learner.reviewQueue = learner.reviewQueue.filter((item) => item.skillId !== event.skillId);
      queueReview(learner, event.skillId, { delayHours: delay, reason: contexts > 1 ? 'You have shown transfer across sources; the next retrieval is spaced further out.' : 'A later retrieval will help make this skill durable.' });
    } else if (event.correct && learner.mastery[event.skillId] >= .67) {
      learner.reviewQueue = learner.reviewQueue.filter((item) => item.skillId !== event.skillId);
    }
  }
  if (event.type === 'stage_mastered' && !learner.completedStages.includes(event.stageId)) learner.completedStages.push(event.stageId);
  if (event.type === 'journey_artifact_saved' && event.artifactType && event.artifactId) {
    const items = new Set(learner.artifacts[event.artifactType] || []);
    items.add(event.artifactId);
    learner.artifacts[event.artifactType] = [...items];
  }
  if (event.type === 'goal_set') learner.goal = event.goal || null;
  if (event.type === 'learning_rhythm_set' && ['daily', 'three-times-weekly', 'weekly'].includes(event.rhythm)) learner.rhythm = event.rhythm;
  if (event.type === 'placement_completed') {
    learner.placement = { completedAt: recorded.at, scores: event.scores || {} };
    learner.foundationScores = { ...(learner.foundationScores || {}), ...(event.foundationScores || {}) };
    learner.masteryUpdatedAt ||= {};
    Object.entries(event.scores || {}).forEach(([skillId, score]) => {
      learner.mastery[skillId] = Math.max(learner.mastery[skillId] || 0, Math.min(1, Number(score) || 0));
      learner.masteryUpdatedAt[skillId] = recorded.at;
    });
    // Roll every placement check into a competency signal. Previously `mishnah-orientation`
    // was scored and stored in learner.mastery but never fed any competency gate, and
    // `translation` had no placement question at all -- meaning recommendFor()'s very
    // first post-placement gate (competencies.translation < .4) fired for every new
    // learner unconditionally, regardless of actual vocabulary baseline.
    learner.competencies.recognition = Math.max(learner.competencies.recognition, event.scores?.['hebrew-decoding'] || 0, event.scores?.['mishnah-orientation'] || 0);
    learner.competencies.translation = Math.max(learner.competencies.translation, event.scores?.['language-baseline'] || 0);
    learner.competencies.argument = Math.max(learner.competencies.argument, event.scores?.['gemara-moves'] || 0);
    learner.competencies.sourceReasoning = Math.max(learner.competencies.sourceReasoning, event.scores?.['proof-texts'] || 0);
  }
  learner.updatedAt = new Date().toISOString();
  learners[id] = learner;
  await writeLearners(root, learners);
  return normalizedLearner(learner);
}
