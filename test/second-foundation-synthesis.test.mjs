import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Foundation Synthesis retrieves four tractate habits and returns to the Gemara spine', async () => {
  const [html, source, niddahTransfer] = await Promise.all([
    readFile(new URL('../second-foundation-synthesis.html', import.meta.url), 'utf8'),
    readFile(new URL('../second-foundation-synthesis.js', import.meta.url), 'utf8'),
    readFile(new URL('../niddah-transfer.html', import.meta.url), 'utf8')
  ]);
  for (const citation of ['Mishnah Ketubot 1:1', 'Mishnah Chullin 1:1', 'Mishnah Niddah 1:1', 'Mishnah Sanhedrin 1:1', 'Pirkei Avot 1:6']) assert.match(source, new RegExp(citation));
  assert.match(html, /STUDY BOUNDARY/);
  assert.match(source, /sort\(\(\) => Math\.random\(\) - 0\.5\)/);
  assert.match(source, /stageId: 'second-foundation-synthesis'/);
  assert.match(source, /gemara-continuation\.html/);
  assert.match(niddahTransfer, /second-foundation-synthesis\.html/);
});
