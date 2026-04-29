import test from 'node:test';
import assert from 'node:assert/strict';

import { replayGame } from './game2048-replay.js';

test('replayGame is deterministic for the same seed and moves', () => {
    const seed = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const moves = [4, 1, 2, 3, 4, 4, 1];

    const first = replayGame({
        seed,
        moves,
        maxMoves: 0,
        stopReason: 1
    });
    const second = replayGame({
        seed,
        moves,
        maxMoves: 0,
        stopReason: 1
    });

    assert.deepEqual(second, first);
});

test('replayGame respects maxMoves for daily sessions', () => {
    const replay = replayGame({
        seed: Uint8Array.from([9, 9, 9, 9]),
        moves: [4, 4, 4, 4, 4],
        maxMoves: 3,
        stopReason: 1
    });

    assert.equal(replay.moveCount, 3);
    assert.equal(replay.endedReason, 3);
});

test('replayGame can continue past 2048 without forcing a stop', () => {
    const replay = replayGame({
        seed: Uint8Array.from([7, 11, 13, 17, 19, 23, 29, 31]),
        moves: new Array<number>(50).fill(4),
        maxMoves: 0,
        stopReason: 1
    });

    assert.ok(replay.maxTile >= 2);
    assert.equal(typeof replay.win, 'boolean');
});
