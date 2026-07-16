// Civil Reasoning predates the shared course engine, so it renders its completion
// screen directly. Watch that earned screen and record the same durable checkpoint
// the Gemara Year map uses; no completion is awarded merely by opening this page.
(() => {
  const learnerId = Seder.currentLearnerId();
  const lesson = document.querySelector('.lesson');
  if (!lesson) return;
  const complete = async () => {
    if (!/CIVIL REASONING RECORDED/.test(lesson.textContent) || lesson.dataset.gemaraYearRecorded) return;
    lesson.dataset.gemaraYearRecorded = 'true';
    await Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'stage_mastered', stageId: 'civil-reasoning-checkpoint' }) }).catch(() => {});
    const link = lesson.querySelector('a');
    if (link) { link.href = 'gemara-year.html'; link.textContent = 'Enter Gemara Term III →'; }
  };
  new MutationObserver(complete).observe(lesson, { childList: true, subtree: true, characterData: true });
  complete();
})();
