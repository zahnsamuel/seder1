const learnerId = Seder.currentLearnerId();
const set = (sel, fn) => { const el = document.querySelector(sel); if (el) fn(el); };
// A first-time visitor in a hosted (sign-in-required) mode has no session yet. Show the landing
// as-is and point the primary CTA into sign-up rather than calling the learner API — which would
// 401 — so the pitch is never skipped by a bounce to the sign-in form.
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
  const placement=decision.recommendation.kind==='placement';
  // Capability states, not XP/levels/mastery %: what the learner can now do, in plain words.
  const counts=Seder.summarizeCapabilities(learner.capabilityEvidence);
  const onOwn=counts.secure+counts.transferable+counts.durable;
  set('#levelLabel',el=>el.textContent='YOUR CAPABILITIES');
  set('#levelCopy',el=>el.textContent=Seder.capabilitySentence(counts));
  set('#xp',el=>el.textContent=onOwn?`${onOwn} on your own`:'');
  set('#streak',el=>el.textContent=learner.dailyStreak||0);
  set('#sources',el=>el.textContent=(learner.capabilityEvidence||[]).length);
  set('#capChips',el=>{
    const order=['emerging','secure','transferable','durable'];
    const chips=order.filter(s=>counts[s]>0).map(s=>`<span class="cap-chip cap-${s}"><b>${counts[s]}</b> ${Seder.capabilityStates[s].label}</span>`).join('');
    el.innerHTML=chips||'<span class="cap-chip cap-none">No capabilities demonstrated yet — start below.</span>';
  });
  set('#todayTitle',el=>el.textContent=placement?decision.recommendation.title:'Today in Jewish Learning Academy');
  set('#todayCopy',el=>el.textContent=placement?decision.recommendation.reason:'One clear next step: repair what is fragile, then build the next source move.');
  set('#nextAction',el=>{el.href=placement?decision.recommendation.url:'daily-router.html';el.textContent=placement?'Find my starting point →':'See today’s next step →';});
}).catch(()=>{});
}
