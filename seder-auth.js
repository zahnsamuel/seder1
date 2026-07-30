// Public Supabase sign-in client. The anon key is safe to expose; row-level security protects learner data.
const Seder = window.Seder || {};
const authKey = 'seder-auth-session-v1';
// Pages a never-signed-in visitor may view without being bounced to sign-in. Interior pages
// still redirect a 401 into sign-in (carrying a return path) so shared deep links prompt sign-up.
const publicPages = new Set(['/', '/index.html', '/seder.html', '/sign-in.html', '/privacy.html', '/terms.html', '/support.html']);
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
// Token mode (SQLite hosted): claim a learner and keep the bearer token client-side. Reuses the
// same session shape as the Supabase path, so Seder.api and currentLearnerId work unchanged.
Seder.signUp = async (displayName) => {
  const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName }) });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'We could not start your learner account. Please try again.'); }
  const { id, token } = await response.json();
  Seder.session = { access_token: token, user: { id } };
  localStorage.setItem(authKey, JSON.stringify(Seder.session));
  return { id };
};
// Restore a token-mode account from its recovery code (the bearer token). The learner keeps this
// code because it is the ONLY way back into a token account on a new device or after clearing this
// browser — there is no email/password to fall back on.
Seder.recoverWithToken = async (code) => {
  const token = String(code || '').trim();
  if (!token) throw new Error('Enter your recovery code.');
  const response = await fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('That recovery code was not recognized. Check for extra spaces and try again.');
  const { user } = await response.json();
  Seder.session = { access_token: token, user: { id: user.id } };
  localStorage.setItem(authKey, JSON.stringify(Seder.session));
  return { id: user.id };
};
Seder.api = async (url, options = {}, retried = false) => {
  const headers = new Headers(options.headers || {});
  if (Seder.session?.access_token) headers.set('Authorization', `Bearer ${Seder.session.access_token}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && !retried && await Seder.refreshSession()) return Seder.api(url, options, true);
  const config = await Seder.config();
  const requiresAuth = config.mode === 'token' || (config.supabaseUrl && config.supabaseAnonKey);
  if (response.status === 401 && requiresAuth && !publicPages.has(location.pathname)) {
    localStorage.removeItem(authKey);
    Seder.session = null;
    const signIn = new URL('sign-in.html', location.origin);
    signIn.searchParams.set('reason', 'session-expired');
    signIn.searchParams.set('next', `${location.pathname}${location.search}${location.hash}`);
    location.replace(`${signIn.pathname}${signIn.search}`);
  }
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
  const next = new URLSearchParams(location.search).get('next');
  let safeNext = null;
  try { safeNext = next && new URL(next, location.origin); } catch (_) {}
  if (safeNext?.origin === location.origin && safeNext.pathname !== '/sign-in.html') location.replace(`${safeNext.pathname}${safeNext.search}${safeNext.hash}`);
  return true;
};
Seder.sendMagicLink = async (email, displayName, nextUrl = '') => {
  const config = await Seder.config();
  if (!config.supabaseUrl || !config.supabaseAnonKey) throw new Error('Secure sign-in has not been configured for this environment.');
  nextUrl ||= new URLSearchParams(location.search).get('next') || '';
  const returnUrl = new URL('seder.html', location.origin);
  if (nextUrl) returnUrl.searchParams.set('next', nextUrl);
  const response = await fetch(`${config.supabaseUrl}/auth/v1/otp`, { method: 'POST', headers: { apikey: config.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: true, data: { display_name: displayName || undefined }, options: { emailRedirectTo: returnUrl.href } }) });
  if (!response.ok) throw new Error('We could not send that sign-in link. Please try again.');
};
Seder.signOut = async () => {
  const session = Seder.session;
  const config = await Seder.config();
  if (session?.access_token && config.supabaseUrl && config.supabaseAnonKey) {
    await fetch(`${config.supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'local' })
    }).catch(() => {});
  }
  localStorage.removeItem(authKey);
  Seder.session = null;
  location.href = 'seder.html';
};
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
// Answer-feedback panels (#feedback / .feedback) update their text after a learner answers, but
// most content pages declare them without aria-live, so screen readers never announce the result
// (WCAG 4.1.3). Enforce a polite live region from this shared script — one fix for the whole
// corpus, including feedback nodes created dynamically (this runs on load and on every mutation).
Seder.ensureLiveFeedback = () => document.querySelectorAll('#feedback, .feedback').forEach((el) => { if (!el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite'); });
Seder.enableAdaptiveRepairLinks = () => {
  Seder.ensureLiveFeedback();
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
Seder.applyAccessibilityStyles = () => { if (document.querySelector('#seder-accessibility-styles')) return; const style=document.createElement('style'); style.id='seder-accessibility-styles'; style.textContent=':focus-visible{outline:3px solid #b88028!important;outline-offset:3px}button,input,select,textarea{font:inherit}button:disabled{cursor:not-allowed}.skip-link{position:absolute;left:8px;top:-48px;z-index:2000;background:#173b57;color:#fff;padding:10px 14px;border-radius:0 0 8px 8px;text-decoration:none;font-weight:600}.skip-link:focus{top:0}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}'; document.head.append(style); };
Seder.applyAccessibilityStyles();
// Keyboard bypass block (WCAG 2.4.1): inject a "skip to main content" link as the first
// focusable element, so keyboard/screen-reader users need not tab through the header on
// every page. Runs from this shared script, so it covers every page that loads it.
Seder.applySkipLink = () => {
  if (!document.body || document.querySelector('#seder-skip-link')) return;
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'main-content';
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  const link = document.createElement('a');
  link.id = 'seder-skip-link';
  link.className = 'skip-link';
  link.href = `#${main.id}`;
  link.textContent = 'Skip to main content';
  document.body.prepend(link);
};
if (document.body) Seder.applySkipLink(); else document.addEventListener('DOMContentLoaded', Seder.applySkipLink);
// PWA: manifest + theme color + service worker, injected here so all learner-path pages
// become installable without editing every HTML file. sw.js never caches /api/ responses.
Seder.enablePwa = () => {
  if (!document.querySelector('link[rel="manifest"]')) { const link = document.createElement('link'); link.rel = 'manifest'; link.href = 'manifest.webmanifest'; document.head.append(link); }
  if (!document.querySelector('meta[name="theme-color"]')) { const meta = document.createElement('meta'); meta.name = 'theme-color'; meta.content = '#173b57'; document.head.append(meta); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
};
Seder.enablePwa();
// Installed-app badge: show the due-review count on the home-screen icon (supported
// platforms only). Throttled via sessionStorage so ordinary page loads skip the extra call.
Seder.updateAppBadge = async () => {
  if (!('setAppBadge' in navigator)) return;
  const last = Number(sessionStorage.getItem('seder-badge-at') || 0);
  if (Date.now() - last < 600000) return;
  sessionStorage.setItem('seder-badge-at', String(Date.now()));
  try {
    const response = await Seder.api(`/api/learners/${Seder.currentLearnerId()}/pilot-analytics`);
    if (!response.ok) return;
    const { reviewDue } = await response.json();
    if (reviewDue > 0) navigator.setAppBadge(reviewDue); else navigator.clearAppBadge();
  } catch { /* badge is best-effort */ }
};
setTimeout(Seder.updateAppBadge, 0);
if (location.pathname.endsWith('/civil-reasoning.html') && !document.querySelector('script[data-civil-reasoning-year-gate]')) {
  const script = document.createElement('script');
  script.src = 'civil-reasoning-year-gate.js';
  script.dataset.civilReasoningYearGate = 'true';
  document.head.append(script);
}

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
if (/\/(pesachim|eruvin|sukkah|bava-metzia|bava-kamma)-arc\.html$/.test(location.pathname) && !document.querySelector('script[data-tractate-daf-rails]')) {
  const script = document.createElement('script');
  script.src = 'tractate-daf-rails.js';
  script.dataset.tractateDafRails = 'true';
  document.head.append(script);
}
if (/\/(pesachim|eruvin|sukkah|bava-metzia|bava-kamma)-deepening\.html$/.test(location.pathname) && !document.querySelector('script[data-second-source-production]')) {
  const script = document.createElement('script');
  script.src = 'second-source-production.js';
  script.dataset.secondSourceProduction = 'true';
  document.head.append(script);
}
