(() => {
  const $ = (selector) => document.querySelector(selector);
  let packets = [], sequences = [];
  function renderPacket() {
    const packet = packets.find((item) => item.tractate === active);
    if (!packet) return;
    let panel = $('#sourcePacket');
    if (!panel) { panel = document.createElement('section'); panel.id = 'sourcePacket'; panel.className = 'source-packet'; $('#clues').after(panel); }
    const sequence = sequences.find((item) => item.tractate === active);
    const next = sequence?.packets?.map(([number, label, url]) => `<li><b>${number}</b><a href="${url}">${label}</a></li>`).join('') || '';
    panel.innerHTML = `<span>SOURCE PACKET</span><strong>${packet.objective}</strong><p><b>Watch for:</b> ${packet.misconception}</p><p><b>Transfer:</b> ${packet.transfer}</p><a target="_blank" rel="noreferrer" href="${packet.sourceUrl}">Open the full source at Sefaria →</a>${next ? `<div class="packet-sequence"><b>Three-source sequence</b><ol>${next}</ol></div>` : ''}`;
  }
  Promise.all([fetch('/api/curriculum/gemara-source-packets').then((response) => response.ok ? response.json() : null), fetch('/api/curriculum/gemara-source-sequences').then((response) => response.ok ? response.json() : null)])
    .then(([packetData, sequenceData]) => { packets = packetData?.packets || []; sequences = sequenceData?.sequences || []; renderPacket(); new MutationObserver(renderPacket).observe($('#lines'), { childList: true }); }).catch(() => {});
})();
