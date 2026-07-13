@echo off
cd /d "%~dp0"
echo Staging adaptive level retrieval and advanced checkpoint work...
git add -- phase-checkpoint.js level-complete.html level-complete.js level-review.html level-review.js level-review.css test/level-completion.test.mjs test/level-retrieval.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Add adaptive level retrieval practice" || goto :error
git push origin main || goto :error
echo.
echo Success. Adaptive level retrieval is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
