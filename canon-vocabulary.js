const learnerId = Seder.currentLearnerId();
const key = `seder-canon-vocab-${learnerId}`;
const personalKey = `seder-personal-vocabulary-${learnerId}`;
const mastered = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
const $ = (selector) => document.querySelector(selector);
const norm = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ');
let data;
let index = 0;
let answered = false;

function render() {
  const term = data.terms[index];
  $('#progress').textContent = `${mastered.size} / ${data.terms.length} recalled`;
  $('#nav').innerHTML = data.terms.map((item, itemIndex) => `<button class="lab-button ${itemIndex === index ? 'active' : ''}" data-term="${itemIndex}">${item.domain}<small>${mastered.has(item.id) ? 'Recalled' : item.term}</small></button>`).join('');
  document.querySelectorAll('[data-term]').forEach((button) => { button.onclick = () => { index = Number(button.dataset.term); answered = false; render(); }; });
  $('#lesson').innerHTML = `<p class="lesson-label">${term.domain.toUpperCase()}</p><h2 lang="he" dir="rtl" class="hebrew">${term.term}</h2><p class="prompt">${term.prompt}</p><div class="seder-typed"><input id="answer" placeholder="Type a short answer"><button id="check">Check recall</button></div><div id="feedback" aria-live="polite"></div>`;
  $('#check').onclick = async () => {
    if (answered || !$('#answer').value.trim()) return;
    answered = true;
    const correct = term.accepted.some((answer) => norm(answer) === norm($('#answer').value));
    $('#feedback').innerHTML = `<p class="feedback">${correct ? 'Recalled. ' : 'Not yet. '}<strong>${term.term}</strong> means <strong>${term.meaning}</strong>.<br><br><strong>Its job:</strong> ${term.job}</p>`;
    if (correct) { mastered.add(term.id); localStorage.setItem(key, JSON.stringify([...mastered])); if (term.id.startsWith('personal-')) { const words = JSON.parse(localStorage.getItem(personalKey) || '[]'); const word = words.find((item) => item.term === term.term && item.meaning === term.meaning); if (word) { word.intervalDays = Math.min(30, Math.max(1, (word.intervalDays || 1) * 2)); word.dueAt = new Date(Date.now() + word.intervalDays * 86400000).toISOString(); localStorage.setItem(personalKey, JSON.stringify(words)); } } }
    else if (term.id.startsWith('personal-')) { const words = JSON.parse(localStorage.getItem(personalKey) || '[]'); const word = words.find((item) => item.term === term.term && item.meaning === term.meaning); if (word) { word.intervalDays = 1; word.dueAt = new Date(Date.now() + 86400000).toISOString(); localStorage.setItem(personalKey, JSON.stringify(words)); } }
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: `vocab-${term.id}`, competency: 'translation', sourceContext: `Vocabulary: ${term.domain}`, correct }) }); } catch (error) { console.warn(error); }
  };
}

fetch('/api/curriculum/canon-vocabulary').then((response) => response.json()).then((result) => {
  const personal = JSON.parse(localStorage.getItem(personalKey) || '[]').sort((a, b) => new Date(a.dueAt || a.at) - new Date(b.dueAt || b.at)).map((item, itemIndex) => ({ id: `personal-${itemIndex}-${item.term}`, domain: 'Your source vocabulary', term: item.term, meaning: item.meaning, job: `You saved this word from ${item.source}.`, prompt: `Type the meaning you saved for ${item.term}.`, accepted: [item.meaning], dueAt: item.dueAt || item.at }));
  data = { terms: [...personal, ...result.terms] };
  render();
});
