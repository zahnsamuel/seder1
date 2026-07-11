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
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
