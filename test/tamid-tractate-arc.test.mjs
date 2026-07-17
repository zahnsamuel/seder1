import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Tamid offers an ordered daily-service source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['tamid-arc.js','tamid-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['tamid-watch-system','tamid-service-sequence','tamid-role-division','tamid-routine-purpose','tamid-proof-sequence','tamid-scope-conditions','tamid-learning-boundary','tamid-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Tamid 1:1/); assert.match(arc,/Tamid 28b/); assert.match(page,/not present-day ritual guidance/i);
  assert.match(engine,/'tamid-tractate-arc':\{tractate:'tamid'/);
  const tamid=JSON.parse(tractatesFile).tractates.find(tractate=>tractate.title==='Tamid');
  assert.equal(tamid.stage,'tractate-arc'); assert.equal(tamid.arcUrl,'tamid-arc.html');
});
