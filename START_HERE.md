# Admin Pool Transfer - START HERE

## What You Need to Know

Admin pool transfers are **ready to use** with your **existing validator key**. No need to create a separate admin key.

---

## Quick Start (2 Steps)

### Step 1: Get Your Validator Address

Run this from the `canopy-main` directory:

```bash
go run get-validator-address.go ~/.canopy
```

**Windows**:
```cmd
go run get-validator-address.go %USERPROFILE%\.canopy
```

**Output**:
```
=== Validator Information ===
Validator Address (hex): abc123def456...

Use this in plugin_config.json:
{
  "ChainId": 1,
  "validatorAddress": "abc123def456..."
}
```

Copy the JSON config shown.

### Step 2: Create Plugin Config

Create `plugin/typescript/plugin_config.json` with the JSON from Step 1.

**That's it!** Now build and deploy.

---

## Build

```bash
# Build plugin
cd plugin/typescript
npm run build
cd ../..

# Build backend
go build -o canopy.exe cmd/main/main.go
```

**Windows**: The executable will be `canopy.exe`  
**Linux/Mac**: The executable will be `canopy`

---

## Deploy

### Files to Deploy:

1. **Backend binary**: `canopy.exe` or `canopy`
2. **Plugin code**: Everything in `plugin/typescript/dist/`
3. **Plugin config**: `plugin/typescript/plugin_config.json`

### Environment Variable:

Set this on your server (in systemd service, startup script, or shell):

```bash
export CANOPY_PLUGIN_CONFIG_PATH=/path/to/plugin/typescript/plugin_config.json
```

Or in your systemd service file:
```ini
[Service]
Environment="CANOPY_PLUGIN_CONFIG_PATH=/opt/canopy/plugin/typescript/plugin_config.json"
```

---

## Verify It Works

### 1. Check Backend Logs

When backend starts, look for:

```
[ProofArcade] Admin address configured: abc123def456...
[ProofArcade] Source: validatorAddress
```

✅ **Good**: Admin configured  
❌ **Bad**: "WARNING: No admin address configured"

### 2. Test Pool Transfer

1. Go to your admin UI: `http://your-domain/admin/pool`
2. Try a small transfer (e.g., 1000000 from Pool 3 to Pool 4)
3. Check logs for:
   ```
   Block X with 1 txs  ← Must show "1 txs" not "0 txs"
   ADMIN OPERATION: Pool Transfer
   Pool transfer completed successfully
   ```
4. Verify balances changed in UI

---

## Troubleshooting

### "WARNING: No admin address configured"

**Problem**: Plugin config not loaded

**Fix**:
```bash
# Verify config exists
cat plugin/typescript/plugin_config.json

# Set environment variable
export CANOPY_PLUGIN_CONFIG_PATH=/full/path/to/plugin/typescript/plugin_config.json

# Restart backend
```

### "Block X with 0 txs" (transaction not included)

**Problem**: Address mismatch or authorization failing

**Fix**:
```bash
# Verify validator address is correct
go run get-validator-address.go ~/.canopy

# Make sure address in plugin_config.json matches exactly
# Rebuild plugin
cd plugin/typescript && npm run build

# Restart backend
```

### "Failed to load validator key"

**Problem**: Validator key file not found

**Fix**:
- Make sure validator key exists at `~/.canopy/val.key`
- Check data directory path is correct
- Verify file permissions

---

## How It Works

```
┌─────────────────────────────────────────┐
│  Admin UI sends pool transfer request   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Backend loads validator key            │
│  Signs transaction with validator key   │
│  tx.signer = validator address          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Plugin checks authorization            │
│  authorizedSigners = [validator addr]   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  FSM validates signature                │
│  tx.signer == validator address? YES ✅ │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Transaction accepted into mempool      │
│  Included in next block                 │
│  Pool balances updated ✅               │
└─────────────────────────────────────────┘
```

---

## Summary

**What you did**:
1. ✅ Got validator address
2. ✅ Created plugin config
3. ✅ Built plugin and backend
4. ✅ Deployed with environment variable set

**What happens**:
- Backend uses existing validator key (no new key needed)
- Plugin authorizes validator address
- Admin operations work immediately

**Result**: Pool transfers work! 🎉

---

## Need More Help?

**Detailed guides**:
- `SIMPLE_SETUP_VALIDATOR_KEY.md` - More detailed steps
- `EASIEST_SETUP.md` - Alternative approaches
- `MANUAL_SETUP_GUIDE.md` - Full manual deployment guide
- `ADMIN_POOL_TRANSFER_IMPLEMENTATION.md` - Complete technical documentation

**Tools**:
- `get-validator-address.go` - Extract validator address from key file
- `generate-admin-key.go` - Generate separate admin key (if you want to separate admin/validator later)

**For now, just follow the 2 steps above and you're done!** ✅
