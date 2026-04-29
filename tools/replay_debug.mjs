import crypto from 'node:crypto';
import { replayGame as contractReplay } from '../plugin/typescript/dist/contract/game2048-replay.js';

const address = process.argv[2];
const txHash = process.argv[3];

if (!address || !txHash) {
  console.error('Usage: node tools/replay_debug.mjs <address> <submit-tx-hash>');
  process.exit(1);
}

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

function sha256Parts(parts) {
  const hash = crypto.createHash('sha256');
  for (const part of parts) {
    hash.update(part);
    hash.update(Buffer.from([0]));
  }
  return hash.digest();
}

function u64(n) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(n));
  return buf;
}

function moveNameToInt(name) {
  switch (name) {
    case 'MOVE_DIRECTION_UP':
      return 1;
    case 'MOVE_DIRECTION_RIGHT':
      return 2;
    case 'MOVE_DIRECTION_DOWN':
      return 3;
    case 'MOVE_DIRECTION_LEFT':
      return 4;
    default:
      return 0;
  }
}

function stopNameToInt(name) {
  switch (name) {
    case 'STOP_REASON_PLAYER_STOPPED':
      return 1;
    case 'STOP_REASON_NO_MOVES':
      return 2;
    case 'STOP_REASON_MAX_MOVES':
      return 3;
    default:
      return 0;
  }
}

function stopIntToText(value) {
  switch (value) {
    case 1:
      return 'player_stopped';
    case 2:
      return 'no_moves';
    case 3:
      return 'max_moves';
    default:
      return 'player_stopped';
  }
}

const BOARD_SIZE = 4;
const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;

function createEmptyBoard() {
  return new Array(BOARD_CELLS).fill(0);
}

function frontendReplay(seedHex, moves, maxMoves, stopReason) {
  const board = createEmptyBoard();
  const rng = new FrontendDeterministicRng(seedHex);
  let score = 0;
  let moveCount = 0;

  spawnTile(board, rng);
  spawnTile(board, rng);

  for (const move of moves) {
    moveCount += 1;
    const outcome = applyMove(board, move);
    score += outcome.scoreDelta;

    for (let idx = 0; idx < BOARD_CELLS; idx += 1) {
      board[idx] = outcome.board[idx];
    }

    if (outcome.changed) {
      spawnTile(board, rng);
    }

    if (maxMoves > 0 && moveCount >= maxMoves) {
      return finalizeReplay(board, score, moveCount, 'max_moves');
    }

    if (!canMove(board)) {
      return finalizeReplay(board, score, moveCount, 'no_moves');
    }
  }

  return finalizeReplay(board, score, moveCount, stopReason);
}

function finalizeReplay(board, score, moveCount, endedReason) {
  return {
    board: [...board],
    score,
    maxTile: maxTile(board),
    moveCount,
    endedReason,
    canContinue: canMove(board),
  };
}

function spawnTile(board, rng) {
  const emptyIndexes = board.flatMap((value, index) => (value === 0 ? [index] : []));
  if (emptyIndexes.length === 0) {
    return;
  }
  const index = emptyIndexes[rng.nextInt(emptyIndexes.length)];
  board[index] = rng.nextInt(10) === 0 ? 4 : 2;
}

function canMove(board) {
  if (board.some((cell) => cell === 0)) {
    return true;
  }
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const index = row * BOARD_SIZE + col;
      const value = board[index];
      if (col + 1 < BOARD_SIZE && board[index + 1] === value) {
        return true;
      }
      if (row + 1 < BOARD_SIZE && board[index + BOARD_SIZE] === value) {
        return true;
      }
    }
  }
  return false;
}

function maxTile(board) {
  return board.reduce((max, value) => Math.max(max, value), 0);
}

function applyMove(board, direction) {
  switch (direction) {
    case 1:
      return moveUp(board);
    case 2:
      return moveRight(board);
    case 3:
      return moveDown(board);
    case 4:
      return moveLeft(board);
    default:
      return { board: [...board], changed: false, scoreDelta: 0 };
  }
}

function moveLeft(board) {
  const next = createEmptyBoard();
  let changed = false;
  let scoreDelta = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const line = getRow(board, row);
    const compressed = compressLine(line);
    setRow(next, row, compressed.line);
    if (!isSameLine(line, compressed.line)) {
      changed = true;
    }
    scoreDelta += compressed.scoreDelta;
  }
  return { board: next, changed, scoreDelta };
}

function moveRight(board) {
  const next = createEmptyBoard();
  let changed = false;
  let scoreDelta = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const line = [...getRow(board, row)].reverse();
    const compressed = compressLine(line);
    const finalLine = [...compressed.line].reverse();
    setRow(next, row, finalLine);
    if (!isSameLine(getRow(board, row), finalLine)) {
      changed = true;
    }
    scoreDelta += compressed.scoreDelta;
  }
  return { board: next, changed, scoreDelta };
}

function moveUp(board) {
  const next = createEmptyBoard();
  let changed = false;
  let scoreDelta = 0;
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const line = getColumn(board, col);
    const compressed = compressLine(line);
    setColumn(next, col, compressed.line);
    if (!isSameLine(line, compressed.line)) {
      changed = true;
    }
    scoreDelta += compressed.scoreDelta;
  }
  return { board: next, changed, scoreDelta };
}

function moveDown(board) {
  const next = createEmptyBoard();
  let changed = false;
  let scoreDelta = 0;
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const line = [...getColumn(board, col)].reverse();
    const compressed = compressLine(line);
    const finalLine = [...compressed.line].reverse();
    setColumn(next, col, finalLine);
    if (!isSameLine(getColumn(board, col), finalLine)) {
      changed = true;
    }
    scoreDelta += compressed.scoreDelta;
  }
  return { board: next, changed, scoreDelta };
}

function compressLine(line) {
  const compact = line.filter((value) => value !== 0);
  const merged = [];
  let scoreDelta = 0;
  for (let i = 0; i < compact.length; i += 1) {
    const current = compact[i];
    const next = compact[i + 1];
    if (next !== undefined && next === current) {
      const mergedValue = current * 2;
      merged.push(mergedValue);
      scoreDelta += mergedValue;
      i += 1;
    } else {
      merged.push(current);
    }
  }
  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }
  return { line: merged, scoreDelta };
}

function getRow(board, row) {
  const start = row * BOARD_SIZE;
  return board.slice(start, start + BOARD_SIZE);
}

function setRow(board, row, values) {
  const start = row * BOARD_SIZE;
  for (let i = 0; i < BOARD_SIZE; i += 1) {
    board[start + i] = values[i] ?? 0;
  }
}

function getColumn(board, column) {
  const values = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    values.push(board[row * BOARD_SIZE + column]);
  }
  return values;
}

function setColumn(board, column, values) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    board[row * BOARD_SIZE + column] = values[row] ?? 0;
  }
}

function isSameLine(a, b) {
  return a.every((value, index) => value === b[index]);
}

class FrontendDeterministicRng {
  constructor(seedHex) {
    this.seed = hexToBytes(seedHex);
    this.counter = 0n;
    this.buffer = new Uint8Array();
    this.offset = 0;
  }

  nextByte() {
    if (this.offset >= this.buffer.length) {
      this.refill();
    }
    const value = this.buffer[this.offset] ?? 0;
    this.offset += 1;
    return value;
  }

  nextInt(maxExclusive) {
    if (maxExclusive <= 0) {
      return 0;
    }
    return this.nextByte() % maxExclusive;
  }

  refill() {
    const counterBytes = new Uint8Array(8);
    const view = new DataView(counterBytes.buffer);
    view.setBigUint64(0, this.counter, false);
    this.buffer = new Uint8Array(
      crypto.createHash('sha256').update(Buffer.from(this.seed)).update(Buffer.from(counterBytes)).digest(),
    );
    this.offset = 0;
    this.counter += 1n;
  }
}

function hexToBytes(seed) {
  const normalized = seed.trim().toLowerCase();
  if (!normalized || normalized.length % 2 !== 0) {
    return new Uint8Array();
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

const failed = await post('http://localhost:50002/v1/query/failed-txs', {
  address,
  pageNumber: 1,
  perPage: 50,
});

const failedTx = failed.results.find((entry) => entry.txHash === txHash);
if (!failedTx) {
  console.log(JSON.stringify({ found: false }, null, 2));
  process.exit(0);
}

const gameId = failedTx.transaction.msg.gameId;
const senderPage = await post('http://localhost:50002/v1/query/txs-by-sender', {
  address,
  pageNumber: 1,
  perPage: 100,
});

const startTx = senderPage.results.find(
  (entry) => entry.messageType === 'startClassicGame' && entry.transaction?.msg?.gameId === gameId,
);

if (!startTx) {
  console.log(JSON.stringify({ foundFailed: true, foundStart: false, gameId }, null, 2));
  process.exit(0);
}

const msg = failedTx.transaction.msg;
const start = startTx.transaction;
const playerAddressBytes = Buffer.from(start.msg.playerAddress, 'base64');
const seed = sha256Parts([
  Buffer.from('classic-seed'),
  playerAddressBytes,
  u64(start.createdHeight),
  u64(start.time),
  u64(start.fee ?? 0),
  Buffer.from(start.memo ?? ''),
]);

const moveInts = msg.moves.map(moveNameToInt);
const stopInt = stopNameToInt(msg.stopReason);
const seedHex = seed.toString('hex');

const backend = contractReplay({
  seed,
  moves: moveInts,
  maxMoves: 0,
  stopReason: stopInt,
});

const frontend = frontendReplay(seedHex, moveInts, 0, stopIntToText(stopInt));

console.log(
  JSON.stringify(
    {
      txHash,
      gameId,
      startTxHash: startTx.txHash,
      startHeight: startTx.height,
      seedHex,
      declared: {
        score: Number(msg.declaredScore ?? 0),
        maxTile: Number(msg.declaredMaxTile ?? 0),
        stopReason: msg.stopReason,
        moveCount: msg.moves.length,
      },
      backend,
      frontend,
      backendMatchesDeclared:
        backend.score === Number(msg.declaredScore ?? 0) &&
        backend.maxTile === Number(msg.declaredMaxTile ?? 0) &&
        backend.endedReason === stopInt,
      frontendMatchesDeclared:
        frontend.score === Number(msg.declaredScore ?? 0) &&
        frontend.maxTile === Number(msg.declaredMaxTile ?? 0) &&
        stopNameToInt(msg.stopReason) === stopInt,
      frontendMatchesBackend:
        frontend.score === backend.score &&
        frontend.maxTile === backend.maxTile &&
        frontend.moveCount === backend.moveCount &&
        stopNameToInt(frontend.endedReason.toUpperCase?.() ?? '') === backend.endedReason,
      sameBoard: JSON.stringify(frontend.board) === JSON.stringify(backend.board),
    },
    null,
    2,
  ),
);
