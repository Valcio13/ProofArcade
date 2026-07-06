/**
 * Economy v2 - Pool Operations
 * 
 * Provides reusable helpers for pool balance management.
 * Handles pool reads, updates, and balance transfers.
 */

import Long from 'long';
import type { Contract } from '../contract.js';
import { types } from '../../proto/types.js';
import { Unmarshal, JoinLenPrefix } from '../plugin.js';
import {
    EconomyError,
    EconomyErrorCodes,
    PoolUpdate,
    PoolIDs,
} from './types.js';

/**
 * Generates a random query ID for StateRead operations
 */
function randomQueryId(): Long {
    return Long.fromNumber(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
}

/**
 * Extracts value from StateRead response by queryId
 */
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

/**
 * Formats uint64 for key generation (8 bytes big-endian)
 */
function formatUint64(value: Long): Uint8Array {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(value.toString()));
    return buf;
}

/**
 * Pool prefix for state keys
 */
const poolPrefix = Buffer.from([5]);

/**
 * Generates state key for a pool by ID
 */
function keyForPool(poolId: number): Uint8Array {
    return JoinLenPrefix(poolPrefix, formatUint64(Long.fromNumber(poolId)));
}

/**
 * Reads a pool balance from state
 * @param contract Plugin contract instance
 * @param poolId Pool identifier
 * @returns Pool object with balance, or null if not found
 */
export async function readPoolBalance(
    contract: Contract,
    poolId: number
): Promise<{ id: number; amount: Long } | null> {
    const queryId = randomQueryId();
    const poolKey = keyForPool(poolId);
    
    const [response, readErr] = await contract.plugin.StateRead(contract, {
        keys: [{ queryId, key: poolKey }]
    });
    
    if (readErr) {
        throw new EconomyError(
            `Failed to read pool ${poolId}: ${readErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (response?.error) {
        throw new EconomyError(
            `Failed to read pool ${poolId}: ${response.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    const poolBytes = getQueryValue(response, queryId);
    if (!poolBytes || poolBytes.length === 0) {
        // Pool doesn't exist yet - return null
        return null;
    }
    
    const [poolRaw, unmarshalErr] = Unmarshal(poolBytes, types.Pool);
    if (unmarshalErr) {
        throw new EconomyError(
            `Failed to unmarshal pool ${poolId}: ${unmarshalErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool = poolRaw as any;
    const amount = Long.isLong(pool?.amount)
        ? pool.amount
        : Long.fromNumber((pool?.amount as number) || 0);
    
    return {
        id: poolId,
        amount
    };
}

/**
 * Updates a pool balance by adding or subtracting an amount
 * @param contract Plugin contract instance
 * @param poolId Pool identifier
 * @param amount Amount to add (positive) or subtract (negative)
 * @returns Updated pool object
 */
export async function updatePoolBalance(
    contract: Contract,
    poolId: number,
    amount: Long
): Promise<{ id: number; amount: Long }> {
    if (amount.isZero()) {
        throw new EconomyError(
            'Cannot update pool with zero amount',
            EconomyErrorCodes.INVALID_AMOUNT
        );
    }
    
    // Read current pool balance
    const currentPool = await readPoolBalance(contract, poolId);
    const currentAmount = currentPool?.amount || Long.fromNumber(0);
    
    // Calculate new amount
    const newAmount = currentAmount.add(amount);
    
    if (newAmount.isNegative()) {
        throw new EconomyError(
            `Insufficient pool balance: ${currentAmount} + ${amount} = ${newAmount}`,
            EconomyErrorCodes.INSUFFICIENT_BALANCE
        );
    }
    
    // Create updated pool
    const updatedPool = types.Pool.create({
        id: Long.fromNumber(poolId),
        amount: newAmount
    });
    
    // Write to state
    const poolKey = keyForPool(poolId);
    const poolValue = types.Pool.encode(updatedPool).finish();
    
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
        sets: [{ key: poolKey, value: poolValue }]
    });
    
    if (writeErr) {
        throw new EconomyError(
            `Failed to write pool ${poolId}: ${writeErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (writeResp?.error) {
        throw new EconomyError(
            `Failed to write pool ${poolId}: ${writeResp.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    return {
        id: poolId,
        amount: newAmount
    };
}

/**
 * Transfers amount from one pool to another
 * @param contract Plugin contract instance
 * @param fromPoolId Source pool
 * @param toPoolId Destination pool
 * @param amount Amount to transfer
 */
export async function transferBetweenPools(
    contract: Contract,
    fromPoolId: number,
    toPoolId: number,
    amount: Long
): Promise<void> {
    if (amount.isNegative() || amount.isZero()) {
        throw new EconomyError(
            'Transfer amount must be positive',
            EconomyErrorCodes.INVALID_AMOUNT
        );
    }
    
    // Read both pools
    const fromPool = await readPoolBalance(contract, fromPoolId);
    const toPool = await readPoolBalance(contract, toPoolId);
    
    const fromAmount = fromPool?.amount || Long.fromNumber(0);
    const toAmount = toPool?.amount || Long.fromNumber(0);
    
    if (fromAmount.lessThan(amount)) {
        throw new EconomyError(
            `Insufficient balance in pool ${fromPoolId}: has ${fromAmount}, needs ${amount}`,
            EconomyErrorCodes.INSUFFICIENT_BALANCE
        );
    }
    
    // Calculate new amounts
    const newFromAmount = fromAmount.subtract(amount);
    const newToAmount = toAmount.add(amount);
    
    // Create updated pools
    const updatedFromPool = types.Pool.create({
        id: Long.fromNumber(fromPoolId),
        amount: newFromAmount
    });
    
    const updatedToPool = types.Pool.create({
        id: Long.fromNumber(toPoolId),
        amount: newToAmount
    });
    
    // Write both pools atomically
    const fromKey = keyForPool(fromPoolId);
    const toKey = keyForPool(toPoolId);
    
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
        sets: [
            { key: fromKey, value: types.Pool.encode(updatedFromPool).finish() },
            { key: toKey, value: types.Pool.encode(updatedToPool).finish() }
        ]
    });
    
    if (writeErr) {
        throw new EconomyError(
            `Failed to transfer between pools: ${writeErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (writeResp?.error) {
        throw new EconomyError(
            `Failed to transfer between pools: ${writeResp.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
}

/**
 * Transfers amount from a pool to a player account
 * @param contract Plugin contract instance
 * @param poolId Source pool
 * @param playerAddress Destination player address
 * @param amount Amount to transfer
 */
export async function transferFromPoolToPlayer(
    contract: Contract,
    poolId: number,
    playerAddress: Uint8Array,
    amount: Long
): Promise<void> {
    if (amount.isNegative() || amount.isZero()) {
        throw new EconomyError(
            'Transfer amount must be positive',
            EconomyErrorCodes.INVALID_AMOUNT
        );
    }
    
    // Generate keys
    const poolKey = keyForPool(poolId);
    const playerKey = keyForAccount(playerAddress);
    
    // Read pool and player
    const poolQueryId = randomQueryId();
    const playerQueryId = randomQueryId();
    
    const [response, readErr] = await contract.plugin.StateRead(contract, {
        keys: [
            { queryId: poolQueryId, key: poolKey },
            { queryId: playerQueryId, key: playerKey }
        ]
    });
    
    if (readErr) {
        throw new EconomyError(
            `Failed to read pool/player: ${readErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (response?.error) {
        throw new EconomyError(
            `Failed to read pool/player: ${response.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    const poolBytes = getQueryValue(response, poolQueryId);
    const playerBytes = getQueryValue(response, playerQueryId);
    
    // Unmarshal pool
    const [poolRaw, poolErr] = Unmarshal(poolBytes || new Uint8Array(), types.Pool);
    if (poolErr) {
        throw new EconomyError(
            `Failed to unmarshal pool: ${poolErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    // Unmarshal player
    const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
    if (playerErr) {
        throw new EconomyError(
            `Failed to unmarshal player: ${playerErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool = poolRaw as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const player = playerRaw as any;
    
    const poolAmount = Long.isLong(pool?.amount)
        ? pool.amount
        : Long.fromNumber((pool?.amount as number) || 0);
    
    const playerAmount = Long.isLong(player?.amount)
        ? player.amount
        : Long.fromNumber((player?.amount as number) || 0);
    
    if (poolAmount.lessThan(amount)) {
        throw new EconomyError(
            `Insufficient pool balance: has ${poolAmount}, needs ${amount}`,
            EconomyErrorCodes.INSUFFICIENT_BALANCE
        );
    }
    
    // Calculate new amounts
    const newPoolAmount = poolAmount.subtract(amount);
    const newPlayerAmount = playerAmount.add(amount);
    
    // Create updated pool and player
    const updatedPool = types.Pool.create({
        id: Long.fromNumber(poolId),
        amount: newPoolAmount
    });
    
    const updatedPlayer = types.Account.create({
        address: player?.address,
        amount: newPlayerAmount
    });
    
    // Write atomically
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
        sets: [
            { key: poolKey, value: types.Pool.encode(updatedPool).finish() },
            { key: playerKey, value: types.Account.encode(updatedPlayer).finish() }
        ]
    });
    
    if (writeErr) {
        throw new EconomyError(
            `Failed to transfer from pool to player: ${writeErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (writeResp?.error) {
        throw new EconomyError(
            `Failed to transfer from pool to player: ${writeResp.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
}

/**
 * Applies multiple pool updates atomically
 * @param contract Plugin contract instance
 * @param updates Array of pool update operations
 */
export async function applyPoolUpdates(
    contract: Contract,
    updates: PoolUpdate[]
): Promise<void> {
    if (updates.length === 0) {
        return;
    }
    
    // Read all affected pools
    const poolIds = [...new Set(updates.map(u => u.poolId))];
    const queryIds = new Map<number, Long>();
    const keys: { queryId: Long; key: Uint8Array }[] = [];
    
    for (const poolId of poolIds) {
        const queryId = randomQueryId();
        queryIds.set(poolId, queryId);
        keys.push({ queryId, key: keyForPool(poolId) });
    }
    
    const [response, readErr] = await contract.plugin.StateRead(contract, { keys });
    
    if (readErr) {
        throw new EconomyError(
            `Failed to read pools: ${readErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (response?.error) {
        throw new EconomyError(
            `Failed to read pools: ${response.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    // Build current balances map
    const balances = new Map<number, Long>();
    for (const poolId of poolIds) {
        const queryId = queryIds.get(poolId)!;
        const poolBytes = getQueryValue(response, queryId);
        
        if (poolBytes && poolBytes.length > 0) {
            const [poolRaw, unmarshalErr] = Unmarshal(poolBytes, types.Pool);
            if (unmarshalErr) {
                throw new EconomyError(
                    `Failed to unmarshal pool ${poolId}: ${unmarshalErr.msg}`,
                    EconomyErrorCodes.POOL_NOT_FOUND
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pool = poolRaw as any;
            const amount = Long.isLong(pool?.amount)
                ? pool.amount
                : Long.fromNumber((pool?.amount as number) || 0);
            balances.set(poolId, amount);
        } else {
            balances.set(poolId, Long.fromNumber(0));
        }
    }
    
    // Apply all updates
    for (const update of updates) {
        const current = balances.get(update.poolId)!;
        const delta = update.operation === 'add' ? update.amount : update.amount.negate();
        const newAmount = current.add(delta);
        
        if (newAmount.isNegative()) {
            throw new EconomyError(
                `Insufficient balance in pool ${update.poolId}: ${current} + ${delta} = ${newAmount}`,
                EconomyErrorCodes.INSUFFICIENT_BALANCE
            );
        }
        
        balances.set(update.poolId, newAmount);
    }
    
    // Write all updated pools
    const sets: { key: Uint8Array; value: Uint8Array }[] = [];
    for (const [poolId, amount] of balances) {
        const updatedPool = types.Pool.create({
            id: Long.fromNumber(poolId),
            amount
        });
        sets.push({
            key: keyForPool(poolId),
            value: types.Pool.encode(updatedPool).finish()
        });
    }
    
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, { sets });
    
    if (writeErr) {
        throw new EconomyError(
            `Failed to apply pool updates: ${writeErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (writeResp?.error) {
        throw new EconomyError(
            `Failed to apply pool updates: ${writeResp.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
}

/**
 * Helper: Generates state key for a player account
 */
function keyForAccount(address: Uint8Array): Uint8Array {
    const accountPrefix = Buffer.from([2]);
    return JoinLenPrefix(accountPrefix, address);
}

/**
 * Withdraws from a pool to a player with automatic fallback to another pool
 * 
 * This is useful for reward claiming and shop redemption where there's a primary
 * pool (e.g., Daily, Shop) and a fallback pool (e.g., DAO) if primary is insufficient.
 * 
 * @param contract Contract instance
 * @param primaryPoolId Primary pool to withdraw from
 * @param fallbackPoolId Fallback pool if primary has insufficient funds
 * @param playerAddress Player receiving the withdrawal
 * @param amount Amount to withdraw
 * @returns Which pool was actually used
 * @throws EconomyError if both pools have insufficient funds
 * 
 * @example
 * ```typescript
 * // Reward claiming: Try Daily pool first, fall back to DAO
 * const { poolUsed } = await withdrawToPlayerWithFallback(
 *     contract,
 *     PoolIDs.DAILY,
 *     PoolIDs.DAO,
 *     playerAddress,
 *     rewardAmount
 * );
 * console.log(`Paid from pool ${poolUsed}`);
 * ```
 * 
 * @example
 * ```typescript
 * // Shop redemption: Try Shop pool first, fall back to DAO
 * const { poolUsed } = await withdrawToPlayerWithFallback(
 *     contract,
 *     PoolIDs.SHOP,
 *     PoolIDs.DAO,
 *     playerAddress,
 *     payoutAmount
 * );
 * ```
 */
export async function withdrawToPlayerWithFallback(
    contract: Contract,
    primaryPoolId: number,
    fallbackPoolId: number,
    playerAddress: Uint8Array,
    amount: Long
): Promise<{ poolUsed: number }> {
    if (amount.isNegative() || amount.isZero()) {
        throw new EconomyError(
            'Withdrawal amount must be positive',
            EconomyErrorCodes.INVALID_AMOUNT
        );
    }
    
    // Read both pools and player account in one batch
    const primaryKey = keyForPool(primaryPoolId);
    const fallbackKey = keyForPool(fallbackPoolId);
    const playerKey = keyForAccount(playerAddress);
    
    const primaryQueryId = randomQueryId();
    const fallbackQueryId = randomQueryId();
    const playerQueryId = randomQueryId();
    
    const [response, readErr] = await contract.plugin.StateRead(contract, {
        keys: [
            { queryId: primaryQueryId, key: primaryKey },
            { queryId: fallbackQueryId, key: fallbackKey },
            { queryId: playerQueryId, key: playerKey }
        ]
    });
    
    if (readErr) {
        throw new EconomyError(
            `Failed to read pools/player: ${readErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (response?.error) {
        throw new EconomyError(
            `Failed to read pools/player: ${response.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    const primaryBytes = getQueryValue(response, primaryQueryId);
    const fallbackBytes = getQueryValue(response, fallbackQueryId);
    const playerBytes = getQueryValue(response, playerQueryId);
    
    // Unmarshal pools
    const [primaryPoolRaw, primaryErr] = Unmarshal(primaryBytes || new Uint8Array(), types.Pool);
    if (primaryErr) {
        throw new EconomyError(
            `Failed to unmarshal primary pool: ${primaryErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    const [fallbackPoolRaw, fallbackErr] = Unmarshal(fallbackBytes || new Uint8Array(), types.Pool);
    if (fallbackErr) {
        throw new EconomyError(
            `Failed to unmarshal fallback pool: ${fallbackErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    const [playerRaw, playerErr] = Unmarshal(playerBytes || new Uint8Array(), types.Account);
    if (playerErr) {
        throw new EconomyError(
            `Failed to unmarshal player: ${playerErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryPool = primaryPoolRaw as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallbackPool = fallbackPoolRaw as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const player = playerRaw as any;
    
    const primaryAmount = Long.isLong(primaryPool?.amount)
        ? primaryPool.amount
        : Long.fromNumber((primaryPool?.amount as number) || 0);
    
    const fallbackAmount = Long.isLong(fallbackPool?.amount)
        ? fallbackPool.amount
        : Long.fromNumber((fallbackPool?.amount as number) || 0);
    
    const playerAmount = Long.isLong(player?.amount)
        ? player.amount
        : Long.fromNumber((player?.amount as number) || 0);
    
    // Determine which pool to use
    const usePrimary = !primaryAmount.lessThan(amount);
    
    if (!usePrimary && fallbackAmount.lessThan(amount)) {
        throw new EconomyError(
            `Insufficient funds: primary pool ${primaryPoolId} has ${primaryAmount}, fallback pool ${fallbackPoolId} has ${fallbackAmount}, need ${amount}`,
            EconomyErrorCodes.INSUFFICIENT_BALANCE
        );
    }
    
    const poolToUse = usePrimary ? primaryPoolId : fallbackPoolId;
    const poolAmount = usePrimary ? primaryAmount : fallbackAmount;
    
    // Calculate new amounts
    const newPoolAmount = poolAmount.subtract(amount);
    const newPlayerAmount = playerAmount.add(amount);
    
    // Create updated pool and player
    const updatedPool = types.Pool.create({
        id: Long.fromNumber(poolToUse),
        amount: newPoolAmount
    });
    
    const updatedPlayer = types.Account.create({
        address: player?.address,
        amount: newPlayerAmount
    });
    
    // Write atomically
    const poolKeyToWrite = usePrimary ? primaryKey : fallbackKey;
    const [writeResp, writeErr] = await contract.plugin.StateWrite(contract, {
        sets: [
            { key: poolKeyToWrite, value: types.Pool.encode(updatedPool).finish() },
            { key: playerKey, value: types.Account.encode(updatedPlayer).finish() }
        ]
    });
    
    if (writeErr) {
        throw new EconomyError(
            `Failed to withdraw from pool to player: ${writeErr.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    if (writeResp?.error) {
        throw new EconomyError(
            `Failed to withdraw from pool to player: ${writeResp.error.msg}`,
            EconomyErrorCodes.POOL_NOT_FOUND
        );
    }
    
    return { poolUsed: poolToUse };
}

/**
 * Convenience function: Collect and distribute an entry fee across pools
 * This is the primary Economy v2 API for fee processing
 * 
 * @param contract Contract instance
 * @param feeSplit Pre-computed fee split result
 * @returns Pool update results
 */
export async function collectAndDistributeFee(
    contract: Contract,
    feeSplit: { platform: Long; reward?: Long; reserve: Long; shop: Long; monthly?: Long }
): Promise<void> {
    const updates: PoolUpdate[] = [
        { poolId: PoolIDs.PLATFORM, amount: feeSplit.platform, operation: 'add' },
        { poolId: PoolIDs.RESERVE, amount: feeSplit.reserve, operation: 'add' },
        { poolId: PoolIDs.SHOP, amount: feeSplit.shop, operation: 'add' },
    ];
    
    if (feeSplit.reward && !feeSplit.reward.isZero()) {
        updates.push({ poolId: PoolIDs.DAILY_REWARD, amount: feeSplit.reward, operation: 'add' });
    }
    
    if (feeSplit.monthly && !feeSplit.monthly.isZero()) {
        updates.push({ poolId: PoolIDs.MONTHLY_REWARD, amount: feeSplit.monthly, operation: 'add' });
    }
    
    await applyPoolUpdates(contract, updates);
}
