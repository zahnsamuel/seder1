import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('pilot entry includes learner feedback and Gemara lexicon is source-backed', async () => {
  const pilot = await readFile(new URL('../pilot.html', import.meta.url), 'utf8');
  const lexicon = await readFile(new URL('../gemara-lexicon.js', import.meta.url), 'utf8');
  assert.match(pilot, /pilot-feedback/);
  assert.match(lexicon, /source-glossary/);
});
