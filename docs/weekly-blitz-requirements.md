# Weekly Blitz - Requirements Review

**Date:** July 22, 2026  
**Status:** Pre-Implementation Review

## Core Requirements

### Game Mode Specifications

| Aspect | Requirement | Notes |
|--------|-------------|-------|
| **Entry Fee** | 5 PROOF (5,000,000 uproof) | Per game entry |
| **Game Duration** | 5 minutes (300 seconds) | Hard limit, enforced on-chain |
| **Daily Limits** | 2 Official Runs + 3 Retries | Per UTC day, resets at 00:00 UTC |
| **Scoring** | Cumulative | All scores add up over the week |
| **Week Period** | Monday 00:00 UTC → Sunday 23:59 UTC | 7-day competition cycle |
| **Timer Expiry** | Auto-submit game | Game stops when timer hits 0:00 |

### Fee Distribution (5 PROOF Entry)

| Recipient | Percentage | Amount | Purpose |
|-----------|-----------|--------|---------|
| Weekly Blitz Pool | 60% | 3.0 PROOF | Winner payouts |
| Shop Treasury | 20% | 1.0 PROOF | Shop funding |
| Reserve Treasury | 15% | 0.75 PROOF | Safety buffer |
| Platform Treasury | 5% | 0.25 PROOF | Protocol revenue |
| **TOTAL** | **100%** | **5.0 PROOF** | |

### Daily Limits Enforcement

**Official Runs (2 per day):**
- Cost: 5 PROOF each
- Tracked in state: `WeeklyBlitzDailyTracking`
- Enforced in contract validation
- Counts toward cumulative score

**Retries (3 per day):**
- Frontend-only tracking (localStorage)
- No state storage required
- Counts toward cumulative score
- Same 5 PROOF fee

**Reset Time:** 00:00 UTC daily

### Cumulative Scoring

- **All games count** - Every completed game adds to weekly total
- **No "best of"** - Unlike Daily Challenge's single daily score
- **Running total** - Score accumulates throughout the week
- **Leaderboard** - Ranked by cumulative score descending

### Week Calculation

```typescript
const WEEK_SECONDS = 7 * 24 * 60 * 60 // 604800
const EPOCH_OFFSET = 4 * 24 * 60 * 60 // Thursday offset for Monday start

weekId = Math.floor((currentUnix - EPOCH_OFFSET) / WEEK_SECONDS)
weekStart = (weekId * WEEK_SECONDS) + EPOCH_OFFSET
weekEnd = weekStart + WEEK_SECONDS - 1
```

**Example:**
- Week ID: 2893
- Start: Monday, July 14, 2026 00:00:00 UTC
- End: Sunday, July 20, 2026 23:59:59 UTC

## State Design

### Proto Messages

```protobuf
message MessageStartWeeklyBlitzGame {
  bytes player_address = 1;
  uint64 week_id = 2;
  bytes game_id = 3;
}

message MessageClaimWeeklyBlitzReward {
  bytes player_address = 1;
  uint64 week_id = 2;
}

// GameSession additions
message GameSession {
  // ... existing fields ...
  uint64 expires_at_unix = 16; // Timer expiry timestamp
  uint64 week_id = 17;         // Week identifier
}
```

### State Keys

```typescript
// Daily tracking (limits)
KeyForWeeklyBlitzDailyTracking(utcDate, playerAddress)
→ JoinLenPrefix([18], 'weekly-blitz-daily', utcDate, playerAddress)

// Player cumulative score
KeyForWeeklyBlitzPlayerScore(weekId, playerAddress)
→ JoinLenPrefix([18], 'weekly-blitz-score', weekId, playerAddress)

// Leaderboard entry
KeyForWeeklyBlitzLeaderboard(weekId, invertedScore, playerAddress)
→ JoinLenPrefix([18], 'weekly-blitz-leaderboard', weekId, invertedScore, playerAddress)

// Prize pool
KeyForWeeklyBlitzPool(weekId)
→ JoinLenPrefix([18], 'weekly-blitz-pool', weekId)

// Session
KeyForWeeklyBlitzSession(gameId)
→ JoinLenPrefix([18], 'weekly-blitz-session', gameId)
```

### State Data Structures

**WeeklyBlitzDailyTracking** (JSON):
```json
{
  "utcDate": "2026-07-22",
  "playerAddress": "0x1234...abcd",
  "weekId": 2893,
  "officialRunsUsed": 1,
  "retriesUsed": 0,
  "lastPlayedAtUnix": 1721692800
}
```

**WeeklyBlitzPlayerScore** (JSON):
```json
{
  "weekId": 2893,
  "playerAddress": "0x1234...abcd",
  "cumulativeScore": 25600,
  "bestSingleScore": 14200,
  "runCount": 3,
  "updatedAtUnix": 1721692800
}
```

**WeeklyBlitzPool** (JSON):
```json
{
  "weekId": 2893,
  "entryCount": 150,
  "grossFees": 750000000,
  "prizePool": 450000000,
  "finalized": false,
  "finalizedAtUnix": 0
}
```

## Implementation Pattern

### Follow Daily Challenge Exactly

The Daily Challenge is proven to work. Copy its pattern:

1. **Backend Handler**: `Game2048StartDaily` → `Game2048StartWeeklyBlitz`
2. **Transaction Builder**: `buildGame2048StartDailyTx` → `buildGame2048StartWeeklyBlitzTx`
3. **Plugin Decoder**: Add `MessageStartWeeklyBlitzGame` case to `decodeGame2048Any()`
4. **Plugin Validation**: `checkMessageStartDailyGame` → `checkMessageStartWeeklyBlitzGame`
5. **Plugin Contract**: `DeliverMessageStartDailyGame` → `DeliverMessageStartWeeklyBlitzGame`

### Key Differences from Daily Challenge

| Aspect | Daily Challenge | Weekly Blitz |
|--------|----------------|--------------|
| **Period** | 1 day (UTC date) | 1 week (Monday-Sunday) |
| **Identifier** | `utcDate` string | `weekId` uint64 |
| **Scoring** | Best single daily score | Cumulative all week |
| **Timer** | None | 5 minutes enforced |
| **Limits** | 1 run per day | 2 runs + 3 retries per day |
| **Fee** | 25 PROOF | 5 PROOF |
| **Session Field** | `utc_date` | `week_id` + `expires_at_unix` |

## User Flow

```
1. User visits /weekly-blitz
   ↓
2. Views current week info, their stats, leaderboard
   ↓
3. Clicks "Start Official Run" (if runs remaining)
   ↓
4. Navigates to /play?mode=weekly-blitz
   ↓
5. Frontend calls startWeeklyBlitzSession()
   ↓
6. Backend validates:
   - Player has 5 PROOF
   - Daily limit not exceeded (officialRunsUsed < 2)
   ↓
7. Backend creates session with:
   - weekId (calculated from current time)
   - expiresAtUnix (currentUnix + 300)
   - seed (derived from weekId)
   ↓
8. Contract splits 5 PROOF:
   - 3.0 PROOF → Weekly Pool
   - 1.0 PROOF → Shop
   - 0.75 PROOF → Reserve
   - 0.25 PROOF → Platform
   ↓
9. Play2048 displays:
   - Game board with seed
   - Timer countdown (5:00)
   ↓
10. User plays, makes moves
   ↓
11a. Timer expires → Auto-submit with "timer_expired"
11b. User finishes → Manual submit with "player_stopped"
   ↓
12. Contract updates:
    - cumulativeScore += finalScore
    - bestSingleScore = max(best, finalScore)
    - runCount++
    - Leaderboard entry
   ↓
13. User returns to /weekly-blitz
    - See updated cumulative score
    - See updated leaderboard rank
```

## Frontend Requirements

### Components Needed

1. **WeeklyBlitzTimer.tsx**
   - Props: `expiresAtUnix`, `onExpire`
   - Display: MM:SS countdown
   - States: Normal (blue), Warning (≤30s, yellow), Critical (≤10s, red)
   - Update: Every 100ms

2. **DailyLimitsDisplay.tsx**
   - Shows: Official Runs (2/2) + Retries (3/3)
   - Colors: Gold for official, Blue for retries
   - Disable "Start" button when no runs left

3. **WeeklyBlitzLeaderboard.tsx**
   - Displays: Rank, Player, Cumulative Score, Run Count
   - Highlights: Current player
   - Rank colors: Gold (1st), Silver (2nd), Bronze (3rd)

4. **WeeklyBlitzStats.tsx**
   - Shows: Cumulative score, Best single, Run count

5. **WeeklyBlitz.tsx** (Page)
   - Main page at `/weekly-blitz`
   - Integrates all components above

### API Endpoints Needed

**Queries:**
```typescript
GET  /v1/query/2048/weekly-blitz/current
GET  /v1/query/2048/weekly-blitz/:weekId
GET  /v1/query/2048/weekly-blitz/:weekId/leaderboard
POST /v1/query/2048/weekly-blitz/player/:address/status
```

**Transactions:**
```typescript
POST /v1/admin/tx-2048-start-weekly-blitz
POST /v1/admin/tx-2048-submit  (existing, mode-aware)
POST /v1/admin/tx-2048-claim-weekly-blitz-reward  (V2)
```

## Error Handling

### Contract Errors

```typescript
ErrWeeklyBlitzNoOfficialRunsRemaining()
→ "no official runs remaining today"

ErrWeeklyBlitzSessionExpired()
→ "session expired"

ErrWeeklyBlitzRewardNotFound()
→ "reward not found"

ErrWeeklyBlitzRewardAlreadyClaimed()
→ "reward already claimed"

ErrWeeklyBlitzWeekNotFinalized()
→ "week not finalized"
```

### Frontend Error Messages

- **Insufficient balance**: "You need 5 PROOF to play Weekly Blitz"
- **Daily limit**: "You've used all 2 Official Runs today. Come back tomorrow at 00:00 UTC!"
- **Timer expired**: "Time's up! Submitting your score..."
- **Network error**: "Failed to start game. Please try again."

## Testing Checklist

### Unit Tests
- [ ] Week ID calculation
- [ ] Week start/end timestamps
- [ ] State key generation
- [ ] Fee split calculation
- [ ] Timer countdown logic

### Integration Tests
- [ ] Start Weekly Blitz session
- [ ] Timer expiration
- [ ] Submit game result
- [ ] Cumulative score update
- [ ] Leaderboard update
- [ ] Daily limit enforcement

### Manual Tests
- [ ] Play full 5-minute game
- [ ] Let timer expire
- [ ] Submit before timer
- [ ] Play 2 official runs in same day
- [ ] Try 3rd official run (should fail)
- [ ] Check cumulative score adds correctly
- [ ] Verify fee deduction (5 PROOF)
- [ ] Check leaderboard ranking
- [ ] Test across UTC midnight boundary

## Success Criteria

✅ **Must Have (V1):**
1. Game starts with 5 PROOF fee deducted
2. Timer counts down from 5:00 to 0:00
3. Game auto-submits when timer expires
4. Daily limits enforced (2 official runs)
5. Cumulative score updates correctly
6. Leaderboard ranks by cumulative score
7. Fee split works (60/20/15/5)
8. Week rollover works (Monday 00:00 UTC)

🎯 **Nice to Have (V2):**
1. Reward claiming mechanism
2. Week finalization logic
3. Admin tools for pool management
4. Historical week browsing
5. Animated timer warnings
6. Sound effects
7. Mobile optimization

## Open Questions

None - requirements are clear and based on Daily Challenge proven pattern.

## Next Steps

1. ✅ **Review Requirements** (this document)
2. ⏳ **Test Daily Challenge** - Verify the working pattern
3. ⏳ **Implement Weekly Blitz** - Follow the guide step-by-step
4. ⏳ **Test Weekly Blitz** - End-to-end verification
5. ⏳ **Deploy** - Push to production

---

**Review Date:** July 22, 2026  
**Reviewed By:** Team  
**Status:** ✅ Requirements Confirmed - Ready to Test Daily Challenge

