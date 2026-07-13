(() => {
  const learnerId = Seder.currentLearnerId();
  const mapKey = (tractate) => `seder-daf-argument-map-${tractate}-${learnerId}`;
  const readMap = (tractate) => { try { return JSON.parse(localStorage.getItem(mapKey(tractate)) || '{}'); } catch { return {}; } };
  const writeMap = (tractate, map) => localStorage.setItem(mapKey(tractate), JSON.stringify(map));
  const $ = (selector) => document.querySelector(selector);
  function currentSource() { return typeof sources !== 'undefined' && sources[active] ? sources[active] : null; }
  function renderMap() {
    const source = currentSource(), list = $('#argumentMap'); if (!source || !list) return;
    const map = readMap(active), completed = Object.keys(map).length;
    $('#mapProgress').textContent = completed === source.lines.length ? `Source map complete: ${completed} of ${source.lines.length} moves correctly identified.` : `${completed} of ${source.lines.length} lines mapped. Name each line’s role before moving on.`;
    list.innerHTML = source.lines.map((line, index) => `<li class="${map[index] ? 'mapped' : ''}"><b>${index + 1}</b><span>${map[index] || 'Not yet mapped'}</span></li>`).join('');
    document.querySelectorAll('.daf-line').forEach((line, index) => { line.classList.toggle('mapped', Boolean(map[index])); const old = line.querySelector('.role-chip'); if (old) old.remove(); if (map[index]) { const chip = document.createElement('em'); chip.className = 'role-chip'; chip.textContent = map[index]; line.append(chip); } });
    if (completed === source.lines.length) {
      const feedback = $('#feedback');
      if (feedback && !document.querySelector('#mapComplete')) { const complete = document.createElement('div'); complete.id = 'mapComplete'; complete.className = 'map-complete'; complete.innerHTML = `<strong>Source map earned</strong><p>You can now see the sugya as a chain of moves, not isolated translations.</p><label for="mapExplanation">Explain one transition in this sugya</label><textarea id="mapExplanation" placeholder="For example: the question puts pressure on the Mishnah because…"></textarea><button id="saveMapExplanation" type="button">Save my explanation</button><p id="mapExplanationFeedback"></p><a href="tractate-mastery.html?tractate=${encodeURIComponent(active)}">Continue this tractate →</a>`; feedback.after(complete); document.querySelector('#saveMapExplanation').onclick = () => { const explanation = document.querySelector('#mapExplanation').value.trim(); if (!explanation) { document.querySelector('#mapExplanation').focus(); return; } localStorage.setItem(`seder-daf-map-explanation-${active}-${learnerId}`, explanation); document.querySelector('#mapExplanationFeedback').textContent = 'Explanation saved to your Study Record.'; Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'source_map_explanation', artifactId: active }) }).catch(() => {}); }; Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'source_map_completed', stageId: `${active}-daf-source-map`, skillId: source.skill, sourceContext: `${active} complete Daf map`, correct: true }) }).catch(() => {}); Seder.api(`/api/learners/${learnerId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'journey_artifact_saved', artifactType: 'source_map', artifactId: active }) }).catch(() => {}); }
    } else document.querySelector('#mapComplete')?.remove();
  }
  $('#mark').addEventListener('click', () => window.setTimeout(() => { const source = currentSource(); if (!source || focused === null || !$('#feedback').textContent.startsWith('Good reading.')) return; const map = readMap(active); map[focused] = source.lines[focused].role; writeMap(active, map); renderMap(); }, 0));
  new MutationObserver(renderMap).observe($('#lines'), { childList: true }); renderMap();
})();
