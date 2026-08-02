/**
 * Validation Module - Barrel Export
 * 
 * Centralized exports for all validation-related functions.
 */

export {
    checkMessageSend,
    checkMessageStartDailyGame,
    checkMessageStartClassicGame,
    checkMessageStartWeeklyBlitzGame,
    checkMessageSubmitGameResult,
    checkMessageClaimDailyReward,
    checkMessageClaimMonthlyReward,
    checkMessageClaimWeeklyBlitzReward,
    checkMessageRedeemClassicPoints,
    checkMessageClaimDailyLoginReward,
    checkMessageSetUsername,
} from './message-checks.js';
