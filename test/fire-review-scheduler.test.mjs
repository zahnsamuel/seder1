import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLearner, recordLearnerEvent, getLearner, reviewStatus, fireReviewPlan, creditImplicitReviews } from '../data/repository.mjs';

// FIRe wired into the review scheduler (The Math Academy Way). The Layer-0 decoding chain is a clean,
// stable prerequisite chain in the real graph: letters -> vowels -> blend, each a direct prerequisite
// (full encompassing weight 1). Reviewing an advanced skill implicitly reviews the simpler ones.
let root;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'seder-fire-test-'));
  await mkdir(join(root, 'data'), { recursive: true });
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

describe('FIRe implicit repetition in the scheduler', () => {
  test('a correct answer on an advanced skill credits the due prerequisite it encompasses', async () => {
    const learner = await createLearner(root, 'Reader');
    // Put the prerequisite (letters) in the due queue via a wrong answer.
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'fnd-decode-letters', correct: false });
    let now = await getLearner(root, learner.id);
    assert.ok(reviewStatus(now).due.some((item) => item.skillId === 'fnd-decode-letters'), 'letters starts due');

    // Correctly practice the encompassing skill (vowels, whose direct prerequisite is letters).
    const after = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'fnd-decode-vowels', correct: true, sourceContext: 'Decoding drill' });

    // The due prerequisite is credited: pushed out of the due set and stamped with what covered it.
    const lettersItem = after.reviewQueue.find((item) => item.skillId === 'fnd-decode-letters');
    assert.ok(lettersItem, 'letters stays in the queue');
    assert.equal(lettersItem.coveredBy, 'fnd-decode-vowels', 'auditable: credited to the skill that covered it');
    assert.ok(!reviewStatus(after).due.some((item) => item.skillId === 'fnd-decode-letters'), 'letters is no longer due — implicitly reviewed');
    assert.ok(after.masteryUpdatedAt['fnd-decode-letters'], 'its decay clock was reset');
  });

  test('practicing a prerequisite does NOT credit a more advanced due skill', async () => {
    const learner = await createLearner(root, 'Reader Two');
    // The advanced skill (blend) is due; practicing a simpler prerequisite (letters) must not clear it —
    // encompassing runs one way only, from advanced down to simple.
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'fnd-decode-blend', correct: false });
    const after = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'fnd-decode-letters', correct: true });
    assert.ok(reviewStatus(after).due.some((item) => item.skillId === 'fnd-decode-blend'), 'blend stays due — a prerequisite does not review its dependent');
  });

  // The hosted (Supabase) path reuses this exact function, so it credits the identical set. Proven
  // directly on a hosted-shaped learner object (reviewQueue rows + masteryUpdatedAt) without Supabase.
  test('creditImplicitReviews works on the hosted learner shape (parity with the file/SQLite path)', () => {
    const now = Date.now();
    const learner = {
      reviewQueue: [{ skillId: 'fnd-decode-letters', dueAt: new Date(now - 1000).toISOString(), attempts: 1, reason: 'due' }],
      masteryUpdatedAt: { 'fnd-decode-letters': new Date(now - 999999).toISOString() }
    };
    const at = new Date(now).toISOString();
    const credited = creditImplicitReviews(learner, 'fnd-decode-vowels', at);
    assert.deepEqual(credited, ['fnd-decode-letters'], 'vowels implicitly reviews the due letters skill it encompasses');
    const item = learner.reviewQueue.find((i) => i.skillId === 'fnd-decode-letters');
    assert.ok(new Date(item.dueAt).getTime() > now, 'the credited skill is pushed out of the due set');
    assert.equal(item.coveredBy, 'fnd-decode-vowels', 'auditable attribution');
    assert.equal(learner.masteryUpdatedAt['fnd-decode-letters'], at, 'its decay clock is reset');
  });

  test('fireReviewPlan collapses a due prerequisite chain to the single most-advanced retrieval', async () => {
    const learner = await createLearner(root, 'Reader Three');
    // Three due skills in a chain, queued by wrong answers (wrong answers do not trigger FIRe credit).
    for (const skillId of ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend']) {
      await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId, correct: false });
    }
    const plan = fireReviewPlan(await getLearner(root, learner.id));
    assert.deepEqual(plan.practice.map((item) => item.skillId), ['fnd-decode-blend'], 'only the most advanced skill is retrieved');
    assert.equal(plan.saved, 2, 'the two simpler skills are covered implicitly');
  });
});
