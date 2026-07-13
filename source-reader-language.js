(() => {
  const learnerId = Seder.currentLearnerId();
  const vocabularyKey = `seder-personal-vocabulary-${learnerId}`;
  const glosses = {
    'שמע': ['hear', 'An imperative: the line calls the listener to attend.'], 'ישראל': ['Israel', 'The direct addressee of the declaration.'], 'אחד': ['one', 'The predicate affirmed in the opening declaration.'],
    'ואהבת': ['and you shall love', 'A future/command form that carries the verse into action.'], 'דברים': ['words', 'The object carried, taught, and spoken.'], 'ושננתם': ['teach them diligently', 'An action word: notice who is asked to teach.'],
    'ואכלת': ['and you shall eat', 'The first action in a sequence.'], 'ושבעת': ['and be satisfied', 'The second action in the sequence.'], 'וברכת': ['and you shall bless', 'The response the verse asks for after receiving.'],
    'גר': ['stranger / resident outsider', 'A key person-category in the covenantal command.'], 'ואהבתם': ['and you shall love', 'The command addressed to the community.'], 'לא': ['not', 'A negation; it changes the action that follows.'],
    'קרוב': ['near', 'A predicate describing the matter.'], 'לבבך': ['your heart', 'One sphere in which the command is located.'], 'ובחרת': ['and you shall choose', 'An imperative conclusion drawn from the alternatives.'],
    'הכל': ['everything', 'The opening term of a deliberately compact claim.'], 'הרשות': ['permission / agency', 'The second side of Avot’s tension.'],
    'במקום': ['in a place', 'A setting phrase that frames the teaching’s case.'], 'השתדל': ['strive', 'The action the teaching asks of the reader.'], 'ללמוד': ['to learn', 'An infinitive naming the activity at stake.'], 'עבדו': ['serve', 'An imperative plural: a call to communal action.'], 'בשמחה': ['with joy', 'The manner in which the action is performed.']
  };
  const lensByRef = { 'Deuteronomy 6:4': 'Start with direct address, then identify the claim being affirmed.', 'Deuteronomy 6:5': 'Find the action word first; the rest of the line expands its scope.', 'Deuteronomy 6:6–7': 'Follow the movement from inward attention to teaching and speech.', 'Deuteronomy 6:8–9': 'Track repeated action words: bind, place, write.', 'Deuteronomy 8:10': 'This is a sequence. Read the verbs in order before interpreting the practice.', 'Mishnah Berakhot 7:1': 'First identify the group, then the obligation being assigned to it.', 'Berakhot 35a': 'This is a compressed claim. Use translation to identify its moral pressure, not as a substitute for the original.', 'Deuteronomy 10:19': 'A command is followed by a reason. Locate each before comparing interpretations.', 'Exodus 23:9': 'Notice the negation, then the memory-based reason that follows it.', 'Deuteronomy 30:14': 'Map the linked spheres: mouth, heart, and action.', 'Deuteronomy 30:19': 'The final verb gives the line its practical direction.', 'Pirkei Avot 3:15': 'Keep both halves visible; do not erase the tension by translating only one.', 'Pirkei Avot 2:5': 'Find the setting phrase before the imperative.', 'Psalms 100:2': 'The verb tells you what to do; the final word tells you how.' };
  function clean(word) { return word.normalize('NFD').replace(/[\u0591-\u05C7.,:;!?״׳]/g, '').normalize('NFC'); }
  function addWord(word, explanation) { const button = document.createElement('button'); button.type = 'button'; button.className = 'language-word'; button.textContent = word; button.title = 'Open a quick reading gloss'; button.onclick = () => { explanation.hidden = false; explanation.textContent = `${word}: ${glosses[clean(word)][0]}. ${glosses[clean(word)][1]}`; }; return button; }
  function addLanguageSupport(line) {
    if (line.dataset.languageSupport) return; line.dataset.languageSupport = 'true';
    const actions = line.querySelector('.line-actions'), hebrew = line.querySelector('.line-hebrew'), ref = line.querySelector('.line-ref')?.textContent?.trim(); if (!actions || !hebrew) return;
    const lens = document.createElement('button'); lens.type = 'button'; lens.textContent = 'Language lens';
    const panel = document.createElement('aside'); panel.className = 'language-lens'; panel.hidden = true;
    const explanation = document.createElement('p'); explanation.className = 'language-gloss'; explanation.hidden = true;
    const words = hebrew.textContent.trim().split(/\s+/).filter((word) => glosses[clean(word)]);
    panel.innerHTML = `<strong>Read this line before translating</strong><p>${lensByRef[ref] || 'Find the action word, any connector, and the person or thing affected before checking translation.'}</p>`;
    if (words.length) { const wordRow = document.createElement('div'); wordRow.className = 'language-words'; words.forEach((word) => wordRow.appendChild(addWord(word, explanation))); panel.append(wordRow, explanation); }
    const ladder = document.createElement('a'); ladder.href = 'language.html'; ladder.textContent = 'Practice this reading skill in the language ladder →'; panel.append(ladder);
    lens.onclick = () => { panel.hidden = !panel.hidden; lens.textContent = panel.hidden ? 'Language lens' : 'Hide language lens'; };
    const speak = document.createElement('button'); speak.type = 'button'; speak.textContent = 'Hear Hebrew'; speak.onclick = () => { if (!('speechSynthesis' in window)) { speak.textContent = 'Audio unavailable'; return; } window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(hebrew.textContent.trim()); utterance.lang = 'he-IL'; utterance.rate = 0.72; window.speechSynthesis.speak(utterance); };
    const saveWord = document.createElement('button'); saveWord.type = 'button'; saveWord.textContent = 'Save key word'; saveWord.onclick = () => { const term = window.prompt('Type the Hebrew or Aramaic word you want to retain.'); if (!term?.trim()) return; const meaning = window.prompt(`What does ${term.trim()} mean in this line?`); if (!meaning?.trim()) return; const saved = JSON.parse(localStorage.getItem(vocabularyKey) || '[]'); const now = new Date(); saved.push({ term: term.trim(), meaning: meaning.trim(), source: ref || 'Source Reader', at: now.toISOString(), dueAt: now.toISOString(), intervalDays: 1 }); localStorage.setItem(vocabularyKey, JSON.stringify(saved)); saveWord.textContent = 'Word saved'; };
    actions.append(lens, speak, saveWord); line.querySelector('.line-note').after(panel);
  }
  function enhance() { document.querySelectorAll('.source-line[data-line]').forEach(addLanguageSupport); }
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true }); enhance();
})();
