const base = (process.env.SEDER_BASE_URL || 'http://127.0.0.1:4180').replace(/\/$/, '');
const routes = [
  '/seder.html',
  '/diagnostic.html',
  '/daily.html',
  '/daily-router.html',
  '/path.html',
  '/gemara-year.html',
  '/berakhot-arc.html',
  '/daf-workbench.html?tractate=berakhot',
  '/flagship-daf-workbench.html?tractate=shabbat',
  '/api/curriculum/repair-router',
  '/api/curriculum/canon-six-session-courses'
];

let failed = false;
for (const route of routes) {
  try {
    const response = await fetch(`${base}${route}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    console.log(`PASS ${route}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${route}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
