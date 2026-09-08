// Teach-before-ask guard. Pure — no I/O.
//
// Product law (docs/ui-principles.md): a learner-facing ask must not use a Jewish or
// technical term the learner has not already been taught. Terms may appear in See-it
// teach and in post-answer feedback; they may not appear in the stem or choices of an
// ask that has not earned them.
//
// A term is earned if it appears in this skill's See-it teach (foundation-teach.json,
// plus the source-type genre gallery, plus optional item.teach / item.introduce) or in
// an explicit already-taught prerequisite on the path.

export const BANNED_ASK_TERMS = [
  { id: 'gemara', pattern: /\bgemara\b/i },
  { id: 'mishnah', pattern: /\bmishnah\b/i },
  { id: 'torah', pattern: /\btorah\b/i },
  { id: 'commentary', pattern: /\bcommentar(?:y|ies)\b/i },
  { id: 'aggadah', pattern: /\baggad(?:ah|ic|a)\b/i },
  { id: 'halakhah', pattern: /\bhalakhah\b|\bhalacha\b|\bhalakhic\b/i },
  { id: 'sugya', pattern: /\bsugya\b/i },
  { id: 'talmud', pattern: /\btalmud(?:ic)?\b/i },
  { id: 'rashi', pattern: /\brashi\b/i },
  { id: 'tosafot', pattern: /\btosafot\b/i },
  { id: 'shulchan-aruch', pattern: /\bshulchan\s*aruch\b/i },
  { id: 'rambam', pattern: /\brambam\b/i },
  { id: 'mussar', pattern: /\bmussar\b/i },
  { id: 'tanakh', pattern: /\btanakh\b/i },
  { id: 'mikraot-gedolot', pattern: /\bmikraot\s*gedolot\b/i },
  { id: 'daf', pattern: /\bdaf\b/i }
];

// Completing these skills' See-it earns their taught terms for later skills.
export const ALREADY_TAUGHT_PREREQUISITES = [
  'fnd-orient-source-type',
  'fnd-context-genre-expectations'
];

export function askSurface(item) {
  if (!item || typeof item !== 'object') return '';
  const stem = typeof item.stem === 'string' ? item.stem : '';
  const choices = Array.isArray(item.choices) ? item.choices.filter((c) => typeof c === 'string') : [];
  return [stem, ...choices].join('\n');
}

export function termsIn(text) {
  const blob = String(text || '');
  return BANNED_ASK_TERMS.filter((term) => term.pattern.test(blob)).map((term) => term.id);
}

export function collectTeachText(skillId, teachFile = {}, item = null) {
  const parts = [];
  if (typeof item?.teach === 'string') parts.push(item.teach);
  if (typeof item?.introduce === 'string') parts.push(item.introduce);
  const banked = teachFile?.teach?.[skillId];
  if (typeof banked === 'string') parts.push(banked);
  // The source-type See-it also shows the genre gallery (name + mini-lesson per kind).
  if (skillId === 'fnd-orient-source-type' && teachFile?.genres) {
    for (const genre of Object.values(teachFile.genres)) {
      if (genre?.name) parts.push(genre.name);
      if (genre?.teach) parts.push(genre.teach);
    }
  }
  return parts.join('\n');
}

export function ancestorIds(skillId, graph = {}) {
  const byId = new Map((graph.skills || []).map((skill) => [skill.id, skill]));
  const seen = new Set();
  const walk = (id) => {
    for (const pre of byId.get(id)?.prerequisites || []) {
      if (!seen.has(pre)) {
        seen.add(pre);
        walk(pre);
      }
    }
  };
  walk(skillId);
  return seen;
}

export function earnedTerms({ skillId, teachFile = {}, graph = {}, item = null } = {}) {
  const earned = new Set(termsIn(collectTeachText(skillId, teachFile, item)));
  const ancestors = ancestorIds(skillId, graph);
  for (const pre of ALREADY_TAUGHT_PREREQUISITES) {
    if (pre === skillId || ancestors.has(pre)) {
      for (const term of termsIn(collectTeachText(pre, teachFile))) earned.add(term);
    }
  }
  return earned;
}

export function untaughtAskTerms(item, earned) {
  const allowed = earned instanceof Set ? earned : new Set(earned || []);
  return termsIn(askSurface(item)).filter((term) => !allowed.has(term));
}

export function findTeachBeforeAskViolations({
  itemsBySkill = {},
  teachFile = {},
  graph = {},
  skillIds = null,
  skip = new Set()
} = {}) {
  const ids = skillIds || Object.keys(itemsBySkill);
  const violations = [];
  for (const skillId of ids) {
    if (skip.has(skillId)) continue;
    const items = itemsBySkill[skillId] || [];
    items.forEach((item, index) => {
      const earned = earnedTerms({ skillId, teachFile, graph, item });
      const terms = untaughtAskTerms(item, earned);
      if (terms.length) violations.push({ skillId, index, terms });
    });
  }
  return violations;
}
