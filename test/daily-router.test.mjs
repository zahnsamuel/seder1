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
