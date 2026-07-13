@echo off
setlocal
cd /d "%~dp0"

echo Staging the First Month Academy...
git add -- academy.html academy.js academy.css seder.js test/academy.test.mjs
if errorlevel 1 goto :error

git commit -m "Build guided first-month academy path"
if errorlevel 1 goto :error

git push origin main
if errorlevel 1 goto :error

echo.
echo Success. The First Month Academy is committed and pushed.
pause
exit /b 0

:error
echo.
echo The command stopped. Take a screenshot of this window and send it to Codex.
pause
exit /b 1
