const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
Seder.api(`/api/learners/${learnerId}`).then((response) => response.json()).then((learner) => {
  const week = Date.now() - 7 * 86400000;
  const events = (learner.events || []).filter((event) => new Date(event.at || 0).getTime() >= week);
  const correct = events.filter((event) => event.correct).length;
  const mastered = Object.entries(learner.mastery || {}).filter(([, score]) => score >= .67).length;
  const due = learner.reviewQueue || [];
  $('#summary').innerHTML = `<article><small>THIS WEEK</small><strong>${events.length}</strong><span>learning moves</span></article><article><small>RELIABLE SKILLS</small><strong>${mastered}</strong><span>established</span></article><article><small>RECALL DUE</small><strong>${due.length}</strong><span>to revisit</span></article>`;
  $('#reflection').innerHTML = `<p class="lesson-label">ONE CONNECTION TO CARRY FORWARD</p><h2>Read function, not only topic.</h2><p>${correct ? `You made ${correct} successful source reading move${correct === 1 ? '' : 's'} this week. The same habit that names a question in Gemara can name a tension, command, or reason in any source.` : 'Begin by making one careful source move. The goal is not speed; it is learning to see what a line is doing.'}</p><a href="course-dashboard.html">See your canon connections &rarr;</a>`;
  $('#next').innerHTML = `<p class="lesson-label">NEXT WEEK&apos;S FIRST MOVE</p><p>${due.length ? 'Start with a short retrieval before new material. Recalling first makes the next source more available.' : 'Your review queue is clear. Continue the next source move in your daily path.'}</p><a href="${due.length ? 'review.html' : 'daily-router.html'}">${due.length ? 'Open due review' : 'Open today&apos;s path'} &rarr;</a>`;
}).catch(() => { $('#summary').textContent = 'Weekly review is temporarily unavailable.'; });
