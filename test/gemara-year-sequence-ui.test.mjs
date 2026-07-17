import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Gemara Year exposes the complete sequence without overwhelming the front door', async () => {
  const [page, script] = await Promise.all([
    readFile('gemara-year.html', 'utf8'),
    readFile('gemara-year.js', 'utf8')
  ]);
  assert.match(page, /FULL TRACTATE SEQUENCE/);
  assert.match(page, /id="full-sequence"/);
  assert.match(page, /Show all tractate moves/);
  assert.match(script, /advanced-gemara-sequence\.json/);
  assert.match(script, /renderFullSequence/);
  assert.match(script, /sequence-\$\{state\}/);
});
