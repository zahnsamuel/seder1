import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const courses=JSON.parse(await readFile(new URL('../data/canon-six-session-courses.json',import.meta.url),'utf8'));
test('Shema and Blessings each have six source-based connected sessions',()=>{assert.equal(courses.courses.length,2);assert.ok(courses.courses.every(c=>c.sessions.length===6));});
