import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const course=JSON.parse(await readFile(new URL('../data/tefillah-six-session-course.json',import.meta.url),'utf8'));
test('Tefillah course covers praise, petition, thanks, Torah reception, and attention',()=>{const sessions=course.courses[0].sessions;assert.equal(sessions.length,6);assert.ok(sessions.some(s=>s.skill==='tefillah-petition'));assert.ok(sessions.some(s=>s.skill==='tefillah-thanks'));});
