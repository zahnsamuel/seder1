const $ = (s) => document.querySelector(s);
const TOKEN_KEY = 'seder-admin-token';

function render(data) {
  $('#adminGate').hidden = true;
  if (!data.available) {
    $('#unavailable').hidden = false;
    $('#unavailableReason').textContent = data.reason || 'Analytics is not available in this mode.';
    return;
  }
  $('#unavailable').hidden = true;
  $('#summary').innerHTML = [
    ['Learners', data.totalLearners],
    ['Total XP', data.totalXp],
    ['Total attempts', data.totalAttempts],
    ['Overall accuracy', data.overallAccuracy == null ? '—' : `${data.overallAccuracy}%`],
    ['Overdue reviews', data.overdueReviews]
  ].map(([label, value]) => `<article><small>${label}</small><strong>${value}</strong></article>`).join('');
  $('#tractateTable tbody').innerHTML = data.tractateStats.map((t) => {
    const dropOffClass = t.dropOff > 0 ? ' class="drop-off"' : '';
    const completed = t.completedLearners === null ? '—' : t.completedLearners;
    const dropOff = t.dropOff === null ? '—' : t.dropOff;
    return `<tr${dropOffClass}><td>${t.title}${t.hasArc ? '' : ' <small>(lab only — no completion signal)</small>'}</td><td>${t.engagedLearners}</td><td>${completed}</td><td>${dropOff}</td></tr>`;
  }).join('') || '<tr><td colspan="4">No tractate engagement recorded yet.</td></tr>';
  $('#stageList').innerHTML = data.stageCompletion.map((s) => `<li><span>${s.stageId.replaceAll('-', ' ')}</span><b>${s.count}</b></li>`).join('') || '<li>No completed stages recorded yet.</li>';
  $('#struggleList').innerHTML = data.topStruggles.map((s) => `<li><span>${s.skillId.replaceAll('-', ' ')}</span><b>${s.count}</b></li>`).join('') || '<li>No recurring struggles recorded yet.</li>';
}

function gate(message) {
  $('#adminGate').hidden = false;
  if (message) $('#adminGateMsg').textContent = message;
}

async function load() {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let response;
  try { response = await fetch('/api/admin/analytics', { headers }); }
  catch { $('#summary').innerHTML = '<p>Analytics could not load. Refresh to try again.</p>'; return; }
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    gate(token ? 'That admin token was not accepted. Check it and try again.' : 'Enter the operator admin token to view cohort analytics.');
    return;
  }
  if (response.status === 403) {
    // Reporting is off server-side (no SEDER_ADMIN_TOKEN configured) — a token here can't help.
    $('#unavailable').hidden = false;
    $('#unavailableReason').textContent = (await response.json().catch(() => ({}))).error || 'Operator analytics is disabled on this server.';
    return;
  }
  render(await response.json());
}

$('#adminGateForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = $('#adminToken').value.trim();
  if (!value) return;
  localStorage.setItem(TOKEN_KEY, value);
  $('#adminToken').value = '';
  load();
});

load();
