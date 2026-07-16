import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('Rosh Hashanah offers a source-grounded calendar arc and visible workspace', async () => {
  const [arc, page, workspace, workbench, tractates, engine] = await Promise.all([
    'rosh-hashanah-arc.js', 'rosh-hashanah-arc.html', 'rosh-hashanah-daf-workbench.js',
    'rosh-hashanah-daf-workbench.html', 'data/gemara-tractates.json', 'course-engine.js'
  ].map((file) => readFile(file, 'utf8')));
  for (const skill of ['rosh-hashanah-counted-field', 'rosh-hashanah-tree-dispute', 'rosh-hashanah-purpose-question', 'rosh-hashanah-record-function', 'rosh-hashanah-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Rosh Hashanah 2a/);
  assert.match(page, /not calendar, financial, or halakhic advice/i);
  assert.match(page, /course-engine\.js/);
  assert.match(workbench, /Rosh Hashanah 2a/);
  assert.match(workspace, /Gemara question/);
  assert.match(engine, /'rosh-hashanah-tractate-arc':\{tractate:'rosh-hashanah'/);
  const roshHashanah = JSON.parse(tractates).tractates.find((tractate) => tractate.title === 'Rosh Hashanah');
  assert.equal(roshHashanah.stage, 'tractate-arc');
  assert.equal(roshHashanah.arcUrl, 'rosh-hashanah-arc.html');
});
