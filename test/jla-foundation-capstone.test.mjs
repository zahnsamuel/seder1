import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateJlaFoundationCapstone,
  jlaFoundationCapstoneEligibility
} from '../jla-foundation-capstone.js';

test('Foundation completion makes the capstone eligible', () => {
  assert.deepEqual(jlaFoundationCapstoneEligibility({ foundationComplete: true }), {
    eligible: true,
    reason: 'foundation-complete'
  });
});

test('80% Independent Beginner progress also makes the capstone eligible', () => {
  const result = jlaFoundationCapstoneEligibility({
    foundationComplete: false,
    levelResults: [{ levelId: 'independent-beginner', progress: 80 }]
  });
  assert.equal(result.eligible, true);
  assert.equal(result.reason, 'independent-beginner-ready');
});

test('an unready learner receives one evidence-led return rather than a false attempt', () => {
  const nextMissingCapability = {
    skillId: 'habit-transfer-001',
    title: 'Transfer one learned skill to a new source'
  };
  const result = evaluateJlaFoundationCapstone({
    graduation: {
      foundationComplete: false,
      levelResults: [{ levelId: 'independent-beginner', progress: 50 }],
      nextMissingCapability
    },
    correct: 5,
    total: 5
  });
  assert.equal(result.eligible, false);
  assert.equal(result.graduationStatus, 'needs-review');
  assert.deepEqual(result.nextMissingCapability, nextMissingCapability);
});

test('the capstone passes at 80% and records a Foundation-graduate statement', () => {
  const result = evaluateJlaFoundationCapstone({
    graduation: { foundationComplete: true },
    correct: 4,
    total: 5
  });
  assert.equal(result.scorePercent, 80);
  assert.equal(result.passed, true);
  assert.equal(result.graduationStatus, 'foundation-graduate');
  assert.match(result.evidenceStatement, /^I can /);
});

test('a score below 80% routes to review without erasing capability', () => {
  const result = evaluateJlaFoundationCapstone({
    graduation: { foundationComplete: true },
    correct: 3,
    total: 5
  });
  assert.equal(result.scorePercent, 60);
  assert.equal(result.passed, false);
  assert.equal(result.graduationStatus, 'needs-review');
  assert.match(result.evidenceStatement, /^I can /);
});

test('eligible evaluation validates its score inputs', () => {
  assert.throws(
    () =>
      evaluateJlaFoundationCapstone({
        graduation: { foundationComplete: true },
        correct: 2,
        total: 0
      }),
    /requires integer correct and total/
  );
});
