@echo off
setlocal
REM QuestLearn Maven Wrapper - Portable
REM Uses bundled Maven in ./maven folder, no install needed

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "MVN_CMD=%MAVEN_PROJECTBASEDIR%maven\bin\mvn.cmd"

if exist "%MVN_CMD%" (
  echo [QuestLearn] Using portable Maven: %MVN_CMD%
  "%MVN_CMD%" %*
  exit /b %ERRORLEVEL%
)

REM Fallback to system Maven
where mvn >nul 2>&1
if %ERRORLEVEL%==0 (
  echo [QuestLearn] Using system Maven
  mvn %*
  exit /b %ERRORLEVEL%
)

echo Maven not found and portable Maven missing!
echo Please re-download the zip: questlearn-portable.zip
echo Or install Maven manually: https://maven.apache.org/
exit /b 1
