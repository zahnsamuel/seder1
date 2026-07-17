import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Megillah’s opening schedule checks use substantive near-miss alternatives', async () => {
  const source = await readFile(new URL('../megillah-arc.js', import.meta.url), 'utf8');
  assert.match(source, /const megillahSteps=window\.SederCourse\.steps/);
  assert.match(source, /schedule, category, and explanation/);
});
