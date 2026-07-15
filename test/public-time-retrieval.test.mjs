import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('public-time cohort retrieval uses tractate-specific variants and returns to mastery', async () => {
  const source = await readFile(new URL('../review.js', import.meta.url), 'utf8');
  for (const skill of ['roshHashanah-independent-map', 'taanit-independent-map', 'megillah-independent-map']) {
    assert.match(source, new RegExp(`'${skill}'`));
    assert.match(source, new RegExp(`'${skill}':'gemara-mastery\\.html'`));
  }
  for (const marker of ['PUBLIC EVIDENCE', 'DISAGREEMENT MAP', 'COMMUNAL MAP', 'TRANSFER', 'returnTargets']) assert.match(source, new RegExp(marker));
  assert.match(source, /sort\(\(\) => Math\.random\(\) - \.5\)/);
});
