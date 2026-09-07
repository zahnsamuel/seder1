const learnerId=Seder.currentLearnerId(),$=s=>document.querySelector(s),route=['shema-six','blessings-six','tefillah-six','freedom-six','history-six','responsibility-six'];
function nextCourse(courses){
  return courses.find(({first,capstone})=>first!==undefined||!capstone)||courses[0];
}
function fillHero(item){
  const title=$('#next-title'),copy=$('#next-copy'),cta=$('#next-cta'),progress=$('#next-progress');
  if(!item||!cta)return;
  const {course,completed,first,capstone}=item;
  const total=course.sessions.length;
  const courseComplete=completed.size===total;
  if(title) title.textContent=course.title;
  if(copy) copy.textContent=course.description;
  if(capstone){
    cta.href='daily-router.html';
    cta.textContent='Return to Today →';
  }else if(courseComplete){
    cta.href=`canon-capstone.html?course=${course.id}`;
    cta.textContent='Open independent capstone →';
  }else{
    cta.href=`canon-course.html?course=${course.id}&session=${first}`;
    cta.textContent=completed.size?'Resume course →':'Begin course →';
  }
  if(progress) progress.textContent=`${completed.size} / ${total} moves`;
}
Promise.all([fetch('/api/curriculum/canon-six-session-courses').then(r=>r.json()),fetch('/api/curriculum/canon-bridges').then(r=>r.json()),Seder.api(`/api/learners/${learnerId}`).then(r=>r.ok?r.json():{})]).then(([data,bridgeData,learner])=>{const artifacts=learner.artifacts||{},byId=new Map(data.courses.map(course=>[course.id,course])),bridges=new Map(bridgeData.bridges.map(bridge=>[bridge.from,bridge])),courses=route.map(id=>byId.get(id)).filter(Boolean).map(course=>{const localMoves=JSON.parse(localStorage.getItem(`seder-course-${course.id}-${learnerId}`)||'[]'),durableMoves=(artifacts.course_move||[]).filter(item=>item.startsWith(`${course.id}:`)).map(item=>Number(item.split(':')[1])),completed=new Set([...localMoves,...durableMoves]),first=[...Array(course.sessions.length).keys()].find(i=>!completed.has(i)),capstone=localStorage.getItem(`seder-capstone-${course.id}-${learnerId}`)==='complete'||(artifacts.capstone||[]).includes(course.id);return{course,completed,first,capstone}}),moves=courses.reduce((total,item)=>total+item.completed.size,0),finished=courses.filter(item=>item.capstone).length;$('#summary').innerHTML=`<article><small>MOVES DEMONSTRATED</small><strong>${moves}</strong></article><article><small>INDEPENDENT CONNECTIONS</small><strong>${finished} / ${courses.length}</strong></article><article><small>ONE JOURNEY</small><strong>Read · retrieve · connect</strong></article>`;fillHero(nextCourse(courses));$('#courses').innerHTML=courses.map(({course,completed,first,capstone})=>{const total=course.sessions.length,courseComplete=completed.size===total,bridge=bridges.get(course.id),bridgeDone=bridge&&(localStorage.getItem(`seder-bridge-${bridge.id}-${learnerId}`)==='complete'||(artifacts.bridge||[]).includes(bridge.id)),href=courseComplete?`canon-capstone.html?course=${course.id}`:`canon-course.html?course=${course.id}&session=${first}`,label=capstone?'Capstone demonstrated':courseComplete?'Open independent capstone →':completed.size?'Resume course →':'Begin course →',percent=Math.round(completed.size/total*100),bridgePanel=bridge?`<div class="bridge-panel"><small>${bridgeDone?'BRIDGE DEMONSTRATED':'NEXT CANON BRIDGE'}</small><p>${bridge.title}</p>${capstone?`<a href="canon-bridge.html?bridge=${bridge.id}">${bridgeDone?'Review connection →':'Open connection →'}</a>`:'<span>Complete the capstone to unlock.</span>'}</div>`:'';return`<article class="course-card"><small>${capstone?'INDEPENDENT CONNECTION SAVED':courseComplete?'READY FOR SYNTHESIS':`${completed.size} OF ${total} MOVES DEMONSTRATED`}</small><h2>${course.title}</h2><p>${course.description}</p><div class="bar" aria-label="${percent}% complete"><span style="width:${percent}%"></span></div><p>${percent}% course evidence</p><a href="${href}">${label}</a>${bridgePanel}</article>`}).join('')}).catch(()=>{$('#courses').innerHTML='<p>Course progress is temporarily unavailable. Return to Today to continue learning.</p>'});
