import test from 'node:test';
import assert from 'node:assert/strict';
import { foundationRecommendation, gemaraYearRecommendation, moedExpansionRecommendation } from '../data/term-recommendations.mjs';
import { nextGemaraArc } from '../data/curriculum-engine.mjs';
import { explainRecommendation } from '../data/recommendation-why.mjs';

const allGemaraYear = ['shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint', 'bava-metzia-tractate-arc', 'bava-kamma-tractate-arc', 'ketubot-tractate-arc', 'sanhedrin-tractate-arc', 'civil-reasoning-checkpoint', 'chullin-tractate-arc', 'niddah-tractate-arc', 'moed-katan-tractate-arc', 'nedarim-tractate-arc', 'nazir-tractate-arc', 'gemara-year-synthesis'];

test('foundation terms name the specific capstone they build on', () => {
  assert.equal(foundationRecommendation({ completedStages: [] }).builtOn, null);
  assert.equal(foundationRecommendation({ completedStages: ['foundation-capstone'] }).builtOn, 'the Foundation Year Term I capstone');
  assert.equal(foundationRecommendation({ completedStages: ['foundation-capstone', 'term-two-capstone'] }).builtOn, 'the Foundation Year Term II capstone');
  assert.equal(foundationRecommendation({ completedStages: ['foundation-capstone', 'term-two-capstone', 'second-foundation-synthesis'] }), null);
});

test('gemara-year steps name the prior step — including its checkpoints', () => {
  assert.equal(gemaraYearRecommendation({ completedStages: [] }).builtOn, 'your Foundation Year');
  assert.equal(gemaraYearRecommendation({ completedStages: ['shabbat-tractate-arc'] }).builtOn, 'Shabbat: map a legal case');
  // After clearing Term I's checkpoint, the next step names that checkpoint specifically.
  const afterCheckpoint = gemaraYearRecommendation({ completedStages: ['shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint'] });
  assert.equal(afterCheckpoint.builtOn, 'Gemara Foundations checkpoint');
  assert.match(afterCheckpoint.title, /Bava Metzia/);
});

test('moed expansion only fires once the whole Gemara Year is done, and names the prior chapter', () => {
  assert.equal(moedExpansionRecommendation({ completedStages: [] }), null);
  const first = moedExpansionRecommendation({ completedStages: allGemaraYear });
  assert.ok(first, 'fires when the Gemara Year is complete');
  assert.ok(first.builtOn, 'names a specific prior milestone');
});

test('the explanation surfaces the named checkpoint verbatim', () => {
  const rec = { kind: 'foundation-term', ...foundationRecommendation({ completedStages: ['foundation-capstone'] }) };
  const why = explainRecommendation(rec);
  assert.equal(why.basis, 'term-progression');
  assert.equal(why.because, 'you’ve completed the Foundation Year Term I capstone');
});

test('gemara arc steps name the prior arc move', async () => {
  const root = process.cwd();
  assert.equal((await nextGemaraArc(root, { completedStages: [] })).builtOn, null);
  const second = await nextGemaraArc(root, { completedStages: ['berakhot-baraita-disagreement'] });
  assert.equal(second.builtOn, 'Deepen Berakhot: cited teachings and disagreement');
  assert.equal(explainRecommendation({ kind: 'gemara-arc', ...second }).because, 'you’ve completed Deepen Berakhot: cited teachings and disagreement');
});

test('server.mjs imports the extracted term recommenders (no local duplicate)', async () => {
  const fs = await import('node:fs');
  const server = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /from '\.\/data\/term-recommendations\.mjs'/);
  assert.doesNotMatch(server, /^function foundationRecommendation/m);
});
