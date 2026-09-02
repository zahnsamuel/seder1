import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const SHARED_UI = ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js', 'seder-auth.js'];

test('source reader is one line and one Continue on the shared shell', async () => {
  const html = await read('source-reader.html');
  for (const sharedUi of SHARED_UI) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')), sharedUi);
  }
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Noto\+Sans\+Hebrew/);
  assert.match(html, /<p class="jla-eyebrow">SOURCE<\/p>/);
  assert.match(html, /id="title"/);
  assert.match(html, /id="reader"/);
  assert.match(html, /id="hebrew"/);
  assert.match(html, /lang="he" dir="rtl"/);
  assert.match(html, /id="prompt"/);
  assert.equal((html.match(/id="continue"/g) || []).length, 1);
  assert.match(html, /id="continue" class="jla-btn jla-btn-primary"/);
  assert.match(html, /<details class="reader-passages">/);
  assert.match(html, /<summary>Other passages<\/summary>/);
  assert.match(html, /id="collection-nav"/);
  assert.ok(html.indexOf('id="continue"') < html.indexOf('<details class="reader-passages">'));
  assert.ok(html.indexOf('<details class="reader-passages">') < html.indexOf('id="collection-nav"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /canon-labs\.css/);
  assert.doesNotMatch(html, /source-reader-language\.js/);
  assert.doesNotMatch(html, /textarea/i);
  assert.doesNotMatch(html, /id="focus"/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  assert.match(html, /id="connection"/);
  assert.match(html, /source-reader\.js/);
  const authOrder = html.indexOf('seder-auth.js');
  const shellOrder = html.indexOf('jla-shell.js');
  const readerOrder = html.indexOf('source-reader.js');
  assert.ok(authOrder < shellOrder && shellOrder < readerOrder);
});

test('source reader JS is one line at a time with no free response', async () => {
  const [js, css] = await Promise.all(['source-reader.js', 'source-reader.css'].map(read));
  assert.match(js, /Show translation/);
  assert.match(js, /lang="he" dir="rtl"|#hebrew/);
  assert.match(js, /#prompt/);
  assert.match(js, /Continue →/);
  assert.match(js, /Complete this passage/);
  assert.match(js, /source_reading_completed/);
  assert.match(js, /#collection-nav/);
  assert.match(js, /\/api\/curriculum\/non-gemara-source-reader/);
  assert.match(js, /firstUnseen|viewed/);
  assert.doesNotMatch(js, /textarea/i);
  assert.doesNotMatch(js, /reading-reflection/);
  assert.doesNotMatch(js, /Private note/);
  assert.doesNotMatch(js, /Save line note/);
  assert.doesNotMatch(js, /Focus this line/);
  assert.doesNotMatch(js, /Close the reading loop/);
  assert.doesNotMatch(js, /collection\.lines\.map/);
  assert.match(css, /--jla-ink|--jla-blue/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 720px\)/);
});
