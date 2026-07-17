import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('capstone and mastery arcs support longer non-Gemara cycles without required writing',async()=>{const arcs=JSON.parse(await readFile(new URL('../data/canon-mastery-arcs.json',import.meta.url),'utf8'));const page=await readFile(new URL('../canon-capstone.html',import.meta.url),'utf8');assert.equal(arcs.arcs.length,4);assert.ok(arcs.arcs.every(a=>a.days.length===6));assert.match(page,/COMPARISON CHECK/i);assert.doesNotMatch(page,/textarea/i);});
