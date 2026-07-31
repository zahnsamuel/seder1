// Canonical learner-facing capability states — the words a learner sees instead of mastery %, XP,
// or levels (docs/foundation-graph-schema.md §5). One vocabulary, shared by every surface, mapping
// the internal evidence statuses (jla-capability-evidence.js) to four plain states.
// Wrapped in an IIFE: classic scripts share global scope, and seder-auth.js already declares
// `const Seder`, so a second top-level `const Seder` would be a redeclaration error.
(function () {
  const Seder = window.Seder = window.Seder || {};

  Seder.capabilityStates = {
    emerging:     { label: 'Emerging',     blurb: 'can make the move with support' },
    secure:       { label: 'Secure',       blurb: 'can make the move on your own' },
    transferable: { label: 'Transferable', blurb: 'can make it in an unfamiliar source' },
    durable:      { label: 'Durable',      blurb: 'still holds after time away' }
  };

  // Internal evidence status -> capability state. (durable is earned by surviving spaced review; it
  // is not yet a distinct stored status, so nothing maps to it here until that is tracked.)
  Seder.capabilityStateFor = (status) => ({
    introduced: 'emerging', earned: 'secure', stable: 'secure', 'transfer-ready': 'transferable'
  }[status] || 'emerging');

  // Count a learner's capability evidence by state.
  Seder.summarizeCapabilities = (evidence) => {
    const counts = { emerging: 0, secure: 0, transferable: 0, durable: 0 };
    for (const item of evidence || []) counts[Seder.capabilityStateFor(item.status)] += 1;
    return counts;
  };

  // A plain sentence describing where the learner stands, no numbers-as-score.
  Seder.capabilitySentence = (counts) => {
    const onOwn = counts.secure + counts.transferable + counts.durable;
    if (onOwn === 0) return 'Your first reading move is waiting.';
    const unfamiliar = counts.transferable + counts.durable;
    const base = `You can make ${onOwn} reading move${onOwn === 1 ? '' : 's'} on your own`;
    return unfamiliar ? `${base}, ${unfamiliar} in an unfamiliar source.` : `${base}.`;
  };
})();
