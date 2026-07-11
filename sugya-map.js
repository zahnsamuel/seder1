const learnerId = Seder.currentLearnerId();
const lines = [
  { hebrew: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית', translation: 'From when do we recite Shema in the evening?', role: 'Mishnah case' },
  { hebrew: 'תַּנָּא הֵיכָא קָאֵי דְּקָתָנֵי מֵאֵימָתַי', translation: 'On what is the tanna standing, that he teaches: “From when?”', role: 'Context question' },
  { hebrew: 'תַּנָּא אַקְרָא קָאֵי, דִּכְתִיב: בְּשָׁכְבְּךָ וּבְקוּמֶךָ', translation: 'The Mishnah relies on a verse, as it is written: “when you lie down and when you rise.”', role: 'Textual grounding' }
];
const roles = ['Mishnah case', 'Context question', 'Textual grounding', 'Objection', 'Final ruling'];
const map = document.querySelector('#map');
map.innerHTML = lines.map((line, index) => `<article><span>LINE ${index + 1}</span><p lang="he" dir="rtl">${line.hebrew}</p><small>${line.translation}</small><label>Its job in the sugya<select data-line="${index}"><option value="">Choose a move</option>${roles.map((role) => `<option>${role}</option>`).join('')}</select></label></article>`).join('');
document.querySelector('#check').addEventListener('click', async () => {
  const selections = [...document.querySelectorAll('select')].map((select) => select.value);
  const correct = selections.every((selection, index) => selection === lines[index].role);
  document.querySelector('#feedback').textContent = correct ? 'Strong map. You tracked case, question, and source-grounded answer as an argument rather than isolated translations.' : 'Look again at the relationship between each line. Ask: what was stated, what pressure is applied, and what source responds?';
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_annotation', skillId: 'independent-sugya-reading', competency: 'argument', sourceContext: 'Berakhot 2a map', correct }) });
  if (response.ok) { const learner = await response.json(); document.querySelector('#xp').textContent = `${learner.xp} XP`; }
});
