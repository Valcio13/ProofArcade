/**
 * Competition Types
 * 
 * Type definitions for game sessions, competitions, and prize pools.
 */

import type Long from 'long';

/**
 * Game session representing an active or completed game
 */
export interface GameSession {
    gameId: Uint8Array;
    playerAddress: Uint8Array;
    mode: number | Long; // 1 = daily, 2 = classic
    utcDate: string; // Only for daily mode
    seed: Uint8Array;
    status: number | Long; // 1 = active, 2 = completed
    startedHeight: number | Long;
    startedAtUnix: number | Long;
    feePaid: number | Long;
    maxMoves: number | Long;
    submittedScore?: number | Long;
    submittedMaxTile?: number | Long;
    finalMoveCount?: number | Long;
    stopReason?: number | Long;
    submittedAtUnix?: number | Long;
}

/**
 * Daily competition prize pool tracking
 */
export interface DailyPrizePool {
    utcDate: string;
    entryCount: number | Long;
    grossFees: number | Long;
    treasuryFees: number | Long;
    rewardPool: number | Long;
    finalized: boolean;
    finalizedAtUnix: number | Long;
    distributedRewards: number | Long;
    treasuryLeftover: number | Long;
}

/**
 * Daily attempt tracking (prevents duplicate daily plays)
 */
export interface DailyAttempt {
    utcDate: string;
    playerAddress: Uint8Array;
    gameId: Uint8Array;
}

/**
 * Daily submission (tracks completed daily games)
 */
export interface DailySubmission {
    utcDate: string;
    playerAddress: Uint8Array;
    gameId: Uint8Array;
    score: number | Long;
    maxTile: number | Long;
    moveCount: number | Long;
    submittedAtUnix: number | Long;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
    gameId: Uint8Array;
    playerAddress: Uint8Array;
    score: number | Long;
    maxTile: number | Long;
    moveCount: number | Long;
    endedAtUnix: number | Long;
    username: string;
}

/**
 * Game mode enum
 */
export enum GameMode {
    DAILY = 1,
    CLASSIC = 2
}

/**
 * Session status enum
 */
export enum SessionStatus {
    ACTIVE = 1,
    COMPLETED = 2
}

/**
 * Daily reward allocation record
 * Represents a single player's reward allocation for a specific day
 */
export interface DailyRewardAllocationRecord {
    utcDate: string;
    playerAddress: Uint8Array;
    gameId: Uint8Array;
    rank: number;
    rewardAmount: number;
    score: number;
    maxTile: number;
    moveCount: number;
    endedAtUnix: number;
}

/**
 * Daily reward finalization summary
 * Contains all allocations and distribution totals
 */
export interface DailyRewardFinalizationSummary {
    allocations: DailyRewardAllocationRecord[];
    distributed: Long;
    leftover: Long;
}
