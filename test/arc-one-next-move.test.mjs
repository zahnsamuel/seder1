import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

const SHARED_UI = ['class="jla"', 'id="jla-shell-mount"', 'jla-system.css', 'jla-shell.js', 'seder-auth.js'];
const LESSON_HOOKS = ['id="map"', 'id="mode"', 'id="bar"', 'id="count"', 'id="title"', 'id="ref"', 'id="hebrew"', 'id="translation"', 'id="translate"', 'id="prompt"', 'id="answers"', 'id="feedback"', 'id="continue"', 'id="xp"'];

test('interactive tractate and subject arcs keep one current lesson and hide the path', async () => {
  const files = (await readdir(new URL('..', import.meta.url))).filter((name) => name.endsWith('-arc.html') && name !== 'berakhot-arc.html');
  assert.equal(files.length, 44);
  for (const file of files) {
    const html = await read(file);
    for (const token of SHARED_UI) {
      assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')), `${file} missing ${token}`);
    }
    for (const hook of LESSON_HOOKS) {
      assert.match(html, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${file} missing ${hook}`);
    }
    assert.match(html, /class="jla-main"/, file);
    assert.match(html, /<details class="jla-disclose arc-path">/, file);
    assert.match(html, /<summary>See the full path<\/summary>/, file);
    assert.ok(html.indexOf('<details class="jla-disclose arc-path">') < html.indexOf('id="map"'), `${file} map should sit in details`);
    assert.doesNotMatch(html, /\sopen[\s>]/, file);
    assert.doesNotMatch(html, /class="course-layout"/, file);
    assert.match(html, /id="xp" hidden/, file);
    assert.match(html, /id="continue" class="jla-btn jla-btn-primary"/, file);
    assert.match(html, /course-engine\.js/, file);
    assert.doesNotMatch(html, /<header>/, file);
    assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i, file);
  }
});

test('Berakhot arc is one next session on the shared shell, not a wall of cards', async () => {
  const html = await read('berakhot-arc.html');
  for (const token of SHARED_UI) assert.match(html, new RegExp(token.replace(/[.?]/g, '\\$&')));
  assert.match(html, /jla-next-action\.css/);
  assert.match(html, /<p class="jla-eyebrow jla-na-eyebrow">BERAKHOT<\/p>/);
  assert.equal((html.match(/id="arc-cta"/g) || []).length, 1);
  assert.match(html, /class="jla-next-action__cta"/);
  assert.match(html, /<details class="jla-disclose arc-path">/);
  assert.match(html, /<summary>See the full path<\/summary>/);
  assert.ok(html.indexOf('<details class="jla-disclose arc-path">') < html.indexOf('id="sessions"'));
  assert.doesNotMatch(html, /\sopen[\s>]/);
  assert.match(html, /id="xp" hidden/);
  assert.match(html, /id="completed" hidden/);
  assert.match(html, /id="evidence" hidden/);
  assert.doesNotMatch(html, /<header>/);
  assert.doesNotMatch(html, /arc-shell/);
  assert.doesNotMatch(html, /chatbot|ChatGPT|ask the assistant/i);
});

test('Berakhot picker prefers the first undone session and keeps the ten-step path', async () => {
  const src = await read('berakhot-arc.js');
  const api = {};
  new Function('window', src)(api);
  const { sessionState, heroFor, sessionsHtml, arc } = api.SederBerakhotArc;
  assert.equal(arc.length, 10);

  const start = sessionState([]);
  const startHero = heroFor(start);
  assert.equal(start.doneCount, 0);
  assert.equal(start.current.stage, 'read-language');
  assert.equal(startHero.cta, 'Begin the first session →');
  assert.equal(startHero.href, 'language.html');
  assert.match(startHero.title, /opening of Shas/);

  const mid = sessionState(['read-language', 'berakhot-2a-depth']);
  const midHero = heroFor(mid);
  assert.equal(mid.current.stage, 'berakhot-2b-proof');
  assert.equal(midHero.cta, 'Continue this session →');
  assert.equal(midHero.href, 'berakhot-unit-2.html');

  const done = sessionState(arc.map((item) => item.stage));
  const doneHero = heroFor(done);
  assert.equal(done.complete, true);
  assert.equal(doneHero.href, 'shas-map-v2.html');
  assert.match(sessionsHtml(mid), /READY NOW/);
  assert.match(sessionsHtml(mid), /berakhot-unit-2\.html/);
});

test('shared disclose and next-action card are reusable jla-system primitives', async () => {
  const [system, next] = await Promise.all(['jla-system.css', 'jla-next-action.css'].map(read));
  assert.match(system, /\.jla-disclose\s*\{/);
  assert.match(system, /\.jla-progress\s*\{/);
  assert.match(next, /\.jla-next-action,/);
  assert.match(next, /min-height:\s*44px/);
});

test('course-engine keeps scoring hooks and presents the path as a disclosure', async () => {
  const js = await read('course-engine.js');
  for (const hook of ['#map', '#count', '#bar', '#mode', '#title', '#prompt', '#answers', '#feedback', '#continue', '#xp', '.lesson']) {
    assert.match(js, new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), hook);
  }
  assert.match(js, /ensurePathDisclosure/);
  assert.match(js, /See the full path/);
  assert.match(js, /className='jla-choice'/);
  assert.match(js, /is-correct/);
  assert.match(js, /jla-btn jla-btn-primary/);
  assert.match(js, /#xp'\)\.textContent=`\$\{xp\} XP`/);
  assert.doesNotMatch(js, /\+10 XP/);
  assert.doesNotMatch(js, /\+5 XP/);
  assert.match(js, /seder-course-progress:\$\{courseLearner\}:\$\{config\.stage\}/);
  assert.match(js, /if\(step\.typed\)\{renderTyped/);
});
