/**
 * Check-in Module - Streak Management
 * 
 * Handles login streak calculation and tracking.
 */

import { previousUtcDate } from '../utils/time.js';

/**
 * Calculate next streak day based on previous claim date
 * 
 * Logic:
 * - If previous claim was yesterday: increment streak (with cycle)
 * - Otherwise: reset to day 1
 * 
 * Streak cycles from 1 to scheduleLength, then back to 1.
 * Example with 7-day schedule: 1→2→3→4→5→6→7→1
 * 
 * @param previousClaimDate - Previous login claim UTC date (YYYY-MM-DD)
 * @param currentDate - Current UTC date (YYYY-MM-DD)
 * @param currentStreak - Current streak day (1-based)
 * @param scheduleLength - Length of reward schedule (e.g., 7)
 * @returns Next streak day (1-based)
 */
export function calculateNextStreak(
    previousClaimDate: string,
    currentDate: string,
    currentStreak: number,
    scheduleLength: number
): number {
    // Check if streak should continue
    if (previousClaimDate === previousUtcDate(currentDate)) {
        // Consecutive day - increment with cycle
        return currentStreak >= scheduleLength ? 1 : currentStreak + 1;
    }
    
    // Non-consecutive - reset to day 1
    return 1;
}

/**
 * Check if login streak should reset
 * 
 * Streak resets if more than 1 day has passed since last claim.
 * 
 * @param previousClaimDate - Previous login claim UTC date (YYYY-MM-DD)
 * @param currentDate - Current UTC date (YYYY-MM-DD)
 * @returns true if streak should reset, false if it continues
 */
export function shouldResetStreak(
    previousClaimDate: string,
    currentDate: string
): boolean {
    return previousClaimDate !== previousUtcDate(currentDate);
}

/**
 * Check if login is on a consecutive day
 * 
 * @param previousClaimDate - Previous login claim UTC date (YYYY-MM-DD)
 * @param currentDate - Current UTC date (YYYY-MM-DD)
 * @returns true if login is on consecutive day
 */
export function isConsecutiveDay(
    previousClaimDate: string,
    currentDate: string
): boolean {
    return previousClaimDate === previousUtcDate(currentDate);
}

/**
 * Get streak cycle position
 * 
 * Determines position within the streak cycle (1-based).
 * 
 * @param streakDay - Current streak day
 * @param scheduleLength - Length of reward schedule
 * @returns Position within cycle (1 to scheduleLength)
 */
export function getStreakCyclePosition(
    streakDay: number,
    scheduleLength: number
): number {
    if (scheduleLength <= 0) return 1;
    
    // Normalize to 1-based position within cycle
    const position = ((streakDay - 1) % scheduleLength) + 1;
    return position;
}
