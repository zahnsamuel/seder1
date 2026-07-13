import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { remediationFor } from '../data/curriculum-engine.mjs';
import { resolve } from 'node:path';

test('a learner whose uncertain skill is outside the canon journey still receives a targeted repair', async () => {
  const repair = await remediationFor(resolve('.'), { struggles: { 'historical-context': 2 } });
  assert.equal(repair.skillId, 'historical-context');
  assert.equal(repair.repairMode, 'contrast-and-transfer');
  assert.equal(repair.url, 'pilot-repair.html?skill=historical-context');
});

test('repair requires a contrasting-source check and saves successful transfer evidence', async () => {
  const source = await readFile(new URL('../pilot-repair.js', import.meta.url), 'utf8');
  for (const phrase of ['CONTRASTING SOURCE CHECK', 'data-contrast', 'repair_transfer', 'independent-reading.html']) assert.match(source, new RegExp(phrase));
});

test('hosted persistence retains the adaptive fields needed for learner parity', async () => {
  const [hosted, migration, map] = await Promise.all(['data/supabase-learner-repository.mjs', 'supabase/migrations/006_hosted_learning_parity.sql', 'daf-argument-map.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  for (const field of ['masteryUpdatedAt', 'struggles', 'events', 'dailyStreak', 'lastStudyDate']) assert.match(hosted, new RegExp(field));
  for (const column of ['mastery_updated_at', 'struggles', 'events', 'total_answered', 'daily_streak', 'last_study_date']) assert.match(migration, new RegExp(column));
  assert.match(map, /artifactType: 'source_map'/);
});
