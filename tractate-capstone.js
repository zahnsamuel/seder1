const learnerId = Seder.currentLearnerId();
const id = new URLSearchParams(location.search).get('tractate') || 'berakhot';
const $ = (selector) => document.querySelector(selector);

const caps = {
  berakhot: { title: 'Berakhot: opening sugya capstone', source: 'Mishnah Berakhot 1:1 · Berakhot 2a', prompt: 'Map how “From when?” becomes a Gemara question about context and then a verse-grounded response.' },
  shabbat: { title: 'Shabbat: case-map capstone', source: 'Mishnah Shabbat 1:1 · Shabbat 2a', prompt: 'Map the people, domains, and action that create a legal category.' },
  pesachim: { title: 'Pesachim: time-and-action capstone', source: 'Mishnah Pesachim 1:1 · Pesachim 2a', prompt: 'Keep action, time, tool, and the word אור distinct before drawing a conclusion.' },
  eruvin: { title: 'Eruvin: threshold capstone', source: 'Mishnah Eruvin 1:1 · Eruvin 2a', prompt: 'Map a measurement, the response to it, and the stated reason.' },
  sukkah: { title: 'Sukkah: validity capstone', source: 'Mishnah Sukkah 1:1 · Sukkah 2a', prompt: 'Connect a structural condition, a ruling, and a purpose without flattening the argument.' },
  'bava-metzia': { title: 'Bava Metzia: claims-and-evidence capstone', source: 'Mishnah Bava Metzia 1:1 · Bava Metzia 2a', prompt: 'Map matching claims as an evidentiary problem before looking for a resolution.' },
  'bava-kamma': { title: 'Bava Kamma: categories-of-damage capstone', source: 'Mishnah Bava Kamma 1:1 · Bava Kamma 2a', prompt: 'Keep distinct categories and their shared principle in view together.' },
  ketubot: { title: 'Ketubot: schedule-and-reason capstone', source: 'Mishnah Ketubot 1:1 · Ketubot 2a', prompt: 'Map a fixed schedule, its institutional reason, and the concern that qualifies it.' },
  chullin: { title: 'Chullin: rule-and-exception capstone', source: 'Mishnah Chullin 1:1 · Chullin 2a', prompt: 'Read a broad rule through its exception and the reason the exception supplies.' },
  niddah: { title: 'Niddah: three-way dispute capstone', source: 'Mishnah Niddah 1:1', prompt: 'Keep each named position distinct before asking what their disagreement measures.' }
};

const cap = caps[id] || caps.berakhot;
$('#title').textContent = cap.title;
$('#source-title').textContent = cap.source;
$('#source-prompt').textContent = cap.prompt;

$('#submit').onclick = async () => {
  const caseType = $('#case').value;
  const move = $('#move').value;
  const judgment = document.querySelector('input[name="judgment"]:checked')?.value;
  if (!caseType || !move || !judgment) {
    $('#feedback').textContent = 'Choose a case feature, a reading move, and the source-grounded judgment.';
    return;
  }
  if (judgment !== 'separate') {
    $('#feedback').textContent = 'Not yet. A strong reading keeps the case, move, and evidence distinct before drawing a conclusion.';
    return;
  }

  localStorage.setItem(`seder-tractate-capstone-${id}-${learnerId}`, 'complete');
  Seder.saveJourneyArtifact('tractate_capstone', id);
  $('#feedback').innerHTML = 'Capstone recorded. You mapped a case and chose a source-reading move without mistaking an outcome for the argument. <a href="gemara-continuation.html">Open Gemara path →</a>';
  try {
    await Seder.api(`/api/learners/${learnerId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'source_annotation',
        skillId: `${id}-tractate-capstone`,
        competency: 'argument',
        sourceContext: cap.source,
        correct: true,
        readingMove: move,
        case: caseType,
        judgment
      })
    });
  } catch (error) {
    console.warn(error);
  }
};
