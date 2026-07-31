// Structured, learner-facing rationale for a recommendation — the "why this, now" behind every
// next step, generalized across every recommendation kind the engine can return (server.mjs
// recommendFor). Three beats, echoing the front-of-house explanation on My Path:
//   because — what in the learner's own evidence makes this the right move now (A)
//   build   — the move being built (B); usually the recommendation title
//   unlocks — what B opens next (C), when a graph edge or sequence knows it; may be null
// Plus a machine-readable `basis` naming the evidence type, so a client can style by trigger.
//
// This module is pure: it reads only fields already present on the chosen recommendation and the
// learner. Graph-derived beats (builtOn / unlocks) are computed upstream where the graph is loaded
// (curriculum-engine nextGraphPractice, server academyFoundationRecommendation) and passed through
// on the recommendation, so no file I/O happens here.

export function explainRecommendation(rec, learner = {}) {
  const build = rec.title;
  switch (rec.kind) {
    case 'placement':
      return { basis: 'placement-needed', because: 'we don’t know your starting point yet', build, unlocks: 'a path aimed at what you actually need' };
    case 'academy-foundation':
      return {
        basis: 'foundation-sequence',
        because: rec.builtOn ? `you’ve secured ${rec.builtOn}` : 'this is where the Foundation begins',
        build,
        unlocks: rec.unlocks || 'the next Foundation move'
      };
    case 'review':
      return rec.decayTriggered
        ? { basis: 'decay', because: 'a skill you mastered has faded below its peak', build, unlocks: 'durable recall, restored faster than relearning' }
        : { basis: 'spaced-review', because: 'a skill is due for retrieval, especially after an uncertain answer', build, unlocks: 'recall that lasts' };
    case 'remediation':
      return {
        basis: 'fragile-skill',
        because: rec.count ? `this move has felt uncertain ${rec.count} times` : 'a source move is fragile',
        build,
        unlocks: 'the dependent moves it was holding back'
      };
    case 'foundation-term':
    case 'gemara-year-term':
    case 'moed-expansion':
      return { basis: 'term-progression', because: rec.builtOn ? `you’ve completed ${rec.builtOn}` : 'you’re ready to begin this term', build, unlocks: 'the next term of your path' };
    case 'graph-practice':
      return {
        basis: 'graph-prerequisite',
        because: rec.builtOn ? `you’ve secured ${rec.builtOn}` : 'this is a foundational move with nothing before it',
        build,
        unlocks: rec.unlocks || null
      };
    case 'canon-session':
      return { basis: 'canon-journey', because: rec.builtOn ? `you’ve completed ${rec.builtOn}` : 'it’s the next shared reading tool in your canon journey', build, unlocks: 'a wider range of sources you can read with it' };
    case 'gemara-arc':
      return { basis: 'gemara-arc', because: rec.builtOn ? `you’ve completed ${rec.builtOn}` : 'it continues your current tractate arc', build, unlocks: 'the next move in the sugya' };
    default: // shas-map and any future breadth recommendation
      return { basis: 'breadth', because: 'your foundations are ready for wider practice', build, unlocks: 'broader tractate exploration' };
  }
}

// One-line rendering used where a compact string is enough (e.g. daily plan steps) and the move
// title is already shown alongside. Omits the title to stay grammatical across imperative titles
// ("Separate a question…") and proper-noun titles ("Gemara Year · Term I") alike.
export function whySentence(why) {
  if (!why) return '';
  return why.unlocks ? `Because ${why.because}, it unlocks ${why.unlocks}.` : `Because ${why.because}.`;
}
