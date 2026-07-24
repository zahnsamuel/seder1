import { evaluateJlaGraduation } from './jla-graduation-evaluator.js';

const SECURE_STATUSES = new Set(['earned', 'stable', 'transfer-ready']);

export function buildJlaPathProgress({
  levels = [],
  skills = [],
  transcript = []
} = {}) {
  const evaluation = evaluateJlaGraduation({ levels, skills, transcript });
  const levelsById = new Map(levels.map((level) => [level.id, level]));
  const currentResult = evaluation.levelResults.find(
    ({ levelId }) => levelId === evaluation.currentLevel
  );

  return {
    currentLevel: levelsById.get(evaluation.currentLevel) || null,
    nextLevel: levelsById.get(evaluation.nextLevel) || null,
    earnedCapabilities: transcript
      .filter(
        ({ status, evidenceStatement }) =>
          SECURE_STATUSES.has(status) && evidenceStatement
      )
      .map(({ skillId, evidenceStatement, domain, status }) => ({
        skillId,
        statement: evidenceStatement,
        domain,
        status
      })),
    nextCapability: evaluation.nextMissingCapability
      ? {
          ...evaluation.nextMissingCapability,
          nextStep: `academy-session.html?skill=${encodeURIComponent(
            evaluation.nextMissingCapability.skillId
          )}`
        }
      : null,
    levelProgress: currentResult?.progress || 0,
    foundationComplete: evaluation.foundationComplete
  };
}
