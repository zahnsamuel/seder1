// The local app remains usable for development. A configured hosted app, however,
// must make its account boundary visible before an unsigned visitor reaches learner APIs.
Seder.config().then((config) => {
  const account = document.querySelector('#accountAction');
  if (!account) return;
  if (Seder.session?.access_token) { account.textContent = 'My account'; account.href = 'profile.html'; return; }
  if (!config.supabaseUrl || !config.supabaseAnonKey) return;
  const action = document.querySelector('#nextAction');
  action.href = 'sign-in.html?next=diagnostic.html';
  action.textContent = 'Sign in to begin';
  document.querySelector('#todayTitle').textContent = 'Start where you are';
  document.querySelector('#todayCopy').textContent = 'A few questions, then one short lesson. Sign-in keeps your progress on your account.';
});
