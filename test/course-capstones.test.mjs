import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const caps=JSON.parse(await readFile(new URL('../data/course-capstones.json',import.meta.url),'utf8'));
test('every six-session non-Gemara course has a distinct capstone',()=>{assert.equal(caps.capstones.length,6);assert.ok(caps.capstones.every(c=>c.sources.length===4));});
