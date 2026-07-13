import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('course and transfer markers have a durable learner-state migration', async () => {
  const [repository, hosted, migration] = await Promise.all(['data/repository.mjs', 'data/supabase-learner-repository.mjs', 'supabase/migrations/005_learning_artifacts.sql'].map((file) => readFile(file, 'utf8')));
  assert.match(repository, /journey_artifact_saved/);
  assert.match(hosted, /journey_artifact_saved/);
  assert.match(migration, /artifacts jsonb/);
});
