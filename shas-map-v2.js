const sederOrder = ['Zeraim', 'Moed', 'Nashim', 'Nezikin', 'Kodashim', 'Taharot'];
const map = document.querySelector('#map');
const detail = document.querySelector('#detail');

function showTractate(tractate, button) {
  document.querySelectorAll('.tractate').forEach((item) => item.classList.toggle('active', item === button));
  const entry = tractate.entry ? 'YOUR STARTING TRACTATE' : `${tractate.seder.toUpperCase()} · TRACTATE STUDY`;
  // A tractate with a full arc (multi-step course, not just a single practice lab) should
  // route there first -- the arc teaches the vocabulary and case-reading moves the lab then
  // exercises. Falling straight through to labId here would silently strand a built arc page
  // with no link pointing at it, the same "orphaned page" gap fixed elsewhere in the app.
  const destination = tractate.entry ? 'berakhot-arc.html' : tractate.arcUrl ? tractate.arcUrl : tractate.labId ? `lab.html?tractate=${encodeURIComponent(tractate.labId)}` : 'study.html?v=12';
  const action = tractate.entry ? 'Begin the Berakhot onramp' : tractate.arcUrl ? `Begin the ${tractate.title} arc` : tractate.labId ? `Open ${tractate.title} lab` : 'Practice prerequisite skills';
  detail.innerHTML = `<span>${entry}</span><h2>${tractate.title}</h2><p>Study ${tractate.theme} through a sequence of language, sugya structure, source skills, and review.</p><div><small>REQUIRED BEFORE THIS TRACTATE</small><strong>${tractate.prerequisites.join(' → ').replaceAll('-', ' ')}</strong></div><div><small>FIRST PRACTICE FIELD</small><strong>${tractate.practice}</strong></div><a href="${destination}">${action} →</a>`;
}

function renderMap(tractates) {
  sederOrder.forEach((seder) => {
    const items = tractates.filter((tractate) => tractate.seder === seder);
    const section = document.createElement('section');
    section.className = 'seder';
    section.innerHTML = `<h2>${seder.toUpperCase()} · ${items.length} TRACTATE${items.length === 1 ? '' : 'S'}</h2><div class="tractates"></div>`;
    const holder = section.querySelector('.tractates');
    items.forEach((tractate) => {
      const button = document.createElement('button');
      button.className = `tractate ${tractate.entry ? 'entry active' : ''}`;
      button.textContent = tractate.title;
      button.addEventListener('click', () => showTractate(tractate, button));
      holder.appendChild(button);
    });
    map.appendChild(section);
  });
  const entry = tractates.find((tractate) => tractate.entry);
  if (entry) showTractate(entry, document.querySelector('.tractate.entry'));
}

fetch('/api/gemara/tractates')
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then((graph) => renderMap(graph.tractates))
  .catch(() => { detail.querySelector('p').textContent = 'The Shas curriculum graph could not be loaded. Refresh to try again.'; });
