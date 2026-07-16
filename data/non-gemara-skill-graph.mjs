// These are source-specific skills already assessed inside the learner courses.
// Keeping their sequences here lets the shared adaptive graph recommend them too.
const paths = [
  { track: 'halakha', title: 'Honoring parents source chain', route: 'halakha-honor-parents.html', prerequisite: 'source-signals', context: 'Kiddushin 31b', ids: ['halakha-honor-torah-kibud','halakha-honor-two-verses','halakha-honor-distinction','halakha-honor-narrative-evidence','halakha-honor-code-role','halakha-honor-chain-compare','halakha-honor-limit','halakha-honor-boundary','halakha-honor-independent-chain','halakha-honor-typed-recall'] },
  { track: 'chumash', title: 'Akedah close reading', route: 'chumash-akeidah.html', prerequisite: 'identify-conceptual-claim', context: 'Genesis 22', ids: ['chumash-akeidah-narrator','chumash-akeidah-hineni-first','chumash-akeidah-escalation','chumash-akeidah-repetition','chumash-akeidah-hineni-son','chumash-akeidah-ambiguity','chumash-akeidah-hineni-third','chumash-akeidah-reception','chumash-akeidah-independent','chumash-akeidah-typed-recall'] },
  { track: 'tefillah', title: 'Kaddish language and structure', route: 'tefillah-kaddish.html', prerequisite: 'source-signals', context: 'Kaddish', ids: ['tefillah-kaddish-language','tefillah-kaddish-echo','tefillah-kaddish-response','tefillah-kaddish-gemara','tefillah-kaddish-structure','tefillah-kaddish-paradox','tefillah-kaddish-minyan','tefillah-kaddish-boundary','tefillah-kaddish-independent','tefillah-kaddish-typed-recall'] },
  { track: 'history', title: 'Yavneh historical reading', route: 'history-yavneh.html', prerequisite: 'source-signals', context: 'Gittin 55b–56b', ids: ['history-yavneh-memory-claim','history-yavneh-voice','history-yavneh-request','history-yavneh-compare','history-yavneh-institution','history-yavneh-meaning','history-yavneh-prooftext','history-yavneh-judgment','history-yavneh-independent','history-yavneh-typed-recall'] },
  { track: 'widerworld', title: 'Judaism and the wider world', route: 'widerworld-encounter.html', prerequisite: 'compare-interpretations', context: 'Eicha Rabbah 2:13', ids: ['widerworld-encounter-charter','widerworld-encounter-categories','widerworld-encounter-dina','widerworld-encounter-limits','widerworld-encounter-setting','widerworld-encounter-rambam','widerworld-encounter-strategy','widerworld-encounter-repertoire','widerworld-encounter-independent','widerworld-encounter-typed-recall'] }
];

const titleFor = (id) => id.split('-').slice(2).join(' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const nonGemaraSkillGraph = paths.flatMap((path) => path.ids.map((id, index) => ({
  id,
  track: path.track,
  title: `${path.title}: ${titleFor(id)}`,
  kind: index === path.ids.length - 1 ? 'translation-recall' : index === path.ids.length - 2 ? 'transfer' : 'source-reading',
  prerequisites: index ? [path.ids[index - 1]] : [path.prerequisite],
  languageDependencies: [],
  sourceForms: [path.context],
  evidence: 'Make the next source-reading move in this course sequence.',
  masteryCriteria: index === path.ids.length - 1 ? 'Recall the translation anchor from memory.' : 'Use the move in the next source encounter.',
  reviewContexts: [path.context],
  route: path.route
})));
