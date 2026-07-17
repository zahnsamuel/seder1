import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../data/gemara-tractates.json', import.meta.url), 'utf8'));

test('every current tractate arc resolves through one canonical visible-source registry', async () => {
  const source = await readFile(new URL('../course-engine.js', import.meta.url), 'utf8');
  const routes = {
    'berakhot-baraita-disagreement':'daf-workbench.html?tractate=berakhot',
    'shabbat-tractate-arc':'flagship-daf-workbench.html?tractate=shabbat',
    'eruvin-tractate-arc':'flagship-daf-workbench.html?tractate=eruvin',
    'pesachim-tractate-arc':'flagship-daf-workbench.html?tractate=pesachim',
    'sukkah-tractate-arc':'flagship-daf-workbench.html?tractate=sukkah',
    'bava-metzia-tractate-arc':'flagship-daf-workbench.html?tractate=bava-metzia',
    'bava-kamma-tractate-arc':'flagship-daf-workbench.html?tractate=bava-kamma',
    'ketubot-tractate-arc':'flagship-daf-workbench.html?tractate=ketubot',
    'chullin-tractate-arc':'flagship-daf-workbench.html?tractate=chullin',
    'niddah-tractate-arc':'flagship-daf-workbench.html?tractate=niddah',
    'yoma-tractate-arc':'yoma-daf-workbench.html'
  };
  assert.match(source, /const masteryRouteByStage=/);
  assert.match(source, /const masteryRoute=masteryRouteByStage\[config\.stage\]/);
  assert.doesNotMatch(source, /const masteryLoopByStage/);
  assert.doesNotMatch(source, /const earnedBlockHandoffByStage/);
  for (const [stage, url] of Object.entries(routes)) {
    assert.match(source, new RegExp(`'${stage}':\\{[^}]*url:'${url.replace(/[.?]/g,'\\$&')}'`));
  }
});

test('every post-entry tractate in the Shas catalog has a canonical mastery handoff', async () => {
  const source = await readFile(new URL('../course-engine.js', import.meta.url), 'utf8');
  const arcs = catalog.tractates.filter((tractate) => tractate.stage === 'tractate-arc');
  assert.equal(arcs.length, 36);
  for (const tractate of arcs) {
    const stage = `${tractate.labId}-tractate-arc`;
    const pattern = new RegExp(`'${stage}':\\{tractate:'${tractate.labId}',url:'([^']+)'`);
    const match = source.match(pattern);
    assert.ok(match, `missing canonical route for ${tractate.title}`);
    assert.match(match[1], /(?:flagship-daf-workbench|daf-workbench|yoma-daf-workbench|rosh-hashanah-daf-workbench|megillah-daf-workbench|taanit-daf-workbench|makkot-daf-workbench|shevuot-daf-workbench|lab)\.html/);
    await access(new URL(`../${match[1].split('?')[0]}`, import.meta.url));
  }
});
