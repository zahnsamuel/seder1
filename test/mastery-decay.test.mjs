import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { decayedMastery, decayedMasteryMap, freshnessOf } from '../data/mastery-decay.mjs';

describe('decayedMastery', () => {
  test('returns 0 for a raw score of 0 or less', () => {
    assert.equal(decayedMastery(0, new Date().toISOString()), 0);
    assert.equal(decayedMastery(-1, new Date().toISOString()), 0);
  });

  test('returns raw score unchanged when there is no timestamp (older records)', () => {
    assert.equal(decayedMastery(0.8, null), 0.8);
    assert.equal(decayedMastery(0.8, undefined), 0.8);
  });

  test('returns raw score unchanged the instant it was recorded', () => {
    const now = new Date().toISOString();
    assert.equal(decayedMastery(0.8, now), 0.8);
  });

  test('halves after one 21-day half-life', () => {
    const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
    const decayed = decayedMastery(1, twentyOneDaysAgo);
    // Allow a small tolerance for the few milliseconds of test execution time.
    assert.ok(Math.abs(decayed - 0.5) < 0.001, `expected ~0.5, got ${decayed}`);
  });

  test('halves again after a second half-life (42 days ~ 0.25)', () => {
    const fortyTwoDaysAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();
    const decayed = decayedMastery(1, fortyTwoDaysAgo);
    assert.ok(Math.abs(decayed - 0.25) < 0.001, `expected ~0.25, got ${decayed}`);
  });

  test('never decays below the 12% retention floor, however long ago', () => {
    const wayInThePast = new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000).toISOString(); // 10 years
    const decayed = decayedMastery(1, wayInThePast);
    assert.ok(Math.abs(decayed - 0.12) < 0.001, `expected floor ~0.12, got ${decayed}`);
  });

  test('floor scales with the raw score, not a flat 0.12', () => {
    const wayInThePast = new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000).toISOString();
    const decayed = decayedMastery(0.5, wayInThePast);
    assert.ok(Math.abs(decayed - 0.06) < 0.001, `expected floor ~0.06 (0.5 * 0.12), got ${decayed}`);
  });
});

describe('decayedMasteryMap', () => {
  test('maps decay independently over every skill id', () => {
    const now = new Date().toISOString();
    const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
    const map = decayedMasteryMap(
      { 'skill-a': 1, 'skill-b': 1 },
      { 'skill-a': now, 'skill-b': twentyOneDaysAgo }
    );
    assert.equal(map['skill-a'], 1);
    assert.ok(Math.abs(map['skill-b'] - 0.5) < 0.001);
  });

  test('defaults to empty inputs gracefully', () => {
    assert.deepEqual(decayedMasteryMap(), {});
  });
});

describe('freshnessOf', () => {
  test('returns "none" for a non-positive raw score', () => {
    assert.equal(freshnessOf(0, 0), 'none');
  });

  test('returns "fresh" when decay ratio is >= 0.85', () => {
    assert.equal(freshnessOf(1, 0.9), 'fresh');
    assert.equal(freshnessOf(1, 0.85), 'fresh');
  });

  test('returns "fading" when decay ratio is between 0.5 and 0.85', () => {
    assert.equal(freshnessOf(1, 0.7), 'fading');
    assert.equal(freshnessOf(1, 0.5), 'fading');
  });

  test('returns "faded" when decay ratio drops below 0.5', () => {
    assert.equal(freshnessOf(1, 0.49), 'faded');
    assert.equal(freshnessOf(1, 0.12), 'faded');
  });
});
