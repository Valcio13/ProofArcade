/**
 * Cryptographic Utilities
 * 
 * Functions for generating deterministic seeds for game sessions.
 */

import Long from 'long';
import { sha256Bytes, toUint64 } from '../game2048.js';
import { normalizeBytes } from './helpers.js';

/**
 * Derives a deterministic seed for daily challenge
 * 
 * NOTE: This is a deterministic scaffold. For production, mix in an explicitly 
 * chain-derived daily entropy source such as a recorded block hash at the UTC boundary.
 */
export function deriveDailySeed(chainId: number, utcDate: string): Uint8Array {
    return sha256Bytes('daily-seed', chainId, utcDate);
}

/**
 * Derives a deterministic seed for a Weekly Blitz week.
 *
 * MUST stay byte-identical to the Go backend's deriveWeeklyBlitzSeed() in
 * cmd/rpc/game2048.go — the backend hands this seed to the frontend to draw the
 * board, while the contract replays the submitted moves against the seed stored
 * in the session. If the two derivations differ, every submission fails with
 * ErrReplayMismatch.
 */
export function deriveWeeklyBlitzSeed(chainId: number, weekId: number): Uint8Array {
    return sha256Bytes('weekly-blitz-seed', chainId, weekId);
}

/**
 * Derives a deterministic seed for classic mode game
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveClassicSeed(playerAddress: Uint8Array, tx: any): Uint8Array {
    return sha256Bytes(
        'classic-seed',
        normalizeBytes(playerAddress),
        toUint64(tx?.createdHeight as Long | number | undefined),
        toUint64(tx?.time as Long | number | undefined),
        toUint64(tx?.fee as Long | number | undefined),
        tx?.memo || ''
    );
}
