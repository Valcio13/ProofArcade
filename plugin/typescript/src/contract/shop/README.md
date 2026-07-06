# Shop Module

**Purpose**: Classic point redemption system for exchanging points for CNPY tokens

**Created**: Phase 7 (2026-07-06)

---

## Overview

The shop module handles the redemption of classic points earned from gameplay into CNPY tokens. Players can burn their accumulated classic points to receive CNPY (PROOF tokens) from either the shop pool or DAO pool, with configurable exchange rates and validation rules.

### Redemption Mechanics

- **Exchange Rate**: Configurable (default: 500 points = 1 PROOF)
- **Minimum**: 500 points (configurable)
- **Step Size**: 500 points (must redeem in multiples, configurable)
- **Payout Source**: Shop pool (preferred) or DAO pool (fallback)
- **Treasury Tracking**: Updates shop balance in game treasury

### Validation Rules

1. **Minimum threshold**: Must redeem at least `shopMinRedeemPoints`
2. **Step increment**: Must be multiple of `shopRedeemStepPoints`
3. **Sufficient balance**: Player must have enough classic points
4. **Non-zero payout**: Calculated payout must be > 0
5. **Pool funds**: Selected pool must have sufficient funds
6. **Treasury balance**: Shop treasury must have sufficient funds

---

## Module Structure

```
shop/
├── types.ts           Type definitions
├── validation.ts      Validation logic
├── pricing.ts         Rate calculations
├── redemption.ts      Redemption operations
├── index.ts           Barrel export
└── README.md          This file
```

---

## Types

### ClassicPointRedemption

Represents a single point redemption transaction.

```typescript
interface ClassicPointRedemption {
    playerAddress: Uint8Array;     // Player wallet address
    burnPoints: number | Long;     // Points burned
    payoutAmount: number | Long;   // CNPY paid (uproof)
    redeemedAtUnix: number | Long; // Timestamp (microseconds)
    txHash: string;                // Transaction hash (hex)
}
```

### ShopRedemptionConfig

Configuration for redemption rates and limits.

```typescript
interface ShopRedemptionConfig {
    shopRedemptionRatePoints: number;  // Points per CNPY unit
    shopRedemptionRateCnpy: number;    // CNPY per unit (uproof)
    shopMinRedeemPoints: number;       // Minimum points
    shopRedeemStepPoints: number;      // Step size
}
```

### RedemptionValidation

Result of validation check.

```typescript
interface RedemptionValidation {
    valid: boolean;      // Whether redemption is valid
    error?: string;      // Error message if invalid
}
```

---

## Validation Functions

### validateMinimumPoints()

Check if redemption meets minimum threshold.

```typescript
import { validateMinimumPoints } from './shop';

const result = validateMinimumPoints(500, 500);
// Returns: { valid: true }

const tooLow = validateMinimumPoints(100, 500);
// Returns: { valid: false, error: '...' }
```

### validateStepIncrement()

Check if redemption is valid step increment.

```typescript
import { validateStepIncrement } from './shop';

const valid = validateStepIncrement(1000, 500);
// Returns: { valid: true } (1000 is multiple of 500)

const invalid = validateStepIncrement(750, 500);
// Returns: { valid: false, error: '...' } (not multiple)
```

### validateSufficientBalance()

Check if player has enough points.

```typescript
import { validateSufficientBalance } from './shop';

const sufficient = validateSufficientBalance(500, 1000);
// Returns: { valid: true } (balance 1000 >= burn 500)

const insufficient = validateSufficientBalance(500, 300);
// Returns: { valid: false, error: '...' }
```

### validatePayoutAmount()

Check if payout is greater than zero.

```typescript
import { validatePayoutAmount } from './shop';

const nonZero = validatePayoutAmount(1000000);
// Returns: { valid: true }

const zero = validatePayoutAmount(0);
// Returns: { valid: false, error: '...' }
```

### validateRedemption()

Run all validation checks.

```typescript
import { validateRedemption } from './shop';

const result = validateRedemption(
    500,      // burnPoints
    1000,     // classicPointsBalance
    500,      // minRedeemPoints
    500,      // redeemStepPoints
    1000000   // payoutAmount
);
// Returns: { valid: true } or first failure
```

---

## Pricing Functions

### calculateRedeemPayout()

Calculate payout for points burned.

```typescript
import { calculateRedeemPayout } from './shop';

const payout = calculateRedeemPayout(
    500,      // burnPoints
    500,      // ratePoints
    1000000   // rateCnpy (1 PROOF in uproof)
);
// Returns: 1000000 (1 PROOF)

// Formula: floor((500 * 1000000) / 500) = 1000000
```

**Exchange Rate Examples**:
- 500 points @ 500:1000000 = 1 PROOF (1000000 uproof)
- 1000 points @ 500:1000000 = 2 PROOF (2000000 uproof)
- 2500 points @ 500:1000000 = 5 PROOF (5000000 uproof)

### calculateRedeemPayoutFromConfig()

Calculate payout using config rates.

```typescript
import { calculateRedeemPayoutFromConfig } from './shop';

const payout = calculateRedeemPayoutFromConfig(gameConfig, 1000);
// Reads rates from config and calculates
```

### calculatePointsForPayout()

Inverse calculation - points needed for desired payout.

```typescript
import { calculatePointsForPayout } from './shop';

const pointsNeeded = calculatePointsForPayout(
    5000000,  // Want 5 PROOF
    500,      // ratePoints
    1000000   // rateCnpy
);
// Returns: 2500 (points needed)

// Formula: ceil((5000000 * 500) / 1000000) = 2500
```

### getExchangeRate()

Get exchange rate information.

```typescript
import { getExchangeRate } from './shop';

const rate = getExchangeRate(500, 1000000);
// Returns: {
//   pointsPerProof: 500,   // 500 points = 1 PROOF
//   cnpyPerPoint: 2000     // 1 point = 2000 uproof
// }
```

### Configuration Getters

```typescript
import {
    getConfiguredShopRedemptionRatePoints,
    getConfiguredShopRedemptionRateCnpy,
    getConfiguredShopMinRedeemPoints,
    getConfiguredShopRedeemStepPoints
} from './shop';

const ratePoints = getConfiguredShopRedemptionRatePoints(cfg);
// Returns: configured value or default 500

const rateCnpy = getConfiguredShopRedemptionRateCnpy(cfg);
// Returns: configured value or default 1000000

const minPoints = getConfiguredShopMinRedeemPoints(cfg);
// Returns: configured value or default 500

const stepPoints = getConfiguredShopRedeemStepPoints(cfg);
// Returns: configured value or default 500
```

---

## Redemption Functions

### createRedemptionRecord()

Create redemption record for storage.

```typescript
import { createRedemptionRecord } from './shop';

const recordBytes = createRedemptionRecord(
    playerAddress,     // Uint8Array
    500,               // burnPoints
    1000000,           // payoutAmount
    1720253400000000,  // redeemedAtUnix
    'ABCD1234...'      // txHash (hex)
);
```

### selectPayoutPool()

Determine which pool to use.

```typescript
import Long from 'long';
import { selectPayoutPool } from './shop';

const useShopPool = selectPayoutPool(
    Long.fromNumber(5000000),  // Shop pool balance
    Long.fromNumber(10000000), // DAO pool balance
    Long.fromNumber(1000000)   // Required payout
);
// Returns: true (shop pool has sufficient funds)

const useDaoPool = selectPayoutPool(
    Long.fromNumber(500000),   // Shop pool insufficient
    Long.fromNumber(10000000), // DAO pool sufficient
    Long.fromNumber(1000000)
);
// Returns: false (use DAO pool)
```

### hasSufficientPoolFunds()

Check if pool has sufficient funds.

```typescript
import Long from 'long';
import { hasSufficientPoolFunds } from './shop';

const sufficient = hasSufficientPoolFunds(
    Long.fromNumber(5000000),  // Pool balance
    Long.fromNumber(1000000)   // Required payout
);
// Returns: true
```

### hasShopBalance()

Check if treasury shop balance is sufficient.

```typescript
import { hasShopBalance } from './shop';

const sufficient = hasShopBalance(
    5000000,   // Treasury shop balance
    1000000    // Required payout
);
// Returns: true
```

---

## Usage Patterns

### Complete Redemption Flow

```typescript
import {
    validateRedemption,
    calculateRedeemPayout,
    getConfiguredShopRedemptionRatePoints,
    getConfiguredShopRedemptionRateCnpy,
    getConfiguredShopMinRedeemPoints,
    getConfiguredShopRedeemStepPoints,
    selectPayoutPool,
    hasShopBalance,
    createRedemptionRecord
} from './shop';
import Long from 'long';

async function redeemClassicPoints(
    contract: Contract,
    playerAddress: Uint8Array,
    burnPoints: number,
    gameConfig: any,
    stats: PlayerStats,
    shopPoolAmount: Long,
    daoPoolAmount: Long,
    treasuryShopBalance: number,
    tx: any
) {
    // 1. Get configuration
    const minRedeemPoints = getConfiguredShopMinRedeemPoints(gameConfig);
    const redeemStepPoints = getConfiguredShopRedeemStepPoints(gameConfig);
    const ratePoints = getConfiguredShopRedemptionRatePoints(gameConfig);
    const rateCnpy = getConfiguredShopRedemptionRateCnpy(gameConfig);
    
    // 2. Calculate payout
    const payoutAmount = calculateRedeemPayout(burnPoints, ratePoints, rateCnpy);
    
    // 3. Validate redemption
    const validation = validateRedemption(
        burnPoints,
        stats.classicPointsBalance,
        minRedeemPoints,
        redeemStepPoints,
        payoutAmount
    );
    
    if (!validation.valid) {
        return { error: validation.error };
    }
    
    // 4. Check treasury balance
    if (!hasShopBalance(treasuryShopBalance, payoutAmount)) {
        return { error: 'Insufficient treasury balance' };
    }
    
    // 5. Select payout pool
    const payoutLong = Long.fromNumber(payoutAmount);
    const useShopPool = selectPayoutPool(shopPoolAmount, daoPoolAmount, payoutLong);
    
    // 6. Verify selected pool has funds
    const selectedPool = useShopPool ? shopPoolAmount : daoPoolAmount;
    if (!hasSufficientPoolFunds(selectedPool, payoutLong)) {
        return { error: 'Insufficient pool funds' };
    }
    
    // 7. Create redemption record
    const txHash = computeTxHash(tx);
    const recordBytes = createRedemptionRecord(
        playerAddress,
        burnPoints,
        payoutAmount,
        tx.time,
        txHash
    );
    
    // 8. Write state (handled by caller)
    return {
        payoutAmount,
        useShopPool,
        recordBytes
    };
}
```

### Quick Validation

```typescript
import { validateRedemption, calculateRedeemPayoutFromConfig } from './shop';

function quickValidate(cfg: any, burnPoints: number, balance: number): boolean {
    const payout = calculateRedeemPayoutFromConfig(cfg, burnPoints);
    const result = validateRedemption(
        burnPoints,
        balance,
        cfg.shopMinRedeemPoints || 500,
        cfg.shopRedeemStepPoints || 500,
        payout
    );
    return result.valid;
}
```

### Calculate Exchange Rates

```typescript
import { getExchangeRate } from './shop';

function displayExchangeRate(cfg: any) {
    const rate = getExchangeRate(
        cfg.shopRedemptionRatePoints || 500,
        cfg.shopRedemptionRateCnpy || 1000000
    );
    
    console.log(`Exchange Rate: ${rate.pointsPerProof} points = 1 PROOF`);
    console.log(`Per Point: ${rate.cnpyPerPoint} uproof per point`);
}
```

---

## Design Principles

### 1. **Clear Separation**
- **validation.ts**: Validation logic only
- **pricing.ts**: Rate calculations only
- **redemption.ts**: Record creation and pool selection
- **No database operations**: Functions focus on calculations

### 2. **Configuration-Driven**
```typescript
// ✅ Good - configurable
const payout = calculateRedeemPayoutFromConfig(config, points);

// ❌ Bad - hardcoded
const payout = (points * 1000000) / 500;
```

### 3. **Validation Functions Return Results**
```typescript
// ✅ Good - descriptive result
const result = validateMinimumPoints(100, 500);
if (!result.valid) {
    console.log(result.error);
}

// ❌ Bad - throws exception
try {
    validateMinimumPoints(100, 500);
} catch (e) { }
```

### 4. **Pure Calculations**
```typescript
// ✅ Pure - same inputs always produce same outputs
const payout = calculateRedeemPayout(500, 500, 1000000);
// Always returns 1000000

// Easy to test
expect(calculateRedeemPayout(500, 500, 1000000)).toBe(1000000);
```

### 5. **Defensive Programming**
```typescript
// All functions check for invalid inputs
if (burnPoints <= 0 || ratePoints <= 0 || rateCnpy <= 0) {
    return 0;
}
```

---

## When to Modify

### Add New Validation Rule
**Location**: `validation.ts`

**Example**: Add maximum redemption check
```typescript
export function validateMaximumPoints(
    burnPoints: number,
    maxRedeemPoints: number
): RedemptionValidation {
    if (burnPoints > maxRedeemPoints) {
        return {
            valid: false,
            error: `Exceeds maximum (${maxRedeemPoints})`
        };
    }
    return { valid: true };
}
```

### Add New Pricing Calculation
**Location**: `pricing.ts`

**Example**: Calculate bulk discount
```typescript
export function calculateBulkDiscount(
    burnPoints: number,
    threshold: number,
    discountBps: number
): number {
    if (burnPoints >= threshold) {
        return Math.floor((burnPoints * discountBps) / 10000);
    }
    return 0;
}
```

### Add New Type
**Location**: `types.ts`

**Example**: Add redemption statistics
```typescript
export interface RedemptionStatistics {
    totalRedemptions: number;
    totalPointsBurned: number;
    totalCnpyPaid: number;
    averageRedemptionSize: number;
}
```

### Modify Exchange Rate Formula
**Location**: `pricing.ts` → `calculateRedeemPayout()`

**Example**: Add bonus multiplier
```typescript
export function calculateRedeemPayout(
    burnPoints: number,
    ratePoints: number,
    rateCnpy: number,
    bonusMultiplier: number = 1.0
): number {
    if (burnPoints <= 0 || ratePoints <= 0 || rateCnpy <= 0) {
        return 0;
    }
    const basePayout = Math.floor((burnPoints * rateCnpy) / ratePoints);
    return Math.floor(basePayout * bonusMultiplier);
}
```

---

## Dependencies

### Internal Dependencies
- `game2048.js` - encodeGame2048State(), toUint64()
- `config/index.ts` - Default configuration values

### External Dependencies
- `long` - For handling 64-bit integers (pool amounts)

---

## Testing Recommendations

### Unit Tests for Validation
```typescript
describe('validateMinimumPoints', () => {
    it('should pass when points meet minimum', () => {
        const result = validateMinimumPoints(500, 500);
        expect(result.valid).toBe(true);
    });
    
    it('should fail when points below minimum', () => {
        const result = validateMinimumPoints(100, 500);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });
});

describe('validateStepIncrement', () => {
    it('should pass for valid multiples', () => {
        expect(validateStepIncrement(1000, 500).valid).toBe(true);
        expect(validateStepIncrement(1500, 500).valid).toBe(true);
    });
    
    it('should fail for invalid multiples', () => {
        expect(validateStepIncrement(750, 500).valid).toBe(false);
    });
    
    it('should pass when step is 0', () => {
        expect(validateStepIncrement(123, 0).valid).toBe(true);
    });
});
```

### Unit Tests for Pricing
```typescript
describe('calculateRedeemPayout', () => {
    it('should calculate correct payout', () => {
        expect(calculateRedeemPayout(500, 500, 1000000)).toBe(1000000);
        expect(calculateRedeemPayout(1000, 500, 1000000)).toBe(2000000);
        expect(calculateRedeemPayout(2500, 500, 1000000)).toBe(5000000);
    });
    
    it('should return 0 for invalid inputs', () => {
        expect(calculateRedeemPayout(0, 500, 1000000)).toBe(0);
        expect(calculateRedeemPayout(500, 0, 1000000)).toBe(0);
        expect(calculateRedeemPayout(500, 500, 0)).toBe(0);
        expect(calculateRedeemPayout(-100, 500, 1000000)).toBe(0);
    });
    
    it('should floor fractional results', () => {
        expect(calculateRedeemPayout(333, 500, 1000000)).toBe(666000);
    });
});
```

### Unit Tests for Pool Selection
```typescript
describe('selectPayoutPool', () => {
    it('should prefer shop pool when sufficient', () => {
        const result = selectPayoutPool(
            Long.fromNumber(5000000),
            Long.fromNumber(10000000),
            Long.fromNumber(1000000)
        );
        expect(result).toBe(true);
    });
    
    it('should use DAO pool when shop insufficient', () => {
        const result = selectPayoutPool(
            Long.fromNumber(500000),
            Long.fromNumber(10000000),
            Long.fromNumber(1000000)
        );
        expect(result).toBe(false);
    });
});
```

---

## Responsibilities

### This Module Owns
✅ Redemption validation logic  
✅ Payout calculation formulas  
✅ Exchange rate calculations  
✅ Pool selection logic  
✅ Redemption record creation  
✅ Configuration defaults and getters

### This Module Does NOT Own
❌ Player stats updates (handled in profile module)  
❌ State read/write operations (handled by Contract)  
❌ Pool balance updates (handled in handler)  
❌ Treasury balance updates (handled in handler)  
❌ Transaction hash computation (handled in handler)  
❌ Handler orchestration (handled in contract.ts)

---

## Examples

### Example 1: Basic Redemption (500 points)
```typescript
const payout = calculateRedeemPayout(500, 500, 1000000);
// Returns: 1000000 (1 PROOF)

const validation = validateRedemption(500, 1000, 500, 500, payout);
// Returns: { valid: true }
```

### Example 2: Large Redemption (2500 points)
```typescript
const payout = calculateRedeemPayout(2500, 500, 1000000);
// Returns: 5000000 (5 PROOF)

const validation = validateRedemption(2500, 3000, 500, 500, payout);
// Returns: { valid: true }
```

### Example 3: Invalid Step (750 points)
```typescript
const payout = calculateRedeemPayout(750, 500, 1000000);
// Returns: 1500000 (1.5 PROOF)

const validation = validateRedemption(750, 1000, 500, 500, payout);
// Returns: { valid: false, error: 'must be multiple of 500' }
```

### Example 4: Insufficient Balance
```typescript
const payout = calculateRedeemPayout(1000, 500, 1000000);
// Returns: 2000000 (2 PROOF)

const validation = validateRedemption(1000, 500, 500, 500, payout);
// Returns: { valid: false, error: 'Insufficient classic points' }
```

### Example 5: Pool Selection
```typescript
// Shop pool has enough - use it
const useShop = selectPayoutPool(
    Long.fromNumber(2000000),
    Long.fromNumber(10000000),
    Long.fromNumber(1000000)
);
// Returns: true

// Shop pool insufficient - use DAO
const useDao = selectPayoutPool(
    Long.fromNumber(500000),
    Long.fromNumber(10000000),
    Long.fromNumber(1000000)
);
// Returns: false
```

---

## Migration Notes

### Before Phase 7
```typescript
// In contract.ts - mixed with handler (~130 lines)
const minRedeemPoints = getConfiguredShopMinRedeemPoints(cfg);
const redeemStepPoints = getConfiguredShopRedeemStepPoints(cfg);
const ratePoints = getConfiguredShopRedemptionRatePoints(cfg);
const rateCnpy = getConfiguredShopRedemptionRateCnpy(cfg);

if (burnPoints < minRedeemPoints) {
    return { error: ErrRedeemBelowMinimum() };
}
if (redeemStepPoints > 0 && burnPoints % redeemStepPoints !== 0) {
    return { error: ErrRedeemInvalidStep() };
}
// ... more validation ...

const payoutAmount = calculateRedeemPayout(burnPoints, ratePoints, rateCnpy);
if (payoutAmount <= 0) {
    return { error: ErrRedeemPayoutZero() };
}

const useShopPool = !shopPoolAmount.lessThan(payoutLong);
// ... 80+ more lines ...
```

### After Phase 7
```typescript
// Clean, focused functions
import { 
    validateRedemption,
    calculateRedeemPayoutFromConfig,
    selectPayoutPool,
    createRedemptionRecord,
    getConfiguredShopMinRedeemPoints,
    getConfiguredShopRedeemStepPoints
} from './shop';

// Get config values
const minRedeemPoints = getConfiguredShopMinRedeemPoints(cfg);
const redeemStepPoints = getConfiguredShopRedeemStepPoints(cfg);

// Calculate payout
const payoutAmount = calculateRedeemPayoutFromConfig(cfg, burnPoints);

// Validate
const validation = validateRedemption(
    burnPoints, stats.classicPointsBalance,
    minRedeemPoints, redeemStepPoints, payoutAmount
);
if (!validation.valid) {
    return { error: validation.error };
}

// Select pool
const useShopPool = selectPayoutPool(shopPoolAmount, daoPoolAmount, payoutLong);

// Create record
const recordBytes = createRedemptionRecord(
    playerAddress, burnPoints, payoutAmount, redeemedAtUnix, txHash
);
```

---

## Summary

The shop module provides clean, testable functions for managing classic point redemptions. It handles all validation, pricing calculations, and record creation while remaining focused and easy to understand.

**Key Benefits**:
- ✅ Clear validation with descriptive errors
- ✅ Flexible pricing calculations
- ✅ Configuration-driven exchange rates
- ✅ Pure functions (easy to test)
- ✅ Type-safe interfaces
- ✅ Defensive programming

**Module Size**: ~400 lines across 4 implementation files
**Complexity**: Low-Medium (calculations and validation)
**Reusability**: High (functions compose well)

