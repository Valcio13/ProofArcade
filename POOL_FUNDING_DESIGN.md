# Pool Funding Feature - Design Document

**Sub-task**: 3.6  
**Date**: 2026-07-15  
**Status**: Design Phase

## User Requirement

> "add add fund from external wallet to all pool or add new pool for it"

Allow external wallets to deposit PROOF tokens into pools.

## Design Options

### Option A: Add Fund Button to All Pools
**Pros**:
- More flexible - can fund any pool directly
- No new infrastructure needed
- Simple user experience

**Cons**:
- More UI clutter (two buttons per pool)
- Could be confusing which pool to fund
- Multiple fund operations needed for multiple pools

### Option B: Create Dedicated Funding Pool
**Pros**:
- Centralized funding mechanism
- Cleaner UI (one fund operation)
- Admin can then distribute funds as needed
- Better for accounting/auditing

**Cons**:
- Requires new pool creation
- Extra step (fund → distribute)
- More complex workflow

## Recommended Approach: Option A

**Rationale**: 
- More direct and intuitive
- Leverages existing wallet integration
- No new pool infrastructure needed
- Matches user's "all pool" suggestion

## Technical Design

### Frontend Implementation

#### 1. Add Fund Button to Pool Cards

```typescript
// In AdminPoolManagement.tsx
{pools.map((pool) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
    {/* Existing content */}
    
    <button
      onClick={() => handleOpenTransferModal(pool.id)}
      className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
    >
      Transfer From This Pool
    </button>
    
    {/* NEW: Fund button */}
    <button
      onClick={() => handleOpenFundModal(pool.id)}
      className="w-full mt-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium"
    >
      Fund This Pool
    </button>
  </div>
))}
```

#### 2. Fund Modal State

```typescript
interface FundModalState {
  isOpen: boolean
  poolId: number | null
  amount: string
}

const [fundModal, setFundModal] = useState<FundModalState>({
  isOpen: false,
  poolId: null,
  amount: '',
})
```

#### 3. Fund Modal UI

```typescript
{fundModal.isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <motion.div className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4">
      <h3 className="text-xl font-bold text-white mb-4">Fund Pool from Wallet</h3>
      
      <div className="space-y-4">
        {/* Pool Info */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destination Pool
          </label>
          <div className="px-4 py-3 rounded-lg bg-slate-700/50 text-white">
            {fundModal.poolId ? PoolNames[fundModal.poolId] : ''}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount (PROOF)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fundModal.amount}
            onChange={(e) => setFundModal({ ...fundModal, amount: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Wallet Info */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <p className="text-xs text-blue-300">
            ℹ️ This will send PROOF from your connected wallet to the pool. Make sure your wallet has sufficient balance and is connected.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleCloseFundModal}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleFund}
          disabled={!fundModal.amount}
          className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send PROOF
        </button>
      </div>
    </motion.div>
  </div>
)}
```

#### 4. Fund Handler Function

```typescript
const handleFund = async () => {
  if (!fundModal.poolId || !fundModal.amount) {
    toast.error('Please fill in all fields')
    return
  }

  const amountNum = parseFloat(fundModal.amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    toast.error('Invalid amount')
    return
  }

  const amountMicro = Math.floor(amountNum * 1_000_000)

  // Get wallet from session
  const walletAuth = loadStoredWalletAuth()
  if (!walletAuth?.address) {
    toast.error('Please connect your wallet first')
    return
  }

  try {
    const loadingToast = toast.loading('Preparing transaction...')
    
    // Get pool address (pools are special accounts with numeric IDs)
    const poolAddress = getPoolAddress(fundModal.poolId)
    
    // Create Send transaction using wallet
    // This would use the existing wallet integration
    const txHash = await sendTransaction({
      from: walletAuth.address,
      to: poolAddress,
      amount: amountMicro,
      memo: `Fund pool ${fundModal.poolId}`,
    })

    toast.dismiss(loadingToast)
    
    toast.success(
      <div>
        Pool funded successfully!{' '}
        <a 
          href={`/transaction/${txHash}`}
          className="underline font-semibold hover:text-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          View TX
        </a>
      </div>
    )
    
    handleCloseFundModal()
    
    // Refetch pool balances
    setTimeout(() => {
      refetchDao()
      refetchShop()
      refetchReserve()
      refetchPlatform()
      refetchDaily()
      refetchMonthly()
    }, 3000)
    
  } catch (error: any) {
    toast.dismiss()
    toast.error(error.message || 'Funding failed')
  }
}
```

### Backend Changes

**Note**: No new backend endpoint needed! The funding operation uses the standard Send transaction that already exists in the blockchain. The wallet signs and submits the transaction directly.

### Pool Address Resolution

Pools are special accounts with numeric IDs. Need to determine how to get the actual address:

**Option 1**: Query pool address from backend
```typescript
const getPoolAddress = async (poolId: number): Promise<string> => {
  const response = await fetch(`/v1/query/pool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ poolId, height: 0 }),
  })
  const data = await response.json()
  return data.pool.address
}
```

**Option 2**: Use poolId as address directly (if supported)
```typescript
const getPoolAddress = (poolId: number): string => {
  // Convert pool ID to address format
  return poolId.toString()
}
```

### Wallet Integration

The funding feature requires wallet integration to sign transactions. This likely already exists for game play. Need to:

1. Import wallet utilities
2. Use existing `sendTransaction` function
3. Handle wallet connection state
4. Show appropriate errors if wallet not connected

## User Flow

1. **Admin navigates to Pool Management**
2. **Sees "Fund This Pool" button on each pool card**
3. **Clicks "Fund This Pool" on desired pool**
4. **Modal opens showing:**
   - Pool name (read-only)
   - Amount input
   - Info message about wallet
5. **Enters amount in PROOF**
6. **Clicks "Send PROOF"**
7. **Wallet prompts for signature**
8. **User approves transaction**
9. **Success toast appears with TX link**
10. **Pool balances refresh automatically**

## Error Handling

- Wallet not connected → "Please connect your wallet first"
- Insufficient balance → "Insufficient wallet balance"
- Invalid amount → "Invalid amount"
- Transaction rejected → "Transaction rejected by user"
- Network error → "Failed to submit transaction"

## Success Criteria

- ✅ Fund button appears on all pool cards
- ✅ Modal opens with correct pool information
- ✅ Amount validation works
- ✅ Wallet integration functions correctly
- ✅ Transaction submits to blockchain
- ✅ Success/error feedback is clear
- ✅ Pool balances update after funding
- ✅ Transaction appears in audit log

## Security Considerations

- ✅ User controls their own wallet (no backend private key)
- ✅ Transaction signed by user's wallet
- ✅ Amount validated before submission
- ✅ No admin privileges required (anyone can fund pools)
- ✅ Standard Send transaction (existing security model)

## Future Enhancements

1. **Minimum/Maximum Amounts**: Add validation for min/max funding amounts
2. **Funding History**: Show recent funding transactions
3. **Multiple Pools**: Allow funding multiple pools in one operation
4. **Recurring Funding**: Schedule regular funding operations
5. **Funding Goals**: Set target amounts for pools

## Implementation Order

1. Add fund button to pool cards
2. Create fund modal state and UI
3. Implement pool address resolution
4. Add wallet integration
5. Implement fund handler function
6. Add error handling and validation
7. Test end-to-end
8. Update documentation

## Testing Plan

### Unit Tests
- Modal open/close logic
- Amount validation
- Address resolution

### Integration Tests
- Wallet connection
- Transaction creation
- Success/error handling

### E2E Tests
- Complete funding flow
- Balance updates
- Transaction confirmation

## Estimated Effort

- Frontend implementation: ~2 hours
- Wallet integration: ~1 hour
- Testing: ~1 hour
- Documentation: ~30 minutes

**Total**: ~4.5 hours

## Decision

**Proceed with Option A**: Add "Fund This Pool" button to all pool cards with wallet-based Send transactions.
