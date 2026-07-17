import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Kiddushin offers acquisition, agency, conditions, and status source arc',async()=>{
 const [arc,page,tractates,engine]=await Promise.all(['kiddushin-arc.js','kiddushin-arc.html','data/gemara-tractates.json','course-engine.js'].map(f=>readFile(f,'utf8')));
 for(const skill of ['kiddushin-acquisition-categories','kiddushin-consent-agency','kiddushin-status-effects','kiddushin-validity-conditions','kiddushin-conditional-language','kiddushin-representation','kiddushin-historical-boundary','kiddushin-independent-map']) assert.match(arc,new RegExp(skill));
 assert.match(arc,/Mishnah Kiddushin 1:1/); assert.match(arc,/Kiddushin 61b/); assert.match(page,/not present-day legal, pastoral, or personal advice/i);
 assert.match(engine,/'kiddushin-tractate-arc':\{tractate:'kiddushin'/);
 const t=JSON.parse(tractates).tractates.find(x=>x.title==='Kiddushin'); assert.equal(t.stage,'tractate-arc'); assert.equal(t.arcUrl,'kiddushin-arc.html');
});
