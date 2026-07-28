const normalized = (values = []) => new Set(values.map((value) => String(value).toLowerCase()));

export function recommendJlaPathway({
  pathways = [],
  interests = [],
  strongDomains = [],
  growthDomains = []
} = {}) {
  if (!pathways.length) throw new Error('Post-Foundation recommendation requires pathways.');

  const interestSet = normalized(interests);
  const strongSet = normalized(strongDomains);
  const growthSet = normalized(growthDomains);
  const ranked = pathways
    .map((pathway) => {
      const interestMatches = pathway.interestTags.filter((tag) =>
        interestSet.has(tag.toLowerCase())
      ).length;
      const strongMatches = pathway.domains.filter((domain) => strongSet.has(domain)).length;
      const growthMatches = pathway.domains.filter((domain) => growthSet.has(domain)).length;
      return {
        ...pathway,
        recommendationScore:
          interestMatches * 5 + strongMatches * 2 + growthMatches - pathway.defaultPriority / 100,
        recommendationReason:
          interestMatches > 0
            ? `Matches your interest in ${pathway.interestTags
                .filter((tag) => interestSet.has(tag.toLowerCase()))
                .join(' and ')}.`
            : strongMatches > 0
              ? 'Builds from capabilities you have already established.'
              : growthMatches > 0
                ? 'Develops a capability you identified for growth.'
                : 'Offers a broad next way into Jewish learning.'
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore ||
        a.defaultPriority - b.defaultPriority
    );

  return {
    recommended: ranked[0],
    alternatives: ranked.slice(1),
    learnerChoiceRequired: true
  };
}
