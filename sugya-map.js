const learnerId = Seder.currentLearnerId();
const maps = {
  berakhot: { skill: 'independent-sugya-reading', context: 'Berakhot 2a map', lines: [
    ['מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִית', 'From when do we recite Shema in the evening?', 'Mishnah case'],
    ['תַּנָּא הֵיכָא קָאֵי דְּקָתָנֵי מֵאֵימָתַי', 'On what is the tanna standing, that he teaches: “From when?”', 'Context question'],
    ['תַּנָּא אַקְרָא קָאֵי, דִּכְתִיב', 'The Mishnah relies on a verse, as it is written.', 'Textual grounding']
  ]},
  shabbat: { skill: 'shabbat-independent-map', context: 'Shabbat 2a map', lines: [
    ['יְצִיאוֹת הַשַּׁבָּת שְׁתַּיִם שֶׁהֵן אַרְבַּע', 'The acts of carrying out on Shabbat are two that are four.', 'Mishnah case'],
    ['בִּפְנִים · בַּחוּץ', 'Inside · outside.', 'Legal distinction'],
    ['מַאי טַעְמָא', 'What is the reason?', 'Context question']
  ]},
  eruvin: { skill: 'eruvin-independent-map', context: 'Eruvin 2a map', lines: [
    ['מָבוֹי שֶׁהוּא גָבוֹהַּ לְמַעְלָה מֵעֶשְׂרִים אַמָּה', 'An alleyway whose entrance is higher than twenty cubits.', 'Mishnah case'],
    ['יְמַעֵט', 'One should lower it.', 'Mishnah response'],
    ['אַמַּאי?', 'Why?', 'Context question']
  ]}
};
const tractate = new URLSearchParams(location.search).get('tractate') || 'berakhot';
const active = maps[tractate] || maps.berakhot;
const roles = ['Mishnah case', 'Mishnah response', 'Legal distinction', 'Context question', 'Textual grounding', 'Objection', 'Final ruling'];
const map = document.querySelector('#map');
map.innerHTML = active.lines.map(([hebrew, translation], index) => `<article><span>LINE ${index + 1}</span><p lang="he" dir="rtl">${hebrew}</p><small>${translation}</small><label>Its job in the sugya<select data-line="${index}"><option value="">Choose a move</option>${roles.map((role) => `<option>${role}</option>`).join('')}</select></label></article>`).join('');
document.querySelector('#check').addEventListener('click', async () => { const selections = [...document.querySelectorAll('select')].map((select) => select.value); const correct = selections.every((selection, index) => selection === active.lines[index][2]); document.querySelector('#feedback').textContent = correct ? 'Strong map. You tracked each move by its work in the argument.' : 'Look again at the relationship between the lines: case, question, source, response, or distinction.'; const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_annotation', skillId: active.skill, competency: 'argument', sourceContext: active.context, correct }) }); if (response.ok) { const learner = await response.json(); document.querySelector('#xp').textContent = `${learner.xp} XP`; } });
