import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const blocks = [
  'pesachim-deepening',
  'eruvin-deepening',
  'sukkah-deepening',
  'bava-metzia-deepening',
  'bava-kamma-deepening'
];

test('deepening blocks shuffle choices and make the next move available after feedback', async () => {
  for (const block of blocks) {
    const [html, source] = await Promise.all([
      readFile(`${block}.html`, 'utf8'),
      readFile(`${block}.js`, 'utf8')
    ]);
    assert.match(html, /id="answers"/);
    assert.match(html, /id="feedback"/);
    assert.match(html, /id="continue"/);
    assert.match(source, /Math\.random\(\)/, `${block} must randomize answer presentation`);
    assert.match(source, /original/, `${block} must retain original answer identity after shuffle`);
    assert.match(source, /feedback.*textContent|textContent.*feedback/s, `${block} must show answer feedback`);
    assert.match(source, /continue.*disabled=false|disabled=false.*continue/s, `${block} must enable the next move after an answer`);
    assert.match(source, /source-link.*sefaria\.org|sefaria\.org.*source-link/s, `${block} must keep a primary-text link available`);
  }
});
