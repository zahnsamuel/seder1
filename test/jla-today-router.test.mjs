import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { chooseJlaTodaySession } from '../jla-today-router.js';

const skills = JSON.parse(
  await readFile(new URL('../data/jla-foundation-skill-slice.json', import.meta.url), 'utf8')
);
const now = new Date('2026-07-24T12:00:00.000Z');
const earned = (skillId, extra = {}) => ({ skillId, status: 'earned', ...extra });

test('Today gives a returning learner one gentle recovery move first', () => {
  const result = chooseJlaTodaySession({ skills, learnerState: { missedDays: 3 }, now });
  assert.equal(result.sessionType, 'recovery');
  assert.equal(result.targetSkill, 'habit-recovery-001');
});

test('Today schedules due evidence before new frontier work', () => {
  const result = chooseJlaTodaySession({
    skills,
    learnerState: {
      evidence: [
        earned('source-family-001', { nextReview: '2026-07-23T12:00:00.000Z' })
      ]
    },
    now
  });
  assert.equal(result.sessionType, 'review');
  assert.equal(result.targetSkill, 'source-family-001');
});

test('Today chooses the first unmet skill whose prerequisites are secure', () => {
  const result = chooseJlaTodaySession({
    skills,
    learnerState: { evidence: [earned('source-family-001')] },
    now
  });
  assert.equal(result.sessionType, 'frontier');
  assert.equal(result.targetSkill, 'citation-001');
});

test('Today introduces a transfer session after the relevant capabilities are secure', () => {
  const evidence = skills
    .filter(({ id }) => id !== 'habit-transfer-001')
    .map(({ id }) => earned(id));
  const result = chooseJlaTodaySession({ skills, learnerState: { evidence }, now });
  assert.equal(result.sessionType, 'transfer');
  assert.equal(result.targetSkill, 'habit-transfer-001');
});

test('every Today result carries the complete Academy handoff contract', () => {
  const result = chooseJlaTodaySession({ skills, learnerState: {}, now });
  assert.equal(result.sessionType, 'frontier');
  assert.equal(result.targetSkill, 'source-family-001');
  assert.equal(result.graduationLevel, 'source-explorer');
  assert.match(result.nextStep, /^academy-session\.html\?skill=/);
  assert.match(result.evidenceStatement, /^I can /);
});

test('Today fails clearly when no skill catalog is available', () => {
  assert.throws(() => chooseJlaTodaySession(), /requires at least one skill/);
});
