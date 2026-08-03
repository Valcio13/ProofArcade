# ProofArcade Reward Systems

**Last Updated**: August 3, 2026  
**Version**: 2.0

---

## Overview

ProofArcade features three competitive reward systems where players can compete and claim token rewards:

1. **Daily Challenge** - Top 10 daily winners share the daily prize pool
2. **Monthly Competition** - Top 20% of monthly players share the monthly prize pool
3. **Weekly Blitz** - Top 30% of weekly players share the weekly prize pool

All reward systems use **on-chain prize pools** funded by entry fees and feature **claimable rewards** with one-time claim enforcement.

---

## Competition Comparison

| Feature | Daily Challenge | Monthly Competition | Weekly Blitz |
|---------|----------------|---------------------|--------------|
| **Entry Fee** | 25 PROOF | 2 PROOF (Classic) | 5 PROOF |
| **Duration** | 1 day | ~30 days | 7 days |
| **Plays per Period** | 1 | Unlimited | 14 (2/day × 7) |
| **Timer** | None | None | 3 minutes |
| **Scoring** | Single game | Cumulative monthly | Cumulative weekly |
| **Pool ID** | 131075 | 131076 | 131077 |
| **Pool Share** | 80% of fees | 15% of Classic fees | 60% of fees |
| **Min Participants** | 1 | 50 | 20 |
| **Winner %** | Top 10 fixed | Top 20% | Top 30% |
| **Max Winners** | 10 | 100 | 50 |
| **Reset** | Daily 00:00 UTC | 1st of month | Monday 00:00 UTC |
| **Claim Status** | ✅ Implemented | ✅ Implemented | ✅ Implemented |

---

## Pool IDs

ProofArcade uses dedicated prize pool IDs for each competition:

| Pool Name | Pool ID | Purpose | Funding Source |
|-----------|---------|---------|----------------|
| **Daily Pool** | 131075 | Daily Challenge rewards | 80% of Daily entry fees (20 PROOF) |
| **Monthly Pool** | 131076 | Monthly Competition rewards | 15% of Classic entry fees (0.3 PROOF) |
| **Weekly Pool** | 131077 | Weekly Blitz rewards | 60% of Weekly entry fees (3.0 PROOF) |
| Shop Pool | 131074 | Shop redemption funding | 45% of Classic + 20% of Weekly |
| Reserve Pool | 131073 | Safety buffer | 20% of Classic + 15% of Weekly |
| Platform Pool | 131072 | Protocol revenue | 5% of all fees |

---

## Monthly Competition Rewards

### Overview

Monthly Competition rewards are distributed to the top 20% of players who compete in Classic mode throughout the month. Each Classic game (2 PROOF) contributes 0.3 PROOF (15%) to the monthly prize pool.

### Eligibility

- **Mode**: Play Classic mode games
- **Minimum Participants**: 50 players required for rewards to activate
- **Winner Percentage**: Top 20%
- **Min Winners**: 50 (if threshold met)
- **Max Winners**: 100
- **Qualifying**: Cumulative score from all Classic games in the month

### Tier System

Monthly rewards use a **three-tier distribution**:

#### Elite Tier
- **Ranks**: Top 2% of winners
- **Pool Share**: 50%
- **Distribution**: Exponential (heavily favors #1)
- **Formula**: `EliteAmount × (EliteCount - rank + 1)² / sumOfSquares`

#### Champion Tier
- **Ranks**: Next 8% of winners
- **Pool Share**: 30%
- **Distribution**: Linear decline
- **Formula**: `ChampionAmount × (tierSize - tierRank) / linearSum`

#### Challenger Tier
- **Ranks**: Next 10% of winners
- **Pool Share**: 20%
- **Distribution**: Equal split
- **Formula**: `ChallengerAmount / tierSize`

### Example Distribution

**Scenario**: 100 participants, 1000 PROOF monthly pool

| Tier | Ranks | Winners | Pool Share | Distribution |
|------|-------|---------|------------|--------------|
| **Elite** | 1-2 | 2 | 500 PROOF | #1: ~287 PROOF, #2: ~213 PROOF |
| **Champion** | 3-10 | 8 | 300 PROOF | #3: 66 PROOF declining to #10: 24 PROOF |
| **Challenger** | 11-20 | 10 | 200 PROOF | 20 PROOF each |

### Claiming Process

1. **Month Ends**: Rankings freeze at 00:00 UTC on 1st of next month
2. **Check Eligibility**: Visit [/leaderboard?mode=monthly](/leaderboard?mode=monthly)
3. **Claim Button**: Appears if you finished in top 50 previous month
4. **Submit Claim**: Click "Claim Reward" button
5. **Confirm Transaction**: Sign transaction with wallet password
6. **Receive Rewards**: Tokens transfer from Pool 131076 to your wallet
7. **View Transaction**: Transaction hash displayed on success

### RPC Endpoint

```
POST /v1/admin/tx-2048-claim-monthly-reward

Request:
{
  "address": "player_address_hex",
  "password": "wallet_password",
  "monthId": "2026-07",
  "submit": true
}

Response:
{
  "txHash": "transaction_hash",
  "monthId": "2026-07",
  "submitted": true
}
```

### Proto Message

```protobuf
message MessageClaimMonthlyReward {
  bytes player_address = 1;
  string month_id = 2;  // Format: "YYYY-MM"
}
```

---

## Weekly Blitz Rewards

### Overview

Weekly Blitz rewards are distributed to the top 30% of players who compete in the fast-paced 3-minute timed mode. Each game (5 PROOF) contributes 3.0 PROOF (60%) to the weekly prize pool.

### Eligibility

- **Mode**: Play Weekly Blitz mode (3-minute timed games)
- **Minimum Participants**: 20 players required for rewards to activate
- **Winner Percentage**: Top 30%
- **Min Winners**: 5
- **Max Winners**: 50
- **Daily Limit**: 2 runs per UTC day
- **Qualifying**: Cumulative score from all games Monday-Sunday UTC

### Week Calculation

Weeks run from **Monday 00:00 UTC** to **Sunday 23:59 UTC**.

```typescript
const WEEK_SECONDS = 7 * 24 * 60 * 60;  // 604800 seconds
const EPOCH_OFFSET = 4 * 24 * 60 * 60;   // Thursday offset for Monday start

weekId = Math.floor((currentUnix - EPOCH_OFFSET) / WEEK_SECONDS)
```

**Example**: Week 2700 = July 28 - August 3, 2026

### Tier System

Weekly Blitz rewards use a **three-tier distribution**:

#### Elite Tier
- **Ranks**: Top 5% of winners
- **Pool Share**: 40%
- **Distribution**: Exponential (heavily favors #1)
- **Formula**: `EliteAmount × (EliteCount - rank + 1)² / sumOfSquares`

#### Champion Tier
- **Ranks**: Next 10% of winners
- **Pool Share**: 35%
- **Distribution**: Linear decline
- **Formula**: `ChampionAmount × (tierSize - tierRank) / linearSum`

#### Challenger Tier
- **Ranks**: Next 15% of winners
- **Pool Share**: 25%
- **Distribution**: Equal split
- **Formula**: `ChallengerAmount / tierSize`

### Example Distribution

**Scenario**: 100 participants, 1000 PROOF weekly pool, 30 winners

| Tier | Ranks | Winners | Pool Share | Distribution |
|------|-------|---------|------------|--------------|
| **Elite** | 1-5 | 5 | 400 PROOF | #1: ~182 PROOF, declining exponentially |
| **Champion** | 6-15 | 10 | 350 PROOF | #6: ~63 PROOF declining to #15 |
| **Challenger** | 16-30 | 15 | 250 PROOF | ~16.67 PROOF each |

### Claiming Process

1. **Week Ends**: Rankings freeze at Sunday 23:59 UTC
2. **Check Eligibility**: Visit [/leaderboard?mode=weekly-blitz](/leaderboard?mode=weekly-blitz)
3. **Claim Button**: Appears if you finished in top 30% previous week
4. **View Details**: Shows your rank, week date range (e.g., "Jul 28 - Aug 3")
5. **Submit Claim**: Click "Claim Reward" button
6. **Confirm Transaction**: Sign transaction with wallet password
7. **Receive Rewards**: Tokens transfer from Pool 131077 to your wallet
8. **View Transaction**: Transaction hash displayed on success

### RPC Endpoint

```
POST /v1/admin/tx-2048-claim-weekly-blitz-reward

Request:
{
  "address": "player_address_hex",
  "password": "wallet_password",
  "weekId": 2700,
  "submit": true
}

Response:
{
  "txHash": "transaction_hash",
  "weekId": 2700,
  "submitted": true
}
```

### Proto Message

```protobuf
message MessageClaimWeeklyBlitzReward {
  bytes player_address = 1;
  uint64 week_id = 2;
}
```

---

## Daily Challenge Rewards

### Overview

Daily Challenge rewards are distributed to the top 10 players each day. Each entry (25 PROOF) contributes 20 PROOF (80%) to the daily prize pool.

### Eligibility

- **Mode**: Play Daily Challenge mode
- **Minimum Participants**: 1 player (scales dynamically)
- **Winners**: Top 10 players
- **Daily Limit**: 1 run per UTC day
- **Qualifying**: Single best score for that UTC day

### Distribution

Daily rewards use a **fixed 10-place payout table** that scales dynamically:

| Rank | % of Pool | Example (1000 PROOF) |
|------|-----------|---------------------|
| 1st | 30% | 300 PROOF |
| 2nd | 20% | 200 PROOF |
| 3rd | 15% | 150 PROOF |
| 4th | 10% | 100 PROOF |
| 5th | 8% | 80 PROOF |
| 6th | 6% | 60 PROOF |
| 7th | 4% | 40 PROOF |
| 8th | 3% | 30 PROOF |
| 9th | 2% | 20 PROOF |
| 10th | 2% | 20 PROOF |

**Dynamic Scaling**: If fewer than 10 players compete, rewards are recalculated proportionally:
- 3 players: Top 3 split pool based on their relative weights
- 1 player: Winner receives full daily pool

### Claiming Process

Daily Challenge rewards are **automatically claimable** after the UTC day ends. The specific claiming mechanism follows the same pattern as Monthly and Weekly systems.

---

## Reward Engine

All reward calculations use a unified **Reward Engine** that handles:

1. **Participant Validation**: Checks minimum participant threshold
2. **Winner Calculation**: Determines winners based on percentage and limits
3. **Tier Distribution**: Allocates pool to Elite/Champion/Challenger tiers
4. **Individual Rewards**: Calculates exact reward for each winner
5. **Fallback Logic**: Uses DAO pool if competition pool insufficient

### Configuration

Each competition has a config object:

```typescript
interface RewardConfig {
  minParticipants: number;      // Minimum players required
  winnerPercentage: number;     // % of participants who win (0-100)
  minWinners: number;           // Minimum winners (if threshold met)
  maxWinners: number;           // Maximum winners
  elitePct: number;             // Elite tier size (% of winners)
  championPct: number;          // Champion tier size (% of winners)
  challengerPct: number;        // Challenger tier size (% of winners)
  elitePoolShare: number;       // Elite tier pool allocation (0-1)
  championPoolShare: number;    // Champion tier pool allocation (0-1)
  challengerPoolShare: number;  // Challenger tier pool allocation (0-1)
}
```

**Monthly Configuration**:
```typescript
{
  minParticipants: 50,
  winnerPercentage: 20,
  minWinners: 50,
  maxWinners: 100,
  elitePct: 2, championPct: 8, challengerPct: 10,
  elitePoolShare: 0.5, championPoolShare: 0.3, challengerPoolShare: 0.2
}
```

**Weekly Configuration**:
```typescript
{
  minParticipants: 20,
  winnerPercentage: 30,
  minWinners: 5,
  maxWinners: 50,
  elitePct: 5, championPct: 10, challengerPct: 15,
  elitePoolShare: 0.4, championPoolShare: 0.35, challengerPoolShare: 0.25
}
```

---

## Money Flow

### Classic to Monthly Pool

```
Player pays 2 PROOF for Classic game
    ↓
Fee Split:
    70% (1.4 PROOF) → Validator rewards
    15% (0.3 PROOF) → Monthly Pool 131076 ← Prize Pool
    15% (0.3 PROOF) → Daily Pool 131075
    ↓
Month ends
    ↓
Reward engine calculates distributions
    ↓
Player claims
    ↓
Transfer: Monthly Pool 131076 → Player Wallet
```

### Weekly Blitz to Weekly Pool

```
Player pays 5 PROOF for Weekly Blitz game
    ↓
Fee Split:
    60% (3.0 PROOF) → Weekly Pool 131077 ← Prize Pool
    20% (1.0 PROOF) → Shop Pool 131074
    15% (0.75 PROOF) → Reserve Pool 131073
    5% (0.25 PROOF) → Platform Pool 131072
    ↓
Week ends (Sunday 23:59 UTC)
    ↓
Reward engine calculates distributions
    ↓
Player claims (Monday onward)
    ↓
Transfer: Weekly Pool 131077 → Player Wallet
```

### Daily Challenge to Daily Pool

```
Player pays 25 PROOF for Daily Challenge
    ↓
Fee Split:
    80% (20 PROOF) → Daily Pool 131075 ← Prize Pool
    10% (2.5 PROOF) → Shop Pool 131074
    5% (1.25 PROOF) → Reserve Pool 131073
    5% (1.25 PROOF) → Platform Pool 131072
    ↓
Day ends (00:00 UTC)
    ↓
Top 10 finishers determined
    ↓
Player claims
    ↓
Transfer: Daily Pool 131075 → Player Wallet
```

---

## Anti-Fraud Measures

All reward systems include built-in fraud prevention:

### One-Time Claims
- Each reward can only be claimed once per player per period
- Duplicate claim attempts are rejected on-chain
- Claim records stored in state: `KeyForMonthlyRewardClaim`, `KeyForWeeklyBlitzRewardClaim`

### Eligibility Validation
- Player must have participated in competition
- Player must be ranked within winner threshold
- Period must have ended (can't claim current month/week)
- Minimum participant threshold must be met

### Pool Verification
- Checks prize pool has sufficient balance
- Falls back to DAO pool if competition pool insufficient
- Prevents claiming more than pool balance

### Replay Verification
- All game scores verified through deterministic replay
- Move lists validated before updating leaderboards
- Session ownership verified on submission

---

## User Experience

### Finding Your Eligibility

1. **Go to Leaderboards**: Visit `/leaderboard`
2. **Select Mode**: Click the tab for your competition (Daily/Monthly/Weekly Blitz)
3. **Check Status**: If you're eligible, you'll see a claim section above the leaderboard

### Claim UI States

**Before Claiming**:
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Last Week: Rank #8               [Claim Reward] │
│                                                     │
│ You finished Week 2699 (Jul 21 - Jul 27) in the   │
│ top 30%. Claim your reward!                        │
└─────────────────────────────────────────────────────┘
```

**During Claim (Loading)**:
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Last Week: Rank #8            [Claiming... ⏳]  │
│                                                     │
│ You finished Week 2699 (Jul 21 - Jul 27) in the   │
│ top 30%. Claim your reward!                        │
└─────────────────────────────────────────────────────┘
```

**After Claiming (Success)**:
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Last Week: Rank #8                 [✓ Claimed]  │
│                                                     │
│ You finished Week 2699 (Jul 21 - Jul 27) in the   │
│ top 30%. Claim your reward!                        │
│                                                     │
│ ✓ Transaction: 3a5f8b92a4f7...4c2e1d7f            │
└─────────────────────────────────────────────────────┘
```

### Error Handling

**Common Errors**:
- `reward already claimed` - You've already claimed this reward
- `reward not found` - No reward allocation found for your address
- `insufficient pool balance` - Prize pool doesn't have enough tokens
- `week/month not finalized` - Competition period hasn't ended yet
- `minimum participants not met` - Not enough players to activate rewards

**Frontend Feedback**:
- Toast notifications for success/error
- Transaction hash links for verification
- Clear error messages with explanations
- Disabled buttons when ineligible

---

## Testing Your Claims

### On Testnet

1. **Complete Competition**: Play and finish in winning rank
2. **Wait for Period End**: Let day/week/month complete
3. **Check Leaderboard**: Verify your rank shows correctly
4. **Attempt Claim**: Click claim button
5. **Verify Transaction**: Check transaction confirms on chain
6. **Check Balance**: Verify tokens arrived in wallet
7. **Attempt Duplicate**: Try claiming again (should fail)

### Integration Tests

Key test scenarios:
- Claim with valid eligibility
- Reject duplicate claims
- Reject claims for non-participants
- Reject claims before period ends
- Handle insufficient pool balance
- Calculate correct reward amounts
- Distribute across all three tiers
- Scale with different participant counts

---

## Implementation Files

### Reward Engine
- `plugin/typescript/src/contract/competition/reward-engine.ts` - Core calculation logic

### Plugin (Contract)
- `plugin/typescript/src/contract/contract.ts` - Claim handlers
- `plugin/typescript/src/contract/utils/state.ts` - State keys
- `plugin/typescript/src/contract/error.ts` - Error types
- `plugin/typescript/src/contract/validation/message-checks.ts` - Validation
- `plugin/typescript/proto/game2048.proto` - Proto messages

### Backend
- `cmd/rpc/game2048.go` - RPC handlers and transaction builders
- `cmd/rpc/routes.go` - Route registration

### Frontend
- `cmd/rpc/web/explorer/src/pages/Leaderboard.tsx` - Claim UI
- `cmd/rpc/web/explorer/src/lib/chain2048.ts` - TypeScript interfaces
- `cmd/rpc/web/explorer/src/lib/rpcChain2048.ts` - RPC client implementation

---

## Related Documentation

- [2048-daily-prize-pool-v1.md](2048-daily-prize-pool-v1.md) - Daily Challenge specification
- [2048-monthly-competition-v1.md](2048-monthly-competition-v1.md) - Monthly Competition specification
- [weekly-blitz-requirements.md](weekly-blitz-requirements.md) - Weekly Blitz specification
- [2048-treasury-v1.md](2048-treasury-v1.md) - Treasury and pool system
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview

---

## FAQ

### How do I know if I'm eligible for rewards?

Visit the leaderboard page for your competition mode. If you finished in the winning ranks, a claim section will appear showing your rank and a claim button.

### When can I claim my rewards?

- **Daily**: After the UTC day ends (00:00 UTC next day)
- **Monthly**: After the month ends (1st of next month, 00:00 UTC)
- **Weekly**: After the week ends (Monday 00:00 UTC)

### What if I forget to claim?

Rewards don't expire! You can claim any time after the period ends. There's no deadline.

### Can I claim rewards from multiple periods?

Yes! Each period (day/month/week) has separate claim logic. You can claim from as many periods as you qualify for.

### What happens if not enough players compete?

If minimum participants aren't met:
- **Monthly** (50 min): No rewards distributed, pool rolls over
- **Weekly** (20 min): No rewards distributed, pool rolls over
- **Daily** (1 min): Rewards distributed to actual participants

### What if the prize pool runs out?

The claim handler checks pool balance and falls back to the DAO pool if needed. Your claim will never fail due to insufficient funds.

### How are ties handled?

Ties are broken by:
1. Higher max tile achieved
2. Fewer moves used
3. Earlier submission timestamp

### Can someone claim my rewards?

No. Rewards are tied to your wallet address. Only you can claim rewards for your address, and you must sign the transaction with your wallet password.

---

**Status**: ✅ All reward systems implemented and production-ready  
**Last Updated**: August 3, 2026  
**Questions?** See individual competition docs or contact the team.
