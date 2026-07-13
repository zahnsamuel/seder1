(() => {
  const target = document.querySelector('#source-sequences');
  if (!target) return;
  fetch('/api/curriculum/canon-source-sequences').then((response) => response.ok ? response.json() : null).then((data) => {
    const sequences = data?.sequences || [];
    target.innerHTML = `<p class="lesson-label">THE SAME MASTERY RHYTHM ACROSS THE CANON</p><h2>Read → practice → transfer.</h2><p>Each domain gives you a full source encounter, a deliberate reading check, and a fresh source where the move has to travel.</p><div class="canon-sequence-grid">${sequences.map((sequence) => `<article><small>${sequence.title.toUpperCase()}</small><ol>${[sequence.guided, sequence.practice, sequence.transfer].map(([label, url], index) => `<li><b>${index + 1}</b><a href="${url}">${label} →</a></li>`).join('')}</ol></article>`).join('')}</div>`;
  }).catch(() => { target.innerHTML = ''; });
})();
