// Production boundary for Seder's Supabase migration.
// This module intentionally has no browser imports and never exposes service credentials.

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return { configured: Boolean(url && anonKey), url, anonKey };
}

export async function verifySupabaseAccessToken(accessToken) {
  const { configured, url, anonKey } = supabaseConfig();
  if (!configured) throw new Error('Supabase is not configured.');
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Invalid or expired sign-in session.');
  return response.json();
}

export async function supabaseRest(path, { accessToken, method = 'GET', body } = {}) {
  const { configured, url, anonKey } = supabaseConfig();
  if (!configured) throw new Error('Supabase is not configured.');
  // An `on_conflict=` POST is an upsert; PostgREST only merges (rather than 409-ing on the
  // existing row) when Prefer includes resolution=merge-duplicates. The learner_state row is
  // pre-created by the handle_new_user() signup trigger, so the very first hosted write already
  // conflicts on the primary key — without this, every hosted event would fail with a 409.
  const prefer = path.includes('on_conflict=') ? 'return=representation,resolution=merge-duplicates' : 'return=representation';
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: prefer },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
