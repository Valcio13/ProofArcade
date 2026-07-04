# ProofArcade

ProofArcade is an onchain 2048 game experience built on the Canopy stack.

Players can:
- play free in `Playtest`
- run paid `Classic` games to earn spendable points and compete in monthly rankings
- enter `Daily Challenge` for leaderboard rewards
- claim daily `Check-In` streak rewards
- redeem points in the shop
- manage wallet backup/import from the product UI

This repository contains the game contract, RPC/backend integration, frontend product surface, and deployment docs for the current ProofArcade beta.

## Tech Stack

ProofArcade is a mixed-stack project:
- `Go` for the core node, RPC backend, and broader Canopy infrastructure
- `TypeScript` for the 2048 contract/plugin logic
- `React + TypeScript` for the user-facing frontend

In practice:
- gameplay verification and reward logic live in the TypeScript plugin layer
- frontend product pages live in the React explorer app
- runtime integration, RPC, and node behavior live in the Go codebase

## What ProofArcade Is

ProofArcade is built around a simple idea:
- let people play 2048 normally
- let the chain verify what they actually achieved
- attach a real reward loop to verified runs

Instead of trusting a client-reported score directly, ProofArcade records a seeded game session and validates the submitted move list with deterministic replay. That lets the product support:
- monthly Classic competition leaderboard with cumulative scoring
- daily Challenge competition with verified results
- classic progression and points
- claimable daily rewards
- shop redemption

The product is intentionally split into two lanes:
- `Playtest` for frictionless free local practice
- onchain `Classic` for verified runs, points, and monthly competition
- onchain `Daily Challenge` for verified daily competition and rewards

## How ProofArcade Uses The Blockchain

ProofArcade does not use the chain just as a payment rail. The blockchain is part of the game logic itself.

### Classic mode

For `Classic`, the chain is used to create a fresh deterministic session for each paid run and track monthly competition progress.

That means:
- the player starts an onchain session
- the game uses a blockchain-derived random seed for that session
- the board can later be replayed from the same seed
- the final move list can be verified instead of blindly trusting the submitted score
- scores accumulate throughout the month on the monthly leaderboard

So `Classic` is not just "pay, play, and hope the backend believes you."  
It is "pay, get a seeded run, let the contract verify what happened, and compete for monthly rewards."

### Daily Challenge

For `Daily Challenge`, the chain is used to anchor a shared daily competition.

That means:
- the game uses a deterministic daily seed derived for that UTC day
- all players for that day are effectively competing against the same daily challenge setup
- the final leaderboard is built from verified submitted runs
- reward distribution is finalized from onchain daily results

This is what makes daily mode feel like a real shared contest instead of just isolated single-player runs.

### Session ownership

The blockchain is also used to bind a run to a wallet.

For a real run, the chain records:
- which wallet started it
- which mode it belongs to
- which session/game ID it belongs to
- whether it has already been submitted

That is what prevents:
- submitting a fake game ID
- submitting someone else's session
- submitting the same session twice

### Replay verification

The chain/plugin layer validates runs through deterministic replay.

Instead of trusting only:
- `score`
- `max tile`
- `moves`

the system replays the move list from the recorded seed and checks whether the submitted result is actually possible.

That is the core anti-cheat model behind:
- score verification
- points minting
- leaderboard integrity
- daily reward claims

### Economy and rewards

The blockchain also drives the reward economy.

It tracks:
- daily fee splits
- classic fee splits
- treasury buckets
- daily reward pools
- claimable daily rewards
- classic point balances
- shop redemption burns and payouts

So when a player:
- earns classic points
- claims a daily reward
- redeems points for `PROOF`

those actions are tied to verifiable chain state rather than just frontend bookkeeping.

### What stays local

Not everything needs to touch the chain.

`Playtest` stays local on purpose:
- no wallet required
- no fee
- no onchain session
- no rewards
- no leaderboard writes

That gives new users a zero-friction practice mode, while the blockchain-backed modes remain the verified competitive and economic part of the product.

## Current Product Shape

Main user surfaces:
- `Home`
- `Play`
- `Playtest`
- `Check-In`
- `Profile`
- `Settings`
- `Shop`
- `Explorer`

Core gameplay/economy systems:
- deterministic 2048 replay verification
- daily challenge prize pool
- classic points economy
- shop redemption
- treasury buckets
- reward claims
- wallet import/export

## Current Beta Parameters

The current beta economy and chain timing are configured as:
- `Classic` entry fee: `2 PROOF`
- `Daily Challenge` entry fee: `25 PROOF`
- shop redemption: `300 classic points = 1 PROOF`
- classic daily earn cap: `2000` points per wallet per UTC day
- target block time: `5 seconds`

This means:
- `Classic` is the lower-friction progression lane
- `Daily Challenge` remains the premium competitive lane
- chain-backed confirmations and game actions are expected to settle against a faster `5s` block target instead of the older `20s` defaults

## How A Run Works

### 1. Start

For `Classic` or `Daily Challenge`, the player starts a run through the backend.

That creates:
- a seeded game session
- a mode-specific run record
- fee routing into the correct treasury buckets

### 2. Play

The player plays the board in the browser.

For `Playtest`:
- everything stays local
- no wallet is required
- nothing is written onchain

For `Classic` and `Daily`:
- the session is tied to the wallet
- moves are collected for later replay validation

### 3. Submit

When the run ends, the player submits:
- score
- max tile
- stop reason
- move list

The contract replays the run deterministically and checks:
- session existence
- ownership
- no session reuse
- move validity
- score sanity

Only a valid run is accepted.

### 4. Reward / Progress

Depending on mode:
- `Classic` grants spendable points
- `Daily Challenge` writes to the leaderboard and later becomes claimable
- `Check-In` updates streak progress and can boost that day's classic earning

## Architecture Overview

ProofArcade spans three main layers:

### Frontend

Main frontend lives in:
- [cmd/rpc/web/explorer](cmd/rpc/web/explorer)

That product surface includes:
- landing page
- play
- playtest
- check-in
- profile
- settings
- shop
- explorer views

### RPC / Backend

Main backend integration lives in:
- [cmd/rpc](cmd/rpc)

This layer exposes:
- public query routes
- admin wallet/game routes
- 2048-specific read/write endpoints
- frontend-facing game/player/reward/shop data

### Contract / Plugin

Core game logic lives in:
- [plugin/typescript](plugin/typescript)

This layer handles:
- session lifecycle
- deterministic replay
- anti-cheat checks
- points minting
- daily reward finalization
- treasury accounting
- shop redemption burns

## Economy And Reward Model

## Game Modes

### Playtest
- free
- local only
- no wallet required
- no blockchain writes
- no points or rewards

### Classic
- paid entry
- deterministic seeded session
- successful submits earn spendable points
- points can later be redeemed in the shop

### Daily Challenge
- one run per wallet per UTC day
- paid entry
- leaderboard-ranked
- daily reward pool shared across actual ranked players
- rewards become claimable after the UTC day ends

### Classic points
- earned from successful classic submits
- daily earning cap applies
- usable in the shop

Current classic point model:
- points are awarded only on successful classic submit
- low-score runs do not earn much
- a daily cap exists to limit farming

### Shop

The shop currently allows:
- redeeming spendable classic points for `PROOF`

At the moment:
- points are burned
- payout comes from the dedicated shop treasury bucket
- redemption is intentionally conservative for beta

### Check-In
- one claim per UTC day
- 7-day streak
- same classic points currency
- day 7 unlocks a same-day classic-points bonus

Current streak ladder:
- day 1 through day 7 increase point rewards gradually
- day 7 is the special day with the same-day classic bonus

### Daily rewards
- funded from daily entry fees
- distributed to ranked daily finishers
- if fewer than 10 players finish, the reward weights are renormalized across actual winners

That means:
- a 10-player day uses the full payout table
- a 3-player day redistributes the full reward pool across those 3 actual winners
- a 1-player day gives that single winner the full daily reward pool

## Treasury Model

ProofArcade uses explicit bucket accounting.

### Daily fee routing

Daily entry fees are split into:
- platform
- daily reward pool
- reserve
- shop

### Classic fee routing

Classic entry fees are split into:
- platform
- reserve
- shop

This keeps:
- daily competition funding separate from
- long-term point redemption funding

See:
- [docs/2048-treasury-v1.md](docs/2048-treasury-v1.md)

## Wallet Model

Current wallet behavior should be treated as `beta`.

Today:
- wallet creation/import/export works
- encrypted backup export/import works
- sign-in convenience works
- gameplay and reward actions still depend on admin/node wallet routes

That means this is not yet a fully client-side self-custodial wallet model.

Recommended beta posture:
- export backup immediately
- avoid storing meaningful value until custody is fully client-side

### What works today

- create wallet
- import encrypted backup
- export encrypted backup
- log in locally
- use the wallet for game and reward actions

### What still needs hardening

- fully client-side wallet generation/unlock
- removal of admin-route dependence for signing
- stronger production wallet trust guarantees

## Anti-Cheat And Validation

ProofArcade already includes a core anti-cheat layer.

Daily and classic submits are checked for:
- session existence
- wallet ownership
- session reuse
- invalid move values
- deterministic score replay
- daily submission recording

This is the main security foundation behind:
- leaderboard integrity
- point minting
- reward claims
- shop economy

## Repository Map

Important project areas:
- [cmd/rpc/web/explorer](cmd/rpc/web/explorer): main ProofArcade frontend
- [cmd/rpc](cmd/rpc): RPC/backend routes and game endpoints
- [plugin/typescript](plugin/typescript): 2048 contract/plugin logic
- [docs](docs): product, treasury, launch, and deployment docs
- [deploy](deploy): reverse-proxy examples for beta deployment

Underlying protocol modules still live here too:
- [controller/README.md](controller/README.md)
- [fsm/README.md](fsm/README.md)
- [bft/README.md](bft/README.md)
- [p2p/README.md](p2p/README.md)
- [store/README.md](store/README.md)

Helpful product docs:
- [docs/2048-daily-prize-pool-v1.md](docs/2048-daily-prize-pool-v1.md)
- [docs/2048-shop-redemption-v1.md](docs/2048-shop-redemption-v1.md)
- [docs/2048-treasury-v1.md](docs/2048-treasury-v1.md)
- [docs/proofarcade-launch-checklist.md](docs/proofarcade-launch-checklist.md)
- [docs/proofarcade-beta-deployment.md](docs/proofarcade-beta-deployment.md)

## Local Development

### Recommended dev flow

1. build the explorer frontend
2. run plugin tests
3. rebuild `canopy.exe`
4. restart the node

This order matters because the frontend is embedded into the Go binary.

### Frontend

```powershell
cd cmd\rpc\web\explorer
npm install
npm run build
```

### Plugin tests

```powershell
cd plugin\typescript
npm install
npm test
```

### Rebuild the binary

From repo root:

```powershell
go build -buildvcs=false -a -o .\canopy.exe .\cmd\main
```

### Start the app

```powershell
.\canopy.exe start
```

### Useful helper

There is also a rebuild helper script:
- [tools/rebuild-proofarcade.ps1](tools/rebuild-proofarcade.ps1)

## Launch / Deployment Docs

Recommended reading for launch prep:
- [docs/proofarcade-launch-checklist.md](docs/proofarcade-launch-checklist.md)
- [docs/proofarcade-beta-deployment.md](docs/proofarcade-beta-deployment.md)
- [deploy/caddy/README.md](deploy/caddy/README.md)

Economy design docs:
- [docs/2048-daily-prize-pool-v1.md](docs/2048-daily-prize-pool-v1.md)
- [docs/2048-shop-redemption-v1.md](docs/2048-shop-redemption-v1.md)
- [docs/2048-treasury-v1.md](docs/2048-treasury-v1.md)

## Beta Notes

For the near-term release, this project should be presented as:
- `ProofArcade Beta`

Recommended launch posture:
- protect admin wallet routes
- keep wallet messaging conservative
- keep production config explicit
- freeze feature churn close to launch

## What Is Still Missing

Important future work:
- fully client-side wallet custody
- stronger production auth model
- more launch-safe admin route isolation
- more polish around animation and feedback
- deployment finalization and launch smoke-test discipline

## Built On Canopy

ProofArcade is built on top of the Canopy codebase and protocol stack. The repo still contains the broader Canopy implementation, but the primary product surface in this fork is ProofArcade.

