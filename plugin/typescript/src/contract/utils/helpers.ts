/**
 * General Helper Utilities
 * 
 * Miscellaneous utility functions for data normalization, validation, and manipulation.
 */

import Long from 'long';
import { toUint64 } from '../game2048.js';

/**
 * Generates a random query ID for state queries
 */
export function randomQueryId(): Long {
    return Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
}

/**
 * Normalizes username to lowercase for case-insensitive uniqueness checks
 */
export function normalizeUsername(username: string): string {
    return username.toLowerCase();
}

/**
 * Validates username requirements:
 * - 3-20 characters
 * - Alphanumeric + underscore only
 * Returns true if valid, false otherwise
 */
export function validateUsername(username: string): boolean {
    if (!username || username.length < 3 || username.length > 20) {
        return false;
    }
    // Only allow letters, numbers, and underscore
    const validPattern = /^[a-zA-Z0-9_]+$/;
    return validPattern.test(username);
}

/**
 * Compares two byte arrays for equality
 */
export function buffersEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Extracts a query result value by query ID from a multi-query response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getQueryValue(response: any, queryId: Long): Uint8Array | null {
    for (const resp of response?.results || []) {
        const qid = resp.queryId as Long;
        if (qid.equals(queryId)) {
            return resp.entries?.[0]?.value || null;
        }
    }
    return null;
}

/**
 * Normalizes various byte-like values to Uint8Array
 * Handles: Uint8Array, Buffer, Array, string (hex/base64/utf8), protobuf objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBytes(value: any): Uint8Array {
    if (!value) {
        return new Uint8Array();
    }
    if (value instanceof Uint8Array) {
        return value;
    }
    if (Buffer.isBuffer(value)) {
        return new Uint8Array(value);
    }
    if (Array.isArray(value)) {
        return Uint8Array.from(value);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return new Uint8Array();
        }
        const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
        if (hex.length > 0 && hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
            return new Uint8Array(Buffer.from(hex, 'hex'));
        }
        try {
            return new Uint8Array(Buffer.from(trimmed, 'base64'));
        } catch {
            return new Uint8Array(Buffer.from(trimmed, 'utf8'));
        }
    }
    if (typeof value === 'object') {
        // protobufjs sometimes exposes bytes as `{ type: 'Buffer', data: [...] }`
        if (Array.isArray(value.data)) {
            return Uint8Array.from(value.data);
        }
    }
    return new Uint8Array();
}

/**
 * Normalizes move array from various input formats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeMoves(moves: any): number[] {
    if (!Array.isArray(moves)) {
        return [];
    }
    return moves.map((move) => toUint64(move as Long | number | undefined));
}

/**
 * Validates that all moves are in the valid range (1-4)
 * 1=UP, 2=RIGHT, 3=DOWN, 4=LEFT
 */
export function areMovesValid(moves: number[]): boolean {
    return moves.every((move) => move >= 1 && move <= 4);
}

/**
 * Normalizes game treasury from protobuf message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeGameTreasury(treasury: any) {
    return {
        platformBalance: toUint64(treasury?.platformBalance as Long | number | undefined),
        reserveBalance: toUint64(treasury?.reserveBalance as Long | number | undefined),
        shopBalance: toUint64(treasury?.shopBalance as Long | number | undefined),
        updatedAtUnix: toUint64(treasury?.updatedAtUnix as Long | number | undefined)
    };
}

/**
 * Calculate amount based on basis points (BPS)
 * 
 * @param amount - The total amount as a Long
 * @param bps - Basis points (e.g., 500 = 5%, 10000 = 100%)
 * @returns Calculated amount as Long
 * 
 * @remarks
 * - Returns ZERO if bps is non-positive
 * - Formula: (amount * bps) / 10000
 * - Used for fee calculations, reward distributions, and bonus calculations
 */
export function calculateBpsAmount(amount: Long, bps: number): Long {
    if (bps <= 0) {
        return Long.ZERO;
    }
    return amount.multiply(bps).divide(10000);
}
