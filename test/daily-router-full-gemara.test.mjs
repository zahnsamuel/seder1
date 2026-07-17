import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile('data/gemara-tractates.json', 'utf8'));

test('daily router carries Gemara Year into every full-catalog arc', async () => {
  const script = await readFile('daily-router.js', 'utf8');
  for (const stage of ['rosh-hashanah-tractate-arc', 'megillah-tractate-arc', 'taanit-tractate-arc', 'chagigah-tractate-arc', 'beitzah-tractate-arc', 'bava-batra-tractate-arc', 'makkot-tractate-arc', 'shevuot-tractate-arc', 'zevachim-tractate-arc', 'menachot-tractate-arc', 'bekhorot-tractate-arc', 'arakhin-tractate-arc', 'temurah-tractate-arc', 'keritot-tractate-arc', 'meilah-tractate-arc', 'tamid-tractate-arc', 'avodah-zarah-tractate-arc', 'horayot-tractate-arc', 'yevamot-tractate-arc', 'sotah-tractate-arc', 'gittin-tractate-arc', 'kiddushin-tractate-arc']) assert.match(script, new RegExp(stage));
});

test('daily Gemara continuation names every post-entry tractate', async () => {
  const script = await readFile('daily-router.js', 'utf8');
  const arcs = catalog.tractates.filter((tractate) => tractate.stage === 'tractate-arc');
  assert.equal(arcs.length, 36);
  for (const tractate of arcs) {
    assert.match(script, new RegExp(`${tractate.labId}-tractate-arc`), `daily route missing ${tractate.title}`);
  }
});
