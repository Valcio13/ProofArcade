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
    ErrInvalidAddress,
    ErrInvalidAmount,
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
import { JoinLenPrefix, FromAny, Unmarshal } from './plugin.js';
import { fileDescriptorProtos } from '../proto/descriptors.js';
import {
    decodeGame2048State,
    encodeGame2048State,
    GAME2048_TYPE_URLS,
    sha256Bytes,
    toUint64
} from './game2048.js';
import { replayGame } from './game2048-replay.js';

// ContractConfig: the configuration of the contract
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContractConfig: any = {
    name: 'game2048_contract',
    id: 1,
    version: 1,
    supportedTransactions: ['send', 'startDailyGame', 'startClassicGame', 'submitGameResult', 'claimDailyReward', 'redeemClassicPoints', 'claimDailyLoginReward', 'setUsername'],
    transactionTypeUrls: [
        'type.googleapis.com/types.MessageSend',
        GAME2048_TYPE_URLS.startDailyGame,
        GAME2048_TYPE_URLS.startClassicGame,
        GAME2048_TYPE_URLS.submitGameResult,
        GAME2048_TYPE_URLS.claimDailyReward,
        GAME2048_TYPE_URLS.redeemClassicPoints,
        GAME2048_TYPE_URLS.claimDailyLoginReward,
        GAME2048_TYPE_URLS.setUsername
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
        // check sender address
        if (!msg.fromAddress || msg.fromAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        // check recipient address
        if (!msg.toAddress || msg.toAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        // check amount
        const amount = msg.amount as Long | number | undefined;
        if (!amount || (Long.isLong(amount) ? amount.isZero() : amount === 0)) {
            return { error: ErrInvalidAmount() };
        }
        // return the authorized signers
        return {
            recipient: msg.toAddress,
            authorizedSigners: [msg.fromAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageStartDailyGame(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        if (!msg.utcDate || typeof msg.utcDate !== 'string') {
            return { error: ErrInvalidMessageCast() };
        }
        if (gameId.length === 0) {
            return { error: ErrInvalidMessageCast() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageStartClassicGame(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        if (gameId.length === 0) {
            return { error: ErrInvalidMessageCast() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageSubmitGameResult(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        const gameId = normalizeBytes(msg?.gameId);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        if (gameId.length === 0) {
            return { error: ErrInvalidMessageCast() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageClaimDailyReward(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        if (!msg.utcDate || typeof msg.utcDate !== 'string') {
            return { error: ErrInvalidMessageCast() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageRedeemClassicPoints(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        if (toUint64(msg?.burnPoints as Long | number | undefined) === 0) {
            return { error: ErrInvalidAmount() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageClaimDailyLoginReward(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CheckMessageSetUsername(msg: any): any {
        const playerAddress = normalizeBytes(msg?.playerAddress);
        if (playerAddress.length !== 20) {
            return { error: ErrInvalidAddress() };
        }
        return {
            recipient: playerAddress,
            authorizedSigners: [playerAddress]
        };
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
        const [dailyPrizePool] = decodeGame2048State('DailyPrizePool', dailyPoolBytes || new Uint8Array());
        const [gameTreasury] = decodeGame2048State('GameTreasury', treasuryBytes || new Uint8Array());
        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayPool = (dailyPrizePool as any) || {};
        const treasury = normalizeGameTreasury(gameTreasury);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const platformPool = platformPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reservePool = reservePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shopPool = shopPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dailyRewardPool = dailyRewardPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};

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
            id: Long.fromNumber(gamePlatformPoolId),
            amount: platformPoolAmount.add(split.platform)
        });
        const updatedReservePool = types.Pool.create({
            id: Long.fromNumber(gameReservePoolId),
            amount: reservePoolAmount.add(split.reserve)
        });
        const updatedShopPool = types.Pool.create({
            id: Long.fromNumber(gameShopPoolId),
            amount: shopPoolAmount.add(split.shop)
        });
        const updatedDailyRewardPool = types.Pool.create({
            id: Long.fromNumber(gameDailyRewardPoolId),
            amount: dailyRewardPoolAmount.add(split.daily)
        });
        const updatedTreasury = encodeGame2048State('GameTreasury', {
            platformBalance: treasury.platformBalance + split.platform.toNumber(),
            reserveBalance: treasury.reserveBalance + split.reserve.toNumber(),
            shopBalance: treasury.shopBalance + split.shop.toNumber(),
            updatedAtUnix: toUint64(tx?.time as Long | number | undefined)
        });
        const updatedDailyPrizePool = encodeGame2048State('DailyPrizePool', {
            utcDate: msg.utcDate,
            entryCount: toUint64(dayPool.entryCount as Long | number | undefined) + 1,
            grossFees: Long.fromNumber(toUint64(dayPool.grossFees as Long | number | undefined)).add(txFee).toNumber(),
            treasuryFees: Long.fromNumber(toUint64(dayPool.treasuryFees as Long | number | undefined)).add(split.platform).add(split.reserve).add(split.shop).toNumber(),
            rewardPool: Long.fromNumber(toUint64(dayPool.rewardPool as Long | number | undefined)).add(split.daily).toNumber(),
            finalized: false,
            finalizedAtUnix: 0,
            distributedRewards: toUint64(dayPool.distributedRewards as Long | number | undefined),
            treasuryLeftover: toUint64(dayPool.treasuryLeftover as Long | number | undefined)
        });

        const sessionSeed = deriveDailySeed(contract.Config.ChainId, msg.utcDate);
        const sessionValue = encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 1,
            utcDate: msg.utcDate,
            seed: sessionSeed,
            status: 1,
            startedHeight: toUint64(tx?.createdHeight as Long | number | undefined),
            startedAtUnix: toUint64(tx?.time as Long | number | undefined),
            feePaid: txFee.toNumber(),
            maxMoves: getConfiguredDailyMaxMoves(cfg)
        });
        const attemptValue = encodeGame2048State('DailyAttempt', {
            utcDate: msg.utcDate,
            playerAddress,
            gameId
        });
        const statsValue = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined) + 1,
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
            wins: toUint64(stats.wins as Long | number | undefined),
            losses: toUint64(stats.losses as Long | number | undefined),
            bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
            bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
            bestTile: toUint64(stats.bestTile as Long | number | undefined),
            totalScore: toUint64(stats.totalScore as Long | number | undefined),
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined),
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined),
            loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
            lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
            classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
        });

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerKey, value: types.Account.encode(newPlayer).finish() },
                { key: platformPoolKey, value: types.Pool.encode(updatedPlatformPool).finish() },
                { key: reservePoolKey, value: types.Pool.encode(updatedReservePool).finish() },
                { key: shopPoolKey, value: types.Pool.encode(updatedShopPool).finish() },
                { key: dailyRewardPoolKey, value: types.Pool.encode(updatedDailyRewardPool).finish() },
                { key: gameTreasuryKey, value: updatedTreasury },
                { key: dailyPoolKey, value: updatedDailyPrizePool },
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
        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};

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
        const reservePoolAmount = Long.isLong(reservePool?.amount)
            ? reservePool.amount
            : Long.fromNumber((reservePool?.amount as number) || 0);
        const shopPoolAmount = Long.isLong(shopPool?.amount)
            ? shopPool.amount
            : Long.fromNumber((shopPool?.amount as number) || 0);
        const updatedPlatformPool = types.Pool.create({
            id: Long.fromNumber(gamePlatformPoolId),
            amount: platformPoolAmount.add(split.platform)
        });
        const updatedReservePool = types.Pool.create({
            id: Long.fromNumber(gameReservePoolId),
            amount: reservePoolAmount.add(split.reserve)
        });
        const updatedShopPool = types.Pool.create({
            id: Long.fromNumber(gameShopPoolId),
            amount: shopPoolAmount.add(split.shop)
        });
        const updatedTreasury = encodeGame2048State('GameTreasury', {
            platformBalance: treasury.platformBalance + split.platform.toNumber(),
            reserveBalance: treasury.reserveBalance + split.reserve.toNumber(),
            shopBalance: treasury.shopBalance + split.shop.toNumber(),
            updatedAtUnix: toUint64(tx?.time as Long | number | undefined)
        });

        const sessionSeed = deriveClassicSeed(playerAddress, tx);
        const sessionValue = encodeGame2048State('GameSession', {
            gameId,
            playerAddress,
            mode: 2,
            utcDate: '',
            seed: sessionSeed,
            status: 1,
            startedHeight: toUint64(tx?.createdHeight as Long | number | undefined),
            startedAtUnix: toUint64(tx?.time as Long | number | undefined),
            feePaid: txFee.toNumber(),
            maxMoves: 0
        });
        const statsValue = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined) + 1,
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
            wins: toUint64(stats.wins as Long | number | undefined),
            losses: toUint64(stats.losses as Long | number | undefined),
            bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
            bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
            bestTile: toUint64(stats.bestTile as Long | number | undefined),
            totalScore: toUint64(stats.totalScore as Long | number | undefined),
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined),
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined),
            loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
            lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
            classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
        });

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
            sets: [
                { key: playerKey, value: types.Account.encode(newPlayer).finish() },
                { key: platformPoolKey, value: types.Pool.encode(updatedPlatformPool).finish() },
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
        let username = '';
        if (usernameBytes && usernameBytes.length > 0) {
            const [usernameReg] = decodeGame2048State('UsernameRegistration', usernameBytes);
            if (usernameReg) {
                username = (usernameReg as any).username || '';
            }
        }

        const [session, sessionErr] = decodeGame2048State('GameSession', sessionBytes);
        if (sessionErr) {
            return { error: sessionErr };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameSession = session as any;
        if (!Buffer.from(normalizeBytes(gameSession?.playerAddress)).equals(Buffer.from(playerAddress))) {
            return { error: ErrSessionOwnerMismatch() };
        }
        if (toUint64(gameSession?.status as Long | number | undefined) !== 1) {
            return { error: ErrSessionNotActive() };
        }

        const maxMoves = toUint64(gameSession?.maxMoves as Long | number | undefined);
        const submittedMoves = normalizeMoves(msg.moves);
        const submittedMoveCount = submittedMoves.length;
        const isDaily = toUint64(gameSession?.mode as Long | number | undefined) === 1;
        if (!areMovesValid(submittedMoves)) {
            return { error: ErrInvalidMoveDirection() };
        }
        if (isDaily && maxMoves > 0 && submittedMoveCount > maxMoves) {
            return { error: ErrMoveCapExceeded() };
        }

        const replay = replayGame({
            seed: gameSession?.seed || new Uint8Array(),
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

        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const [classicPointsLedger] = decodeGame2048State('ClassicPointsDailyLedger', classicPointsLedgerBytes || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pointsLedger = (classicPointsLedger as any) || {};
        const updatedSession = encodeGame2048State('GameSession', {
            gameId: gameSession?.gameId,
            playerAddress: gameSession?.playerAddress,
            mode: gameSession?.mode,
            utcDate: gameSession?.utcDate || '',
            seed: gameSession?.seed || new Uint8Array(),
            status: 2,
            startedHeight: toUint64(gameSession?.startedHeight as Long | number | undefined),
            startedAtUnix: toUint64(gameSession?.startedAtUnix as Long | number | undefined),
            feePaid: toUint64(gameSession?.feePaid as Long | number | undefined),
            maxMoves,
            submittedScore: replay.score,
            submittedMaxTile: replay.maxTile,
            finalMoveCount: replay.moveCount,
            stopReason: replay.endedReason,
            submittedAtUnix: endedAtUnix
        });

        const previousBestDaily = toUint64(stats.bestDailyScore as Long | number | undefined);
        const previousBestClassic = toUint64(stats.bestClassicScore as Long | number | undefined);
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
        const updatedStats = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined) + 1,
            wins: toUint64(stats.wins as Long | number | undefined) + (replay.win ? 1 : 0),
            losses: toUint64(stats.losses as Long | number | undefined) + (replay.win ? 0 : 1),
            bestDailyScore: isDaily ? Math.max(previousBestDaily, replay.score) : previousBestDaily,
            bestClassicScore: isDaily ? previousBestClassic : Math.max(previousBestClassic, replay.score),
            bestTile: Math.max(toUint64(stats.bestTile as Long | number | undefined), replay.maxTile),
            totalScore: toUint64(stats.totalScore as Long | number | undefined) + replay.score,
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined) + earnedClassicPoints,
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined) + earnedClassicPoints,
            loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
            lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
            classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
        });

        const leaderboardEntry = encodeGame2048State('LeaderboardEntry', {
            gameId,
            playerAddress,
            score: replay.score,
            maxTile: replay.maxTile,
            moveCount: replay.moveCount,
            endedAtUnix,
            username
        });

        const sets = [
            { key: KeyForGameSession(gameId), value: updatedSession },
            { key: KeyForPlayerStats(playerAddress), value: updatedStats }
        ];

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
                value: encodeGame2048State('DailySubmission', {
                    utcDate: gameSession?.utcDate || '',
                    playerAddress,
                    gameId,
                    score: replay.score,
                    maxTile: replay.maxTile,
                    moveCount: replay.moveCount,
                    submittedAtUnix: endedAtUnix
                })
            });
        } else {
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
        }

        const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, { sets });
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
        const [dailyPool] = decodeGame2048State('DailyPrizePool', poolBytes);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feePool = feePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daoPool = daoPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pool = (dailyPool as any) || {};
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
        const updatedDailyPool = encodeGame2048State('DailyPrizePool', {
            utcDate,
            entryCount: toUint64(pool.entryCount as Long | number | undefined),
            grossFees: toUint64(pool.grossFees as Long | number | undefined),
            treasuryFees: toUint64(pool.treasuryFees as Long | number | undefined),
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
        });
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
        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        const [gameTreasury] = decodeGame2048State('GameTreasury', treasuryBytes || new Uint8Array());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = playerRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feePool = feePoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const daoPool = daoPoolRaw as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};
        const treasury = normalizeGameTreasury(gameTreasury);

        const minRedeemPoints = getConfiguredShopMinRedeemPoints(cfg);
        const redeemStepPoints = getConfiguredShopRedeemStepPoints(cfg);
        const redeemRatePoints = getConfiguredShopRedemptionRatePoints(cfg);
        const redeemRateCnpy = getConfiguredShopRedemptionRateCnpy(cfg);

        if (burnPoints < minRedeemPoints) {
            return { error: ErrRedeemBelowMinimum() };
        }
        if (redeemStepPoints > 0 && burnPoints % redeemStepPoints !== 0) {
            return { error: ErrRedeemInvalidStep() };
        }

        const classicPointsBalance = toUint64(stats.classicPointsBalance as Long | number | undefined);
        if (classicPointsBalance < burnPoints) {
            return { error: ErrInsufficientClassicPoints() };
        }

        const payoutAmount = calculateRedeemPayout(burnPoints, redeemRatePoints, redeemRateCnpy);
        if (payoutAmount <= 0) {
            return { error: ErrRedeemPayoutZero() };
        }

        const shopPoolAmount = Long.isLong(feePool?.amount)
            ? feePool.amount
            : Long.fromNumber((feePool?.amount as number) || 0);
        const daoPoolAmount = Long.isLong(daoPool?.amount)
            ? daoPool.amount
            : Long.fromNumber((daoPool?.amount as number) || 0);
        const payoutLong = Long.fromNumber(payoutAmount);
        const shopBalance = Long.fromNumber(treasury.shopBalance);
        if (shopBalance.lessThan(payoutLong)) {
            return { error: ErrInsufficientFunds() };
        }
        const useShopPool = !shopPoolAmount.lessThan(payoutLong);
        if (!useShopPool && daoPoolAmount.lessThan(payoutLong)) {
            return { error: ErrInsufficientFunds() };
        }

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
        const updatedStats = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
            wins: toUint64(stats.wins as Long | number | undefined),
            losses: toUint64(stats.losses as Long | number | undefined),
            bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
            bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
            bestTile: toUint64(stats.bestTile as Long | number | undefined),
            totalScore: toUint64(stats.totalScore as Long | number | undefined),
            classicPointsBalance: classicPointsBalance - burnPoints,
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined),
            loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
            lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
            classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
        });
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

        const redemptionValue = encodeGame2048State('ClassicPointRedemption', {
            playerAddress,
            burnPoints,
            payoutAmount,
            redeemedAtUnix,
            txHash: txHash
        });
        
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

        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());
        const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (gameConfig as any) || {};

        const previousClaimUtcDate = stats.lastLoginClaimUtcDate || '';
        let nextStreak = 1;
        if (previousClaimUtcDate === previousUtcDate(utcDate)) {
            const streakSchedule = getConfiguredDailyLoginRewardPoints(cfg);
            const currentStreak = toUint64(stats.loginStreak as Long | number | undefined);
            const scheduleLength = streakSchedule.length || 7;
            // Cycle: 1→2→3→4→5→6→7→1 (wraps back to 1 after 7)
            nextStreak = currentStreak >= scheduleLength ? 1 : currentStreak + 1;
        }

        const streakSchedule = getConfiguredDailyLoginRewardPoints(cfg);
        const rewardPoints = resolveDailyLoginRewardPoints(cfg, nextStreak);
        const bonusBps = nextStreak >= streakSchedule.length ? getConfiguredDailyLoginBonusBps(cfg) : 0;

        const updatedStats = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
            wins: toUint64(stats.wins as Long | number | undefined),
            losses: toUint64(stats.losses as Long | number | undefined),
            bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
            bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
            bestTile: toUint64(stats.bestTile as Long | number | undefined),
            totalScore: toUint64(stats.totalScore as Long | number | undefined),
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined) + rewardPoints,
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined) + rewardPoints,
            loginStreak: nextStreak,
            lastLoginClaimUtcDate: utcDate,
            classicPointsBonusUtcDate: bonusBps > 0 ? utcDate : ''
        });

        const claimValue = encodeGame2048State('DailyLoginClaim', {
            utcDate,
            playerAddress,
            streakDay: nextStreak,
            rewardPoints,
            bonusBps,
            claimedAtUnix
        });

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
        if (!validateUsername(username)) {
            return { error: ErrUsernameInvalid() };
        }

        const normalizedUsername = normalizeUsername(username);
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
        let existingIdentity = null;
        let registeredAtUnix = setAtUnix;
        let oldNormalizedUsername = null;

        if (existingIdentityBytes && existingIdentityBytes.length > 0) {
            [existingIdentity] = decodeGame2048State('PlayerIdentity', existingIdentityBytes);
            if (existingIdentity) {
                registeredAtUnix = toUint64((existingIdentity as any).registeredAtUnix as Long | number | undefined);
                oldNormalizedUsername = normalizeUsername((existingIdentity as any).username || '');
            }
        } else if (existingUsernameBytes && existingUsernameBytes.length > 0) {
            // Migration path: read from old UsernameRegistration
            const [existingUsername] = decodeGame2048State('UsernameRegistration', existingUsernameBytes);
            if (existingUsername) {
                registeredAtUnix = toUint64((existingUsername as any).registeredAtUnix as Long | number | undefined);
                oldNormalizedUsername = normalizeUsername((existingUsername as any).username || '');
            }
        }

        // Build the sets array for state write
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sets: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deletes: any[] = [];

        // Store new PlayerIdentity (with empty avatar/title/bio for now)
        const playerIdentity = encodeGame2048State('PlayerIdentity', {
            playerAddress,
            username,
            avatarUrl: existingIdentity ? (existingIdentity as any).avatarUrl || '' : '',
            title: existingIdentity ? (existingIdentity as any).title || '' : '',
            bio: existingIdentity ? (existingIdentity as any).bio || '' : '',
            registeredAtUnix,
            lastUpdatedUnix: setAtUnix
        });

        sets.push({ key: playerIdentityKey, value: playerIdentity });

        // Also store in old UsernameRegistration format for backward compatibility
        const usernameRegistration = encodeGame2048State('UsernameRegistration', {
            playerAddress,
            username,
            registeredAtUnix,
            lastChangedAtUnix: setAtUnix
        });

        sets.push({ key: usernameByAddressKey, value: usernameRegistration });
        sets.push({ key: addressByUsernameKey, value: playerAddress });

        // If player had a different username before, delete the old lookup
        if (oldNormalizedUsername && oldNormalizedUsername !== normalizedUsername) {
            const oldLookupKey = KeyForAddressByUsername(oldNormalizedUsername);
            deletes.push({ key: oldLookupKey });
        }

        // Update PlayerStats with username
        const [playerStats] = decodeGame2048State('PlayerStats', statsBytes || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (playerStats as any) || {};

        const updatedStats = encodeGame2048State('PlayerStats', {
            playerAddress,
            dailyGamesStarted: toUint64(stats.dailyGamesStarted as Long | number | undefined),
            classicGamesStarted: toUint64(stats.classicGamesStarted as Long | number | undefined),
            gamesCompleted: toUint64(stats.gamesCompleted as Long | number | undefined),
            wins: toUint64(stats.wins as Long | number | undefined),
            losses: toUint64(stats.losses as Long | number | undefined),
            bestDailyScore: toUint64(stats.bestDailyScore as Long | number | undefined),
            bestClassicScore: toUint64(stats.bestClassicScore as Long | number | undefined),
            bestTile: toUint64(stats.bestTile as Long | number | undefined),
            totalScore: toUint64(stats.totalScore as Long | number | undefined),
            classicPointsBalance: toUint64(stats.classicPointsBalance as Long | number | undefined),
            classicPointsEarned: toUint64(stats.classicPointsEarned as Long | number | undefined),
            loginStreak: toUint64(stats.loginStreak as Long | number | undefined),
            lastLoginClaimUtcDate: stats.lastLoginClaimUtcDate || '',
            classicPointsBonusUtcDate: stats.classicPointsBonusUtcDate || ''
        });

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
}

const accountPrefix = Buffer.from([1]); // store key prefix for accounts
const poolPrefix = Buffer.from([2]); // store key prefix for pools
const gamePrefix = Buffer.from([18]); // store key prefix for 2048 game state
const paramsPrefix = Buffer.from([7]); // store key prefix for governance parameters
const daoPoolId = 131071;
const gamePlatformPoolId = daoPoolId + 1;
const gameReservePoolId = daoPoolId + 2;
const gameShopPoolId = daoPoolId + 3;
const gameDailyRewardPoolId = daoPoolId + 4;
// Currency: 1 PROOF = 1,000,000 microPROOF (canonical unit)
const MICRO_PER_PROOF = 1_000_000;
const defaultClassicStartFee = 2 * MICRO_PER_PROOF;  // 2 PROOF = 2,000,000 microPROOF
const defaultDailyStartFee = 25 * MICRO_PER_PROOF;   // 25 PROOF = 25,000,000 microPROOF
const legacyClassicStartFee = 90 * MICRO_PER_PROOF;  // 90 PROOF = 90,000,000 microPROOF
const legacyDailyStartFee = 240 * MICRO_PER_PROOF;   // 240 PROOF = 240,000,000 microPROOF
const defaultDailyMaxMoves = 80;
const defaultDailyPlatformFeeBps = 500;
const defaultDailyRewardFeeBps = 8000;
const defaultDailyReserveFeeBps = 1000;
const defaultDailyShopFeeBps = 500;
const defaultClassicPlatformFeeBps = 500;
const defaultClassicReserveFeeBps = 4500;
const defaultClassicShopFeeBps = 5000;
const defaultDailyPayoutBps = [3000, 2000, 1200, 900, 700, 600, 500, 400, 400, 300];
const defaultClassicDailyPointsCap = 2000;
const defaultShopRedemptionRatePoints = 300;
const defaultShopRedemptionRateCnpy = 1;
const defaultShopMinRedeemPoints = 300;
const defaultShopRedeemStepPoints = 300;
const defaultDailyLoginRewardPoints = [20, 25, 30, 35, 40, 45, 50];
const defaultDailyLoginBonusBps = 2000;

// KeyForAccount() returns the state database key for an account
export function KeyForAccount(addr: Uint8Array): Uint8Array {
    return JoinLenPrefix(accountPrefix, Buffer.from(addr));
}

// KeyForFeeParams() returns the state database key for governance controlled 'fee parameters'
export function KeyForFeeParams(): Uint8Array {
    return JoinLenPrefix(paramsPrefix, Buffer.from('/f/'));
}

// KeyForFeePool() returns the state database key for governance controlled 'fee parameters'
export function KeyForFeePool(chainId: Long): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(chainId));
}

export function KeyForGamePlatformPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(gamePlatformPoolId)));
}

export function KeyForGameReservePool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(gameReservePoolId)));
}

export function KeyForGameShopPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(gameShopPoolId)));
}

export function KeyForGameDailyRewardPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(gameDailyRewardPoolId)));
}

function KeyForDaoPool(): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(daoPoolId)));
}

export function KeyForGameConfig(): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('config'));
}

export function KeyForGameTreasury(): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('treasury'));
}

export function KeyForGameSession(gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('session'), Buffer.from(gameId));
}

export function KeyForDailyAttempt(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-attempt'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailySubmission(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-submit'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailyPrizePool(utcDate: string): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-pool'), Buffer.from(utcDate, 'utf8'));
}

export function KeyForDailyLeaderboard(
    utcDate: string,
    score: Long,
    maxTile: Long,
    moveCount: Long,
    endedAtUnix: Long,
    gameId: Uint8Array
): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('daily-leaderboard'),
        Buffer.from(utcDate, 'utf8'),
        invertUint64(score),
        invertUint64(maxTile),
        formatUint64(moveCount),
        formatUint64(endedAtUnix),
        Buffer.from(gameId)
    );
}

export function KeyForClassicLeaderboard(score: Long, gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-leaderboard'), invertUint64(score), Buffer.from(gameId));
}

export function KeyForPlayerStats(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('player-stats'), Buffer.from(playerAddress));
}

function calculateClassicPoints(score: number): number {
    if (score < 64) {
        return 0;
    }
    return Math.min(1000, Math.floor(score / 24));
}

export function KeyForDailyRewardAllocation(utcDate: string, rank: number, gameId: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-reward'), Buffer.from(utcDate, 'utf8'), formatUint64(Long.fromNumber(rank)), Buffer.from(gameId));
}

export function KeyForDailyRewardByPlayer(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-reward-player'), Buffer.from(playerAddress), Buffer.from(utcDate, 'utf8'));
}

export function KeyForDailyRewardClaim(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-claim'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForDailyLoginClaim(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('daily-login'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForClassicPointsDailyLedger(utcDate: string, playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-points-day'), Buffer.from(utcDate, 'utf8'), Buffer.from(playerAddress));
}

export function KeyForClassicPointRedemption(playerAddress: Uint8Array, redeemedAtUnix: number, burnPoints: number): Uint8Array {
    return JoinLenPrefix(
        gamePrefix,
        Buffer.from('classic-redeem'),
        Buffer.from(playerAddress),
        formatUint64(Long.fromNumber(redeemedAtUnix)),
        formatUint64(Long.fromNumber(burnPoints))
    );
}

export function KeyForClassicPointRedemptionPrefix(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('classic-redeem'), Buffer.from(playerAddress));
}

// KeyForUsernameByAddress stores the username for a specific address
export function KeyForUsernameByAddress(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('username-addr'), Buffer.from(playerAddress));
}

// KeyForPlayerIdentity stores the unified identity for a specific address
export function KeyForPlayerIdentity(playerAddress: Uint8Array): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('player-identity'), Buffer.from(playerAddress));
}

// KeyForAddressByUsername stores the address that owns a normalized username
export function KeyForAddressByUsername(normalizedUsername: string): Uint8Array {
    return JoinLenPrefix(gamePrefix, Buffer.from('username-lookup'), Buffer.from(normalizedUsername.toLowerCase(), 'utf8'));
}

function formatUint64(u: Long): Buffer {
    const b = Buffer.alloc(8);
    b.writeBigUInt64BE(BigInt(u.toString()));
    return b;
}

function invertUint64(u: Long): Buffer {
    const b = Buffer.alloc(8);
    const max = BigInt('18446744073709551615');
    b.writeBigUInt64BE(max - BigInt(u.toString()));
    return b;
}

function randomQueryId(): Long {
    return Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
}

// normalizeUsername converts a username to lowercase for case-insensitive uniqueness checks
function normalizeUsername(username: string): string {
    return username.toLowerCase();
}

// validateUsername checks if a username meets the requirements:
// - 3-20 characters
// - Alphanumeric + underscore only
// Returns true if valid, false otherwise
function validateUsername(username: string): boolean {
    if (!username || username.length < 3 || username.length > 20) {
        return false;
    }
    // Only allow letters, numbers, and underscore
    const validPattern = /^[a-zA-Z0-9_]+$/;
    return validPattern.test(username);
}

// buffersEqual compares two byte arrays for equality
function buffersEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getQueryValue(response: any, queryId: Long): Uint8Array | null {
    for (const resp of response?.results || []) {
        const qid = resp.queryId as Long;
        if (qid.equals(queryId)) {
            return resp.entries?.[0]?.value || null;
        }
    }
    return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBytes(value: any): Uint8Array {
    if (!value) {
        return new Uint8Array();
    }
    if (value instanceof Uint8Array) {
        return value;
    }
    if (Buffer.isBuffer(value)) {
        return new Uint8Array(value);
    }
    if (Array.isArray(value)) {
        return Uint8Array.from(value);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return new Uint8Array();
        }
        const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
        if (hex.length > 0 && hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
            return new Uint8Array(Buffer.from(hex, 'hex'));
        }
        try {
            return new Uint8Array(Buffer.from(trimmed, 'base64'));
        } catch {
            return new Uint8Array(Buffer.from(trimmed, 'utf8'));
        }
    }
    if (typeof value === 'object') {
        // protobufjs sometimes exposes bytes as `{ type: 'Buffer', data: [...] }`
        if (Array.isArray(value.data)) {
            return Uint8Array.from(value.data);
        }
    }
    return new Uint8Array();
}

function deriveDailySeed(chainId: number, utcDate: string): Uint8Array {
    // NOTE: This is a deterministic scaffold. For production, mix in an explicitly chain-derived
    // daily entropy source such as a recorded block hash at the UTC boundary.
    return sha256Bytes('daily-seed', chainId, utcDate);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deriveClassicSeed(playerAddress: Uint8Array, tx: any): Uint8Array {
    return sha256Bytes(
        'classic-seed',
        normalizeBytes(playerAddress),
        toUint64(tx?.createdHeight as Long | number | undefined),
        toUint64(tx?.time as Long | number | undefined),
        toUint64(tx?.fee as Long | number | undefined),
        tx?.memo || ''
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMoves(moves: any): number[] {
    if (!Array.isArray(moves)) {
        return [];
    }
    return moves.map((move) => toUint64(move as Long | number | undefined));
}

function areMovesValid(moves: number[]): boolean {
    return moves.every((move) => move >= 1 && move <= 4);
}

function getConfiguredClassicStartFee(cfg: any): number {
    const fee = toUint64(cfg?.classicStartFee as Long | number | undefined);
    if (isLegacyStartFeePair(cfg)) {
        return defaultClassicStartFee;
    }
    return fee > 0 ? fee : defaultClassicStartFee;
}

function getConfiguredDailyStartFee(cfg: any): number {
    const fee = toUint64(cfg?.dailyStartFee as Long | number | undefined);
    if (isLegacyStartFeePair(cfg)) {
        return defaultDailyStartFee;
    }
    return fee > 0 ? fee : defaultDailyStartFee;
}

function isLegacyStartFeePair(cfg: any): boolean {
    const classicFee = toUint64(cfg?.classicStartFee as Long | number | undefined);
    const dailyFee = toUint64(cfg?.dailyStartFee as Long | number | undefined);
    return classicFee === legacyClassicStartFee && dailyFee === legacyDailyStartFee;
}

function getConfiguredDailyMaxMoves(cfg: any): number {
    const maxMoves = toUint64(cfg?.dailyMaxMoves as Long | number | undefined);
    return maxMoves > 0 ? maxMoves : defaultDailyMaxMoves;
}

function getConfiguredDailyPlatformFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyPlatformFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyPlatformFeeBps;
}

function getConfiguredDailyRewardFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyRewardFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyRewardFeeBps;
}

function getConfiguredDailyReserveFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyReserveFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyReserveFeeBps;
}

function getConfiguredDailyShopFeeBps(cfg: any): number {
    const value = toUint64(cfg?.dailyShopFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyShopFeeBps;
}

function getConfiguredDailyPayoutBps(cfg: any): number[] {
    const values = Array.isArray(cfg?.dailyPayoutBps)
        ? cfg.dailyPayoutBps.map((value: Long | number) => toUint64(value))
        : [];
    return values.length > 0 ? values : defaultDailyPayoutBps;
}

function getConfiguredClassicPlatformFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicPlatformFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicPlatformFeeBps;
}

function getConfiguredClassicReserveFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicReserveFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicReserveFeeBps;
}

function getConfiguredClassicShopFeeBps(cfg: any): number {
    const value = toUint64(cfg?.classicShopFeeBps as Long | number | undefined);
    return value > 0 ? value : defaultClassicShopFeeBps;
}

function getConfiguredClassicDailyPointsCap(cfg: any): number {
    const value = toUint64(cfg?.classicDailyPointsCap as Long | number | undefined);
    return value > 0 ? value : defaultClassicDailyPointsCap;
}

function getConfiguredShopRedemptionRatePoints(cfg: any): number {
    const value = toUint64(cfg?.shopRedemptionRatePoints as Long | number | undefined);
    return value > 0 ? value : defaultShopRedemptionRatePoints;
}

function getConfiguredShopRedemptionRateCnpy(cfg: any): number {
    const value = toUint64(cfg?.shopRedemptionRateCnpy as Long | number | undefined);
    return value > 0 ? value : defaultShopRedemptionRateCnpy;
}

function getConfiguredShopMinRedeemPoints(cfg: any): number {
    const value = toUint64(cfg?.shopMinRedeemPoints as Long | number | undefined);
    return value > 0 ? value : defaultShopMinRedeemPoints;
}

function getConfiguredShopRedeemStepPoints(cfg: any): number {
    const value = toUint64(cfg?.shopRedeemStepPoints as Long | number | undefined);
    return value > 0 ? value : defaultShopRedeemStepPoints;
}

function getConfiguredDailyLoginRewardPoints(cfg: any): number[] {
    const values = Array.isArray(cfg?.dailyLoginRewardPoints)
        ? cfg.dailyLoginRewardPoints.map((value: Long | number) => toUint64(value))
        : [];
    return values.length > 0 ? values : defaultDailyLoginRewardPoints;
}

function getConfiguredDailyLoginBonusBps(cfg: any): number {
    const value = toUint64(cfg?.dailyLoginBonusBps as Long | number | undefined);
    return value > 0 ? value : defaultDailyLoginBonusBps;
}

function resolveDailyLoginRewardPoints(cfg: any, streakDay: number): number {
    const schedule = getConfiguredDailyLoginRewardPoints(cfg);
    if (schedule.length === 0) {
        return 0;
    }
    const index = Math.max(0, Math.min(schedule.length - 1, streakDay - 1));
    return schedule[index];
}

function calculateRedeemPayout(burnPoints: number, ratePoints: number, rateCnpy: number): number {
    if (burnPoints <= 0 || ratePoints <= 0 || rateCnpy <= 0) {
        return 0;
    }
    return Math.floor((burnPoints * rateCnpy) / ratePoints);
}

function calculateBonusPoints(basePoints: number, bonusBps: number): number {
    if (basePoints <= 0 || bonusBps <= 0) {
        return 0;
    }
    return Math.floor((basePoints * bonusBps) / 10000);
}

function calculateBpsAmount(amount: Long, bps: number): Long {
    if (bps <= 0) {
        return Long.ZERO;
    }
    return amount.multiply(bps).divide(10000);
}

function splitDailyFee(amount: Long, cfg: any): { platform: Long; daily: Long; reserve: Long; shop: Long } {
    const platformBps = getConfiguredDailyPlatformFeeBps(cfg);
    const dailyBps = getConfiguredDailyRewardFeeBps(cfg);
    const reserveBps = getConfiguredDailyReserveFeeBps(cfg);
    const shopBps = getConfiguredDailyShopFeeBps(cfg);
    const platform = calculateBpsAmount(amount, platformBps);
    const daily = calculateBpsAmount(amount, dailyBps);
    const reserve = calculateBpsAmount(amount, reserveBps);
    const shop = platformBps + dailyBps + reserveBps + shopBps === 10000
        ? calculateBpsAmount(amount, shopBps)
        : amount.subtract(platform).subtract(daily).subtract(reserve);
    return { platform, daily, reserve, shop };
}

function splitClassicFee(amount: Long, cfg: any): { platform: Long; reserve: Long; shop: Long } {
    const platformBps = getConfiguredClassicPlatformFeeBps(cfg);
    const reserveBps = getConfiguredClassicReserveFeeBps(cfg);
    const shopBps = getConfiguredClassicShopFeeBps(cfg);
    const platform = calculateBpsAmount(amount, platformBps);
    const reserve = calculateBpsAmount(amount, reserveBps);
    const shop = platformBps + reserveBps + shopBps === 10000
        ? calculateBpsAmount(amount, shopBps)
        : amount.subtract(platform).subtract(reserve);
    return { platform, reserve, shop };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeGameTreasury(treasury: any) {
    return {
        platformBalance: toUint64(treasury?.platformBalance as Long | number | undefined),
        reserveBalance: toUint64(treasury?.reserveBalance as Long | number | undefined),
        shopBalance: toUint64(treasury?.shopBalance as Long | number | undefined),
        updatedAtUnix: toUint64(treasury?.updatedAtUnix as Long | number | undefined)
    };
}

function hasUtcDayEnded(utcDate: string, nowMicros: number): boolean {
    if (!utcDate) {
        return false;
    }
    const endMillis = Date.parse(`${utcDate}T00:00:00.000Z`) + 24 * 60 * 60 * 1000;
    return nowMicros >= endMillis * 1000;
}

function utcDateFromMicros(nowMicros: number): string {
    if (nowMicros <= 0) {
        return new Date().toISOString().slice(0, 10);
    }
    return new Date(Math.floor(nowMicros / 1000)).toISOString().slice(0, 10);
}

function previousUtcDate(utcDate: string): string {
    const baseMillis = Date.parse(`${utcDate}T00:00:00.000Z`);
    if (Number.isNaN(baseMillis)) {
        return '';
    }
    return new Date(baseMillis - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function finalizeDailyRewardPoolIfNeeded(
    contract: Contract,
    utcDate: string,
    nowMicros: number
): Promise<IPluginError | null> {
    const poolQueryId = randomQueryId();
    const configQueryId = randomQueryId();
    const [response, readErr] = await contract.plugin.StateRead(contract, {
        keys: [
            { queryId: poolQueryId, key: KeyForDailyPrizePool(utcDate) },
            { queryId: configQueryId, key: KeyForGameConfig() }
        ]
    });
    if (readErr) {
        return readErr;
    }
    if (response?.error) {
        return response.error;
    }

    const poolBytes = getQueryValue(response, poolQueryId);
    if (!poolBytes || poolBytes.length === 0) {
        return ErrDailyPrizePoolNotFound();
    }
    const configBytes = getQueryValue(response, configQueryId);
    const [gameConfig] = decodeGame2048State('GameConfig', configBytes || new Uint8Array());
    const [dailyPool] = decodeGame2048State('DailyPrizePool', poolBytes);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfg = (gameConfig as any) || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool = (dailyPool as any) || {};

    if (pool.finalized) {
        return null;
    }
    if (!hasUtcDayEnded(utcDate, nowMicros)) {
        return ErrDailyRewardDayNotClaimable();
    }

    const payoutBps = getConfiguredDailyPayoutBps(cfg);
    const rewardPool = Long.fromNumber(toUint64(pool.rewardPool as Long | number | undefined));
    const sets: Array<{ key: Uint8Array; value: Uint8Array }> = [];
    const [summary, summaryErr] = await loadDailyRewardFinalizationSummary(contract, utcDate, rewardPool, payoutBps);
    if (summaryErr) {
        return summaryErr;
    }

    summary.allocations.forEach((allocation) => {
        const allocationValue = encodeGame2048State('DailyRewardAllocation', allocation);
        sets.push({
            key: KeyForDailyRewardAllocation(
                utcDate,
                toUint64(allocation.rank as Long | number | undefined),
                normalizeBytes(allocation.gameId)
            ),
            value: allocationValue
        });
        sets.push({
            key: KeyForDailyRewardByPlayer(utcDate, normalizeBytes(allocation.playerAddress)),
            value: allocationValue
        });
    });

    const updatedPool = encodeGame2048State('DailyPrizePool', {
        utcDate,
        entryCount: toUint64(pool.entryCount as Long | number | undefined),
        grossFees: toUint64(pool.grossFees as Long | number | undefined),
        treasuryFees: toUint64(pool.treasuryFees as Long | number | undefined),
        rewardPool: rewardPool.toNumber(),
        finalized: true,
        finalizedAtUnix: nowMicros,
        distributedRewards: summary.distributed.toNumber(),
        treasuryLeftover: summary.leftover.toNumber()
    });
    sets.push({ key: KeyForDailyPrizePool(utcDate), value: updatedPool });

    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, { sets });
    if (writeErr) {
        return writeErr;
    }
    if (writeResp?.error) {
        return writeResp.error;
    }
    return null;
}

type DailyRewardAllocationRecord = {
    utcDate: string;
    playerAddress: Uint8Array;
    gameId: Uint8Array;
    rank: number;
    rewardAmount: number;
    score: number;
    maxTile: number;
    moveCount: number;
    endedAtUnix: number;
};

type DailyRewardFinalizationSummary = {
    allocations: DailyRewardAllocationRecord[];
    distributed: Long;
    leftover: Long;
};

async function loadDailyRewardFinalizationSummary(
    contract: Contract,
    utcDate: string,
    rewardPool: Long,
    payoutBps: number[]
): Promise<[DailyRewardFinalizationSummary, IPluginError | null]> {
    const leaderboardPrefix = JoinLenPrefix(gamePrefix, Buffer.from('daily-leaderboard'), Buffer.from(utcDate, 'utf8'));
    const [iterResp, iterErr] = await contract.plugin.StateRead(contract, {
        ranges: [
            {
                prefix: leaderboardPrefix,
                limit: payoutBps.length
            }
        ]
    });
    if (iterErr) {
        return [{ allocations: [], distributed: Long.ZERO, leftover: rewardPool }, iterErr];
    }
    if (iterResp?.error) {
        return [{ allocations: [], distributed: Long.ZERO, leftover: rewardPool }, iterResp.error];
    }

    let distributed = Long.ZERO;
    const allocations: DailyRewardAllocationRecord[] = [];
    const entries = (iterResp?.results?.[0]?.entries || []).slice(0, payoutBps.length);
    const usedPayoutBps = payoutBps.slice(0, entries.length);
    const usedPayoutBpsTotal = usedPayoutBps.reduce((sum, bps) => sum + bps, 0);
    entries.forEach((entry: any, index: number) => {
        const [leaderboardEntry] = decodeGame2048State('LeaderboardEntry', entry.value || new Uint8Array());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const boardEntry = (leaderboardEntry as any) || {};
        const rewardAmount = index === entries.length - 1
            ? rewardPool.subtract(distributed)
            : calculateRenormalizedBpsAmount(
                rewardPool,
                usedPayoutBps[index] || 0,
                usedPayoutBpsTotal
            );
        distributed = distributed.add(rewardAmount);
        allocations.push({
            utcDate,
            playerAddress: normalizeBytes(boardEntry.playerAddress),
            gameId: normalizeBytes(boardEntry.gameId),
            rank: index + 1,
            rewardAmount: rewardAmount.toNumber(),
            score: toUint64(boardEntry.score as Long | number | undefined),
            maxTile: toUint64(boardEntry.maxTile as Long | number | undefined),
            moveCount: toUint64(boardEntry.moveCount as Long | number | undefined),
            endedAtUnix: toUint64(boardEntry.endedAtUnix as Long | number | undefined)
        });
    });

    const leftover = rewardPool.greaterThan(distributed) ? rewardPool.subtract(distributed) : Long.ZERO;
    return [{ allocations, distributed, leftover }, null];
}

function calculateRenormalizedBpsAmount(total: Long, rankBps: number, usedTotalBps: number): Long {
    if (rankBps <= 0 || usedTotalBps <= 0) {
        return Long.ZERO;
    }
    return total
        .multiply(Long.fromNumber(rankBps))
        .divide(Long.fromNumber(usedTotalBps));
}
