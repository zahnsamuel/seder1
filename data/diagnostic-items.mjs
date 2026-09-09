// Placement probes: real authored checks, never self-report.
// L0 Hebrew-decoding skills are not probeable here (no invented glyph banks);
// those live on hebrew-decoding.html. Skills without an authored item are skipped
// until a bank exists — the estimator still infers them as known/unreachable
// from checks that do exist.

const DECODE_PREFIX = 'fnd-decode-';

export function isDecodeSkill(id) {
  return String(id || '').startsWith(DECODE_PREFIX);
}

export function authoredBankFor(skillId, items = {}) {
  const bank = items[skillId];
  return Array.isArray(bank) && bank.length ? bank : [];
}

export function isProbeableSkill(id, items = {}) {
  if (!id || isDecodeSkill(id)) return false;
  return authoredBankFor(id, items).length > 0;
}

export function probeableSkillIds(graph, items = {}) {
  return (graph?.skills || []).map((skill) => skill.id).filter((id) => isProbeableSkill(id, items));
}

export function pickDiagnosticItem(skillId, items = {}, seed = 0) {
  const bank = authoredBankFor(skillId, items);
  if (!bank.length) return null;
  const n = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 0;
  const item = bank[n % bank.length];
  if (!item || !Array.isArray(item.choices) || item.choices.length < 2) return null;
  const correct = Number(item.correct);
  if (!Number.isInteger(correct) || correct < 0 || correct >= item.choices.length) return null;
  return {
    sourceRef: item.sourceRef || '',
    stem: String(item.stem || '').trim(),
    choices: item.choices.slice(),
    correct,
    feedback: item.feedback || ''
  };
}

export function diagnosticTeachFor(skillId, teachFile = {}) {
  const teach = teachFile?.teach && typeof teachFile.teach === 'object' ? teachFile.teach : teachFile;
  const text = teach && typeof teach === 'object' ? teach[skillId] : '';
  return String(text || '').trim();
}
