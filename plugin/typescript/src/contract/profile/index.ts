/**
 * Profile Module
 * 
 * Player statistics, identity, and username management.
 */

// Types
export type {
    PlayerStats,
    PlayerIdentity,
    UsernameRegistration,
    PlayerStatsUpdate
} from './types.js';

// Stats functions
export {
    createPlayerStats,
    decodePlayerStats,
    encodePlayerStats,
    updatePlayerStats,
    incrementStatsField,
    addToStatsField,
    updateBestScore,
    updateBestTile
} from './stats.js';

// Identity functions
export {
    isUsernameValid,
    normalizeUsernameForLookup,
    decodePlayerIdentity,
    decodeUsernameRegistration,
    encodePlayerIdentity,
    encodeUsernameRegistration,
    createPlayerIdentity,
    updatePlayerIdentity,
    getUsernameFromState,
    getRegistrationTime
} from './identity.js';
