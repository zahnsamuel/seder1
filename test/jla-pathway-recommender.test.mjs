import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { recommendJlaPathway } from '../jla-pathway-recommender.js';

const pathways = JSON.parse(
  await readFile(new URL('../data/jla-post-foundation-pathways.json', import.meta.url), 'utf8')
);

test('JLA defines seven distinct post-Foundation pathways with real routes', async () => {
  assert.deepEqual(
    pathways.map(({ id }) => id).sort(),
    [
      'chumash-tanakh-reader',
      'gemara-lab',
      'halakha-foundations',
      'jewish-history-canon',
      'jewish-life-calendar',
      'jewish-thought-inner-life',
      'tefillah-literacy'
    ]
  );
  for (const pathway of pathways) {
    assert.match(pathway.promise, /^[A-Z]/);
    assert.ok(pathway.domains.length >= 2);
    await access(new URL(`../${pathway.route}`, import.meta.url));
  }
});

test('Gemara is an available laboratory but not the default destiny', () => {
  const result = recommendJlaPathway({ pathways });
  assert.equal(result.recommended.id, 'jewish-life-calendar');
  assert.ok(result.alternatives.some(({ id }) => id === 'gemara-lab'));
  assert.equal(result.learnerChoiceRequired, true);
});

test('a learner who asks for Gemara receives Gemara Lab', () => {
  const result = recommendJlaPathway({ pathways, interests: ['gemara'] });
  assert.equal(result.recommended.id, 'gemara-lab');
  assert.match(result.recommended.recommendationReason, /interest in gemara/i);
});

test('recommendations can build from strength or target a growth domain', () => {
  const fromStrength = recommendJlaPathway({
    pathways,
    strongDomains: ['torah-tanakh-literacy']
  });
  assert.equal(fromStrength.recommended.id, 'chumash-tanakh-reader');

  const forGrowth = recommendJlaPathway({
    pathways,
    growthDomains: ['tefillah-siddur-literacy']
  });
  assert.equal(forGrowth.recommended.id, 'jewish-life-calendar');
});

test('post-Foundation recommendation refuses an empty catalog', () => {
  assert.throws(() => recommendJlaPathway(), /requires pathways/);
});
