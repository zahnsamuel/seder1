import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Shabbat Block 2 gives learners an earned loop from source trail through Eruvin', async () => {
  const [page, source, engine] = await Promise.all([
    readFile(new URL('../shabbat-mastery.html', import.meta.url), 'utf8'),
    readFile(new URL('../shabbat-mastery.js', import.meta.url), 'utf8'),
    readFile(new URL('../course-engine.js', import.meta.url), 'utf8')
  ]);
  assert.match(page, /SHABBAT · FOUNDATION BLOCK 2/);
  assert.equal((source.match(/title: '\d+ ·/g) || []).length, 6);
  for (const route of ['shabbat-arc.html', 'flagship-daf-workbench.html?tractate=shabbat', 'lab.html?tractate=shabbat', 'gemara-unseen-check.html?block=shabbat', 'canon-connection.html?tractate=shabbat', 'eruvin-arc.html']) assert.match(source, new RegExp(route.replace(/[.?]/g, '\\$&')));
  assert.match(source, /shabbat-unseen-transfer/);
  assert.match(source, /YOUR NEXT MOVE/);
  assert.match(engine, /'shabbat-tractate-arc':'shabbat-mastery\.html'/);
});
