@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash for PowerShell compatibility
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "NODE_SCRIPT=%SCRIPT_DIR%\dist\main.js"
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

REM Start Node.js using the PowerShell helper script
for /f "usebackq" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\start-plugin.ps1" -NodeScript "%NODE_SCRIPT%" -WorkDir "%SCRIPT_DIR%" -LogFile "%LOG_FILE%" -ErrFile "%ERR_FILE%" -PidFile "%PID_FILE%" -PluginDataDir "%PLUGIN_DIR%" -PluginNetwork "%CANOPY_PLUGIN_NETWORK%"`) do set "PID=%%p"

if "%PID%"=="" (
  echo Error: TypeScript plugin failed to start
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
