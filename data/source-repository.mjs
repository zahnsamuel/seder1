import { existsSync, promises as fs } from 'node:fs';
import { join } from 'node:path';

const sourcesFile = (root) => join(root, 'data', 'source-library.json');

const starterLibrary = {
  version: '0.1.0',
  sources: [
    {
      id: 'mishnah-berakhot-1-1', status: 'approved', subjectId: 'gemara', stageId: 'enter-page',
      ref: 'Mishnah Berakhot 1:1', url: 'https://www.sefaria.org/Mishnah_Berakhot.1.1',
      role: 'primary-text', note: 'Opening Mishnah for the Berakhot onramp.', reviewedAt: '2026-07-10', reviewedBy: 'Seder editorial demo'
    },
    {
      id: 'berakhot-2a-opening', status: 'approved', subjectId: 'gemara', stageId: 'gemara-moves',
      ref: 'Berakhot 2a', url: 'https://www.sefaria.org/Berakhot.2a',
      role: 'primary-text', note: 'Opening sugya: Mishnah, contextual question, and verse-based answer.', reviewedAt: '2026-07-10', reviewedBy: 'Seder editorial demo'
    },
    {
      id: 'deuteronomy-6-7', status: 'approved', subjectId: 'gemara', stageId: 'source-chain',
      ref: 'Deuteronomy 6:7', url: 'https://www.sefaria.org/Deuteronomy.6.7',
      role: 'tanakh-source', note: 'Torah source used to trace the opening Berakhot discussion back to Shema.', reviewedAt: '2026-07-10', reviewedBy: 'Seder editorial demo'
    }
  ]
};

async function readLibrary(root) {
  const file = sourcesFile(root);
  if (!existsSync(file)) return structuredClone(starterLibrary);
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeLibrary(root, library) {
  await fs.writeFile(sourcesFile(root), JSON.stringify(library, null, 2), 'utf8');
}

export async function listSources(root, { subjectId, stageId, status = 'approved' } = {}) {
  const library = await readLibrary(root);
  return library.sources.filter((source) =>
    (!subjectId || source.subjectId === subjectId) &&
    (!stageId || source.stageId === stageId) &&
    (!status || source.status === status)
  );
}

export async function saveDiscovery(root, { subjectId, stageId, query, result }) {
  const library = await readLibrary(root);
  const candidate = {
    id: `candidate-${Date.now()}`,
    status: 'pending-review', subjectId, stageId, query,
    retrievedAt: new Date().toISOString(),
    retrieval: 'yochai', result
  };
  library.sources.push(candidate);
  await writeLibrary(root, library);
  return candidate;
}

export async function approveSource(root, id, changes = {}) {
  const library = await readLibrary(root);
  const source = library.sources.find((item) => item.id === id);
  if (!source) return null;
  Object.assign(source, changes, { status: 'approved', reviewedAt: new Date().toISOString() });
  delete source.result;
  await writeLibrary(root, library);
  return source;
}
