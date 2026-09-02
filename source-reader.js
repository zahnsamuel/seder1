const learnerId = Seder.currentLearnerId();
const requested = new URLSearchParams(location.search).get('collection');
const $ = (selector) => document.querySelector(selector);

let data;
let active = 0;
let current = 0;
let viewed = new Set();

const seenKey = (collection) => `seder-source-reader-seen-${collection.id}-${learnerId}`;
const completeKey = (collection) => `seder-source-reader-complete-${collection.id}-${learnerId}`;

function loadViewed(collection) {
  try { return new Set(JSON.parse(localStorage.getItem(seenKey(collection)) || '[]')); } catch { return new Set(); }
}

function firstUnseen(collection) {
  for (let index = 0; index < collection.lines.length; index += 1) {
    if (!viewed.has(index)) return index;
  }
  return collection.lines.length;
}

function markViewed(collection, lineIndex) {
  viewed.add(lineIndex);
  localStorage.setItem(seenKey(collection), JSON.stringify([...viewed]));
}

async function completePassage(collection) {
  localStorage.setItem(completeKey(collection), 'complete');
  try {
    await Seder.api(`/api/learners/${learnerId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'source_reading_completed',
        skillId: `source-reader-${collection.id}`,
        competency: 'sourceReasoning',
        sourceContext: collection.title,
        correct: true
      })
    });
  } catch (error) { console.warn(error); }
  showComplete(collection);
}

function showComplete(collection) {
  $('#drill').hidden = true;
  $('#complete').hidden = false;
  $('#title').textContent = collection.title;
  $('#connection').textContent = collection.connection;
  $('#next-unit').href = collection.connectionUrl;
  $('#sefaria').href = collection.sourceUrl;
}

function renderLine() {
  const collection = data.collections[active];
  const done = localStorage.getItem(completeKey(collection)) === 'complete';
  if (done || current >= collection.lines.length) {
    if (!done && viewed.size >= collection.lines.length) completePassage(collection);
    else showComplete(collection);
    return;
  }

  const line = collection.lines[current];
  $('#drill').hidden = false;
  $('#complete').hidden = true;
  $('#title').textContent = collection.title;
  $('#line-ref').textContent = line.ref;
  $('#count').textContent = `${current + 1} / ${collection.lines.length}`;
  $('#bar').style.width = `${((current + 1) / collection.lines.length) * 100}%`;
  $('#hebrew').textContent = line.hebrew;
  $('#translation').textContent = line.translation;
  $('#translation').hidden = true;
  $('#toggleTranslation').textContent = 'Show translation';
  $('#prompt').textContent = line.note;
  $('#sefaria').href = collection.sourceUrl;
  $('#continue').disabled = false;
  $('#continue').textContent = current === collection.lines.length - 1 ? 'Complete this passage →' : 'Continue →';
}

function renderNav() {
  $('#collection-nav').innerHTML = data.collections.map((item, itemIndex) => (
    `<button type="button" class="lab-button ${itemIndex === active ? 'active' : ''}" data-nav="${itemIndex}">${item.title}<small>${item.lines.length} lines</small></button>`
  )).join('');
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.onclick = () => {
      active = Number(button.dataset.nav);
      const collection = data.collections[active];
      viewed = loadViewed(collection);
      current = firstUnseen(collection);
      renderNav();
      renderLine();
    };
  });
}

$('#toggleTranslation').onclick = () => {
  const translation = $('#translation');
  translation.hidden = !translation.hidden;
  $('#toggleTranslation').textContent = translation.hidden ? 'Show translation' : 'Hide translation';
};

$('#continue').onclick = async () => {
  if (!data || $('#continue').disabled) return;
  const collection = data.collections[active];
  markViewed(collection, current);
  if (current >= collection.lines.length - 1) {
    await completePassage(collection);
    return;
  }
  current += 1;
  renderLine();
};

fetch('/api/curriculum/non-gemara-source-reader').then((response) => response.json()).then((result) => {
  data = result;
  const match = result.collections.findIndex((collection) => collection.id === requested);
  if (match >= 0) active = match;
  const collection = data.collections[active];
  viewed = loadViewed(collection);
  current = firstUnseen(collection);
  renderNav();
  renderLine();
});
