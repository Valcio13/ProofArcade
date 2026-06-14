/* This file contains contract level PluginErrors */

import { types } from '../proto/types.js';

const DefaultModule = 'plugin';

// PluginError interface matching the protobuf definition
export interface IPluginError {
    code: number;
    module: string;
    msg: string;
}

// NewError() creates a plugin error
export function NewError(code: number, module: string, message: string): IPluginError {
    return types.PluginError.create({ code, module, msg: message });
}

export function ErrPluginTimeout(): IPluginError {
    return NewError(1, DefaultModule, 'a plugin timeout occurred');
}

export function ErrMarshal(err: Error): IPluginError {
    return NewError(2, DefaultModule, `marshal() failed with err: ${err.message}`);
}

export function ErrUnmarshal(err: Error): IPluginError {
    return NewError(3, DefaultModule, `unmarshal() failed with err: ${err.message}`);
}

export function ErrFailedPluginRead(err: Error): IPluginError {
    return NewError(4, DefaultModule, `a plugin read failed with err: ${err.message}`);
}

export function ErrFailedPluginWrite(err: Error): IPluginError {
    return NewError(5, DefaultModule, `a plugin write failed with err: ${err.message}`);
}

export function ErrInvalidPluginRespId(): IPluginError {
    return NewError(6, DefaultModule, 'plugin response id is invalid');
}

export function ErrUnexpectedFSMToPlugin(t: string): IPluginError {
    return NewError(7, DefaultModule, `unexpected FSM to plugin: ${t}`);
}

export function ErrInvalidFSMToPluginMMessage(t: string): IPluginError {
    return NewError(8, DefaultModule, `invalid FSM to plugin: ${t}`);
}

export function ErrInsufficientFunds(): IPluginError {
    return NewError(9, DefaultModule, 'insufficient funds');
}

export function ErrFromAny(err: Error): IPluginError {
    return NewError(10, DefaultModule, `fromAny() failed with err: ${err.message}`);
}

export function ErrInvalidMessageCast(): IPluginError {
    return NewError(11, DefaultModule, 'the message cast failed');
}

export function ErrInvalidAddress(): IPluginError {
    return NewError(12, DefaultModule, 'address is invalid');
}

export function ErrInvalidAmount(): IPluginError {
    return NewError(13, DefaultModule, 'amount is invalid');
}

export function ErrTxFeeBelowStateLimit(): IPluginError {
    return NewError(14, DefaultModule, 'tx.fee is below state limit');
}

export function ErrAlreadyPlayedDaily(): IPluginError {
    return NewError(15, DefaultModule, 'player already used their daily attempt');
}

export function ErrSessionNotFound(): IPluginError {
    return NewError(16, DefaultModule, 'game session not found');
}

export function ErrSessionNotActive(): IPluginError {
    return NewError(17, DefaultModule, 'game session is not active');
}

export function ErrReplayNotImplemented(): IPluginError {
    return NewError(18, DefaultModule, '2048 deterministic replay is not implemented yet');
}

export function ErrMoveCapExceeded(): IPluginError {
    return NewError(19, DefaultModule, 'submitted move count exceeds the configured move cap');
}

export function ErrReplayMismatch(): IPluginError {
    return NewError(20, DefaultModule, 'submitted game result does not match deterministic replay');
}

export function ErrSessionOwnerMismatch(): IPluginError {
    return NewError(21, DefaultModule, 'game session does not belong to the submitting player');
}

export function ErrDailyRewardNotFound(): IPluginError {
    return NewError(22, DefaultModule, 'daily reward not found');
}

export function ErrDailyRewardAlreadyClaimed(): IPluginError {
    return NewError(23, DefaultModule, 'daily reward already claimed');
}

export function ErrPlatformTreasuryNotConfigured(): IPluginError {
    return NewError(24, DefaultModule, 'platform treasury address is not configured');
}

export function ErrDailyPrizePoolNotFound(): IPluginError {
    return NewError(25, DefaultModule, 'daily prize pool not found');
}

export function ErrDailyRewardDayNotClaimable(): IPluginError {
    return NewError(26, DefaultModule, 'daily reward day is not claimable yet');
}

export function ErrInsufficientClassicPoints(): IPluginError {
    return NewError(27, DefaultModule, 'not enough classic points');
}

export function ErrRedeemBelowMinimum(): IPluginError {
    return NewError(28, DefaultModule, 'redeem amount is below the shop minimum');
}

export function ErrRedeemInvalidStep(): IPluginError {
    return NewError(29, DefaultModule, 'redeem amount must match the shop step size');
}

export function ErrRedeemPayoutZero(): IPluginError {
    return NewError(30, DefaultModule, 'redeem payout would be zero');
}

export function ErrInvalidMoveDirection(): IPluginError {
    return NewError(31, DefaultModule, 'submitted move list contains an invalid move direction');
}

export function ErrDailyLoginAlreadyClaimed(): IPluginError {
    return NewError(32, DefaultModule, 'daily login reward already claimed for this UTC day');
}

export function ErrUsernameInvalid(): IPluginError {
    return NewError(33, DefaultModule, 'username is invalid (must be 3-20 characters, alphanumeric + underscore only)');
}

export function ErrUsernameTaken(): IPluginError {
    return NewError(34, DefaultModule, 'username is already taken');
}
