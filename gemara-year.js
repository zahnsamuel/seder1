const learnerId = Seder.currentLearnerId();
const terms = [
  { number: 'I', title: 'Time, space, and practice', summary: 'Read cases where action, place, measure, and ritual time reshape one another.', required: [
    ['shabbat-tractate-arc', 'Shabbat: map a legal case', 'shabbat-arc.html'], ['eruvin-tractate-arc', 'Eruvin: boundary and measure', 'eruvin-arc.html'], ['pesachim-tractate-arc', 'Pesachim: word, time, and source', 'pesachim-arc.html'], ['sukkah-tractate-arc', 'Sukkah: validity and purpose', 'sukkah-arc.html'], ['yoma-tractate-arc', 'Yoma: procedure, limit, and proof', 'yoma-arc.html'], ['gemara-foundations-checkpoint', 'Gemara Foundations checkpoint', 'gemara-foundations.html']
  ] },
  { number: 'II', title: 'Claims, responsibility, and institutions', summary: 'Move from competing claims to categories of damage, institutional reasons, and public legal structure.', required: [
    ['bava-metzia-tractate-arc', 'Bava Metzia: claims and evidence', 'bava-metzia-arc.html'], ['bava-kamma-tractate-arc', 'Bava Kamma: categories of damage', 'bava-kamma-arc.html'], ['ketubot-tractate-arc', 'Ketubot: schedule and reason', 'ketubot-arc.html'], ['sanhedrin-tractate-arc', 'Sanhedrin: category and specification', 'sanhedrin-arc.html'], ['civil-reasoning-checkpoint', 'Civil Reasoning checkpoint', 'civil-reasoning.html']
  ] },
  { number: 'III', title: 'Rule, exception, and disagreement', summary: 'Read a broad rule through its limit, preserve competing voices, then transfer both habits across sources.', required: [
    ['chullin-tractate-arc', 'Chullin: rule and exception', 'chullin-arc.html'], ['niddah-tractate-arc', 'Niddah: three positions', 'niddah-arc.html']
  ] },
  { number: 'IV', title: 'Speech, status, and transfer', summary: 'Read how language creates a category, how a default gives it shape, and how a reading move transfers without flattening a new tractate.', required: [
    ['moed-katan-tractate-arc', 'Moed Katan: rule and bounded exception', 'moed-katan-arc.html'], ['nedarim-tractate-arc', 'Nedarim: legal speech and function', 'nedarim-arc.html'], ['nazir-tractate-arc', 'Nazir: carry the language move across', 'nazir-arc.html'], ['gemara-year-synthesis', 'Gemara Year synthesis', 'gemara-year-synthesis.html']
  ] }
];
const $ = (selector) => document.querySelector(selector);
function render(learner) {
  const done = new Set(learner?.completedStages || []); const complete = (term) => term.required.every(([stage]) => done.has(stage)); const count = terms.filter(complete).length;
  $('#xp').textContent = `${learner?.xp || 0} XP`; $('#meter').style.width = `${count / terms.length * 100}%`;
  $('#status').textContent = count === terms.length ? 'Gemara Year earned across three reading worlds.' : `Gemara Term ${count + 1} is your current term.`;
  $('#summary').textContent = count === terms.length ? 'You have source evidence across Shas. Keep the work durable through scheduled retrieval and independent Daf study.' : `${count} of ${terms.length} Gemara terms earned. The next tractate is selected from your recorded source evidence.`;
  $('#terms').innerHTML = terms.map((term, index) => {
    const earned = complete(term), current = !earned && index === count, next = term.required.find(([stage]) => !done.has(stage)); const state = earned ? 'complete' : current ? 'current' : 'locked';
    const action = earned ? `<a href="${term.required[0][2]}">Revisit →</a>` : current ? `<a href="${next[2]}">Begin: ${next[1]} →</a>` : '<span class="later">Later</span>';
    const note = earned ? 'Term checkpoint earned · return through retrieval when a move begins to fade.' : current ? `Current next move: ${next[1]}.` : 'Earn the preceding Gemara Term to open this source world.';
    return `<article class="term ${state}"><span class="number">${earned ? '✓' : term.number}</span><div><small>GEMARA TERM ${term.number} · ${earned ? 'EARNED' : current ? 'CURRENT' : 'LOCKED'}</small><h2>${term.title}</h2><p>${term.summary}</p><p>${note}</p></div>${action}</article>`;
  }).join('') + (count === terms.length ? '<a class="term current" href="shas-map-v2.html"><span class="number">→</span><div><small>FULL SHAS</small><h2>Choose the next field of study</h2><p>You now have a durable opening repertoire for further tractates and deeper source work.</p></div><span>Open Shas map →</span></a>' : '');
  if (count === terms.length) $('#terms').insertAdjacentHTML('beforeend', '<a class="term current" href="moed-expansion.html"><span class="number">+</span><div><small>EARNED EXPANSION</small><h2>Continue into Moed</h2><p>Carry your Gemara repertoire into procedure, calendar, public schedule, and timing disputes.</p></div><span>Open Moed Expansion</span></a>');
}
Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then(render).catch(() => render(null));
