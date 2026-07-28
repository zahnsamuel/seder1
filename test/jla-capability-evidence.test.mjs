import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mergeCapabilityEvidence,
  recordCapabilityEvidence,
  recordAcademyCapabilityEvent
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

// recordAcademyCapabilityEvent adapts a live `answer_submitted` event (as the repository
// stores it) into capability evidence and merges it into the learner's running list.
const academyEvent = (overrides = {}) => ({
  type: 'answer_submitted',
  jlaCapability: true,
  skillId: 'mishnah-case-001',
  skillTitle: 'Identify the case in a Mishnah',
  domain: 'mishnah-literacy',
  graduationLevel: 'text-reader',
  evidenceStatement: 'I can identify the case a Mishnah is governing.',
  sourceRef: 'Mishnah Berakhot 1:1',
  sourceUrl: 'https://www.sefaria.org/Mishnah_Berakhot.1.1',
  correct: true,
  ...overrides
});

test('a correct Academy event appends earned evidence to an empty list', () => {
  const list = recordAcademyCapabilityEvent([], academyEvent(), now);
  assert.equal(list.length, 1);
  assert.deepEqual(list[0], {
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

test('a repeat correct demonstration on the same source promotes earned -> stable', () => {
  const earned = recordAcademyCapabilityEvent([], academyEvent(), now);
  const later = new Date('2026-08-01T12:00:00.000Z');
  const stable = recordAcademyCapabilityEvent(earned, academyEvent(), later);
  assert.equal(stable.length, 1);
  assert.equal(stable[0].status, 'stable');
  assert.equal(stable[0].earnedAt, '2026-07-24T12:00:00.000Z');
});

test('a correct demonstration on a different source is transfer-ready', () => {
  const earned = recordAcademyCapabilityEvent([], academyEvent(), now);
  const later = new Date('2026-08-01T12:00:00.000Z');
  const transferred = recordAcademyCapabilityEvent(
    earned,
    academyEvent({ sourceRef: 'Mishnah Peah 1:1', sourceUrl: 'https://www.sefaria.org/Mishnah_Peah.1.1' }),
    later
  );
  assert.equal(transferred.length, 1);
  assert.equal(transferred[0].status, 'transfer-ready');
});

test('an incorrect Academy event records introduced evidence without an earned date', () => {
  const list = recordAcademyCapabilityEvent([], academyEvent({ correct: false }), now);
  assert.equal(list[0].status, 'introduced');
  assert.equal(list[0].earnedAt, null);
});

test('an Academy event without its JLA mapping is rejected', () => {
  assert.throws(() => recordAcademyCapabilityEvent([], academyEvent({ jlaCapability: false }), now), /JLA mapping/);
  assert.throws(() => recordAcademyCapabilityEvent([], academyEvent({ domain: undefined }), now), /JLA mapping/);
});
