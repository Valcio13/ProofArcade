# Web3 2048 Contract Design

This document captures the agreed v1 design for a 2048 game built on the Canopy TypeScript plugin template.

## Goals

- Implement two paid game modes: `daily` and `classic`
- Use deterministic replay so the chain can verify submitted scores
- Enforce one daily attempt per address per UTC day
- Allow unlimited classic attempts
- Maintain separate leaderboards for daily and classic
- Track per-player aggregate stats

## Core Principle

The client renders and plays the game locally, but the blockchain is the source of truth for:

- session creation
- seed derivation
- fee enforcement
- one-attempt daily gating
- final score verification
- leaderboard updates

To avoid trusting the client, the final score submission must include the move sequence so the contract can replay the run from the stored seed.

## Modes

### Daily Challenge

- Uses a single `dailySeed` per UTC date
- UTC date boundary is `00:00:00 UTC`
- One attempt per address per UTC day
- Higher play fee than classic
- Enforces a `maxMoves` cap
- Supports player ending early with a stop flag in the result submission
- Separate per-day leaderboard

### Classic

- Unlimited attempts
- Lower play fee than daily
- Seed is derived at session start from chain data and player-specific entropy
- Global classic leaderboard independent from daily mode

## Seed Strategy

### Daily Seed

Daily sessions should use a deterministic seed derived from chain state and the UTC date.

Recommended pattern:

`dailySeed = hash(chainId || utcDate || dailySeedSource)`

Where:

- `utcDate` is formatted as `YYYY-MM-DD`
- `dailySeedSource` is a chain-derived value chosen by the implementation

Two reasonable implementation strategies:

1. Use the first block hash observed on or after `00:00:00 UTC`
2. Use a governance-updated daily seed set by block lifecycle logic

Because plugin lifecycle hooks do not expose full block metadata yet, the implementation may need a helper key written by begin/end block logic or another chain data source to finalize the exact daily derivation.

### Classic Seed

Classic seed should be unique per session and derived when the player pays.

Recommended pattern:

`classicSeed = hash(playerAddress || txHash || blockHash || sessionNonce)`

If direct access to `txHash` or `blockHash` is not available in the plugin request, substitute with the best deterministic chain-side entropy available and record the final resolved seed in session state.

## Deterministic Replay Model

The contract stores the session seed and replays the move sequence on result submission.

The submitted result should include:

- `gameId`
- `moves`
- `declaredScore`
- `declaredMaxTile`
- `stopReason`

Replay rules:

- board starts from the session seed
- tile spawn positions and values are derived from deterministic RNG
- each move is applied in order
- invalid no-op moves still count toward the move cap only if we explicitly choose that rule
- score is recomputed by merge events only
- session ends on:
  - no legal moves
  - player stop
  - daily max move cap reached

Recommended v1 rule:

- no-op moves are allowed but do count toward `maxMoves`

This keeps replay simpler and makes client/server behavior easier to align.

## Win/Loss Rules

- Reaching `2048` does not end the game
- Player may continue past `2048`
- A session ends when:
  - player explicitly stops, or
  - no legal moves remain, or
  - daily `maxMoves` cap is reached

## Anti-Abuse Rules

- No duplicate submission for the same `gameId`
- Daily sessions are single-use and single-attempt
- Result submission must only succeed for an `active` session
- Classic sessions are single-use but unlimited across sessions
- Fees are collected on session start, not at submission time

## Suggested Transactions

### `startDailyGame`

Purpose:

- pay the daily fee
- verify the player has not already started a daily run for that UTC day
- create an active daily session

Checks:

- signer matches player
- fee meets `dailyStartFee`
- no existing daily attempt for `(utcDate, playerAddress)`

Effects:

- create `GameSession`
- write `DailyAttempt`
- increment `playerStats.dailyGamesStarted`

### `startClassicGame`

Purpose:

- pay the classic fee
- create an active classic session with a fresh chain-derived seed

Checks:

- signer matches player
- fee meets `classicStartFee`

Effects:

- create `GameSession`
- increment `playerStats.classicGamesStarted`

### `submitGameResult`

Purpose:

- submit final move sequence and claimed score
- deterministically replay and verify the run
- finalize session and update leaderboards/stats

Checks:

- signer matches session player
- session exists and is `active`
- session has not expired if an expiry rule is added
- move count does not exceed daily cap for daily mode
- no previous submission for the same session

Effects:

- mark session completed
- store verified score and max tile
- update mode-specific leaderboard
- update player stats

## Suggested State Objects

### `GameConfig`

- `classicStartFee`
- `dailyStartFee`
- `dailyMaxMoves`
- `classicLeaderboardSize`
- `dailyLeaderboardSize`

### `GameSession`

- `gameId`
- `playerAddress`
- `mode`
- `utcDate` for daily sessions
- `seed`
- `status`
- `startedHeight`
- `startedAtUnix`
- `feePaid`
- `maxMoves`
- `submittedScore`
- `submittedMaxTile`
- `finalMoveCount`
- `stopReason`

### `DailyAttempt`

- `utcDate`
- `playerAddress`
- `gameId`

### `LeaderboardEntry`

- `playerAddress`
- `score`
- `maxTile`
- `moveCount`
- `endedAtUnix`
- `gameId`

### `PlayerStats`

- `playerAddress`
- `dailyGamesStarted`
- `classicGamesStarted`
- `gamesCompleted`
- `wins`
- `losses`
- `bestDailyScore`
- `bestClassicScore`
- `bestTile`
- `totalScore`

## Suggested Key Layout

Use dedicated prefixes rather than overloading account or pool state.

- `GameConfig`: singleton config key
- `GameSession`: by `gameId`
- `DailyAttempt`: by `utcDate + playerAddress`
- `DailyLeaderboard`: by `utcDate + score-sort key + gameId`
- `ClassicLeaderboard`: by `score-sort key + gameId`
- `PlayerStats`: by `playerAddress`

If top-N leaderboards are needed on-chain, use score-ordered keys or maintain a bounded list object per board.

## Fee Handling

Fees should be collected into the existing fee pool or a dedicated game treasury pool.

Recommended v1:

- continue using the fee pool pattern already present in the template
- game-specific start fee is enforced by plugin logic
- transaction `tx.fee` doubles as the play fee

If later you want both a protocol fee and a game entry fee, split them explicitly in custom state and transfer logic.

## Replay Implementation Notes

The replay engine should be pure and deterministic:

- input: seed, mode, maxMoves, move sequence
- output: final board, verified score, max tile, ended reason, move count

Keep it separate from chain I/O so it can be tested heavily.

Suggested helper modules:

- `game2048/replay.ts`
- `game2048/rng.ts`
- `game2048/board.ts`

## Recommended v1 Delivery Order

1. Add protobuf messages and state structures
2. Register custom transactions in the TypeScript contract
3. Add session start handlers with fee enforcement
4. Add result submission handler with placeholder replay
5. Implement pure deterministic replay engine
6. Update leaderboards and player stats
7. Add tests for:
   - one daily attempt rule
   - duplicate submission rejection
   - daily move cap
   - classic unlimited sessions
   - replay mismatch rejection

