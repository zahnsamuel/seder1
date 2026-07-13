import { supabaseRest } from './supabase-adapter.mjs';

const competencies = { recognition: 0, translation: 0, argument: 0, sourceReasoning: 0 };
const empty = (id, displayName = 'Learner') => ({ id, xp: 0, mastery: {}, evidence: {}, masteryUpdatedAt: {}, struggles: {}, competencies: { ...competencies }, profile: { displayName }, completedStages: [], reviewQueue: [], placement: null, artifacts: {}, events: [], dailyStreak: 0, lastStudyDate: null, totalAnswered: 0, updatedAt: new Date().toISOString() });
const encode = (value) => encodeURIComponent(value);

function competencyFor(event) {
  if (event.competency) return event.competency;
  if (/proof|canon|source/i.test(event.skillId || '')) return 'sourceReasoning';
  if (/moves|question|flow/i.test(event.skillId || '')) return 'argument';
  if (/translation|language/i.test(event.skillId || '')) return 'translation';
  return 'recognition';
}

function reviewStatus(learner) {
  const now = Date.now();
  return { due: learner.reviewQueue.filter((item) => new Date(item.dueAt).getTime() <= now), upcoming: learner.reviewQueue.filter((item) => new Date(item.dueAt).getTime() > now) };
}

export async function getHostedLearner(user, accessToken) {
  const id = user.id;
  const [stateRows, profileRows, reviewRows, placementRows] = await Promise.all([
    supabaseRest(`learner_state?user_id=eq.${encode(id)}&select=*`, { accessToken }),
    supabaseRest(`profiles?id=eq.${encode(id)}&select=*`, { accessToken }),
    supabaseRest(`review_items?user_id=eq.${encode(id)}&select=*&order=due_at.asc`, { accessToken }),
    supabaseRest(`placement_results?user_id=eq.${encode(id)}&select=*`, { accessToken })
  ]);
  const state = stateRows[0] || {};
  const profile = profileRows[0] || {};
  return {
    ...empty(id, profile.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Learner'),
    xp: state.xp || 0,
    mastery: state.mastery || {},
    evidence: state.evidence || {},
    masteryUpdatedAt: state.mastery_updated_at || {},
    struggles: state.struggles || {},
    artifacts: state.artifacts || {},
    events: state.events || [],
    competencies: { ...competencies, ...(state.competencies || {}) },
    completedStages: state.completed_stages || [],
    reviewQueue: reviewRows.map((item) => ({ skillId: item.skill_id, dueAt: item.due_at, attempts: item.attempts, reason: item.reason })),
    placement: placementRows[0] ? { completedAt: placementRows[0].completed_at, scores: placementRows[0].scores } : null,
    totalAnswered: state.total_answered || 0, dailyStreak: state.daily_streak || 0, lastStudyDate: state.last_study_date || null,
    updatedAt: state.updated_at || profile.updated_at || new Date().toISOString()
  };
}

async function putState(learner, accessToken) {
  await supabaseRest('learner_state?on_conflict=user_id', { accessToken, method: 'POST', body: {
    user_id: learner.id, xp: learner.xp, mastery: learner.mastery, evidence: learner.evidence || {}, mastery_updated_at: learner.masteryUpdatedAt || {}, struggles: learner.struggles || {}, artifacts: learner.artifacts || {}, events: learner.events || [], total_answered: learner.totalAnswered || 0, daily_streak: learner.dailyStreak || 0, last_study_date: learner.lastStudyDate || null, competencies: learner.competencies,
    completed_stages: learner.completedStages, updated_at: new Date().toISOString()
  } });
}

async function putReview(learner, skillId, accessToken) {
  const item = learner.reviewQueue.find((entry) => entry.skillId === skillId);
  if (item) await supabaseRest('review_items?on_conflict=user_id,skill_id', { accessToken, method: 'POST', body: { user_id: learner.id, skill_id: skillId, due_at: item.dueAt, attempts: item.attempts, reason: item.reason, updated_at: new Date().toISOString() } });
  else await supabaseRest(`review_items?user_id=eq.${encode(learner.id)}&skill_id=eq.${encode(skillId)}`, { accessToken, method: 'DELETE' });
}

export async function recordHostedEvent(user, accessToken, event) {
  const learner = await getHostedLearner(user, accessToken);
  learner.events ||= [];
  learner.struggles ||= {};
  learner.masteryUpdatedAt ||= {};
  const recorded = { ...event, at: new Date().toISOString() };
  learner.events.push(recorded);
  if (event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab') {
    learner.totalAnswered = (learner.totalAnswered || 0) + 1;
    const today = recorded.at.slice(0, 10);
    if (learner.lastStudyDate !== today) { const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10); learner.dailyStreak = learner.lastStudyDate === yesterday ? (learner.dailyStreak || 0) + 1 : 1; learner.lastStudyDate = today; }
  }
  if (event.type === 'answer_submitted' || event.type === 'source_annotation' || event.type === 'canon_lab') {
    const correct = Boolean(event.correct);
    const skillId = event.skillId;
    const competency = competencyFor(event);
    learner.xp += correct ? 10 : 5;
    learner.evidence ||= {};
    const contexts = new Set(learner.evidence[skillId] || []);
    if (correct && event.sourceContext) contexts.add(event.sourceContext);
    learner.evidence[skillId] = [...contexts];
    const transferBonus = correct && contexts.size > 1 ? .08 : 0;
    learner.mastery[skillId] = Math.min(1, (learner.mastery[skillId] || 0) + (correct ? .34 + transferBonus : .08));
    learner.masteryUpdatedAt[skillId] = recorded.at;
    learner.competencies[competency] = Math.min(1, (learner.competencies[competency] || 0) + (correct ? .22 : .04));
    learner.struggles[skillId] = Math.max(0, (learner.struggles[skillId] || 0) + (correct ? -1 : 1));
    const existing = learner.reviewQueue.find((item) => item.skillId === skillId);
    if (!correct || learner.mastery[skillId] < .85) {
      const priorAttempts = existing?.attempts || 0;
      const delay = correct ? [24, 72, 168, 336][Math.min(priorAttempts, 3)] : 0;
      const item = existing || { skillId, attempts: 0 };
      Object.assign(item, { dueAt: new Date(Date.now() + delay * 3600000).toISOString(), reason: correct ? 'A second retrieval will help make this skill durable.' : 'Revisit this source move while it is still fresh.', attempts: (item.attempts || 0) + 1 });
      if (!existing) learner.reviewQueue.push(item);
    } else learner.reviewQueue = learner.reviewQueue.filter((item) => item.skillId !== skillId);
    await supabaseRest('attempts', { accessToken, method: 'POST', body: { user_id: learner.id, skill_id: skillId, competency, correct, source_context: event.sourceContext || null } });
    await putReview(learner, skillId, accessToken);
  }
  if (event.type === 'stage_mastered' && !learner.completedStages.includes(event.stageId)) learner.completedStages.push(event.stageId);
  if (event.type === 'journey_artifact_saved' && event.artifactType && event.artifactId) {
    learner.artifacts ||= {};
    const items = new Set(learner.artifacts[event.artifactType] || []);
    items.add(event.artifactId);
    learner.artifacts[event.artifactType] = [...items];
  }
  if (event.type === 'placement_completed') {
    learner.placement = { completedAt: new Date().toISOString(), scores: event.scores || {} };
    Object.entries(event.scores || {}).forEach(([skill, score]) => { learner.mastery[skill] = Math.max(learner.mastery[skill] || 0, Math.min(1, Number(score) || 0)); });
    learner.competencies.recognition = Math.max(learner.competencies.recognition, event.scores?.['hebrew-decoding'] || 0);
    learner.competencies.argument = Math.max(learner.competencies.argument, event.scores?.['gemara-moves'] || 0);
    learner.competencies.sourceReasoning = Math.max(learner.competencies.sourceReasoning, event.scores?.['proof-texts'] || 0);
    await supabaseRest('placement_results?on_conflict=user_id', { accessToken, method: 'POST', body: { user_id: learner.id, scores: event.scores || {}, completed_at: learner.placement.completedAt } });
  }
  await putState(learner, accessToken);
  return getHostedLearner(user, accessToken);
}

// Deletes every row of a signed-in learner's own data across all learner tables, scoped by
// RLS to auth.uid() (see supabase/migrations/004_delete_own_data.sql). This never touches
// auth.users itself: doing that requires the Supabase admin API with a service-role key,
// which this server intentionally never holds (see supabase-adapter.mjs). Callers must be
// clear with learners that this erases their learning data, not their sign-in identity.
export async function deleteHostedLearnerData(user, accessToken) {
  const id = user.id;
  await Promise.all([
    supabaseRest(`attempts?user_id=eq.${encode(id)}`, { accessToken, method: 'DELETE' }),
    supabaseRest(`review_items?user_id=eq.${encode(id)}`, { accessToken, method: 'DELETE' }),
    supabaseRest(`placement_results?user_id=eq.${encode(id)}`, { accessToken, method: 'DELETE' }),
    supabaseRest(`daily_sessions?user_id=eq.${encode(id)}`, { accessToken, method: 'DELETE' }),
    supabaseRest(`learner_state?user_id=eq.${encode(id)}`, { accessToken, method: 'DELETE' }),
  ]);
  await supabaseRest(`profiles?id=eq.${encode(id)}`, { accessToken, method: 'DELETE' });
}

export { reviewStatus };
