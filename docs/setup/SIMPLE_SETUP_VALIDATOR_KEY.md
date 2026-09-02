# Simple Setup - Using Validator Key for Admin Operations

## Overview

This is the **simplest approach** - use your existing validator key for admin operations. No need to generate a separate admin key.

⚠️ **Note**: This means your validator key controls both consensus AND admin operations. For production, consider separating these concerns, but for now this works.

---

## Setup Steps

### Step 1: Get Your Validator Address

On your server where Canopy is running, find your validator address:

```bash
# The validator address is derived from the public key
# You can find it in your validator info or by querying the node
```

**Or** you can extract it from the validator key file. The address is the hash of the public key.

### Step 2: Create Plugin Config

Create `plugin/typescript/plugin_config.json`:

```json
{
  "ChainId": 1,
  "validatorAddress": "YOUR_VALIDATOR_ADDRESS_IN_HEX"
}
```

**OR** if you prefer to be explicit:

```json
{
  "ChainId": 1,
  "proofArcadeAdmin": "YOUR_VALIDATOR_ADDRESS_IN_HEX"
}
```

Both work the same way. The plugin will use `proofArcadeAdmin` if set, otherwise falls back to `validatorAddress`.

### Step 3: Build Plugin

```cmd
cd plugin\typescript
npm run build
cd ..\..
```

### Step 4: Build Backend

```cmd
go build -o canopy.exe cmd\main\main.go
```

### Step 5: Deploy

When deploying, just set the environment variable:

```bash
export CANOPY_PLUGIN_CONFIG_PATH=/path/to/plugin/typescript/plugin_config.json
```

That's it! The backend will use the existing validator key, and the plugin will authorize transactions from the validator address.

---

## Even Simpler: Use Environment Variable

Instead of creating a config file, you can set the admin address via environment variable:

```bash
export CANOPY_VALIDATOR_ADDRESS="your_validator_address_hex"
```

Then in your plugin startup, read this environment variable and pass it to the config.

---

## How to Find Your Validator Address

### Option 1: From Running Node

If your node is running, query it:

```bash
curl http://localhost:15002/v1/query/validator/YOUR_VALIDATOR_ADDRESS
```

### Option 2: From Validator Key File

The validator key is at `~/.canopy/val.key` (or similar). You can extract the public key and compute the address.

### Option 3: Check Node Logs

When the node starts, it logs the validator information including the address.

---

## Quick Test

1. Build and start backend with plugin config
2. Check logs for: `[ProofArcade] Admin address configured: [your validator address]`
3. Go to admin UI and try a pool transfer
4. Should work immediately!

---

## Why This Works

```
Backend signs with validator key
  ↓
Validator key → Validator address
  ↓
Plugin authorizes validator address
  ↓
FSM checks: tx signer == validator address ✅
  ↓
Transaction approved!
```

---

## Production Consideration

**Current Setup** (Simple):
- Validator key = Admin key
- One key controls everything
- Simple to set up
- ⚠️ If validator key is compromised, admin operations are compromised too

**Recommended for Production** (Separate Keys):
- Validator key = Consensus operations only
- Admin key = Admin operations only  
- Separation of concerns
- Better security

But for now, the simple approach works fine!

---

## Summary

**What you need**:
1. Your validator address (hex format)
2. Plugin config with `validatorAddress` or `proofArcadeAdmin` set to that address
3. Build and deploy

**What happens**:
- Backend uses existing validator key
- Plugin authorizes validator address
- Admin operations work immediately

**No separate admin key needed!** ✅
