// Public Supabase sign-in client. The anon key is safe to expose; row-level security protects learner data.
const Seder = window.Seder || {};
const authKey = 'seder-auth-session-v1';
Seder.session = JSON.parse(localStorage.getItem(authKey) || 'null');
Seder.config = async () => {
  if (Seder._config) return Seder._config;
  Seder._config = await fetch('/api/public-config').then((response) => response.ok ? response.json() : {}).catch(() => ({}));
  return Seder._config;
};
Seder.refreshSession = async () => {
  const config = await Seder.config();
  if (!Seder.session?.refresh_token || !config.supabaseUrl || !config.supabaseAnonKey) return false;
  const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: config.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: Seder.session.refresh_token }) });
  if (!response.ok) return false;
  const next = await response.json();
  Seder.session = { access_token: next.access_token, refresh_token: next.refresh_token, user: next.user };
  localStorage.setItem(authKey, JSON.stringify(Seder.session));
  return true;
};
Seder.api = async (url, options = {}, retried = false) => {
  const headers = new Headers(options.headers || {});
  if (Seder.session?.access_token) headers.set('Authorization', `Bearer ${Seder.session.access_token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && !retried && await Seder.refreshSession()) return Seder.api(url, options, true);
  return response;
};
Seder.currentLearnerId = () => Seder.session?.user?.id || localStorage.getItem('seder-active-learner') || 'demo';
Seder.saveJourneyArtifact = (artifactType, artifactId) => Seder.api(`/api/learners/${Seder.currentLearnerId()}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType, artifactId }) }).catch(() => {});
Seder.enableJourneyAutosave = () => {
  if (Seder._journeyAutosaveEnabled) return;
  Seder._journeyAutosaveEnabled = true;
  const originalSetItem = Storage.prototype.setItem;
  const escape = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Storage.prototype.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    const learnerId = Seder.currentLearnerId(), suffix = new RegExp(`-${escape(learnerId)}$`), course = String(key).match(new RegExp(`^seder-course-(.+)-${escape(learnerId)}$`));
    if (course) { try { JSON.parse(value).forEach((move) => Seder.saveJourneyArtifact('course_move', `${course[1]}:${move}`)); } catch (_) {} }
    else if (suffix.test(key) && String(key).startsWith('seder-capstone-') && value === 'complete') Seder.saveJourneyArtifact('capstone', String(key).replace('seder-capstone-', '').replace(suffix, ''));
    else if (suffix.test(key) && String(key).startsWith('seder-bridge-') && value === 'complete') Seder.saveJourneyArtifact('bridge', String(key).replace('seder-bridge-', '').replace(suffix, ''));
    else if (String(key) === `seder-independent-reading-${learnerId}`) { try { JSON.parse(value).forEach((id) => Seder.saveJourneyArtifact('independent_encounter', id)); } catch (_) {} }
  };
};
Seder.finishMagicLink = () => {
  const fragment = new URLSearchParams(location.hash.slice(1));
  const accessToken = fragment.get('access_token');
  if (!accessToken) return false;
  let userId = fragment.get('user_id');
  try { userId ||= JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub; } catch (_) {}
  const session = { access_token: accessToken, refresh_token: fragment.get('refresh_token'), user: { id: userId } };
  localStorage.setItem(authKey, JSON.stringify(session)); Seder.session = session;
  history.replaceState({}, '', `${location.pathname}${location.search}`);
  return true;
};
Seder.sendMagicLink = async (email, displayName) => {
  const config = await Seder.config();
  if (!config.supabaseUrl || !config.supabaseAnonKey) throw new Error('Secure sign-in has not been configured for this environment.');
  const response = await fetch(`${config.supabaseUrl}/auth/v1/otp`, { method: 'POST', headers: { apikey: config.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: true, data: { display_name: displayName || undefined }, options: { emailRedirectTo: `${location.origin}/seder.html` } }) });
  if (!response.ok) throw new Error('We could not send that sign-in link. Please try again.');
};
Seder.signOut = () => { localStorage.removeItem(authKey); Seder.session = null; location.href = 'seder.html'; };
window.Seder = Seder;
Seder.finishMagicLink();
Seder.enableJourneyAutosave();
Seder.enhanceDafWorkbench = () => {
  const lines = document.querySelector('#lines'), feedback = document.querySelector('#feedback');
  if (!lines || !feedback || document.querySelector('#daf-private-note')) return;
  const panel = document.createElement('section');
  panel.id = 'daf-private-note';
  panel.innerHTML = '<label for="daf-note">Private note on this line</label><textarea id="daf-note" rows="3" placeholder="What does this line do? What remains unclear?"></textarea><button type="button" id="save-daf-note">Save note</button><p id="daf-note-status" aria-live="polite"></p>';
  feedback.after(panel);
  let context = '';
  lines.addEventListener('click', () => setTimeout(() => { context = document.querySelector('#lineTitle')?.textContent || ''; document.querySelector('#daf-note').placeholder = `Private note on ${context}`; }, 0));
  panel.querySelector('#save-daf-note').addEventListener('click', () => { const note = panel.querySelector('#daf-note').value.trim(); if (!note || !context) return; Seder.api(`/api/learners/${Seder.currentLearnerId()}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'note_saved', sourceContext: context, note }) }).then(() => { panel.querySelector('#daf-note-status').textContent = 'Saved to your private learning record.'; }).catch(() => { panel.querySelector('#daf-note-status').textContent = 'Saved locally in this session.'; }); });
};
setTimeout(Seder.enhanceDafWorkbench, 0);
Seder.enableAdaptiveRepairLinks = () => {
  document.querySelectorAll('#feedback').forEach((feedback) => {
    if (feedback.dataset.sederRepair || !/not yet|almost/i.test(feedback.textContent)) return;
    feedback.dataset.sederRepair = 'true';
    const link = document.createElement('a');
    link.href = 'mastery-loop.html';
    link.textContent = 'See the targeted repair path →';
    link.className = 'seder-repair-link';
    feedback.append(document.createElement('br'), link);
  });
};
new MutationObserver(Seder.enableAdaptiveRepairLinks).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
setTimeout(Seder.enableAdaptiveRepairLinks, 0);
if (!document.querySelector('script[data-seder-milestones]')) { const script=document.createElement('script'); script.src='milestones.js'; script.dataset.sederMilestones='true'; document.head.append(script); }
Seder.applyMobileStudyStyles = () => { if (document.querySelector('#seder-mobile-study-styles')) return; const style=document.createElement('style'); style.id='seder-mobile-study-styles'; style.textContent='@media(max-width:760px){header{flex-wrap:wrap;gap:12px;padding:15px 16px}main{padding-left:14px!important;padding-right:14px!important}.daf-line{min-height:58px}.daf-line span,.line-hebrew{line-height:1.85!important}.analysis select,.analysis>button,.continue,.save-note{min-height:44px;font-size:16px}.line-actions button,.line-actions a{padding:8px 0;font-size:13px}.tractates{overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px}.tractates button{white-space:nowrap}.days{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px}.day{min-height:138px!important;padding:13px!important}.day a{display:inline-block;padding:8px 0;font-size:13px}.reader{padding:18px 14px!important}.reader textarea{font-size:16px}.dashboard-summary,.course-grid{grid-template-columns:1fr!important}}'; document.head.append(style); };
Seder.applyMobileStudyStyles();
Seder.applyAccessibilityStyles = () => { if (document.querySelector('#seder-accessibility-styles')) return; const style=document.createElement('style'); style.id='seder-accessibility-styles'; style.textContent=':focus-visible{outline:3px solid #b88028!important;outline-offset:3px}button,input,select,textarea{font:inherit}button:disabled{cursor:not-allowed}'; document.head.append(style); };
Seder.applyAccessibilityStyles();

Seder.enableDeepLanguageSupport = () => {
  const hebrew = document.querySelector('#hebrew'), card = hebrew?.closest('.source-card');
  if (!hebrew || !card || !hebrew.textContent.trim()) return;
  const supportKey = `${document.querySelector('#mode')?.textContent?.trim() || ''}:${hebrew.textContent.trim()}`;
  if (card.dataset.deepLanguageKey === supportKey && card.querySelector('.deep-language-support')) return;
  card.dataset.deepLanguageKey = supportKey;
  if (!document.querySelector('link[data-deep-language-support]')) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'deep-language-support.css'; link.dataset.deepLanguageSupport = 'true'; document.head.append(link); }
  const normalize = (text) => String(text || '').normalize('NFD').replace(/[\u0591-\u05C7.,:;!?״׳"'·]/g, '').replace(/\s+/g, ' ').trim().normalize('NFC');
  const terms = {
    'מאי':['what?','mai','A question signal: expect the Gemara to examine a word or claim.'], 'אור':['light / evening','or','A compact word whose meaning must be read in context.'], 'אמר':['said','amar','An attribution cue: a named voice is entering the discussion.'], 'רבי':['Rabbi','rabbi','An attribution cue: note whose position is being presented.'],
    'מבוי':['alleyway','mavoi','Name the physical object before interpreting the measure.'], 'אמה':['cubit','amah','A measure; ask what object it qualifies and why it matters.'], 'ימעט':['one must reduce it','yema’et','A response to the case, not yet its explanation.'], 'סוכה':['sukkah / booth','sukkah','Keep the physical structure in view while following the argument.'], 'פסולה':['invalid','pesulah','A legal status in the source; study its reasoning rather than applying it personally.'],
    'דאורייתא':['Torah law','de’oraita','A source-category distinction used to explain a formulation.'], 'דרבנן':['rabbinic law','derabbanan','A source-category distinction used to explain a formulation.'], 'שנים':['two','shnayim','Start by identifying the parties in the case.'], 'אוחזין':['are holding','ohazin','A fact about present possession, not proof by itself.'], 'טלית':['garment','talit','The object around which the competing claims are organized.'], 'אני':['I','ani','Attach this claim to the speaker who makes it.'], 'מצאתי':['I found it','metzatih','A claim that should remain distinct from another claimant’s evidence.'],
    'ארבעה':['four','arba’ah','A numbered opening often introduces a classification to be unpacked.'], 'אבות':['primary categories','avot','Root categories; do not assume their differences disappear.'], 'נזיקין':['damages','nezikin','The legal field being classified.'], 'השור':['the ox','hashor','One category in the source’s list.'], 'הבור':['the pit','habor','One category in the source’s list.'], 'הצד':['the side / aspect','hatzad','Look for the shared feature the source is about to identify.'], 'השוה':['common / equal','hashaveh','A common denominator can connect categories without erasing difference.']
  };
  const role = { ORIENT:'First locate the case, object, people, or category before asking for an explanation.', 'CLAIM MAP':'Keep each voice or position distinct; do not resolve the disagreement before the source does.', QUESTION:'Name exactly what wording, case, or contrast the Gemara is asking about.', EVIDENCE:'Ask what the cited source appears to prove, and what pressure it places on the current claim.', RESPONSE:'Read the answer closely enough to see which word, grammar, or distinction changes the argument.', REASON:'Connect the stated reason to the formulation or case it is meant to explain.', SYNTHESIS:'State the move you can carry into a fresh source, not merely the answer to this screen.' };
  card.querySelector('.deep-language-support')?.remove();
  const words = [...new Set(normalize(hebrew.textContent).split(' ').filter((word) => terms[word]))];
  const panel = document.createElement('aside'); panel.className = 'deep-language-support';
  panel.innerHTML = `<h3>READING SUPPORT</h3><p><strong>This line’s job:</strong> ${role[document.querySelector('#mode')?.textContent?.trim()] || 'Read the line’s job before translating every word.'}</p><p><strong>English stays beside this exact excerpt.</strong> Use it to check your first reading, not to skip the Hebrew/Aramaic.</p>`;
  if (words.length) {
    const actions = document.createElement('div'); actions.className = 'deep-language-actions';
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.textContent = 'Show focus-word transliteration';
    const transliteration = document.createElement('p'); transliteration.className = 'deep-language-detail'; transliteration.hidden = true; transliteration.textContent = words.map((word) => `${word} — ${terms[word][1]}`).join(' · ');
    toggle.onclick = () => { transliteration.hidden = !transliteration.hidden; toggle.textContent = transliteration.hidden ? 'Show focus-word transliteration' : 'Hide focus-word transliteration'; }; actions.append(toggle); panel.append(actions, transliteration);
    const glosses = document.createElement('div'); glosses.className = 'deep-glosses'; const detail = document.createElement('p'); detail.className = 'deep-language-detail'; detail.hidden = true;
    words.forEach((word) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'deep-gloss'; button.textContent = word; button.onclick = () => { detail.hidden = false; detail.textContent = `${word} (${terms[word][1]}) — ${terms[word][0]}. ${terms[word][2]}`; }; glosses.append(button); }); panel.append(glosses, detail);
  } else panel.insertAdjacentHTML('beforeend', '<p class="deep-language-detail">No focus word is selected for this line. Read for the speaker, action, connector, or question signal before checking the English.</p>');
  hebrew.after(panel);
};
new MutationObserver(Seder.enableDeepLanguageSupport).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
setTimeout(Seder.enableDeepLanguageSupport, 0);
if (location.pathname.endsWith('/berakhot-deep.html') && !document.querySelector('script[data-berakhot-daf-rail]')) {
  const script = document.createElement('script');
  script.src = 'berakhot-daf-rail.js';
  script.dataset.berakhotDafRail = 'true';
  document.head.append(script);
}
