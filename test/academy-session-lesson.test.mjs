import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BANNED_LEARNER_COPY,
  buildScaffoldSteps,
  explicitAsk,
  frameJlaSession,
  learnerCopyHasBannedPhrase,
  lookupExcerpt,
  practiceLine,
  presentChoices,
  whyLine
} from '../academy-session-lesson.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const authored = JSON.parse(readFileSync(new URL('../data/foundation-authored-items.json', import.meta.url), 'utf8'));
const excerpts = JSON.parse(readFileSync(new URL('../data/foundation-source-excerpts.json', import.meta.url), 'utf8'));
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
  assert.match(practiceLine(skill.statement), /^You'll practice: You can say whether a source is Torah/);
  assert.match(whyLine(skill, graph), /A foundational skill|Builds on /);
  assert.doesNotMatch(whyLine(skill, graph), /foundational move/i);
  assert.equal(practiceLine("You'll practice: already framed"), "You'll practice: already framed");
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
    skill, graph, kpLayer, ctxLayer, authoredBank: bank, excerpts, random: cyclingRandom()
  });
  assert.equal(steps.length, 3);
  assert.equal(steps[0].kind, 'introduce');
  assert.equal(steps[0].chrome.label, 'SEE IT');
  assert.equal(steps[1].chrome.label, 'TRY IT');
  assert.equal(steps[2].chrome.label, 'NEW SOURCE');
  assert.equal(steps[0].prompt, bank[0].stem);
  assert.equal(steps[1].prompt, bank[1].stem);
  assert.equal(steps[2].prompt, bank[2].stem);
  for (const step of steps) {
    assert.equal(step.authored, true);
    assert.ok(step.sourceWindow.hasOnPageSource, `${step.kind} should show Hebrew or translation`);
    assert.ok(step.sourceWindow.hebrew || step.sourceWindow.translation);
    assert.ok(step.choices.length >= 3);
    assert.ok(step.correctId);
    assert.doesNotMatch(step.prompt, BANNED_LEARNER_COPY[0]);
    for (const choice of step.choices) {
      assert.doesNotMatch(choice.text, /^Make the move:/i);
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

test('JLA session framing keeps the authored prompt and prefixes You\'ll practice', () => {
  const view = frameJlaSession({
    title: 'Recognize the source before interpreting it',
    evidencePreview: 'I can recognize a Jewish source family before I interpret it.',
    teachingMove: 'Name the family first.',
    prompt: 'Which first move best orients you to this source?',
    sourceWindow: { sourceRef: 'Genesis 1:1', hebrew: 'בְּרֵאשִׁית', translation: 'In the beginning', sourceUrl: 'https://www.sefaria.org/Genesis.1.1' },
    choices: [{ id: 'a', text: 'Name the family' }]
  });
  assert.match(view.practiceLine, /^You'll practice:/);
  assert.equal(view.prompt, 'Which first move best orients you to this source?');
  assert.equal(view.sourceWindow.hasOnPageSource, true);
});
