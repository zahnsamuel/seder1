import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Temurah offers a substitution-and-consequence source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['temurah-arc.js','temurah-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['temurah-substitution-case','temurah-prohibited-act','temurah-act-effect-distinction','temurah-proof-source','temurah-learning-boundary','temurah-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Temurah 1:1/); assert.match(arc,/Temurah 2a/); assert.match(page,/not practical ritual guidance/i);
  assert.match(engine,/'temurah-tractate-arc':\{tractate:'temurah'/);
  const temurah=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Temurah');
  assert.equal(temurah.stage,'tractate-arc'); assert.equal(temurah.arcUrl,'temurah-arc.html');
});
