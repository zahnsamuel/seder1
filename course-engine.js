const config=window.SederCourse;
const masteryLoopByStage={'shabbat-tractate-arc':'shabbat','pesachim-tractate-arc':'pesachim','eruvin-tractate-arc':'eruvin','sukkah-tractate-arc':'sukkah','bava-metzia-tractate-arc':'bava-metzia','bava-kamma-tractate-arc':'bava-kamma','yoma-tractate-arc':'yoma','berakhot-baraita-disagreement':'berakhot','ketubot-tractate-arc':'ketubot','chullin-tractate-arc':'chullin','niddah-tractate-arc':'niddah'};
if(masteryLoopByStage[config.stage]){const tractate=masteryLoopByStage[config.stage];config.nextUrl=`tractate-mastery.html?tractate=${tractate}`;config.nextLabel=`Open the ${tractate.replace(/-/g,' ')} mastery loop`;}
let courseIndex=0,answered=false,xp=0;const $$=s=>document.querySelector(s);const courseLearner=Seder.currentLearnerId();
function shuffle(list){return list.map((text,i)=>({text,i})).sort(()=>Math.random()-.5)}
(function injectCelebrationStyles(){
  if(document.getElementById('seder-celebration-styles'))return;
  const style=document.createElement('style');style.id='seder-celebration-styles';
  style.textContent=`
    @keyframes seder-xp-pop{0%{transform:scale(1);}35%{transform:scale(1.28);color:#b88028;}100%{transform:scale(1);}}
    @keyframes seder-float-up{0%{opacity:0;transform:translateY(6px);}20%{opacity:1;}100%{opacity:0;transform:translateY(-22px);}}
    @keyframes seder-checkpoint-in{0%{opacity:0;transform:translateY(10px) scale(.98);}100%{opacity:1;transform:translateY(0) scale(1);}}
    @keyframes seder-spark-pop{0%{transform:scale(0) rotate(0deg);opacity:1;}70%{opacity:1;}100%{transform:scale(1.5) rotate(30deg);opacity:0;}}
    .seder-xp-pop{animation:seder-xp-pop .5s ease;}
    .seder-float-xp{position:relative;}
    .seder-float-xp::after{content:attr(data-float);position:absolute;left:50%;top:-4px;transform:translateX(-50%);font:600 12px 'DM Mono',monospace;color:#276b68;pointer-events:none;animation:seder-float-up .9s ease forwards;}
    .seder-checkpoint-celebrate{animation:seder-checkpoint-in .45s ease;}
    .seder-checkpoint-celebrate .eyebrow{position:relative;display:inline-block;}
    .seder-spark{position:absolute;top:50%;font-size:14px;pointer-events:none;animation:seder-spark-pop .7s ease forwards;}
    .seder-typed{display:flex;gap:9px;margin-top:2px;}
    .seder-typed input{flex:1;padding:14px 15px;border:1px solid #d1d8d3;background:#fff;color:#273b43;font:500 14px Inter,Arial,sans-serif;}
    .seder-typed input:focus{outline:2px solid #276b68;outline-offset:1px;}
    .seder-typed input.correct{background:#e0efe4;border-color:#4f8b6a;}
    .seder-typed input.incorrect{background:#f8e6e1;border-color:#c16e58;}
    .seder-typed button{padding:14px 18px;border:0;background:#183b4e;color:#fff;font:600 14px Inter,Arial,sans-serif;cursor:pointer;}
    .seder-typed button:disabled{opacity:.5;cursor:not-allowed;}
  `;
  document.head.appendChild(style);
})();
function celebrateXp(el,amount){
  if(!el)return;
  el.classList.remove('seder-xp-pop');void el.offsetWidth;el.classList.add('seder-xp-pop');
  el.dataset.float=`+${amount}`;el.classList.remove('seder-float-xp');void el.offsetWidth;el.classList.add('seder-float-xp');
}
function celebrateCheckpoint(container){
  if(!container)return;
  container.classList.add('seder-checkpoint-celebrate');
  const eyebrow=container.querySelector('.eyebrow');
  if(!eyebrow)return;
  const sparks=['✦','✧','✦'];
  sparks.forEach((glyph,i)=>{
    const span=document.createElement('span');
    span.className='seder-spark';span.textContent=glyph;
    span.style.left=`${-10+i*40}%`;span.style.animationDelay=`${i*90}ms`;
    eyebrow.appendChild(span);
  });
}
// Conservative ref -> Sefaria URL mapper: links only when the citation pattern is
// unambiguous (Bavli daf, Tanakh chapter:verse, Mishnah, Pirkei Avot). Method refs,
// ranges, and multi-source refs beyond the first stay unlinked rather than guessed.
function sefariaUrl(ref){
  if(!ref)return null;
  const clean=String(ref).split('·')[0].trim();
  let m=clean.match(/^Mishnah ([A-Za-z ]+?) (\d+):(\d+)$/);
  if(m)return`https://www.sefaria.org/Mishnah_${m[1].trim().replace(/ /g,'_')}.${m[2]}.${m[3]}`;
  m=clean.match(/^Pirkei Avot (\d+):(\d+)$/);
  if(m)return`https://www.sefaria.org/Pirkei_Avot.${m[1]}.${m[2]}`;
  m=clean.match(/^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Psalms?|Proverbs|Job|Micah|Jeremiah|Hosea|Lamentations|Ezekiel|Isaiah) (\d+):(\d+)$/);
  if(m)return`https://www.sefaria.org/${(m[1]==='Psalm'?'Psalms':m[1])}.${m[2]}.${m[3]}`;
  m=clean.match(/^(Berakhot|Shabbat|Eruvin|Pesachim|Sukkah|Yoma|Taanit|Megillah|Ketubot|Nedarim|Nazir|Sotah|Gittin|Kiddushin|Bava Kamma|Bava Metzia|Bava Batra|Sanhedrin|Makkot|Shevuot|Chullin|Niddah) (\d+[ab])$/);
  if(m)return`https://www.sefaria.org/${m[1].replace(/ /g,'_')}.${m[2]}`;
  return null;
}
function renderCourse(){const step=config.steps[courseIndex];answered=false;$$('#count').textContent=`${courseIndex+1} / ${config.steps.length}`;$$('#bar').style.width=`${(courseIndex+1)/config.steps.length*100}%`;$$('#mode').textContent=step.mode;$$('#title').textContent=step.title;const sourceLink=sefariaUrl(step.ref);if(sourceLink){$$('#ref').innerHTML=`${step.ref} · <a href="${sourceLink}" target="_blank" rel="noopener" style="color:#276b68;font-weight:600">Read the full source ↗</a>`}else{$$('#ref').textContent=step.ref};$$('#hebrew').textContent=step.hebrew;$$('#translation').textContent=step.translation;$$('#translation').hidden=Boolean(step.independent);$$('#translate').textContent=step.independent?'Show translation':'Hide translation';$$('#prompt').textContent=step.prompt;$$('#feedback').textContent='';$$('#continue').disabled=true;$$('#continue').textContent=courseIndex===config.steps.length-1?'Complete checkpoint →':'Continue →';const answers=$$('#answers');answers.innerHTML='';if(step.typed){renderTyped(step,answers)}else{shuffle(step.answers).forEach(({text,i})=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>answerCourse(b,i===step.correct,step));answers.appendChild(b)})}$$('#map').innerHTML=config.steps.map((item,i)=>`<li class="${i===courseIndex?'active':''} ${i<courseIndex?'done':''}">${item.short}</li>`).join('')}
function answerCourse(button,correct,step){if(answered)return;answered=true;document.querySelectorAll('#answers button').forEach(b=>b.disabled=true);button.classList.add(correct?'correct':'incorrect');$$('#feedback').textContent=(correct?'+10 XP. ':'+5 XP. ')+step.feedback;$$('#continue').disabled=false;recordCourseAnswer(step,correct)}
function normalizeTyped(text){return String(text||'').trim().toLowerCase().replace(/[.,!?;:'"“”’]/g,'')}
function renderTyped(step,container){
  const correct=(step.acceptable||[step.translation])[0];
  shuffle([correct,'A question that the source raises but does not answer here.','A final ruling not stated in this source line.']).forEach(({text,i})=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>answerCourse(b,i===0,step));container.appendChild(b)});
  return;
  const wrap=document.createElement('div');wrap.className='seder-typed';
  const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.placeholder='Type your answer…';input.setAttribute('aria-label','Typed answer');
  const submit=document.createElement('button');submit.type='button';submit.textContent='Check answer';
  const trigger=()=>submitTyped(input,submit,step);
  submit.addEventListener('click',trigger);
  input.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();trigger()}});
  wrap.appendChild(input);wrap.appendChild(submit);container.appendChild(wrap);
  setTimeout(()=>input.focus(),0);
}
function submitTyped(input,submit,step){
  if(answered||!input.value.trim())return;
  answered=true;
  const value=normalizeTyped(input.value);
  const correct=(step.acceptable||[]).some((candidate)=>normalizeTyped(candidate)===value);
  input.disabled=true;submit.disabled=true;
  input.classList.add(correct?'correct':'incorrect');
  const hint=correct?'':` The expected answer was “${step.acceptable[0]}.”`;
  $$('#feedback').textContent=(correct?'+10 XP. ':'+5 XP. ')+step.feedback+hint;
  $$('#continue').disabled=false;
  recordCourseAnswer(step,correct);
}
function recordCourseAnswer(step,correct){Seder.api(`/api/learners/${courseLearner}/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'answer_submitted',skillId:step.skill,competency:step.competency,correct,sourceContext:step.ref})}).then(r=>r.ok?r.json():null).then(l=>{if(l){xp=l.xp||xp;$$('#xp').textContent=`${xp} XP`;celebrateXp($$('#xp'),correct?10:5)}}).catch(()=>{})}
$$('#translate').addEventListener('click',()=>{const el=$$('#translation');el.hidden=!el.hidden;$$('#translate').textContent=el.hidden?'Show translation':'Hide translation'});
$$('#continue').addEventListener('click',()=>{if(!answered)return;if(courseIndex<config.steps.length-1){courseIndex++;renderCourse();return}$$('.lesson').innerHTML=`<section class="mastery"><span class="eyebrow">CHECKPOINT COMPLETE</span><h2>${config.completeTitle}</h2><p>${config.completeCopy}</p><a href="${config.nextUrl}">${config.nextLabel} →</a></section>`;celebrateCheckpoint($$('.mastery'));Seder.api(`/api/learners/${courseLearner}/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'stage_mastered',stageId:config.stage})}).catch(()=>{})});
Seder.api(`/api/learners/${courseLearner}`).then(r=>r.ok?r.json():null).then(l=>{if(l){xp=l.xp||0;$$('#xp').textContent=`${xp} XP`}}).catch(()=>{});renderCourse();
