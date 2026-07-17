import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Gittin offers document, agency, intent, and delivery source arc',async()=>{
 const [arc,page,tractates,engine]=await Promise.all(['gittin-arc.js','gittin-arc.html','data/gemara-tractates.json','course-engine.js'].map(f=>readFile(f,'utf8')));
 for(const skill of ['gittin-document-identity','gittin-agency','gittin-validity-conditions','gittin-delivery','gittin-intent','gittin-agency-limits','gittin-historical-boundary','gittin-independent-map']) assert.match(arc,new RegExp(skill));
 assert.match(arc,/Mishnah Gittin 1:1/); assert.match(arc,/Gittin 21b/); assert.match(arc,/Gittin 2a/); assert.match(page,/not present-day legal, pastoral, or personal advice/i);
 assert.match(engine,/'gittin-tractate-arc':\{tractate:'gittin'/);
 const t=JSON.parse(tractates).tractates.find(x=>x.title==='Gittin'); assert.equal(t.stage,'tractate-arc'); assert.equal(t.arcUrl,'gittin-arc.html');
});
