const stages=[['1','Enter the page','Hebrew decoding, core vocabulary, Mishnah orientation, daf navigation.','Read a short source, identify its question, and find its reference.','FOUNDATIONS'],['2','Read the language','Rabbinic Hebrew and core Aramaic patterns, speakers, connectors, and quotations.','Translate and explain a short line with support.','LANGUAGE'],['3','Follow Gemara moves','Questions, answers, proofs, challenges, resolutions, and conclusions.','Map the moves in a short sugya.','REASONING'],['4','Study first tractates','Berakhot, then carefully chosen passages in Shabbat, Bava Metzia, and Pesachim.','Read a guided passage in an unfamiliar tractate.','TRACTATE LAB'],['5','Read Rashi with the daf','Learn what Rashi is clarifying, how he reads grammar, and when he resolves a difficulty.','Use Rashi to explain a difficult word or move.','COMMENTARY'],['6','Compare voices','Tosafot, parallel sugyot, variant positions, and the development of a dispute.','Compare two readings and name the tension between them.','DIALECTIC'],['7','Trace to halakha','Move from Torah and Gemara through Rambam, Tur, Shulchan Aruch, and later discussion.','Build a cited source chain without presenting psak.','SOURCE CHAIN'],['8','Independent mastery','Choose a tractate, prepare a daf, form questions, use sources, and learn with a teacher or chavruta when possible.','Present a sourced reading of a sugya and clearly mark uncertainty.','INDEPENDENCE']];
const key='seder-course-progress-v1';
const saved=JSON.parse(localStorage.getItem(key)||'{}');
const xp=document.querySelector('#xp');
if(xp) xp.textContent=`${saved.xp||0} XP`;
const path=document.querySelector('#path'),detail=document.querySelector('#detail');
const currentIndex=2;
function showStage(s,button){
  document.querySelectorAll('.stage').forEach(x=>x.classList.toggle('now',x===button));
  detail.innerHTML=`<span>STAGE ${s[0]} · ${s[4]}</span><h2>${s[1]}</h2><p>${s[2]}</p><div><small>MASTERY EVIDENCE</small><strong>${s[3]}</strong></div><a href="study.html?v=9">Open practice room →</a>`;
}
const current=stages[currentIndex];
const title=document.querySelector('#next-title');
const copy=document.querySelector('#next-copy');
if(title) title.textContent=current[1];
if(copy) copy.textContent=current[2];
stages.forEach((s,i)=>{
  const b=document.createElement('button');
  b.className=`stage ${i===currentIndex?'now':''}`;
  b.innerHTML=`<b>${s[0]}</b><div><small>${s[4]}</small><h2>${s[1]}</h2><p>${s[2]}</p></div><em>${i===currentIndex?'CURRENT':'UNLOCKS NEXT'}</em>`;
  b.addEventListener('click',()=>showStage(s,b));
  path.appendChild(b);
});
