const activeKey = 'seder-active-learner';
const requestedNext = new URLSearchParams(location.search).get('next');
let profiles = [];
let currentId = null;
const $ = (selector) => document.querySelector(selector);
const readable = (value) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
async function selectProfile(id) {
  currentId = id;
  localStorage.setItem(activeKey, id);
  const learner = await Seder.api(`/api/learners/${id}`).then((response) => response.json());
  $('#name').textContent = `${learner.profile?.displayName || 'Learner'}’s learning path`;
  $('#profiles').querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.id === id));
  $('#competencies').innerHTML = Object.entries(learner.competencies || {}).map(([name, score]) => `<div class="competency"><span>${readable(name)}</span><div class="meter"><i style="width:${Math.round(score * 100)}%"></i></div><strong>${Math.round(score * 100)}%</strong></div>`).join('') || '<p>Complete a placement to begin building mastery evidence.</p>';
  const begin = $('#begin');
  const needsPlacement = !learner.placement;
  begin.href = needsPlacement ? 'diagnostic.html' : 'daily-router.html';
  begin.textContent = needsPlacement ? 'Find my starting point →' : 'Continue today’s learning →';
}
$('#export-data').addEventListener('click', async () => {
  if (!currentId) return;
  $('#account-status').textContent = 'Preparing export…';
  const response = await Seder.api(`/api/learners/${currentId}/export`);
  if (!response.ok) { $('#account-status').textContent = 'Could not export this profile right now.'; return; }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `seder-learner-${currentId}.json`;
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(url);
  $('#account-status').textContent = 'Export downloaded.';
});
$('#delete-profile').addEventListener('click', async () => {
  if (!currentId) return;
  const name = profiles.find((profile) => profile.id === currentId)?.profile?.displayName || currentId;
  const hostedDelete = Boolean(Seder.session?.access_token);
  const confirmation = hostedDelete
    ? `Delete "${name}" and all of this profile's learning data? This cannot be undone. Your secure sign-in identity and email address will remain.`
    : `Delete "${name}" and all of this profile's learning data? This cannot be undone.`;
  if (!confirm(confirmation)) return;
  $('#account-status').textContent = 'Deleting…';
  const response = await Seder.api(`/api/learners/${currentId}`, { method: 'DELETE' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { $('#account-status').textContent = data.error || 'Could not delete this profile right now.'; return; }
  $('#account-status').textContent = data.note || 'Profile deleted.';
  if (hostedDelete) { alert('Your learning data has been deleted. Your secure sign-in identity remains; you will now be signed out.'); Seder.signOut(); return; }
  localStorage.removeItem(activeKey);
  load();
});
$('#sign-out').addEventListener('click', () => Seder.signOut());
if (Seder.session?.access_token) {
  $('#sign-out').hidden = false;
  $('#new-profile').hidden = true;
  $('#delete-explainer').hidden = false;
  $('#profile-note').textContent = 'You are signed in to a secure learner account. Your mastery evidence, XP, and review rhythm are private to this account.';
}
// Token mode only: surface the learner's recovery code (their bearer token) so they can restore
// access elsewhere. Hidden in Supabase mode, where the access token is short-lived and refreshed.
Seder.config().then((config) => {
  if (config.mode !== 'token' || !Seder.session?.access_token) return;
  const code = $('#recovery-code'); const section = $('#recovery'); const copy = $('#copy-recovery');
  if (code) code.textContent = Seder.session.access_token;
  if (section) section.hidden = false;
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(Seder.session.access_token); copy.textContent = 'Copied ✓'; setTimeout(() => { copy.textContent = 'Copy recovery code'; }, 1500); }
    catch { copy.textContent = 'Copy failed — select the code above and copy it'; }
  });
}).catch(() => {});
function renderProfiles() { const active = localStorage.getItem(activeKey) || 'demo'; $('#profiles').innerHTML = profiles.map((profile) => `<button type="button" data-id="${profile.id}"><span>${profile.profile?.displayName || profile.id}</span><small>${profile.xp || 0} XP</small></button>`).join(''); $('#profiles').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => selectProfile(button.dataset.id))); selectProfile(profiles.some((profile) => profile.id === active) ? active : profiles[0]?.id); }
async function load() { const data = await Seder.api('/api/profiles').then((response) => response.json()); profiles = data.profiles; if (!Seder.session?.access_token && !profiles.some((profile) => profile.id === 'demo')) profiles.unshift({ id: 'demo', profile: { displayName: 'Demo learner' }, xp: 0 }); renderProfiles(); }
$('#new-profile').addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; const displayName = new FormData(form).get('displayName'); $('#status').textContent = 'Creating profile…'; const response = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName }) }); const data = await response.json(); if (!response.ok) { $('#status').textContent = data.error; return; } profiles.push(data.learner); form.reset(); renderProfiles(); await selectProfile(data.learner.id); if (requestedNext === 'placement') { $('#status').textContent = 'Profile ready. Opening your starting-point check…'; location.href = 'diagnostic.html'; return; } $('#status').textContent = 'Profile created.'; });
if (requestedNext === 'placement') { $('#create-profile').textContent = 'Create profile and find my starting point'; }
load();
