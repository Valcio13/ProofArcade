import fs from 'node:fs/promises';
import { applyMove, canMove, createEmptyBoard, getEmptyIndexes, maxTile } from '../plugin/typescript/dist/shared/game2048-board.js';
import { DeterministicRng } from '../plugin/typescript/dist/shared/game2048-rng.js';

const RPC_URL = 'http://localhost:50002';
const ADMIN_URL = 'http://localhost:50003';
const PASSWORD = 'ProofArcade!2026';
const WALLET_COUNT = 25;
const FUND_AMOUNT = 1500;
const STOP_REASON_PLAYER_STOPPED = 1;
const STOP_REASON_NO_MOVES = 2;
const STOP_REASON_MAX_MOVES = 3;
const DAILY_MODE = 'daily';
const CLASSIC_MODE = 'classic';

async function main() {
  const config = await getJson(`${RPC_URL}/v1/query/2048/config`);
  const results = [];
  for (let index = 0; index < WALLET_COUNT; index += 1) {
    const nickname = randomNickname(index);
    console.log(`\n[${index + 1}/${WALLET_COUNT}] Creating ${nickname}`);
    const address = await postJson(`${ADMIN_URL}/v1/admin/keystore-new-key`, {
      nickname,
      password: PASSWORD,
    });
    const faucet = await postJson(`${ADMIN_URL}/v1/admin/dev-faucet`, {
      address,
      amount: FUND_AMOUNT,
    });
    if (faucet?.txHash) {
      await waitForIndexed(faucet.txHash);
    }
    await waitForBalance(address, config.dailyFee + config.classicFee);

    const walletResult = {
      nickname,
      address,
      funded: FUND_AMOUNT,
      faucetTxHash: faucet?.txHash ?? '',
      daily: null,
      classic: null,
    };

    for (const mode of [DAILY_MODE, CLASSIC_MODE]) {
      console.log(`  -> starting ${mode}`);
      const startPath = mode === DAILY_MODE
        ? `${ADMIN_URL}/v1/admin/tx-2048-start-daily`
        : `${ADMIN_URL}/v1/admin/tx-2048-start-classic`;
      const start = await postJson(startPath, {
        address,
        password: PASSWORD,
        submit: true,
      });
      await waitForIndexed(start.txHash);
      const maxMoves = Number(start.maxMoves ?? 0);
      const simulation = simulateRun({
        seedHex: start.seed,
        maxMoves,
        mode,
      });
      const submit = await postJson(`${ADMIN_URL}/v1/admin/tx-2048-submit`, {
        address,
        password: PASSWORD,
        gameId: start.gameId,
        declaredScore: simulation.score,
        declaredMaxTile: simulation.maxTile,
        stopReason: simulation.stopReason,
        moves: simulation.moves,
        submit: true,
      });
      const submitStage = await waitForIndexed(submit.txHash);
      walletResult[mode] = {
        startTxHash: start.txHash,
        submitTxHash: submit.txHash,
        submitStage,
        gameId: start.gameId,
        score: simulation.score,
        maxTile: simulation.maxTile,
        moveCount: simulation.moves.length,
        stopReason: simulation.stopReason,
      };
      console.log(`  -> ${mode} submitted score=${simulation.score} tile=${simulation.maxTile} moves=${simulation.moves.length}`);
    }

    results.push(walletResult);
  }

  await fs.writeFile(
    new URL('./batch_2048_wallets_results.json', import.meta.url),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        password: PASSWORD,
        results,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('\nCompleted batch run.');
  console.log(JSON.stringify(results, null, 2));
}

function randomNickname(index) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `bot${String(index + 1).padStart(2, '0')}-${suffix}`;
}

function simulateRun({ seedHex, maxMoves, mode }) {
  const seed = hexToBytes(seedHex);
  const board = createEmptyBoard();
  const rng = new DeterministicRng(seed);
  const moves = [];
  let score = 0;

  spawnTile(board, rng);
  spawnTile(board, rng);

  const softTarget = mode === DAILY_MODE
    ? Math.min(maxMoves || 60, randomBetween(20, 55))
    : randomBetween(24, 60);

  while (canMove(board)) {
    const validMoves = [1, 2, 3, 4]
      .map((direction) => ({ direction, outcome: applyMove(board, direction) }))
      .filter((candidate) => candidate.outcome.changed);

    if (validMoves.length === 0) {
      break;
    }

    const preferred = validMoves
      .filter((candidate) => candidate.outcome.scoreDelta > 0)
      .sort((left, right) => right.outcome.scoreDelta - left.outcome.scoreDelta);
    const pool = preferred.length > 0 ? preferred.slice(0, Math.min(preferred.length, 2)) : validMoves;
    const chosen = pool[rng.nextInt(pool.length)];
    moves.push(chosen.direction);
    score += chosen.outcome.scoreDelta;
    for (let i = 0; i < chosen.outcome.board.length; i += 1) {
      board[i] = chosen.outcome.board[i];
    }
    spawnTile(board, rng);

    if (maxMoves > 0 && moves.length >= maxMoves) {
      return {
        moves,
        score,
        maxTile: maxTile(board),
        stopReason: STOP_REASON_MAX_MOVES,
      };
    }

    if (moves.length >= softTarget && mode === CLASSIC_MODE) {
      return {
        moves,
        score,
        maxTile: maxTile(board),
        stopReason: STOP_REASON_PLAYER_STOPPED,
      };
    }

    if (moves.length >= softTarget && mode === DAILY_MODE && rng.nextInt(4) === 0) {
      return {
        moves,
        score,
        maxTile: maxTile(board),
        stopReason: STOP_REASON_PLAYER_STOPPED,
      };
    }
  }

  return {
    moves,
    score,
    maxTile: maxTile(board),
    stopReason: STOP_REASON_NO_MOVES,
  };
}

function spawnTile(board, rng) {
  const empty = getEmptyIndexes(board);
  if (empty.length === 0) {
    return;
  }
  const index = empty[rng.nextInt(empty.length)];
  board[index] = rng.nextInt(10) === 0 ? 4 : 2;
}

function randomBetween(minInclusive, maxInclusive) {
  return minInclusive + Math.floor(Math.random() * (maxInclusive - minInclusive + 1));
}

function hexToBytes(seedHex) {
  const normalized = String(seedHex || '').trim().toLowerCase();
  if (!normalized || normalized.length % 2 !== 0) {
    throw new Error(`Invalid seed: ${seedHex}`);
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

async function waitForIndexed(txHash, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await postJson(`${RPC_URL}/v1/query/tx-by-hash`, { hash: txHash });
      return 'indexed';
    } catch {
      await delay(800);
    }
  }
  return 'submitted';
}

async function waitForBalance(address, minimumBalance, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const player = await postJson(`${RPC_URL}/v1/query/2048/player`, { address });
      if (Number(player?.balance ?? 0) >= minimumBalance) {
        return;
      }
    } catch {
      // keep polling
    }
    await delay(800);
  }
  throw new Error(`Timed out waiting for funded balance on ${address}`);
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw await toError(response);
  }
  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await toError(response);
  }
  return response.json();
}

async function toError(response) {
  try {
    const payload = await response.json();
    if (payload?.error) {
      return new Error(payload.error);
    }
    return new Error(JSON.stringify(payload));
  } catch {
    return new Error(`HTTP ${response.status}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
