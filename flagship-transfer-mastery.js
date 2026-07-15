(() => {
  const tractate = new URLSearchParams(location.search).get('tractate') || 'shabbat';
  const learnerId = Seder.currentLearnerId();
  const check = document.querySelector('.check');
  const feedback = document.querySelector('#feedback');
  const next = document.querySelector('#next');
  if (!check || !feedback || !next) return;
  let explanationSaved = false;
  const explanation = document.createElement('section');
  explanation.id = 'transferExplanation';
  explanation.hidden = true;
  explanation.innerHTML = `<label for="transferExplanationText">In one sentence, what reading habit carried from your earlier Daf into this new source?</label><textarea id="transferExplanationText" placeholder="Name the structural parallel, not only the answer."></textarea><button id="saveTransferExplanation" type="button">Save my transfer explanation</button><p id="transferExplanationFeedback" aria-live="polite"></p>`;
  const repair = document.createElement('section');
  repair.id = 'transferRepair';
  repair.hidden = true;
  check.insertBefore(explanation, next);
  check.insertBefore(repair, next);
  const lockNextUntilExplained = () => {
    if (!explanationSaved && !explanation.hidden) next.hidden = true;
  };
  new MutationObserver(lockNextUntilExplained).observe(next, { attributes: true });
  document.querySelector('#answers').addEventListener('click', () => window.setTimeout(() => {
    const correct = feedback.textContent.startsWith('Transfer recorded.');
    if (correct) {
      repair.hidden = true;
      explanation.hidden = false;
      lockNextUntilExplained();
      feedback.textContent = `${feedback.textContent} Explain the structural parallel before continuing.`;
    } else if (feedback.textContent.startsWith('Not yet.')) {
      repair.hidden = false;
      repair.innerHTML = `<strong>Targeted repair</strong><p>Re-map the earlier source’s case and moves, then return here to test transfer again.</p><a href="flagship-daf-workbench.html?tractate=${encodeURIComponent(tractate)}&repair=transfer">Return to the ${tractate.replace(/-/g, ' ')} source map →</a>`;
    }
  }, 0));
  document.querySelector('#saveTransferExplanation').addEventListener('click', async () => {
    const text = document.querySelector('#transferExplanationText').value.trim();
    const note = document.querySelector('#transferExplanationFeedback');
    if (!text) { note.textContent = 'Write one sentence before continuing.'; return; }
    localStorage.setItem(`seder-transfer-explanation-${tractate}-${learnerId}`, text);
    explanationSaved = true;
    note.textContent = 'Transfer explanation saved. You have shown the habit can travel to a new page.';
    await Seder.api(`/api/learners/${learnerId}/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'transfer_explanation', artifactId: tractate })
    }).catch(() => {});
    next.hidden = false;
  });
})();
