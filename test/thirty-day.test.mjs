import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('30-day journey and notebook are present for pilot learners', async () => {
  const journey = await readFile(new URL('../thirty-day.js', import.meta.url), 'utf8');
  const notebook = await readFile(new URL('../notebook.js', import.meta.url), 'utf8');
  assert.match(journey, /length:30/);
  assert.match(notebook, /note_saved/);
});
