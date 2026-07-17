import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Chullin’s opening rule checks use substantive scope-and-exception near-misses', async () => {
  const source = await readFile(new URL('../chullin-arc.js', import.meta.url), 'utf8');
  assert.match(source, /const chullinSteps=window\.SederCourse\.steps/);
  assert.match(source, /scope and qualification/);
});
