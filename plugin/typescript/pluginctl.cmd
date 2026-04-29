@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "NODE_SCRIPT=%SCRIPT_DIR%dist\main.js"
set "PLUGIN_DIR=%CANOPY_PLUGIN_DATA_DIR%"
if "%PLUGIN_DIR%"=="" set "PLUGIN_DIR=%TEMP%\canopy-plugin"
set "PID_FILE=%PLUGIN_DIR%\typescript-plugin.pid"
set "LOG_FILE=%PLUGIN_DIR%\typescript-plugin.out.log"
set "ERR_FILE=%PLUGIN_DIR%\typescript-plugin.err.log"

if /I "%~1"=="start" goto start
if /I "%~1"=="stop" goto stop
if /I "%~1"=="status" goto status
if /I "%~1"=="restart" goto restart
echo Usage: %~nx0 ^<start^|stop^|status^|restart^>
exit /b 1

:ensureDir
if not exist "%PLUGIN_DIR%" mkdir "%PLUGIN_DIR%" >nul 2>nul
exit /b 0

:start
call :ensureDir
if not exist "%NODE_SCRIPT%" (
  echo Error: Node.js script not found at %NODE_SCRIPT%
  echo Run "npm run build" in plugin\typescript first.
  exit /b 1
)

if exist "%PID_FILE%" (
  for /f "usebackq delims=" %%p in ("%PID_FILE%") do set "PID=%%p"
  if not "%PID%"=="" (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-Process -Id %PID% -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
    if not errorlevel 1 (
      echo TypeScript plugin is already running ^(PID: %PID%^)
      exit /b 0
    )
  )
  del /f /q "%PID_FILE%" >nul 2>nul
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$env:CANOPY_PLUGIN_DATA_DIR='%PLUGIN_DIR%'; $p = Start-Process -FilePath node -ArgumentList @('%NODE_SCRIPT%') -WorkingDirectory '%SCRIPT_DIR%' -RedirectStandardOutput '%LOG_FILE%' -RedirectStandardError '%ERR_FILE%' -WindowStyle Hidden -PassThru; Set-Content -Path '%PID_FILE%' -Value $p.Id"
if not exist "%PID_FILE%" (
  echo Error: TypeScript plugin failed to start
  exit /b 1
)
set /p PID=<"%PID_FILE%"
if "%PID%"=="" (
  echo Error: TypeScript plugin failed to start
  del /f /q "%PID_FILE%" >nul 2>nul
  exit /b 1
)
echo TypeScript plugin started successfully ^(PID: %PID%^)
echo Log files: %LOG_FILE% and %ERR_FILE%
exit /b 0

:stop
if not exist "%PID_FILE%" (
  echo TypeScript plugin is not running
  exit /b 0
)
for /f "usebackq delims=" %%p in ("%PID_FILE%") do set "PID=%%p"
if "%PID%"=="" (
  del /f /q "%PID_FILE%" >nul 2>nul
  echo TypeScript plugin is not running
  exit /b 0
)
taskkill /PID %PID% /T /F >nul 2>nul
del /f /q "%PID_FILE%" >nul 2>nul
echo TypeScript plugin stopped
exit /b 0

:status
if not exist "%PID_FILE%" (
  echo TypeScript plugin is not running
  exit /b 3
)
for /f "usebackq delims=" %%p in ("%PID_FILE%") do set "PID=%%p"
if "%PID%"=="" (
  del /f /q "%PID_FILE%" >nul 2>nul
  echo TypeScript plugin is not running
  exit /b 3
)
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-Process -Id %PID% -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
if errorlevel 1 (
  del /f /q "%PID_FILE%" >nul 2>nul
  echo TypeScript plugin is not running
  exit /b 3
)
echo TypeScript plugin is running ^(PID: %PID%^)
exit /b 0

:restart
call :stop
call :start
exit /b %ERRORLEVEL%
