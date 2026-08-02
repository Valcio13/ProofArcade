import test from 'node:test';
import assert from 'node:assert/strict';

import { createHash } from 'node:crypto';

import { ContractConfig } from './contract.js';
import { GAME2048_TYPE_URLS } from './game2048.js';
import { deriveWeeklyBlitzSeed } from './utils/crypto.js';

/**
 * Guard tests for message-type registration.
 *
 * Every game2048 message type the plugin can decode/route MUST also be declared in
 * ContractConfig. If it isn't, the node rejects the transaction at the mempool BEFORE
 * any Check/Deliver handler runs — surfacing as a 400 at submit with "no tx on chain".
 * This is exactly the Weekly Blitz bug. See docs/ADDING_A_FEATURE.md.
 *
 * GAME2048_TYPE_URLS is the canonical list of routable message types; its keys are the
 * short names used in supportedTransactions and its values are the type URLs.
 */

test('every message type is registered in ContractConfig.supportedTransactions', () => {
    const supported: string[] = ContractConfig.supportedTransactions;
    for (const shortName of Object.keys(GAME2048_TYPE_URLS)) {
        assert.ok(
            supported.includes(shortName),
            `Message "${shortName}" is decoded/routed but missing from ContractConfig.supportedTransactions — ` +
            `the node will drop it at the mempool. Add it to ContractConfig in contract.ts.`
        );
    }
});

test('every message type URL is registered in ContractConfig.transactionTypeUrls', () => {
    const urls: string[] = ContractConfig.transactionTypeUrls;
    for (const [shortName, typeUrl] of Object.entries(GAME2048_TYPE_URLS)) {
        assert.ok(
            urls.includes(typeUrl),
            `Message "${shortName}" (${typeUrl}) is decoded/routed but missing from ` +
            `ContractConfig.transactionTypeUrls. Add it to ContractConfig in contract.ts.`
        );
    }
});

test('the base "send" transfer message stays registered', () => {
    assert.ok(
        ContractConfig.supportedTransactions.includes('send'),
        'base "send" message missing from supportedTransactions'
    );
    assert.ok(
        ContractConfig.transactionTypeUrls.includes('type.googleapis.com/types.MessageSend'),
        'base "send" message URL missing from transactionTypeUrls'
    );
});

test('Weekly Blitz message types are registered (regression for the mempool-drop bug)', () => {
    assert.ok(ContractConfig.supportedTransactions.includes('startWeeklyBlitzGame'));
    assert.ok(ContractConfig.supportedTransactions.includes('claimWeeklyBlitzReward'));
    assert.ok(ContractConfig.transactionTypeUrls.includes(GAME2048_TYPE_URLS.startWeeklyBlitzGame));
    assert.ok(ContractConfig.transactionTypeUrls.includes(GAME2048_TYPE_URLS.claimWeeklyBlitzReward));
});

/**
 * The Go backend derives the Weekly Blitz seed as:
 *   sha256("weekly-blitz-seed" \0 chainId \0 weekId \0)
 * (each part NUL-terminated, matching sha256Bytes in both languages).
 *
 * The backend hands that seed to the frontend to draw the board; the contract stores
 * its own derivation in the session and replays submitted moves against it. If the two
 * ever diverge, every Weekly Blitz submission fails with ErrReplayMismatch — which is
 * exactly the bug this pins down.
 */
function goStyleWeeklyBlitzSeed(chainId: number, weekId: number): Buffer {
    const hash = createHash('sha256');
    for (const part of ['weekly-blitz-seed', String(chainId), String(weekId)]) {
        hash.update(Buffer.from(part, 'utf8'));
        hash.update(Buffer.from([0]));
    }
    return hash.digest();
}

test('Weekly Blitz seed matches the Go backend derivation (regression for replay mismatch)', () => {
    for (const [chainId, weekId] of [[1, 2700], [1, 2701], [7, 12345]] as Array<[number, number]>) {
        assert.deepEqual(
            Buffer.from(deriveWeeklyBlitzSeed(chainId, weekId)),
            goStyleWeeklyBlitzSeed(chainId, weekId),
            `Weekly Blitz seed diverged from the backend for chainId=${chainId}, weekId=${weekId}. ` +
            `The frontend board and the on-chain replay would disagree, failing every submission.`
        );
    }
});
