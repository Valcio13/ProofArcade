/**
 * Economy v2 - Core Types
 * 
 * Defines shared types and interfaces for the unified economy system.
 * These types support Daily Challenge, Classic Mode, and future game modes.
 */

import Long from 'long';

// Re-export PoolIDs from state utilities for convenience
export { PoolIDs } from '../utils/state.js';

/**
 * Competition Types
 * Identifies the type of competition for fee distribution and pool management
 */
export type CompetitionType = 'daily' | 'classic' | 'monthly' | 'weekly';

/**
 * Pool Configuration
 * Defines a reward pool with its ID and metadata
 */
export interface PoolConfig {
    id: number;
    name: string;
    description?: string;
}

/**
 * Fee Split Configuration
 * Defines how entry fees are distributed across treasury buckets
 * All percentages are in basis points (bps): 100 bps = 1%
 */
export interface FeeSplitConfig {
    platformBps: number;      // Platform revenue share
    rewardBps: number;        // Competition reward pool
    reserveBps: number;       // Reserve/safety buffer
    shopBps: number;          // Shop funding (redemptions)
    monthlyBps?: number;      // Monthly competition (Classic only)
}

/**
 * Fee Split Result
 * The computed amounts after applying fee split configuration
 */
export interface FeeSplitResult {
    platform: Long;           // Amount to platform pool
    reward: Long;             // Amount to reward pool
    reserve: Long;            // Amount to reserve pool
    shop: Long;               // Amount to shop pool
    monthly?: Long;           // Amount to monthly pool (if applicable)
}

/**
 * Pool Update Operation
 * Describes a change to a pool balance
 */
export interface PoolUpdate {
    poolId: number;
    amount: Long;
    operation: 'add' | 'subtract';
}

/**
 * Competition Registry Entry
 * Metadata about a specific competition instance
 * 
 * NOTE: Pool balances are NOT stored here. Query pools directly for balances.
 * Competition metadata tracks entry counts, dates, and finalization only.
 */
export interface CompetitionMetadata {
    competitionId: string;    // e.g., "2026-07-05" for daily, "2026-07" for monthly
    type: CompetitionType;
    startTime: Long;
    endTime?: Long;
    entryFee: Long;
    entryCount: number;
    grossFees: Long;          // Total fees collected (entryCount * entryFee)
    finalized: boolean;
    finalizedAt?: Long;
}

/**
 * Treasury Balance Snapshot
 * Current state of all treasury pools
 */
export interface TreasurySnapshot {
    platform: Long;
    reserve: Long;
    shop: Long;
    daily?: Long;             // Daily reward pool (current day)
    monthly?: Long;           // Monthly reward pool (current month)
}

/**
 * Default Fee Split Configurations
 */
export const DefaultFeeSplits = {
    daily: {
        platformBps: 500,     // 5%
        rewardBps: 8000,      // 80%
        reserveBps: 1000,     // 10%
        shopBps: 500,         // 5%
    } as FeeSplitConfig,
    
    classic: {
        platformBps: 500,     // 5%
        rewardBps: 0,         // 0% (Classic doesn't have immediate reward)
        reserveBps: 2000,     // 20%
        shopBps: 4500,        // 45%
        monthlyBps: 3000,     // 30%
    } as FeeSplitConfig,
} as const;

/**
 * Economy Error Types
 */
export class EconomyError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'EconomyError';
    }
}

export const EconomyErrorCodes = {
    INVALID_FEE_SPLIT: 'INVALID_FEE_SPLIT',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_POOL_ID: 'INVALID_POOL_ID',
    POOL_NOT_FOUND: 'POOL_NOT_FOUND',
    COMPETITION_NOT_FOUND: 'COMPETITION_NOT_FOUND',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
} as const;
