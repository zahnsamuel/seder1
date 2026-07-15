const learnerId = Seder.currentLearnerId();
const gemaraProgressLink = document.createElement('p');
gemaraProgressLink.innerHTML = '<a href="gemara-mastery.html" style="color:#276b68;font:600 13px Inter,sans-serif">See your Gemara mastery journey →</a>';
document.querySelector('.hero').append(gemaraProgressLink);
Seder.api(`/api/learners/${learnerId}/journey`).then((response) => response.ok ? response.json() : null).then((journey) => {
  if (!journey) return;
  const panel = document.createElement('section');
  panel.className = 'phase-progress';
  panel.innerHTML = `<span>CANON PHASES</span><div>${journey.phases.map((phase) => `<article><b>${phase.checkpointComplete ? '✓' : phase.complete ? 'Checkpoint ready' : 'In progress'}</b><strong>${phase.title}</strong><small>${phase.checkpointComplete ? 'Phase mastery confirmed.' : phase.complete ? `<a href="phase-checkpoint.html?phase=${phase.id}">Open checkpoint →</a>` : `${journey.nodes.slice(phase.start, phase.end + 1).filter((node) => node.complete).length} of ${phase.end - phase.start + 1} moments complete`}</small></article>`).join('')}</div>`;
  document.querySelector('.hero').after(panel);
}).catch(() => {});
const tracks = document.querySelector('#tracks');
const names = { language: 'Language foundations', gemara: 'Gemara reasoning', thought: 'Jewish Thought' };
const links = { language: 'language.html', gemara: 'gemara-toolkit.html', thought: 'philosophy.html' };
const aliases = { 'hebrew-question-words': ['language-core', 'meimatai'], 'source-signals': ['dikhtiv', 'source'], 'mishnah-orientation': ['mishnah', 'orientation'], 'gemara-context-question': ['context-question', 'gemara-moves'], 'proof-role': ['proof', 'sourceReasoning'], 'challenge-and-answer': ['challenge', 'objection'], 'independent-sugya-reading': ['independent', 'transfer'], 'identify-conceptual-claim': ['thought-identify'], 'define-conceptual-term': ['thought-define'], 'compare-interpretations': ['compare-interpretations'], 'conceptual-application': ['conceptual-application'] };
function scoreFor(skill, learner) {
  // Prefer the decayed (currently-honest) score when available; fall back to raw
  // mastery for older records, then to fuzzy alias matching for skill ids that
  // predate the granular per-lesson naming.
  if (learner.mastery?.[skill.id] != null) {
    const raw = learner.mastery[skill.id];
    const decayed = learner.decayedMastery?.[skill.id];
    return { raw, score: decayed != null ? decayed : raw, matchedId: skill.id };
  }
  const matches = Object.entries(learner.mastery || {}).filter(([id]) => (aliases[skill.id] || []).some((alias) => id.includes(alias))).map(([id, score]) => ({ id, score }));
  if (!matches.length) return { raw: 0, score: 0, matchedId: null };
  const best = matches.reduce((a, b) => (b.score > a.score ? b : a));
  const decayed = learner.decayedMastery?.[best.id];
  return { raw: best.score, score: decayed != null ? decayed : best.score, matchedId: best.id };
}
function renderSkill(skill, learner, track) {
  const { raw, score, matchedId } = scoreFor(skill, learner);
  const fadingRatio = raw > 0 ? score / raw : 1;
  const isFading = raw >= .67 && fadingRatio < .85;
  const state = score >= .85 ? 'mastered' : isFading ? 'fading' : score > 0 ? 'developing' : 'ready';
  const label = score >= .85 ? 'Established' : isFading ? 'Fading — revisit soon' : score > 0 ? 'Developing' : 'Ready';
  // learner.evidence[skillId] is the set of distinct source contexts this skill has been
  // demonstrated in (see repository.mjs's transfer bonus). Surfacing the count makes that
  // signal visible instead of a silent backend-only mastery nudge.
  const contextCount = (matchedId && learner.evidence?.[matchedId]?.length) || 0;
  const transferNote = contextCount > 1 ? `<span class="transfer-badge">confirmed across ${contextCount} sources</span>` : '';
  return `<article class="skill"><i class="${state}"></i><div><strong>${skill.title}</strong><small>${label} · ${Math.round(score * 100)}%</small></div><em>${label}</em><p>${skill.evidence} <a href="${links[track]}">Practice →</a>${transferNote}</p></article>`;
}
Promise.all([
  Seder.api('/api/skill-graph').then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.json())
]).then(([graph, learner]) => {
  document.querySelector('#xp').textContent = `${learner.xp || 0} XP`;
  const gemaraSets = {
    'Gemara Foundations': ['foundations-word-context', 'foundations-measure-case', 'foundations-purpose-reasons', 'foundations-formulation', 'foundations-evidence-chain'],
    'Civil Reasoning': ['civil-claims-evidence', 'civil-procedure-purpose', 'civil-category-difference', 'civil-common-principle']
  };
  const score = (id) => learner.decayedMastery?.[id] ?? learner.mastery?.[id] ?? 0;
  const summaries = Object.entries(gemaraSets).map(([title, ids]) => ({ title, ids, established: ids.filter((id) => score(id) >= .67).length }));
  const allGemaraIds = Object.values(gemaraSets).flat();
  const weakest = allGemaraIds.sort((a, b) => score(a) - score(b))[0];
  const due = (learner.reviews || []).filter((item) => !item.dueAt || new Date(item.dueAt) <= new Date()).length;
  const next = summaries.find((item) => item.established < item.ids.length);
  const panel = document.createElement('section');
  panel.className = 'phase-progress gemara-dashboard';
  panel.innerHTML = `<span>YOUR GEMARA DASHBOARD</span><div>${summaries.map((item) => `<article><b>${item.established}/${item.ids.length}</b><strong>${item.title}</strong><small>${item.established === item.ids.length ? 'Established across the checkpoint.' : 'Keep building this repertoire.'}</small></article>`).join('')}<article><b>${due}</b><strong>Reviews due</strong><small>${due ? '<a href="weekly-review.html">Protect what you learned →</a>' : 'No due review at this moment.'}</small></article><article><b>Next</b><strong>${next?.title || 'Transfer practice'}</strong><small><a href="${next?.title === 'Civil Reasoning' ? 'civil-reasoning.html' : 'gemara-foundations.html'}">${weakest ? `Strengthen ${weakest.replace(/-/g, ' ')} →` : 'Try an unfamiliar source →'}</a></small></article></div>`;
  document.querySelector('.hero').after(panel);
  const groups = graph.skills.reduce((all, skill) => { (all[skill.track] ||= []).push(skill); return all; }, {});
  tracks.innerHTML = Object.entries(groups).map(([track, skills]) => `<section class="track"><span>${track.toUpperCase()}</span><h2>${names[track]}</h2><div class="skills">${skills.map((skill) => renderSkill(skill, learner, track)).join('')}</div></section>`).join('');
  const checkpoint = document.createElement('p');
  checkpoint.innerHTML = '<a href="source-map.html" style="color:#276b68;font-weight:600">Build an argument map on a live source →</a><br><br><a href="independent-read.html" style="color:#276b68;font-weight:600">Take an independent-reading checkpoint →</a>';
  tracks.after(checkpoint);
}).catch(() => { tracks.innerHTML = '<p>Mastery data is unavailable. Refresh to reconnect to your learning path.</p>'; });
