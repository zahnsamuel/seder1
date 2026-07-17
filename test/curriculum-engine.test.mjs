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

test('graph practice recommends the earliest unmet reading dependency with a usable route', async () => {
  const first = await nextGraphPractice(root, learner());
  assert.equal(first.skill.id, 'hebrew-page-orientation');
  assert.equal(first.url, 'language.html');
  const afterOrientation = await nextGraphPractice(root, learner({ mastery: { 'hebrew-page-orientation': .9 } }));
  assert.equal(afterOrientation.skill.id, 'hebrew-question-words');
  assert.equal(afterOrientation.url, 'language.html');
});

test('graph practice includes source-specific non-Gemara course skills', async () => {
  const graphReady = {
    'hebrew-page-orientation': .9, 'hebrew-question-words': .9, 'source-signals': .9,
    'rabbinic-phrase-recognition': .9, 'sentence-role-mapping': .9, 'aramean-question-particles': .9,
    'mishnah-orientation': .9, 'gemara-context-question': .9, 'proof-role': .9,
    'challenge-and-answer': .9, 'independent-sugya-reading': .9, 'identify-conceptual-claim': .9,
    'define-conceptual-term': .9, 'compare-interpretations': .9, 'conceptual-application': .9
  };
  const next = await nextGraphPractice(root, learner({ mastery: graphReady }));
  assert.equal(next.skill.id, 'halakha-honor-torah-kibud');
  assert.equal(next.url, 'halakha-honor-parents.html');
  const afterFirstSource = await nextGraphPractice(root, learner({ mastery: { ...graphReady, 'halakha-honor-torah-kibud': .9 } }));
  assert.equal(afterFirstSource.skill.id, 'halakha-honor-two-verses');
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
