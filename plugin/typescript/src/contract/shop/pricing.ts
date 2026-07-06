/**
 * Shop Module - Pricing and Rate Calculations
 * 
 * Handles redemption rate calculations and configuration.
 */

import Long from 'long';
import { toUint64 } from '../game2048.js';
import {
    defaultShopRedemptionRatePoints,
    defaultShopRedemptionRateCnpy,
    defaultShopMinRedeemPoints,
    defaultShopRedeemStepPoints
} from '../config/index.js';

// Re-export for convenience
export {
    defaultShopRedemptionRatePoints,
    defaultShopRedemptionRateCnpy,
    defaultShopMinRedeemPoints,
    defaultShopRedeemStepPoints
};

/**
 * Get configured shop redemption rate (points required per CNPY unit)
 * 
 * @param cfg - Game configuration object
 * @returns Points required per CNPY unit (default: 500)
 */
export function getConfiguredShopRedemptionRatePoints(cfg: any): number {
    const value = toUint64(cfg?.shopRedemptionRatePoints as Long | number | undefined);
    return value > 0 ? value : defaultShopRedemptionRatePoints;
}

/**
 * Get configured shop redemption rate (CNPY per redemption unit)
 * 
 * @param cfg - Game configuration object
 * @returns CNPY amount per unit (default: 1000000 = 1 PROOF)
 */
export function getConfiguredShopRedemptionRateCnpy(cfg: any): number {
    const value = toUint64(cfg?.shopRedemptionRateCnpy as Long | number | undefined);
    return value > 0 ? value : defaultShopRedemptionRateCnpy;
}

/**
 * Get configured minimum redeem points
 * 
 * @param cfg - Game configuration object
 * @returns Minimum points required (default: 500)
 */
export function getConfiguredShopMinRedeemPoints(cfg: any): number {
    const value = toUint64(cfg?.shopMinRedeemPoints as Long | number | undefined);
    return value > 0 ? value : defaultShopMinRedeemPoints;
}

/**
 * Get configured redeem step points
 * 
 * @param cfg - Game configuration object
 * @returns Step size for redemptions (default: 500)
 */
export function getConfiguredShopRedeemStepPoints(cfg: any): number {
    const value = toUint64(cfg?.shopRedeemStepPoints as Long | number | undefined);
    return value > 0 ? value : defaultShopRedeemStepPoints;
}

/**
 * Calculate redemption payout amount
 * 
 * Calculates how much CNPY to pay out based on points burned.
 * 
 * Formula: payoutAmount = floor((burnPoints * rateCnpy) / ratePoints)
 * 
 * Example with defaults:
 * - burnPoints: 500
 * - ratePoints: 500 (points per PROOF)
 * - rateCnpy: 1000000 (1 PROOF in uproof)
 * - Result: floor((500 * 1000000) / 500) = 1000000 (1 PROOF)
 * 
 * @param burnPoints - Classic points to burn
 * @param ratePoints - Points required per CNPY unit
 * @param rateCnpy - CNPY amount per unit
 * @returns Payout amount in uproof micro-denomination
 */
export function calculateRedeemPayout(
    burnPoints: number,
    ratePoints: number,
    rateCnpy: number
): number {
    if (burnPoints <= 0 || ratePoints <= 0 || rateCnpy <= 0) {
        return 0;
    }
    return Math.floor((burnPoints * rateCnpy) / ratePoints);
}

/**
 * Calculate redemption payout from configuration
 * 
 * Convenience function that reads rates from config and calculates payout.
 * 
 * @param cfg - Game configuration object
 * @param burnPoints - Classic points to burn
 * @returns Payout amount in uproof micro-denomination
 */
export function calculateRedeemPayoutFromConfig(
    cfg: any,
    burnPoints: number
): number {
    const ratePoints = getConfiguredShopRedemptionRatePoints(cfg);
    const rateCnpy = getConfiguredShopRedemptionRateCnpy(cfg);
    return calculateRedeemPayout(burnPoints, ratePoints, rateCnpy);
}

/**
 * Calculate points equivalent for a given CNPY amount
 * 
 * Inverse calculation - how many points are needed for a specific payout.
 * 
 * Formula: burnPoints = ceil((payoutAmount * ratePoints) / rateCnpy)
 * 
 * @param payoutAmount - Desired CNPY payout
 * @param ratePoints - Points required per CNPY unit
 * @param rateCnpy - CNPY amount per unit
 * @returns Points required
 */
export function calculatePointsForPayout(
    payoutAmount: number,
    ratePoints: number,
    rateCnpy: number
): number {
    if (payoutAmount <= 0 || ratePoints <= 0 || rateCnpy <= 0) {
        return 0;
    }
    return Math.ceil((payoutAmount * ratePoints) / rateCnpy);
}

/**
 * Get redemption exchange rate
 * 
 * Returns the exchange rate as a ratio.
 * 
 * @param ratePoints - Points required per CNPY unit
 * @param rateCnpy - CNPY amount per unit (in uproof)
 * @returns Exchange rate description
 */
export function getExchangeRate(
    ratePoints: number,
    rateCnpy: number
): { pointsPerProof: number; cnpyPerPoint: number } {
    const cnpyPerProof = 1000000; // 1 PROOF in uproof
    const pointsPerProof = (ratePoints * cnpyPerProof) / rateCnpy;
    const cnpyPerPoint = rateCnpy / ratePoints;
    
    return {
        pointsPerProof,  // How many points = 1 PROOF
        cnpyPerPoint     // How much CNPY per point (in uproof)
    };
}
