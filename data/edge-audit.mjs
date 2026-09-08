// Starter-set edge-rationale / misconception audit helpers.
// Software cannot invent pedagogical claims (docs/skill-graph-north-star.md #9).
// This module inventories the frozen starter edges, validates the fillable stub
// (data/foundation-edge-audit.json), and converts educator-written records into
// the existing workbench export that `npm run graph:import` already folds in.

export const STUB_KIND = 'jla-foundation-edge-audit';
export const WORKBENCH_EXPORT = 'jla-educator-audit';
export const EXAMPLE_ID_PREFIX = 'example-';

export function edgeKey(from, to) {
  return `${from}::${to}`;
}

export function isExampleId(id) {
  return String(id || '').startsWith(EXAMPLE_ID_PREFIX);
}

export function starterIdsOf(starterSet) {
  return new Set((starterSet.starterSet || []).map((s) => s.id));
}

export function starterPrerequisiteEdges(starterIds, edgeLayer) {
  const ids = starterIds instanceof Set ? starterIds : new Set(starterIds);
  return (edgeLayer.edges || []).filter((e) => e.type === 'prerequisite' && ids.has(e.from) && ids.has(e.to));
}

export function starterAuditInventory(graph, starterSet, edgeLayer) {
  const starterIds = starterIdsOf(starterSet);
  const titleOf = new Map(graph.skills.map((s) => [s.id, s.title]));
  const skillOf = new Map(graph.skills.map((s) => [s.id, s]));
  const edges = starterPrerequisiteEdges(starterIds, edgeLayer).map((e) => ({
    id: edgeKey(e.from, e.to),
    from: e.from,
    to: e.to,
    fromTitle: titleOf.get(e.from) || e.from,
    toTitle: titleOf.get(e.to) || e.to,
    rationale: e.rationale ?? null
  }));
  const incoming = new Map();
  for (const e of edges) {
    const list = incoming.get(e.to) || [];
    list.push(e);
    incoming.set(e.to, list);
  }
  const skills = (starterSet.starterSet || [])
    .slice()
    .sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id))
    .map((s) => {
      const full = skillOf.get(s.id) || {};
      return {
        id: s.id,
        layer: s.layer,
        band: s.band,
        title: s.title,
        statement: full.statement || '',
        repair: full.repair || '',
        incoming: incoming.get(s.id) || []
      };
    });
  return {
    graphVersion: graph.version,
    skills,
    edges,
    counts: { skills: skills.length, edges: edges.length, misconceptions: skills.length }
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : null;
}

export function validateEdgeAuditStub(stub, { graphVersion, skillIds, edgeKeys } = {}) {
  const errors = [];
  if (!stub || typeof stub !== 'object' || Array.isArray(stub)) {
    return ['stub must be a JSON object'];
  }
  if (stub.kind !== STUB_KIND) errors.push(`kind must be "${STUB_KIND}"`);
  if (!stub.schemaVersion) errors.push('schemaVersion is required');
  if (graphVersion && stub.graphVersion !== graphVersion) {
    errors.push(`graphVersion is ${stub.graphVersion || '(none)'}, current graph is ${graphVersion}`);
  }
  if (stub.scope !== 'starter-set') errors.push('scope must be "starter-set"');
  if (!stub.schema || typeof stub.schema !== 'object') errors.push('schema describing record shapes is required');
  else {
    for (const key of ['edgeRationale', 'misconception']) {
      if (!stub.schema[key] || typeof stub.schema[key] !== 'object') errors.push(`schema.${key} is required`);
    }
  }

  const rationales = asArray(stub.edgeRationales);
  const misconceptions = asArray(stub.misconceptions);
  const examples = asArray(stub.examples);
  if (!rationales) errors.push('edgeRationales must be an array');
  if (!misconceptions) errors.push('misconceptions must be an array');
  if (!examples) errors.push('examples must be an array');
  if (errors.length) return errors;

  for (const [i, ex] of examples.entries()) {
    if (ex?.example !== true) errors.push(`examples[${i}] must set example: true`);
    const ids = [ex?.from, ex?.to, ex?.skill, ex?.id].filter(Boolean);
    for (const id of ids) {
      if (skillIds?.has(id)) errors.push(`examples[${i}] uses real skill id ${id} — examples must stay on ${EXAMPLE_ID_PREFIX}* ids`);
      if (id.startsWith('fnd-')) errors.push(`examples[${i}] uses a foundation id ${id} — do not attach example copy to real skills`);
    }
  }

  for (const [i, row] of rationales.entries()) {
    if (row?.example === true) {
      errors.push(`edgeRationales[${i}] is marked example; put format illustrations in examples[]`);
      continue;
    }
    const from = String(row?.from || '').trim();
    const to = String(row?.to || '').trim();
    const rationale = String(row?.rationale || '').trim();
    if (!from || !to || !rationale) {
      errors.push(`edgeRationales[${i}] needs from, to, and rationale`);
      continue;
    }
    if (isExampleId(from) || isExampleId(to)) {
      errors.push(`edgeRationales[${i}] uses example ids — real fills must cite starter fnd- skills`);
      continue;
    }
    if (edgeKeys && !edgeKeys.has(edgeKey(from, to))) {
      errors.push(`edgeRationales[${i}] ${edgeKey(from, to)} is not a starter prerequisite edge`);
    }
  }

  for (const [i, row] of misconceptions.entries()) {
    if (row?.example === true) {
      errors.push(`misconceptions[${i}] is marked example; put format illustrations in examples[]`);
      continue;
    }
    const skill = String(row?.skill || '').trim();
    const description = String(row?.description || '').trim();
    const signal = String(row?.signal || '').trim();
    if (!skill || !description || !signal) {
      errors.push(`misconceptions[${i}] needs skill, description, and signal`);
      continue;
    }
    if (isExampleId(skill)) {
      errors.push(`misconceptions[${i}] uses an example id — real fills must cite a starter fnd- skill`);
      continue;
    }
    if (skillIds && !skillIds.has(skill)) {
      errors.push(`misconceptions[${i}] skill ${skill} is not in the graph`);
    }
  }

  return errors;
}

export function authoredFromStub(stub) {
  const edgeRationales = {};
  const misconceptions = {};
  for (const row of stub.edgeRationales || []) {
    if (row?.example === true) continue;
    const from = String(row?.from || '').trim();
    const to = String(row?.to || '').trim();
    const rationale = String(row?.rationale || '').trim();
    if (!from || !to || !rationale || isExampleId(from) || isExampleId(to)) continue;
    edgeRationales[edgeKey(from, to)] = rationale;
  }
  for (const row of stub.misconceptions || []) {
    if (row?.example === true) continue;
    const skill = String(row?.skill || '').trim();
    const description = String(row?.description || '').trim();
    const signal = String(row?.signal || '').trim();
    if (!skill || !description || !signal || isExampleId(skill)) continue;
    misconceptions[skill] = { description, signal };
  }
  return { edgeRationales, misconceptions };
}

export function toWorkbenchExport(stub, { graphVersion, exportedAt = new Date().toISOString() } = {}) {
  const authored = authoredFromStub(stub);
  return {
    workbench: WORKBENCH_EXPORT,
    graphVersion: graphVersion || stub.graphVersion,
    exportedAt,
    edgeRationales: authored.edgeRationales,
    encompassingWeights: {},
    misconceptions: authored.misconceptions,
    coverageDecisions: {}
  };
}

export function stateToWorkbenchExport(state, { graphVersion, exportedAt = new Date().toISOString() } = {}) {
  const edgeRationales = {};
  for (const [key, text] of Object.entries(state.rationales || {})) {
    if (isExampleId(key) || key.startsWith(`${EXAMPLE_ID_PREFIX}`)) continue;
    const trimmed = String(text || '').trim();
    if (trimmed) edgeRationales[key] = trimmed;
  }
  const misconceptions = {};
  for (const [skill, m] of Object.entries(state.misconceptions || {})) {
    if (isExampleId(skill) || skill.startsWith('fnd-') === false) continue;
    const description = String(m?.description || '').trim();
    const signal = String(m?.signal || '').trim();
    if (description && signal) misconceptions[skill] = { description, signal };
  }
  return {
    workbench: WORKBENCH_EXPORT,
    graphVersion,
    exportedAt,
    edgeRationales,
    encompassingWeights: {},
    misconceptions,
    coverageDecisions: {}
  };
}
