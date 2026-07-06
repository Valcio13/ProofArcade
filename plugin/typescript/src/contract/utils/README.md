# Utilities Module

Generic reusable utilities for state management, time handling, cryptographic operations, and data manipulation.

## Purpose

Provides pure utility functions with **no business logic**. These are building blocks used across the contract system.

## Ownership

This module owns:
- ✅ State database key generation
- ✅ Pool ID constants  
- ✅ Time/date conversions
- ✅ Seed generation for game sessions
- ✅ Data normalization and validation helpers

This module does NOT own:
- ❌ Business logic
- ❌ Transaction handlers
- ❌ State reading/writing (uses state keys but doesn't perform I/O)
- ❌ Game rules or mechanics

## Modules

### `state.ts`
**State Key Generators** - Functions for generating database keys

**Exports:**
- 30 KeyFor* functions for generating state keys
- PoolIDs object with pool ID constants
- KeyForDailyLeaderboardPrefix() for prefix-based queries

**Usage:**
```typescript
import { KeyForAccount, KeyForDailyAttempt, PoolIDs } from './utils/state.js';

const accountKey = KeyForAccount(playerAddress);
const attemptKey = KeyForDailyAttempt('2026-07-06', playerAddress);
const platformPoolId = PoolIDs.PLATFORM;
```

### `time.ts`
**Time Utilities** - Date and time conversion functions

**Exports:**
- `utcDateFromMicros(nowMicros)` - Convert microseconds to YYYY-MM-DD
- `utcMonthFromMicros(nowMicros)` - Convert microseconds to YYYY-MM
- `hasUtcDayEnded(utcDate, nowMicros)` - Check if UTC day has ended

**Usage:**
```typescript
import { utcDateFromMicros, hasUtcDayEnded } from './utils/time.js';

const today = utcDateFromMicros(tx.time);
const isExpired = hasUtcDayEnded('2026-07-05', tx.time);
```

### `crypto.ts`
**Cryptographic Utilities** - Deterministic seed generation

**Exports:**
- `deriveDailySeed(chainId, utcDate)` - Generate daily challenge seed
- `deriveClassicSeed(playerAddress, tx)` - Generate classic mode seed

**Usage:**
```typescript
import { deriveDailySeed, deriveClassicSeed } from './utils/crypto.js';

const dailySeed = deriveDailySeed(1, '2026-07-06');
const classicSeed = deriveClassicSeed(playerAddress, tx);
```

**Note**: Daily seed generation is currently a scaffold. Production should use chain-derived entropy (e.g., block hash at UTC boundary).

### `helpers.ts`
**General Helpers** - Data normalization and utility functions

**Exports:**
- `randomQueryId()` - Generate random query ID for state reads
- `normalizeUsername(username)` - Lowercase for uniqueness checks
- `validateUsername(username)` - Validate 3-20 chars, alphanumeric + underscore
- `buffersEqual(a, b)` - Compare byte arrays
- `getQueryValue(response, queryId)` - Extract query result by ID
- `normalizeBytes(value)` - Convert various formats to Uint8Array
- `normalizeMoves(moves)` - Normalize move array
- `areMovesValid(moves)` - Validate moves are 1-4
- `normalizeGameTreasury(treasury)` - Normalize treasury from protobuf

**Usage:**
```typescript
import { normalizeBytes, validateUsername, areMovesValid } from './utils/helpers.js';

const address = normalizeBytes(msg.playerAddress);
const isValid = validateUsername('player_123');
const validMoves = areMovesValid([1, 2, 3, 4]);
```

## Import Patterns

```typescript
// Import specific functions
import { KeyForAccount, utcDateFromMicros } from './utils';

// Import from specific modules
import { KeyForDailyAttempt } from './utils/state.js';
import { hasUtcDayEnded } from './utils/time.js';

// Barrel export through utils/index.ts
import * as Utils from './utils';
```

## Design Principles

1. **Pure Functions**: No side effects, same inputs = same outputs
2. **No Business Logic**: These are building blocks, not domain logic
3. **Type Safety**: Proper typing for all inputs and outputs
4. **Documentation**: Clear JSDoc comments explaining purpose and usage
5. **Single Responsibility**: Each function does one thing well

## When to Add New Utilities

✅ **Add here** when:
- Function is generic and reusable across multiple domains
- Function has no business logic (pure transformation/calculation)
- Function provides infrastructure support (keys, time, crypto)

❌ **Don't add here** when:
- Function contains business rules (belongs in domain module)
- Function is specific to one feature (belongs with that feature)
- Function performs I/O operations (belongs in handlers)

## Related Modules

- **`config/`** - Configuration constants (used by utilities)
- **`economy/`** - Fee distribution (uses state keys and PoolIDs)
- **`contract.ts`** - Main contract (uses all utilities)

## Version History

- **v1.0.0** (2026-07-06) - Initial extraction from contract.ts
  - Extracted 30 state key generators
  - Extracted time, crypto, and helper utilities
  - Consolidated PoolIDs constants
  - Added KeyForDailyLeaderboardPrefix for prefix queries
