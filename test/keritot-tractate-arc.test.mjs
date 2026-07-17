import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Keritot offers an inadvertent-liability and atonement source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['keritot-arc.js','keritot-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['keritot-liability-category','keritot-counted-field','keritot-knowledge-intent','keritot-liability-atonement','keritot-proof-source','keritot-scope-conditions','keritot-learning-boundary','keritot-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Keritot 1:1/); assert.match(arc,/Keritot 2a/); assert.match(page,/not practical ritual guidance/i);
  assert.match(engine,/'keritot-tractate-arc':\{tractate:'keritot'/);
  const keritot=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Keritot');
  assert.equal(keritot.stage,'tractate-arc'); assert.equal(keritot.arcUrl,'keritot-arc.html');
});
