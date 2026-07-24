import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

const levels = await readJson('../data/jla-graduation-levels.json');
const domains = await readJson('../data/jla-core-domains.json');
const skills = await readJson('../data/jla-foundation-skill-slice.json');

test('JLA architecture defines six levels, twelve domains, and a 24-skill Foundation slice', () => {
  assert.equal(levels.length, 6);
  assert.equal(domains.length, 12);
  assert.equal(skills.length, 24);
});

test('graduation levels are ordered learner promises with valid domain requirements', () => {
  const domainIds = new Set(domains.map(({ id }) => id));
  const levelIds = new Set(levels.map(({ id }) => id));

  assert.deepEqual(levels.map(({ order }) => order), [1, 2, 3, 4, 5, 6]);
  assert.equal(levelIds.size, levels.length);
  for (const level of levels) {
    assert.match(level.promise, /^I can /);
    assert.ok(level.requiredDomains.length > 0);
    level.requiredDomains.forEach((domain) => assert.ok(domainIds.has(domain)));
  }
});

test('core domains expose unique ids and learner-facing capability promises', () => {
  assert.equal(new Set(domains.map(({ id }) => id)).size, domains.length);
  for (const domain of domains) {
    assert.ok(domain.id);
    assert.ok(domain.title);
    assert.match(domain.learnerPromise, /^I can /);
  }
});

test('Foundation skills reference valid domains, levels, prerequisites, and guided checks', () => {
  const domainIds = new Set(domains.map(({ id }) => id));
  const levelIds = new Set(levels.map(({ id }) => id));
  const skillIds = new Set(skills.map(({ id }) => id));

  assert.equal(skillIds.size, skills.length);
  for (const skill of skills) {
    assert.ok(domainIds.has(skill.domain), `unknown domain for ${skill.id}`);
    assert.ok(levelIds.has(skill.graduationLevel), `unknown level for ${skill.id}`);
    assert.equal(skill.checkType, 'guided-choice');
    skill.prerequisites.forEach((id) => assert.ok(skillIds.has(id), `unknown prerequisite ${id}`));
  }
});

test('Foundation slice represents every JLA domain, keeping non-Gemara learning first-class', () => {
  const represented = new Set(skills.map(({ domain }) => domain));
  assert.deepEqual([...represented].sort(), domains.map(({ id }) => id).sort());
  assert.ok(skills.filter(({ domain }) => domain === 'gemara-moves').length < skills.length / 2);
});
