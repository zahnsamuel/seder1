import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildJlaPlacementResult } from '../jla-placement-router.js';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const levels = await readJson('../data/jla-graduation-levels.json');
const domains = await readJson('../data/jla-core-domains.json');
const skills = await readJson('../data/jla-foundation-skill-slice.json');

test('placement treats a new learner as a starting point, not a judgment', () => {
  const result = buildJlaPlacementResult({ levels, domains, skills });
  assert.equal(result.headline, 'Starting point, not a test.');
  assert.equal(result.learnerLevel, 'source-explorer');
  assert.equal(result.levelTitle, 'Source Explorer');
  assert.match(result.summary, /one useful capability/i);
  assert.match(result.firstSession, /^academy-session\.html\?skill=/);
});

test('placement reports strong and growth domains from the capability profile', () => {
  const result = buildJlaPlacementResult({
    levels,
    domains,
    skills,
    domainScores: {
      'source-navigation': 0.9,
      'gemara-moves': 0.75,
      'tefillah-siddur-literacy': 0.1
    }
  });
  assert.deepEqual(
    result.strongDomains.map(({ id }) => id),
    ['source-navigation', 'gemara-moves']
  );
  assert.ok(result.growthDomains.some(({ id }) => id === 'tefillah-siddur-literacy'));
});

test('placement can place a capable learner later without making Gemara the default', () => {
  const domainScores = Object.fromEntries(domains.map(({ id }) => [id, 0.52]));
  domainScores['tefillah-siddur-literacy'] = 0.2;
  const result = buildJlaPlacementResult({ levels, domains, skills, domainScores });
  assert.equal(result.learnerLevel, 'text-reader');
  assert.equal(result.firstUsefulSkill.domain, 'tefillah-siddur-literacy');
  assert.equal(result.firstUsefulSkill.id, 'tefillah-blessing-001');
});

test('placement preserves a sustainable learner rhythm within safe bounds', () => {
  const chosen = buildJlaPlacementResult({
    levels,
    domains,
    skills,
    rhythm: { daysPerWeek: 4, minutesPerSession: 15 }
  });
  assert.deepEqual(chosen.recommendedRhythm, {
    daysPerWeek: 4,
    minutesPerSession: 15
  });

  const bounded = buildJlaPlacementResult({
    levels,
    domains,
    skills,
    rhythm: { daysPerWeek: 10, minutesPerSession: 2 }
  });
  assert.deepEqual(bounded.recommendedRhythm, {
    daysPerWeek: 7,
    minutesPerSession: 10
  });
});

test('placement refuses a partial architecture catalog', () => {
  assert.throws(
    () => buildJlaPlacementResult({ levels: [], domains, skills }),
    /complete architecture catalog/
  );
});
