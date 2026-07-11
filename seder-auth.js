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
