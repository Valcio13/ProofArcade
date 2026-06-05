import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import MetricCard from '../components/app/MetricCard'
import { shortAddress } from '../lib/address'
import { createGame2048Client } from '../lib/chain2048'
import { getUtcDateString } from '../lib/game2048'
import type { ChainConfig, PlayerStats } from '../lib/mockChain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function DailyLoginPage() {
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
    const nextStreak = player?.lastLoginClaimUtcDate === previousUtcDate(utcDate)
      ? Math.min((player?.loginStreak ?? 0) + 1, rewardSchedule.length)
      : 1
    const rewardPoints = rewardSchedule[Math.max(0, nextStreak - 1)] ?? rewardSchedule[rewardSchedule.length - 1] ?? 0
    const daySevenUnlocked = nextStreak >= rewardSchedule.length

    return {
      utcDate,
      nextStreak,
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

    try {
      setIsClaiming(true)
      const client = await createGame2048Client()
      const result = await client.claimDailyLoginReward({
        address: storedSessionAddress,
        password: loginPassword,
      })
      const nextPlayer = await client.getPlayer(storedSessionAddress)
      setPlayer(nextPlayer)
      toast.success(
        result.txHash
          ? `Check-in reward submitted for ${result.utcDate ?? loginRewardStatus.utcDate}.`
          : 'Check-in reward claimed.',
      )
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to claim the daily check-in reward.')
    } finally {
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
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_22%),linear-gradient(160deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Daily Check-In</p>
            <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">Keep your streak going.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Claim once per UTC day. Day 7 unlocks that day&apos;s +20% classic-points bonus.
            </p>
            {selectedWallet ? (
              <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <span className="font-semibold text-white">{selectedWallet.nickname}</span>
                <span className="mx-2 text-slate-500">•</span>
                <span className="font-mono">{shortAddress(selectedWallet.address)}</span>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Current streak" value={`${player?.loginStreak ?? 0} day${(player?.loginStreak ?? 0) === 1 ? '' : 's'}`} compact />
              <MetricCard label="Next reward" value={`${loginRewardStatus.rewardPoints} points`} compact />
              <MetricCard
                label="Status"
                value={
                  !storedSessionAddress
                    ? 'Log in to claim'
                    : loginRewardStatus.claimedToday
                      ? 'Checked in today'
                      : 'Ready to claim'
                }
                compact
              />
              <MetricCard
                label="Day-7 bonus"
                value={
                  loginRewardStatus.bonusActiveToday
                    ? `+${Math.floor(loginRewardStatus.bonusBps / 100)}% active`
                    : loginRewardStatus.daySevenUnlocked
                      ? `+${Math.floor(loginRewardStatus.bonusBps / 100)}% unlocks today`
                      : 'Unlocks on day 7'
                }
                compact
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Today</p>
            <div className="mt-4 rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">UTC date</p>
              <p className="mt-2 text-xl font-bold text-white">{loginRewardStatus.utcDate}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {loginRewardStatus.claimedToday
                  ? 'Today’s reward is already claimed.'
                  : 'Claim today’s reward to keep the streak moving.'}
              </p>
            </div>
            {storedSessionAddress ? (
              <button
                onClick={handleClaimLoginReward}
                disabled={!loginRewardStatus.canClaim || isClaiming}
                className="mt-4 w-full rounded-2xl bg-[#53a6ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClaiming ? 'Claiming Check-In...' : 'Claim Check-In'}
              </button>
            ) : (
              <Link
                to="/auth"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                Log In To Claim
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">7-Day Rewards</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">A simple streak ladder using the same spendable classic points.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Bonus on day 7
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {loginRewardStatus.schedule.map((points, index) => {
            const day = index + 1
            const isCurrent = loginRewardStatus.nextStreak === day && !loginRewardStatus.claimedToday
            const isBonusDay = day === loginRewardStatus.schedule.length
            const isClaimed = (player?.loginStreak ?? 0) >= day && !isCurrent

            return (
              <div
                key={day}
                className={`rounded-[1rem] border px-4 py-3 ${
                  isCurrent
                    ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
                    : isBonusDay
                      ? 'border-[#f6df84]/30 bg-[#f6df84]/5'
                      : 'border-white/10 bg-slate-950/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Day {day}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    {isCurrent ? 'Next' : isClaimed ? 'Done' : isBonusDay ? 'Bonus' : ''}
                  </p>
                </div>
                <p className="mt-2 text-[1.8rem] font-bold text-white">{points}</p>
                <p className="mt-1 text-sm text-slate-400">points</p>
                {isBonusDay ? (
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f6df84]">
                    +20% gameplay bonus
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-400">
          Loading check-in rewards...
        </div>
      ) : null}
    </motion.div>
  )
}

function previousUtcDate(utcDate: string): string {
  const date = new Date(`${utcDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export default DailyLoginPage
