# ProofArcade

ProofArcade is an onchain 2048 game experience built on the Canopy stack.

Players can:
- play free in `Playtest`
- run paid `Classic` games to earn spendable points
- enter `Daily Challenge` for leaderboard rewards
- claim daily `Check-In` streak rewards
- redeem points in the shop
- manage wallet backup/import from the product UI

This repository contains the game contract, RPC/backend integration, frontend product surface, and deployment docs for the current ProofArcade beta.

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

## Economy Summary

### Classic points
- earned from successful classic submits
- daily earning cap applies
- usable in the shop

### Check-In
- one claim per UTC day
- 7-day streak
- same classic points currency
- day 7 unlocks a same-day classic-points bonus

### Daily rewards
- funded from daily entry fees
- distributed to ranked daily finishers
- if fewer than 10 players finish, the reward weights are renormalized across actual winners

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

## Local Development

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

## Built On Canopy

ProofArcade is built on top of the Canopy codebase and protocol stack. The repo still contains the broader Canopy implementation, but the primary product surface in this fork is ProofArcade.
