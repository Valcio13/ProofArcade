# Pool Funding User Guide

**Date**: 2026-07-15  
**Audience**: Administrators and Users  
**Purpose**: How to add funds to pools

## Overview

Pools can be funded by sending PROOF tokens to the pool's address using standard Send transactions. This guide explains how to fund pools until a dedicated UI is added.

## Pool Information

### Available Pools

| Pool ID | Pool Name | Purpose |
|---------|-----------|---------|
| 131071 | DAO Pool | Community governance treasury |
| 131072 | Platform Pool | Platform revenue and operations |
| 131073 | Reserve Pool | Safety buffer and contingency |
| 131074 | Shop Pool | Point redemption funding |
| 131075 | Daily Reward Pool | Daily competition prizes |
| 131076 | Monthly Reward Pool | Monthly competition prizes |

## Method 1: Using Admin Dev Faucet (Development Only)

**Best for**: Local testing and development

### Steps

1. Get pool address (see "Getting Pool Address" section below)
2. Call dev faucet endpoint:

```bash
curl -X POST http://localhost:15003/v1/admin/dev-faucet \
  -H "Content-Type: application/json" \
  -d '{
    "address": "<pool-address>",
    "amount": 1000000
  }'
```

### Parameters
- `address`: Pool address (hex format)
- `amount`: Amount in micro-PROOF (1 PROOF = 1,000,000 micro-PROOF)

### Example Response
```json
{
  "txHash": "abc123...",
  "amount": 1000000,
  "recipient": "pool-address",
  "submitted": true
}
```

## Method 2: Using Send Transaction API

**Best for**: Production funding operations

### Steps

1. Get pool address
2. Call send transaction endpoint:

```bash
curl -X POST http://localhost:15003/v1/admin/tx-send \
  -H "Content-Type: application/json" \
  -d '{
    "address": "<your-wallet-address>",
    "password": "<your-wallet-password>",
    "output": "<pool-address>",
    "amount": 1000000,
    "fee": 0,
    "submit": true,
    "memo": "Fund DAO Pool"
  }'
```

### Parameters
- `address`: Your wallet address (sender)
- `password`: Your wallet password
- `output`: Pool address (recipient)
- `amount`: Amount in micro-PROOF
- `fee`: Transaction fee (typically 0 for admin ops)
- `submit`: true to submit immediately
- `memo`: Optional description

## Method 3: Using Explorer UI (Future)

**Status**: Not yet implemented

Once the UI is added, you will be able to:
1. Navigate to Pool Management page
2. Click "Fund This Pool" on any pool card
3. Enter amount in PROOF
4. Click "Send PROOF"
5. Transaction submits automatically

## Getting Pool Address

### Option 1: Query Pool Endpoint

```bash
curl -X POST http://localhost:15002/v1/query/pool \
  -H "Content-Type: application/json" \
  -d '{
    "poolId": 131072,
    "height": 0
  }'
```

### Option 2: Check Pool Management UI

1. Navigate to `/admin/pool-management`
2. Pool addresses may be displayed (if implemented)

### Option 3: Use Pool ID Directly

Some endpoints accept pool ID directly instead of address.

## Converting Between PROOF and micro-PROOF

**Formula**: `1 PROOF = 1,000,000 micro-PROOF`

### Examples

| PROOF | micro-PROOF |
|-------|-------------|
| 0.01 | 10,000 |
| 0.10 | 100,000 |
| 1.00 | 1,000,000 |
| 10.00 | 10,000,000 |
| 100.00 | 100,000,000 |

### JavaScript/TypeScript
```typescript
const proofToMicro = (proof: number) => Math.floor(proof * 1_000_000)
const microToProof = (micro: number) => micro / 1_000_000

// Examples
proofToMicro(1.5)  // 1500000
microToProof(1500000)  // 1.5
```

## Verifying Pool Balance

After funding, verify the pool balance increased:

### Using Pool Query
```bash
curl -X POST http://localhost:15002/v1/query/pool \
  -H "Content-Type": application/json" \
  -d '{
    "poolId": 131072,
    "height": 0
  }'
```

### Using Pool Management UI
1. Navigate to `/admin/pool-management`
2. Check pool balance card
3. Balances auto-refresh every 20 seconds

## Common Issues

### Issue: "Insufficient balance"
**Solution**: Ensure your wallet has enough PROOF + fee

### Issue: "Invalid pool address"
**Solution**: Double-check pool address format (must be hex)

### Issue: "Transaction rejected"
**Solution**: Check password is correct and wallet is unlocked

### Issue: "Pool balance not updating"
**Solution**: Wait 3-5 seconds for blockchain confirmation, then refresh

## Security Best Practices

✅ **DO**:
- Verify pool address before sending
- Use memo field to document funding purpose
- Keep wallet password secure
- Double-check amount (micro-PROOF vs PROOF)
- Test with small amounts first

❌ **DON'T**:
- Share wallet passwords
- Fund wrong pool address
- Skip amount verification
- Forget to convert PROOF to micro-PROOF

## Examples

### Fund DAO Pool with 100 PROOF

```bash
# 1. Get DAO pool address
curl -X POST http://localhost:15002/v1/query/pool \
  -H "Content-Type: application/json" \
  -d '{"poolId": 131071, "height": 0}'

# 2. Send 100 PROOF (100,000,000 micro-PROOF)
curl -X POST http://localhost:15003/v1/admin/tx-send \
  -H "Content-Type: application/json" \
  -d '{
    "address": "your-address",
    "password": "your-password",
    "output": "dao-pool-address",
    "amount": 100000000,
    "fee": 0,
    "submit": true,
    "memo": "Monthly DAO funding"
  }'
```

### Fund Daily Reward Pool with 50 PROOF

```bash
# Send 50 PROOF (50,000,000 micro-PROOF) to Daily Reward Pool
curl -X POST http://localhost:15003/v1/admin/tx-send \
  -H "Content-Type: application/json" \
  -d '{
    "address": "your-address",
    "password": "your-password",
    "output": "daily-pool-address",
    "amount": 50000000,
    "fee": 0,
    "submit": true,
    "memo": "Weekly prize pool funding"
  }'
```

## Audit Trail

All funding transactions are recorded on the blockchain and visible in:
- Transaction explorer
- Pool transfer audit log (if from another pool)
- Account transaction history
- Block explorer

## Future UI Enhancement

A dedicated "Fund Pool" UI will be added in a future update with:
- One-click pool funding
- Automatic address resolution
- PROOF amount input (auto-converts to micro-PROOF)
- Wallet integration
- Transaction confirmation modal
- Success notifications

## Support

For questions or issues:
1. Check this guide first
2. Review pool management documentation
3. Check transaction explorer for confirmation
4. Contact system administrator

## Related Documentation

- `ADMIN_POOL_TRANSFER_COMPLETE.md` - Pool transfer feature
- `ADMIN_POOL_WITHDRAWAL_COMPLETE.md` - Pool withdrawal feature
- `POOL_MANAGEMENT_FINAL_SUMMARY.md` - Overall pool management
- API documentation - Transaction endpoints
