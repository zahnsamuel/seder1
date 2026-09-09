import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ALREADY_TAUGHT_PREREQUISITES,
  askSurface,
  collectTeachText,
  earnedTerms,
  findTeachBeforeAskViolations,
  termsIn,
  untaughtAskTerms
} from '../data/teach-before-ask.mjs';

const load = async (file) => JSON.parse(await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));

// Later L3–L5 banks still being rewritten in a peer lane. Early signal asks are
// guarded here now that those banks are source-grounded on this branch.
const PEER_LANE_BANKS = new Set([
  'fnd-role-example',
  'fnd-case-actors',
  'fnd-case-restate',
  'fnd-case-uncertainty',
  'fnd-arg-claim',
  'fnd-arg-evidence-role',
  'fnd-arg-unresolved'
]);

const graph = {
  skills: [
    { id: 'fnd-orient-source-type', prerequisites: [] },
    { id: 'fnd-orient-speaker', prerequisites: ['fnd-orient-source-type'] },
    { id: 'fnd-context-genre-expectations', prerequisites: ['fnd-orient-speaker'] }
  ]
};

const teachFile = {
  teach: {
    'fnd-orient-source-type': 'A Torah verse tells. A Mishnah states a rule. The Gemara asks about it. Commentary talks from the side.',
    'fnd-context-genre-expectations': 'Halakhah is the practice-and-law side. Aggadah is the story-and-meaning side.'
  },
  genres: {
    gemara: { name: 'Gemara', teach: 'Together with the Mishnah they make the Talmud.' },
    commentary: { name: 'Commentary', teach: "Rashi's notes are the classic example." }
  }
};

test('askSurface is stem plus choices, never feedback or sourceRef', () => {
  const item = {
    sourceRef: 'Rambam, Yesodei HaTorah 1:1',
    stem: 'What is this line doing?',
    choices: ['Stating a claim', 'Naming a sugya'],
    feedback: 'The Gemara is asking; a sugya is a unit of discussion.'
  };
  const surface = askSurface(item);
  assert.match(surface, /What is this line doing/);
  assert.match(surface, /Naming a sugya/);
  assert.doesNotMatch(surface, /Rambam/);
  assert.doesNotMatch(surface, /Gemara is asking/);
});

test('own See-it teach earns a term for that skill’s ask', () => {
  const item = { stem: 'Which line is Gemara?', choices: ['This one', 'A Torah verse'] };
  const earned = earnedTerms({ skillId: 'fnd-orient-source-type', teachFile, graph, item });
  assert.deepEqual(untaughtAskTerms(item, earned), []);
  assert.ok(earned.has('gemara'));
  assert.ok(earned.has('talmud'), 'genre gallery is part of the source-type See-it');
  assert.ok(earned.has('rashi'));
});

test('an untaught term in the stem or a choice is a violation; the same word in feedback is not', () => {
  const ask = { stem: 'How does this sugya open?', choices: ['With a question', 'With a ruling'] };
  const feedbackOnly = {
    stem: 'How does this discussion open?',
    choices: ['With a question', 'With a ruling'],
    feedback: 'A sugya is a unit of discussion. The Gemara often opens one with a question.'
  };
  assert.deepEqual(termsIn(askSurface(ask)), ['sugya']);
  assert.deepEqual(untaughtAskTerms(ask, new Set()), ['sugya']);
  assert.deepEqual(untaughtAskTerms(feedbackOnly, new Set()), []);
});

test('explicit already-taught prerequisites earn their See-it terms for later skills', () => {
  assert.deepEqual(ALREADY_TAUGHT_PREREQUISITES, [
    'fnd-orient-source-type',
    'fnd-context-genre-expectations'
  ]);
  const later = { stem: 'Which block is the Gemara?', choices: ['The center', 'A commentary'] };
  const earned = earnedTerms({
    skillId: 'fnd-orient-speaker',
    teachFile, // later skill has no own See-it; source-type's teach still earns genre labels
    graph
  });
  assert.equal(collectTeachText('fnd-orient-speaker', teachFile), '');
  assert.deepEqual(untaughtAskTerms(later, earned), []);
  assert.equal(
    untaughtAskTerms({ stem: 'Who frames the sugya?', choices: ['The named sage', 'The anonymous voice'] }, earned)[0],
    'sugya'
  );
});

test('item.teach can introduce a term the banked See-it has not yet named', () => {
  const item = {
    teach: 'A sugya is one unit of discussion on the page.',
    stem: 'Who frames the sugya?',
    choices: ['The named sage', 'The anonymous voice']
  };
  const earned = earnedTerms({ skillId: 'fnd-orient-speaker', teachFile: { teach: {} }, graph, item });
  assert.deepEqual(untaughtAskTerms(item, earned), []);
});

test('collectTeachText keeps the skill teach and the source-type gallery together', () => {
  const blob = collectTeachText('fnd-orient-source-type', teachFile);
  assert.match(blob, /Torah verse/);
  assert.match(blob, /Talmud/);
  assert.match(blob, /Rashi/);
});

test('See-it teach + ask pairing on main’s current banks uses no unearned terms', async () => {
  const teach = await load('data/foundation-teach.json');
  const bank = (await load('data/foundation-authored-items.json')).items;
  const liveGraph = await load('data/foundation-skill-graph.json');
  const paired = Object.keys(teach.teach || {}).filter((id) => Array.isArray(bank[id]));
  assert.ok(paired.includes('fnd-orient-source-type'));
  assert.ok(paired.includes('fnd-context-genre-expectations'));
  const violations = findTeachBeforeAskViolations({
    itemsBySkill: bank,
    teachFile: teach,
    graph: liveGraph,
    skillIds: paired,
    skip: PEER_LANE_BANKS
  });
  assert.deepEqual(violations, [], formatViolations(violations));
});

test('authored banks outside the peer deepen lane earn every ask term', async () => {
  const teach = await load('data/foundation-teach.json');
  const bank = (await load('data/foundation-authored-items.json')).items;
  const liveGraph = await load('data/foundation-skill-graph.json');
  const violations = findTeachBeforeAskViolations({
    itemsBySkill: bank,
    teachFile: teach,
    graph: liveGraph,
    skip: PEER_LANE_BANKS
  });
  assert.deepEqual(violations, [], formatViolations(violations));
});

function formatViolations(violations) {
  if (!violations.length) return '';
  return violations.map((v) => `${v.skillId}[${v.index}]: ${v.terms.join(', ')}`).join('\n');
}
