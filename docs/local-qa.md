# Seder local QA

This is the repeatable learner-flow check for the local presentation build. It
does not require Supabase credentials and does not change learner data.

## Start the server (PowerShell)

From the Seder project directory:

```powershell
$node = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $node server.mjs
```

Leave that window running. If the server reports `EADDRINUSE`, it is already
running on port 4180; use the existing process and continue with the checks.

## Run the checks

Open a second PowerShell window in the project directory:

```powershell
$node = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $node --test test/*.test.mjs
& $node scripts/audit-content.mjs
& $node scripts/smoke-http.mjs
```

The test suite should report zero failures, the content audit should report
the current unit count and score distribution, and the HTTP smoke check should
print `PASS` for each learner entry, daily route, Gemara year, Daf workspace,
and curriculum API route.

The smoke script accepts a deployed or alternate local server:

```powershell
$env:SEDER_BASE_URL = "https://your-host.example"
& $node scripts/smoke-http.mjs
Remove-Item Env:SEDER_BASE_URL
```

## Browser walkthrough

After the checks pass, open `http://127.0.0.1:4180/seder.html` and verify the
fresh-learner path: landing page → placement → daily move → first Gemara arc →
source/Daf workspace → completion handoff. Use `http://127.0.0.1:4180/profile.html`
to verify that a returning learner resumes at the next move.

Record any failure in `docs/qa-intake.md` with the route, browser, and commit
hash so Codex and Claude can reproduce it.
