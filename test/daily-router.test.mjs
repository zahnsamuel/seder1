import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const router=JSON.parse(await readFile(new URL('../data/repair-router.json',import.meta.url),'utf8'));
test('daily router covers six repair categories',async()=>{const js=await readFile(new URL('../daily-router.js',import.meta.url),'utf8');assert.equal(router.categories.length,6);assert.ok(router.categories.every(x=>x.skills.length&&x.url));assert.match(js,/Resume \$\{active\.course\.title\}/);assert.match(js,/canon-capstone\.html\?course/);});
