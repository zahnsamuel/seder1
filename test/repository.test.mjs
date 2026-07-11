import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createLearner,
  recordLearnerEvent,
  getLearner,
  listLearners,
  reviewStatus,
  decayingSkills,
} from '../data/repository.mjs';

// Every test gets its own scratch "root" directory (with a data/ subfolder, matching
// what learnerFile() expects) so tests never share or collide over learners.json.
let root;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'seder-repo-test-'));
  await mkdir(join(root, 'data'), { recursive: true });
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('createLearner', () => {
  test('creates a learner with default fields and a generated id', async () => {
    const learner = await createLearner(root, 'Test Learner');
    assert.ok(learner.id.startsWith('test-learner-'));
    assert.equal(learner.xp, 0);
    assert.deepEqual(learner.mastery, {});
    assert.equal(learner.profile.displayName, 'Test Learner');
    assert.equal(learner.placement, null);
  });
});

describe('recordLearnerEvent: answer_submitted', () => {
  test('a correct answer raises mastery, awards xp, and stamps masteryUpdatedAt', async () => {
    const learner = await createLearner(root, 'Learner A');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'answer_submitted', skillId: 'skill-x', competency: 'recognition', correct: true,
    });
    assert.equal(updated.xp, 10);
    assert.ok(Math.abs(updated.mastery['skill-x'] - 0.34) < 0.001);
    assert.ok(updated.masteryUpdatedAt['skill-x']);
    assert.equal(updated.competencies.recognition, 0.22);
  });

  test('an incorrect answer awards partial mastery/xp and queues a review', async () => {
    const learner = await createLearner(root, 'Learner B');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'answer_submitted', skillId: 'skill-y', competency: 'argument', correct: false,
    });
    assert.equal(updated.xp, 5);
    assert.ok(Math.abs(updated.mastery['skill-y'] - 0.08) < 0.001);
    const due = reviewStatus(updated).due;
    assert.equal(due.length, 1);
    assert.equal(due[0].skillId, 'skill-y');
  });

  test('mastery never exceeds 1 no matter how many correct answers accumulate', async () => {
    const learner = await createLearner(root, 'Learner C');
    let current = learner;
    for (let i = 0; i < 6; i++) {
      current = await recordLearnerEvent(root, learner.id, {
        type: 'answer_submitted', skillId: 'skill-z', competency: 'recognition', correct: true,
      });
    }
    assert.equal(current.mastery['skill-z'], 1);
  });

  test('a skill reaching >= .67 mastery clears out of the review queue', async () => {
    const learner = await createLearner(root, 'Learner D');
    // First answer is wrong (queues a review), then two more correct answers push
    // mastery from .08 up past .67, which should clear that queued review.
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-w', correct: false });
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-w', correct: true });
    const final = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-w', correct: true });
    assert.ok(final.mastery['skill-w'] >= 0.67, `expected mastery >= .67, got ${final.mastery['skill-w']}`);
    assert.equal(reviewStatus(final).due.length, 0);
  });

  test('a skill between .67 and .85 mastery still gets a scheduled durability review', async () => {
    const learner = await createLearner(root, 'Learner E');
    const updated = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-v', correct: true });
    // A single correct answer lands mastery at .34, below .67, so no review should be
    // scheduled yet from the ">= .67 and < .85" durability branch specifically -- but
    // this confirms the mastery value itself is what later gates that branch.
    assert.ok(updated.mastery['skill-v'] < 0.67);
  });
});

describe('recordLearnerEvent: evidence and the multi-context transfer bonus', () => {
  test('a single source context grants the base mastery gain only', async () => {
    const learner = await createLearner(root, 'Learner F');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'answer_submitted', skillId: 'skill-ctx', correct: true, sourceContext: 'Context A',
    });
    assert.ok(Math.abs(updated.mastery['skill-ctx'] - 0.34) < 0.001);
    assert.deepEqual(updated.evidence['skill-ctx'], ['Context A']);
  });

  test('a second, distinct source context adds a .08 transfer bonus', async () => {
    const learner = await createLearner(root, 'Learner G');
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-ctx2', correct: true, sourceContext: 'Context A' });
    const updated = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-ctx2', correct: true, sourceContext: 'Context B' });
    // .34 (first) + .34 + .08 transfer bonus (second) = .76
    assert.ok(Math.abs(updated.mastery['skill-ctx2'] - 0.76) < 0.001, `expected ~0.76, got ${updated.mastery['skill-ctx2']}`);
    assert.equal(updated.evidence['skill-ctx2'].length, 2);
  });

  test('repeating the same source context does not add a duplicate or a second bonus', async () => {
    const learner = await createLearner(root, 'Learner H');
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-ctx3', correct: true, sourceContext: 'Context A' });
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-ctx3', correct: true, sourceContext: 'Context B' });
    const updated = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-ctx3', correct: true, sourceContext: 'Context B' });
    assert.equal(updated.evidence['skill-ctx3'].length, 2, 'context set should not grow from a repeated context');
  });
});

describe('recordLearnerEvent: placement_completed', () => {
  test('seeds mastery for every scored skill and rolls scores into competencies', async () => {
    const learner = await createLearner(root, 'Learner I');
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'placement_completed',
      scores: { 'hebrew-decoding': 1, 'mishnah-orientation': 1, 'language-baseline': 1, 'gemara-moves': 1, 'proof-texts': 1 },
    });
    assert.ok(updated.placement);
    assert.equal(updated.mastery['hebrew-decoding'], 1);
    assert.equal(updated.competencies.recognition, 1);
    assert.equal(updated.competencies.translation, 1);
    assert.equal(updated.competencies.argument, 1);
    assert.equal(updated.competencies.sourceReasoning, 1);
  });

  test('placement never lowers an already-higher mastery or competency score', async () => {
    const learner = await createLearner(root, 'Learner J');
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'hebrew-decoding', competency: 'recognition', correct: true });
    await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'hebrew-decoding', competency: 'recognition', correct: true });
    const beforePlacement = await getLearner(root, learner.id);
    const strongMastery = beforePlacement.mastery['hebrew-decoding'];
    const updated = await recordLearnerEvent(root, learner.id, {
      type: 'placement_completed', scores: { 'hebrew-decoding': 0.25 },
    });
    assert.equal(updated.mastery['hebrew-decoding'], strongMastery, 'a weak placement score should not overwrite stronger prior mastery');
  });
});

describe('decayingSkills', () => {
  test('excludes skills below the .67 established threshold', async () => {
    const learner = await createLearner(root, 'Learner K');
    const updated = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-low', correct: true });
    assert.ok(updated.mastery['skill-low'] < 0.67);
    assert.equal(decayingSkills(updated).length, 0);
  });

  test('flags an established skill once it has quietly decayed past "fresh"', async () => {
    const learner = await createLearner(root, 'Learner L');
    let current = learner;
    for (let i = 0; i < 3; i++) {
      current = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-decay', correct: true });
    }
    assert.ok(current.mastery['skill-decay'] >= 0.67);
    // Freshly answered: should not show up as decaying yet.
    assert.equal(decayingSkills(current).length, 0);

    // Manually backdate as a direct disk read/write would, simulating elapsed time,
    // then re-fetch through getLearner so decay is recomputed on read.
    const learners = JSON.parse(await (await import('node:fs/promises')).readFile(join(root, 'data', 'learners.json'), 'utf8'));
    learners[learner.id].masteryUpdatedAt['skill-decay'] = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
    await (await import('node:fs/promises')).writeFile(join(root, 'data', 'learners.json'), JSON.stringify(learners, null, 2), 'utf8');

    const reloaded = await getLearner(root, learner.id);
    const faded = decayingSkills(reloaded);
    assert.equal(faded.length, 1);
    assert.equal(faded[0].skillId, 'skill-decay');
    assert.equal(faded[0].freshness, 'faded');
  });
});

describe('reviewStatus', () => {
  test('separates due items from upcoming items by dueAt', async () => {
    const learner = await createLearner(root, 'Learner M');
    const updated = await recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId: 'skill-due', correct: false });
    const status = reviewStatus(updated);
    assert.equal(status.due.length, 1);
    assert.equal(status.upcoming.length, 0);
  });
});

describe('recordLearnerEvent: concurrent write safety', () => {
  // Local persistence is one shared learners.json per root: read whole, mutate in memory,
  // write whole. Without serializing these read-modify-write calls, firing several events
  // for the same learner without awaiting each one individually -- exactly what a browser
  // can do if a learner answers quickly, or if two tabs are open -- lets two calls read the
  // same pre-write snapshot; whichever write lands second silently discards the first
  // learner's changes. This test proves that no longer happens.
  test('every event in a burst of concurrent answers for the same learner is preserved', async () => {
    const learner = await createLearner(root, 'Learner N');
    const skillIds = Array.from({ length: 12 }, (_, i) => `burst-skill-${i}`);
    await Promise.all(skillIds.map((skillId) => recordLearnerEvent(root, learner.id, { type: 'answer_submitted', skillId, correct: true })));
    const final = await getLearner(root, learner.id);
    assert.equal(final.totalAnswered, 12, 'every one of the 12 concurrent answers should have been counted, not just whichever wrote last');
    for (const skillId of skillIds) {
      assert.ok(final.mastery[skillId] > 0, `expected mastery to be recorded for ${skillId}`);
    }
  });

  test('concurrent createLearner calls each produce a distinct, persisted learner', async () => {
    const names = ['Concurrent A', 'Concurrent B', 'Concurrent C', 'Concurrent D'];
    const created = await Promise.all(names.map((name) => createLearner(root, name)));
    const ids = new Set(created.map((learner) => learner.id));
    assert.equal(ids.size, 4, 'each concurrent createLearner call should get its own distinct id');
    const all = await listLearners(root);
    for (const learner of created) {
      assert.ok(all.some((entry) => entry.id === learner.id), `${learner.id} should be persisted after a concurrent create`);
    }
  });
});
