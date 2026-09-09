import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BANNED_LEARNER_COPY,
  SOURCE_TYPE_TEACH,
  buildScaffoldSteps,
  explicitAsk,
  frameJlaSession,
  hasSeeItMaterials,
  learnerCopyHasBannedPhrase,
  lookupExcerpt,
  normalizeSessionMode,
  practiceLine,
  presentChoices,
  sentenceCount,
  stripCapabilityClaim,
  teachCopy,
  whyLine
} from '../academy-session-lesson.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const authored = JSON.parse(readFileSync(new URL('../data/foundation-authored-items.json', import.meta.url), 'utf8'));
const excerpts = JSON.parse(readFileSync(new URL('../data/foundation-source-excerpts.json', import.meta.url), 'utf8'));
const teachBank = JSON.parse(readFileSync(new URL('../data/foundation-teach.json', import.meta.url), 'utf8'));
const kpLayer = JSON.parse(readFileSync(new URL('../data/foundation-knowledge-points.json', import.meta.url), 'utf8'));
const ctxLayer = JSON.parse(readFileSync(new URL('../data/foundation-content-contexts.json', import.meta.url), 'utf8'));

const cyclingRandom = () => {
  let n = 0;
  return () => {
    n += 1;
    return (n % 7) / 7;
  };
};

test('practiceLine and whyLine use skill language, not abstract move chrome', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-orient-source-type');
  assert.equal(stripCapabilityClaim(skill.statement), 'say whether a source is Torah, Mishnah, Gemara, commentary, a code, or a prayer');
  assert.match(practiceLine(skill.statement), /^You'll practice: say whether a source is Torah/);
  assert.doesNotMatch(practiceLine(skill.statement), /You can |I can /i);
  assert.match(whyLine(skill, graph), /A first reading skill|Builds on /);
  assert.doesNotMatch(whyLine(skill, graph), /foundational move/i);
  assert.equal(practiceLine("You'll practice: already framed"), "You'll practice: already framed");
  assert.match(practiceLine('I can recognize a Jewish source family before I interpret it.'), /^You'll practice: recognize a Jewish source family/);
});

test('lookupExcerpt matches authored source refs to on-page Hebrew/translation', () => {
  const genesis = lookupExcerpt('Genesis 1:1', excerpts);
  assert.ok(genesis.hebrew.includes('בְּרֵאשִׁית'));
  assert.match(genesis.translation, /In the beginning/);
  const daf = lookupExcerpt('Berakhot 2a (Vilna page)', excerpts);
  assert.ok(daf.hebrew);
  assert.ok(lookupExcerpt('Rambam, Yesodei HaTorah 1:1', excerpts).hebrew.includes('יְסוֹד'));
});

test('banked orientation skill uses authored stems, on-page source, and shuffled choices', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-orient-source-type');
  const bank = authored.items[skill.id];
  assert.ok(bank.length >= 3);
  const steps = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, teachBank, random: cyclingRandom()
  });
  assert.equal(steps.length, 3);
  assert.equal(steps[0].kind, 'introduce');
  assert.equal(steps[0].chrome.label, 'SEE IT');
  assert.equal(steps[0].chrome.next, 'Try it →');
  assert.equal(steps[0].chrome.continueTeach, 'Got it — ask me');
  assert.doesNotMatch(steps[0].chrome.next, /I can/i);
  assert.equal(steps[1].chrome.label, 'TRY IT');
  assert.equal(steps[2].chrome.label, 'NEW SOURCE');
  assert.equal(steps[0].prompt, bank[0].stem);
  assert.equal(steps[1].prompt, bank[1].stem);
  assert.equal(steps[2].prompt, bank[2].stem);
  assert.ok(steps[0].teach);
  assert.equal(steps[0].holdAsk, true);
  assert.equal(steps[0].guidance, '');
  assert.equal(steps[1].holdAsk, false);
  assert.equal(steps[1].teach, '');
  assert.match(steps[1].guidance, /^Look for this:/);
  assert.equal(steps[2].holdAsk, false);
  assert.equal(steps[2].teach, '');
  for (const step of steps) {
    assert.equal(step.authored, true);
    assert.ok(step.sourceWindow.hasOnPageSource, `${step.kind} should show Hebrew or translation`);
    assert.ok(step.sourceWindow.hebrew || step.sourceWindow.translation);
    assert.ok(step.choices.length >= 3);
    assert.ok(step.correctId);
    assert.doesNotMatch(step.prompt, BANNED_LEARNER_COPY[0]);
    assert.doesNotMatch(step.prompt, /\bthe move\b/i);
    assert.doesNotMatch(step.guidance, /\bthe move\b/i);
    assert.doesNotMatch(step.teach, /\bthe move\b/i);
    for (const choice of step.choices) {
      assert.doesNotMatch(choice.text, /^Make the move:/i);
      assert.doesNotMatch(choice.text, /\bthe move\b/i);
      assert.equal(learnerCopyHasBannedPhrase(choice.text), false);
    }
  }
});

test('bankless skill still asks a concrete question from statement/checks', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-arg-claim');
  const bank = authored.items[skill.id] || [];
  const steps = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, random: cyclingRandom()
  });
  if (bank.length) {
    assert.equal(steps[0].prompt, bank[0].stem);
  } else {
    assert.match(steps[0].prompt, /which option correctly/i);
    assert.match(steps[0].prompt, /claim/i);
    assert.ok(steps[0].choices.some((choice) => choice.text === skill.statement));
  }
  assert.ok(steps.some((step) => step.sourceWindow.hasOnPageSource), 'at least one step should show a source excerpt');
  for (const step of steps) {
    assert.doesNotMatch(step.prompt, /Make the move/i);
    assert.doesNotMatch(JSON.stringify(step.choices), /Make the move/i);
  }
});

test('presentChoices shuffles and never keys correctness to data order', () => {
  const first = presentChoices(['right', 'wrong-a', 'wrong-b'], 0, () => 0.99);
  const second = presentChoices(['right', 'wrong-a', 'wrong-b'], 0, cyclingRandom());
  assert.equal(first.choices.find((choice) => choice.id === first.correctId).text, 'right');
  assert.equal(second.choices.find((choice) => choice.id === second.correctId).text, 'right');
  assert.notEqual(first.correctId, '0');
  assert.notDeepEqual(first.choices.map((choice) => choice.text), second.choices.map((choice) => choice.text));
});

test('explicitAsk prefers the authored stem and otherwise uses the skill check', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-arg-claim');
  assert.equal(explicitAsk({ skill, item: { stem: 'Authored stem here' } }), 'Authored stem here');
  assert.match(explicitAsk({ skill, context: { ref: 'Berakhot 2a' }, kind: 'practice' }), /Berakhot 2a/);
  assert.match(explicitAsk({ skill, context: { ref: 'Berakhot 2a' }, kind: 'practice' }), /which option correctly/i);
});

test('See-it teach is a 2–4 sentence mini-lesson before the ask, with a source-type fallback', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-orient-source-type');
  const fromBank = teachCopy({ skill, kind: 'introduce', teachBank });
  assert.match(fromBank, /Torah verse/i);
  assert.match(fromBank, /Mishnah/i);
  assert.match(fromBank, /Gemara/i);
  assert.match(fromBank, /Commentary/i);
  assert.ok(sentenceCount(fromBank) >= 2 && sentenceCount(fromBank) <= 4);
  assert.equal(learnerCopyHasBannedPhrase(fromBank), false);

  const fallback = teachCopy({ skill, kind: 'introduce', teachBank: {} });
  assert.equal(fallback, SOURCE_TYPE_TEACH);
  assert.match(SOURCE_TYPE_TEACH, /Torah verse/);
  assert.match(SOURCE_TYPE_TEACH, /commentary/i);

  const authored = teachCopy({
    skill,
    kind: 'introduce',
    item: { teach: 'Notice the shape of the excerpt first. Then name the kind of text.' }
  });
  assert.match(authored, /Notice the shape/);

  const fromSkill = teachCopy({
    skill: { id: 'fnd-arg-claim', teach: 'A claim is the sentence the source is trying to get you to accept. Restate it in one line before you judge it.' },
    kind: 'introduce'
  });
  assert.match(fromSkill, /A claim is the sentence/);

  assert.equal(teachCopy({ skill, kind: 'practice', teachBank }), '');
  assert.equal(teachCopy({ skill, kind: 'transfer', teachBank }), '');
  assert.equal(teachCopy({ skill, kind: 'review', teachBank }), fromBank);
  assert.equal(teachCopy({ skill, kind: 'welcome-back', teachBank }), fromBank);
  assert.equal(teachCopy({ skill, kind: 'review', teachBank: {} }), '');

  const generic = teachCopy({
    skill: graph.skills.find((item) => item.id === 'fnd-arg-claim'),
    kind: 'introduce',
    teachBank: {}
  });
  assert.match(generic, /noticing one thing in a source/);
  assert.ok(sentenceCount(generic) >= 2 && sentenceCount(generic) <= 4);
});

test('JLA session framing prefixes You\'ll practice and rewrites a vague move ask', () => {
  const view = frameJlaSession({
    title: 'Recognize the source before interpreting it',
    evidencePreview: 'I can recognize a Jewish source family before I interpret it.',
    teachingMove: 'Name the family first.',
    prompt: 'Which first move best orients you to this source?',
    sourceWindow: { sourceRef: 'Genesis 1:1', hebrew: 'בְּרֵאשִׁית', translation: 'In the beginning', sourceUrl: 'https://www.sefaria.org/Genesis.1.1' },
    choices: [{ id: 'a', text: 'Name the family' }]
  });
  assert.match(view.practiceLine, /^You'll practice:/);
  assert.doesNotMatch(view.practiceLine, /I can |You can /i);
  assert.match(view.practiceLine, /recognize a Jewish source family/);
  assert.match(view.prompt, /which option correctly/i);
  assert.doesNotMatch(view.prompt, /the move/i);
  assert.equal(view.sourceWindow.hasOnPageSource, true);
});

test('review and welcome-back use See-it → ask when authored item, teach, and excerpt exist', () => {
  const skill = graph.skills.find((item) => item.id === 'fnd-orient-source-type');
  const bank = authored.items[skill.id];
  assert.equal(normalizeSessionMode('recovery'), 'welcome-back');
  assert.equal(normalizeSessionMode('decay'), 'review');
  assert.equal(hasSeeItMaterials({ skill, authoredBank: bank, excerpts, teachBank }), true);

  const review = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, teachBank,
    mode: 'review', random: cyclingRandom()
  });
  assert.equal(review.length, 1);
  assert.equal(review[0].kind, 'review');
  assert.equal(review[0].chrome.label, 'SEE IT');
  assert.equal(review[0].chrome.continueTeach, 'Got it — ask me');
  assert.ok(review[0].teach);
  assert.equal(review[0].holdAsk, true);
  assert.equal(review[0].guidance, '');
  assert.equal(review[0].authored, true);
  assert.equal(review[0].sourceWindow.hasOnPageSource, true);
  assert.ok(review[0].sourceWindow.hebrew || review[0].sourceWindow.translation);
  assert.ok(review[0].prompt);
  assert.ok(review[0].choices.length >= 3);
  assert.doesNotMatch(review[0].teach, /\bthe move\b/i);
  assert.doesNotMatch(review[0].prompt, /\bthe move\b/i);

  const welcome = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, teachBank,
    mode: 'welcome-back', random: cyclingRandom()
  });
  assert.equal(welcome.length, 1);
  assert.equal(welcome[0].kind, 'welcome-back');
  assert.ok(welcome[0].teach);
  assert.equal(welcome[0].holdAsk, true);
  assert.equal(welcome[0].sourceWindow.hasOnPageSource, true);

  const noMaterials = buildScaffoldSteps({
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, teachBank: {},
    mode: 'review', random: cyclingRandom()
  });
  assert.equal(noMaterials.length, 3);
  assert.equal(noMaterials[0].kind, 'introduce');

  const claim = graph.skills.find((item) => item.id === 'fnd-arg-claim');
  const claimBank = authored.items[claim.id] || [];
  const claimReview = buildScaffoldSteps({
    skill: claim, graph, kpLayer, ctxLayer, authoredBank: claimBank, excerpts, teachBank: {},
    mode: 'review', random: cyclingRandom()
  });
  assert.equal(claimReview.length, 3, 'authored item + excerpt without teach keeps the introduce path');

  const bankless = graph.skills.find((item) => item.id === 'fnd-compare-shared-question');
  const fallback = buildScaffoldSteps({
    skill: bankless, graph, kpLayer, ctxLayer, authoredBank: [], excerpts, teachBank,
    mode: 'review', random: cyclingRandom()
  });
  assert.equal(fallback.length, 3);
  assert.equal(fallback[0].kind, 'introduce');
});
