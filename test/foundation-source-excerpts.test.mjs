import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildScaffoldSteps,
  lookupExcerpt
} from '../academy-session-lesson.mjs';

const load = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));

const graph = load('data/foundation-skill-graph.json');
const authored = load('data/foundation-authored-items.json');
const excerpts = load('data/foundation-source-excerpts.json');
const starter = load('data/foundation-starter-set.json');
const kpLayer = load('data/foundation-knowledge-points.json');
const ctxLayer = load('data/foundation-content-contexts.json');
const teachBank = load('data/foundation-teach.json');

const starterIds = starter.starterSet.map((s) => s.id);
const authoredStarterSkills = starterIds.filter((id) => Array.isArray(authored.items[id]) && authored.items[id].length >= 3);

const cyclingRandom = () => {
  let n = 0;
  return () => {
    n += 1;
    return (n % 7) / 7;
  };
};

test('every starter skill with an authored session has an on-page source for see-it / try-it / new source', () => {
  assert.ok(authoredStarterSkills.length >= 20, `expected the instrumented starter slice, got ${authoredStarterSkills.length}`);

  const missing = [];
  for (const id of authoredStarterSkills) {
    const skill = graph.skills.find((item) => item.id === id);
    assert.ok(skill, `${id} is in the live graph`);
    const bank = authored.items[id];
    const steps = buildScaffoldSteps({
      skill,
      graph,
      kpLayer,
      ctxLayer,
      authoredBank: bank,
      excerpts,
      teachBank,
      random: cyclingRandom()
    });
    assert.equal(steps.length, 3, `${id} builds three session steps`);
    for (const step of steps) {
      const window = step.sourceWindow;
      if (!window.hasOnPageSource) {
        missing.push(`${id} ${step.kind} (${window.sourceRef})`);
      }
    }
  }

  assert.deepEqual(missing, [], `steps missing on-page Hebrew or translation:\n${missing.join('\n')}`);
});

test('every authored sourceRef used in a starter session resolves to an excerpt window', () => {
  const unresolved = [];
  for (const id of authoredStarterSkills) {
    // Academy sessions take the first three banked items as see-it / try-it / new source.
    for (const [index, item] of authored.items[id].slice(0, 3).entries()) {
      const excerpt = lookupExcerpt(item.sourceRef, excerpts);
      const hebrew = excerpt?.hebrew || '';
      const translation = excerpt?.translation || '';
      if (!hebrew && !translation) {
        unresolved.push(`${id}[${index}] ${item.sourceRef}`);
      }
    }
  }
  assert.deepEqual(unresolved, [], `starter session sourceRefs without an excerpt:\n${unresolved.join('\n')}`);
});

test('excerpt windows are short pedagogical cards, not a Sefaria dump', () => {
  const entries = excerpts.excerpts;
  assert.equal(typeof excerpts.note, 'string');
  for (const [ref, excerpt] of Object.entries(entries)) {
    assert.ok(excerpt.translation || excerpt.hebrew, `${ref} needs Hebrew or translation on the page`);
    assert.ok(excerpt.setting && excerpt.setting.length >= 20, `${ref} needs a short setting`);
    assert.match(excerpt.sourceUrl || '', /^https:\/\/www\.sefaria\.org\//, `${ref} keeps Sefaria as a secondary full-text link`);
    const hebrew = String(excerpt.hebrew || '');
    assert.ok(hebrew.length <= 180, `${ref} Hebrew is a short window, not a long passage (${hebrew.length})`);
    const translation = String(excerpt.translation || '');
    assert.ok(translation.length <= 220, `${ref} translation is a short window (${translation.length})`);
  }
});
