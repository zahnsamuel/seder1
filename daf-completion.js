(() => {
  const mark = document.querySelector('#mark');
  const feedback = document.querySelector('#feedback');
  const analysis = document.querySelector('.analysis');
  if (!mark || !feedback || !analysis) return;

  function tractate() {
    return new URLSearchParams(location.search).get('tractate') || 'berakhot';
  }

  function showNextMove() {
    const correct = feedback.textContent.startsWith('Good reading.');
    let panel = document.querySelector('#nextMove');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'nextMove';
      panel.className = 'next-move';
      analysis.insertBefore(panel, analysis.querySelector('.legend'));
    }
    panel.innerHTML = correct
      ? `<strong>Reading recorded</strong><span>XP and mastery have been updated. Keep the source trail moving.</span><a href="tractate-mastery.html?tractate=${encodeURIComponent(tractate())}">Continue this tractate &rarr;</a>`
      : `<strong>Keep working the Daf</strong><span>Use the clue, choose another role, and record a new reading.</span>`;
  }

  mark.addEventListener('click', () => window.setTimeout(showNextMove, 0));
})();
