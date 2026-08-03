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
  renderGraphPilot(data.graphPilot);
}

const readable = (id) => id.replace(/^fnd-/, '').replaceAll('-', ' ');
const asPct = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`);

// The graph-pilot signal (data/pilot-analytics.mjs): classical item analysis over the foundation graph.
// Honest about sample size — only rows with enough responses are shown as signal; the rest await data.
function renderGraphPilot(gp) {
  const panel = document.querySelector('.graph-pilot');
  if (!panel) return;
  if (!gp) { panel.hidden = true; return; }
  panel.hidden = false;
  const s = gp.summary;
  $('#pilotSummary').innerHTML = [
    ['Learners', s.learners],
    ['Responses', s.responses],
    ['Skills with data', `${s.skillsWithEnoughData}/${s.skillsTotal}`],
    ['Edges validatable', s.edgesValidatable],
    ['Edges confirming prereq', s.edgesConfirmingPrerequisite]
  ].map(([label, value]) => `<article><small>${label}</small><strong>${value}</strong></article>`).join('');

  const skills = (gp.skills || []).filter((x) => x.enough).sort((a, b) => (a.difficulty ?? 1) - (b.difficulty ?? 1));
  $('#pilotSkills tbody').innerHTML = skills.map((x) => {
    const diffFlag = x.difficulty != null && x.difficulty < 0.4 ? ' class="flag"' : '';
    const disc = x.discrimination == null ? '—' : x.discrimination.toFixed(2);
    const discFlag = x.discrimination != null && x.discrimination < 0 ? ' class="flag"' : '';
    return `<tr><td>${readable(x.skill)}</td><td>${x.layer}</td><td>${x.learners}</td><td${diffFlag}>${asPct(x.difficulty)}</td><td${discFlag}>${disc}</td></tr>`;
  }).join('') || `<tr><td colspan="5">No skill has reached ${gp.minResponses} first-attempt responses yet — awaiting pilot data.</td></tr>`;

  const edges = (gp.edges || []).filter((e) => e.enough).sort((a, b) => (a.lift ?? 0) - (b.lift ?? 0));
  $('#pilotEdges tbody').innerHTML = edges.map((e) => {
    const flag = e.lift != null && e.lift <= 0 ? ' class="flag"' : '';
    const lift = e.lift == null ? '—' : `${e.lift > 0 ? '+' : ''}${Math.round(e.lift * 100)}pp`;
    return `<tr><td>${readable(e.from)} → ${readable(e.to)}</td><td>${asPct(e.passWhenSecured)} <small>(${e.nSecured})</small></td><td>${asPct(e.passWhenNotSecured)} <small>(${e.nUnsecured})</small></td><td${flag}>${lift}</td></tr>`;
  }).join('') || `<tr><td colspan="4">No prerequisite edge has enough secured and unsecured attempts yet — awaiting pilot data.</td></tr>`;
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
