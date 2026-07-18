import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('tractate-mastery.js', 'utf8');

test('flagship tractate mastery loops use the shared Daf workbench', () => {
  for (const tractate of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma', 'ketubot', 'chullin', 'niddah']) {
    assert.match(source, new RegExp(`daf: 'flagship-daf-workbench\\.html\\?tractate=${tractate}'`));
  }
  assert.doesNotMatch(source, /daf: 'daf-workbench\.html\?tractate=(ketubot|chullin|niddah)'/);
});
