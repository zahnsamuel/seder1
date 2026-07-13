import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Daf Workbench gives learners a persistent argument map and a source packet', async () => {
  const [html, map, packet, packets] = await Promise.all(['daf-workbench.html', 'daf-argument-map.js', 'daf-source-packet.js', 'data/gemara-source-packets.json'].map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.match(html, /argumentMap/);
  assert.match(html, /daf-argument-map\.js/);
  assert.match(html, /daf-source-packet\.js/);
  assert.match(map, /Source map earned/);
  assert.match(map, /source_map_completed/);
  assert.match(packet, /SOURCE PACKET/);
  const data = JSON.parse(packets);
  assert.deepEqual(data.packets.map((item) => item.tractate), ['berakhot', 'shabbat', 'pesachim', 'eruvin', 'sukkah', 'yoma', 'bava', 'bava-kamma']);
  for (const item of data.packets) for (const field of ['objective', 'prerequisites', 'misconception', 'transfer', 'sourceUrl']) assert.ok(item[field], `${item.tractate} packet needs ${field}`);
});
