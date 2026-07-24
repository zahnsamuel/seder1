import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildJlaPathProgress } from '../jla-path-progress.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const levels = await readJson('../data/jla-graduation-levels.json');
const skills = await readJson('../data/jla-foundation-skill-slice.json');

test('My Path progress names the learner level and one next capability', () => {
  const progress = buildJlaPathProgress({ levels, skills, transcript: [] });
  assert.equal(progress.currentLevel.id, 'source-explorer');
  assert.equal(progress.nextLevel.id, 'canon-navigator');
  assert.equal(progress.nextCapability.skillId, 'source-family-001');
  assert.equal(
    progress.nextCapability.nextStep,
    'academy-session.html?skill=source-family-001'
  );
  assert.equal(progress.levelProgress, 0);
});

test('My Path shows earned I-can evidence without counting introduced skills', () => {
  const transcript = [
    {
      skillId: 'source-family-001',
      evidenceStatement: 'I can recognize a Jewish source family before I interpret it.',
      domain: 'source-navigation',
      status: 'earned'
    },
    {
      skillId: 'hebrew-anchor-001',
      evidenceStatement: 'I can notice a Hebrew anchor.',
      domain: 'hebrew-text-signals',
      status: 'introduced'
    }
  ];
  const progress = buildJlaPathProgress({ levels, skills, transcript });
  assert.equal(progress.earnedCapabilities.length, 1);
  assert.match(progress.earnedCapabilities[0].statement, /^I can /);
  assert.equal(progress.levelProgress, 50);
  assert.equal(progress.nextCapability.skillId, 'hebrew-anchor-001');
});

test('a Foundation graduate has no forced next capability', () => {
  const transcript = skills.map((skill) => ({
    skillId: skill.id,
    evidenceStatement: `I can ${skill.title.toLowerCase()}.`,
    domain: skill.domain,
    status: 'stable'
  }));
  const progress = buildJlaPathProgress({ levels, skills, transcript });
  assert.equal(progress.foundationComplete, true);
  assert.equal(progress.currentLevel.id, 'independent-beginner');
  assert.equal(progress.nextLevel, null);
  assert.equal(progress.nextCapability, null);
  assert.equal(progress.levelProgress, 100);
});
