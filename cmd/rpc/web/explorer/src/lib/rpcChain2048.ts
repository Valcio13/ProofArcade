import { adminRPCURL, rpcURL } from './api'
import type {
  ClaimDailyRewardArgs,
  ClaimDailyLoginRewardArgs,
  ClaimDailyLoginRewardResult,
  ClaimDailyRewardResult,
  FaucetResult,
  Game2048Client,
  RedeemClassicPointsArgs,
  RedeemClassicPointsResult,
  SubmitSessionArgs,
  SubmitSessionResult,
} from './chain2048'
import type { GameMode, MoveDirection, StopReason } from './game2048'
import type {
  ChainConfig,
  ClaimableRewardsSummary,
  DailyPrizePool,
  LeaderboardEntry,
  PlayerStats,
  RecentRun,
  RedeemPreview,
  RedemptionHistory,
  SessionStart,
} from './mockChain2048'

const queryConfigPath = '/v1/query/2048/config'
const queryPlayerPath = '/v1/query/2048/player'
const queryLeaderboardsPath = '/v1/query/2048/leaderboards'
const queryDailyPoolPath = '/v1/query/2048/daily-pool'
const queryClaimableRewardsPath = '/v1/query/2048/claimable-rewards'
const queryShopConfigPath = '/v1/query/2048/shop-config'
const queryRedeemPreviewPath = '/v1/query/2048/redeem-preview'
const queryRedemptionsPath = '/v1/query/2048/redemptions'
const queryGameHistoryPath = '/v1/query/2048/game-history'
const txStartDailyPath = '/v1/admin/tx-2048-start-daily'
const txStartClassicPath = '/v1/admin/tx-2048-start-classic'
const txSubmitPath = '/v1/admin/tx-2048-submit'
const txClaimDailyRewardPath = '/v1/admin/tx-2048-claim-daily-reward'
const txClaimDailyLoginRewardPath = '/v1/admin/tx-2048-claim-daily-login'
const txRedeemClassicPointsPath = '/v1/admin/tx-2048-redeem-classic-points'
const devFaucetPath = '/v1/admin/dev-faucet'
const keystorePath = '/v1/admin/keystore'
const txByHashPath = '/v1/query/tx-by-hash'
const pendingPath = '/v1/query/pending'

export type RpcTxStage = 'submitted' | 'pending' | 'indexed'

export interface RpcTxTracking {
  stage: RpcTxStage
  detail: string
}

export interface RpcKeystoreAccount {
  address: string
  nickname: string
}

export interface RpcCreateKeystoreAccountArgs {
  nickname: string
  password: string
}

export interface RpcCreateKeystoreAccountResult extends RpcKeystoreAccount {
  created: boolean
}

export interface RpcEncryptedKeystoreEntry {
  publicKey: string
  salt: string
  encrypted: string
  keyAddress: string
  keyNickname?: string
}

export interface RpcWalletBackup {
  format: 'canopy-wallet-backup-v1'
  exportedAt: string
  address: string
  nickname: string
  keystore: {
    addressMap: Record<string, RpcEncryptedKeystoreEntry>
    nicknameMap: Record<string, string>
  }
}

export interface RpcImportKeystoreWalletArgs {
  backup: RpcWalletBackup
  nickname?: string
}

export interface RpcImportKeystoreWalletResult extends RpcKeystoreAccount {
  imported: boolean
}

export interface RpcRenameKeystoreWalletResult extends RpcKeystoreAccount {
  renamed: boolean
}

interface RpcFaucetResponse {
  txHash: string
  amount: number
  recipient: string
  submitted: boolean
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${rpcURL}${path}`)
  if (!response.ok) {
    throw await toRpcError(response)
  }
  return response.json() as Promise<T>
}

async function postJson<T>(baseURL: string, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw await toRpcError(response)
  }
  return response.json() as Promise<T>
}

async function toRpcError(response: Response): Promise<Error> {
  let detail = `RPC request failed with status ${response.status}.`
  try {
    const payload = await response.json() as { error?: string }
    if (payload?.error) {
      detail = payload.error
    }
  } catch {
    // keep fallback message
  }
  return new Error(detail)
}

function pendingResultsContainHash(payload: unknown, txHash: string): boolean {
  if (!payload || typeof payload !== 'object') {
    return false
  }
  const results = (payload as { results?: Array<{ txHash?: string; tx_hash?: string }> }).results
  if (!Array.isArray(results)) {
    return false
  }
  return results.some((entry) => entry?.txHash === txHash || entry?.tx_hash === txHash)
}

export async function trackRpcTx(txHash: string, timeoutMs = 12000): Promise<RpcTxTracking> {
  const startedAt = Date.now()
  let seenPending = false
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await postJson(rpcURL, txByHashPath, { hash: txHash })
      return {
        stage: 'indexed',
        detail: 'Indexed and queryable in the explorer.',
      }
    } catch {
      try {
        const pendingPage = await postJson<{ results?: Array<{ txHash?: string; tx_hash?: string }> }>(rpcURL, pendingPath, {
          pageNumber: 1,
          perPage: 200,
        })
        if (pendingResultsContainHash(pendingPage, txHash)) {
          seenPending = true
        }
      } catch {
        // fall back to submitted if pending lookup is unavailable
      }
      await new Promise((resolve) => window.setTimeout(resolve, 750))
    }
  }
  if (seenPending) {
    return {
      stage: 'pending',
      detail: 'Accepted by the node but still waiting to be committed and indexed.',
    }
  }
  return {
    stage: 'submitted',
    detail: 'Hash returned by RPC, but not yet visible in pending or indexed queries.',
  }
}

export async function fetchRpcKeystoreAccounts(): Promise<RpcKeystoreAccount[]> {
  const payload = await fetch(`${adminRPCURL}${keystorePath}`)
  if (!payload.ok) {
    throw await toRpcError(payload)
  }
  const json = await payload.json() as {
    addressMap?: Record<string, { keyNickname?: string; key_nickname?: string }>
  }
  const addressMap = json.addressMap ?? {}
  return Object.entries(addressMap).map(([address, entry]) => ({
    address,
    nickname: entry.keyNickname ?? entry.key_nickname ?? address,
  }))
}

export async function createRpcKeystoreAccount(args: RpcCreateKeystoreAccountArgs): Promise<RpcCreateKeystoreAccountResult> {
  const nickname = args.nickname.trim()
  const password = args.password

  if (!nickname) {
    throw new Error('Nickname is required.')
  }
  if (!password) {
    throw new Error('Password is required.')
  }

  const createdAddress = await postJson<string>(adminRPCURL, '/v1/admin/keystore-new-key', {
    nickname,
    password,
  })

  return {
    address: typeof createdAddress === 'string' ? createdAddress : '',
    nickname,
    created: true,
  }
}

export async function exportRpcKeystoreWallet(address: string): Promise<RpcWalletBackup> {
  const normalized = assertHexAddress(address)
  const payload = await fetch(`${adminRPCURL}${keystorePath}`)
  if (!payload.ok) {
    throw await toRpcError(payload)
  }
  const json = await payload.json() as {
    addressMap?: Record<string, RpcEncryptedKeystoreEntry>
    nicknameMap?: Record<string, string>
  }
  const addressMap = json.addressMap ?? {}
  const nicknameMap = json.nicknameMap ?? {}
  const entry = addressMap[normalized]
  if (!entry) {
    throw new Error('Selected wallet was not found in the node keystore.')
  }
  const nickname = entry.keyNickname || Object.entries(nicknameMap).find(([, value]) => value === normalized)?.[0] || normalized
  const filteredNicknameMap = nickname ? { [nickname]: normalized } : {}
  return {
    format: 'canopy-wallet-backup-v1',
    exportedAt: new Date().toISOString(),
    address: normalized,
    nickname,
    keystore: {
      addressMap: {
        [normalized]: entry,
      },
      nicknameMap: filteredNicknameMap,
    },
  }
}

export async function importRpcKeystoreWallet(args: RpcImportKeystoreWalletArgs): Promise<RpcImportKeystoreWalletResult> {
  const backup = args.backup
  if (backup?.format !== 'canopy-wallet-backup-v1') {
    throw new Error('This backup file is not a supported wallet export.')
  }

  const normalized = assertHexAddress(backup.address)
  const entry = backup.keystore?.addressMap?.[normalized]
  if (!entry?.publicKey || !entry?.salt || !entry?.encrypted || !entry?.keyAddress) {
    throw new Error('The wallet backup is missing encrypted keystore data.')
  }

  const nickname = (args.nickname?.trim() || backup.nickname || entry.keyNickname || normalized).trim()

  await postJson<string>(adminRPCURL, '/v1/admin/keystore-import', {
    address: normalized,
    nickname,
    publicKey: entry.publicKey,
    salt: entry.salt,
    encrypted: entry.encrypted,
    keyAddress: entry.keyAddress,
    keyNickname: entry.keyNickname,
  })

  return {
    address: normalized,
    nickname,
    imported: true,
  }
}

export async function renameRpcKeystoreWallet(address: string, nickname: string): Promise<RpcRenameKeystoreWalletResult> {
  const nextNickname = nickname.trim()
  if (!nextNickname) {
    throw new Error('Username is required.')
  }

  const backup = await exportRpcKeystoreWallet(address)
  const imported = await importRpcKeystoreWallet({
    backup,
    nickname: nextNickname,
  })

  return {
    address: imported.address,
    nickname: imported.nickname,
    renamed: true,
  }
}

export async function deleteRpcKeystoreWallet(address: string, password: string): Promise<{ deleted: boolean }> {
  const normalized = assertHexAddress(address)
  
  if (!password) {
    throw new Error('Password is required to delete a wallet.')
  }

  await postJson<string>(adminRPCURL, '/v1/admin/keystore-delete', {
    address: normalized,
    password,
  })

  return { deleted: true }
}

function toChainMove(direction: MoveDirection): number {
  switch (direction) {
    case 'up':
      return 1
    case 'right':
      return 2
    case 'down':
      return 3
    case 'left':
      return 4
    default:
      return 0
  }
}

function toChainStopReason(reason: StopReason): number {
  switch (reason) {
    case 'player_stopped':
      return 1
    case 'no_moves':
      return 2
    case 'max_moves':
      return 3
    default:
      return 0
  }
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

function assertHexAddress(address: string): string {
  const normalized = normalizeAddress(address)
  if (!/^[0-9a-f]{40}$/.test(normalized)) {
    throw new Error('Live mode expects a 40-character hex address and wallet password.')
  }
  return normalized
}

export function createRpcGame2048Client(): {
  isAvailable: () => Promise<boolean>
  client: Game2048Client
} {
  const client: Game2048Client = {
    status: {
      mode: 'rpc',
      label: 'Live RPC backend',
      detail: 'The page is connected to node-exposed 2048 queries and transactions.',
    },
    async getConfig() {
      const [baseConfig, shopConfig] = await Promise.all([
        getJson<ChainConfig>(queryConfigPath),
        getJson<Pick<ChainConfig, 'shopRedemptionRatePoints' | 'shopRedemptionRateCnpy' | 'shopMinRedeemPoints' | 'shopRedeemStepPoints'>>(queryShopConfigPath),
      ])
      return { ...baseConfig, ...shopConfig }
    },
    async getPlayer(address: string) {
      const normalized = normalizeAddress(address)
      if (!/^[0-9a-f]{40}$/.test(normalized)) {
        return {
          address: normalized,
          balance: 0,
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
          classicPointsEarned: 0,
          classicPointsEarnedToday: 0,
          loginStreak: 0,
          lastLoginClaimUtcDate: '',
          classicPointsBonusUtcDate: '',
        }
      }
      const result = await postJson<PlayerStats>(rpcURL, queryPlayerPath, { address: normalized })
      // Ensure classicPointsEarnedToday exists for backwards compatibility
      if (result.classicPointsEarnedToday === undefined) {
        result.classicPointsEarnedToday = 0
      }
      return result
    },
    async getLeaderboards() {
      return getJson<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>(queryLeaderboardsPath)
    },
    async getDailyPrizePool(utcDate?: string) {
      const suffix = utcDate ? `?utcDate=${encodeURIComponent(utcDate)}` : ''
      return getJson<DailyPrizePool>(`${queryDailyPoolPath}${suffix}`)
    },
    async getClaimableRewards(address: string) {
      const liveAddress = assertHexAddress(address)
      return postJson<ClaimableRewardsSummary>(rpcURL, queryClaimableRewardsPath, { address: liveAddress })
    },
    async getRedeemPreview(address: string, burnPoints: number) {
      const liveAddress = assertHexAddress(address)
      return postJson<RedeemPreview>(rpcURL, queryRedeemPreviewPath, { address: liveAddress, burnPoints })
    },
    async getRedemptions(address: string) {
      const liveAddress = assertHexAddress(address)
      return postJson<RedemptionHistory>(rpcURL, queryRedemptionsPath, { address: liveAddress })
    },
    async getRecentRuns(address?: string) {
      if (!address) {
        // Without address, return empty array
        return []
      }
      const liveAddress = assertHexAddress(address)
      const response = await postJson<{ address: string; games: RecentRun[] }>(rpcURL, queryGameHistoryPath, { address: liveAddress })
      return response.games || []
    },
    async addFunds(address: string, amount = 500): Promise<FaucetResult> {
      const liveAddress = assertHexAddress(address)
      const faucet = await postJson<RpcFaucetResponse>(adminRPCURL, devFaucetPath, {
        address: liveAddress,
        amount,
      })
      const tracking = await trackRpcTx(faucet.txHash)
      return {
        player: await client.getPlayer(liveAddress),
        txHash: faucet.txHash,
        txStage: tracking.stage,
        txDetail: tracking.detail,
      }
    },
    async startSession(address: string, mode: GameMode, password?: string) {
      const liveAddress = assertHexAddress(address)
      if (!password) {
        throw new Error('Live mode needs the wallet password to sign the game transaction.')
      }
      const path = mode === 'daily' ? txStartDailyPath : txStartClassicPath
      const session = await postJson<SessionStart>(adminRPCURL, path, {
        address: liveAddress,
        password,
        submit: true,
      })
      if (session.txHash) {
        const tracking = await trackRpcTx(session.txHash)
        session.txStage = tracking.stage
        session.txDetail = tracking.detail
      }
      return session
    },
    async submitSession(args: SubmitSessionArgs) {
      const liveAddress = assertHexAddress(args.address)
      if (!args.password) {
        throw new Error('Live mode needs the wallet password to sign the score submission.')
      }
      const result = await postJson<SubmitSessionResult>(adminRPCURL, txSubmitPath, {
        address: liveAddress,
        password: args.password,
        gameId: args.session.gameId,
        declaredScore: args.declaredScore,
        declaredMaxTile: args.declaredMaxTile,
        stopReason: toChainStopReason(args.stopReason),
        moves: args.moves.map(toChainMove),
        submit: true,
      })
      if (result.txHash) {
        const tracking = await trackRpcTx(result.txHash)
        result.txStage = tracking.stage
        result.txDetail = tracking.detail
      }
      return result
    },
    async claimDailyReward(args: ClaimDailyRewardArgs): Promise<ClaimDailyRewardResult> {
      const liveAddress = assertHexAddress(args.address)
      if (!args.password) {
        throw new Error('Live mode needs the wallet password to sign the reward claim.')
      }
      const result = await postJson<ClaimDailyRewardResult>(adminRPCURL, txClaimDailyRewardPath, {
        address: liveAddress,
        password: args.password,
        utcDate: args.utcDate,
        submit: true,
      })
      if (result.txHash) {
        const tracking = await trackRpcTx(result.txHash)
        result.txStage = tracking.stage
        result.txDetail = tracking.detail
      }
      return result
    },
    async claimDailyLoginReward(args: ClaimDailyLoginRewardArgs): Promise<ClaimDailyLoginRewardResult> {
      const liveAddress = assertHexAddress(args.address)
      if (!args.password) {
        throw new Error('Live mode needs the wallet password to sign the daily check-in reward claim.')
      }
      const result = await postJson<ClaimDailyLoginRewardResult>(adminRPCURL, txClaimDailyLoginRewardPath, {
        address: liveAddress,
        password: args.password,
        submit: true,
      })
      if (result.txHash) {
        const tracking = await trackRpcTx(result.txHash)
        result.txStage = tracking.stage
        result.txDetail = tracking.detail
      }
      return result
    },
    async redeemClassicPoints(args: RedeemClassicPointsArgs): Promise<RedeemClassicPointsResult> {
      const liveAddress = assertHexAddress(args.address)
      if (!args.password) {
        throw new Error('Live mode needs the wallet password to sign the redemption.')
      }
      const result = await postJson<RedeemClassicPointsResult>(adminRPCURL, txRedeemClassicPointsPath, {
        address: liveAddress,
        password: args.password,
        burnPoints: args.burnPoints,
        submit: true,
      })
      if (result.txHash) {
        const tracking = await trackRpcTx(result.txHash)
        result.txStage = tracking.stage
        result.txDetail = tracking.detail
      }
      return result
    },
    async reset() {
      throw new Error('Reset is only available in mock mode.')
    },
  }

  return {
    async isAvailable() {
      try {
        await client.getConfig()
        return true
      } catch {
        return false
      }
    },
    client,
  }
}
