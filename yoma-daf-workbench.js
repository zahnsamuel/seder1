const learnerId = Seder.currentLearnerId();
const lines = [
  { hebrew: 'שבעת ימים קודם יום הכפורים מפרישין כהן גדול מביתו', translation: 'Seven days before Yom Kippur, they separate the High Priest from his home.', role: 'Mishnah case', clue: 'Orient first: a named role, a seven-day time frame, and a required procedure.' },
  { hebrew: 'ומתקינין לו כהן אחר תחתיו', translation: 'They prepare another priest in his place.', role: 'Procedure / safeguard', clue: 'This adds a protective procedure; ask what risk makes it necessary.' },
  { hebrew: 'שמא יארע בו פסול', translation: 'Lest a disqualification happen to him.', role: 'Stated concern', clue: 'The Mishnah itself names the risk the safeguard addresses.' },
  { hebrew: 'אם כן אין לדבר סוף', translation: 'If so, there is no end to the matter.', role: 'Objection', clue: 'The Rabbis limit a chain of additional precautions by showing where it would become open-ended.' },
  { hebrew: 'מנא הני מילי', translation: 'From where are these matters derived?', role: 'Context question', clue: 'The Gemara now asks for the scriptural ground of the procedure.' },
  { hebrew: 'כאשר עשה ביום הזה צוה ה׳ לעשות לכפר עליכם', translation: 'As was done on this day, the Lord commanded to do, to make atonement for you.', role: 'Textual grounding', clue: 'A verse enters as evidence; watch which phrases the Gemara will interpret.' },
  { hebrew: 'לעשות אלו מעשי פרה לכפר אלו מעשי יום הכפורים', translation: '“To do” refers to the acts of the red heifer; “to make atonement” refers to the acts of Yom Kippur.', role: 'Response', clue: 'The Gemara reads the verse phrase by phrase to ground two distinct preparation procedures.' }
];
const $ = (selector) => document.querySelector(selector);
let focused = null;
let showTranslation = false;
const mapped = new Map();

function renderMap() {
  $('#argumentMap').innerHTML = lines.map((line, index) => `<li class="${mapped.get(index) ? 'mapped' : ''}"><b>${index + 1}</b><span>${mapped.get(index) || 'Unclassified'}</span></li>`).join('');
  const complete = mapped.size === lines.length;
  $('#mapProgress').textContent = complete ? 'Source map earned: you have named each move from procedure to proof.' : `${mapped.size} of ${lines.length} source moves classified.`;
  const next = $('#nextMove');
  next.hidden = !complete;
  if (complete) next.innerHTML = '<strong>Yoma source map complete</strong><span>Keep the map, then retrieve and apply these moves in the guided Yoma arc.</span><a href="yoma-arc.html">Continue to the Yoma source trail →</a>';
}

function render() {
  $('#lines').innerHTML = lines.map((line, index) => `<button class="daf-line ${focused === index ? 'focused' : ''} ${mapped.has(index) ? 'mapped' : ''}" data-line="${index}"><b>${index + 1}</b><span lang="he" dir="rtl">${line.hebrew}</span>${showTranslation ? `<small>${line.translation}</small>` : ''}${mapped.has(index) ? `<em class="role-chip">${mapped.get(index)}</em>` : ''}</button>`).join('');
  document.querySelectorAll('.daf-line').forEach((button) => button.addEventListener('click', () => {
    focused = Number(button.dataset.line);
    $('#role').value = mapped.get(focused) || '';
    $('#mark').disabled = false;
    $('#feedback').textContent = '';
    const line = lines[focused];
    $('#lineTitle').textContent = `Line ${focused + 1}: read its job`;
    $('#lineTranslation').textContent = line.translation;
    $('#clues').textContent = line.clue;
    render();
  }));
}

$('#toggleTranslation').addEventListener('click', () => {
  showTranslation = !showTranslation;
  $('#toggleTranslation').textContent = showTranslation ? 'Hide translations' : 'Show translations';
  render();
});

$('#mark').addEventListener('click', async () => {
  if (focused === null || !$('#role').value) return;
  const line = lines[focused];
  const selected = $('#role').value;
  const correct = selected === line.role;
  $('#feedback').textContent = correct ? 'Good reading. You identified the work this line performs in the sugya.' : 'Try again: use the clue and ask what this line contributes to the argument.';
  if (correct) {
    mapped.set(focused, selected);
    render();
    renderMap();
  }
  const response = await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_annotation', skillId: 'yoma-independent-map', competency: 'argument', sourceContext: `Yoma 1:1–2a workbench line ${focused + 1}`, correct }) });
  if (response.ok) {
    const learner = await response.json();
    $('#xp').textContent = `${learner.xp} XP`;
  }
});

Seder.api(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : null).then((learner) => { $('#xp').textContent = `${learner?.xp || 0} XP`; });
render();
renderMap();
