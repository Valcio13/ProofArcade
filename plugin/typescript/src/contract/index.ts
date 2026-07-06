// Re-export all contract components
export {
    Contract,
    ContractConfig,
    ContractAsync
} from './contract.js';
export {
    Plugin,
    Config,
    DefaultConfig,
    NewConfigFromFile,
    StartPlugin,
    initializeContract,
    Marshal,
    Unmarshal,
    FromAny,
    JoinLenPrefix,
    PLUGIN_BUILD
} from './plugin.js';
export { StartRPCServer } from './rpc.js';
export * from './error.js';

// Re-export state key utilities for backward compatibility
export {
    KeyForAccount,
    KeyForFeeParams,
    KeyForFeePool,
    KeyForGamePlatformPool,
    KeyForGameReservePool,
    KeyForGameShopPool,
    KeyForGameDailyRewardPool,
    KeyForGameMonthlyRewardPool,
    KeyForDaoPool,
    KeyForGameConfig,
    KeyForGameTreasury,
    KeyForGameSession,
    KeyForDailyAttempt,
    KeyForDailySubmission,
    KeyForDailyPrizePool,
    KeyForDailyLeaderboard,
    KeyForDailyLeaderboardPrefix,
    KeyForDailyRewardAllocation,
    KeyForDailyRewardByPlayer,
    KeyForDailyRewardClaim,
    KeyForDailyLoginClaim,
    KeyForClassicLeaderboard,
    KeyForClassicPointsDailyLedger,
    KeyForClassicPointRedemption,
    KeyForClassicPointRedemptionPrefix,
    KeyForMonthlyLeaderboard,
    KeyForMonthlyPlayerEntry,
    KeyForPlayerStats,
    KeyForUsernameByAddress,
    KeyForAddressByUsername,
    KeyForPlayerIdentity,
    PoolIDs
} from './utils/state.js';

// Re-export validation functions for backward compatibility
export {
    checkMessageSend,
    checkMessageStartDailyGame,
    checkMessageStartClassicGame,
    checkMessageSubmitGameResult,
    checkMessageClaimDailyReward,
    checkMessageRedeemClassicPoints,
    checkMessageClaimDailyLoginReward,
    checkMessageSetUsername
} from './validation/index.js';

// Re-export profile functions for backward compatibility
export type {
    PlayerStats,
    PlayerIdentity,
    UsernameRegistration,
    PlayerStatsUpdate
} from './profile/index.js';
export {
    createPlayerStats,
    decodePlayerStats,
    encodePlayerStats,
    updatePlayerStats,
    incrementStatsField,
    addToStatsField,
    updateBestScore,
    updateBestTile,
    isUsernameValid,
    normalizeUsernameForLookup,
    decodePlayerIdentity,
    decodeUsernameRegistration,
    encodePlayerIdentity,
    encodeUsernameRegistration,
    createPlayerIdentity,
    updatePlayerIdentity,
    getUsernameFromState,
    getRegistrationTime
} from './profile/index.js';
export {
    calculateClassicPoints,
    calculateBonusPoints
} from './profile/points.js';

// Re-export competition functions for backward compatibility
export type {
    GameSession,
    DailyPrizePool,
    DailyAttempt,
    DailySubmission,
    LeaderboardEntry,
    DailyRewardAllocationRecord,
    DailyRewardFinalizationSummary
} from './competition/index.js';
export {
    GameMode,
    SessionStatus,
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
    createLeaderboardEntry,
    decodeDailyPrizePool,
    encodeDailyPrizePool,
    addDailyPoolEntry,
    finalizeDailyPool,
    isDailyPoolFinalized,
    getDailyPoolRewardAmount,
    getDailyPoolEntryCount
} from './competition/index.js';
export {
    finalizeDailyRewardPoolIfNeeded,
    loadDailyRewardFinalizationSummary,
    calculateRenormalizedBpsAmount
} from './competition/rewards.js';

// Re-export checkin functions for backward compatibility
export type {
    DailyLoginClaim,
    LoginRewardConfig
} from './checkin/index.js';
export {
    calculateNextStreak,
    shouldResetStreak,
    isConsecutiveDay,
    getStreakCyclePosition,
    defaultDailyLoginRewardPoints,
    defaultDailyLoginBonusBps,
    getConfiguredDailyLoginRewardPoints,
    getConfiguredDailyLoginBonusBps,
    getLoginRewardPoints,
    getLoginBonusBps,
    createDailyLoginClaim,
    calculateLoginReward
} from './checkin/index.js';

// Re-export shop functions for backward compatibility
export type {
    ClassicPointRedemption,
    ShopRedemptionConfig,
    RedemptionValidation,
    RedemptionCalculation
} from './shop/index.js';
export {
    validateMinimumPoints,
    validateStepIncrement,
    validateSufficientBalance,
    validatePayoutAmount,
    validateRedemption,
    createRedemptionRecord,
    selectPayoutPool,
    hasSufficientPoolFunds,
    hasShopBalance,
    defaultShopRedemptionRatePoints,
    defaultShopRedemptionRateCnpy,
    defaultShopMinRedeemPoints,
    defaultShopRedeemStepPoints,
    getConfiguredShopRedemptionRatePoints,
    getConfiguredShopRedemptionRateCnpy,
    getConfiguredShopMinRedeemPoints,
    getConfiguredShopRedeemStepPoints,
    calculateRedeemPayout,
    calculateRedeemPayoutFromConfig,
    calculatePointsForPayout,
    getExchangeRate
} from './shop/index.js';

// Re-export config constants and getters for backward compatibility
export {
    defaultClassicStartFee,
    defaultDailyStartFee,
    legacyClassicStartFee,
    legacyDailyStartFee,
    defaultDailyMaxMoves,
    defaultDailyPlatformFeeBps,
    defaultDailyRewardFeeBps,
    defaultDailyReserveFeeBps,
    defaultDailyShopFeeBps,
    defaultClassicPlatformFeeBps,
    defaultClassicReserveFeeBps,
    defaultClassicShopFeeBps,
    defaultDailyPayoutBps,
    defaultClassicDailyPointsCap,
    getConfiguredClassicStartFee,
    getConfiguredDailyStartFee,
    isLegacyStartFeePair,
    getConfiguredDailyMaxMoves,
    getConfiguredDailyPlatformFeeBps,
    getConfiguredDailyRewardFeeBps,
    getConfiguredDailyReserveFeeBps,
    getConfiguredDailyShopFeeBps,
    getConfiguredDailyPayoutBps,
    getConfiguredClassicPlatformFeeBps,
    getConfiguredClassicReserveFeeBps,
    getConfiguredClassicShopFeeBps,
    getConfiguredClassicDailyPointsCap
} from './config/index.js';

// Re-export utility functions for backward compatibility
export {
    randomQueryId,
    normalizeUsername,
    validateUsername,
    buffersEqual,
    getQueryValue,
    normalizeBytes,
    normalizeMoves,
    areMovesValid,
    normalizeGameTreasury,
    calculateBpsAmount
} from './utils/helpers.js';

// Re-export economy functions for backward compatibility
export {
    splitDailyFee,
    splitClassicFee
} from './economy/fee-distribution.js';
