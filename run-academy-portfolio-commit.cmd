@echo off
cd /d "%~dp0"
echo Staging Academy source maps and learner portfolio work...
git add -- academy-evidence.html academy-evidence.js academy-evidence.css data/curriculum-engine.mjs study-record.js test/academy-mastery-gate.test.mjs test/study-record.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Add academy source maps to learner portfolio" || goto :error
git push origin main || goto :error
echo.
echo Success. Academy source maps and portfolio evidence are committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
