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

// Session functions
export {
    createDailySession,
    createClassicSession,
    decodeSession,
    completeSession,
    isSessionActive,
    isSessionDaily,
    isSessionClassic,
    isSessionWeeklyBlitz,
    getSessionWeekId,
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

// Weekly Blitz functions
export {
    // Constants
    WEEKLY_BLITZ_FEE,
    WEEKLY_BLITZ_DURATION_SECONDS,
    WEEKLY_BLITZ_RUNS_PER_DAY,
    WEEKLY_BLITZ_SUBMIT_GRACE_SECONDS,
    MICROS_PER_SECOND,
    // Week calculation
    getWeekId,
    getWeekStart,
    getWeekEnd,
    getUTCDate,
    // State keys (re-exported from utils/state.ts)
    KeyForWeeklyBlitzDailyTracking,
    KeyForWeeklyBlitzPlayerScore,
    KeyForWeeklyBlitzLeaderboard,
    KeyForWeeklyBlitzLeaderboardPrefix,
    KeyForWeeklyBlitzPool,
    KeyForWeeklyBlitzSession,
    // Encoding/Decoding
    decodeWeeklyBlitzDailyTracking,
    encodeWeeklyBlitzDailyTracking,
    decodeWeeklyBlitzPlayerScore,
    encodeWeeklyBlitzPlayerScore,
    decodeWeeklyBlitzPool,
    encodeWeeklyBlitzPool,
    // Fee split (re-exported from economy module)
    splitWeeklyBlitzFee
} from './weekly-blitz.js';

export type {
    WeeklyBlitzDailyTracking,
    WeeklyBlitzPlayerScore,
    WeeklyBlitzPool
} from './weekly-blitz.js';

// Reward Engine
export {
    calculateRewardDistribution,
    getPlayerTier,
    getTierBoundaries,
    MONTHLY_COMPETITION_CONFIG,
    WEEKLY_BLITZ_CONFIG
} from './reward-engine.js';

export type {
    DistributionType,
    TierName,
    TierConfig,
    CompetitionConfig,
    RewardAllocation,
    RewardDistributionResult,
    LeaderboardEntry as RewardLeaderboardEntry
} from './reward-engine.js';
