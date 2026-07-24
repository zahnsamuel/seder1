const COUNTED_STATUSES = new Set(['earned', 'stable', 'transfer-ready']);

export function evaluateJlaGraduation({
  levels = [],
  skills = [],
  transcript = []
} = {}) {
  if (!levels.length || !skills.length) {
    throw new Error('Graduation evaluation requires JLA levels and skills.');
  }

  const secure = new Set(
    transcript
      .filter(({ status }) => COUNTED_STATUSES.has(status))
      .map(({ skillId }) => skillId)
  );

  const levelResults = [...levels]
    .sort((a, b) => a.order - b.order)
    .map((level) => {
      const requiredSkills = skills.filter(
        ({ graduationLevel }) => graduationLevel === level.id
      );
      const earnedSkills = requiredSkills.filter(({ id }) => secure.has(id));
      const missingSkills = requiredSkills.filter(({ id }) => !secure.has(id));
      const progress =
        requiredSkills.length === 0
          ? 0
          : Math.round((earnedSkills.length / requiredSkills.length) * 100);

      return {
        levelId: level.id,
        title: level.title,
        promise: level.promise,
        complete: requiredSkills.length > 0 && missingSkills.length === 0,
        progress,
        earnedSkills: earnedSkills.map(({ id }) => id),
        missingSkills: missingSkills.map(({ id }) => id)
      };
    });

  const firstIncompleteIndex = levelResults.findIndex(({ complete }) => !complete);
  const foundationComplete = firstIncompleteIndex === -1;
  const currentIndex = foundationComplete ? levelResults.length - 1 : firstIncompleteIndex;
  const currentResult = levelResults[currentIndex];
  const nextResult = foundationComplete ? null : levelResults[currentIndex + 1] || null;
  const missingId = foundationComplete ? null : currentResult.missingSkills[0] || null;
  const missingSkill = skills.find(({ id }) => id === missingId) || null;

  return {
    currentLevel: currentResult?.levelId || null,
    nextLevel: nextResult?.levelId || null,
    levelResults,
    foundationComplete,
    nextMissingCapability: missingSkill
      ? {
          skillId: missingSkill.id,
          title: missingSkill.title,
          domain: missingSkill.domain,
          graduationLevel: missingSkill.graduationLevel
        }
      : null
  };
}

export { COUNTED_STATUSES };
