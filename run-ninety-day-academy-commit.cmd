@echo off
cd /d "%~dp0"
echo Staging the 90-day learner Academy...
git add -- academy.html academy.js academy.css test/academy.test.mjs docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Extend academy to a 90-day learning path" || goto :error
git push origin main || goto :error
echo.
echo Success. The 90-day Academy is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
