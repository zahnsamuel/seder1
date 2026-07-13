import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { canonJourney, journeyStatus } from '../data/curriculum-engine.mjs';

const root = resolve('.');
const learner = (overrides = {}) => ({ mastery: {}, completedStages: [], ...overrides });

test('the integrated journey has connected source encounters through a 100-move mastery path', async () => {
  const journey = await canonJourney(root);
  assert.equal(journey.sessions.length, 100);
  assert.equal(journey.sessions[18].id, 'language-attribution');
  assert.equal(journey.sessions[36].id, 'signals-berakhot');
  assert.equal(journey.sessions.at(-1).id, 'synthesis-jeremiah');
});

test('the extended journey remains phase-gated and culminates in independent navigation', async () => {
  const status = await journeyStatus(root, learner());
  assert.deepEqual(status.phases.slice(8).map((phase) => phase.id), ['phase-9', 'phase-10', 'phase-11', 'phase-12', 'phase-13', 'phase-14', 'phase-15', 'phase-16']);
  assert.equal(status.nodes[18].locked, true);
  assert.match(status.nodes[99].phase, /^XVI/);
});
