import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mergeCapabilityEvidence,
  recordCapabilityEvidence
} from '../jla-capability-evidence.js';

const skill = {
  id: 'mishnah-case-001',
  title: 'Identify the case in a Mishnah',
  domain: 'mishnah-literacy',
  graduationLevel: 'text-reader'
};
const session = {
  evidencePreview: 'I can identify the case a Mishnah is governing.',
  sourceWindow: {
    sourceRef: 'Mishnah Berakhot 1:1',
    sourceUrl: 'https://www.sefaria.org/Mishnah_Berakhot.1.1'
  }
};
const now = new Date('2026-07-24T12:00:00.000Z');

test('a correct Academy check records earned capability evidence and review timing', () => {
  const evidence = recordCapabilityEvidence({ skill, session, correct: true, now });
  assert.deepEqual(evidence, {
    skillId: 'mishnah-case-001',
    evidenceStatement: 'I can identify the case a Mishnah is governing.',
    domain: 'mishnah-literacy',
    graduationLevel: 'text-reader',
    sourceRef: 'Mishnah Berakhot 1:1',
    sourceUrl: 'https://www.sefaria.org/Mishnah_Berakhot.1.1',
    status: 'earned',
    earnedAt: '2026-07-24T12:00:00.000Z',
    nextReview: '2026-07-31T12:00:00.000Z'
  });
});

test('incorrect, repeated, and transfer demonstrations map to explicit statuses', () => {
  assert.equal(
    recordCapabilityEvidence({ skill, session, correct: false, now }).status,
    'introduced'
  );
  assert.equal(
    recordCapabilityEvidence({
      skill,
      session,
      correct: true,
      demonstrationCount: 2,
      now
    }).status,
    'stable'
  );
  assert.equal(
    recordCapabilityEvidence({ skill, session, correct: true, isTransfer: true, now })
      .status,
    'transfer-ready'
  );
});

test('evidence always retains its source and graduation mapping', () => {
  const evidence = recordCapabilityEvidence({ skill, session, correct: true, now });
  assert.equal(evidence.domain, skill.domain);
  assert.equal(evidence.graduationLevel, skill.graduationLevel);
  assert.match(evidence.sourceUrl, /^https:\/\/www\.sefaria\.org\//);
  assert.match(evidence.evidenceStatement, /^I can /);
});

test('merging preserves the strongest status and original earned date', () => {
  const earned = recordCapabilityEvidence({ skill, session, correct: true, now });
  const later = new Date('2026-08-01T12:00:00.000Z');
  const stable = recordCapabilityEvidence({
    skill,
    session,
    correct: true,
    demonstrationCount: 2,
    now: later
  });
  const merged = mergeCapabilityEvidence([earned], stable);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].status, 'stable');
  assert.equal(merged[0].earnedAt, earned.earnedAt);

  const introduced = recordCapabilityEvidence({ skill, session, correct: false, now: later });
  assert.equal(mergeCapabilityEvidence(merged, introduced)[0].status, 'stable');
});

test('evidence rejects missing skill or source contracts', () => {
  assert.throws(
    () => recordCapabilityEvidence({ skill: {}, session, correct: true, now }),
    /mapped JLA skill/
  );
  assert.throws(
    () => recordCapabilityEvidence({ skill, session: {}, correct: true, now }),
    /verified source window/
  );
});
