// Pilot instrumentation: turn the raw answer log into the psychometrics a pilot exists to produce —
// the numbers the static graph deliberately leaves null (docs/foundation-graph-schema.md, layers 4–5):
//
//   - item/skill DIFFICULTY   — the fraction who answer correctly (first-attempt P-value).
//   - DISCRIMINATION          — does the skill separate stronger from weaker learners (point-biserial)?
//   - empirical EDGE VALIDATION — the whole thesis: do learners who SECURED a prerequisite pass the
//                                 dependent skill more often than those who did not? (the "lift").
//
// Pure and offline: it replays each learner's answer events in time order over the graph, so it can
// tell whether a prerequisite was secured at the moment the dependent skill was first attempted. The
// server feeds it every learner (behind the operator admin token). Reconstructed mastery uses the same
// step as the repository (+0.34 correct / +0.08 incorrect, capped) — an approximation good enough to
// bucket responses; real IRT calibration comes with pilot scale.

const SECURE = 0.67;
const step = (correct) => (correct ? 0.34 : 0.08);
const round = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);

export function computeGraphPilotAnalytics(learners, graph, { minResponses = 5 } = {}) {
  const graphIds = new Set(graph.skills.map((s) => s.id));
  const prereqsOf = new Map(graph.skills.map((s) => [s.id, s.prerequisites || []]));

  const perSkill = {};        // id -> { attempts, correct, first: [{ learner, correct }] }
  const perKp = {};           // kpId -> { attempts, correct }
  const edgeStats = {};       // `from->to` -> { secured:{n,pass}, unsecured:{n,pass} }
  const abilityRaw = {};      // learner -> { n, correct } over first attempts (a simple ability proxy)
  const ensure = (id) => (perSkill[id] ||= { attempts: 0, correct: 0, first: [] });

  for (const learner of learners) {
    const events = (learner.events || [])
      .filter((e) => e.type === 'answer_submitted' && graphIds.has(e.skillId))
      .slice()
      .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
    const mastery = {};
    const seen = new Set();
    for (const e of events) {
      const sid = e.skillId;
      const correct = !!e.correct;
      const secured = (id) => (mastery[id] || 0) >= SECURE;

      const rec = ensure(sid);
      rec.attempts += 1;
      if (correct) rec.correct += 1;

      if (!seen.has(sid)) { // first attempt: the clean signal for difficulty, discrimination, edges
        rec.first.push({ learner: learner.id, correct });
        (abilityRaw[learner.id] ||= { n: 0, correct: 0 }).n += 1;
        if (correct) abilityRaw[learner.id].correct += 1;
        for (const p of prereqsOf.get(sid) || []) {
          const key = `${p}->${sid}`;
          const es = (edgeStats[key] ||= { secured: { n: 0, pass: 0 }, unsecured: { n: 0, pass: 0 } });
          const bucket = secured(p) ? es.secured : es.unsecured;
          bucket.n += 1;
          if (correct) bucket.pass += 1;
        }
        seen.add(sid);
      }

      if (e.knowledgePointId) {
        const k = (perKp[e.knowledgePointId] ||= { attempts: 0, correct: 0 });
        k.attempts += 1;
        if (correct) k.correct += 1;
      }

      mastery[sid] = Math.min(1, (mastery[sid] || 0) + step(correct));
    }
  }

  const ability = {};
  for (const [id, a] of Object.entries(abilityRaw)) ability[id] = a.n ? a.correct / a.n : 0;

  const skills = graph.skills.map((s) => {
    const rec = perSkill[s.id] || { attempts: 0, correct: 0, first: [] };
    const n = rec.first.length;
    const firstCorrect = rec.first.filter((f) => f.correct).length;
    return {
      skill: s.id, layer: s.layer,
      responses: rec.attempts, learners: n,
      difficulty: n ? round(firstCorrect / n) : null,               // first-attempt P-value (higher = easier)
      difficultyAllAttempts: rec.attempts ? round(rec.correct / rec.attempts) : null,
      discrimination: pointBiserial(rec.first, ability),
      enough: n >= minResponses
    };
  });

  const edges = Object.entries(edgeStats).map(([key, v]) => {
    const [from, to] = key.split('->');
    const ps = v.secured.n ? v.secured.pass / v.secured.n : null;
    const pu = v.unsecured.n ? v.unsecured.pass / v.unsecured.n : null;
    return {
      from, to,
      passWhenSecured: round(ps), nSecured: v.secured.n,
      passWhenNotSecured: round(pu), nUnsecured: v.unsecured.n,
      lift: (ps != null && pu != null) ? round(ps - pu) : null,     // >0 means the prerequisite predicts success
      enough: v.secured.n >= minResponses && v.unsecured.n >= minResponses
    };
  });

  const knowledgePoints = Object.entries(perKp).map(([id, v]) => ({ id, responses: v.attempts, difficulty: round(v.correct / v.attempts) }));
  const totalResponses = Object.values(perSkill).reduce((a, r) => a + r.attempts, 0);

  return {
    note: 'First-pass classical item analysis over the foundation graph. Difficulty = first-attempt P-value; '
      + 'discrimination = point-biserial vs a simple ability proxy; edge lift = pass rate when the prerequisite '
      + 'was secured minus when it was not. `enough` flags whether the sample meets minResponses. Real IRT and '
      + 'confident edge validation need pilot-scale data.',
    minResponses,
    summary: {
      learners: learners.length,
      responses: totalResponses,
      skillsWithEnoughData: skills.filter((s) => s.enough).length,
      skillsTotal: graph.skills.length,
      edgesValidatable: edges.filter((e) => e.enough).length,
      edgesConfirmingPrerequisite: edges.filter((e) => e.enough && e.lift != null && e.lift > 0).length
    },
    skills, edges, knowledgePoints
  };
}

// Point-biserial correlation between getting a skill's first attempt right and overall ability.
function pointBiserial(first, ability) {
  const n = first.length;
  if (n < 3) return null;
  const scores = first.map((f) => ability[f.learner] ?? 0);
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  if (!sd) return null;
  const right = first.filter((f) => f.correct);
  const wrong = first.filter((f) => !f.correct);
  if (!right.length || !wrong.length) return null;
  const m1 = right.reduce((a, f) => a + (ability[f.learner] ?? 0), 0) / right.length;
  const m0 = wrong.reduce((a, f) => a + (ability[f.learner] ?? 0), 0) / wrong.length;
  const p = right.length / n;
  return round(((m1 - m0) / sd) * Math.sqrt(p * (1 - p)));
}
