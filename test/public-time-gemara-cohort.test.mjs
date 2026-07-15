import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('public-time Gemara cohort supplies full source mastery loops', async () => {
  const [source, dashboard, connections] = await Promise.all(['cohort-source-mastery.js', 'gemara-mastery.js', 'canon-connection.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const tractate of ['roshHashanah', 'taanit', 'megillah']) {
    assert.match(source, new RegExp(`${tractate}:`));
    assert.match(dashboard, new RegExp(`id:'${tractate}'`));
    assert.match(connections, new RegExp(`${tractate}:`));
  }
  for (const reference of ['Mishnah_Rosh_Hashanah.2.1', 'Mishnah_Taanit.1.1', 'Mishnah_Megillah.1.1', 'Deuteronomy.17.4', 'Deuteronomy.11.14', 'Esther.9.28']) assert.match(`${source}\n${connections}`, new RegExp(reference));
  for (const marker of ['second_source_explanation', 'transfer_explanation', 'retrieval_scheduled', 'sort(()=>Math.random()-.5)']) assert.match(source, new RegExp(marker.replace(/[()]/g, '\\$&')));
});
