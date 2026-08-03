#!/usr/bin/env node
// Fold an item-authoring workbench export into data/foundation-authored-items.json. Validates every
// item against the graph (data/item-authoring-fold.mjs) — invalid items are reported and skipped, a
// skill's valid items replace its prior bank — then writes the merged layer and prints coverage.
//
//   node scripts/import-authored-items.mjs <export.json>   (npm run graph:import-items -- <export.json>)
import { readFileSync, writeFileSync } from 'node:fs';
import { foldAuthoredItems } from '../data/item-authoring-fold.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const exportPath = process.argv[2];
if (!exportPath) { console.error('Usage: node scripts/import-authored-items.mjs <export.json>'); process.exit(1); }

const graph = read('data/foundation-skill-graph.json');
const skillIds = graph.skills.map((s) => s.id);
const current = read('data/foundation-authored-items.json');
const exportObj = JSON.parse(readFileSync(exportPath, 'utf8'));

const { authored, rejected, bankSizes, banksComplete } = foldAuthoredItems(current.items || {}, exportObj, skillIds);

const output = { ...current, generatedBy: 'scripts/import-authored-items.mjs', updatedAt: new Date().toISOString(), items: authored };
writeFileSync(new URL('../data/foundation-authored-items.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);

const totalItems = Object.values(authored).reduce((n, list) => n + list.length, 0);
console.log(`Folded authored items → data/foundation-authored-items.json`);
console.log(`  ${totalItems} items across ${Object.keys(authored).length} skills · ${banksComplete}/${skillIds.length} banks complete (>=${current.target || 3})`);
if (rejected.length) {
  console.log(`  rejected ${rejected.length} invalid item(s):`);
  for (const r of rejected) console.log(`    - ${r.skill}${r.index == null ? '' : `[${r.index}]`}: ${r.reason}`);
}
