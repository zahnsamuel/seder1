// Pure academy-session lesson helpers. The page script renders these; tests import them.
// One pattern for foundation scaffolding and the later JLA session: skill framing,
// source on the page, one explicit ask, shuffled real choices.

export const STEP_CHROME = {
  introduce: { label: 'SEE IT', next: 'I can see it — try it →', continueTeach: 'Got it — ask me' },
  practice: { label: 'TRY IT', next: 'Try a new source →' },
  transfer: { label: 'NEW SOURCE', next: 'Finish →' },
  review: { label: 'SEE IT', next: 'Finish →', continueTeach: 'Got it — ask me' },
  retrieval: { label: 'SEE IT', next: 'Finish →', continueTeach: 'Got it — ask me' },
  'welcome-back': { label: 'SEE IT', next: 'Finish →', continueTeach: 'Got it — ask me' }
};

const RETRIEVAL_MODES = new Set(['review', 'retrieval', 'recovery', 'welcome-back', 'decay']);

export function isRetrievalMode(mode) {
  return RETRIEVAL_MODES.has(String(mode || '').trim().toLowerCase());
}

export function normalizeSessionMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'recovery' || value === 'welcome-back') return 'welcome-back';
  if (value === 'review' || value === 'retrieval' || value === 'decay') return 'review';
  return 'introduce';
}

export function isSeeItKind(kind) {
  return kind === 'introduce' || isRetrievalMode(kind);
}

// Built-in See-it fallback until authored teach lands. Sam: briefly name
// Torah verse / Mishnah / Gemara / commentary in plain adult English.
export const SOURCE_TYPE_TEACH = 'Jewish texts come in a few basic kinds, and you can often tell which one you are looking at from its shape — before you translate every word. A Torah verse usually tells or commands in the Bible’s own voice. A Mishnah states a compact rule; the Gemara then asks about that rule and argues it. Commentary talks about the text from the side, rather than being the text itself.';

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
  /that is the move/i,
  /make one transferable learning move/i
];

// Ask-frame jargon Sam rejected: "the move" as the thing the learner is supposed to do.
export const VAGUE_MOVE_ASK = [
  ...BANNED_LEARNER_COPY,
  /\bthe move\b/i,
  /\bwhich first move\b/i,
  /\bwhat move\b/i,
  /\bwhat(?:'s| is) the move\b/i
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
  return `${prereq ? `Builds on ${prereq}` : 'A first reading skill'}${unlock ? `, then you’ll be ready for ${unlock}.` : '.'}`;
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
  return '';
}

export function sourceSetting(context = {}, excerpt) {
  if (excerpt?.setting) return excerpt.setting;
  if (context.context) return context.context;
  const genre = context.genre || excerpt?.genre;
  const family = context.family;
  const bits = [genre, family && family !== genre ? `${family} family` : ''].filter(Boolean);
  if (bits.length) return `Read this ${bits.join(' · ')} passage on this page, then answer the question below.`;
  return 'Read this source on this page, then answer the question below.';
}

export function uncapitalize(text) {
  const value = String(text || '').trim();
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function isVagueMoveAsk(text) {
  return VAGUE_MOVE_ASK.some((pattern) => pattern.test(String(text || '')));
}

export function concreteAskFromSkill(skill = {}, context = {}, kind) {
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

export function explicitAsk({ skill = {}, context = {}, item, kind } = {}) {
  if (item?.stem && !isVagueMoveAsk(item.stem)) return item.stem;
  return concreteAskFromSkill(skill, context, kind);
}

export function howToLook(skill = {}) {
  const statement = String(skill.statement || '').trim();
  if (!statement || isVagueMoveAsk(statement)) return '';
  return `Look for this: ${statement}`;
}

export function sentenceCount(text) {
  return String(text || '').split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

export function firstPlainTeach(...values) {
  for (const value of values) {
    const text = String(value || '').trim();
    if (text && !isVagueMoveAsk(text) && !learnerCopyHasBannedPhrase(text)) return text;
  }
  return '';
}

export function resolveTeachBank(teachBank = {}) {
  if (teachBank.teach && typeof teachBank.teach === 'object' && !Array.isArray(teachBank.teach)) {
    return teachBank.teach;
  }
  return teachBank;
}

export function bankedTeach(skill = {}, kind = 'introduce', teachBank = {}) {
  const entry = resolveTeachBank(teachBank)[skill.id];
  if (!entry) return '';
  const seeIt = isSeeItKind(kind);
  if (typeof entry === 'string') return seeIt ? entry : '';
  if (entry[kind]) return entry[kind];
  if (seeIt) return entry.introduce || entry.teach || entry.review || '';
  return '';
}

export function genericIntroduceTeach(skill = {}) {
  const statement = String(skill.statement || '').trim();
  if (statement && !isVagueMoveAsk(statement) && !learnerCopyHasBannedPhrase(statement)) {
    return `This skill is about noticing one thing in a source, not solving the whole page. ${statement} Look at the excerpt here and notice that — then you will get a short question.`;
  }
  return 'Look at the excerpt on this page. Notice what kind of text it is and what it is doing, then you will get a short question.';
}

export function authoredTeachCopy({ skill = {}, item, teachBank = {} } = {}) {
  return firstPlainTeach(
    item?.teach,
    item?.introduce,
    skill.teach,
    skill.introduce,
    bankedTeach(skill, 'introduce', teachBank)
  );
}

export function teachCopy({ skill = {}, item, kind = 'introduce', teachBank = {} } = {}) {
  if (!isSeeItKind(kind)) return '';
  const authored = authoredTeachCopy({ skill, item, teachBank });
  if (authored) return authored;
  if (isRetrievalMode(kind)) return '';
  if (skill.id === 'fnd-orient-source-type') return SOURCE_TYPE_TEACH;
  return genericIntroduceTeach(skill);
}

export function pickRetrievalItem(authoredBank = [], excerpts = {}) {
  const items = Array.isArray(authoredBank) ? authoredBank.filter(Boolean) : [];
  return items.find((item) => {
    const excerpt = lookupExcerpt(item.sourceRef, excerpts);
    return Boolean(excerpt && (excerpt.hebrew || excerpt.translation));
  }) || items[0] || null;
}

export function hasSeeItMaterials({ skill = {}, authoredBank = [], excerpts = {}, teachBank = {} } = {}) {
  const item = pickRetrievalItem(authoredBank, excerpts);
  if (!item) return false;
  if (!authoredTeachCopy({ skill, item, teachBank })) return false;
  const excerpt = lookupExcerpt(item.sourceRef, excerpts);
  return Boolean(excerpt && (excerpt.hebrew || excerpt.translation));
}

export function shuffleList(list, random = Math.random) {
  const result = list.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function sanitizeChoiceText(text) {
  return String(text || '').replace(/^Make the move:\s*/i, '').trim();
}

export function presentChoices(texts, correctIndex, random = Math.random) {
  const items = texts.map((text, index) => ({
    id: `choice-${index}`,
    text: sanitizeChoiceText(text),
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

function fallbackContext(skill) {
  return {
    ref: skill.sourceContexts?.[0]?.ref || FALLBACK_SKILL.sourceContexts[0].ref,
    genre: skill.sourceContexts?.[0]?.genre || 'source',
    family: skill.sourceContexts?.[0]?.genre || 'source'
  };
}

export function pickStepContexts(skill, ctxLayer, authoredBank = []) {
  const pool = contextsForSkill(skill, ctxLayer);
  const first = pool[0] || fallbackContext(skill);
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

export function pickRetrievalContext(skill, ctxLayer, item) {
  const pool = contextsForSkill(skill, ctxLayer);
  if (item?.sourceRef) {
    const match = pool.find((context) => refsOverlap(context.ref, item.sourceRef));
    if (match) return match;
    const genre = guessGenre(item.sourceRef);
    return { ref: item.sourceRef, genre, family: genre };
  }
  return pool[0] || fallbackContext(skill);
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

function buildOneStep({
  skill,
  graph,
  item,
  context,
  kind,
  excerpts,
  teachBank,
  random,
  seed = 1
}) {
  const allSkills = graph?.skills || [];
  const sourceWindow = buildSourceWindow(context, excerpts);
  const presented = item
    ? presentChoices(item.choices, item.correct, random)
    : (() => {
      const fallback = fallbackChoiceTexts(skill, allSkills, seed);
      return presentChoices(fallback.texts, fallback.correctIndex, random);
    })();

  let guidance = howToLook(skill);
  if (kind === 'introduce' || isRetrievalMode(kind)) {
    guidance = '';
  } else if (kind === 'transfer') {
    const family = context.family && context.family !== context.genre ? ` (${context.family})` : '';
    guidance = `Now try the same skill on this new source${family}.`;
  } else if (isVagueMoveAsk(guidance)) {
    guidance = '';
  }

  const teach = teachCopy({ skill, item, kind, teachBank });
  const taught = item?.feedback || '';
  const askKind = isRetrievalMode(kind) ? 'introduce' : kind;
  return {
    kind,
    chrome: STEP_CHROME[kind] || STEP_CHROME.introduce,
    context,
    sourceWindow,
    teach,
    holdAsk: isSeeItKind(kind) && Boolean(teach),
    guidance,
    prompt: explicitAsk({ skill, context, item, kind: askKind }),
    choices: presented.choices,
    correctId: presented.correctId,
    feedback: {
      correct: taught || `Yes — that matches this skill: ${skill.statement}`,
      incorrect: taught || (skill.statement
        ? `The highlighted choice is the one that matches this skill: ${skill.statement}`
        : 'Look back at the source and the question, then try the highlighted choice.')
    },
    authored: Boolean(item),
    recordId: `kp-${skill.id}-${kind === 'practice' ? 2 : kind === 'transfer' ? 3 : 1}`
  };
}

export function buildScaffoldSteps({
  skill,
  graph,
  kpLayer,
  ctxLayer,
  authoredBank = [],
  excerpts = {},
  teachBank = {},
  random = Math.random,
  mode = 'introduce'
} = {}) {
  const sessionMode = normalizeSessionMode(mode);
  if (isRetrievalMode(sessionMode) && hasSeeItMaterials({ skill, authoredBank, excerpts, teachBank })) {
    const item = pickRetrievalItem(authoredBank, excerpts);
    return [buildOneStep({
      skill,
      graph,
      item,
      context: pickRetrievalContext(skill, ctxLayer, item),
      kind: sessionMode,
      excerpts,
      teachBank,
      random,
      seed: 1
    })];
  }

  const contexts = pickStepContexts(skill, ctxLayer, authoredBank);
  return ['introduce', 'practice', 'transfer'].map((kind, index) => buildOneStep({
    skill,
    graph,
    item: authoredBank[index] || null,
    context: contexts[index],
    kind,
    excerpts,
    teachBank,
    random,
    seed: index + 1
  }));
}

export function concreteJlaPrompt(session = {}) {
  const prompt = session.prompt || '';
  if (prompt && !isVagueMoveAsk(prompt)) return prompt;
  const capability = String(session.evidencePreview || session.title || '')
    .replace(/^I can /i, '')
    .replace(/\.$/, '');
  if (capability) return `In this source, which option correctly does this: ${uncapitalize(capability)}?`;
  return 'In this source, which option correctly answers the question about the text?';
}

export function frameJlaSession(session) {
  const sourceWindow = session.sourceWindow || {};
  const guidance = isVagueMoveAsk(session.teachingMove) ? '' : (session.teachingMove || '');
  return {
    title: session.title,
    practiceLine: practiceLine(session.evidencePreview || session.title),
    why: guidance,
    stepLabel: 'ON THIS PAGE',
    sourceWindow: {
      ...sourceWindow,
      context: sourceWindow.context || 'Read this source on this page, then answer the question below.',
      hasOnPageSource: Boolean(sourceWindow.hebrew || sourceWindow.translation)
    },
    guidance,
    prompt: concreteJlaPrompt(session),
    choices: session.choices || []
  };
}

export function learnerCopyHasBannedPhrase(text) {
  return BANNED_LEARNER_COPY.some((pattern) => pattern.test(String(text || '')));
}
