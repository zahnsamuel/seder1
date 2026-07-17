import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Ketubot’s opening schedule questions use substantive institutional near-misses', async () => {
  const source = await readFile(new URL('../ketubot-arc.js', import.meta.url), 'utf8');
  assert.match(source, /const ketubotSteps=window\.SederCourse\.steps/);
  assert.match(source, /schedule-reading errors/);
});
