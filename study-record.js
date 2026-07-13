const learnerId = Seder.currentLearnerId();
const $ = (selector) => document.querySelector(selector);
function localItems(prefix) { const items = []; for (let index = 0; index < localStorage.length; index += 1) { const key = localStorage.key(index); if (key?.startsWith(prefix)) { try { items.push([key, JSON.parse(localStorage.getItem(key))]); } catch { /* ignore malformed local study data */ } } } return items; }
function label(id) { return String(id).replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function list(items, empty) { return items.length ? `<ul class="record-list">${items.join('')}</ul>` : `<p class="empty">${empty}</p>`; }
function artifactCount(artifacts, type) { return (artifacts?.[type] || []).length; }

Promise.all([Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null), Seder.api(`/api/learners/${learnerId}/review`).then((response) => response.ok ? response.json() : { due: [], upcoming: [] })])
  .then(([learner, review]) => {
    if (!learner) throw new Error('Your learner record is unavailable.');
    const mastery = learner.mastery || {}, current = learner.decayedMastery || mastery, evidence = learner.evidence || {}, artifacts = learner.artifacts || {};
    const established = Object.entries(current).filter(([, score]) => score >= .85), fading = Object.entries(mastery).filter(([id, score]) => score >= .67 && (current[id] ?? score) / score < .85);
    const vocab = JSON.parse(localStorage.getItem(`seder-personal-vocabulary-${learnerId}`) || '[]');
    const notes = JSON.parse(localStorage.getItem(`seder-source-reader-${learnerId}`) || '[]');
    const maps = localItems('seder-daf-argument-map-').filter(([key]) => key.endsWith(`-${learnerId}`));
    const mappedLines = maps.reduce((total, [, map]) => total + Object.keys(map || {}).length, 0);
    const independent = artifactCount(artifacts, 'independent_encounter') || JSON.parse(localStorage.getItem(`seder-independent-reading-${learnerId}`) || '[]').length;
    const capstones = artifactCount(artifacts, 'capstone'), bridges = artifactCount(artifacts, 'bridge');
    const academyDays = (learner.completedStages || []).filter((stage) => /^academy-day-\d+$/.test(stage)).length;
    const academyMaps = artifactCount(artifacts, 'academy-source-maps');
    const evidenceCount = Object.values(evidence).reduce((total, contexts) => total + contexts.length, 0);
    $('#summary').textContent = `You have earned ${academyDays} Academy day${academyDays === 1 ? '' : 's'}, demonstrated ${established.length} established reading skill${established.length === 1 ? '' : 's'}, and recorded ${evidenceCount} source context${evidenceCount === 1 ? '' : 's'}. This record grows through evidence, not screen completion.`;
    $('#metrics').innerHTML = [['XP', learner.xp || 0], ['Academy days mastered', academyDays], ['Due reviews', review.due.length], ['Independent readings', independent]].map(([name, value]) => `<article><small>${name}</small><strong>${value}</strong></article>`).join('');
    $('#skills').innerHTML = list([...established.slice(0, 5).map(([id, score]) => `<li><span>${label(id)}</span><b class="state secure">${Math.round(score * 100)}% secure</b></li>`), ...fading.slice(0, 3).map(([id]) => `<li><span>${label(id)}</span><b class="state fading">refresh soon</b></li>`)], 'Demonstrate a source move to begin your record.');
    $('#review').innerHTML = `${list(vocab.slice(0, 4).map((word) => `<li><span>${word.term} <small>${word.meaning}</small></span><b>${new Date(word.dueAt || word.at).getTime() <= Date.now() ? 'due' : 'scheduled'}</b></li>`), 'Save a Hebrew or Aramaic word from a source to build your personal vocabulary.')}${review.due.length ? `<p><a href="review-calendar.html">${review.due.length} skill review${review.due.length === 1 ? '' : 's'} due →</a></p>` : '<p>Nothing due right now. Retrieval will return at the right time.</p>'}`;
    const reflections = localItems('seder-source-reader-complete-').filter(([key]) => key.endsWith('-reflection')).length;
    $('#sourceWork').innerHTML = list([`<li><span>Academy source maps</span><b>${academyMaps} weekly maps</b></li>`, `<li><span>Daf maps</span><b>${maps.length} maps · ${mappedLines} lines</b></li>`, `<li><span>Private source notes</span><b>${notes.length} saved</b></li>`, `<li><span>Source reflections</span><b>${reflections} saved</b></li>`], 'Open a source and make the first line-by-line map.');
    $('#artifacts').innerHTML = list([`<li><span>Academy days earned</span><b>${academyDays} of 90</b></li>`, `<li><span>Independent source encounters</span><b>${independent}</b></li>`, `<li><span>Canon capstones</span><b>${capstones}</b></li>`, `<li><span>Cross-canon bridges</span><b>${bridges}</b></li>`, `<li><span>Saved source maps</span><b>${maps.length + academyMaps}</b></li>`], 'Complete an unfamiliar-source reading to begin demonstrating independence.');
  }).catch((error) => { $('#summary').textContent = error.message; });
