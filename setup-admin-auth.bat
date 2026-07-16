@echo off
REM Admin Pool Transfer Setup Script for Windows

echo ==========================================
echo Admin Pool Transfer Setup
echo ==========================================
echo.

if "%1"=="" (
    echo Usage: setup-admin-auth.bat ^<data-directory^>
    echo Example: setup-admin-auth.bat %USERPROFILE%\.canopy
    exit /b 1
)

set DATA_DIR=%1
echo Data Directory: %DATA_DIR%
echo.

REM Step 1: Generate admin key
echo Step 1: Generating admin key...
if exist "%DATA_DIR%\admin.key" (
    echo   Admin key already exists. Loading existing key...
)

go run generate-admin-key.go "%DATA_DIR%" > admin-key-output.txt
type admin-key-output.txt
echo.

REM Extract admin address from output (this is simplified - manual extraction may be needed)
for /f "tokens=2 delims=:" %%a in ('findstr /C:"Address (hex):" admin-key-output.txt') do set ADMIN_ADDRESS=%%a
set ADMIN_ADDRESS=%ADMIN_ADDRESS: =%
echo Admin Address: %ADMIN_ADDRESS%
echo.

REM Step 2: Create plugin config
echo Step 2: Creating plugin config...
set PLUGIN_CONFIG=plugin\typescript\plugin_config.json

if exist "%PLUGIN_CONFIG%" (
    echo   Plugin config already exists. Please manually update it.
    echo   Set: "proofArcadeAdmin": "%ADMIN_ADDRESS%"
) else (
    echo   Creating new plugin config...
    (
        echo {
        echo   "ChainId": 1,
        echo   "proofArcadeAdmin": "%ADMIN_ADDRESS%"
        echo }
    ) > "%PLUGIN_CONFIG%"
)

echo   Plugin config: %PLUGIN_CONFIG%
echo.

REM Step 3: Set environment variable
echo Step 3: Setting environment variable...
set CANOPY_PLUGIN_CONFIG_PATH=%CD%\%PLUGIN_CONFIG%
echo   Set CANOPY_PLUGIN_CONFIG_PATH=%CANOPY_PLUGIN_CONFIG_PATH%
echo   Note: Set this permanently in System Properties if needed
echo.

REM Step 4: Build TypeScript plugin
echo Step 4: Building TypeScript plugin...
cd plugin\typescript
call npm run build
cd ..\..
echo   TypeScript plugin built successfully
echo.

REM Step 5: Build Go backend
echo Step 5: Building Go backend...
go build -o canopy.exe cmd\main\main.go
echo   Go backend built successfully
echo.

REM Summary
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Admin Address: %ADMIN_ADDRESS%
echo Admin Key: %DATA_DIR%\admin.key
echo Plugin Config: %PLUGIN_CONFIG%
echo.
echo Next Steps:
echo 1. Start the backend: canopy.exe start
echo 2. Check logs for: [ProofArcade] Admin address configured: %ADMIN_ADDRESS%
echo 3. Start the frontend: cd cmd\rpc\web\explorer ^&^& npm run dev
echo 4. Navigate to: http://localhost:5173/admin/pool
echo 5. Test a pool transfer
echo.
echo Troubleshooting:
echo - If admin address not configured, check CANOPY_PLUGIN_CONFIG_PATH
echo - If transactions not in blocks, verify admin address matches key
echo - See ADMIN_POOL_TRANSFER_IMPLEMENTATION.md for full guide
echo.

REM Clean up temp file
del admin-key-output.txt

pause
