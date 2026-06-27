# PowerShell script to start the TypeScript plugin with proper environment variable handling
param(
    [string]$NodeScript,
    [string]$WorkDir,
    [string]$LogFile,
    [string]$ErrFile,
    [string]$PidFile,
    [string]$PluginDataDir,
    [string]$PluginNetwork
)

# Debug: Log parameters
Write-Host "DEBUG: NodeScript=$NodeScript"
Write-Host "DEBUG: WorkDir=$WorkDir"
Write-Host "DEBUG: PluginDataDir=$PluginDataDir"
Write-Host "DEBUG: PluginNetwork=$PluginNetwork"

# Trim trailing backslash from WorkDir if present
$WorkDir = $WorkDir.TrimEnd('\')
Write-Host "DEBUG: WorkDir (after trim)=$WorkDir"

# Validate paths
if (-not (Test-Path $WorkDir)) {
    Write-Error "WorkDir does not exist: $WorkDir"
    exit 1
}

if (-not (Test-Path $NodeScript)) {
    Write-Error "NodeScript does not exist: $NodeScript"
    exit 1
}

# Use UseShellExecute=true for complete process detachment
# This is the ONLY way to prevent handle inheritance on Windows
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
# Ensure no trailing spaces in environment variables
$cleanDataDir = $PluginDataDir.Trim()
$cleanNetwork = $PluginNetwork.Trim()
$psi.Arguments = "/c set `"CANOPY_PLUGIN_DATA_DIR=$cleanDataDir`" && set `"CANOPY_PLUGIN_NETWORK=$cleanNetwork`" && cd /d `"$WorkDir`" && node `"$NodeScript`" >`"$LogFile`" 2>`"$ErrFile`""
$psi.UseShellExecute = $true
$psi.CreateNoWindow = $true
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

# Start the detached process
$p = [System.Diagnostics.Process]::Start($psi)

# Wait briefly for the chain to spawn node
Start-Sleep -Milliseconds 300

# Find the node process that was just started
$nodePid = Get-Process -Name node -ErrorAction SilentlyContinue | 
    Where-Object { $_.StartTime -gt (Get-Date).AddSeconds(-2) } | 
    Select-Object -First 1 -ExpandProperty Id

if ($nodePid) {
    # Write PID to file
    [System.IO.File]::WriteAllText($PidFile, $nodePid.ToString())
    # Output the PID
    Write-Host $nodePid
} else {
    Write-Error "Failed to find started Node process"
    exit 1
}
