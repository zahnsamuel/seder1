import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Gemara Year groups existing tractate arcs into earned terms and closes in synthesis', async () => {
  const [year, script, synthesis, gate, auth, foundation] = await Promise.all([
    readFile(new URL('../gemara-year.html', import.meta.url), 'utf8'),
    readFile(new URL('../gemara-year.js', import.meta.url), 'utf8'),
    readFile(new URL('../gemara-year-synthesis.js', import.meta.url), 'utf8'),
    readFile(new URL('../civil-reasoning-year-gate.js', import.meta.url), 'utf8'),
    readFile(new URL('../seder-auth.js', import.meta.url), 'utf8'),
    readFile(new URL('../foundation-year.js', import.meta.url), 'utf8')
  ]);
  for (const stage of ['shabbat-tractate-arc', 'eruvin-tractate-arc', 'pesachim-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc', 'gemara-foundations-checkpoint', 'bava-metzia-tractate-arc', 'bava-kamma-tractate-arc', 'ketubot-tractate-arc', 'sanhedrin-tractate-arc', 'civil-reasoning-checkpoint', 'chullin-tractate-arc', 'niddah-tractate-arc', 'gemara-year-synthesis']) assert.match(script, new RegExp(stage));
  assert.match(year, /STUDY BOUNDARY/);
  assert.match(synthesis, /sort\(\(\) => Math\.random\(\) - \.5\)/);
  assert.match(synthesis, /stageId: 'gemara-year-synthesis'/);
  assert.match(gate, /stageId: 'civil-reasoning-checkpoint'/);
  assert.match(auth, /civil-reasoning-year-gate\.js/);
  assert.match(foundation, /gemara-year\.html/);
});
