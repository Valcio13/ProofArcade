import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trophy, Copy, Link2, Gamepad2, Award, Target } from 'lucide-react'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import type { LeaderboardEntry, PlayerStats, RecentRun } from '../lib/mockChain2048'

function PublicProfile() {
  const { address } = useParams<{ address: string }>()
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({
    daily: [],
    classic: [],
  })
  const [recentGames, setRecentGames] = useState<RecentRun[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadProfile() {
      try {
        const client = await createGame2048Client()

        // Parallel fetch for performance
        const [playerData, leaderboardData, gameHistory] = await Promise.all([
          client.getPlayer(address),
          client.getLeaderboards(),
          client.getRecentRuns(address),
        ])

        if (cancelled) return

        setPlayer(playerData)
        setLeaderboards(leaderboardData)
        setRecentGames(gameHistory.slice(0, 10)) // Limit to 10 most recent
        setIsLoading(false)

        // Update page title
        const username = playerData.username || shortAddress(address)
        document.title = `${username} - ProofArcade Profile`
      } catch (error) {
        console.error(error)
        toast.error('Unable to load player profile')
        setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [address])

  async function handleCopyAddress() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      toast.success('Address copied')
    } catch (error) {
      console.error(error)
      toast.error('Unable to copy address')
    }
  }

  async function handleShareProfile() {
    if (!address) return
    const profileUrl = `${window.location.origin}/player/${address}`
    try {
      await navigator.clipboard.writeText(profileUrl)
      toast.success('Profile link copied!')
    } catch (error) {
      console.error(error)
      toast.error('Unable to copy profile link')
    }
  }

  if (!address) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-card p-8 text-center">
          <p className="text-lg text-slate-400">Invalid profile address</p>
        </div>
      </div>
    )
  }

  const displayUsername = player?.username || shortAddress(address)
  const bestScore = Math.max(player?.bestDailyScore ?? 0, player?.bestClassicScore ?? 0)
  const bestScoreMode =
    player?.bestDailyScore && player.bestDailyScore >= (player?.bestClassicScore ?? 0) ? 'Daily' : 'Classic'

  // Calculate all-time rank
  const allTimeRank = leaderboards.classic.findIndex((entry) => entry.address === address)
  const allTimeRankDisplay = allTimeRank >= 0 ? `#${allTimeRank + 1}` : 'Unranked'
  const totalPlayers = leaderboards.classic.length

  // Format percentile
  let percentileBadge = ''
  if (allTimeRank >= 0) {
    const percentile = Math.ceil(((allTimeRank + 1) / totalPlayers) * 100)
    if (percentile <= 1) percentileBadge = 'Top 1% Player'
    else if (percentile <= 5) percentileBadge = 'Top 5% Player'
    else if (percentile <= 10) percentileBadge = 'Top 10 Player'
    else if (percentile <= 25) percentileBadge = 'Top 25% Player'
  }

  // Format join date
  const joinDateDisplay = player?.username
    ? 'Member since: June 2026' // TODO: Use player.registeredAtUnix when available from PlayerIdentity
    : 'Member'

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
          <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
            <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-12 w-64 animate-pulse rounded bg-white/10" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          </section>
          <div className="mt-6 space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </>
      ) : (
        <>
          {/* Profile Header */}
          <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#53a6ff]">Public Profile</p>
              <h1 className="mt-2 font-bold text-5xl leading-tight text-white">{displayUsername}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-300"
                >
                  <span className="font-mono">{shortAddress(address)}</span>
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={handleShareProfile}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-300"
                >
                  <Link2 className="h-3 w-3" />
                  <span>Share Profile</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">{joinDateDisplay}</p>
            </div>

            {/* Stats Grid - 6 Key Achievement Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Best Score */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#f6df84]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Best Score</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{bestScore.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-500">{bestScoreMode} Challenge</p>
              </div>

              {/* Highest Tile */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#53a6ff]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Highest Tile</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{player?.bestTile ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Max achieved</p>
              </div>

              {/* Total Games */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-[#7e69ff]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Games</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{player?.gamesCompleted ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Completed</p>
              </div>

              {/* Daily Challenges */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#f6df84]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Daily Challenges</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{player?.dailyGamesStarted ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Completed</p>
              </div>

              {/* All-Time Rank */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#53d7a6]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">All-Time Rank</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{allTimeRankDisplay}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {allTimeRank >= 0 ? (
                    'Classic leaderboard'
                  ) : (
                    <Link to="/play" className="text-[#53a6ff] transition hover:text-[#7eb8ff]">
                      Play to rank
                    </Link>
                  )}
                </p>
              </div>

              {/* Login Streak */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#f6df84]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Check-In Streak</p>
                </div>
                <p className="mt-3 text-4xl font-bold text-white">{player?.loginStreak ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Consecutive days</p>
              </div>
            </div>
          </section>

          {/* Recent Games - Elevated Priority */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="mb-5 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-[#53a6ff]" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Recent Games</h2>
            </div>

            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game) => {
                  const isPersonalBest =
                    (game.mode === 'daily' && game.score === player?.bestDailyScore) ||
                    (game.mode === 'classic' && game.score === player?.bestClassicScore)

                  // Check if this game appears in today's daily leaderboard
                  const dailyEntry =
                    game.mode === 'daily'
                      ? leaderboards.daily.find((entry) => entry.gameId === game.gameId)
                      : null
                  const dailyRank = dailyEntry
                    ? leaderboards.daily.findIndex((entry) => entry.gameId === game.gameId) + 1
                    : null

                  return (
                    <div
                      key={game.gameId}
                      className="rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-white/20"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {game.mode === 'daily' ? '🏆 Daily Challenge' : '🎮 Classic Mode'}
                            </p>
                            <span className="text-xs text-slate-500">•</span>
                            <p className="text-xs text-slate-400">{game.utcDate}</p>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            Score: {game.score.toLocaleString()} • Tile: {game.maxTile} • {game.moveCount} moves
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {dailyRank && (
                              <span className="rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-2.5 py-1 text-xs font-semibold text-[#53a6ff]">
                                Rank #{dailyRank}
                              </span>
                            )}
                            {isPersonalBest && (
                              <span className="rounded-full border border-[#f6df84]/30 bg-[#f6df84]/10 px-2.5 py-1 text-xs font-semibold text-[#f6df84]">
                                Personal Best
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-950/50 px-6 py-12 text-center">
                <Gamepad2 className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-slate-400">No games played yet</p>
                <p className="mt-1 text-xs text-slate-500">This player hasn't completed any games. Check back soon!</p>
              </div>
            )}
          </section>

          {/* All-Time Standing Card - Supplementary */}
          {allTimeRank >= 0 ? (
            <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="mx-auto max-w-md text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-[#f6df84]" />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">All-Time Classic Standing</h2>
                </div>
                <div className="mt-4">
                  <p className="text-5xl font-bold text-white">#{allTimeRank + 1}</p>
                  {percentileBadge && <p className="mt-2 text-sm font-semibold text-[#f6df84]">{percentileBadge}</p>}
                </div>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2">
                    <span className="text-xs text-slate-400">Best Score</span>
                    <span className="text-sm font-bold text-white">{player?.bestClassicScore.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2">
                    <span className="text-xs text-slate-400">Highest Tile</span>
                    <span className="text-sm font-bold text-white">{player?.bestTile}</span>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="mx-auto max-w-md text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-slate-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">All-Time Classic Standing</h2>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-500">Not Yet Ranked</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Play Classic Mode to appear on the all-time leaderboard
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </motion.div>
  )
}

export default PublicProfile
