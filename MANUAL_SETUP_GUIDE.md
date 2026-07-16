# Manual Setup Guide - Admin Pool Transfer

## Overview

This guide walks you through the manual setup steps needed to enable admin pool transfers. Follow these steps in order.

---

## Step 1: Generate Admin Key

### On Your Development Machine (Now)

Run this command from the `canopy-main` directory:

```cmd
go run generate-admin-key.go %USERPROFILE%\.canopy
```

**Output will look like**:
```
=== Admin Key Generated Successfully ===
Key file: C:\Users\YourName\.canopy\admin.key
Address (hex): a1b2c3d4e5f6789...

Use this address in your plugin config:
"proofArcadeAdmin": "a1b2c3d4e5f6789..."
```

**Important**: 
- Copy the hex address shown - you'll need it for Step 2
- Save the key file securely - you'll need to copy it to the server

---

## Step 2: Create Plugin Config

Create a file: `plugin/typescript/plugin_config.json`

```json
{
  "ChainId": 1,
  "proofArcadeAdmin": "PASTE_YOUR_ADMIN_ADDRESS_FROM_STEP_1"
}
```

**Replace** `PASTE_YOUR_ADMIN_ADDRESS_FROM_STEP_1` with the actual hex address from Step 1.

**Example**:
```json
{
  "ChainId": 1,
  "proofArcadeAdmin": "a1b2c3d4e5f6789abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

---

## Step 3: Build TypeScript Plugin

```cmd
cd plugin\typescript
npm run build
cd ..\..
```

This compiles the TypeScript plugin with your admin configuration.

---

## Step 4: Build Go Backend

```cmd
go build -o canopy.exe cmd\main\main.go
```

This builds the backend with the admin key loading code.

---

## Step 5: Test Locally (Optional but Recommended)

### Start Backend
```cmd
set CANOPY_PLUGIN_CONFIG_PATH=%CD%\plugin\typescript\plugin_config.json
canopy.exe start
```

**Look for this log line**:
```
[ProofArcade] Admin address configured: a1b2c3d4e5f6...
```

If you see `WARNING: No admin address configured`, the plugin config wasn't loaded.

### Start Frontend (in another terminal)
```cmd
cd cmd\rpc\web\explorer
npm run dev
```

### Test Pool Transfer
1. Go to http://localhost:5173/admin/pool
2. Try a small transfer (e.g., 1000000 from Pool 3 to Pool 4)
3. Check logs for "Block X with 1 txs" (not "0 txs")
4. Verify balances change

---

## Step 6: Deployment Setup

When you deploy to your server, you need to:

### 6.1: Copy Admin Key to Server

Copy the `admin.key` file to the server's Canopy data directory.

**On your local machine**:
```cmd
# Find your admin key
dir %USERPROFILE%\.canopy\admin.key
```

**On the server** (via SSH or your deployment method):
```bash
# Create canopy directory if needed
mkdir -p ~/.canopy

# Copy the key (you'll need to transfer this file securely)
# The key should be at: ~/.canopy/admin.key
```

**Security**: Transfer this key securely (SCP, secure file transfer, encrypted). Never expose it.

### 6.2: Copy Plugin Config to Server

Copy `plugin/typescript/plugin_config.json` to your server.

The file should be in the deployed `plugin/typescript/` directory.

### 6.3: Set Environment Variable on Server

Add this to your server's startup script or environment:

```bash
export CANOPY_PLUGIN_CONFIG_PATH=/path/to/your/plugin/typescript/plugin_config.json
```

Or in your systemd service file (if using systemd):
```ini
[Service]
Environment="CANOPY_PLUGIN_CONFIG_PATH=/opt/canopy/plugin/typescript/plugin_config.json"
```

### 6.4: Deploy Built Files

Copy these built files to your server:
- `canopy.exe` (or `canopy` on Linux) - the backend binary
- `plugin/typescript/dist/` - the built plugin
- `plugin/typescript/plugin_config.json` - the config
- `~/.canopy/admin.key` - the admin private key

---

## Verification Checklist

### ✅ On Server After Deployment

1. **Admin key exists**:
   ```bash
   ls -la ~/.canopy/admin.key
   # Should show file with restricted permissions
   ```

2. **Plugin config exists**:
   ```bash
   cat /path/to/plugin/typescript/plugin_config.json
   # Should show your admin address
   ```

3. **Environment variable set**:
   ```bash
   echo $CANOPY_PLUGIN_CONFIG_PATH
   # Should show path to plugin_config.json
   ```

4. **Backend starts and loads admin**:
   ```bash
   # Check backend logs for:
   [ProofArcade] Admin address configured: a1b2c3d4e5f6...
   ```

5. **Admin UI accessible**:
   - Visit your-domain.com/admin/pool
   - Pool management interface loads

---

## Quick Reference - File Locations

### Development (Local)
```
%USERPROFILE%\.canopy\admin.key              # Admin private key
plugin\typescript\plugin_config.json         # Plugin config
plugin\typescript\dist\                      # Built plugin
canopy.exe                                   # Backend binary
```

### Production (Server)
```
~/.canopy/admin.key                          # Admin private key
/opt/canopy/plugin/typescript/plugin_config.json  # Plugin config (adjust path)
/opt/canopy/plugin/typescript/dist/          # Built plugin (adjust path)
/opt/canopy/canopy                           # Backend binary (adjust path)
```

---

## Troubleshooting

### "Admin address not configured" in logs

**Problem**: Plugin config not loaded

**Solutions**:
1. Verify `plugin_config.json` exists at the correct path
2. Check `CANOPY_PLUGIN_CONFIG_PATH` environment variable is set
3. Restart backend after setting environment variable
4. Check JSON syntax in config file

### "Failed to load admin key"

**Problem**: Admin key file not found

**Solutions**:
1. Verify `admin.key` exists at `~/.canopy/admin.key`
2. Check file permissions: `chmod 600 ~/.canopy/admin.key` (Linux/Mac)
3. Regenerate key if needed: `go run generate-admin-key.go ~/.canopy`

### Transactions not included in blocks ("0 txs")

**Problem**: Authorization failing (address mismatch)

**Solutions**:
1. Verify admin address in config matches the key file
2. Regenerate admin key and update config
3. Rebuild plugin: `cd plugin/typescript && npm run build`
4. Restart backend

### Pool balances not changing

**Problem**: DeliverTx failing or not executing

**Solutions**:
1. Check if transactions are in blocks (must show "1 txs")
2. Check plugin logs for "Pool transfer completed successfully"
3. Verify source pool has sufficient balance
4. Check for errors in DeliverTx logs

---

## Security Notes

### Admin Key Protection

⚠️ **CRITICAL**: The admin key controls ALL admin operations

**Best Practices**:
- Store with permissions 0600 (read/write owner only)
- Never commit to version control
- Transfer securely to server (encrypted transfer)
- Back up securely (encrypted backup)
- Limit access to authorized personnel only
- Consider hardware security module (HSM) for production

### Key Backup Procedure

1. **Encrypt the key**:
   ```bash
   # Example using GPG
   gpg -c ~/.canopy/admin.key
   # Creates: admin.key.gpg (encrypted)
   ```

2. **Store encrypted backup** in secure location:
   - Encrypted cloud storage
   - Hardware security key
   - Secure offline storage

3. **Document recovery procedure**:
   - Who has access to backup
   - How to decrypt and restore
   - When to use backup vs. generate new key

---

## Deployment Checklist

### Pre-Deployment (On Dev Machine)
- [ ] Admin key generated
- [ ] Admin address recorded
- [ ] Plugin config created with correct address
- [ ] TypeScript plugin built
- [ ] Go backend built
- [ ] Tested locally (optional but recommended)

### Deployment
- [ ] Admin key copied to server securely
- [ ] Plugin config copied to server
- [ ] Built files copied to server
- [ ] Environment variable set on server
- [ ] File permissions set correctly (0600 for admin.key)

### Post-Deployment (On Server)
- [ ] Backend starts without errors
- [ ] Log shows "Admin address configured"
- [ ] No "WARNING: No admin address configured"
- [ ] Admin UI accessible
- [ ] Test pool transfer works
- [ ] Verify balances change

### Production Hardening
- [ ] Admin key backed up securely
- [ ] Access to key restricted
- [ ] Monitoring and alerting set up
- [ ] Incident response plan documented
- [ ] Key rotation schedule defined

---

## Summary: What Gets Deployed

### Files to Deploy:
1. **Backend Binary**: `canopy.exe` or `canopy`
2. **Plugin Files**: Everything in `plugin/typescript/dist/`
3. **Plugin Config**: `plugin/typescript/plugin_config.json`
4. **Admin Key**: `admin.key` → Copy to server's `~/.canopy/`

### Configuration to Set:
1. **Environment Variable**: `CANOPY_PLUGIN_CONFIG_PATH`
2. **File Permissions**: `chmod 600 ~/.canopy/admin.key` (Linux/Mac)

### What to Verify:
1. Backend log shows "Admin address configured"
2. Pool transfers work via admin UI
3. Transactions show "1 txs" in blocks
4. Balances update correctly

---

## Need Help?

Check these documents:
- **Complete Guide**: `ADMIN_POOL_TRANSFER_IMPLEMENTATION.md`
- **Quick Start**: `ADMIN_POOL_TRANSFER_COMPLETE.md`
- **Flow Diagram**: `ADMIN_AUTHORIZATION_FLOW.md`
- **Test Template**: `ADMIN_POOL_TRANSFER_TEST_RESULTS.md`

Good luck with deployment! 🚀
