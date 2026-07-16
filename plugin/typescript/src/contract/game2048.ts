import * as crypto from 'crypto';
import * as path from 'path';
import { fileURLToPath } from 'url';

import Long from 'long';
import protobuf from 'protobufjs';

import type { IPluginError } from './error.js';
import { ErrFromAny, ErrInvalidMessageCast, ErrUnmarshal } from './error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const game2048ProtoPath = path.resolve(__dirname, '../../proto/game2048.proto');

const game2048Root = protobuf.loadSync(game2048ProtoPath);

export const GAME2048_TYPE_URLS = {
    startDailyGame: 'type.googleapis.com/types.MessageStartDailyGame',
    startClassicGame: 'type.googleapis.com/types.MessageStartClassicGame',
    submitGameResult: 'type.googleapis.com/types.MessageSubmitGameResult',
    claimDailyReward: 'type.googleapis.com/types.MessageClaimDailyReward',
    redeemClassicPoints: 'type.googleapis.com/types.MessageRedeemClassicPoints',
    claimDailyLoginReward: 'type.googleapis.com/types.MessageClaimDailyLoginReward',
    setUsername: 'type.googleapis.com/types.MessageSetUsername',
    poolTransfer: 'type.googleapis.com/types.MessagePoolTransfer',
    poolDeposit: 'type.googleapis.com/types.MessagePoolDeposit',
    poolWithdrawal: 'type.googleapis.com/types.MessagePoolWithdrawal',
    banPlayer: 'type.googleapis.com/types.MessageBanPlayer',
    unbanPlayer: 'type.googleapis.com/types.MessageUnbanPlayer'
} as const;

export type Game2048MessageType =
    | 'MessageStartDailyGame'
    | 'MessageStartClassicGame'
    | 'MessageSubmitGameResult'
    | 'MessageClaimDailyReward'
    | 'MessageRedeemClassicPoints'
    | 'MessageClaimDailyLoginReward'
    | 'MessageSetUsername'
    | 'MessagePoolTransfer'
    | 'MessagePoolDeposit'
    | 'MessagePoolWithdrawal'
    | 'MessageBanPlayer'
    | 'MessageUnbanPlayer';

type Game2048StateType =
    | 'GameConfig'
    | 'GameSession'
    | 'DailyAttempt'
    | 'DailySubmission'
    | 'DailyPrizePool'
    | 'GameTreasury'
    | 'LeaderboardEntry'
    | 'DailyRewardAllocation'
    | 'DailyRewardClaim'
    | 'ClassicPointsDailyLedger'
    | 'ClassicPointRedemption'
    | 'DailyLoginClaim'
    | 'PlayerStats'
    | 'UsernameRegistration'
    | 'PlayerIdentity'
    | 'PlayerBan';

function lookupType(typeName: Game2048MessageType | Game2048StateType): protobuf.Type {
    const type = game2048Root.lookupType(`types.${typeName}`);
    return type as protobuf.Type;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeGame2048Any(any: any): [any | null, Game2048MessageType | null, IPluginError | null] {
    if (!any || !any.value) {
        return [null, null, ErrFromAny(new Error('any is null or has no value'))];
    }

    const typeUrl = any.typeUrl || any.type_url || '';

    try {
        if (typeUrl.includes('MessageStartDailyGame')) {
            return [lookupType('MessageStartDailyGame').decode(any.value), 'MessageStartDailyGame', null];
        }
        if (typeUrl.includes('MessageStartClassicGame')) {
            return [lookupType('MessageStartClassicGame').decode(any.value), 'MessageStartClassicGame', null];
        }
        if (typeUrl.includes('MessageSubmitGameResult')) {
            return [lookupType('MessageSubmitGameResult').decode(any.value), 'MessageSubmitGameResult', null];
        }
        if (typeUrl.includes('MessageClaimDailyReward')) {
            return [lookupType('MessageClaimDailyReward').decode(any.value), 'MessageClaimDailyReward', null];
        }
        if (typeUrl.includes('MessageRedeemClassicPoints')) {
            return [lookupType('MessageRedeemClassicPoints').decode(any.value), 'MessageRedeemClassicPoints', null];
        }
        if (typeUrl.includes('MessageClaimDailyLoginReward')) {
            return [lookupType('MessageClaimDailyLoginReward').decode(any.value), 'MessageClaimDailyLoginReward', null];
        }
        if (typeUrl.includes('MessageSetUsername')) {
            return [lookupType('MessageSetUsername').decode(any.value), 'MessageSetUsername', null];
        }
        if (typeUrl.includes('MessagePoolTransfer')) {
            return [lookupType('MessagePoolTransfer').decode(any.value), 'MessagePoolTransfer', null];
        }
        if (typeUrl.includes('MessagePoolDeposit')) {
            return [lookupType('MessagePoolDeposit').decode(any.value), 'MessagePoolDeposit', null];
        }
        if (typeUrl.includes('MessagePoolWithdrawal')) {
            return [lookupType('MessagePoolWithdrawal').decode(any.value), 'MessagePoolWithdrawal', null];
        }
        if (typeUrl.includes('MessageBanPlayer')) {
            return [lookupType('MessageBanPlayer').decode(any.value), 'MessageBanPlayer', null];
        }
        if (typeUrl.includes('MessageUnbanPlayer')) {
            return [lookupType('MessageUnbanPlayer').decode(any.value), 'MessageUnbanPlayer', null];
        }
        return [null, null, ErrInvalidMessageCast()];
    } catch (err) {
        return [null, null, ErrFromAny(err as Error)];
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encodeGame2048State(typeName: Game2048StateType, value: any): Uint8Array {
    return lookupType(typeName).encode(lookupType(typeName).create(value)).finish();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeGame2048State(typeName: Game2048StateType, bytes: Uint8Array | Buffer): [any | null, IPluginError | null] {
    if (!bytes || bytes.length === 0) {
        return [null, null];
    }
    try {
        return [lookupType(typeName).decode(bytes), null];
    } catch (err) {
        return [null, ErrUnmarshal(err as Error)];
    }
}

export function sha256Bytes(...parts: (Buffer | Uint8Array | string | number | Long)[]): Uint8Array {
    const hash = crypto.createHash('sha256');
    for (const part of parts) {
        if (typeof part === 'string') {
            hash.update(part, 'utf8');
        } else if (typeof part === 'number') {
            hash.update(Buffer.from(String(part), 'utf8'));
        } else if (Long.isLong(part)) {
            hash.update(Buffer.from(part.toString(), 'utf8'));
        } else {
            hash.update(Buffer.from(part));
        }
        hash.update(Buffer.from([0]));
    }
    return hash.digest();
}

export function toUint64(value: Long | number | undefined | null): number {
    if (value === undefined || value === null) {
        return 0;
    }
    return Long.isLong(value) ? value.toNumber() : value;
}
