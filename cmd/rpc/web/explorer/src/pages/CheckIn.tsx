import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Check, Flame, Trophy } from 'lucide-react'
import { shortAddress } from '../lib/address'
import { createGame2048Client } from '../lib/chain2048'
import { getUtcDateString } from '../lib/game2048'
import type { ChainConfig, PlayerStats } from '../lib/mockChain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function CheckInPage() {
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [config, setConfig] = useState<ChainConfig | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<RpcKeystoreAccount | null>(null)
  const [loginPassword, setLoginPassword] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
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

      const nextWallets = client.status.mode === 'rpc' ? await fetchRpcKeystoreAccounts() : []
      if (cancelled) {
        return
      }

      const activeWallet = nextWallets.find((wallet) => wallet.address === storedAuth.address) ?? null
      setSelectedWallet(activeWallet)

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
  }, [])

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
    
    // 🔧 FIX: Completed check-ins = current streak if claimed today, otherwise currentStreak
    // This represents actual completed days, not including today's unclaimed check-in
    const completedCheckIns = claimedToday ? currentStreak : currentStreak

    return {
      utcDate,
      currentStreak,
      nextStreak,
      completedCheckIns,
      rewardPoints,
      bonusBps,
      claimedToday,
      daySevenUnlocked,
      bonusActiveToday: player?.classicPointsBonusUtcDate === utcDate,
      canClaim: !!storedSessionAddress && !claimedToday,
      schedule: rewardSchedule,
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
        let nextPlayer, nextConfig
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
        
        toast.success(
          result.txHash
            ? `Check-in reward submitted for ${result.utcDate ?? loginRewardStatus.utcDate}.`
            : 'Check-in reward claimed.',
        )
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
      {/* Streak Hero Section */}
      <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: Streak Focus */}
          <div>
            {/* Streak Display */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500">
                <Flame className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f6df84]">Current Streak</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h1 className="font-bold text-6xl leading-none text-white">
                    {player?.loginStreak ?? 0}
                  </h1>
                  <span className="text-2xl font-medium text-slate-400">
                    {(player?.loginStreak ?? 0) === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress to Day 7 */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Weekly Cycle Progress</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      {loginRewardStatus.completedCheckIns}
                    </span>
                    <span className="text-lg font-medium text-slate-400">of 7</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#f6df84]">
                    {Math.round((loginRewardStatus.completedCheckIns / 7) * 100)}%
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(loginRewardStatus.completedCheckIns / 7) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-[#53a6ff]"
                />
              </div>

              {/* Day 7 Bonus Status */}
              {loginRewardStatus.daySevenUnlocked || loginRewardStatus.completedCheckIns >= 7 ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#f6df84]/40 bg-[#f6df84]/10 p-3.5">
                  <Trophy className="h-5 w-5 text-[#f6df84]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#f6df84]">+20% Bonus Active</p>
                    <p className="text-xs text-slate-300">Play Classic Mode today to earn +20% bonus points (up to 2400 total)</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-center text-xs text-slate-500">
                  Reach Day 7 to unlock +20% bonus when playing Classic Mode (earn up to 2400 points instead of 2000)
                </p>
              )}
            </div>
          </div>

          {/* Right: Claim Card */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            {loginRewardStatus.claimedToday ? (
              // Already Claimed State
              <>
                <div className="flex items-center justify-center py-2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="mt-5 text-center text-xl font-bold text-white">Claimed!</h3>
                <p className="mt-2 text-center text-sm text-slate-400">
                  You earned {loginRewardStatus.rewardPoints} Classic Points
                </p>
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Next Check-In</p>
                  <p className="mt-1.5 text-lg font-bold text-white">Tomorrow</p>
                  <p className="mt-1 text-xs text-slate-400">Come back to continue your streak</p>
                </div>
              </>
            ) : (
              // Ready to Claim State
              <>
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#53a6ff]">Today's Reward</p>
                  <div className="mt-3">
                    <p className="text-5xl font-bold text-white">
                      {loginRewardStatus.rewardPoints}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Classic Points
                    </p>
                  </div>
                </div>

                {storedSessionAddress ? (
                  <button
                    onClick={handleClaimLoginReward}
                    disabled={!loginRewardStatus.canClaim || isClaiming}
                    className="mt-6 w-full rounded-2xl bg-[#53a6ff] px-5 py-4 text-base font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isClaiming ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Claiming...
                      </span>
                    ) : (
                      'Claim Reward'
                    )}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border-2 border-white/10 bg-white/5 px-5 py-4 text-base font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Log In To Claim
                  </Link>
                )}

                <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-slate-600">
                  {loginRewardStatus.utcDate}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7-Day Reward Track */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-7">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-200">Reward Track</p>
          <p className="mt-1 text-xs text-slate-400">
            Check in daily to earn Classic Points and unlock Day 7 bonus
          </p>
        </div>

        {/* Simplified Reward Track */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {loginRewardStatus.schedule.map((points, index) => {
            const day = index + 1
            const completedCheckIns = loginRewardStatus.completedCheckIns
            const nextStreak = loginRewardStatus.nextStreak
            const claimedToday = loginRewardStatus.claimedToday
            
            // 🔧 FIX: Proper state calculation
            // - Current Day: nextStreak === day AND not yet claimed today
            // - Completed: day <= completedCheckIns (already claimed days)
            // - Missed: day < nextStreak AND day > completedCheckIns (skipped days in broken streak)
            // - Future: day > nextStreak (not reached yet)
            
            const isCurrent = nextStreak === day && !claimedToday
            const isCompleted = day <= completedCheckIns
            const isMissed = !isCompleted && !isCurrent && day < nextStreak
            const isBonusDay = day === 7

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
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-6 py-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto h-6 w-6 rounded-full border-2 border-slate-700 border-t-slate-400"
          />
          <p className="mt-3 text-sm text-slate-400">Loading check-in rewards...</p>
        </div>
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
