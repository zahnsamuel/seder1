import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { explainRecommendation, whySentence } from '../data/recommendation-why.mjs';

test('every recommendation kind gets a structured, three-beat why', () => {
  const kinds = ['placement', 'academy-foundation', 'review', 'remediation', 'foundation-term', 'gemara-year-term', 'moed-expansion', 'graph-practice', 'canon-session', 'gemara-arc', 'shas-map'];
  for (const kind of kinds) {
    const why = explainRecommendation({ kind, title: `A ${kind} move` });
    assert.ok(why.basis, `${kind} has a machine-readable basis`);
    assert.ok(why.because && why.because.length > 3, `${kind} names why now`);
    assert.equal(why.build, `A ${kind} move`, `${kind} echoes the move as the build beat`);
    assert.ok('unlocks' in why, `${kind} has an unlocks beat (may be null)`);
  }
});

test('an unknown kind still explains, via the breadth fallback', () => {
  const why = explainRecommendation({ kind: 'something-new', title: 'X' });
  assert.equal(why.basis, 'breadth');
  assert.ok(why.because);
});

test('graph-practice grounds the beats in the graph edges it was handed', () => {
  const grounded = explainRecommendation({ kind: 'graph-practice', title: 'Separate a question from its answer', builtOn: 'Find the question signal', unlocks: 'Track a multi-step argument' });
  assert.equal(grounded.basis, 'graph-prerequisite');
  assert.match(grounded.because, /you’ve secured Find the question signal/);
  assert.equal(grounded.unlocks, 'Track a multi-step argument');

  // A first move (no secured prerequisite, nothing after it yet) degrades gracefully.
  const firstMove = explainRecommendation({ kind: 'graph-practice', title: 'First move', builtOn: null, unlocks: null });
  assert.match(firstMove.because, /foundational move with nothing before it/);
  assert.equal(firstMove.unlocks, null);
});

test('academy-foundation carries the sequence neighbors', () => {
  const why = explainRecommendation({ kind: 'academy-foundation', title: 'Academy Foundation · Name the claim', builtOn: 'Notice when a source is asking', unlocks: 'Match evidence to a claim' });
  assert.match(why.because, /Notice when a source is asking/);
  assert.equal(why.unlocks, 'Match evidence to a claim');
});

test('a decay-triggered review is distinguished from a scheduled one', () => {
  assert.equal(explainRecommendation({ kind: 'review', title: 'R' }).basis, 'spaced-review');
  assert.equal(explainRecommendation({ kind: 'review', decayTriggered: true, title: 'R' }).basis, 'decay');
});

test('remediation names the struggle count when present', () => {
  assert.match(explainRecommendation({ kind: 'remediation', title: 'Strengthen X', count: 3 }).because, /uncertain 3 times/);
  assert.equal(explainRecommendation({ kind: 'remediation', title: 'Strengthen X' }).basis, 'fragile-skill');
});

test('key-prerequisite remediation is explained as a foundation review (Math Academy Way)', () => {
  const why = explainRecommendation({ kind: 'remediation', title: 'Shore up the foundation: Find the question signal', count: 2, repairMode: 'key-prerequisite-review' });
  assert.equal(why.basis, 'kp-key-prerequisite');
  assert.match(why.because, /2 snags on the move this one supports/);
});

test('whySentence reads cleanly with and without an unlocks beat', () => {
  assert.equal(whySentence({ because: 'you’ve secured A', unlocks: 'C' }), 'Because you’ve secured A, it unlocks C.');
  assert.equal(whySentence({ because: 'this is a foundational move', unlocks: null }), 'Because this is a foundational move.');
  assert.equal(whySentence(null), '');
});

test('server attaches the why (and a pre-rendered sentence) to every recommendation', () => {
  // Guard the wiring in server.mjs so the endpoint payload keeps carrying the explanation.
  const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /recommendation\.why = explainRecommendation\(recommendation, learner\)/);
  assert.match(server, /recommendation\.why\.sentence = whySentence\(recommendation\.why\)/);
});
