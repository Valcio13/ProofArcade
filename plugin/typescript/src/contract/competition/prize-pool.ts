/**
 * Prize Pool Management Module
 * 
 * Functions for managing daily competition prize pools.
 */

import Long from 'long';
import { decodeGame2048State, encodeGame2048State, toUint64 } from '../game2048.js';

/**
 * Decode a daily prize pool from state bytes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeDailyPrizePool(poolBytes: Uint8Array | null | undefined): any {
    if (!poolBytes || poolBytes.length === 0) {
        return {};
    }
    const [pool] = decodeGame2048State('DailyPrizePool', poolBytes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (pool as any) || {};
}

/**
 * Create or update a daily prize pool
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encodeDailyPrizePool(pool: any, utcDate: string): Uint8Array {
    return encodeGame2048State('DailyPrizePool', {
        utcDate,
        entryCount: toUint64(pool.entryCount as Long | number | undefined),
        grossFees: toUint64(pool.grossFees as Long | number | undefined),
        treasuryFees: toUint64(pool.treasuryFees as Long | number | undefined),
        rewardPool: toUint64(pool.rewardPool as Long | number | undefined),
        finalized: pool.finalized || false,
        finalizedAtUnix: toUint64(pool.finalizedAtUnix as Long | number | undefined),
        distributedRewards: toUint64(pool.distributedRewards as Long | number | undefined),
        treasuryLeftover: toUint64(pool.treasuryLeftover as Long | number | undefined)
    });
}

/**
 * Add an entry to the daily prize pool
 */
export function addDailyPoolEntry(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pool: any,
    entryFee: Long,
    platformFee: Long,
    reserveFee: Long,
    shopFee: Long,
    rewardFee: Long
): { entryCount: number; grossFees: number; treasuryFees: number; rewardPool: number } {
    const currentEntryCount = toUint64(pool.entryCount as Long | number | undefined);
    const currentGrossFees = Long.fromNumber(toUint64(pool.grossFees as Long | number | undefined));
    const currentTreasuryFees = Long.fromNumber(toUint64(pool.treasuryFees as Long | number | undefined));
    const currentRewardPool = Long.fromNumber(toUint64(pool.rewardPool as Long | number | undefined));
    
    const treasuryTotal = platformFee.add(reserveFee).add(shopFee);
    
    return {
        entryCount: currentEntryCount + 1,
        grossFees: currentGrossFees.add(entryFee).toNumber(),
        treasuryFees: currentTreasuryFees.add(treasuryTotal).toNumber(),
        rewardPool: currentRewardPool.add(rewardFee).toNumber()
    };
}

/**
 * Finalize a daily prize pool
 */
export function finalizeDailyPool(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pool: any,
    distributedRewards: number,
    treasuryLeftover: number,
    finalizedAtUnix: number | Long
): Uint8Array {
    return encodeGame2048State('DailyPrizePool', {
        utcDate: pool.utcDate,
        entryCount: toUint64(pool.entryCount as Long | number | undefined),
        grossFees: toUint64(pool.grossFees as Long | number | undefined),
        treasuryFees: toUint64(pool.treasuryFees as Long | number | undefined),
        rewardPool: toUint64(pool.rewardPool as Long | number | undefined),
        finalized: true,
        finalizedAtUnix: toUint64(finalizedAtUnix as Long | number | undefined),
        distributedRewards,
        treasuryLeftover
    });
}

/**
 * Check if a daily pool is finalized
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDailyPoolFinalized(pool: any): boolean {
    return pool.finalized === true;
}

/**
 * Get daily pool reward amount
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDailyPoolRewardAmount(pool: any): number {
    return toUint64(pool.rewardPool as Long | number | undefined);
}

/**
 * Get daily pool entry count
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDailyPoolEntryCount(pool: any): number {
    return toUint64(pool.entryCount as Long | number | undefined);
}
