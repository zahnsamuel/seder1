// Fold a completed educator-audit workbench export (docs/educator-audit-workbench.html "Export JSON")
// back into a canonical audit store the graph generators read. Pure and validating: it accepts only
// entries that reference real edges / skills / graduation gaps in the CURRENT graph version, so a
// stale or hand-mangled export can never inject rationales for edges that don't exist. Multiple
// educators' exports merge (later entries win per key); every accepted key records who it came from.

export function foldWorkbenchExport({ export: exp, graphVersion, edgeKeys, skillIds, gradIds, existing = null, source = 'import' }) {
  const errors = [];
  if (!exp || exp.workbench !== 'jla-educator-audit') errors.push('not a JLA educator-audit export (missing workbench: "jla-educator-audit").');
  if (exp && exp.graphVersion !== graphVersion) errors.push(`export is for graph ${exp.graphVersion || '(none)'}, current graph is ${graphVersion} — re-run the workbench on the current graph before importing.`);
  if (errors.length) return { errors, audit: existing, report: null };

  const audit = existing || { edgeRationales: {}, encompassingWeights: {}, misconceptions: {}, coverageDecisions: {}, sources: [] };
  for (const k of ['edgeRationales', 'encompassingWeights', 'misconceptions', 'coverageDecisions']) audit[k] ||= {};
  audit.graphVersion = graphVersion;
  audit.sources = [...(audit.sources || []), { source, at: new Date().toISOString(), exportedAt: exp.exportedAt || null }];

  const skipped = { edgeRationales: [], encompassingWeights: [], misconceptions: [], coverageDecisions: [] };
  let added = { edgeRationales: 0, encompassingWeights: 0, misconceptions: 0, coverageDecisions: 0 };

  for (const [key, text] of Object.entries(exp.edgeRationales || {})) {
    if (edgeKeys.has(key) && String(text || '').trim()) { audit.edgeRationales[key] = String(text).trim(); added.edgeRationales += 1; }
    else if (String(text || '').trim()) skipped.edgeRationales.push(key);
  }
  for (const [key, weight] of Object.entries(exp.encompassingWeights || {})) {
    const w = Number(weight);
    if (edgeKeys.has(key) && Number.isFinite(w) && w >= 0 && w <= 1) { audit.encompassingWeights[key] = w; added.encompassingWeights += 1; }
    else skipped.encompassingWeights.push(key);
  }
  for (const [skillId, m] of Object.entries(exp.misconceptions || {})) {
    const description = String(m?.description || '').trim();
    const signal = String(m?.signal || '').trim();
    if (skillIds.has(skillId) && description && signal) { audit.misconceptions[skillId] = { description, signal }; added.misconceptions += 1; }
    else if (description || signal) skipped.misconceptions.push(skillId);
  }
  for (const [gradId, decision] of Object.entries(exp.coverageDecisions || {})) {
    if (gradIds.has(gradId) && String(decision || '').trim()) { audit.coverageDecisions[gradId] = String(decision).trim(); added.coverageDecisions += 1; }
    else if (String(decision || '').trim()) skipped.coverageDecisions.push(gradId);
  }

  return {
    errors: [],
    audit,
    report: {
      added,
      skipped,
      totals: {
        edgeRationales: Object.keys(audit.edgeRationales).length,
        encompassingWeights: Object.keys(audit.encompassingWeights).length,
        misconceptions: Object.keys(audit.misconceptions).length,
        coverageDecisions: Object.keys(audit.coverageDecisions).length
      }
    }
  };
}
