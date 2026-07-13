import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [foundationFile, extensionFile] = await Promise.all([
  readFile(new URL('../curriculum/canon-journey.json', import.meta.url), 'utf8'),
  readFile(new URL('../curriculum/canon-journey-extension.json', import.meta.url), 'utf8')
]);
const foundation = JSON.parse(foundationFile);
const extension = JSON.parse(extensionFile);
const journey = { ...foundation, sessions: [...foundation.sessions, ...extension.sessions] };

test('every canon session has two valid source-based checks with distinct contexts', () => {
  assert.equal(journey.sessions.length, 36);
  for (const session of journey.sessions) {
    assert.ok(session.source?.citation, `${session.id} needs a citation`);
    assert.ok(session.source?.hebrew, `${session.id} needs source text`);
    assert.equal(session.questions.length, 2, `${session.id} needs two checks`);
    const contexts = new Set();
    for (const question of session.questions) {
      assert.ok(question.skillId, `${session.id} question needs skill id`);
      assert.ok(question.sourceContext, `${session.id} question needs source context`);
      assert.ok(question.correct >= 0 && question.correct < question.choices.length, `${session.id} has an invalid correct answer`);
      contexts.add(question.sourceContext);
    }
    assert.equal(contexts.size, session.questions.length, `${session.id} needs transfer across distinct contexts`);
  }
});

test('every prerequisite stage refers to an earlier canon moment', () => {
  const index = new Map(journey.sessions.map((session, position) => [session.stageId, position]));
  for (const [position, session] of journey.sessions.entries()) {
    for (const stage of session.prerequisiteStages || []) assert.ok(index.get(stage) < position, `${session.id} has an invalid prerequisite`);
  }
});
