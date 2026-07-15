(() => {
  const tractate = location.pathname.match(/\/(pesachim|eruvin|sukkah|bava-metzia|bava-kamma)-deepening\.html$/)?.[1];
  if (!tractate) return;
  const prompts = {
    pesachim: 'Compare the opening time-and-tool Mishnah with this word-question and evidence chain. What stayed the same, and what became more demanding?',
    eruvin: 'Compare the opening measure-and-response Mishnah with this formulation dispute. What stayed the same, and what new argument move appeared?',
    sukkah: 'Compare the opening validity ruling with these competing explanations. What stayed the same, and what did the second encounter ask you to distinguish?',
    'bava-metzia': 'Compare the opening claims-and-response map with this procedural explanation. What stayed the same, and what new concern did the Gemara add?',
    'bava-kamma': 'Compare the opening category list with the difference-and-common-principle analysis. What stayed the same, and what new reasoning move did you learn?'
  };
  const learnerId = Seder.currentLearnerId();
  function mountProductionGate() {
    const lesson = document.querySelector('.lesson');
    const completionLink = lesson?.querySelector('.mastery a');
    if (!lesson || !completionLink || document.querySelector('#second-source-production')) return;
    completionLink.hidden = true;
    const panel = document.createElement('section');
    panel.id = 'second-source-production';
    panel.className = 'second-source-production';
    panel.innerHTML = `<span>SECOND SOURCE · PRODUCTION</span><h3>Explain the comparison</h3><p>${prompts[tractate]}</p><label for="secondSourceExplanation">Write at least one complete sentence.</label><textarea id="secondSourceExplanation" placeholder="In this second encounter, the source still… but now…"></textarea><button type="button" id="saveSecondSourceExplanation">Save my comparison</button><p id="secondSourceFeedback" aria-live="polite"></p>`;
    completionLink.before(panel);
    document.querySelector('#saveSecondSourceExplanation').addEventListener('click', async () => {
      const explanation = document.querySelector('#secondSourceExplanation').value.trim();
      const words = explanation.split(/\s+/).filter(Boolean);
      const feedback = document.querySelector('#secondSourceFeedback');
      if (words.length < 8) { feedback.textContent = 'Use at least eight words to name both the continuity and the new move.'; return; }
      localStorage.setItem(`seder-second-source-explanation-${tractate}-${learnerId}`, explanation);
      feedback.textContent = 'Comparison saved. You have shown how the first and second encounters connect.';
      await Seder.api(`/api/learners/${learnerId}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'source_annotation', skillId: `${tractate}-second-source-production`, competency: 'argument', sourceContext: `${tractate} second source comparison`, correct: true })
      }).catch(() => {});
      await Seder.api(`/api/learners/${learnerId}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'second_source_explanation', artifactId: tractate })
      }).catch(() => {});
      completionLink.hidden = false;
    });
  }
  new MutationObserver(mountProductionGate).observe(document.documentElement, { childList: true, subtree: true });
  mountProductionGate();
  const style = document.createElement('style');
  style.textContent = `.second-source-production{margin:22px 0;padding:18px;border-left:3px solid #276b68;background:#eef5ef;color:#183b4e}.second-source-production>span{font:10px 'DM Mono',monospace;color:#276b68;letter-spacing:.08em}.second-source-production h3{margin:7px 0;font:600 23px Fraunces,Georgia,serif}.second-source-production textarea{display:block;box-sizing:border-box;width:100%;min-height:110px;margin:8px 0 12px;padding:10px;font:15px Inter,sans-serif}.second-source-production button{min-height:44px;padding:10px 14px;background:#183b4e;color:#fff;border:0;cursor:pointer}.second-source-production label{display:block;font-size:13px;font-weight:600}`;
  document.head.append(style);
})();
