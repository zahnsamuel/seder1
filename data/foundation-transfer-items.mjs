// Validate foundation transfer items against data/foundation-transfer-items.schema.json.
// Pure — no I/O. Examples are illustrations; they never count as production coverage.
// Recognition banks stay in data/foundation-authored-items.json (Claude).

import { itemProblem } from './item-authoring-fold.mjs';

export const SOURCE_FAMILIES = Object.freeze([
  'tanakh', 'rabbinic', 'halakhic', 'liturgical', 'thought', 'historical'
]);

export const FILE_STATUSES = Object.freeze(['examples-only', 'draft', 'ready']);
export const ITEM_STATUSES = Object.freeze(['example', 'draft', 'ready']);

const ID_RE = /^(example-xfer|xfer)-fnd-[a-z0-9-]+-[0-9]+$/;
const SKILL_RE = /^fnd-[a-z0-9-]+$/;
const SEFARIA_RE = /^https:\/\/www\.sefaria\.org\//;
const HEBREW = /[\u0590-\u05FF]/;

export function transferItemProblem(item, {
  graphSkillIds = null,
  starterSkillIds = null,
  requireExample = false
} = {}) {
  if (!item || typeof item !== 'object') return 'not-an-object';
  if (typeof item.id !== 'string' || !ID_RE.test(item.id)) return 'bad-id';
  if (typeof item.skill !== 'string' || !SKILL_RE.test(item.skill)) return 'bad-skill';
  if (graphSkillIds && !graphSkillIds.has(item.skill)) return 'unknown-skill';
  if (starterSkillIds && !starterSkillIds.has(item.skill)) return 'not-starter-skill';
  if (item.type !== 'transfer') return 'type-must-be-transfer';
  if (!ITEM_STATUSES.includes(item.status)) return 'bad-status';
  if (requireExample && item.status !== 'example') return 'examples-file-must-be-example';
  if (item.status === 'example' && !item.id.startsWith('example-xfer-')) return 'example-id-prefix';
  if (item.status !== 'example' && item.id.startsWith('example-xfer-')) return 'ready-id-must-drop-example-prefix';
  if (typeof item.label !== 'string' || !item.label.trim()) return 'empty-label';
  if (item.status === 'example' && !/EXAMPLE/i.test(item.label)) return 'example-label-missing';
  if (typeof item.loadIntoAcademy !== 'boolean') return 'loadIntoAcademy-not-boolean';
  if (item.status === 'example' && item.loadIntoAcademy !== false) return 'example-must-not-load';
  if (typeof item.sourceRef !== 'string' || !item.sourceRef.trim()) return 'empty-sourceRef';
  if (typeof item.sefariaUrl !== 'string' || !SEFARIA_RE.test(item.sefariaUrl)) return 'bad-sefariaUrl';
  if (!SOURCE_FAMILIES.includes(item.sourceFamily)) return 'bad-sourceFamily';
  if (!Array.isArray(item.practicedFamilies) || item.practicedFamilies.length < 1) return 'need-practicedFamilies';
  if (item.practicedFamilies.some((f) => !SOURCE_FAMILIES.includes(f))) return 'bad-practicedFamily';
  if (new Set(item.practicedFamilies).size !== item.practicedFamilies.length) return 'duplicate-practicedFamilies';
  if (item.practicedFamilies.includes(item.sourceFamily)) return 'sourceFamily-already-practiced';
  if (typeof item.whyTransfer !== 'string' || item.whyTransfer.trim().length < 40) return 'whyTransfer-too-short';
  const shape = itemProblem({
    stem: item.stem,
    choices: item.choices,
    correct: item.correct,
    feedback: item.feedback
  });
  if (shape) return shape;
  if (typeof item.feedback !== 'string' || item.feedback.trim().length < 25) return 'feedback-too-short';
  if (!HEBREW.test(item.stem)) return 'stem-missing-hebrew-excerpt';
  if (item.misconceptions != null && !Array.isArray(item.misconceptions)) return 'misconceptions-not-array';
  if (item.difficulty != null && typeof item.difficulty !== 'number') return 'bad-difficulty';
  if (item.discrimination != null && typeof item.discrimination !== 'number') return 'bad-discrimination';
  const expectedIdTail = `${item.skill}-`;
  if (!item.id.includes(expectedIdTail)) return 'id-skill-mismatch';
  return null;
}

export function transferFileProblem(file, opts = {}) {
  if (!file || typeof file !== 'object') return 'file-not-an-object';
  if (typeof file.schemaVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(file.schemaVersion)) return 'bad-schemaVersion';
  if (!FILE_STATUSES.includes(file.status)) return 'bad-file-status';
  if (typeof file.loadIntoAcademy !== 'boolean') return 'file-loadIntoAcademy-not-boolean';
  if (typeof file.note !== 'string' || file.note.trim().length < 40) return 'file-note-too-short';
  if (!Array.isArray(file.items)) return 'items-not-array';
  if (file.status === 'examples-only') {
    if (file.loadIntoAcademy !== false) return 'examples-file-must-not-load';
    if (file.items.length < 1) return 'examples-file-empty';
    if (file.items.length > 2) return 'examples-file-too-many';
  }
  return null;
}

export function validateTransferFile(file, opts = {}) {
  const fileReason = transferFileProblem(file, opts);
  if (fileReason) return { ok: false, rejected: [{ skill: null, index: null, reason: fileReason }] };
  const requireExample = file.status === 'examples-only' || opts.requireExample;
  const rejected = [];
  const ids = new Set();
  file.items.forEach((item, index) => {
    const reason = transferItemProblem(item, { ...opts, requireExample });
    if (reason) rejected.push({ skill: item?.skill || null, index, reason });
    else if (ids.has(item.id)) rejected.push({ skill: item.skill, index, reason: 'duplicate-id' });
    else ids.add(item.id);
  });
  return { ok: rejected.length === 0, rejected };
}
