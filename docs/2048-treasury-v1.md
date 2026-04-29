# 2048 Treasury V1

## Goal

Replace the current implicit fee-pool behavior with an explicit 2048 treasury model that:

- tracks where entry fees go
- separates competitive rewards from redemption funding
- keeps a reserve buffer
- preserves a clear platform-fee share

This treasury model is intended to support:

- `Daily` prize payouts
- `Classic` point redemption payouts
- future shop growth
- safer accounting and balancing

## Confirmed Fee Split

### Daily Challenge fee split

For every successful `daily` entry fee:

- `5%` -> `platform`
- `80%` -> `daily`
- `10%` -> `reserve`
- `5%` -> `shop`

Conceptually:

```ts
function handleDailyEntryFee(fee: number) {
  treasury.platform += fee * 0.05;
  treasury.daily += fee * 0.80;
  treasury.reserve += fee * 0.10;
  treasury.shop += fee * 0.05;
}
```

### Classic fee split

For every successful `classic` entry fee:

- `5%` -> `platform`
- `45%` -> `reserve`
- `50%` -> `shop`

Conceptually:

```ts
function handleClassicEntryFee(fee: number) {
  treasury.platform += fee * 0.05;
  treasury.reserve += fee * 0.45;
  treasury.shop += fee * 0.50;
}
```

## Product Meaning of Each Bucket

### 1. `platform`

Purpose:

- protocol/platform revenue
- not used for daily player rewards
- not used for point redemption in V1

Properties:

- global balance
- cumulative over time

### 2. `daily`

Purpose:

- prize-pool funding for daily challenge winners

Properties:

- day-scoped
- only receives funds from `daily` entries
- only used for daily winner claims

### 3. `reserve`

Purpose:

- long-term safety buffer
- future balancing room
- emergency liquidity backstop if governance/admin rules are added later

Properties:

- global balance
- cumulative over time
- not spent by default in V1

### 4. `shop`

Purpose:

- funds classic-point redemptions into `CNPY`

Properties:

- global balance
- receives funds from both `daily` and `classic`
- spent only on successful point redemption payouts in V1

## Mode Separation

This treasury model intentionally makes the two game modes fund different systems:

- `Daily` funds competitive rewards first
- `Classic` funds progression redemption first

That means:

- daily is the high-stakes competition lane
- classic is the farming / progression lane

This is the intended economy shape for V1.

## Scope

Treasury V1 should:

- add explicit bucketed treasury accounting
- route entry fees by mode into the correct buckets
- pay daily claims from the `daily` bucket
- pay shop redemptions from the `shop` bucket
- expose treasury balances through queries

Treasury V1 should not yet include:

- governance over treasury usage
- reserve spending policy
- auto-rebalancing between buckets
- admin transfer tools between buckets
- multiple external treasury wallets

## State Model

## Existing state that should change meaning

Current daily/shop features should stop relying on one generic shared fee pool as the primary semantic source of truth.

Instead:

- daily claims should be backed by the `daily` treasury bucket
- point redemption should be backed by the `shop` treasury bucket

## New on-chain state

### 1. `GameTreasury`

Global cumulative treasury balances:

```proto
message GameTreasury {
  uint64 platform_balance = 1; // @gotags: json:"platformBalance"
  uint64 reserve_balance = 2; // @gotags: json:"reserveBalance"
  uint64 shop_balance = 3; // @gotags: json:"shopBalance"
  uint64 updated_at_unix = 4; // @gotags: json:"updatedAtUnix"
}
```

Purpose:

- single global source for:
  - `platform`
  - `reserve`
  - `shop`

### 2. `DailyTreasuryBucket`

Per-UTC-day reward accounting:

```proto
message DailyTreasuryBucket {
  string utc_date = 1; // @gotags: json:"utcDate"
  uint64 entry_count = 2; // @gotags: json:"entryCount"
  uint64 gross_fees = 3; // @gotags: json:"grossFees"
  uint64 reward_balance = 4; // @gotags: json:"rewardBalance"
  uint64 distributed_rewards = 5; // @gotags: json:"distributedRewards"
  bool finalized = 6; // @gotags: json:"finalized"
  uint64 finalized_at_unix = 7; // @gotags: json:"finalizedAtUnix"
}
```

Purpose:

- source of truth for each day’s daily reward pool

Note:

- this replaces the older mental model where one daily pool mixed treasury and reward semantics together

### 3. Existing reward claim state

Existing daily reward claim records can remain, but their payout source should now be the `DailyTreasuryBucket.reward_balance` flow rather than a generic shared pool.

## Config Additions

`GameConfig` should explicitly store the treasury split values.

Suggested fields:

```proto
uint64 daily_platform_fee_bps = 20;
uint64 daily_reward_fee_bps = 21;
uint64 daily_reserve_fee_bps = 22;
uint64 daily_shop_fee_bps = 23;
uint64 classic_platform_fee_bps = 24;
uint64 classic_reserve_fee_bps = 25;
uint64 classic_shop_fee_bps = 26;
```

Suggested defaults:

- `daily_platform_fee_bps = 500`
- `daily_reward_fee_bps = 8000`
- `daily_reserve_fee_bps = 1000`
- `daily_shop_fee_bps = 500`
- `classic_platform_fee_bps = 500`
- `classic_reserve_fee_bps = 4500`
- `classic_shop_fee_bps = 5000`

## Accounting Rules

### Daily start

When `startDailyGame` succeeds:

1. subtract full fee from player balance
2. split fee into:
   - platform
   - daily
   - reserve
   - shop
3. increase:
   - `GameTreasury.platform_balance`
   - `GameTreasury.reserve_balance`
   - `GameTreasury.shop_balance`
4. increase current day’s `DailyTreasuryBucket.reward_balance`
5. increase current day’s `entry_count` and `gross_fees`

### Classic start

When `startClassicGame` succeeds:

1. subtract full fee from player balance
2. split fee into:
   - platform
   - reserve
   - shop
3. increase:
   - `GameTreasury.platform_balance`
   - `GameTreasury.reserve_balance`
   - `GameTreasury.shop_balance`

Classic start does not touch `DailyTreasuryBucket`.

### Daily reward claim

When a player successfully claims a daily reward:

1. finalize the day if needed
2. verify player eligibility
3. verify reward is not already claimed
4. verify day bucket has enough `reward_balance`
5. subtract payout from:
   - `DailyTreasuryBucket.reward_balance`
6. add payout to player account
7. increment:
   - `DailyTreasuryBucket.distributed_rewards`
8. mark reward claimed

### Shop redemption

When a player successfully redeems classic points:

1. verify points and redeem rules
2. calculate payout
3. verify `GameTreasury.shop_balance >= payout`
4. subtract payout from:
   - `GameTreasury.shop_balance`
5. subtract burned points from player stats
6. add payout to player account
7. write redemption receipt

### Reserve bucket

In V1:

- reserve only accumulates
- reserve is not spent by any normal player flow

### Platform bucket

In V1:

- platform only accumulates
- platform is not spent by normal player flows

## Rounding Rules

Basis-point splits must be deterministic.

Recommended rule:

1. compute all bucket shares with integer division
2. assign any remainder to the last bucket in the mode split

Recommended implementation:

### Daily fee remainder

- calculate:
  - platform
  - daily
  - reserve
- shop gets:
  - `fee - platform - daily - reserve`

### Classic fee remainder

- calculate:
  - platform
  - reserve
- shop gets:
  - `fee - platform - reserve`

Reason:

- total always equals original fee
- deterministic and easy to audit

## Query Endpoints

Treasury V1 should add:

### 1. Global treasury

- `GET /v1/query/2048/treasury`

Response:

- platform balance
- reserve balance
- shop balance
- updated timestamp

### 2. Daily treasury bucket

- `POST /v1/query/2048/daily-treasury`

Request:

- `utcDate`

Response:

- entry count
- gross fees
- reward balance
- distributed rewards
- finalized

### 3. Current treasury config

This can either:

- be included in normal `config`
- or exposed separately

But clients should be able to read:

- daily split BPS
- classic split BPS

## Frontend Impact

### Profile

Could show:

- shop-funded treasury status later
- claimable daily rewards as before
- classic points as before

### Shop

Should eventually show:

- current redemption rate
- current points balance
- current shop treasury status or at least redemption availability

### Daily mode

Could show:

- current daily reward pool
- number of entries today

## Backward Compatibility / Migration

Treasury V1 replaces the older simpler assumptions:

- old daily assumption:
  - `5% platform`
  - `95% daily`
- old shop assumption:
  - shared generic treasury source

Migration intent:

- daily reward accounting should move to:
  - `80% daily`
  - `10% reserve`
  - `5% shop`
  - `5% platform`
- shop payout source should move to:
  - explicit `shop_balance`

For local/dev chains, reset or migration is acceptable.

## Failure Cases

The contract should reject clearly when:

- treasury split config does not sum to `10000` bps for a mode
- daily claim exceeds day reward balance
- shop redeem exceeds shop balance

Recommended user-facing messages:

- `Daily reward pool is temporarily underfunded.`
- `Shop treasury is temporarily underfunded.`
- `Treasury configuration is invalid.`

## Recommended Build Order

1. add treasury config fields to proto/config
2. add `GameTreasury` and `DailyTreasuryBucket` state
3. update daily start fee split
4. update classic start fee split
5. move daily claims to the daily bucket payout source
6. move shop redemptions to the explicit shop bucket payout source
7. add treasury query routes
8. update profile/shop UI to read the new treasury-backed semantics

## Recommended Defaults

### Daily

- `platform = 5%`
- `daily = 80%`
- `reserve = 10%`
- `shop = 5%`

### Classic

- `platform = 5%`
- `reserve = 45%`
- `shop = 50%`

This gives the intended economy:

- daily entries fund competition first
- classic entries fund redemption first
- reserve grows steadily
- platform share stays explicit
