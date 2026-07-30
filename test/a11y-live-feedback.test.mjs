import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The shared auth/enhancement script enforces a polite live region on every answer-feedback panel,
// so screen readers announce results corpus-wide (WCAG 4.1.3) without editing each content page.
// Guards against that enforcement being dropped.

test('seder-auth enforces aria-live on feedback panels, on load and on mutation', async () => {
  const auth = await readFile(new URL('../seder-auth.js', import.meta.url), 'utf8');
  assert.match(auth, /ensureLiveFeedback/);
  assert.match(auth, /#feedback, \.feedback/);
  assert.match(auth, /setAttribute\('aria-live', 'polite'\)/);
  // It runs inside enableAdaptiveRepairLinks, which fires on load (setTimeout) and via the
  // MutationObserver — so both static and dynamically-rendered feedback get covered.
  assert.match(auth, /enableAdaptiveRepairLinks = \(\) => \{\s*Seder\.ensureLiveFeedback\(\);/);
  assert.match(auth, /new MutationObserver\(Seder\.enableAdaptiveRepairLinks\)/);
});
