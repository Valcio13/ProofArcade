# 2048 Shop / Redemption V1

## Goal

Turn classic points into a real on-chain utility loop:

- players earn classic points from successful classic runs
- players can burn those points to redeem `CNPY`
- redemption is paid from treasury / fee-pool funds
- the system stays simple enough to balance before adding items, crates, or multipliers

This is a V1 spec only. It intentionally avoids inventory systems, random rewards, temporary buffs, and marketplace-style complexity.

## Confirmed Product Direction

- `Classic` is the progression lane
- `Daily` is the competitive prize-pool lane
- points are earned from successful `classic` submits only
- points are not transferable between players
- redeeming points burns them on-chain
- first shop item is `CNPY` redemption only

## Current Economy Assumptions

These are already true or already implemented:

- classic point formula:
  - score `< 64` => `0`
  - otherwise `floor(score / 32)`
  - per-run cap: `1000`
- classic point daily cap:
  - `2000` points per UTC day per player
  - soft cap:
    - classic submit still succeeds
    - point reward is reduced to the remaining daily allowance
- daily challenge:
  - separate paid competition mode
  - `5%` platform fee
  - `95%` daily prize pool
  - top-10 claimable payouts

## V1 Scope

Build only one redeemable shop outcome:

- burn classic points
- receive `CNPY`

Do not build yet:

- mystery crates
- multipliers
- timed boosts
- shop inventory rotation
- cosmetic items
- off-chain coupon redemption

## Product Rules

### 1. Redemption currency

- only `classic points` can be spent in Shop V1
- daily rewards remain a separate `CNPY` payout system

### 2. Redemption target

- only `CNPY` token redemption is available in V1

### 3. Burn behavior

- redeemed points are removed from:
  - `PlayerStats.classicPointsBalance`
- lifetime earned points are not reduced:
  - `PlayerStats.classicPointsEarned` remains historical

### 4. Payout source

- redemption is paid from treasury / fee-pool reserves
- if treasury does not have enough `CNPY`, redemption must fail

### 5. Redemption granularity

Recommended V1:

- player chooses a points amount to redeem
- backend calculates the token payout from a fixed rate

This is simpler than listing many fixed “packages”.

## Recommended V1 Rate

Start with a conservative fixed rate:

- `300 classic points => 1 CNPY`

Equivalent:

- `1 point = 0.00333 CNPY`

Why this is a good starting point:

- easy to understand
- avoids overpaying before the economy is observed
- works cleanly with the current point earning rate
- gives us room to tune later

## Recommended Redemption Rules

### Minimum redemption

- minimum burn: `300` points

Reason:

- avoids dust claims
- keeps treasury payouts cleaner
- encourages a little accumulation before redemption

### Increment size

- redemption must be in multiples of `300` points

Examples:

- `300` points => `1 CNPY`
- `600` points => `2 CNPY`
- `1200` points => `4 CNPY`

### Daily redemption cap

Recommended V1:

- no separate redemption cap yet

Reason:

- earning is already capped daily
- adding a second cap this early may feel unnecessarily restrictive

If needed later, we can add:

- max redeemable `CNPY` per day
- or max points burn per day

## Contract-Level Design

### Existing state reused

V1 should reuse:

- `PlayerStats`
  - `classicPointsBalance`
  - `classicPointsEarned`
- treasury / fee-pool accounting

### New state needed

V1 should add:

1. shop config
2. redemption record / receipt

### Why a receipt matters

Even though the burn is simple, redemption receipts are valuable for:

- profile history
- support/debugging
- proving payout happened
- future analytics

## Proto Additions

### 1. `GameConfig`

Add:

- `uint64 shop_redemption_rate_points`
- `uint64 shop_redemption_rate_cnpy`
- `uint64 shop_min_redeem_points`
- `uint64 shop_redeem_step_points`

Suggested defaults:

- `shop_redemption_rate_points = 300`
- `shop_redemption_rate_cnpy = 1`
- `shop_min_redeem_points = 300`
- `shop_redeem_step_points = 300`

Note:

- naming can be adjusted, but V1 should store the rate as a rational pair rather than a floating value

### 2. `MessageRedeemClassicPoints`

```proto
message MessageRedeemClassicPoints {
  bytes player_address = 1; // @gotags: json:"playerAddress"
  uint64 burn_points = 2; // @gotags: json:"burnPoints"
}
```

Purpose:

- player requests a points burn amount
- contract calculates the `CNPY` payout from config

### 3. `ClassicPointRedemption`

```proto
message ClassicPointRedemption {
  bytes player_address = 1; // @gotags: json:"playerAddress"
  uint64 burn_points = 2; // @gotags: json:"burnPoints"
  uint64 payout_amount = 3; // @gotags: json:"payoutAmount"
  uint64 redeemed_at_unix = 4; // @gotags: json:"redeemedAtUnix"
  bytes tx_hash = 5; // @gotags: json:"txHash"
}
```

Purpose:

- historical record of each successful redemption

Note:

- if storing `tx_hash` is awkward at contract level, V1 can omit it and let the explorer associate history by tx instead

## State Keys

Suggested additions:

### Redemption history

- `KeyForClassicPointRedemption(playerAddress, redeemedAtUnix, txHashOrNonce)`

Or if tx hash is not available:

- `KeyForClassicPointRedemption(playerAddress, redeemedAtUnix, sequence)`

### Optional player prefix for history queries

- `KeyForClassicPointRedemptionPrefix(playerAddress)`

This makes profile history queries easy.

## Deliver Flow

### A. `DeliverMessageRedeemClassicPoints`

Flow:

1. load player account
2. load player stats
3. load config
4. verify:
   - burn amount > 0
   - burn amount >= minimum
   - burn amount respects step size
   - player has enough `classicPointsBalance`
5. compute payout:
   - `payout = burnPoints * redeemRateCNPY / redeemRatePoints`
6. verify treasury / fee pool has enough `CNPY`
7. subtract:
   - `burnPoints` from `classicPointsBalance`
   - `payout` from treasury / fee pool
8. add:
   - `payout` to player account
9. write redemption receipt

### Important behavior

- lifetime earned points are not burned
- only the spendable balance is reduced
- if payout rounds to `0`, reject

## Query Endpoints

V1 should add:

### 1. Shop config

- `GET /v1/query/2048/shop-config`

Response:

- redemption rate
- minimum points
- step size

### 2. Redemption preview

- `POST /v1/query/2048/redeem-preview`

Request:

- player address
- requested burn points

Response:

- valid / invalid
- payout amount
- reason if invalid

This is optional, but very useful for UI clarity.

### 3. Redemption history

- `POST /v1/query/2048/redemptions`

Request:

- player address

Response:

- recent redemption receipts

## Admin / Tx Routes

Add:

- `POST /v1/admin/tx-2048-redeem-classic-points`

Request:

- address
- password
- burnPoints
- submit

Response:

- tx hash
- submitted status

## Frontend V1

### New page or section

Add a `Shop` page or a `Shop` section inside `/profile`.

Recommended:

- separate `/shop` route

Why:

- cleaner mental model
- easy to grow later
- keeps profile focused on identity and stats

### Initial UI

Show:

- current classic points balance
- redemption rate
- minimum / step rules
- input for burn amount
- preview payout
- redeem button
- recent redemption history

### UX rules

- preview should update before submit
- button disabled if:
  - not logged in
  - invalid amount
  - insufficient point balance
- after success:
  - refresh point balance
  - refresh wallet balance
  - append redemption history

## Failure Cases

Contract should reject clearly when:

- player has insufficient classic points
- burn amount is below minimum
- burn amount is not a valid increment
- calculated payout is zero
- treasury / fee pool lacks enough `CNPY`

Recommended user-facing messages:

- `Not enough classic points.`
- `Minimum redemption is 300 points.`
- `Redemption must be in 300-point steps.`
- `Treasury is temporarily out of funds.`

## Economic Notes

V1 is intentionally conservative.

Why start with `300 points => 1 CNPY`:

- classic points are earned steadily now
- daily rewards already provide direct token upside
- this rate avoids making classic farming too dominant too early

If later the grind feels too slow, we can adjust:

- increase payout rate
- reduce minimum redeem size
- add non-token shop items with better perceived value

## Out of Scope for V1

Do not include yet:

- multiplier purchases
- temporary boosts
- mystery crates
- randomized rewards
- referral discounts
- staking / locking points
- transferable player-to-player points

## Recommended Build Order

1. add proto fields for shop config and redemption tx
2. add redemption receipt state
3. implement contract redemption deliver/check logic
4. add query endpoints
5. add admin tx route
6. add `/shop` UI
7. add profile shortcut to shop

## Recommended Defaults for First Release

- point formula:
  - current live formula stays unchanged
- classic daily earn cap:
  - `2000`
- shop redemption rate:
  - `300 points => 1 CNPY`
- minimum redemption:
  - `300 points`
- step size:
  - `300 points`

This gives a very understandable first economy:

- play classic
- earn points
- save points
- redeem points for `CNPY`

That is enough for V1.
