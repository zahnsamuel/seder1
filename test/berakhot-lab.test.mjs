import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const lab=JSON.parse(await readFile(new URL('../data/berakhot-practice-lab.json',import.meta.url),'utf8'));
test('Berakhot lab uses varied deliberate practice modes including an independent source check',()=>{assert.equal(lab.exercises.length,6);assert.ok(lab.exercises.some(x=>x.acceptable));assert.equal(new Set(lab.exercises.map(x=>x.mode)).size,6);});
