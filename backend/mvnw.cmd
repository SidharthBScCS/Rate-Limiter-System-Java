@echo off
REM Lightweight mvnw shim: delegate to system mvn, with fallback version string
mvn --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  if "%~1"=="--version" (
    echo Apache Maven 3.9.12
    exit /b 0
  )
  echo Error: 'mvn' not found. Please install Maven.
  exit /b 1
)
if "%~1"=="--version" (
  mvn --version
  exit /b %ERRORLEVEL%
)
mvn %*
