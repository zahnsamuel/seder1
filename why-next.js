(() => {
  const learnerId = Seder.currentLearnerId();
  const $ = (selector) => document.querySelector(selector);
  function percent(value) { return `${Math.round((value || 0) * 100)}%`; }
  Promise.all([Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null), Seder.api(`/api/learners/${learnerId}/graph-practice`).then((response) => response.ok ? response.json() : null)])
    .then(([learner, graph]) => {
      const practice = graph?.practice; if (!learner || !practice?.skill) return;
      const skill = practice.skill, evidence = learner.evidence || {}, mastery = learner.mastery || {};
      const prerequisites = (skill.prerequisites || []).map((id) => `<li class="${(mastery[id] || 0) >= .67 ? 'ready' : ''}">${id.replaceAll('-', ' ')} <b>${percent(mastery[id])}</b></li>`).join('') || '<li class="ready">This is a foundation skill.</li>';
      const sources = evidence[skill.id] || [];
      const panel = document.createElement('section'); panel.className = 'why-next';
      panel.innerHTML = `<p class="lesson-label">WHY THIS IS NEXT</p><h2>${skill.title}</h2><p>${practice.reason}</p><div><strong>Prerequisites</strong><ul>${prerequisites}</ul></div><div><strong>Your evidence</strong><p>${sources.length ? `You have used this move in ${sources.length} source context${sources.length === 1 ? '' : 's'}: ${sources.slice(0, 2).join('; ')}.` : 'No source evidence yet—this is the right place to begin.'}</p></div><div><strong>Transfer goal</strong><p>${skill.masteryCriteria || skill.evidence}</p></div>`;
      $('#reason').after(panel);
    }).catch(() => {});
})();
