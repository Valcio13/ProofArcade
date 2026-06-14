import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Check, Flame, Trophy, Clock } from 'lucide-react'
import { createGame2048Client } from '../lib/chain2048'
import { getUtcDateString } from '../lib/game2048'
import type { ChainConfig, PlayerStats } from '../lib/mockChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function CheckInPage() {
  useEffect(() => {
    document.title = 'Daily Check-In | ProofArcade'
  }, [])

  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [config, setConfig] = useState<ChainConfig | null>(null)
  const [loginPassword, setLoginPassword] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [lastClaimTimestamp, setLastClaimTimestamp] = useState(0)

  useEffect(() => {
    // 🔧 COOLDOWN: Skip fetch for 2s after claim to preserve optimistic update
    // Only apply cooldown if we've actually claimed (timestamp > 0)
    if (lastClaimTimestamp > 0) {
      const timeSinceLastClaim = Date.now() - lastClaimTimestamp
      if (timeSinceLastClaim < 2000) {
        return
      }
    }

    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      const nextConfig = await client.getConfig()
      if (cancelled) {
        return
      }
      setConfig(nextConfig)

      const storedAuth = loadStoredWalletAuth()
      setStoredSessionAddress(storedAuth?.address ?? '')
      setLoginPassword(storedAuth?.password ?? '')

      if (!storedAuth?.address) {
        setIsLoading(false)
        return
      }

      const nextPlayer = await client.getPlayer(storedAuth.address)
      if (cancelled) {
        return
      }
      setPlayer(nextPlayer)
      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load check-in rewards.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [lastClaimTimestamp])

  const loginRewardStatus = useMemo(() => {
    const utcDate = getUtcDateString()
    const rewardSchedule = config?.dailyLoginRewardPoints?.length
      ? config.dailyLoginRewardPoints
      : [20, 25, 30, 35, 40, 45, 50]
    const bonusBps = config?.dailyLoginBonusBps ?? 2000
    const claimedToday = player?.lastLoginClaimUtcDate === utcDate
    const currentStreak = player?.loginStreak ?? 0
    
    // Calculate next streak: if already claimed today, use current; otherwise calculate expected next
    const nextStreak = claimedToday 
      ? currentStreak
      : player?.lastLoginClaimUtcDate === previousUtcDate(utcDate)
        ? Math.min(currentStreak + 1, rewardSchedule.length)
        : 1
    
    const rewardPoints = rewardSchedule[Math.max(0, nextStreak - 1)] ?? rewardSchedule[rewardSchedule.length - 1] ?? 0
    const daySevenUnlocked = nextStreak >= rewardSchedule.length
    
    // Weekly cycle calculation (wraps 1-7, not resetting streak)
    const completedCheckIns = currentStreak === 0 
      ? 0 
      : (currentStreak % 7 === 0 ? 7 : currentStreak % 7)
    
    // Calculate next reward (tomorrow)
    const tomorrowStreak = claimedToday 
      ? Math.min(currentStreak + 1, rewardSchedule.length)
      : nextStreak
    const nextRewardPoints = rewardSchedule[Math.max(0, tomorrowStreak - 1)] ?? rewardSchedule[rewardSchedule.length - 1] ?? 0
    
    // Calculate days until Day 7 bonus
    const daysUntilBonus = claimedToday 
      ? (7 - completedCheckIns)
      : (7 - completedCheckIns) + (completedCheckIns === 0 ? 0 : 0)

    return {
      utcDate,
      currentStreak,
      nextStreak,
      completedCheckIns,
      rewardPoints,
      nextRewardPoints,
      bonusBps,
      claimedToday,
      daySevenUnlocked,
      bonusActiveToday: player?.classicPointsBonusUtcDate === utcDate,
      canClaim: !!storedSessionAddress && !claimedToday,
      schedule: rewardSchedule,
      daysUntilBonus: Math.max(0, daysUntilBonus),
    }
  }, [config, player, storedSessionAddress])

  async function handleClaimLoginReward() {
    if (!storedSessionAddress) {
      toast.error('Log in first to claim the daily check-in reward.')
      return
    }
    if (!loginPassword) {
      toast.error('Missing wallet password for this session.')
      return
    }

    console.log('=== CHECK-IN CLAIM DIAGNOSTIC START ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('UTC Date:', loginRewardStatus.utcDate)
    console.log('Selected Address:', storedSessionAddress)

    // Capture initial state for comparison
    const initialStreak = player?.loginStreak ?? 0
    const initialPoints = player?.classicPointsBalance ?? 0
    const initialCompletedCheckIns = loginRewardStatus.completedCheckIns

    console.log('📊 Initial State Snapshot:')
    console.log('  - Login Streak:', initialStreak)
    console.log('  - Classic Points:', initialPoints)
    console.log('  - Completed Check-Ins:', initialCompletedCheckIns)
    console.log('  - Expected Reward:', loginRewardStatus.rewardPoints)

    try {
      setIsClaiming(true)
      console.log('✅ Step 1: Set isClaiming = true')
      
      console.log('⚡ Step 2: Creating client...')
      const client = await createGame2048Client()
      console.log('✅ Step 2 Complete: Client created, mode =', client.status.mode)
      
      console.log('⚡ Step 3: Calling claimDailyLoginReward()...')
      const startTime = performance.now()
      const result = await client.claimDailyLoginReward({
        address: storedSessionAddress,
        password: loginPassword,
      })
      const claimDuration = performance.now() - startTime
      console.log(`✅ Step 3 Complete: Claim succeeded in ${claimDuration.toFixed(2)}ms`)
      console.log('  - TX Hash:', result.txHash)
      console.log('  - TX Stage:', result.txStage)
      console.log('  - Submitted:', result.submitted)
      
      // Check if transaction was indexed (successful and finalized)
      const txIndexed = result.txStage === 'indexed' && result.submitted
      
      if (txIndexed) {
        console.log('✅ Transaction indexed successfully, using optimistic update')
        
        // Optimistically update the UI based on transaction result
        if (player && config) {
          const todayUtc = loginRewardStatus.utcDate
          const rewardSchedule = config.dailyLoginRewardPoints ?? [20, 25, 30, 35, 40, 45, 50]
          const newStreak = initialStreak >= rewardSchedule.length ? 1 : initialStreak + 1
          const rewardPoints = loginRewardStatus.rewardPoints
          
          const optimisticPlayer = {
            ...player,
            loginStreak: newStreak,
            lastLoginClaimUtcDate: todayUtc,
            classicPointsBalance: player.classicPointsBalance + rewardPoints,
            classicPointsEarned: player.classicPointsEarned + rewardPoints,
          }
          
          console.log('📊 Optimistic State Update:')
          console.log('  - Old loginStreak:', player.loginStreak)
          console.log('  - New loginStreak:', optimisticPlayer.loginStreak)
          console.log('  - Old classicPointsBalance:', player.classicPointsBalance)
          console.log('  - New classicPointsBalance:', optimisticPlayer.classicPointsBalance)
          console.log('  - Reward Points Added:', rewardPoints)
          
          setPlayer(optimisticPlayer)
          setLastClaimTimestamp(Date.now()) // Cooldown
        }
        
        toast.success(
          result.txHash
            ? `Check-in reward submitted for ${result.utcDate ?? loginRewardStatus.utcDate}.`
            : 'Check-in reward claimed.',
        )
      } else {
        console.log('⚠️ Transaction not indexed, falling back to polling...')
        
        // Fall back to polling if transaction wasn't indexed
        const todayUtc = loginRewardStatus.utcDate
        let nextPlayer: PlayerStats | null = null
        let nextConfig: ChainConfig | null = null
        let confirmedOnChain = false
        let attempts = 0
        const maxAttempts = 35 // 35 × 200ms = 7 seconds
        const delayMs = 200
        
        while (attempts < maxAttempts) {
          attempts++
          console.log(`  🔄 Polling attempt ${attempts}/${maxAttempts}...`)
          
          const [player, config] = await Promise.all([
            client.getPlayer(storedSessionAddress),
            client.getConfig(),
          ])
          
          const claimDateUpdated = player.lastLoginClaimUtcDate === todayUtc
          const dataIsFresh = claimDateUpdated || player.loginStreak > initialStreak || player.classicPointsBalance > initialPoints
          
          console.log(`    - lastLoginClaimUtcDate: ${player.lastLoginClaimUtcDate} (today: ${todayUtc})`)
          console.log(`    - dataIsFresh: ${dataIsFresh}`)
          
          if (dataIsFresh) {
            nextPlayer = player
            nextConfig = config
            confirmedOnChain = true
            console.log(`  ✅ Fresh data detected on attempt ${attempts}!`)
            break
          }
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          } else {
            nextPlayer = player
            nextConfig = config
            console.log(`  ⚠️ Max attempts reached, using latest data`)
          }
        }
        
        setPlayer(nextPlayer)
        setConfig(nextConfig)
        
        if (confirmedOnChain) {
          setLastClaimTimestamp(Date.now()) // Cooldown
          toast.success(
            result.txHash
              ? `Check-in reward confirmed for ${result.utcDate ?? loginRewardStatus.utcDate}.`
              : 'Check-in reward claimed.',
          )
        } else {
          // The transaction hash was returned but never appeared on-chain
          // (not indexed, and player state never updated). Surface this as a
          // failure instead of a false success, and leave no fake optimistic state.
          console.warn('❌ Check-in not confirmed on-chain', {
            txHash: result.txHash,
            txStage: result.txStage,
          })
          toast.error(
            "Your check-in couldn't be confirmed on-chain. No points were deducted - please try again in a moment.",
          )
        }
      }
      
      console.log('=== CHECK-IN CLAIM DIAGNOSTIC END ===')
    } catch (error) {
      console.error('❌ Error during claim:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to claim the daily check-in reward.')
      console.log('=== CHECK-IN CLAIM DIAGNOSTIC END (ERROR) ===')
    } finally {
      console.log('🏁 Finally block: Setting isClaiming = false')
      setIsClaiming(false)
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
      {isLoading ? (
        /* Skeleton Loader */
        <>
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="h-16 animate-pulse rounded-xl bg-white/5" />
          </section>
          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Compact Status Summary Banner */}
          <section className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {/* Current Streak */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Streak</p>
                  <p className="mt-0.5 text-2xl font-bold text-white">{loginRewardStatus.currentStreak}</p>
                </div>
              </div>

              {/* Check-In Status */}
              <div className="flex items-center gap-3">
                {loginRewardStatus.claimedToday ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</p>
                      <p className="mt-0.5 text-sm font-bold text-green-400">Checked In</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#53a6ff] bg-[#53a6ff]/20">
                      <div className="h-2 w-2 rounded-full bg-[#53a6ff]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</p>
                      <p className="mt-0.5 text-sm font-bold text-[#53a6ff]">Ready to Claim</p>
                    </div>
                  </>
                )}
              </div>

              {/* Next Reward */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#53a6ff]/20">
                  <span className="text-lg">🎁</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {loginRewardStatus.claimedToday ? 'Tomorrow' : 'Today'}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {loginRewardStatus.claimedToday 
                      ? `${loginRewardStatus.nextRewardPoints} Points`
                      : `${loginRewardStatus.rewardPoints} Points`
                    }
                  </p>
                </div>
              </div>

              {/* Next Check-In Time */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                  <Clock className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Next Check-In</p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {loginRewardStatus.claimedToday ? 'Tomorrow' : 'Now'}
                  </p>
                </div>
              </div>
            </div>

            {/* Inline Claimed Message */}
            {loginRewardStatus.claimedToday && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-center">
                <p className="text-sm font-semibold text-green-400">
                  ✓ Checked In Today · +{loginRewardStatus.rewardPoints} Classic Points Earned
                </p>
              </div>
            )}
          </section>

          {/* 7-Day Reward Track - Hero Element */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">7-Day Reward Track</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Check in daily to earn Classic Points and unlock weekly bonus
                </p>
              </div>

              {/* Days Until Bonus Highlight */}
              {loginRewardStatus.daysUntilBonus > 0 && (
                <div className="rounded-xl border border-[#f6df84]/40 bg-[#f6df84]/10 px-4 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#f6df84]">
                    {loginRewardStatus.daysUntilBonus} {loginRewardStatus.daysUntilBonus === 1 ? 'Day' : 'Days'} Until +20% Bonus
                  </p>
                </div>
              )}

              {/* Bonus Active Badge */}
              {loginRewardStatus.daySevenUnlocked && (
                <div className="flex items-center gap-2 rounded-xl border border-[#f6df84]/40 bg-[#f6df84]/10 px-4 py-2">
                  <Trophy className="h-4 w-4 text-[#f6df84]" />
                  <p className="text-xs font-bold uppercase tracking-wide text-[#f6df84]">
                    +20% Bonus Active
                  </p>
                </div>
              )}
            </div>

            {/* Reward Track Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {loginRewardStatus.schedule.map((points, index) => {
            const day = index + 1
            const completedCheckIns = loginRewardStatus.completedCheckIns
            const nextStreak = loginRewardStatus.nextStreak
            const claimedToday = loginRewardStatus.claimedToday
            
            const isCurrent = nextStreak === day && !claimedToday
            const isCompleted = day <= completedCheckIns
            const isMissed = !isCompleted && !isCurrent && day < nextStreak
            const isBonusDay = day === 7
            const isClaimable = isCurrent && storedSessionAddress && loginRewardStatus.canClaim

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-xl p-4 transition-all ${
                  isCurrent
                    ? 'border-2 border-[#53a6ff] bg-[#53a6ff]/10'
                    : isCompleted
                      ? 'border border-green-500/40 bg-green-500/5'
                      : isMissed
                        ? 'border border-red-500/40 bg-red-500/5 opacity-75'
                        : isBonusDay
                          ? 'border-2 border-[#f6df84]/40 bg-[#f6df84]/5'
                          : 'border border-white/10 bg-slate-950/40'
                }`}
              >
                {/* Status Indicator */}
                {isCompleted && (
                  <div className="absolute -right-1.5 -top-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                {isMissed && (
                  <div className="absolute -right-1.5 -top-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                      <span className="text-sm font-bold text-white">✕</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${
                    isMissed ? 'text-red-400/70' : 'text-slate-500'
                  }`}>
                    Day {day}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-[#53a6ff] px-2 py-0.5 text-[10px] font-bold text-white">
                      NOW
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className={`text-3xl font-bold ${
                    isCompleted || isCurrent 
                      ? 'text-white' 
                      : isMissed 
                        ? 'text-red-400/50 line-through' 
                        : 'text-slate-600'
                  }`}>
                    {points}
                  </p>
                  <p className={`mt-0.5 text-[11px] font-medium uppercase tracking-wide ${
                    isCompleted || isCurrent 
                      ? 'text-slate-400' 
                      : isMissed 
                        ? 'text-red-400/50' 
                        : 'text-slate-600'
                  }`}>
                    Classic Points
                  </p>
                </div>

                {/* Integrated Claim Button for Current Day */}
                {isCurrent && (
                  <div className="mt-4">
                    {storedSessionAddress ? (
                      <button
                        onClick={handleClaimLoginReward}
                        disabled={!loginRewardStatus.canClaim || isClaiming}
                        className="w-full rounded-lg bg-[#53a6ff] py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isClaiming ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span className="text-xs">Claiming...</span>
                          </span>
                        ) : (
                          'Claim Now'
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        className="block w-full rounded-lg border border-white/20 bg-white/5 py-2.5 text-center text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:bg-white/10"
                      >
                        Log In
                      </Link>
                    )}
                  </div>
                )}

                {isBonusDay && (
                  <div className={`mt-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${
                    isCompleted || isCurrent
                      ? 'border border-[#f6df84]/30 bg-[#f6df84]/10'
                      : 'border border-[#f6df84]/20 bg-[#f6df84]/5 opacity-50'
                  }`}>
                    <Trophy className={`h-3.5 w-3.5 ${
                      isCompleted || isCurrent ? 'text-[#f6df84]' : 'text-[#f6df84]/50'
                    }`} />
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${
                      isCompleted || isCurrent ? 'text-[#f6df84]' : 'text-[#f6df84]/50'
                    }`}>
                      +20% Bonus
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Day 7 Bonus Explanation */}
        {loginRewardStatus.daySevenUnlocked ? (
          <div className="mt-5 rounded-xl border border-[#f6df84]/40 bg-[#f6df84]/10 p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-[#f6df84]" />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#f6df84]">Weekly Bonus Unlocked!</p>
                <p className="mt-1 text-xs text-slate-300">
                  Play Classic Mode today to earn +20% bonus points (up to 2400 total instead of 2000)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-center text-xs text-slate-500">
            Complete 7 consecutive check-ins to unlock +20% Classic Mode bonus (earn up to 2400 points instead of 2000)
          </p>
        )}
      </section>
      </>
      )}
    </motion.div>
  )
}

function previousUtcDate(utcDate: string): string {
  const date = new Date(`${utcDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export default CheckInPage
