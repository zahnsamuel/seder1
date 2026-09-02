import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const HUB_HOOKS = [
  'id="xp"',
  'id="nextAction"',
  'id="capChips"',
  'id="heroCopy"',
  'id="levelLabel"',
  'id="levelCopy"',
  'id="todayTitle"',
  'id="todayCopy"',
  'id="streak"',
  'id="streakLabel"',
  'id="sources"',
  'id="sourcesLabel"',
  'class="hero"',
  'id="jla-shell-mount"',
  'seder-auth.js',
  'capability-state.js',
  'jla-shell.js',
  'seder.js',
  'hosted-sign-in-front-door.js',
  'onboarding.js'
];

test('UI principles document the learner-facing product law', async () => {
  const doc = await read('docs/ui-principles.md');
  for (const phrase of [
    'One next task',
    'system chooses the next action',
    'Mastery evidence over vanity XP',
    'twenty minutes',
    'Low cognitive load',
    'No chatbot',
    'skills + canon touched',
    'jla-system',
    'study aid',
    'Mobile-first',
    '44px'
  ]) assert.match(doc, new RegExp(phrase, 'i'));
  assert.doesNotMatch(doc, /Math Academy/);
});

test('hub keeps every JS hook, one Today CTA, and jla components', async () => {
  const html = await read('seder.html');
  for (const hook of HUB_HOOKS) assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal((html.match(/id="nextAction"/g) || []).length, 1);
  assert.match(html, /class="today-cta jla-btn"/);
  assert.match(html, /id="capChips" class="jla-chips"/);
  assert.match(html, /class="level jla-card"/);
  assert.match(html, /Become someone who can open Jewish texts\./);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  assert.doesNotMatch(html, /daily-router\.js/);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const sederOrder = html.indexOf('seder.js');
  const onboardingOrder = html.indexOf('onboarding.js');
  assert.ok(authOrder < shellOrder && shellOrder < sederOrder && sederOrder < onboardingOrder);
});

test('hub script renders design-system capability chips', async () => {
  const script = await read('seder.js');
  assert.match(script, /jla-chip is-\$\{s\}/);
  assert.match(script, /jla-chip is-none/);
  assert.doesNotMatch(script, /cap-chip/);
});

test('hub CSS slims dead journey/why/depth rules and bridges jla tokens', async () => {
  const css = await read('seder.css');
  assert.match(css, /--ink:\s*var\(--jla-ink/);
  assert.match(css, /--blue:\s*var\(--jla-blue/);
  assert.match(css, /min-height:\s*44px/);
  assert.doesNotMatch(css, /\.journey-map/);
  assert.doesNotMatch(css, /\.journey-section/);
  assert.doesNotMatch(css, /\.ascent-note/);
  assert.doesNotMatch(css, /\.depth\s*\{/);
  assert.doesNotMatch(css, /\.why\s*\{/);
});

test('Today is one next-action hero with hub fonts and a 44px mobile CTA', async () => {
  const [html, css, js] = await Promise.all(['daily-router.html', 'jla-next-action.css', 'jla-next-action.js'].map(read));
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /data-jla-next-action/);
  assert.equal((html.match(/jla-next-action__cta/g) || []).length, 1);
  assert.doesNotMatch(html, /daily-router\.js/);
  assert.doesNotMatch(html, /chatbot/i);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /\.jla-next-action__cta[\s\S]*width:\s*100%/);
  assert.match(js, /replaceChildren/);
  assert.doesNotMatch(js, /innerHTML/);
});

test('shell stays presentational: Today + Account, optional contextual links, no recommendation chip', async () => {
  const [shell, adoption] = await Promise.all(['jla-shell.js', 'docs/jla-ui-system-adoption.md'].map(read));
  assert.match(shell, /daily-router\.html">Today/);
  assert.match(shell, /id="accountAction"/);
  assert.match(shell, /contextualLinks/);
  assert.match(shell, /reservedHref/);
  assert.doesNotMatch(shell, /\/api\/learners/);
  assert.doesNotMatch(shell, /next-step chip|nextStepChip|jla-shell-next/);
  assert.doesNotMatch(shell, /dailyStreak|capabilit/);
  assert.match(adoption, /Simplified 2026-08-31/);
  assert.match(adoption, /No live rhythm/);
  assert.match(adoption, /next-step recommendation chip/);
});
