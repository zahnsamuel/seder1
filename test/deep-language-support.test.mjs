import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('deep Gemara lessons offer contextual glosses, optional transliteration, and a reading-role cue', async () => {
  const [support, css, ...pages] = await Promise.all([
    'seder-auth.js', 'deep-language-support.css',
    'pesachim-deepening.html', 'eruvin-deepening.html', 'sukkah-deepening.html', 'bava-metzia-deepening.html', 'bava-kamma-deepening.html'
  ].map((file) => readFile(file, 'utf8')));
  for (const phrase of ['enableDeepLanguageSupport', 'READING SUPPORT', 'Show focus-word transliteration', 'This line’s job:', 'English stays beside this exact excerpt', 'question signal', 'source-category distinction']) assert.match(support, new RegExp(phrase));
  assert.match(support, /deepLanguageKey/);
  for (const page of pages) {
    assert.match(page, /seder-auth\.js/);
    assert.match(page, /id="hebrew"/);
    assert.match(page, /id="translation"/);
  }
  for (const phrase of ['.deep-language-support', '.deep-gloss', 'min-height:44px']) assert.match(css, new RegExp(phrase.replace(/[.]/g, '\\$&')));
});
