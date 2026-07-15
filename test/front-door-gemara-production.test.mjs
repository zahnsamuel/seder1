import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const arcs = ['shabbat-arc.js', 'pesachim-arc.js', 'eruvin-arc.js', 'sukkah-arc.js', 'bava-metzia-arc.js', 'bava-kamma-arc.js', 'yoma-arc.js'];

test('every front-door Gemara arc ends with a guided source check, not required typing', async () => {
  for (const file of arcs) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /typed:true/, `${file} must not require typing`);
    assert.match(source, /mode:'SOURCE CHECK'/, `${file} needs a source-grounded final check`);
    assert.match(source, /answers:\[/, `${file} needs guided answer choices`);
    assert.match(source, /correct:0/, `${file} must retain a stable correct answer before shared shuffling`);
  }
});
