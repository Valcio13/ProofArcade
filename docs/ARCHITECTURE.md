# ProofArcade Architecture Analysis
**Date:** July 23, 2026  
**Status:** Read-Only Analysis  
**Purpose:** Complete architectural mapping before feature implementation

---

## Executive Summary

ProofArcade is a blockchain-based 2048 game platform built on the Canopy stack. The architecture follows a three-tier model:

1. **Frontend** - React/TypeScript user interface (`cmd/rpc/web/explorer`)
2. **Backend RPC** - Go HTTP servers exposing game endpoints (`cmd/rpc`)
3. **Blockchain Contract/Plugin** - TypeScript plugin for deterministic game logic (`plugin/typescript`)

The system implements:
- Deterministic replay-based score verification
- Multiple game modes (Playtest, Classic, Daily, Weekly Blitz)
- On-chain economy with pools, points, and rewards
- Admin tools for pool management and player moderation

---

## 1. Project Structure

### High-Level Organization

```
e:\ProofArcade\canopy-main\
├── cmd/                    # Command-line executables
│   ├── main/              # Main entry point for canopy.exe
│   ├── rpc/               # RPC server and HTTP handlers
│   │   └── web/
│   │       ├── explorer/  # Main ProofArcade frontend (React)
│   │       └── wallet/    # Standalone wallet frontend
│   ├── cli/               # CLI commands
│   └── auto-update/       # Auto-update utilities
├── plugin/                # Blockchain smart contracts
│   └── typescript/        # ProofArcade game contract (MAIN PLUGIN)
│       ├── src/
│       │   ├── contract/  # Contract logic modules
│       │   ├── proto/     # Generated protobuf types
│       │   └── shared/    # Shared game utilities
│       ├── proto/         # Protobuf definitions
│       └── dist/          # Compiled JavaScript output
├── fsm/                   # Finite State Machine (blockchain core)
├── controller/            # Block and consensus controller
├── bft/                   # Byzantine Fault Tolerance
├── p2p/                   # Peer-to-peer networking
├── store/                 # State storage and indexing
├── lib/                   # Shared blockchain libraries
├── docs/                  # Documentation
└── tools/                 # Utility scripts

```

### Component Interaction Flow

```
User Browser
    ↓
Frontend (React - port 5173 dev / embedded in binary)
    ↓ HTTP
Backend RPC Server (Go - ports 15002/15003)
    ↓ Socket/TCP
TypeScript Plugin (NodeJS process via socket)
    ↓ Socket
FSM (Finite State Machine - blockchain core)
    ↓
State Store (Persistent blockchain state)
```


---

## 2. Blockchain Plugin / Contract

### Location and Entry Point

**Primary Plugin Directory:** `e:\ProofArcade\canopy-main\plugin\typescript\`

**Entry Point:**
- **File:** `plugin/typescript/src/main.ts`
- **Purpose:** Initializes the plugin, loads config, starts socket connection to FSM
- **Starts:** 
  - Plugin socket listener (`StartPlugin`)
  - Custom RPC HTTP server (`StartRPCServer` on port 50010)

### Plugin Architecture

The TypeScript plugin is the **blockchain smart contract** that:
- Validates and executes game transactions
- Manages on-chain state (sessions, scores, pools, rewards)
- Implements deterministic replay verification
- Handles economy logic (fee splits, reward calculations)

**NOT a separate system** - this IS the blockchain contract layer for ProofArcade.

### Plugin Initialization Flow

```typescript
main.ts
  → LoadConfig() - reads plugin_config.json or environment
  → StartPlugin(config) - creates Plugin instance, connects to FSM via socket
  → StartRPCServer(plugin) - starts HTTP server for custom query endpoints
  → ListenForInbound() - processes messages from FSM
```

### Contract Structure (After Refactoring)

The contract code has been **modularized** into functional domains:

```
plugin/typescript/src/contract/
├── contract.ts              # Main contract handler (CheckTx/DeliverTx routing)
├── plugin.ts                # Plugin lifecycle and FSM communication
├── game2048.ts              # Proto message encoding/decoding
├── game2048-replay.ts       # Deterministic replay engine
├── game2048-board.ts        # Board state management
├── game2048-rng.ts          # Seeded random number generation
├── error.ts                 # All error types
├── index.ts                 # Public API exports
├── rpc.ts                   # Custom HTTP RPC server for queries
│
├── checkin/                 # Daily login system
│   ├── streak.ts           # Streak calculation logic
│   ├── rewards.ts          # Reward distribution
│   └── types.ts            # Type definitions
│
├── competition/             # Game modes and sessions
│   ├── session.ts          # Session lifecycle (create, complete)
│   ├── prize-pool.ts       # Daily prize pool management
│   ├── rewards.ts          # Reward finalization and distribution
│   ├── weekly-blitz.ts     # Weekly Blitz mode (5-min timer, cumulative scoring)
│   └── types.ts            # Game mode types
│
├── economy/                 # Financial system
│   ├── fee-distribution.ts # Fee splitting logic
│   ├── pool-operations.ts  # Pool transfer/deposit/withdrawal
│   ├── competition-registry.ts # Competition tracking
│   └── types.ts            # Economy types
│
├── profile/                 # Player data
│   ├── identity.ts         # Username and profile management
│   ├── stats.ts            # Player statistics tracking
│   ├── points.ts           # Classic points calculation
│   └── types.ts            # Profile types
│
├── shop/                    # Redemption system
│   ├── redemption.ts       # Points → PROOF conversion
│   ├── pricing.ts          # Exchange rate logic
│   ├── validation.ts       # Redemption validation
│   └── types.ts            # Shop types
│
├── config/                  # Game configuration
│   └── index.ts            # Default params and getters
│
├── utils/                   # Shared utilities
│   ├── state.ts            # ⭐ STATE KEY GENERATORS (CRITICAL)
│   ├── helpers.ts          # Buffer utils, validation
│   ├── time.ts             # UTC date/time helpers
│   └── crypto.ts           # Hashing utilities
│
└── validation/              # Input validation
    └── message-checks.ts   # Transaction validation functions
```


### Critical File: `utils/state.ts`

**Purpose:** Generates all blockchain state database keys  
**Location:** `plugin/typescript/src/contract/utils/state.ts`

**What It Contains:**
- Pool ID constants (DAO, Platform, Reserve, Shop, Daily Reward, Monthly Reward)
- State key prefix definitions
- Pure functions for generating keys for ALL state objects

**Examples:**
```typescript
KeyForGameSession(gameId) → stores session data
KeyForDailyPrizePool(utcDate) → stores daily pool balance
KeyForPlayerStats(address) → stores player aggregate stats
KeyForWeeklyBlitzDailyTracking(utcDate, address) → weekly blitz run limits
```

**Why It Matters:**
- ALL blockchain state access goes through these keys
- Refactored from inline definitions to centralized utilities
- Used by both contract handlers and RPC query endpoints

### Message Handling Flow

#### CheckTx (Transaction Validation)

**File:** `plugin/typescript/src/contract/contract.ts` (ContractAsync class)

```typescript
CheckTx(request) → 
  FromAny(request.tx.msg) → decodes message type
  switch (messageType):
    case 'MessageStartDailyGame':
      → checkMessageStartDailyGame()
      → validate fee, player address, date format
    case 'MessageStartClassicGame':
      → checkMessageStartClassicGame()
    case 'MessageStartWeeklyBlitzGame':
      → checkMessageStartWeeklyBlitzGame()
    case 'MessageSubmitGameResult':
      → checkMessageSubmitGameResult()
    ... (all message types)
  return { error: null } or { error: { code, msg } }
```

#### DeliverTx (Transaction Execution)

**File:** `plugin/typescript/src/contract/contract.ts` (ContractAsync class)

```typescript
DeliverTx(request) → 
  FromAny(request.tx.msg) → decodes message type
  switch (messageType):
    case 'MessageStartDailyGame':
      → DeliverMessageStartDailyGame(contract, msg, tx)
        1. Check daily attempt doesn't exist
        2. Validate player balance
        3. Split fee (platform/reward/reserve/shop)
        4. Create session with seed
        5. Record daily attempt
        6. Update pools
        7. Return events
    case 'MessageSubmitGameResult':
      → DeliverMessageSubmitGameResult(contract, msg, tx)
        1. Load session from state
        2. Validate ownership and status
        3. Deterministic replay verification
        4. Calculate points/rewards based on mode
        5. Update leaderboards
        6. Complete session
        7. Return events
    ... (all message types)
```

### State Storage Architecture

**Storage Pattern:**
```
State Store (key-value database)
  ↑
Plugin reads/writes via StateRead/StateWrite
  ↑
FSM manages state access
```

**State Operations:**
```typescript
// Read from state
contract.StateRead({ keys: [{ queryId, key }] })
  → returns { results: [{ queryId, entries: [{ key, value }] }] }

// Write to state
contract.StateWrite({ 
  sets: [{ key, value }],
  deletes: [{ key }]
})
```


### Proto Message Definitions

**Location:** `plugin/typescript/proto/game2048.proto`

**Message Types:**
```protobuf
// Game Start Messages
MessageStartDailyGame { player_address, utc_date, game_id }
MessageStartClassicGame { player_address, game_id }
MessageStartWeeklyBlitzGame { player_address, game_id }

// Game Submission
MessageSubmitGameResult {
  player_address, game_id, moves[], 
  declared_score, declared_max_tile, stop_reason
}

// Reward Claims
MessageClaimDailyReward { player_address, utc_date }
MessageClaimWeeklyBlitzReward { player_address, week_id }
MessageClaimDailyLoginReward { player_address }

// Shop
MessageRedeemClassicPoints { player_address, burn_points }

// Profile
MessageSetUsername { player_address, username }

// Admin Operations
MessagePoolTransfer { from_pool_id, to_pool_id, amount, admin_address }
MessagePoolDeposit { pool_id, amount, admin_address }
MessagePoolWithdrawal { pool_id, amount, to_address, admin_address }
MessageBanPlayer { target_address, reason, admin_address }
MessageUnbanPlayer { target_address, reason, admin_address }
```

**State Objects:**
```protobuf
GameSession - stores active/completed game runs
GameConfig - system configuration
GameTreasury - platform/reserve/shop balances
DailyPrizePool - daily competition pool
PlayerStats - aggregate player data
PlayerIdentity - username and profile
UsernameRegistration - username → address mapping
LeaderboardEntry - ranked competition entries
DailyRewardAllocation - finalized daily rewards
ClassicPointsDailyLedger - daily points earned
ClassicPointRedemption - shop transaction history
DailyLoginClaim - check-in streak tracking
PlayerBan - moderation records
```

**Enums:**
```protobuf
GameMode: DAILY, CLASSIC, WEEKLY_BLITZ
SessionStatus: ACTIVE, COMPLETED, EXPIRED
StopReason: PLAYER_STOPPED, NO_MOVES, MAX_MOVES, TIMER_EXPIRED
MoveDirection: UP, RIGHT, DOWN, LEFT
```

### RPC Query Server

**Location:** `plugin/typescript/src/contract/rpc.ts`

**Purpose:** Custom HTTP server for blockchain queries (separate from FSM transaction flow)

**Port:** 50010 (configurable)

**How It Works:**
- Runs in same NodeJS process as plugin
- Uses `plugin.queryState(height, request)` for detached state reads
- Does NOT require active transaction context
- Used by backend Go RPC handlers to fetch state

**Example Query:**
```typescript
GET /custom/player/stats?address=0x123
  → plugin.queryState(0, { keys: [KeyForPlayerStats(address)] })
  → decode PlayerStats from returned value
  → return JSON response
```


---

## 3. Frontend → Blockchain Flow

### Complete Execution Path Examples

#### Example 1: User Clicks "Play Daily Challenge"

```
1. Frontend: Play2048.tsx (user clicks Daily Challenge card)
   ↓
2. Frontend: rpcChain2048.startDailySession(address, password)
   ↓
3. Frontend HTTP: POST http://localhost:15003/v1/admin/tx-2048-start-daily
   Body: { address, password, utcDate }
   ↓
4. Backend Go: cmd/rpc/game2048.go → Game2048StartDaily()
   - Calculates fee (25 PROOF default)
   - Generates game ID
   - Loads player account
   - Builds transaction with MessageStartDailyGame
   ↓
5. Backend Go: cmd/rpc/admin.go → submitTransactionSync()
   - Signs transaction
   - Submits to mempool
   ↓
6. Backend Go → FSM → Plugin: CheckTx phase
   Plugin: contract.ts → ContractAsync.CheckTx()
   - Validates MessageStartDailyGame
   - Checks fee >= 25 PROOF
   ↓
7. Backend Go → FSM → Plugin: DeliverTx phase (in block)
   Plugin: contract.ts → DeliverMessageStartDailyGame()
   - Reads player balance from state
   - Checks if daily attempt already exists
   - Splits fee into pools (60% reward, 20% shop, 15% reserve, 5% platform)
   - Creates GameSession with seed
   - Writes DailyAttempt record
   - Updates pool balances
   ↓
8. Backend Go: Returns response to frontend
   Response: { gameId, seed, ... }
   ↓
9. Frontend: Play2048.tsx receives session
   - Navigates to /play?mode=daily&gameId=xxx
   - Initializes board with seed
   - Starts gameplay
```

#### Example 2: User Submits Score

```
1. Frontend: Play2048.tsx (game ends, user clicks Submit)
   ↓
2. Frontend: rpcChain2048.submitScore(address, gameId, moves, score, maxTile, stopReason)
   ↓
3. Frontend HTTP: POST http://localhost:15003/v1/admin/tx-2048-submit
   Body: { address, gameId, moves, declaredScore, declaredMaxTile, stopReason }
   ↓
4. Backend Go: cmd/rpc/game2048.go → Game2048Submit()
   - Builds MessageSubmitGameResult
   ↓
5. Backend → FSM → Plugin: CheckTx
   Plugin: checkMessageSubmitGameResult()
   ↓
6. Backend → FSM → Plugin: DeliverTx
   Plugin: DeliverMessageSubmitGameResult()
   - Loads GameSession from state
   - Validates session ownership
   - **DETERMINISTIC REPLAY:**
     * Initializes board with session.seed
     * Replays all moves[]
     * Verifies final score/max tile match declared values
   - If Daily: writes to DailySubmission, updates leaderboard
   - If Classic: calculates points, updates monthly leaderboard
   - Completes session
   ↓
7. Backend: Returns result
   ↓
8. Frontend: Shows success, redirects to profile/leaderboard
```

#### Example 3: User Claims Daily Reward

```
1. Frontend: Profile.tsx (user clicks "Claim Reward" for a past day)
   ↓
2. Frontend: rpcChain2048.claimDailyReward(address, utcDate, password)
   ↓
3. Frontend HTTP: POST http://localhost:15003/v1/admin/tx-2048-claim-daily
   ↓
4. Backend → Plugin: DeliverMessageClaimDailyReward()
   - Loads DailyRewardAllocation for (utcDate, address)
   - Checks reward hasn't been claimed
   - Checks day is finalized
   - Transfers reward from DailyRewardPool to player
   - Records DailyRewardClaim
   ↓
5. Frontend: Displays success, updates balance
```

#### Example 4: User Redeems Classic Points in Shop

```
1. Frontend: Shop.tsx (user enters amount, clicks Redeem)
   ↓
2. Frontend: rpcChain2048.redeemPoints(address, burnPoints, password)
   ↓
3. Frontend HTTP: POST http://localhost:15003/v1/admin/tx-2048-redeem-points
   ↓
4. Backend → Plugin: DeliverMessageRedeemClassicPoints()
   - Loads PlayerStats, validates balance
   - Calculates payout (500 points = 1 PROOF default)
   - Validates minimum and step increment
   - Burns points from PlayerStats
   - Transfers PROOF from Shop Pool to player
   - Records ClassicPointRedemption
   ↓
5. Frontend: Updates UI with new balance and points
```


#### Example 5: User Claims Daily Check-In

```
1. Frontend: CheckIn.tsx (user clicks "Check In")
   ↓
2. Frontend: rpcChain2048.claimDailyLogin(address, password)
   ↓
3. Frontend HTTP: POST http://localhost:15003/v1/admin/tx-2048-claim-login
   ↓
4. Backend → Plugin: DeliverMessageClaimDailyLoginReward()
   - Loads PlayerStats for streak info
   - Calculates next streak day
   - Determines reward points (day 1 = 100, day 7 = 500)
   - If day 7: grants classic points bonus for that day
   - Updates PlayerStats with new streak
   - Records DailyLoginClaim
   ↓
5. Frontend: Displays reward, updates streak display
```

#### Example 6: Leaderboard Query

```
1. Frontend: Leaderboard.tsx (loads daily leaderboard)
   ↓
2. Frontend: api.getDailyLeaderboard(utcDate)
   ↓
3. Frontend HTTP: GET http://localhost:15002/v1/query/2048/daily-leaderboard?date=2026-07-23
   ↓
4. Backend Go: cmd/rpc/game2048.go → Game2048DailyLeaderboard()
   - Constructs query for state prefix scan
   - Calls FSM query endpoint
   ↓
5. Backend → FSM → Plugin: queryState()
   - Scans keys with prefix KeyForDailyLeaderboard(utcDate)
   - Returns top N entries (sorted by inverted score)
   ↓
6. Backend: Decodes LeaderboardEntry objects
   - Enhances with usernames
   - Formats response
   ↓
7. Frontend: Renders ranked list with player names, scores, ranks
```

---

## 4. Competition Architecture

### Game Modes

ProofArcade supports **4 game modes**:

1. **Playtest** (Local Only)
2. **Classic** (Monthly Cumulative Competition)
3. **Daily Challenge** (Daily Prize Pool)
4. **Weekly Blitz** (5-Minute Timed, Cumulative Weekly)

### Mode Comparison

| Mode | Fee | Limits | Verification | Rewards | Leaderboard |
|------|-----|--------|--------------|---------|-------------|
| **Playtest** | Free | None | None | None | None |
| **Classic** | 2 PROOF | None | Replay | Classic Points | Monthly Cumulative |
| **Daily** | 25 PROOF | 1 per day | Replay | Prize Pool Share | Daily Ranked |
| **Weekly Blitz** | 5 PROOF | 2 Official + 3 Retries/day | Replay + Timer | Prize Pool (TBD) | Weekly Cumulative |

### Playtest Mode

**Purpose:** Free practice with zero friction

**Implementation:**
- **File:** `cmd/rpc/web/explorer/src/pages/Playtest.tsx`
- **Storage:** localStorage only
- **No Blockchain Interaction:** Entirely client-side
- **No Wallet Required**

**Flow:**
```
User → Playtest page
  → Game runs in browser with local RNG
  → Score saved to localStorage
  → No verification, no rewards
```


### Classic Mode (Monthly Competition)

**Purpose:** Earn spendable classic points, compete in monthly cumulative leaderboard

**Key Features:**
- Entry fee: 2 PROOF (configurable)
- No daily limits
- Successful runs earn classic points based on score
- Daily earning cap: 2000 points per UTC day
- Points redeemable in Shop
- Monthly leaderboard tracks cumulative score

**Contract Files:**
- `competition/session.ts` - createClassicSession()
- `profile/points.ts` - calculateClassicPoints()
- `economy/fee-distribution.ts` - splitClassicFee()

**State Keys:**
- `KeyForGameSession(gameId)` - session data
- `KeyForPlayerStats(address)` - cumulative stats and points balance
- `KeyForClassicPointsDailyLedger(utcDate, address)` - daily earning tracking
- `KeyForMonthlyLeaderboard(monthId, score, gameId)` - leaderboard entry
- `KeyForMonthlyPlayerEntry(monthId, address)` - player's monthly cumulative record

**Fee Split (Classic):**
```typescript
splitClassicFee() {
  Platform: 5% (default)
  Reserve: 15%
  Shop: 80%
}
```

**Points Calculation:**
```typescript
calculateClassicPoints(score, maxTile) {
  basePoints = score / 10
  tileBonus = maxTile >= 2048 ? score * 0.1 : 0
  total = basePoints + tileBonus
  
  // Apply daily cap
  alreadyEarnedToday = read from ClassicPointsDailyLedger
  remaining = dailyCap - alreadyEarnedToday
  return min(total, remaining)
}
```

### Daily Challenge Mode

**Purpose:** Shared daily competition with prize pool rewards

**Key Features:**
- Entry fee: 25 PROOF (configurable)
- ONE attempt per wallet per UTC day
- Deterministic daily seed (same board for everyone that day)
- Leaderboard ranked by score
- Prize pool split among top 10 (or fewer)
- Rewards claimable after UTC day ends

**Contract Files:**
- `competition/session.ts` - createDailySession()
- `competition/prize-pool.ts` - addDailyPoolEntry(), finalizeDailyPool()
- `competition/rewards.ts` - finalizeDailyRewardPoolIfNeeded()
- `economy/fee-distribution.ts` - splitDailyFee()

**State Keys:**
- `KeyForGameSession(gameId)` - session data
- `KeyForDailyAttempt(utcDate, address)` - prevents duplicate attempts
- `KeyForDailySubmission(utcDate, address)` - recorded submission
- `KeyForDailyPrizePool(utcDate)` - pool balance and finalization status
- `KeyForDailyLeaderboard(utcDate, score, ...)` - sorted entries
- `KeyForDailyRewardAllocation(utcDate, rank, gameId)` - finalized rewards
- `KeyForDailyRewardByPlayer(utcDate, address)` - quick player lookup
- `KeyForDailyRewardClaim(utcDate, address)` - claim tracking

**Fee Split (Daily):**
```typescript
splitDailyFee() {
  Reward Pool: 60%
  Shop: 20%
  Reserve: 15%
  Platform: 5%
}
```

**Daily Seed:**
```typescript
// Deterministic seed per UTC day
seed = sha256(genesisHash || chainId || utcDate)
```

**Reward Distribution:**
- If ≥10 players: Use full payout table (e.g., 1st: 35%, 2nd: 20%, ...)
- If <10 players: Renormalize percentages across actual finishers
- Example: 3 players → redistribute 100% across those 3 ranks

**Finalization:**
- Automatically triggered on first claim attempt after day ends
- Reads leaderboard, calculates rewards, writes allocations
- Sets `finalized: true` on DailyPrizePool


### Weekly Blitz Mode

**Purpose:** Fast-paced 5-minute timed runs with cumulative weekly scoring

**Status:** ✅ **IMPLEMENTED** (Recently completed)

**Key Features:**
- Entry fee: 5 PROOF
- 5-minute timer (300 seconds)
- Daily limits: 2 Official Runs + 3 Retries per UTC day
- Week definition: Monday 00:00 UTC → Sunday 23:59 UTC
- Cumulative scoring: All runs add to weekly total
- Stop reason: TIMER_EXPIRED when time runs out

**Contract Files:**
- **Main:** `competition/weekly-blitz.ts` (350+ lines helper module)
- Session creation, timer enforcement, state key functions
- Week ID calculation, fee splits, tracking types

**State Keys (Weekly Blitz-specific):**
```typescript
KeyForWeeklyBlitzDailyTracking(utcDate, address) // Run limits per day
KeyForWeeklyBlitzScore(weekId, address)          // Cumulative score
KeyForWeeklyBlitzLeaderboard(weekId, ...)        // Leaderboard
KeyForWeeklyBlitzPool(weekId)                    // Prize pool
KeyForWeeklyBlitzSession(gameId)                 // Session with timer
```

**Week Calculation:**
```typescript
const WEEK_SECONDS = 7 * 24 * 60 * 60
const EPOCH_OFFSET = 4 * 24 * 60 * 60  // Thursday offset for Monday start
weekId = Math.floor((currentUnix - EPOCH_OFFSET) / WEEK_SECONDS)
```

**Fee Split (Weekly Blitz):**
```typescript
splitWeeklyBlitzFee() {
  Weekly Prize Pool: 60%
  Shop: 20%
  Reserve: 15%
  Platform: 5%
}
```

**Timer Enforcement:**
- Session created with `expiresAtUnix = startTime + 300s`
- Each move checks: `if (currentTime > expiresAtUnix) reject`
- Frontend displays countdown timer
- Auto-submit on expiration with `TIMER_EXPIRED` stop reason

**Daily Tracking:**
```typescript
WeeklyBlitzDailyTracking {
  utcDate: string
  officialRunsUsed: number  // Max 2
  retriesUsed: number       // Max 3 (frontend only)
}
```

**Implementation Files:**
- Contract: `plugin/typescript/src/contract/competition/weekly-blitz.ts`
- Backend: `cmd/rpc/game2048.go` (handlers for start/submit)
- Frontend: `cmd/rpc/web/explorer/src/pages/Play2048.tsx` (timer overlay)

---

### Shared Competition Framework

**What's Common Across Modes:**

1. **Session Lifecycle** (`competition/session.ts`)
   - `createSession()` - generates game ID, records start time
   - `decodeSession()` - reads from state
   - `completeSession()` - marks as COMPLETED
   - `isSessionActive()` - validates session status

2. **Replay Verification** (`game2048-replay.ts`)
   - `replayGame(seed, moves)` - deterministic board simulation
   - Used by ALL paid modes (Daily, Classic, Weekly Blitz)
   - Validates declared score/max tile against replay result

3. **Leaderboard Entry** (`competition/session.ts`)
   - `createLeaderboardEntry()` - standard format
   - Includes: score, maxTile, moveCount, endedAtUnix, username

4. **Fee Distribution** (`economy/fee-distribution.ts`)
   - Mode-specific split functions
   - All update pool balances atomically

**What's Mode-Specific:**

| Feature | Daily | Classic | Weekly Blitz |
|---------|-------|---------|--------------|
| Seed | Daily deterministic | Per-session random | Per-session random |
| Limits | 1 per day | None | 2 official + 3 retry per day |
| Scoring | Single best | Monthly cumulative | Weekly cumulative |
| Reward | Prize pool share | Classic points | Prize pool (TBD) |
| Timer | None | None | 5 minutes |


---

## 5. State Architecture

### Major Blockchain State Objects

#### GameConfig
**Purpose:** System-wide configuration parameters  
**Key:** `KeyForGameConfig()`  
**Proto:** `GameConfig`

**Contains:**
- Fee amounts (classicStartFee, dailyStartFee)
- Leaderboard sizes
- Fee split percentages (BPS)
- Daily max moves
- Shop redemption rates
- Login reward ladder
- Classic points daily cap

**Access Pattern:**
- Read in nearly every transaction
- Written only during genesis/migrations
- Used for validation and calculation

#### GameSession
**Purpose:** Active and completed game runs  
**Key:** `KeyForGameSession(gameId)`  
**Proto:** `GameSession`

**Contains:**
```typescript
{
  gameId: Uint8Array
  playerAddress: Uint8Array
  mode: GameMode (DAILY/CLASSIC/WEEKLY_BLITZ)
  utcDate: string           // For daily mode
  seed: Uint8Array           // For replay
  status: SessionStatus
  startedHeight: number
  startedAtUnix: number
  feePaid: number
  maxMoves: number           // 0 for classic
  submittedScore: number
  submittedMaxTile: number
  finalMoveCount: number
  stopReason: StopReason
  submittedAtUnix: number
  expiresAtUnix: number      // For timed modes (Weekly Blitz)
  weekId: number             // For Weekly Blitz
}
```

**Lifecycle:**
1. Created: On MessageStartDailyGame/Classic/WeeklyBlitz
2. Updated: On MessageSubmitGameResult (adds score, marks COMPLETED)
3. Read: During submit validation, admin queries

#### PlayerStats
**Purpose:** Aggregate player performance and resources  
**Key:** `KeyForPlayerStats(address)`  
**Proto:** `PlayerStats`

**Contains:**
```typescript
{
  playerAddress: Uint8Array
  dailyGamesStarted: number
  classicGamesStarted: number
  gamesCompleted: number
  wins: number
  losses: number
  bestDailyScore: number
  bestClassicScore: number
  bestTile: number
  totalScore: number
  classicPointsBalance: number    // Spendable in shop
  classicPointsEarned: number     // Lifetime total
  loginStreak: number             // Check-in streak
  lastLoginClaimUtcDate: string
  classicPointsBonusUtcDate: string  // Day 7 bonus
}
```

**Updated By:**
- Every game start (increment counters)
- Every game submit (update bests, add score)
- Classic submit (add points)
- Shop redemption (deduct points)
- Daily check-in (update streak, add points)

#### DailyPrizePool
**Purpose:** Daily competition prize pool tracking  
**Key:** `KeyForDailyPrizePool(utcDate)`  
**Proto:** `DailyPrizePool`

**Contains:**
```typescript
{
  utcDate: string
  entryCount: number
  grossFees: number
  treasuryFees: number
  rewardPool: number
  finalized: boolean
  finalizedAtUnix: number
  distributedRewards: number
  treasuryLeftover: number
}
```

**Lifecycle:**
1. Created: First daily game of that date
2. Updated: Each daily game adds entry
3. Finalized: On first claim attempt after day ends
4. Read: During reward claims, admin queries



#### PlayerIdentity / UsernameRegistration
**Purpose:** Player username and identity information  
**Keys:** 
- `KeyForPlayerIdentity(address)` - Modern format (PlayerIdentity proto)
- `KeyForUsernameByAddress(address)` - Legacy format (UsernameRegistration proto)
- `KeyForAddressByUsername(normalizedUsername)` - Reverse lookup

**Modern Format (PlayerIdentity):**
```typescript
{
  playerAddress: Uint8Array
  username: string
  avatarUrl: string          // Optional
  title: string              // Optional
  bio: string                // Optional
  registeredAtUnix: number
  lastUpdatedUnix: number
}
```

**Legacy Format (UsernameRegistration):**
```typescript
{
  playerAddress: Uint8Array
  username: string
  registeredAtUnix: number
  lastChangedAtUnix: number
}
```

**Migration Strategy:**
- Both formats coexist during transition
- New writes use PlayerIdentity
- Reads check PlayerIdentity first, fallback to UsernameRegistration
- Username validation: 3-20 chars, alphanumeric + underscore
- Case-insensitive uniqueness (normalized to lowercase for lookup)

**Files:**
- `profile/identity.ts` - Encoding/decoding, validation
- `profile/types.ts` - Type definitions

#### LeaderboardEntry
**Purpose:** Ranked competition entries  
**Keys:**
- `KeyForDailyLeaderboard(utcDate, invertedScore, gameId)` - Daily sorted
- `KeyForMonthlyLeaderboard(monthId, invertedScore, gameId)` - Monthly cumulative
- `KeyForWeeklyBlitzLeaderboard(weekId, invertedScore, gameId)` - Weekly cumulative

**Structure:**
```typescript
{
  gameId: Uint8Array
  playerAddress: Uint8Array
  score: number
  maxTile: number
  moveCount: number
  endedAtUnix: number
  username: string           // Populated from identity lookup
}
```

**Sorting:**
- Stored with inverted score: `0xFFFFFFFF - score`
- Enables prefix scan in descending order
- Daily: One entry per player (best score)
- Monthly/Weekly: Cumulative (sum of all runs)

**Query Pattern:**
```typescript
// Scan top 10 daily entries
ScanPrefix(KeyForDailyLeaderboardPrefix('2026-07-23'))
  → Returns entries in rank order
```

#### DailyRewardAllocation
**Purpose:** Finalized daily reward distributions  
**Keys:**
- `KeyForDailyRewardAllocation(utcDate, rank, gameId)`
- `KeyForDailyRewardByPlayer(utcDate, address)` - Quick player lookup

**Structure:**
```typescript
{
  utcDate: string
  playerAddress: Uint8Array
  gameId: Uint8Array
  rank: number               // 1-based ranking
  rewardAmount: number       // In uproof
  score: number
  maxTile: number
  moveCount: number
  endedAtUnix: number
}
```

**Lifecycle:**
1. Created during pool finalization (runs once per day)
2. Read during claim attempts
3. Marked as claimed in separate DailyRewardClaim record

**Payout Calculation:**
```typescript
// If >=10 players: Use full table
payoutBps = [3500, 2000, 1200, 900, 700, 600, 500, 400, 400, 300]

// If <10 players: Renormalize
actualPayoutBps = renormalizePayoutTable(payoutBps, actualPlayerCount)
rewardAmount = (rewardPool * actualPayoutBps[rank-1]) / 10000
```


#### ClassicPointsDailyLedger
**Purpose:** Track classic points earned per UTC day (for daily cap enforcement)  
**Key:** `KeyForClassicPointsDailyLedger(utcDate, address)`  
**Proto:** `ClassicPointsDailyLedger`

**Structure:**
```typescript
{
  utcDate: string
  playerAddress: Uint8Array
  pointsEarned: number       // Base points (excludes bonus)
}
```

**Usage:**
```typescript
// During classic game submit
const ledgerKey = KeyForClassicPointsDailyLedger(today, playerAddress)
const existingPoints = loadLedger(ledgerKey)
const remaining = DAILY_CAP - existingPoints
const cappedPoints = Math.min(calculatedPoints, remaining)
// Write back: existingPoints + cappedPoints
```

**Daily Cap:**
- Default: 2000 points per UTC day
- Configurable via GameConfig.classicDailyPointsCap
- Bonus points (from check-in day 7) DO NOT count against cap
- Resets at UTC midnight

#### ClassicPointRedemption
**Purpose:** Track shop redemptions  
**Key:** `KeyForClassicPointRedemption(redeemedAtUnix, address)`  
**Proto:** `ClassicPointRedemption`

**Structure:**
```typescript
{
  playerAddress: Uint8Array
  burnPoints: number
  payoutAmount: number       // In uproof
  redeemedAtUnix: number
  txHash: string
}
```

**Redemption Rules:**
- Minimum: 500 points (configurable)
- Step: 500 points (must be multiple)
- Exchange rate: 500 points = 1 PROOF (configurable)
- Payout source: Shop pool (preferred) or DAO pool (fallback)

**Validation:**
```typescript
validateRedemption() {
  ✓ burnPoints >= shopMinRedeemPoints
  ✓ burnPoints % shopRedeemStepPoints === 0
  ✓ playerBalance >= burnPoints
  ✓ payoutAmount > 0
  ✓ selectedPool.balance >= payoutAmount
  ✓ treasury.shopBalance >= payoutAmount
}
```

**Files:**
- `shop/redemption.ts` - Record creation
- `shop/validation.ts` - Validation logic
- `shop/pricing.ts` - Payout calculation

#### DailyLoginClaim
**Purpose:** Track daily check-in rewards  
**Key:** `KeyForDailyLoginClaim(utcDate, address)`  
**Proto:** `DailyLoginClaim`

**Structure:**
```typescript
{
  utcDate: string
  playerAddress: Uint8Array
  streakDay: number          // 1-7 (cycles)
  rewardPoints: number
  bonusBps: number           // Non-zero on day 7
  claimedAtUnix: number
}
```

**Streak Mechanics:**
- 7-day cycle: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 1
- Consecutive days required
- Breaks reset to day 1
- Day 7 grants bonus BPS (20% default) for that UTC day

**Reward Schedule (Default):**
```typescript
[10, 20, 30, 40, 50, 60, 100] // points per day
bonusBps = 2000 // 20% on day 7
```

**Files:**
- `checkin/streak.ts` - Streak calculation
- `checkin/rewards.ts` - Reward calculation
- `checkin/types.ts` - Type definitions


#### Pool Balances
**Purpose:** Track treasury pool balances  
**Key:** `KeyForPool(poolId)`  
**Proto:** Canopy framework `Pool`

**Pool IDs (from `utils/state.ts`):**
```typescript
export const PoolIDs = {
  DAO: 131071,               // 0x01FFFF - DAO treasury
  PLATFORM: 131072,          // 0x020000 - Platform fees
  RESERVE: 131073,           // 0x020001 - Reserve fund
  SHOP: 131074,              // 0x020002 - Shop redemption pool
  DAILY: 131075,             // 0x020003 - Daily prize pools
  MONTHLY: 131076,           // 0x020004 - Monthly competition prizes
  WEEKLY: 131077             // 0x020005 - Weekly Blitz prizes
}
```

**Pool Structure:**
```typescript
{
  id: number
  balance: Long              // In uproof
  // ... Canopy framework fields
}
```

**Balance Updates:**
- Fee distribution (after each game start)
- Reward payouts (claims, redemptions)
- Admin transfers (pool management)

**Admin Operations:**
- Transfer between pools (`AdminPoolTransferRoutePath`)
- Withdraw to external wallet (`AdminPoolWithdrawalRoutePath`)
- Deposit from wallet to reserve (`AdminPoolDepositRoutePath`)

**Files:**
- Backend: `cmd/rpc/admin.go` - Pool management handlers
- Frontend: `pages/AdminPoolManagement.tsx` - Admin UI

#### PlayerBan
**Purpose:** Ban/unban player accounts  
**Key:** `KeyForPlayerBan(address)`  
**Proto:** `PlayerBan`

**Structure:**
```typescript
{
  playerAddress: Uint8Array
  isBanned: boolean
  reason: string
  bannedAtUnix: number
  bannedByAddress: Uint8Array  // Admin who issued ban
  unbannedAtUnix: number       // If unbanned
  unbannedByAddress: Uint8Array
}
```

**Enforcement:**
- Checked at transaction entry (CheckTx)
- Blocked transactions: All game operations
- Allowed: Read queries (leaderboards, stats)
- Admins can ban/unban via admin endpoints

**Files:**
- Contract: Handler in `contract.ts` (MessageBanPlayer, MessageUnbanPlayer)
- Backend: `cmd/rpc/admin.go` - Ban endpoints
- Frontend: `pages/AdminPlayers.tsx` - Ban management UI

---

## 6. Services Architecture

### Backend RPC Organization

**Main Files:**
- `cmd/rpc/server.go` - Server initialization and lifecycle
- `cmd/rpc/routes.go` - Route definitions (120+ routes)
- `cmd/rpc/query.go` - Query endpoint handlers
- `cmd/rpc/game2048.go` - Game-specific handlers
- `cmd/rpc/admin.go` - Admin operations
- `cmd/rpc/admin_auth.go` - Admin authentication middleware
- `cmd/rpc/types.go` - Request/response types

### Server Initialization (`server.go`)

```go
func NewServer(controller *controller.Controller, config lib.Config) *Server {
  // Load admin config
  adminConfig := LoadAdminConfig(config.DataDirPath)
  
  return &Server{
    controller: controller,
    config: config,
    rcManager: NewRCManager(),      // Root chain queries
    indexerBlobCache: newCache(100), // Block indexing cache
    adminConfig: adminConfig,
  }
}

func (s *Server) Start() {
  // Start 3 HTTP servers concurrently
  go s.startRPC(createRouter(s), s.config.RPCPort)        // 15002 - Queries
  go s.startRPC(createAdminRouter(s), s.config.AdminPort) // 15003 - Admin/Tx
  go s.startRPC(createDebugRouter(), s.config.ProfilingPort)
  
  // Background tasks
  go s.updatePollResults()           // Governance polls
  go s.rcManager.Start()             // Root chain sync
  go s.startEthRPCService()          // Ethereum compatibility
  
  // Static file servers
  s.startStaticFileServers()         // Wallet (5174), Explorer (5173)
}
```

**Port Assignment:**
- 15002: Query RPC (read-only, public)
- 15003: Admin RPC (transactions, authentication required)
- 5173: Explorer frontend (static files)
- 5174: Wallet frontend (static files)
- 50010: Plugin query server (internal)


### Route Organization (`routes.go`)

**Route Categories:**

1. **Query Routes** (Port 15002 - Public)
   - `/v1/query/height` - Current block height
   - `/v1/query/account` - Account balance
   - `/v1/query/blocks` - Block list
   - `/v1/query/txs-by-height` - Transactions at height
   - `/v1/query/2048/config` - Game configuration
   - `/v1/query/2048/player` - Player stats
   - `/v1/query/2048/leaderboards` - Leaderboards
   - `/v1/query/2048/daily-pool` - Prize pool info
   - 50+ query endpoints total

2. **Admin/Transaction Routes** (Port 15003 - Auth Required)
   - `/v1/admin/tx-2048-start-daily` - Start daily game
   - `/v1/admin/tx-2048-start-classic` - Start classic game
   - `/v1/admin/tx-2048-start-weekly-blitz` - Start weekly blitz
   - `/v1/admin/tx-2048-submit` - Submit game result
   - `/v1/admin/tx-2048-claim-daily-reward` - Claim daily reward
   - `/v1/admin/tx-2048-redeem-classic-points` - Redeem points
   - `/v1/admin/tx-2048-claim-daily-login` - Daily check-in
   - `/v1/admin/tx-2048-set-username` - Set username
   - `/v1/admin/pool-transfer` - Transfer between pools
   - `/v1/admin/pool-withdrawal` - Withdraw to wallet
   - `/v1/admin/pool-deposit` - Deposit to reserve
   - `/v1/admin/ban-player` - Ban player
   - `/v1/admin/unban-player` - Unban player
   - 70+ admin endpoints total

3. **Special Routes**
   - `/v1/admin/dev-faucet` - Development funding
   - `/v1/admin/verify` - Check admin status
   - `/v1/admin/admin-config` - Admin config info
   - `/v1/admin/validator-address` - Get validator address

### Admin Authentication (`admin_auth.go`)

**Configuration:**
```go
type AdminAuthConfig struct {
  Enabled        bool     `json:"enabled"`
  AdminAddresses []string `json:"admin_addresses"`
}
```

**Loading:**
```go
func LoadAdminConfig(dataDir string) *AdminAuthConfig {
  // 1. Check environment variable
  envAddresses := os.Getenv("CANOPY_ADMIN_ADDRESSES")
  if envAddresses != "" {
    return parseAddresses(envAddresses)
  }
  
  // 2. Check config file
  configPath := dataDir + "/admin_config.json"
  data, _ := os.ReadFile(configPath)
  // ... load from file
}
```

**Middleware:**
```go
func (s *Server) AdminAuthMiddleware(next httprouter.Handle) httprouter.Handle {
  return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
    // Skip if disabled
    if !s.adminConfig.Enabled {
      next(w, r, ps)
      return
    }
    
    // Check X-Admin-Address header
    address := r.Header.Get("X-Admin-Address")
    if !s.IsAdminAddress(address) {
      write(w, "Access denied", http.StatusForbidden)
      return
    }
    
    // Optional signature verification
    signature := r.Header.Get("X-Admin-Signature")
    if signature != "" {
      s.verifyAdminSignature(address, challenge, signature)
    }
    
    next(w, r, ps)
  }
}
```

**Usage in Routes:**
```go
func createAdminRouter(s *Server) *httprouter.Router {
  router := httprouter.New()
  
  // Public admin endpoints (no auth)
  router.POST("/v1/admin/verify", s.AdminVerify)
  router.GET("/v1/admin/admin-config", s.AdminConfig)
  
  // Protected endpoints (auth required)
  router.POST("/v1/admin/tx-2048-start-daily", 
    s.AdminAuthMiddleware(s.Game2048StartDaily))
  router.POST("/v1/admin/pool-transfer",
    s.AdminAuthMiddleware(s.AdminPoolTransfer))
  
  return router
}
```


### Transaction Handler Pattern (`game2048.go`)

**Typical Transaction Flow:**

```go
func (s *Server) Game2048StartDaily(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
  // 1. Parse request
  ptr := new(txRequest)
  if ok := unmarshal(w, r, ptr); !ok {
    return
  }
  
  // 2. Load keystore and get private key
  keystore, _ := crypto.NewKeystoreFromFile(s.config.DataDirPath)
  privateKey, _ := keystore.GetKey(ptr.Address, ptr.Password)
  
  // 3. Get fee from state
  minimumFee, _ := s.getFeeFromState(ptr, fsm.MessageStartDailyGameName)
  
  // 4. Build message
  message := &MessageStartDailyGame{
    playerAddress: ptr.Address,
    feePaid: ptr.Fee,
  }
  
  // 5. Create transaction
  tx, _ := fsm.NewTransaction(
    privateKey,
    message,
    s.config.NetworkID,
    s.config.ChainId,
    ptr.Fee,
    s.controller.ChainHeight(),
    ptr.Memo,
  )
  
  // 6. Marshal and submit
  txBytes, _ := lib.Marshal(tx)
  err := s.controller.SendTxMsgs([][]byte{txBytes})
  
  // 7. Return result
  if ptr.Submit {
    write(w, txHash, http.StatusOK)
  } else {
    write(w, tx, http.StatusOK) // Return unsigned for inspection
  }
}
```

**Transaction Types:**
- `NewTransaction()` - Generic transaction wrapper
- `NewSendTransaction()` - Send CNPY
- `NewStakeTx()` - Validator staking
- Message embedded in transaction.Msg field

### Query Handler Pattern (`query.go`)

**State Query Flow:**

```go
func (s *Server) Account(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
  // Use helper with callback
  s.heightAndAddressParams(w, r, func(state *fsm.StateMachine, address lib.HexBytes) (any, lib.ErrorI) {
    account, err := state.GetAccount(crypto.NewAddressFromBytes(address))
    if err != nil {
      return nil, err
    }
    return accountView(state, account), nil
  })
}

// Helper abstracts TimeMachine access
func (s *Server) heightAndAddressParams(w http.ResponseWriter, r *http.Request, 
  callback func(*fsm.StateMachine, lib.HexBytes) (any, lib.ErrorI)) {
  
  req := new(heightAndAddressRequest)
  if ok := unmarshal(w, r, req); !ok {
    return
  }
  
  // Create read-only state at height
  state, err := s.controller.FSM.TimeMachine(req.Height)
  if err != nil {
    write(w, err, http.StatusInternalServerError)
    return
  }
  defer state.Discard()
  
  // Execute callback
  result, err := callback(state, req.Address)
  if err != nil {
    write(w, err, http.StatusBadRequest)
    return
  }
  
  write(w, result, http.StatusOK)
}
```

**Game-Specific Queries:**

```go
func (s *Server) Game2048Player(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
  // Query plugin via RPC
  response, err := queryPlugin(
    s.config.PluginQueryPort, // 50010
    &QueryGame2048Player{Address: address},
  )
  
  // Decode and return
  playerStats := decodePlayerStats(response)
  write(w, playerStats, http.StatusOK)
}
```

### Plugin Query Server (Port 50010)

**Purpose:** Direct state queries without full blockchain traversal

**Handler Registration:**
```typescript
// In plugin/typescript/src/main.ts
plugin.RegisterQueryHandler('QueryGame2048Config', handleQueryConfig);
plugin.RegisterQueryHandler('QueryGame2048Player', handleQueryPlayer);
plugin.RegisterQueryHandler('QueryGame2048Leaderboards', handleQueryLeaderboards);
```

**Query Flow:**
```
Backend (Go) → HTTP POST to localhost:50010
  ↓
Plugin Query Server (TypeScript)
  ↓
Handler reads state directly
  ↓
Returns protobuf-encoded result
  ↓
Backend decodes and returns JSON
```

---

## 7. Frontend Architecture

### Routing Structure (`App.tsx`)

**Route Organization (40+ routes):**

```typescript
// Main Routes
/                          → HomePage (landing)
/auth                      → AuthPage (wallet login)
/profile                   → ProfilePage (private)
/player/:address           → PublicProfilePage
/play                      → Play2048Page (game UI)
/playtest                  → PlaytestPage (local only)
/leaderboard               → LeaderboardPage
/check-in                  → CheckInPage (daily login)
/shop                      → ShopPage (point redemption)
/settings                  → SettingsPage

// Explorer Routes
/explorer                  → ExplorerHomePage
/blocks                    → BlocksPage
/block/:blockHeight        → BlockDetailPage
/transactions              → TransactionsPage
/transaction/:hash         → TransactionDetailPage
/validators                → ValidatorsPage
/validator/:address        → ValidatorDetailPage
/accounts                  → AccountsPage
/account/:address          → AccountDetailPage
/analytics                 → NetworkAnalyticsPage

// Admin Routes (Protected)
/admin/login               → AdminLoginPage
/admin                     → AdminPage
/admin/economy             → AdminEconomyPage
/admin/competitions        → AdminCompetitionsPage
/admin/players             → AdminPlayersPage
/admin/shop                → AdminShopPage
/admin/monitoring          → AdminMonitoringPage
/admin/pool-management     → AdminPoolManagementPage
```

**Route Protection:**
```typescript
<Route path="/admin/*" element={
  <AdminProtectedRoute>
    <AdminPage />
  </AdminProtectedRoute>
} />
```


### State Management (TanStack Query)

**Global Configuration:**
```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,              // 30s
      refetchOnWindowFocus: true,
      retry: 1,
    }
  }
})
```

**Query Hooks (`hooks/useApi.ts`):**

```typescript
// Block polling (2s interval)
export const useLatestBlock = () => {
  return useQuery({
    queryKey: ['latestBlock'],
    queryFn: () => Blocks(1, 0),
    staleTime: 0,
    refetchInterval: 2000,
    refetchOnMount: 'always',
  });
};

// Player stats (20s interval)
export const usePlayerStats = (address: string) => {
  return useQuery({
    queryKey: ['player', address],
    queryFn: () => getPlayer(address),
    staleTime: 20000,
    enabled: !!address,
  });
};

// Leaderboard (30s interval)
export const useLeaderboard = (utcDate: string) => {
  return useQuery({
    queryKey: ['leaderboard', utcDate],
    queryFn: () => getDailyLeaderboard(utcDate),
    staleTime: 30000,
  });
};
```

**Query Invalidation:**
```typescript
// On new block detected
export const useBlockSubscription = () => {
  const queryClient = useQueryClient();
  const { data } = useLatestBlock();
  
  React.useEffect(() => {
    const height = extractLatestBlockHeight(data);
    if (height > lastHeight) {
      // Invalidate all block-dependent queries
      queryClient.invalidateQueries({ queryKey: ['cardData'] });
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  }, [data]);
};
```

### API Layer Architecture

**File Structure:**
```
lib/
├── api.ts              - REST API calls (blocks, txs, accounts)
├── rpcChain2048.ts     - Game-specific RPC client
├── chain2048.ts        - Game client abstraction
├── mockChain2048.ts    - Local mock backend
├── walletAuth.ts       - Session management
└── game2048.ts         - Game engine (board logic)
```

**API Abstraction (`lib/api.ts`):**

```typescript
// Centralized RPC URL management
export const rpcURL = window.__CONFIG__?.rpcURL || 'http://localhost:15002'
export const adminRPCURL = window.__CONFIG__?.adminRPCURL || 'http://localhost:15003'

// Generic fetch wrapper
async function rpcCall(endpoint: string, body?: any) {
  const response = await fetch(`${rpcURL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  })
  return response.json()
}

// Typed API functions
export async function Blocks(page: number, perPage: number) {
  return rpcCall('/v1/query/blocks', { pageNumber: page, perPage })
}

export async function Account(height: number, address: string) {
  return rpcCall('/v1/query/account', { height, address })
}
```

**Game Client (`lib/rpcChain2048.ts`):**

```typescript
export function createRpcGame2048Client(): { client: Game2048Client, isAvailable: () => Promise<boolean> } {
  return {
    async isAvailable() {
      try {
        await fetch(`${adminRPCURL}/v1/query/2048/config`)
        return true
      } catch {
        return false
      }
    },
    
    client: {
      async startSession(address, mode, password) {
        const endpoint = mode === 'daily' 
          ? '/v1/admin/tx-2048-start-daily'
          : mode === 'weekly-blitz'
          ? '/v1/admin/tx-2048-start-weekly-blitz'
          : '/v1/admin/tx-2048-start-classic'
          
        const response = await fetch(`${adminRPCURL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Address': address
          },
          body: JSON.stringify({ address, password, submit: true })
        })
        
        return response.json()
      },
      
      async submitSession(args) {
        return fetch(`${adminRPCURL}/v1/admin/tx-2048-submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Address': args.address
          },
          body: JSON.stringify({
            address: args.address,
            password: args.password,
            gameId: args.session.gameId,
            moves: args.moves,
            declaredScore: args.declaredScore,
            declaredMaxTile: args.declaredMaxTile,
            stopReason: args.stopReason,
            submit: true
          })
        })
      }
    }
  }
}
```


**Mock Backend (`lib/mockChain2048.ts`):**

```typescript
// localStorage-based simulation for playtest mode
export function startSession(address: string, mode: GameMode): SessionStart {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  
  const fee = mode === 'daily' ? state.config.dailyFee : state.config.classicFee
  if (player.balance < fee) {
    throw new Error('Insufficient balance')
  }
  
  player.balance -= fee
  const seed = mode === 'daily'
    ? createSeedFromText(`daily:${utcDate}`)
    : randomSeed()
  
  saveState(state)
  return { gameId, mode, seed, utcDate, maxMoves }
}
```

### Wallet Authentication (`lib/walletAuth.ts`)

**Session Management:**
```typescript
export interface StoredWalletAuth {
  address: string
  nickname: string
  password: string
  loggedInAt: string
  expiresAt: string
  lastActivityAt: string
}

const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000      // 24 hours
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000    // 2 hours
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000         // 5 minutes

// Session stored in sessionStorage (clears on browser close)
export function persistStoredWalletAuth(auth: Omit<StoredWalletAuth, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + MAX_SESSION_AGE_MS)
  const fullAuth = { ...auth, expiresAt, lastActivityAt: new Date() }
  sessionStorage.setItem('canopy-2048-wallet-auth-v1', JSON.stringify(fullAuth))
  startHeartbeat() // Keep session alive with periodic updates
}

// Check expiration
function isSessionExpired(auth: StoredWalletAuth): boolean {
  const now = Date.now()
  
  // Absolute expiration
  if (now > new Date(auth.expiresAt).getTime()) {
    return true
  }
  
  // Inactivity timeout
  if (now - new Date(auth.lastActivityAt).getTime() > INACTIVITY_TIMEOUT_MS) {
    return true
  }
  
  return false
}
```

**Password Handling:**
```typescript
export function getWalletPassword(address: string, providedPassword?: string): string {
  if (providedPassword) {
    return providedPassword
  }
  
  const auth = loadStoredWalletAuth()
  if (auth?.address === address && auth.password) {
    return auth.password
  }
  
  throw new Error('Wallet password required. Please log in again.')
}
```

### Component Architecture

**Layout Component (`components/app/PageShell.tsx`):**
```typescript
function PageShell({ children, maxWidthClass = 'max-w-[1200px]', paddingClass = 'px-4 py-8' }) {
  return <div className={`mx-auto ${maxWidthClass} ${paddingClass}`}>{children}</div>
}
```

**Navbar (`components/Navbar.tsx`):**
- Displays current block height (live updates)
- Wallet connection indicator
- Admin status indicator
- Network selection (if configured)
- Navigation links

**Game UI (`pages/Play2048.tsx`):**
```typescript
export default function Play2048Page() {
  const [gameMode, setGameMode] = useState<'daily' | 'classic' | 'weekly-blitz'>()
  const [session, setSession] = useState<SessionStart>()
  const [gameState, setGameState] = useState<BoardState>()
  const [moves, setMoves] = useState<MoveDirection[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number>()
  
  // Timer for Weekly Blitz
  useEffect(() => {
    if (gameMode === 'weekly-blitz' && session) {
      const interval = setInterval(() => {
        const remaining = session.expiresAtUnix - Date.now()
        if (remaining <= 0) {
          autoSubmit()
        } else {
          setTimeRemaining(remaining)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [session])
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = keyToDirection(e.key)
      if (direction) {
        handleMove(direction)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <div className="game-container">
      {timeRemaining && <TimerOverlay remaining={timeRemaining} />}
      <Board state={gameState} />
      <Controls onMove={handleMove} />
      <ScoreDisplay score={gameState.score} />
    </div>
  )
}
```

**Profile Page (`pages/Profile.tsx`):**
- Player stats display
- Claimable rewards list
- Game history
- Username management
- Classic points balance
- Check-in streak display

**Admin Pages:**
1. **AdminEconomyPage** - Pool balances, treasury overview
2. **AdminCompetitionsPage** - Competition status, finalization tools
3. **AdminPlayersPage** - Player search, ban management
4. **AdminShopPage** - Redemption history, rate configuration
5. **AdminMonitoringPage** - System metrics, event logs
6. **AdminPoolManagementPage** - Transfer, withdraw, deposit operations


### Shared Utilities

**Hooks:**
- `useApi.ts` - TanStack Query hooks for all RPC calls
- `useGame2048.ts` - Game session management
- `useWallet.ts` - Wallet connection state

**Components:**
- `Navbar.tsx` - Global navigation
- `Footer.tsx` - Footer links
- `PageShell.tsx` - Page layout wrapper
- `LoadingSpinner.tsx` - Loading states
- `ErrorBoundary.tsx` - Error handling

**Utils:**
- `formatters.ts` - Number/date formatting
- `validators.ts` - Input validation
- `constants.ts` - App-wide constants

---

## 8. Current Feature Inventory

### Game Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Playtest Mode** | ✅ | `Playtest.tsx`, `mockChain2048.ts` | N/A | Local only |
| **Classic Mode** | ✅ | `competition/session.ts`, `profile/points.ts` | `game2048.go` | `Play2048.tsx` |
| **Daily Challenge** | ✅ | `competition/session.ts`, `competition/prize-pool.ts` | `game2048.go` | `Play2048.tsx` |
| **Weekly Blitz** | ✅ | `competition/weekly-blitz.ts` | `game2048.go` | `Play2048.tsx` |
| **Score Submission** | ✅ | `contract.ts` (DeliverMessageSubmitGameResult) | `game2048.go` | `Play2048.tsx` |
| **Replay Verification** | ✅ | `game2048-replay.ts` | Plugin | Plugin |
| **Timer Enforcement** | ✅ | `weekly-blitz.ts` | Plugin | Frontend timer |

### Competition Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Daily Leaderboard** | ✅ | `competition/session.ts` | `game2048.go` (query) | `Leaderboard.tsx` |
| **Monthly Leaderboard** | ✅ | `competition/session.ts` | `game2048.go` (query) | `Leaderboard.tsx` |
| **Weekly Leaderboard** | ✅ | `competition/weekly-blitz.ts` | `game2048.go` (query) | `Leaderboard.tsx` |
| **Prize Pool Tracking** | ✅ | `competition/prize-pool.ts` | Plugin state | `Profile.tsx` |
| **Daily Reward Claims** | ✅ | `competition/rewards.ts` | `game2048.go` | `Profile.tsx` |
| **Auto-Finalization** | ✅ | `competition/rewards.ts` | Plugin (on first claim) | N/A |
| **Cumulative Scoring** | ✅ | `weekly-blitz.ts`, monthly logic | Plugin | Leaderboard |

### Economy Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Classic Points** | ✅ | `profile/points.ts` | Plugin | `Profile.tsx` |
| **Daily Earning Cap** | ✅ | `profile/points.ts` (ledger) | Plugin | N/A |
| **Point Redemption** | ✅ | `shop/redemption.ts` | `game2048.go` | `Shop.tsx` |
| **Fee Distribution** | ✅ | `economy/fee-distribution.ts` | Plugin | N/A |
| **Pool Management** | ✅ | Pool balances | `admin.go` | `AdminPoolManagement.tsx` |
| **Treasury Tracking** | ✅ | GameTreasury proto | Plugin | `AdminEconomy.tsx` |

### Profile Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Player Stats** | ✅ | `profile/stats.ts` | Plugin | `Profile.tsx` |
| **Username Registration** | ✅ | `profile/identity.ts` | `game2048.go` | `Profile.tsx` |
| **Public Profiles** | ✅ | Identity state | `game2048.go` (query) | `PublicProfile.tsx` |
| **Game History** | ✅ | Session queries | `game2048.go` (query) | `GameHistory.tsx` |
| **Daily Check-In** | ✅ | `checkin/` module | `game2048.go` | `CheckIn.tsx` |
| **Login Streak** | ✅ | `checkin/streak.ts` | Plugin | `CheckIn.tsx` |

### Admin Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Admin Authentication** | ✅ | `admin_auth.go` | Middleware | All admin pages |
| **Pool Transfers** | ✅ | N/A | `admin.go` | `AdminPoolManagement.tsx` |
| **Pool Withdrawals** | ✅ | N/A | `admin.go` | `AdminPoolManagement.tsx` |
| **Pool Deposits** | ✅ | N/A | `admin.go` | `AdminPoolManagement.tsx` |
| **Player Bans** | ✅ | `contract.ts` (ban messages) | `admin.go` | `AdminPlayers.tsx` |
| **Economy Monitoring** | ✅ | N/A | Query endpoints | `AdminEconomy.tsx` |
| **Competition Oversight** | ✅ | N/A | Query endpoints | `AdminCompetitions.tsx` |
| **System Metrics** | ✅ | N/A | `admin.go` (resource usage) | `AdminMonitoring.tsx` |

### Explorer Features (Implemented ✅)

| Feature | Status | Main Files | Backend | Frontend |
|---------|--------|------------|---------|----------|
| **Block Explorer** | ✅ | N/A | `query.go` | `BlocksPage.tsx` |
| **Transaction Browser** | ✅ | N/A | `query.go` | `TransactionsPage.tsx` |
| **Account Lookup** | ✅ | N/A | `query.go` | `AccountsPage.tsx` |
| **Validator List** | ✅ | N/A | `query.go` | `ValidatorsPage.tsx` |
| **Network Analytics** | ✅ | N/A | Aggregation | `NetworkAnalytics.tsx` |
| **Supply Tracking** | ✅ | N/A | `query.go` | `SupplyPage.tsx` |


### Features in Discussion/Planning (Not Implemented ❌)

| Feature | Status | Notes |
|---------|--------|-------|
| **Monthly Prize Pools** | ❌ Discussed | Monthly leaderboard exists but no prize distribution |
| **Weekly Blitz Rewards** | ❌ Discussed | Prize pool tracking exists but reward distribution TBD |
| **Public Profile Extensions** | ❌ Planned | Avatar, title, bio fields exist in proto but not fully utilized |
| **Social Features** | ❌ Discussed | Friends, followers not implemented |
| **Achievement System** | ❌ Discussed | Badges/achievements discussed but not built |
| **NFT Integration** | ❌ Discussed | Mentioned in early docs but not implemented |

---

## 9. Potential Problems & Architecture Issues

### 1. **Dead Code / Unused Files**

**Identified Issues:**
- ❌ **Multiple admin config files:** `admin_config.json` at root and in data directory
- ❌ **Backup directories:** `ban-feature-backup/` contains removed code
- ❌ **Legacy proto messages:** Some MessageTypes defined but no handlers (need verification)
- ❌ **Unused imports:** Several modules import functions not used

**Files to Review:**
```
e:\ProofArcade\admin_config.json                    # Duplicate?
e:\ProofArcade\ban-feature-backup\                  # Old implementation
e:\ProofArcade\ADMIN_*.md                          # 20+ documentation files (consolidate?)
```

### 2. **Inconsistent Naming Conventions**

**Contract Module Names:**
- ✅ Good: `profile/`, `shop/`, `checkin/` - clear domain names
- ⚠️ Mixed: `competition/` vs `game2048-replay.ts` (should be `competition/replay.ts`)
- ⚠️ Generic: `utils/` - too broad, consider splitting into `state/`, `time/`, `crypto/`

**State Key Prefixes:**
- ✅ Consistent: `KeyForPlayerStats()`, `KeyForGameSession()`
- ⚠️ Inconsistent: Some use singular (KeyForPlayerBan) vs plural (KeyForDailyLeaderboards)

**RPC Route Names:**
- ✅ Consistent: `/v1/admin/tx-2048-*` for transactions
- ⚠️ Mixed: `/v1/query/2048/*` vs `/v1/query/account` (inconsistent prefixing)

### 3. **Architecture Confusion Points**

**Problem: Plugin Location Ambiguity**
- ✅ **RESOLVED:** Contract is clearly at `plugin/typescript/src/contract/`
- ✅ **RESOLVED:** Modular structure implemented
- ⚠️ **Remaining:** Some developers may expect "smart contract" terminology

**Problem: Transaction vs Message Terminology**
- Transaction = Wrapper with signature, fee, nonce
- Message = Payload inside transaction
- ⚠️ Code uses both interchangeably in comments

**Problem: Pool ID Constants Duplication**
- PoolIDs defined in `utils/state.ts`
- ⚠️ Also hardcoded in various backend handlers
- **Risk:** If pool IDs change, updates needed in multiple places

### 4. **Refactoring Leftovers**

**Identified from History:**
- ✅ **Phase 1-7 Complete:** Modules extracted from monolithic `contract.ts`
- ⚠️ **Remaining in contract.ts:** ~2000 lines still need extraction
  - Validation logic could move to `validation/` module
  - Handler orchestration could move to `handlers/` module
  - Error definitions could move to `errors/` module

**What's Still in contract.ts (should be extracted):**
```typescript
// ~2000 lines in contract.ts:
- DeliverMessageStartDailyGame()        → handlers/daily-start.ts
- DeliverMessageStartClassicGame()      → handlers/classic-start.ts
- DeliverMessageSubmitGameResult()      → handlers/submit-game.ts
- DeliverMessageClaimDailyReward()      → handlers/claim-reward.ts
- DeliverMessageRedeemClassicPoints()   → handlers/redeem-points.ts
- DeliverMessageClaimDailyLoginReward() → handlers/claim-login.ts
- DeliverMessageSetUsername()           → handlers/set-username.ts
- DeliverMessageBanPlayer()             → handlers/ban-player.ts
- DeliverMessageUnbanPlayer()           → handlers/unban-player.ts
- CheckTx validation functions          → validation/
- Error constructors                    → errors/
```

### 5. **Duplicate Implementations**

**Prize Pool Finalization:**
- Logic exists in `competition/rewards.ts`
- ⚠️ Also manually callable via admin endpoint (potential double-finalization risk)
- **Mitigation:** `finalized: true` flag prevents duplicates

**Username Lookups:**
- Forward lookup: PlayerIdentity or UsernameRegistration
- Reverse lookup: AddressByUsername
- ⚠️ Three different proto messages for same data during migration
- **Plan:** Eventually remove UsernameRegistration legacy format

### 6. **Missing Error Handling**

**Frontend:**
- ⚠️ Some API calls lack error boundaries
- ⚠️ Network errors sometimes show console.error but no user feedback
- ⚠️ Session expiration handling could be more graceful

**Backend:**
- ⚠️ Some handlers return generic errors without specific codes
- ⚠️ Insufficient logging in critical paths (fee distribution, finalization)

**Plugin:**
- ✅ Good: Comprehensive error constructors (ErrInsufficientBalance, etc.)
- ⚠️ Some validation errors could provide more context


### 7. **Testing Gaps**

**Contract/Plugin:**
- ✅ Has: `game2048-replay.test.ts` - replay verification tests
- ❌ Missing: Unit tests for individual modules (profile, shop, checkin, etc.)
- ❌ Missing: Integration tests for full transaction flows
- ❌ Missing: Tests for edge cases (double claims, expired sessions, etc.)

**Backend:**
- ❌ Missing: Handler tests
- ❌ Missing: Authentication tests
- ❌ Missing: Pool management tests

**Frontend:**
- ❌ Missing: Component tests
- ❌ Missing: Hook tests
- ❌ Missing: Integration tests
- ❌ Missing: E2E tests

### 8. **Performance Concerns**

**Block Polling:**
- ⚠️ Frontend polls blocks every 2 seconds
- ⚠️ Multiple components subscribe to same data
- **Mitigation:** TanStack Query deduplicates requests
- **Future:** Consider WebSocket for real-time updates

**State Queries:**
- ⚠️ Leaderboard queries scan prefix (could be expensive with many entries)
- ⚠️ No pagination on some admin queries
- **Mitigation:** Hard limits on leaderboard sizes

**Frontend Bundle:**
- ⚠️ Large bundle size (React + TanStack Query + game engine)
- **Future:** Consider code splitting for admin pages

### 9. **Security Considerations**

**Admin Authentication:**
- ✅ Address-based whitelist implemented
- ✅ Optional signature verification
- ⚠️ Admin addresses stored in plain text config
- ⚠️ No rate limiting on admin endpoints

**Wallet Password Storage:**
- ✅ Stored in sessionStorage (clears on browser close)
- ✅ 24-hour max session age
- ✅ 2-hour inactivity timeout
- ⚠️ Password stored in plaintext in memory
- **Note:** Acceptable for development, consider hardware wallet for production

**Transaction Replay:**
- ✅ Game replay prevents cheating
- ✅ Deterministic verification
- ⚠️ No nonce/anti-replay for transactions (handled by Canopy framework)

### 10. **Documentation Gaps**

**What's Well Documented:**
- ✅ Module READMEs (checkin, shop, profile, economy)
- ✅ Proto definitions with comments
- ✅ Inline code comments in complex functions
- ✅ Architecture docs (this file)

**What's Missing:**
- ❌ API documentation (OpenAPI/Swagger spec)
- ❌ Deployment guide
- ❌ Developer onboarding guide
- ❌ Admin operations manual
- ❌ Troubleshooting guide
- ❌ Performance tuning guide

---

## 10. Final Architecture Summary

### System Organization

**ProofArcade is a three-tier blockchain game application:**

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  - Game UI (Play2048.tsx)                               │
│  - Profile pages (stats, history, claims)               │
│  - Admin tools (pool mgmt, player mgmt, monitoring)     │
│  - Explorer (blocks, txs, validators)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼────────────────────────────────────┐
│                  BACKEND RPC (Go)                        │
│  Port 15002: Query endpoints (public)                   │
│  Port 15003: Admin endpoints (authenticated)            │
│  - Transaction building                                 │
│  - Query aggregation                                    │
│  - Admin authentication                                 │
└────────────────────┬────────────────────────────────────┘
                     │ Canopy FSM Interface
┌────────────────────▼────────────────────────────────────┐
│              BLOCKCHAIN PLUGIN (TypeScript)              │
│  Port 50010: Plugin query server                        │
│  - Message handlers (CheckTx, DeliverTx)                │
│  - State management (key-value store)                   │
│  - Game logic (replay verification, scoring)            │
│  - Economy (fee distribution, prize pools)              │
│  - Profile (stats, identity, points)                    │
└──────────────────────────────────────────────────────────┘
```

### Where Major Subsystems Live

| Subsystem | Location | Key Files |
|-----------|----------|-----------|
| **Blockchain Contract** | `plugin/typescript/src/contract/` | `contract.ts`, modules under subdirs |
| **Game Modes** | `plugin/typescript/src/contract/competition/` | `session.ts`, `weekly-blitz.ts` |
| **Economy** | `plugin/typescript/src/contract/economy/` | `fee-distribution.ts` |
| **Profile** | `plugin/typescript/src/contract/profile/` | `stats.ts`, `identity.ts`, `points.ts` |
| **Shop** | `plugin/typescript/src/contract/shop/` | `redemption.ts`, `validation.ts`, `pricing.ts` |
| **Check-In** | `plugin/typescript/src/contract/checkin/` | `streak.ts`, `rewards.ts` |
| **Utils** | `plugin/typescript/src/contract/utils/` | `state.ts`, `time.ts`, `crypto.ts` |
| **Backend Handlers** | `canopy-main/cmd/rpc/` | `game2048.go`, `admin.go`, `query.go` |
| **Frontend** | `canopy-main/cmd/rpc/web/explorer/src/` | `pages/`, `components/`, `lib/` |


### How Frontend Communicates with Blockchain

**Query Flow (Read-Only):**
```
Component → useQuery hook
  ↓
lib/api.ts or lib/rpcChain2048.ts
  ↓
HTTP POST to localhost:15002/v1/query/*
  ↓
Backend Go handler (query.go, game2048.go)
  ↓
Option A: Read from FSM TimeMachine (historical state)
Option B: Query plugin via port 50010
  ↓
Decode protobuf, format JSON
  ↓
Return to frontend
  ↓
TanStack Query caches result
  ↓
Component re-renders with data
```

**Transaction Flow (Write):**
```
Component → form submission
  ↓
lib/rpcChain2048.ts
  ↓
HTTP POST to localhost:15003/v1/admin/tx-*
Headers: X-Admin-Address, Content-Type
Body: { address, password, ...params, submit: true }
  ↓
Backend Go handler (game2048.go, admin.go)
  ↓
Load keystore, decrypt private key with password
  ↓
Build protobuf Message (e.g., MessageStartDailyGame)
  ↓
Wrap in Transaction with signature, fee
  ↓
Submit to controller.SendTxMsgs()
  ↓
FSM processes: CheckTx → Mempool → DeliverTx
  ↓
Plugin CheckTx validates
  ↓
Plugin DeliverTx executes, writes state
  ↓
Backend returns txHash
  ↓
Frontend polls for confirmation (query by hash)
  ↓
Component updates UI
```

### How Competitions Work End-to-End

**Daily Challenge Flow:**

1. **Genesis/Config:** GameConfig defines fees, move limits, reward percentages
2. **Start Game:** Player pays 25 PROOF → split into pools → session created with daily seed
3. **Play:** Frontend uses deterministic seed to initialize board, player makes moves (max 80)
4. **Submit:** Moves array sent to backend → plugin replays → validates score/tile → writes to DailySubmission
5. **Leaderboard:** Entry written with inverted score key for sorted queries
6. **Day End:** First claim after UTC midnight triggers finalization
7. **Finalization:** Plugin reads leaderboard → calculates rewards → writes DailyRewardAllocation records
8. **Claim:** Player calls claim → plugin checks allocation → transfers from DailyRewardPool → marks claimed
9. **Repeat:** Next UTC day, new seed, new pool

**Classic Mode Flow:**

1. **Start Game:** Player pays 2 PROOF → split into pools (80% shop) → session created with random seed
2. **Play:** No move limit, no timer
3. **Submit:** Plugin replays → validates → calculates points (score/10 + tile bonus)
4. **Daily Cap:** Check ClassicPointsDailyLedger → cap at 2000 base points/day → write back
5. **Bonus:** If player claimed day 7 check-in, add 20% bonus (doesn't count toward cap)
6. **Monthly Leaderboard:** Add score to player's monthly cumulative entry
7. **Points Balance:** Update PlayerStats.classicPointsBalance
8. **Redemption:** Player redeems points in shop → burns points → receives PROOF from shop pool

**Weekly Blitz Flow:**

1. **Week Calculation:** weekId = floor((currentUnix - EPOCH_OFFSET) / WEEK_SECONDS)
2. **Daily Tracking:** 2 official runs + 3 retries per UTC day
3. **Start Game:** Player pays 5 PROOF → session created with expiresAtUnix = start + 300s
4. **Timer Enforcement:** Each move checks currentTime > expiresAtUnix → reject if expired
5. **Frontend Timer:** Countdown display, auto-submit on expiration
6. **Submit:** Same replay verification as other modes → add to weekly cumulative score
7. **Weekly Leaderboard:** All runs add to player's weekly total
8. **Prize Pool:** Tracks weekly balance (reward distribution TBD)

### How Rewards Work End-to-End

**Fee Distribution:**
```typescript
// Daily Game Entry (25 PROOF)
Platform:  5% → PoolIDs.PLATFORM
Reward:   60% → PoolIDs.DAILY_REWARD
Shop:     20% → PoolIDs.SHOP
Reserve:  15% → PoolIDs.RESERVE

// Classic Game Entry (2 PROOF)
Platform:  5% → PoolIDs.PLATFORM
Reserve:  15% → PoolIDs.RESERVE
Shop:     80% → PoolIDs.SHOP

// Weekly Blitz Entry (5 PROOF)
Platform:  5% → PoolIDs.PLATFORM
Reward:   60% → PoolIDs.WEEKLY
Shop:     20% → PoolIDs.SHOP
Reserve:  15% → PoolIDs.RESERVE
```

**Classic Points Economy:**
```
Earning:
  Play Classic → Score ÷ 10 → Base Points
  + Tile Bonus (if 2048+)
  → Cap at 2000 base points/UTC day
  + Day 7 Check-In Bonus (20%, not counted toward cap)
  → Write to ClassicPointsDailyLedger
  → Add to PlayerStats.classicPointsBalance

Spending:
  Shop Redemption → 500 points = 1 PROOF
  → Burn from classicPointsBalance
  → Pay from Shop Pool (or DAO fallback)
  → Record ClassicPointRedemption
```

**Daily Reward Distribution:**
```
Pool Accumulation:
  Each daily entry → 60% of 25 PROOF → DailyRewardPool
  Track in DailyPrizePool.rewardPool

Finalization (auto-triggered on first claim after UTC midnight):
  1. Read leaderboard for previous day
  2. Get top N players (max 10)
  3. Calculate payouts:
     If ≥10 players: Use full payout table [35%, 20%, 12%, ...]
     If <10 players: Renormalize to 100%
  4. Write DailyRewardAllocation for each rank
  5. Set finalized = true

Claiming:
  Player calls claim(utcDate)
  → Load allocation
  → Verify not already claimed
  → Transfer from DailyRewardPool to player
  → Write DailyRewardClaim
```


### Where to Implement Future Game Modes

**Step-by-Step for New Mode:**

1. **Add Proto Message** (`plugin/typescript/proto/game2048.proto`)
   ```protobuf
   message MessageStartNewMode {
     bytes player_address = 1;
     uint64 fee_paid = 2;
   }
   ```

2. **Create Module** (`plugin/typescript/src/contract/competition/new-mode.ts`)
   ```typescript
   export function createNewModeSession(
     playerAddress: Uint8Array,
     tx: any
   ): GameSession {
     return {
       gameId: generateGameId(playerAddress, tx),
       playerAddress,
       mode: GameMode.NEW_MODE,
       seed: deriveNewModeSeed(playerAddress, tx),
       status: SessionStatus.ACTIVE,
       startedHeight: tx.height,
       startedAtUnix: tx.time,
       feePaid: calculateNewModeFee(),
       maxMoves: 0, // or configure
     }
   }
   
   export function splitNewModeFee(feeAmount: number): FeeDistribution {
     return {
       platform: Math.floor(feeAmount * 0.05),
       reward: Math.floor(feeAmount * 0.60),
       shop: Math.floor(feeAmount * 0.20),
       reserve: Math.floor(feeAmount * 0.15),
     }
   }
   ```

3. **Add Handler** (`plugin/typescript/src/contract/contract.ts`)
   ```typescript
   async function DeliverMessageStartNewMode(
     contract: Contract,
     msg: MessageStartNewMode,
     tx: any
   ): Promise<DeliverTxResult> {
     // 1. Validate player not banned
     const ban = await loadPlayerBan(msg.playerAddress)
     if (ban?.isBanned) return { error: ErrPlayerBanned() }
     
     // 2. Create session
     const session = createNewModeSession(msg.playerAddress, tx)
     
     // 3. Distribute fees
     const distribution = splitNewModeFee(msg.feePaid)
     const transfers = buildFeeTransfers(msg.playerAddress, distribution)
     
     // 4. Write state
     await contract.plugin.StateWrite(contract, {
       sets: [
         { 
           key: KeyForGameSession(session.gameId),
           value: encodeGameSession(session)
         }
       ],
       poolTransfers: transfers
     })
     
     return { 
       events: [createSessionStartEvent(session)],
       sessionStart: session
     }
   }
   ```

4. **Add Backend Route** (`canopy-main/cmd/rpc/routes.go`)
   ```go
   Tx2048StartNewModeRoutePath = "/v1/admin/tx-2048-start-new-mode"
   Tx2048StartNewModeRouteName = "2048-start-new-mode"
   ```

5. **Add Backend Handler** (`canopy-main/cmd/rpc/game2048.go`)
   ```go
   func (s *Server) Game2048StartNewMode(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
     s.txHandler(w, r, func(pk crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
       if err := s.getFeeFromState(ptr, fsm.MessageStartNewModeName); err != nil {
         return nil, err
       }
       return fsm.NewStartNewModeTx(pk, ptr.Address, s.config.NetworkID, 
         s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
     })
   }
   ```

6. **Add Frontend Integration** (`lib/rpcChain2048.ts`)
   ```typescript
   async startNewMode(address: string, password?: string) {
     const response = await fetch(`${adminRPCURL}/v1/admin/tx-2048-start-new-mode`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-Admin-Address': address
       },
       body: JSON.stringify({ address, password, submit: true })
     })
     return response.json()
   }
   ```

7. **Update UI** (`pages/Play2048.tsx`)
   - Add mode selector
   - Add mode-specific rules display
   - Handle mode-specific gameplay

**Shared Components You Can Reuse:**
- Session creation logic (`competition/session.ts`)
- Replay verification (`game2048-replay.ts`)
- Fee distribution pattern (`economy/fee-distribution.ts`)
- Leaderboard entry creation (`competition/session.ts`)
- Player stats updates (`profile/stats.ts`)

### Key Design Patterns

**1. Module-Based Organization**
- Each domain (profile, shop, checkin, competition) is a module
- Modules export pure functions (no side effects)
- Handler orchestration stays in `contract.ts`

**2. State Key Generation**
- All state keys generated in `utils/state.ts`
- Consistent prefixes and encoding
- Support for prefix queries (leaderboards)

**3. Validation Before Execution**
- CheckTx: Fast validation (banned, balance, format)
- DeliverTx: Full execution with state reads/writes
- Replay verification: Deterministic game replay

**4. Encoding/Decoding Separation**
- `encodeX()` functions in `game2048.js`
- Type definitions in module `types.ts`
- Helpers in module implementation files

**5. Configuration-Driven**
- GameConfig stores all tunable parameters
- Modules read config via getter functions
- Defaults provided for missing values

**6. Idempotency Where Possible**
- Daily attempts: One per UTC day
- Login claims: One per UTC day
- Finalization: Flag prevents re-execution

### Testing Approach

**Current State:**
- ✅ Manual testing via frontend
- ✅ Replay verification tests (`game2048-replay.test.ts`)
- ❌ No unit tests for modules
- ❌ No integration tests

**Recommended Testing Strategy:**

1. **Unit Tests for Modules**
   ```typescript
   // test/profile/stats.test.ts
   describe('updateBestScore', () => {
     it('updates daily score when higher', () => {
       const stats = { bestDailyScore: 1000 }
       const updated = updateBestScore(stats, 2000, 'daily')
       expect(updated.bestDailyScore).toBe(2000)
     })
   })
   ```

2. **Integration Tests for Handlers**
   ```typescript
   // test/handlers/daily-game.test.ts
   describe('DeliverMessageStartDailyGame', () => {
     it('creates session and distributes fees', async () => {
       const result = await DeliverMessageStartDailyGame(contract, msg, tx)
       expect(result.sessionStart).toBeDefined()
       // Verify pool balances
     })
   })
   ```

3. **E2E Tests for Frontend**
   - Playwright or Cypress
   - Test complete flows (login → play → submit → claim)

---

## Conclusion

### Architecture Strengths

✅ **Clear Separation of Concerns**
- Plugin handles blockchain logic
- Backend handles transaction building and queries
- Frontend handles UI and user experience

✅ **Modular Contract Design**
- Recent refactoring (Phases 1-7) extracted domains into modules
- Each module is focused and testable
- Pure functions enable easy unit testing

✅ **Deterministic Game Verification**
- Replay-based validation prevents cheating
- Same seed + moves = same result (provable)
- Works for all paid modes

✅ **Flexible Competition Framework**
- Easy to add new game modes
- Shared components (session, leaderboard, replay)
- Mode-specific logic isolated

✅ **Comprehensive Admin Tools**
- Pool management for treasury operations
- Player moderation (bans)
- System monitoring and metrics

### Areas for Improvement

⚠️ **Continue Refactoring**
- ~2000 lines still in monolithic `contract.ts`
- Extract handlers into `handlers/` module
- Extract validation into `validation/` module

⚠️ **Add Testing**
- Unit tests for all modules
- Integration tests for handlers
- E2E tests for critical flows

⚠️ **Documentation**
- API documentation (OpenAPI spec)
- Deployment guide
- Developer onboarding
- Troubleshooting guide

⚠️ **Performance Optimization**
- Consider WebSockets for real-time updates
- Add pagination to all list queries
- Optimize leaderboard queries

⚠️ **Security Hardening**
- Rate limiting on admin endpoints
- Hardware wallet integration for production
- Audit admin authentication flow

---

## Document Metadata

**Created:** 2026-07-23  
**Author:** Architecture Analysis Task  
**Purpose:** Comprehensive read-only analysis of ProofArcade codebase  
**Scope:** Plugin, Backend, Frontend, All Game Modes, Admin Tools  
**Status:** ✅ COMPLETE

**Files Analyzed:** 50+ files across plugin, backend, and frontend  
**Lines Documented:** ~1100 lines of architecture documentation  
**Modules Covered:** All major subsystems documented

**Next Steps:**
1. Use this document as reference for future development
2. Continue Phase 8+ refactoring (extract remaining handlers)
3. Add comprehensive test suite
4. Update inline documentation
5. Create deployment and operations guides

---

**END OF ARCHITECTURE ANALYSIS**

