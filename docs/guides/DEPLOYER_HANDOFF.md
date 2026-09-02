# Deployer Hand-off: Game Transactions Not Persisting
**Date**: 2026-06-11

---

## Summary

On the deployed node (`arcd.val-a.grad.dev.app.canopynetwork.org`), game transactions
(check-in, start game, shop) return a txHash but never land on-chain. Faucet works.

**The application code is not the cause.** The exact same committed code (`3458cda`,
branch `2048-game`) persists game transactions correctly on local. We verified this by
observing a successful check-in produce a block "with 1 txs" locally, while every recent
deployed block has 0 txs.

The transaction is being rejected during **async mempool admission** on the deployed node.
Because submission is fire-and-forget (`SendTxMsgs` → P2P self-send), the rejection is
**only visible in the deployed node's logs** — no API exposes it. That's why we need you.

---

## What we need (one observation)

1. Set the Canopy node log level to `debug` (optional but ideal — see below). Default is `info`.
2. Have someone submit a **check-in** on the deployed app.
3. Capture the Canopy node log around that moment:
   ```bash
   tail -n 200 <dataDir>/logs/log
   ```
   (default dataDir is `~/.canopy`)
4. Also capture the plugin's stdout/stderr log (location depends on how it's run —
   pluginctl writes to `typescript-plugin.out.log` / `.err.log`).

---

## How to read the result

### In the Canopy node log

- A block line `... with 1 txs ...` → tx was admitted (would mean the problem is elsewhere; unlikely).
- All blocks `... with 0 txs ...` **plus** a line like:
  ```
  WARN: Handle tx from <peer> failed with err: <ERROR>
  ```
  → the tx was rejected during admission. The `<ERROR>` is the smoking gun:
  - contains `fromAny()` / "type not found" / "invalid message" → **routing fork**:
    the plugin is not handling the game message types (plugin not loaded, not connected,
    or running an OLD build whose advertised `supportedTransactions` list is missing the
    game types). Native Canopy validation rejected an unknown type.
  - a plugin-specific error (e.g. "invalid message cast", "fee below state limit") →
    the plugin's **CheckTx** rejected it.

### At `debug` level, the Canopy log will also print directly:
```
SupportsTransaction() called for transaction: claimDailyLoginReward
SupportsTransaction() checking against supported transactions: [...]
SupportsTransaction() result for claimDailyLoginReward: true|false
```
- `result: false` → **routing fork confirmed.** The `[...]` list shows exactly what the
  deployed plugin advertised at handshake — compare against the expected list below.

### In the plugin stdout log
- `Received check request from FSM` appears → tx reached the plugin (CheckTx path).
- Never appears → tx never reached the plugin (routing fork).

---

## Expected plugin config (from working code `3458cda`)

`supportedTransactions` should be:
```
send, startDailyGame, startClassicGame, submitGameResult,
claimDailyReward, redeemClassicPoints, claimDailyLoginReward
```
If the deployed plugin's advertised list is shorter/different, it's an old build.

---

## Most likely fix (verify first with the logs above)

```bash
# On the deployed server
cd <canopy>/plugin/typescript
git fetch origin && git checkout 2048-game && git pull origin 2048-game
git log -1 --oneline        # expect: 3458cda feat: improve game UX...
npm install && npm run build  # rebuild dist/ — stale dist is a common cause
./pluginctl.sh restart typescript
cd <canopy> && ./canopy restart   # restart node so it re-handshakes with the plugin
```

Then re-test a check-in and confirm a block shows "with 1 txs" and player state updates:
```bash
curl -X POST https://arcd.val-a.grad.dev.app.canopynetwork.org/rpc/v1/query/2048/player \
  -H "Content-Type: application/json" -d '{"address":"<PLAYER_ADDR>"}'
# expect loginStreak / points to increase
```

---

## Key facts established

- Local (commit `3458cda`) persists game txs → block "with 1 txs", player `loginStreak: 6`.
- Deployed: game txs absent from pending pool, absent from blocks, player state all zero;
  faucet (native MessageSend) works.
- Local HEAD == origin/2048-game == `3458cda`, 0 ahead/0 behind → the fix is pushed and
  available for the deployed server to pull.
- Rejection is async and server-side-only; the `WARN: Handle tx ... failed` line is the
  one piece of evidence that pinpoints routing-fork vs CheckTx.
