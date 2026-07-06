/**
 * Competition Rewards Module
 * 
 * Handles daily reward pool finalization and allocation calculations.
 * Distributes daily challenge rewards to top players based on leaderboard rankings.
 */

import Long from 'long';
import type { Contract } from '../contract.js';
import type { IPluginError } from '../error.js';
import { toUint64, decodeGame2048State, encodeGame2048State } from '../game2048.js';
import { randomQueryId, getQueryValue, normalizeBytes } from '../utils/helpers.js';
import { getConfiguredDailyPayoutBps } from '../config/index.js';
import {
    KeyForDailyPrizePool,
    KeyForGameConfig,
    KeyForDailyRewardAllocation,
    KeyForDailyRewardByPlayer,
    KeyForDailyLeaderboardPrefix,
} from '../utils/state.js';
import {
    decodeDailyPrizePool,
    encodeDailyPrizePool,
} from './prize-pool.js';
import { hasUtcDayEnded } from '../utils/time.js';
import {
    ErrDailyPrizePoolNotFound,
    ErrDailyRewardDayNotClaimable,
} from '../error.js';

/**
 * Daily reward allocation record
 * Represents a single player's reward allocation for a specific day
 */
export type DailyRewardAllocationRecord = {
    utcDate: string;
    playerAddress: Uint8Array;
    gameId: Uint8Array;
    rank: number;
    rewardAmount: number;
    score: number;
    maxTile: number;
    moveCount: number;
    endedAtUnix: number;
};

/**
 * Daily reward finalization summary
 * Contains all allocations and distribution totals
 */
export type DailyRewardFinalizationSummary = {
    allocations: DailyRewardAllocationRecord[];
    distributed: Long;
    leftover: Long;
};

/**
 * Finalize the daily reward pool if needed
 * 
 * Checks if the daily reward pool for a given UTC date needs finalization,
 * and if so, calculates allocations and writes them to state.
 * 
 * @param contract - Contract instance for state access
 * @param utcDate - UTC date string (YYYY-MM-DD)
 * @param nowMicros - Current timestamp in microseconds
 * @returns Error if finalization failed, null if successful or already finalized
 * 
 * @remarks
 * - Only finalizes once per day after the UTC day has ended
 * - Creates allocation records for top players based on leaderboard
 * - Writes allocations indexed by rank+gameId and by playerAddress
 * - Updates prize pool with finalization status and distribution amounts
 */
export async function finalizeDailyRewardPoolIfNeeded(
    contract: Contract,
    utcDate: string,
    nowMicros: number
): Promise<IPluginError | null> {
    const poolQueryId = randomQueryId();
    const configQueryId = randomQueryId();
    const [response, readErr] = await contract.plugin.StateRead(contract, {
        keys: [
            { queryId: poolQueryId, key: KeyForDailyPrizePool(utcDate) },
            { queryId: configQueryId, key: KeyForGameConfig() }
        ]
    });
    if (readErr) {
        return readErr;
    }
    if (response?.error) {
        return response.error;
    }

    const poolBytes = getQueryValue(response, poolQueryId);
    if (!poolBytes || poolBytes.length === 0) {
        return ErrDailyPrizePoolNotFound();
    }
    const configBytes = getQueryValue(response, configQueryId);
    const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
    const pool = decodeDailyPrizePool(poolBytes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (gameConfig as any) || {};

    // Already finalized, nothing to do
    if (pool.finalized) {
        return null;
    }
    
    // Day hasn't ended yet, can't finalize
    if (!hasUtcDayEnded(utcDate, nowMicros)) {
        return ErrDailyRewardDayNotClaimable();
    }

    const payoutBps = getConfiguredDailyPayoutBps(cfg);
    const rewardPool = Long.fromNumber(toUint64(pool.rewardPool as Long | number | undefined));
    const sets: Array<{ key: Uint8Array; value: Uint8Array }> = [];
    
    // Calculate allocations from leaderboard
    const [summary, summaryErr] = await loadDailyRewardFinalizationSummary(contract, utcDate, rewardPool, payoutBps);
    if (summaryErr) {
        return summaryErr;
    }

    // Write each allocation with dual indexing (by rank+gameId and by player)
    summary.allocations.forEach((allocation) => {
        const allocationValue = encodeGame2048State('DailyRewardAllocation', allocation);
        
        // Index by rank and gameId for leaderboard display
        sets.push({
            key: KeyForDailyRewardAllocation(
                utcDate,
                toUint64(allocation.rank as Long | number | undefined),
                normalizeBytes(allocation.gameId)
            ),
            value: allocationValue
        });
        
        // Index by player address for claim lookup
        sets.push({
            key: KeyForDailyRewardByPlayer(utcDate, normalizeBytes(allocation.playerAddress)),
            value: allocationValue
        });
    });

    // Update pool with finalization status
    const updatedPool = encodeDailyPrizePool({
        ...pool,
        finalized: true,
        finalizedAtUnix: nowMicros,
        distributedRewards: summary.distributed.toNumber(),
        treasuryLeftover: summary.leftover.toNumber()
    }, utcDate);
    sets.push({ key: KeyForDailyPrizePool(utcDate), value: updatedPool });

    // Write all changes atomically
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, { sets });
    if (writeErr) {
        return writeErr;
    }
    if (writeResp?.error) {
        return writeResp.error;
    }
    
    return null;
}

/**
 * Load daily reward finalization summary
 * 
 * Reads the leaderboard for a given day and calculates reward allocations
 * based on the payout BPS configuration.
 * 
 * @param contract - Contract instance for state access
 * @param utcDate - UTC date string (YYYY-MM-DD)
 * @param rewardPool - Total reward pool amount
 * @param payoutBps - Array of payout percentages in BPS for each rank
 * @returns Tuple of [summary, error]
 * 
 * @remarks
 * - Only allocates to as many positions as there are leaderboard entries
 * - Renormalizes payout percentages if fewer players than positions
 * - Last player gets remainder to ensure exact distribution
 * - Example: Top 10 get [30%, 20%, 12%, 9%, 7%, 6%, 5%, 4%, 4%, 3%]
 */
export async function loadDailyRewardFinalizationSummary(
    contract: Contract,
    utcDate: string,
    rewardPool: Long,
    payoutBps: number[]
): Promise<[DailyRewardFinalizationSummary, IPluginError | null]> {
    const leaderboardPrefix = KeyForDailyLeaderboardPrefix(utcDate);
    const [iterResp, iterErr] = await contract.plugin.StateRead(contract, {
        ranges: [
            {
                prefix: leaderboardPrefix,
                limit: payoutBps.length
            }
        ]
    });
    if (iterErr) {
        return [{ allocations: [], distributed: Long.ZERO, leftover: rewardPool }, iterErr];
    }
    if (iterResp?.error) {
        return [{ allocations: [], distributed: Long.ZERO, leftover: rewardPool }, iterResp.error];
    }

    let distributed = Long.ZERO;
    const allocations: DailyRewardAllocationRecord[] = [];
    
    // Get top N entries from leaderboard (N = min(payoutBps.length, actual entries))
    const entries = (iterResp?.results?.[0]?.entries || []).slice(0, payoutBps.length);
    const usedPayoutBps = payoutBps.slice(0, entries.length);
    const usedPayoutBpsTotal = usedPayoutBps.reduce((sum, bps) => sum + bps, 0);
    
    // Calculate allocation for each leaderboard entry
    entries.forEach((entry: any, index: number) => {
        const [leaderboardEntry] = decodeGame2048State('LeaderboardEntry', entry.value || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const boardEntry = (leaderboardEntry as any) || {};
        
        // Last player gets remainder to ensure exact total
        const rewardAmount = index === entries.length - 1
            ? rewardPool.subtract(distributed)
            : calculateRenormalizedBpsAmount(
                rewardPool,
                usedPayoutBps[index] || 0,
                usedPayoutBpsTotal
            );
        
        distributed = distributed.add(rewardAmount);
        allocations.push({
            utcDate,
            playerAddress: normalizeBytes(boardEntry.playerAddress),
            gameId: normalizeBytes(boardEntry.gameId),
            rank: index + 1,
            rewardAmount: rewardAmount.toNumber(),
            score: toUint64(boardEntry.score as Long | number | undefined),
            maxTile: toUint64(boardEntry.maxTile as Long | number | undefined),
            moveCount: toUint64(boardEntry.moveCount as Long | number | undefined),
            endedAtUnix: toUint64(boardEntry.endedAtUnix as Long | number | undefined)
        });
    });

    const leftover = rewardPool.greaterThan(distributed) ? rewardPool.subtract(distributed) : Long.ZERO;
    return [{ allocations, distributed, leftover }, null];
}

/**
 * Calculate renormalized BPS amount
 * 
 * Used when actual payout positions are fewer than configured positions.
 * Renormalizes the BPS to maintain proportional distribution.
 * 
 * @param total - Total amount to distribute
 * @param rankBps - BPS for this specific rank
 * @param usedTotalBps - Sum of all used BPS (may be less than 10000)
 * @returns Calculated amount
 * 
 * @remarks
 * - Formula: (total * rankBps) / usedTotalBps
 * - Example: 5 players, but 10 positions configured
 *   - usedTotalBps = sum of first 5 positions' BPS
 *   - Each player's percentage is renormalized to total 100%
 */
export function calculateRenormalizedBpsAmount(total: Long, rankBps: number, usedTotalBps: number): Long {
    if (rankBps <= 0 || usedTotalBps <= 0) {
        return Long.ZERO;
    }
    return total
        .multiply(Long.fromNumber(rankBps))
        .divide(Long.fromNumber(usedTotalBps));
}
