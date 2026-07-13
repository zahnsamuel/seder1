import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const arcs = ['shabbat-arc.js', 'pesachim-arc.js', 'eruvin-arc.js', 'sukkah-arc.js', 'bava-metzia-arc.js', 'bava-kamma-arc.js', 'yoma-arc.js'];

test('every front-door Gemara arc ends with typed source production', async () => {
  for (const file of arcs) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /typed:true/, `${file} needs a typed production check`);
    assert.match(source, /acceptable:\[/, `${file} needs fair accepted production answers`);
    assert.match(source, /PRODUCTION CHECK/, `${file} must name the production step to learners`);
  }
});
