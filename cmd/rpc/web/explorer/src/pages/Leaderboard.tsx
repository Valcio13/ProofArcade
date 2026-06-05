import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import { getUtcDateString } from '../lib/game2048'
import type { DailyPrizePool, LeaderboardEntry } from '../lib/mockChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

type LeaderboardMode = 'daily' | 'classic'

function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const activeMode: LeaderboardMode = modeParam === 'classic' ? 'classic' : 'daily'

  const storedWallet = loadStoredWalletAuth()
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({
    daily: [],
    classic: [],
  })
  const [dailyPool, setDailyPool] = useState<DailyPrizePool | null>(null)
  const [countdown, setCountdown] = useState(() => formatUtcCountdown())
  const [isLoading, setIsLoading] = useState(true)

  // Set document title
  useEffect(() => {
    document.title = `Leaderboard - ProofArcade`
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLeaderboards() {
      setIsLoading(true)
      try {
        const client = await createGame2048Client()
        const [nextLeaderboards, nextDailyPool] = await Promise.all([
          client.getLeaderboards(),
          client.getDailyPrizePool(getUtcDateString()),
        ])
        if (!cancelled) {
          setLeaderboards(nextLeaderboards)
          setDailyPool(nextDailyPool)
        }
      } catch (error) {
        console.error(error)
        toast.error('Unable to load leaderboards.')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboards()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatUtcCountdown())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  function switchMode(mode: LeaderboardMode) {
    setSearchParams({ mode })
  }

  function copyShareLink() {
    const url = `${window.location.origin}/leaderboard?mode=${activeMode}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Leaderboard link copied!')
      })
      .catch(() => {
        toast.error('Unable to copy link.')
      })
  }

  const activeLeaderboard = activeMode === 'daily' ? leaderboards.daily : leaderboards.classic
  const userRank = activeLeaderboard.findIndex((entry) => entry.address === storedWallet?.address)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(240,207,82,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(83,166,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(201,95,56,0.2),_transparent_24%),linear-gradient(145deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)] sm:p-8 xl:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_100%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-stretch">
          <div className="flex flex-col justify-between gap-8">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#f6df84]">ProofArcade 2048</p>
              <h1 className="mt-4 font-['Georgia'] text-5xl leading-none text-white sm:text-6xl xl:text-7xl">
                Leaderboards
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                Track top players across daily challenges and classic runs. All scores are verified on-chain and publicly auditable.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
              <button
                onClick={() => switchMode('daily')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeMode === 'daily'
                    ? 'bg-[#f0cf52] text-[#2e2510]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Daily Challenge
              </button>
              <button
                onClick={() => switchMode('classic')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeMode === 'classic'
                    ? 'bg-[#53a6ff] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Classic
              </button>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className="rounded-[1.9rem] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Share</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Share this leaderboard</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Shareable
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Copy the link to share this {activeMode} leaderboard view with others.
            </p>

            <button
              onClick={copyShareLink}
              className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <i className="bi bi-share mr-2"></i>
              Copy Share Link
            </button>

            {storedWallet && userRank !== -1 ? (
              <div className="mt-5 rounded-[1rem] border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#9fd0ff]">Your Rank</p>
                <p className="mt-2 text-2xl font-bold text-white">#{userRank + 1}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {activeLeaderboard[userRank]?.score ?? 0} points
                </p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Daily Prize Pool - Only show for daily mode */}
      {activeMode === 'daily' ? (
        <section className="mt-6 rounded-[1.8rem] border border-[#f0cf52]/20 bg-[linear-gradient(135deg,_rgba(45,38,16,0.88),_rgba(20,21,28,0.96))] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Today's Prize Pool</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {dailyPool?.rewardPool ?? 0} PROOF
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Live pool for {dailyPool?.utcDate ?? getUtcDateString()}. Each entry adds to this reward pot.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PoolStat label="Entries" value={`${dailyPool?.entryCount ?? 0}`} />
              <PoolStat label="Gross Fees" value={`${dailyPool?.grossFees ?? 0} PROOF`} />
              <PoolStat label="Resets In" value={countdown} />
            </div>
          </div>
        </section>
      ) : null}

      {/* User Rank Banner */}
      {storedWallet && userRank !== -1 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[1.6rem] border border-[#53a6ff]/30 bg-[#53a6ff]/10 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#9fd0ff]">Your Position</p>
              <p className="mt-2 text-2xl font-bold text-white">
                #{userRank + 1} · {activeLeaderboard[userRank]?.score ?? 0} points
              </p>
            </div>
            <div className="rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/20 px-4 py-2 text-sm font-semibold text-white">
              {storedWallet.nickname}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Leaderboard Table */}
      <section className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {activeMode === 'daily' ? 'Daily Leaders' : 'Classic Leaders'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {activeMode === 'daily'
                ? "Top submitted daily scores for today's board."
                : 'Highest verified classic runs so far.'}
            </p>
          </div>
          <p className="text-sm text-slate-500">{activeLeaderboard.length} entries</p>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-[1rem] border border-dashed border-white/10 bg-slate-950/30 px-4 py-6 text-center text-sm text-slate-400">
            Loading leaderboard...
          </div>
        ) : activeLeaderboard.length > 0 ? (
          <div className="mt-5 space-y-3">
            {activeLeaderboard.map((entry, index) => (
              <LeaderboardRow
                key={`${entry.gameId}-${entry.address}`}
                entry={entry}
                rank={index + 1}
                isCurrentUser={entry.address === storedWallet?.address}
                showDate={activeMode === 'daily'}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1rem] border border-dashed border-white/10 bg-slate-950/30 px-4 py-6 text-center text-sm text-slate-400">
            {activeMode === 'daily'
              ? 'No daily submissions yet for today.'
              : 'No classic submissions yet.'}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">About Daily</p>
          <h3 className="mt-2 text-xl font-bold text-white">Daily Challenge</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Compete once per UTC day on a shared board. Entry fees build the prize pool, and top
            players claim rewards at day's end. Rankings reset daily at midnight UTC.
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">About Classic</p>
          <h3 className="mt-2 text-xl font-bold text-white">Classic Mode</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Play unlimited runs with random seeds. Earn spendable points for progression and
            compete for the all-time high scores. Classic leaderboard tracks lifetime best runs.
          </p>
        </div>
      </section>
    </motion.div>
  )
}

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  showDate,
}: {
  entry: LeaderboardEntry
  rank: number
  isCurrentUser: boolean
  showDate: boolean
}) {
  const getRankColor = (position: number) => {
    if (position === 1) return 'text-[#f0cf52]'
    if (position === 2) return 'text-[#c0c0c0]'
    if (position === 3) return 'text-[#cd7f32]'
    return 'text-slate-400'
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return `#${position}`
  }

  return (
    <motion.div
      whileHover={{ x: 3, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-[1.2rem] border px-5 py-4 ${
        isCurrentUser
          ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
          : rank <= 3
            ? 'border-[#f6df84]/20 bg-[#f6df84]/5'
            : 'border-white/10 bg-slate-950/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex w-16 items-center justify-center">
          <span className={`text-2xl font-black ${getRankColor(rank)}`}>
            {getRankIcon(rank)}
          </span>
        </div>

        {/* Player Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-white">
              {shortAddress(entry.address)}
            </p>
            {isCurrentUser ? (
              <span className="rounded-full bg-[#53a6ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                You
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {entry.moveCount} moves • Max tile {entry.maxTile}
          </p>
        </div>

        {/* Score & Date */}
        <div className="text-right">
          <p className="text-2xl font-black text-white">{entry.score}</p>
          {showDate ? (
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {entry.utcDate}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function PoolStat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3"
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </motion.div>
  )
}

function formatUtcCountdown(): string {
  const now = new Date()
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  )
  const remainingMs = Math.max(0, nextUtcMidnight - now.getTime())
  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

export default LeaderboardPage
