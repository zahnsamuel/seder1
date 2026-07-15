(() => {
  const tractate = new URLSearchParams(location.search).get('tractate') || 'shabbat';
  const labels = { pesachim: 'Freedom, memory, and ritual time', eruvin: 'Shabbat, shared practice, and covenant', sukkah: 'Embodied memory and Torah', 'bava-metzia': 'Ethics and responsibility', 'bava-kamma': 'Justice, harm, and responsibility' };
  function addConnection() {
    const bridge = document.querySelector('#canonBridge');
    if (!bridge || bridge.querySelector('.canon-source-link')) return;
    const link = document.createElement('a');
    link.className = 'canon-source-link';
    link.href = `canon-connection.html?tractate=${encodeURIComponent(tractate)}`;
    link.textContent = `Read the Canon Connection: ${labels[tractate] || 'Jewish learning as one language'} →`;
    bridge.append(link);
  }
  new MutationObserver(addConnection).observe(document.documentElement, { childList: true, subtree: true });
  addConnection();
})();
