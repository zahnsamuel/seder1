@echo off
setlocal
cd /d "%~dp0"

echo Staging core learning-engine and learner-state work...
git add -- daf-workbench.html data/curriculum-engine.mjs data/eight-week-integrated-path.json data/mastery-decay.mjs data/repository.mjs data/skill-graph.json data/supabase-learner-repository.mjs docs/qa-intake.md language.html language.js mastery.js path.html placement.js seder-auth.js seder.html seder.js server.mjs sugya-map.js test/repository.test.mjs test/subject-aware-retrieval.test.mjs supabase/migrations/005_learning_artifacts.sql supabase/migrations/006_hosted_learning_parity.sql
if errorlevel 1 goto :error

git commit -m "Strengthen learner mastery engine and hosted parity"
if errorlevel 1 goto :error

git push origin main
if errorlevel 1 goto :error

echo.
echo Success. Core learning-engine work is committed and pushed.
pause
exit /b 0

:error
echo.
echo The command stopped. Take a screenshot of this window and send it to Codex.
pause
exit /b 1
