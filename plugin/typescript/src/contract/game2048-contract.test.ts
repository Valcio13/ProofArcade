import test from 'node:test';
import assert from 'node:assert/strict';

import Long from 'long';

import {
    Contract,
    ContractAsync,
    KeyForAccount,
    KeyForClassicPointsDailyLedger,
    KeyForDailyAttempt,
    KeyForDailyLeaderboard,
    KeyForDailyLoginClaim,
    KeyForDailyPrizePool,
    KeyForDailyRewardByPlayer,
    KeyForDailySubmission,
    KeyForGameDailyRewardPool,
    KeyForGamePlatformPool,
    KeyForGameReservePool,
    KeyForGameShopPool,
    KeyForGameSession,
    KeyForGameConfig,
    KeyForGameTreasury,
    KeyForPlayerStats
} from './contract.js';
import { encodeGame2048State, decodeGame2048State } from './game2048.js';
import { replayGame } from './game2048-replay.js';
import { types } from '../proto/types.js';

type StateMap = Map<string, Uint8Array>;

class FakePlugin {
    readonly state: StateMap;
    lastWriteSets: Array<{ key: Uint8Array; value: Uint8Array }> = [];
    lastWriteDeletes: Array<{ key: Uint8Array }> = [];

    constructor(state?: StateMap) {
        this.state = state ?? new Map<string, Uint8Array>();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async StateRead(_contract: any, request: any): Promise<[any, null]> {
        if (request.ranges && request.ranges.length > 0) {
            const range = request.ranges[0]
            const prefixHex = keyHex(range.prefix)
            const limit = range.limit || Number.MAX_SAFE_INTEGER
            const entries = [...this.state.entries()]
                .filter(([key]) => key.startsWith(prefixHex))
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(0, limit)
                .map(([key, value]) => ({
                    key: Uint8Array.from(Buffer.from(key, 'hex')),
                    value,
                }))
            return [{ results: [{ entries }] }, null]
        }
        const results = (request.keys || []).map((entry: { queryId: Long; key: Uint8Array }) => {
            const value = this.state.get(keyHex(entry.key));
            return {
                queryId: entry.queryId,
                entries: value ? [{ key: entry.key, value }] : []
            };
        });
        return [{ results }, null];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async StateWrite(_contract: any, request: any): Promise<[any, null]> {
        this.lastWriteSets = request.sets || [];
        this.lastWriteDeletes = request.deletes || [];

        for (const set of request.sets || []) {
            this.state.set(keyHex(set.key), set.value);
        }
        for (const del of request.deletes || []) {
            this.state.delete(keyHex(del.key));
        }

        return [{}, null];
    }
}

class DelayedVisibilityPlugin extends FakePlugin {
    deferredSets: Array<{ key: Uint8Array; value: Uint8Array }> = [];
    deferNextWriteVisibility = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async StateWrite(_contract: any, request: any): Promise<[any, null]> {
        this.lastWriteSets = request.sets || [];
        this.lastWriteDeletes = request.deletes || [];

        if (this.deferNextWriteVisibility) {
            this.deferNextWriteVisibility = false;
            this.deferredSets = request.sets || [];
            return [{}, null];
        }

        for (const set of this.deferredSets) {
            this.state.set(keyHex(set.key), set.value);
        }
        this.deferredSets = [];

        for (const set of request.sets || []) {
            this.state.set(keyHex(set.key), set.value);
        }
        for (const del of request.deletes || []) {
            this.state.delete(keyHex(del.key));
        }

        return [{}, null];
    }
}

test('startDailyGame rejects a second daily attempt for the same address and date', async () => {
    const playerAddress = addressOf(0xaa);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForDailyAttempt('2026-04-21', playerAddress)),
        encodeGame2048State('DailyAttempt', {
            utcDate: '2026-04-21',
            playerAddress,
            gameId: Uint8Array.from([1, 2, 3])
        })
    );

    const result = await ContractAsync.DeliverMessageStartDailyGame(
        contract,
        { playerAddress, utcDate: '2026-04-21' },
        {
            fee: 200,
            createdHeight: 10,
            time: 1713657600,
            memo: 'daily'
        }
    );

    assert.equal(result.error?.msg, 'player already used their daily attempt');
});

test('claimDailyLoginReward grants day-1 points without the bonus and blocks duplicate same-day claims', async () => {
    const playerAddress = addressOf(0xa1);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', { playerAddress })
    );

    const firstClaim = await ContractAsync.DeliverMessageClaimDailyLoginReward(
        contract,
        { playerAddress },
        { time: Date.parse('2026-04-26T02:00:00.000Z') * 1000 }
    );

    assert.equal(firstClaim.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
        loginStreak: number | Long;
        lastLoginClaimUtcDate: string;
        classicPointsBonusUtcDate: string;
    };
    assert.equal(toNumber(stats.classicPointsBalance), 20);
    assert.equal(toNumber(stats.classicPointsEarned), 20);
    assert.equal(toNumber(stats.loginStreak), 1);
    assert.equal(stats.lastLoginClaimUtcDate, '2026-04-26');
    assert.equal(stats.classicPointsBonusUtcDate, '');

    const claimBytes = plugin.state.get(keyHex(KeyForDailyLoginClaim('2026-04-26', playerAddress)));
    assert.ok(claimBytes);

    const secondClaim = await ContractAsync.DeliverMessageClaimDailyLoginReward(
        contract,
        { playerAddress },
        { time: Date.parse('2026-04-26T09:30:00.000Z') * 1000 }
    );

    assert.equal(secondClaim.error?.msg, 'daily login reward already claimed for this UTC day');
});

test('claimDailyLoginReward increments the streak on consecutive UTC days without unlocking the bonus early', async () => {
    const playerAddress = addressOf(0xa2);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            classicPointsBalance: 20,
            classicPointsEarned: 20,
            loginStreak: 1,
            lastLoginClaimUtcDate: '2026-04-25',
            classicPointsBonusUtcDate: ''
        })
    );

    const result = await ContractAsync.DeliverMessageClaimDailyLoginReward(
        contract,
        { playerAddress },
        { time: Date.parse('2026-04-26T01:00:00.000Z') * 1000 }
    );

    assert.equal(result.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
        loginStreak: number | Long;
        lastLoginClaimUtcDate: string;
        classicPointsBonusUtcDate: string;
    };
    assert.equal(toNumber(stats.classicPointsBalance), 45);
    assert.equal(toNumber(stats.classicPointsEarned), 45);
    assert.equal(toNumber(stats.loginStreak), 2);
    assert.equal(stats.lastLoginClaimUtcDate, '2026-04-26');
    assert.equal(stats.classicPointsBonusUtcDate, '');
});

test('classic submit applies same-day login bonus only after a day-7 claim and before the daily cap', async () => {
    const playerAddress = addressOf(0xa3);
    const gameId = Uint8Array.from([2, 2, 2, 2]);
    const seed = Uint8Array.from([4, 8, 15, 16, 23, 42, 7, 9]);
    const moves = [4, 1, 2, 4, 3, 4, 1, 2];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 0,
        stopReason: 1
    });
    const basePoints = Math.floor(replay.score / 32);
    const bonusPoints = Math.floor(basePoints * 0.2);

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            classicPointsBalance: 50,
            classicPointsEarned: 50,
            loginStreak: 7,
            lastLoginClaimUtcDate: '2026-04-26',
            classicPointsBonusUtcDate: '2026-04-26'
        })
    );
    plugin.state.set(
        keyHex(KeyForClassicPointsDailyLedger('2026-04-26', playerAddress)),
        encodeGame2048State('ClassicPointsDailyLedger', {
            utcDate: '2026-04-26',
            playerAddress,
            earnedPoints: 0
        })
    );
    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 2,
            utcDate: '',
            seed,
            status: 1,
            startedHeight: 99,
            startedAtUnix: 1713657600,
            feePaid: 90,
            maxMoves: 0
        })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: Date.parse('2026-04-26T06:00:00.000Z') * 1000 }
    );

    assert.equal(result.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
    };
    assert.equal(toNumber(stats.classicPointsBalance), 50 + basePoints + bonusPoints);
    assert.equal(toNumber(stats.classicPointsEarned), 50 + basePoints + bonusPoints);

    const ledgerBytes = plugin.state.get(keyHex(KeyForClassicPointsDailyLedger('2026-04-26', playerAddress)));
    assert.ok(ledgerBytes);
    const [ledgerRaw] = decodeGame2048State('ClassicPointsDailyLedger', ledgerBytes as Uint8Array);
    const ledger = ledgerRaw as { earnedPoints: number | Long };
    assert.equal(toNumber(ledger.earnedPoints), basePoints + bonusPoints);
});

test('claimDailyLoginReward unlocks the same-day bonus on day 7', async () => {
    const playerAddress = addressOf(0xa4);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            classicPointsBalance: 195,
            classicPointsEarned: 195,
            loginStreak: 6,
            lastLoginClaimUtcDate: '2026-04-25',
            classicPointsBonusUtcDate: ''
        })
    );

    const result = await ContractAsync.DeliverMessageClaimDailyLoginReward(
        contract,
        { playerAddress },
        { time: Date.parse('2026-04-26T01:00:00.000Z') * 1000 }
    );

    assert.equal(result.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
        loginStreak: number | Long;
        classicPointsBonusUtcDate: string;
    };
    assert.equal(toNumber(stats.classicPointsBalance), 245);
    assert.equal(toNumber(stats.classicPointsEarned), 245);
    assert.equal(toNumber(stats.loginStreak), 7);
    assert.equal(stats.classicPointsBonusUtcDate, '2026-04-26');

    const claimBytes = plugin.state.get(keyHex(KeyForDailyLoginClaim('2026-04-26', playerAddress)));
    assert.ok(claimBytes);
    const [claimRaw] = decodeGame2048State('DailyLoginClaim', claimBytes as Uint8Array);
    const claim = claimRaw as { bonusBps: number | Long; streakDay: number | Long };
    assert.equal(toNumber(claim.streakDay), 7);
    assert.equal(toNumber(claim.bonusBps), 2000);
});

test('startClassicGame deducts fee, creates session, and increments classic starts', async () => {
    const playerAddress = addressOf(0xab);
    const gameId = Uint8Array.from([1, 2, 3, 4, 5, 6]);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForAccount(playerAddress)),
        encodeAccount(playerAddress, 500)
    );
    plugin.state.set(keyHex(KeyForGamePlatformPool()), encodePool(131072, 1000));
    plugin.state.set(keyHex(KeyForGameReservePool()), encodePool(131073, 1000));
    plugin.state.set(keyHex(KeyForGameShopPool()), encodePool(131074, 1000));
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: 0,
            classicGamesStarted: 0,
            gamesCompleted: 0,
            wins: 0,
            losses: 0,
            bestDailyScore: 0,
            bestClassicScore: 0,
            bestTile: 0,
            totalScore: 0,
            classicPointsBalance: 0,
            classicPointsEarned: 0
        })
    );

    const result = await ContractAsync.DeliverMessageStartClassicGame(
        contract,
        { playerAddress, gameId },
        {
            fee: 90,
            createdHeight: 55,
            time: 1713657600,
            memo: ''
        }
    );

    assert.equal(result.error, undefined);

    const accountBytes = plugin.state.get(keyHex(KeyForAccount(playerAddress)));
    assert.ok(accountBytes);
    const [account] = UnmarshalAccount(accountBytes as Uint8Array);
    assert.equal(account.amount, 410);

    const shopPoolBytes = plugin.state.get(keyHex(KeyForGameShopPool()));
    assert.ok(shopPoolBytes);
    const [shopPool] = UnmarshalPool(shopPoolBytes as Uint8Array);
    assert.equal(shopPool.amount, 1045);

    const sessionBytes = plugin.state.get(keyHex(KeyForGameSession(gameId)));
    assert.ok(sessionBytes);
    const [sessionRaw] = decodeGame2048State('GameSession', sessionBytes as Uint8Array);
    const session = sessionRaw as {
        status: number | Long;
        feePaid: number | Long;
        maxMoves: number | Long;
        seed: Uint8Array;
    };
    assert.equal(toNumber(session.status), 1);
    assert.equal(toNumber(session.feePaid), 90);
    assert.equal(toNumber(session.maxMoves), 0);
    assert.ok((session.seed?.length || 0) > 0);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as { classicGamesStarted: number | Long };
    assert.equal(toNumber(stats.classicGamesStarted), 1);
});

test('CheckTx accepts rebalanced fees when chain config still stores the legacy fee pair', async () => {
    const playerAddress = addressOf(0xae);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameConfig()),
        encodeGame2048State('GameConfig', {
            dailyStartFee: 240,
            classicStartFee: 90
        })
    );

    const result = await ContractAsync.CheckTx(contract, {
        tx: {
            fee: 2,
            msg: {
                typeUrl: 'type.googleapis.com/types.MessageStartClassicGame',
                value: types.MessageStartClassicGame.encode(
                    types.MessageStartClassicGame.create({
                        playerAddress,
                        gameId: Uint8Array.from([7, 7, 7, 7]),
                    })
                ).finish()
            }
        }
    });

    assert.equal(result.error, undefined);
});

test('startDailyGame routes fees into daily reward pool and treasury buckets', async () => {
    const playerAddress = addressOf(0xad);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForAccount(playerAddress)),
        encodeAccount(playerAddress, 1000)
    );
    plugin.state.set(keyHex(KeyForGamePlatformPool()), encodePool(131072, 0));
    plugin.state.set(keyHex(KeyForGameReservePool()), encodePool(131073, 0));
    plugin.state.set(keyHex(KeyForGameShopPool()), encodePool(131074, 0));
    plugin.state.set(keyHex(KeyForGameDailyRewardPool()), encodePool(131075, 0));

    const result = await ContractAsync.DeliverMessageStartDailyGame(
        contract,
        { playerAddress, utcDate: '2026-04-24', gameId: Uint8Array.from([2, 4, 6, 8]) },
        { fee: 25, createdHeight: 10, time: 1713657600, memo: 'daily' }
    );

    assert.equal(result.error, undefined);

    const poolBytes = plugin.state.get(keyHex(KeyForDailyPrizePool('2026-04-24')));
    assert.ok(poolBytes);
    const [poolRaw] = decodeGame2048State('DailyPrizePool', poolBytes as Uint8Array);
    const pool = poolRaw as {
        entryCount: number | Long
        grossFees: number | Long
        treasuryFees: number | Long
        rewardPool: number | Long
    }
    assert.equal(toNumber(pool.entryCount), 1);
    assert.equal(toNumber(pool.grossFees), 25);
    assert.equal(toNumber(pool.treasuryFees), 4);
    assert.equal(toNumber(pool.rewardPool), 20);

    const treasuryBytes = plugin.state.get(keyHex(KeyForGameTreasury()));
    assert.ok(treasuryBytes);
    const [treasuryRaw] = decodeGame2048State('GameTreasury', treasuryBytes as Uint8Array);
    const treasury = treasuryRaw as {
        platformBalance: number | Long
        reserveBalance: number | Long
        shopBalance: number | Long
    }
    assert.equal(toNumber(treasury.platformBalance), 1);
    assert.equal(toNumber(treasury.reserveBalance), 2);
    assert.equal(toNumber(treasury.shopBalance), 1);
});

test('submitGameResult finalizes an active session and writes a leaderboard entry', async () => {
    const playerAddress = addressOf(0xbb);
    const gameId = Uint8Array.from([9, 8, 7, 6]);
    const seed = Uint8Array.from([3, 1, 4, 1, 5, 9, 2, 6]);
    const moves = [4, 1, 4, 2, 3, 4];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 20,
        stopReason: 1
    });

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 1,
            utcDate: '2026-04-21',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 200,
            maxMoves: 20
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: 1,
            classicGamesStarted: 0,
            gamesCompleted: 0,
            wins: 0,
            losses: 0,
            bestDailyScore: 0,
            bestClassicScore: 0,
            bestTile: 0,
            totalScore: 0,
            classicPointsBalance: 0,
            classicPointsEarned: 0
        })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: 1713657900 }
    );

    assert.equal(result.error, undefined);

    const updatedSessionBytes = plugin.state.get(keyHex(KeyForGameSession(gameId)));
    assert.ok(updatedSessionBytes);
    const [updatedSession] = decodeGame2048State('GameSession', updatedSessionBytes as Uint8Array);
    const session = updatedSession as {
        status: number | Long;
        submittedScore: number | Long;
        finalMoveCount: number | Long;
    };
    assert.equal(Long.isLong(session.status) ? session.status.toNumber() : session.status, 2);
    assert.equal(
        Long.isLong(session.submittedScore)
            ? session.submittedScore.toNumber()
            : session.submittedScore,
        replay.score
    );
    assert.equal(
        Long.isLong(session.finalMoveCount)
            ? session.finalMoveCount.toNumber()
            : session.finalMoveCount,
        replay.moveCount
    );

    const updatedStatsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(updatedStatsBytes);
    const [updatedStats] = decodeGame2048State('PlayerStats', updatedStatsBytes as Uint8Array);
    const stats = updatedStats as {
        gamesCompleted: number | Long;
        totalScore: number | Long;
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
    };
    assert.equal(
        Long.isLong(stats.gamesCompleted) ? stats.gamesCompleted.toNumber() : stats.gamesCompleted,
        1
    );
    assert.equal(
        Long.isLong(stats.totalScore) ? stats.totalScore.toNumber() : stats.totalScore,
        replay.score
    );
    assert.equal(toNumber(stats.classicPointsBalance), Math.floor(replay.score / 32));
    assert.equal(toNumber(stats.classicPointsEarned), Math.floor(replay.score / 32));

    const wroteLeaderboard = plugin.lastWriteSets.some((entry) => !keyHex(entry.key).includes(keyHex(KeyForGameSession(gameId))));
    assert.ok(wroteLeaderboard);
});

test('submitGameResult updates daily leaderboard and bestDailyScore for daily runs', async () => {
    const playerAddress = addressOf(0xbc);
    const gameId = Uint8Array.from([6, 6, 6, 6]);
    const seed = Uint8Array.from([10, 11, 12, 13, 14, 15, 16, 17]);
    const moves = [4, 1, 2, 4, 3, 4, 1, 2];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 80,
        stopReason: 1
    });

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 1,
            utcDate: '2026-04-24',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 240,
            maxMoves: 80
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: 1,
            classicGamesStarted: 0,
            gamesCompleted: 0,
            wins: 0,
            losses: 0,
            bestDailyScore: 0,
            bestClassicScore: 0,
            bestTile: 0,
            totalScore: 0,
            classicPointsBalance: 0,
            classicPointsEarned: 0
        })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: 1713657900 }
    );

    assert.equal(result.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        gamesCompleted: number | Long;
        losses: number | Long;
        bestDailyScore: number | Long;
        bestTile: number | Long;
        totalScore: number | Long;
        classicPointsBalance: number | Long;
    };
    assert.equal(toNumber(stats.gamesCompleted), 1);
    assert.equal(toNumber(stats.losses), 1);
    assert.equal(toNumber(stats.bestDailyScore), replay.score);
    assert.equal(toNumber(stats.bestTile), replay.maxTile);
    assert.equal(toNumber(stats.totalScore), replay.score);
    assert.equal(toNumber(stats.classicPointsBalance), 0);

    const dailySubmissionBytes = plugin.state.get(keyHex(KeyForDailySubmission('2026-04-24', playerAddress)));
    assert.ok(dailySubmissionBytes);
    const [dailySubmissionRaw] = decodeGame2048State('DailySubmission', dailySubmissionBytes as Uint8Array);
    const dailySubmission = dailySubmissionRaw as {
        score: number | Long;
        maxTile: number | Long;
        moveCount: number | Long;
        submittedAtUnix: number | Long;
    };
    assert.equal(toNumber(dailySubmission.score), replay.score);
    assert.equal(toNumber(dailySubmission.maxTile), replay.maxTile);
    assert.equal(toNumber(dailySubmission.moveCount), replay.moveCount);
    assert.ok(toNumber(dailySubmission.submittedAtUnix) > 0);

    const wroteDailyLeaderboard = plugin.lastWriteSets.some((entry) => {
        const [decoded] = decodeGame2048State('LeaderboardEntry', entry.value);
        return !!decoded;
    });
    assert.ok(wroteDailyLeaderboard);
});

test('submitGameResult respects the daily classic-points cap without rejecting the run', async () => {
    const playerAddress = addressOf(0xbd);
    const gameId = Uint8Array.from([7, 7, 7, 7]);
    const seed = Uint8Array.from([21, 22, 23, 24, 25, 26, 27, 28]);
    const classicPointsUtcDate = '2026-04-21';
    const endedAtMicros = Date.parse(`${classicPointsUtcDate}T00:05:00.000Z`) * 1000;
    const moves = [4, 1, 2, 4, 3, 4, 1, 2, 4, 4, 3];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 0,
        stopReason: 1
    });

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 2,
            utcDate: '',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 90,
            maxMoves: 0
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: 0,
            classicGamesStarted: 1,
            gamesCompleted: 0,
            wins: 0,
            losses: 0,
            bestDailyScore: 0,
            bestClassicScore: 0,
            bestTile: 0,
            totalScore: 0,
            classicPointsBalance: 100,
            classicPointsEarned: 1995
        })
    );
    plugin.state.set(
        keyHex(KeyForClassicPointsDailyLedger(classicPointsUtcDate, playerAddress)),
        encodeGame2048State('ClassicPointsDailyLedger', {
            utcDate: classicPointsUtcDate,
            playerAddress,
            earnedPoints: 1995
        })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: endedAtMicros }
    );

    assert.equal(result.error, undefined);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
    };
    const expectedEarnedPoints = Math.min(
        replay.score < 64 ? 0 : Math.floor(replay.score / 32),
        5
    );
    assert.equal(toNumber(stats.classicPointsBalance), 100 + expectedEarnedPoints);
    assert.equal(toNumber(stats.classicPointsEarned), 1995 + expectedEarnedPoints);

    const ledgerBytes = plugin.state.get(keyHex(KeyForClassicPointsDailyLedger(classicPointsUtcDate, playerAddress)));
    assert.ok(ledgerBytes);
    const [ledgerRaw] = decodeGame2048State('ClassicPointsDailyLedger', ledgerBytes as Uint8Array);
    const ledger = ledgerRaw as { earnedPoints: number | Long };
    assert.equal(toNumber(ledger.earnedPoints), 1995 + expectedEarnedPoints);
});

test('redeemClassicPoints burns point balance and pays the player from treasury', async () => {
    const playerAddress = addressOf(0xbe);
    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForAccount(playerAddress)),
        encodeAccount(playerAddress, 50)
    );
    plugin.state.set(
        keyHex(KeyForGameShopPool()),
        encodePool(131074, 500)
    );
    plugin.state.set(
        keyHex(KeyForGameTreasury()),
        encodeGame2048State('GameTreasury', {
            platformBalance: 20,
            reserveBalance: 40,
            shopBalance: 10,
            updatedAtUnix: 0
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: 0,
            classicGamesStarted: 3,
            gamesCompleted: 3,
            wins: 0,
            losses: 3,
            bestDailyScore: 0,
            bestClassicScore: 2048,
            bestTile: 128,
            totalScore: 4000,
            classicPointsBalance: 900,
            classicPointsEarned: 1200
        })
    );

    const result = await ContractAsync.DeliverMessageRedeemClassicPoints(
        contract,
        {
            playerAddress,
            burnPoints: 300
        },
        { time: 1713657900 }
    );

    assert.equal(result.error, undefined);

    const accountBytes = plugin.state.get(keyHex(KeyForAccount(playerAddress)));
    assert.ok(accountBytes);
    const [account] = UnmarshalAccount(accountBytes as Uint8Array);
    assert.equal(account.amount, 51);

    const poolBytes = plugin.state.get(keyHex(KeyForGameShopPool()));
    assert.ok(poolBytes);
    const [pool] = UnmarshalPool(poolBytes as Uint8Array);
    assert.equal(pool.amount, 499);

    const treasuryBytes = plugin.state.get(keyHex(KeyForGameTreasury()));
    assert.ok(treasuryBytes);
    const [treasuryRaw] = decodeGame2048State('GameTreasury', treasuryBytes as Uint8Array);
    const treasury = treasuryRaw as { shopBalance: number | Long };
    assert.equal(toNumber(treasury.shopBalance), 9);

    const statsBytes = plugin.state.get(keyHex(KeyForPlayerStats(playerAddress)));
    assert.ok(statsBytes);
    const [statsRaw] = decodeGame2048State('PlayerStats', statsBytes as Uint8Array);
    const stats = statsRaw as {
        classicPointsBalance: number | Long;
        classicPointsEarned: number | Long;
    };
    assert.equal(toNumber(stats.classicPointsBalance), 600);
    assert.equal(toNumber(stats.classicPointsEarned), 1200);
});

test('submitGameResult rejects mismatched replay claims', async () => {
    const playerAddress = addressOf(0xcc);
    const gameId = Uint8Array.from([1, 1, 2, 3]);
    const seed = Uint8Array.from([8, 6, 7, 5, 3, 0, 9]);

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 2,
            utcDate: '',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 100,
            maxMoves: 0
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', {
            playerAddress
        })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves: [4, 4, 4],
            declaredScore: 999999,
            declaredMaxTile: 2048,
            stopReason: 1
        },
        { time: 1713657900 }
    );

    assert.equal(result.error?.msg, 'submitted game result does not match deterministic replay');
});

test('submitGameResult rejects invalid move directions before replay', async () => {
    const playerAddress = addressOf(0xce);
    const gameId = Uint8Array.from([4, 4, 4, 4]);
    const seed = Uint8Array.from([9, 9, 9, 9, 9, 9, 9, 9]);

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 2,
            utcDate: '',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 90,
            maxMoves: 0
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', { playerAddress })
    );

    const result = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves: [4, 5, 1],
            declaredScore: 0,
            declaredMaxTile: 0,
            stopReason: 1
        },
        { time: 1713657900 }
    );

    assert.equal(result.error?.msg, 'submitted move list contains an invalid move direction');
});

test('claimDailyReward finalizes a finished day and transfers the winner reward', async () => {
    const playerAddress = addressOf(0xdd);
    const gameId = Uint8Array.from([7, 7, 7, 7]);
    const seed = Uint8Array.from([3, 1, 4, 1, 5, 9, 2, 6]);
    const moves = [4, 1, 4, 2, 3, 4];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 80,
        stopReason: 1
    });

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(keyHex(KeyForAccount(playerAddress)), encodeAccount(playerAddress, 0));
    plugin.state.set(keyHex(KeyForGameDailyRewardPool()), encodePool(131075, 240));
    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 1,
            utcDate: '2026-04-23',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 240,
            maxMoves: 80
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', { playerAddress })
    );
    plugin.state.set(
        keyHex(KeyForDailyPrizePool('2026-04-23')),
        encodeGame2048State('DailyPrizePool', {
            utcDate: '2026-04-23',
            entryCount: 1,
            grossFees: 240,
            treasuryFees: 12,
            rewardPool: 228,
            finalized: false,
            finalizedAtUnix: 0,
            distributedRewards: 0,
            treasuryLeftover: 0
        })
    );

    const submitResult = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: Date.parse('2026-04-23T12:00:00.000Z') * 1000 }
    );
    assert.equal(submitResult.error, undefined);

    const claimResult = await ContractAsync.DeliverMessageClaimDailyReward(
        contract,
        {
            playerAddress,
            utcDate: '2026-04-23'
        },
        { time: Date.parse('2026-04-24T00:00:00.000Z') * 1000 }
    );
    assert.equal(claimResult.error, undefined);

    const accountBytes = plugin.state.get(keyHex(KeyForAccount(playerAddress)));
    assert.ok(accountBytes);
    const [account] = UnmarshalAccount(accountBytes as Uint8Array);
    assert.equal(account.amount, 228);

    const rewardIndexBytes = plugin.state.get(keyHex(KeyForDailyRewardByPlayer('2026-04-23', playerAddress)));
    assert.ok(rewardIndexBytes);
});

test('claimDailyReward succeeds even when finalization writes are not immediately readable in the same tx', async () => {
    const playerAddress = addressOf(0xde);
    const gameId = Uint8Array.from([8, 8, 8, 8]);
    const seed = Uint8Array.from([6, 2, 6, 4, 3, 8, 3, 2]);
    const moves = [4, 1, 4, 2, 3, 4];
    const replay = replayGame({
        seed,
        moves,
        maxMoves: 80,
        stopReason: 1
    });

    const plugin = new DelayedVisibilityPlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(keyHex(KeyForAccount(playerAddress)), encodeAccount(playerAddress, 0));
    plugin.state.set(keyHex(KeyForGameDailyRewardPool()), encodePool(131075, 240));
    plugin.state.set(
        keyHex(KeyForGameSession(gameId)),
        encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 1,
            utcDate: '2026-04-23',
            seed,
            status: 1,
            startedHeight: 10,
            startedAtUnix: 1713657600,
            feePaid: 240,
            maxMoves: 80
        })
    );
    plugin.state.set(
        keyHex(KeyForPlayerStats(playerAddress)),
        encodeGame2048State('PlayerStats', { playerAddress })
    );
    plugin.state.set(
        keyHex(KeyForDailyPrizePool('2026-04-23')),
        encodeGame2048State('DailyPrizePool', {
            utcDate: '2026-04-23',
            entryCount: 1,
            grossFees: 240,
            treasuryFees: 12,
            rewardPool: 228,
            finalized: false,
            finalizedAtUnix: 0,
            distributedRewards: 0,
            treasuryLeftover: 0
        })
    );

    const submitResult = await ContractAsync.DeliverMessageSubmitGameResult(
        contract,
        {
            playerAddress,
            gameId,
            moves,
            declaredScore: replay.score,
            declaredMaxTile: replay.maxTile,
            stopReason: replay.endedReason
        },
        { time: Date.parse('2026-04-23T12:00:00.000Z') * 1000 }
    );
    assert.equal(submitResult.error, undefined);

    const claimResult = await ContractAsync.DeliverMessageClaimDailyReward(
        contract,
        {
            playerAddress,
            utcDate: '2026-04-23'
        },
        { time: Date.parse('2026-04-24T00:00:00.000Z') * 1000 }
    );
    assert.equal(claimResult.error, undefined);

    const rewardIndexBytes = plugin.state.get(keyHex(KeyForDailyRewardByPlayer('2026-04-23', playerAddress)));
    assert.ok(rewardIndexBytes);

    const [account] = UnmarshalAccount(plugin.state.get(keyHex(KeyForAccount(playerAddress))) as Uint8Array);
    assert.equal(account.amount, 228);
});

test('claimDailyReward renormalizes payouts when fewer than 10 players are ranked', async () => {
    const utcDate = '2026-04-23';
    const first = addressOf(0xe1);
    const second = addressOf(0xe2);
    const third = addressOf(0xe3);
    const firstGame = Uint8Array.from([1, 1, 1, 1]);
    const secondGame = Uint8Array.from([2, 2, 2, 2]);
    const thirdGame = Uint8Array.from([3, 3, 3, 3]);

    const plugin = new FakePlugin();
    const contract = new Contract(
        { ChainId: 1, DataDirPath: '/tmp/plugin/' },
        {},
        plugin as never,
        Long.ZERO
    );

    plugin.state.set(keyHex(KeyForAccount(first)), encodeAccount(first, 0));
    plugin.state.set(keyHex(KeyForAccount(second)), encodeAccount(second, 0));
    plugin.state.set(keyHex(KeyForAccount(third)), encodeAccount(third, 0));
    plugin.state.set(keyHex(KeyForGameDailyRewardPool()), encodePool(131075, 228));
    plugin.state.set(
        keyHex(KeyForDailyPrizePool(utcDate)),
        encodeGame2048State('DailyPrizePool', {
            utcDate,
            entryCount: 3,
            grossFees: 240,
            treasuryFees: 12,
            rewardPool: 228,
            finalized: false,
            finalizedAtUnix: 0,
            distributedRewards: 0,
            treasuryLeftover: 0
        })
    );

    plugin.state.set(
        keyHex(KeyForDailyLeaderboard(utcDate, Long.fromNumber(900), Long.fromNumber(128), Long.fromNumber(70), Long.fromNumber(100), firstGame)),
        encodeGame2048State('LeaderboardEntry', {
            playerAddress: first,
            gameId: firstGame,
            score: 900,
            maxTile: 128,
            moveCount: 70,
            endedAtUnix: 100
        })
    );
    plugin.state.set(
        keyHex(KeyForDailyLeaderboard(utcDate, Long.fromNumber(800), Long.fromNumber(128), Long.fromNumber(72), Long.fromNumber(101), secondGame)),
        encodeGame2048State('LeaderboardEntry', {
            playerAddress: second,
            gameId: secondGame,
            score: 800,
            maxTile: 128,
            moveCount: 72,
            endedAtUnix: 101
        })
    );
    plugin.state.set(
        keyHex(KeyForDailyLeaderboard(utcDate, Long.fromNumber(700), Long.fromNumber(64), Long.fromNumber(75), Long.fromNumber(102), thirdGame)),
        encodeGame2048State('LeaderboardEntry', {
            playerAddress: third,
            gameId: thirdGame,
            score: 700,
            maxTile: 64,
            moveCount: 75,
            endedAtUnix: 102
        })
    );

    const claimResult = await ContractAsync.DeliverMessageClaimDailyReward(
        contract,
        {
            playerAddress: first,
            utcDate
        },
        { time: Date.parse('2026-04-24T00:00:00.000Z') * 1000 }
    );
    assert.equal(claimResult.error, undefined);

    const [firstAccount] = UnmarshalAccount(plugin.state.get(keyHex(KeyForAccount(first))) as Uint8Array);
    assert.equal(firstAccount.amount, 110);

    const [secondReward] = decodeGame2048State(
        'DailyRewardAllocation',
        plugin.state.get(keyHex(KeyForDailyRewardByPlayer(utcDate, second))) as Uint8Array
    );
    const [thirdReward] = decodeGame2048State(
        'DailyRewardAllocation',
        plugin.state.get(keyHex(KeyForDailyRewardByPlayer(utcDate, third))) as Uint8Array
    );
    assert.equal(toNumber((secondReward as { rewardAmount: number | Long }).rewardAmount), 73);
    assert.equal(toNumber((thirdReward as { rewardAmount: number | Long }).rewardAmount), 45);

    const [pool] = decodeGame2048State(
        'DailyPrizePool',
        plugin.state.get(keyHex(KeyForDailyPrizePool(utcDate))) as Uint8Array
    );
    assert.equal(toNumber((pool as { distributedRewards: number | Long }).distributedRewards), 228);
    assert.equal(toNumber((pool as { treasuryLeftover: number | Long }).treasuryLeftover), 0);
});

function keyHex(key: Uint8Array): string {
    return Buffer.from(key).toString('hex');
}

function encodeAccount(address: Uint8Array, amount: number): Uint8Array {
    return types.Account.encode(
        types.Account.create({
            address,
            amount: Long.fromNumber(amount)
        })
    ).finish();
}

function encodePool(id: number, amount: number): Uint8Array {
    return types.Pool.encode(
        types.Pool.create({
            id,
            amount: Long.fromNumber(amount)
        })
    ).finish();
}

function UnmarshalAccount(bytes: Uint8Array): [{ amount: number }, null] {
    const decoded = types.Account.decode(bytes) as { amount: Long | number };
    return [{ amount: toNumber(decoded.amount) }, null];
}

function UnmarshalPool(bytes: Uint8Array): [{ amount: number }, null] {
    const decoded = types.Pool.decode(bytes) as { amount: Long | number };
    return [{ amount: toNumber(decoded.amount) }, null];
}

function toNumber(value: Long | number | undefined): number {
    if (Long.isLong(value)) {
        return value.toNumber();
    }
    return value ?? 0;
}

function addressOf(fill: number): Uint8Array {
    return Uint8Array.from(new Array<number>(20).fill(fill));
}

void types;
