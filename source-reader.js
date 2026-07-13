const learnerId = Seder.currentLearnerId();
const notesKey = `seder-source-reader-${learnerId}`;
const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
const requested = new URLSearchParams(location.search).get('collection');
const $ = (selector) => document.querySelector(selector);
let data;
let active = 0;
let viewed = new Set();
const seenKey = (collection) => `seder-source-reader-seen-${collection.id}-${learnerId}`;
const completeKey = (collection) => `seder-source-reader-complete-${collection.id}-${learnerId}`;

function renderCompletion(collection) {
  const complete = localStorage.getItem(completeKey(collection)) === 'complete';
  const ready = viewed.size >= collection.lines.length;
  $('#reader-completion').innerHTML = complete ? `<strong>Passage complete</strong><p>You have worked through every line and recorded your reading path.</p><a class="source-link" href="${collection.connectionUrl}">Carry this source into the next unit &rarr;</a><a class="source-link" href="daily-router.html">Return to today&apos;s plan &rarr;</a>` : `<strong>Close the reading loop</strong><p>${ready ? 'You have focused every line. Name the move that mattered most, then complete this passage.' : `Focus ${collection.lines.length - viewed.size} more line${collection.lines.length - viewed.size === 1 ? '' : 's'} before closing the passage.`}</p><textarea id="reading-reflection" placeholder="What did this source ask you to notice?"></textarea><button id="complete-reading" class="save-note" ${ready ? '' : 'disabled'}>Complete this passage</button>`;
  const button = $('#complete-reading');
  if (!button) return;
  button.onclick = async () => {
    const reflection = $('#reading-reflection').value.trim();
    if (!reflection) { $('#reading-reflection').focus(); return; }
    localStorage.setItem(completeKey(collection), 'complete');
    localStorage.setItem(`${completeKey(collection)}-reflection`, reflection);
    try { await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_reading_completed', skillId: `source-reader-${collection.id}`, competency: 'sourceReasoning', sourceContext: collection.title, reflection, correct: true }) }); } catch (error) { console.warn(error); }
    renderCompletion(collection);
  };
}

function focus(line, collection, lineIndex) {
  viewed.add(lineIndex);
  localStorage.setItem(seenKey(collection), JSON.stringify([...viewed]));
  $('#focus').innerHTML = `<small>FOCUS IN THE SOURCE &middot; ${line.ref}</small><strong>${line.note}</strong><p>${line.translation}</p>`;
  renderCompletion(collection);
}

function render() {
  const collection = data.collections[active];
  viewed = new Set(JSON.parse(localStorage.getItem(seenKey(collection)) || '[]'));
  $('#title').textContent = collection.title;
  $('#connection').innerHTML = `${collection.connection} <a class="source-link" target="_blank" rel="noreferrer" href="${collection.sourceUrl}">Open full source at Sefaria &rarr;</a>`;
  $('#collection-nav').innerHTML = data.collections.map((item, itemIndex) => `<button class="lab-button ${itemIndex === active ? 'active' : ''}" data-nav="${itemIndex}">${item.title}<small>${item.lines.length} connected lines</small></button>`).join('');
  document.querySelectorAll('[data-nav]').forEach((button) => { button.onclick = () => { active = Number(button.dataset.nav); render(); }; });
  $('#reader').innerHTML = collection.lines.map((line, lineIndex) => `<article class="source-line" data-line="${lineIndex}"><div class="line-ref">${line.ref}</div><p class="line-hebrew" lang="he" dir="rtl">${line.hebrew}</p><p class="line-translation" hidden>${line.translation}</p><div class="line-actions"><button class="translate">Show translation</button><button class="focus-line">Focus this line</button><button class="highlight">Highlight</button><a href="notebook.html?source=${encodeURIComponent(line.ref)}">Open in notebook</a></div><p class="line-note">${line.note}</p><textarea placeholder="Private note on this line"></textarea><button class="save-note">Save line note</button></article>`).join('') + '<section id="reader-completion" class="source-line"></section>';
  document.querySelectorAll('.source-line[data-line]').forEach((line, lineIndex) => {
    line.querySelector('.translate').onclick = () => { const translation = line.querySelector('.line-translation'); translation.hidden = !translation.hidden; line.querySelector('.translate').textContent = translation.hidden ? 'Show translation' : 'Hide translation'; };
    line.querySelector('.focus-line').onclick = () => focus(collection.lines[lineIndex], collection, lineIndex);
    line.querySelector('.highlight').onclick = () => line.classList.toggle('highlight');
    line.querySelector('.save-note').onclick = () => { const note = line.querySelector('textarea').value.trim(); if (!note) return; notes.push({ source: collection.lines[lineIndex].ref, note, at: new Date().toISOString() }); localStorage.setItem(notesKey, JSON.stringify(notes)); line.querySelector('.save-note').textContent = 'Saved'; Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'note_saved', sourceContext: collection.lines[lineIndex].ref, note }) }).catch(() => {}); };
  });
  focus(collection.lines[0], collection, 0);
}

fetch('/api/curriculum/non-gemara-source-reader').then((response) => response.json()).then((result) => { data = result; const match = result.collections.findIndex((collection) => collection.id === requested); if (match >= 0) active = match; render(); });
