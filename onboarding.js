(() => {
  const key = 'seder-onboarding-seen-v1';
  if (localStorage.getItem(key)) return;
  const panel = document.createElement('section');
  panel.className = 'onboarding';
  panel.innerHTML = `<p>WELCOME TO THE ACADEMY</p><h2>One Jewish literacy, built one source move at a time.</h2><ol><li><b>1. Study today’s next step.</b> Jewish Learning Academy chooses a source skill that is ready to grow.</li><li><b>2. See why it is next.</b> You will see prerequisites, evidence, and a transfer goal.</li><li><b>3. Return until it transfers.</b> Skills reappear in new sources until you can read independently.</li></ol><div><a href="daily-router.html">Start today’s study →</a><button type="button">Got it</button></div>`;
  const hero = document.querySelector('.hero');
  hero.after(panel);
  panel.querySelector('button').onclick = () => { localStorage.setItem(key, 'true'); panel.remove(); };
})();
