const SECURE_STATUSES = new Set(['earned', 'stable', 'transfer-ready']);

const evidenceMap = (learnerState = {}) =>
  new Map((learnerState.evidence || []).map((item) => [item.skillId, item]));

const sessionFor = (sessionType, skill) => ({
  sessionType,
  targetSkill: skill.id,
  graduationLevel: skill.graduationLevel,
  title: skill.title,
  nextStep: `academy-session.html?skill=${encodeURIComponent(skill.id)}`,
  evidenceStatement: `I can ${skill.title.charAt(0).toLowerCase()}${skill.title.slice(1)}.`
});

const isDue = (evidence, now) =>
  evidence?.nextReview && new Date(evidence.nextReview).getTime() <= now.getTime();

export function chooseJlaTodaySession({
  skills = [],
  learnerState = {},
  now = new Date()
} = {}) {
  if (!skills.length) throw new Error('JLA Today routing requires at least one skill.');

  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const evidence = evidenceMap(learnerState);
  const secure = new Set(
    [...evidence.entries()]
      .filter(([, item]) => SECURE_STATUSES.has(item.status))
      .map(([skillId]) => skillId)
  );

  if ((learnerState.missedDays || 0) > 0) {
    const recovery = byId.get('habit-recovery-001');
    if (recovery) return sessionFor('recovery', recovery);
  }

  const review = skills.find((skill) => isDue(evidence.get(skill.id), now));
  if (review) return sessionFor('review', review);

  const frontier = skills.find(
    (skill) =>
      skill.id !== 'habit-transfer-001' &&
      !secure.has(skill.id) &&
      !evidence.has(skill.id) &&
      skill.prerequisites.every((prerequisite) => secure.has(prerequisite))
  );
  if (frontier) return sessionFor('frontier', frontier);

  const transfer = byId.get('habit-transfer-001');
  if (
    transfer &&
    transfer.prerequisites.every((prerequisite) => secure.has(prerequisite))
  ) {
    return sessionFor('transfer', transfer);
  }

  const fallback = byId.get('source-family-001') || skills[0];
  return sessionFor('foundation', fallback);
}
