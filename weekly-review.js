const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
Promise.all([Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()), fetch('data/foundation-skill-graph.json').then((response) => response.json())]).then(([learner, graph]) => {
  const week = Date.now() - 7 * 86400000;
  const events = (learner.events || []).filter((event) => new Date(event.at || 0).getTime() >= week);
  const correct = events.filter((event) => event.correct).length;
  const mastered = Object.entries(learner.mastery || {}).filter(([, score]) => score >= .67).length;
  const due = learner.reviewQueue || [];
  const foundationScores = learner.foundationScores || {};
  const foundationMastery = learner.mastery || {};
  const foundationSkills = graph.skills || [];
  const secureFoundation = foundationSkills.filter((skill) => Math.max(foundationScores[skill.id] || 0, foundationMastery[skill.id] || 0) >= .67);
  const nextFoundation = foundationSkills.find((skill) => Math.max(foundationScores[skill.id] || 0, foundationMastery[skill.id] || 0) < .67 && (skill.prerequisites || []).every((prerequisite) => Math.max(foundationScores[prerequisite] || 0, foundationMastery[prerequisite] || 0) >= .67));
  $('#summary').innerHTML = `<article><small>THIS WEEK</small><strong>${events.length}</strong><span>learning moves</span></article><article><small>RELIABLE SKILLS</small><strong>${mastered}</strong><span>established</span></article><article><small>RECALL DUE</small><strong>${due.length}</strong><span>to revisit</span></article>`;
  $('#reflection').innerHTML = `<p class="lesson-label">ONE CONNECTION TO CARRY FORWARD</p><h2>Read function, not only topic.</h2><p>${correct ? `You made ${correct} successful source reading move${correct === 1 ? '' : 's'} this week. The same habit that names a question in Gemara can name a tension, command, or reason in any source.` : 'Begin by making one careful source move. The goal is not speed; it is learning to see what a line is doing.'}</p><p>${secureFoundation.length} foundational capabilities are currently secure.</p><a href="course-dashboard.html">See your canon connections &rarr;</a>`;
  const nextUrl = due.length ? 'review.html' : nextFoundation ? `academy-session.html?skill=${encodeURIComponent(nextFoundation.id)}` : 'daily-router.html';
  $('#next').innerHTML = `<p class="lesson-label">NEXT WEEK&apos;S FIRST MOVE</p><p>${due.length ? 'Start with a short retrieval before new material. Recalling first makes the next source more available.' : nextFoundation ? `Practice ${nextFoundation.title} as one focused capability.` : 'Your foundation is established. Continue the next source move in your daily path.'}</p><a href="${nextUrl}">${due.length ? 'Open due review' : nextFoundation ? 'Practice next capability' : 'Open today&apos;s path'} &rarr;</a>`;
}).catch(() => { $('#summary').textContent = 'Weekly review is temporarily unavailable.'; });
