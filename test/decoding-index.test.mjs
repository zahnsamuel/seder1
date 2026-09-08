import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const loadIndex = async () => {
  const src = await read('decoding-index.js');
  const window = {};
  new Function('window', src)(window);
  return window.SederDecodingIndex;
};

const loadDrills = async () => {
  const src = await read('decoding-drills.js');
  const window = {};
  new Function('window', src)(window);
  return window.DecodingDrills;
};

const storageFor = (done, review) => {
  const map = new Map();
  const doneJson = JSON.stringify(done);
  const reviewJson = JSON.stringify(review || {});
  return {
    getItem: (key) => {
      if (map.has(key)) return map.get(key);
      if (key.startsWith('seder-decoding-done:')) return doneJson;
      if (key.startsWith('seder-decoding-review:')) return reviewJson;
      return null;
    },
    setItem: (key, val) => { map.set(key, String(val)); }
  };
};

const documentStub = () => {
  const nodes = {};
  return {
    nodes,
    querySelector: (sel) => {
      if (!sel.startsWith('#')) return null;
      const id = sel.slice(1);
      if (!nodes[id]) nodes[id] = { id, textContent: '', href: '', innerHTML: '', hidden: false };
      return nodes[id];
    }
  };
};

test('hebrew decoding index is one next move on the shared shell, not a syllabus map', async () => {
  const html = await read('hebrew-decoding.html');
  for (const sharedUi of ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'capability-state.js', 'jla-shell.js']) {
    assert.match(html, new RegExp(sharedUi.replace(/[.?]/g, '\\$&')));
  }
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=DM\+Mono/);
  assert.match(html, /family=Fraunces/);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Noto\+Sans\+Hebrew/);
  assert.match(html, /<p class="jla-eyebrow jla-na-eyebrow">DECODING<\/p>/);
  assert.match(html, /id="decoding-title"/);
  assert.match(html, /id="decoding-copy"/);
  assert.equal((html.match(/id="continue-cta"/g) || []).length, 1);
  assert.match(html, /class="jla-next-action__cta"/);
  assert.match(html, /Start this lesson/);
  assert.match(html, /id="skip-decode"/);
  assert.match(html, /I already read Hebrew/);
  assert.match(html, /id="decode-academy"/);
  assert.match(html, /academy\.html/);
  assert.match(html, /daily-router\.html/);
  assert.match(html, /<details class="decoding-ladder">/);
  assert.match(html, /<summary>See the full ladder<\/summary>/);
  assert.match(html, /id="ladder"/);
  assert.ok(html.indexOf('<details class="decoding-ladder">') < html.indexOf('id="ladder"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.doesNotMatch(html, /id="review-banner"/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /deep-course\.css/);
  assert.doesNotMatch(html, /jla-next-action\.js/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
  assert.doesNotMatch(html, /decoding-engine\.js/);
  assert.doesNotMatch(html, /\bXP\b/);
});

test('index picker prefers review-due, then the next new lesson, then start', async () => {
  const [api, drills] = await Promise.all([loadIndex(), loadDrills()]);
  const now = 1_000_000;
  const letters1Skills = drills.lessonSkills['letters-1'];

  const first = api.learnerState(drills, storageFor([], {}), 'local', now);
  const firstHero = api.heroFor(drills, first);
  assert.equal(first.mode, 'start');
  assert.equal(first.target, 'letters-1');
  assert.equal(firstHero.cta, 'Start this lesson →');
  assert.equal(firstHero.href, 'decoding-lesson.html?lesson=letters-1');
  assert.match(firstHero.title, /letters/);
  assert.match(firstHero.copy, /today’s first step/i);
  assert.doesNotMatch(firstHero.copy, /XP/i);

  const mid = api.learnerState(drills, storageFor(['letters-1', 'letters-2'], {}), 'local', now);
  const midHero = api.heroFor(drills, mid);
  assert.equal(mid.mode, 'continue');
  assert.equal(mid.target, 'letters-3');
  assert.equal(midHero.cta, 'Continue this lesson →');
  assert.equal(midHero.href, 'decoding-lesson.html?lesson=letters-3');
  assert.equal(midHero.title, drills.lessons['letters-3'].title);

  const dueReview = Object.fromEntries(letters1Skills.map((id) => [id, { dueAt: now - 1 }]));
  const review = api.learnerState(drills, storageFor(['letters-1', 'letters-2'], dueReview), 'local', now);
  const reviewHero = api.heroFor(drills, review);
  assert.equal(review.mode, 'review');
  assert.equal(review.target, 'letters-1');
  assert.ok(review.nextLesson === 'letters-3', 'review-due must win even when a new lesson is waiting');
  assert.equal(reviewHero.cta, 'Review what is due →');
  assert.equal(reviewHero.href, 'decoding-lesson.html?lesson=letters-1');
});

test('a finished ladder hands off to Today with capability language, not a next-lesson CTA', async () => {
  const [api, drills] = await Promise.all([loadIndex(), loadDrills()]);
  const order = drills.bands.flatMap((b) => b.lessons);
  const done = api.learnerState(drills, storageFor(order, {}), 'local', 1);
  const hero = api.heroFor(drills, done);
  assert.equal(done.mode, 'done');
  assert.equal(hero.href, 'daily-router.html');
  assert.equal(hero.cta, 'Continue to Today →');
  assert.match(hero.title, /decode Hebrew/i);
  assert.match(hero.copy, /Today/);
  assert.doesNotMatch(hero.copy, /XP/i);
  assert.equal(api.progressFor(done), 'Hebrew decoding is secure.');
});

test('skip marks the ladder complete and points at Today so Academy can advance', async () => {
  const [api, drills] = await Promise.all([loadIndex(), loadDrills()]);
  const storage = storageFor([], {});
  const order = api.markLadderComplete(storage, 'demo', drills);
  assert.equal(order.length, drills.bands.flatMap((b) => b.lessons).length);
  assert.equal(storage.getItem('seder-decoding-complete:demo'), '1');
  assert.deepEqual(JSON.parse(storage.getItem('seder-decoding-done:demo')), order);
  assert.ok(api.isLadderComplete(storage, 'demo', drills));
  assert.deepEqual(api.DECODE_GRAPH_SKILLS, ['fnd-decode-letters', 'fnd-decode-vowels', 'fnd-decode-blend', 'fnd-decode-word']);
  const event = api.decodeSkillEvent('fnd-decode-letters');
  assert.equal(event.skillId, 'fnd-decode-letters');
  assert.equal(event.correct, true);
  assert.equal(api.TODAY, 'daily-router.html');
  assert.equal(api.ACADEMY, 'academy.html');

  const location = { href: 'hebrew-decoding.html' };
  await api.skipDecode(storage, drills, 'demo', location);
  assert.equal(location.href, 'daily-router.html');
});

test('index still uses the decoding storage keys and fills only the quiet ladder hook', async () => {
  const [js, drills] = await Promise.all([read('decoding-index.js'), loadDrills()]);
  assert.match(js, /seder-decoding-done:/);
  assert.match(js, /seder-decoding-review:/);
  assert.match(js, /seder-decoding-complete:/);
  assert.match(js, /decoding-lesson\.html\?lesson=/);
  assert.match(js, /daily-router\.html/);
  assert.doesNotMatch(js, /review-banner/);
  assert.doesNotMatch(js, /decoding-engine/);
  assert.doesNotMatch(js, /\bXP\b/);

  const api = await loadIndex();
  const now = 1_000_000;
  const document = documentStub();
  api.render(document, drills, storageFor(['letters-1'], {}), now, 'local');
  const { nodes } = document;
  assert.equal(nodes['continue-cta'].href, 'decoding-lesson.html?lesson=letters-2');
  assert.equal(nodes['continue-cta'].textContent, 'Continue this lesson →');
  assert.equal(nodes['ladder-progress'].textContent, `1 / ${drills.bands.flatMap((b) => b.lessons).length} lessons`);
  assert.equal(nodes['skip-decode-wrap'].hidden, false);
  assert.equal(nodes['decode-academy'].hidden, true);
  assert.match(nodes.ladder.innerHTML, /BAND 0\.1/);
  assert.match(nodes.ladder.innerHTML, /decoding-lesson\.html\?lesson=letters-1/);
  assert.match(nodes.ladder.innerHTML, /dl-lesson current/);

  const order = drills.bands.flatMap((b) => b.lessons);
  api.render(document, drills, storageFor(order, {}), now, 'local');
  assert.equal(nodes['continue-cta'].href, 'daily-router.html');
  assert.equal(nodes['continue-cta'].textContent, 'Continue to Today →');
  assert.equal(nodes['skip-decode-wrap'].hidden, true);
  assert.equal(nodes['decode-academy'].hidden, false);
});
