/**
 * Weekly Blitz Competition Module
 * 
 * Handles helper functions and logic for the Weekly Blitz game mode:
 * - 5 PROOF entry fee
 * - 5-minute timer
 * - 2 Official Runs per UTC day
 * - Cumulative scoring over the week
 * - Monday 00:00 UTC to Sunday 23:59 UTC
 * 
 * NOTE: State keys are now centralized in utils/state.ts
 * NOTE: Fee split is now centralized in economy/fee-distribution.ts
 */

// Re-export state keys from utils/state.ts for backward compatibility
export {
    KeyForWeeklyBlitzPool,
    KeyForWeeklyBlitzDailyTracking,
    KeyForWeeklyBlitzPlayerScore,
    KeyForWeeklyBlitzLeaderboard,
    KeyForWeeklyBlitzLeaderboardPrefix,
    KeyForWeeklyBlitzSession
} from '../utils/state.js';

// Re-export fee split from economy module
export { splitWeeklyBlitzFee } from '../economy/fee-distribution.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export const WEEKLY_BLITZ_FEE = 5_000_000; // 5 PROOF in uproof
export const WEEKLY_BLITZ_DURATION_SECONDS = 3 * 60; // 3 minutes
export const WEEKLY_BLITZ_RUNS_PER_DAY = 2; // 2 paid runs per day

/** Transaction timestamps (tx.time) are microseconds; session *AtUnix fields follow suit. */
export const MICROS_PER_SECOND = 1_000_000;

/**
 * Grace period allowed between a session expiring and its result being submitted.
 *
 * The 5-minute timer is a hard limit on PLAY, but the submit transaction is necessarily
 * built *after* the timer runs out (the player finishes, the frontend replays locally,
 * signs, and sends). Rejecting anything past expiry would therefore reject every honest
 * full-length run. This window tolerates that plus network/indexing delay, while still
 * preventing someone from holding a session open indefinitely.
 */
export const WEEKLY_BLITZ_SUBMIT_GRACE_SECONDS = 120; // 2 minutes

// Fee split (basis points, 10000 = 100%)
export const WEEKLY_BLITZ_POOL_FEE_BPS = 6000; // 60%
export const WEEKLY_BLITZ_SHOP_FEE_BPS = 2000; // 20%
export const WEEKLY_BLITZ_RESERVE_FEE_BPS = 1500; // 15%
export const WEEKLY_BLITZ_PLATFORM_FEE_BPS = 500; // 5%

// Week calculation constants
const WEEK_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds
const EPOCH_OFFSET = 4 * 24 * 60 * 60; // Thursday offset to make Monday week start

// ============================================================================
// WEEK CALCULATION
// ============================================================================

/**
 * Calculate week ID from Unix timestamp
 * Week starts Monday 00:00 UTC
 * Returns string format "week_2700" for consistency with other competition IDs
 */
export function getWeekId(currentUnix: number): string {
    const weekNumber = Math.floor((currentUnix - EPOCH_OFFSET) / WEEK_SECONDS);
    return `week_${weekNumber}`;
}

/**
 * Get the start timestamp of a week (Monday 00:00 UTC)
 * @param weekId - Week ID in format "week_2700" or just the number
 */
export function getWeekStart(weekId: string | number): number {
    const weekNumber = typeof weekId === 'string' 
        ? parseInt(weekId.replace('week_', ''))
        : weekId;
    return (weekNumber * WEEK_SECONDS) + EPOCH_OFFSET;
}

/**
 * Get the end timestamp of a week (Sunday 23:59 UTC)
 * @param weekId - Week ID in format "week_2700" or just the number
 */
export function getWeekEnd(weekId: string | number): number {
    return getWeekStart(weekId) + WEEK_SECONDS - 1;
}

/**
 * Get current UTC date string in YYYY-MM-DD format
 */
export function getUTCDate(unixTimestamp?: number): string {
    const date = unixTimestamp ? new Date(unixTimestamp * 1000) : new Date();
    return date.toISOString().split('T')[0];
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WeeklyBlitzDailyTracking {
    utcDate: string;
    playerAddress: Uint8Array;
    weekId: string;
    officialRunsUsed: number;
    lastPlayedAtUnix: number;
}

export interface WeeklyBlitzPlayerScore {
    weekId: string;
    playerAddress: Uint8Array;
    totalScore: number;
    bestSingleRunScore: number;
    officialRunsCompleted: number;
    lastUpdatedAtUnix: number;
}

export interface WeeklyBlitzPool {
    weekId: string;
    entryCount: number;
    grossFees: number;
    prizePool: number;
    finalized: boolean;
    finalizedAtUnix: number;
}

// ============================================================================
// ENCODING/DECODING
// ============================================================================

/**
 * Decode daily tracking from state bytes
 */
export function decodeWeeklyBlitzDailyTracking(bytes: Uint8Array | null | undefined): WeeklyBlitzDailyTracking | null {
    if (!bytes || bytes.length === 0) return null;
    try {
        const json = JSON.parse(Buffer.from(bytes).toString('utf8'));
        return {
            utcDate: json.utcDate,
            playerAddress: Buffer.from(json.playerAddress, 'hex'),
            weekId: json.weekId,
            officialRunsUsed: json.officialRunsUsed || 0,
            lastPlayedAtUnix: json.lastPlayedAtUnix || 0,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Encode daily tracking to state bytes
 */
export function encodeWeeklyBlitzDailyTracking(tracking: WeeklyBlitzDailyTracking): Uint8Array {
    const json = {
        utcDate: tracking.utcDate,
        playerAddress: Buffer.from(tracking.playerAddress).toString('hex'),
        weekId: tracking.weekId,
        officialRunsUsed: tracking.officialRunsUsed,
        lastPlayedAtUnix: tracking.lastPlayedAtUnix,
    };
    return Buffer.from(JSON.stringify(json), 'utf8');
}

/**
 * Decode player score from state bytes
 */
export function decodeWeeklyBlitzPlayerScore(bytes: Uint8Array | null | undefined): WeeklyBlitzPlayerScore | null {
    if (!bytes || bytes.length === 0) return null;
    try {
        const json = JSON.parse(Buffer.from(bytes).toString('utf8'));
        return {
            weekId: json.weekId,
            playerAddress: Buffer.from(json.playerAddress, 'hex'),
            totalScore: json.totalScore || 0,
            bestSingleRunScore: json.bestSingleRunScore || 0,
            officialRunsCompleted: json.officialRunsCompleted || 0,
            lastUpdatedAtUnix: json.lastUpdatedAtUnix || 0,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Encode player score to state bytes
 */
export function encodeWeeklyBlitzPlayerScore(score: WeeklyBlitzPlayerScore): Uint8Array {
    const json = {
        weekId: score.weekId,
        playerAddress: Buffer.from(score.playerAddress).toString('hex'),
        totalScore: score.totalScore,
        bestSingleRunScore: score.bestSingleRunScore,
        officialRunsCompleted: score.officialRunsCompleted,
        lastUpdatedAtUnix: score.lastUpdatedAtUnix,
    };
    return Buffer.from(JSON.stringify(json), 'utf8');
}

/**
 * Decode weekly pool from state bytes
 */
export function decodeWeeklyBlitzPool(bytes: Uint8Array | null | undefined): WeeklyBlitzPool | null {
    if (!bytes || bytes.length === 0) return null;
    try {
        const json = JSON.parse(Buffer.from(bytes).toString('utf8'));
        return {
            weekId: json.weekId,
            entryCount: json.entryCount || 0,
            grossFees: json.grossFees || 0,
            prizePool: json.prizePool || 0,
            finalized: json.finalized || false,
            finalizedAtUnix: json.finalizedAtUnix || 0,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Encode weekly pool to state bytes
 */
export function encodeWeeklyBlitzPool(pool: WeeklyBlitzPool): Uint8Array {
    const json = {
        weekId: pool.weekId,
        entryCount: pool.entryCount,
        grossFees: pool.grossFees,
        prizePool: pool.prizePool,
        finalized: pool.finalized,
        finalizedAtUnix: pool.finalizedAtUnix,
    };
    return Buffer.from(JSON.stringify(json), 'utf8');
}
