/**
 * Weekly Blitz Competition Module
 * 
 * Implements the Weekly Blitz game mode:
 * - 5-minute timer per game
 * - 2 Official Runs + 3 Retries per UTC day
 * - Weekly cumulative scoring (max 14 runs per week)
 * - Separate weekly leaderboard and reward pool
 */

import Long from 'long';
import { encodeGame2048State, toUint64 } from '../game2048.js';
import { deriveDailySeed } from '../utils/crypto.js';

/**
 * Weekly Blitz configuration constants
 */
export const WEEKLY_BLITZ_CONFIG = {
    TIMER_DURATION_SECONDS: 300, // 5 minutes
    DAILY_OFFICIAL_RUNS: 2,
    DAILY_RETRIES: 3,
    MAX_WEEKLY_RUNS: 14, // 2 runs × 7 days
    START_FEE: 0n, // Free to play
    WEEKLY_POOL_ID: 196608n, // 0x30000 - Weekly Blitz Pool
};

/**
 * Weekly Blitz game session
 */
export interface WeeklyBlitzSession {
    gameId: Uint8Array;
    playerAddress: Uint8Array;
    weekId: number | Long;
    utcDate: string;
    seed: Uint8Array;
    status: number | Long; // 1 = active, 2 = completed
    startedHeight: number | Long;
    startedAtUnix: number | Long;
    expiresAtUnix: number | Long; // 5 minutes after start
    submittedScore?: number | Long;
    submittedMaxTile?: number | Long;
    finalMoveCount?: number | Long;
    stopReason?: number | Long;
    submittedAtUnix?: number | Long;
}

/**
 * Weekly Blitz daily tracking
 * Tracks Official Runs and Retries consumed per UTC day
 */
export interface WeeklyBlitzDailyTracking {
    utcDate: string;
    playerAddress: Uint8Array;
    weekId: number | Long;
    officialRunsUsed: number;
    retriesUsed: number;
    lastPlayedAtUnix: number | Long;
}

/**
 * Weekly Blitz player cumulative score
 * Tracks all submitted runs for the week
 */
export interface WeeklyBlitzPlayerScore {
    weekId: number | Long;
    playerAddress: Uint8Array;
    cumulativeScore: number | Long;
    runCount: number;
    bestSingleScore: number | Long;
    lastSubmittedAtUnix: number | Long;
}

/**
 * Weekly Blitz leaderboard entry
 */
export interface WeeklyBlitzLeaderboardEntry {
    playerAddress: Uint8Array;
    weekId: number | Long;
    cumulativeScore: number | Long;
    runCount: number;
    bestSingleScore: number | Long;
    lastSubmittedAtUnix: number | Long;
    username: string;
}

/**
 * Weekly Blitz prize pool
 */
export interface WeeklyBlitzPrizePool {
    weekId: number | Long;
    startUnix: number | Long; // Monday 00:00 UTC
    endUnix: number | Long; // Sunday 23:59 UTC
    participantCount: number | Long;
    runCount: number | Long;
    rewardPool: number | Long;
    finalized: boolean;
    finalizedAtUnix: number | Long;
    distributedRewards: number | Long;
}

/**
 * Weekly Blitz reward allocation
 */
export interface WeeklyBlitzRewardAllocation {
    weekId: number | Long;
    playerAddress: Uint8Array;
    rank: number;
    cumulativeScore: number | Long;
    rewardAmount: number | Long;
    claimed: boolean;
}

/**
 * Calculate week ID from Unix timestamp
 * Week starts Monday 00:00 UTC
 */
export function getWeekId(unixTimestamp: number | Long): number {
    const ts = typeof unixTimestamp === 'number' ? unixTimestamp : unixTimestamp.toNumber();
    const WEEK_SECONDS = 7 * 24 * 60 * 60;
    // Epoch (Jan 1, 1970) was a Thursday
    // Adjust to Monday: (4 days × 86400 seconds = 345600)
    const EPOCH_OFFSET = 4 * 24 * 60 * 60;
    return Math.floor((ts - EPOCH_OFFSET) / WEEK_SECONDS);
}

/**
 * Get week start timestamp (Monday 00:00 UTC)
 */
export function getWeekStart(weekId: number): number {
    const WEEK_SECONDS = 7 * 24 * 60 * 60;
    const EPOCH_OFFSET = 4 * 24 * 60 * 60;
    return weekId * WEEK_SECONDS + EPOCH_OFFSET;
}

/**
 * Get week end timestamp (Sunday 23:59:59 UTC)
 */
export function getWeekEnd(weekId: number): number {
    return getWeekStart(weekId + 1) - 1;
}

/**
 * Get UTC date string for daily tracking
 */
export function getUTCDate(unixTimestamp: number | Long): string {
    const ts = typeof unixTimestamp === 'number' ? unixTimestamp : unixTimestamp.toNumber();
    const date = new Date(ts * 1000);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Create a new Weekly Blitz game session
 */
export function createWeeklyBlitzSession(
    gameId: Uint8Array,
    playerAddress: Uint8Array,
    weekId: number,
    utcDate: string,
    chainId: number,
    startedHeight: number | Long,
    startedAtUnix: number | Long,
    feePaid: number | Long
): Uint8Array {
    const seed = deriveDailySeed(chainId, utcDate); // Use same seed derivation as daily
    const expiresAtUnix = toUint64(startedAtUnix as Long | number | undefined) + WEEKLY_BLITZ_CONFIG.TIMER_DURATION_SECONDS;
    
    return encodeGame2048State('GameSession', {
        gameId,
        playerAddress,
        mode: 3, // Weekly Blitz
        utcDate,
        weekId,
        seed,
        status: 1, // Active
        startedHeight: toUint64(startedHeight as Long | number | undefined),
        startedAtUnix: toUint64(startedAtUnix as Long | number | undefined),
        expiresAtUnix,
        feePaid: toUint64(feePaid as Long | number | undefined),
        maxMoves: 0 // No move limit for Weekly Blitz
    });
}

/**
 * Check if a session is Weekly Blitz mode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSessionWeeklyBlitz(session: any): boolean {
    return toUint64(session?.mode as Long | number | undefined) === 3;
}

/**
 * Check if game session has expired (5 minutes passed)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSessionExpired(session: any, currentUnix: number | Long): boolean {
    const current = typeof currentUnix === 'number' ? currentUnix : currentUnix.toNumber();
    const expires = toUint64(session?.expiresAtUnix as Long | number | undefined);
    return current >= expires;
}

/**
 * Decode Weekly Blitz daily tracking from state bytes
 */
export function decodeWeeklyBlitzDailyTracking(bytes: Uint8Array | null | undefined): WeeklyBlitzDailyTracking | null {
    if (!bytes || bytes.length === 0) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(bytes).toString('utf8'));
    } catch {
        return null;
    }
}

/**
 * Encode Weekly Blitz daily tracking to state bytes
 */
export function encodeWeeklyBlitzDailyTracking(tracking: WeeklyBlitzDailyTracking): Uint8Array {
    return Buffer.from(JSON.stringify(tracking), 'utf8');
}

/**
 * Create a new daily tracking record
 */
export function createWeeklyBlitzDailyTracking(
    utcDate: string,
    playerAddress: Uint8Array,
    weekId: number,
    lastPlayedAtUnix: number | Long
): Uint8Array {
    const tracking: WeeklyBlitzDailyTracking = {
        utcDate,
        playerAddress,
        weekId,
        officialRunsUsed: 0,
        retriesUsed: 0,
        lastPlayedAtUnix: toUint64(lastPlayedAtUnix as Long | number | undefined)
    };
    return Buffer.from(JSON.stringify(tracking), 'utf8');
}

/**
 * Decode Weekly Blitz player score from state bytes
 */
export function decodeWeeklyBlitzPlayerScore(bytes: Uint8Array | null | undefined): WeeklyBlitzPlayerScore | null {
    if (!bytes || bytes.length === 0) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(bytes).toString('utf8'));
    } catch {
        return null;
    }
}

/**
 * Encode Weekly Blitz player score to state bytes
 */
export function encodeWeeklyBlitzPlayerScore(score: WeeklyBlitzPlayerScore): Uint8Array {
    return Buffer.from(JSON.stringify(score), 'utf8');
}

/**
 * Create a new Weekly Blitz player score record
 */
export function createWeeklyBlitzPlayerScore(
    weekId: number,
    playerAddress: Uint8Array,
    cumulativeScore: number | Long,
    runCount: number,
    bestSingleScore: number | Long,
    lastSubmittedAtUnix: number | Long
): Uint8Array {
    const score: WeeklyBlitzPlayerScore = {
        weekId,
        playerAddress,
        cumulativeScore: toUint64(cumulativeScore as Long | number | undefined),
        runCount,
        bestSingleScore: toUint64(bestSingleScore as Long | number | undefined),
        lastSubmittedAtUnix: toUint64(lastSubmittedAtUnix as Long | number | undefined)
    };
    return Buffer.from(JSON.stringify(score), 'utf8');
}

/**
 * Decode Weekly Blitz prize pool from state bytes
 */
export function decodeWeeklyBlitzPrizePool(bytes: Uint8Array | null | undefined): WeeklyBlitzPrizePool | null {
    if (!bytes || bytes.length === 0) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(bytes).toString('utf8'));
    } catch {
        return null;
    }
}

/**
 * Encode Weekly Blitz prize pool to state bytes
 */
export function encodeWeeklyBlitzPrizePool(pool: WeeklyBlitzPrizePool): Uint8Array {
    return Buffer.from(JSON.stringify(pool), 'utf8');
}

/**
 * Create a new Weekly Blitz prize pool
 */
export function createWeeklyBlitzPrizePool(
    weekId: number,
    startUnix: number | Long,
    endUnix: number | Long
): Uint8Array {
    const pool: WeeklyBlitzPrizePool = {
        weekId,
        startUnix: toUint64(startUnix as Long | number | undefined),
        endUnix: toUint64(endUnix as Long | number | undefined),
        participantCount: Long.ZERO,
        runCount: Long.ZERO,
        rewardPool: Long.ZERO,
        finalized: false,
        finalizedAtUnix: Long.ZERO,
        distributedRewards: Long.ZERO
    };
    return Buffer.from(JSON.stringify(pool), 'utf8');
}

/**
 * Create a Weekly Blitz leaderboard entry
 */
export function createWeeklyBlitzLeaderboardEntry(
    playerAddress: Uint8Array,
    weekId: number,
    cumulativeScore: number | Long,
    runCount: number,
    bestSingleScore: number | Long,
    lastSubmittedAtUnix: number | Long,
    username: string
): Uint8Array {
    const entry: WeeklyBlitzLeaderboardEntry = {
        playerAddress,
        weekId,
        cumulativeScore: toUint64(cumulativeScore as Long | number | undefined),
        runCount,
        bestSingleScore: toUint64(bestSingleScore as Long | number | undefined),
        lastSubmittedAtUnix: toUint64(lastSubmittedAtUnix as Long | number | undefined),
        username
    };
    return Buffer.from(JSON.stringify(entry), 'utf8');
}

