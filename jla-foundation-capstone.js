const PASSING_PERCENT = 80;

export function jlaFoundationCapstoneEligibility(graduation = {}) {
  if (graduation.foundationComplete) {
    return { eligible: true, reason: 'foundation-complete' };
  }

  const independent = graduation.levelResults?.find(
    ({ levelId }) => levelId === 'independent-beginner'
  );
  if ((independent?.progress || 0) >= PASSING_PERCENT) {
    return { eligible: true, reason: 'independent-beginner-ready' };
  }

  return {
    eligible: false,
    reason: 'more-capability-evidence-needed',
    nextMissingCapability: graduation.nextMissingCapability || null
  };
}

export function evaluateJlaFoundationCapstone({
  graduation,
  correct,
  total
} = {}) {
  const eligibility = jlaFoundationCapstoneEligibility(graduation);
  if (!eligibility.eligible) {
    return {
      ...eligibility,
      passed: false,
      scorePercent: 0,
      graduationStatus: 'needs-review',
      evidenceStatement: null
    };
  }
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0) {
    throw new Error('Foundation capstone evaluation requires integer correct and total values.');
  }

  const scorePercent = Math.round((correct / total) * 100);
  const passed = scorePercent >= PASSING_PERCENT;
  return {
    ...eligibility,
    passed,
    scorePercent,
    graduationStatus: passed ? 'foundation-graduate' : 'needs-review',
    evidenceStatement: passed
      ? 'I can orient across the Jewish canon, use foundational learning moves, and continue with a sustainable rhythm.'
      : 'I can name the Foundation capabilities I need to revisit before graduation.'
  };
}

export { PASSING_PERCENT };
