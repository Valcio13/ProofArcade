/**
 * Player Statistics Module
 * 
 * Functions for managing player statistics and game progress tracking.
 */

import Long from 'long';
import { decodeGame2048State, encodeGame2048State, toUint64 } from '../game2048.js';
import type { PlayerStats, PlayerStatsUpdate } from './types.js';

/**
 * Create a new PlayerStats object with default values
 */
export function createPlayerStats(playerAddress: Uint8Array): PlayerStats {
    return {
        playerAddress,
        dailyGamesStarted: 0,
        classicGamesStarted: 0,
        gamesCompleted: 0,
        wins: 0,
        losses: 0,
        bestDailyScore: 0,
        bestClassicScore: 0,
        bestTile: 0,
        totalScore: 0,
        classicPointsBalance: 0,
        classicPointsEarned: 0,
        loginStreak: 0,
        lastLoginClaimUtcDate: '',
        classicPointsBonusUtcDate: ''
    };
}

/**
 * Decode PlayerStats from state bytes
 * Returns a typed PlayerStats object or empty object if no data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodePlayerStats(statsBytes: Uint8Array | null | undefined): any {
    if (!statsBytes || statsBytes.length === 0) {
        return {};
    }
    const [playerStats] = decodeGame2048State('PlayerStats', statsBytes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (playerStats as any) || {};
}

/**
 * Encode PlayerStats to state bytes
 * Normalizes all Long/number values to uint64
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encodePlayerStats(stats: any, playerAddress: Uint8Array): Uint8Array {
    return encodeGame2048State('PlayerStats', {
        playerAddress,
        dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
        classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
        gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
        wins: toUint64(stats.wins as Long | number | undefined),
        losses: toUint64(stats.losses as Long | number | undefined),
        bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
        bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
        bestTile: toUint64(stats.bestTile as Long | number | undefined),
        totalScore: toUint64(stats.totalScore as Long | number | undefined),
        classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined),
        classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined),
        loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
        lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
        classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
    });
}

/**
 * Update specific PlayerStats fields
 * Applies partial updates to existing stats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updatePlayerStats(existingStats: any, updates: PlayerStatsUpdate): any {
    return {
        ...existingStats,
        ...updates
    };
}

/**
 * Increment a numeric field in PlayerStats
 * Helper for common operation of adding 1 to counters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function incrementStatsField(stats: any, fieldName: string): any {
    const currentValue = toUint64(stats[fieldName] as Long | number | undefined);
    return {
        ...stats,
        [fieldName]: currentValue + 1
    };
}

/**
 * Add to a numeric field in PlayerStats
 * Helper for adding arbitrary amounts to numeric fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addToStatsField(stats: any, fieldName: string, amount: number | Long): any {
    const currentValue = toUint64(stats[fieldName] as Long | number | undefined);
    const addAmount = Long.isLong(amount) ? amount.toNumber() : amount;
    return {
        ...stats,
        [fieldName]: currentValue + addAmount
    };
}

/**
 * Update best score if new score is higher
 * Returns updated stats object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateBestScore(stats: any, newScore: number | Long, scoreType: 'daily' | 'classic'): any {
    const field = scoreType === 'daily' ? 'bestDailyScore' : 'bestClassicScore';
    const currentBest = toUint64(stats[field] as Long | number | undefined);
    const scoreValue = Long.isLong(newScore) ? newScore.toNumber() : newScore;
    
    if (scoreValue > currentBest) {
        return {
            ...stats,
            [field]: scoreValue
        };
    }
    
    return stats;
}

/**
 * Update best tile if new tile is higher
 * Returns updated stats object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateBestTile(stats: any, newTile: number | Long): any {
    const currentBest = toUint64(stats.bestTile as Long | number | undefined);
    const tileValue = Long.isLong(newTile) ? newTile.toNumber() : newTile;
    
    if (tileValue > currentBest) {
        return {
            ...stats,
            bestTile: tileValue
        };
    }
    
    return stats;
}
