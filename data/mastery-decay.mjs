// Math-Academy-style mastery decay: a skill's *displayed* strength fades over time
// without practice, even though the raw evidence (learner.mastery[skillId]) never
// shrinks. This is what should create the felt urgency to return to a skill --
// without it, "mastered" skills just sit at 100% forever and review becomes optional
// in feel, not only in the underlying spaced-repetition schedule.
//
// Pure functions, no I/O, so both the local (data/repository.mjs) and hosted
// (data/supabase-learner-repository.mjs) learner stores can share this logic.
// NOTE: the hosted/Supabase path does not yet persist a per-skill "last updated"
// timestamp (see data/supabase-learner-repository.mjs), so decay is only wired
// into the local demo-mode path for now. Adding a masteryUpdatedAt column/table
// to the Supabase schema would let the hosted path call this too.

const HALF_LIFE_DAYS = 21; // a skill loses half its displayed strength after ~3 weeks of no practice
const MIN_RETENTION = 0.12; // relearning is faster than learning from zero; never decay all the way to nothing

export function decayedMastery(rawScore, lastUpdatedIso) {
  const raw = Number(rawScore) || 0;
  if (raw <= 0) return 0;
  if (!lastUpdatedIso) return raw; // no timestamp on record (older data) -- do not penalize, just show raw
  const daysSince = Math.max(0, (Date.now() - new Date(lastUpdatedIso).getTime()) / 86400000);
  // Treat the first minute as fresh. Besides matching learner reality, this avoids
  // displaying a microscopic decay between recording an answer and rendering it.
  if (daysSince < (1 / 1440)) return raw;
  const decayed = raw * Math.pow(0.5, daysSince / HALF_LIFE_DAYS);
  const floor = raw * MIN_RETENTION;
  return Math.max(decayed, floor);
}

export function decayedMasteryMap(mastery = {}, masteryUpdatedAt = {}) {
  const result = {};
  for (const skillId of Object.keys(mastery)) {
    result[skillId] = decayedMastery(mastery[skillId], masteryUpdatedAt[skillId]);
  }
  return result;
}

// A skill is "fresh" if its decayed value is still close to its raw value, "fading"
// if decay has meaningfully eaten into it, and "faded" once it has dropped under the
// threshold that used to count as established (see repository.mjs's .67 gate).
export function freshnessOf(rawScore, decayed) {
  const raw = Number(rawScore) || 0;
  if (raw <= 0) return 'none';
  const ratio = decayed / raw;
  if (ratio >= 0.85) return 'fresh';
  if (ratio >= 0.5) return 'fading';
  return 'faded';
}
