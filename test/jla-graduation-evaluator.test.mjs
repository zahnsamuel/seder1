import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evaluateJlaGraduation } from '../jla-graduation-evaluator.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const levels = await readJson('../data/jla-graduation-levels.json');
const skills = await readJson('../data/jla-foundation-skill-slice.json');
const evidence = (skillId, status = 'earned') => ({ skillId, status });

test('a new learner begins at Source Explorer with one explicit missing capability', () => {
  const result = evaluateJlaGraduation({ levels, skills, transcript: [] });
  assert.equal(result.currentLevel, 'source-explorer');
  assert.equal(result.nextLevel, 'canon-navigator');
  assert.equal(result.foundationComplete, false);
  assert.equal(result.nextMissingCapability.skillId, 'source-family-001');
});

test('introduced evidence does not count toward graduation', () => {
  const sourceExplorerSkills = skills.filter(
    ({ graduationLevel }) => graduationLevel === 'source-explorer'
  );
  const result = evaluateJlaGraduation({
    levels,
    skills,
    transcript: sourceExplorerSkills.map(({ id }) => evidence(id, 'introduced'))
  });
  assert.equal(result.levelResults[0].progress, 0);
  assert.equal(result.levelResults[0].complete, false);
});

test('earned, stable, and transfer-ready evidence all count as secure', () => {
  const sourceExplorerSkills = skills.filter(
    ({ graduationLevel }) => graduationLevel === 'source-explorer'
  );
  const transcript = sourceExplorerSkills.map(({ id }, index) =>
    evidence(id, index === 0 ? 'stable' : 'transfer-ready')
  );
  const result = evaluateJlaGraduation({ levels, skills, transcript });
  assert.equal(result.levelResults[0].complete, true);
  assert.equal(result.currentLevel, 'canon-navigator');
});

test('level results expose evidence-based progress and missing skill ids', () => {
  const result = evaluateJlaGraduation({
    levels,
    skills,
    transcript: [evidence('source-family-001')]
  });
  const sourceExplorer = result.levelResults[0];
  assert.equal(sourceExplorer.progress, 50);
  assert.deepEqual(sourceExplorer.earnedSkills, ['source-family-001']);
  assert.deepEqual(sourceExplorer.missingSkills, ['hebrew-anchor-001']);
});

test('Foundation graduation requires every skill across all six levels', () => {
  const transcript = skills.map(({ id }, index) =>
    evidence(id, index % 2 ? 'stable' : 'earned')
  );
  const result = evaluateJlaGraduation({ levels, skills, transcript });
  assert.equal(result.foundationComplete, true);
  assert.equal(result.currentLevel, 'independent-beginner');
  assert.equal(result.nextLevel, null);
  assert.equal(result.nextMissingCapability, null);
  assert.ok(result.levelResults.every(({ complete }) => complete));
});

test('graduation evaluation requires the architecture catalog', () => {
  assert.throws(() => evaluateJlaGraduation(), /requires JLA levels and skills/);
});
