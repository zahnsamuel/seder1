const learnerId=Seder.currentLearnerId(),key=`seder-berakhot-lab-${learnerId}`,mastered=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
let lab,index=0,selected,answered=false;
const $=s=>document.querySelector(s);
const shuffle=items=>items.map((text,original)=>({text,original})).sort(()=>Math.random()-.5);
function render(){
  const e=lab.exercises[index];
  $('#progress').textContent=`${mastered.size} / ${lab.exercises.length} moves demonstrated`;
  $('#exercise-nav').innerHTML=lab.exercises.map((x,i)=>`<button class="lab-button ${i===index?'active':''}" data-i="${i}">${x.mode}<small>${mastered.has(x.id)?'Demonstrated':x.title}</small></button>`).join('');
  document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{index=+b.dataset.i;answered=false;render()});
  const choices=e.acceptable?[e.translation,'A question the verse raises but does not answer here.','A final ruling not stated in this line.']:e.choices;
  const correct=e.acceptable?0:e.correct;
  $('#lesson').innerHTML=`<p class="lesson-label">${e.mode}</p><h2>${e.title}</h2><article class="source"><p class="hebrew" lang="he" dir="rtl">${e.source}</p><p class="translation">${e.translation}</p></article><p class="prompt">${e.acceptable?'Which meaning belongs to this source line?':e.prompt}</p><div class="choices">${shuffle(choices).map(({text,original})=>`<button class="choice" data-choice="${original}">${text}</button>`).join('')}</div><button id="check" class="continue" disabled>Check my reading</button><div id="feedback"></div>`;
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selected=+b.dataset.choice;document.querySelectorAll('[data-choice]').forEach(x=>x.classList.toggle('selected',+x.dataset.choice===selected));$('#check').disabled=false});
  $('#check').onclick=()=>answer(e,selected===correct);
}
async function answer(e,correct){
  if(answered)return;answered=true;document.querySelectorAll('#lesson button').forEach(b=>b.disabled=true);
  $('#feedback').innerHTML=`<p class="feedback">${correct?'Demonstrated. ':'Repair this move, then return. '}${e.explanation}</p>${correct?'':`<p><a href="pilot-repair.html?skill=${e.skillId}">Open a focused repair →</a></p>`}`;
  if(correct){mastered.add(e.id);localStorage.setItem(key,JSON.stringify([...mastered]))}
  try{await Seder.api(`/api/learners/${learnerId}/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'answer_submitted',skillId:e.skillId,competency:'argument',sourceContext:'Berakhot opening lab',correct})})}catch(x){console.warn(x)}
}
fetch('/api/curriculum/berakhot-practice-lab').then(r=>r.json()).then(x=>{lab=x;$('#title').textContent=x.title;$('#description').textContent=x.description;render()});
