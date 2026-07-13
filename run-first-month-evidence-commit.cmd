@echo off
cd /d "%~dp0"
echo Staging first-month source-specific Academy evidence...
git add -- academy-evidence.js test/academy-mastery-gate.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Add source-specific first-month academy evidence" || goto :error
git push origin main || goto :error
echo.
echo Success. First-month Academy evidence is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
