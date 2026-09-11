const learnerId = Seder.currentLearnerId();
const set = (sel, fn) => { const el = document.querySelector(sel); if (el) fn(el); };
// A first-time visitor in a hosted (sign-in-required) mode has no session yet. Show the landing
// as-is and point the primary CTA into sign-up rather than calling the learner API — which would
// 401 — so the pitch is never skipped by a bounce to the sign-in form.
Seder.config().then((config) => {
  const needsAuth = config.mode === 'token' || (config.supabaseUrl && config.supabaseAnonKey);
  if (needsAuth && !Seder.session?.access_token) {
    set('#nextAction', (el) => { const signIn = new URL('sign-in.html', location.origin); signIn.searchParams.set('next', 'diagnostic.html'); el.href = `${signIn.pathname}${signIn.search}`; el.textContent = 'Start learning →'; });
    window.showOnboardingIfNew?.(false); // a first-time visitor: show the welcome
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
  const hasProgress=(learner.capabilityEvidence||[]).length>0||(learner.dailyStreak||0)>0;
  set('#xp',el=>el.textContent=onOwn?`${onOwn} on your own`:'');
  // Keep the first-run "what you learn" story until there is real evidence. An empty
  // capabilities scoreboard is how cold visitors get confused about what this is.
  if (hasProgress) {
    set('#levelLabel',el=>el.textContent='YOUR CAPABILITIES');
    set('#levelCopy',el=>el.textContent=Seder.capabilitySentence(counts));
    set('#learnMoves',el=>{el.hidden=true;});
    set('#capChips',el=>{
      el.hidden=false;
      const order=['emerging','secure','transferable','durable'];
      const chips=order.filter(s=>counts[s]>0).map(s=>`<span class="jla-chip is-${s}"><b>${counts[s]}</b> ${Seder.capabilityStates[s].label}</span>`).join('');
      el.innerHTML=chips||'<span class="jla-chip is-none">No capabilities demonstrated yet — start below.</span>';
    });
    const streak=learner.dailyStreak||0;
    set('#todayStats',el=>{el.hidden=false;});
    set('#streak',el=>el.textContent=streak>0?String(streak):'Day 1');
    set('#streakLabel',el=>el.textContent=streak>0?'DAY RHYTHM':'STARTS TODAY');
    set('#sources',el=>el.textContent=onOwn>0?String(onOwn):'In reach');
    set('#sourcesLabel',el=>el.textContent=onOwn>0?(onOwn===1?'CAPABILITY':'CAPABILITIES'):'FIRST CAPABILITY');
  }
  set('#todayTitle',el=>el.textContent=placement?decision.recommendation.title:'Today in Jewish Learning Academy');
  // Grounded "why this, now" from the server (recommendation.why), shared across surfaces.
  set('#todayCopy',el=>el.textContent=decision.recommendation.why?.sentence||(placement?decision.recommendation.reason:'One clear next step: repair what is fragile, then build the next source move.'));
  set('#nextAction',el=>{el.href=placement?decision.recommendation.url:'daily-router.html';el.textContent=placement?'Find my starting point →':'See today’s lesson →';});
  // Welcome intro is for brand-new learners only. A returning learner with real evidence gets a
  // clean front door and one next step — no intro, no second CTA competing with today's step.
  window.showOnboardingIfNew?.(hasProgress);
}).catch(()=>{});
}
