const learnerId = Seder.currentLearnerId();
const set = (sel, fn) => { const el = document.querySelector(sel); if (el) fn(el); };
function level(xp) { const n = Math.floor((xp || 0) / 100) + 1; return { n, name: ['Text Explorer', 'Source Reader', 'Canon Navigator', 'Argument Mapper', 'Independent Learner'][Math.min(n - 1, 4)], progress: (xp || 0) % 100 }; }
// A first-time visitor in a hosted (sign-in-required) mode has no session yet. Show the landing
// as-is (default level/XP) and point the primary CTA into sign-up rather than calling the learner
// API — which would 401 — so the pitch is never skipped by a bounce to the sign-in form.
Seder.config().then((config) => {
  const needsAuth = config.mode === 'token' || (config.supabaseUrl && config.supabaseAnonKey);
  if (needsAuth && !Seder.session?.access_token) {
    set('#nextAction', (el) => { const signIn = new URL('sign-in.html', location.origin); signIn.searchParams.set('next', 'placement.html'); el.href = `${signIn.pathname}${signIn.search}`; el.textContent = 'Start learning →'; });
    return;
  }
  loadPersonalized();
});
function loadPersonalized() {
Promise.all([
  Seder.api(`/api/learners/${learnerId}`).then(r=>r.ok?r.json():Promise.reject()),
  Seder.api(`/api/learners/${learnerId}/recommendation`).then(r=>r.ok?r.json():Promise.reject())
]).then(([learner,decision])=>{
  const xp=learner.xp||0,lvl=level(xp),placement=decision.recommendation.kind==='placement';
  set('#xp',el=>el.textContent=`${xp} XP`);
  set('#levelLabel',el=>el.textContent=`LEVEL ${lvl.n} · ${lvl.name.toUpperCase()}`);
  set('#levelCopy',el=>el.textContent=lvl.progress?`${100-lvl.progress} XP to your next learning level.`:'A new learning level is ready to begin.');
  set('#levelXp',el=>el.textContent=`${lvl.progress} / 100 XP`);
  set('#levelBar',el=>el.style.width=`${lvl.progress}%`);
  set('#streak',el=>el.textContent=learner.dailyStreak||0);
  set('#sources',el=>el.textContent=Object.keys(learner.mastery||{}).length);
  set('#todayTitle',el=>el.textContent=placement?decision.recommendation.title:'Today in Jewish Learning Academy');
  set('#todayCopy',el=>el.textContent=placement?decision.recommendation.reason:'One clear next step: repair what is fragile, then build the next source move.');
  set('#nextAction',el=>{el.href=placement?decision.recommendation.url:'daily-router.html';el.textContent=placement?'Find my starting point →':'See today’s next step →';});
}).catch(()=>{});
}
