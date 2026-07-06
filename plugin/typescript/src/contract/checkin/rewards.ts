/**
 * Check-in Module - Reward Calculations
 * 
 * Handles login reward point calculations and claim record creation.
 */

import Long from 'long';
import { encodeGame2048State, toUint64 } from '../game2048.js';
import {
    defaultDailyLoginRewardPoints,
    defaultDailyLoginBonusBps
} from '../config/index.js';

// Re-export for convenience
export { defaultDailyLoginRewardPoints, defaultDailyLoginBonusBps };

/**
 * Get configured daily login reward points schedule
 * 
 * @param cfg - Game configuration object
 * @returns Array of reward points for each streak day
 */
export function getConfiguredDailyLoginRewardPoints(cfg: any): number[] {
    const values = Array.isArray(cfg?.dailyLoginRewardPoints)
        ? cfg.dailyLoginRewardPoints.map((value: Long | number) => toUint64(value))
        : [];
    return values.length > 0 ? values : defaultDailyLoginRewardPoints;
}

/**
 * Get configured daily login bonus BPS
 * 
 * @param cfg - Game configuration object
 * @returns Bonus BPS value (e.g., 500 = 5%)
 */
export function getConfiguredDailyLoginBonusBps(cfg: any): number {
    const value = toUint64(cfg?.dailyLoginBonusBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyLoginBonusBps;
}

/**
 * Get login reward points for specific streak day
 * 
 * Uses the configured reward schedule to determine points for a given streak day.
 * If streakDay exceeds schedule length, uses the last value in schedule.
 * 
 * @param cfg - Game configuration object
 * @param streakDay - Current streak day (1-based)
 * @returns Reward points for the streak day
 */
export function getLoginRewardPoints(cfg: any, streakDay: number): number {
    const schedule = getConfiguredDailyLoginRewardPoints(cfg);
    if (schedule.length === 0) {
        return 0;
    }
    
    // Clamp to valid index range
    const index = Math.max(0, Math.min(schedule.length - 1, streakDay - 1));
    return schedule[index];
}

/**
 * Get login bonus BPS if applicable
 * 
 * Returns bonus BPS only if the player is completing the full streak cycle.
 * 
 * @param cfg - Game configuration object
 * @param streakDay - Current streak day (1-based)
 * @param scheduleLength - Length of reward schedule
 * @returns Bonus BPS (non-zero only on completing full cycle)
 */
export function getLoginBonusBps(
    cfg: any,
    streakDay: number,
    scheduleLength: number
): number {
    // Bonus only awarded when completing full streak cycle
    return streakDay >= scheduleLength ? getConfiguredDailyLoginBonusBps(cfg) : 0;
}

/**
 * Create daily login claim record
 * 
 * Encodes a DailyLoginClaim record for storage.
 * 
 * @param utcDate - UTC date of the claim (YYYY-MM-DD)
 * @param playerAddress - Player's wallet address
 * @param streakDay - Current streak day (1-based)
 * @param rewardPoints - Points awarded
 * @param bonusBps - Bonus BPS awarded (0 if none)
 * @param claimedAtUnix - Unix timestamp when claimed (microseconds)
 * @returns Encoded claim record bytes
 */
export function createDailyLoginClaim(
    utcDate: string,
    playerAddress: Uint8Array,
    streakDay: number,
    rewardPoints: number,
    bonusBps: number,
    claimedAtUnix: number | Long
): Uint8Array {
    return encodeGame2048State('DailyLoginClaim', {
        utcDate,
        playerAddress,
        streakDay,
        rewardPoints,
        bonusBps,
        claimedAtUnix
    });
}

/**
 * Calculate reward details for login claim
 * 
 * Convenience function that calculates all reward components at once.
 * 
 * @param cfg - Game configuration object
 * @param streakDay - Current streak day (1-based)
 * @returns Object with rewardPoints and bonusBps
 */
export function calculateLoginReward(
    cfg: any,
    streakDay: number
): { rewardPoints: number; bonusBps: number } {
    const schedule = getConfiguredDailyLoginRewardPoints(cfg);
    const scheduleLength = schedule.length || 7;
    
    return {
        rewardPoints: getLoginRewardPoints(cfg, streakDay),
        bonusBps: getLoginBonusBps(cfg, streakDay, scheduleLength)
    };
}
