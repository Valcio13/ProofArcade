/**
 * Economy v2 - Competition Registry
 * 
 * Manages competition metadata and lifecycle.
 * Tracks daily, monthly, weekly, and other competition instances.
 * 
 * NOTE: Competition metadata is separate from pool balances.
 * Pool balances are the single source of truth and are managed via pool-operations.
 * Competition metadata tracks entry counts, dates, and finalization status only.
 */

import Long from 'long';
import type { Contract } from '../contract.js';
import {
    CompetitionMetadata,
    EconomyError,
    EconomyErrorCodes,
} from './types.js';

/**
 * Registers or updates a competition instance
 * @param contract Plugin contract instance
 * @param metadata Competition metadata
 */
export async function updateCompetitionMetadata(
    _contract: Contract,
    _metadata: CompetitionMetadata
): Promise<void> {
    // This is a placeholder for Phase 1
    // Will be implemented with actual state writes in Phase 2
    throw new EconomyError(
        'Competition registry not yet implemented',
        EconomyErrorCodes.COMPETITION_NOT_FOUND
    );
}

/**
 * Retrieves competition metadata by ID
 * @param contract Plugin contract instance
 * @param competitionId Competition identifier (e.g., "2026-07-05", "2026-07")
 * @returns Competition metadata or null if not found
 */
export async function getCompetitionMetadata(
    _contract: Contract,
    _competitionId: string
): Promise<CompetitionMetadata | null> {
    // This is a placeholder for Phase 1
    // Will be implemented with actual state reads in Phase 2
    return null;
}

/**
 * Gets the current competition pool balance
 * NOTE: This queries the pool directly. Pools are the source of truth for balances.
 * @param contract Plugin contract instance
 * @param competitionId Competition identifier
 * @returns Current pool balance
 */
export async function getCompetitionPoolBalance(
    _contract: Contract,
    _competitionId: string
): Promise<Long> {
    // This is a placeholder for Phase 1
    // Will be implemented in Phase 2 by querying the appropriate pool
    // (Daily pool for daily competitions, Monthly pool for monthly, etc.)
    return Long.fromNumber(0);
}

/**
 * Marks a competition as finalized
 * @param contract Plugin contract instance
 * @param competitionId Competition identifier
 * @param finalizedAt Finalization timestamp
 */
export async function finalizeCompetition(
    _contract: Contract,
    _competitionId: string,
    _finalizedAt: Long
): Promise<void> {
    // This is a placeholder for Phase 1
    // Will be implemented in Phase 2
    throw new EconomyError(
        'Competition finalization not yet implemented',
        EconomyErrorCodes.COMPETITION_NOT_FOUND
    );
}

/**
 * Increments competition entry count and gross fees
 * @param contract Plugin contract instance
 * @param competitionId Competition identifier
 * @param entryFee Entry fee amount
 */
export async function recordCompetitionEntry(
    _contract: Contract,
    _competitionId: string,
    _entryFee: Long
): Promise<void> {
    // This is a placeholder for Phase 1
    // Will be implemented in Phase 2
    throw new EconomyError(
        'Competition entry recording not yet implemented',
        EconomyErrorCodes.COMPETITION_NOT_FOUND
    );
}

/**
 * Utility: Generates current UTC date string (YYYY-MM-DD)
 * @param timestamp Unix timestamp in microseconds
 * @returns UTC date string
 */
export function getCurrentUTCDate(timestamp: Long): string {
    const micros = timestamp.toNumber();
    const millis = Math.floor(micros / 1000);
    const date = new Date(millis);
    return date.toISOString().split('T')[0];
}

/**
 * Utility: Generates current UTC month string (YYYY-MM)
 * @param timestamp Unix timestamp in microseconds
 * @returns UTC month string
 */
export function getCurrentUTCMonth(timestamp: Long): string {
    const date = getCurrentUTCDate(timestamp);
    return date.substring(0, 7); // "YYYY-MM"
}
