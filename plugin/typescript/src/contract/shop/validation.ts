/**
 * Shop Module - Validation Functions
 * 
 * Handles validation logic for shop redemption requests.
 */

import type { RedemptionValidation } from './types.js';

/**
 * Validate redemption amount against minimum threshold
 * 
 * @param burnPoints - Points to burn
 * @param minRedeemPoints - Minimum points required
 * @returns Validation result
 */
export function validateMinimumPoints(
    burnPoints: number,
    minRedeemPoints: number
): RedemptionValidation {
    if (burnPoints < minRedeemPoints) {
        return {
            valid: false,
            error: `Redemption amount (${burnPoints}) is below minimum (${minRedeemPoints})`
        };
    }
    return { valid: true };
}

/**
 * Validate redemption amount is a valid step increment
 * 
 * @param burnPoints - Points to burn
 * @param redeemStepPoints - Required step size (0 = no restriction)
 * @returns Validation result
 */
export function validateStepIncrement(
    burnPoints: number,
    redeemStepPoints: number
): RedemptionValidation {
    if (redeemStepPoints > 0 && burnPoints % redeemStepPoints !== 0) {
        return {
            valid: false,
            error: `Redemption amount (${burnPoints}) must be a multiple of ${redeemStepPoints}`
        };
    }
    return { valid: true };
}

/**
 * Validate player has sufficient classic points balance
 * 
 * @param burnPoints - Points to burn
 * @param classicPointsBalance - Player's current balance
 * @returns Validation result
 */
export function validateSufficientBalance(
    burnPoints: number,
    classicPointsBalance: number
): RedemptionValidation {
    if (classicPointsBalance < burnPoints) {
        return {
            valid: false,
            error: `Insufficient classic points balance (${classicPointsBalance}) for redemption (${burnPoints})`
        };
    }
    return { valid: true };
}

/**
 * Validate payout amount is greater than zero
 * 
 * @param payoutAmount - Calculated payout
 * @returns Validation result
 */
export function validatePayoutAmount(
    payoutAmount: number
): RedemptionValidation {
    if (payoutAmount <= 0) {
        return {
            valid: false,
            error: 'Calculated payout amount is zero or negative'
        };
    }
    return { valid: true };
}

/**
 * Validate complete redemption request
 * 
 * Runs all validation checks in sequence.
 * 
 * @param burnPoints - Points to burn
 * @param classicPointsBalance - Player's current balance
 * @param minRedeemPoints - Minimum points required
 * @param redeemStepPoints - Required step size
 * @param payoutAmount - Calculated payout
 * @returns Validation result (first failure or success)
 */
export function validateRedemption(
    burnPoints: number,
    classicPointsBalance: number,
    minRedeemPoints: number,
    redeemStepPoints: number,
    payoutAmount: number
): RedemptionValidation {
    // Check minimum
    const minCheck = validateMinimumPoints(burnPoints, minRedeemPoints);
    if (!minCheck.valid) return minCheck;
    
    // Check step increment
    const stepCheck = validateStepIncrement(burnPoints, redeemStepPoints);
    if (!stepCheck.valid) return stepCheck;
    
    // Check balance
    const balanceCheck = validateSufficientBalance(burnPoints, classicPointsBalance);
    if (!balanceCheck.valid) return balanceCheck;
    
    // Check payout
    const payoutCheck = validatePayoutAmount(payoutAmount);
    if (!payoutCheck.valid) return payoutCheck;
    
    return { valid: true };
}
