// Pure academy-session lesson helpers. The page script renders these; tests import them.
// One pattern for foundation scaffolding and the later JLA session: skill framing,
// source on the page, one explicit ask, shuffled real choices.

export const STEP_CHROME = {
  introduce: { label: 'SEE IT', next: 'I can see it — try it →' },
  practice: { label: 'TRY IT', next: 'Try a new source →' },
  transfer: { label: 'NEW SOURCE', next: 'Finish →' }
};

export const FALLBACK_SKILL = {
  title: 'Practice one reading skill',
  statement: 'You can do the reading skill named by this session.',
  sourceContexts: [{ ref: 'A short Jewish source', genre: 'source' }],
  teachingMove: 'Name what you notice in this source before trying to solve the whole text.',
  checks: ['Name what the skill asks you to do, and point to the part of the source that supports it.'],
  transfer: 'Carry the same skill into a second genre.'
};

export const BANNED_LEARNER_COPY = [
  /make the move/i,
  /see the move/i,
  /show me the move/i,
  /make one transferable learning move/i
];

export function practiceLine(statement) {
  const text = String(statement || '').trim();
  if (!text) return '';
  if (/^you'?ll practice:/i.test(text)) return text;
  return `You'll practice: ${text}`;
}

export function whyLine(skill, graph) {
  const skills = graph?.skills || [];
  const prereq = (skill.prerequisites || []).map((id) => skills.find((s) => s.id === id)?.title).filter(Boolean)[0];
  const unlock = skills.filter((s) => (s.prerequisites || []).includes(skill.id)).map((s) => s.title)[0];
  return `${prereq ? `Builds on ${prereq}` : 'A foundational skill'}${unlock ? `, and unlocks ${unlock}.` : '.'}`;
}

export function normalizeRef(ref) {
  return String(ref || '')
    .toLowerCase()
    .replace(/[“”"'‘’]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function refsOverlap(a, b) {
  const left = normalizeRef(a);
  const right = normalizeRef(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.length >= 8 && right.includes(left)) return true;
  if (right.length >= 8 && left.includes(right)) return true;
  return false;
}

function excerptMap(excerpts) {
  return excerpts?.excerpts || excerpts || {};
}

export function lookupExcerpt(ref, excerpts = {}) {
  if (!ref) return null;
  const entries = excerptMap(excerpts);
  if (entries[ref]) return entries[ref];
  const keys = Object.keys(entries);
  const exact = keys.find((key) => normalizeRef(key) === normalizeRef(ref));
  if (exact) return entries[exact];
  const overlap = keys.find((key) => refsOverlap(key, ref));
  return overlap ? entries[overlap] : null;
}

export function sefariaUrl(context = {}) {
  if (context.sourceUrl) return context.sourceUrl;
  if (context.url) return context.url;
  if (context.excerpt?.sourceUrl) return context.excerpt.sourceUrl;
  const ref = context.ref || context.sourceRef;
  if (!ref) return '#';
  return `https://www.sefaria.org/search?q=${encodeURIComponent(ref)}&tab=texts`;
}

export function sourceSetting(context = {}, excerpt) {
  if (excerpt?.setting) return excerpt.setting;
  if (context.context) return context.context;
  const genre = context.genre || excerpt?.genre;
  const family = context.family;
  const bits = [genre, family && family !== genre ? `${family} family` : ''].filter(Boolean);
  if (bits.length) return `Read this ${bits.join(' · ')} passage on the page, then answer the question below.`;
  return 'Read this source on the page, then answer the question below.';
}

export function uncapitalize(text) {
  const value = String(text || '').trim();
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function explicitAsk({ skill = {}, context = {}, item, kind } = {}) {
  if (item?.stem) return item.stem;
  const ref = context.ref || 'this source';
  const check = skill.checks?.[0];
  if (kind === 'transfer') {
    return check
      ? `In this new source (${ref}), which option correctly does this: ${uncapitalize(check)}`
      : `In this new source (${ref}), which option correctly matches the skill you just practiced?`;
  }
  if (check) return `In ${ref}, which option correctly does this: ${uncapitalize(check)}`;
  if (skill.statement) return `In this source, which option correctly matches this skill: ${skill.statement}`;
  return 'In this source, which option correctly answers the question about the text?';
}

export function shuffleList(list, random = Math.random) {
  const result = list.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function presentChoices(texts, correctIndex, random = Math.random) {
  const items = texts.map((text, index) => ({
    id: `choice-${index}`,
    text,
    correct: index === correctIndex
  }));
  const shuffled = shuffleList(items, random);
  return {
    choices: shuffled.map(({ id, text }) => ({ id, text })),
    correctId: shuffled.find((item) => item.correct).id
  };
}

export function fallbackChoiceTexts(skill, allSkills = [], seed = 1) {
  const others = allSkills.filter((entry) => entry.id !== skill.id && entry.statement && entry.statement !== skill.statement);
  const siblings = others.filter((entry) => entry.layer === skill.layer);
  const pool = siblings.length >= 2 ? siblings : others;
  const distractors = [];
  for (let offset = 0; offset < pool.length && distractors.length < 2; offset += 1) {
    const candidate = pool[(seed + offset * 7 + 3) % pool.length];
    if (candidate && !distractors.includes(candidate.statement)) distractors.push(candidate.statement);
  }
  const extras = [
    'Skip the source and memorize its title instead.',
    'Give a practical verdict before reading what the source is doing.'
  ];
  for (const extra of extras) {
    if (distractors.length >= 2) break;
    if (extra !== skill.statement && !distractors.includes(extra)) distractors.push(extra);
  }
  return { texts: [skill.statement, ...distractors], correctIndex: 0 };
}

export function guessGenre(ref) {
  const value = normalizeRef(ref);
  if (/genesis|exodus|leviticus|numbers|deuteronomy|torah|chumash/.test(value)) return 'torah';
  if (/mishnah/.test(value)) return 'mishnah';
  if (/berakhot|gemara|talmud|vilna|sugya/.test(value)) return 'gemara';
  if (/avot|pirkei/.test(value)) return 'thought';
  if (/rambam|shulchan|yesodei|code/.test(value)) return 'halakha';
  if (/kaddish|siddur|amidah|prayer/.test(value)) return 'tefillah';
  return 'source';
}

export function contextsForSkill(skill, ctxLayer) {
  const fromLayer = (ctxLayer?.contexts || []).filter((context) => context.skill === skill.id);
  if (fromLayer.length) return fromLayer;
  return (skill.sourceContexts || []).map((context) => ({ ...context, family: context.genre || 'source' }));
}

export function pickStepContexts(skill, ctxLayer, authoredBank = []) {
  const pool = contextsForSkill(skill, ctxLayer);
  const first = pool[0] || {
    ref: skill.sourceContexts?.[0]?.ref || FALLBACK_SKILL.sourceContexts[0].ref,
    genre: skill.sourceContexts?.[0]?.genre || 'source',
    family: skill.sourceContexts?.[0]?.genre || 'source'
  };
  const transfer = pool.find((context) => context.family && context.family !== first.family) || pool[1] || first;

  return ['introduce', 'practice', 'transfer'].map((kind, index) => {
    const item = authoredBank[index];
    if (item?.sourceRef) {
      const match = pool.find((context) => refsOverlap(context.ref, item.sourceRef));
      if (match) return match;
      const genre = guessGenre(item.sourceRef);
      return { ref: item.sourceRef, genre, family: genre };
    }
    return kind === 'transfer' ? transfer : first;
  });
}

export function buildSourceWindow(context, excerpts) {
  const excerpt = lookupExcerpt(context.ref, excerpts);
  const hebrew = excerpt?.hebrew || context.hebrew || '';
  const translation = excerpt?.translation || context.translation || '';
  return {
    sourceRef: context.ref,
    sourceUrl: sefariaUrl({ ...context, excerpt }),
    hebrew,
    translation,
    context: sourceSetting(context, excerpt),
    hasOnPageSource: Boolean(hebrew || translation)
  };
}

export function buildScaffoldSteps({
  skill,
  graph,
  kpLayer,
  ctxLayer,
  authoredBank = [],
  excerpts = {},
  random = Math.random
} = {}) {
  const kpByKind = Object.fromEntries(
    (kpLayer?.knowledgePoints || []).filter((point) => point.skill === skill.id).map((point) => [point.kind, point])
  );
  const contexts = pickStepContexts(skill, ctxLayer, authoredBank);
  const allSkills = graph?.skills || [];

  return ['introduce', 'practice', 'transfer'].map((kind, index) => {
    const item = authoredBank[index] || null;
    const context = contexts[index];
    const sourceWindow = buildSourceWindow(context, excerpts);
    const presented = item
      ? presentChoices(item.choices, item.correct, random)
      : (() => {
        const fallback = fallbackChoiceTexts(skill, allSkills, index + 1);
        return presentChoices(fallback.texts, fallback.correctIndex, random);
      })();

    let guidance = '';
    if (kind === 'introduce') guidance = kpByKind.introduce?.statement || skill.teachingMove || '';
    else if (kind === 'practice') guidance = skill.teachingMove || '';
    else if (skill.transfer) {
      const family = context.family && context.family !== context.genre ? ` (${context.family})` : '';
      guidance = `Now try the same skill in a different source${family}.`;
    }

    const taught = item?.feedback || '';
    return {
      kind,
      chrome: STEP_CHROME[kind],
      context,
      sourceWindow,
      guidance,
      prompt: explicitAsk({ skill, context, item, kind }),
      choices: presented.choices,
      correctId: presented.correctId,
      feedback: {
        correct: taught || `Yes — that matches this skill: ${skill.statement}`,
        incorrect: taught || (skill.statement
          ? `The highlighted choice is the one that matches this skill: ${skill.statement}`
          : 'Look back at the source and the question, then try the highlighted choice.')
      },
      authored: Boolean(item),
      recordId: `kp-${skill.id}-${index + 1}`
    };
  });
}

export function frameJlaSession(session) {
  const sourceWindow = session.sourceWindow || {};
  return {
    title: session.title,
    practiceLine: practiceLine(session.evidencePreview || session.title),
    why: session.teachingMove || '',
    stepLabel: 'TODAY’S SOURCE WINDOW',
    sourceWindow: {
      ...sourceWindow,
      context: sourceWindow.context || 'Read this source on the page, then answer the question below.',
      hasOnPageSource: Boolean(sourceWindow.hebrew || sourceWindow.translation)
    },
    guidance: session.teachingMove || '',
    prompt: session.prompt,
    choices: session.choices || []
  };
}

export function learnerCopyHasBannedPhrase(text) {
  return BANNED_LEARNER_COPY.some((pattern) => pattern.test(String(text || '')));
}
