/* This file contains the base contract implementation that overrides the basic 'transfer' functionality */

import Long from 'long';

import { types } from '../proto/types.js';

import {
    IPluginError,
    ErrAlreadyPlayedDaily,
    ErrDailyPrizePoolNotFound,
    ErrDailyRewardAlreadyClaimed,
    ErrDailyRewardDayNotClaimable,
    ErrDailyRewardNotFound,
    ErrInsufficientClassicPoints,
    ErrInsufficientFunds,
    ErrInvalidMoveDirection,
    ErrInvalidMessageCast,
    ErrMoveCapExceeded,
    ErrRedeemBelowMinimum,
    ErrRedeemInvalidStep,
    ErrRedeemPayoutZero,
    ErrReplayMismatch,
    ErrDailyLoginAlreadyClaimed,
    ErrSessionNotActive,
    ErrSessionNotFound,
    ErrSessionOwnerMismatch,
    ErrTxFeeBelowStateLimit,
    ErrUsernameInvalid,
    ErrUsernameTaken
} from './error.js';

import type { Plugin, Config } from './plugin.js';
import { FromAny, Unmarshal } from './plugin.js';
import { fileDescriptorProtos } from '../proto/descriptors.js';
import {
    decodeGame2048State,
    encodeGame2048State,
    GAME2048_TYPE_URLS,
    sha256Bytes,
    toUint64
} from './game2048.js';
import { replayGame } from './game2048-replay.js';
import {
    KeyForAccount,
    KeyForFeeParams,
    KeyForFeePool,
    KeyForGamePlatformPool,
    KeyForGameReservePool,
    KeyForGameShopPool,
    KeyForGameDailyRewardPool,
    KeyForGameMonthlyRewardPool,
    KeyForDaoPool,
    KeyForGameConfig,
    KeyForGameTreasury,
    KeyForGameSession,
    KeyForDailyAttempt,
    KeyForDailySubmission,
    KeyForDailyPrizePool,
    KeyForDailyLeaderboard,
    KeyForDailyRewardAllocation,
    KeyForDailyRewardByPlayer,
    KeyForDailyRewardClaim,
    KeyForDailyLoginClaim,
    KeyForClassicLeaderboard,
    KeyForClassicPointsDailyLedger,
    KeyForClassicPointRedemption,
    KeyForMonthlyLeaderboard,
    KeyForMonthlyPlayerEntry,
    KeyForPlayerStats,
    KeyForUsernameByAddress,
    KeyForAddressByUsername,
    KeyForPlayerIdentity,
    PoolIDs
} from './utils/state.js';
import {
    utcDateFromMicros,
    utcMonthFromMicros,
    hasUtcDayEnded
} from './utils/time.js';
import {
    randomQueryId,
    buffersEqual,
    getQueryValue,
    normalizeBytes,
    normalizeMoves,
    areMovesValid,
    normalizeGameTreasury
} from './utils/helpers.js';
import {
    checkMessageSend,
    checkMessageStartDailyGame,
    checkMessageStartClassicGame,
    checkMessageSubmitGameResult,
    checkMessageClaimDailyReward,
    checkMessageRedeemClassicPoints,
    checkMessageClaimDailyLoginReward,
    checkMessageSetUsername
} from './validation/index.js';
import {
    decodePlayerStats,
    encodePlayerStats,
    incrementStatsField,
    addToStatsField,
    updateBestScore,
    updateBestTile,
    decodePlayerIdentity,
    decodeUsernameRegistration,
    encodePlayerIdentity,
    encodeUsernameRegistration,
    getUsernameFromState,
    getRegistrationTime,
    isUsernameValid,
    normalizeUsernameForLookup
} from './profile/index.js';
import { calculateClassicPoints, calculateBonusPoints } from './profile/points.js';
import {
    createDailySession,
    createClassicSession,
    decodeSession,
    completeSession,
    isSessionActive,
    isSessionDaily,
    getSessionMaxMoves,
    getSessionSeed,
    createDailyAttempt,
    createDailySubmission,
    createLeaderboardEntry,
    decodeDailyPrizePool,
    encodeDailyPrizePool,
    addDailyPoolEntry
} from './competition/index.js';
import {
    finalizeDailyRewardPoolIfNeeded,
    type DailyRewardFinalizationSummary,
    loadDailyRewardFinalizationSummary
} from './competition/rewards.js';
import {
    defaultClassicStartFee,
    defaultDailyStartFee,
    getConfiguredClassicStartFee,
    getConfiguredDailyStartFee,
    getConfiguredDailyMaxMoves,
    getConfiguredDailyPayoutBps,
    getConfiguredClassicDailyPointsCap
} from './config/index.js';
import { splitDailyFee, splitClassicFee } from './economy/fee-distribution.js';
import {
    calculateNextStreak,
    calculateLoginReward,
    createDailyLoginClaim,
    getConfiguredDailyLoginRewardPoints,
    getConfiguredDailyLoginBonusBps
} from './checkin/index.js';
import {
    validateRedemption,
    calculateRedeemPayout,
    selectPayoutPool,
    hasSufficientPoolFunds,
    hasShopBalance,
    createRedemptionRecord,
    getConfiguredShopRedemptionRatePoints,
    getConfiguredShopRedemptionRateCnpy,
    getConfiguredShopMinRedeemPoints,
    getConfiguredShopRedeemStepPoints
} from './shop/index.js';

// ContractConfig: the configuration of the contract
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContractConfig: any = {
    name: 'game2048_contract',
    id: 1,
    version: 1,
    supportedTransactions: ['send', 'startDailyGame', 'startClassicGame', 'submitGameResult', 'claimDailyReward', 'redeemClassicPoints', 'claimDailyLoginReward', 'setUsername', 'poolTransfer'],
    transactionTypeUrls: [
        'type.googleapis.com/types.MessageSend',
        GAME2048_TYPE_URLS.startDailyGame,
        GAME2048_TYPE_URLS.startClassicGame,
        GAME2048_TYPE_URLS.submitGameResult,
        GAME2048_TYPE_URLS.claimDailyReward,
        GAME2048_TYPE_URLS.redeemClassicPoints,
        GAME2048_TYPE_URLS.claimDailyLoginReward,
        GAME2048_TYPE_URLS.setUsername,
        GAME2048_TYPE_URLS.poolTransfer
    ],
    eventTypeUrls: [],
    fileDescriptorProtos
};

// Contract() defines the smart contract that implements the extended logic of the nested chain
export class Contract {
    Config: Config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FSMConfig: any;
    plugin: Plugin;
    fsmId: Long;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(config: Config, fsmConfig: any, plugin: Plugin, fsmId: Long) {
        this.Config = config;
        this.FSMConfig = fsmConfig;
        this.plugin = plugin;
        this.fsmId = fsmId;
    }

    // Genesis() implements logic to import a json file to create the state at height 0 and export the state at any height
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    Genesis(_request: any): any {
        return {}; // TODO map out original token holders
    }

    // BeginBlock() is code that is executed at the start of `applying` the block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    BeginBlock(_request: any): any {
        return {};
    }

    // EndBlock() is code that is executed at the end of 'applying' a block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    EndBlock(_request: any): any {
        return {};
    }

    // CheckMessageSend() statelessly validates a 'send' message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageSend(msg: any): any {
        return checkMessageSend(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageStartDailyGame(msg: any): any {
        return checkMessageStartDailyGame(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageStartClassicGame(msg: any): any {
        return checkMessageStartClassicGame(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageSubmitGameResult(msg: any): any {
        return checkMessageSubmitGameResult(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageClaimDailyReward(msg: any): any {
        return checkMessageClaimDailyReward(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageRedeemClassicPoints(msg: any): any {
        return checkMessageRedeemClassicPoints(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageClaimDailyLoginReward(msg: any): any {
        return checkMessageClaimDailyLoginReward(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageSetUsername(msg: any): any {
        return checkMessageSetUsername(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessagePoolTransfer(msg: any): any {
        // Pool transfers require admin signature
        // The admin_address field specifies who can sign this transaction
        const adminAddress = normalizeBytes(msg?.adminAddress);
        if (!adminAddress || adminAddress.length === 0) {
            return { error: { code: 400, msg: 'Admin address is required' } };
        }
        
        // Return admin address as the only authorized signer
        return { authorizedSigners: [adminAddress] };
    }
}

// Async versions of contract methods for proper state handling
export class ContractAsync {
    // CheckTx() is code that is executed to statelessly validate a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async CheckTx(contract: Contract, request: any): Promise<any> {
        const feeParamsQueryId = randomQueryId();
        const gameConfigQueryId = randomQueryId();
        // validate fee
        const [resp, err] = await contract.plugin.StateRead(contract, {
            keys: [
                {
                    queryId: feeParamsQueryId,
                    key: KeyForFeeParams()
                },
                {
                    queryId: gameConfigQueryId,
                    key: KeyForGameConfig()
                }
            ]
        });

        if (err) {
            return { error: err };
        }
        if (resp?.error) {
            return { error: resp.error };
        }

        // convert bytes into fee parameters
        const feeParamsBytes = getQueryValue(resp, feeParamsQueryId);
        const gameConfigBytes = getQueryValue(resp, gameConfigQueryId);
        let sendMinFee = 0;
        let dailyMinFee = 0;
        let classicMinFee = 0;

        if (feeParamsBytes && feeParamsBytes.length > 0) {
            const [minFees, unmarshalErr] = Unmarshal(feeParamsBytes, types.FeeParams);
            if (unmarshalErr) {
                return { error: unmarshalErr };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sendMinFee = toUint64((minFees as any)?.sendFee as Long | number | undefined);
        }
        if (gameConfigBytes && gameConfigBytes.length > 0) {
            const [gameConfig, gameConfigErr] = decodeGame2048State('GameConfig', gameConfigBytes);
            if (gameConfigErr) {
                return { error: gameConfigErr };
            }
            dailyMinFee = getConfiguredDailyStartFee(gameConfig);
            classicMinFee = getConfiguredClassicStartFee(gameConfig);
        } else {
            dailyMinFee = defaultDailyStartFee;
            classicMinFee = defaultClassicStartFee;
        }

        // get the message and its type
        const [msg, msgType, msgErr] = FromAny(request.tx?.msg);
        if (msgErr) {
            return { error: msgErr };
        }
        const txFeeNum = toUint64(request.tx?.fee as Long | number | undefined);
        // handle the message based on type
        if (msg) {
            switch (msgType) {
                case 'MessageSend':
                    if (txFeeNum < sendMinFee) {
                        return { error: ErrTxFeeBelowStateLimit() };
                    }
                    return contract.CheckMessageSend(msg);
                case 'MessageStartDailyGame':
                    if (txFeeNum < dailyMinFee) {
                        return { error: ErrTxFeeBelowStateLimit() };
                    }
                    return contract.CheckMessageStartDailyGame(msg);
                case 'MessageStartClassicGame':
                    if (txFeeNum < classicMinFee) {
                        return { error: ErrTxFeeBelowStateLimit() };
                    }
                    return contract.CheckMessageStartClassicGame(msg);
                case 'MessageSubmitGameResult':
                    return contract.CheckMessageSubmitGameResult(msg);
                case 'MessageClaimDailyReward':
                    return contract.CheckMessageClaimDailyReward(msg);
                case 'MessageRedeemClassicPoints':
                    return contract.CheckMessageRedeemClassicPoints(msg);
                case 'MessageClaimDailyLoginReward':
                    return contract.CheckMessageClaimDailyLoginReward(msg);
                case 'MessageSetUsername':
                    return contract.CheckMessageSetUsername(msg);
                case 'MessagePoolTransfer':
                    return contract.CheckMessagePoolTransfer(msg);
                default:
                    return { error: ErrInvalidMessageCast() };
            }
        }
        return { error: ErrInvalidMessageCast() };
    }

    // DeliverTx() is code that is executed to apply a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverTx(contract: Contract, request: any): Promise<any> {
        // get the message and its type
        const [msg, msgType, err] = FromAny(request.tx?.msg);
        if (err) {
            return { error: err };
        }
        // handle the message based on type
        if (msg) {
            switch (msgType) {
                case 'MessageSend':
                    return ContractAsync.DeliverMessageSend(contract, msg, request.tx?.fee as Long);
                case 'MessageStartDailyGame':
                    return ContractAsync.DeliverMessageStartDailyGame(contract, msg, request.tx);
                case 'MessageStartClassicGame':
                    return ContractAsync.DeliverMessageStartClassicGame(contract, msg, request.tx);
                case 'MessageSubmitGameResult':
                    return ContractAsync.DeliverMessageSubmitGameResult(contract, msg, request.tx);
                case 'MessageClaimDailyReward':
                    return ContractAsync.DeliverMessageClaimDailyReward(contract, msg, request.tx);
                case 'MessageRedeemClassicPoints':
                    return ContractAsync.DeliverMessageRedeemClassicPoints(contract, msg, request.tx);
                case 'MessageClaimDailyLoginReward':
                    return ContractAsync.DeliverMessageClaimDailyLoginReward(contract, msg, request.tx);
                case 'MessageSetUsername':
                    return ContractAsync.DeliverMessageSetUsername(contract, msg, request.tx);
                case 'MessagePoolTransfer':
                    return ContractAsync.DeliverMessagePoolTransfer(contract, msg, request.tx);
                default:
                    return { error: ErrInvalidMessageCast() };
            }
        }
        return { error: ErrInvalidMessageCast() };
    }

    // DeliverMessageSend() handles a 'send' message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageSend(
        contract: Contract,
        msg: any,
        fee: Long | number | undefined
    ): Promise<any> {
        const fromQueryId = Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        const toQueryId = Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
        const feeQueryId = Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

        // calculate the from key and to key
        const fromKey = KeyForAccount(msg.fromAddress!);
        const toKey = KeyForAccount(msg.toAddress!);
        const feePoolKey = KeyForFeePool(Long.fromNumber(contract.Config.ChainId));

        // get the from and to account
        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: feeQueryId, key: feePoolKey },
                { queryId: fromQueryId, key: fromKey },
                { queryId: toQueryId, key: toKey }
            ]
        });

        // check for internal error
        if (readErr) {
            return { error: readErr };
        }
        // ensure no error fsm error
        if (response?.error) {
            return { error: response.error };
        }

        // get the from bytes and to bytes
        let fromBytes: Uint8Array | null = null;
        let toBytes: Uint8Array | null = null;
        let feePoolBytes: Uint8Array | null = null;

        for (const resp of response?.results || []) {
            const qid = resp.queryId as Long;
            if (qid.equals(fromQueryId)) {
                fromBytes = resp.entries?.[0]?.value || null;
            } else if (qid.equals(toQueryId)) {
                toBytes = resp.entries?.[0]?.value || null;
            } else if (qid.equals(feeQueryId)) {
                feePoolBytes = resp.entries?.[0]?.value || null;
            }
        }

        // convert the bytes to account structures
        const [fromRaw, fromErr] = Unmarshal(fromBytes || new Uint8Array(), types.Account);
        if (fromErr) {
            return { error: fromErr };
        }
        const [toRaw, toErr] = Unmarshal(toBytes || new Uint8Array(), types.Account);
        if (toErr) {
            return { error: toErr };
        }
        const [feePoolRaw, feePoolErr] = Unmarshal(feePoolBytes || new Uint8Array(), types.Pool);
        if (feePoolErr) {
            return { error: feePoolErr };
        }

        // Cast to any for property access
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const from = fromRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const to = toRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feePool = feePoolRaw as any;

        // add fee to 'amount to deduct'
        const msgAmount = Long.isLong(msg.amount)
            ? msg.amount
            : Long.fromNumber((msg.amount as number) || 0);
        const feeAmount = Long.isLong(fee) ? fee : Long.fromNumber((fee as number) || 0);
        const amountToDeduct = msgAmount.add(feeAmount);

        // get from amount
        const fromAmount = Long.isLong(from?.amount)
            ? from.amount
            : Long.fromNumber((from?.amount as number) || 0);

        // if the account amount is less than the amount to subtract; return insufficient funds
        if (fromAmount.lessThan(amountToDeduct)) {
            return { error: ErrInsufficientFunds() };
        }

        // for self-transfer, use same account data
        const isSelfTransfer = Buffer.from(fromKey).equals(Buffer.from(toKey));
        const toAccount = isSelfTransfer ? from : to;

        // get amounts as Long
        const newFromAmount = fromAmount.subtract(amountToDeduct);
        const toAmount = Long.isLong(toAccount?.amount)
            ? toAccount.amount
            : Long.fromNumber((toAccount?.amount as number) || 0);
        const newToAmount = toAmount.add(msgAmount);
        const poolAmount = Long.isLong(feePool?.amount)
            ? feePool.amount
            : Long.fromNumber((feePool?.amount as number) || 0);
        const newPoolAmount = poolAmount.add(feeAmount);

        // Update the accounts
        const updatedFrom = types.Account.create({ address: from?.address, amount: newFromAmount });
        const updatedTo = types.Account.create({
            address: toAccount?.address,
            amount: newToAmount
        });
        const updatedPool = types.Pool.create({ id: feePool?.id, amount: newPoolAmount });

        // convert the accounts to bytes
        const newFromBytes = types.Account.encode(updatedFrom).finish();
        const newToBytes = types.Account.encode(updatedTo).finish();
        const newFeePoolBytes = types.Pool.encode(updatedPool).finish();

        // execute writes to the database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let writeResp: any;
        let writeErr: IPluginError | null;

        // if the from account is drained - delete the from account
        if (newFromAmount.isZero()) {
            [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
                sets: [
                    { key: feePoolKey, value: newFeePoolBytes },
                    { key: toKey, value: newToBytes }
                ],
                deletes: [{ key: fromKey }]
            });
        } else {
            [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
                sets: [
                    { key: feePoolKey, value: newFeePoolBytes },
                    { key: toKey, value: newToBytes },
                    { key: fromKey, value: newFromBytes }
                ]
            });
        }

        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageStartDailyGame(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        const playerKey = KeyForAccount(playerAddress);
        const gameConfigKey = KeyForGameConfig();
        const gameTreasuryKey = KeyForGameTreasury();
        const platformPoolKey = KeyForGamePlatformPool();
        const reservePoolKey = KeyForGameReservePool();
        const shopPoolKey = KeyForGameShopPool();
        const dailyRewardPoolKey = KeyForGameDailyRewardPool();
        const dailyAttemptKey = KeyForDailyAttempt(msg.utcDate, playerAddress);
        const dailyPoolKey = KeyForDailyPrizePool(msg.utcDate);
        const playerStatsKey = KeyForPlayerStats(playerAddress);

        const playerQueryId = randomQueryId();
        const configQueryId = randomQueryId();
        const treasuryQueryId = randomQueryId();
        const platformPoolQueryId = randomQueryId();
        const reservePoolQueryId = randomQueryId();
        const shopPoolQueryId = randomQueryId();
        const dailyRewardPoolQueryId = randomQueryId();
        const attemptQueryId = randomQueryId();
        const dailyPoolQueryId = randomQueryId();
        const statsQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: playerQueryId, key: playerKey },
                { queryId: configQueryId, key: gameConfigKey },
                { queryId: treasuryQueryId, key: gameTreasuryKey },
                { queryId: platformPoolQueryId, key: platformPoolKey },
                { queryId: reservePoolQueryId, key: reservePoolKey },
                { queryId: shopPoolQueryId, key: shopPoolKey },
                { queryId: dailyRewardPoolQueryId, key: dailyRewardPoolKey },
                { queryId: attemptQueryId, key: dailyAttemptKey },
                { queryId: dailyPoolQueryId, key: dailyPoolKey },
                { queryId: statsQueryId, key: playerStatsKey }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const playerBytes = getQueryValue(response, playerQueryId);
        const configBytes = getQueryValue(response, configQueryId);
        const treasuryBytes = getQueryValue(response, treasuryQueryId);
        const platformPoolBytes = getQueryValue(response, platformPoolQueryId);
        const reservePoolBytes = getQueryValue(response, reservePoolQueryId);
        const shopPoolBytes = getQueryValue(response, shopPoolQueryId);
        const dailyRewardPoolBytes = getQueryValue(response, dailyRewardPoolQueryId);
        const attemptBytes = getQueryValue(response, attemptQueryId);
        const dailyPoolBytes = getQueryValue(response, dailyPoolQueryId);
        const statsBytes = getQueryValue(response, statsQueryId);

        if (attemptBytes && attemptBytes.length > 0) {
            return { error: ErrAlreadyPlayedDaily() };
        }

        const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
        if (playerErr) {
            return { error: playerErr };
        }
        const [platformPoolRaw, platformPoolErr] = Unmarshal(platformPoolBytes || new Uint8Array(), types.Pool);
        if (platformPoolErr) return { error: platformPoolErr };
        const [reservePoolRaw, reservePoolErr] = Unmarshal(reservePoolBytes || new Uint8Array(), types.Pool);
        if (reservePoolErr) return { error: reservePoolErr };
        const [shopPoolRaw, shopPoolErr] = Unmarshal(shopPoolBytes || new Uint8Array(), types.Pool);
        if (shopPoolErr) return { error: shopPoolErr };
        const [dailyRewardPoolRaw, dailyRewardPoolErr] = Unmarshal(dailyRewardPoolBytes || new Uint8Array(), types.Pool);
        if (dailyRewardPoolErr) return { error: dailyRewardPoolErr };
        const [gameConfig, gameConfigErr] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        if (gameConfigErr) {
            return { error: gameConfigErr };
        }
        decodeDailyPrizePool(dailyPoolBytes);
        const [gameTreasury] = decodeGame2048State('GameTreasury', treasuryBytes || new Uint8Array());
        const stats = decodePlayerStats(statsBytes);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        const treasury = normalizeGameTreasury(gameTreasury);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const platformPool = platformPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservePool = reservePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shopPool = shopPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dailyRewardPool = dailyRewardPoolRaw as any;

        const txFee = Long.fromNumber(toUint64(tx?.fee as Long | number | undefined));
        const playerAmount = Long.isLong(player?.amount)
            ? player.amount
            : Long.fromNumber((player?.amount as number) || 0);

        if (playerAmount.lessThan(txFee)) {
            return { error: ErrInsufficientFunds() };
        }

        const newPlayer = types.Account.create({
            address: player?.address,
            amount: playerAmount.subtract(txFee)
        });
        const split = splitDailyFee(txFee, cfg);
        const platformPoolAmount = Long.isLong(platformPool?.amount)
            ? platformPool.amount
            : Long.fromNumber((platformPool?.amount as number) || 0);
        const reservePoolAmount = Long.isLong(reservePool?.amount)
            ? reservePool.amount
            : Long.fromNumber((reservePool?.amount as number) || 0);
        const shopPoolAmount = Long.isLong(shopPool?.amount)
            ? shopPool.amount
            : Long.fromNumber((shopPool?.amount as number) || 0);
        const dailyRewardPoolAmount = Long.isLong(dailyRewardPool?.amount)
            ? dailyRewardPool.amount
            : Long.fromNumber((dailyRewardPool?.amount as number) || 0);
        const updatedPlatformPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.PLATFORM),
            amount: platformPoolAmount.add(split.platform)
        });
        const updatedReservePool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.RESERVE),
            amount: reservePoolAmount.add(split.reserve)
        });
        const updatedShopPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.SHOP),
            amount: shopPoolAmount.add(split.shop)
        });
        const updatedDailyRewardPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.DAILY_REWARD),
            amount: dailyRewardPoolAmount.add(split.daily)
        });
        const updatedTreasury = encodeGame2048State('GameTreasury', {
            platformBalance: treasury.platformBalance + split.platform.toNumber(),
            reserveBalance: treasury.reserveBalance + split.reserve.toNumber(),
            shopBalance: treasury.shopBalance + split.shop.toNumber(),
            updatedAtUnix: toUint64(tx?.time as Long | number | undefined)
        });
        const updatedDailyPrizePool = decodeDailyPrizePool(dailyPoolBytes);
        const poolUpdate = addDailyPoolEntry(
            updatedDailyPrizePool,
            txFee,
            split.platform,
            split.reserve,
            split.shop,
            split.daily
        );
        const updatedDailyPrizePoolValue = encodeDailyPrizePool(
            { ...updatedDailyPrizePool, ...poolUpdate },
            msg.utcDate
        );

        const sessionValue = createDailySession(
            gameId,
            playerAddress,
            msg.utcDate,
            contract.Config.ChainId,
            tx?.createdHeight,
            tx?.time,
            txFee,
            getConfiguredDailyMaxMoves(cfg)
        );
        const attemptValue = createDailyAttempt(msg.utcDate, playerAddress, gameId);
        const updatedStats = incrementStatsField(stats, 'dailyGamesStarted');
        const statsValue = encodePlayerStats(updatedStats, playerAddress);

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerKey, value: types.Account.encode(newPlayer).finish() },
                { key: platformPoolKey, value: types.Pool.encode(updatedPlatformPool).finish() },
                { key: reservePoolKey, value: types.Pool.encode(updatedReservePool).finish() },
                { key: shopPoolKey, value: types.Pool.encode(updatedShopPool).finish() },
                { key: dailyRewardPoolKey, value: types.Pool.encode(updatedDailyRewardPool).finish() },
                { key: gameTreasuryKey, value: updatedTreasury },
                { key: dailyPoolKey, value: updatedDailyPrizePoolValue },
                { key: KeyForGameSession(gameId), value: sessionValue },
                { key: dailyAttemptKey, value: attemptValue },
                { key: playerStatsKey, value: statsValue }
            ]
        });

        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageStartClassicGame(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        const playerKey = KeyForAccount(playerAddress);
        const gameTreasuryKey = KeyForGameTreasury();
        const platformPoolKey = KeyForGamePlatformPool();
        const reservePoolKey = KeyForGameReservePool();
        const shopPoolKey = KeyForGameShopPool();
        const configKey = KeyForGameConfig();
        const playerStatsKey = KeyForPlayerStats(playerAddress);

        const playerQueryId = randomQueryId();
        const treasuryQueryId = randomQueryId();
        const platformPoolQueryId = randomQueryId();
        const reservePoolQueryId = randomQueryId();
        const shopPoolQueryId = randomQueryId();
        const configQueryId = randomQueryId();
        const statsQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: playerQueryId, key: playerKey },
                { queryId: treasuryQueryId, key: gameTreasuryKey },
                { queryId: platformPoolQueryId, key: platformPoolKey },
                { queryId: reservePoolQueryId, key: reservePoolKey },
                { queryId: shopPoolQueryId, key: shopPoolKey },
                { queryId: configQueryId, key: configKey },
                { queryId: statsQueryId, key: playerStatsKey }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const playerBytes = getQueryValue(response, playerQueryId);
        const treasuryBytes = getQueryValue(response, treasuryQueryId);
        const platformPoolBytes = getQueryValue(response, platformPoolQueryId);
        const reservePoolBytes = getQueryValue(response, reservePoolQueryId);
        const shopPoolBytes = getQueryValue(response, shopPoolQueryId);
        const configBytes = getQueryValue(response, configQueryId);
        const statsBytes = getQueryValue(response, statsQueryId);

        const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
        if (playerErr) {
            return { error: playerErr };
        }
        const [platformPoolRaw, platformPoolErr] = Unmarshal(platformPoolBytes || new Uint8Array(), types.Pool);
        if (platformPoolErr) return { error: platformPoolErr };
        const [reservePoolRaw, reservePoolErr] = Unmarshal(reservePoolBytes || new Uint8Array(), types.Pool);
        if (reservePoolErr) return { error: reservePoolErr };
        const [shopPoolRaw, shopPoolErr] = Unmarshal(shopPoolBytes || new Uint8Array(), types.Pool);
        if (shopPoolErr) return { error: shopPoolErr };
        const [gameTreasury] = decodeGame2048State('GameTreasury', treasuryBytes || new Uint8Array());
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const stats = decodePlayerStats(statsBytes);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        const treasury = normalizeGameTreasury(gameTreasury);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const platformPool = platformPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservePool = reservePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shopPool = shopPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};

        const txFee = Long.fromNumber(toUint64(tx?.fee as Long | number | undefined));
        const playerAmount = Long.isLong(player?.amount)
            ? player.amount
            : Long.fromNumber((player?.amount as number) || 0);

        if (playerAmount.lessThan(txFee)) {
            return { error: ErrInsufficientFunds() };
        }

        const newPlayer = types.Account.create({
            address: player?.address,
            amount: playerAmount.subtract(txFee)
        });
        const split = splitClassicFee(txFee, cfg);
        const platformPoolAmount = Long.isLong(platformPool?.amount)
            ? platformPool.amount
            : Long.fromNumber((platformPool?.amount as number) || 0);
        
        const monthlyPoolQueryId = randomQueryId();
        const [monthlyPoolResp, monthlyPoolReadErr] = await contract.plugin.StateRead(contract, {
            keys: [{ queryId: monthlyPoolQueryId, key: KeyForGameMonthlyRewardPool() }]
        });
        if (monthlyPoolReadErr) {
            return { error: monthlyPoolReadErr };
        }
        const monthlyPoolBytes = getQueryValue(monthlyPoolResp, monthlyPoolQueryId);
        const [monthlyRewardPoolRaw, monthlyPoolUnmarshalErr] = Unmarshal(monthlyPoolBytes || new Uint8Array(), types.Pool);
        if (monthlyPoolUnmarshalErr) {
            return { error: monthlyPoolUnmarshalErr };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const monthlyRewardPool = monthlyRewardPoolRaw as any;
        const monthlyRewardPoolAmount = Long.isLong(monthlyRewardPool?.amount)
            ? monthlyRewardPool.amount
            : Long.fromNumber((monthlyRewardPool?.amount as number) || 0);
        const reservePoolAmount = Long.isLong(reservePool?.amount)
            ? reservePool.amount
            : Long.fromNumber((reservePool?.amount as number) || 0);
        const shopPoolAmount = Long.isLong(shopPool?.amount)
            ? shopPool.amount
            : Long.fromNumber((shopPool?.amount as number) || 0);
        const updatedPlatformPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.PLATFORM),
            amount: platformPoolAmount.add(split.platform)
        });
        const updatedMonthlyRewardPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.MONTHLY_REWARD),
            amount: monthlyRewardPoolAmount.add(split.monthly)
        });
        const updatedReservePool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.RESERVE),
            amount: reservePoolAmount.add(split.reserve)
        });
        const updatedShopPool = types.Pool.create({
            id: Long.fromNumber(PoolIDs.SHOP),
            amount: shopPoolAmount.add(split.shop)
        });
        const updatedTreasury = encodeGame2048State('GameTreasury', {
            platformBalance: treasury.platformBalance + split.platform.toNumber(),
            reserveBalance: treasury.reserveBalance + split.reserve.toNumber(),
            shopBalance: treasury.shopBalance + split.shop.toNumber(),
            updatedAtUnix: toUint64(tx?.time as Long | number | undefined)
        });

        const sessionValue = createClassicSession(
            gameId,
            playerAddress,
            tx,
            tx?.createdHeight,
            tx?.time,
            txFee
        );
        const updatedStats = incrementStatsField(stats, 'classicGamesStarted');
        const statsValue = encodePlayerStats(updatedStats, playerAddress);

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerKey, value: types.Account.encode(newPlayer).finish() },
                { key: platformPoolKey, value: types.Pool.encode(updatedPlatformPool).finish() },
                { key: KeyForGameMonthlyRewardPool(), value: types.Pool.encode(updatedMonthlyRewardPool).finish() },
                { key: reservePoolKey, value: types.Pool.encode(updatedReservePool).finish() },
                { key: shopPoolKey, value: types.Pool.encode(updatedShopPool).finish() },
                { key: gameTreasuryKey, value: updatedTreasury },
                { key: KeyForGameSession(gameId), value: sessionValue },
                { key: playerStatsKey, value: statsValue }
            ]
        });

        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageSubmitGameResult(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        const sessionQueryId = randomQueryId();
        const statsQueryId = randomQueryId();
        const configQueryId = randomQueryId();
        const usernameQueryId = randomQueryId();
        const endedAtUnix = toUint64(tx?.time as Long | number | undefined);
        const classicPointsUtcDate = utcDateFromMicros(endedAtUnix);
        const classicPointsLedgerKey = KeyForClassicPointsDailyLedger(classicPointsUtcDate, playerAddress);
        const classicPointsLedgerQueryId = randomQueryId();
        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: sessionQueryId, key: KeyForGameSession(gameId) },
                { queryId: statsQueryId, key: KeyForPlayerStats(playerAddress) },
                { queryId: configQueryId, key: KeyForGameConfig() },
                { queryId: classicPointsLedgerQueryId, key: classicPointsLedgerKey },
                { queryId: usernameQueryId, key: KeyForUsernameByAddress(playerAddress) }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const sessionBytes = getQueryValue(response, sessionQueryId);
        const statsBytes = getQueryValue(response, statsQueryId);
        const configBytes = getQueryValue(response, configQueryId);
        const classicPointsLedgerBytes = getQueryValue(response, classicPointsLedgerQueryId);
        const usernameBytes = getQueryValue(response, usernameQueryId);
        if (!sessionBytes || sessionBytes.length === 0) {
            return { error: ErrSessionNotFound() };
        }

        // Get username if exists
        const username = getUsernameFromState(null, usernameBytes);

        const session = decodeSession(sessionBytes);
        if (!session) {
            return { error: ErrSessionNotFound() };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameSession = session as any;
        if (!Buffer.from(normalizeBytes(gameSession?.playerAddress)).equals(Buffer.from(playerAddress))) {
            return { error: ErrSessionOwnerMismatch() };
        }
        if (!isSessionActive(gameSession)) {
            return { error: ErrSessionNotActive() };
        }

        const maxMoves = getSessionMaxMoves(gameSession);
        const submittedMoves = normalizeMoves(msg.moves);
        const submittedMoveCount = submittedMoves.length;
        const isDaily = isSessionDaily(gameSession);
        if (!areMovesValid(submittedMoves)) {
            return { error: ErrInvalidMoveDirection() };
        }
        if (isDaily && maxMoves > 0 && submittedMoveCount > maxMoves) {
            return { error: ErrMoveCapExceeded() };
        }

        const replay = replayGame({
            seed: getSessionSeed(gameSession),
            moves: submittedMoves,
            maxMoves,
            stopReason: toUint64(msg.stopReason as Long | number | undefined)
        });

        const declaredScore = toUint64(msg.declaredScore as Long | number | undefined);
        const declaredMaxTile = toUint64(msg.declaredMaxTile as Long | number | undefined);
        const declaredStopReason = toUint64(msg.stopReason as Long | number | undefined);
        if (
            replay.score !== declaredScore ||
            replay.maxTile !== declaredMaxTile ||
            replay.endedReason !== declaredStopReason
        ) {
            return { error: ErrReplayMismatch() };
        }

        const stats = decodePlayerStats(statsBytes);
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const [classicPointsLedger] = decodeGame2048State('ClassicPointsDailyLedger', classicPointsLedgerBytes || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pointsLedger = (classicPointsLedger as any) || {};
        const updatedSession = completeSession(
            gameSession,
            replay.score,
            replay.maxTile,
            replay.moveCount,
            replay.endedReason,
            endedAtUnix
        );

        const baseClassicPoints = isDaily ? 0 : calculateClassicPoints(replay.score);
        const classicBonusBps = stats.classicPointsBonusUtcDate === classicPointsUtcDate
            ? getConfiguredDailyLoginBonusBps(cfg)
            : 0;
        // Apply cap to base points, then add bonus on top (bonus doesn't count against cap)
        const classicPointsCap = getConfiguredClassicDailyPointsCap(cfg);
        const alreadyEarnedToday = toUint64(pointsLedger.earnedPoints as Long | number | undefined);
        const remainingClassicPoints = Math.max(0, classicPointsCap - alreadyEarnedToday);
        const cappedBasePoints = isDaily ? 0 : Math.min(baseClassicPoints, remainingClassicPoints);
        const bonusPoints = calculateBonusPoints(cappedBasePoints, classicBonusBps);
        const earnedClassicPoints = cappedBasePoints + bonusPoints;
        
        // Update stats using profile module functions
        let updatedStats = stats;
        updatedStats = incrementStatsField(updatedStats, 'gamesCompleted');
        if (replay.win) {
            updatedStats = incrementStatsField(updatedStats, 'wins');
        } else {
            updatedStats = incrementStatsField(updatedStats, 'losses');
        }
        updatedStats = updateBestScore(updatedStats, replay.score, isDaily ? 'daily' : 'classic');
        updatedStats = updateBestTile(updatedStats, replay.maxTile);
        updatedStats = addToStatsField(updatedStats, 'totalScore', replay.score);
        updatedStats = addToStatsField(updatedStats, 'classicPointsBalance', earnedClassicPoints);
        updatedStats = addToStatsField(updatedStats, 'classicPointsEarned', earnedClassicPoints);
        
        const updatedStatsValue = encodePlayerStats(updatedStats, playerAddress);

        const leaderboardEntry = createLeaderboardEntry(
            gameId,
            playerAddress,
            replay.score,
            replay.maxTile,
            replay.moveCount,
            endedAtUnix,
            username
        );

        const sets = [
            { key: KeyForGameSession(gameId), value: updatedSession },
            { key: KeyForPlayerStats(playerAddress), value: updatedStatsValue }
        ];
        
        const deletes: Array<{ key: Uint8Array }> = [];

        if (isDaily) {
            sets.push({
                key: KeyForDailyLeaderboard(
                    gameSession?.utcDate || '',
                    Long.fromNumber(replay.score),
                    Long.fromNumber(replay.maxTile),
                    Long.fromNumber(replay.moveCount),
                    Long.fromNumber(endedAtUnix),
                    gameId
                ),
                value: leaderboardEntry
            });
            sets.push({
                key: KeyForDailySubmission(gameSession?.utcDate || '', playerAddress),
                value: createDailySubmission(
                    gameSession?.utcDate || '',
                    playerAddress,
                    gameId,
                    replay.score,
                    replay.maxTile,
                    replay.moveCount,
                    endedAtUnix
                )
            });
        } else {
            // Classic mode: Add to all-time leaderboard
            sets.push({
                key: KeyForClassicLeaderboard(Long.fromNumber(replay.score), gameId),
                value: leaderboardEntry
            });
            sets.push({
                key: classicPointsLedgerKey,
                value: encodeGame2048State('ClassicPointsDailyLedger', {
                    utcDate: classicPointsUtcDate,
                    playerAddress,
                    // Track only capped base points against daily limit (bonus doesn't count)
                    earnedPoints: alreadyEarnedToday + cappedBasePoints
                })
            });
            
            // Update monthly leaderboard for Classic games (cumulative scoring)
            const monthId = utcMonthFromMicros(toUint64(tx?.time as Long | number | undefined));
            const playerEntryKey = KeyForMonthlyPlayerEntry(monthId, playerAddress);
            const monthlyQueryId = randomQueryId();
            
            // Get player's existing cumulative score for this month
            const [existingEntryResp, existingEntryErr] = await contract.plugin.StateRead(contract, {
                keys: [{ queryId: monthlyQueryId, key: playerEntryKey }]
            });
            if (existingEntryErr) {
                return { error: existingEntryErr };
            }
            
            const existingScoreBytes = getQueryValue(existingEntryResp, monthlyQueryId);
            let previousScore = 0;
            let previousGameId: Uint8Array | null = null;
            let cumulativeScore = replay.score; // Start with current game score
            
            if (existingScoreBytes) {
                if (existingScoreBytes.length >= 36) {
                    // New format: [score:4][gameId:32]
                    previousScore = Buffer.from(existingScoreBytes).readUInt32LE(0);
                    previousGameId = existingScoreBytes.slice(4, 36);
                    cumulativeScore = previousScore + replay.score; // Add to cumulative total
                } else if (existingScoreBytes.length >= 4) {
                    // Old format (migration): [score:4] only
                    previousScore = Buffer.from(existingScoreBytes).readUInt32LE(0);
                    // No previousGameId means we can't delete old entry, but we can still do cumulative
                    cumulativeScore = previousScore + replay.score;
                }
            }
            
            // Store player's cumulative score and latest gameId for this month
            const scoreBuffer = Buffer.alloc(36); // 4 bytes score + 32 bytes gameId
            scoreBuffer.writeUInt32LE(cumulativeScore, 0);
            Buffer.from(gameId).copy(scoreBuffer, 4);
            sets.push({
                key: playerEntryKey,
                value: scoreBuffer
            });
            
            // Delete old leaderboard entry if it exists
            if (previousGameId) {
                deletes.push({ key: KeyForMonthlyLeaderboard(monthId, Long.fromNumber(previousScore), previousGameId) });
            }
            
            // Add to monthly leaderboard with cumulative score
            // Format: [monthIDLen:1][monthID:n][gameIDLen:1][gameID:n][addressLen:1][address:n][score:8][maxTile:8][moveCount:8][timestamp:8]
            const monthIdBytes = Buffer.from(monthId, 'utf8');
            const monthlyLeaderboardEntry = Buffer.alloc(
                1 + monthIdBytes.length +  // monthIDLen + monthID
                1 + gameId.length +          // gameIDLen + gameID
                1 + playerAddress.length +   // addressLen + address
                8 + 8 + 8 + 8                // score + maxTile + moveCount + timestamp
            );
            
            let offset = 0;
            
            // Write monthID with length prefix
            monthlyLeaderboardEntry.writeUInt8(monthIdBytes.length, offset);
            offset += 1;
            monthIdBytes.copy(monthlyLeaderboardEntry, offset);
            offset += monthIdBytes.length;
            
            // Write gameID with length prefix
            monthlyLeaderboardEntry.writeUInt8(gameId.length, offset);
            offset += 1;
            Buffer.from(gameId).copy(monthlyLeaderboardEntry, offset);
            offset += gameId.length;
            
            // Write address with length prefix
            monthlyLeaderboardEntry.writeUInt8(playerAddress.length, offset);
            offset += 1;
            Buffer.from(playerAddress).copy(monthlyLeaderboardEntry, offset);
            offset += playerAddress.length;
            
            // Write score (8 bytes, big endian)
            monthlyLeaderboardEntry.writeBigUInt64BE(BigInt(cumulativeScore), offset);
            offset += 8;
            
            // Write maxTile (8 bytes, big endian)
            monthlyLeaderboardEntry.writeBigUInt64BE(BigInt(replay.maxTile), offset);
            offset += 8;
            
            // Write moveCount (8 bytes, big endian)
            monthlyLeaderboardEntry.writeBigUInt64BE(BigInt(replay.moveCount), offset);
            offset += 8;
            
            // Write timestamp (8 bytes, big endian)
            monthlyLeaderboardEntry.writeBigUInt64BE(BigInt(endedAtUnix), offset);
            
            sets.push({
                key: KeyForMonthlyLeaderboard(monthId, Long.fromNumber(cumulativeScore), gameId),
                value: monthlyLeaderboardEntry
            });
        }

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, { sets, deletes });
        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageClaimDailyReward(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const utcDate = msg?.utcDate || '';
        const dailyRewardPoolKey = KeyForGameDailyRewardPool();
        const daoPoolKey = KeyForDaoPool();
        const playerKey = KeyForAccount(playerAddress);
        const dailyPoolKey = KeyForDailyPrizePool(utcDate);
        const rewardByPlayerKey = KeyForDailyRewardByPlayer(utcDate, playerAddress);
        const rewardClaimKey = KeyForDailyRewardClaim(utcDate, playerAddress);

        const nowMicros = toUint64(tx?.time as Long | number | undefined);
        if (!hasUtcDayEnded(utcDate, nowMicros)) {
            return { error: ErrDailyRewardDayNotClaimable() };
        }

        const finalizeErr = await finalizeDailyRewardPoolIfNeeded(contract, utcDate, nowMicros);
        if (finalizeErr) {
            return { error: finalizeErr };
        }

        const feePoolQueryId = randomQueryId();
        const playerQueryId = randomQueryId();
        const poolQueryId = randomQueryId();
        const rewardQueryId = randomQueryId();
        const claimQueryId = randomQueryId();
        const daoPoolQueryId = randomQueryId();
        const configQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: feePoolQueryId, key: dailyRewardPoolKey },
                { queryId: daoPoolQueryId, key: daoPoolKey },
                { queryId: playerQueryId, key: playerKey },
                { queryId: poolQueryId, key: dailyPoolKey },
                { queryId: rewardQueryId, key: rewardByPlayerKey },
                { queryId: claimQueryId, key: rewardClaimKey },
                { queryId: configQueryId, key: KeyForGameConfig() }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const feePoolBytes = getQueryValue(response, feePoolQueryId);
        const daoPoolBytes = getQueryValue(response, daoPoolQueryId);
        const playerBytes = getQueryValue(response, playerQueryId);
        const poolBytes = getQueryValue(response, poolQueryId);
        const rewardBytes = getQueryValue(response, rewardQueryId);
        const claimBytes = getQueryValue(response, claimQueryId);
        const configBytes = getQueryValue(response, configQueryId);

        if (!poolBytes || poolBytes.length === 0) {
            return { error: ErrDailyPrizePoolNotFound() };
        }
        if (claimBytes && claimBytes.length > 0) {
            return { error: ErrDailyRewardAlreadyClaimed() };
        }

        const [feePoolRaw, feePoolErr] = Unmarshal(feePoolBytes || new Uint8Array(), types.Pool);
        if (feePoolErr) {
            return { error: feePoolErr };
        }
        const [daoPoolRaw, daoPoolErr] = Unmarshal(daoPoolBytes || new Uint8Array(), types.Pool);
        if (daoPoolErr) {
            return { error: daoPoolErr };
        }
        const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
        if (playerErr) {
            return { error: playerErr };
        }
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const pool = decodeDailyPrizePool(poolBytes);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feePool = feePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daoPool = daoPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        const payoutBps = getConfiguredDailyPayoutBps(cfg);
        const rewardPoolTotal = Long.fromNumber(toUint64(pool.rewardPool as Long | number | undefined));

        let allocationValue = rewardBytes;
        let allocationMessage: any | null = null;
        let finalizationSummary: DailyRewardFinalizationSummary | null = null;

        if (pool.finalized || !allocationValue || allocationValue.length === 0) {
            const [summary, summaryErr] = await loadDailyRewardFinalizationSummary(
                contract,
                utcDate,
                rewardPoolTotal,
                payoutBps
            );
            if (summaryErr) {
                return { error: summaryErr };
            }
            finalizationSummary = summary;
            if ((!allocationValue || allocationValue.length === 0) && summary) {
                const matchedAllocation = summary.allocations.find((entry) =>
                    Buffer.from(normalizeBytes(entry.playerAddress)).equals(Buffer.from(playerAddress))
                );
                if (!matchedAllocation) {
                    return { error: ErrDailyRewardNotFound() };
                }
                allocationMessage = matchedAllocation;
                allocationValue = encodeGame2048State('DailyRewardAllocation', matchedAllocation);
            }
        }

        if (!allocationValue || allocationValue.length === 0) {
            return { error: ErrDailyRewardNotFound() };
        }

        if (!allocationMessage) {
            const [reward] = decodeGame2048State('DailyRewardAllocation', allocationValue);
            allocationMessage = reward as any;
        }
        const allocation = allocationMessage as any;

        const rewardAmount = Long.fromNumber(toUint64(allocation?.rewardAmount as Long | number | undefined));
        const dailyPoolAmount = Long.isLong(feePool?.amount)
            ? feePool.amount
            : Long.fromNumber((feePool?.amount as number) || 0);
        const daoPoolAmount = Long.isLong(daoPool?.amount)
            ? daoPool.amount
            : Long.fromNumber((daoPool?.amount as number) || 0);
        const dailyRewardBalance = Long.fromNumber(toUint64(pool.rewardPool as Long | number | undefined));
        if (dailyRewardBalance.lessThan(rewardAmount)) {
            return { error: ErrInsufficientFunds() };
        }
        const useDailyRewardPool = !dailyPoolAmount.lessThan(rewardAmount);
        if (!useDailyRewardPool && daoPoolAmount.lessThan(rewardAmount)) {
            return { error: ErrInsufficientFunds() };
        }
        const playerAmount = Long.isLong(player?.amount)
            ? player.amount
            : Long.fromNumber((player?.amount as number) || 0);

        const updatedPool = types.Pool.create({
            id: useDailyRewardPool ? feePool?.id : daoPool?.id,
            amount: (useDailyRewardPool ? dailyPoolAmount : daoPoolAmount).subtract(rewardAmount)
        });
        const updatedPlayer = types.Account.create({
            address: player?.address || playerAddress,
            amount: playerAmount.add(rewardAmount)
        });
        
        const updatedPoolData = {
            ...pool,
            rewardPool: dailyRewardBalance.subtract(rewardAmount).toNumber(),
            finalized: true,
            finalizedAtUnix: pool.finalized
                ? toUint64(pool.finalizedAtUnix as Long | number | undefined)
                : nowMicros,
            distributedRewards: finalizationSummary
                ? finalizationSummary.distributed.toNumber()
                : toUint64(pool.distributedRewards as Long | number | undefined),
            treasuryLeftover: finalizationSummary
                ? finalizationSummary.leftover.toNumber()
                : toUint64(pool.treasuryLeftover as Long | number | undefined)
        };
        const updatedDailyPool = encodeDailyPrizePool(updatedPoolData, utcDate);
        // Compute transaction hash
        const txMessage = types.Transaction.create(tx);
        const txBytes = types.Transaction.encode(txMessage).finish();
        const txHashBytes = sha256Bytes(txBytes);
        const txHash = Buffer.from(txHashBytes).toString('hex').toUpperCase();

        console.log("=== PLUGIN CLAIM WRITE ===");
        console.log("TX_HASH_BEFORE_WRITE:", txHash);
        console.log("TX_HASH_LENGTH:", txHash.length);

        const claimValue = encodeGame2048State('DailyRewardClaim', {
            utcDate,
            playerAddress,
            gameId: allocation?.gameId || new Uint8Array(),
            rank: toUint64(allocation?.rank as Long | number | undefined),
            claimedAmount: rewardAmount.toNumber(),
            claimedAtUnix: nowMicros,
            txHash: txHash
        });
        
        console.log("RECORD_BEFORE_WRITE:", {
            utcDate,
            playerAddress: Buffer.from(playerAddress).toString('hex'),
            rank: toUint64(allocation?.rank as Long | number | undefined),
            claimedAmount: rewardAmount.toNumber(),
            claimedAtUnix: nowMicros,
            txHash: txHash
        });
        console.log("SERIALIZED_LENGTH:", claimValue.length);
        console.log("=== END PLUGIN WRITE ===");

        const poolWriteKey = useDailyRewardPool ? dailyRewardPoolKey : daoPoolKey;
        const rewardPersistenceSets = !rewardBytes || rewardBytes.length === 0
            ? [
                { key: KeyForDailyRewardAllocation(utcDate, toUint64(allocation?.rank as Long | number | undefined), normalizeBytes(allocation?.gameId)), value: allocationValue },
                { key: rewardByPlayerKey, value: allocationValue }
            ]
            : [];
        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: poolWriteKey, value: types.Pool.encode(updatedPool).finish() },
                { key: playerKey, value: types.Account.encode(updatedPlayer).finish() },
                { key: dailyPoolKey, value: updatedDailyPool },
                ...rewardPersistenceSets,
                { key: rewardClaimKey, value: claimValue }
            ]
        });
        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageRedeemClassicPoints(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const burnPoints = toUint64(msg?.burnPoints as Long | number | undefined);
        const playerKey = KeyForAccount(playerAddress);
        const playerStatsKey = KeyForPlayerStats(playerAddress);
        const shopPoolKey = KeyForGameShopPool();
        const daoPoolKey = KeyForDaoPool();
        const configKey = KeyForGameConfig();
        const gameTreasuryKey = KeyForGameTreasury();

        const playerQueryId = randomQueryId();
        const statsQueryId = randomQueryId();
        const feePoolQueryId = randomQueryId();
        const daoPoolQueryId = randomQueryId();
        const configQueryId = randomQueryId();
        const treasuryQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: playerQueryId, key: playerKey },
                { queryId: statsQueryId, key: playerStatsKey },
                { queryId: feePoolQueryId, key: shopPoolKey },
                { queryId: daoPoolQueryId, key: daoPoolKey },
                { queryId: configQueryId, key: configKey },
                { queryId: treasuryQueryId, key: gameTreasuryKey }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const playerBytes = getQueryValue(response, playerQueryId);
        const statsBytes = getQueryValue(response, statsQueryId);
        const feePoolBytes = getQueryValue(response, feePoolQueryId);
        const daoPoolBytes = getQueryValue(response, daoPoolQueryId);
        const configBytes = getQueryValue(response, configQueryId);
        const treasuryBytes = getQueryValue(response, treasuryQueryId);

        const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
        if (playerErr) {
            return { error: playerErr };
        }
        const [feePoolRaw, feePoolErr] = Unmarshal(feePoolBytes || new Uint8Array(), types.Pool);
        if (feePoolErr) {
            return { error: feePoolErr };
        }
        const [daoPoolRaw, daoPoolErr] = Unmarshal(daoPoolBytes || new Uint8Array(), types.Pool);
        if (daoPoolErr) {
            return { error: daoPoolErr };
        }
        const stats = decodePlayerStats(statsBytes);
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const [gameTreasury] = decodeGame2048State('GameTreasury', treasuryBytes || new Uint8Array());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feePool = feePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daoPool = daoPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        const treasury = normalizeGameTreasury(gameTreasury);

        // Get shop configuration
        const minRedeemPoints = getConfiguredShopMinRedeemPoints(cfg);
        const redeemStepPoints = getConfiguredShopRedeemStepPoints(cfg);
        const ratePoints = getConfiguredShopRedemptionRatePoints(cfg);
        const rateCnpy = getConfiguredShopRedemptionRateCnpy(cfg);

        // Calculate payout
        const classicPointsBalance = toUint64(stats.classicPointsBalance as Long | number | undefined);
        const payoutAmount = calculateRedeemPayout(burnPoints, ratePoints, rateCnpy);

        // Validate redemption
        const validation = validateRedemption(
            burnPoints,
            classicPointsBalance,
            minRedeemPoints,
            redeemStepPoints,
            payoutAmount
        );
        
        if (!validation.valid) {
            // Map validation errors to existing error functions
            if (validation.error?.includes('below minimum')) {
                return { error: ErrRedeemBelowMinimum() };
            }
            if (validation.error?.includes('multiple of')) {
                return { error: ErrRedeemInvalidStep() };
            }
            if (validation.error?.includes('Insufficient classic points')) {
                return { error: ErrInsufficientClassicPoints() };
            }
            if (validation.error?.includes('zero or negative')) {
                return { error: ErrRedeemPayoutZero() };
            }
            return { error: validation.error };
        }

        // Check pool and treasury balances
        const shopPoolAmount = Long.isLong(feePool?.amount)
            ? feePool.amount
            : Long.fromNumber((feePool?.amount as number) || 0);
        const daoPoolAmount = Long.isLong(daoPool?.amount)
            ? daoPool.amount
            : Long.fromNumber((daoPool?.amount as number) || 0);
        const payoutLong = Long.fromNumber(payoutAmount);
        const shopBalance = Long.fromNumber(treasury.shopBalance);
        
        if (!hasShopBalance(treasury.shopBalance, payoutAmount)) {
            return { error: ErrInsufficientFunds() };
        }
        
        const useShopPool = selectPayoutPool(shopPoolAmount, daoPoolAmount, payoutLong);
        const selectedPool = useShopPool ? shopPoolAmount : daoPoolAmount;
        
        if (!hasSufficientPoolFunds(selectedPool, payoutLong)) {
            return { error: ErrInsufficientFunds() };
        }

        // Update balances
        const playerAmount = Long.isLong(player?.amount)
            ? player.amount
            : Long.fromNumber((player?.amount as number) || 0);
        const redeemedAtUnix = toUint64(tx?.time as Long | number | undefined);
        const updatedPlayer = types.Account.create({
            address: player?.address || playerAddress,
            amount: playerAmount.add(payoutLong)
        });
        const updatedPool = types.Pool.create({
            id: useShopPool ? feePool?.id : daoPool?.id,
            amount: (useShopPool ? shopPoolAmount : daoPoolAmount).subtract(payoutLong)
        });
        const updatedTreasury = encodeGame2048State('GameTreasury', {
            platformBalance: treasury.platformBalance,
            reserveBalance: treasury.reserveBalance,
            shopBalance: shopBalance.subtract(payoutLong).toNumber(),
            updatedAtUnix: redeemedAtUnix
        });
        const updatedStatsObj = {
            ...stats,
            classicPointsBalance: classicPointsBalance - burnPoints
        };
        const updatedStats = encodePlayerStats(updatedStatsObj, playerAddress);
        
        // Compute transaction hash
        const txMessage = types.Transaction.create(tx);
        const txBytes = types.Transaction.encode(txMessage).finish();
        const txHashBytes = sha256Bytes(txBytes);
        const txHash = Buffer.from(txHashBytes).toString('hex').toUpperCase();

        console.log("=== PLUGIN REDEMPTION WRITE ===");
        console.log("TX_HASH_BEFORE_WRITE:", txHash);
        console.log("TX_HASH_LENGTH:", txHash.length);
        console.log("TX_HASH_TYPE:", typeof txHash);
        console.log("TX_HASH_IS_BUFFER:", Buffer.isBuffer(txHash));

        // Create redemption record
        const redemptionValue = createRedemptionRecord(
            playerAddress,
            burnPoints,
            payoutAmount,
            redeemedAtUnix,
            txHash
        );
        
        console.log("RECORD_BEFORE_WRITE:", {
            playerAddress: Buffer.from(playerAddress).toString('hex'),
            burnPoints,
            payoutAmount,
            redeemedAtUnix,
            txHash: txHash,
            txHashType: typeof txHash
        });
        console.log("TX_HASH_IN_RECORD_TYPE:", typeof {txHash: txHash}.txHash);
        console.log("SERIALIZED_LENGTH:", redemptionValue.length);
        console.log("SERIALIZED_BYTES_SAMPLE:", Array.from(redemptionValue.slice(0, 50)));
        console.log("=== END PLUGIN WRITE ===");
        console.log("=== END PLUGIN WRITE ===");

        const poolWriteKey = useShopPool ? shopPoolKey : daoPoolKey;
        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerKey, value: types.Account.encode(updatedPlayer).finish() },
                { key: poolWriteKey, value: types.Pool.encode(updatedPool).finish() },
                { key: gameTreasuryKey, value: updatedTreasury },
                { key: playerStatsKey, value: updatedStats },
                { key: KeyForClassicPointRedemption(playerAddress, redeemedAtUnix, burnPoints), value: redemptionValue }
            ]
        });
        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageClaimDailyLoginReward(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const claimedAtUnix = toUint64(tx?.time as Long | number | undefined);
        const utcDate = utcDateFromMicros(claimedAtUnix);
        const playerStatsKey = KeyForPlayerStats(playerAddress);
        const loginClaimKey = KeyForDailyLoginClaim(utcDate, playerAddress);

        const statsQueryId = randomQueryId();
        const configQueryId = randomQueryId();
        const claimQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: statsQueryId, key: playerStatsKey },
                { queryId: configQueryId, key: KeyForGameConfig() },
                { queryId: claimQueryId, key: loginClaimKey }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const statsBytes = getQueryValue(response, statsQueryId);
        const configBytes = getQueryValue(response, configQueryId);
        const claimBytes = getQueryValue(response, claimQueryId);

        if (claimBytes && claimBytes.length > 0) {
            return { error: ErrDailyLoginAlreadyClaimed() };
        }

        const stats = decodePlayerStats(statsBytes);
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};

        // Calculate next streak day
        const streakSchedule = getConfiguredDailyLoginRewardPoints(cfg);
        const scheduleLength = streakSchedule.length || 7;
        const currentStreak = toUint64(stats.loginStreak as Long | number | undefined);
        const previousClaimUtcDate = stats.lastLoginClaimUtcDate || '';
        
        const nextStreak = calculateNextStreak(
            previousClaimUtcDate,
            utcDate,
            currentStreak,
            scheduleLength
        );

        // Calculate rewards
        const { rewardPoints, bonusBps } = calculateLoginReward(cfg, nextStreak);

        // Update player stats
        const updatedStatsObj = {
            ...stats,
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined) + rewardPoints,
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined) + rewardPoints,
            loginStreak: nextStreak,
            lastLoginClaimUtcDate: utcDate,
            classicPointsBonusUtcDate: bonusBps > 0 ? utcDate : ''
        };
        const updatedStats = encodePlayerStats(updatedStatsObj, playerAddress);

        // Create claim record
        const claimValue = createDailyLoginClaim(
            utcDate,
            playerAddress,
            nextStreak,
            rewardPoints,
            bonusBps,
            claimedAtUnix
        );

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerStatsKey, value: updatedStats },
                { key: loginClaimKey, value: claimValue }
            ]
        });
        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessageSetUsername(contract: Contract, msg: any, tx: any): Promise<any> {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const username = (msg?.username || '').toString().trim();
        const setAtUnix = toUint64(tx?.time as Long | number | undefined);

        // Validate username format
        if (!isUsernameValid(username)) {
            return { error: ErrUsernameInvalid() };
        }

        const normalizedUsername = normalizeUsernameForLookup(username);
        const playerIdentityKey = KeyForPlayerIdentity(playerAddress);
        const usernameByAddressKey = KeyForUsernameByAddress(playerAddress); // Keep for backward compatibility
        const addressByUsernameKey = KeyForAddressByUsername(normalizedUsername);
        const playerStatsKey = KeyForPlayerStats(playerAddress);

        const identityQueryId = randomQueryId();
        const usernameQueryId = randomQueryId();
        const lookupQueryId = randomQueryId();
        const statsQueryId = randomQueryId();

        const [response, readErr] = await contract.plugin.StateRead(contract, {
            keys: [
                { queryId: identityQueryId, key: playerIdentityKey },
                { queryId: usernameQueryId, key: usernameByAddressKey },
                { queryId: lookupQueryId, key: addressByUsernameKey },
                { queryId: statsQueryId, key: playerStatsKey }
            ]
        });

        if (readErr) {
            return { error: readErr };
        }
        if (response?.error) {
            return { error: response.error };
        }

        const existingIdentityBytes = getQueryValue(response, identityQueryId);
        const existingUsernameBytes = getQueryValue(response, usernameQueryId);
        const existingOwnerBytes = getQueryValue(response, lookupQueryId);
        const statsBytes = getQueryValue(response, statsQueryId);

        // Check if username is already taken by someone else
        if (existingOwnerBytes && existingOwnerBytes.length > 0) {
            // Compare addresses - if they're the same, it's the player updating their own username
            if (!buffersEqual(existingOwnerBytes, playerAddress)) {
                return { error: ErrUsernameTaken() };
            }
        }

        // Try to read from PlayerIdentity first, fallback to UsernameRegistration for migration
        const existingIdentity = decodePlayerIdentity(existingIdentityBytes);
        const registeredAtUnix = getRegistrationTime(existingIdentityBytes, existingUsernameBytes) || setAtUnix;
        let oldNormalizedUsername = null;

        if (existingIdentity) {
            oldNormalizedUsername = normalizeUsernameForLookup(existingIdentity.username || '');
        } else if (existingUsernameBytes && existingUsernameBytes.length > 0) {
            const existingUsername = decodeUsernameRegistration(existingUsernameBytes);
            if (existingUsername) {
                oldNormalizedUsername = normalizeUsernameForLookup(existingUsername.username || '');
            }
        }

        // Build the sets array for state write
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sets: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deletes: any[] = [];

        // Store new PlayerIdentity
        const playerIdentityValue = encodePlayerIdentity({
            playerAddress,
            username,
            avatarUrl: existingIdentity ? (existingIdentity.avatarUrl || '') : '',
            title: existingIdentity ? (existingIdentity.title || '') : '',
            bio: existingIdentity ? (existingIdentity.bio || '') : '',
            registeredAtUnix,
            lastUpdatedUnix: setAtUnix
        });

        sets.push({ key: playerIdentityKey, value: playerIdentityValue });

        // Also store in old UsernameRegistration format for backward compatibility
        const usernameRegistrationValue = encodeUsernameRegistration({
            playerAddress,
            username,
            registeredAtUnix,
            lastChangedAtUnix: setAtUnix
        });

        sets.push({ key: usernameByAddressKey, value: usernameRegistrationValue });
        sets.push({ key: addressByUsernameKey, value: playerAddress });

        // If player had a different username before, delete the old lookup
        if (oldNormalizedUsername && oldNormalizedUsername !== normalizedUsername) {
            const oldLookupKey = KeyForAddressByUsername(oldNormalizedUsername);
            deletes.push({ key: oldLookupKey });
        }

        // Update PlayerStats - just re-encode without changes (no username field in PlayerStats)
        const stats = decodePlayerStats(statsBytes);
        const updatedStats = encodePlayerStats(stats, playerAddress);

        sets.push({ key: playerStatsKey, value: updatedStats });

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets,
            deletes: deletes.length > 0 ? deletes : undefined
        });

        if (writeErr) {
            return { error: writeErr };
        }
        if (writeResp?.error) {
            return { error: writeResp.error };
        }

        return {};
    }

    // DeliverMessagePoolTransfer handles admin pool transfer operations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async DeliverMessagePoolTransfer(contract: Contract, msg: any, _tx: any): Promise<any> {
        const fromPoolId = toUint64(msg?.fromPoolId as Long | number | undefined);
        const toPoolId = toUint64(msg?.toPoolId as Long | number | undefined);
        const amount = Long.isLong(msg?.amount)
            ? msg.amount
            : Long.fromNumber((msg?.amount as number) || 0);
        // Admin address validation could be added here if needed in the future
        // const adminAddress = normalizeBytes(msg?.adminAddress);

        // Validation
        if (fromPoolId === 0 || toPoolId === 0) {
            return { error: { code: 400, msg: 'Invalid pool IDs: both must be non-zero' } };
        }

        if (fromPoolId === toPoolId) {
            return { error: { code: 400, msg: 'Cannot transfer to the same pool' } };
        }

        if (amount.isZero() || amount.isNegative()) {
            return { error: { code: 400, msg: 'Transfer amount must be positive' } };
        }

        // Import transferBetweenPools from pool-operations
        const { transferBetweenPools } = await import('./economy/pool-operations.js');

        // Execute the pool transfer
        try {
            await transferBetweenPools(contract, fromPoolId, toPoolId, amount);
            return {};
        } catch (error: any) {
            return { error: { code: 500, msg: error?.message || 'Pool transfer failed' } };
        }
    }
}
