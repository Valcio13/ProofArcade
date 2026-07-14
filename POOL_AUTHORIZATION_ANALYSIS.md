# Pool Authorization Analysis: Delegated Admin Authority in Canopy

## Executive Summary

**Current State**: Pools in Canopy are **owner-less** by design. There is NO ownership model at the FSM level.

**Problem**: ProofArcade needs admin addresses to perform pool transfers, but the backend currently signs with the validator key, which creates an architecture mismatch.

**Recommendation**: Use the **validator's existing delegated authority model** as a template. Store authorized admin addresses in plugin state and validate them in the CheckTx handler.

---

## 1. Current Pool Architecture

### 1.1 Pool Design Philosophy

From `fsm/account.go` lines 345-348:

```go
/*
	Pools are owner-less designation funds that are 'earmarked' for a purpose
	NOTE: A distinct structure for pools are used instead of a 'hard-coded account address'
	to simply prove that no-one owns the private key for that account
*/
```

**Key Insight**: Pools are **intentionally owner-less**. They are NOT accounts with private keys.

### 1.2 Pool Structure

```go
type Pool struct {
    Id     uint64
    Amount uint64
}
```

**Critical Finding**: Pools have NO owner field, NO validator field, NO admin field. They are pure balance containers.

### 1.3 Who Can Modify Pools?

From FSM code analysis:

**Direct FSM Operations** (Go layer):
- `PoolAdd(id, amount)` - Anyone with FSM access (validators during block execution)
- `PoolSub(id, amount)` - Anyone with FSM access
- `SetPool(pool)` - Anyone with FSM access
- `MintToPool(id, amount)` - Anyone with FSM access

**Plugin Operations** (TypeScript layer):
- `transferBetweenPools()` - Anyone with Contract instance
- `updatePoolBalance()` - Anyone with Contract instance
- `transferFromPoolToPlayer()` - Anyone with Contract instance

**Authorization is NOT enforced at the pool level**. Authorization happens at the **transaction validation level**.

---

## 2. Transaction Authorization Flow

### 2.1 The CheckTx Flow

From `fsm/transaction.go` lines 76-144:

```go
func (s *StateMachine) CheckTx(transaction []byte, txHash string, batchVerifier *crypto.BatchVerifier) {
    var authorizedSigners [][]byte
    
    if s.Plugin != nil && s.Plugin.SupportsTransaction(tx.MessageType) {
        // Execute check tx on the plugin
        resp, e := s.Plugin.CheckTx(s, &lib.PluginCheckRequest{Tx: tx})
        // Set authorized signers from plugin response
        authorizedSigners = resp.AuthorizedSigners  // ← KEY LINE
    } else {
        // For built-in messages
        authorizedSigners, err = s.GetAuthorizedSignersFor(msg)
    }
    
    // Validate the signature matches one of the authorized signers
    sender, err := s.CheckSignature(tx, authorizedSigners, batchVerifier)
}
```

**Critical Finding**: The **plugin's Check handler** returns `authorizedSigners`, and the FSM validates that the transaction signer's address matches one of them.

### 2.2 Signature Verification

From `fsm/transaction.go` lines 155-194:

```go
func (s *StateMachine) CheckSignature(tx *lib.Transaction, authorizedSigners [][]byte, batchSigVerifier *crypto.BatchVerifier) {
    // Extract signer's public key from transaction
    publicKey, err := crypto.NewPublicKeyFromBytes(tx.Signature.PublicKey)
    address := publicKey.Address()
    
    // For each authorized signer
    for _, authorized := range authorizedSigners {
        // If the address that signed the transaction matches
        if address.Equals(crypto.NewAddressFromBytes(authorized)) {
            // Signature is authorized ✅
            return address, nil
        }
    }
    
    // Signer not in authorized list ❌
    return nil, ErrUnauthorized()
}
```

**Key Insight**: The signer's address (derived from the transaction's signature) must be in the `authorizedSigners` list returned by the Check handler.

---

## 3. Validator Delegated Authority Model

Canopy already has a working delegated authority system for validators!

### 3.1 Validator Structure

```go
type Validator struct {
    Address       []byte  // Operator address (signs blocks)
    PublicKey     []byte  // Operator public key
    Output        []byte  // Reward destination address
    // ... other fields
}
```

### 3.2 Validator Authorization

From `fsm/validator.go` lines 418-431:

```go
func (s *StateMachine) GetAuthorizedSignersForValidator(address []byte) (signers [][]byte, err lib.ErrorI) {
    // Retrieve the validator from state
    validator, err := s.GetValidator(crypto.NewAddressFromBytes(address))
    
    // If custodial (operator == output)
    if bytes.Equal(validator.Address, validator.Output) {
        return [][]byte{validator.Address}, nil  // Only operator can sign
    }
    
    // If non-custodial (operator != output)
    return [][]byte{validator.Address, validator.Output}, nil  // Both can sign
}
```

**Key Pattern**: 
1. Validator stores both operator and output addresses
2. GetAuthorizedSignersForValidator returns BOTH addresses
3. FSM allows EITHER address to sign validator-related transactions

This is **delegated authority** - the output address can sign even though it's not the operator.

---

## 4. Current ProofArcade Implementation Issues

### 4.1 What We Currently Do (BROKEN)

**Backend** (`cmd/rpc/admin.go`):
```go
// Get validator private key for signing
privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(...)

// Sign transaction with validator key
tx.Sign(privateKey)
```

**Plugin Check Handler** (current):
```typescript
CheckMessagePoolTransfer(_msg: any): any {
    // Allow any valid signature (empty authorizedSigners)
    return { authorizedSigners: [] };
}
```

**Problem**: Empty `authorizedSigners` means the FSM skips authorization entirely. The transaction is accepted from ANY address with a valid signature.

### 4.2 Why It's Broken

1. **No Authorization**: Anyone with ANY private key can submit pool transfers
2. **Wrong Signer**: Backend uses validator key, but should use admin key
3. **No Admin Whitelist**: No way to verify which addresses are actually admins

---

## 5. Recommended Solution: Validator-Style Delegated Authority

### 5.1 Architecture Pattern

**Store authorized admin addresses in plugin state**, similar to how validators store operator/output addresses.

**In Check handler**, return the list of authorized admin addresses as `authorizedSigners`.

**The FSM will automatically verify** that the transaction signer matches one of the authorized addresses.

### 5.2 Implementation Design

#### Step 1: Store Admin Whitelist in Plugin State

```typescript
// State key for admin whitelist
const ADMIN_WHITELIST_KEY = Buffer.from('admin_whitelist');

interface AdminWhitelist {
    addresses: Uint8Array[];  // List of authorized admin addresses
}

// Initialize at genesis or via governance
async function setAdminWhitelist(contract: Contract, addresses: Uint8Array[]) {
    const whitelist = types.AdminWhitelist.create({ addresses });
    const value = types.AdminWhitelist.encode(whitelist).finish();
    await contract.plugin.StateWrite(contract, {
        sets: [{ key: ADMIN_WHITELIST_KEY, value }]
    });
}

async function getAdminWhitelist(contract: Contract): Promise<Uint8Array[]> {
    const queryId = randomQueryId();
    const [response] = await contract.plugin.StateRead(contract, {
        keys: [{ queryId, key: ADMIN_WHITELIST_KEY }]
    });
    
    const value = getQueryValue(response, queryId);
    if (!value) return [];  // No whitelist = no admins
    
    const [whitelist] = Unmarshal(value, types.AdminWhitelist);
    return whitelist.addresses || [];
}
```

#### Step 2: Check Handler Returns Admin Whitelist

```typescript
async CheckMessagePoolTransfer(
    ctx: StateContext, 
    msg: IMessagePoolTransfer
): Promise<MessageCheckResult> {
    // Get authorized admin addresses from state
    const adminAddresses = await getAdminWhitelist(ctx.contract);
    
    if (adminAddresses.length === 0) {
        return { 
            error: { code: 403, msg: 'No admins configured' }
        };
    }
    
    // Return admin addresses as authorized signers
    // FSM will verify the transaction signer matches one of these
    return { 
        authorizedSigners: adminAddresses
    };
}
```

#### Step 3: Backend Signs with Admin Key (NOT Validator Key)

```go
// BEFORE (WRONG):
privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(
    filepath.Join(s.config.DataDirPath, lib.ValKeyPath)  // ❌ Validator key
)

// AFTER (CORRECT):
privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(
    filepath.Join(s.config.DataDirPath, "admin.key")  // ✅ Admin key
)
```

#### Step 4: Frontend Sends Transaction from Admin Wallet

Instead of calling the backend RPC endpoint, the frontend should:

1. **Build the transaction** in the browser
2. **Sign with admin wallet** (MetaMask-style)
3. **Submit directly** to the blockchain

OR continue using the backend, but:

1. Backend loads **admin private key** from file
2. Signs transaction with **admin key**
3. Submits to blockchain

---

## 6. Authorization Verification Trace

### 6.1 Full Flow with Recommended Solution

```
1. Admin clicks "Transfer Between Pools" in UI
   ↓
2. Frontend or Backend creates MessagePoolTransfer
   {
       fromPoolId: 2,
       toPoolId: 3,
       amount: 1000000,
       adminAddress: 0xADMIN...  // ← Admin's address
   }
   ↓
3. Transaction signed with admin private key
   ↓
4. Transaction submitted to mempool
   ↓
5. Validator calls FSM.CheckTx()
   ↓
6. FSM calls Plugin.CheckTx()
   ↓
7. Plugin CheckMessagePoolTransfer handler:
   - Reads admin whitelist from state: [0xADMIN..., 0xADMIN2...]
   - Returns { authorizedSigners: [0xADMIN..., 0xADMIN2...] }
   ↓
8. FSM extracts signer address from transaction signature: 0xADMIN...
   ↓
9. FSM verifies: 0xADMIN... ∈ [0xADMIN..., 0xADMIN2...] ✅
   ↓
10. Check passes, transaction enters mempool
   ↓
11. Transaction included in next block
   ↓
12. FSM calls Plugin.DeliverTx()
   ↓
13. Plugin DeliverMessagePoolTransfer handler:
   - Calls transferBetweenPools()
   - Updates pool balances atomically
   ↓
14. Transaction committed, balances updated ✅
```

### 6.2 What Happens Without Whitelist

```
7. Plugin CheckMessagePoolTransfer handler:
   - Reads admin whitelist: [] (empty)
   - Returns { error: 'No admins configured' }
   ↓
8. FSM rejects transaction immediately
   ↓
Transaction never enters mempool ❌
```

### 6.3 What Happens with Wrong Signer

```
7. Plugin returns { authorizedSigners: [0xADMIN1, 0xADMIN2] }
   ↓
8. FSM extracts signer: 0xATTACKER
   ↓
9. FSM verifies: 0xATTACKER ∈ [0xADMIN1, 0xADMIN2] ❌
   ↓
10. FSM returns ErrUnauthorized()
   ↓
Transaction rejected ❌
```

---

## 7. Comparison: Current vs. Recommended

| Aspect | Current (Broken) | Recommended (Secure) |
|--------|------------------|---------------------|
| **Signer** | Validator key | Admin key |
| **Authorization Check** | None (empty authorizedSigners) | Whitelist in plugin state |
| **Who can transfer** | Anyone with validator key | Only whitelisted admins |
| **Storage** | Backend config file | On-chain plugin state |
| **Verification** | Backend only (off-chain) | FSM + Plugin (on-chain) |
| **Attack surface** | Validator key compromise | Admin key compromise (isolated) |
| **Audit trail** | Backend logs only | Blockchain transactions |

---

## 8. Pool Scoping Question

### Q: Do pools belong to a specific validator?

**A: NO.** Pools are global, shared state.

From the code:
- Pool keys: `[PoolPrefix][PoolID]` - No validator identifier
- Pool structure: Only `{Id, Amount}` - No owner/validator field
- Pool IDs are hardcoded constants: `DAOPoolID + 1`, `DAOPoolID + 2`, etc.

**Pool IDs are application-level constants**, not validator-scoped:

```go
const (
    game2048PlatformPoolID = lib.DAOPoolID + 1  // Always 2
    game2048ReservePoolID  = lib.DAOPoolID + 2  // Always 3
    game2048ShopPoolID     = lib.DAOPoolID + 3  // Always 4
    game2048DailyPoolID    = lib.DAOPoolID + 4  // Always 5
    game2048MonthlyPoolID  = lib.DAOPoolID + 5  // Always 6
)
```

**These pools are shared by ALL validators** running the ProofArcade plugin.

### Q: Can the FSM/plugin verify admin sender and perform operations?

**A: YES.** The plugin Check handler can:
1. Read admin whitelist from plugin state
2. Return authorized addresses
3. FSM automatically verifies signer matches

The plugin Deliver handler can then:
1. Access FSM methods via Contract instance
2. Call `transferBetweenPools()` to modify pool balances
3. State changes are committed atomically

**The validator does NOT need to sign the operation**. Any whitelisted admin can sign.

---

## 9. Security Considerations

### 9.1 Admin Key Management

**Option A: Admin Key File on Server**
```
/path/to/data/admin.key  (BLS12-381 private key)
```
- Backend loads and signs transactions
- Same pattern as validator key
- **Risk**: Server compromise = admin compromise

**Option B: Frontend Wallet Signing**
- Admin connects MetaMask/wallet
- Signs transaction in browser
- Backend only constructs transaction bytes
- **Advantage**: Private key never leaves admin's device

### 9.2 Whitelist Management

**Stored in plugin state**, managed via:

1. **Genesis Configuration**
   ```json
   {
     "adminWhitelist": [
       "0x1234...",
       "0x5678..."
     ]
   }
   ```

2. **Governance Message**
   ```go
   type MessageUpdateAdminWhitelist struct {
       Addresses [][]byte
       Signer    []byte  // Must be current admin or governance
   }
   ```

3. **Admin Dashboard**
   - Current admins can add/remove other admins
   - Requires multi-sig or governance vote

### 9.3 Separation of Concerns

**Validator Key**:
- Signs blocks
- Manages validator operations (stake, pause, etc.)
- Should NEVER be used for application logic

**Admin Key**:
- Signs pool transfer messages
- Manages game economy
- Can be rotated independently of validator

---

## 10. Does This Fit Canopy's Architecture?

### YES. Evidence:

1. **Validator precedent**: Canopy already uses delegated authority for validators (operator vs. output address)

2. **Plugin authority**: Plugins are DESIGNED to define custom authorization rules via CheckTx

3. **State-based permissions**: Storing permission lists in plugin state is a standard pattern

4. **FSM separation**: Authorization (CheckTx) is separate from execution (DeliverTx)

5. **No EVM assumptions**: This design does NOT assume smart contract ownership. It uses Canopy's native message validation flow.

---

## 11. Smallest Architecture Change

### Current Code Change Required:

**1. Add admin whitelist message type** (proto + contract handlers)

**2. Modify CheckMessagePoolTransfer**:
```typescript
// FROM:
return { authorizedSigners: [] };  // ❌ Insecure

// TO:
const admins = await getAdminWhitelist(contract);
return { authorizedSigners: admins };  // ✅ Secure
```

**3. Change backend signer**:
```go
// FROM:
privateKey := loadValidatorKey()  // ❌ Wrong key

// TO:
privateKey := loadAdminKey()  // ✅ Correct key
```

**4. Initialize whitelist**:
- Add to genesis.json
- OR create initialization transaction
- OR manual state write

**Lines of code**: ~200 lines total

**Breaking changes**: None (additive only)

**Security improvement**: Massive (from no authorization to proper authorization)

---

## 12. Recommended Implementation Steps

### Phase 1: Minimal Fix (IMMEDIATE)
1. Add admin whitelist storage functions
2. Update CheckMessagePoolTransfer to return admin addresses
3. Store one admin address in plugin state (hardcoded)
4. Generate admin key pair and store in backend
5. Update backend to use admin key instead of validator key
6. Test pool transfer with admin signature

### Phase 2: Proper Whitelist (NEXT)
1. Add MessageUpdateAdminWhitelist proto message
2. Add Check/Deliver handlers for whitelist updates
3. Add admin management UI
4. Migrate from hardcoded admin to dynamic whitelist
5. Add audit logging for admin operations

### Phase 3: Multi-Sig (FUTURE)
1. Require N-of-M admin signatures for pool transfers
2. Add pending operations queue
3. Add admin approval workflow
4. Add emergency pause mechanism

---

## 13. Conclusion

**Current Implementation**: 
- ❌ Uses validator key (wrong)
- ❌ No authorization check (insecure)
- ❌ Empty authorizedSigners (allows anyone)

**Root Cause**: 
- Pools are owner-less by design
- Authorization must happen at transaction validation level
- Plugin Check handler must return authorized addresses

**Solution**:
- ✅ Store admin whitelist in plugin state
- ✅ Return admin addresses from Check handler
- ✅ FSM automatically verifies signer
- ✅ Use admin key instead of validator key
- ✅ Follows Canopy's existing patterns (validator delegation model)

**Architectural Fit**: 
- ✅ Aligns with Canopy's design philosophy
- ✅ Uses existing authorization infrastructure
- ✅ No EVM assumptions
- ✅ Minimal code changes
- ✅ Significant security improvement

**Next Step**: Implement Phase 1 (Minimal Fix) to get pool transfers working securely.
