// Validate and fold an item-authoring workbench export (docs/item-authoring-workbench.html) into the
// authored-items layer (data/foundation-authored-items.json). Pure — no I/O. Each authored item is a
// client-scorable recognition item for a fnd-* graph skill: a source ref, a stem, 2-5 distinct
// choices, and the index of the correct one. Invalid items are rejected with a reason, never silently
// dropped. A skill's validated items REPLACE its prior bank (skills absent from the export keep
// theirs), so re-authoring one skill never disturbs another — the same discipline as the audit fold.

export function itemProblem(item) {
  if (!item || typeof item !== 'object') return 'not-an-object';
  if (typeof item.stem !== 'string' || !item.stem.trim()) return 'empty-stem';
  const choices = item.choices;
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 5) return 'need-2-to-5-choices';
  const texts = choices.map((c) => (typeof c === 'string' ? c.trim() : ''));
  if (texts.some((t) => !t)) return 'empty-choice';
  if (new Set(texts).size !== texts.length) return 'duplicate-choices';
  if (!Number.isInteger(item.correct) || item.correct < 0 || item.correct >= choices.length) return 'correct-out-of-range';
  return null;
}

function normalizeItem(item) {
  return {
    sourceRef: typeof item.sourceRef === 'string' ? item.sourceRef.trim() : '',
    stem: item.stem.trim(),
    choices: item.choices.map((c) => c.trim()),
    correct: item.correct,
    feedback: typeof item.feedback === 'string' ? item.feedback.trim() : ''
  };
}

export function foldAuthoredItems(existing = {}, exportObj = {}, graphSkillIds = []) {
  const known = new Set(graphSkillIds);
  const authored = { ...existing };
  const rejected = [];
  const incoming = (exportObj && exportObj.items) || {};
  for (const [skill, items] of Object.entries(incoming)) {
    if (!known.has(skill)) { rejected.push({ skill, index: null, reason: 'unknown-skill' }); continue; }
    const valid = [];
    (Array.isArray(items) ? items : []).forEach((item, index) => {
      const reason = itemProblem(item);
      if (reason) rejected.push({ skill, index, reason });
      else valid.push(normalizeItem(item));
    });
    if (valid.length) authored[skill] = valid; // replace this skill's bank with the validated set
  }
  const bankSizes = Object.fromEntries(Object.entries(authored).map(([s, list]) => [s, list.length]));
  const banksComplete = Object.values(bankSizes).filter((n) => n >= 3).length;
  return { authored, rejected, bankSizes, banksComplete };
}
