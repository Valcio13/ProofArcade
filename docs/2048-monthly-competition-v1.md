# 2048 Monthly Competition V1

> **Note**: This specification describes the monthly competitive prize pool system for Classic mode. For the treasury model including fee splits, see `2048-treasury-v1.md`. This document focuses on monthly leaderboard accounting, cumulative scoring, and reward pool mechanics.

## Goal

Turn Classic mode into a sustained monthly competition:

- each Classic entry fee contributes to the current month's prize pool
- players accumulate scores throughout the month
- monthly leaderboard shows cumulative performance
- top performers qualify for end-of-month rewards (V2 feature)

This is a V1 spec focused on the tracking infrastructure. It intentionally defers winner payouts and reward distribution to V2.

## Confirmed Product Rules

### Fee Allocation

- Classic entry fee: **2,000,000 uproof (2 PROOF)**
- Monthly pool allocation: **30% of Classic fees = 600,000 uproof (0.6 PROOF) per game**

Classic fee split (see `2048-treasury-v1.md` for complete treasury model):
  - `5%` (100,000 uproof) → platform fee
  - `30%` (600,000 uproof) → **monthly reward pool**
  - `20%` (400,000 uproof) → reserve buffer
  - `45%` (900,000 uproof) → shop funding

### Scoring Model

- **Cumulative scoring**: Each Classic game adds to the player's monthly total
- **Single entry per player**: Only one leaderboard entry exists per player per month
- **Automatic updates**: Submitting a new game updates the existing entry with cumulative score
- **Previous entry deletion**: Old leaderboard entry is deleted before adding new cumulative entry

### Leaderboard

- **Display**: Top 50 players
- **Sorting**: By cumulative score (descending)
- **Tie-breaking**: 
  1. Higher cumulative score
  2. Higher max tile (from most recent game)
  3. Fewer moves (from most recent game)
  4. Earlier submission (from most recent game)
- **Month format**: `YYYY-MM` (e.g., `2026-07` for July 2026)
- **Current month focus**: UI displays current month by default

### Month Boundaries

- **UTC-based**: All month calculations use UTC timezone
- **Fresh start**: When a new month begins, all players start with 0 cumulative score
- **Historical preservation**: Previous months' data remains queryable

## Denomination

- **Backend storage**: All amounts in **uproof** (micro-PROOF)
- **Conversion**: 1 PROOF = 1,000,000 uproof
- **Frontend display**: Convert to PROOF using `formatCNPY(toCNPY(amount))`

## Contract-Level Design

### Existing State Reused

The current contract already has:

- `GameSession`
- `PlayerStats`
- `GameConfig`
- Pool accounting system

Monthly competition reuses the existing Classic game flow and extends it with monthly-specific tracking.

### New State Needed

1. **Monthly reward pool** - Accumulates 30% of all Classic fees for the current month
2. **Monthly player entry** - Tracks cumulative score and last gameId per player per month
3. **Monthly leaderboard entry** - Stores detailed game stats for leaderboard display

## State Keys

Current 2048 state lives under `gamePrefix = [18]`.

Monthly competition additions:

### Monthly pool

- `KeyForGameMonthlyRewardPool()`
  - Returns: `JoinLenPrefix(gamePrefix, 'monthly-reward-pool')`
  - Purpose: Global monthly prize pool balance

### Monthly player entry

- `KeyForMonthlyPlayerEntry(monthId, playerAddress)`
  - Returns: `JoinLenPrefix(gamePrefix, 'monthly-player', monthId, playerAddress)`
  - Purpose: Track cumulative score and gameId for deletion logic
  - Value format: `[score:4 bytes LE][gameId:32 bytes]` (36 bytes total)

### Monthly leaderboard entry

- `KeyForMonthlyLeaderboard(monthId, score, gameId)`
  - Returns: `JoinLenPrefix(gamePrefix, 'monthly-leaderboard', monthId, invertedScore, gameId)`
  - Purpose: Sorted leaderboard entries (inverted score for descending order)
  - Value format: Length-prefixed components:
    ```
    [monthIDLen:1][monthID:n][gameIDLen:1][gameID:n][addressLen:1][address:n]
    [score:8 BE][maxTile:8 BE][moveCount:8 BE][timestamp:8 BE]
    ```

### Monthly leaderboard prefix

- `KeyForMonthlyLeaderboardPrefix(monthId)`
  - Purpose: Iterator prefix for loading top 50 entries for a specific month

## Key Implementation Details

### Score Inversion

The leaderboard key uses **inverted score** to achieve descending sort order:

```typescript
function invertUint64(value: Long): Uint8Array {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(0xFFFFFFFFFFFFFFFF) - BigInt(value.toString()));
    return buf;
}
```

This ensures higher scores appear first when iterating keys in ascending order.

### GameId Size

GameId is **32 bytes** (SHA256 hash), not 8 bytes. This is critical for:
- Proper buffer allocation
- Correct slice indices
- Successful deletion of previous entries

### Key Encoding

All monthly keys use `JoinLenPrefix()` for proper length-prefixed encoding. This ensures Go backend compatibility and prevents key corruption.

### Value Format

Monthly leaderboard entries use **big-endian encoding** for numeric values to match backend expectations. Each component is prefixed with its length for safe parsing.

## Deliver Flow Changes

### A. `DeliverMessageStartClassicGame`

Enhanced behavior:

1. Deduct full Classic fee (2,000,000 uproof) from player
2. Split fee into treasury buckets:
   - `platformCut = 100,000 uproof` (5%)
   - `monthlyCut = 600,000 uproof` (30%)
   - `reserveCut = 400,000 uproof` (20%)
   - `shopCut = 900,000 uproof` (45%)
3. Add to respective pools:
   - Platform pool: `platformCut`
   - **Monthly reward pool**: `monthlyCut`
   - Reserve pool: `reserveCut`
   - Shop pool: `shopCut`
4. Continue with normal game session creation

Important notes:
- Monthly pool is a **global accumulator** (Pool ID: `131076` = `DAOPoolID + 5`)
- Pool balance persists across months until V2 implements monthly settlement

### B. `DeliverMessageSubmitGameResult` (Classic Mode)

Enhanced behavior for Classic games:

1. **Read player's monthly entry**:
   - Load `KeyForMonthlyPlayerEntry(currentMonth, playerAddress)`
   - Extract: `previousScore` and `previousGameId`
   - Handle migration: Old 4-byte entries (score only) vs new 36-byte entries (score + gameId)

2. **Calculate cumulative score**:
   ```typescript
   cumulativeScore = previousScore + currentGameScore
   ```

3. **Delete old leaderboard entry** (if previousGameId exists):
   - Delete key: `KeyForMonthlyLeaderboard(monthId, previousScore, previousGameId)`
   - This prevents duplicate entries for the same player

4. **Add new leaderboard entry**:
   - Key: `KeyForMonthlyLeaderboard(monthId, cumulativeScore, currentGameId)`
   - Value: Full entry data with cumulative score and latest game stats

5. **Update player entry**:
   - Key: `KeyForMonthlyPlayerEntry(monthId, playerAddress)`
   - Value: `[cumulativeScore:4][currentGameId:32]` (36 bytes)

### Migration Support

The system supports both old and new entry formats:

- **Old format** (4 bytes): `[score:4]` - Can read score for cumulative math, but can't delete old entries
- **New format** (36 bytes): `[score:4][gameId:32]` - Full support for deletion and cumulative scoring

This allows seamless migration without breaking existing data.

## Monthly Reward Pool

### Pool ID

- **Pool ID**: `131076` (calculated as `DAOPoolID + 5`)
- **Type**: Global accumulator pool
- **Storage**: Standard Pool protobuf message

### Accumulation

- Increases by 600,000 uproof (0.6 PROOF) per Classic game
- Persists across backend restarts
- No automatic reset on month boundaries (V1)

### V1 Behavior

In V1, the monthly pool is **accumulation-only**:
- Pool grows continuously
- No automatic payouts
- No month-based segregation
- Foundation for V2 reward distribution

V2 will add:
- Month-scoped pool balances
- Winner determination logic
- Reward distribution mechanics
- Claimable reward system

## Query Endpoints

### 1. Monthly pool balance

`GET /v1/query/2048/monthly-pool?monthId=YYYY-MM`

Parameters:
- `monthId` (optional): Defaults to current UTC month if omitted

Response:
```json
{
  "monthId": "2026-07",
  "balance": 12000000
}
```

Notes:
- V1 returns global pool balance regardless of `monthId` parameter
- V2 will support per-month pool balances

### 2. Monthly leaderboard

`GET /v1/query/2048/monthly-leaderboard/:monthId`

Parameters:
- `monthId` (required): Month in `YYYY-MM` format

Response:
```json
{
  "monthId": "2026-07",
  "entries": [
    {
      "rank": 1,
      "playerAddress": "3ec27047c601cdd0367b435ae15b1242d3762b30",
      "username": "player1",
      "score": 45680,
      "maxTile": 2048,
      "moveCount": 1234,
      "endedAt": 1720223456,
      "gameId": "abc123..."
    }
  ]
}
```

Notes:
- Returns top 50 entries
- Entries sorted by cumulative score (descending)
- Includes current username lookup (not stored in leaderboard entry)

## Technical Bugs Fixed

During implementation, **7 critical bugs** were discovered and fixed:

### Bug #1: StateRead Response Handling
- **Problem**: Incorrect array access pattern `existingEntryResp?.[0]?.values?.[0]`
- **Fix**: Use `getQueryValue(existingEntryResp, queryId)` helper function
- **Impact**: Backend crashes prevented

### Bug #2: Key Encoding
- **Problem**: Monthly keys not using `JoinLenPrefix`
- **Fix**: Changed to proper length-prefixed encoding
- **Impact**: Key corruption prevented

### Bug #3: Value Format Mismatch
- **Problem**: Plugin wrote flat binary structure, backend expected length-prefixed
- **Fix**: Rewrote value creation with proper length prefixes and big-endian encoding
- **Impact**: Leaderboard entries now parse correctly

### Bug #4: GameId Size Assumption
- **Problem**: Assumed gameId was 8 bytes instead of 32 bytes
- **Fix**: Changed buffer size from 12 to 36 bytes
- **Impact**: Delete logic now works correctly

### Bug #5: StateRead Pattern in StartClassicGame
- **Problem**: Using old StateRead pattern without queryId
- **Fix**: Updated to use queryId-based pattern with `getQueryValue()`
- **Impact**: Consistent pool value reading

### Bug #6: Wrong Parameter Name for Deletes
- **Problem**: Used `dels` instead of `deletes` in StateWrite
- **Fix**: Changed parameter name to match `IPluginStateWriteRequest` interface
- **Impact**: All delete operations now execute

### Bug #7: Wrong Delete Data Structure
- **Problem**: Pushing raw `Uint8Array` instead of `{ key: Uint8Array }` objects
- **Fix**: Changed type declaration and push operation to use proper object structure
- **Impact**: Delete operations now work correctly

These bugs were discovered through iterative testing and fixed in sequence. All fixes are documented in `MONTHLY_COMPETITION_ALL_BUGS_FIXED.md`.

## Frontend Implementation

### Leaderboard Page

Enhanced features:
- **Monthly tab**: Displays current month's leaderboard
- **Top 10 display**: Shows top 10 entries by default
- **Show More/Less**: Toggle to expand beyond top 10
- **User ranking**: If ranked 11th or lower, displays user's current rank
- **Prize pool display**: Shows current month's accumulated rewards
- **Auto-refresh**: Updates when new games are submitted

### Removed Features

For simplicity, V1 removes:
- Month selector dropdown (always shows current month)
- All-time leaderboard tab (Classic focused on monthly only)

### API Client

New RPC methods:
```typescript
async getMonthlyPool(monthId?: string): Promise<{ monthId: string; balance: number }>
async getMonthlyLeaderboard(monthId: string): Promise<MonthlyLeaderboardResponse>
```

## Error Cases

Add contract errors for:

- `monthly player entry not found`
- `monthly leaderboard entry not found`
- `invalid month format`
- `monthly pool not found`
- `insufficient monthly pool balance` (for V2 payouts)

## V1 Scope Summary

### Included in V1

✅ Monthly prize pool accumulation (30% of Classic fees)  
✅ Cumulative scoring system  
✅ Single entry per player with automatic deletion  
✅ Monthly leaderboard API endpoints  
✅ Top 50 leaderboard display  
✅ Current month focus in UI  
✅ Migration support for old entries  
✅ Full bug fixes and testing  

### Deferred to V2

⏳ Winner determination logic  
⏳ End-of-month reward distribution  
⏳ Claimable rewards system  
⏳ Month-scoped pool balances  
⏳ Historical month selection in UI  
⏳ Reward claiming transactions  
⏳ Pool finalization mechanics  

## Recommendation

V1 provides the complete tracking infrastructure for monthly competition. The system is production-ready for:
- Accumulating monthly prize pools
- Tracking cumulative player performance
- Displaying real-time leaderboards
- Building player engagement

V2 should add the reward distribution layer on top of this stable foundation.

## Related Documentation

- `2048-treasury-v1.md` - Complete treasury model with fee splits
- `2048-daily-prize-pool-v1.md` - Daily competition reward system
- `2048-shop-redemption-v1.md` - Classic points redemption system

## Implementation Files

### Backend
- `cmd/rpc/game2048.go` - Monthly pool and leaderboard query handlers
- `cmd/rpc/routes.go` - Route registration for monthly endpoints

### Plugin
- `plugin/typescript/src/contract/contract.ts` - Monthly pool allocation and leaderboard logic
- `plugin/go/chain.json` - Chain configuration with uproof denomination
- `plugin/typescript/package.json` - Plugin dependencies

### Frontend
- `cmd/rpc/web/explorer/src/pages/Leaderboard.tsx` - Leaderboard UI with monthly tab
- `cmd/rpc/web/explorer/src/lib/rpcChain2048.ts` - API client methods
- `cmd/rpc/web/explorer/src/lib/chain2048.ts` - Client interface definitions
- `cmd/rpc/web/explorer/src/lib/mockChain2048.ts` - Type definitions

### Wallet
- `cmd/rpc/web/wallet/public/plugin/canopy/chain.json` - Chain config with uproof
- `cmd/rpc/web/wallet/src/hooks/useDenom.ts` - Denomination utilities
