/**
 * Check-in Module - Barrel Export
 * 
 * Re-exports all check-in and login reward functionality.
 */

// Types
export type { DailyLoginClaim, LoginRewardConfig } from './types.js';

// Streak functions
export {
    calculateNextStreak,
    shouldResetStreak,
    isConsecutiveDay,
    getStreakCyclePosition
} from './streak.js';

// Reward functions
export {
    defaultDailyLoginRewardPoints,
    defaultDailyLoginBonusBps,
    getConfiguredDailyLoginRewardPoints,
    getConfiguredDailyLoginBonusBps,
    getLoginRewardPoints,
    getLoginBonusBps,
    createDailyLoginClaim,
    calculateLoginReward
} from './rewards.js';
