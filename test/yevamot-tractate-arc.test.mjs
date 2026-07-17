import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('Yevamot offers a family-law obligation and exemption source arc', async () => {
  const [arc,page,tractatesFile,engine]=await Promise.all(['yevamot-arc.js','yevamot-arc.html','data/gemara-tractates.json','course-engine.js'].map(file=>readFile(file,'utf8')));
  for(const skill of ['yevamot-category-count','yevamot-levirate-obligation','yevamot-exemption-mechanism','yevamot-prohibited-relationships','yevamot-chalitzah-procedure','yevamot-historical-boundary','yevamot-independent-map']) assert.match(arc,new RegExp(skill));
  assert.match(arc,/Mishnah Yevamot 1:1/); assert.match(arc,/Deuteronomy 25:5-10/); assert.match(arc,/Yevamot 3a/); assert.match(page,/not present-day legal, pastoral, or personal advice/i);
  assert.match(engine,/'yevamot-tractate-arc':\{tractate:'yevamot'/);
  const tractate=JSON.parse(tractatesFile).tractates.find(item=>item.title==='Yevamot');
  assert.equal(tractate.stage,'tractate-arc'); assert.equal(tractate.arcUrl,'yevamot-arc.html');
});
