import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sourceReviewItems } from '../data/curriculum-engine.mjs';
import { resolveFoundationSkillId } from '../data/next-action.mjs';

const graph = JSON.parse(readFileSync(new URL('../data/foundation-skill-graph.json', import.meta.url), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../data/foundation-content-map.json', import.meta.url), 'utf8'));

test('review fallback cites a mapped fnd- item, else a subject retrieval', async () => {
  const skillIds = [
    'history-yavneh-memory-claim', 'tefillah-kaddish-language', 'chumash-akeidah-narrator',
    'widerworld-encounter-charter', 'mussar-anger-source', 'chassidus-simcha-source', 'thought-suffering-job'
  ];
  const items = await sourceReviewItems(resolve('.'), skillIds);
  const subjectLabel = {
    'mussar-anger-source': 'MUSSAR RETRIEVAL',
    'chassidus-simcha-source': 'CHASSIDUS RETRIEVAL',
    'thought-suffering-job': 'JEWISH THOUGHT RETRIEVAL'
  };
  assert.equal(items.length, skillIds.length);
  for (const [index, skillId] of skillIds.entries()) {
    const item = items[index];
    const mapped = resolveFoundationSkillId(graph, map, skillId);
    assert.notEqual(item.label, 'DAF RETRIEVAL');
    assert.ok(item.answers.length >= 3);
    if (mapped) {
      assert.equal(item.trueSkillId, mapped);
      assert.match(item.label, /^FOUNDATION · |^RETRIEVAL · /);
    } else {
      assert.equal(item.label, subjectLabel[skillId]);
      assert.equal(item.trueSkillId, skillId);
      assert.equal(item.correct, 0);
    }
  }
});

test('unknown skills still receive the existing Daf-reading fallback', async () => {
  const [item] = await sourceReviewItems(resolve('.'), ['unmapped-gemara-skill']);
  assert.equal(item.label, 'DAF RETRIEVAL');
});
