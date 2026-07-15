(() => {
  const tractate = location.pathname.match(/\/(pesachim|eruvin|sukkah|bava-metzia|bava-kamma)-deepening\.html$/)?.[1];
  if (!tractate) return;
  const checks = {
    pesachim: { prompt: 'What does the second encounter add to the opening time-and-tool Mishnah?', correct: 'It keeps the opening case in view, then tests how a precise word and proof chain make its terms more demanding.', wrong: ['It replaces the opening case with a personal practice instruction.', 'It proves that only the final conclusion matters, not the source’s wording.'] },
    eruvin: { prompt: 'What does the formulation dispute add to the opening measure-and-response Mishnah?', correct: 'It keeps the physical condition visible, then asks how competing formulations define the legal distinction.', wrong: ['It makes measurements irrelevant once a dispute appears.', 'It turns the source into a rule for every boundary without reading its condition.'] },
    sukkah: { prompt: 'What does the second encounter add to the opening validity ruling?', correct: 'It keeps the ruling in view, then distinguishes the competing reasons that could explain it.', wrong: ['It shows that one memorable image is enough to settle the source.', 'It removes the need to ask what concern each explanation addresses.'] },
    'bava-metzia': { prompt: 'What does the procedural explanation add to the opening claims-and-response map?', correct: 'It keeps both claims visible, then asks how procedure protects the competing concerns in the case.', wrong: ['It treats the first claimant as automatically decisive.', 'It reduces the case to a slogan about fairness without tracing procedure.'] },
    'bava-kamma': { prompt: 'What does the difference-and-common-principle analysis add to the opening category list?', correct: 'It keeps the categories distinct, then asks what shared principle can connect them without erasing their differences.', wrong: ['It collapses every category into one identical kind of damage.', 'It treats the list as a verdict that no longer needs analysis.'] }
  };
  const learnerId = Seder.currentLearnerId();
  const shuffle = items => items.map((text, original) => ({ text, original })).sort(() => Math.random() - .5);
  function mountProductionGate() {
    const lesson = document.querySelector('.lesson');
    const completionLink = lesson?.querySelector('.mastery a');
    if (!lesson || !completionLink || document.querySelector('#second-source-production')) return;
    completionLink.hidden = true;
    const check = checks[tractate];
    const panel = document.createElement('section');
    panel.id = 'second-source-production';
    panel.className = 'second-source-production';
    panel.innerHTML = `<span>SECOND SOURCE · EXPLANATION CHECK</span><h3>Read the new move</h3><p>${check.prompt}</p><div class="source-choice-set" aria-label="Choose the best explanation"></div><p id="secondSourceFeedback" aria-live="polite"></p>`;
    completionLink.before(panel);
    const choices = panel.querySelector('.source-choice-set');
    shuffle([check.correct, ...check.wrong]).forEach(({ text, original }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', async () => {
        const feedback = panel.querySelector('#secondSourceFeedback');
        if (original !== 0) {
          button.disabled = true;
          button.classList.add('incorrect');
          feedback.textContent = 'Not yet. Re-read what the second encounter changes or sharpens in the first source.';
          return;
        }
        choices.querySelectorAll('button').forEach(item => item.disabled = true);
        button.classList.add('correct');
        localStorage.setItem(`seder-second-source-explanation-${tractate}-${learnerId}`, check.correct);
        feedback.textContent = 'Explanation check earned. You showed how the second encounter deepens the first.';
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
      choices.append(button);
    });
  }
  new MutationObserver(mountProductionGate).observe(document.documentElement, { childList: true, subtree: true });
  mountProductionGate();
  const style = document.createElement('style');
  style.textContent = `.second-source-production{margin:22px 0;padding:18px;border-left:3px solid #276b68;background:#eef5ef;color:#183b4e}.second-source-production>span{font:10px 'DM Mono',monospace;color:#276b68;letter-spacing:.08em}.second-source-production h3{margin:7px 0;font:600 23px Fraunces,Georgia,serif}.source-choice-set{display:grid;gap:9px;margin:14px 0}.source-choice-set button{min-height:48px;padding:10px 14px;text-align:left;background:#fff;color:#183b4e;border:1px solid #b5c9c7;cursor:pointer}.source-choice-set button.correct{border-color:#276b68;background:#dfeee8}.source-choice-set button.incorrect{border-color:#a64b3c;background:#f9e6e2}`;
  document.head.append(style);
})();
