import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { canMasterJourneyStage, journeyStatus } from '../data/curriculum-engine.mjs';

const root = resolve('.');
const learner = (overrides = {}) => ({ mastery: {}, completedStages: [], ...overrides });

test('the first canon moment is available for a new learner', async () => {
  const status = await journeyStatus(root, learner());
  assert.equal(status.next.id, 'language-question');
  assert.equal(status.total, 18);
  assert.equal(status.nodes[0].available, true);
  assert.equal(status.nodes[1].locked, true);
});

test('a stage cannot be mastered before its prerequisite stage and skill evidence', async () => {
  assert.equal(await canMasterJourneyStage(root, learner(), 'canon-torah-hear'), false);
  assert.equal(await canMasterJourneyStage(root, learner({ completedStages: ['canon-language-question'], mastery: { 'hebrew-question-words': .76 } }), 'canon-torah-hear'), true);
});
