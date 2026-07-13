@echo off
setlocal
cd /d "%~dp0"

echo Staging the tractate-mastery migration...
git add -- tractate-mastery.js gemara-continuation.js shabbat-arc.js pesachim-arc.js course-engine.js test/tractate-mastery-cutover.test.mjs tractate-mastery.html mastery-loop.html mastery-loop.js tractate-capstone.html berakhot-mastery.html berakhot-mastery.js bava-kamma-deepening.html bava-kamma-deepening.js bava-metzia-deepening.html bava-metzia-deepening.js cross-tractate.html eruvin-deepening.html eruvin-deepening.js eruvin-diagnostic.html eruvin-diagnostic.js pesachim-deepening.html pesachim-deepening.js pesachim-diagnostic.html pesachim-diagnostic.js sukkah-deepening.html sukkah-deepening.js yoma-arc.html yoma-arc.js yoma-daf-workbench.css yoma-daf-workbench.html yoma-daf-workbench.js data/bava-metzia-source-review.json data/berakhot-practice-lab.json data/canon-mastery-arcs.json data/eruvin-source-review.json data/pesachim-source-review.json data/sukkah-source-review.json data/tractate-block-template.json data/yoma-source-review.json docs/berakhot-foundation-block.md docs/flagship-tractate-blocks.md test/adaptive-mastery-loop.test.mjs test/bava-metzia-production-block.test.mjs test/berakhot-lab.test.mjs test/berakhot-mastery.test.mjs test/canon-mastery-sequences.test.mjs test/eruvin-production-block.test.mjs test/flagship-tractate-blocks.test.mjs test/pesachim-production-block.test.mjs test/sukkah-production-block.test.mjs test/tractate-block-template.test.mjs test/tractate-capstone.test.mjs test/tractate-mastery.test.mjs test/yoma-daf-workbench.test.mjs test/yoma-production-block.test.mjs
if errorlevel 1 goto :error

git commit -m "Complete tractate mastery migration"
if errorlevel 1 goto :error

git push origin main
if errorlevel 1 goto :error

echo.
echo Success. The tractate-mastery migration is committed and pushed.
pause
exit /b 0

:error
echo.
echo The command stopped. Take a screenshot of this window and send it to Codex.
pause
exit /b 1
