import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('daily router carries Gemara Year into every full-catalog arc', async () => {
  const script = await readFile('daily-router.js', 'utf8');
  for (const stage of ['rosh-hashanah-tractate-arc', 'megillah-tractate-arc', 'taanit-tractate-arc', 'chagigah-tractate-arc', 'beitzah-tractate-arc', 'bava-batra-tractate-arc', 'makkot-tractate-arc', 'shevuot-tractate-arc', 'zevachim-tractate-arc', 'menachot-tractate-arc', 'bekhorot-tractate-arc', 'arakhin-tractate-arc', 'temurah-tractate-arc', 'keritot-tractate-arc', 'meilah-tractate-arc', 'tamid-tractate-arc', 'avodah-zarah-tractate-arc', 'horayot-tractate-arc', 'yevamot-tractate-arc', 'sotah-tractate-arc', 'gittin-tractate-arc', 'kiddushin-tractate-arc']) assert.match(script, new RegExp(stage));
});
