// Pure term-progression recommenders: given a learner's completed stages, pick the next term/step
// in the Foundation Year, Gemara Year, and Moed Expansion sequences. Extracted from server.mjs so
// they can be unit-tested directly. Each returns a recommendation whose `builtOn` names the specific
// prior milestone the learner just cleared, so the explanation (recommendation-why.mjs) can say what
// this next move actually builds on rather than a generic "the prior checkpoint".

export function foundationRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  // `earned` names the specific checkpoint the learner cleared to reach this term, so the
  // explanation can say exactly what they built on (null for the first term — nothing precedes it).
  const terms = [
    { stage: 'foundation-capstone', earned: null, title: 'Foundation Year · Term I: build the reading repertoire', reason: 'Begin with the connected source sequence that builds case mapping, question reading, evidence, and reception before its capstone.', url: 'integrated-path.html' },
    { stage: 'term-two-capstone', earned: 'the Foundation Year Term I capstone', title: 'Foundation Year · Term II: reason, scope, and responsibility', reason: 'Your first-term checkpoint is earned. Next, trace reasons, exceptions, and institutional responsibility through new sources.', url: 'second-foundation-term.html' },
    { stage: 'second-foundation-synthesis', earned: 'the Foundation Year Term II capstone', title: 'Foundation Year · Term III: disagreement and synthesis', reason: 'Your second-term checkpoint is earned. Now preserve distinct voices, compare carefully, and carry the habit into synthesis.', url: 'term-three-journey.html' }
  ];
  const term = terms.find((item) => !completed.has(item.stage));
  return term ? { ...term, builtOn: term.earned } : null;
}

export function gemaraYearRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  const terms = [
    { title: 'Gemara Year · Term I: time, space, and practice', reason: 'Continue the first post-Foundation term by carrying your reading repertoire through concrete cases of domain, measure, time, validity, and source-grounded preparation.', steps: [['shabbat-tractate-arc', 'Shabbat: map a legal case', 'shabbat-arc.html'], ['eruvin-tractate-arc', 'Eruvin: boundary and measure', 'eruvin-arc.html'], ['pesachim-tractate-arc', 'Pesachim: word, time, and source', 'pesachim-arc.html'], ['sukkah-tractate-arc', 'Sukkah: validity and purpose', 'sukkah-arc.html'], ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'], ['gemara-foundations-checkpoint', 'Gemara Foundations checkpoint', 'gemara-foundations.html']] },
    { title: 'Gemara Year · Term II: claims, responsibility, and institutions', reason: 'Continue the civil-reasoning term: map claims, identify categories of responsibility, and read institutions through their stated reasons.', steps: [['bava-metzia-tractate-arc', 'Bava Metzia: claims and evidence', 'bava-metzia-arc.html'], ['bava-kamma-tractate-arc', 'Bava Kamma: categories of damage', 'bava-kamma-arc.html'], ['ketubot-tractate-arc', 'Ketubot: schedule and reason', 'ketubot-arc.html'], ['sanhedrin-tractate-arc', 'Sanhedrin: category and specification', 'sanhedrin-arc.html'], ['civil-reasoning-checkpoint', 'Civil Reasoning checkpoint', 'civil-reasoning.html']] },
    { title: 'Gemara Year · Term III: rule and disagreement', reason: 'Trace a rule through its exceptions and preserve disagreement before taking those reading habits into a new legal field.', steps: [['chullin-tractate-arc', 'Chullin: rule and exception', 'chullin-arc.html'], ['niddah-tractate-arc', 'Niddah: three positions', 'niddah-arc.html']] },
    { title: 'Gemara Year · Term IV: speech, status, and transfer', reason: 'Read how language creates a legal category, how a default gives it shape, and how a reading move transfers across tractates without erasing their differences.', steps: [['moed-katan-tractate-arc', 'Moed Katan: rule and bounded exception', 'moed-katan-arc.html'], ['nedarim-tractate-arc', 'Nedarim: legal speech and function', 'nedarim-arc.html'], ['nazir-tractate-arc', 'Nazir: carry the language move across', 'nazir-arc.html'], ['gemara-year-synthesis', 'Gemara Year synthesis', 'gemara-year-synthesis.html']] }
  ];
  // Flatten to the ordered step list so the immediately prior completed step can be named as the
  // specific milestone this next step builds on (or the Foundation Year, for the very first step).
  const flat = terms.flatMap((term) => term.steps.map(([stage, label, url]) => ({ stage, label, url, reason: term.reason, termTitle: term.title })));
  const index = flat.findIndex((step) => !completed.has(step.stage));
  if (index === -1) return null;
  const step = flat[index];
  const prior = index > 0 ? flat[index - 1] : null;
  return { title: `${step.termTitle} · ${step.label}`, reason: step.reason, url: step.url, builtOn: prior ? prior.label : 'your Foundation Year' };
}

export function moedExpansionRecommendation(learner) {
  const completed = new Set(learner.completedStages || []);
  const gemaraYearStages = [
    'shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint',
    'bava-metzia-tractate-arc', 'bava-kamma-tractate-arc', 'ketubot-tractate-arc', 'sanhedrin-tractate-arc', 'civil-reasoning-checkpoint',
    'chullin-tractate-arc', 'niddah-tractate-arc', 'moed-katan-tractate-arc', 'nedarim-tractate-arc', 'nazir-tractate-arc', 'gemara-year-synthesis'
  ];
  if (!gemaraYearStages.every((stage) => completed.has(stage))) return null;
  const chapters = [
    ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'],
    ['rosh-hashanah-tractate-arc', 'Rosh Hashanah: calendar and public record', 'rosh-hashanah-arc.html'],
    ['megillah-tractate-arc', 'Megillah: public schedule and accommodation', 'megillah-arc.html'],
    ['taanit-tractate-arc', 'Taanit: timing dispute and distinction', 'taanit-arc.html'],
    ['chagigah-tractate-arc', 'Chagigah: rule, exception, and historical context', 'chagigah-arc.html'],
    ['moed-expansion-synthesis', 'Moed Expansion synthesis', 'moed-expansion-synthesis.html']
  ];
  const chapterIndex = chapters.findIndex(([stage]) => !completed.has(stage));
  if (chapterIndex === -1) return null;
  const chapter = chapters[chapterIndex];
  const prior = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  return {
    title: `Moed Expansion · ${chapter[1]}`,
    reason: 'Your Gemara Year is complete. Extend the same source-reading habits through the calendar, public reading, and communal response.',
    url: chapter[2],
    builtOn: prior ? prior[1] : 'your Gemara Year'
  };
}
