(() => {
  const key = location.pathname.match(/\/(pesachim|eruvin|sukkah|bava-metzia|bava-kamma)-arc\.html$/)?.[1];
  const layout = document.querySelector('.course-layout');
  const lesson = layout?.querySelector('.lesson');
  if (!key || !layout || !lesson || document.querySelector('#tractate-daf-rail')) return;

  const rails = {
    pesachim: { title: 'Pesachim 2a', intro: 'Track the action, its time, its tool, and the limit that keeps the obligation practical.', modes: { 'CASE ORIENTATION': 'action', 'CASE MAP': 'map', 'AMBIGUOUS WORD': 'time', DISTINCTION: 'limit', 'PRACTICE AND SOURCE': 'source', TRANSFER: 'map', 'INDEPENDENT READ': 'action', 'PRODUCTION CHECK': 'time' }, lines: [
      ['action', 'ACTION', 'אוֹר לְאַרְבָּעָה עָשָׂר בּוֹדְקִין אֶת הֶחָמֵץ', 'Or le-arba’ah asar bodkin et ha-chametz', 'The action: search for chametz. Start by naming what the case asks a person to do.'],
      ['time', 'TIME WORD', 'אוֹר', 'Or', 'A compact word whose meaning is tested in context: light, or the eve.'],
      ['map', 'TIME + TOOL', 'אוֹר לְאַרְבָּעָה עָשָׂר · לְאוֹר הַנֵּר', 'Or le-arba’ah asar · le-or ha-ner', 'Separate the time of the action from the instrument used to carry it out.'],
      ['limit', 'PRACTICAL LIMIT', 'אֵין לַדָּבָר סוֹף', 'Ein la-davar sof', 'A limiting move: an open-ended concern cannot make practical fulfillment impossible.']
    ] },
    eruvin: { title: 'Eruvin 2a', intro: 'Track the measured space, the response it triggers, and the boundary markers under dispute.', modes: { 'CASE ORIENTATION': 'measure', 'CASE MAP': 'response', 'LEGAL CATEGORY': 'response', DISTINCTION: 'reason', 'CITED SOURCE': 'reason', COMPARISON: 'markers', TRANSFER: 'measure', 'INDEPENDENT READ': 'measure', 'PRODUCTION CHECK': 'reason', 'RESPONSIBLE LEARNING': 'markers' }, lines: [
      ['measure', 'MEASURED CASE', 'מָבוֹי שֶׁהוּא גָבוֹהַּ לְמַעְלָה מֵעֶשְׂרִים אַמָּה', 'Mavoi she-hu gavoha le-ma’lah me-esrim amah', 'The measurement opens the case. Read the physical fact before looking for an abstract rule.'],
      ['response', 'RESPONSE', 'יְמַעֵט', 'Yema’et', 'The Mishnah’s response: lower it. Keep the response attached to the condition that produced it.'],
      ['reason', 'GEMARA QUESTION', 'אַמַּאי?', 'Amai?', 'Why? The Gemara now asks what makes the measurement matter.'],
      ['markers', 'DISPUTE', 'לֶחִי וְקוֹרָה · לֶחִי אוֹ קוֹרָה', 'Lechi ve-korah · lechi o korah', 'A single connector carries the dispute: both markers, or either one.']
    ] },
    sukkah: { title: 'Sukkah 2a', intro: 'Track the structure, the boundary condition, the ruling, and the distinction that tests it.', modes: { 'CASE ORIENTATION': 'measure', 'CASE MAP': 'structure', 'LEGAL CATEGORY': 'ruling', 'REASON AND PROOF': 'reason', DISPUTE: 'dispute', TRANSFER: 'ruling', 'INDEPENDENT READ': 'structure', 'PRODUCTION CHECK': 'reason' }, lines: [
      ['structure', 'STRUCTURE', 'סֻכָּה', 'Sukkah', 'Name the thing being judged before deciding whether it meets a condition.'],
      ['measure', 'BOUNDARY', 'לְמַעְלָה מֵעֶשְׂרִים אַמָּה', 'Le-ma’lah me-esrim amah', 'The height condition that determines the ruling.'],
      ['ruling', 'RULING', 'פְּסוּלָה', 'Pesulah', 'Invalid. A short ruling gives the Gemara something exact to explain.'],
      ['dispute', 'DISTINCTION', 'הָא בְּ… הָא בְּ…', 'Ha be-… ha be-…', 'A distinction can show that two sources describe different cases, rather than disagreeing.']
    ] },
    'bava-metzia': { title: 'Bava Metzia 2a', intro: 'Track the two claimants, their symmetrical claims, the Mishnah’s response, and the evidence question.', modes: { 'CASE ORIENTATION': 'case', 'CASE MAP': 'claims', 'LEGAL CATEGORY': 'ruling', 'CHALLENGE AND SOURCE': 'evidence', TRANSFER: 'evidence', 'INDEPENDENT READ': 'case', 'PRODUCTION CHECK': 'ruling' }, lines: [
      ['case', 'CASE', 'שְׁנַיִם אוֹחֲזִין בְּטַלִּית', 'Shenayim ohazin be-tallit', 'Two people hold the same garment. Start with the human and legal conflict.'],
      ['claims', 'TWO CLAIMS', 'זֶה אוֹמֵר אֲנִי מְצָאתִיהָ וְזֶה אוֹמֵר אֲנִי מְצָאתִיהָ', 'Zeh omer ani metzatiha ve-zeh omer ani metzatiha', 'Parallel claims create the evidentiary problem; neither assertion alone settles it.'],
      ['ruling', 'MISHNAH RESPONSE', 'יַחֲלֹקוּ', 'Yachaloku', 'They divide it. Ask what facts and principles make this response fit the case.'],
      ['evidence', 'SOURCE SIGNAL', 'תָּא שְׁמַע', 'Ta shema', 'Come and hear: a source is being brought to test the current question.']
    ] },
    'bava-kamma': { title: 'Bava Kamma 2a', intro: 'Track the primary categories, their differences, their shared principle, and their Torah grounding.', modes: { 'CASE ORIENTATION': 'categories', 'CASE MAP': 'difference', 'LEGAL CATEGORY': 'shared', DISTINCTION: 'categories', 'SOURCE LAYER': 'torah', TRANSFER: 'shared', 'INDEPENDENT READ': 'categories', 'PRODUCTION CHECK': 'categories', 'RESPONSIBLE LEARNING': 'shared' }, lines: [
      ['categories', 'CATEGORIES', 'אַרְבָּעָה אָבוֹת נְזִיקִין', 'Arba’ah avot nezikin', 'Four primary categories of damage: a structured legal field is opening.'],
      ['difference', 'DIFFERENTIATION', 'לֹא הֲרֵי הַשּׁוֹר כַּהֲרֵי הַמַּבְעֶה', 'Lo harei ha-shor ka-harei ha-mav’eh', 'The Mishnah first marks what each category is not before unifying them.'],
      ['shared', 'SHARED PRINCIPLE', 'הַצַּד הַשָּׁוֶה שֶׁבָּהֶן', 'Ha-tzad ha-shaveh she-ba-hen', 'After differences, locate the feature that lets the categories share a legal consequence.'],
      ['torah', 'TORAH LAYER', 'שׁוֹר · בּוֹר · מַבְעֶה · הֶבְעֵר', 'Shor · bor · mav’eh · hev’er', 'The Mishnah organizes separate Torah cases into a shared legal structure.']
    ] }
  };
  const spec = rails[key];
  const rail = document.createElement('aside');
  rail.id = 'tractate-daf-rail';
  rail.innerHTML = `<span>FOCUS IN THE DAF</span><h2>${spec.title}</h2><p class="tractate-daf-intro">${spec.intro}</p><div class="tractate-daf-lines">${spec.lines.map(([id, label, hebrew]) => `<button type="button" data-tractate-line="${id}"><small>${label}</small><b lang="he" dir="rtl">${hebrew}</b></button>`).join('')}</div><section id="tractate-daf-detail" aria-live="polite"></section>`;
  lesson.before(rail);
  const detail = rail.querySelector('#tractate-daf-detail');
  const show = (id) => {
    const line = spec.lines.find(([lineId]) => lineId === id) || spec.lines[0];
    rail.querySelectorAll('[data-tractate-line]').forEach((button) => button.classList.toggle('active', button.dataset.tractateLine === line[0]));
    detail.innerHTML = `<small>${line[1]} · READING AID</small><p><i>${line[3]}</i></p><p>${line[4]}</p>`;
  };
  rail.querySelectorAll('[data-tractate-line]').forEach((button) => button.addEventListener('click', () => show(button.dataset.tractateLine)));
  const sync = () => show(spec.modes[document.querySelector('#mode')?.textContent.trim()] || spec.lines[0][0]);
  new MutationObserver(sync).observe(lesson, { childList: true, subtree: true, characterData: true });
  sync();

  const style = document.createElement('style');
  style.textContent = `
    #tractate-daf-rail{align-self:start;padding:18px;background:#f4f0e6;border-top:3px solid #b88028;color:#1f3036}
    #tractate-daf-rail>span,#tractate-daf-rail small{color:#276b68;font:10px 'DM Mono',monospace;letter-spacing:.08em}
    #tractate-daf-rail h2{margin:7px 0;color:#183b4e;font:600 25px Fraunces,Georgia,serif}.tractate-daf-intro{margin:0 0 14px;color:#637178;font-size:12px;line-height:1.5}
    .tractate-daf-lines{display:grid;gap:7px}.tractate-daf-lines button{padding:10px;border:1px solid #ded6c8;background:#fffdf8;color:#183b4e;text-align:left;cursor:pointer}.tractate-daf-lines button.active{border-color:#276b68;background:#e4f0e8;box-shadow:inset 3px 0 #276b68}
    .tractate-daf-lines small{display:block;margin-bottom:5px}.tractate-daf-lines b{display:block;font:500 18px/1.45 'Noto Sans Hebrew',sans-serif}#tractate-daf-detail{margin-top:14px;padding-top:12px;border-top:1px solid #d8d0c2;color:#637178;font-size:12px;line-height:1.55}#tractate-daf-detail p{margin:6px 0}#tractate-daf-detail i{color:#183b4e}
    @media(min-width:1000px){.course-layout{grid-template-columns:210px 270px minmax(0,720px)}}@media(max-width:999px){#tractate-daf-rail{grid-column:1/-1}.course-layout{grid-template-columns:220px minmax(0,1fr)}}@media(max-width:720px){#tractate-daf-rail{grid-column:auto}.course-layout{grid-template-columns:1fr}.tractate-daf-lines{grid-template-columns:repeat(2,minmax(0,1fr))}.tractate-daf-lines b{font-size:15px}}
  `;
  document.head.append(style);
})();
