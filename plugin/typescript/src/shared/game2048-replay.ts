import { applyMove, canMove, createEmptyBoard, getEmptyIndexes, maxTile, type Board } from './game2048-board.js';
import { DeterministicRng } from './game2048-rng.js';

export interface ReplayInput {
    seed: Uint8Array;
    moves: number[];
    maxMoves: number;
    stopReason: number;
}

export interface ReplayResult {
    board: Board;
    score: number;
    maxTile: number;
    moveCount: number;
    endedReason: number;
    win: boolean;
}

const STOP_REASON_PLAYER_STOPPED = 1;
const STOP_REASON_NO_MOVES = 2;
const STOP_REASON_MAX_MOVES = 3;

export function replayGame(input: ReplayInput): ReplayResult {
    const board = createEmptyBoard();
    const rng = new DeterministicRng(input.seed);
    let score = 0;
    let moveCount = 0;

    spawnTile(board, rng);
    spawnTile(board, rng);

    for (const move of input.moves) {
        moveCount += 1;
        const outcome = applyMove(board, move);
        score += outcome.scoreDelta;

        for (let i = 0; i < outcome.board.length; i += 1) {
            board[i] = outcome.board[i];
        }

        if (outcome.changed) {
            spawnTile(board, rng);
        }

        if (input.maxMoves > 0 && moveCount >= input.maxMoves) {
            return finalize(board, score, moveCount, STOP_REASON_MAX_MOVES);
        }

        if (!canMove(board)) {
            return finalize(board, score, moveCount, STOP_REASON_NO_MOVES);
        }
    }

    return finalize(board, score, moveCount, input.stopReason || STOP_REASON_PLAYER_STOPPED);
}

function spawnTile(board: Board, rng: DeterministicRng): void {
    const empty = getEmptyIndexes(board);
    if (empty.length === 0) {
        return;
    }
    const index = empty[rng.nextInt(empty.length)];
    const value = rng.nextInt(10) === 0 ? 4 : 2;
    board[index] = value;
}

function finalize(board: Board, score: number, moveCount: number, endedReason: number): ReplayResult {
    const topTile = maxTile(board);
    return {
        board: [...board],
        score,
        maxTile: topTile,
        moveCount,
        endedReason,
        win: topTile >= 2048
    };
}
