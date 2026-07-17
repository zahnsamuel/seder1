import test from 'node:test';
import assert from 'node:assert/strict';
import { supabaseRest } from '../data/supabase-adapter.mjs';

// Guards a ship-blocking hosted-mode bug: PostgREST only performs an UPSERT (rather than
// returning 409 on the existing row) when Prefer includes resolution=merge-duplicates. The
// learner_state row is pre-created by the handle_new_user() signup trigger, so the first
// hosted write already conflicts on the primary key. Every on_conflict= POST must carry the
// merge-duplicates resolution; plain inserts (e.g. attempts) must not.
function withMockedFetch(run) {
  const originalFetch = global.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://project.test';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, prefer: options.headers.Prefer, method: options.method });
    return { ok: true, status: 200, json: async () => [] };
  };
  return run(calls).finally(() => {
    global.fetch = originalFetch;
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_ANON_KEY = originalKey;
  });
}

test('on_conflict upserts request merge-duplicates so pre-created rows are updated, not 409d', async () => {
  await withMockedFetch(async (calls) => {
    await supabaseRest('learner_state?on_conflict=user_id', { accessToken: 't', method: 'POST', body: {} });
    await supabaseRest('review_items?on_conflict=user_id,skill_id', { accessToken: 't', method: 'POST', body: {} });
    await supabaseRest('placement_results?on_conflict=user_id', { accessToken: 't', method: 'POST', body: {} });
    for (const call of calls) {
      assert.match(call.prefer, /resolution=merge-duplicates/, `${call.url} must upsert`);
    }
  });
});

test('plain inserts do not add merge-duplicates', async () => {
  await withMockedFetch(async (calls) => {
    await supabaseRest('attempts', { accessToken: 't', method: 'POST', body: {} });
    assert.doesNotMatch(calls[0].prefer, /merge-duplicates/);
    assert.match(calls[0].prefer, /return=representation/);
  });
});
