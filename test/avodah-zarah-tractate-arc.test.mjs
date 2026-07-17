import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Avodah Zarah offers a historically careful boundary source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['avodah-zarah-arc.js','avodah-zarah-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['avodah-zarah-time-boundary','avodah-zarah-commercial-category','avodah-zarah-contextual-concern','avodah-zarah-responsible-boundary','avodah-zarah-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Avodah Zarah 1:1/); assert.match(arc,/Avodah Zarah 2a/); assert.match(page,/not guidance for judging present-day people/i);
  assert.match(engine,/'avodah-zarah-tractate-arc':\{tractate:'avodah-zarah'/);
  const tractate=JSON.parse(tractatesFile).tractates.find(item=>item.title==='Avodah Zarah');
  assert.equal(tractate.stage,'tractate-arc'); assert.equal(tractate.arcUrl,'avodah-zarah-arc.html');
});
