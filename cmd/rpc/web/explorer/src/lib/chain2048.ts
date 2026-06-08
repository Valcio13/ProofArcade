import type { GameMode, MoveDirection, StopReason } from './game2048'
import {
  addMockFunds,
  getConfig as getMockConfig,
  getLeaderboards as getMockLeaderboards,
  getDailyPrizePool as getMockDailyPrizePool,
  getClaimableRewards as getMockClaimableRewards,
  getRedeemPreview as getMockRedeemPreview,
  getRedemptions as getMockRedemptions,
  getPlayer as getMockPlayer,
  getRecentRuns as getMockRecentRuns,
  resetMockChain,
  redeemClassicPoints as redeemMockClassicPoints,
  startSession as startMockSession,
  submitSession as submitMockSession,
  claimDailyReward as claimMockDailyReward,
  claimDailyLoginReward as claimMockDailyLoginReward,
  type ChainConfig,
  type ClaimableRewardsSummary,
  type DailyPrizePool,
  type LeaderboardEntry,
  type PlayerStats,
  type RecentRun,
  type RedeemPreview,
  type RedemptionHistory,
  type SessionStart,
} from './mockChain2048'
import { createRpcGame2048Client } from './rpcChain2048'

export type Game2048BackendMode = 'mock' | 'rpc'

export interface Game2048ClientStatus {
  mode: Game2048BackendMode
  label: string
  detail: string
}

export interface SubmitSessionArgs {
  address: string
  password?: string
  session: SessionStart
  moves: MoveDirection[]
  declaredScore: number
  declaredMaxTile: number
  stopReason: StopReason
}

export interface SubmitSessionResult {
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
  submitted: boolean
}

export interface FaucetResult {
  player: PlayerStats
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
}

export interface ClaimDailyRewardArgs {
  address: string
  password?: string
  utcDate: string
}

export interface ClaimDailyRewardResult {
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
  submitted: boolean
}

export interface ClaimDailyLoginRewardArgs {
  address: string
  password?: string
}

export interface ClaimDailyLoginRewardResult {
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
  utcDate?: string
  submitted: boolean
}

export interface RedeemClassicPointsArgs {
  address: string
  password?: string
  burnPoints: number
}

export interface RedeemClassicPointsResult {
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
  payoutAmount: number
  submitted: boolean
}

export interface Game2048Client {
  status: Game2048ClientStatus
  getConfig(): Promise<ChainConfig>
  getPlayer(address: string): Promise<PlayerStats>
  getLeaderboards(): Promise<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>
  getDailyPrizePool(utcDate?: string): Promise<DailyPrizePool>
  getClaimableRewards(address: string): Promise<ClaimableRewardsSummary>
  getRedeemPreview(address: string, burnPoints: number): Promise<RedeemPreview>
  getRedemptions(address: string): Promise<RedemptionHistory>
  getRecentRuns(address?: string): Promise<RecentRun[]>
  addFunds(address: string, amount?: number): Promise<FaucetResult>
  startSession(address: string, mode: GameMode, password?: string): Promise<SessionStart>
  submitSession(args: SubmitSessionArgs): Promise<SubmitSessionResult>
  claimDailyReward(args: ClaimDailyRewardArgs): Promise<ClaimDailyRewardResult>
  claimDailyLoginReward(args: ClaimDailyLoginRewardArgs): Promise<ClaimDailyLoginRewardResult>
  redeemClassicPoints(args: RedeemClassicPointsArgs): Promise<RedeemClassicPointsResult>
  reset(): Promise<void>
}

function createMockGame2048Client(): Game2048Client {
  return {
    status: {
      mode: 'mock',
      label: 'Mock backend',
      detail: 'Local browser state is active until custom 2048 RPC routes are available.',
    },
    async getConfig() {
      return getMockConfig()
    },
    async getPlayer(address: string) {
      return getMockPlayer(address)
    },
    async getLeaderboards() {
      return getMockLeaderboards()
    },
    async getDailyPrizePool(utcDate?: string) {
      return getMockDailyPrizePool(utcDate)
    },
    async getClaimableRewards(address: string) {
      return getMockClaimableRewards(address)
    },
    async getRedeemPreview(address: string, burnPoints: number) {
      return getMockRedeemPreview(address, burnPoints)
    },
    async getRedemptions(address: string) {
      return getMockRedemptions(address)
    },
    async getRecentRuns(address?: string) {
      return getMockRecentRuns(address)
    },
    async addFunds(address: string, amount?: number) {
      return { player: addMockFunds(address, amount) }
    },
    async startSession(address: string, mode: GameMode) {
      return startMockSession(address, mode)
    },
    async submitSession(args: SubmitSessionArgs) {
      submitMockSession(args)
      return { submitted: true }
    },
    async claimDailyReward() {
      return claimMockDailyReward()
    },
    async claimDailyLoginReward(args: ClaimDailyLoginRewardArgs) {
      return claimMockDailyLoginReward(args.address)
    },
    async redeemClassicPoints(args: RedeemClassicPointsArgs) {
      const result = redeemMockClassicPoints(args.address, args.burnPoints)
      return { submitted: result.submitted, payoutAmount: result.payoutAmount }
    },
    async reset() {
      resetMockChain()
    },
  }
}

export async function createGame2048Client(): Promise<Game2048Client> {
  const rpcClient = createRpcGame2048Client()
  const available = await rpcClient.isAvailable()
  if (available) {
    return rpcClient.client
  }
  return createMockGame2048Client()
}
