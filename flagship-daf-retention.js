(() => {
  const skills = {
    shabbat: 'shabbat-independent-map', pesachim: 'pesachim-independent-map', eruvin: 'eruvin-independent-map',
    sukkah: 'sukkah-independent-map', 'bava-metzia': 'bava-metzia-independent-map', 'bava-kamma': 'bava-kamma-independent-map'
  };
  const tractate = new URLSearchParams(location.search).get('tractate') || 'shabbat';
  const skillId = skills[tractate];
  const panel = document.querySelector('#nextMove');
  if (!panel || !skillId) return;
  let scheduled = false;
  function scheduleWhenComplete() {
    if (scheduled || panel.hidden) return;
    scheduled = true;
    const learnerId = Seder.currentLearnerId();
    Seder.api(`/api/learners/${learnerId}/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'retrieval_scheduled', skillId, delayHours: 24, reason: 'Return tomorrow to retrieve this source map before it fades.', sourceContext: `${tractate} completed source map` })
    }).catch(() => {});
    const note = document.createElement('p');
    note.className = 'retention-note';
    note.textContent = 'A brief retrieval is now scheduled for tomorrow. Recall it before moving on to make the map durable.';
    panel.prepend(note);
    const transfer = document.createElement('a');
    transfer.href = `flagship-transfer.html?tractate=${encodeURIComponent(tractate)}`;
    transfer.textContent = 'Next: prove this move in a contrasting source →';
    transfer.className = 'transfer-link';
    panel.append(transfer);
  }
  new MutationObserver(scheduleWhenComplete).observe(panel, { attributes: true, childList: true, subtree: true });
  scheduleWhenComplete();
})();
