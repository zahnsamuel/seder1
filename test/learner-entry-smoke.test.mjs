import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const pages = [
  'seder.html',
  'diagnostic.html',
  'daily.html',
  'daily-router.html',
  'path.html',
  'gemara-year.html',
  'berakhot-arc.html',
  'daf-workbench.html',
  'flagship-daf-workbench.html'
];

test('learner entry and first Gemara surfaces remain present', async () => {
  await Promise.all(pages.map((page) => access(new URL(`../${page}`, import.meta.url))));
  const [daily, path, flagship] = await Promise.all([
    readFile(new URL('../daily.html', import.meta.url), 'utf8'),
    readFile(new URL('../path.html', import.meta.url), 'utf8'),
    readFile(new URL('../flagship-daf-workbench.html', import.meta.url), 'utf8')
  ]);
  assert.match(daily, /daily-router\.html/);
  assert.match(path, /berakhot-deep\.html|diagnostic\.html|daily-router\.html/);
  assert.match(flagship, /id="lines"|id='lines'/);
});
