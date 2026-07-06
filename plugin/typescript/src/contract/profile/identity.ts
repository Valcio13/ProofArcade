/**
 * Player Identity Module
 * 
 * Functions for managing player identity (username, avatar, etc.).
 */

import Long from 'long';
import { decodeGame2048State, encodeGame2048State, toUint64 } from '../game2048.js';
import { normalizeUsername, validateUsername } from '../utils/helpers.js';
import type { PlayerIdentity, UsernameRegistration } from './types.js';

/**
 * Validate username format
 * Returns true if username meets requirements
 */
export function isUsernameValid(username: string): boolean {
    return validateUsername(username);
}

/**
 * Normalize username to lowercase for lookups
 */
export function normalizeUsernameForLookup(username: string): string {
    return normalizeUsername(username);
}

/**
 * Decode PlayerIdentity from state bytes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodePlayerIdentity(identityBytes: Uint8Array | null | undefined): any | null {
    if (!identityBytes || identityBytes.length === 0) {
        return null;
    }
    const [identity] = decodeGame2048State('PlayerIdentity', identityBytes);
    return identity || null;
}

/**
 * Decode UsernameRegistration from state bytes (legacy format)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeUsernameRegistration(usernameBytes: Uint8Array | null | undefined): any | null {
    if (!usernameBytes || usernameBytes.length === 0) {
        return null;
    }
    const [registration] = decodeGame2048State('UsernameRegistration', usernameBytes);
    return registration || null;
}

/**
 * Encode PlayerIdentity to state bytes
 */
export function encodePlayerIdentity(identity: PlayerIdentity): Uint8Array {
    return encodeGame2048State('PlayerIdentity', {
        playerAddress: identity.playerAddress,
        username: identity.username,
        avatarUrl: identity.avatarUrl || '',
        title: identity.title || '',
        bio: identity.bio || '',
        registeredAtUnix: toUint64(identity.registeredAtUnix as Long | number | undefined),
        lastUpdatedUnix: toUint64(identity.lastUpdatedUnix as Long | number | undefined)
    });
}

/**
 * Encode UsernameRegistration to state bytes (legacy format for backward compatibility)
 */
export function encodeUsernameRegistration(registration: UsernameRegistration): Uint8Array {
    return encodeGame2048State('UsernameRegistration', {
        playerAddress: registration.playerAddress,
        username: registration.username,
        registeredAtUnix: toUint64(registration.registeredAtUnix as Long | number | undefined),
        lastChangedAtUnix: toUint64(registration.lastChangedAtUnix as Long | number | undefined)
    });
}

/**
 * Create a new PlayerIdentity object
 */
export function createPlayerIdentity(
    playerAddress: Uint8Array,
    username: string,
    registeredAtUnix: number | Long,
    options?: {
        avatarUrl?: string;
        title?: string;
        bio?: string;
    }
): PlayerIdentity {
    return {
        playerAddress,
        username,
        avatarUrl: options?.avatarUrl || '',
        title: options?.title || '',
        bio: options?.bio || '',
        registeredAtUnix,
        lastUpdatedUnix: registeredAtUnix
    };
}

/**
 * Update PlayerIdentity fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updatePlayerIdentity(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    existingIdentity: any,
    updates: {
        username?: string;
        avatarUrl?: string;
        title?: string;
        bio?: string;
        lastUpdatedUnix?: number | Long;
    }
): PlayerIdentity {
    return {
        playerAddress: existingIdentity.playerAddress,
        username: updates.username !== undefined ? updates.username : existingIdentity.username,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : (existingIdentity.avatarUrl || ''),
        title: updates.title !== undefined ? updates.title : (existingIdentity.title || ''),
        bio: updates.bio !== undefined ? updates.bio : (existingIdentity.bio || ''),
        registeredAtUnix: existingIdentity.registeredAtUnix,
        lastUpdatedUnix: updates.lastUpdatedUnix !== undefined ? updates.lastUpdatedUnix : existingIdentity.lastUpdatedUnix
    };
}

/**
 * Get username from either PlayerIdentity or UsernameRegistration (migration helper)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUsernameFromState(
    identityBytes: Uint8Array | null | undefined,
    usernameBytes: Uint8Array | null | undefined
): string {
    // Try PlayerIdentity first (new format)
    const identity = decodePlayerIdentity(identityBytes);
    if (identity && identity.username) {
        return identity.username;
    }
    
    // Fallback to UsernameRegistration (legacy format)
    const registration = decodeUsernameRegistration(usernameBytes);
    if (registration && registration.username) {
        return registration.username;
    }
    
    return '';
}

/**
 * Get registration timestamp from either PlayerIdentity or UsernameRegistration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRegistrationTime(
    identityBytes: Uint8Array | null | undefined,
    usernameBytes: Uint8Array | null | undefined
): number {
    // Try PlayerIdentity first
    const identity = decodePlayerIdentity(identityBytes);
    if (identity) {
        return toUint64(identity.registeredAtUnix as Long | number | undefined);
    }
    
    // Fallback to UsernameRegistration
    const registration = decodeUsernameRegistration(usernameBytes);
    if (registration) {
        return toUint64(registration.registeredAtUnix as Long | number | undefined);
    }
    
    return 0;
}
