import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { itemProblem } from '../data/item-authoring-fold.mjs';
import {
  SOURCE_FAMILIES,
  transferItemProblem,
  transferFileProblem,
  validateTransferFile
} from '../data/foundation-transfer-items.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const schema = read('data/foundation-transfer-items.schema.json');
const examples = read('data/foundation-transfer-items.examples.json');
const graph = read('data/foundation-skill-graph.json');
const starter = read('data/foundation-starter-set.json');
const authored = read('data/foundation-authored-items.json');

const graphSkillIds = new Set(graph.skills.map((s) => s.id));
const starterSkillIds = new Set(starter.starterSet.map((s) => s.id));
const ctx = { graphSkillIds, starterSkillIds, requireExample: true };

const JARGON = /make the move|reading move|make this .*move/i;
const HEBREW = /[\u0590-\u05FF]/;

test('the schema file is JSON Schema for transfer items', () => {
  assert.equal(schema.title.includes('transfer'), true);
  assert.equal(schema.$defs.transferItem.properties.type.const, 'transfer');
  assert.deepEqual(schema.$defs.sourceFamily.enum, [...SOURCE_FAMILIES]);
  assert.ok(schema.$defs.transferItem.required.includes('practicedFamilies'));
  assert.ok(schema.$defs.transferItem.required.includes('whyTransfer'));
  assert.ok(schema.$defs.transferItem.required.includes('sefariaUrl'));
});

test('the examples file is examples-only and must not load into academy', () => {
  assert.equal(transferFileProblem(examples), null);
  assert.equal(examples.status, 'examples-only');
  assert.equal(examples.loadIntoAcademy, false);
  assert.match(examples.note, /SCHEMA ILLUSTRATIONS ONLY/i);
  assert.ok(examples.items.length >= 1 && examples.items.length <= 2, '1–2 examples, not a fake bank');
});

test('every EXAMPLE transfer item matches the schema and authored-item shape', () => {
  const { ok, rejected } = validateTransferFile(examples, ctx);
  assert.equal(ok, true, JSON.stringify(rejected));

  for (const item of examples.items) {
    assert.equal(item.status, 'example', `${item.id} is an example`);
    assert.equal(item.loadIntoAcademy, false, `${item.id} must not load`);
    assert.match(item.label, /EXAMPLE/i);
    assert.match(item.stem, /EXAMPLE/i, `${item.id} stem is labeled EXAMPLE if ever shown`);
    assert.equal(item.type, 'transfer');
    assert.ok(starterSkillIds.has(item.skill), `${item.skill} is in the starter set`);
    assert.ok(graphSkillIds.has(item.skill), `${item.skill} is a graph skill`);
    assert.equal(itemProblem(item), null, `${item.id} fails authored-item shape: ${itemProblem(item)}`);
    assert.match(item.stem, HEBREW, `${item.id} stem carries an on-page Hebrew excerpt`);
    assert.doesNotMatch(`${item.stem} ${item.choices.join(' ')}`, JARGON);
    assert.match(item.sefariaUrl, /^https:\/\/www\.sefaria\.org\//);
    assert.ok(!item.practicedFamilies.includes(item.sourceFamily), `${item.id} sourceFamily is already practiced`);
    const lengths = item.choices.map((c) => c.length);
    assert.ok(
      lengths[item.correct] <= 1.5 * Math.min(...lengths),
      `${item.id} length-bias: correct ${lengths[item.correct]} vs shortest ${Math.min(...lengths)}`
    );
    assert.ok(item.feedback.length >= 25, `${item.id} feedback must teach`);
  }
});

test('examples are not production coverage — recognition banks stay untouched', () => {
  const bankSkills = Object.keys(authored.items || {});
  for (const item of examples.items) {
    const bank = authored.items[item.skill] || [];
    assert.ok(
      !bank.some((row) => row.stem === item.stem),
      `${item.id} must not be copied into the recognition bank`
    );
  }
  assert.ok(bankSkills.includes('fnd-orient-source-type'), 'sanity: recognition bank still has orientation items');
});

test('the validator names the transfer-specific defects', () => {
  const good = examples.items[0];
  assert.equal(transferItemProblem(good, ctx), null);
  assert.equal(transferItemProblem({ ...good, type: 'recognition' }, ctx), 'type-must-be-transfer');
  assert.equal(transferItemProblem({ ...good, sourceFamily: good.practicedFamilies[0] }, ctx), 'sourceFamily-already-practiced');
  assert.equal(transferItemProblem({ ...good, loadIntoAcademy: true }, ctx), 'example-must-not-load');
  assert.equal(transferItemProblem({ ...good, sefariaUrl: 'https://example.com/x' }, ctx), 'bad-sefariaUrl');
  assert.equal(transferItemProblem({ ...good, skill: 'not-a-skill' }, ctx), 'bad-skill');
  assert.equal(transferItemProblem({ ...good, id: 'xfer-fnd-orient-source-type-1', status: 'example' }, ctx), 'example-id-prefix');
});

test('academy and the authored-item importer do not load the examples file', () => {
  const lesson = readFileSync(new URL('../academy-session-lesson.mjs', import.meta.url), 'utf8');
  const engine = readFileSync(new URL('../data/curriculum-engine.mjs', import.meta.url), 'utf8');
  const importer = readFileSync(new URL('../scripts/import-authored-items.mjs', import.meta.url), 'utf8');
  const quality = readFileSync(new URL('../scripts/graph-quality.mjs', import.meta.url), 'utf8');
  for (const [name, source] of [
    ['academy-session-lesson.mjs', lesson],
    ['curriculum-engine.mjs', engine],
    ['import-authored-items.mjs', importer],
    ['graph-quality.mjs', quality]
  ]) {
    assert.doesNotMatch(source, /foundation-transfer-items\.examples/, `${name} must not import the EXAMPLE file`);
  }
});
