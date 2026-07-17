const learnerId = Seder.currentLearnerId();
const id = new URLSearchParams(location.search).get('course') || 'shema-six';
const $ = (selector) => document.querySelector(selector);
const bridgeByCourse = {
  'shema-six': 'shema-to-blessings',
  'blessings-six': 'blessings-to-tefillah',
  'tefillah-six': 'tefillah-to-freedom',
  'freedom-six': 'freedom-to-history',
  'history-six': 'history-to-responsibility'
};

function hideCapstoneControls() {
  ['#source-one', '#source-two', '#move', '#judgment', '#submit'].forEach((selector) => { $(selector).hidden = true; });
}

function sourceOptions(sources) {
  return sources.map((source) => `<option value="${source.replaceAll('"', '&quot;')}">${source}</option>`).join('');
}

Promise.all([
  fetch('/api/curriculum/course-capstones').then((response) => response.json()),
  fetch('/api/curriculum/canon-six-session-courses').then((response) => response.json())
]).then(([capstones, courses]) => {
  const cap = capstones.capstones.find((item) => item.id === id) || capstones.capstones[0];
  const course = courses.courses.find((item) => item.id === cap.id);
  const completed = new Set(JSON.parse(localStorage.getItem(`seder-course-${cap.id}-${learnerId}`) || '[]'));
  const required = course?.sessions.length || 6;

  if (completed.size < required) {
    $('#title').textContent = `${cap.title} is waiting for your source work`;
    $('#sources').innerHTML = `<article class="source"><div class="citation">${completed.size} OF ${required} MOVES DEMONSTRATED</div><p class="line-note">Complete the course moves first. The capstone independently connects sources after meeting them in sequence.</p><p><a href="canon-course.html?course=${cap.id}&session=${completed.size}">Return to the next course move →</a></p></article>`;
    $('#prompt').textContent = 'This capstone unlocks after all six course moves are demonstrated.';
    hideCapstoneControls();
    return;
  }

  $('#title').textContent = cap.title;
  $('#sources').innerHTML = cap.sources.map((source) => `<article class="source"><div class="citation">${source}</div><p class="line-note">Choose this source when making your comparison.</p></article>`).join('');
  $('#prompt').textContent = cap.prompt;
  const options = sourceOptions(cap.sources);
  $('#source-one').insertAdjacentHTML('beforeend', options);
  $('#source-two').insertAdjacentHTML('beforeend', options);

  $('#submit').onclick = async () => {
    const first = $('#source-one').value;
    const second = $('#source-two').value;
    const move = $('#move').value;
    const judgment = document.querySelector('input[name="judgment"]:checked')?.value;
    if (!first || !second || !move || !judgment) {
      $('#feedback').textContent = 'Choose two sources, a reading move, and a comparison judgment.';
      return;
    }
    if (first === second) {
      $('#feedback').textContent = 'Choose two different sources so the comparison has a real relationship to examine.';
      return;
    }
    if (judgment !== 'context') {
      $('#feedback').textContent = 'Not yet. Responsible comparison names both a connection and a difference, then attends to setting.';
      return;
    }

    localStorage.setItem(`seder-capstone-${cap.id}-${learnerId}`, 'complete');
    const bridge = bridgeByCourse[cap.id];
    $('#feedback').innerHTML = bridge
      ? `Independent connection recorded. You compared two named sources through a ${move} reading move. <a href="canon-bridge.html?bridge=${bridge}">Carry it into the next canon bridge →</a>`
      : 'Independent connection recorded. You have completed the current canon sequence. <a href="gemara-continuation.html">Return to your Gemara path →</a>';
    try {
      await Seder.api(`/api/learners/${learnerId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'source_annotation',
          skillId: cap.skill,
          competency: 'sourceReasoning',
          sourceContext: cap.title,
          correct: true,
          sourceOne: first,
          sourceTwo: second,
          readingMove: move,
          judgment
        })
      });
    } catch (error) {
      console.warn(error);
    }
  };
}).catch(() => {
  $('#title').textContent = 'Capstone temporarily unavailable';
  $('#prompt').textContent = 'Return to your course and try again shortly.';
  hideCapstoneControls();
});
