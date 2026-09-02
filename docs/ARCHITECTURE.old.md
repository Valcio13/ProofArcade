# ProofArcade Architecture

ProofArcade is an on-chain 2048 game platform built on the **Canopy Network**. Every game
is provably fair: the chain stores a deterministic seed, the player submits their move list,
and the contract **replays the game on-chain** to verify the score before paying out rewards.

This document explains how the system is organized after the contract/economy/state refactor.
For the step-by-step process of adding a new feature, see [ADDING_A_FEATURE.md](ADDING_A_FEATURE.md).

---

## 1. The three layers

| Layer | Tech | Location | Role |
|---|---|---|---|
| **Smart contract (plugin)** | TypeScript | `plugin/typescript/` | Consensus-validated game logic ("the proof") |
| **Backend API** | Go | `cmd/rpc/` | Builds/signs transactions, exposes REST, reads chain state |
| **Frontend** | React + Vite + Tailwind | `cmd/rpc/web/explorer/` | Wallet, gameplay UI, leaderboards |

The Go **node** (`canopy.exe`) runs Canopy consensus. It launches the TypeScript plugin as a
**child process** and talks to it over a local socket (TCP on Windows). The plugin is where the
game rules live; the node handles blocks, mempool, and state storage.

```
Browser (React)
   │  HTTP (REST)
   ▼
Go backend  (cmd/rpc)  ──build+sign tx──►  Node mempool ──► Consensus ──► Block
   │                                             │                          │
   │ reads chain state (queries)                 │ CheckTx                  │ DeliverTx
   ▼                                             ▼                          ▼
Canopy node (canopy.exe) ◄──socket/TCP──►  TypeScript plugin (node dist/main.js)
```

---

## 2. How the node and plugin communicate

The node launches the plugin via a control script, `plugin/typescript/pluginctl.cmd`
(`.sh` on Unix), which runs `node dist/main.js`. Entry point: `plugin/typescript/src/main.ts`.

The two processes speak a length-prefixed protobuf protocol (`FSMToPlugin` / `PluginToFSM`,
defined in `plugin.proto`). The node drives the conversation; the plugin responds:

| Node → plugin | Plugin handler (`contract.ts`) | When |
|---|---|---|
| `genesis` | `Contract.Genesis` | Chain init / export |
| `begin` | `Contract.BeginBlock` | Start of each block |
| `check` | `ContractAsync.CheckTx` | Mempool admission (stateless-ish validation) |
| `deliver` | `ContractAsync.DeliverTx` | Applying a tx inside a block |
| `end` | `Contract.EndBlock` | End of each block |

The dispatch loop lives in `plugin/typescript/src/contract/plugin.ts` (~line 318–334).

**Reading and writing chain state** is inverted: the plugin does not own the database. To read,
it sends a `query` message to the node (`plugin.StateRead(...)`) with a set of `{queryId, key}`
entries and awaits the values; to write, it sends `stateWrite`. This is why every handler defines
state keys, allocates query IDs, does one `StateRead`, then decodes the returned bytes.

---

## 3. Plugin internal structure (post-refactor)

The contract was refactored from one large file into focused modules under
`plugin/typescript/src/contract/`:

```
contract/
├── contract.ts          # Orchestrator: ContractConfig + CheckTx/DeliverTx routing + Deliver* handlers
├── plugin.ts            # Node↔plugin protocol, StateRead/StateWrite, Marshal/FromAny, JoinLenPrefix
├── game2048.ts          # Proto decode (decodeGame2048Any), GAME2048_TYPE_URLS, state encode/decode
├── game2048-board.ts    # 2048 board mechanics (re-exports shared engine)
├── game2048-rng.ts      # Deterministic RNG (re-exports shared engine)
├── game2048-replay.ts   # On-chain replay verification (re-exports shared engine)
├── rpc.ts               # Plugin's own HTTP endpoints (custom queries/widgets)
├── error.ts             # Typed plugin errors (Err*)
│
├── validation/          # Stateless message checks (checkMessage*) — structure/address/amount
├── economy/             # Fee splits + pool balance ops + competition registry (the only module that does state I/O)
├── competition/         # Daily challenge, classic & Weekly Blitz sessions/pools + scoring
├── checkin/             # Daily login rewards (streaks, reward tables)
├── shop/                # Classic-points → PROOF redemption (pricing, validation)
├── profile/             # Player identity, username, stats, points
├── config/              # Game config defaults & loading
└── utils/               # State-key generators, crypto, time, generic helpers
```

**Design intent of the split:**
- `utils/state.ts` — the single source of truth for **state keys** (`KeyFor*`). Pure functions, no logic.
- `economy/fee-distribution.ts` — the single source of truth for **fee splits** (e.g. `splitWeeklyBlitzFee`).
- `validation/` — **stateless** checks only (no state reads); returns authorized signers.
- Feature modules (`competition/`, `checkin/`, `shop/`, `profile/`) — business logic, plus their own
  `types.ts` and encode/decode helpers for the state records they own. These are **pure** (no state I/O);
  `economy/` is the exception — its `pool-operations.ts` and `competition-registry.ts` read/write state.
- `contract.ts` — the **orchestrator**. It does not contain per-feature math; it routes messages and
  calls into the modules. The actual `Deliver*` handlers live here and follow one pattern (below).

### The Deliver handler pattern

Every `DeliverMessage*` in `contract.ts` follows the same shape (see
`DeliverMessageStartWeeklyBlitzGame` for a full example):

1. Extract fields from the decoded `msg`.
2. Build the **state keys** it needs via `KeyFor*` (from `utils/state.ts`).
3. Allocate a `randomQueryId()` per key.
4. One `contract.plugin.StateRead(contract, { keys: [...] })`.
5. Pull bytes with `getQueryValue(response, queryId)` and decode (`Unmarshal` / `decode*`).
6. Run business logic (fee split, validation, scoring).
7. Write results back via `StateWrite`; return `{ events }` or `{ error }`.

---

## 4. Transaction lifecycle (end to end)

Using "Start Weekly Blitz" as the example:

1. **Frontend** (`web/explorer/src/lib/rpcChain2048.ts`) POSTs to the backend admin RPC
   (`/v1/admin/tx-2048-start-weekly-blitz`) with the player address, password, `submit:true`.
2. **Backend** (`cmd/rpc/game2048.go`) loads the key, checks the fee/balance, builds the
   `MessageStartWeeklyBlitzGame` transaction, signs it, derives the session (seed, week id,
   expiry), and calls `controller.SendTxMsgs`.
3. **Node mempool** runs **CheckTx** → routed to the plugin. The plugin first confirms the
   message type is one it **declared as supported** (`ContractConfig`), then validates it
   (`checkMessage*`). If the type isn't declared, the node rejects it here — before any handler runs.
4. Accepted txs enter the mempool and later a **block**, where **DeliverTx** runs the
   `DeliverMessage*` handler, mutating state (debits fee, updates pools, records the session).
5. The **frontend** derives the initial board locally from the returned seed and begins play.
   On finish it submits a `MessageSubmitGameResult`; the contract **replays** the moves to verify.

---

## 5. Registering a message type (why there are several touch points)

Because logic is split across layers, a single new transaction type must be declared in several
places. Missing any one causes a confusing failure. The most easily missed is
`ContractConfig.supportedTransactions` / `transactionTypeUrls` in `contract.ts` — if a type isn't
there, the node drops the tx at the mempool and it never reaches your handler (surfaces as a 400 at
submit with "no tx on chain"). The full checklist is in
[ADDING_A_FEATURE.md](ADDING_A_FEATURE.md); a guard test is recommended so the omission can't ship.

---

## 6. State model

- Keys are built with `JoinLenPrefix(prefix, ...parts)` (`plugin.ts`) using single-byte prefixes
  (`account=1`, `pool=2`, `params=7`, `game=18`) defined in `utils/state.ts`.
- **Pools** are addressed by fixed IDs (`PoolIDs` in `utils/state.ts`): DAO, Platform, Reserve,
  Shop, Daily Reward, Monthly Reward.
- Game records (sessions, submissions, prize pools, player stats, identities, redemptions, etc.)
  each have their own `KeyFor*` generator and a protobuf or JSON encode/decode pair.

---

## 7. Game modes & economy

| Mode | Entry fee | Notes |
|---|---|---|
| **Classic** | 2 PROOF | Unlimited moves; earn Classic Points → redeem in Shop |
| **Daily Challenge** | 25 PROOF | 80-move limit, shared daily board, prize pool to top players |
| **Weekly Blitz** | 5 PROOF | 5-min timer, 2 official runs/day, cumulative weekly scoring |

PROOF uses a micro-denomination: **1 PROOF = 1,000,000 uproof**. Fee splits (platform / reserve /
shop / prize) are centralized in `economy/fee-distribution.ts`.

---

## 8. Build & run model

The node loads the plugin from `plugin/typescript/dist/` (built output), **not** the `src/`.
Two facts bite people repeatedly:

1. **The plugin must be rebuilt AND its process restarted for code changes to take effect.**
   `pluginctl start` will *not* replace an already-running plugin — it reports "already running"
   and keeps the stale process. Run `pluginctl.cmd stop` first.
2. `*.exe` binaries are **git-ignored** and are build artifacts — rebuild with `go build`.

Typical clean restart:

```bash
taskkill /F /IM canopy.exe /T 2>$null
cmd /c "plugin\typescript\pluginctl.cmd stop"
cd plugin\typescript && npm run build && cd ..\..
go build -o canopy.exe ./cmd/main
.\canopy.exe start
```

Key local URLs: frontend `:5173` (dev) or `:15001`, RPC `:15002`, Admin RPC `:15003`.
