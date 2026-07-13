import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const lab=JSON.parse(await readFile(new URL('../data/non-gemara-practice-lab.json',import.meta.url),'utf8'));
test('Canon practice lab gives every non-Gemara domain a distinct source exercise',()=>{assert.equal(lab.exercises.length,7);assert.equal(new Set(lab.exercises.map(x=>x.subject)).size,7);});
