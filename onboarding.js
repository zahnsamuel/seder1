(() => {
  const key = 'seder-onboarding-seen-v1';
  // The welcome is shown by the front door only for a brand-new learner (no evidence yet) — a
  // returning learner gets a clean page and one clear next step, not the intro. Exposing a function
  // (instead of auto-injecting) lets seder.js decide after it knows the learner, with no flash.
  window.showOnboardingIfNew = (hasProgress) => {
    if (hasProgress || localStorage.getItem(key) || document.querySelector('.onboarding')) return;
    const panel = document.createElement('section');
    panel.className = 'onboarding';
    panel.innerHTML = `<p>WELCOME</p><h2>Here’s how this works.</h2><ol><li><b>1. Pick a name.</b> No email, no password — just something to save your progress.</li><li><b>2. Answer a few questions.</b> We’ll start you in the right place, not too hard and not too easy.</li><li><b>3. Do one short lesson.</b> See it on the page, then answer. That’s the whole first visit.</li></ol><div><a href="diagnostic.html">Find where to start →</a><button type="button">Got it</button></div>`;
    const hero = document.querySelector('.hero');
    if (hero) hero.after(panel);
    panel.querySelector('button').onclick = () => { localStorage.setItem(key, 'true'); panel.remove(); };
  };
})();
