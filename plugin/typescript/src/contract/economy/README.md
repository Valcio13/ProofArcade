# Economy v2 Module

Unified economy system for ProofArcade supporting Daily Challenge, Classic Mode, and future game modes.

## Architecture

The economy module provides a clean separation of concerns for managing entry fees, pool balances, and competition tracking.

## Module Files

### `types.ts` - Core Type Definitions

**Responsibility**: Defines all shared types, interfaces, and constants used across the economy system.

**Key Exports**:
- `CompetitionType` - Game mode identifiers ('daily', 'classic', 'monthly', 'weekly')
- `FeeSplitConfig` - Fee distribution configuration in basis points
- `FeeSplitResult` - Computed fee split amounts
- `PoolUpdate` - Pool balance change operations
- `CompetitionMetadata` - Competition tracking data (NOT pool balances)
- `TreasurySnapshot` - Current state of all treasury pools
- `PoolIDs` - Centralized pool ID constants
- `DefaultFeeSplits` - Predefined configurations for daily/classic modes
- `EconomyError` - Custom error class with error codes

**Design Notes**:
- Competition metadata is separate from pool balances
- Pools are the single source of truth for all balance data
- Fee splits are validated to ensure they total exactly 100% (10000 bps)

### `fee-distribution.ts` - Fee Splitting Logic

**Responsibility**: Calculates how entry fees are distributed across treasury buckets.

**Key Exports**:
- `validateFeeSplit(config)` - Ensures fee split totals 100%
- `splitFee(fee, config)` - Primary API for fee distribution

**How to Use**:
```typescript
import { splitFee, DefaultFeeSplits } from './economy';

// Daily Challenge (80% reward, 10% reserve, 5% shop, 5% platform)
const dailySplit = splitFee(entryFee, DefaultFeeSplits.daily);

// Classic Mode (45% shop, 30% monthly, 20% reserve, 5% platform)
const classicSplit = splitFee(entryFee, DefaultFeeSplits.classic);
```

**Implementation Details**:
- Uses integer division to avoid floating point errors
- Assigns remainder to last bucket for exact totals
- Validates configuration before splitting

### `pool-operations.ts` - Pool Management

**Responsibility**: Provides reusable helpers for reading, updating, and transferring pool balances.

**Key Exports**:
- `readPoolBalance(contract, poolId)` - Query pool from state
- `updatePoolBalance(contract, poolId, amount)` - Modify pool balance
- `transferBetweenPools(contract, from, to, amount)` - Pool-to-pool transfer
- `transferFromPoolToPlayer(contract, poolId, player, amount)` - Pool-to-player transfer
- `withdrawToPlayerWithFallback(contract, primary, fallback, player, amount)` ⭐ - Smart withdrawal with automatic fallback
- `applyPoolUpdates(contract, updates[])` - Batch update multiple pools atomically
- `collectAndDistributeFee(contract, feeSplit)` ⭐ - One-call fee distribution

**Primary APIs**:
- Use `collectAndDistributeFee()` for entry fee processing
- Use `withdrawToPlayerWithFallback()` for reward claiming and shop redemption
- Other functions are lower-level primitives

**Design Principles**:
- Pools are the single source of truth for balances
- All balance queries go through pools, never competition metadata
- Atomic operations for consistency
- Reusable across all game modes

### `competition-registry.ts` - Competition Tracking

**Responsibility**: Manages competition lifecycle metadata (NOT balances).

**Key Exports**:
- `updateCompetitionMetadata(contract, metadata)` - Register/update competition
- `getCompetitionMetadata(contract, competitionId)` - Retrieve competition data
- `getCompetitionPoolBalance(contract, competitionId)` - Query pool balance (delegates to pool-operations)
- `finalizeCompetition(contract, competitionId, timestamp)` - Mark as finalized
- `recordCompetitionEntry(contract, competitionId, fee)` - Track entry count
- `getCurrentUTCDate(timestamp)` - Utility for date strings (YYYY-MM-DD)
- `getCurrentUTCMonth(timestamp)` - Utility for month strings (YYYY-MM)

**What Metadata Tracks**:
- Entry counts and gross fees
- Competition start/end times
- Finalization status
- Competition type and ID

**What Metadata Does NOT Track**:
- Pool balances (query pools directly)
- Player balances (query Account state)
- Reward allocations (separate system)

**Phase Status**: Phase 2 will implement actual state storage

### `index.ts` - Module Exports

**Responsibility**: Central export point for all economy module functionality.

Exports everything from:
- types.ts
- fee-distribution.ts
- pool-operations.ts
- competition-registry.ts

## Usage Examples

### Starting a Daily Game

```typescript
import { splitFee, DefaultFeeSplits, PoolIDs } from './economy';

async function startDailyGame(contract: Contract, entryFee: Long) {
    // Split the fee
    const split = splitFee(entryFee, DefaultFeeSplits.daily);
    
    // Update pools
    await updatePoolBalance(contract, PoolIDs.PLATFORM, split.platform);
    await updatePoolBalance(contract, PoolIDs.DAILY, split.reward);
    await updatePoolBalance(contract, PoolIDs.RESERVE, split.reserve);
    await updatePoolBalance(contract, PoolIDs.SHOP, split.shop);
    
    // Track competition metadata
    const competitionId = getCurrentUTCDate(tx.time);
    await recordCompetitionEntry(contract, competitionId, entryFee);
}
```

### Starting a Classic Game

```typescript
import { splitFee, DefaultFeeSplits, PoolIDs } from './economy';

async function startClassicGame(contract: Contract, entryFee: Long) {
    // Split the fee
    const split = splitFee(entryFee, DefaultFeeSplits.classic);
    
    // Update pools (Classic has monthly pool)
    await updatePoolBalance(contract, PoolIDs.PLATFORM, split.platform);
    await updatePoolBalance(contract, PoolIDs.MONTHLY, split.monthly!);
    await updatePoolBalance(contract, PoolIDs.RESERVE, split.reserve);
    await updatePoolBalance(contract, PoolIDs.SHOP, split.shop);
    
    // Track monthly competition
    const monthId = getCurrentUTCMonth(tx.time);
    await recordCompetitionEntry(contract, monthId, entryFee);
}
```

### Claiming Rewards (with Fallback)

```typescript
import { withdrawToPlayerWithFallback, PoolIDs } from './economy';

async function claimDailyReward(
    contract: Contract,
    playerAddress: Uint8Array,
    rewardAmount: Long
) {
    // Transfer from daily pool to player, fall back to DAO if insufficient
    const { poolUsed } = await withdrawToPlayerWithFallback(
        contract,
        PoolIDs.DAILY,      // Try daily pool first
        PoolIDs.DAO,        // Fall back to DAO if insufficient
        playerAddress,
        rewardAmount
    );
    
    console.log(`Reward paid from pool ${poolUsed}`);
}
```

### Shop Redemption (with Fallback)

```typescript
import { withdrawToPlayerWithFallback, PoolIDs } from './economy';

async function redeemClassicPoints(
    contract: Contract,
    playerAddress: Uint8Array,
    payoutAmount: Long
) {
    // Transfer from shop pool to player, fall back to DAO if insufficient
    const { poolUsed } = await withdrawToPlayerWithFallback(
        contract,
        PoolIDs.SHOP,       // Try shop pool first
        PoolIDs.DAO,        // Fall back to DAO if insufficient
        playerAddress,
        payoutAmount
    );
    
    console.log(`Payout made from pool ${poolUsed}`);
}
```

## Design Principles

1. **Pools are the source of truth** - All balances live in pools, never in metadata
2. **Separation of concerns** - Fee distribution, pool management, and competition tracking are independent
3. **Type safety** - Strong TypeScript types prevent errors
4. **Reusability** - Functions work across all game modes
5. **Validation** - Fee splits are validated before execution
6. **Atomicity** - State changes are atomic and consistent

## Future Extensibility

The modular design supports:
- Adding new game modes (weekly challenges, tournaments, etc.)
- Custom fee split configurations per mode
- Complex pool transfer logic
- Multi-token support
- Season-based competitions

## Development Status

- **Phase 1**: ✅ Foundation - Module structure and types
- **Phase 2**: 🚧 In Progress - Implement state read/write operations
- **Phase 3**: ⏳ Planned - Refactor Daily Challenge
- **Phase 4**: ⏳ Planned - Refactor Classic Mode
- **Phase 5**: ⏳ Planned - Remove legacy code
