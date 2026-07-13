@echo off
cd /d "%~dp0"
echo Staging the Academy live-QA rendering fix...
git add -- academy.js docs/qa-intake.md
git diff --cached --check || goto :error
git commit -m "Fix academy mastery map rendering" || goto :error
git push origin main || goto :error
echo.
echo Success. Academy QA fix is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped before completion. Copy the text above and send it to Codex.
pause
exit /b 1
