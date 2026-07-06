/**
 * Configuration Constants
 * 
 * Centralized configuration for game mechanics, fees, rewards, and limits.
 * These values define the economic and gameplay parameters.
 */

import Long from 'long';
import { toUint64 } from '../game2048.js';

// ==================== Entry Fees ====================

/** Classic mode entry fee (2 PROOF in uproof micro-denomination) */
export const defaultClassicStartFee = 2000000;

/** Daily challenge entry fee (25 PROOF in uproof micro-denomination) */
export const defaultDailyStartFee = 25000000;

/** Legacy classic entry fee (deprecated) */
export const legacyClassicStartFee = 90;

/** Legacy daily entry fee (deprecated) */
export const legacyDailyStartFee = 240;

// ==================== Game Limits ====================

/** Maximum moves allowed in daily challenge mode */
export const defaultDailyMaxMoves = 80;

// ==================== Fee Split BPS (Basis Points) ====================

/** Daily mode: Platform fee (5%) */
export const defaultDailyPlatformFeeBps = 500;

/** Daily mode: Reward pool fee (80%) */
export const defaultDailyRewardFeeBps = 8000;

/** Daily mode: Reserve pool fee (10%) */
export const defaultDailyReserveFeeBps = 1000;

/** Daily mode: Shop pool fee (5%) */
export const defaultDailyShopFeeBps = 500;

/** Classic mode: Platform fee (5%) */
export const defaultClassicPlatformFeeBps = 500;

/** Classic mode: Reserve pool fee (45%) */
export const defaultClassicReserveFeeBps = 4500;

/** Classic mode: Shop pool fee (50%) */
export const defaultClassicShopFeeBps = 5000;

// ==================== Reward Payouts ====================

/**
 * Daily challenge reward distribution (basis points)
 * Top 10 positions: [30%, 20%, 12%, 9%, 7%, 6%, 5%, 4%, 4%, 3%]
 */
export const defaultDailyPayoutBps = [3000, 2000, 1200, 900, 700, 600, 500, 400, 400, 300];

// ==================== Classic Points System ====================

/** Maximum classic points a player can earn per UTC day */
export const defaultClassicDailyPointsCap = 2000;

// ==================== Shop Configuration ====================

/** Points required to redeem 1 PROOF */
export const defaultShopRedemptionRatePoints = 500;

/** CNPY amount received per redemption (1 PROOF in uproof) */
export const defaultShopRedemptionRateCnpy = 1000000;

/** Minimum points required for redemption */
export const defaultShopMinRedeemPoints = 500;

/** Redemption must be in multiples of this value */
export const defaultShopRedeemStepPoints = 500;

// ==================== Check-in Rewards ====================

/**
 * Daily login reward points for 7-day streak
 * Days 1-7: [20, 25, 30, 35, 40, 45, 50]
 */
export const defaultDailyLoginRewardPoints = [20, 25, 30, 35, 40, 45, 50];

/** Classic points bonus on day 7 (20%) */
export const defaultDailyLoginBonusBps = 2000;

// ==================== Configuration Getters ====================

/**
 * Get configured classic start fee
 * Handles legacy fee pairs for backward compatibility
 */
export function getConfiguredClassicStartFee(cfg: any): number {
    const fee = toUint64(cfg?.classicStartFee as Long | number | undefined);
    if (isLegacyStartFeePair(cfg)) {
        return defaultClassicStartFee;
    }
    return fee > 0 ? fee : defaultClassicStartFee;
}

/**
 * Get configured daily start fee
 * Handles legacy fee pairs for backward compatibility
 */
export function getConfiguredDailyStartFee(cfg: any): number {
    const fee = toUint64(cfg?.dailyStartFee as Long | number | undefined);
    if (isLegacyStartFeePair(cfg)) {
        return defaultDailyStartFee;
    }
    return fee > 0 ? fee : defaultDailyStartFee;
}

/**
 * Check if config uses legacy start fee pair
 * Legacy: classic=90, daily=240
 */
export function isLegacyStartFeePair(cfg: any): boolean {
    const classicFee = toUint64(cfg?.classicStartFee as Long | number | undefined);
    const dailyFee = toUint64(cfg?.dailyStartFee as Long | number | undefined);
    return classicFee === legacyClassicStartFee && dailyFee === legacyDailyStartFee;
}

/**
 * Get configured daily max moves
 */
export function getConfiguredDailyMaxMoves(cfg: any): number {
    const maxMoves = toUint64(cfg?.dailyMaxMoves as Long | number | undefined);
    return maxMoves > 0 ? maxMoves : defaultDailyMaxMoves;
}

/**
 * Get configured daily platform fee BPS
 */
export function getConfiguredDailyPlatformFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyPlatformFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyPlatformFeeBps;
}

/**
 * Get configured daily reward fee BPS
 */
export function getConfiguredDailyRewardFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyRewardFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyRewardFeeBps;
}

/**
 * Get configured daily reserve fee BPS
 */
export function getConfiguredDailyReserveFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyReserveFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyReserveFeeBps;
}

/**
 * Get configured daily shop fee BPS
 */
export function getConfiguredDailyShopFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyShopFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyShopFeeBps;
}

/**
 * Get configured daily payout BPS array
 */
export function getConfiguredDailyPayoutBps(cfg: any): number[] {
    const values = Array.isArray(cfg?.dailyPayoutBps)
        ? cfg.dailyPayoutBps.map((value: Long | number) => toUint64(value))
        : [];
    return values.length > 0 ? values : defaultDailyPayoutBps;
}

/**
 * Get configured classic platform fee BPS
 */
export function getConfiguredClassicPlatformFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicPlatformFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicPlatformFeeBps;
}

/**
 * Get configured classic reserve fee BPS
 * Currently unused but kept for future flexibility
 */
export function getConfiguredClassicReserveFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicReserveFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicReserveFeeBps;
}

/**
 * Get configured classic shop fee BPS
 * Currently unused but kept for future flexibility
 */
export function getConfiguredClassicShopFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicShopFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicShopFeeBps;
}

/**
 * Get configured classic daily points cap
 */
export function getConfiguredClassicDailyPointsCap(cfg: any): number {
    const value = toUint64(cfg?.classicDailyPointsCap as Long | number | undefined);
    return value > 0 ? value : defaultClassicDailyPointsCap;
}
