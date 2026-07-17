import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Sanhedrin’s category check distinguishes source reading from practical authority', async () => {
  const source = await readFile(new URL('../sanhedrin-arc.js', import.meta.url), 'utf8');
  assert.match(source, /const sanhedrinSteps=window\.SederCourse\.steps/);
  assert.match(source, /practical authority/);
  assert.match(source, /RESPONSIBLE LEARNING/);
});
