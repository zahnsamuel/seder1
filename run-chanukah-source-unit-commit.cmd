@echo off
setlocal
cd /d "%~dp0"

echo Staging the Chanukah source unit and its learner routes...
git add -- subject.js daily-router.js halakha-chanukah.html halakha-chanukah.js test/daily-deepening.test.mjs test/halakha-chanukah.test.mjs
if errorlevel 1 goto :error

git commit -m "Add Chanukah machloket learning unit"
if errorlevel 1 goto :error

git push origin main
if errorlevel 1 goto :error

echo.
echo Success. The Chanukah source unit is committed and pushed.
pause
exit /b 0

:error
echo.
echo The command stopped. Take a screenshot of this window and send it to Codex.
pause
exit /b 1
