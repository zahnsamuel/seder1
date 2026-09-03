import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../source-reader.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../source-reader.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../source-reader.js", import.meta.url), "utf8");

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

test("source reader is a single-line page with no same-page collection picker", () => {
  assert.match(html, /id="jla-shell-mount"/);
  assert.match(html, /<script src="seder-auth\.js/);
  assert.match(html, /<script src="capability-state\.js"><\/script>/);
  assert.match(html, /<script src="jla-shell\.js"><\/script>/);
  assert.match(html, /<script[^>]*src="source-reader\.js"/);
  assert.doesNotMatch(html, /source-reader-language\.js/);
  assert.doesNotMatch(html, /<details[\s\S]*Other passages/);
  assert.doesNotMatch(html, /id="collection-nav"/);
  assert.doesNotMatch(html, /<select/);
  assert.doesNotMatch(html, /<textarea/);
  assert.equal(countMatches(html, /<textarea/g), 0);
  assert.doesNotMatch(html, /id="focus"/);
  assert.doesNotMatch(html, /What do you hear/);
  assert.doesNotMatch(html, /Your next step/);
  assert.match(html, /id="drill"/);
  assert.match(html, /id="hebrew"/);
  assert.match(html, /id="translation"/);
  assert.match(html, /id="toggleTranslation"/);
  assert.match(html, /id="prompt"/);
  assert.match(html, /id="choices"/);
  assert.match(html, /id="feedback"/);
  assert.match(html, /id="continue"/);
  assert.match(html, /id="continue"[^>]*\bdisabled\b/);
  assert.match(html, />Continue →</);
  assert.match(html, /id="complete"[^>]*\bhidden\b/);
  assert.match(html, /You have finished these passages/);
  assert.match(html, /id="connection"/);
  assert.match(html, /id="next-unit"/);
  assert.match(html, />Return to Today →</);
  assert.match(html, /href="daily-router\.html"/);
  assert.doesNotMatch(html, /Write one sentence/);
  assert.doesNotMatch(html, /id="reflection"/);
});

test("source reader CSS keeps one line on screen and hides the done state until the last collection", () => {
  assert.match(css, /\.line-hebrew\s*\{/);
  assert.match(css, /\.reader-source\s*\{/);
  assert.match(css, /\.reader-complete\[hidden\]/);
  assert.match(css, /\.reader-drill\[hidden\]/);
  assert.doesNotMatch(css, /\.reader-passages/);
  assert.doesNotMatch(css, /#collection-nav/);
});

test("source reader treats collections as sequential pages, not a same-page list", () => {
  assert.match(js, /location\.assign/);
  assert.match(js, /source-reader\.html\?collection=/);
  assert.match(js, /nextPageHref/);
  assert.match(js, /\/api\/curriculum\/non-gemara-source-reader/);
  assert.doesNotMatch(js, /collection-nav/);
  assert.doesNotMatch(js, /renderNav/);
  assert.doesNotMatch(js, /#focus/);
  assert.doesNotMatch(js, /querySelectorAll\("textarea"\)/);
  assert.doesNotMatch(js, /textarea/);
  assert.match(js, /Continue →/);
  assert.match(js, /Complete this passage →/);
  assert.match(js, /buildLineCheck/);
  assert.match(js, /shuffleChoices/);
  assert.match(js, /jla-choice/);
  assert.match(js, /jla-feedback/);
  assert.match(js, /#continue'\)\.disabled = true/);
  assert.match(js, /is-wrong/);
  assert.match(js, /is-correct/);
  assert.match(js, /seder-source-reader-seen-/);
  assert.match(js, /seder-source-reader-complete-/);
  assert.match(js, /source_reading_completed/);
  assert.match(js, /daily-router\.html/);
});
