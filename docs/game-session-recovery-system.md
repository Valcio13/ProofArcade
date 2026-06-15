# Game Session Recovery System - Design Document

**Date**: June 14, 2026  
**Status**: Design Phase  
**Version**: 1.0

---

## Problem Statement

Players can lose active games when:
- Refreshing the page
- Closing the browser tab
- Experiencing a browser crash
- Losing connectivity temporarily

This affects both Daily Challenge (limited attempts) and Classic Mode (unlimited play), with Daily Challenge being more severe due to one-attempt-per-day constraints.

---

## Goals

1. **Unified Recovery**: Single system for all game modes
2. **Preserve Progress**: Save board state, score, moves across all modes
3. **Maintain Integrity**: Daily Challenge one-attempt-per-day remains enforced
4. **Clear UX**: Players understand recovery state and options
5. **Automatic**: Recovery happens transparently on page load

---

## Session States

### State Machine

```
┌──────────────┐
│ Not Started  │ ← Initial state, no active game
└──────┬───────┘
       │ start()
       ↓
┌──────────────┐
│ In Progress  │ ← Game active, moves being played
└──────┬───────┘
       │ finish()
       ↓
┌──────────────┐
│  Completed   │ ← Game ended (no moves, max moves, player stop)
└──────┬───────┘
       │ submit() [daily/classic] OR finalize() [training]
       ↓
┌──────────────┐
│  Submitted   │ ← Score submitted to chain (not applicable for training)
└──────────────┘
```

### State Definitions

**Not Started**
- No active session
- Player can start any mode
- No recovery needed

**In Progress**
- Active session exists
- Moves can be played
- Board state persists after each move
- **Recovery target**: This state must be restored

**Completed**
- Game ended (no moves left, max moves reached, or player stopped)
- Score finalized
- Waiting for submission (daily/classic) or acknowledgment (training)
- **Recovery target**: Preserve completion state

**Submitted**
- Transaction sent to blockchain (daily/classic only)
- Session can be cleared after success confirmation
- **No recovery needed**: Session complete

---

## Storage Schema

### Primary Storage: `localStorage`

**Key Structure**: `proofarcade:game-session:{address}`

```typescript
interface GameSessionRecord {
  // Metadata
  version: number              // Schema version (1)
  address: string              // Player address
  createdAt: number            // Unix timestamp (ms)
  updatedAt: number            // Unix timestamp (ms)
  
  // Session Info
  session: LocalSession        // gameId, mode, seed, utcDate, maxMoves
  
  // Game State
  state: 'in-progress' | 'completed' | 'submitted'
  board: number[]              // 16-element array
  score: number
  maxTile: number
  moves: MoveDirection[]       // Full move history
  
  // Completion Info (if completed)
  completedAt?: number         // Unix timestamp (ms)
  stopReason?: StopReason      // 'player_stopped' | 'no_moves' | 'max_moves'
  
  // Submission Info (if submitted)
  submittedAt?: number         // Unix timestamp (ms)
  txHash?: string              // Transaction hash
  txStage?: 'submitted' | 'pending' | 'indexed'
}
```

### Storage Keys

```typescript
// Main session storage
const SESSION_KEY = 'proofarcade:game-session:{address}'

// Backup/migration keys (deprecated after migration)
const LEGACY_SESSION_KEY = 'canopy-2048-active-session-v2'
const LEGACY_RUN_STATE_KEY = 'canopy-2048-active-run-state-v2'
```

---

## Recovery Flow

### On Application Load

```typescript
1. Load wallet/address
2. Check for existing session: loadGameSession(address)
3. If session exists:
   a. Validate session (check expiry, mode compatibility)
   b. Show recovery UI based on mode
   c. Wait for user action (resume/discard)
4. If no session or after user action:
   a. Show mode selection
   b. Allow new game start
```

### Recovery UI

#### Daily Challenge Recovery

```
┌─────────────────────────────────────────────┐
│ ⚠️  Unfinished Daily Challenge              │
│                                             │
│ Score: 3,124                                │
│ Moves Left: 41                              │
│ Started: 2026-06-14 10:23 AM                │
│                                             │
│ You have an active Daily Challenge from     │
│ today. Daily attempts are limited to one    │
│ per day.                                    │
│                                             │
│         [ Resume Challenge ]                │
└─────────────────────────────────────────────┘
```

**Features**:
- **Resume only** - No discard option
- Shows current score and remaining moves
- Clear messaging about one-attempt limit
- Automatic recovery on page load

#### Classic Mode Recovery

```
┌─────────────────────────────────────────────┐
│ 📊 Unfinished Classic Run                   │
│                                             │
│ Score: 5,432                                │
│ Moves: 147                                  │
│ Started: 2026-06-14 09:45 AM                │
│                                             │
│ You have an active Classic run in progress. │
│                                             │
│    [ Resume ]      [ Start New Run ]        │
└─────────────────────────────────────────────┘
```

**Features**:
- **Resume** - Continue existing run
- **Discard** - Start fresh (with confirmation)
- Shows current stats
- Optional: preserve run history

---

## Mode-Specific Rules

### Daily Challenge

**Recovery Behavior**:
- ✅ **Auto-restore** on page load
- ✅ **Resume only** - no discard option
- ✅ **Preserve one-attempt** - must continue existing run
- ✅ **Block new start** - if unfinished session exists for today

**Session Lifecycle**:
1. **Start**: Create session, save to storage
2. **Play**: Update storage after each move
3. **Complete**: Mark completed, preserve state
4. **Submit**: Send to chain, mark submitted
5. **Confirm**: Clear storage only after TX indexed

**Edge Cases**:
- If user has completed but not submitted: Show "Submit Score" prompt
- If submission failed: Allow retry
- If new UTC day: Clear previous day's session (even if incomplete)

---

### Classic Mode

**Recovery Behavior**:
- ✅ **Auto-restore** on page load with prompt
- ✅ **Resume OR discard** - player choice
- ✅ **Multiple runs** - can abandon and start new
- ✅ **No limits** - unlimited attempts

**Session Lifecycle**:
1. **Start**: Create session, save to storage
2. **Play**: Update storage after each move
3. **Complete**: Mark completed, preserve state
4. **Submit**: Send to chain, mark submitted
5. **Confirm**: Clear storage after TX indexed

**Edge Cases**:
- If user chooses "discard": Clear storage, allow new start
- If submission failed: Allow retry or discard
- No time-based clearing (persist indefinitely until completed)

---

### Training Mode

**Recovery Behavior**:
- ✅ **Optional recovery** - can discard freely
- ✅ **Resume OR discard** - player choice
- ✅ **Local only** - no blockchain submission
- ✅ **Lightweight** - minimal persistence

**Session Lifecycle**:
1. **Start**: Create session (optional storage)
2. **Play**: Update storage (optional)
3. **Complete**: Show results, clear immediately
4. **No submission**: Pure local play

**Edge Cases**:
- Consider: Skip persistence entirely for training
- OR: Persist but with lowest priority (clear on any new mode start)

---

## Implementation Plan

### Phase 1: Core Recovery System ✅

**New Module**: `src/lib/gameSessionRecovery.ts`

```typescript
// Session Management
export function loadGameSession(address: string): GameSessionRecord | null
export function saveGameSession(address: string, session: GameSessionRecord): void
export function clearGameSession(address: string): void

// State Transitions
export function createGameSession(session: LocalSession): GameSessionRecord
export function updateGameState(record: GameSessionRecord, updates: Partial<GameState>): GameSessionRecord
export function markCompleted(record: GameSessionRecord, stopReason: StopReason): GameSessionRecord
export function markSubmitted(record: GameSessionRecord, txHash: string, txStage: string): GameSessionRecord

// Validation
export function isSessionValid(record: GameSessionRecord): boolean
export function shouldAutoRestore(record: GameSessionRecord, mode: PlayMode): boolean

// Utilities
export function migrateFromLegacy(address: string): GameSessionRecord | null
```

---

### Phase 2: UI Components ✅

**New Component**: `src/components/SessionRecoveryPrompt.tsx`

```typescript
interface SessionRecoveryPromptProps {
  session: GameSessionRecord
  onResume: () => void
  onDiscard?: () => void  // Optional for Daily Challenge
}

export function SessionRecoveryPrompt(props: SessionRecoveryPromptProps)
```

Features:
- Mode-specific messaging
- Visual stats display
- Action buttons (resume/discard)
- Animation for smooth entry

---

### Phase 3: Play2048 Integration ✅

**Updates to `Play2048.tsx`**:

1. **Bootstrap Changes**:
   - Check for existing session first
   - Show recovery prompt if found
   - Wait for user action before proceeding

2. **Save on Every Move**:
   ```typescript
   function playMove(direction: MoveDirection) {
     // ... existing logic ...
     
     // Save after each move
     if (session) {
       saveGameSession(address, {
         ...currentSession,
         board: nextBoard,
         score: nextScore,
         maxTile: nextMaxTile,
         moves: nextMoves,
         updatedAt: Date.now(),
       })
     }
   }
   ```

3. **Save on Completion**:
   ```typescript
   function finishRun(stopIntent: StopReason) {
     // ... existing logic ...
     
     // Mark completed
     const completedSession = markCompleted(currentSession, stopIntent)
     saveGameSession(address, completedSession)
   }
   ```

4. **Clear on Success**:
   ```typescript
   // After successful submission and indexing
   if (result.txStage === 'indexed') {
     clearGameSession(address)
   }
   ```

---

### Phase 4: Testing & Edge Cases ✅

**Test Scenarios**:

1. **Daily Challenge**:
   - [ ] Start game, refresh → Resume automatically
   - [ ] Complete game, close tab → Resume at completion
   - [ ] Submit score, close tab → Clear after indexing
   - [ ] New UTC day → Clear old session

2. **Classic Mode**:
   - [ ] Start game, refresh → Show resume prompt
   - [ ] Resume → Continue from saved state
   - [ ] Discard → Clear and allow new start
   - [ ] Complete → Preserve until submission

3. **Training Mode**:
   - [ ] Start game, refresh → Optional resume
   - [ ] Discard → Clear immediately
   - [ ] Complete → Clear immediately

4. **Edge Cases**:
   - [ ] Multiple tabs open (last write wins)
   - [ ] Session expiry (> 24 hours)
   - [ ] Storage quota exceeded
   - [ ] Corrupt session data
   - [ ] Migration from legacy keys

---

## Data Migration

### From Legacy Storage

**Old Keys**:
- `canopy-2048-active-session-v2`
- `canopy-2048-active-run-state-v2`

**Migration Strategy**:
1. On first load, check for legacy keys
2. If found, convert to new format
3. Save to new key
4. Delete legacy keys
5. Log migration for debugging

```typescript
function migrateFromLegacy(address: string): GameSessionRecord | null {
  const legacySession = localStorage.getItem('canopy-2048-active-session-v2')
  const legacyRunState = localStorage.getItem('canopy-2048-active-run-state-v2')
  
  if (!legacySession || !legacyRunState) {
    return null
  }
  
  // Parse and convert to new format
  // ...
  
  // Clean up
  localStorage.removeItem('canopy-2048-active-session-v2')
  localStorage.removeItem('canopy-2048-active-run-state-v2')
  
  return newSessionRecord
}
```

---

## Security & Privacy

### Considerations

1. **Local Storage Only**: Sessions stored client-side
2. **Address-Scoped**: Each address has separate session
3. **No Sensitive Data**: Only game state (no passwords/keys)
4. **Expiry**: Sessions older than 24h automatically invalid
5. **Validation**: Always validate restored sessions

### Storage Quotas

**LocalStorage Limits**:
- Typical limit: 5-10 MB per origin
- Single session: ~5-10 KB (negligible)
- Support: 100-1000 concurrent sessions (theoretical)

**Fallback**:
- If quota exceeded: Clear oldest sessions first
- Worst case: Skip persistence, warn user

---

## Performance

### Write Operations

**Frequency**: After each move (potentially 80+ times per game)

**Optimization**:
- Debounce writes (100ms delay)
- Batch multiple moves if rapid
- Use `requestIdleCallback` for non-critical saves

```typescript
// Debounced save
const debouncedSave = useMemo(
  () => debounce((session: GameSessionRecord) => {
    saveGameSession(address, session)
  }, 100),
  [address]
)
```

### Read Operations

**Frequency**: Once on page load

**Optimization**:
- Parse JSON once
- Cache in memory
- Validate synchronously

---

## Future Enhancements

### Phase 5: Cloud Backup (Optional)

- Sync sessions to backend
- Cross-device recovery
- Require authentication
- Optional feature (privacy-conscious)

### Phase 6: Session History

- Preserve completed sessions
- Replay feature
- Statistics tracking
- Achievements based on history

### Phase 7: Offline Support

- Service worker integration
- Queue submissions when offline
- Retry logic
- Background sync API

---

## Success Metrics

**User Experience**:
- ✅ Zero data loss from refresh/crash
- ✅ Clear recovery UX (< 5s to understand)
- ✅ Seamless resume (< 1s to restore)

**Technical**:
- ✅ < 50ms save latency
- ✅ < 100ms restore latency
- ✅ 100% data integrity
- ✅ Zero legacy key conflicts

**Adoption**:
- Track recovery usage
- Monitor discard rate (Classic)
- Measure completion rate improvement

---

## Rollout Plan

### Stage 1: Development (1-2 days)
- Implement core recovery module
- Create UI components
- Integrate with Play2048
- Write unit tests

### Stage 2: Testing (1 day)
- Manual testing all scenarios
- Edge case verification
- Performance profiling
- Browser compatibility

### Stage 3: Deployment (1 day)
- Deploy to staging
- Monitor for issues
- Gather user feedback
- Fix any bugs

### Stage 4: Production (Ongoing)
- Monitor metrics
- Iterate based on feedback
- Consider enhancements

---

## Conclusion

This unified Game Session Recovery system will:
- ✅ Protect players from data loss across all modes
- ✅ Maintain Daily Challenge competitive integrity
- ✅ Provide clear, mode-specific recovery UX
- ✅ Lay foundation for future enhancements (cloud sync, replay)

The system is designed to be robust, performant, and maintainable while preserving the distinct characteristics of each game mode.

---

**Status**: Ready for Implementation  
**Next Step**: Create `src/lib/gameSessionRecovery.ts` module
