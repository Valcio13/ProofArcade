/**
 * Validation Module - Barrel Export
 * 
 * Centralized exports for all validation-related functions.
 */

export {
    checkMessageSend,
    checkMessageStartDailyGame,
    checkMessageStartClassicGame,
    checkMessageSubmitGameResult,
    checkMessageClaimDailyReward,
    checkMessageRedeemClassicPoints,
    checkMessageClaimDailyLoginReward,
    checkMessageSetUsername,
    checkMessageStartWeeklyBlitzGame,
    checkMessageClaimWeeklyBlitzReward
} from './message-checks.js';
