import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Horayot offers an authority, reliance, and repair source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['horayot-arc.js','horayot-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['horayot-court-error','horayot-authority','horayot-communal-reliance','horayot-correction','horayot-historical-boundary','horayot-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Horayot 1:1/); assert.match(arc,/Horayot 2a/); assert.match(page,/not a present-day legal ruling/i);
  assert.match(engine,/'horayot-tractate-arc':\{tractate:'horayot'/);
  const tractate=JSON.parse(tractatesFile).tractates.find(item=>item.title==='Horayot');
  assert.equal(tractate.stage,'tractate-arc'); assert.equal(tractate.arcUrl,'horayot-arc.html');
});
