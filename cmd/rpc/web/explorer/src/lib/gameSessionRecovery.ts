/**
 * Game Session Recovery System
 * 
 * Unified session persistence and recovery for all game modes:
 * - Daily Challenge: Auto-restore with resume-only (one attempt per day)
 * - Classic Mode: Auto-restore with resume or discard options
 * - Training Mode: Optional recovery with lightweight persistence
 * 
 * Session States: Not Started → In Progress → Completed → Submitted
 */

import type { LocalSession, MoveDirection, PlayMode, StopReason } from './game2048'
import { getUtcDateString } from './game2048'

// ============================================================================
// Types
// ============================================================================

export interface GameSessionRecord {
  // Metadata
  version: number // Schema version (1)
  address: string // Player address
  createdAt: number // Unix timestamp (ms)
  updatedAt: number // Unix timestamp (ms)

  // Session Info
  session: LocalSession // gameId, mode, seed, utcDate, maxMoves

  // Game State
  state: 'in-progress' | 'completed' | 'submitted'
  board: number[] // 16-element array
  score: number
  maxTile: number
  moves: MoveDirection[] // Full move history

  // Completion Info (if completed)
  completedAt?: number // Unix timestamp (ms)
  stopReason?: StopReason // 'player_stopped' | 'no_moves' | 'max_moves'

  // Submission Info (if submitted)
  submittedAt?: number // Unix timestamp (ms)
  txHash?: string // Transaction hash
  txStage?: 'submitted' | 'pending' | 'indexed'
}

export interface GameState {
  board: number[]
  score: number
  maxTile: number
  moves: MoveDirection[]
}

// ============================================================================
// Storage Keys
// ============================================================================

const SESSION_KEY_PREFIX = 'proofarcade:game-session:'
const LEGACY_SESSION_KEY = 'canopy-2048-active-session-v2'
const LEGACY_RUN_STATE_KEY = 'canopy-2048-active-run-state-v2'

function getSessionKey(address: string): string {
  return `${SESSION_KEY_PREFIX}${address.toLowerCase()}`
}

// ============================================================================
// Core Session Management
// ============================================================================

/**
 * Load existing session from storage
 */
export function loadGameSession(address: string): GameSessionRecord | null {
  try {
    const key = getSessionKey(address)
    const raw = localStorage.getItem(key)
    
    if (!raw) {
      // Try migration from legacy storage
      return migrateFromLegacy(address)
    }

    const record = JSON.parse(raw) as GameSessionRecord

    // Validate schema version
    if (record.version !== 1) {
      console.warn('[GameSessionRecovery] Unknown schema version:', record.version)
      return null
    }

    // Validate session is still relevant
    if (!isSessionValid(record)) {
      console.log('[GameSessionRecovery] Session expired or invalid, clearing')
      clearGameSession(address)
      return null
    }

    return record
  } catch (error) {
    console.error('[GameSessionRecovery] Failed to load session:', error)
    return null
  }
}

/**
 * Save session to storage
 */
export function saveGameSession(address: string, record: GameSessionRecord): void {
  try {
    const key = getSessionKey(address)
    const updated = {
      ...record,
      address: address.toLowerCase(),
      updatedAt: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    console.error('[GameSessionRecovery] Failed to save session:', error)
    // Storage quota exceeded or other error - continue without persistence
  }
}

/**
 * Clear session from storage
 */
export function clearGameSession(address: string): void {
  try {
    const key = getSessionKey(address)
    localStorage.removeItem(key)
    console.log('[GameSessionRecovery] Session cleared for', address)
  } catch (error) {
    console.error('[GameSessionRecovery] Failed to clear session:', error)
  }
}

// ============================================================================
// State Transitions
// ============================================================================

/**
 * Create new session record (Not Started → In Progress)
 */
export function createGameSession(
  address: string,
  session: LocalSession,
  initialBoard: number[],
  initialMaxTile: number
): GameSessionRecord {
  return {
    version: 1,
    address: address.toLowerCase(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    session,
    state: 'in-progress',
    board: initialBoard,
    score: 0,
    maxTile: initialMaxTile,
    moves: [],
  }
}

/**
 * Update game state during play (In Progress → In Progress)
 */
export function updateGameState(
  record: GameSessionRecord,
  updates: Partial<GameState>
): GameSessionRecord {
  return {
    ...record,
    ...updates,
    updatedAt: Date.now(),
  }
}

/**
 * Mark session as completed (In Progress → Completed)
 */
export function markCompleted(
  record: GameSessionRecord,
  stopReason: StopReason
): GameSessionRecord {
  return {
    ...record,
    state: 'completed',
    completedAt: Date.now(),
    stopReason,
    updatedAt: Date.now(),
  }
}

/**
 * Mark session as submitted (Completed → Submitted)
 */
export function markSubmitted(
  record: GameSessionRecord,
  txHash: string,
  txStage: 'submitted' | 'pending' | 'indexed'
): GameSessionRecord {
  return {
    ...record,
    state: 'submitted',
    submittedAt: Date.now(),
    txHash,
    txStage,
    updatedAt: Date.now(),
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if session is still valid
 */
export function isSessionValid(record: GameSessionRecord): boolean {
  // Check if session is too old (24 hours)
  const now = Date.now()
  const age = now - record.createdAt
  const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours
  
  if (age > MAX_AGE) {
    console.log('[GameSessionRecovery] Session expired (age:', Math.floor(age / 1000 / 60), 'minutes)')
    return false
  }

  // For Daily Challenge, check if it's from today
  if (record.session.mode === 'daily') {
    const todayUtc = getUtcDateString()
    if (record.session.utcDate !== todayUtc) {
      console.log('[GameSessionRecovery] Daily session from different day:', record.session.utcDate, '!==', todayUtc)
      return false
    }
  }

  // Validate data integrity
  if (!record.session || !record.board || record.board.length !== 16) {
    console.log('[GameSessionRecovery] Invalid session data structure')
    return false
  }

  return true
}

/**
 * Check if session should auto-restore based on mode
 */
export function shouldAutoRestore(record: GameSessionRecord, mode: PlayMode): boolean {
  // Only restore if modes match
  if (record.session.mode !== mode) {
    return false
  }

  // Daily Challenge: Always auto-restore (enforce one attempt)
  if (mode === 'daily') {
    return true
  }

  // Classic Mode: Auto-restore but with prompt
  if (mode === 'classic') {
    return true
  }

  // Training Mode: Optional restore
  if (mode === 'training') {
    return true
  }

  return false
}

// ============================================================================
// Legacy Migration
// ============================================================================

interface LegacySession {
  gameId: string
  mode: PlayMode
  seed: string
  utcDate: string
  maxMoves: number
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
}

interface LegacyRunState {
  address: string
  board: number[]
  score: number
  maxTile: number
  moves: MoveDirection[]
  selectedMode: PlayMode
  isSubmitted: boolean
  lastOutcome: { stopReason: StopReason; score: number; maxTile: number } | null
}

/**
 * Migrate from legacy storage format
 */
export function migrateFromLegacy(address: string): GameSessionRecord | null {
  try {
    const legacySessionRaw = localStorage.getItem(LEGACY_SESSION_KEY)
    const legacyRunStateRaw = localStorage.getItem(LEGACY_RUN_STATE_KEY)

    if (!legacySessionRaw || !legacyRunStateRaw) {
      return null
    }

    const legacySession = JSON.parse(legacySessionRaw) as LegacySession
    const legacyRunState = JSON.parse(legacyRunStateRaw) as LegacyRunState

    // Validate addresses match
    if (legacyRunState.address.toLowerCase() !== address.toLowerCase()) {
      console.log('[GameSessionRecovery] Legacy session address mismatch')
      return null
    }

    // Convert to new format
    const record: GameSessionRecord = {
      version: 1,
      address: address.toLowerCase(),
      createdAt: Date.now() - 60 * 60 * 1000, // Assume 1 hour ago
      updatedAt: Date.now(),
      session: {
        gameId: legacySession.gameId,
        mode: legacySession.mode,
        seed: legacySession.seed,
        utcDate: legacySession.utcDate,
        maxMoves: legacySession.maxMoves,
      },
      state: legacyRunState.isSubmitted
        ? 'submitted'
        : legacyRunState.lastOutcome
          ? 'completed'
          : 'in-progress',
      board: legacyRunState.board,
      score: legacyRunState.score,
      maxTile: legacyRunState.maxTile,
      moves: legacyRunState.moves,
    }

    // Add completion info if available
    if (legacyRunState.lastOutcome) {
      record.completedAt = Date.now()
      record.stopReason = legacyRunState.lastOutcome.stopReason
    }

    // Add submission info if available
    if (legacyRunState.isSubmitted && legacySession.txHash) {
      record.submittedAt = Date.now()
      record.txHash = legacySession.txHash
      record.txStage = legacySession.txStage || 'submitted'
    }

    // Validate migrated session
    if (!isSessionValid(record)) {
      console.log('[GameSessionRecovery] Migrated session is invalid, skipping')
      cleanupLegacyStorage()
      return null
    }

    // Save to new format
    saveGameSession(address, record)

    // Clean up legacy storage
    cleanupLegacyStorage()

    console.log('[GameSessionRecovery] Successfully migrated legacy session')
    return record
  } catch (error) {
    console.error('[GameSessionRecovery] Migration failed:', error)
    cleanupLegacyStorage()
    return null
  }
}

function cleanupLegacyStorage(): void {
  try {
    localStorage.removeItem(LEGACY_SESSION_KEY)
    localStorage.removeItem(LEGACY_RUN_STATE_KEY)
    console.log('[GameSessionRecovery] Legacy storage cleaned up')
  } catch (error) {
    console.error('[GameSessionRecovery] Failed to cleanup legacy storage:', error)
  }
}
