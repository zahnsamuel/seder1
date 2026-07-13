import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const course=JSON.parse(await readFile(new URL('../data/responsibility-six-session-course.json',import.meta.url),'utf8'));
test('Responsibility course connects Mussar, Chassidus, history, and public life',()=>{const s=course.courses[0].sessions;assert.equal(s.length,6);assert.ok(s.some(x=>x.skill==='responsibility-context'));assert.ok(s.some(x=>x.skill==='responsibility-application'));});
