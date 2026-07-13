import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('landing page sends returning learners to the daily router',async()=>{const js=await readFile(new URL('../seder.js',import.meta.url),'utf8');assert.match(js,/daily-router\.html/);});
