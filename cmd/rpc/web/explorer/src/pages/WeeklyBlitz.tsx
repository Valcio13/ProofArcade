import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clock, Zap, Trophy, Calendar, ArrowRight } from 'lucide-react'
import {
  getWeeklyBlitzCurrent,
  getWeeklyBlitzLeaderboard,
  getWeeklyBlitzPlayerStatus,
  type WeeklyBlitzCurrentResponse,
  type WeeklyBlitzLeaderboardEntry,
  type WeeklyBlitzPlayerStatusResponse,
} from '../lib/api'
import { loadStoredWalletAuth } from '../lib/walletAuth'
import { formatCNPY, toCNPY } from '../lib/utils'
import { WeeklyBlitzLeaderboard } from '../components/WeeklyBlitzLeaderboard'
import { WeeklyBlitzStats } from '../components/WeeklyBlitzStats'
import { DailyLimitsDisplay } from '../components/DailyLimitsDisplay'

function WeeklyBlitz() {
  useEffect(() => {
    document.title = 'Weekly Blitz | ProofArcade'
  }, [])

  const navigate = useNavigate()
  const storedWallet = loadStoredWalletAuth()
  const [currentWeek, setCurrentWeek] = useState<WeeklyBlitzCurrentResponse | null>(null)
  const [leaderboard, setLeaderboard] = useState<WeeklyBlitzLeaderboardEntry[]>([])
  const [playerStatus, setPlayerStatus] = useState<WeeklyBlitzPlayerStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const weekData = await getWeeklyBlitzCurrent()
        if (cancelled) return

        setCurrentWeek(weekData)

        const leaderboardData = await getWeeklyBlitzLeaderboard(weekData.weekId)
        if (cancelled) return

        setLeaderboard(leaderboardData.leaderboard)

        if (storedWallet?.address) {
          const statusData = await getWeeklyBlitzPlayerStatus(storedWallet.address)
          if (cancelled) return
          setPlayerStatus(statusData)
        }
      } catch (error) {
        console.error('Failed to load Weekly Blitz data:', error)
        toast.error('Failed to load Weekly Blitz data')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [storedWallet?.address])

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-12 text-center">
          <p className="text-slate-400">Loading Weekly Blitz...</p>
        </div>
      </div>
    )
  }

  if (!currentWeek) {
    return (
      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-12 text-center">
          <p className="text-slate-400">Unable to load Weekly Blitz data</p>
        </div>
      </div>
    )
  }

  const weekStart = new Date(currentWeek.weekStart * 1000)
  const weekEnd = new Date(currentWeek.weekEnd * 1000)
  const timeRemaining = weekEnd.getTime() - Date.now()
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const canPlay = storedWallet?.address && playerStatus && playerStatus.officialRunsRemaining > 0

  const handleStartGame = () => {
    if (!canPlay) {
      if (!storedWallet?.address) {
        toast.error('Please create a wallet to play Weekly Blitz')
        navigate('/auth')
      } else if (playerStatus && playerStatus.officialRunsRemaining === 0) {
        toast.error('No Official Runs remaining today. Come back tomorrow!')
      }
      return
    }

    navigate('/play?mode=weekly-blitz')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto min-h-screen max-w-[1200px] px-4 py-8 sm:px-6"
    >
      {/* Header */}
      <section className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#f0cf52]/10 p-3">
            <Zap className="h-8 w-8 text-[#f6df84]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Weekly Blitz</h1>
            <p className="mt-1 text-sm text-slate-400">
              5-minute sprint • 2 Official Runs + 3 Retries per day • Weekly cumulative scoring
            </p>
          </div>
        </div>
      </section>

      {/* Week Info Banner */}
      <section className="mb-6 rounded-2xl border border-[#f0cf52]/30 bg-gradient-to-br from-[#f0cf52]/10 to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#f6df84]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#f6df84]">
                Week {currentWeek.weekId}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
              {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">Time Remaining</p>
            <p className="mt-1 text-2xl font-black text-white">
              {daysRemaining}d {hoursRemaining}h
            </p>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="mt-4 rounded-xl border border-[#f0cf52]/20 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Prize Pool</p>
              <p className="mt-1 text-xl font-black text-[#f0cf52]">
                {formatCNPY(toCNPY(currentWeek.poolBalance))} CNPY
              </p>
            </div>
            <Trophy className="h-6 w-6 text-[#f6df84]" />
          </div>
        </div>
      </section>

      {/* Player Status */}
      {storedWallet?.address && playerStatus && (
        <>
          <section className="mb-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">Your Stats</h2>
            </div>
            <WeeklyBlitzStats status={playerStatus} />
          </section>

          {/* Daily Limits & Play Button */}
          <section className="mb-6">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DailyLimitsDisplay
                  officialRunsRemaining={playerStatus.officialRunsRemaining}
                  retriesRemaining={playerStatus.retriesRemaining}
                />

                <button
                  onClick={handleStartGame}
                  disabled={!canPlay}
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition sm:text-base ${
                    canPlay
                      ? 'bg-[#f0cf52] text-[#2e2510] hover:brightness-105'
                      : 'cursor-not-allowed bg-slate-700 text-slate-400'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  {canPlay ? 'Start Run' : 'No Runs Remaining'}
                </button>
              </div>

              {playerStatus.officialRunsRemaining === 0 && (
                <p className="mt-4 text-sm text-slate-400">
                  Your Official Runs have been used for today. Come back at{' '}
                  {new Date(
                    Date.UTC(
                      new Date().getUTCFullYear(),
                      new Date().getUTCMonth(),
                      new Date().getUTCDate() + 1,
                      0,
                      0,
                      0
                    )
                  ).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  })}{' '}
                  for fresh runs!
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Not Authenticated */}
      {!storedWallet?.address && (
        <section className="mb-6">
          <div className="rounded-2xl border border-[#53a6ff]/30 bg-[#53a6ff]/5 p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Create a wallet to compete</h3>
                <p className="mt-2 text-sm text-slate-400">
                  You need a wallet to participate in Weekly Blitz and earn rewards.
                </p>
              </div>
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-xl bg-[#4ade80] px-6 py-3 text-sm font-bold text-[#0f1a14] transition hover:brightness-105"
              >
                Create Wallet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Top players for Week {currentWeek.weekId}
          </p>
        </div>
        <WeeklyBlitzLeaderboard
          leaderboard={leaderboard}
          currentPlayerAddress={storedWallet?.address}
        />
      </section>
    </motion.div>
  )
}

export default WeeklyBlitz
