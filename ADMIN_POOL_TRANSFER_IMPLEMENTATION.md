# Admin Pool Transfer Implementation Guide

## Current Status

✅ **TypeScript Plugin**: Updated with admin authorization
- `CheckMessagePoolTransfer` returns admin address in `authorizedSigners`
- `DeliverMessagePoolTransfer` has comprehensive audit logging
- Config interface supports `proofArcadeAdmin` field
- Admin address initialized in constructor

✅ **Backend**: Updated to use admin key
- `AdminPoolTransfer` now loads admin key instead of validator key
- Backend signs transactions with proper admin authority

⏳ **Pending**: Key generation and configuration

---

## Implementation Steps

### Step 1: Generate Admin Key Pair

Run the admin key generator:

```bash
go run generate-admin-key.go ~/.canopy
```

This will:
- Generate a BLS12-381 key pair for admin operations
- Save private key to `~/.canopy/admin.key`
- Display the admin address in hex format

**Example Output:**
```
=== Admin Key Generated Successfully ===
Key file: /home/user/.canopy/admin.key
Address (hex): a1b2c3d4e5f6...

Use this address in your plugin config:
"proofArcadeAdmin": "a1b2c3d4e5f6..."
```

### Step 2: Configure Plugin with Admin Address

Create or update `plugin_config.json` in your plugin directory:

```json
{
  "ChainId": 1,
  "proofArcadeAdmin": "a1b2c3d4e5f6..."
}
```

**Note**: Use the hex address from Step 1.

### Step 3: Set Environment Variable

Set the plugin config path:

```bash
export CANOPY_PLUGIN_CONFIG_PATH=/path/to/plugin_config.json
```

Or set it in the plugin's startup script.

### Step 4: Rebuild TypeScript Plugin

```bash
cd plugin/typescript
npm run build
```

### Step 5: Rebuild Go Backend

```bash
go build -o canopy.exe cmd/main/main.go
```

### Step 6: Restart Backend

Stop the current backend and start the new one. Look for this log line on startup:

```
[ProofArcade] Admin address configured: a1b2c3d4e5f6...
```

If you see:
```
[ProofArcade] WARNING: No admin address configured. Admin operations will fail.
```

Then the plugin config was not loaded correctly.

---

## Testing the Full Flow

### 1. Start the Frontend and Backend

```bash
# Terminal 1: Backend
./canopy.exe start

# Terminal 2: Frontend (in cmd/rpc/web/explorer)
npm run dev
```

### 2. Verify Admin Configuration

Check the plugin logs for:
```
[ProofArcade] Admin address configured: a1b2c3d4e5f6...
```

### 3. Submit a Pool Transfer

Through the admin UI at `http://localhost:5173/admin/pool`:

- From Pool: 3 (Platform)
- To Pool: 4 (Reserve)
- Amount: 1000000

### 4. Verify Transaction Flow

Monitor logs for these stages:

**Stage 1: Transaction Created**
```
AdminPoolTransfer: fromPool=3, toPool=4, amount=1000000, adminAddr=a1b2c3d4e5f6
```

**Stage 2: Check Handler Returns Admin**
```typescript
// In TypeScript plugin logs
CheckMessagePoolTransfer called
Admin address: a1b2c3d4e5f6
Returning authorizedSigners: [0xa1b2c3...]
```

**Stage 3: Transaction Enters Mempool**
```
Transaction accepted into mempool
```

**Stage 4: Block Production**
```
Block 123 with 1 txs  ← KEY: Should be "1 txs" not "0 txs"
```

**Stage 5: Deliver Handler Executes**
```typescript
ADMIN OPERATION: Pool Transfer
  From Pool: 3
  To Pool: 4
  Amount: 1000000
  Admin: a1b2c3d4e5f6
```

**Stage 6: Balance Update**
```
Pool transfer completed successfully
```

### 5. Verify Balances Changed

Check the admin UI - balances should update after the block is produced.

---

## Architecture Overview

### Authorization Flow

```
1. Admin Dashboard → HTTP Request to Backend (port 15003)
   ↓
2. Backend loads admin.key → Signs transaction with admin key
   ↓
3. Backend submits transaction → Controller.SendTxMsgs()
   ↓
4. FSM calls Plugin.CheckTx() → TypeScript CheckMessagePoolTransfer
   ↓
5. Plugin returns authorizedSigners=[adminAddress]
   ↓
6. FSM validates: tx.signer == adminAddress ✅
   ↓
7. Transaction accepted into mempool
   ↓
8. Transaction included in next block
   ↓
9. FSM calls Plugin.DeliverTx() → TypeScript DeliverMessagePoolTransfer
   ↓
10. Plugin executes: transferBetweenPools(fromPool, toPool, amount)
    ↓
11. Pool balances updated ✅
```

### Key Files Modified

**Backend:**
- `cmd/rpc/admin.go` - Line 1042: Changed from validator key to admin key
- `cmd/rpc/game2048.go` - MessagePoolTransfer descriptor already added

**TypeScript Plugin:**
- `plugin/typescript/src/contract/contract.ts`:
  - Constructor: Initializes admin address from config
  - `CheckMessagePoolTransfer`: Returns admin in authorizedSigners
  - `DeliverMessagePoolTransfer`: Executes pool transfer with logging
- `plugin/typescript/src/contract/plugin.ts`:
  - Config interface: Added `proofArcadeAdmin?: string`

**Proto:**
- `plugin/typescript/proto/game2048.proto` - MessagePoolTransfer already defined
- `plugin/go/proto/game2048.proto` - MessagePoolTransfer already defined

---

## Troubleshooting

### Issue: "Admin address not configured"

**Symptoms:**
- Plugin logs: "WARNING: No admin address configured"
- Check handler returns error: "ProofArcade admin address not configured"

**Solution:**
1. Verify `plugin_config.json` exists and has correct path
2. Set `CANOPY_PLUGIN_CONFIG_PATH` environment variable
3. Restart the plugin
4. Check for "Admin address configured" log on startup

### Issue: Transactions Not Included in Blocks

**Symptoms:**
- Logs show "Block X with 0 txs"
- Transaction gets hash but never executes

**Solution:**
1. Verify admin address in plugin config matches admin.key address
2. Check for "authorizedSigners" in plugin logs
3. Ensure backend is using admin.key (not validator.key)
4. Check FSM logs for signature validation errors

### Issue: "Failed to load admin key"

**Symptoms:**
- Backend error: "Failed to load admin key"
- HTTP 500 error on pool transfer

**Solution:**
1. Run key generator: `go run generate-admin-key.go ~/.canopy`
2. Verify file exists: `ls -la ~/.canopy/admin.key`
3. Check file permissions: Should be 0600
4. Ensure backend data directory path is correct

### Issue: Pool Balances Not Changing

**Symptoms:**
- Transaction included in block
- No error messages
- Balances unchanged

**Solution:**
1. Check DeliverTx logs for "ADMIN OPERATION: Pool Transfer"
2. Verify pool IDs exist (query pool balances first)
3. Check for errors in pool transfer execution
4. Verify source pool has sufficient balance

---

## Security Considerations

### Admin Key Protection

The admin key is **extremely sensitive**:
- Controls ALL admin operations
- Can transfer between any pools
- Should be stored securely with restricted permissions (0600)
- Should be backed up in a secure location
- Consider using a hardware security module (HSM) for production

### Authorization Model

This implementation uses **single-admin authorization**:
- ONE admin key controls all operations
- No multi-sig or approval workflow
- No time-locks or rate limits
- Suitable for development/testing
- **Production should consider**: Multi-sig, role-based access, audit trails

### Future Enhancements

Potential security improvements:
1. **Multi-Admin Whitelist**: Store multiple admin addresses in plugin state
2. **Multi-Sig**: Require N-of-M signatures for critical operations
3. **Rate Limiting**: Prevent rapid-fire transfers
4. **Time-Locks**: Delay execution of large transfers
5. **Role-Based Access**: Different admins for different operations
6. **Audit Trail**: Record all admin actions on-chain

---

## Next Steps

After successful testing:

1. **Document the Process**
   - Create operator runbook for admin operations
   - Document key backup procedures
   - Define incident response for compromised keys

2. **Production Hardening**
   - Implement multi-admin whitelist
   - Add comprehensive error handling
   - Set up monitoring and alerting
   - Create key rotation procedures

3. **Integration Testing**
   - Test all admin operations end-to-end
   - Verify error cases and edge conditions
   - Load test with concurrent operations
   - Test disaster recovery procedures

4. **Deployment**
   - Deploy to testnet first
   - Run through full test suite
   - Monitor logs and metrics
   - Deploy to mainnet with rollback plan

---

## References

- **Architecture Analysis**: `POOL_AUTHORIZATION_ANALYSIS.md` - Comprehensive analysis of pool authorization
- **Quick Summary**: `POOL_AUTH_SUMMARY.md` - TL;DR of authorization pattern
- **Example Config**: `plugin_config.json.example` - Example plugin configuration
- **FSM Authorization**: `fsm/transaction.go` lines 76-194 - Transaction validation flow
- **Validator Pattern**: `fsm/validator.go` - Reference implementation for delegated authority
