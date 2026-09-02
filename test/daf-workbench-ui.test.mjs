import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const SHARED_UI = ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js', 'seder-auth.js'];

const WORKBENCH_HOOKS = [
  'id="title"',
  'id="description"',
  'id="citation"',
  'id="toggleTranslation"',
  'id="lines"',
  'id="lineTitle"',
  'id="lineTranslation"',
  'id="clues"',
  'id="role"',
  'id="mark"',
  'id="feedback"',
  'id="mapProgress"',
  'id="argumentMap"',
  'id="xp"'
];

function assertSharedShell(html, label) {
  for (const sharedUi of SHARED_UI) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')), `${label}: ${sharedUi}`);
  }
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Noto\+Sans\+Hebrew/);
  assert.match(html, /<p class="jla-eyebrow">DAF<\/p>/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  assert.match(html, /id="xp" hidden/);
  assert.match(html, /id="mark" class="jla-btn jla-btn-primary"/);
  assert.match(html, /id="toggleTranslation" class="jla-btn jla-btn-ghost"/);
  assert.equal((html.match(/id="mark"/g) || []).length, 1);
  assert.match(html, /<details class="workbench-extra">/);
  assert.match(html, /<summary>Sugya map<\/summary>/);
  assert.match(html, /<summary>Reading protocol<\/summary>/);
  assert.ok(html.indexOf('<details class="workbench-extra">') < html.indexOf('id="argumentMap"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  assert.ok(authOrder < shellOrder, `${label}: auth before shell`);
}

test('Berakhot daf workbench is one next move on the shared shell', async () => {
  const html = await read('daf-workbench.html');
  assertSharedShell(html, 'daf-workbench');
  for (const hook of WORKBENCH_HOOKS) assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  assert.match(html, /id="tractateButtons"/);
  assert.match(html, /<summary>Other openings<\/summary>/);
  assert.match(html, /id="sourcePacket"/);
  assert.match(html, /id="nextMove"/);
  assert.ok(html.indexOf('id="mark"') < html.indexOf('<summary>Sugya map</summary>'));
  assert.ok(html.indexOf('<summary>Other openings</summary>') < html.indexOf('id="tractateButtons"'));
  assert.match(html, /data-links='\[\{"label":"Notebook","href":"daf-notebook\.html"\},\{"label":"Gemara path","href":"gemara-continuation\.html"\}\]'/);
  assert.match(html, /daf-workbench\.js/);
  assert.match(html, /daf-source-packet\.js/);
  assert.match(html, /daf-argument-map\.js/);
  assert.match(html, /daf-completion\.js/);
  const shellOrder = html.indexOf('jla-shell.js');
  const workbenchOrder = html.indexOf('daf-workbench.js');
  assert.ok(shellOrder < workbenchOrder);
});

test('flagship daf workbench is one next move on the shared shell', async () => {
  const html = await read('flagship-daf-workbench.html');
  assertSharedShell(html, 'flagship-daf-workbench');
  for (const hook of WORKBENCH_HOOKS) assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  assert.match(html, /id="masteryLink"/);
  assert.match(html, /id="masteryLink"[^>]*hidden/);
  assert.match(html, /id="objective"/);
  assert.match(html, /id="transfer"/);
  assert.match(html, /id="sefaria"/);
  assert.match(html, /id="repairMove"/);
  assert.match(html, /id="nextMove"/);
  assert.match(html, /not provide personal halakhic guidance/i);
  assert.match(html, /<summary>Source packet<\/summary>/);
  assert.ok(html.indexOf('id="mark"') < html.indexOf('<summary>Sugya map</summary>'));
  assert.ok(html.indexOf('id="nextMove"') < html.indexOf('<summary>Sugya map</summary>'));
  assert.match(html, /flagship-daf-workbench\.js/);
  assert.match(html, /flagship-daf-retention\.js/);
  const shellOrder = html.indexOf('jla-shell.js');
  const workbenchOrder = html.indexOf('flagship-daf-workbench.js');
  assert.ok(shellOrder < workbenchOrder);
});

test('workbench CSS bridges jla tokens and keeps experimental headers styled', async () => {
  const css = await read('daf-workbench.css');
  assert.match(css, /--blue:\s*var\(--jla-blue/);
  assert.match(css, /--gold:\s*var\(--jla-gold/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /Kept for tractate-specific workspaces that still use a page <header>/);
  assert.match(css, /\.workbench-extra/);
  assert.match(css, /body\.jla \.jla-main > h1/);
});

test('workbench engines still write hidden XP and preserve reading tools', async () => {
  const [daf, flagship] = await Promise.all(['daf-workbench.js', 'flagship-daf-workbench.js'].map(read));
  assert.match(daf, /#xp/);
  assert.match(daf, /Show translations/);
  assert.match(daf, /lang="he" dir="rtl"/);
  assert.match(daf, /#tractateButtons/);
  assert.match(daf, /#mark/);
  assert.match(flagship, /#xp/);
  assert.match(flagship, /#masteryLink/);
  assert.match(flagship, /Show translations/);
  assert.match(flagship, /lang="he" dir="rtl"/);
  assert.match(flagship, /Try a focused repair/);
  assert.match(flagship, /Map complete/);
  assert.doesNotMatch(daf + flagship, /chatbot/i);
});
