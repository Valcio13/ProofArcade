# ProofArcade Launch Checklist

This document is the launch-prep checklist for the current ProofArcade build.

It is intentionally practical:
- what must be cleaned up
- what is safe to ship
- what is still a blocker
- how to rebuild and restart
- how to smoke test before launch

## 1. Release Goal

Target release shape for the next few days:
- ProofArcade frontend served from the explorer route
- paid `Daily` and `Classic` modes working
- `Playtest` local-only mode working
- daily reward claims working
- classic point redemption working
- check-in flow working
- profile/settings/import/export working

## 2. Current Launch Risk

### Biggest risk: wallet custody model

The current wallet flow is still tied to the node keystore and admin RPC.

That means:
- wallet creation is not yet truly browser-local
- wallet import/export works, but the node can still access the encrypted keystore entries it stores
- this does **not** yet satisfy the stronger promise of "only the user can access the wallet and not us"

### Recommendation

If launch is in a few days, choose one of these paths explicitly:

1. `Beta launch`
   Launch as a beta/test environment with clear wording that:
   - this is a hosted wallet experience
   - users should not store meaningful value
   - backup export is supported, but the custody model is still evolving

2. `Public self-custody launch`
   Do **not** launch until wallet generation and unlock happen fully client-side.

For the next few days, the safer honest path is:
- launch as beta
- keep reward/token exposure limited
- clearly disclose wallet model

## 3. Environment / Config Cleanup

Before launch, confirm `config.json` for the target node is intentionally set.

### Required config review

Check:
- `chainId`
- `networkID`
- `rpcURL`
- `adminRPCUrl`
- `walletPort`
- `explorerPort`
- `rpcPort`
- `adminPort`
- `plugin`
- `pluginTimeoutMS`
- `headless`
- `autoUpdate`
- `pluginAutoUpdate`
- `faucetAddress`

### Production-minded defaults

Recommended:
- `headless = false`
- `pluginTimeoutMS` reviewed and not left arbitrary
- `faucetAddress = ""`
- `autoUpdate = false` for launch week unless intentionally tested
- `pluginAutoUpdate.enabled = false` for launch week unless intentionally tested

### Port exposure

Do not expose these publicly unless intentionally protected:
- admin RPC port `50003`
- profiling port `6060`

Public-facing exposure should ideally be limited to:
- explorer frontend
- public RPC only if needed

### Data directory hygiene

Review the node data dir and back it up:
- `config.json`
- `validator_key.json`
- `genesis.json`
- `proposals.json`
- `polls.json`
- keystore files
- DB/state data

Create:
- one pre-launch backup
- one post-config-finalization backup

## 4. Wallet Safety Review

This is the most important non-UI review.

### Confirm current behavior

Current implementation should be treated as:
- encrypted keystore export/import supported
- local sign-in convenience supported
- server/node keystore still participates in wallet management

### Launch decision checklist

Before launch, decide and document:
- are we calling this beta?
- are users allowed to hold meaningful value?
- are admin RPC wallet routes reachable from the public internet?
- is there any rate limiting or access restriction on admin wallet endpoints?

### Minimum safe posture for a beta launch

- show clear in-product wording that wallet handling is still beta
- encourage export backup immediately after wallet creation
- do not market the wallet as fully self-custodial yet
- keep redemption economics conservative

### If possible before launch

Improve at least one of:
- restrict admin wallet endpoints behind trusted network / reverse proxy rules
- add server-level auth for admin routes
- separate public frontend from unrestricted admin RPC access

## 5. Production Build / Restart Workflow

Use this exact order to avoid stale embedded frontend builds.

### Frontend

From:
- `cmd/rpc/web/explorer`

Run:

```powershell
npm run build
```

### Plugin

From:
- `plugin/typescript`

Run:

```powershell
npm test
```

This currently validates:
- replay logic
- reward claims
- daily payout logic
- classic point economy
- shop redemption
- check-in behavior

### Go rebuild

From repo root:
- repo root

Run the explicit build:

```powershell
go build -buildvcs=false -a -o .\canopy.exe .\cmd\main
```

Do not rely on older wildcard build variants for the final launch workflow.

### Restart

```powershell
taskkill /IM canopy.exe /F
.\canopy.exe start
```

### Why this exact order matters

The frontend is embedded into `canopy.exe`.
If the Go rebuild happens before the final frontend build, the live app can serve stale JS even though the source files are correct.

## 6. Deployment Checklist

### Infrastructure

- target machine selected
- domain / subdomain selected
- TLS / reverse proxy plan ready
- persistent data directory location chosen
- backup path chosen

### Runtime

- correct `config.json` copied
- faucet disabled unless intentionally beta-only
- auto-update behavior chosen
- admin RPC exposure reviewed
- explorer reachable on intended host/port
- node starts cleanly after reboot

### ProofArcade game checks

- daily fee split correct
- classic fee split correct
- daily pool visible
- daily claims work
- short-field daily payouts renormalize correctly
- shop redemption works
- check-in works

### Branding / product

- favicon correct
- page title correct
- ProofArcade logo correct
- no lingering `Canopy` branding in user-facing product copy that should be removed

### Logging / observability

- log level appropriate for launch
- errors visible in logs
- profiling not exposed publicly

## 7. Smoke Test Plan For Launch Day

Run this after the final deploy build is live.

### Guest flow

1. Open `/`
2. Confirm branding, favicon, and page title
3. Open `/playtest`
4. Play a few moves
5. Confirm no wallet required

### Auth flow

1. Open `/auth`
2. Register a wallet
3. Confirm redirect to `/`
4. Log out
5. Log back in
6. Export backup
7. Import backup with a fresh or alternate browser profile if possible

### Profile / settings

1. Open `/profile`
2. Confirm address copy works
3. Open `/settings`
4. Rename username
5. Confirm name updates in profile/navbar where expected

### Check-in flow

1. Open `/daily-login`
2. Claim check-in
3. Confirm streak/status updates

### Classic flow

1. Open `/play`
2. Start `Classic`
3. Make real moves
4. Submit score
5. Confirm points increase
6. Confirm profile/shop update

### Shop flow

1. Open `/shop`
2. Confirm spendable points visible
3. Redeem a valid amount
4. Confirm point burn and PROOF payout

### Daily flow

1. Start `Daily`
2. Submit a valid run
3. Confirm leaderboard entry
4. After UTC rollover, confirm reward appears
5. Claim reward
6. Confirm balance increase

### Explorer sanity

1. Open transaction list
2. Open a 2048 start tx
3. Open a 2048 submit tx
4. Confirm presentation is readable and game-specific

## 8. Known Beta Caveats

These should be treated as explicit launch caveats unless fixed first:

- wallet custody is not fully client-side yet
- admin wallet routes are still part of the system architecture
- favicon/logo/browser cache may require hard refresh after upgrades
- embedded frontend workflow is sensitive to build order

## 9. Recommended Final Decision

For a launch in a few days:

- launch as `beta`
- keep wallet trust language conservative
- keep admin exposure tight
- run the smoke test checklist on the exact deployed binary
- freeze feature work and only take fixes after this point
