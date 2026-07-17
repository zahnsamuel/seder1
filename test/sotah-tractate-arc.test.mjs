import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Sotah offers testimony, ritual, and uncertainty source arc',async()=>{
 const [arc,page,tractates,engine]=await Promise.all(['sotah-arc.js','sotah-arc.html','data/gemara-tractates.json','course-engine.js'].map(f=>readFile(f,'utf8')));
 for(const skill of ['sotah-two-witness-warning','sotah-procedure-stages','sotah-testimony-scope','sotah-ritual-sequence','sotah-uncertainty-question','sotah-inference-limit','sotah-historical-boundary','sotah-independent-map']) assert.match(arc,new RegExp(skill));
 assert.match(arc,/Mishnah Sotah 1:1/); assert.match(arc,/Numbers 5:13/); assert.match(arc,/Sotah 2a/); assert.match(page,/not present-day legal, pastoral, or personal advice/i);
 assert.match(engine,/'sotah-tractate-arc':\{tractate:'sotah'/);
 const t=JSON.parse(tractates).tractates.find(x=>x.title==='Sotah'); assert.equal(t.stage,'tractate-arc'); assert.equal(t.arcUrl,'sotah-arc.html');
});
