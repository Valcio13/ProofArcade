/**
 * Shop Module - Type Definitions
 * 
 * This module contains TypeScript interfaces for shop and redemption functionality.
 */

import Long from 'long';

/**
 * Classic Point Redemption Record
 * 
 * Tracks a player's redemption of classic points for CNPY tokens.
 */
export interface ClassicPointRedemption {
    /** Player's wallet address */
    playerAddress: Uint8Array;
    
    /** Classic points burned in this redemption */
    burnPoints: number | Long;
    
    /** CNPY amount paid out (in uproof micro-denomination) */
    payoutAmount: number | Long;
    
    /** Unix timestamp when redeemed (microseconds) */
    redeemedAtUnix: number | Long;
    
    /** Transaction hash (hex string) */
    txHash: string;
}

/**
 * Shop Redemption Configuration
 * 
 * Configuration for classic point redemption rates and limits.
 */
export interface ShopRedemptionConfig {
    /** Points required to redeem 1 CNPY (default: 500 points = 1 PROOF) */
    shopRedemptionRatePoints: number;
    
    /** CNPY amount per redemption unit (default: 1000000 = 1 PROOF in uproof) */
    shopRedemptionRateCnpy: number;
    
    /** Minimum points required for redemption (default: 500) */
    shopMinRedeemPoints: number;
    
    /** Redemption must be in multiples of this value (default: 500) */
    shopRedeemStepPoints: number;
}

/**
 * Redemption Validation Result
 * 
 * Result of validating a redemption request.
 */
export interface RedemptionValidation {
    /** Whether the redemption is valid */
    valid: boolean;
    
    /** Error message if invalid */
    error?: string;
}

/**
 * Redemption Calculation Result
 * 
 * Result of calculating redemption payout.
 */
export interface RedemptionCalculation {
    /** CNPY payout amount */
    payoutAmount: number;
    
    /** Whether to use shop pool (true) or DAO pool (false) */
    useShopPool: boolean;
}
