const scoreFor = (domainScores, domainId) => Number(domainScores[domainId] || 0);

const levelIndexFor = (average) => {
  if (average < 0.25) return 0;
  if (average < 0.4) return 1;
  if (average < 0.55) return 2;
  if (average < 0.7) return 3;
  if (average < 0.85) return 4;
  return 5;
};

export function buildJlaPlacementResult({
  levels = [],
  domains = [],
  skills = [],
  domainScores = {},
  rhythm = { daysPerWeek: 3, minutesPerSession: 20 }
} = {}) {
  if (levels.length !== 6 || !domains.length || !skills.length) {
    throw new Error('JLA placement requires the complete architecture catalog.');
  }

  const average =
    domains.reduce((total, domain) => total + scoreFor(domainScores, domain.id), 0) /
    domains.length;
  const learnerLevel = levels[levelIndexFor(average)];
  const rankedDomains = [...domains].sort(
    (a, b) => scoreFor(domainScores, b.id) - scoreFor(domainScores, a.id)
  );
  const strongDomains = rankedDomains
    .filter((domain) => scoreFor(domainScores, domain.id) >= 0.67)
    .map((domain) => ({
      id: domain.id,
      title: domain.title,
      score: scoreFor(domainScores, domain.id)
    }));
  const growthDomains = rankedDomains
    .filter((domain) => scoreFor(domainScores, domain.id) < 0.67)
    .reverse()
    .map((domain) => ({
      id: domain.id,
      title: domain.title,
      score: scoreFor(domainScores, domain.id)
    }));

  const weakestDomain = growthDomains[0]?.id;
  const firstUsefulSkill =
    skills.find(
      (skill) =>
        skill.graduationLevel === learnerLevel.id && skill.domain === weakestDomain
    ) ||
    skills.find((skill) => skill.graduationLevel === learnerLevel.id) ||
    skills[0];

  return {
    headline: 'Starting point, not a test.',
    learnerLevel: learnerLevel.id,
    levelTitle: learnerLevel.title,
    summary: `${learnerLevel.promise} The Academy will begin with one useful capability and adjust from evidence.`,
    strongDomains,
    growthDomains,
    firstUsefulSkill: {
      id: firstUsefulSkill.id,
      title: firstUsefulSkill.title,
      domain: firstUsefulSkill.domain
    },
    recommendedRhythm: {
      daysPerWeek: Math.min(7, Math.max(1, Number(rhythm.daysPerWeek) || 3)),
      minutesPerSession: Math.min(
        45,
        Math.max(10, Number(rhythm.minutesPerSession) || 20)
      )
    },
    firstSession: `academy-session.html?skill=${encodeURIComponent(firstUsefulSkill.id)}`
  };
}
