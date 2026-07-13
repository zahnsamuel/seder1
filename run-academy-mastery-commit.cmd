@echo off
cd /d "%~dp0"
echo Staging Academy mastery gates and source evidence...
git add -- academy.js academy.css academy-evidence.html academy-evidence.js academy-evidence.css data/curriculum-engine.mjs test/academy-mastery-gate.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Gate academy progress on source evidence" || goto :error
git push origin main || goto :error
echo.
echo Success. Academy progress now requires earned source evidence.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
