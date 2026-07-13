import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const blocks = {
  pesachim: 'pesachim-arc.html',
  eruvin: 'eruvin-arc.html',
  sukkah: 'sukkah-arc.html',
  bava: 'bava-metzia-arc.html',
  'bava-kamma': 'bava-kamma-arc.html'
};

test('five flagship tractates route from mapping into their own deep source arc', async () => {
  const [document, sequenceFile, templateFile] = await Promise.all([
    readFile(new URL('../docs/flagship-tractate-blocks.md', import.meta.url), 'utf8'),
    readFile(new URL('../data/gemara-source-sequences.json', import.meta.url), 'utf8'),
    readFile(new URL('../data/tractate-block-template.json', import.meta.url), 'utf8')
  ]);
  const sequences = JSON.parse(sequenceFile).sequences;
  const template = JSON.parse(templateFile);

  for (const stage of ['orientation', 'language', 'argument', 'second-source', 'daf-map', 'retrieval', 'transfer']) {
    assert.ok(template.requiredStages.some((item) => item.id === stage));
  }
  for (const [tractate, arc] of Object.entries(blocks)) {
    const sequence = sequences.find((item) => item.tractate === tractate);
    assert.ok(sequence, `missing ${tractate} sequence`);
    assert.equal(sequence.packets[1][2], arc);
    assert.match(document, new RegExp(arc));
  }
});
