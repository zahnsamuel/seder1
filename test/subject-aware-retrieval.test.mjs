import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { sourceReviewItems } from '../data/curriculum-engine.mjs';

test('review fallback respects the learner’s non-Gemara subject', async () => {
  const items = await sourceReviewItems(resolve('.'), [
    'history-yavneh-memory-claim', 'tefillah-kaddish-language', 'chumash-akeidah-narrator',
    'widerworld-encounter-charter', 'mussar-anger-source', 'chassidus-simcha-source', 'thought-suffering-job'
  ]);
  assert.deepEqual(items.map((item) => item.label), [
    'HISTORY RETRIEVAL', 'TEFILLAH RETRIEVAL', 'CHUMASH RETRIEVAL', 'WIDER WORLD RETRIEVAL',
    'MUSSAR RETRIEVAL', 'CHASSIDUS RETRIEVAL', 'JEWISH THOUGHT RETRIEVAL'
  ]);
  assert.ok(items.every((item) => item.answers.length === 3 && item.correct === 0));
});

test('unknown skills still receive the existing Daf-reading fallback', async () => {
  const [item] = await sourceReviewItems(resolve('.'), ['unmapped-gemara-skill']);
  assert.equal(item.label, 'DAF RETRIEVAL');
});
