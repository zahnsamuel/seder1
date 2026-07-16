import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const router=JSON.parse(await readFile(new URL('../data/repair-router.json',import.meta.url),'utf8'));
test('daily router covers six repair categories and protects the placement-first entry',async()=>{const [js,whyNext,placement]=await Promise.all(['daily-router.js','why-next.js','placement.html'].map((file)=>readFile(new URL(`../${file}`,import.meta.url),'utf8')));assert.equal(router.categories.length,6);assert.ok(router.categories.every(x=>x.skills.length&&x.url));assert.match(js,/const needsPlacement = !learner\.placement/);assert.match(js,/needsPlacement\) recommendation = \{ title: 'Find your starting point', url: 'placement\.html'/);assert.match(js,/querySelector\('#mastery-status'\)\.hidden = true/);assert.match(js,/querySelector\('#cross-canon'\)\.hidden = true/);assert.match(js,/Answer twelve short source questions/);assert.match(whyNext,/if \(!learner\?\.placement\) return/);assert.match(placement,/12 SHORT CHECKS/);assert.match(placement,/CHECK 1 OF 12/);assert.match(js,/Resume \$\{active\.course\.title\}/);assert.match(js,/canon-capstone\.html\?course/);});

test('daily Gemara rotation uses canonical source workbenches, not the retired dashboard', async () => {
  const source = await readFile(new URL('../daily-router.js', import.meta.url), 'utf8');
  for (const tractate of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma', 'ketubot', 'chullin', 'niddah']) {
    const key = tractate.includes('-') ? `'${tractate}'` : tractate;
    assert.ok(source.includes(`${key}: 'flagship-daf-workbench.html?tractate=${tractate}'`));
  }
  assert.match(source, /berakhot: 'daf-workbench\.html\?tractate=berakhot'/);
  assert.match(source, /recommendation\.url = gemaraWorkbenchUrl\[tractate\]/);
});

test('daily learning and the server recommendation agree on the current Foundation Year term', async () => {
  const [router, server, foundationYear] = await Promise.all([
    readFile(new URL('../daily-router.js', import.meta.url), 'utf8'),
    readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../foundation-year.js', import.meta.url), 'utf8')
  ]);
  for (const stage of ['foundation-capstone', 'term-two-capstone', 'second-foundation-synthesis']) {
    assert.match(router, new RegExp(stage));
    assert.match(server, new RegExp(stage));
    assert.match(foundationYear, new RegExp(stage));
  }
  assert.match(router, /foundationTerm = foundationTerms\.find/);
  assert.match(router, /recommendation = foundationTerm/);
  assert.match(server, /function foundationRecommendation/);
  assert.match(server, /kind: 'foundation-term'/);
});

test('daily learning and the server recommendation advance through Gemara Year one tractate at a time', async () => {
  const [router, server, year] = await Promise.all([
    readFile(new URL('../daily-router.js', import.meta.url), 'utf8'),
    readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../gemara-year.js', import.meta.url), 'utf8')
  ]);
  for (const stage of ['shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint', 'bava-metzia-tractate-arc', 'bava-kamma-tractate-arc', 'ketubot-tractate-arc', 'sanhedrin-tractate-arc', 'civil-reasoning-checkpoint', 'chullin-tractate-arc', 'niddah-tractate-arc', 'gemara-year-synthesis']) {
    assert.match(router, new RegExp(stage));
    assert.match(server, new RegExp(stage));
    assert.match(year, new RegExp(stage));
  }
  assert.match(router, /function nextGemaraYearMove/);
  assert.match(router, /gemaraYearMove = foundationTerm \? null : nextGemaraYearMove/);
  assert.match(server, /function gemaraYearRecommendation/);
  assert.match(server, /kind: 'gemara-year-term'/);
});

test('daily learning opens the earned Moed Expansion only after Gemara Year', async () => {
  const [router, server, expansion] = await Promise.all([
    readFile(new URL('../daily-router.js', import.meta.url), 'utf8'),
    readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../moed-expansion.js', import.meta.url), 'utf8')
  ]);
  for (const stage of ['rosh-hashanah-tractate-arc', 'megillah-tractate-arc', 'taanit-tractate-arc', 'moed-expansion-synthesis']) {
    assert.match(router, new RegExp(stage));
    assert.match(server, new RegExp(stage));
    assert.match(expansion, new RegExp(stage));
  }
  assert.match(router, /function nextMoedExpansionMove/);
  assert.match(router, /gemaraYearComplete = gemaraYearTerms\.every/);
  assert.match(router, /foundationTerm \|\| gemaraYearMove \|\| moedExpansionMove/);
  assert.match(server, /function moedExpansionRecommendation/);
  assert.match(server, /kind: 'moed-expansion'/);
});
