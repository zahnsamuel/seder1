import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Eruvin Block 3 gives learners an earned loop from source trail through Pesachim', async () => {
  const [page, source, engine] = await Promise.all([
    readFile(new URL('../eruvin-mastery.html', import.meta.url), 'utf8'),
    readFile(new URL('../eruvin-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8')
  ]);
  assert.match(page, /ERUVIN · FOUNDATION BLOCK 3/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 6);
  for (const route of ['eruvin-arc.html', 'flagship-daf-workbench.html?tractate=eruvin', 'lab.html?tractate=eruvin', 'gemara-unseen-check.html?block=eruvin', 'canon-connection.html?tractate=eruvin', 'pesachim-arc.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /eruvin-unseen-transfer/);
  assert.match(engine, /'eruvin-tractate-arc':\['eruvin-mastery\.html'/);
});
