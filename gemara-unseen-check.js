const learnerId = Seder.currentLearnerId();
const block = new URLSearchParams(location.search).get('block');
const transferSkill = block ? `${block}-unseen-transfer` : 'unseen-sugya-reading';
const items = [
  ['Eruvin 2a', 'A measured alleyway receives a terse corrective response.', 'What should you identify first?', 'The physical case and the measure that triggers the response.'],
  ['Sukkah 2a', 'A structure is declared invalid above a stated height.', 'What pressure naturally follows?', 'Why that physical limit matters for validity.'],
  ['Ketubot 2a', 'A fixed wedding day is stated without explanation.', 'What is the Gemara reading move?', 'Ask what institutional purpose explains the schedule.'],
  ['Chullin 2a', 'A broad rule is followed immediately by named exceptions.', 'What should a reader map?', 'The rule, its boundary, and the concern behind the exception.'],
  ['Niddah 1:1', 'Several named positions measure uncertainty differently.', 'What comes before choosing a conclusion?', 'State each position and the point from which it measures.'],
  ['Yoma 2a', 'A seven-day preparation precedes a non-repeatable service.', 'What kind of reason should you seek?', 'The risk the preparation is designed to prevent.'],
  ['Megillah 2a', 'A ritual is read on a range of dates.', 'What should you ask?', 'What practical concern justifies flexibility around a fixed obligation.'],
  ['Taanit 2a', 'A prayer line is disputed by season.', 'What should you trace?', 'The timing, each position, and the reason a season changes the practice.'],
  ['Rosh Hashanah 1:1', 'One Mishnah names four new years.', 'What does the count require?', 'Match each date to the legal purpose it serves.'],
  ['Bava Batra 2a', 'Partners request a courtyard wall.', 'What should you map?', 'The shared arrangement, request, and obligation that follows.']
];
const $ = (selector) => document.querySelector(selector);
const item = items[Math.floor(Date.now() / 86400000) % items.length];
const choices = [item[3], 'Translate each word in order before asking what the source is doing.', 'Find a final ruling before identifying the source’s question or case.'].map((text, original) => ({ text, original })).sort(() => Math.random() - 0.5);
$('#lesson').innerHTML = `<p class="lesson-label">${item[0].toUpperCase()} · UNSEEN MOVE</p><h2>${item[1]}</h2><p class="prompt">${item[2]}</p><div class="choices">${choices.map(({ text, original }) => `<button class="choice" data-choice="${original}">${text}</button>`).join('')}</div><button id="check" class="continue" disabled>Check transfer</button><p id="feedback"></p>`;
let selected;
document.querySelectorAll('[data-choice]').forEach((button) => { button.onclick = () => { selected = Number(button.dataset.choice); document.querySelectorAll('[data-choice]').forEach((choice) => choice.classList.toggle('selected', Number(choice.dataset.choice) === selected)); $('#check').disabled = false; }; });
$('#check').onclick = async () => {
  const correct = selected === 0;
  document.querySelectorAll('#lesson button').forEach((button) => { button.disabled = true; });
  $('#feedback').innerHTML = `<p class="feedback">${correct ? 'Transfer demonstrated. ' : 'Not yet. '}${item[3]}</p>${correct ? '<a href="weekly-review.html">Record this in weekly review →</a>' : '<a href="mastery-loop.html">Open targeted repair →</a>'}`;
  await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: transferSkill, competency: 'argument', sourceContext: `${block ? `${block} Block transfer` : 'Unseen Gemara'}: ${item[0]}`, correct }) }).catch(() => {});
};
