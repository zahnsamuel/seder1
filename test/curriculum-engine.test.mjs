import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { canMasterJourneyStage, journeyStatus, nextGemaraArc, nextGraphPractice } from '../data/curriculum-engine.mjs';
import { nonGemaraSkillGraph } from '../data/non-gemara-skill-graph.mjs';

const root = resolve('.');
const learner = (overrides = {}) => ({ mastery: {}, completedStages: [], ...overrides });

test('the first canon moment is available for a new learner', async () => {
  const status = await journeyStatus(root, learner());
  assert.equal(status.next.id, 'language-question');
  assert.equal(status.total, 100);
  assert.equal(status.phases.length, 16);
  assert.equal(status.nodes[0].available, true);
  assert.equal(status.nodes[1].locked, true);
});

test('a stage cannot be mastered before its prerequisite and current-session evidence', async () => {
  assert.equal(await canMasterJourneyStage(root, learner(), 'canon-torah-hear'), false);
  const prerequisiteReady = { completedStages: ['canon-language-question'], mastery: { 'hebrew-question-words': .76 } };
  assert.equal(await canMasterJourneyStage(root, learner(prerequisiteReady), 'canon-torah-hear'), false);
  assert.equal(await canMasterJourneyStage(root, learner({ ...prerequisiteReady, events: [
    { type: 'answer_submitted', correct: true, sourceContext: 'Deuteronomy 6' },
    { type: 'answer_submitted', correct: true, sourceContext: 'Deuteronomy 8' }
  ] }), 'canon-torah-hear'), true);
});

test('a completed phase requires its checkpoint before the following phase opens', async () => {
  const completedStages = ['canon-language-question', 'canon-torah-hear', 'canon-mishnah-case', 'canon-gemara-question'];
  const status = await journeyStatus(root, learner({ completedStages, mastery: { 'hebrew-question-words': .76, 'source-signals': .76, 'mishnah-orientation': .76 } }));
  assert.equal(status.next, null);
  assert.equal(status.nextCheckpoint.id, 'phase-1');
  assert.equal(await canMasterJourneyStage(root, learner({ completedStages }), 'phase-1-checkpoint'), true);
});

test('Gemara continuation selects the first unfinished tractate arc', async () => {
  assert.equal((await nextGemaraArc(root, learner())).stageId, 'berakhot-baraita-disagreement');
  assert.equal((await nextGemaraArc(root, learner({ completedStages: ['berakhot-baraita-disagreement', 'shabbat-tractate-arc'] }))).stageId, 'eruvin-tractate-arc');
});

test('graph practice does not pick a content-move id as the skill', async () => {
  const first = await nextGraphPractice(root, learner());
  assert.equal(first, null, 'Layer 0 decode has no mapped content vehicle');
  const decodeReady = {
    foundationScores: {
      'fnd-decode-letters': .8, 'fnd-decode-vowels': .8, 'fnd-decode-blend': .8, 'fnd-decode-word': .8
    }
  };
  const next = await nextGraphPractice(root, learner(decodeReady));
  assert.ok(next);
  assert.match(next.skill.id, /^fnd-/);
  assert.notEqual(next.skill.id, 'hebrew-page-orientation');
  assert.notEqual(next.contentSkill, next.skill.id);
  assert.equal(next.skill.id, 'fnd-orient-source-type');
  assert.equal(next.url, 'berakhot-deep.html');
  assert.equal(next.contentSkill, 'berakhot-orientation');
});

test('graph practice only selects a content unit for an already-chosen fnd- skill', async () => {
  const practice = await nextGraphPractice(root, learner(), 'fnd-orient-page-geography');
  assert.equal(practice.skill.id, 'fnd-orient-page-geography');
  assert.equal(practice.url, 'foundation-reading-orientation.html');
  assert.equal(practice.contentSkill, 'reading-orientation-page-geography');
  assert.equal(await nextGraphPractice(root, learner(), 'hebrew-page-orientation'), null);
  assert.equal(await nextGraphPractice(root, learner(), 'lab-shabbat-count'), null);
});

test('adaptive graph includes every later non-Gemara source sequence as an earned continuation', () => {
  const continuations = {
    'halakha-machloket-duration': ['halakha-honor-typed-recall', 'halakha-machloket.html'],
    'chumash-tehillim-parallelism': ['chumash-akeidah-typed-recall', 'chumash-tehillim.html'],
    'tefillah-amidah-center': ['tefillah-kaddish-typed-recall', 'tefillah-amidah.html'],
    'mussar-truth-name': ['identify-conceptual-claim', 'mussar-truth.html'],
    'mussar-anger-framework': ['mussar-truth-typed-recall', 'mussar-anger.html'],
    'chassidus-ahavat-name': ['identify-conceptual-claim', 'chassidus-ahavat-yisrael.html'],
    'chassidus-simcha-command': ['chassidus-ahavat-typed-recall', 'chassidus-simcha.html'],
    'history-geniza-practice': ['history-yavneh-typed-recall', 'history-geniza.html'],
    'widerworld-mean-source': ['widerworld-encounter-typed-recall', 'widerworld-mean.html']
  };
  for (const [id, [prerequisite, route]] of Object.entries(continuations)) {
    const skill = nonGemaraSkillGraph.find((item) => item.id === id);
    assert.ok(skill, `graph entry for ${id}`);
    assert.deepEqual(skill.prerequisites, [prerequisite]);
    assert.equal(skill.route, route);
    const terminal = nonGemaraSkillGraph.find((item) => item.id === id.replace(/-[^-]+$/, '-typed-recall'));
    assert.ok(terminal?.kind === 'translation-recall', `translation anchor for ${id}`);
  }
});

test('every non-Gemara graph skill remains reachable and routed', () => {
  const ids = new Set(nonGemaraSkillGraph.map((skill) => skill.id));
  assert.ok(nonGemaraSkillGraph.length >= 100);
  for (const skill of nonGemaraSkillGraph) {
    assert.ok(skill.route, `missing learner route for ${skill.id}`);
    assert.ok(skill.sourceForms?.length, `missing source context for ${skill.id}`);
    for (const prerequisite of skill.prerequisites || []) {
      assert.ok(ids.has(prerequisite) || ['source-signals', 'identify-conceptual-claim', 'compare-interpretations'].includes(prerequisite), `missing prerequisite ${prerequisite} for ${skill.id}`);
    }
  }
});
