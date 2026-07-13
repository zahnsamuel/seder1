import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { advancedCanonSessions, advancedCanonPhaseTitles } from '../data/advanced-canon-cycle.mjs';

test('advanced canon cycles add 64 source-based deliberate-practice encounters', () => {
  const sessions = advancedCanonSessions();
  assert.equal(advancedCanonPhaseTitles.length, 8);
  assert.equal(sessions.length, 64);
  assert.equal(sessions[0].prerequisiteStages[0], 'canon-independent-next-step');
  assert.equal(sessions.at(-1).stageId, 'canon-synthesis-jeremiah');
  for (const session of sessions) {
    assert.ok(session.source.citation);
    assert.ok(session.source.hebrew);
    assert.equal(session.questions.length, 2);
    assert.ok(session.practice?.prompt);
    assert.ok(session.practice?.minLength >= 24);
    assert.equal(session.questions[0].correct, 0);
    assert.equal(session.questions[1].correct, 0);
  }
});

test('advanced sessions require a learner-owned source map before completion', async () => {
  const [html, script, styles] = await Promise.all(['canon-session.html', 'canon-session.js', 'canon-session.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /YOUR SOURCE MAP/);
  assert.match(script, /showPractice/);
  assert.match(script, /journey_artifact_saved/);
  assert.match(styles, /\.practice/);
});
