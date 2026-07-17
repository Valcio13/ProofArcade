/**
 * Competition Module
 * 
 * Game session management, competitions, and prize pools.
 */

// Types
export type {
    GameSession,
    DailyPrizePool,
    DailyAttempt,
    DailySubmission,
    LeaderboardEntry,
    DailyRewardAllocationRecord,
    DailyRewardFinalizationSummary
} from './types.js';

export {
    GameMode,
    SessionStatus
} from './types.js';

// Weekly Blitz exports
export type {
    WeeklyBlitzSession,
    WeeklyBlitzDailyTracking,
    WeeklyBlitzPlayerScore,
    WeeklyBlitzLeaderboardEntry,
    WeeklyBlitzPrizePool,
    WeeklyBlitzRewardAllocation
} from './weekly-blitz.js';

export {
    WEEKLY_BLITZ_CONFIG,
    getWeekId,
    getWeekStart,
    getWeekEnd,
    getUTCDate,
    createWeeklyBlitzSession,
    isSessionWeeklyBlitz,
    isSessionExpired,
    decodeWeeklyBlitzDailyTracking,
    encodeWeeklyBlitzDailyTracking,
    createWeeklyBlitzDailyTracking,
    decodeWeeklyBlitzPlayerScore,
    encodeWeeklyBlitzPlayerScore,
    createWeeklyBlitzPlayerScore,
    createWeeklyBlitzPrizePool,
    createWeeklyBlitzLeaderboardEntry
} from './weekly-blitz.js';

// Session functions
export {
    createDailySession,
    createClassicSession,
    decodeSession,
    completeSession,
    isSessionActive,
    isSessionDaily,
    isSessionClassic,
    getSessionMaxMoves,
    getSessionSeed,
    createDailyAttempt,
    createDailySubmission,
    createLeaderboardEntry
} from './session.js';

// Prize pool functions
export {
    decodeDailyPrizePool,
    encodeDailyPrizePool,
    addDailyPoolEntry,
    finalizeDailyPool,
    isDailyPoolFinalized,
    getDailyPoolRewardAmount,
    getDailyPoolEntryCount
} from './prize-pool.js';
