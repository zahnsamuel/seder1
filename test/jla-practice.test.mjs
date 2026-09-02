import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

test('practice lesson is one source window and one next control on the shared shell', async () => {
  const html = await read('jla-practice.html');
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js', 'seder-auth.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  for (const hook of ['id="eyebrow"', 'id="title"', 'id="teaching"', 'id="stage"']) {
    assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  }
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /class="jla-main"/);
  assert.match(html, /id="eyebrow"/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const pageOrder = html.indexOf('jla-practice.js');
  assert.ok(authOrder < shellOrder && shellOrder < pageOrder);
});

test('practice script keeps server scoring and one Continue', async () => {
  const js = await read('jla-practice.js');
  assert.match(js, /\/api\/jla\/academy-session\//);
  assert.match(js, /choiceId: btn\.dataset\.choiceId/);
  assert.match(js, /class="jla-choice"/);
  assert.match(js, /jla-feedback/);
  assert.match(js, /id="continue" class="jla-btn jla-btn-primary"/);
  assert.match(js, /daily-router\.html/);
  assert.match(js, /jla-source-line/);
  assert.match(js, /jla-chip is-secure/);
  assert.doesNotMatch(js, /correctChoiceId/);
  assert.doesNotMatch(js, /choice === 0|correct === true/);
});
