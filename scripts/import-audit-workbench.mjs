#!/usr/bin/env node
// Import a completed educator-audit workbench export back into the graph (docs/foundation-graph-schema
// .md §6 governance). Validates the export against the CURRENT graph, folds it into
// data/foundation-audit.json, and tells you to regenerate the layers that consume it.
//
//   node scripts/import-audit-workbench.mjs <export.json>   (npm run graph:import -- <export.json>)
//
// After importing: `npm run graph:edges` (rationales + expert encompassing weights) and
// `npm run graph:misconceptions` (named misconception models) fold the audit into the built layers.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { foldWorkbenchExport } from '../data/audit-fold.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const exportPath = process.argv[2];
if (!exportPath) { console.error('Usage: node scripts/import-audit-workbench.mjs <export.json>'); process.exit(2); }

let exp;
try { exp = JSON.parse(readFileSync(exportPath, 'utf8')); }
catch (e) { console.error(`Could not read export ${exportPath}: ${e.message}`); process.exit(2); }

const graph = read('data/foundation-skill-graph.json');
const edgeKeys = new Set(read('data/foundation-skill-edges.json').edges.filter((e) => e.type === 'prerequisite').map((e) => `${e.from}::${e.to}`));
const skillIds = new Set(graph.skills.map((s) => s.id));
const gradIds = new Set(Object.keys(read('data/graduation-skill-map.json').map));
const auditUrl = new URL('../data/foundation-audit.json', import.meta.url);
const existing = existsSync(auditUrl) ? JSON.parse(readFileSync(auditUrl, 'utf8')) : null;

const { errors, audit, report } = foldWorkbenchExport({ export: exp, graphVersion: graph.version, edgeKeys, skillIds, gradIds, existing, source: exportPath });
if (errors.length) { console.error('Import refused:'); for (const e of errors) console.error(`  - ${e}`); process.exit(1); }

writeFileSync(auditUrl, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Imported ${exportPath} into data/foundation-audit.json`);
console.log(`  added this import: ${report.added.edgeRationales} rationales · ${report.added.encompassingWeights} weights · ${report.added.misconceptions} misconceptions · ${report.added.coverageDecisions} coverage decisions`);
console.log(`  audit now holds:   ${report.totals.edgeRationales}/${edgeKeys.size} rationales · ${report.totals.encompassingWeights} weights · ${report.totals.misconceptions}/${skillIds.size} misconceptions · ${report.totals.coverageDecisions} coverage decisions`);
const skippedTotal = Object.values(report.skipped).reduce((a, s) => a + s.length, 0);
if (skippedTotal) console.log(`  skipped ${skippedTotal} entries that don't match the current graph (stale keys): ${Object.entries(report.skipped).filter(([, s]) => s.length).map(([k, s]) => `${k}:${s.length}`).join(', ')}`);
console.log('  next: npm run graph:edges && npm run graph:misconceptions  (fold into the built layers)');
