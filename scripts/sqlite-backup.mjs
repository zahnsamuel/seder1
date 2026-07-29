#!/usr/bin/env node
// Consistent snapshot of the pilot's SQLite database to a timestamped file. Safe to run while the
// server is live: SQLite WAL mode allows this reader alongside the running writer, and `VACUUM
// INTO` copies a single consistent snapshot (WAL folded in) rather than a torn file copy.
//
//   SEDER_DB=/data/seder.db node scripts/sqlite-backup.mjs [outDir]
//   node scripts/sqlite-backup.mjs /data/seder.db /data/backups
//
// Exit 0 on success. Schedule it (cron / Render cron job) and keep the .db file — it is the
// entire learner dataset.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

// Two call forms: `node script <dbPath> [outDir]`, or `SEDER_DB=<path> node script [outDir]`.
const dbPath = process.env.SEDER_DB || process.argv[2];
if (!dbPath) {
  console.error('Usage: SEDER_DB=<path> node scripts/sqlite-backup.mjs [outDir]');
  process.exit(2);
}
const outArg = process.env.SEDER_DB ? process.argv[2] : process.argv[3];
const outDir = (outArg || process.env.SEDER_BACKUP_DIR || '.').replace(/[\\/]+$/, '');
try { mkdirSync(outDir, { recursive: true }); } catch { /* exists */ }

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = `${outDir}/seder-${stamp}.db`;

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');
const db = new DatabaseSync(dbPath);
try {
  db.exec(`VACUUM INTO '${outPath.replace(/'/g, "''")}'`);
  const learners = db.prepare('select count(*) as n from learners').get().n;
  console.log(`Backup written: ${outPath} (${learners} learner${learners === 1 ? '' : 's'})`);
} finally {
  db.close();
}
