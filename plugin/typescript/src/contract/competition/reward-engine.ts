/**
 * Competition Reward Engine
 * 
 * Generic, configurable reward distribution system for competitions.
 * Supports Monthly, Weekly, Events with dynamic tier-based rewards.
 */

import Long from 'long';

// ============================================================================
// Types
// ============================================================================

export type DistributionType = 'exponential' | 'linear' | 'equal';

export type TierName = 'Elite' | 'Champion' | 'Challenger';

export interface TierConfig {
    name: TierName;
    percentageOfParticipants: number;  // 0.02 = 2%
    poolShare: number;                  // 0.50 = 50%
    distributionType: DistributionType;
}

export interface CompetitionConfig {
    name: string;
    minParticipants: number;       // e.g., 50 for Monthly
    rewardPercentage: number;      // e.g., 0.20 = top 20%
    minWinners: number;            // e.g., 10
    maxWinners: number;            // e.g., 100
    tiers: TierConfig[];
}

export interface RewardAllocation {
    rank: number;
    playerAddress: Uint8Array;
    reward: Long;                  // Amount in uproof
    tier: TierName;
    score: Long;                   // Player's score for reference
}

export interface RewardDistributionResult {
    allocations: RewardAllocation[];
    totalDistributed: Long;
    totalParticipants: number;
    totalWinners: number;
    poolRolledOver: boolean;       // True if < minParticipants
    remainder: Long;               // Undistributed amount (goes to rank 1)
}

export interface LeaderboardEntry {
    rank: number;
    playerAddress: Uint8Array;
    score: Long;
}

// ============================================================================
// Configurations
// ============================================================================

/**
 * Monthly Competition Configuration
 * - Prestigious, high barrier to entry
 * - Top 20% of participants win (min 10, max 100)
 * - 50 participant minimum to activate rewards
 */
export const MONTHLY_COMPETITION_CONFIG: CompetitionConfig = {
    name: 'Monthly',
    minParticipants: 50,
    rewardPercentage: 0.20,
    minWinners: 10,
    maxWinners: 100,
    tiers: [
        {
            name: 'Elite',
            percentageOfParticipants: 0.02,  // Top 2%
            poolShare: 0.50,                  // 50% of pool
            distributionType: 'exponential'   // Heavily favor #1
        },
        {
            name: 'Champion',
            percentageOfParticipants: 0.08,  // Next 8%
            poolShare: 0.30,                  // 30% of pool
            distributionType: 'linear'        // Steady decline
        },
        {
            name: 'Challenger',
            percentageOfParticipants: 0.10,  // Next 10%
            poolShare: 0.20,                  // 20% of pool
            distributionType: 'equal'         // Equal split
        }
    ]
};

/**
 * Weekly Blitz Configuration
 * - Fast-paced, lower barrier
 * - Top 30% of participants win (min 5, max 50)
 * - 20 participant minimum to activate rewards
 */
export const WEEKLY_BLITZ_CONFIG: CompetitionConfig = {
    name: 'Weekly Blitz',
    minParticipants: 20,
    rewardPercentage: 0.30,
    minWinners: 5,
    maxWinners: 50,
    tiers: [
        {
            name: 'Elite',
            percentageOfParticipants: 0.05,  // Top 5%
            poolShare: 0.40,                  // 40% of pool
            distributionType: 'exponential'
        },
        {
            name: 'Champion',
            percentageOfParticipants: 0.10,  // Next 10%
            poolShare: 0.35,                  // 35% of pool
            distributionType: 'linear'
        },
        {
            name: 'Challenger',
            percentageOfParticipants: 0.15,  // Next 15%
            poolShare: 0.25,                  // 25% of pool
            distributionType: 'equal'
        }
    ]
};

// ============================================================================
// Core Engine
// ============================================================================

/**
 * Calculate reward distribution for a competition
 * 
 * @param leaderboard - Sorted leaderboard entries (rank 1 = highest score)
 * @param totalPool - Total prize pool in uproof
 * @param config - Competition configuration
 * @returns Reward distribution result
 */
export function calculateRewardDistribution(
    leaderboard: LeaderboardEntry[],
    totalPool: Long,
    config: CompetitionConfig
): RewardDistributionResult {
    const participants = leaderboard.length;

    // Check minimum participant threshold
    if (participants < config.minParticipants) {
        return {
            allocations: [],
            totalDistributed: Long.ZERO,
            totalParticipants: participants,
            totalWinners: 0,
            poolRolledOver: true,
            remainder: totalPool
        };
    }

    // Calculate total winners
    let totalWinners = Math.floor(participants * config.rewardPercentage);
    totalWinners = Math.max(config.minWinners, totalWinners);
    totalWinners = Math.min(config.maxWinners, totalWinners);
    totalWinners = Math.min(totalWinners, participants); // Can't exceed participants

    // Allocate rewards to tiers
    const allocations: RewardAllocation[] = [];
    let currentRank = 1;

    for (const tier of config.tiers) {
        // Calculate tier size
        let tierSize = Math.floor(participants * tier.percentageOfParticipants);
        tierSize = Math.max(1, tierSize); // At least 1 player per tier

        // Don't exceed total winners
        const remainingWinners = totalWinners - currentRank + 1;
        if (remainingWinners <= 0) break;
        tierSize = Math.min(tierSize, remainingWinners);

        // Calculate tier pool
        const tierPool = totalPool.multiply(Math.floor(tier.poolShare * 10000)).divide(10000);

        // Distribute within tier
        const tierAllocations = distributeTierRewards(
            leaderboard.slice(currentRank - 1, currentRank - 1 + tierSize),
            currentRank,
            tierPool,
            tier
        );

        allocations.push(...tierAllocations);
        currentRank += tierSize;
    }

    // Calculate total distributed and remainder
    const totalDistributed = allocations.reduce(
        (sum, a) => sum.add(a.reward),
        Long.ZERO
    );
    const remainder = totalPool.subtract(totalDistributed);

    // Give remainder to rank 1 (handle rounding errors)
    if (remainder.greaterThan(0) && allocations.length > 0) {
        allocations[0].reward = allocations[0].reward.add(remainder);
    }

    return {
        allocations,
        totalDistributed: totalPool, // After adding remainder
        totalParticipants: participants,
        totalWinners: allocations.length,
        poolRolledOver: false,
        remainder: Long.ZERO
    };
}

/**
 * Distribute rewards within a single tier
 */
function distributeTierRewards(
    tierEntries: LeaderboardEntry[],
    startRank: number,
    tierPool: Long,
    tier: TierConfig
): RewardAllocation[] {
    const tierSize = tierEntries.length;
    const allocations: RewardAllocation[] = [];

    switch (tier.distributionType) {
        case 'exponential': {
            // Sum of squares: 1^2 + 2^2 + ... + n^2
            const sumOfSquares = Array.from(
                { length: tierSize },
                (_, i) => Math.pow(tierSize - i, 2)
            ).reduce((a, b) => a + b, 0);

            for (let i = 0; i < tierSize; i++) {
                const entry = tierEntries[i];
                const weight = Math.pow(tierSize - i, 2);
                const reward = tierPool.multiply(weight).divide(sumOfSquares);

                allocations.push({
                    rank: startRank + i,
                    playerAddress: entry.playerAddress,
                    reward,
                    tier: tier.name,
                    score: entry.score
                });
            }
            break;
        }

        case 'linear': {
            // Sum of ranks: 1 + 2 + ... + n = n(n+1)/2
            const sumOfRanks = (tierSize * (tierSize + 1)) / 2;

            for (let i = 0; i < tierSize; i++) {
                const entry = tierEntries[i];
                const weight = tierSize - i;
                const reward = tierPool.multiply(weight).divide(sumOfRanks);

                allocations.push({
                    rank: startRank + i,
                    playerAddress: entry.playerAddress,
                    reward,
                    tier: tier.name,
                    score: entry.score
                });
            }
            break;
        }

        case 'equal': {
            const rewardPerPlayer = tierPool.divide(tierSize);

            for (let i = 0; i < tierSize; i++) {
                const entry = tierEntries[i];

                allocations.push({
                    rank: startRank + i,
                    playerAddress: entry.playerAddress,
                    reward: rewardPerPlayer,
                    tier: tier.name,
                    score: entry.score
                });
            }
            break;
        }
    }

    return allocations;
}

/**
 * Find a player's tier based on their rank
 */
export function getPlayerTier(
    rank: number,
    totalParticipants: number,
    config: CompetitionConfig
): TierName | null {
    // Check if rewards are activated
    if (totalParticipants < config.minParticipants) {
        return null;
    }

    // Calculate total winners
    let totalWinners = Math.floor(totalParticipants * config.rewardPercentage);
    totalWinners = Math.max(config.minWinners, totalWinners);
    totalWinners = Math.min(config.maxWinners, totalWinners);

    if (rank > totalWinners) {
        return null; // Not a winner
    }

    // Determine tier
    let currentRank = 1;
    for (const tier of config.tiers) {
        let tierSize = Math.floor(totalParticipants * tier.percentageOfParticipants);
        tierSize = Math.max(1, tierSize);

        const remainingWinners = totalWinners - currentRank + 1;
        if (remainingWinners <= 0) break;
        tierSize = Math.min(tierSize, remainingWinners);

        if (rank >= currentRank && rank < currentRank + tierSize) {
            return tier.name;
        }

        currentRank += tierSize;
    }

    return null;
}

/**
 * Calculate tier boundaries for display
 * Returns rank ranges for each tier
 */
export function getTierBoundaries(
    totalParticipants: number,
    config: CompetitionConfig
): { tier: TierName; startRank: number; endRank: number }[] {
    if (totalParticipants < config.minParticipants) {
        return [];
    }

    let totalWinners = Math.floor(totalParticipants * config.rewardPercentage);
    totalWinners = Math.max(config.minWinners, totalWinners);
    totalWinners = Math.min(config.maxWinners, totalWinners);

    const boundaries: { tier: TierName; startRank: number; endRank: number }[] = [];
    let currentRank = 1;

    for (const tier of config.tiers) {
        let tierSize = Math.floor(totalParticipants * tier.percentageOfParticipants);
        tierSize = Math.max(1, tierSize);

        const remainingWinners = totalWinners - currentRank + 1;
        if (remainingWinners <= 0) break;
        tierSize = Math.min(tierSize, remainingWinners);

        boundaries.push({
            tier: tier.name,
            startRank: currentRank,
            endRank: currentRank + tierSize - 1
        });

        currentRank += tierSize;
    }

    return boundaries;
}
