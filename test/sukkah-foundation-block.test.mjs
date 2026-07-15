import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Sukkah Block 7 earns a cross-canon bridge before Bava Kamma', async () => {
  const [page, source, bridge, engine] = await Promise.all([
    readFile(new URL('../sukkah-mastery.html', import.meta.url), 'utf8'),
    readFile(new URL('../sukkah-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../sukkah-canon-bridge.html', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8')
  ]);
  assert.match(page, /SUKKAH · FOUNDATION BLOCK 7/);
  assert.match(page, /does not determine practical Sukkot observance/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 6);
  for (const route of ['sukkah-arc.html', 'flagship-daf-workbench.html?tractate=sukkah', 'lab.html?tractate=sukkah', 'gemara-unseen-check.html?block=sukkah', 'canon-connection.html?tractate=sukkah', 'sukkah-canon-bridge.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  for (const route of ['source-reader.html?collection=covenant', 'chassidus-simcha.html', 'bava-kamma-arc.html']) assert.match(bridge, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /sukkah-unseen-transfer/);
  assert.match(engine, /'sukkah-tractate-arc':\['sukkah-mastery\.html'/);
});
