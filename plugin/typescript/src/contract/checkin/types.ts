/**
 * Check-in Module - Type Definitions
 * 
 * This module contains TypeScript interfaces for check-in and login reward functionality.
 */

import Long from 'long';

/**
 * Daily Login Claim Record
 * 
 * Tracks a player's daily login reward claim.
 */
export interface DailyLoginClaim {
    /** UTC date of the login claim (YYYY-MM-DD format) */
    utcDate: string;
    
    /** Player's wallet address */
    playerAddress: Uint8Array;
    
    /** Current streak day (1-7, cycles back to 1) */
    streakDay: number | Long;
    
    /** Points rewarded for this login */
    rewardPoints: number | Long;
    
    /** Bonus BPS awarded (non-zero on day 7) */
    bonusBps: number | Long;
    
    /** Unix timestamp when claimed (microseconds) */
    claimedAtUnix: number | Long;
}

/**
 * Login Reward Schedule Configuration
 * 
 * Configuration for daily login reward points.
 */
export interface LoginRewardConfig {
    /** Array of points for each day (e.g., [10, 20, 30, 40, 50, 60, 100]) */
    dailyLoginRewardPoints: number[];
    
    /** Bonus BPS awarded on completing full streak */
    dailyLoginBonusBps: number;
}
