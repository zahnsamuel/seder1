const learnerId = Seder.currentLearnerId();
const xp = document.querySelector('#xp');
xp.textContent = '';
const readableSkill = (skill) => skill.replace(/^lab-/, '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/recommendation`).then((response) => response.ok ? response.json() : Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/review`).then((response) => response.ok ? response.json() : Promise.reject()),
  fetch('data/foundation-skill-graph.json').then((response) => response.json())
]).then(([learner, decision, review, graph]) => {
  const completed = new Set(learner.completedStages || []);
  const stageState = {
    source: completed.size > 0,
    sugya: [...completed].some((stage) => /berakhot|shabbat|pesachim/.test(stage)),
    foundation: ['foundation-capstone', 'term-two-capstone', 'second-foundation-synthesis'].some((stage) => completed.has(stage)),
    canon: completed.size >= 5,
    transfer: [...completed].some((stage) => /independent|transfer|capstone/.test(stage)),
    reader: completed.size >= 12
  };
  const establishedMilestones = Object.values(stageState).filter(Boolean).length;
  const pathStatus = document.querySelector('#path-status');
  if (pathStatus) pathStatus.textContent = `${establishedMilestones} of 6 milestones established · evidence, not self-report, moves this path forward.`;
  let activeMilestone = false;
  document.querySelectorAll('.path button[data-stage]').forEach((button) => {
    const done = stageState[button.dataset.stage];
    button.classList.toggle('done', done);
    button.classList.toggle('active', !done && !activeMilestone);
    if (!done && !activeMilestone) { button.setAttribute('aria-current', 'step'); activeMilestone = true; }
    else button.removeAttribute('aria-current');
  });
  // Header and capability graph speak in capabilities, not XP: what the learner can now do.
  const capabilityCounts = Seder.summarizeCapabilities(learner.capabilityEvidence);
  const onOwn = capabilityCounts.secure + capabilityCounts.transferable + capabilityCounts.durable;
  xp.textContent = onOwn ? `${onOwn} on your own` : '';
  const capChips = document.querySelector('#capChips');
  if (capChips) {
    const order = ['emerging', 'secure', 'transferable', 'durable'];
    const chips = order.filter((state) => capabilityCounts[state] > 0)
      .map((state) => `<span class="cap-chip cap-${state}"><b>${capabilityCounts[state]}</b> ${Seder.capabilityStates[state].label}</span>`).join('');
    capChips.innerHTML = chips || '<span class="cap-chip cap-none">No capabilities demonstrated yet — start below.</span>';
  }
  const foundationScores = learner.foundationScores || {};
  const mastery = learner.mastery || {};
  const skills = graph.skills || [];
  const isSecure = (id) => Math.max(foundationScores[id] || 0, mastery[id] || 0) >= .67;
  // One next move, in plain words — no raw "N of 49 secure" fraction to collide with the
  // capability chips above (which count a different id space) or discourage a new learner.
  const nextSkill = skills.find((skill) => !isSecure(skill.id) && (skill.prerequisites || []).every(isSecure)) || skills.find((skill) => !isSecure(skill.id));
  // Explainable recommendation: ground the "why this next" in the graph — the secured move it
  // builds on and the move it unlocks. (You can do A → build B now → which opens C.)
  const explainNextSkill = (skill) => {
    const secured = (skill.prerequisites || []).map((id) => skills.find((s) => s.id === id)).filter((s) => s && isSecure(s.id));
    const unlocks = skills.filter((s) => (s.prerequisites || []).includes(skill.id));
    const have = secured.length
      ? `Builds on <b>${escapeHtml(secured[0].title)}</b>, which you’ve secured`
      : 'Your first reading move — nothing has to come before it';
    const opens = unlocks.length
      ? `it unlocks <b title="${escapeHtml(unlocks[0].statement || '')}">${escapeHtml(unlocks[0].title)}</b>`
      : 'it completes this layer';
    return `${have}, and ${opens}.`;
  };
  const skillCard = document.querySelector('#skill-progress-card');
  if (skillCard && nextSkill) {
    const layer = graph.layers?.find((item) => item.n === nextSkill.layer);
    skillCard.innerHTML = `<div><span>LAYER ${nextSkill.layer} · ${escapeHtml(layer?.title || 'FOUNDATION')}</span><strong>${escapeHtml(nextSkill.title)}</strong><small>${escapeHtml(nextSkill.statement)}</small><p class="why-next"><span>WHY NOW</span>${explainNextSkill(nextSkill)}</p></div><a href="academy-session.html?skill=${encodeURIComponent(nextSkill.id)}">Practice →</a>`;
    document.querySelector('#skill-progress-copy').textContent = `Your evidence places you in ${escapeHtml(layer?.title || 'the next foundation layer')}. One capability is ready to practice now.`;
  } else if (skillCard) {
    skillCard.innerHTML = '<strong>Foundation skills established. Choose a new source to transfer them.</strong><a href="independent-reading.html">Transfer →</a>';
  }
  const recommendation = decision.recommendation;
  const today = document.querySelector('.today');
  today.querySelector('div').innerHTML = `<span>NEXT BEST STEP</span><strong>${recommendation.title}</strong><small>${recommendation.reason}</small>`;
  const action = today.querySelector('a'); action.href = recommendation.url; action.textContent = recommendation.kind === 'placement' ? 'Find my starting point →' : 'Start this step →';
  const daily = document.querySelector('.intro .primary'); daily.href = 'daily-router.html'; daily.textContent = recommendation.kind === 'placement' ? 'Begin my starting session →' : 'Begin today’s session →';
  if (review.due.length) {
    document.querySelector('#review-section').hidden = false;
    document.querySelector('#review-count').textContent = `${review.due.length} READY NOW`;
    // One thing at a time: show a few due skills for texture, then a single way in. The review
    // session (review.html) walks the full queue one at a time, strongest need first — listing
    // every due card here just overwhelms (and each card linked to the same place anyway).
    const preview = review.due.slice(0, 3);
    const remaining = review.due.length - preview.length;
    const previewCards = preview.map((item) => `<article class="review-card"><div><span>RETRIEVAL REVIEW</span><strong>${readableSkill(item.skillId)}</strong><small>${item.reason}</small></div></article>`).join('');
    const startCard = `<article class="review-card review-start"><div><span>RETENTION SESSION</span><strong>${remaining > 0 ? `And ${remaining} more ready to bring back` : 'Bring these back'}</strong><small>Your review session revisits them one at a time, strongest need first.</small></div><a class="primary" href="review.html">Start review →</a></article>`;
    document.querySelector('#review-list').innerHTML = previewCards + startCard;
  }
}).catch(() => {});

document.querySelectorAll('.path button').forEach((node) => node.addEventListener('click', () => {
  document.querySelectorAll('.path button').forEach((item) => item.classList.toggle('active', item === node));
  document.querySelector('#detail').innerHTML = `<span>MASTERY TARGET</span><h2>${node.dataset.name}</h2><p>${node.dataset.text}</p><a class="primary" href="study.html?v=11">Practice this skill →</a>`;
}));
