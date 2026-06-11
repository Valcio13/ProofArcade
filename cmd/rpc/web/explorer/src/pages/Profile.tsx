import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Trophy, Target, TrendingUp, Award, Wallet, Copy, Settings as SettingsIcon, ArrowRight, Gamepad2 } from 'lucide-react'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import { formatCNPY } from '../lib/utils'
import type { ClaimableRewardsSummary, LeaderboardEntry, PlayerStats, RecentRun } from '../lib/mockChain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

// Profile Page - Achievement Focused Design
function ProfilePage() {
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({
    daily: [],
    classic: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loginPassword, setLoginPassword] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [claimableRewards, setClaimableRewards] = useState<ClaimableRewardsSummary | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [gameHistory, setGameHistory] = useState<RecentRun[]>([])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      if (cancelled) {
        return
      }

      let nextWallets: RpcKeystoreAccount[] = []
      const storedAuth = loadStoredWalletAuth()
      if (client.status.mode === 'rpc') {
        nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }
        setWallets(nextWallets)
      }

      const initialAddress = storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)
        ? storedAuth.address
        : nextWallets[0]?.address ?? ''
      setSelectedAddress(initialAddress)
      setStoredSessionAddress(storedAuth?.address ?? '')
      setLoginPassword(storedAuth?.address === initialAddress ? storedAuth.password : '')

      const nextLeaderboards = await client.getLeaderboards()
      if (cancelled) {
        return
      }
      setLeaderboards(nextLeaderboards)

      if (initialAddress) {
        const [nextPlayer, nextRewards, nextHistory] = await Promise.all([
          client.getPlayer(initialAddress),
          client.getClaimableRewards(initialAddress),
          client.getRecentRuns(initialAddress),
        ])
        if (cancelled) {
          return
        }
        console.log('📊 Game History Loaded:', {
          address: initialAddress,
          historyCount: nextHistory.length,
          games: nextHistory,
        })
        setPlayer(nextPlayer)
        setClaimableRewards(nextRewards)
        setGameHistory(nextHistory)
      }

      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load the profile view.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedAddress) {
      setPlayer(null)
      return
    }

    // 🔒 RACE CONDITION FIX: Skip refresh if claim is in progress
    // This prevents useEffect from overwriting fresh state that handleClaimReward just set
    if (isClaiming) {
      console.log('🔒 [useEffect selectedAddress] Skipping refresh - claim in progress')
      return
    }

    let cancelled = false

    async function refreshSelectedProfile() {
      console.log('🔄 [useEffect selectedAddress] Triggered refresh for:', selectedAddress)
      const client = await createGame2048Client()
      const [nextPlayer, nextLeaderboards, nextRewards, nextHistory] = await Promise.all([
        client.getPlayer(selectedAddress),
        client.getLeaderboards(),
        client.getClaimableRewards(selectedAddress),
        client.getRecentRuns(selectedAddress),
      ])

      if (cancelled) {
        console.log('⚠️ [useEffect selectedAddress] Refresh cancelled, NOT updating state')
        return
      }

      console.log('✅ [useEffect selectedAddress] Applying state updates:', {
        balance: nextPlayer.balance,
        unclaimedCount: nextRewards.unclaimedCount,
      })
      setPlayer(nextPlayer)
      setLeaderboards(nextLeaderboards)
      setClaimableRewards(nextRewards)
      setGameHistory(nextHistory)
    }

    refreshSelectedProfile().catch((error) => {
      console.error('[useEffect selectedAddress] Error:', error)
      toast.error('Unable to refresh this player profile.')
    })

    return () => {
      console.log('🧹 [useEffect selectedAddress] Cleanup - marking cancelled')
      cancelled = true
    }
  }, [selectedAddress, isClaiming])

  const selectedWallet = wallets.find((wallet) => wallet.address === selectedAddress) ?? null

  useEffect(() => {
    const storedAuth = loadStoredWalletAuth()
    if (storedAuth?.address === selectedAddress) {
      setLoginPassword(storedAuth.password)
      setStoredSessionAddress(storedAuth.address)
    } else if (selectedAddress !== storedSessionAddress) {
      setLoginPassword('')
    }
  }, [selectedAddress, storedSessionAddress])

  async function handleClaimReward(utcDate: string) {
    if (!selectedAddress) {
      toast.error('Choose a wallet first.')
      return
    }
    if (!loginPassword) {
      toast.error('Enter the wallet password first.')
      return
    }

    // Find the reward being claimed to get the amount
    const rewardToClaim = claimableRewards?.rewards.find(r => r.utcDate === utcDate && !r.claimed)
    const rewardAmount = rewardToClaim?.rewardAmount ?? 0

    console.log('=== PROFILE REWARD CLAIM DIAGNOSTIC START ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('UTC Date:', utcDate)
    console.log('Selected Address:', selectedAddress)
    console.log('Reward Amount:', rewardAmount)
    
    const initialBalance = player?.balance ?? 0
    const initialUnclaimedCount = claimableRewards?.unclaimedCount ?? 0
    
    console.log('📊 Initial State Snapshot:')
    console.log('  - Balance:', initialBalance)
    console.log('  - Unclaimed Count:', initialUnclaimedCount)
    console.log('  - Reward Amount:', rewardAmount)

    try {
      setIsClaiming(true)
      console.log('✅ Step 1: Set isClaiming = true')
      
      console.log('⚡ Step 2: Creating client...')
      const client = await createGame2048Client()
      console.log('✅ Step 2 Complete: Client created, mode =', client.status.mode)
      
      console.log('⚡ Step 3: Calling claimDailyReward()...')
      const claimStartTime = performance.now()
      const result = await client.claimDailyReward({
        address: selectedAddress,
        password: loginPassword,
        utcDate,
      })
      const claimEndTime = performance.now()
      console.log(`✅ Step 3 Complete: Claim succeeded in ${(claimEndTime - claimStartTime).toFixed(2)}ms`)
      console.log('  - TX Hash:', result.txHash)
      console.log('  - TX Stage:', result.txStage)
      console.log('  - Submitted:', result.submitted)
      
      // Apply optimistic update immediately if transaction was submitted successfully
      const txSubmitted = result.submitted
      
      if (txSubmitted) {
        console.log('✅ Transaction submitted successfully, applying optimistic update (stage:', result.txStage, ')')
        
        // Optimistically update the UI based on transaction result
        if (player && claimableRewards && rewardAmount > 0) {
          const optimisticPlayer = {
            ...player,
            balance: player.balance + rewardAmount,
          }
          
          const optimisticRewards = {
            ...claimableRewards,
            unclaimedCount: Math.max(0, claimableRewards.unclaimedCount - 1),
            totalClaimable: Math.max(0, claimableRewards.totalClaimable - rewardAmount),
            rewards: claimableRewards.rewards.map(r =>
              r.utcDate === utcDate ? { ...r, claimed: true, claimTxHash: result.txHash } : r
            ),
          }
          
          console.log('📊 Optimistic State Update:')
          console.log('  - Old balance:', player.balance)
          console.log('  - New balance:', optimisticPlayer.balance)
          console.log('  - Old unclaimedCount:', claimableRewards.unclaimedCount)
          console.log('  - New unclaimedCount:', optimisticRewards.unclaimedCount)
          console.log('  - Reward Amount Added:', rewardAmount)
          
          setPlayer(optimisticPlayer)
          setClaimableRewards(optimisticRewards)
        }
        
        toast.success(result.txHash ? `Reward claimed! ${result.txStage ? `(${result.txStage})` : ''}` : 'Reward claim submitted.')
      } else {
        console.log('⚠️ Transaction submission failed, skipping optimistic update')
        toast.error('Failed to submit reward claim transaction.')
      }
      
      console.log('=== PROFILE REWARD CLAIM DIAGNOSTIC END ===')
    } catch (error) {
      console.error('❌ ERROR at some step in claim flow')
      console.error('Error object:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to claim daily reward.')
      console.log('=== PROFILE REWARD CLAIM DIAGNOSTIC END (ERROR) ===')
    } finally {
      console.log('🏁 Finally block: Setting isClaiming = false')
      setIsClaiming(false)
    }
  }

  async function handleCopyAddress() {
    if (!selectedWallet?.address) {
      return
    }
    try {
      await navigator.clipboard.writeText(selectedWallet.address)
      toast.success('Wallet address copied.')
    } catch (error) {
      console.error(error)
      toast.error('Unable to copy the wallet address.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Player Identity Hero */}
      <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
        {selectedWallet ? (
          <>
            {/* Player Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#f6df84]">Player</p>
                <h1 className="mt-2 font-bold text-5xl leading-tight text-white">
                  {selectedWallet.nickname}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-300"
                  >
                    <span className="font-mono">{shortAddress(selectedWallet.address)}</span>
                    <Copy className="h-3 w-3" />
                  </button>
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-300"
                  >
                    <SettingsIcon className="h-3 w-3" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Key Achievements */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Best Score */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#f6df84]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best Score</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">
                  {Math.max(player?.bestDailyScore ?? 0, player?.bestClassicScore ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {player?.bestDailyScore && player.bestDailyScore >= (player?.bestClassicScore ?? 0)
                    ? 'Daily Challenge'
                    : 'Classic Mode'}
                </p>
              </div>

              {/* Best Tile */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#53a6ff]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best Tile</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">
                  {player?.bestTile ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">Highest achieved</p>
              </div>

              {/* Current Rank */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#53d7a6]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current Rank</p>
                </div>
                {(() => {
                  const rankData = formatRank(leaderboards.classic, selectedAddress)
                  return (
                    <>
                      <p className="mt-3 text-4xl font-bold text-white">
                        {rankData.display}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {rankData.unranked ? (
                          <Link to="/play" className="text-[#53a6ff] hover:text-[#7eb8ff] transition">
                            Play to rank
                          </Link>
                        ) : (
                          'Classic leaderboard'
                        )}
                      </p>
                    </>
                  )
                })()}
              </div>

              {/* Balance */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#7e69ff]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Balance</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">
                  {formatCNPY(player?.balance ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">PROOF tokens</p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs uppercase tracking-wider text-[#f6df84]">Player Profile</p>
            <h1 className="mt-3 font-bold text-4xl text-white">No Wallet Selected</h1>
            <p className="mt-4 text-base text-slate-400">
              Create or import a wallet to view your profile and track your achievements
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex rounded-2xl bg-[#4ade80] px-6 py-3 text-base font-semibold text-[#0f1a14] transition hover:brightness-105"
            >
              Create Wallet
            </Link>
          </div>
        )}
      </section>

      {selectedWallet && (
        <div className="mt-6 space-y-6">
          {/* Claimable Rewards - Priority Section */}
          {claimableRewards && claimableRewards.unclaimedCount > 0 && (
            <section className="rounded-2xl border-2 border-[#f6df84]/40 bg-[#f6df84]/10 p-6">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-[#f6df84]" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">Rewards Ready to Claim</h2>
                  <p className="text-sm text-slate-300">
                    You earned {claimableRewards.unclaimedCount} reward{claimableRewards.unclaimedCount === 1 ? '' : 's'} • {formatCNPY(claimableRewards.totalClaimable)} PROOF total
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {claimableRewards.rewards
                  .filter((r) => !r.claimed)
                  .map((reward) => (
                    <div
                      key={`${reward.utcDate}-${reward.gameId}`}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 px-5 py-4"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <div className="text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6df84]/20">
                            <span className="text-xl font-black text-[#f6df84]">#{reward.rank}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-[#f6df84]">
                              {formatCNPY(reward.rewardAmount)}
                            </p>
                            <span className="text-sm font-semibold uppercase tracking-wide text-[#f6df84]/70">
                              PROOF
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {reward.utcDate} • Score {reward.score.toLocaleString()} • Tile {reward.maxTile}
                            {/* Diagnostic: raw={reward.rewardAmount} */}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimReward(reward.utcDate)}
                        disabled={isClaiming || !storedSessionAddress}
                        className="shrink-0 rounded-xl bg-[#f6df84] px-6 py-3 text-sm font-bold text-[#2f2418] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isClaiming ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="h-4 w-4 rounded-full border-2 border-[#2f2418]/30 border-t-[#2f2418]"
                            />
                            Claiming...
                          </span>
                        ) : (
                          'Claim Reward'
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Progress & Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Game Progress */}
            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#53a6ff]" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Game Progress</h2>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Games Completed</span>
                  <span className="text-lg font-bold text-white">{player?.gamesCompleted ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Win Rate</span>
                  <span className="text-lg font-bold text-white">{formatPercent(player)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Total Score</span>
                  <span className="text-lg font-bold text-white">{(player?.totalScore ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </section>

            {/* Classic Points */}
            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#7e69ff]" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Classic Points</h2>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Spendable</span>
                  <span className="text-lg font-bold text-white">{player?.classicPointsBalance ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Lifetime Earned</span>
                  <span className="text-lg font-bold text-white">{player?.classicPointsEarned ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">Login Streak</span>
                  <span className="text-lg font-bold text-white">
                    {player?.loginStreak ?? 0} {(player?.loginStreak ?? 0) === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Claimed Rewards History */}
          {claimableRewards && claimableRewards.rewards.some((r) => r.claimed) && (
            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Claimed Rewards</h2>
              <p className="mt-1 text-xs text-slate-400">Your reward history</p>
              <div className="mt-5 space-y-2">
                {claimableRewards.rewards
                  .filter((r) => r.claimed)
                  .map((reward) => (
                    reward.claimTxHash && reward.claimTxHash.length > 0 ? (
                      <Link
                        key={`${reward.utcDate}-${reward.gameId}`}
                        to={`/transaction/${reward.claimTxHash}`}
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 transition hover:border-[#53a6ff]/40 hover:bg-[#53a6ff]/5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-[#9fd0ff]">{reward.utcDate} • Rank #{reward.rank}</p>
                          <p className="text-xs text-slate-500">
                            Score {reward.score.toLocaleString()} • {formatCNPY(reward.rewardAmount)} PROOF
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                            Claimed
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-[#53a6ff]" />
                        </div>
                      </Link>
                    ) : (
                      <div
                        key={`${reward.utcDate}-${reward.gameId}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{reward.utcDate} • Rank #{reward.rank}</p>
                          <p className="text-xs text-slate-500">
                            Score {reward.score.toLocaleString()} • {formatCNPY(reward.rewardAmount)} PROOF
                          </p>
                        </div>
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          Claimed
                        </span>
                      </div>
                    )
                  ))}
              </div>
            </section>
          )}

          {/* Game History */}
          {gameHistory.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-[#7e69ff]" />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Recent Games</h2>
                </div>
                {gameHistory.length > 5 && (
                  <Link
                    to={`/game-history/${selectedAddress}`}
                    className="text-sm font-semibold text-[#53a6ff] transition hover:text-[#7eb8ff]"
                  >
                    View Full History →
                  </Link>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {gameHistory.length > 5 ? 'Last 5 games' : `${gameHistory.length} game${gameHistory.length === 1 ? '' : 's'} played`}
              </p>
              <div className="mt-5 space-y-2">
                {gameHistory.slice(0, 5).map((game) => (
                  <div
                    key={`${game.gameId}-${game.endedAt}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          game.mode === 'daily' 
                            ? 'bg-[#f6df84]/20 text-[#f6df84]' 
                            : 'bg-[#7e69ff]/20 text-[#9fd0ff]'
                        }`}>
                          {game.mode === 'daily' ? 'Daily' : 'Classic'}
                        </span>
                        <p className="text-sm font-semibold text-white">
                          Score: {game.score.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Tile: {game.maxTile}</span>
                        <span>•</span>
                        <span>{game.moveCount} moves</span>
                        <span>•</span>
                        <span>{formatStopReason(game.stopReason)}</span>
                        <span>•</span>
                        <span>{formatGameTime(game.endedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {isLoading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-6 py-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400"
          />
          <p className="mt-3 text-sm text-slate-400">Loading profile...</p>
        </div>
      )}
    </motion.div>
  )
}

function formatRank(entries: LeaderboardEntry[], address: string): { display: string; unranked: boolean } {
  if (!address) {
    return { display: '—', unranked: false }
  }
  const index = entries.findIndex((entry) => entry.address === address)
  if (index === -1) {
    return { display: '—', unranked: true }
  }
  return { display: `#${index + 1}`, unranked: false }
}

function formatPercent(player: PlayerStats | null): string {
  if (!player || player.gamesCompleted === 0) {
    return '0%'
  }
  return `${Math.round((player.wins / player.gamesCompleted) * 100)}%`
}

function formatStopReason(reason: string): string {
  switch (reason) {
    case 'player_stopped':
      return 'Manually stopped'
    case 'no_moves':
      return 'No moves available'
    case 'max_moves':
      return 'Move limit reached'
    default:
      return reason
  }
}

function formatGameTime(endedAt: string): string {
  try {
    const date = new Date(endedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  } catch {
    return endedAt
  }
}

export default ProfilePage
