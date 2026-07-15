(() => {
  const layout = document.querySelector('.course-layout');
  const lesson = layout?.querySelector('.lesson');
  if (!layout || !lesson || document.querySelector('#berakhot-daf-rail')) return;

  const lines = [
    { id: 'mishnah', label: 'MISHNAH', hebrew: 'מֵאֵימָתַי קוֹרִין אֶת שְׁמַע בְּעַרְבִין?', transliteration: 'Me-ematai korin et Shema be-arvin?', detail: 'The Mishnah opens with a practical time-question. First name the practice and the question before trying to settle it.' },
    { id: 'context', label: 'GEMARA QUESTION', hebrew: 'תַּנָּא הֵיכָא קָאֵי דְּקָתָנֵי מֵאֵימָתַי?', transliteration: 'Tanna heikha kai de-katanei me-ematai?', detail: 'The Gemara asks what prior context makes the Mishnah begin here. This is a question about the question.' },
    { id: 'verse', label: 'SCRIPTURAL SIGNAL', hebrew: 'תַּנָּא אַקְרָא קָאֵי, דִּכְתִיב', transliteration: 'Tanna a-kra kai, dikhtiv', detail: 'The phrase dikhtiv means “as it is written.” The Gemara is about to bring a verse as evidence.' },
    { id: 'answer', label: 'VERSE', hebrew: 'בְּשָׁכְבְּךָ וּבְקוּמֶךָ', transliteration: 'Be-shokhbekha u-ve-kumekha', detail: 'The verse explains the Mishnah’s order: lying down is named before rising up. It gives a reason, not yet a clock-time ruling.' }
  ];
  const modeToLine = { ORIENT: 'mishnah', LANGUAGE: 'mishnah', 'TEXT MAP': 'context', ARGUMENT: 'context', 'SOURCE SIGNAL': 'verse', REASONING: 'answer', 'ARGUMENT MAP': 'answer', 'INDEPENDENT READ': 'verse', 'MASTERY CHECK': 'context', 'PRODUCTION CHECK': 'mishnah' };

  const rail = document.createElement('aside');
  rail.id = 'berakhot-daf-rail';
  rail.innerHTML = `<span>FOCUS IN THE DAF</span><h2>Berakhot 2a</h2><p class="daf-rail-intro">Follow the active move in its source sequence. Select a line to inspect its reading job.</p><div class="daf-lines">${lines.map((line) => `<button type="button" data-daf-line="${line.id}"><small>${line.label}</small><b lang="he" dir="rtl">${line.hebrew}</b></button>`).join('')}</div><section id="daf-detail" aria-live="polite"></section>`;
  lesson.before(rail);

  const detail = rail.querySelector('#daf-detail');
  const show = (id) => {
    const line = lines.find((item) => item.id === id) || lines[0];
    rail.querySelectorAll('[data-daf-line]').forEach((button) => button.classList.toggle('active', button.dataset.dafLine === line.id));
    detail.innerHTML = `<small>${line.label} · READING AID</small><p><i>${line.transliteration}</i></p><p>${line.detail}</p>`;
  };
  rail.querySelectorAll('[data-daf-line]').forEach((button) => button.addEventListener('click', () => show(button.dataset.dafLine)));
  const sync = () => show(modeToLine[document.querySelector('#mode')?.textContent.trim()] || 'mishnah');
  new MutationObserver(sync).observe(lesson, { childList: true, subtree: true, characterData: true });
  sync();

  const style = document.createElement('style');
  style.textContent = `
    #berakhot-daf-rail{align-self:start;padding:18px;background:#f4f0e6;border-top:3px solid #b88028;color:#1f3036}
    #berakhot-daf-rail>span,#berakhot-daf-rail small{color:#276b68;font:10px 'DM Mono',monospace;letter-spacing:.08em}
    #berakhot-daf-rail h2{margin:7px 0;color:#183b4e;font:600 25px Fraunces,Georgia,serif}
    .daf-rail-intro{margin:0 0 14px;color:#637178;font-size:12px;line-height:1.5}
    .daf-lines{display:grid;gap:7px}.daf-lines button{padding:10px;border:1px solid #ded6c8;background:#fffdf8;color:#183b4e;text-align:left;cursor:pointer}
    .daf-lines button.active{border-color:#276b68;background:#e4f0e8;box-shadow:inset 3px 0 #276b68}
    .daf-lines small{display:block;margin-bottom:5px}.daf-lines b{display:block;font:500 18px/1.45 'Noto Sans Hebrew',sans-serif}
    #daf-detail{margin-top:14px;padding-top:12px;border-top:1px solid #d8d0c2;color:#637178;font-size:12px;line-height:1.55}
    #daf-detail p{margin:6px 0}#daf-detail i{color:#183b4e}
    @media(min-width:1000px){.course-layout{grid-template-columns:210px 270px minmax(0,720px)}}
    @media(max-width:999px){#berakhot-daf-rail{grid-column:1/-1}.course-layout{grid-template-columns:220px minmax(0,1fr)}}
    @media(max-width:720px){#berakhot-daf-rail{grid-column:auto}.course-layout{grid-template-columns:1fr}.daf-lines{grid-template-columns:repeat(2,minmax(0,1fr))}.daf-lines b{font-size:15px}}
  `;
  document.head.append(style);
})();
