/**
 * Profile Points Module
 * 
 * Handles calculation of player points from game scores and bonuses.
 */

/**
 * Calculate classic points from game score
 * 
 * Classic points are earned from classic mode games and can be redeemed in the shop.
 * The calculation rewards higher scores with more points.
 * 
 * @param score - The game score achieved
 * @returns Points earned (0-1000), capped at 1000
 * 
 * @remarks
 * - Scores below 64 earn no points
 * - Formula: min(1000, floor(score / 24))
 * - This means roughly 1 point per 24 score units
 * - Maximum of 1000 points per game
 */
export function calculateClassicPoints(score: number): number {
    if (score < 64) {
        return 0;
    }
    return Math.min(1000, Math.floor(score / 24));
}

/**
 * Calculate bonus points based on BPS multiplier
 * 
 * Used for check-in bonuses and other point multipliers.
 * 
 * @param basePoints - Base points before bonus
 * @param bonusBps - Bonus in basis points (e.g., 2000 = 20%)
 * @returns Additional bonus points
 * 
 * @remarks
 * - Returns 0 if either parameter is non-positive
 * - Formula: floor((basePoints * bonusBps) / 10000)
 * - Example: 100 points with 2000 BPS = 20 bonus points
 */
export function calculateBonusPoints(basePoints: number, bonusBps: number): number {
    if (basePoints <= 0 || bonusBps <= 0) {
        return 0;
    }
    return Math.floor((basePoints * bonusBps) / 10000);
}
