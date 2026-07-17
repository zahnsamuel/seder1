import test from 'node:test';
import assert from 'node:assert/strict';
import { recordHostedEvent } from '../data/supabase-learner-repository.mjs';

// Groundwork guard (see docs/events-storage-refactor-plan.md + migration 007): every attempt
// row must carry its event `type` so analytics/mastery can eventually be derived from the
// attempts table instead of the unbounded learner_state.events JSONB. This tests the write
// path with a mocked Supabase REST layer (no live project needed).
function withMockedFetch(run) {
  const originalFetch = global.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://project.test';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options.method, body: options.body ? JSON.parse(options.body) : null });
    return { ok: true, status: 200, json: async () => [] };
  };
  return run(calls).finally(() => {
    global.fetch = originalFetch;
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_ANON_KEY = originalKey;
  });
}

test('recordHostedEvent records the event type on the attempts row', async () => {
  await withMockedFetch(async (calls) => {
    await recordHostedEvent({ id: 'user-1' }, 'token', { type: 'canon_lab', skillId: 'lab-x', correct: true, sourceContext: 'ctx-1' });
    const attemptWrite = calls.find((c) => c.method === 'POST' && /\/rest\/v1\/attempts(\?|$)/.test(c.url));
    assert.ok(attemptWrite, 'expected a POST to the attempts table');
    assert.equal(attemptWrite.body.type, 'canon_lab', 'attempt row must carry the event type');
    assert.equal(attemptWrite.body.skill_id, 'lab-x');
    assert.equal(attemptWrite.body.correct, true);
  });
});
