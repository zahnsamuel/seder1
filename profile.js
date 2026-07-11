const activeKey = 'seder-active-learner';
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
  if (!confirm(`Delete "${name}" and all of this profile's learning data? This cannot be undone.`)) return;
  $('#account-status').textContent = 'Deleting…';
  const response = await Seder.api(`/api/learners/${currentId}`, { method: 'DELETE' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { $('#account-status').textContent = data.error || 'Could not delete this profile right now.'; return; }
  $('#account-status').textContent = data.note || 'Profile deleted.';
  if (Seder.session?.access_token) { Seder.signOut(); return; }
  localStorage.removeItem(activeKey);
  load();
});
function renderProfiles() { const active = localStorage.getItem(activeKey) || 'demo'; $('#profiles').innerHTML = profiles.map((profile) => `<button type="button" data-id="${profile.id}"><span>${profile.profile?.displayName || profile.id}</span><small>${profile.xp || 0} XP</small></button>`).join(''); $('#profiles').querySelectorAll('button').forEach((button) => button.addEventListener('click', () => selectProfile(button.dataset.id))); selectProfile(profiles.some((profile) => profile.id === active) ? active : profiles[0]?.id); }
async function load() { const data = await Seder.api('/api/profiles').then((response) => response.json()); profiles = data.profiles; if (!Seder.session?.access_token && !profiles.some((profile) => profile.id === 'demo')) profiles.unshift({ id: 'demo', profile: { displayName: 'Demo learner' }, xp: 0 }); renderProfiles(); }
$('#new-profile').addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; const displayName = new FormData(form).get('displayName'); $('#status').textContent = 'Creating profile…'; const response = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName }) }); const data = await response.json(); if (!response.ok) { $('#status').textContent = data.error; return; } profiles.push(data.learner); form.reset(); $('#status').textContent = 'Profile created.'; renderProfiles(); selectProfile(data.learner.id); });
load();
