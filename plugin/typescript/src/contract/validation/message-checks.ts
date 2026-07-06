/**
 * Message Validation Module
 * 
 * Provides stateless validation for all message types before transaction execution.
 * These are the "CheckMessage*" functions that validate message structure and basic
 * business rules without touching state.
 * 
 * Responsibilities:
 * - Validate message structure (required fields, correct types)
 * - Validate address formats (20-byte addresses)
 * - Validate amounts (non-zero, positive)
 * - Return authorized signers for each message type
 * 
 * NOT responsible for:
 * - Stateful validation (balance checks, game state, etc.)
 * - Business logic execution
 * - State modifications
 */

import Long from 'long';
import {
    ErrInvalidAddress,
    ErrInvalidAmount,
    ErrInvalidMessageCast,
} from '../error.js';
import { normalizeBytes } from '../utils/helpers.js';
import { toUint64 } from '../game2048.js';

/**
 * Validate a Send (token transfer) message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageSend(msg: any): any {
    // check sender address
    if (!msg.fromAddress || msg.fromAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    // check recipient address
    if (!msg.toAddress || msg.toAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    // check amount
    const amount = msg.amount as Long | number | undefined;
    if (!amount || (Long.isLong(amount) ? amount.isZero() : amount === 0)) {
        return { error: ErrInvalidAmount() };
    }
    // return the authorized signers
    return {
        recipient: msg.toAddress,
        authorizedSigners: [msg.fromAddress]
    };
}

/**
 * Validate a StartDailyGame message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageStartDailyGame(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    const gameId = normalizeBytes(msg?.gameId);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    if (!msg.utcDate || typeof msg.utcDate !== 'string') {
        return { error: ErrInvalidMessageCast() };
    }
    if (gameId.length === 0) {
        return { error: ErrInvalidMessageCast() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a StartClassicGame message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageStartClassicGame(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    const gameId = normalizeBytes(msg?.gameId);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    if (gameId.length === 0) {
        return { error: ErrInvalidMessageCast() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a SubmitGameResult message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageSubmitGameResult(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    const gameId = normalizeBytes(msg?.gameId);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    if (gameId.length === 0) {
        return { error: ErrInvalidMessageCast() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a ClaimDailyReward message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageClaimDailyReward(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    if (!msg.utcDate || typeof msg.utcDate !== 'string') {
        return { error: ErrInvalidMessageCast() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a RedeemClassicPoints message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageRedeemClassicPoints(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    if (toUint64(msg?.burnPoints as Long | number | undefined) === 0) {
        return { error: ErrInvalidAmount() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a ClaimDailyLoginReward message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageClaimDailyLoginReward(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}

/**
 * Validate a SetUsername message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkMessageSetUsername(msg: any): any {
    const playerAddress = normalizeBytes(msg?.playerAddress);
    if (playerAddress.length !== 20) {
        return { error: ErrInvalidAddress() };
    }
    return {
        authorizedSigners: [playerAddress]
    };
}
