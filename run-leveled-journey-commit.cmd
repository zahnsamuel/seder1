@echo off
setlocal
cd /d "%~dp0"

echo Staging the leveled canon journey...
git add -- journey.html journey.js journey.css test/journey-36-learner-ui.test.mjs
if errorlevel 1 goto :error

git commit -m "Group canon journey into earned levels"
if errorlevel 1 goto :error

git push origin main
if errorlevel 1 goto :error

echo.
echo Success. The leveled canon journey is committed and pushed.
pause
exit /b 0

:error
echo.
echo The command stopped. Take a screenshot of this window and send it to Codex.
pause
exit /b 1
