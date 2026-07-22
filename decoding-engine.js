// Glyph-card decoding runner for window.DecodingDrills. Standalone (not course-engine.js): a single
// large glyph, no source card, and the drill is not a canon source. Reads ?lesson=<id>; renders that
// lesson's items; marks the lesson complete (localStorage) and links to the next one. XP is a local
// session counter and answers are NOT posted to the server event log — decoding skill ids are not in
// the curriculum graph yet, so keeping them out avoids polluting the source-review queue (v3 wiring,
// see docs/hebrew-decoding-ladder-plan.md). Audio is browser TTS (he-IL), shown only when a Hebrew
// voice is available — a graceful fallback until recorded audio replaces it.
const drills = window.DecodingDrills;
const order = drills.bands.flatMap((b) => b.lessons);
const params = new URLSearchParams(location.search);
let lessonId = params.get('lesson');
if (!lessonId || !drills.lessons[lessonId]) lessonId = order[0];
const drill = drills.lessons[lessonId];
const decLearner = (window.Seder && Seder.currentLearnerId && Seder.currentLearnerId()) || 'local';
const doneKey = `seder-decoding-done:${decLearner}`;
const progressKey = `seder-decoding-progress:${decLearner}:${lessonId}`;
const readDone = () => { try { return new Set(JSON.parse(localStorage.getItem(doneKey) || '[]')); } catch { return new Set(); } };
// Spaced review: on completing (or reviewing) a lesson, push each of its dec- skills' next-due date
// further out. Local to decoding — decoding is reviewed by re-drilling glyphs, not in the source
// queue. Intervals grow with each successful pass; the ladder index surfaces skills that come due.
const reviewKey = `seder-decoding-review:${decLearner}`;
const REVIEW_INTERVALS = [1, 3, 7, 21, 60].map((d) => d * 86400000);
function scheduleReview() {
  const skills = (drills.lessonSkills && drills.lessonSkills[lessonId]) || [];
  if (!skills.length) return;
  let rec = {}; try { rec = JSON.parse(localStorage.getItem(reviewKey) || '{}'); } catch { rec = {}; }
  const now = Date.now();
  for (const s of skills) {
    const reps = ((rec[s] && rec[s].reps) || 0) + 1;
    rec[s] = { reps, dueAt: now + REVIEW_INTERVALS[Math.min(reps - 1, REVIEW_INTERVALS.length - 1)] };
  }
  localStorage.setItem(reviewKey, JSON.stringify(rec));
}
const decSaved = Number(localStorage.getItem(progressKey));
let decIndex = Number.isInteger(decSaved) && decSaved >= 0 && decSaved < drill.items.length ? decSaved : 0, decAnswered = false, decXp = 0;
const $ = (s) => document.querySelector(s);
const decShuffle = (list) => list.map((text, i) => ({ text, i })).sort(() => Math.random() - .5);

let heVoice = null;
function loadVoice() { if (!('speechSynthesis' in window)) return; const v = speechSynthesis.getVoices().find((x) => /^(he|iw)/i.test(x.lang)); if (v) heVoice = v; }
loadVoice();
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', () => { loadVoice(); updateHear(); });
function speak(text) { if (!('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(text); u.lang = 'he-IL'; u.rate = .75; if (heVoice) u.voice = heVoice; speechSynthesis.cancel(); speechSynthesis.speak(u); }
function updateHear() {
  const hear = $('#hear'); if (!hear) return;
  const item = drill.items[decIndex];
  const canHear = Boolean(item.say) && ('speechSynthesis' in window) && Boolean(heVoice);
  hear.hidden = !canHear;
  hear.onclick = canHear ? () => speak(item.say) : null;
}

function decRender() {
  const item = drill.items[decIndex]; decAnswered = false;
  $('#count').textContent = `${decIndex + 1} / ${drill.items.length}`;
  $('#bar').style.width = `${(decIndex + 1) / drill.items.length * 100}%`;
  $('#band').textContent = drill.bandLabel || 'DECODING';
  $('#glyph').textContent = item.glyph;
  $('#prompt').textContent = item.prompt;
  $('#feedback').textContent = '';
  $('#continue').disabled = true;
  $('#continue').textContent = decIndex === drill.items.length - 1 ? 'Finish lesson →' : 'Continue →';
  updateHear();
  const answers = $('#answers'); answers.innerHTML = '';
  decShuffle(item.answers).forEach(({ text, i }) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', () => decAnswer(b, i === item.correct, item)); answers.appendChild(b); });
  $('#map').innerHTML = drill.items.map((it, i) => `<li class="${i === decIndex ? 'active' : ''} ${i < decIndex ? 'done' : ''}">${it.short || it.glyph}</li>`).join('');
}
function decAnswer(button, correct, item) {
  if (decAnswered) return; decAnswered = true;
  document.querySelectorAll('#answers button').forEach((b) => b.disabled = true);
  button.classList.add(correct ? 'correct' : 'incorrect');
  decXp += correct ? 10 : 5;
  $('#xp').textContent = `${decXp} XP`;
  $('#feedback').textContent = (correct ? '+10 XP. ' : '+5 XP. ') + item.feedback;
  $('#continue').disabled = false;
}
$('#continue').addEventListener('click', () => {
  if (!decAnswered) return;
  if (decIndex < drill.items.length - 1) { decIndex++; localStorage.setItem(progressKey, String(decIndex)); decRender(); return; }
  localStorage.removeItem(progressKey);
  const done = readDone(); done.add(lessonId); localStorage.setItem(doneKey, JSON.stringify([...done]));
  scheduleReview();
  const next = order[order.indexOf(lessonId) + 1];
  const cta = next ? `<a href="decoding-lesson.html?lesson=${next}">Next lesson →</a>` : '<a href="foundation-reading-orientation.html">Begin Reading Orientation →</a>';
  $('.lesson').innerHTML = `<section class="mastery"><span class="eyebrow">${next ? 'LESSON COMPLETE' : 'YOU CAN READ HEBREW'}</span><h2>${drill.title || 'Lesson complete.'}</h2><p>Your progress is saved. ${next ? 'The next lesson builds on what you just learned.' : 'You have finished the decoding ladder — you can read Hebrew and begin an unvocalized line. Next comes learning to read a source: orientation.'}</p>${cta}</section>`;
});
if ($('#band-title')) $('#band-title').textContent = drill.title || '';
decRender();
