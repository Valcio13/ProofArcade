/**
 * Session Management Module
 * 
 * Functions for creating and managing game sessions.
 */

import Long from 'long';
import { decodeGame2048State, encodeGame2048State, toUint64 } from '../game2048.js';
import { deriveDailySeed, deriveClassicSeed } from '../utils/crypto.js';

/**
 * Create a new daily game session
 */
export function createDailySession(
    gameId: Uint8Array,
    playerAddress: Uint8Array,
    utcDate: string,
    chainId: number,
    startedHeight: number | Long,
    startedAtUnix: number | Long,
    feePaid: number | Long,
    maxMoves: number
): Uint8Array {
    const seed = deriveDailySeed(chainId, utcDate);
    
    return encodeGame2048State('GameSession', {
        gameId,
        playerAddress,
        mode: 1, // Daily
        utcDate,
        seed,
        status: 1, // Active
        startedHeight: toUint64(startedHeight as Long | number | undefined),
        startedAtUnix: toUint64(startedAtUnix as Long | number | undefined),
        feePaid: toUint64(feePaid as Long | number | undefined),
        maxMoves
    });
}

/**
 * Create a new classic game session
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClassicSession(
    gameId: Uint8Array,
    playerAddress: Uint8Array,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    startedHeight: number | Long,
    startedAtUnix: number | Long,
    feePaid: number | Long
): Uint8Array {
    const seed = deriveClassicSeed(playerAddress, tx);
    
    return encodeGame2048State('GameSession', {
        gameId,
        playerAddress,
        mode: 2, // Classic
        utcDate: '',
        seed,
        status: 1, // Active
        startedHeight: toUint64(startedHeight as Long | number | undefined),
        startedAtUnix: toUint64(startedAtUnix as Long | number | undefined),
        feePaid: toUint64(feePaid as Long | number | undefined),
        maxMoves: 0 // No limit for classic
    });
}

/**
 * Decode a game session from state bytes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeSession(sessionBytes: Uint8Array | null | undefined): any | null {
    if (!sessionBytes || sessionBytes.length === 0) {
        return null;
    }
    const [session] = decodeGame2048State('GameSession', sessionBytes);
    return session || null;
}

/**
 * Complete a game session with final results
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function completeSession(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any,
    score: number,
    maxTile: number,
    moveCount: number,
    stopReason: number,
    submittedAtUnix: number | Long
): Uint8Array {
    return encodeGame2048State('GameSession', {
        gameId: session?.gameId,
        playerAddress: session?.playerAddress,
        mode: session?.mode,
        utcDate: session?.utcDate || '',
        seed: session?.seed || new Uint8Array(),
        status: 2, // Completed
        startedHeight: toUint64(session?.startedHeight as Long | number | undefined),
        startedAtUnix: toUint64(session?.startedAtUnix as Long | number | undefined),
        feePaid: toUint64(session?.feePaid as Long | number | undefined),
        maxMoves: toUint64(session?.maxMoves as Long | number | undefined),
        submittedScore: score,
        submittedMaxTile: maxTile,
        finalMoveCount: moveCount,
        stopReason,
        submittedAtUnix: toUint64(submittedAtUnix as Long | number | undefined)
    });
}

/**
 * Check if a session is active
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSessionActive(session: any): boolean {
    return toUint64(session?.status as Long | number | undefined) === 1;
}

/**
 * Check if a session is daily mode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSessionDaily(session: any): boolean {
    return toUint64(session?.mode as Long | number | undefined) === 1;
}

/**
 * Check if a session is classic mode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSessionClassic(session: any): boolean {
    return toUint64(session?.mode as Long | number | undefined) === 2;
}

/**
 * Get session max moves
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSessionMaxMoves(session: any): number {
    return toUint64(session?.maxMoves as Long | number | undefined);
}

/**
 * Get session seed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSessionSeed(session: any): Uint8Array {
    return session?.seed || new Uint8Array();
}

/**
 * Create a daily attempt record
 */
export function createDailyAttempt(
    utcDate: string,
    playerAddress: Uint8Array,
    gameId: Uint8Array
): Uint8Array {
    return encodeGame2048State('DailyAttempt', {
        utcDate,
        playerAddress,
        gameId
    });
}

/**
 * Create a daily submission record
 */
export function createDailySubmission(
    utcDate: string,
    playerAddress: Uint8Array,
    gameId: Uint8Array,
    score: number,
    maxTile: number,
    moveCount: number,
    submittedAtUnix: number | Long
): Uint8Array {
    return encodeGame2048State('DailySubmission', {
        utcDate,
        playerAddress,
        gameId,
        score,
        maxTile,
        moveCount,
        submittedAtUnix: toUint64(submittedAtUnix as Long | number | undefined)
    });
}

/**
 * Create a leaderboard entry
 */
export function createLeaderboardEntry(
    gameId: Uint8Array,
    playerAddress: Uint8Array,
    score: number,
    maxTile: number,
    moveCount: number,
    endedAtUnix: number | Long,
    username: string
): Uint8Array {
    return encodeGame2048State('LeaderboardEntry', {
        gameId,
        playerAddress,
        score,
        maxTile,
        moveCount,
        endedAtUnix: toUint64(endedAtUnix as Long | number | undefined),
        username
    });
}
