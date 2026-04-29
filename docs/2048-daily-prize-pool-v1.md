# 2048 Daily Prize Pool V1

## Goal

Turn the daily challenge into a real paid competition:

- each daily entry fee is split between platform treasury and that day's prize pool
- the prize pool is finalized after the UTC day ends
- top 10 daily leaderboard players receive claimable rewards
- winners claim rewards later with an on-chain transaction

This is a V1 spec only. It is intentionally simple and avoids auto-payouts, rollover complexity, and off-chain accounting.

## Confirmed Product Rules

- Daily challenge fee:
  - `5%` platform fee
  - `95%` daily reward pool
- Finalization:
  - rewards become claimable only after the UTC day ends
- Ranking / ties:
  1. higher score
  2. higher max tile
  3. fewer moves
  4. earlier submission
- Claims:
  - rewards are claimable, not auto-paid
- Treasury:
  - platform fee goes to platform treasury
- Short boards:
  - if fewer than 10 players join, only existing ranks are paid
  - leftover undistributed reward stays in treasury

## Proposed Reward Split

Pool split for the top 10:

- `1st`: `30%`
- `2nd`: `20%`
- `3rd`: `12%`
- `4th`: `9%`
- `5th`: `7%`
- `6th`: `6%`
- `7th`: `5%`
- `8th`: `4%`
- `9th`: `4%`
- `10th`: `3%`

This totals `100%` of the distributable daily prize pool.

## Contract-Level Design

### New Concepts

V1 introduces four new on-chain concepts:

1. daily prize pool accounting by UTC day
2. finalized reward allocations by UTC day + rank
3. per-player claim tracking
4. treasury accrual for platform fees and undistributed leftovers

### Existing State Reused

The current contract already has:

- `GameSession`
- `DailyAttempt`
- `LeaderboardEntry`
- `PlayerStats`
- `GameConfig`

Daily finalization should reuse the existing daily leaderboard entries for winner selection.

## Proto Additions

### 1. `GameConfig`

Add:

- `bytes platform_treasury_address`
- `uint64 daily_platform_fee_bps`
- `repeated uint64 daily_payout_bps`

Notes:

- `daily_platform_fee_bps` should default to `500`
- `daily_payout_bps` should contain:
  - `[3000, 2000, 1200, 900, 700, 600, 500, 400, 400, 300]`
- payout basis points are applied to the distributable pool, not total fees

### 2. `DailyPrizePool`

```proto
message DailyPrizePool {
  string utc_date = 1; // @gotags: json:"utcDate"
  uint64 entry_count = 2; // @gotags: json:"entryCount"
  uint64 gross_fees = 3; // @gotags: json:"grossFees"
  uint64 treasury_fees = 4; // @gotags: json:"treasuryFees"
  uint64 reward_pool = 5; // @gotags: json:"rewardPool"
  bool finalized = 6;
  uint64 finalized_at_unix = 7; // @gotags: json:"finalizedAtUnix"
  uint64 distributed_rewards = 8; // @gotags: json:"distributedRewards"
  uint64 treasury_leftover = 9; // @gotags: json:"treasuryLeftover"
}
```

Purpose:

- accumulates one UTC day's daily-fee accounting
- records whether winner allocation is already finalized

### 3. `DailyRewardAllocation`

```proto
message DailyRewardAllocation {
  string utc_date = 1; // @gotags: json:"utcDate"
  bytes player_address = 2; // @gotags: json:"playerAddress"
  bytes game_id = 3; // @gotags: json:"gameId"
  uint64 rank = 4;
  uint64 reward_amount = 5; // @gotags: json:"rewardAmount"
  uint64 score = 6;
  uint64 max_tile = 7; // @gotags: json:"maxTile"
  uint64 move_count = 8; // @gotags: json:"moveCount"
  uint64 ended_at_unix = 9; // @gotags: json:"endedAtUnix"
}
```

Purpose:

- stores the final reward record for each winner
- immutable once written

### 4. `DailyRewardClaim`

```proto
message DailyRewardClaim {
  string utc_date = 1; // @gotags: json:"utcDate"
  bytes player_address = 2; // @gotags: json:"playerAddress"
  bytes game_id = 3; // @gotags: json:"gameId"
  uint64 rank = 4;
  uint64 claimed_amount = 5; // @gotags: json:"claimedAmount"
  uint64 claimed_at_unix = 6; // @gotags: json:"claimedAtUnix"
}
```

Purpose:

- prevents duplicate claims
- records when and how much was claimed

### 5. `MessageClaimDailyReward`

```proto
message MessageClaimDailyReward {
  bytes player_address = 1; // @gotags: json:"playerAddress"
  string utc_date = 2; // @gotags: json:"utcDate"
}
```

V1 claim behavior:

- one claim tx per day per address
- if the player is not a winner, reject
- if already claimed, reject

## State Keys

Current 2048 state lives under `gamePrefix = [18]`.

Suggested additions:

### Pool state

- `KeyForDailyPrizePool(utcDate)`
  - `JoinLenPrefix(gamePrefix, 'daily-pool', utcDate)`

### Allocation state

- `KeyForDailyRewardAllocation(utcDate, rank, gameId)`
  - `JoinLenPrefix(gamePrefix, 'daily-reward', utcDate, rank, gameId)`

### Claim state

- `KeyForDailyRewardClaim(utcDate, playerAddress)`
  - `JoinLenPrefix(gamePrefix, 'daily-claim', utcDate, playerAddress)`

### Optional address index for reward lookup

- `KeyForDailyRewardByPlayer(utcDate, playerAddress, rank, gameId)`
  - `JoinLenPrefix(gamePrefix, 'daily-reward-player', utcDate, playerAddress, rank, gameId)`

This player index is not strictly required, but it makes profile/reward queries much simpler.

## Deliver Flow Changes

### A. `DeliverMessageStartDailyGame`

Current behavior:

- deduct whole daily fee from player
- add whole fee to current fee pool

V1 behavior:

1. deduct the full daily fee from the player as before
2. split daily fee:
   - `treasuryCut = fee * daily_platform_fee_bps / 10000`
   - `rewardCut = fee - treasuryCut`
3. add:
   - `treasuryCut` to platform treasury account
   - `rewardCut` to `DailyPrizePool.rewardPool`
4. increment:
   - `entryCount`
   - `grossFees`
   - `treasuryFees`
5. still create:
   - `GameSession`
   - `DailyAttempt`
   - updated `PlayerStats`

Important:

- this should **not** use the generic fee pool for the daily reward portion anymore
- V1 should route platform fee directly to the treasury account

### B. `DeliverMessageSubmitGameResult`

Current daily submit behavior:

- writes daily leaderboard entry

V1 additions:

- keep current leaderboard write behavior
- no reward allocation happens here yet
- finalization remains separate so it can happen after the day ends

### C. `DeliverMessageClaimDailyReward`

Flow:

1. load `DailyPrizePool`
2. verify:
   - pool exists
   - day is already over
3. if pool is not finalized:
   - finalize it first
4. load player allocation for that `utcDate`
5. verify:
   - allocation exists
   - no `DailyRewardClaim` exists yet
6. transfer `rewardAmount` from treasury account to player account
7. write `DailyRewardClaim`

## Finalization Rules

### Finalization Trigger

V1 should use **lazy finalization**.

That means:

- no automatic cron-like payout logic is required
- the first `claim` or reward query after the UTC day ends can finalize the day

This is much simpler than trying to run a daily settlement loop in `BeginBlock`.

### Finalization Inputs

To finalize `utcDate = D`:

1. read `DailyPrizePool(D)`
2. read top daily leaderboard entries for `D`
3. compute winners up to 10 entries
4. compute payout amounts from `rewardPool`
5. write `DailyRewardAllocation` rows
6. compute leftover:
   - if less than 10 players participated
   - or integer division leaves dust
7. move leftover into:
   - `treasuryLeftover`
   - and the treasury account balance
8. mark pool as finalized

### Tie Resolution

Current leaderboard key only sorts by:

- UTC day
- score desc
- gameId

That is not enough for the desired tie-break rules.

V1 should update the daily leaderboard key shape to:

- UTC date
- inverted score
- inverted max tile
- move count asc
- endedAtUnix asc
- gameId

Suggested key:

- `KeyForDailyLeaderboard(utcDate, score, maxTile, moveCount, endedAtUnix, gameId)`

This lets ordered reads naturally produce the correct final ranking.

Classic leaderboard can stay unchanged for V1.

## Treasury Model

### Treasury Address

GameConfig should define:

- `platformTreasuryAddress`

If missing, contract should reject daily starts until configured, because we do not want silent mis-routing of fees.

### Treasury Funds

Treasury receives:

- daily platform fee (`5%`)
- leftover undistributed daily reward amount

Treasury pays:

- claimed daily rewards

V1 uses the treasury account as the payout source for simplicity.

## Query Endpoints

### 1. Daily pool by UTC date

`GET /v1/query/2048/daily-pool?utcDate=YYYY-MM-DD`

Response:

- `utcDate`
- `entryCount`
- `grossFees`
- `treasuryFees`
- `rewardPool`
- `finalized`
- `finalizedAtUnix`
- `distributedRewards`
- `treasuryLeftover`

### 2. Claimable rewards by address

`POST /v1/query/2048/claimable-rewards`

Request:

```json
{ "address": "<hex-address>" }
```

Response:

- list of unclaimed `DailyRewardAllocation`
- claimed flag if already claimed
- total claimable amount

### 3. Daily rewards by UTC date

`GET /v1/query/2048/daily-rewards?utcDate=YYYY-MM-DD`

Response:

- finalized winners and payout amounts for that day

### 4. Profile rewards summary

`POST /v1/query/2048/player-rewards`

Request:

```json
{ "address": "<hex-address>" }
```

Response:

- unclaimed reward count
- total unclaimed amount
- recent claimed rewards

## Transaction Endpoints

### Claim reward

`POST /v1/admin/tx-2048-claim-daily-reward`

Request:

```json
{
  "address": "<hex-address>",
  "password": "<wallet-password>",
  "utcDate": "YYYY-MM-DD",
  "submit": true
}
```

Response:

- `txHash`
- `submitted`
- reward metadata if helpful

## Error Cases

Add contract errors for:

- `daily reward day not finalized yet`
- `daily reward not found`
- `daily reward already claimed`
- `platform treasury address not configured`
- `daily prize pool not found`
- `daily reward finalization failed`

## Frontend Impact

### `/play`

Daily mode can later show:

- current day entry count
- current day estimated prize pool
- top 10 payout model link

### `/profile`

Add later:

- `Claimable Rewards` card
- claim button
- recent reward history

## V1 Implementation Order

1. update proto
   - add config fields
   - add pool / allocation / claim messages
   - add claim tx message
2. update contract key layout
   - add new state keys
   - improve daily leaderboard key for tie-breaking
3. update daily start delivery
   - split fee into treasury + reward pool
4. add lazy finalization helper
   - read winners
   - compute payouts
   - write allocations
5. add claim tx
6. add query routes
7. add frontend reward/profile UI

## Explicit Non-Goals For V1

Not included yet:

- automatic daily settlement payouts
- rollover pools
- seasonal ranking
- partial claims
- platform fee sharing
- multi-token reward baskets
- off-chain treasury accounting

## Recommendation

Implement V1 exactly as above, then only after it is stable:

- daily login rewards
- classic points redemption
- shop
- crates

The daily prize pool should become the first real economic loop before more reward systems are layered on top.
