import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('flagship Gemara transfer opens a source-based connection into the wider canon', async () => {
  const [transfer, link, page, source] = await Promise.all(['flagship-transfer.html', 'canon-connection-link.js', 'canon-connection.html', 'canon-connection.js'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(transfer, /canon-connection-link\.js/);
  assert.match(link, /canon-connection\.html\?tractate=/);
  for (const tractate of ['pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) assert.match(source, new RegExp(`\\b${tractate}\\b`));
  for (const phrase of ['Exodus 12:14', 'Exodus 31:16', 'Leviticus 23:43', 'Leviticus 19:18', 'Exodus 22:5', 'source_annotation']) assert.match(source, new RegExp(phrase.replace(/[.?]/g, '\\$&')));
  assert.match(page, /CONNECT THE SOURCES/);
});
