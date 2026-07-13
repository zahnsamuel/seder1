const learnerId = Seder.currentLearnerId();
const skill = new URLSearchParams(location.search).get('skill') || 'source-signals';
const $ = (selector) => document.querySelector(selector);
const norm = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ');
const shuffle = (items) => [...items].sort(() => Math.random() - .5);

Promise.all([fetch('/api/curriculum/pilot-repairs').then((response) => response.json()), fetch('/api/curriculum/contrasting-repairs').then((response) => response.json())]).then(([data, contrasts]) => {
  const repair = data.repairs[skill] || data.repairs['source-signals'];
  const contrast = contrasts.repairs[skill] || contrasts.repairs['source-signals'];
  $('#title').textContent = repair.title;
  $('#move').textContent = repair.move;
  $('#lesson').innerHTML = `<article class="source"><p class="hebrew" lang="he" dir="rtl">${repair.source}</p><p class="translation">${repair.translation}</p></article><p class="prompt">${repair.check}</p><div class="seder-typed"><input id="answer" placeholder="Type a short answer"><button id="check">Check repair</button></div><div id="feedback" aria-live="polite"></div>`;
  $('#check').onclick = async () => {
    const response = norm($('#answer').value), expected = norm(repair.answer);
    const correct = Boolean(response) && (response.includes(expected) || expected.includes(response));
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: skill, competency: 'sourceReasoning', sourceContext: `Repair: ${skill}`, correct }) }); } catch (error) { console.warn(error); }
    if (!correct) { $('#feedback').innerHTML = `<p class="feedback">Almost. The model answer is: ${repair.answer}. Read the move once more, then try again.</p>`; return; }
    const choices = shuffle([contrast.contrastMove, 'Treat the two sources as doing exactly the same work.', 'Ignore the source’s genre, audience, and setting.']);
    $('#feedback').innerHTML = `<p class="feedback">Rebuilt. ${repair.answer}</p><section class="source"><p class="lesson-label">CONTRASTING SOURCE CHECK</p><strong>${contrast.contrastSource}</strong><p>${contrast.contrastTranslation}</p><p>What does this second source add to the reading move?</p><div class="choices">${choices.map((choice, index) => `<button data-contrast="${index}">${choice}</button>`).join('')}</div><p id="contrast-feedback"></p></section>`;
    document.querySelectorAll('[data-contrast]').forEach((button) => button.onclick = async () => {
      const contrastCorrect = button.textContent === contrast.contrastMove;
      document.querySelectorAll('[data-contrast]').forEach((item) => { item.disabled = true; });
      $('#contrast-feedback').innerHTML = contrastCorrect ? `Transfer check passed. ${contrast.contrastMove}<br><br><a href="independent-reading.html">Test this move in an unseen source →</a><br><a href="weekly-review.html">Schedule it in weekly review →</a>` : `Not yet. ${contrast.contrastMove}`;
      if (contrastCorrect) try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'repair_transfer', artifactId: skill }) }); } catch (error) { console.warn(error); }
    });
  };
});
