# Admin Pool Transfer - Authorization Flow Diagram

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD (UI)                        │
│                     http://localhost:5173/admin/pool                │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ HTTP POST /v1/admin/pool/transfer
                                   │ Body: { fromPoolId, toPoolId, amount, adminAddress }
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (cmd/rpc/admin.go)                       │
│                         Port 15003 (Admin)                          │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Load admin private key from admin.key                           │
│    privateKey = crypto.NewBLS12381PrivateKeyFromFile("admin.key")  │
│                                                                     │
│ 2. Create MessagePoolTransfer protobuf message                     │
│    msg = { fromPoolId, toPoolId, amount, adminAddress }            │
│                                                                     │
│ 3. Sign transaction with admin key                                 │
│    tx = { Msg: msg, ... }                                          │
│    tx.Sign(privateKey)  → signature includes admin's address       │
│                                                                     │
│ 4. Submit to blockchain                                            │
│    controller.SendTxMsgs(txBytes)                                  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ Transaction submitted
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTROLLER / FSM                             │
│                  (Transaction Processing)                           │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ FSM.CheckTx()
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 TYPESCRIPT PLUGIN (CheckTx Phase)                   │
│            plugin/typescript/src/contract/contract.ts               │
├─────────────────────────────────────────────────────────────────────┤
│ CheckMessagePoolTransfer(msg):                                      │
│                                                                     │
│   1. Load admin address from config                                │
│      adminAddress = this.proofArcadeAdminAddress                   │
│                                                                     │
│   2. Return admin as authorized signer                             │
│      return { authorizedSigners: [adminAddress] }                  │
│                                                                     │
│   ⚠️  If admin not configured:                                     │
│      return { error: "admin address not configured" }              │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ Returns: { authorizedSigners: [0xADMIN...] }
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FSM SIGNATURE VALIDATION                               │
│                (fsm/transaction.go)                                 │
├─────────────────────────────────────────────────────────────────────┤
│ CheckSignature(tx, authorizedSigners):                             │
│                                                                     │
│   1. Extract signer's public key from transaction signature        │
│      publicKey = tx.Signature.PublicKey                            │
│      signerAddress = publicKey.Address()                           │
│                                                                     │
│   2. Verify signer is in authorizedSigners list                    │
│      for each authorized in authorizedSigners:                     │
│        if signerAddress == authorized:                             │
│          return ✅ AUTHORIZED                                      │
│                                                                     │
│      return ❌ UNAUTHORIZED                                        │
│                                                                     │
│   ⚠️  If authorizedSigners is empty:                              │
│      return ❌ NO AUTHORIZATION (silent rejection)                │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
                  ▼ ✅ AUTHORIZED                  ▼ ❌ UNAUTHORIZED
┌─────────────────────────────────┐   ┌──────────────────────────────┐
│   ACCEPTED INTO MEMPOOL         │   │   REJECTED (SILENT)          │
│                                 │   │                              │
│ - Transaction valid ✅          │   │ - Not included in mempool   │
│ - Enters mempool                │   │ - No error returned         │
│ - Will be in next block         │   │ - Blocks show "0 txs"       │
└────────────┬────────────────────┘   └──────────────────────────────┘
             │
             │ Next block production
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BLOCK PRODUCTION                                │
├─────────────────────────────────────────────────────────────────────┤
│ Block 123 with 1 txs  ← KEY INDICATOR                              │
│                                                                     │
│ ✅ "1 txs" = Transaction authorized and included                   │
│ ❌ "0 txs" = No transactions (authorization failed)                │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ FSM.DeliverTx()
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│              TYPESCRIPT PLUGIN (DeliverTx Phase)                    │
│            plugin/typescript/src/contract/contract.ts               │
├─────────────────────────────────────────────────────────────────────┤
│ DeliverMessagePoolTransfer(contract, msg, tx):                     │
│                                                                     │
│   1. Extract parameters                                            │
│      fromPoolId = msg.fromPoolId                                   │
│      toPoolId = msg.toPoolId                                       │
│      amount = msg.amount                                           │
│      adminAddress = msg.adminAddress                               │
│                                                                     │
│   2. Validate parameters                                           │
│      - Check pool IDs are non-zero                                 │
│      - Check pools are different                                   │
│      - Check amount is positive                                    │
│                                                                     │
│   3. Log admin operation (audit trail)                             │
│      console.log("ADMIN OPERATION: Pool Transfer")                 │
│      console.log("  Admin:", adminHex)                             │
│      console.log("  From Pool:", fromPoolId)                       │
│      console.log("  To Pool:", toPoolId)                           │
│      console.log("  Amount:", amount)                              │
│                                                                     │
│   4. Execute pool transfer                                         │
│      await transferBetweenPools(contract, fromPoolId, toPoolId,    │
│                                 amount)                             │
│                                                                     │
│   5. Log success                                                   │
│      console.log("Pool transfer completed successfully")           │
│                                                                     │
│   return {}  ← Success, no error                                   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ transferBetweenPools()
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   POOL OPERATIONS                                   │
│       plugin/typescript/src/contract/economy/pool-operations.ts     │
├─────────────────────────────────────────────────────────────────────┤
│ transferBetweenPools(contract, fromPoolId, toPoolId, amount):      │
│                                                                     │
│   1. Read current pool balances from FSM state                     │
│      fromPool = state.GetPool(fromPoolId)                          │
│      toPool = state.GetPool(toPoolId)                              │
│                                                                     │
│   2. Validate source pool has sufficient balance                   │
│      if fromPool.amount < amount:                                  │
│        throw "Insufficient balance"                                │
│                                                                     │
│   3. Calculate new balances                                        │
│      newFromBalance = fromPool.amount - amount                     │
│      newToBalance = toPool.amount + amount                         │
│                                                                     │
│   4. Write updated balances to FSM state                           │
│      state.SetPool({ id: fromPoolId, amount: newFromBalance })     │
│      state.SetPool({ id: toPoolId, amount: newToBalance })         │
│                                                                     │
│   5. Return success                                                │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ State committed
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FSM STATE UPDATE                               │
├─────────────────────────────────────────────────────────────────────┤
│ Pool balances updated in blockchain state ✅                        │
│                                                                     │
│ fromPool.amount = oldAmount - transferAmount                       │
│ toPool.amount = oldAmount + transferAmount                         │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   │ State committed to block
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      UI UPDATE                                      │
│                   Admin Dashboard                                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Transaction hash received from initial HTTP request             │
│    → Display success message to user                               │
│                                                                     │
│ 2. Periodic polling refreshes pool balances                        │
│    → Query backend: GET /v1/query/pool/<id>                        │
│    → Display updated balances                                      │
│                                                                     │
│ 3. User sees balance change ✅                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Decision Points

### ⭐ Point 1: Admin Key Loading (Backend)

```
❌ WRONG: privateKey = loadValidatorKey()
✅ RIGHT: privateKey = loadAdminKey()

Why: Validator key is for consensus operations.
     Admin key is for administrative operations.
     Separation of concerns and security.
```

### ⭐ Point 2: Authorized Signers (Plugin Check)

```
❌ WRONG: return { authorizedSigners: [] }
✅ RIGHT: return { authorizedSigners: [adminAddress] }

Why: Empty array means NO ONE is authorized.
     FSM will reject ALL transactions silently.
     Must return admin address for validation.
```

### ⭐ Point 3: Signature Validation (FSM)

```
Process:
1. tx.signer = 0xADMIN123  (extracted from signature)
2. authorizedSigners = [0xADMIN123]  (from plugin)
3. Check: 0xADMIN123 ∈ [0xADMIN123] ✅

If empty:
1. tx.signer = 0xADMIN123
2. authorizedSigners = []  ← PROBLEM
3. Check: 0xADMIN123 ∈ [] ❌ REJECTED
```

## Failure Modes

### Failure Mode 1: Admin Not Configured

```
Symptom: "Admin address not configured" error
Cause:   proofArcadeAdmin not set in plugin config
Result:  Check handler returns error
         Transaction rejected before mempool
Fix:     Set admin address in plugin_config.json
```

### Failure Mode 2: Empty Authorized Signers

```
Symptom: Blocks show "0 txs"
Cause:   Check handler returns empty authorizedSigners
Result:  FSM signature validation fails silently
         Transaction never enters mempool
Fix:     Ensure Check handler returns admin address
```

### Failure Mode 3: Wrong Signer Key

```
Symptom: Blocks show "0 txs"
Cause:   Backend signs with wrong key (e.g., validator key)
         Signer address doesn't match admin address
Result:  FSM signature validation fails
         Transaction rejected
Fix:     Backend must use admin.key to sign
```

### Failure Mode 4: Address Mismatch

```
Symptom: Blocks show "0 txs"
Cause:   admin.key address != config admin address
Result:  Signer doesn't match authorized list
         FSM rejects transaction
Fix:     Regenerate admin key OR update config
```

## Success Indicators

### ✅ Indicator 1: Configuration Logs

```
[ProofArcade] Admin address configured: a1b2c3d4e5f6...
```
Means: Admin address loaded successfully in plugin

### ✅ Indicator 2: Check Handler Logs

```
CheckMessagePoolTransfer called
Admin address: a1b2c3d4e5f6...
Returning authorizedSigners: [0xa1b2c3...]
```
Means: Authorization information provided to FSM

### ✅ Indicator 3: Block Production

```
Block 123 with 1 txs  ← "1 txs" not "0 txs"
```
Means: Transaction authorized and included

### ✅ Indicator 4: Deliver Logs

```
ADMIN OPERATION: Pool Transfer
  From Pool: 3
  To Pool: 4
  Amount: 1000000
Pool transfer completed successfully
```
Means: Transaction executed successfully

### ✅ Indicator 5: Balance Changes

```
UI shows updated pool balances
fromPool: old - amount
toPool: old + amount
```
Means: State updated correctly

## Troubleshooting Decision Tree

```
Problem: Pool balances not changing
│
├─ Are blocks showing "0 txs"?
│  │
│  ├─ YES → Authorization failing
│  │  │
│  │  ├─ Check: Admin configured? → Set admin in config
│  │  ├─ Check: Check handler returning admin? → Fix Check handler
│  │  ├─ Check: Backend using admin key? → Use admin.key not validator key
│  │  └─ Check: Addresses match? → Regenerate key or update config
│  │
│  └─ NO (blocks showing "1 txs") → Deliver phase issue
│     │
│     ├─ Check: Deliver logs show execution? → Fix Deliver handler
│     ├─ Check: Pool transfer function called? → Fix pool operations
│     ├─ Check: Source pool has balance? → Insufficient funds error
│     └─ Check: State write successful? → Fix state update
│
└─ Check logs for errors at each stage
```

## Complete Log Flow Example

### Successful Transfer Logs

```
[Backend] AdminPoolTransfer: fromPool=3, toPool=4, amount=1000000, adminAddr=a1b2c3d4e5f6
[Backend] AdminPoolTransfer: successfully submitted tx 7a8b9c...
[Plugin]  CheckMessagePoolTransfer called
[Plugin]  Admin address: a1b2c3d4e5f6...
[Plugin]  Returning authorizedSigners: [0xa1b2c3...]
[FSM]     CheckSignature: signer=0xa1b2c3..., authorized=0xa1b2c3...
[FSM]     Transaction accepted into mempool
[FSM]     Block 123 with 1 txs
[Plugin]  ADMIN OPERATION: Pool Transfer
[Plugin]    Admin: a1b2c3d4e5f6...
[Plugin]    From Pool: 3
[Plugin]    To Pool: 4
[Plugin]    Amount: 1000000
[Plugin]  transferBetweenPools executing...
[Plugin]  Pool transfer completed successfully
[UI]      Transaction successful: 7a8b9c...
[UI]      Balances updated
```

### Failed Transfer Logs (Not Authorized)

```
[Backend] AdminPoolTransfer: fromPool=3, toPool=4, amount=1000000, adminAddr=wrong123
[Backend] AdminPoolTransfer: successfully submitted tx 7a8b9c...
[Plugin]  CheckMessagePoolTransfer called
[Plugin]  Admin address: a1b2c3d4e5f6...
[Plugin]  Returning authorizedSigners: [0xa1b2c3...]
[FSM]     CheckSignature: signer=0xwrong123, authorized=0xa1b2c3...
[FSM]     CheckSignature: NO MATCH - transaction rejected
[FSM]     Block 123 with 0 txs  ← NO TRANSACTION IN BLOCK
[UI]      Transaction submitted but never executes
[UI]      Balances unchanged
```

---

## References

- **FSM Authorization**: `fsm/transaction.go` lines 76-194
- **Signature Validation**: `fsm/transaction.go` lines 155-194
- **Plugin Check**: `plugin/typescript/src/contract/contract.ts` CheckMessagePoolTransfer
- **Plugin Deliver**: `plugin/typescript/src/contract/contract.ts` DeliverMessagePoolTransfer
- **Pool Operations**: `plugin/typescript/src/contract/economy/pool-operations.ts`
- **Backend Admin**: `cmd/rpc/admin.go` AdminPoolTransfer
