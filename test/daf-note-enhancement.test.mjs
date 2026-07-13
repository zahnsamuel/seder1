import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Daf workbench adds a line-specific private note after a learner focuses a line', async () => {
  const source = await readFile('seder-auth.js', 'utf8');
  assert.match(source, /enhanceDafWorkbench/);
  assert.match(source, /Private note on this line/);
  assert.match(source, /note_saved/);
});
