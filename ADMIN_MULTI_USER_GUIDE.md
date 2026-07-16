# Multi-Admin Configuration Guide

## Overview
By default, only the validator address can access the admin panel. You can add additional admin users by creating an `admin_config.json` file.

**✨ Hot-Reload Support:** Changes to `admin_config.json` take effect immediately - no backend restart required!

## Quick Start

### 1. Create Configuration File
Create a file named `admin_config.json` in your data directory (same location as `validator_key.json`):

```json
{
  "enabled": true,
  "admin_addresses": [
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  ]
}
```

### 2. Get User's Wallet Address
Ask the user to:
1. Connect their wallet on the `/auth` page
2. Copy their wallet address from the Auth page or Profile page

### 3. Add Address to Config
Add the user's wallet address to the `admin_addresses` array in `admin_config.json`

### 4. Changes Take Effect Immediately!
No restart needed! The backend reads the config file fresh on every admin request.

```bash
# Just save the file - that's it!
# Changes are picked up automatically
```

The new admin can now access the admin panel!

## Configuration Format

### admin_config.json Structure
```json
{
  "enabled": true,              // Set to false to disable config file admins
  "admin_addresses": [           // Array of authorized admin wallet addresses
    "0xaddress1...",
    "0xaddress2...",
    "address3..."               // Can be with or without 0x prefix
  ]
}
```

### Important Notes:
- **enabled**: Must be `true` for config file admins to work
- **admin_addresses**: Array of wallet addresses
- Addresses can be uppercase or lowercase
- Addresses can have `0x` prefix or not (both work)
- The validator address is ALWAYS an admin (doesn't need to be in config)
- Duplicate addresses are automatically removed

## File Location

The `admin_config.json` file should be in your node's data directory:

### Default Locations:
- **Linux**: `~/.canopy/admin_config.json`
- **macOS**: `~/Library/Application Support/canopy/admin_config.json`
- **Windows**: `%APPDATA%\canopy\admin_config.json`

### Custom Data Directory:
If you specified a custom data directory with the `--data-dir` flag, place the file there:
```
<your-data-dir>/admin_config.json
```

## Example Configurations

### Single Additional Admin
```json
{
  "enabled": true,
  "admin_addresses": [
    "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  ]
}
```

### Multiple Admins
```json
{
  "enabled": true,
  "admin_addresses": [
    "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2"
  ]
}
```

### Disabled (Validator Only)
```json
{
  "enabled": false,
  "admin_addresses": []
}
```

## Security Considerations

### Best Practices:
1. **Limited Access**: Only give admin access to trusted team members
2. **Regular Audits**: Periodically review who has admin access
3. **Removal Process**: Remove admin addresses when team members leave
4. **Backup Config**: Keep a backup of your config file
5. **File Permissions**: Restrict file permissions on `admin_config.json`

### Permission Settings:
```bash
# Linux/macOS - restrict to owner only
chmod 600 admin_config.json
```

### Trust Model:
- **Validator**: Has ultimate authority, can perform any admin operation
- **Config Admins**: Same access level as validator for admin panel
- **Regular Users**: No admin access, cannot see admin panel

## Adding a New Admin (Step-by-Step)

### Step 1: Get Their Address
Have the user:
1. Go to https://your-proofarcade-instance.com/auth
2. Connect their wallet (MetaMask, WalletConnect, etc.)
3. Copy their wallet address displayed on the page

### Step 2: Update Config File
1. Open `admin_config.json` in your data directory
2. If file doesn't exist, create it with the structure above
3. Add the new address to the `admin_addresses` array:

```json
{
  "enabled": true,
  "admin_addresses": [
    "0xexisting-address-1...",
    "0xexisting-address-2...",
    "0xNEW-USER-ADDRESS..."    // ← Add here
  ]
}
```

### Step 3: Save the File - Done!
No restart needed! Changes take effect immediately.

The backend reads `admin_config.json` fresh on every request, so your changes are picked up automatically.

### Step 4: Verify Access
Have the user:
1. Go to `/admin/login`
2. Check that their address shows "Admin ✓" badge
3. Click "Access Admin Dashboard"
4. Verify they can access admin functions

## Removing Admin Access

### Method 1: Remove from Config
1. Open `admin_config.json`
2. Remove the user's address from the array
3. Save the file - access is revoked immediately (no restart needed)

### Method 2: Disable All Config Admins
```json
{
  "enabled": false,
  "admin_addresses": []
}
```

This immediately disables all config file admins (validator still has access). No restart needed.

## Troubleshooting

### User Can't Login
**Problem**: User sees "Not Authorized" badge

**Solutions**:
1. Verify address in config file matches exactly
2. Check that `enabled: true` in config
3. Save the file (no restart needed - changes are automatic)
4. Check address format (with/without 0x prefix)
5. Verify user is connected with the correct wallet
6. Try refreshing the `/admin/login` page to fetch latest config

### Config Not Loading
**Problem**: Config file exists but admins can't access

**Solutions**:
1. Check file location is correct (in data directory)
2. Verify JSON format is valid (use a JSON validator)
3. Check file permissions (readable by canopy process)
4. Review backend logs for config loading errors
5. No restart needed - just save the file correctly

### How to Find Data Directory
Check backend logs on startup - it will show the data directory path:
```
[INFO] Loading configuration from: /path/to/data/directory
```

Or check the backend startup command for `--data-dir` flag

## API Information

### Endpoint: GET /v1/admin/validator-address

Returns list of authorized admin addresses.

**Response**:
```json
{
  "addresses": [
    "0xvalidator-address...",  // Always first (the validator)
    "0xadmin1-address...",
    "0xadmin2-address..."
  ]
}
```

**Notes**:
- First address is always the validator
- Subsequent addresses come from `admin_config.json`
- Cached on frontend for performance
- Cache cleared on page refresh

## Frontend Behavior

### Login Page Display:
- Shows count of authorized admins
- Lists all admin addresses (truncated)
- Marks validator with `[Validator]` label
- Shows "Admin ✓" if connected wallet is authorized
- Shows "Not Authorized" if not in the list

### Session Management:
- 4-hour session timeout (same as before)
- Session validates against current admin list
- If removed from config, session becomes invalid on next check

## Migration from Validator-Only

If you're upgrading from validator-only authentication:

### Before (Single Admin):
- Only validator could access admin panel
- No configuration file needed

### After (Multi-Admin):
- Validator STILL has access (no change needed)
- Optionally add additional admins via config file
- If no config file exists, behavior is same as before (validator-only)

### Backward Compatible:
✅ No config file = validator-only (same as before)  
✅ Config file with `enabled: false` = validator-only  
✅ Config file with `enabled: true` = validator + configured admins  

## Example Use Cases

### Solo Node Operator
```json
// No config file needed
// Only you (validator) can access admin panel
```

### Small Team (2-3 people)
```json
{
  "enabled": true,
  "admin_addresses": [
    "0xteam-member-1-address",
    "0xteam-member-2-address"
  ]
}
```

### Larger Organization
```json
{
  "enabled": true,
  "admin_addresses": [
    "0xhead-admin",
    "0xeconomy-manager",
    "0xmoderation-lead",
    "0xcommunity-manager",
    "0xsupport-lead"
  ]
}
```

### Role Separation (Future Enhancement)
Currently all admins have the same permissions. For role-based access control, you would need to implement permission levels (not currently supported).

## Summary

- **Zero Config**: Works out of box (validator-only)
- **Easy Setup**: Just create JSON file and restart
- **Flexible**: Add/remove admins anytime
- **Secure**: File-based configuration, requires backend restart
- **Backward Compatible**: Existing validator-only setups work unchanged

Need help? Check the backend logs for configuration loading status!
