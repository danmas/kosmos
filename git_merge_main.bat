@echo off
setlocal

set "PROJECT_NAME=%~1"

if not defined PROJECT_NAME (
    echo ERROR: Project name not provided.
    echo Usage: %~nx0 ^<project_name^>
    exit /b 1
)

echo Stopping %PROJECT_NAME%...
REM pm2 stop %PROJECT_NAME% || (echo ERROR: Failed to stop %PROJECT_NAME%. & exit /b 1)

echo Committing temporary changes...
git commit -am "tmp_fix"

echo Switching to main branch...
git checkout main || (echo ERROR: Failed to switch to main branch. & exit /b 1)

echo Merging dev into main...
git merge dev || (echo ERROR: Failed to merge dev into main. & exit /b 1)

echo Pushing main branch...
git push || (echo ERROR: Failed to push main branch. & exit /b 1)

echo Switching back to dev branch...
git checkout dev || (echo ERROR: Failed to switch back to dev branch. & exit /b 1)

echo Pushing dev branch...
git push || (echo ERROR: Failed to push dev branch. & exit /b 1)

echo Restarting %PROJECT_NAME%...
REM pm2 restart %PROJECT_NAME% || (echo ERROR: Failed to restart %PROJECT_NAME%. & exit /b 1)

echo.
echo Script finished successfully.
endlocal
