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

function startIndex(collection) {
  const next = data.collections[active + 1];
  if (localStorage.getItem(completeKey(collection)) === 'complete' && !next) return collection.lines.length;
  const unseen = firstUnseen(collection);
  return unseen >= collection.lines.length ? 0 : unseen;
}

function markViewed(collection, lineIndex) {
  viewed.add(lineIndex);
  localStorage.setItem(seenKey(collection), JSON.stringify([...viewed]));
}

function nextPageHref(collection) {
  const next = data.collections[active + 1];
  if (!next) return '';
  return `source-reader.html?collection=${encodeURIComponent(next.id)}`;
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
  const href = nextPageHref(collection);
  if (href) {
    location.assign(href);
    return;
  }
  showComplete(collection);
}

function showComplete(collection) {
  $('#drill').hidden = true;
  $('#complete').hidden = false;
  $('#title').textContent = collection.title;
  $('#connection').textContent = collection.connection;
  $('#next-unit').href = 'daily-router.html';
  $('#sefaria').href = collection.sourceUrl;
}

function renderLine() {
  const collection = data.collections[active];
  if (current >= collection.lines.length) {
    showComplete(collection);
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
  current = startIndex(collection);
  renderLine();
});
