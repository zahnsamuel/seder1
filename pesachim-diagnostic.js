const learnerId = Seder.currentLearnerId();
const checks = [
  {skill:'pesachim-action', label:'ACTION', source:'בודקין את החמץ', prompt:'What should you identify first in this part of the Mishnah?', answers:['The action: searching for chametz.','A final reason for the rule.','A dispute between two teachers.'], correct:0},
  {skill:'pesachim-case-map', label:'CASE VARIABLES', source:'אור לארבעה עשר · לאור הנר', prompt:'What two details need to remain distinct?', answers:['The action and its translation.','The time of the action and the instrument used.','Two separate festival offerings.'], correct:1},
  {skill:'pesachim-ambiguous-word', label:'WORD IN CONTEXT', source:'אור', prompt:'What is the most responsible first move with this compact word?', answers:['Ask which sense fits here and test it against the surrounding source.','Pick one English gloss and never revisit it.','Skip it because the action is already clear.'], correct:0},
  {skill:'pesachim-no-end-principle', label:'LIMITING A CONCERN', source:'אין לדבר סוף', prompt:'What kind of reasoning move does this phrase signal in the weasel concern?', answers:['A practical limit on an open-ended hypothetical.','That the search obligation is cancelled.','That every possible worry must be resolved.'], correct:0},
  {skill:'pesachim-transfer', label:'TRANSFER', source:'בפנים · בחוץ', prompt:'In a new tractate, what carries over from Pesachim?', answers:['Treat every tractate as if it is about chametz.','Separate the concrete variables of a case before explaining its rule.','Ignore words that are not from Pesachim.'], correct:1}
];
const $ = (selector) => document.querySelector(selector);
const shuffle = (items) => items.map((text, index) => ({text, index})).sort(() => Math.random() - .5);
let index = 0, correctCount = 0;
function render() {
  const check = checks[index];
  $('#status').textContent = `${checks.length} SHORT CHECKS`;
  $('#dots').innerHTML = checks.map((_, itemIndex) => `<li class="${itemIndex === index ? 'active' : ''}">${itemIndex + 1}</li>`).join('');
  $('#skill-label').textContent = check.label;
  $('#progress').textContent = `CHECK ${index + 1} OF ${checks.length}`;
  $('#source').textContent = check.source;
  $('#prompt').textContent = check.prompt;
  $('#answers').innerHTML = '';
  shuffle(check.answers).forEach(({text, index: answerIndex}) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
    button.onclick = () => answer(button, answerIndex === check.correct, check); $('#answers').appendChild(button);
  });
}
async function answer(button, correct, check) {
  document.querySelectorAll('#answers button').forEach((item) => { item.disabled = true; });
  button.style.borderColor = correct ? '#276b68' : '#b88028';
  if (correct) correctCount += 1;
  try { await Seder.api(`/api/learners/${learnerId}/events`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'answer_submitted', skillId:check.skill, competency:'sourceReasoning', sourceContext:'Pesachim diagnostic', correct})}); } catch (error) { console.warn(error); }
  setTimeout(() => { if (index < checks.length - 1) { index += 1; render(); } else complete(); }, 350);
}
function complete() {
  const first = correctCount >= 4 ? 'Begin with the deep source trail.' : correctCount >= 2 ? 'Begin with the guided source trail, with close support on each move.' : 'Begin with the guided source trail; each step keeps Hebrew, translation, and case structure together.';
  $('.question').innerHTML = `<span>YOUR PESACHIM START</span><h2>${first}</h2><p>You showed ${correctCount} of ${checks.length} current reading moves. This is evidence for today’s plan, not a fixed label.</p><div class="answers"><a href="pesachim-arc.html" style="padding:14px;background:#183b4e;color:#fff;text-decoration:none;text-align:center">Start Pesachim →</a><a href="tractate-mastery.html?tractate=pesachim" style="padding:14px;border:1px solid #d8d9d1;color:#183b4e;text-decoration:none;text-align:center">View the full mastery loop</a></div>`;
  $('#status').textContent = 'STARTING POINT SAVED';
}
render();
