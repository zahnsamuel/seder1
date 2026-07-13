@echo off
setlocal
cd /d "%~dp0"
echo Staging third-month source-specific Academy evidence...
git add -- academy-evidence.js test/academy-mastery-gate.test.mjs docs/qa-intake.md
if errorlevel 1 goto :error
git diff --cached --check
if errorlevel 1 goto :error
git commit -m "Add source-specific third-month academy evidence"
if errorlevel 1 goto :error
git push origin main
if errorlevel 1 goto :error
echo.
echo Success. Third-month Academy evidence is committed and pushed.
pause
exit /b 0

:error
echo.
echo The commit helper stopped. Nothing further was changed after the failed command.
pause
exit /b 1
