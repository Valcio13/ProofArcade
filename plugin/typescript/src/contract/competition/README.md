# Competition Module

**Owner**: Game competition and session domain  
**Purpose**: Manage game sessions, competition lifecycle, and prize pools

---

## Overview

The competition module handles all aspects of game competitions including:
- Game session creation (daily and classic modes)
- Session lifecycle management (active → completed)
- Daily prize pool tracking
- Leaderboard entry creation
- Competition finalization

---

## Module Structure

```
competition/
├── types.ts        - Type definitions for sessions and pools
├── session.ts      - Session creation and management
├── prize-pool.ts   - Daily prize pool operations
├── index.ts        - Barrel export
└── README.md       - This file
```

---

## Core Types

### GameSession
Represents an active or completed game:
- Game ID and player address
- Mode (daily vs classic)
- Seed for deterministic gameplay
- Status (active vs completed)
- Move limits and results

### DailyPrizePool
Tracks daily competition prize pool:
- Entry count
- Fee accumulation (gross, treasury, rewards)
- Finalization status
- Distributed rewards

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

## State Keys

Competition module uses these state keys (defined in `utils/state.ts`):

- `KeyForGameSession(gameId)` - Game session data
- `KeyForDailyAttempt(utcDate, playerAddress)` - Daily attempt tracking
- `KeyForDailySubmission(utcDate, playerAddress)` - Daily submission record
- `KeyForDailyPrizePool(utcDate)` - Daily prize pool
- `KeyForDailyLeaderboard(...)` - Daily leaderboard entries
- `KeyForClassicLeaderboard(...)` - Classic leaderboard entries

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

Potential additions (not implemented yet):
- Monthly prize pools
- Weekly competitions
- Tournament brackets
- Team competitions
- Season tracking

---

**Last Updated**: 2026-07-06  
**Phase**: 4 (Competition Module Extraction)
