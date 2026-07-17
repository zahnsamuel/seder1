// The local app remains usable for development. A configured hosted app, however,
// must make its account boundary visible before an unsigned visitor reaches learner APIs.
Seder.config().then((config) => {
  const account = document.querySelector('#accountAction');
  if (!account) return;
  if (Seder.session?.access_token) { account.textContent = 'My account'; account.href = 'profile.html'; return; }
  if (!config.supabaseUrl || !config.supabaseAnonKey) return;
  const action = document.querySelector('#nextAction');
  action.href = 'sign-in.html';
  action.textContent = 'Sign in to begin';
  document.querySelector('#todayTitle').textContent = 'Your private learning path awaits';
  document.querySelector('#todayCopy').textContent = 'Secure sign-in keeps mastery evidence, XP, and review work private to your account.';
});
