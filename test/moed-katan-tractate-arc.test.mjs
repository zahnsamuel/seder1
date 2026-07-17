import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Moed Katan offers a bounded-exception source arc', async () => {
  const [arc, page, tractatesFile, engine] = await Promise.all(['moed-katan-arc.js', 'moed-katan-arc.html', 'data/gemara-tractates.json', 'course-engine.js'].map((file) => readFile(file, 'utf8')));
  for (const skill of ['moed-katan-permitted-case', 'moed-katan-threatened-loss', 'moed-katan-exception-limit', 'moed-katan-learning-boundary', 'moed-katan-independent-map']) assert.match(arc, new RegExp(skill));
  assert.match(arc, /Mishnah Moed Katan 1:1/); assert.match(arc, /Moed Katan 2a/); assert.match(page, /not practical guidance about festival observance/i);
  assert.match(engine, /'moed-katan-tractate-arc':\{tractate:'moed-katan'/);
  const moedKatan = JSON.parse(tractatesFile).tractates.find((tractate) => tractate.title === 'Moed Katan');
  assert.equal(moedKatan.stage, 'tractate-arc'); assert.equal(moedKatan.arcUrl, 'moed-katan-arc.html');
});
