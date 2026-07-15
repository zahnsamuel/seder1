import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');

test('Seder can bind to a hosted web-service interface and declares a demo health check', async () => {
  const [server, render, guide] = await Promise.all([read('server.mjs'), read('render.yaml'), read('docs/friday-demo-deploy.md')]);
  assert.match(server, /listen\(port, '0\.0\.0\.0'/);
  assert.match(render, /runtime: docker/);
  assert.match(render, /healthCheckPath: \/api\/health/);
  assert.match(guide, /not a learner pilot/);
  assert.match(guide, /Supabase/);
});
