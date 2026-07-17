import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Meilah offers a misuse-and-restitution source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['meilah-arc.js','meilah-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['meilah-misuse-case','meilah-sanctity-validity','meilah-awareness-intent','meilah-proof-restitution','meilah-scope-conditions','meilah-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Meilah 1:1/); assert.match(arc,/Meilah 2a/); assert.match(page,/not practical ritual guidance/i);
  assert.match(engine,/'meilah-tractate-arc':\{tractate:'meilah'/);
  const meilah=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Meilah');
  assert.equal(meilah.stage,'tractate-arc'); assert.equal(meilah.arcUrl,'meilah-arc.html');
});
