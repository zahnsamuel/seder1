(() => {
  const tractate = new URLSearchParams(location.search).get('tractate') || 'shabbat';
  const learnerId = Seder.currentLearnerId();
  const check = document.querySelector('.check');
  const feedback = document.querySelector('#feedback');
  const next = document.querySelector('#next');
  if (!check || !feedback || !next) return;
  const habits = {
    shabbat: { correct: 'Map people, domains, and action before deciding the category.', wrong: ['Carry over the old labels without checking the new source.', 'Look only for the final result.'] },
    pesachim: { correct: 'Keep time, tool, and source wording visible before drawing the conclusion.', wrong: ['Ignore wording once a familiar ritual topic appears.', 'Treat timing as a detail with no role in the argument.'] },
    eruvin: { correct: 'Name the physical condition and the precise distinction the source is testing.', wrong: ['Assume every boundary case has the same answer.', 'Choose the longest formulation without mapping its condition.'] },
    sukkah: { correct: 'Separate the ruling from the different reasons that might explain it.', wrong: ['Use one attractive explanation to erase the alternatives.', 'Read validity as direct practical instruction.'] },
    'bava-metzia': { correct: 'Map both claims and the procedure that holds their competing concerns together.', wrong: ['Treat fairness as a shortcut around the source’s procedure.', 'Assume the first claim resolves the whole dispute.'] },
    'bava-kamma': { correct: 'Keep categories distinct, then test the shared principle without flattening them.', wrong: ['Assume every damage category works identically.', 'Memorize the list and skip the analysis.'] }
  };
  let explanationSaved = false;
  const explanation = document.createElement('section');
  explanation.id = 'transferExplanation';
  explanation.hidden = true;
  const repair = document.createElement('section');
  repair.id = 'transferRepair';
  repair.hidden = true;
  check.insertBefore(explanation, next);
  check.insertBefore(repair, next);
  const lockNextUntilExplained = () => { if (!explanationSaved && !explanation.hidden) next.hidden = true; };
  new MutationObserver(lockNextUntilExplained).observe(next, { attributes: true });
  document.querySelector('#answers').addEventListener('click', () => window.setTimeout(() => {
    const correct = feedback.textContent.startsWith('Transfer recorded.');
    if (correct) {
      repair.hidden = true;
      explanation.hidden = false;
      lockNextUntilExplained();
      const habit = habits[tractate] || habits.shabbat;
      explanation.innerHTML = `<p class="label">NAME THE TRANSFER HABIT</p><h3>What made your reading transferable?</h3><p>Choose the structural habit that carried from the earlier Daf into this new source.</p><div class="transfer-choice-set" aria-label="Choose the transfer habit"></div><p id="transferExplanationFeedback" aria-live="polite"></p>`;
      const choices = explanation.querySelector('.transfer-choice-set');
      [habit.correct, ...habit.wrong].map((text, original) => ({ text, original })).sort(() => Math.random() - .5).forEach(({ text, original }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.addEventListener('click', async () => {
          const note = explanation.querySelector('#transferExplanationFeedback');
          if (original !== 0) { button.disabled = true; button.classList.add('incorrect'); note.textContent = 'Not yet. Name the reading move, not merely the topic or result.'; return; }
          choices.querySelectorAll('button').forEach(item => item.disabled = true);
          button.classList.add('correct');
          localStorage.setItem(`seder-transfer-explanation-${tractate}-${learnerId}`, habit.correct);
          explanationSaved = true;
          note.textContent = 'Transfer habit earned. You showed the move can travel to a new page.';
          await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'transfer_explanation', artifactId: tractate }) }).catch(() => {});
          next.hidden = false;
        });
        choices.append(button);
      });
      feedback.textContent = `${feedback.textContent} Name the structural habit before continuing.`;
    } else if (feedback.textContent.startsWith('Not yet.')) {
      repair.hidden = false;
      repair.innerHTML = `<strong>Targeted repair</strong><p>Re-map the earlier source’s case and moves, then return here to test transfer again.</p><a href="flagship-daf-workbench.html?tractate=${encodeURIComponent(tractate)}&repair=transfer">Return to the ${tractate.replace(/-/g, ' ')} source map →</a>`;
    }
  }, 0));
})();
