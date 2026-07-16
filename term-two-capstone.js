const learnerId = Seder.currentLearnerId();
const options = ['Ketubot: ask what a fixed detail protects; Chullin: identify how an exception defines scope; Sanhedrin: map category, court structure, and stakes.','Use one identical reading move for all three sources.','Treat fixed details, exceptions, and court size as unrelated facts.'].map((text, index) => ({ text, index })).sort(() => Math.random() - 0.5);
const answers = document.querySelector('#answers');
answers.innerHTML = options.map(({ text, index }) => `<button class="choice" data-index="${index}">${text}</button>`).join('');
document.querySelectorAll('[data-index]').forEach((button) => button.addEventListener('click', async () => {
  const correct = Number(button.dataset.index) === 0;
  document.querySelectorAll('[data-index]').forEach((item) => { item.disabled = true; }); button.classList.add(correct ? 'good' : 'bad');
  await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: 'term-two-reading-habits', competency: 'sourceReasoning', sourceContext: 'Term Two capstone: reading habits', correct }) }).catch(() => {});
  if (correct) await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: 'term-two-capstone' }) }).catch(() => {});
  document.querySelector('#feedback').innerHTML = correct ? '<span class="feedback">+30 XP. You can select the reading habit the source actually needs.</span><a class="continue" href="foundation-year.html">Enter Third Foundation Term →</a>' : '<button class="continue" onclick="location.reload()">Try again →</button>';
}));
