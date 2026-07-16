# Pool Authorization - Quick Summary

## The Problem

Pools are **owner-less** in Canopy. They have no owner field, no validator field. Authorization happens at the **transaction validation level**, not the pool level.

## Current (Broken) Implementation

```typescript
// Check handler - INSECURE
CheckMessagePoolTransfer(): any {
    return { authorizedSigners: [] };  // ❌ Allows ANYONE
}
```

```go
// Backend - WRONG KEY
privateKey := loadValidatorKey()  // ❌ Should use admin key
tx.Sign(privateKey)
```

**Result**: Transaction gets hash but never included in blocks because authorization is broken.

## Root Cause

Empty `authorizedSigners` means FSM doesn't know WHO should be allowed to sign. Without authorization, transaction validation fails silently.

## The Fix (Following Validator Pattern)

Canopy already has delegated authority for validators:
- Validator stores operator + output addresses
- Check handler returns BOTH as authorized signers
- FSM validates transaction signer matches ONE of them

**Apply same pattern to admins:**

### 1. Store Admin Whitelist in Plugin State

```typescript
async function getAdminWhitelist(contract: Contract): Promise<Uint8Array[]> {
    // Read from plugin state: key = "admin_whitelist"
    // Returns: [0xADMIN1, 0xADMIN2, ...]
}
```

### 2. Check Handler Returns Admin List

```typescript
CheckMessagePoolTransfer(msg): any {
    const admins = await getAdminWhitelist(contract);
    return { authorizedSigners: admins };  // ✅ FSM validates signer
}
```

### 3. Sign with Admin Key (Not Validator Key)

```go
// Backend loads admin key, NOT validator key
privateKey := loadAdminKey()  // ✅ Correct
tx.Sign(privateKey)
```

### 4. Admin Address Must Be in Whitelist

```
Transaction Flow:
1. Transaction signed with admin key → signer address = 0xADMIN1
2. FSM calls Plugin.CheckTx()
3. Plugin returns authorizedSigners = [0xADMIN1, 0xADMIN2]
4. FSM checks: 0xADMIN1 ∈ [0xADMIN1, 0xADMIN2] ✅
5. Transaction accepted into mempool
6. Transaction included in block
7. Plugin.DeliverTx() executes pool transfer
8. Balances update ✅
```

## Why This Works

**FSM Authorization Flow** (from `fsm/transaction.go`):

```go
// 1. Plugin returns authorized addresses
resp := Plugin.CheckTx(tx)
authorizedSigners := resp.AuthorizedSigners

// 2. FSM extracts signer from transaction signature
signer := extractSignerAddress(tx.Signature)

// 3. FSM verifies signer is authorized
for _, authorized := range authorizedSigners {
    if signer.Equals(authorized) {
        return OK  // ✅ Authorized
    }
}
return ErrUnauthorized()  // ❌ Not authorized
```

**Without proper authorizedSigners, this check fails.**

## Implementation Complexity

**Phase 1 (Minimal)**: ~200 lines of code
- Add getAdminWhitelist() function
- Update CheckMessagePoolTransfer
- Store one admin address (hardcoded initially)
- Generate admin key pair
- Update backend to use admin key

**Phase 2 (Proper)**: ~500 lines of code  
- Add MessageUpdateAdminWhitelist
- Add whitelist management UI
- Dynamic whitelist from state

**Phase 3 (Advanced)**: ~1000 lines of code
- Multi-sig support
- Pending operations queue
- Admin approval workflow

## Key Insights

1. **Pools are owner-less** - No validator/owner at pool level
2. **Authorization is transaction-level** - Checked in Plugin.CheckTx()
3. **Validator pattern exists** - Use it as template
4. **FSM does validation** - Plugin just returns authorized list
5. **Admin key ≠ Validator key** - Separate concerns

## Why Balances Aren't Changing

Current flow:
```
1. Backend signs with validator key ✓
2. Transaction gets hash ✓
3. Submitted to mempool ✓
4. FSM calls CheckTx ✓
5. Plugin returns authorizedSigners = [] ❌
6. FSM: "No authorization defined, who can sign?" ❌
7. Transaction silently rejected ❌
8. Never enters mempool ❌
9. Never included in block (0 txs) ❌
10. Balances never change ❌
```

Fixed flow:
```
1. Backend signs with admin key ✓
2. Transaction gets hash ✓
3. Submitted to mempool ✓
4. FSM calls CheckTx ✓
5. Plugin returns authorizedSigners = [0xADMIN1] ✓
6. FSM: "Signer 0xADMIN1 matches authorized list" ✓
7. Transaction accepted ✓
8. Included in next block (1 txs) ✓
9. DeliverTx executes ✓
10. Balances change ✓
```

## Recommended Next Steps

1. **Read full analysis**: `POOL_AUTHORIZATION_ANALYSIS.md`
2. **Implement Phase 1**: Hardcode single admin address
3. **Test with admin signature**: Verify blocks show "1 txs"
4. **Implement Phase 2**: Dynamic whitelist
5. **Add audit logging**: Track all admin operations
6. **Consider multi-sig**: For production security

## Architecture Alignment

✅ Follows Canopy's validator delegation pattern  
✅ Uses plugin state for permissions  
✅ Leverages FSM authorization infrastructure  
✅ No EVM assumptions  
✅ Minimal breaking changes  
✅ Significant security improvement  

---

**Bottom Line**: The issue isn't pool operations - it's transaction authorization. Fix the Check handler to return proper authorized signers, and the transfers will work.
