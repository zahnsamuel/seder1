import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeNextAction, selectNextAction } from '../data/next-action.mjs';

const action = (title) => ({ title, reason: `${title} reason`, href: `${title}.html`, cta: 'Start' });

test('selector enforces the learner-facing priority', () => {
  const candidates = Object.fromEntries(['continuation', 'completion', 'frontier', 'transfer', 'academy', 'foundation', 'review', 'recovery'].map((type) => [type, action(type)]));
  assert.equal(selectNextAction(candidates).type, 'recovery');
  delete candidates.recovery;
  assert.equal(selectNextAction(candidates).type, 'review');
  delete candidates.review;
  assert.equal(selectNextAction(candidates).type, 'foundation');
});

test('normalizer returns exactly the public contract and strips internal fields', () => {
  const result = normalizeNextAction({ type: 'frontier', title: 'Learn a new reading move', reason: 'Recommended next step.', href: 'academy-session.html?skill=fnd-one', cta: 'Start', skillId: 'fnd-one', learner: { mastery: {} }, alternatives: [] });
  assert.deepEqual(Object.keys(result), ['version', 'type', 'title', 'reason', 'href', 'cta', 'progress']);
  assert.equal(result.href, 'academy-session.html?skill=fnd-one');
  assert.doesNotMatch(JSON.stringify(result), /skillId|mastery|alternatives/);
});

test('normalizer handles malformed inputs and unsafe URLs with the safe Today fallback', () => {
  for (const input of [null, 'bad', { href: 'https://evil.example/x' }, { href: '//evil.example/x' }, { href: '/absolute' }, { href: 'javascript:alert(1)' }]) {
    const result = normalizeNextAction(input);
    assert.equal(result.href, 'daily-router.html');
    assert.equal(Object.keys(result).length, 7);
  }
});

test('Today component is isolated, uses safe DOM construction, records starts, and exposes one CTA', async () => {
  const [html, source, css] = await Promise.all(['daily-router.html', 'jla-next-action.js', 'jla-next-action.css'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /data-jla-next-action/);
  assert.match(html, /jla-next-action\.css/);
  assert.match(html, /jla-next-action\.js/);
  assert.equal((html.match(/jla-next-action__cta/g) || []).length, 1);
  assert.doesNotMatch(source, /innerHTML/);
  assert.match(source, /createElement/);
  assert.match(source, /replaceChildren/);
  assert.match(source, /next_action_started/);
  assert.match(source, /daily-router\.html/);
  assert.match(css, /\[data-jla-next-action\]/);
});

test('page roles and canonical redirects stay explicit', async () => {
  const [server, daily, academy, entrance] = await Promise.all(['server.mjs', 'daily-router.html', 'academy.html', 'seder.html'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(server, /'\/today\.html': '\/daily-router\.html'/);
  assert.match(server, /'\/daily\.html': '\/daily-router\.html'/);
  assert.match(server, /'\/index\.html': '\/seder\.html'/);
  assert.match(server, /Location: `\$\{redirects\[url\.pathname\]\}\$\{url\.search\}`/);
  assert.match(daily, />TODAY</);
  assert.match(academy, /PROGRESS REFERENCE/);
  assert.match(academy, /Return to Today/);
  assert.doesNotMatch(academy, /jla-next-action\.js/);
  assert.doesNotMatch(entrance, /jla-next-action\.js/);
});

