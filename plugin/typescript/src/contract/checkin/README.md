# Check-in Module

**Purpose**: Daily login rewards and streak management

**Created**: Phase 6 (2026-07-06)

---

## Overview

The check-in module handles daily login rewards and streak tracking. Players earn points for logging in consecutively, with rewards increasing over a 7-day cycle. Completing the full cycle awards bonus BPS.

### Streak Mechanics

- **Cycle**: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 1 (repeats)
- **Reset**: Streak resets to 1 if player misses a day
- **Consecutive**: Must login on consecutive UTC dates to maintain streak
- **Bonus**: Awarded on completing full cycle (typically day 7)

### Reward Schedule

Default schedule (configurable):
- Day 1: 10 points
- Day 2: 20 points
- Day 3: 30 points
- Day 4: 40 points
- Day 5: 50 points
- Day 6: 60 points
- Day 7: 100 points + 5% bonus BPS

---

## Module Structure

```
checkin/
├── types.ts           Type definitions
├── streak.ts          Streak calculation and tracking
├── rewards.ts         Reward calculations and claim creation
├── index.ts           Barrel export
└── README.md          This file
```

---

## Types

### DailyLoginClaim

Represents a single login reward claim.

```typescript
interface DailyLoginClaim {
    utcDate: string;            // YYYY-MM-DD format
    playerAddress: Uint8Array;  // Player wallet address
    streakDay: number | Long;   // 1-7 (cycles)
    rewardPoints: number | Long;// Points awarded
    bonusBps: number | Long;    // Bonus BPS (non-zero on day 7)
    claimedAtUnix: number | Long; // Timestamp (microseconds)
}
```

### LoginRewardConfig

Configuration for login rewards.

```typescript
interface LoginRewardConfig {
    dailyLoginRewardPoints: number[];  // Points per day
    dailyLoginBonusBps: number;        // Bonus BPS on completion
}
```

---

## Streak Functions

### calculateNextStreak()

Calculate next streak day based on previous claim.

```typescript
import { calculateNextStreak } from './checkin';

const nextStreak = calculateNextStreak(
    '2026-07-05',  // Previous claim date
    '2026-07-06',  // Current date
    3,             // Current streak day
    7              // Schedule length
);
// Returns: 4 (consecutive day)

const resetStreak = calculateNextStreak(
    '2026-07-04',  // Previous claim date (2 days ago)
    '2026-07-06',  // Current date
    3,             // Current streak day
    7              // Schedule length
);
// Returns: 1 (streak reset)
```

**Logic**:
- If previous claim was yesterday → increment streak (with cycle)
- Otherwise → reset to 1

### shouldResetStreak()

Check if streak should reset.

```typescript
import { shouldResetStreak } from './checkin';

const shouldReset = shouldResetStreak('2026-07-04', '2026-07-06');
// Returns: true (missed a day)

const continues = shouldResetStreak('2026-07-05', '2026-07-06');
// Returns: false (consecutive)
```

### isConsecutiveDay()

Check if login is on a consecutive day.

```typescript
import { isConsecutiveDay } from './checkin';

const consecutive = isConsecutiveDay('2026-07-05', '2026-07-06');
// Returns: true
```

### getStreakCyclePosition()

Get position within streak cycle.

```typescript
import { getStreakCyclePosition } from './checkin';

const position = getStreakCyclePosition(8, 7);
// Returns: 1 (wraps back to start)
```

---

## Reward Functions

### getLoginRewardPoints()

Get reward points for specific streak day.

```typescript
import { getLoginRewardPoints } from './checkin';

const points = getLoginRewardPoints(gameConfig, 3);
// Returns: 30 (day 3 reward)
```

### getLoginBonusBps()

Get bonus BPS if completing full cycle.

```typescript
import { getLoginBonusBps } from './checkin';

const bonus = getLoginBonusBps(gameConfig, 7, 7);
// Returns: 500 (5% bonus on day 7)

const noBonus = getLoginBonusBps(gameConfig, 3, 7);
// Returns: 0 (bonus only on day 7)
```

### calculateLoginReward()

Calculate all reward components at once.

```typescript
import { calculateLoginReward } from './checkin';

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 7);
// Returns: { rewardPoints: 100, bonusBps: 500 }
```

### createDailyLoginClaim()

Create claim record for storage.

```typescript
import { createDailyLoginClaim } from './checkin';

const claimValue = createDailyLoginClaim(
    '2026-07-06',       // UTC date
    playerAddress,      // Player address
    3,                  // Streak day
    30,                 // Reward points
    0,                  // Bonus BPS
    1720253400000000    // Claimed timestamp
);
```

---

## Configuration Functions

### getConfiguredDailyLoginRewardPoints()

Get reward schedule from configuration.

```typescript
import { getConfiguredDailyLoginRewardPoints } from './checkin';

const schedule = getConfiguredDailyLoginRewardPoints(gameConfig);
// Returns: [10, 20, 30, 40, 50, 60, 100] (default)
```

### getConfiguredDailyLoginBonusBps()

Get bonus BPS from configuration.

```typescript
import { getConfiguredDailyLoginBonusBps } from './checkin';

const bonusBps = getConfiguredDailyLoginBonusBps(gameConfig);
// Returns: 500 (default 5%)
```

---

## Usage Patterns

### Complete Login Reward Flow

```typescript
import {
    calculateNextStreak,
    calculateLoginReward,
    createDailyLoginClaim
} from './checkin';
import { getConfiguredDailyLoginRewardPoints } from './checkin';
import { toUint64 } from './utils/helpers';

async function claimDailyLoginReward(
    contract: Contract,
    playerAddress: Uint8Array,
    utcDate: string,
    claimedAtUnix: number
) {
    // 1. Load player stats
    const stats = await loadPlayerStats(contract, playerAddress);
    
    // 2. Calculate next streak
    const schedule = getConfiguredDailyLoginRewardPoints(gameConfig);
    const scheduleLength = schedule.length || 7;
    const currentStreak = toUint64(stats.loginStreak);
    
    const nextStreak = calculateNextStreak(
        stats.lastLoginClaimUtcDate || '',
        utcDate,
        currentStreak,
        scheduleLength
    );
    
    // 3. Calculate rewards
    const { rewardPoints, bonusBps } = calculateLoginReward(
        gameConfig,
        nextStreak
    );
    
    // 4. Create claim record
    const claimValue = createDailyLoginClaim(
        utcDate,
        playerAddress,
        nextStreak,
        rewardPoints,
        bonusBps,
        claimedAtUnix
    );
    
    // 5. Update player stats
    const updatedStats = {
        ...stats,
        classicPointsBalance: stats.classicPointsBalance + rewardPoints,
        classicPointsEarned: stats.classicPointsEarned + rewardPoints,
        loginStreak: nextStreak,
        lastLoginClaimUtcDate: utcDate,
        classicPointsBonusUtcDate: bonusBps > 0 ? utcDate : ''
    };
    
    // 6. Write to state
    await contract.plugin.StateWrite(contract, {
        sets: [
            { key: KeyForPlayerStats(playerAddress), value: encodePlayerStats(updatedStats) },
            { key: KeyForDailyLoginClaim(utcDate, playerAddress), value: claimValue }
        ]
    });
}
```

### Check Streak Status

```typescript
import { isConsecutiveDay, shouldResetStreak } from './checkin';

function checkStreakStatus(previousClaimDate: string, currentDate: string) {
    if (isConsecutiveDay(previousClaimDate, currentDate)) {
        console.log('Streak continues!');
    } else {
        console.log('Streak will reset to day 1');
    }
}
```

---

## Design Principles

### 1. **Clear Separation**
- **streak.ts**: Streak calculation logic only
- **rewards.ts**: Reward calculation and claim creation
- **No database operations**: Functions are pure or focused on encoding

### 2. **Pure Functions**
- Most functions are pure (same inputs → same outputs)
- Easy to test in isolation
- No hidden state or side effects

### 3. **Configuration-Driven**
- Reward schedule configurable via GameConfig
- Bonus BPS configurable
- Defaults provided if config missing

### 4. **Type Safety**
- Strong TypeScript interfaces
- Handles Long | number conversions
- Clear parameter types

### 5. **Single Responsibility**
- Each function does ONE thing
- No complex orchestration
- Handler (in contract.ts) orchestrates the flow

---

## When to Modify

### Add New Streak Function
**Location**: `streak.ts`

**Example**: Add function to predict next N streak days
```typescript
export function predictNextStreaks(
    currentStreak: number,
    days: number,
    scheduleLength: number
): number[] {
    // Implementation
}
```

### Add New Reward Calculation
**Location**: `rewards.ts`

**Example**: Add function to calculate weekly total rewards
```typescript
export function calculateWeeklyRewardTotal(cfg: any): number {
    const schedule = getConfiguredDailyLoginRewardPoints(cfg);
    return schedule.reduce((sum, points) => sum + points, 0);
}
```

### Add New Type
**Location**: `types.ts`

**Example**: Add interface for streak statistics
```typescript
export interface StreakStatistics {
    currentStreak: number;
    longestStreak: number;
    totalLogins: number;
}
```

### Modify Streak Logic
**Location**: `streak.ts` → `calculateNextStreak()`

**Example**: Change from 7-day to 14-day cycle

---

## Dependencies

### Internal Dependencies
- `utils/time.ts` - previousUtcDate() for date calculations
- `utils/state.ts` - encodeGame2048State() for claim creation
- `utils/helpers.ts` - toUint64() for number normalization

### External Dependencies
- `long` - For handling 64-bit integers

---

## Testing Recommendations

### Unit Tests for Streak Logic
```typescript
describe('calculateNextStreak', () => {
    it('should increment on consecutive day', () => {
        expect(calculateNextStreak('2026-07-05', '2026-07-06', 3, 7)).toBe(4);
    });
    
    it('should reset on missed day', () => {
        expect(calculateNextStreak('2026-07-04', '2026-07-06', 3, 7)).toBe(1);
    });
    
    it('should cycle back to 1 after completing streak', () => {
        expect(calculateNextStreak('2026-07-05', '2026-07-06', 7, 7)).toBe(1);
    });
});
```

### Unit Tests for Rewards
```typescript
describe('getLoginRewardPoints', () => {
    it('should return correct points for each day', () => {
        const cfg = { dailyLoginRewardPoints: [10, 20, 30, 40, 50, 60, 100] };
        expect(getLoginRewardPoints(cfg, 1)).toBe(10);
        expect(getLoginRewardPoints(cfg, 7)).toBe(100);
    });
});

describe('getLoginBonusBps', () => {
    it('should return bonus only on completing cycle', () => {
        const cfg = { dailyLoginBonusBps: 500 };
        expect(getLoginBonusBps(cfg, 7, 7)).toBe(500);
        expect(getLoginBonusBps(cfg, 3, 7)).toBe(0);
    });
});
```

---

## Responsibilities

### This Module Owns
✅ Login streak calculation  
✅ Streak cycle logic (1-7 wrapping)  
✅ Reward point calculation  
✅ Bonus BPS calculation  
✅ Claim record creation  
✅ Configuration defaults

### This Module Does NOT Own
❌ Player stats updates (handled in profile module)  
❌ State read/write operations (handled by Contract)  
❌ Handler orchestration (handled in contract.ts)  
❌ Validation logic (handled in validation module)  
❌ UTC date generation (handled in utils/time)

---

## Examples

### Example 1: First Time Login
```typescript
const nextStreak = calculateNextStreak('', '2026-07-06', 0, 7);
// Returns: 1 (first login)

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 1);
// Returns: { rewardPoints: 10, bonusBps: 0 }
```

### Example 2: Consecutive Day Login
```typescript
const nextStreak = calculateNextStreak('2026-07-05', '2026-07-06', 3, 7);
// Returns: 4 (day 4 of streak)

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 4);
// Returns: { rewardPoints: 40, bonusBps: 0 }
```

### Example 3: Completing Streak Cycle
```typescript
const nextStreak = calculateNextStreak('2026-07-05', '2026-07-06', 6, 7);
// Returns: 7 (completing cycle)

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 7);
// Returns: { rewardPoints: 100, bonusBps: 500 }
```

### Example 4: Continuing After Completion
```typescript
const nextStreak = calculateNextStreak('2026-07-05', '2026-07-06', 7, 7);
// Returns: 1 (starts new cycle)

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 1);
// Returns: { rewardPoints: 10, bonusBps: 0 }
```

### Example 5: Missed Day (Reset)
```typescript
const nextStreak = calculateNextStreak('2026-07-04', '2026-07-06', 3, 7);
// Returns: 1 (streak broken, reset)

const { rewardPoints, bonusBps } = calculateLoginReward(gameConfig, 1);
// Returns: { rewardPoints: 10, bonusBps: 0 }
```

---

## Migration Notes

### Before Phase 6
```typescript
// In contract.ts - mixed with handler
const streakSchedule = getConfiguredDailyLoginRewardPoints(cfg);
const currentStreak = toUint64(stats.loginStreak);
const scheduleLength = streakSchedule.length || 7;
let nextStreak = 1;
if (previousClaimUtcDate === previousUtcDate(utcDate)) {
    nextStreak = currentStreak >= scheduleLength ? 1 : currentStreak + 1;
}
const rewardPoints = resolveDailyLoginRewardPoints(cfg, nextStreak);
const bonusBps = nextStreak >= streakSchedule.length 
    ? getConfiguredDailyLoginBonusBps(cfg) 
    : 0;
```

### After Phase 6
```typescript
// Clean, focused functions
import { calculateNextStreak, calculateLoginReward } from './checkin';

const scheduleLength = getConfiguredDailyLoginRewardPoints(cfg).length || 7;
const nextStreak = calculateNextStreak(
    stats.lastLoginClaimUtcDate || '',
    utcDate,
    toUint64(stats.loginStreak),
    scheduleLength
);
const { rewardPoints, bonusBps } = calculateLoginReward(cfg, nextStreak);
```

---

## Summary

The check-in module provides clean, testable functions for managing daily login rewards and streak tracking. It handles all streak calculation logic, reward point determination, and claim record creation while remaining focused and easy to understand.

**Key Benefits**:
- ✅ Clear separation of concerns
- ✅ Pure functions (easy to test)
- ✅ Configuration-driven rewards
- ✅ Type-safe interfaces
- ✅ Self-documenting code

**Module Size**: ~300 lines across 3 implementation files
**Complexity**: Low (pure calculations, no state management)
**Reusability**: High (functions compose well)

