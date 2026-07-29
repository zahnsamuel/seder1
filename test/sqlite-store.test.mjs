import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { initSqlite, closeSqlite, sqliteEnabled, issueToken, verifyToken, revokeTokens, readAll, writeAll } from '../data/sqlite-store.mjs';
import { createLearner, getLearner, recordLearnerEvent, deleteLearner, listLearners } from '../data/repository.mjs';

// Runs in its own worker process (node --test isolates files), so enabling the SQLite backend
// here does not affect the file-store tests. `root` is ignored once SQLite is initialized.
let dir;
before(() => { dir = mkdtempSync(join(tmpdir(), 'seder-sqlite-')); initSqlite(join(dir, 'test.db')); });
after(() => { closeSqlite(); rmSync(dir, { recursive: true, force: true }); });

describe('SQLite store: the repository logic runs unchanged over SQLite', () => {
  test('a learner and its answer events persist and round-trip', async () => {
    assert.equal(sqliteEnabled(), true);
    const learner = await createLearner('.', 'Test Reader');
    assert.ok(learner.id.startsWith('test-reader-'));
    const updated = await recordLearnerEvent('.', learner.id, { type: 'answer_submitted', skillId: 'skill-x', competency: 'recognition', correct: true });
    assert.equal(updated.xp, 10);
    assert.ok(Math.abs(updated.mastery['skill-x'] - 0.34) < 0.001);
    const reread = await getLearner('.', learner.id);
    assert.equal(reread.xp, 10, 'xp survives a fresh read from SQLite');
    assert.deepEqual(reread.capabilityEvidence, []);
  });

  test('JLA capability evidence records through the SQLite path', async () => {
    const learner = await createLearner('.', 'Grad');
    const updated = await recordLearnerEvent('.', learner.id, {
      type: 'answer_submitted', skillId: 'source-family-001', correct: true, jlaCapability: true,
      domain: 'source-navigation', graduationLevel: 'source-explorer', skillTitle: 'Recognize a source',
      evidenceStatement: 'I can recognize a source.', sourceRef: 'Genesis 1:1', sourceUrl: 'https://www.sefaria.org/Genesis.1.1'
    });
    assert.equal(updated.capabilityEvidence.length, 1);
    assert.equal(updated.capabilityEvidence[0].status, 'earned');
  });

  test('deleteLearner removes the row from SQLite', async () => {
    const learner = await createLearner('.', 'Temp');
    assert.ok(await getLearner('.', learner.id));
    await deleteLearner('.', learner.id);
    const all = await listLearners('.');
    assert.equal(all.find((x) => x.id === learner.id), undefined);
  });
});

describe('SQLite store: bearer-token auth', () => {
  test('issue returns a raw token; verify maps its hash back to the learner', () => {
    const token = issueToken('learner-abc');
    assert.match(token, /^[0-9a-f]{64}$/, 'token is 32 random bytes as hex');
    assert.deepEqual(verifyToken(token), { id: 'learner-abc' });
  });

  test('a bad, empty, or missing token verifies to null (never throws)', () => {
    assert.equal(verifyToken('not-a-real-token'), null);
    assert.equal(verifyToken(''), null);
    assert.equal(verifyToken(undefined), null);
    assert.equal(verifyToken(null), null);
  });

  test('two learners get different tokens that resolve to their own ids', () => {
    const a = issueToken('learner-a');
    const b = issueToken('learner-b');
    assert.notEqual(a, b);
    assert.deepEqual(verifyToken(a), { id: 'learner-a' });
    assert.deepEqual(verifyToken(b), { id: 'learner-b' });
  });

  test('revokeTokens invalidates a learner\'s tokens', () => {
    const token = issueToken('learner-revoke');
    assert.deepEqual(verifyToken(token), { id: 'learner-revoke' });
    revokeTokens('learner-revoke');
    assert.equal(verifyToken(token), null);
  });
});

describe('SQLite store: raw map read/write seam', () => {
  test('writeAll upserts and readAll returns the map; a dropped id is deleted', () => {
    writeAll({ a: { id: 'a', xp: 5 }, b: { id: 'b', xp: 9 } });
    const map = readAll();
    assert.equal(map.a.xp, 5);
    assert.equal(map.b.xp, 9);
    writeAll({ b: { id: 'b', xp: 12 } });
    const after = readAll();
    assert.equal(after.a, undefined, 'an id absent from the written map is removed');
    assert.equal(after.b.xp, 12);
  });
});
