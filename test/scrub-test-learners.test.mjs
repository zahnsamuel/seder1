import test from 'node:test';
import assert from 'node:assert/strict';
import { isTestLearner, DEFAULT_PATTERNS } from '../scripts/scrub-test-learners.mjs';

// The scrub matcher must catch this project's test-artifact accounts (go-live-check runs, manual
// demo signups, the isolation fixtures) while never touching a real learner or the demo fixture.

const learner = (id, displayName) => ({ id, profile: { displayName } });

test('matches the accounts our tooling creates', () => {
  for (const l of [
    learner('demo-qa-aug18-123456', 'Demo QA Aug18'),
    learner('demo-verify-aug18-987654', 'Demo Verify Aug18'),
    learner('go-live-a-089482', 'go-live-a-089482'),
    learner('go-live-b-112233', 'go-live-b-112233'),
    learner('learner-a-1', 'Learner A'),
    learner('learner-b-2', 'Learner B')
  ]) {
    assert.equal(isTestLearner(l), true, `should match ${l.profile.displayName}`);
  }
});

test('does not match real learners', () => {
  for (const l of [
    learner('rivka-204815', 'Rivka'),
    learner('david-cohen-771020', 'David Cohen'),
    learner('demonstrative-1', 'Demonstrative Analysis'), // "demo" only as a word boundary, not any word starting demo…
    learner('golan-heights-3', 'Golan')                    // "go" but not "go-live"
  ]) {
    assert.equal(isTestLearner(l), false, `should NOT match ${l.profile.displayName}`);
  }
});

test('never removes the built-in demo fixture, even though its name starts with Demo', () => {
  assert.equal(isTestLearner(learner('demo', 'Demo learner')), false);
});

test('explicit --name / --id always match, and never override the demo guard', () => {
  assert.equal(isTestLearner(learner('rivka-204815', 'Rivka'), { names: ['Rivka'] }), true);
  assert.equal(isTestLearner(learner('some-id-1', 'Anyone'), { ids: ['some-id-1'] }), true);
  assert.equal(isTestLearner(learner('demo', 'Demo learner'), { ids: ['demo'] }), false);
});

test('the default patterns are anchored (no loose substring sweeps)', () => {
  // "Demonstrative" and "Golan" would be caught by an unanchored /demo/ or /go/ — the \b anchors
  // and the go-?live requirement prevent that.
  assert.ok(DEFAULT_PATTERNS.every((re) => re.source.startsWith('^')));
});
