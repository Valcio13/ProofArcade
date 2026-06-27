# Windows Plugin Connection Fix - Complete Investigation and Solution

**Date**: June 27, 2026  
**Issue**: Canopy plugin system failing to start on Windows - plugin could not connect to Canopy  
**Status**: ✅ RESOLVED

---

## Problem Summary

Canopy's TypeScript plugin system was completely non-functional on Windows. The plugin process would start but could never establish a connection with Canopy's main process, resulting in continuous `ECONNREFUSED` errors.

---

## Root Cause Analysis

### The Blocking Chain

The failure was caused by a **file handle inheritance chain** that prevented the plugin control script from exiting:

1. **Canopy** calls `PluginExecute()` → `runPluginCtl()` → `cmd.CombinedOutput()`
2. **cmd.CombinedOutput()** spawns `cmd.exe` to run `pluginctl.cmd` and **blocks waiting for it to exit**
3. **pluginctl.cmd** calls PowerShell to start the Node.js plugin
4. **PowerShell** spawns Node.js with `UseShellExecute=$false`, causing Node to **inherit PowerShell's stdout/stderr handles**
5. PowerShell's stdout/stderr are **connected to cmd.exe's output pipe**
6. PowerShell exits, but **Node.js still holds the pipe handles**
7. **cmd.exe waits forever** for the pipe to close (waiting for Node to exit)
8. **Canopy blocks** at `cmd.CombinedOutput()`, never reaching `PluginConnectSync()`
9. **Plugin repeatedly tries to connect** but Canopy isn't listening yet → `ECONNREFUSED`

### Key Evidence

**Process tree during hang**:
```
canopy.exe (32188)
  └─ cmd.exe (5376) ← pluginctl.cmd STILL RUNNING
       └─ [PowerShell already exited]

node.exe (21972) ← Parent: 30828 (terminated PowerShell)
```

**Diagnostic logs proved**:
- "About to call cmd.CombinedOutput()" appeared
- "After cmd.CombinedOutput()" **never appeared** → blocking confirmed
- Plugin log showed correct environment variables but wrong network mode (whitespace issue)

---

## Solution

### 1. Process Detachment (Primary Fix)

Modified `plugin/typescript/start-plugin.ps1` to use **`UseShellExecute=$true`**:

```powershell
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "cmd.exe"
$psi.Arguments = "/c set `"CANOPY_PLUGIN_DATA_DIR=$cleanDataDir`" && ..."
$psi.UseShellExecute = $true        # ← CRITICAL: Prevents handle inheritance
$psi.CreateNoWindow = $true
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
```

**Why this works**:
- `UseShellExecute=$true` completely detaches the spawned process
- No stdin/stdout/stderr handles are inherited
- cmd.exe's output pipe closes immediately when PowerShell exits
- `cmd.CombinedOutput()` returns, allowing Canopy to proceed

### 2. Environment Variable Cleanup (Secondary Fix)

Windows batch file environment variable handling was adding **trailing whitespace**:

```
CANOPY_PLUGIN_NETWORK = tcp  ← Note the space after "tcp"
```

This caused the plugin's check `process.env.CANOPY_PLUGIN_NETWORK === 'tcp'` to fail.

**Fix**: Trim variables in PowerShell before passing to cmd.exe:
```powershell
$cleanDataDir = $PluginDataDir.Trim()
$cleanNetwork = $PluginNetwork.Trim()
$psi.Arguments = "/c set `"CANOPY_PLUGIN_DATA_DIR=$cleanDataDir`" && ..."
```

### 3. Path Handling Fix

The batch file variable `%~dp0` includes a trailing backslash, which broke PowerShell path construction:

```cmd
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash for PowerShell compatibility
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
```

---

## Files Modified

### 1. `plugin/typescript/pluginctl.cmd`
- Strip trailing backslash from `SCRIPT_DIR`
- Fixed path to PowerShell helper script (add backslash: `%SCRIPT_DIR%\start-plugin.ps1`)

### 2. `plugin/typescript/start-plugin.ps1` (New File)
- Helper script to start Node.js with proper detachment
- Uses `UseShellExecute=$true` to prevent handle inheritance
- Trims environment variables to remove whitespace
- Finds Node.js PID after startup and returns it

### 3. `controller/controller.go`
- Added diagnostic logging around `cmd.CombinedOutput()` for future debugging
- Logs: "About to call cmd.CombinedOutput()" and "After cmd.CombinedOutput()"

---

## Verification

### Success Indicators

**Canopy logs**:
```
Jun 27 11:47:34.546 INFO: About to call cmd.CombinedOutput() for plugin typescript
Jun 27 11:47:34.546 INFO: After cmd.CombinedOutput() for plugin typescript (err=<nil>, output length=145)
Jun 27 11:47:34.546 INFO: Plugin typescript started: TypeScript plugin started successfully (PID: 33216)
Jun 27 11:47:34.546 INFO: PluginExecute succeeded, calling PluginConnectSync
Jun 27 11:47:34.546 INFO: PluginConnectSync: Starting plugin connection setup, runtime.GOOS=windows
Jun 27 11:47:34.547 INFO: Plugin service listening on: 127.0.0.1:50004
Jun 27 11:47:36.506 INFO: Starting metrics server on 0.0.0.0:9090
Jun 27 11:47:37.539 INFO: Self IS a validator 👍
Jun 27 11:47:38.772 INFO: Self is a leader candidate 🗳️
Jun 27 11:47:42.651 INFO: Committed block 7c3535aa31ff5f8a6c6e at H:24424 🔒
```

**Plugin logs** (`E:\tmp\plugin\typescript-plugin.out.log`):
```
=== PLUGIN STARTUP DIAGNOSTICS ===
All CANOPY_PLUGIN_* environment variables:
  CANOPY_PLUGIN_DATA_DIR = /tmp/plugin
  CANOPY_PLUGIN_NETWORK = tcp
===================================
Starting plugin with ChainId: 1
plugin RPC server listening on 0.0.0.0:50010
Received begin request from FSM
Received end request from FSM
```

### What Was Fixed
✅ `cmd.CombinedOutput()` no longer blocks  
✅ `PluginConnectSync()` is called and listens on TCP port 50004  
✅ Plugin connects successfully via TCP (not unix socket)  
✅ Plugin receives and processes FSM requests  
✅ Canopy proceeds with full startup (P2P, RPC, consensus)  
✅ Blocks are being produced  

---

## Key Lessons

### 1. Windows Process Spawning is Complex
- **Never use `UseShellExecute=$false`** when spawning long-running background processes
- Handle inheritance is automatic and breaks parent process cleanup
- `cmd.CombinedOutput()` waits for ALL inherited handles to close, not just the direct child

### 2. Diagnostic Logging is Essential
- Add logging **before and after** blocking operations
- Check process trees to identify stuck processes
- Verify environment variable values (watch for whitespace!)

### 3. Evidence-Based Debugging
- Prove assumptions with runtime checks (PIDs, process states, file timestamps)
- Don't guess at fixes - trace execution flow with logs
- Test one change at a time to isolate the actual solution

### 4. Windows-Specific Quirks
- Batch file environment variables can include trailing whitespace
- `%~dp0` includes trailing backslash
- Path separators matter when constructing commands
- TCP mode is more reliable than Unix sockets on Windows

---

## Future Considerations

### Alternative Approaches Considered

**Option 1**: Change Canopy to use `cmd.Start()` instead of `cmd.CombinedOutput()`
- **Rejected**: Would require redesigning the plugin lifecycle
- Current design expects synchronous plugin startup

**Option 2**: Use background jobs in PowerShell to consume output
- **Rejected**: Background jobs keep PowerShell alive, preventing script exit

**Option 3**: Redirect Node output to NUL without reading
- **Rejected**: Node's output buffers fill up and it blocks/crashes

**Option 4**: Use `UseShellExecute=$true` (CHOSEN)
- **Accepted**: Complete process detachment, no handle inheritance
- Clean, simple, follows Windows best practices

### Potential Improvements

1. **Remove diagnostic logging** from production builds (or reduce verbosity)
2. **Add plugin connection timeout** with clear error message
3. **Document TCP mode requirement** for Windows in plugin documentation
4. **Consider creating a native Windows service wrapper** for production deployments

---

## References

- Canopy Plugin System: `controller/controller.go` (lines 270-360)
- Plugin Control Script: `plugin/typescript/pluginctl.cmd`
- Plugin Helper Script: `plugin/typescript/start-plugin.ps1`
- Plugin Network Mode: `plugin/typescript/src/contract/plugin.ts` (line 64)

---

## Testing Checklist for Future Changes

When modifying plugin startup code, verify:

- [ ] `cmd.CombinedOutput()` returns within 2 seconds
- [ ] Node.js process is running after script returns
- [ ] Plugin log file is created and contains startup messages
- [ ] Plugin receives TCP environment variable correctly (no whitespace)
- [ ] Plugin connects to `127.0.0.1:50004` (not unix socket)
- [ ] Canopy logs show "Plugin service listening on: 127.0.0.1:50004"
- [ ] Plugin logs show "Received begin request from FSM"
- [ ] Canopy proceeds past plugin initialization
- [ ] Consensus starts and blocks are produced

---

**Investigation Time**: ~3 hours  
**Lines Changed**: ~150 lines across 3 files  
**Complexity**: High (Windows process spawning, handle inheritance, IPC)  
**Impact**: Critical (plugin system completely non-functional → fully operational)
