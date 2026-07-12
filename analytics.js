const $=s=>document.querySelector(s);
fetch('/api/admin/analytics').then(r=>r.json()).then(data=>{
  if(!data.available){
    $('#unavailable').hidden=false;
    $('#unavailableReason').textContent=data.reason;
    return;
  }
  $('#summary').innerHTML=[
    ['Learners',data.totalLearners],
    ['Total XP',data.totalXp],
    ['Total attempts',data.totalAttempts],
    ['Overall accuracy',data.overallAccuracy==null?'—':`${data.overallAccuracy}%`],
    ['Overdue reviews',data.overdueReviews]
  ].map(([label,value])=>`<article><small>${label}</small><strong>${value}</strong></article>`).join('');
  $('#tractateTable tbody').innerHTML=data.tractateStats.map(t=>{
    const dropOffClass=t.dropOff>0?' class="drop-off"':'';
    const completed=t.completedLearners===null?'—':t.completedLearners;
    const dropOff=t.dropOff===null?'—':t.dropOff;
    return `<tr${dropOffClass}><td>${t.title}${t.hasArc?'':' <small>(lab only — no completion signal)</small>'}</td><td>${t.engagedLearners}</td><td>${completed}</td><td>${dropOff}</td></tr>`;
  }).join('')||'<tr><td colspan="4">No tractate engagement recorded yet.</td></tr>';
  $('#stageList').innerHTML=data.stageCompletion.map(s=>`<li><span>${s.stageId.replaceAll('-',' ')}</span><b>${s.count}</b></li>`).join('')||'<li>No completed stages recorded yet.</li>';
  $('#struggleList').innerHTML=data.topStruggles.map(s=>`<li><span>${s.skillId.replaceAll('-',' ')}</span><b>${s.count}</b></li>`).join('')||'<li>No recurring struggles recorded yet.</li>';
}).catch(()=>{$('#summary').innerHTML='<p>Analytics could not load. Refresh to try again.</p>'});
