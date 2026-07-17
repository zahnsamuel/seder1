import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('advanced continuation resolves Term IV workspaces instead of rendering an undefined tractate', async () => {
  const [continuation, workbench] = await Promise.all([
    readFile(new URL('../gemara-continuation.js', import.meta.url), 'utf8'),
    readFile(new URL('../daf-workbench.js', import.meta.url), 'utf8')
  ]);
  for (const stage of ['moed-katan-tractate-arc', 'nedarim-tractate-arc', 'nazir-tractate-arc']) assert.match(continuation, new RegExp(stage));
  for (const route of ["'moed-katan':'lab.html?tractate=moed-katan'", "nedarim:'lab.html?tractate=nedarim'", "nazir:'lab.html?tractate=nazir'"]) assert.ok(workbench.includes(route));
  assert.match(workbench, /if\(canonicalWorkspaces\[active\]\) location\.replace\(canonicalWorkspaces\[active\]\)/);
});
