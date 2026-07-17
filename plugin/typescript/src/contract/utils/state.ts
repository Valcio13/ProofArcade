/**
 * State Key Generators
 * 
 * Pure utility functions for generating state database keys.
 * No business logic - just key construction.
 */

import Long from 'long';
import { JoinLenPrefix } from '../plugin.js';

// ==================== Constants ====================

/** Pool IDs */
export const PoolIDs = {
    DAO: 131071,
    PLATFORM: 131072,
    RESERVE: 131073,
    SHOP: 131074,
    DAILY_REWARD: 131075,
    MONTHLY_REWARD: 131076,
    WEEKLY_BLITZ: 196608, // 0x30000
} as const;

// State key prefixes
const accountPrefix = Buffer.from([1]);
const poolPrefix = Buffer.from([2]);
const paramsPrefix = Buffer.from([7]);
const gamePrefix = Buffer.from([18]);

// ==================== Utilities ====================

function formatUint64(u: Long): Buffer {
    const b = Buffer.alloc(8);
    b.writeBigUInt64BE(BigInt(u.toString()));
    return b;
}

function invertUint64(u: Long): Buffer {
    const b = Buffer.alloc(8);
    const max = BigInt('18446744073709551615');
    b.writeBigUInt64BE(max - BigInt(u.toString()));
    return b;
}

// ==================== Core Keys ====================

export function KeyForAccount(addr: Uint8Array): Uint8Array {
    return JoinLenPrefix(accountPrefix, Buffer.from(addr));
}

export function KeyForFeeParams(): Uint8Array {
    return JoinLenPrefix(paramsPrefix, Buffer.from('/f/'));
}

export function KeyForFeePool(chainId: Long): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(chainId));
}

export function KeyForGamePlatformPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.PLATFORM)));
}

export function KeyForGameReservePool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.RESERVE)));
}

export function KeyForGameShopPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.SHOP)));
}

export function KeyForGameDailyRewardPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.DAILY_REWARD)));
}

export function KeyForGameMonthlyRewardPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.MONTHLY_REWARD)));
}

export function KeyForDaoPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(PoolIDs.DAO)));
}

export function KeyForGameConfig(): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('config'));
}

export function KeyForGameTreasury(): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('treasury'));
}

// ==================== Game Session ====================

export function KeyForGameSession(gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('session'), Buffer.from(gameId));
}

// ==================== Daily Challenge ====================

export function KeyForDailyAttempt(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-attempt'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailySubmission(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-submit'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailyPrizePool(utcDate: string): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-pool'), Buffer.from(utcDate, 'utf8'));
}

export function KeyForDailyLeaderboard(
    utcDate: string,
    score: Long,
    maxTile: Long,
    moveCount: Long,
    endedAtUnix: Long,
    gameId: Uint8Array
): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('daily-leaderboard'),
        Buffer.from(utcDate, 'utf8'),
        invertUint64(score),
        invertUint64(maxTile),
        formatUint64(moveCount),
        formatUint64(endedAtUnix),
        Buffer.from(gameId)
    );
}

export function KeyForDailyLeaderboardPrefix(utcDate: string): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-leaderboard'), Buffer.from(utcDate, 'utf8'));
}

export function KeyForDailyRewardAllocation(utcDate: string, rank: number, gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-reward'), Buffer.from(utcDate, 'utf8'), formatUint64(Long.fromNumber(rank)), Buffer.from(gameId));
}

export function KeyForDailyRewardByPlayer(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-reward-player'), Buffer.from(playerAddress), Buffer.from(utcDate, 'utf8'));
}

export function KeyForDailyRewardClaim(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-claim'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailyLoginClaim(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-login'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

// ==================== Classic Mode ====================

export function KeyForClassicLeaderboard(score: Long, gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-leaderboard'), invertUint64(score), Buffer.from(gameId));
}

export function KeyForClassicPointsDailyLedger(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-points-day'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForClassicPointRedemption(playerAddress: Uint8Array, redeemedAtUnix: number, burnPoints: number): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('classic-redeem'),
        Buffer.from(playerAddress),
        formatUint64(Long.fromNumber(redeemedAtUnix)),
        formatUint64(Long.fromNumber(burnPoints))
    );
}

export function KeyForClassicPointRedemptionPrefix(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-redeem'), Buffer.from(playerAddress));
}

// ==================== Monthly Competition ====================

export function KeyForMonthlyLeaderboard(monthId: string, score: Long, gameId: Uint8Array): Uint8Array {
    const invertedScore = invertUint64(score);
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('monthly-leaderboard'),
        Buffer.from(monthId, 'utf8'),
        invertedScore,
        gameId
    );
}

export function KeyForMonthlyPlayerEntry(monthId: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('monthly-player'),
        Buffer.from(monthId, 'utf8'),
        playerAddress
    );
}

// ==================== Player ====================

export function KeyForPlayerStats(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('player-stats'), Buffer.from(playerAddress));
}

export function KeyForUsernameByAddress(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('username-addr'), Buffer.from(playerAddress));
}

export function KeyForAddressByUsername(normalizedUsername: string): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('username-lookup'), Buffer.from(normalizedUsername.toLowerCase(), 'utf8'));
}

export function KeyForPlayerIdentity(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('player-identity'), Buffer.from(playerAddress));
}

// ==================== Weekly Blitz ====================

export function KeyForWeeklyBlitzPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(196608))); // 0x30000
}

export function KeyForWeeklyBlitzSession(gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('weekly-blitz-session'), Buffer.from(gameId));
}

export function KeyForWeeklyBlitzDailyTracking(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-daily'),
        Buffer.from(utcDate, 'utf8'),
        Buffer.from(playerAddress)
    );
}

export function KeyForWeeklyBlitzPlayerScore(weekId: number, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-score'),
        formatUint64(Long.fromNumber(weekId)),
        Buffer.from(playerAddress)
    );
}

export function KeyForWeeklyBlitzLeaderboard(
    weekId: number,
    cumulativeScore: Long,
    playerAddress: Uint8Array
): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-leaderboard'),
        formatUint64(Long.fromNumber(weekId)),
        invertUint64(cumulativeScore),
        Buffer.from(playerAddress)
    );
}

export function KeyForWeeklyBlitzLeaderboardPrefix(weekId: number): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-leaderboard'),
        formatUint64(Long.fromNumber(weekId))
    );
}

export function KeyForWeeklyBlitzPrizePool(weekId: number): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-pool'),
        formatUint64(Long.fromNumber(weekId))
    );
}

export function KeyForWeeklyBlitzRewardAllocation(weekId: number, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-reward'),
        formatUint64(Long.fromNumber(weekId)),
        Buffer.from(playerAddress)
    );
}

export function KeyForWeeklyBlitzRewardClaim(weekId: number, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('weekly-blitz-claim'),
        formatUint64(Long.fromNumber(weekId)),
        Buffer.from(playerAddress)
    );
}
