import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canMasterJourneyStage } from '../data/curriculum-engine.mjs';

test('academy days require two correct source checks before their mastery marker can be written', async () => {
  const root = new URL('..', import.meta.url).pathname;
  const blank = { events: [] };
  assert.equal(await canMasterJourneyStage(root, blank, 'academy-day-1'), false);
  const one = { events: [{ type: 'answer_submitted', correct: true, sourceContext: 'academy day 1 check 1' }] };
  assert.equal(await canMasterJourneyStage(root, one, 'academy-day-1'), false);
  const two = { events: [...one.events, { type: 'answer_submitted', correct: true, sourceContext: 'academy day 1 check 2' }] };
  assert.equal(await canMasterJourneyStage(root, two, 'academy-day-1'), true);
  assert.equal(await canMasterJourneyStage(root, two, 'academy-day-91'), false);
});

test('academy makes daily source evidence, rather than opening a link, the unlock condition', async () => {
  const [academy, evidence, html] = await Promise.all(['academy.js', 'academy-evidence.js', 'academy-evidence.html'].map((file) => readFile(file, 'utf8')));
  assert.match(academy, /academy-day-/);
  assert.match(academy, /Demonstrate today/);
  assert.match(evidence, /academy day \$\{day\} check/);
  assert.match(evidence, /stage_mastered/);
  assert.match(html, /EARN TOMORROW/);
});
