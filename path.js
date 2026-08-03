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
  // Your knowledge frontier (Math Academy Way): the moves you are ready for right now — not yet
  // secured, but every prerequisite is. Show them all as choices, not one prescribed step.
  const frontier = skills.filter((skill) => !isSecure(skill.id) && (skill.prerequisites || []).every(isSecure)).sort((a, b) => a.layer - b.layer);
  const masteredCount = skills.filter((skill) => isSecure(skill.id)).length;
  const aheadCount = skills.length - masteredCount - frontier.length;
  // Ground each choice in the graph — the secured move it builds on and the move it unlocks.
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
  const copy = document.querySelector('#skill-progress-copy');
  const title = document.querySelector('#skill-progress-title');
  if (skillCard && frontier.length) {
    const shown = frontier.slice(0, 6);
    skillCard.innerHTML = shown.map((skill) => {
      const layer = graph.layers?.find((item) => item.n === skill.layer);
      // Layer-0 decoding skills route to the real glyph drills (which now record graph mastery);
      // everything else opens the scaffolded knowledge-point lesson.
      const practiceUrl = skill.id.startsWith('fnd-decode-') ? 'hebrew-decoding.html' : `academy-session.html?skill=${encodeURIComponent(skill.id)}`;
      return `<article class="frontier-card"><span>LAYER ${skill.layer} · ${escapeHtml((layer?.title || 'FOUNDATION').toUpperCase())}</span><strong>${escapeHtml(skill.title)}</strong><small>${escapeHtml(skill.statement)}</small><p class="why-next"><span>WHY NOW</span>${explainNextSkill(skill)}</p><a href="${practiceUrl}">Practice →</a></article>`;
    }).join('') + (frontier.length > shown.length ? `<p class="frontier-more">and ${frontier.length - shown.length} more open once you secure one of these.</p>` : '');
    if (title) title.textContent = 'Ready now — your knowledge frontier';
    if (copy) copy.textContent = masteredCount
      ? `You’ve secured ${masteredCount} reading move${masteredCount === 1 ? '' : 's'}. ${frontier.length} ${frontier.length === 1 ? 'is' : 'are'} ready now — pick one. ${aheadCount} more open up as you go.`
      : `${frontier.length} reading move${frontier.length === 1 ? '' : 's'} ready to begin. ${aheadCount} more open up as you secure each one.`;
  } else if (skillCard) {
    if (title) title.textContent = 'Foundation secured';
    skillCard.innerHTML = '<article class="frontier-card"><strong>Every foundational move is secured.</strong><small>Carry them into an unfamiliar source to make them transferable.</small><a href="independent-reading.html">Transfer →</a></article>';
  }
  const recommendation = decision.recommendation;
  const today = document.querySelector('.today');
  today.querySelector('div').innerHTML = `<span>NEXT BEST STEP</span><strong>${recommendation.title}</strong><small>${recommendation.reason}</small>`;
  const action = today.querySelector('a'); action.href = recommendation.url; action.textContent = recommendation.kind === 'placement' ? 'Find my starting point →' : 'Start this step →';
  const daily = document.querySelector('.intro .primary'); daily.href = 'daily-router.html'; daily.textContent = recommendation.kind === 'placement' ? 'Begin my starting session →' : 'Begin today’s session →';
  if (review.due.length) {
    document.querySelector('#review-section').hidden = false;
    // FIRe (Math Academy Way): you retrieve only the compressed practice set; the simpler skills each
    // one covers are refreshed implicitly. Lead with what you actually retrieve, and name the saving.
    const fire = review.fire;
    document.querySelector('#review-count').textContent = fire && fire.saved > 0
      ? `${fire.practiceCount} TO RETRIEVE · ${fire.saved} AUTO-REFRESHED`
      : `${review.due.length} READY NOW`;
    const titleOf = (id) => skills.find((skill) => skill.id === id)?.title || readableSkill(id);
    const items = fire?.practice?.length ? fire.practice : review.due;
    const preview = items.slice(0, 3);
    const remaining = items.length - preview.length;
    const previewCards = preview.map((item) => `<article class="review-card"><div><span>RETRIEVAL REVIEW</span><strong>${escapeHtml(titleOf(item.skillId))}</strong><small>${escapeHtml(item.reason || 'Bring this skill back before it fades.')}</small></div></article>`).join('');
    const tail = remaining > 0 ? `And ${remaining} more ready to bring back` : (fire && fire.saved > 0 ? `${fire.saved} more refreshed automatically` : 'Bring these back');
    const startCard = `<article class="review-card review-start"><div><span>RETENTION SESSION</span><strong>${tail}</strong><small>Your review session revisits them one at a time, strongest need first.</small></div><a class="primary" href="review.html">Start review →</a></article>`;
    document.querySelector('#review-list').innerHTML = previewCards + startCard;
  }
}).catch(() => {});

document.querySelectorAll('.path button').forEach((node) => node.addEventListener('click', () => {
  document.querySelectorAll('.path button').forEach((item) => item.classList.toggle('active', item === node));
  document.querySelector('#detail').innerHTML = `<span>MASTERY TARGET</span><h2>${node.dataset.name}</h2><p>${node.dataset.text}</p><a class="primary" href="study.html?v=11">Practice this skill →</a>`;
}));
