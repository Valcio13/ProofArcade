/**
 * Shop Module - Redemption Operations
 * 
 * Handles classic point redemption record creation.
 */

import Long from 'long';
import { encodeGame2048State } from '../game2048.js';

/**
 * Create classic point redemption record
 * 
 * Encodes a ClassicPointRedemption record for storage.
 * 
 * @param playerAddress - Player's wallet address
 * @param burnPoints - Classic points burned
 * @param payoutAmount - CNPY amount paid (in uproof)
 * @param redeemedAtUnix - Unix timestamp (microseconds)
 * @param txHash - Transaction hash (hex string, uppercase)
 * @returns Encoded redemption record bytes
 */
export function createRedemptionRecord(
    playerAddress: Uint8Array,
    burnPoints: number,
    payoutAmount: number,
    redeemedAtUnix: number | Long,
    txHash: string
): Uint8Array {
    return encodeGame2048State('ClassicPointRedemption', {
        playerAddress,
        burnPoints,
        payoutAmount,
        redeemedAtUnix,
        txHash
    });
}

/**
 * Determine which pool to use for redemption payout
 * 
 * Prefers shop pool if it has sufficient funds, otherwise uses DAO pool.
 * 
 * @param shopPoolAmount - Shop pool balance
 * @param _daoPoolAmount - DAO pool balance (unused, kept for API consistency)
 * @param payoutAmount - Required payout
 * @returns true to use shop pool, false to use DAO pool
 */
export function selectPayoutPool(
    shopPoolAmount: Long,
    _daoPoolAmount: Long,
    payoutAmount: Long
): boolean {
    // Prefer shop pool if it has sufficient funds
    return !shopPoolAmount.lessThan(payoutAmount);
}

/**
 * Validate pool has sufficient funds
 * 
 * @param poolAmount - Pool balance
 * @param payoutAmount - Required payout
 * @returns true if sufficient, false otherwise
 */
export function hasSufficientPoolFunds(
    poolAmount: Long,
    payoutAmount: Long
): boolean {
    return !poolAmount.lessThan(payoutAmount);
}

/**
 * Validate treasury has sufficient funds
 * 
 * @param treasuryBalance - Treasury balance
 * @param payoutAmount - Required payout
 * @returns true if sufficient, false otherwise
 */
export function hasShopBalance(
    treasuryBalance: number,
    payoutAmount: number
): boolean {
    return treasuryBalance >= payoutAmount;
}
