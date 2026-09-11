(() => {
  const key = 'seder-onboarding-seen-v1';
  // The welcome is shown by the front door only for a brand-new learner (no evidence yet) — a
  // returning learner gets a clean page and one clear next step, not the intro. Exposing a function
  // (instead of auto-injecting) lets seder.js decide after it knows the learner, with no flash.
  window.showOnboardingIfNew = (hasProgress) => {
    if (hasProgress || localStorage.getItem(key) || document.querySelector('.onboarding')) return;
    const panel = document.createElement('section');
    panel.className = 'onboarding';
    panel.innerHTML = `<p>WELCOME</p><h2>Learn to read Jewish sources yourself.</h2><p class="onboarding-purpose">Short daily practice that builds real skill — you prove you can make the reading move, not collect points. Today is one sitting: a name, a few checks, one lesson.</p><ol><li><b>Pick a name.</b> No email, no password — just something to save your progress.</li><li><b>Answer a few questions.</b> At most six short checks — not a quiz. We’ll start you in the right place.</li><li><b>Do one short lesson.</b> See it on the page, then answer. That’s the whole first visit.</li></ol><div><a href="sign-in.html?next=diagnostic.html">Start learning →</a><button type="button">Got it</button></div>`;
    const hero = document.querySelector('.hero');
    if (hero) hero.after(panel);
    const start = document.querySelector('#nextAction');
    const link = panel.querySelector('a');
    if (start && link) {
      const href = start.getAttribute('href');
      if (href) link.setAttribute('href', href);
    }
    panel.querySelector('button').onclick = () => { localStorage.setItem(key, 'true'); panel.remove(); };
  };
})();
