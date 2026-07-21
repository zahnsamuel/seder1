// Glyph-card decoding renderer for window.DecodingDrill. Deliberately standalone (not
// course-engine.js): the display is a single large glyph with no source card, ref, or translation,
// and the drill is not a canon source. It reuses the deep-course.css layout and the same MC
// interaction, so it feels consistent with the reading units.
//
// v1 vertical slice: progress persists in localStorage; XP is a local session counter. Wiring
// decoding answers into the server event log + spaced review is deferred to v2/v3 (see
// docs/hebrew-decoding-ladder-plan.md) so the drills cannot pollute the source-review queue with
// skill ids the curriculum engine cannot yet map.
const drill=window.DecodingDrill;
const decLearner=(window.Seder&&Seder.currentLearnerId&&Seder.currentLearnerId())||'local';
const decProgressKey=`seder-decoding-progress:${decLearner}:${drill.band}`;
const decSaved=Number(localStorage.getItem(decProgressKey));
let decIndex=Number.isInteger(decSaved)&&decSaved>=0&&decSaved<drill.items.length?decSaved:0,decAnswered=false,decXp=0;
const $=s=>document.querySelector(s);
function decShuffle(list){return list.map((text,i)=>({text,i})).sort(()=>Math.random()-.5)}
function decRender(){
  const item=drill.items[decIndex];decAnswered=false;
  $('#count').textContent=`${decIndex+1} / ${drill.items.length}`;
  $('#bar').style.width=`${(decIndex+1)/drill.items.length*100}%`;
  $('#band').textContent=drill.bandLabel||'DECODING';
  $('#glyph').textContent=item.glyph;
  $('#prompt').textContent=item.prompt;
  $('#feedback').textContent='';
  $('#continue').disabled=true;
  $('#continue').textContent=decIndex===drill.items.length-1?'Finish lesson →':'Continue →';
  const answers=$('#answers');answers.innerHTML='';
  decShuffle(item.answers).forEach(({text,i})=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>decAnswer(b,i===item.correct,item));answers.appendChild(b)});
  $('#map').innerHTML=drill.items.map((it,i)=>`<li class="${i===decIndex?'active':''} ${i<decIndex?'done':''}">${it.short||it.glyph}</li>`).join('');
}
function decAnswer(button,correct,item){
  if(decAnswered)return;decAnswered=true;
  document.querySelectorAll('#answers button').forEach(b=>b.disabled=true);
  button.classList.add(correct?'correct':'incorrect');
  if(correct){decXp+=10}else{decXp+=5}
  $('#xp').textContent=`${decXp} XP`;
  $('#feedback').textContent=(correct?'+10 XP. ':'+5 XP. ')+item.feedback;
  $('#continue').disabled=false;
}
$('#continue').addEventListener('click',()=>{
  if(!decAnswered)return;
  if(decIndex<drill.items.length-1){decIndex++;localStorage.setItem(decProgressKey,String(decIndex));decRender();return}
  localStorage.removeItem(decProgressKey);
  $('.lesson').innerHTML=`<section class="mastery"><span class="eyebrow">LESSON COMPLETE</span><h2>${drill.completeTitle}</h2><p>${drill.completeCopy}</p><a href="${drill.nextUrl}">${drill.nextLabel} →</a></section>`;
});
decRender();
