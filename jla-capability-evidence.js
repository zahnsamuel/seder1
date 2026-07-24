const STATUS_STRENGTH = {
  introduced: 0,
  earned: 1,
  stable: 2,
  'transfer-ready': 3
};

const REVIEW_DAYS = {
  introduced: 1,
  earned: 7,
  stable: 21,
  'transfer-ready': 30
};

const addDays = (date, days) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

const statusFor = ({ correct, demonstrationCount = 1, isTransfer = false }) => {
  if (!correct) return 'introduced';
  if (isTransfer) return 'transfer-ready';
  if (demonstrationCount >= 2) return 'stable';
  return 'earned';
};

export function recordCapabilityEvidence({
  skill,
  session,
  correct,
  demonstrationCount = 1,
  isTransfer = false,
  now = new Date()
} = {}) {
  if (!skill?.id || !skill.domain || !skill.graduationLevel) {
    throw new Error('Capability evidence requires a mapped JLA skill.');
  }
  if (!session?.sourceWindow?.sourceRef || !session.sourceWindow.sourceUrl) {
    throw new Error('Capability evidence requires a verified source window.');
  }

  const status = statusFor({ correct, demonstrationCount, isTransfer });
  const earnedAt = correct ? now.toISOString() : null;

  return {
    skillId: skill.id,
    evidenceStatement:
      session.evidencePreview ||
      `I can ${skill.title.charAt(0).toLowerCase()}${skill.title.slice(1)}.`,
    domain: skill.domain,
    graduationLevel: skill.graduationLevel,
    sourceRef: session.sourceWindow.sourceRef,
    sourceUrl: session.sourceWindow.sourceUrl,
    status,
    earnedAt,
    nextReview: addDays(now, REVIEW_DAYS[status])
  };
}

export function mergeCapabilityEvidence(existing = [], incoming) {
  if (!incoming?.skillId || !(incoming.status in STATUS_STRENGTH)) {
    throw new Error('Incoming capability evidence is invalid.');
  }

  const priorIndex = existing.findIndex(({ skillId }) => skillId === incoming.skillId);
  if (priorIndex === -1) return [...existing, incoming];

  const prior = existing[priorIndex];
  const strongest =
    STATUS_STRENGTH[incoming.status] >= STATUS_STRENGTH[prior.status] ? incoming : prior;
  const merged = {
    ...strongest,
    earnedAt: prior.earnedAt || incoming.earnedAt || null
  };

  return existing.map((item, index) => (index === priorIndex ? merged : item));
}

export { STATUS_STRENGTH };
