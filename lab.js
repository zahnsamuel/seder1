const tractate = new URLSearchParams(location.search).get('tractate') || 'shabbat';
const learnerId = Seder.currentLearnerId();
let lab;
let index = 0;
let answered = false;
let complete = false;
let xp = 0;
let translationsVisible = false;
const $ = (selector) => document.querySelector(selector);

(function injectCelebrationStyles() {
  if (document.getElementById('seder-celebration-styles')) return;
  const style = document.createElement('style');
  style.id = 'seder-celebration-styles';
  style.textContent = `@keyframes seder-xp-pop{0%{transform:scale(1);}35%{transform:scale(1.28);color:#b88028;}100%{transform:scale(1);}}.seder-xp-pop{animation:seder-xp-pop .5s ease;}`;
  document.head.appendChild(style);
})();
function celebrateXp() { ['#xp', '#lab-xp'].forEach((sel) => { const el = $(sel); if (!el) return; el.classList.remove('seder-xp-pop'); void el.offsetWidth; el.classList.add('seder-xp-pop'); }); }
function updateXp() { $('#xp').textContent = `${xp} XP`; $('#lab-xp').textContent = `${xp} XP`; }
function selectLine(nextIndex) { index = nextIndex; render(); }
function renderDaf() {
  const page = $('#daf-text'); page.innerHTML = '';
  lab.steps.forEach((step, stepIndex) => {
    const line = document.createElement('button'); line.type = 'button'; line.className = `daf-line ${stepIndex === index ? 'selected' : ''} ${stepIndex < index ? 'solved' : ''}`;
    line.textContent = step.hebrew;
    line.setAttribute('aria-label', `Study line ${stepIndex + 1}: ${step.hebrew}`);
    line.addEventListener('click', () => selectLine(stepIndex));
    page.appendChild(line);
  });
}
function render() {
  const step = lab.steps[index];
  answered = false;
  complete = false;
  renderDaf();
  $('#progress').textContent = `LINE ${index + 1} OF ${lab.steps.length}`;
  $('#kind').textContent = step.kind;
  $('#step-title').textContent = step.title;
  $('#prompt').textContent = step.prompt;
  $('#translation').textContent = step.translation;
  $('#translation-drawer').hidden = !translationsVisible;
  $('#feedback').textContent = '';
  $('#continue').disabled = true;
  $('#continue').textContent = index === lab.steps.length - 1 ? 'Complete lab →' : 'Continue to next line →';
  const answers = $('#answers'); answers.innerHTML = '';
  step.answers.map((text, answerIndex) => ({ text, answerIndex })).sort(() => Math.random() - .5).forEach(({ text, answerIndex }) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
    button.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const correct = answerIndex === step.correct;
      answers.querySelectorAll('button').forEach((item) => item.disabled = true);
      button.classList.add(correct ? 'correct' : 'incorrect');
      if (correct) document.querySelector('.daf-line.selected')?.classList.add('solved');
      xp += correct ? 10 : 5; updateXp(); celebrateXp();
      $('#feedback').textContent = `${correct ? '+10 XP. ' : '+5 XP. '}${step.feedback}`;
      $('#continue').disabled = false;
      // sourceContext lets repository.mjs's evidence tracking register that this skill
      // was demonstrated on a live tractate daf, not just inside a scripted course lesson.
      // A skill shown to hold up in more than one source context earns a small mastery
      // bonus there (Math-Academy-style: transfer is stronger evidence than repetition).
      Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'answer_submitted', skillId: `lab-${lab.id}-${index + 1}`, competency: ['recognition', 'translation', 'argument'][index] || 'sourceReasoning', correct, sourceContext: lab.ref }) }).then((response) => response.ok ? response.json() : null).then((learner) => { if (learner) { xp = learner.xp; updateXp(); } }).catch(() => {});
    });
    answers.appendChild(button);
  });
}

$('#translate').addEventListener('click', () => { translationsVisible = !translationsVisible; $('#translate').textContent = translationsVisible ? 'Hide translation' : 'Show translation'; $('#translation-drawer').hidden = !translationsVisible; });
$('#continue').addEventListener('click', () => { if (complete) { location.href = 'shas-map-v2.html'; return; } if (!answered) return; if (index < lab.steps.length - 1) { index += 1; render(); return; } complete = true; $('#step-title').textContent = 'Lab complete'; $('#prompt').textContent = `You worked directly on the source page in ${lab.tractate}. Your next field is waiting on the Shas map.`; $('#answers').innerHTML = ''; $('#feedback').textContent = 'Your answers and XP have been recorded. Notice how you located the case, named the text move, and asked the next responsible question.'; $('#continue').disabled = false; $('#continue').textContent = 'Return to all Shas →'; });

Promise.all([fetch(`/api/labs/${encodeURIComponent(tractate)}`).then((response) => response.ok ? response.json() : Promise.reject()), fetch(`/api/learners/${learnerId}`).then((response) => response.ok ? response.json() : Promise.resolve({ xp: 0 }))]).then(([loadedLab, learner]) => { lab = loadedLab; xp = learner.xp || 0; updateXp(); document.title = `Seder - ${lab.tractate} Lab`; $('#title').textContent = `${lab.tractate} working daf`; $('#focus').textContent = lab.focus; $('#reference').textContent = lab.ref; $('#source-link').href = lab.sourceUrl; $('#lab-status').textContent = lab.status.replaceAll('-', ' ').toUpperCase(); $('#editorial').textContent = 'This activity is a reviewed instructional demo. It supports learning and does not provide halakhic rulings.'; render(); }).catch(() => { $('#title').textContent = 'Lab unavailable'; $('#focus').textContent = 'This tractate lab has not been added yet. Return to the Shas map and choose Berakhot, Shabbat, Pesachim, or Bava Metzia.'; });
