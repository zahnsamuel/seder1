import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('practice and Daf interactions present a next move after learner feedback', async () => {
  const lab = await readFile(new URL('../canon-practice-lab.js', import.meta.url), 'utf8');
  const daf = await readFile(new URL('../daf-completion.js', import.meta.url), 'utf8');
  const dafHtml = await readFile(new URL('../daf-workbench.html', import.meta.url), 'utf8');
  assert.match(lab, /Try this reading again/);
  assert.match(lab, /Continue to mastery map/);
  assert.match(daf, /Reading recorded/);
  assert.match(daf, /Continue this tractate/);
  assert.match(dafHtml, /daf-completion\.js/);
});
