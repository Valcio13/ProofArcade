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
      className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(240,207,82,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(83,166,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(201,95,56,0.2),_transparent_24%),linear-gradient(145deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-5 shadow-[0_25px_90px_rgba(0,0,0,0.32)] sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_100%)]" />
        <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div className="flex flex-col justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#f6df84]">ProofArcade 2048</p>
              <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">
                Leaderboards
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Track top players across daily challenges and classic runs. All scores are verified on-chain and publicly auditable.
              </p>
            </div>

            {/* Mode Selector - Tab Style */}
            <div className="inline-flex self-start rounded-xl border border-white/10 bg-black/30 p-0.5">
              <button
                onClick={() => switchMode('daily')}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  activeMode === 'daily'
                    ? 'bg-[#f0cf52] text-[#2e2510] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Daily Challenge
              </button>
              <button
                onClick={() => switchMode('classic')}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  activeMode === 'classic'
                    ? 'bg-[#53a6ff] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Classic
              </button>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Share</p>
                <h2 className="mt-2 text-lg font-bold text-white">Share Leaderboard</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Link
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Copy link to share this {activeMode} leaderboard.
            </p>

            <button
              onClick={copyShareLink}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <i className="bi bi-share mr-2"></i>
              Copy Share Link
            </button>

            {storedWallet && userRank !== -1 ? (
              <div className="mt-3 rounded-lg border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#9fd0ff]">Your Rank</p>
                <p className="mt-1 text-xl font-bold text-white">#{userRank + 1}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {activeLeaderboard[userRank]?.score ?? 0} points
                </p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Daily Prize Pool - Only show for daily mode */}
      {activeMode === 'daily' ? (
        <section className="mt-4 rounded-[1.5rem] border border-[#f0cf52]/20 bg-[linear-gradient(135deg,_rgba(45,38,16,0.88),_rgba(20,21,28,0.96))] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Today's Prize Pool</p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {dailyPool?.rewardPool ?? 0} PROOF
              </h2>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
                Live pool for {dailyPool?.utcDate ?? getUtcDateString()}. Each entry adds to this reward pot.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <PoolStat label="Entries" value={`${dailyPool?.entryCount ?? 0}`} />
              <PoolStat label="Gross Fees" value={`${dailyPool?.grossFees ?? 0} PROOF`} />
              <PoolStat label="Resets In" value={countdown} />
            </div>
          </div>
        </section>
      ) : null}

      {/* User Position Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-[1.3rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-3"
      >
        {storedWallet && userRank !== -1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#53a6ff]/15 border border-[#53a6ff]/30">
                <span className="text-xl font-black text-[#53a6ff]">#{userRank + 1}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Your Position · {activeMode === 'daily' ? 'Daily' : 'Classic'}</p>
                <p className="mt-0.5 text-xl font-bold text-white">
                  {activeLeaderboard[userRank]?.score ?? 0} <span className="text-sm font-normal text-slate-400">points</span>
                </p>
              </div>
            </div>
            <div className="rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/15 px-3 py-1.5 text-sm font-semibold text-[#9fd0ff]">
              {storedWallet.nickname}
            </div>
          </div>
        ) : storedWallet ? (
          <div className="flex flex-col items-center gap-3 py-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Your Position · {activeMode === 'daily' ? 'Daily' : 'Classic'}</p>
              <p className="mt-1 text-base font-semibold text-slate-400">Not ranked yet</p>
            </div>
            <a
              href={`/play?mode=${activeMode}`}
              className="rounded-xl border border-[#f0cf52]/30 bg-[#f0cf52]/10 px-4 py-2 text-sm font-semibold text-[#f6df84] transition hover:bg-[#f0cf52]/15"
            >
              Start Playing
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Your Position · {activeMode === 'daily' ? 'Daily' : 'Classic'}</p>
              <p className="mt-1 text-base font-semibold text-slate-400">Sign in to compete</p>
            </div>
            <a
              href="/auth"
              className="rounded-xl border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-4 py-2 text-sm font-semibold text-[#9fd0ff] transition hover:bg-[#53a6ff]/15"
            >
              Create Wallet
            </a>
          </div>
        )}
      </motion.div>

      {/* Leaderboard Table */}
      <section className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {activeMode === 'daily' ? 'Daily Leaders' : 'Classic Leaders'}
              </p>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">Live</span>
              </div>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {activeMode === 'daily'
                ? "Top submitted daily scores for today's board."
                : 'Highest verified classic runs so far.'}
            </p>
          </div>
          <p className="text-xs text-slate-500">{activeLeaderboard.length} {activeLeaderboard.length === 1 ? 'entry' : 'entries'}</p>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-slate-950/30 px-3 py-6 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300"></div>
            <p className="mt-2 text-xs text-slate-400">Loading leaderboard...</p>
          </div>
        ) : activeLeaderboard.length > 0 ? (
          <div className="mt-3 space-y-1.5">
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
          <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-slate-950/30 px-4 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">
              {activeMode === 'daily' ? 'No scores yet today' : 'No classic scores yet'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {activeMode === 'daily'
                ? 'Be the first to submit a score for today\'s board!'
                : 'Start a classic run and set the first record!'}
            </p>
            <a
              href="/play"
              className="mt-4 inline-block rounded-xl border border-[#f0cf52]/30 bg-[#f0cf52]/10 px-4 py-2 text-sm font-semibold text-[#f6df84] transition hover:bg-[#f0cf52]/15"
            >
              Play Now
            </a>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">About Daily</p>
          <h3 className="mt-1 text-base font-bold text-white">Daily Challenge</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Compete once per UTC day on a shared board. Entry fees build the prize pool, and top
            players claim rewards at day's end. Rankings reset daily at midnight UTC.
          </p>
        </div>

        <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">About Classic</p>
          <h3 className="mt-1 text-base font-bold text-white">Classic Mode</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
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
      whileHover={{ x: 2, scale: 1.002 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-lg border px-3 py-2 ${
        isCurrentUser
          ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
          : rank <= 3
            ? 'border-[#f6df84]/20 bg-[#f6df84]/5'
            : 'border-white/10 bg-slate-950/50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="flex w-10 shrink-0 items-center justify-center">
          <span className={`text-base font-black ${getRankColor(rank)}`}>
            {getRankIcon(rank)}
          </span>
        </div>

        {/* Player Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {shortAddress(entry.address)}
            </p>
            {isCurrentUser ? (
              <span className="shrink-0 rounded-full bg-[#53a6ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                You
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {entry.moveCount} moves · Tile {entry.maxTile}
          </p>
        </div>

        {/* Score & Date */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-black leading-none text-white">{entry.score.toLocaleString()}</p>
          {showDate ? (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
              {entry.utcDate}
            </p>
          ) : (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
              Points
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function PoolStat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2"
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
