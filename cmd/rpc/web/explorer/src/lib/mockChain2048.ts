import { createSeedFromText, getUtcDateString, randomSeed, replaySession, type GameMode, type MoveDirection, type StopReason } from './game2048'

export interface ChainConfig {
  dailyFee: number
  classicFee: number
  dailyMaxMoves: number
  dailyPlatformFeeBps?: number
  dailyRewardFeeBps?: number
  dailyReserveFeeBps?: number
  dailyShopFeeBps?: number
  classicPlatformFeeBps?: number
  classicReserveFeeBps?: number
  classicShopFeeBps?: number
  dailyPayoutBps?: number[]
  classicDailyPointsCap?: number
  shopRedemptionRatePoints?: number
  shopRedemptionRateCnpy?: number
  shopMinRedeemPoints?: number
  shopRedeemStepPoints?: number
  dailyLoginRewardPoints?: number[]
  dailyLoginBonusBps?: number
}

export interface SessionStart {
  gameId: string
  mode: GameMode
  seed: string
  utcDate: string
  maxMoves: number
  txHash?: string
  txStage?: 'submitted' | 'pending' | 'indexed'
  txDetail?: string
}

export interface LeaderboardEntry {
  gameId: string
  address: string
  score: number
  maxTile: number
  moveCount: number
  mode: GameMode
  utcDate: string
  endedAt: string
}

export interface PlayerStats {
  address: string
  balance: number
  dailyGamesStarted: number
  classicGamesStarted: number
  gamesCompleted: number
  wins: number
  losses: number
  bestDailyScore: number
  bestClassicScore: number
  bestTile: number
  totalScore: number
  classicPointsBalance: number
  classicPointsEarned: number
  loginStreak: number
  lastLoginClaimUtcDate: string
  classicPointsBonusUtcDate: string
}

export interface RecentRun {
  gameId: string
  address: string
  mode: GameMode
  score: number
  maxTile: number
  moveCount: number
  stopReason: StopReason
  utcDate: string
  endedAt: string
}

export interface DailyPrizePool {
  utcDate: string
  entryCount: number
  grossFees: number
  treasuryFees: number
  rewardPool: number
  finalized: boolean
  finalizedAtUnix: number
  distributedRewards: number
  treasuryLeftover: number
}

export interface ClaimableReward {
  utcDate: string
  gameId: string
  rank: number
  rewardAmount: number
  score: number
  maxTile: number
  moveCount: number
  endedAt: string
  claimed: boolean
}

export interface ClaimableRewardsSummary {
  address: string
  totalClaimable: number
  unclaimedCount: number
  rewards: ClaimableReward[]
}

export interface RedeemPreview {
  address: string
  burnPoints: number
  payoutAmount: number
  valid: boolean
  reason: string
}

export interface RedemptionHistoryEntry {
  burnPoints: number
  payoutAmount: number
  redeemedAtUnix: number
  redeemedAt: string
}

export interface RedemptionHistory {
  address: string
  redemptions: RedemptionHistoryEntry[]
}

interface MockChainState {
  config: ChainConfig
  players: Record<string, PlayerStats>
  dailyAttempts: Record<string, string>
  classicPointDays: Record<string, number>
  redemptions: Record<string, RedemptionHistoryEntry[]>
  dailyLeaderboard: LeaderboardEntry[]
  classicLeaderboard: LeaderboardEntry[]
  recentRuns: RecentRun[]
}

const STORAGE_KEY = 'canopy-2048-mock-chain'

const defaultConfig: ChainConfig = {
  dailyFee: 25,
  classicFee: 2,
  dailyMaxMoves: 80,
  dailyPlatformFeeBps: 500,
  dailyRewardFeeBps: 8000,
  dailyReserveFeeBps: 1000,
  dailyShopFeeBps: 500,
  classicPlatformFeeBps: 500,
  classicReserveFeeBps: 4500,
  classicShopFeeBps: 5000,
  dailyPayoutBps: [3000, 2000, 1200, 900, 700, 600, 500, 400, 400, 300],
  classicDailyPointsCap: 2000,
  shopRedemptionRatePoints: 300,
  shopRedemptionRateCnpy: 1,
  shopMinRedeemPoints: 300,
  shopRedeemStepPoints: 300,
  dailyLoginRewardPoints: [20, 25, 30, 35, 40, 45, 50],
  dailyLoginBonusBps: 2000,
}

export function getConfig(): ChainConfig {
  return loadState().config
}

export function getPlayer(address: string): PlayerStats {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  if (!state.players[address]) {
    state.players[address] = player
    saveState(state)
  }
  return player
}

export function addMockFunds(address: string, amount = 500): PlayerStats {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  player.balance += amount
  state.players[address] = player
  saveState(state)
  return player
}

export function startSession(address: string, mode: GameMode): SessionStart {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  const utcDate = getUtcDateString()

  const fee = mode === 'daily' ? state.config.dailyFee : state.config.classicFee
  if (player.balance < fee) {
    throw new Error(`Not enough mock balance to pay the ${mode} fee.`)
  }

  if (mode === 'daily') {
    const attemptKey = `${utcDate}:${address}`
    if (state.dailyAttempts[attemptKey]) {
      throw new Error('Daily challenge already played for this address today.')
    }
    state.dailyAttempts[attemptKey] = 'used'
  }

  player.balance -= fee
  if (mode === 'daily') {
    player.dailyGamesStarted += 1
  } else {
    player.classicGamesStarted += 1
  }
  state.players[address] = player

  const seed = mode === 'daily'
    ? createSeedFromText(`daily:${utcDate}`)
    : randomSeed()

  const session: SessionStart = {
    gameId: createSeedFromText(`${address}:${mode}:${Date.now()}:${Math.random()}`),
    mode,
    seed,
    utcDate,
    maxMoves: mode === 'daily' ? state.config.dailyMaxMoves : 0,
  }

  saveState(state)
  return session
}

export function submitSession(args: {
  address: string
  session: SessionStart
  moves: MoveDirection[]
  declaredScore: number
  declaredMaxTile: number
  stopReason: StopReason
}): { leaderboardEntry: LeaderboardEntry; player: PlayerStats } {
  const state = loadState()
  const player = state.players[args.address] ?? createPlayer(args.address)

  const replay = replaySession(
    args.session.seed,
    args.moves,
    args.session.maxMoves,
    args.stopReason,
  )

  if (replay.score !== args.declaredScore || replay.maxTile !== args.declaredMaxTile) {
    throw new Error('Submission rejected because the replayed result did not match the declared result.')
  }

  player.gamesCompleted += 1
  player.totalScore += replay.score
  player.bestTile = Math.max(player.bestTile, replay.maxTile)
  if (args.session.mode === 'daily') {
    player.bestDailyScore = Math.max(player.bestDailyScore, replay.score)
  } else {
    player.bestClassicScore = Math.max(player.bestClassicScore, replay.score)
    const basePoints = calculateClassicPoints(replay.score)
    const bonusPoints = player.classicPointsBonusUtcDate === getUtcDateString()
      ? Math.floor((basePoints * (state.config.dailyLoginBonusBps ?? 2000)) / 10000)
      : 0
    const rawPoints = basePoints + bonusPoints
    const dayKey = `${getUtcDateString()}:${args.address}`
    const earnedToday = state.classicPointDays[dayKey] ?? 0
    const dailyCap = state.config.classicDailyPointsCap ?? 2000
    const earnedPoints = Math.max(0, Math.min(rawPoints, dailyCap - earnedToday))
    player.classicPointsBalance += earnedPoints
    player.classicPointsEarned += earnedPoints
    state.classicPointDays[dayKey] = earnedToday + earnedPoints
  }

  if (replay.maxTile >= 2048) {
    player.wins += 1
  } else {
    player.losses += 1
  }

  const leaderboardEntry: LeaderboardEntry = {
    gameId: args.session.gameId,
    address: args.address,
    score: replay.score,
    maxTile: replay.maxTile,
    moveCount: replay.moveCount,
    mode: args.session.mode,
    utcDate: args.session.utcDate,
    endedAt: new Date().toISOString(),
  }

  if (args.session.mode === 'daily') {
    state.dailyLeaderboard = [...state.dailyLeaderboard, leaderboardEntry]
      .filter(entry => entry.utcDate === args.session.utcDate)
      .sort((a, b) => b.score - a.score || b.maxTile - a.maxTile)
      .slice(0, 20)
  } else {
    state.classicLeaderboard = [...state.classicLeaderboard, leaderboardEntry]
      .sort((a, b) => b.score - a.score || b.maxTile - a.maxTile)
      .slice(0, 20)
  }

  state.players[args.address] = player
  state.recentRuns = [
    {
      gameId: args.session.gameId,
      address: args.address,
      mode: args.session.mode,
      score: replay.score,
      maxTile: replay.maxTile,
      moveCount: replay.moveCount,
      stopReason: args.stopReason,
      utcDate: args.session.utcDate,
      endedAt: leaderboardEntry.endedAt,
    },
    ...state.recentRuns,
  ].slice(0, 24)
  saveState(state)

  return { leaderboardEntry, player }
}

export function getLeaderboards() {
  const state = loadState()
  return {
    daily: state.dailyLeaderboard,
    classic: state.classicLeaderboard,
  }
}

export function getDailyPrizePool(utcDate = getUtcDateString()): DailyPrizePool {
  const state = loadState()
  const dailyEntries = state.dailyLeaderboard.filter((entry) => entry.utcDate === utcDate)
  const grossFees = dailyEntries.length * state.config.dailyFee
  const platform = Math.floor((grossFees * (state.config.dailyPlatformFeeBps ?? 500)) / 10000)
  const reward = Math.floor((grossFees * (state.config.dailyRewardFeeBps ?? 8000)) / 10000)
  const reserve = Math.floor((grossFees * (state.config.dailyReserveFeeBps ?? 1000)) / 10000)
  const shop = grossFees - platform - reward - reserve
  return {
    utcDate,
    entryCount: dailyEntries.length,
    grossFees,
    treasuryFees: platform + reserve + shop,
    rewardPool: reward,
    finalized: false,
    finalizedAtUnix: 0,
    distributedRewards: 0,
    treasuryLeftover: 0,
  }
}

export function getClaimableRewards(address: string): ClaimableRewardsSummary {
  return {
    address,
    totalClaimable: 0,
    unclaimedCount: 0,
    rewards: [],
  }
}

export function claimDailyReward(): { submitted: boolean } {
  throw new Error('Daily reward claiming is only available in live RPC mode.')
}

export function claimDailyLoginReward(address: string): { submitted: boolean; utcDate: string; player: PlayerStats } {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  const utcDate = getUtcDateString()
  if (player.lastLoginClaimUtcDate === utcDate) {
    throw new Error('Daily login reward already claimed for this UTC day.')
  }

  const previousUtcDate = new Date(Date.parse(`${utcDate}T00:00:00.000Z`) - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const schedule = state.config.dailyLoginRewardPoints ?? [20, 25, 30, 35, 40, 45, 50]
  const nextStreak = player.lastLoginClaimUtcDate === previousUtcDate
    ? Math.min(player.loginStreak + 1, schedule.length)
    : 1
  const rewardPoints = schedule[Math.max(0, Math.min(schedule.length - 1, nextStreak - 1))] ?? 0
  const bonusUnlocked = nextStreak >= schedule.length

  player.loginStreak = nextStreak
  player.lastLoginClaimUtcDate = utcDate
  player.classicPointsBonusUtcDate = bonusUnlocked ? utcDate : ''
  player.classicPointsBalance += rewardPoints
  player.classicPointsEarned += rewardPoints
  state.players[address] = player
  saveState(state)
  return { submitted: true, utcDate, player }
}

export function getRedeemPreview(address: string, burnPoints: number): RedeemPreview {
  const state = loadState()
  const player = state.players[address] ?? createPlayer(address)
  const minRedeemPoints = state.config.shopMinRedeemPoints ?? 300
  const redeemStepPoints = state.config.shopRedeemStepPoints ?? 300
  const ratePoints = state.config.shopRedemptionRatePoints ?? 300
  const rateCnpy = state.config.shopRedemptionRateCnpy ?? 1
  const payoutAmount = ratePoints > 0 ? Math.floor((burnPoints * rateCnpy) / ratePoints) : 0

  if (burnPoints < minRedeemPoints) {
    return { address, burnPoints, payoutAmount, valid: false, reason: `Minimum redemption is ${minRedeemPoints} points.` }
  }
  if (redeemStepPoints > 0 && burnPoints % redeemStepPoints !== 0) {
    return { address, burnPoints, payoutAmount, valid: false, reason: `Redemption must be in ${redeemStepPoints}-point steps.` }
  }
  if (player.classicPointsBalance < burnPoints) {
    return { address, burnPoints, payoutAmount, valid: false, reason: 'Not enough classic points.' }
  }
  if (payoutAmount <= 0) {
    return { address, burnPoints, payoutAmount, valid: false, reason: 'Redemption payout would be zero.' }
  }

  return { address, burnPoints, payoutAmount, valid: true, reason: '' }
}

export function getRedemptions(address: string): RedemptionHistory {
  const state = loadState()
  return {
    address,
    redemptions: [...(state.redemptions[address] ?? [])].sort((a, b) => b.redeemedAtUnix - a.redeemedAtUnix),
  }
}

export function redeemClassicPoints(address: string, burnPoints: number): { submitted: boolean; payoutAmount: number; player: PlayerStats } {
  const state = loadState()
  const preview = getRedeemPreview(address, burnPoints)
  if (!preview.valid) {
    throw new Error(preview.reason)
  }
  const player = state.players[address] ?? createPlayer(address)
  player.classicPointsBalance -= burnPoints
  player.balance += preview.payoutAmount
  state.players[address] = player
  const redemption: RedemptionHistoryEntry = {
    burnPoints,
    payoutAmount: preview.payoutAmount,
    redeemedAtUnix: Date.now() * 1000,
    redeemedAt: new Date().toISOString(),
  }
  state.redemptions[address] = [redemption, ...(state.redemptions[address] ?? [])].slice(0, 24)
  saveState(state)
  return { submitted: true, payoutAmount: preview.payoutAmount, player }
}

export function resetMockChain(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getRecentRuns(address?: string): RecentRun[] {
  const state = loadState()
  const runs = state.recentRuns || []
  if (!address) {
    return runs
  }
  return runs.filter(run => run.address === address)
}

function createPlayer(address: string): PlayerStats {
  return {
    address,
    balance: 1200,
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
    loginStreak: 0,
    lastLoginClaimUtcDate: '',
    classicPointsBonusUtcDate: '',
  }
}

function calculateClassicPoints(score: number): number {
  if (score < 64) {
    return 0
  }
  return Math.min(1000, Math.floor(score / 32))
}

function loadState(): MockChainState {
  const fallback: MockChainState = {
    config: defaultConfig,
    players: {},
    dailyAttempts: {},
    classicPointDays: {},
    redemptions: {},
    dailyLeaderboard: [],
    classicLeaderboard: [],
    recentRuns: [],
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return fallback
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(raw),
    }
  } catch {
    return fallback
  }
}

function saveState(state: MockChainState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
