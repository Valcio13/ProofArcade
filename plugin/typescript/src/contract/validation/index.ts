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
} from './message-checks.js';
