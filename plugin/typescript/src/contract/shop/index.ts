/**
 * Shop Module - Barrel Export
 * 
 * Re-exports all shop and redemption functionality.
 */

// Types
export type {
    ClassicPointRedemption,
    ShopRedemptionConfig,
    RedemptionValidation,
    RedemptionCalculation
} from './types.js';

// Validation functions
export {
    validateMinimumPoints,
    validateStepIncrement,
    validateSufficientBalance,
    validatePayoutAmount,
    validateRedemption
} from './validation.js';

// Redemption functions
export {
    createRedemptionRecord,
    selectPayoutPool,
    hasSufficientPoolFunds,
    hasShopBalance
} from './redemption.js';

// Pricing functions
export {
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
} from './pricing.js';
