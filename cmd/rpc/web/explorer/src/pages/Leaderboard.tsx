import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trophy } from 'lucide-react'
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

  // Set document title based on active mode
  useEffect(() => {
    document.title = activeMode === 'daily' 
      ? 'Daily Leaderboard | ProofArcade'
      : 'Classic Leaderboard | ProofArcade'
  }, [activeMode])

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
      <section className="rounded-3xl p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
          <div className="flex flex-col justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">ProofArcade 2048</p>
              <h1 className="mt-3 text-4xl font-bold leading-none text-white sm:text-5xl">
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
                    ? 'bg-[#f0cf52] text-[#2e2510]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Daily Challenge
              </button>
              <button
                onClick={() => switchMode('classic')}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  activeMode === 'classic'
                    ? 'bg-[#53a6ff] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All-Time
              </button>
            </div>
            
            {/* Tab Context Description */}
            <p className="text-sm text-slate-400 max-w-2xl">
              {activeMode === 'daily' 
                ? "Today's Daily Challenge rankings. Resets every UTC day."
                : "Best Classic scores of all time. Does not reset."}
            </p>
          </div>

          {/* Aside: Get Started (logged out) or Share (logged in) */}
          {storedWallet ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Share</p>
                  <h2 className="mt-2 text-lg font-bold text-white">Share Leaderboard</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
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

              {userRank !== -1 ? (
                <div className="mt-3 rounded-lg border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#9fd0ff]">Your Rank</p>
                  <p className="mt-1 text-xl font-bold text-white">#{userRank + 1}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {activeLeaderboard[userRank]?.score ?? 0} points
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#53a6ff]/30 bg-[#53a6ff]/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#9fd0ff]">Get Started</p>
              <h2 className="mt-2 text-lg font-bold text-white">Create a wallet to compete</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Save your scores, climb the board, and earn rewards.
              </p>
              <a
                href="/auth"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4ade80] px-3 py-2.5 text-sm font-semibold text-[#0f1a14] transition hover:brightness-105"
              >
                Create Wallet
              </a>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Then claim test PROOF to start playing.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Daily Prize Pool - Only show for daily mode */}
      {activeMode === 'daily' ? (
        <section className="mt-4 rounded-2xl border border-[#f0cf52]/20 bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">Today's Prize Pool</p>
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

      {/* Leaderboard Table */}
      <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {activeMode === 'daily' ? 'Daily Leaders' : 'All-Time Leaders'}
              </p>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">Live</span>
              </div>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {activeMode === 'daily'
                ? "Top submitted daily scores for today's board."
                : 'Highest verified classic runs of all time.'}
            </p>
          </div>
          <p className="text-xs text-slate-500">{activeLeaderboard.length} {activeLeaderboard.length === 1 ? 'entry' : 'entries'}</p>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-black/20 px-3 py-6 text-center">
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
          <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-white">
              {activeMode === 'daily' ? 'No scores yet today' : 'No all-time scores yet'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {activeMode === 'daily'
                ? 'Be the first to submit a score for today\'s board!'
                : 'Start a classic run and set the first all-time record!'}
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
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">About Daily</p>
          <h3 className="mt-1 text-base font-bold text-white">Daily Challenge</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Compete once per UTC day on a shared board. Entry fees build the prize pool, and top
            players claim rewards at day's end. Rankings reset daily at midnight UTC.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">About All-Time</p>
          <h3 className="mt-1 text-base font-bold text-white">All-Time Leaderboard</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Play unlimited runs with random seeds. Earn spendable points for progression and
            compete for the all-time high scores. All-Time leaderboard tracks lifetime best runs and does not reset.
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

  return (
    <div
      className={`rounded-lg border px-3 py-2 transition-colors ${
        isCurrentUser
          ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
          : rank <= 3
            ? 'border-[#f6df84]/20 bg-[#f6df84]/5 hover:border-[#f6df84]/30'
            : 'border-white/10 bg-black/20 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="flex w-10 shrink-0 items-center justify-center">
          <span className={`text-base font-black ${getRankColor(rank)}`}>
            #{rank}
          </span>
        </div>

        {/* Player Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={`/player/${entry.address}`}
              className="truncate text-sm font-semibold text-white transition hover:text-[#53a6ff] hover:underline"
            >
              {entry.username || shortAddress(entry.address)}
            </Link>
            {isCurrentUser ? (
              <span className="shrink-0 rounded-full bg-[#53a6ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                You
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {entry.moveCount} moves · Tile {entry.maxTile}
            {entry.username ? ` · ${shortAddress(entry.address)}` : ''}
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
    </div>
  )
}

function PoolStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
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
