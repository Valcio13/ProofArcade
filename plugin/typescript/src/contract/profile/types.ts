/**
 * Profile Types
 * 
 * Type definitions for player profiles, statistics, and identity.
 */

import type Long from 'long';

/**
 * Player statistics tracking game performance and progress
 */
export interface PlayerStats {
    playerAddress: Uint8Array;
    dailyGamesStarted: number | Long;
    classicGamesStarted: number | Long;
    gamesCompleted: number | Long;
    wins: number | Long;
    losses: number | Long;
    bestDailyScore: number | Long;
    bestClassicScore: number | Long;
    bestTile: number | Long;
    totalScore: number | Long;
    classicPointsBalance: number | Long;
    classicPointsEarned: number | Long;
    loginStreak: number | Long;
    lastLoginClaimUtcDate: string;
    classicPointsBonusUtcDate: string;
}

/**
 * Player identity information (username, avatar, etc.)
 */
export interface PlayerIdentity {
    playerAddress: Uint8Array;
    username: string;
    avatarUrl: string;
    title: string;
    bio: string;
    registeredAtUnix: number | Long;
    lastUpdatedUnix: number | Long;
}

/**
 * Username registration (legacy format for backward compatibility)
 */
export interface UsernameRegistration {
    playerAddress: Uint8Array;
    username: string;
    registeredAtUnix: number | Long;
    lastChangedAtUnix: number | Long;
}

/**
 * Partial updates for PlayerStats (all fields optional)
 */
export interface PlayerStatsUpdate {
    dailyGamesStarted?: number | Long;
    classicGamesStarted?: number | Long;
    gamesCompleted?: number | Long;
    wins?: number | Long;
    losses?: number | Long;
    bestDailyScore?: number | Long;
    bestClassicScore?: number | Long;
    bestTile?: number | Long;
    totalScore?: number | Long;
    classicPointsBalance?: number | Long;
    classicPointsEarned?: number | Long;
    loginStreak?: number | Long;
    lastLoginClaimUtcDate?: string;
    classicPointsBonusUtcDate?: string;
}
