@echo off
cd /d "%~dp0"
echo Staging the earned-level completion handoff...
git add -- phase-checkpoint.js level-complete.html level-complete.js level-complete.css test/level-completion.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Add earned level completion handoffs" || goto :error
git push origin main || goto :error
echo.
echo Success. The level completion experience is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
