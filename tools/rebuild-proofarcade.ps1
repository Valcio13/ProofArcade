Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Building explorer frontend..." -ForegroundColor Cyan
Push-Location "cmd\rpc\web\explorer"
npm run build
Pop-Location

Write-Host "Running plugin tests..." -ForegroundColor Cyan
Push-Location "plugin\typescript"
npm test
Pop-Location

Write-Host "Rebuilding canopy.exe..." -ForegroundColor Cyan
go build -buildvcs=false -tags=untested_go_version -a -o .\canopy.exe .\cmd\main

Write-Host "Restarting canopy.exe..." -ForegroundColor Cyan
taskkill /IM canopy.exe /F 2>$null | Out-Null
Start-Sleep -Milliseconds 500
Start-Process -FilePath ".\canopy.exe" -ArgumentList "start"

Write-Host "ProofArcade rebuild complete." -ForegroundColor Green
