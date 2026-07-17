import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Bekhorot offers a status-and-redemption source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['bekhorot-arc.js','bekhorot-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['bekhorot-status-case','bekhorot-status-redemption','bekhorot-learning-boundary','bekhorot-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Bekhorot 1:1/); assert.match(arc,/Bekhorot 2a/); assert.match(page,/not practical ritual guidance/i);
  assert.match(engine,/'bekhorot-tractate-arc':\{tractate:'bekhorot'/);
  const bekhorot=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Bekhorot');
  assert.equal(bekhorot.stage,'tractate-arc'); assert.equal(bekhorot.arcUrl,'bekhorot-arc.html');
});
