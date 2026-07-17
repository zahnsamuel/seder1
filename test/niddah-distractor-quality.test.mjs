import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Niddah’s opening dispute keeps its careful study-only framing and substantive alternatives', async () => {
  const source = await readFile(new URL('../niddah-arc.js', import.meta.url), 'utf8');
  assert.match(source, /const niddahSteps=window\.SederCourse\.steps/);
  assert.match(source, /careful distinction among positions/);
  assert.match(source, /RESPONSIBLE LEARNING/);
});
