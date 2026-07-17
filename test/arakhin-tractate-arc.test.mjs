import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Arakhin offers a valuation-and-measure source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['arakhin-arc.js','arakhin-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['arakhin-valuation-case','arakhin-fixed-measure','arakhin-proof-source','arakhin-learning-boundary','arakhin-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Arakhin 1:1/); assert.match(arc,/Arakhin 2a/); assert.match(page,/not current fundraising or practical legal guidance/i);
  assert.match(engine,/'arakhin-tractate-arc':\{tractate:'arakhin'/);
  const arakhin=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Arakhin');
  assert.equal(arakhin.stage,'tractate-arc'); assert.equal(arakhin.arcUrl,'arakhin-arc.html');
});
