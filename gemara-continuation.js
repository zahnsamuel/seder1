const learnerId = Seder.currentLearnerId();
const workbenchByStage = {
  'berakhot-baraita-disagreement': 'berakhot',
  'shabbat-tractate-arc': 'shabbat',
  'eruvin-tractate-arc': 'eruvin',
  'pesachim-tractate-arc': 'pesachim',
  'sukkah-tractate-arc': 'sukkah',
  'yoma-tractate-arc': 'yoma',
  'bava-metzia-tractate-arc': 'bava-metzia',
  'bava-kamma-tractate-arc': 'bava-kamma',
  'ketubot-tractate-arc': 'ketubot',
  'chullin-tractate-arc': 'chullin',
  'niddah-tractate-arc': 'niddah',
  'sanhedrin-tractate-arc': 'sanhedrin'
};
Promise.all([
  Seder.api('/api/curriculum/advanced-gemara-sequence').then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()),
  Seder.api(`/api/learners/${learnerId}/graph-practice`).then((response) => response.ok ? response.json() : { practice: null })
]).then(([sequence, learner, graph]) => {
  const done = new Set(learner.completedStages || []);
  let open = true;
  const practice = graph.practice ? `<p class="graph-practice">Your graph practice: <a href="${graph.practice.url}">${graph.practice.skill.title} in ${graph.practice.context || 'a new source'} →</a></p>` : '';
  const crossTractate = done.size >= 3 ? `<p class="graph-practice">You have entered enough tractates to test transfer: <a href="cross-tractate.html">practice recognizing the same reading move across Shas →</a></p>` : '';
  const foundations = ['pesachim-tractate-arc', 'eruvin-tractate-arc', 'sukkah-tractate-arc', 'yoma-tractate-arc'].every((stage) => done.has(stage)) ? `<p class="graph-practice">You have completed the four Foundations tractates: <a href="gemara-foundations.html">take the Gemara Foundations checkpoint →</a></p>` : '';
  const civilReasoning = ['bava-metzia-tractate-arc', 'bava-kamma-tractate-arc'].every((stage) => done.has(stage)) ? `<p class="graph-practice">You have completed the civil-law pair: <a href="civil-reasoning.html">take the Civil Reasoning checkpoint →</a></p>` : '';
  const shasLiteracy = sequence.steps.every((step) => done.has(step.stageId)) ? `<p class="graph-practice">You have completed every tractate in this sequence: <a href="shas-literacy-checkpoint.html">take the Shas literacy checkpoint →</a></p>` : '';
  const canonStudio = done.size >= 1 ? `<p class="graph-practice">These same reading habits apply beyond Gemara: <a href="canon-studio.html">practice distinguishing source moves across the whole canon →</a></p>` : '';
  document.querySelector('#arcs').innerHTML = `${practice}${crossTractate}${foundations}${civilReasoning}${shasLiteracy}${canonStudio}${sequence.steps.map((step, index) => {
    const complete = done.has(step.stageId);
    const current = !complete && open;
    open = open && complete;
    const workbench = workbenchByStage[step.stageId];
    return `<article class="${complete ? 'done' : ''} ${current ? 'current' : ''}"><b>${complete ? '✓' : index + 1}</b><div><span>${complete ? 'MASTERY EVIDENCE RECORDED' : current ? 'READY NOW' : 'NEXT TRACTATE'}</span><h2>${step.title}</h2><p>${step.reason}</p>${complete || current ? `<p class="workbench-link"><a href="daf-workbench.html?tractate=${workbench}">Practice on the Daf Workbench →</a></p>` : ''}</div>${complete || current ? `<a href="${step.url}">${complete ? 'Revisit →' : 'Begin course →'}</a>` : '<small>Locked</small>'}</article>`;
  }).join('')}`;
}).catch(() => {});
