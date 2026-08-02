# Competition Module

**Owner**: Game competition and session domain  
**Purpose**: Manage game sessions, competition lifecycle, and prize pools

---

## Overview

The competition module handles all aspects of game competitions including:
- Game session creation (daily, classic, and weekly blitz modes)
- Session lifecycle management (active → completed)
- Daily and weekly prize pool tracking
- Leaderboard entry creation
- Competition finalization
- Timer-based gameplay (Weekly Blitz)

---

## Module Structure

```
competition/
├── types.ts         - Type definitions for sessions and pools
├── session.ts       - Session creation and management
├── prize-pool.ts    - Daily prize pool operations
├── weekly-blitz.ts  - Weekly Blitz mode implementation
├── rewards.ts       - Reward finalization
├── index.ts         - Barrel export
└── README.md        - This file
```

---

## Core Types

### GameSession
Represents an active or completed game:
- Game ID and player address
- Mode (daily = 1, classic = 2, weekly blitz = 3)
- Seed for deterministic gameplay
- Status (active vs completed)
- Move limits and results
- **Weekly Blitz**: Includes `expiresAtUnix` for 5-minute timer

### DailyPrizePool
Tracks daily competition prize pool:
- Entry count
- Fee accumulation (gross, treasury, rewards)
- Finalization status
- Distributed rewards

### WeeklyBlitzPool
Tracks weekly competition prize pool:
- Week ID (Monday-based)
- Entry count
- Fee accumulation (gross fees, prize pool)
- Finalization status

### WeeklyBlitzDailyTracking
Tracks daily play limits for Weekly Blitz:
- UTC date and week ID
- Official runs used (max 2 per day)
- Retries used (future feature)
- Last played timestamp

### WeeklyBlitzPlayerScore
Tracks cumulative score for the week:
- Total score across all runs
- Best single run score
- Official runs completed

### LeaderboardEntry
Records player performance on leaderboard:
- Score, max tile, move count
- Timestamp
- Optional username

---

## Session Functions

### Creating Sessions

```typescript
import { createDailySession, createClassicSession } from './competition';

// Create daily session
const sessionValue = createDailySession(
    gameId,
    playerAddress,
    '2026-04-23',
    chainId,
    startedHeight,
    startedAtUnix,
    feePaid,
    50 // maxMoves
);

// Create classic session (no move limit)
const sessionValue = createClassicSession(
    gameId,
    playerAddress,
    tx,
    startedHeight,
    startedAtUnix,
    feePaid
);
```

### Managing Sessions

```typescript
import {
    decodeSession,
    completeSession,
    isSessionActive,
    isSessionDaily
} from './competition';

// Load session
const session = decodeSession(sessionBytes);

// Check status
if (!isSessionActive(session)) {
    return { error: ErrSessionNotActive() };
}

// Complete session
const updatedSession = completeSession(
    session,
    score,
    maxTile,
    moveCount,
    stopReason,
    endedAtUnix
);
```

### Session Helpers

```typescript
import {
    isSessionDaily,
    isSessionClassic,
    getSessionMaxMoves,
    getSessionSeed
} from './competition';

// Check mode
const isDaily = isSessionDaily(session);

// Get session properties
const maxMoves = getSessionMaxMoves(session);
const seed = getSessionSeed(session);
```

### Creating Records

```typescript
import {
    createDailyAttempt,
    createDailySubmission,
    createLeaderboardEntry
} from './competition';

// Prevent duplicate daily plays
const attemptValue = createDailyAttempt(utcDate, playerAddress, gameId);

// Record completion
const submissionValue = createDailySubmission(
    utcDate,
    playerAddress,
    gameId,
    score,
    maxTile,
    moveCount,
    submittedAtUnix
);

// Add to leaderboard
const entryValue = createLeaderboardEntry(
    gameId,
    playerAddress,
    score,
    maxTile,
    moveCount,
    endedAtUnix,
    username
);
```

---

## Prize Pool Functions

### Managing Daily Pools

```typescript
import {
    decodeDailyPrizePool,
    encodeDailyPrizePool,
    addDailyPoolEntry
} from './competition';

// Load pool
const pool = decodeDailyPrizePool(poolBytes);

// Add entry
const updated = addDailyPoolEntry(
    pool,
    entryFee,
    platformFee,
    reserveFee,
    shopFee,
    rewardFee
);

// Save pool
const poolValue = encodeDailyPrizePool(
    { ...pool, ...updated },
    utcDate
);
```

### Finalizing Pools

```typescript
import { finalizeDailyPool, isDailyPoolFinalized } from './competition';

// Check if already finalized
if (isDailyPoolFinalized(pool)) {
    return { error: ErrAlreadyFinalized() };
}

// Finalize
const finalizedPool = finalizeDailyPool(
    pool,
    distributedRewards,
    treasuryLeftover,
    finalizedAtUnix
);
```

### Pool Queries

```typescript
import {
    getDailyPoolRewardAmount,
    getDailyPoolEntryCount
} from './competition';

const rewardAmount = getDailyPoolRewardAmount(pool);
const entries = getDailyPoolEntryCount(pool);
```

---

## Design Principles

### 1. **Mode-Specific Creation**
Separate functions for daily vs classic:
```typescript
// ✅ Good - clear which mode
createDailySession(..., utcDate, ...);
createClassicSession(...); // no utcDate

// ❌ Bad - mode as parameter
createSession(..., mode, utcDate?); // confusing
```

### 2. **Immutable Operations**
All functions return new encoded values:
```typescript
// ✅ Good - functional style
const completed = completeSession(session, ...);

// ❌ Bad - mutates input
session.status = 2; // don't do this
```

### 3. **Type Safety**
All Long/number values normalized:
```typescript
// Always normalize with toUint64
startedHeight: toUint64(session?.startedHeight as Long | number | undefined)
```

### 4. **Helper Functions**
Provide convenience functions for common checks:
```typescript
// ✅ Convenient
if (isSessionDaily(session)) { ... }

// ❌ Less clear
if (toUint64(session?.mode as Long | number | undefined) === 1) { ... }
```

---

## Usage Patterns

### Pattern 1: Start Daily Game

```typescript
import { createDailySession, createDailyAttempt } from './competition';
import { KeyForGameSession, KeyForDailyAttempt } from '../utils/state.js';

// 1. Create session
const sessionValue = createDailySession(
    gameId,
    playerAddress,
    utcDate,
    contract.Config.ChainId,
    tx.createdHeight,
    tx.time,
    txFee,
    getConfiguredDailyMaxMoves(cfg)
);

// 2. Create attempt record
const attemptValue = createDailyAttempt(utcDate, playerAddress, gameId);

// 3. Write to state
await contract.plugin.StateWrite(contract, {
    sets: [
        { key: KeyForGameSession(gameId), value: sessionValue },
        { key: KeyForDailyAttempt(utcDate, playerAddress), value: attemptValue }
    ]
});
```

### Pattern 2: Submit Game Result

```typescript
import {
    decodeSession,
    isSessionActive,
    isSessionDaily,
    completeSession,
    createDailySubmission,
    createLeaderboardEntry
} from './competition';

// 1. Load and validate session
const session = decodeSession(sessionBytes);
if (!isSessionActive(session)) {
    return { error: ErrSessionNotActive() };
}

// 2. Complete session
const updatedSession = completeSession(
    session,
    replay.score,
    replay.maxTile,
    replay.moveCount,
    replay.endedReason,
    endedAtUnix
);

// 3. Create records
const sets = [
    { key: KeyForGameSession(gameId), value: updatedSession }
];

if (isSessionDaily(session)) {
    const submission = createDailySubmission(
        session.utcDate,
        playerAddress,
        gameId,
        replay.score,
        replay.maxTile,
        replay.moveCount,
        endedAtUnix
    );
    sets.push({ key: KeyForDailySubmission(...), value: submission });
}

// 4. Add leaderboard entry
const entry = createLeaderboardEntry(
    gameId,
    playerAddress,
    replay.score,
    replay.maxTile,
    replay.moveCount,
    endedAtUnix,
    username
);
sets.push({ key: KeyForDailyLeaderboard(...), value: entry });
```

### Pattern 3: Update Prize Pool

```typescript
import {
    decodeDailyPrizePool,
    addDailyPoolEntry,
    encodeDailyPrizePool
} from './competition';
import { KeyForDailyPrizePool } from '../utils/state.js';

// 1. Load pool
const pool = decodeDailyPrizePool(poolBytes);

// 2. Add entry
const updated = addDailyPoolEntry(
    pool,
    entryFee,
    platformFee,
    reserveFee,
    shopFee,
    rewardFee
);

// 3. Encode and save
const poolValue = encodeDailyPrizePool(
    { ...pool, ...updated },
    utcDate
);

await contract.plugin.StateWrite(contract, {
    sets: [{ key: KeyForDailyPrizePool(utcDate), value: poolValue }]
});
```

---

## Weekly Blitz Competition

### Overview

Weekly Blitz is a time-based competition mode where players compete for the highest cumulative score across multiple 5-minute runs throughout the week (Monday to Sunday).

### Unique Features

- **⏱️ Timer**: 5-minute sessions (300 seconds)
- **📅 Daily Limits**: 2 official runs per day
- **📊 Cumulative Scoring**: Total score across all runs
- **🗓️ Week-Based**: Monday to Sunday competitions
- **💰 Entry Fee**: 5 PROOF

### Fee Distribution

```typescript
// 60% → Weekly prize pool
// 20% → Shop pool
// 15% → Reserve pool
// 5% → Platform pool
```

### Types

#### WeeklyBlitzPool
```typescript
interface WeeklyBlitzPool {
    weekId: string;           // "week_2700" (Monday-based)
    entryCount: number;       // Total entries this week
    grossFees: number;        // Total fees collected
    prizePool: number;        // 60% for rewards
    finalized: boolean;       // Competition ended
    finalizedAtUnix: number;  // Finalization timestamp
}
```

#### WeeklyBlitzDailyTracking
```typescript
interface WeeklyBlitzDailyTracking {
    utcDate: string;          // YYYY-MM-DD
    playerAddress: Uint8Array;
    weekId: string;           // Current week
    officialRunsUsed: number; // 0-2 (max per day)
    retriesUsed: number;      // Future: unlimited retries
    lastPlayedAtUnix: number; // Last game timestamp
}
```

#### WeeklyBlitzPlayerScore (Future Feature)
```typescript
interface WeeklyBlitzPlayerScore {
    weekId: string;
    playerAddress: Uint8Array;
    totalScore: number;           // Sum of all official runs
    bestSingleRunScore: number;   // Best individual run
    officialRunsCompleted: number; // Total official runs
    lastUpdatedAtUnix: number;
}
```

### Week Calculation

```typescript
import { getWeekId, getUTCDate } from './weekly-blitz';

// Calculate current week (Monday-based)
const weekId = getWeekId(timestampMicros);
// Returns: "week_2700"

// Get UTC date from timestamp
const utcDate = getUTCDate(timestampMicros);
// Returns: "2026-07-23"
```

**Week Start**: Monday at 00:00:00 UTC  
**Formula**: `floor((timestamp + epoch_offset) / week_seconds)`  
**Epoch Offset**: 4 days (Thursday → Monday)

### Fee Splitting

```typescript
import { splitWeeklyBlitzFee } from './weekly-blitz';

const split = splitWeeklyBlitzFee(Long.fromNumber(5000000));
// Returns: {
//   poolCut: Long(3000000),     // 60%
//   shopCut: Long(1000000),     // 20%
//   reserveCut: Long(750000),   // 15%
//   platformCut: Long(250000)   // 5%
// }
```

### Daily Tracking

```typescript
import {
    KeyForWeeklyBlitzDailyTracking,
    decodeWeeklyBlitzDailyTracking,
    encodeWeeklyBlitzDailyTracking,
    WEEKLY_BLITZ_OFFICIAL_RUNS_PER_DAY
} from './weekly-blitz';

// Check daily limits
const trackingKey = KeyForWeeklyBlitzDailyTracking(utcDate, playerAddress);
const tracking = decodeWeeklyBlitzDailyTracking(trackingBytes);

if (tracking && tracking.officialRunsUsed >= WEEKLY_BLITZ_OFFICIAL_RUNS_PER_DAY) {
    return { error: ErrWeeklyBlitzNoOfficialRunsRemaining() };
}

// Update tracking after game start
const updated = encodeWeeklyBlitzDailyTracking({
    utcDate,
    playerAddress,
    weekId,
    officialRunsUsed: (tracking?.officialRunsUsed || 0) + 1,
    retriesUsed: tracking?.retriesUsed || 0,
    lastPlayedAtUnix: startedAtUnix
});
```

### Session Creation (With Timer)

```typescript
import {
    WEEKLY_BLITZ_DURATION_SECONDS,
    WEEKLY_BLITZ_FEE
} from './weekly-blitz';
import { encodeGame2048State } from '../game2048';

// Create Weekly Blitz session with 5-minute timer
const expiresAtUnix = startedAtUnix + WEEKLY_BLITZ_DURATION_SECONDS;
const sessionValue = encodeGame2048State('GameSession', {
    gameId,
    playerAddress,
    mode: 3, // GAME_MODE_WEEKLY_BLITZ
    utcDate,
    seed,
    status: 1, // SESSION_STATUS_ACTIVE
    startedHeight,
    startedAtUnix,
    feePaid: WEEKLY_BLITZ_FEE,
    maxMoves: 0, // No move limit
    weekId,
    expiresAtUnix  // ⭐ Timer expiration
});
```

### Pool Management

```typescript
import {
    KeyForWeeklyBlitzPool,
    decodeWeeklyBlitzPool,
    encodeWeeklyBlitzPool
} from './weekly-blitz';

// Load weekly pool
const poolKey = KeyForWeeklyBlitzPool(weekId);
const pool = decodeWeeklyBlitzPool(poolBytes);

// Update pool after game start
const updatedPool = {
    weekId,
    entryCount: (pool?.entryCount || 0) + 1,
    grossFees: (pool?.grossFees || 0) + WEEKLY_BLITZ_FEE,
    prizePool: (pool?.prizePool || 0) + split.poolCut.toNumber(),
    finalized: false,
    finalizedAtUnix: 0
};

const poolValue = encodeWeeklyBlitzPool(updatedPool);
```

### Complete Start Game Pattern

```typescript
import {
    getWeekId,
    getUTCDate,
    splitWeeklyBlitzFee,
    KeyForWeeklyBlitzPool,
    KeyForWeeklyBlitzDailyTracking,
    KeyForWeeklyBlitzSession,
    decodeWeeklyBlitzDailyTracking,
    decodeWeeklyBlitzPool,
    encodeWeeklyBlitzDailyTracking,
    encodeWeeklyBlitzPool,
    WEEKLY_BLITZ_FEE,
    WEEKLY_BLITZ_DURATION_SECONDS,
    WEEKLY_BLITZ_OFFICIAL_RUNS_PER_DAY
} from './weekly-blitz';

async function startWeeklyBlitzGame(
    contract: Contract,
    playerAddress: Uint8Array,
    gameId: Uint8Array,
    tx: any
): Promise<any> {
    const startedAtUnix = tx.time;
    const utcDate = getUTCDate(startedAtUnix);
    const weekId = getWeekId(startedAtUnix);
    
    // 1. Check daily limits
    const tracking = decodeWeeklyBlitzDailyTracking(trackingBytes);
    if (tracking?.officialRunsUsed >= WEEKLY_BLITZ_OFFICIAL_RUNS_PER_DAY) {
        return { error: ErrWeeklyBlitzNoOfficialRunsRemaining() };
    }
    
    // 2. Check player balance
    if (playerAmount.lessThan(WEEKLY_BLITZ_FEE)) {
        return { error: ErrInsufficientFunds() };
    }
    
    // 3. Split fee
    const split = splitWeeklyBlitzFee(Long.fromNumber(WEEKLY_BLITZ_FEE));
    
    // 4. Update pools (platform, reserve, shop, weekly)
    // ... pool updates ...
    
    // 5. Create session with timer
    const expiresAtUnix = startedAtUnix + WEEKLY_BLITZ_DURATION_SECONDS;
    const sessionValue = encodeGame2048State('GameSession', {
        gameId,
        playerAddress,
        mode: 3,
        utcDate,
        seed: sha256Bytes(chainId, weekId),
        status: 1,
        startedHeight: tx.createdHeight,
        startedAtUnix,
        feePaid: WEEKLY_BLITZ_FEE,
        maxMoves: 0,
        weekId,
        expiresAtUnix
    });
    
    // 6. Update daily tracking
    const updatedTracking = encodeWeeklyBlitzDailyTracking({
        utcDate,
        playerAddress,
        weekId,
        officialRunsUsed: (tracking?.officialRunsUsed || 0) + 1,
        retriesUsed: tracking?.retriesUsed || 0,
        lastPlayedAtUnix: startedAtUnix
    });
    
    // 7. Update weekly pool
    const updatedPool = encodeWeeklyBlitzPool({
        weekId,
        entryCount: (pool?.entryCount || 0) + 1,
        grossFees: (pool?.grossFees || 0) + WEEKLY_BLITZ_FEE,
        prizePool: (pool?.prizePool || 0) + split.poolCut.toNumber(),
        finalized: false,
        finalizedAtUnix: 0
    });
    
    // 8. Write all state
    await contract.plugin.StateWrite(contract, {
        sets: [
            { key: playerKey, value: updatedPlayerAccount },
            { key: platformPoolKey, value: updatedPlatformPool },
            { key: reservePoolKey, value: updatedReservePool },
            { key: shopPoolKey, value: updatedShopPool },
            { key: gameTreasuryKey, value: updatedTreasury },
            { key: KeyForWeeklyBlitzPool(weekId), value: updatedPool },
            { key: KeyForWeeklyBlitzSession(gameId), value: sessionValue },
            { key: KeyForWeeklyBlitzDailyTracking(utcDate, playerAddress), value: updatedTracking },
            { key: playerStatsKey, value: updatedStats }
        ]
    });
}
```

### Design Notes

**Timer Enforcement**:
- Session includes `expiresAtUnix` field
- Backend validates timer on game submission
- Submissions after expiration are rejected

**Daily Reset**:
- Resets at UTC midnight
- Each UTC date gets new tracking record
- Players can play 2 official runs per calendar day

**Week Boundaries**:
- Week starts Monday 00:00:00 UTC
- Week ends Sunday 23:59:59 UTC
- Week ID calculated from epoch offset

**Cumulative Scoring** (implemented):
- `WeeklyBlitzPlayerScore` accumulates `totalScore` across every completed run
- `bestSingleRunScore` and `officialRunsCompleted` are updated on each submission
- `KeyForWeeklyBlitzLeaderboard` ranks players by cumulative score (inverted for
  highest-first range scans); the stale entry is deleted and rewritten on each submit
- Weekly Blitz pays out from its own prize pool, so runs earn **no Classic Points**
  and do not affect `bestClassicScore`
- The 5-minute timer is enforced on-chain in `DeliverMessageSubmitGameResult`, with a
  `WEEKLY_BLITZ_SUBMIT_GRACE_SECONDS` window so honest full-length runs are not rejected

### Constants

```typescript
// Entry fee (5 PROOF in uproof)
export const WEEKLY_BLITZ_FEE = 5000000;

// Session duration (5 minutes)
export const WEEKLY_BLITZ_DURATION_SECONDS = 300;

// Daily run limit
export const WEEKLY_BLITZ_OFFICIAL_RUNS_PER_DAY = 2;
```

---

## State Keys

Competition module uses these state keys:

**Centralized (in `utils/state.ts`)**:
- `KeyForGameSession(gameId)` - Game session data
- `KeyForDailyAttempt(utcDate, playerAddress)` - Daily attempt tracking
- `KeyForDailySubmission(utcDate, playerAddress)` - Daily submission record
- `KeyForDailyPrizePool(utcDate)` - Daily prize pool
- `KeyForDailyLeaderboard(...)` - Daily leaderboard entries
- `KeyForClassicLeaderboard(...)` - Classic leaderboard entries

**Weekly Blitz (in `competition/weekly-blitz.ts`)**:
- `KeyForWeeklyBlitzPool(weekId)` - Weekly prize pool
- `KeyForWeeklyBlitzDailyTracking(utcDate, playerAddress)` - Daily run limits
- `KeyForWeeklyBlitzPlayerScore(weekId, playerAddress)` - Cumulative score (future)
- `KeyForWeeklyBlitzSession(gameId)` - Game session (uses generic key)

---

## When to Modify This Module

### Add to `session.ts` when:
- Adding new game modes
- Creating new session validation functions
- Building session query utilities

### Add to `prize-pool.ts` when:
- Adding monthly/weekly prize pools
- Creating pool calculation functions
- Building pool finalization utilities

### Do NOT add:
- State read/write logic (stays in contract.ts for now)
- Business rules (e.g., entry fees - goes in config/)
- Player stats (goes in profile/)

---

## Testing Considerations

### Unit Tests
Competition functions are pure and easily testable:
```typescript
test('createDailySession creates valid session', () => {
    const session = createDailySession(...);
    expect(session).toBeDefined();
    expect(session.length).toBeGreaterThan(0);
});

test('isSessionActive returns true for active sessions', () => {
    const session = { status: 1 };
    expect(isSessionActive(session)).toBe(true);
});
```

### Integration Tests
Test full session lifecycle in contract tests.

---

## Dependencies

### Internal
- `game2048.js` - Encoding/decoding functions
- `utils/crypto.js` - Seed generation
- `utils/state.js` - State key generation

### External
- `long` - 64-bit integer handling

---

## Backward Compatibility

### Breaking Changes Policy
- NEVER change GameSession field types
- NEVER change DailyPrizePool field types
- NEVER change state key formats
- Always support legacy formats during migration

---

## Future Enhancements

### Implemented
- ✅ Weekly Blitz competition (timer-based gameplay)
- ✅ Daily run limits (2 per day)
- ✅ Week-based prize pools

### Planned
- ⏳ Weekly Blitz cumulative scoring
- ⏳ Weekly Blitz leaderboard by cumulative score
- ⏳ Monthly prize pool finalization
- ⏳ Tournament brackets
- ⏳ Team competitions
- ⏳ Season tracking
- ⏳ Retry system (unlimited non-official runs)

---

**Last Updated**: 2026-07-23  
**Phase**: 4 (Competition Module Extraction) + Weekly Blitz Documentation
