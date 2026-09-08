import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../capability-state.js', import.meta.url), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const { Seder } = sandbox.window;

test('capability states are the four north-star words', () => {
  assert.deepEqual(Object.keys(Seder.capabilityStates), ['emerging', 'secure', 'transferable', 'durable']);
  assert.equal(Seder.capabilityStateFor('introduced'), 'emerging');
  assert.equal(Seder.capabilityStateFor('earned'), 'secure');
  assert.equal(Seder.capabilityStateFor('stable'), 'secure');
  assert.equal(Seder.capabilityStateFor('transfer-ready'), 'transferable');
});

test('progress chrome helpers speak capability states, not scores', () => {
  const empty = Seder.summarizeCapabilities([]);
  assert.equal(Seder.leadingCapabilityState(empty), 'emerging');
  assert.equal(Seder.capabilityEyebrow(empty), 'Emerging');
  assert.equal(Seder.capabilityHeaderText([]), '');
  assert.equal(Seder.capabilitySentence(empty), 'Your first reading move is waiting.');

  const evidence = [
    { status: 'introduced' },
    { status: 'earned' },
    { status: 'earned' },
    { status: 'transfer-ready' }
  ];
  const counts = Seder.summarizeCapabilities(evidence);
  assert.equal(counts.emerging, 1);
  assert.equal(counts.secure, 2);
  assert.equal(counts.transferable, 1);
  assert.equal(counts.durable, 0);
  assert.equal(Seder.leadingCapabilityState(counts), 'transferable');
  assert.equal(Seder.capabilityEyebrow(counts), '1 Transferable');
  assert.equal(Seder.capabilityHeaderText(evidence), '3 on your own');
  assert.match(Seder.capabilitySentence(counts), /3 reading moves on your own/);
  assert.match(Seder.capabilitySentence(counts), /1 in an unfamiliar source/);
});

test('a single skill maps to emerging or secure from evidence or score, not XP', () => {
  assert.equal(Seder.SECURE_SCORE, 0.67);
  assert.equal(Seder.skillScore({}, 'fnd-orient-source-type'), 0);
  assert.equal(Seder.skillCapabilityState({}, 'fnd-orient-source-type'), 'emerging');
  assert.equal(Seder.skillCapabilityState({ mastery: { 'fnd-orient-source-type': 0.34 } }, 'fnd-orient-source-type'), 'emerging');
  assert.equal(Seder.skillCapabilityState({ foundationScores: { 'fnd-orient-source-type': 0.8 } }, 'fnd-orient-source-type'), 'secure');
  assert.equal(Seder.skillCapabilityState({
    mastery: { 'fnd-orient-source-type': 0.2 },
    capabilityEvidence: [{ skillId: 'fnd-orient-source-type', status: 'earned' }]
  }, 'fnd-orient-source-type'), 'secure');
  assert.equal(Seder.skillCapabilityState({
    capabilityEvidence: [{ skillId: 'fnd-orient-source-type', status: 'transfer-ready' }]
  }, 'fnd-orient-source-type'), 'transferable');
});
