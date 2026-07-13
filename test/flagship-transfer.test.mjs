import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('every flagship Daf skill has a contrasting-source transfer check and wider-canon connection', async () => {
  const [html, source, retention] = await Promise.all([
    'flagship-transfer.html', 'flagship-transfer.js', 'flagship-daf-retention.js'
  ].map((file) => readFile(file, 'utf8')));
  for (const tractate of ['shabbat', 'pesachim', 'eruvin', 'sukkah', 'bava-metzia', 'bava-kamma']) {
    assert.match(source, new RegExp(`['"]?${tractate}['"]?:`));
    assert.match(retention, /flagship-transfer\.html/);
  }
  for (const phrase of ['contrasting-source transfer', 'source_annotation', 'canonConnections', 'ONE JEWISH LITERACY CONNECTION', 'Sefaria']) assert.match(html + source, new RegExp(phrase));
  assert.match(source, /sort\(\(\) => Math\.random\(\) - \.5\)/);
});
