# Configuration Module

Centralized game configuration constants for ProofArcade 2048.

## Purpose

Single source of truth for all game economic and gameplay parameters. All configuration values are defined here and imported where needed.

## Ownership

This module owns:
- ✅ Entry fee amounts
- ✅ Fee split percentages (basis points)
- ✅ Reward payout distributions
- ✅ Game limits (moves, caps)
- ✅ Shop redemption rates
- ✅ Check-in reward schedules

This module does NOT own:
- ❌ Business logic
- ❌ State management
- ❌ Configuration getters (those stay in contract.ts as bridges)

## Constants

### Entry Fees

```typescript
defaultClassicStartFee: 2000000     // 2 PROOF (uproof micro-denomination)
defaultDailyStartFee: 25000000      // 25 PROOF
legacyClassicStartFee: 90           // Deprecated
legacyDailyStartFee: 240            // Deprecated
```

**Purpose**: Define entry costs for different game modes.

### Game Limits

```typescript
defaultDailyMaxMoves: 80            // Maximum moves in daily challenge
```

**Purpose**: Enforce gameplay constraints.

### Fee Splits (Basis Points)

**Daily Challenge:**
```typescript
defaultDailyPlatformFeeBps: 500     // 5% to platform
defaultDailyRewardFeeBps: 8000      // 80% to daily reward pool
defaultDailyReserveFeeBps: 1000     // 10% to reserve
defaultDailyShopFeeBps: 500         // 5% to shop
```

**Classic Mode:**
```typescript
defaultClassicPlatformFeeBps: 500   // 5% to platform
defaultClassicReserveFeeBps: 4500   // 45% to reserve
defaultClassicShopFeeBps: 5000      // 50% to shop
```

**Note**: Basis points (BPS) = percentage * 100. Example: 500 BPS = 5%.

### Reward Payouts

**Daily Challenge Top 10:**
```typescript
defaultDailyPayoutBps: [
    3000,  // Rank 1: 30%
    2000,  // Rank 2: 20%
    1200,  // Rank 3: 12%
    900,   // Rank 4: 9%
    700,   // Rank 5: 7%
    600,   // Rank 6: 6%
    500,   // Rank 7: 5%
    400,   // Rank 8: 4%
    400,   // Rank 9: 4%
    300    // Rank 10: 3%
]
// Total: 100% of daily prize pool
```

### Classic Points System

```typescript
defaultClassicDailyPointsCap: 2000  // Max points per UTC day
```

**Purpose**: Prevent farming by capping daily classic points earnings.

### Shop Configuration

```typescript
defaultShopRedemptionRatePoints: 300      // Points required for redemption
defaultShopRedemptionRateCnpy: 1000000    // 1 PROOF (uproof)
defaultShopMinRedeemPoints: 300           // Minimum redemption
defaultShopRedeemStepPoints: 300          // Redemption increment
```

**Rate Calculation:**
- 300 points = 1 PROOF
- Players redeem in multiples of 300 points
- Minimum 300 points required

### Check-in Rewards

**7-Day Streak Schedule:**
```typescript
defaultDailyLoginRewardPoints: [
    20,  // Day 1
    25,  // Day 2
    30,  // Day 3
    35,  // Day 4
    40,  // Day 5
    45,  // Day 6
    50   // Day 7
]
```

**Day 7 Bonus:**
```typescript
defaultDailyLoginBonusBps: 2000  // 20% bonus on classic points
```

**Mechanics:**
- Progressive rewards for consecutive daily logins
- Day 7 unlocks same-day classic points bonus
- Streak resets to Day 1 after Day 7

## Usage

```typescript
import {
    defaultDailyStartFee,
    defaultDailyPayoutBps,
    defaultShopRedemptionRatePoints
} from './config/index.js';

// Entry fee validation
if (amount < defaultDailyStartFee) {
    return { error: ErrInsufficientFunds() };
}

// Reward calculation
const rewardBps = defaultDailyPayoutBps[rank - 1];
const rewardAmount = calculateBpsAmount(prizePool, rewardBps);

// Shop redemption
const payout = (burnPoints * defaultShopRedemptionRateCnpy) / defaultShopRedemptionRatePoints;
```

## Configuration Getters

The `contract.ts` file contains `getConfigured*()` functions that read from state and fall back to these defaults. This pattern allows:
1. **Governance flexibility**: Parameters can be updated via state
2. **Safe defaults**: Always have fallback values
3. **Migration path**: Support legacy values during transitions

Example bridge function in contract.ts:
```typescript
function getConfiguredDailyStartFee(cfg: any): number {
    const fee = toUint64(cfg?.dailyStartFee);
    if (isLegacyStartFeePair(cfg)) {
        return defaultDailyStartFee;  // From config module
    }
    return fee > 0 ? fee : defaultDailyStartFee;
}
```

## Modifying Configuration

⚠️ **Important**: Changing these values affects game economics.

**Impact Assessment:**
- **Entry Fees**: Affects player acquisition and game volume
- **Fee Splits**: Changes pool growth rates and sustainability
- **Reward Payouts**: Impacts competitiveness and player retention
- **Points Cap**: Controls farming and economy balance
- **Shop Rates**: Affects value extraction and token demand

**Before Changing:**
1. Model economic impact
2. Review with team
3. Test on testnet
4. Deploy with announcement
5. Monitor metrics post-change

## Design Rationale

### Why Constants (not functions)?
- **Simplicity**: No need for complex getter patterns
- **Performance**: No function call overhead
- **Clarity**: Values are immediately visible
- **Type Safety**: TypeScript enforces number types

### Why Basis Points?
- **Precision**: Avoid floating point errors
- **Standard**: Industry standard for percentages
- **Flexibility**: Easy to represent fractions (e.g., 0.5% = 50 BPS)

### Why Defaults?
- **Resilience**: System works even if state is corrupted
- **Testing**: Easy to test without state setup
- **Migration**: Smooth upgrades when adding new parameters

## Related Modules

- **`utils/`** - Uses these constants for calculations
- **`economy/`** - Fee distribution uses fee splits
- **`contract.ts`** - Bridge functions read state and fall back to config

## Version History

- **v1.0.0** (2026-07-06) - Initial extraction from contract.ts
  - Centralized all configuration constants
  - Added JSDoc documentation for each constant
  - Organized by feature category
