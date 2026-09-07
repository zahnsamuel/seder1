import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getHostedLearner, recordHostedEvent } from '../data/supabase-learner-repository.mjs';
import { decayingSkills } from '../data/repository.mjs';

// Stateful PostgREST stand-in: GET after PUT returns the row we wrote.
// Proves hosted masteryUpdatedAt actually round-trips (the empty-array mocks
// used elsewhere cannot). No live Supabase project required.
function withStatefulSupabase(run) {
  const originalFetch = global.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_URL = 'https://project.test';
  process.env.SUPABASE_ANON_KEY = 'anon-key';

  const store = {
    learner_state: new Map(),
    review_items: [],
    placement_results: new Map()
  };

  const eq = (params, key) => (params.get(key) || '').replace(/^eq\./, '');
  const tableOf = (url) => new URL(String(url)).pathname.replace(/^\/rest\/v1\//, '');
  const json = (data, status = 200) => ({ ok: true, status, json: async () => data });

  global.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    const table = tableOf(url);
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;
    const userId = eq(parsed.searchParams, 'user_id') || eq(parsed.searchParams, 'id') || body?.user_id;

    if (table === 'learner_state') {
      if (method === 'GET') return json(store.learner_state.has(userId) ? [store.learner_state.get(userId)] : []);
      if (method === 'POST') {
        const prev = store.learner_state.get(body.user_id) || {};
        const merged = { ...prev, ...body };
        store.learner_state.set(body.user_id, merged);
        return json([merged]);
      }
    }
    if (table === 'review_items') {
      if (method === 'GET') return json(store.review_items.filter((row) => row.user_id === userId));
      if (method === 'POST') {
        store.review_items = store.review_items.filter((row) => !(row.user_id === body.user_id && row.skill_id === body.skill_id));
        store.review_items.push(body);
        return json([body]);
      }
      if (method === 'DELETE') {
        const skillId = eq(parsed.searchParams, 'skill_id');
        store.review_items = store.review_items.filter((row) => !(row.user_id === userId && row.skill_id === skillId));
        return { ok: true, status: 204, json: async () => null };
      }
    }
    if (table === 'placement_results') {
      if (method === 'GET') return json(store.placement_results.has(userId) ? [store.placement_results.get(userId)] : []);
      if (method === 'POST') {
        store.placement_results.set(body.user_id, body);
        return json([body]);
      }
    }
    if (table === 'profiles' || table === 'attempts') return json([]);
    return json([]);
  };

  return run(store).finally(() => {
    global.fetch = originalFetch;
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_ANON_KEY = originalKey;
  });
}

describe('hosted masteryUpdatedAt round-trip', () => {
  test('recordHostedEvent writes mastery_updated_at and getHostedLearner reads it back with decayedMastery', async () => {
    await withStatefulSupabase(async (store) => {
      const user = { id: 'hosted-learner-1' };
      const updated = await recordHostedEvent(user, 'token', {
        type: 'answer_submitted', skillId: 'fnd-decode-letters', competency: 'recognition', correct: true
      });

      const row = store.learner_state.get(user.id);
      assert.ok(row, 'learner_state row was upserted');
      assert.ok(row.mastery_updated_at['fnd-decode-letters'], 'upsert body persisted mastery_updated_at');
      assert.equal(row.mastery_updated_at['fnd-decode-letters'], updated.masteryUpdatedAt['fnd-decode-letters']);

      const reread = await getHostedLearner(user, 'token');
      assert.equal(reread.masteryUpdatedAt['fnd-decode-letters'], row.mastery_updated_at['fnd-decode-letters']);
      assert.ok(reread.decayedMastery['fnd-decode-letters'] > 0, 'hosted read attaches decayedMastery so review surfaces can use it');
      assert.equal(reread.decayedMastery['fnd-decode-letters'], reread.mastery['fnd-decode-letters'], 'a just-practiced skill is still fresh');
    });
  });

  test('a persisted stale timestamp makes decayingSkills flag the hosted learner', async () => {
    await withStatefulSupabase(async (store) => {
      const user = { id: 'hosted-learner-2' };
      let current = { id: user.id };
      for (let i = 0; i < 3; i++) {
        current = await recordHostedEvent(user, 'token', {
          type: 'answer_submitted', skillId: 'skill-decay', competency: 'recognition', correct: true
        });
      }
      assert.ok(current.mastery['skill-decay'] >= 0.67);
      assert.equal(decayingSkills(current).length, 0, 'fresh hosted practice is not decaying');

      const row = store.learner_state.get(user.id);
      row.mastery_updated_at['skill-decay'] = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

      const reloaded = await getHostedLearner(user, 'token');
      assert.equal(reloaded.masteryUpdatedAt['skill-decay'], row.mastery_updated_at['skill-decay']);
      assert.ok(reloaded.decayedMastery['skill-decay'] < reloaded.mastery['skill-decay']);
      const faded = decayingSkills(reloaded);
      assert.equal(faded.length, 1);
      assert.equal(faded[0].skillId, 'skill-decay');
      assert.equal(faded[0].freshness, 'faded');
    });
  });

  test('hosted placement stamps masteryUpdatedAt without changing scores or recommendedSkill', async () => {
    await withStatefulSupabase(async () => {
      const user = { id: 'hosted-learner-3' };
      const scores = { 'hebrew-decoding': 1, 'gemara-moves': 0.4 };
      const updated = await recordHostedEvent(user, 'token', {
        type: 'placement_completed',
        scores,
        recommendedSkill: 'fnd-decode-letters'
      });

      assert.equal(updated.mastery['hebrew-decoding'], 1);
      assert.equal(updated.mastery['gemara-moves'], 0.4);
      assert.ok(updated.masteryUpdatedAt['hebrew-decoding']);
      assert.ok(updated.masteryUpdatedAt['gemara-moves']);
      assert.deepEqual(updated.placement.scores, scores);

      const reread = await getHostedLearner(user, 'token');
      assert.equal(reread.masteryUpdatedAt['hebrew-decoding'], updated.masteryUpdatedAt['hebrew-decoding']);
      assert.equal(reread.mastery['hebrew-decoding'], 1);
      assert.equal(reread.mastery['gemara-moves'], 0.4);
    });
  });
});
