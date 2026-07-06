# Profile Module

**Owner**: Player profile and statistics domain  
**Purpose**: Manage player statistics, identity, and username registration

---

## Overview

The profile module handles all aspects of player data including:
- Game statistics and progress tracking
- Username registration and validation
- Player identity information (avatar, title, bio)
- Legacy format migration support

---

## Module Structure

```
profile/
├── types.ts       - Type definitions for profiles and stats
├── stats.ts       - PlayerStats operations
├── identity.ts    - Username and identity management
├── index.ts       - Barrel export
└── README.md      - This file
```

---

## Core Types

### PlayerStats
Tracks player game performance and progress:
- Game counts (daily, classic, completed)
- Win/loss records
- Best scores and tiles
- Classic points balance
- Login streak tracking

### PlayerIdentity
Modern player identity format:
- Username
- Avatar URL
- Title
- Bio
- Registration timestamp

### UsernameRegistration
Legacy username format (kept for backward compatibility):
- Username
- Registration timestamp
- Last changed timestamp

---

## Statistics Functions

### Creating and Loading Stats

```typescript
import { createPlayerStats, decodePlayerStats, encodePlayerStats } from './profile';

// Create new stats
const newStats = createPlayerStats(playerAddress);

// Decode from state
const stats = decodePlayerStats(statsBytes);

// Encode for storage
const statsBytes = encodePlayerStats(stats, playerAddress);
```

### Updating Stats

```typescript
import { updatePlayerStats, incrementStatsField, addToStatsField } from './profile';

// Partial update
const updated = updatePlayerStats(stats, {
    gamesCompleted: stats.gamesCompleted + 1,
    wins: stats.wins + 1
});

// Increment counter
const incremented = incrementStatsField(stats, 'dailyGamesStarted');

// Add to field
const added = addToStatsField(stats, 'totalScore', 1024);
```

### Best Score/Tile Tracking

```typescript
import { updateBestScore, updateBestTile } from './profile';

// Update best daily score (only if higher)
const statsWithBest = updateBestScore(stats, 4096, 'daily');

// Update best tile (only if higher)
const statsWithTile = updateBestTile(stats, 2048);
```

---

## Identity Functions

### Username Validation

```typescript
import { isUsernameValid, normalizeUsernameForLookup } from './profile';

// Validate format
if (!isUsernameValid(username)) {
    return { error: ErrUsernameInvalid() };
}

// Normalize for case-insensitive lookup
const normalized = normalizeUsernameForLookup('PlayerOne'); // 'playerone'
```

### Creating and Updating Identity

```typescript
import { createPlayerIdentity, updatePlayerIdentity } from './profile';

// Create new identity
const identity = createPlayerIdentity(playerAddress, 'Player1', timestamp, {
    avatarUrl: 'https://example.com/avatar.png',
    title: 'Novice',
    bio: 'New player'
});

// Update identity
const updated = updatePlayerIdentity(existingIdentity, {
    username: 'NewName',
    lastUpdatedUnix: newTimestamp
});
```

### Encoding/Decoding

```typescript
import {
    decodePlayerIdentity,
    decodeUsernameRegistration,
    encodePlayerIdentity,
    encodeUsernameRegistration
} from './profile';

// Decode modern format
const identity = decodePlayerIdentity(identityBytes);

// Decode legacy format
const registration = decodeUsernameRegistration(usernameBytes);

// Encode modern format
const identityBytes = encodePlayerIdentity(identity);

// Encode legacy format (for backward compatibility)
const registrationBytes = encodeUsernameRegistration(registration);
```

### Migration Helpers

```typescript
import { getUsernameFromState, getRegistrationTime } from './profile';

// Get username from either format
const username = getUsernameFromState(identityBytes, usernameBytes);

// Get registration time from either format
const timestamp = getRegistrationTime(identityBytes, usernameBytes);
```

---

## Design Principles

### 1. **Pure Functions**
All functions are pure - no side effects, no state reads/writes:
```typescript
// ✅ Good - pure function
const updated = updatePlayerStats(stats, { wins: stats.wins + 1 });

// ❌ Bad - side effects
function updateStatsInPlace(stats) {
    stats.wins += 1; // mutates input
}
```

### 2. **Backward Compatibility**
Legacy UsernameRegistration format is preserved:
```typescript
// Store both formats during migration
sets.push({ key: playerIdentityKey, value: encodePlayerIdentity(...) });
sets.push({ key: usernameByAddressKey, value: encodeUsernameRegistration(...) });
```

### 3. **Type Safety**
All Long/number values are normalized:
```typescript
// Always use toUint64() for numeric fields
dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined)
```

### 4. **Immutability**
Functions return new objects, never mutate:
```typescript
// ✅ Returns new object
return { ...stats, wins: stats.wins + 1 };

// ❌ Mutates input
stats.wins += 1;
return stats;
```

---

## Usage Patterns

### Pattern 1: Load, Update, Save Stats

```typescript
import { KeyForPlayerStats } from '../utils/state.js';
import { decodePlayerStats, encodePlayerStats, incrementStatsField } from './profile';

// 1. Load from state
const [response] = await contract.plugin.StateRead(contract, {
    keys: [{ queryId, key: KeyForPlayerStats(playerAddress) }]
});
const statsBytes = getQueryValue(response, queryId);

// 2. Decode
const stats = decodePlayerStats(statsBytes);

// 3. Update
const updated = incrementStatsField(stats, 'dailyGamesStarted');

// 4. Encode
const updatedBytes = encodePlayerStats(updated, playerAddress);

// 5. Save
await contract.plugin.StateWrite(contract, {
    sets: [{ key: KeyForPlayerStats(playerAddress), value: updatedBytes }]
});
```

### Pattern 2: Username Registration with Lookup

```typescript
import {
    KeyForPlayerIdentity,
    KeyForUsernameByAddress,
    KeyForAddressByUsername
} from '../utils/state.js';
import {
    isUsernameValid,
    normalizeUsernameForLookup,
    createPlayerIdentity,
    encodePlayerIdentity,
    encodeUsernameRegistration
} from './profile';

// 1. Validate
if (!isUsernameValid(username)) {
    return { error: ErrUsernameInvalid() };
}

// 2. Normalize for lookup
const normalized = normalizeUsernameForLookup(username);

// 3. Check if taken
const lookupKey = KeyForAddressByUsername(normalized);
const [existingOwner] = await loadState(lookupKey);
if (existingOwner && !buffersEqual(existingOwner, playerAddress)) {
    return { error: ErrUsernameTaken() };
}

// 4. Create identity
const identity = createPlayerIdentity(playerAddress, username, timestamp);

// 5. Store both formats
const sets = [
    { key: KeyForPlayerIdentity(playerAddress), value: encodePlayerIdentity(identity) },
    { key: KeyForUsernameByAddress(playerAddress), value: encodeUsernameRegistration({
        playerAddress,
        username,
        registeredAtUnix: timestamp,
        lastChangedAtUnix: timestamp
    })},
    { key: lookupKey, value: playerAddress }
];
```

### Pattern 3: Migration from Legacy Format

```typescript
import { getUsernameFromState, getRegistrationTime } from './profile';

// Read both possible locations
const identityBytes = await loadState(KeyForPlayerIdentity(playerAddress));
const usernameBytes = await loadState(KeyForUsernameByAddress(playerAddress));

// Get data from whichever exists
const username = getUsernameFromState(identityBytes, usernameBytes);
const registeredAt = getRegistrationTime(identityBytes, usernameBytes);
```

---

## State Keys

Profile module uses these state keys (defined in `utils/state.ts`):

- `KeyForPlayerStats(playerAddress)` - Player statistics
- `KeyForPlayerIdentity(playerAddress)` - Modern identity format
- `KeyForUsernameByAddress(playerAddress)` - Legacy username lookup
- `KeyForAddressByUsername(normalizedUsername)` - Reverse username lookup

---

## When to Modify This Module

### Add to `stats.ts` when:
- Adding new player statistics fields
- Creating new stat aggregation functions
- Building stat comparison utilities

### Add to `identity.ts` when:
- Adding new identity fields (avatar, title, bio extensions)
- Creating username search utilities
- Building identity validation functions

### Do NOT add:
- Transaction handlers (those go in handlers/)
- State read/write logic (stays in contract.ts for now)
- Business rules (e.g., when to award points - goes in competition/)

---

## Testing Considerations

### Unit Tests
Profile functions are pure and easily testable:
```typescript
test('incrementStatsField increments counter', () => {
    const stats = { dailyGamesStarted: 5 };
    const updated = incrementStatsField(stats, 'dailyGamesStarted');
    expect(updated.dailyGamesStarted).toBe(6);
});

test('updateBestScore only updates if higher', () => {
    const stats = { bestDailyScore: 1000 };
    const updated = updateBestScore(stats, 500, 'daily');
    expect(updated.bestDailyScore).toBe(1000); // unchanged
});
```

### Integration Tests
Test full load-update-save cycles in contract tests.

---

## Dependencies

### Internal
- `game2048.js` - Encoding/decoding functions
- `utils/helpers.js` - Username validation/normalization
- `utils/state.js` - State key generation

### External
- `long` - 64-bit integer handling

---

## Backward Compatibility

### Migration Strategy
1. Always write both PlayerIdentity and UsernameRegistration formats
2. Read from PlayerIdentity first, fallback to UsernameRegistration
3. Eventually remove UsernameRegistration after full migration

### Breaking Changes Policy
- NEVER change PlayerStats field types
- NEVER change state key formats
- NEVER remove fields (mark deprecated instead)
- Always support legacy formats during migration

---

## Future Enhancements

Potential additions (not implemented yet):
- Avatar upload validation
- Username change history
- Player badges/achievements
- Social connections (friends, followers)
- Privacy settings

---

**Last Updated**: 2026-07-06  
**Phase**: 3 (Profile Module Extraction)
