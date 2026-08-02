# Adding a Feature to ProofArcade (post-refactor)

This is the step-by-step guide for adding a new feature — almost always a **new transaction /
message type plus the state it touches** — to the refactored code structure. Read
[ARCHITECTURE.md](ARCHITECTURE.md) first for the big picture.

> **The #1 gotcha:** a new message type must be declared in
> `ContractConfig.supportedTransactions` **and** `transactionTypeUrls` (`contract.ts`). If you skip
> it, the node rejects the transaction at the mempool **before your handler runs** — it looks like a
> 400 at submit with "no transaction on chain," even though all your logic is correct. This is exactly
> what happened with Weekly Blitz. See step 3d and the guard test at the end.

The lower-level proto/descriptor mechanics are also covered in
[../ADDING_NEW_PROTO_MESSAGES.md](../ADDING_NEW_PROTO_MESSAGES.md); this guide is the
structure-aware superset and is the one to follow.

---

## Where each piece goes (module placement)

The refactor gave every kind of code a home. Put new code in the right module — don't pile it into
`contract.ts`:

| What you're adding | Where it goes |
|---|---|
| State-database key (`KeyForX`) | `contract/utils/state.ts` |
| Fee split / economic constant | `contract/economy/fee-distribution.ts` (+ `config/` for tunables) |
| Pool read/write / balance transfer | `contract/economy/pool-operations.ts` (the only module that does state I/O) |
| Stateless message validation | `contract/validation/message-checks.ts` |
| Business logic + record `types` + encode/decode | the feature module: `competition/`, `checkin/`, `shop/`, or `profile/` |
| New typed error | `contract/error.ts` |
| Message routing / `Deliver*` handler | `contract/contract.ts` (orchestrator) |
| Proto message decode + type URL | `contract/game2048.ts` |

Rule of thumb: **`contract.ts` orchestrates; modules compute.** Handlers in `contract.ts` should read
state, then call pure functions in the modules — not inline the math.

---

## Step 1 — Define the message in proto (both languages)

Edit **both** proto files and keep them identical:
- `plugin/typescript/proto/game2048.proto`
- `plugin/go/proto/game2048.proto`

```protobuf
message MessageYourFeature {
  bytes  player_address = 1;
  uint64 some_amount    = 2;
  string game_id        = 3;
}
```

If the feature is a new game mode, also add it to the `GameMode` enum.

## Step 2 — Regenerate descriptors (both systems)

Canopy uses two descriptor systems that must agree:

- **TypeScript (auto-generated):**
  ```bash
  cd plugin/typescript
  npm run build           # runs build:proto + build:descriptors + tsc
  ```
- **Go (manual):** in `cmd/rpc/game2048.go`, add your message to the descriptor builder
  (`messageDescriptor("MessageYourFeature", [...])`) with a field descriptor per proto field.

## Step 3 — Plugin: wire the message through

### 3a. Type URL, union, and decode — `contract/game2048.ts`
- Add an entry to `GAME2048_TYPE_URLS` (e.g. `yourFeature: '...MessageYourFeature'`).
- Add the name to the `Game2048MessageType` union.
- Add a branch to `decodeGame2048Any` so the Any is decoded to your message.

### 3b. Stateless validation — `contract/validation/`
- Add `checkMessageYourFeature(msg)` in `message-checks.ts` (validate address length, required
  fields; return `{ authorizedSigners: [playerAddress] }`).
- Export it from `validation/index.ts`.

### 3c. Route it — `contract/contract.ts`
- Add a `case 'MessageYourFeature'` to the **`ContractAsync.CheckTx`** switch (fee gate +
  `contract.CheckMessageYourFeature(msg)`).
- Add a `case 'MessageYourFeature'` to the **`ContractAsync.DeliverTx`** switch calling your handler.

> Note: routing is done with `switch` statements in `CheckTx` / `DeliverTx`. There is **no**
> `messageHandlers` registry object — older docs that mention one are stale.

### 3d. ⚠️ Register it — `contract/contract.ts` (`ContractConfig`)
Add the message to **both** lists, or the node drops the tx at the mempool:

```typescript
supportedTransactions: [ /* ... */ 'yourFeature' ],   // short name; must match the Go MessageName
transactionTypeUrls:   [ /* ... */ GAME2048_TYPE_URLS.yourFeature ],
```

The short name must exactly equal the Go backend's `MessageName` constant (step 4).

### 3e. Implement the handler — `contract/contract.ts`
Add `DeliverMessageYourFeature`, following the standard pattern (see
`DeliverMessageStartWeeklyBlitzGame` as a template):

1. Extract fields from `msg`.
2. Build state keys with `KeyFor*` (add new ones to `utils/state.ts`).
3. Allocate a `randomQueryId()` per key.
4. One `contract.plugin.StateRead(contract, { keys: [...] })`.
5. `getQueryValue(response, queryId)` + decode each record.
6. Call into the feature module for logic (fees via `economy/`, records via the feature module).
7. Write via `StateWrite`; return `{ events }` or `{ error }`.

### 3f. Feature logic, keys, fees, errors — the modules
- State keys → `utils/state.ts`
- Fee split → `economy/fee-distribution.ts`
- Business logic, `types.ts`, encode/decode for your state records → the feature module
  (`competition/`, `checkin/`, `shop/`, `profile/`), exported through its `index.ts`
- New errors → `error.ts`

## Step 4 — Backend (Go): `cmd/rpc/`

In `cmd/rpc/game2048.go`:
- Add name/type-URL constants (`game2048YourFeatureMessageName = "yourFeature"`, matching step 3d).
- Add a tx builder (`buildGame2048YourFeatureTx`) that sets the proto fields, signs the tx.
- Add an HTTP handler (`Game2048YourFeature`) that checks funds, builds the tx, and calls
  `controller.SendTxMsgs` when `submit` is true.
- If it starts a game, extend `deriveGame2048Session` for the new mode (seed, limits, expiry).

In `cmd/rpc/routes.go`:
- Add the route path/name constants and register the handler in the routes map.

## Step 5 — Frontend: `cmd/rpc/web/explorer/`

- `src/lib/game2048.ts` — extend the `GameMode` type / any mode enums.
- `src/lib/rpcChain2048.ts` — add the endpoint path and wire it into `startSession`/the client method.
- `src/lib/mockChain2048.ts` — add a mock branch so local/offline dev works.
- `src/pages/Play2048.tsx` — add the mode card, URL param handling, fee display, and start call.

## Step 6 — Build, restart, verify

Because the node runs the **built** plugin and won't hot-reload it:

```bash
taskkill /F /IM canopy.exe /T 2>$null
cmd /c "plugin\typescript\pluginctl.cmd stop"      # REQUIRED: start won't replace a live plugin
cd plugin\typescript && npm run build && cd ..\..
go build -o canopy.exe ./cmd/main
.\canopy.exe start
```

Then hard-refresh the browser and exercise the feature. **Verify the tx actually lands on chain**
(a tx hash appears and the state changes) before committing — a green toast alone isn't proof.

---

## Master checklist

**Proto & descriptors**
- [ ] Message added to `plugin/typescript/proto/game2048.proto` and `plugin/go/proto/game2048.proto`
- [ ] `npm run build` run in `plugin/typescript/` (regenerates TS descriptors)
- [ ] Message descriptor added to `cmd/rpc/game2048.go` (Go, manual)

**Plugin plumbing (`contract/`)**
- [ ] `GAME2048_TYPE_URLS` + `Game2048MessageType` union + `decodeGame2048Any` — `game2048.ts`
- [ ] `checkMessageYourFeature` — `validation/message-checks.ts` (+ export in `validation/index.ts`)
- [ ] `CheckTx` switch case — `contract.ts`
- [ ] `DeliverTx` switch case — `contract.ts`
- [ ] **`ContractConfig.supportedTransactions` + `transactionTypeUrls`** — `contract.ts` ⚠️
- [ ] `DeliverMessageYourFeature` handler — `contract.ts`

**Feature modules**
- [ ] State keys — `utils/state.ts`
- [ ] Fee split (if any) — `economy/fee-distribution.ts`
- [ ] Business logic + `types` + encode/decode — the feature module (exported via its `index.ts`)
- [ ] New errors — `error.ts`

**Backend (Go)**
- [ ] Name/type-URL constants, tx builder, HTTP handler, session derivation — `game2048.go`
- [ ] Route registered — `routes.go`

**Frontend**
- [ ] `GameMode` type — `game2048.ts`
- [ ] Endpoint + client method — `rpcChain2048.ts`
- [ ] Mock branch — `mockChain2048.ts`
- [ ] UI (mode card, URL param, fee, start) — `Play2048.tsx`

**Ship**
- [ ] Plugin rebuilt **and** plugin process restarted (`pluginctl stop` first)
- [ ] Go backend rebuilt
- [ ] Verified the tx lands on chain and state changes
- [ ] Contract tests pass (`npm test` in `plugin/typescript/`)

---

## Recommended: a guard test so the mempool gotcha can't recur

The `ContractConfig` omission is invisible until runtime. Add a unit test that fails at build time if
any routed message type isn't declared as supported. Roughly:

> For every message type handled in the `DeliverTx` / `decodeGame2048Any` switch, assert it also
> appears in `ContractConfig.supportedTransactions` and `transactionTypeUrls`.

Put it alongside the existing tests run by `npm test`. Twenty lines here would have caught the Weekly
Blitz bug in CI instead of during live testing.
