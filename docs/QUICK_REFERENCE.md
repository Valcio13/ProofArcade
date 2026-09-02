# ProofArcade Quick Reference

Fast lookup guide for common development tasks.

## 📂 Where Things Are

### Frontend
```
canopy-main/cmd/rpc/web/explorer/src/
├── pages/           # Page components
│   ├── Play2048.tsx      # Game UI
│   ├── Profile.tsx       # Player profile
│   ├── Shop.tsx          # Point redemption
│   ├── CheckIn.tsx       # Daily login
│   └── Leaderboard.tsx   # Rankings
│
├── lib/             # API & utilities
│   ├── api.ts            # REST API calls
│   ├── rpcChain2048.ts   # Game RPC client
│   ├── chain2048.ts      # Client abstraction
│   ├── mockChain2048.ts  # Mock backend
│   └── walletAuth.ts     # Session management
│
└── hooks/           # React hooks
    └── useApi.ts         # TanStack Query hooks
```

### Backend
```
canopy-main/cmd/rpc/
├── game2048.go      # Game handlers
├── admin.go         # Admin endpoints
├── query.go         # Query handlers
├── routes.go        # Route definitions
├── server.go        # Server setup
├── admin_auth.go    # Authentication
└── types.go         # Request/response types
```

### Contract (Plugin)
```
canopy-main/plugin/typescript/src/contract/
├── contract.ts      # Main orchestrator (handlers)
├── main.ts          # Plugin entry point
│
├── competition/     # Game modes
│   ├── session.ts
│   ├── prize-pool.ts
│   ├── rewards.ts
│   └── weekly-blitz.ts
│
├── economy/         # Fee distribution
├── profile/         # Player stats & identity
├── shop/            # Point redemption
├── checkin/         # Daily login rewards
└── utils/           # Helpers & state keys
```

## 🔑 Common State Keys

```typescript
// Player Data
KeyForPlayerStats(address)
KeyForPlayerIdentity(address)
KeyForPlayerBan(address)

// Game Sessions
KeyForGameSession(gameId)
KeyForDailyAttempt(utcDate, address)

// Leaderboards
KeyForDailyLeaderboard(utcDate, invertedScore, gameId)
KeyForMonthlyLeaderboard(monthId, invertedScore, gameId)
KeyForWeeklyBlitzLeaderboard(weekId, invertedScore, gameId)

// Rewards
KeyForDailyPrizePool(utcDate)
KeyForDailyRewardAllocation(utcDate, rank, gameId)
KeyForDailyRewardByPlayer(utcDate, address)

// Economy
KeyForClassicPointsDailyLedger(utcDate, address)
KeyForClassicPointRedemption(timestamp, address)
KeyForDailyLoginClaim(utcDate, address)
KeyForPool(poolId)
```

## 🎮 Game Mode Summary

| Mode | Fee | Limits | Rewards | Timer |
|------|-----|--------|---------|-------|
| **Playtest** | Free | None | None | No |
| **Classic** | 2 PROOF | None | Classic Points | No |
| **Daily** | 25 PROOF | 1/day, 80 moves | Prize Pool Share | No |
| **Weekly Blitz** | 5 PROOF | 2 official + 3 retry/day | Prize Pool (TBD) | 5 min |

## 💰 Pool IDs

```typescript
PoolIDs = {
  DAO: 1,                    // 0x01
  SHOP: 131073,              // 0x020001
  PLATFORM: 131074,          // 0x020002
  RESERVE: 131075,           // 0x020003
  DAILY_REWARD: 131076,      // 0x020004
  WEEKLY_BLITZ_REWARD: 131077 // 0x020005
}
```

## 🔄 Common Workflows

### Starting a Game
```
Frontend → rpcChain2048.startSession()
  → POST /v1/admin/tx-2048-start-{mode}
  → Backend builds transaction
  → Plugin CheckTx validates
  → Plugin DeliverTx creates session
  → Returns session with seed
```

### Submitting a Score
```
Frontend → rpcChain2048.submitSession()
  → POST /v1/admin/tx-2048-submit
  → Backend builds transaction
  → Plugin CheckTx validates
  → Plugin DeliverTx replays game
  → Verifies score matches
  → Updates leaderboard
  → Returns result
```

### Claiming Daily Reward
```
Frontend → rpcChain2048.claimDailyReward()
  → POST /v1/admin/tx-2048-claim-daily-reward
  → Plugin checks finalization
  → Plugin loads allocation
  → Plugin transfers from prize pool
  → Marks as claimed
```

### Redeeming Points
```
Frontend → rpcChain2048.redeemPoints()
  → POST /v1/admin/tx-2048-redeem-classic-points
  → Plugin validates amount
  → Plugin burns points
  → Plugin pays from shop pool
  → Records redemption
```

## 🏗️ Adding a New Feature

### 1. Contract Module
Create in `contract/{domain}/`:
```typescript
// {domain}/types.ts - Define types
export interface NewFeature { ... }

// {domain}/logic.ts - Implement logic
export function processNewFeature(...) { ... }

// {domain}/README.md - Document module
```

### 2. State Keys
Add to `utils/state.ts`:
```typescript
export function KeyForNewFeature(params): Uint8Array {
  return concat([
    encodeString('new_feature_'),
    encodeParams(params)
  ])
}
```

### 3. Proto Message
Add to `proto/game2048.proto`:
```protobuf
message MessageNewFeature {
  bytes player_address = 1;
  // ... fields
}
```

### 4. Handler
Add to `contract.ts`:
```typescript
async function DeliverMessageNewFeature(
  contract: Contract,
  msg: MessageNewFeature,
  tx: any
): Promise<DeliverTxResult> {
  // Validate
  // Process
  // Write state
  return { events, data }
}
```

### 5. Backend Route
Add to `cmd/rpc/routes.go`:
```go
TxNewFeatureRoutePath = "/v1/admin/tx-new-feature"
```

Add handler to `cmd/rpc/game2048.go` or `admin.go`

### 6. Frontend API
Add to `lib/rpcChain2048.ts`:
```typescript
async newFeature(args) {
  return fetch(`${adminRPCURL}/v1/admin/tx-new-feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  })
}
```

### 7. UI Component
Create page/component in `pages/` or `components/`

## 🧪 Testing Commands

```powershell
# Build plugin
cd canopy-main/plugin/typescript
npm run build

# Start blockchain
cd canopy-main
.\canopy.exe start

# Start frontend (separate terminal)
cd canopy-main\cmd\rpc\web\explorer
npm run dev

# Run replay tests
cd canopy-main/plugin/typescript
npm test
```

## 🐛 Debugging Tips

### Transaction Failed
1. Check backend terminal for errors
2. Check player balance: Query `/v1/query/2048/player`
3. Check banned status: Query `KeyForPlayerBan(address)`
4. Check fee paid vs required

### State Not Updating
1. Query by tx hash to confirm indexed
2. Check state key format matches `utils/state.ts`
3. Check handler wrote to correct key
4. Look for events in block

### Leaderboard Issues
1. Check UTC date timezone consistency
2. Check finalization status
3. Check inverted score calculation
4. Query by prefix to see raw entries

### Frontend Not Updating
1. Check TanStack Query cache
2. Check refetch intervals
3. Check WebSocket connection (if enabled)
4. Check browser console for errors

## 📊 Useful Queries

### Get Player Stats
```typescript
GET /v1/query/2048/player
Body: { address: "..." }
```

### Get Daily Leaderboard
```typescript
GET /v1/query/2048/leaderboards
Query: ?date=2026-07-23
```

### Get Pool Balance
```typescript
POST /v1/query/pool
Body: { id: 131073 }  // Shop pool
```

### Get Game Config
```typescript
GET /v1/query/2048/config
```

## 🔐 Admin Operations

### Pool Transfer
```typescript
POST /v1/admin/pool-transfer
Headers: { X-Admin-Address: "..." }
Body: {
  fromPoolId: 131073,
  toPoolId: 131075,
  amount: 1000000,
  adminAddress: "..."
}
```

### Ban Player
```typescript
POST /v1/admin/ban-player
Headers: { X-Admin-Address: "..." }
Body: {
  targetAddress: "...",
  reason: "..."
}
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: 2026-07-23

For detailed information, see [ARCHITECTURE.md](./ARCHITECTURE.md)
