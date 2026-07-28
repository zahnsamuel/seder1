import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLearner, recordLearnerEvent } from '../data/repository.mjs';
import { buildJlaPathProgress } from '../jla-path-progress.js';

// End-to-end proof that the JLA graduation loop is wired: a real academy answer records capability
// evidence in the repository, and that evidence — fed straight back as the transcript — moves the
// learner's visible graduation progress. Uses the SHIPPED data so the test tracks the real product.
const read = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const levels = read('data/jla-graduation-levels.json');
const skills = read('data/jla-foundation-skill-slice.json');
const sessions = read('data/jla-academy-sessions.json');

// The exact answer_submitted payload academy-session.js emits for a JLA slice skill, built from the
// same shipped files (jla-academy-sessions.json + the skill slice), so the loop is tested honestly.
function academyEvent(skillId, correct = true) {
  const session = sessions.find((item) => item.skillId === skillId);
  const slice = skills.find((item) => item.id === skillId);
  return {
    type: 'answer_submitted', correct, competency: 'sourceReasoning',
    sourceContext: session.sourceWindow.sourceRef, foundationSkillId: skillId,
    jlaCapability: true, skillId, domain: slice.domain, graduationLevel: session.graduationLevel,
    skillTitle: session.title, evidenceStatement: session.evidencePreview,
    sourceRef: session.sourceWindow.sourceRef, sourceUrl: session.sourceWindow.sourceUrl
  };
}

describe('JLA graduation loop: answer -> evidence -> path progress', () => {
  let root;
  beforeEach(async () => { root = await mkdtemp(join(tmpdir(), 'jla-loop-')); await mkdir(join(root, 'data'), { recursive: true }); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  test('a correct academy answer records evidence that advances graduation progress', async () => {
    const learner = await createLearner(root, 'Grad Learner');
    const updated = await recordLearnerEvent(root, learner.id, academyEvent('source-family-001'));

    // The answer produced durable capability evidence.
    assert.equal(updated.capabilityEvidence.length, 1);
    assert.equal(updated.capabilityEvidence[0].skillId, 'source-family-001');
    assert.equal(updated.capabilityEvidence[0].status, 'earned');

    // Fed back as the transcript, it moves My Path's graduation progress.
    const progress = buildJlaPathProgress({ levels, skills, transcript: updated.capabilityEvidence });
    assert.equal(progress.currentLevel.id, 'source-explorer');
    assert.equal(progress.levelProgress, 50); // 1 of the level's 2 required skills
    assert.ok(progress.earnedCapabilities.some((cap) => cap.skillId === 'source-family-001'));
    assert.equal(progress.nextCapability.skillId, 'hebrew-anchor-001');
    assert.equal(progress.nextCapability.nextStep, 'academy-session.html?skill=hebrew-anchor-001');
    assert.equal(progress.foundationComplete, false);
  });

  test('earning every skill in a level advances the learner to the next level', async () => {
    const learner = await createLearner(root, 'Grad Learner 2');
    await recordLearnerEvent(root, learner.id, academyEvent('source-family-001'));

    // hebrew-anchor-001 has no scripted academy session yet; synthesize the mapping from the slice,
    // exactly as a future session would supply it, to finish the source-explorer level.
    const anchor = skills.find((item) => item.id === 'hebrew-anchor-001');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'answer_submitted', correct: true, jlaCapability: true, skillId: anchor.id,
      domain: anchor.domain, graduationLevel: anchor.graduationLevel, skillTitle: anchor.title,
      evidenceStatement: `I can ${anchor.title.charAt(0).toLowerCase()}${anchor.title.slice(1)}.`,
      sourceRef: 'Genesis 1:1', sourceUrl: 'https://www.sefaria.org/Genesis.1.1'
    });

    assert.equal(updated.capabilityEvidence.length, 2);
    const progress = buildJlaPathProgress({ levels, skills, transcript: updated.capabilityEvidence });
    assert.equal(progress.currentLevel.id, 'canon-navigator');
  });

  test('an answer without a JLA mapping leaves graduation progress untouched', async () => {
    const learner = await createLearner(root, 'Grad Learner 3');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'answer_submitted', skillId: 'fnd-orient-source-type', correct: true
    });
    assert.deepEqual(updated.capabilityEvidence, []);
  });
});
