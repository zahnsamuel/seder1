const learnerId = Seder.currentLearnerId();
const workbenchByStage = {
  'berakhot-baraita-disagreement': 'berakhot',
  'shabbat-tractate-arc': 'shabbat',
  'eruvin-tractate-arc': 'eruvin',
  'pesachim-tractate-arc': 'pesachim',
  'sukkah-tractate-arc': 'sukkah',
  'bava-metzia-tractate-arc': 'bava',
  'bava-kamma-tractate-arc': 'bava-kamma',
  'ketubot-tractate-arc': 'ketubot',
  'chullin-tractate-arc': 'chullin',
  'niddah-tractate-arc': 'niddah'
};
Promise.all([
  Seder.api('/api/curriculum/advanced-gemara-sequence').then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}/graph-practice`).then((response) => response.ok ? response.json() : { practice: null })
]).then(([sequence, learner, graph]) => {
  const done = new Set(learner.completedStages || []);
  let open = true;
  const practice = graph.practice ? `<p class="graph-practice">Your graph practice: <a href="${graph.practice.url}">${graph.practice.skill.title} in ${graph.practice.context || 'a new source'} →</a></p>` : '';
  document.querySelector('#arcs').innerHTML = `${practice}${sequence.steps.map((step, index) => {
    const complete = done.has(step.stageId);
    const current = !complete && open;
    open = open && complete;
    const workbench = workbenchByStage[step.stageId];
    return `<article class="${complete ? 'done' : ''} ${current ? 'current' : ''}"><b>${complete ? '✓' : index + 1}</b><div><span>${complete ? 'MASTERY EVIDENCE RECORDED' : current ? 'READY NOW' : 'NEXT TRACTATE'}</span><h2>${step.title}</h2><p>${step.reason}</p>${complete || current ? `<p class="workbench-link"><a href="daf-workbench.html?tractate=${workbench}">Practice on the Daf Workbench →</a></p>` : ''}</div>${complete || current ? `<a href="${step.url}">${complete ? 'Revisit →' : 'Begin course →'}</a>` : '<small>Locked</small>'}</article>`;
  }).join('')}`;
}).catch(() => {});
