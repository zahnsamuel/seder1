import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { canMasterJourneyStage, journeyStatus, nextGemaraArc, nextGraphPractice } from '../data/curriculum-engine.mjs';

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
