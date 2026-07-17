import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import { getUtcDateString } from '../lib/game2048'
import type { LeaderboardEntry } from '../lib/mockChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'
import { ArrowRight, Zap, Trophy, Target, Clock, Award } from 'lucide-react'
import { DailyFaucet } from '../components/DailyFaucet'

function rankColor(rank: number): string {
  if (rank === 1) return '#f0cf52'
  if (rank === 2) return '#c0c0c0'
  if (rank === 3) return '#cd7f32'
  return '#94a3b8'
}

const HomePage = () => {
  useEffect(() => {
    document.title = 'ProofArcade | Play 2048 On-Chain'
  }, [])

  const storedWallet = loadStoredWalletAuth()
  const hasLocalSession = !!storedWallet?.address
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([])
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [unclaimedRewardsCount, setUnclaimedRewardsCount] = useState<number>(0)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      const client = await createGame2048Client()
      const leaderboards = await client.getLeaderboards()
      if (!cancelled) {
        // Show only Daily Challenge leaders (top 3)
        setTopPlayers(leaderboards.daily.slice(0, 3))
      }

      // Load player stats if authenticated
      if (hasLocalSession && storedWallet?.address) {
        try {
          const [stats, rewards] = await Promise.all([
            client.getPlayer(storedWallet.address),
            client.getClaimableRewards(storedWallet.address)
          ])
          if (!cancelled) {
            setPlayerStats(stats)
            setUnclaimedRewardsCount(rewards.unclaimedCount)
          }
        } catch (error) {
          console.error('Failed to load player stats:', error)
        }
      }
    }

    loadData().catch((error) => {
      console.error(error)
    })

    return () => {
      cancelled = true
    }
  }, [hasLocalSession, storedWallet?.address])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8"
    >
      {hasLocalSession ? (
        /* AUTHENTICATED USER VIEW */
        <>
          {/* DAILY FAUCET - Prominent Top Position */}
          <AnimatePresence mode="wait">
            <DailyFaucet />
          </AnimatePresence>

          {/* HERO - Welcome Back */}
          <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">
                Welcome Back
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {storedWallet?.nickname || 'Player'}
                </h1>
                {!storedWallet?.nickname && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 rounded-full border border-[#f0cf52]/30 bg-[#f0cf52]/10 px-3 py-1 text-xs font-semibold text-[#f6df84] transition hover:bg-[#f0cf52]/20"
                  >
                    <span>Set Username</span>
                    <span className="text-[10px]">→</span>
                  </Link>
                )}
                {unclaimedRewardsCount > 0 && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 rounded-full border border-[#4ade80]/30 bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold text-[#4ade80] transition hover:bg-[#4ade80]/20"
                  >
                    <span>{unclaimedRewardsCount} Reward{unclaimedRewardsCount > 1 ? 's' : ''} to Claim</span>
                    <span className="text-[10px]">→</span>
                  </Link>
                )}
              </div>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Ready to play? Start a daily challenge or continue your classic run.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/play?mode=daily"
                  className="flex items-center gap-2 rounded-xl bg-[#f0cf52] px-6 py-3 text-sm font-bold text-[#2e2510] transition hover:brightness-105 sm:text-base"
                >
                  <Clock className="h-4 w-4" />
                  Daily Challenge
                </Link>

                <Link
                  to="/weekly-blitz"
                  className="flex items-center gap-2 rounded-xl border border-[#f0cf52]/30 bg-gradient-to-br from-[#f0cf52]/20 to-[#f0cf52]/5 px-6 py-3 text-sm font-semibold text-[#f6df84] transition hover:from-[#f0cf52]/30 hover:to-[#f0cf52]/10 sm:text-base"
                >
                  <Zap className="h-4 w-4" />
                  Weekly Blitz
                </Link>

                <Link
                  to="/play?mode=classic"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:text-base"
                >
                  <Award className="h-4 w-4" />
                  Classic Mode
                </Link>
              </div>
            </div>
          </section>

          {/* PLAYER STATS */}
          {playerStats && (
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Your Stats</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Performance</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Best Score"
                  value={Math.max(playerStats.bestDailyScore || 0, playerStats.bestClassicScore || 0).toString()}
                  icon={<Trophy className="h-5 w-5" />}
                />
                <StatCard
                  label="Best Tile"
                  value={playerStats.bestTile?.toString() || '0'}
                  icon={<Target className="h-5 w-5" />}
                />
                <StatCard
                  label="Games Played"
                  value={(playerStats.dailyGamesStarted + playerStats.classicGamesStarted).toString()}
                  icon={<Zap className="h-5 w-5" />}
                />
                <StatCard
                  label="Login Streak"
                  value={playerStats.loginStreak?.toString() || '0'}
                  icon={<Award className="h-5 w-5" />}
                />
              </div>

              {/* Daily Cap Progress - Larger Card Below Stats */}
              <DailyCapProgressCard playerStats={playerStats} />
            </section>
          )}

          {/* QUICK ACTIONS */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quick Access</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Actions</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickActionCard
                to="/play?mode=daily"
                icon={<Clock className="h-6 w-6" />}
                title="Daily Challenge"
                description="Compete for rewards"
              />
              <QuickActionCard
                to="/weekly-blitz"
                icon={<Zap className="h-6 w-6" />}
                title="Weekly Blitz"
                description="5-minute sprint mode"
              />
              <QuickActionCard
                to="/play?mode=classic"
                icon={<Award className="h-6 w-6" />}
                title="Classic Mode"
                description="Unlimited progression"
              />
              <QuickActionCard
                to="/leaderboard"
                icon={<Trophy className="h-6 w-6" />}
                title="Leaderboard"
                description="See your rank"
              />
            </div>
          </section>

          {/* LEADERBOARD PREVIEW */}
          <LeaderboardPreview topPlayers={topPlayers} />
        </>
      ) : (
        /* UNAUTHENTICATED USER VIEW - Onboarding */
        <>
          {/* SECTION 1 - HERO */}
          <section className="rounded-3xl p-6 sm:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">
                ProofArcade 2048
              </p>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Play 2048. Prove your score onchain.
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-300">
                Start for free with no wallet required. Create a wallet when you're ready to compete for rewards and leaderboard rankings.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/playtest"
                  className="group flex items-center gap-2 rounded-xl bg-[#f0cf52] px-6 py-3 text-sm font-bold text-[#2e2510] transition hover:brightness-105 sm:text-base"
                >
                  <Zap className="h-4 w-4" />
                  Play Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/auth"
                  className="flex items-center gap-2 rounded-xl bg-[#4ade80] px-6 py-3 text-sm font-bold text-[#0f1a14] transition hover:brightness-105 sm:text-base"
                >
                  Create Wallet
                </Link>
              </div>
            </div>
          </section>

          {/* SECTION 2 - HOW IT WORKS */}
          <section>
            <div className="mb-5 text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Three Simple Steps</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StepCard
                step="1"
                title="Play Free"
                description="Try 2048 instantly with no wallet, no fees, and no commitment."
              />
              <StepCard
                step="2"
                title="Create a Wallet"
                description="Save your progress and achievements, and unlock competitive runs and rewards. Stored locally — export a backup after creating one."
              />
              <StepCard
                step="3"
                title="Compete"
                description="Enter daily challenges, track your leaderboard ranking, and earn rewards."
              />
            </div>
          </section>

          {/* SECTION 3 - GAME MODES */}
          <section>
            <div className="mb-5 text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Choose Your Path</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4 md:auto-rows-fr items-stretch">
              <GameModeCard
                icon={<Target className="h-8 w-8" />}
                title="Playtest"
                features={[
                  'No wallet required',
                  'Practice locally',
                  'Learn the game',
                ]}
                ctaText="Try Now"
                ctaLink="/playtest"
                highlighted={!hasLocalSession}
              />
              <GameModeCard
                icon={<Clock className="h-8 w-8" />}
                title="Daily Challenge"
                features={[
                  'One competitive run per day',
                  'Shared reward pool',
                  'Daily leaderboard',
                ]}
                ctaText="Play Daily"
                ctaLink="/play"
                requiresWallet
              />
              <GameModeCard
                icon={<Zap className="h-8 w-8" />}
                title="Weekly Blitz"
                features={[
                  '5-minute sprint mode',
                  'Weekly cumulative scoring',
                  '2 runs + 3 retries per day',
                ]}
                ctaText="Weekly Blitz"
                ctaLink="/weekly-blitz"
                requiresWallet
              />
              <GameModeCard
                icon={<Award className="h-8 w-8" />}
                title="Classic Mode"
                features={[
                  'Unlimited progression',
                  'Persistent stats',
                  'Long-term play',
                ]}
                ctaText="Play Classic"
                ctaLink="/play"
                requiresWallet
              />
            </div>
          </section>

          {/* SECTION 4 - LEADERBOARD PREVIEW */}
          <LeaderboardPreview topPlayers={topPlayers} />
        </>
      )}
    </motion.div>
  )
}

// Helper Components

function LeaderboardPreview({ topPlayers }: { topPlayers: LeaderboardEntry[] }) {
  // Calculate time until next UTC day
  const getTimeUntilReset = () => {
    const now = new Date()
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes }
  }
  
  const { hours, minutes } = getTimeUntilReset()
  
  return (
    <section>
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Daily Challenge Leaders</h2>
          <span className="rounded-full border border-[#f0cf52]/30 bg-[#f0cf52]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f6df84]">
            Today
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">
          Top scores for today's challenge • Resets in {hours}h {minutes}m
        </p>
      </div>
      
      <div className="mb-4 flex items-end justify-between">
        <Link
          to="/leaderboard"
          className="flex items-center gap-2 text-sm font-semibold text-[#f6df84] transition hover:text-[#f0cf52]"
        >
          View Full Leaderboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {topPlayers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {topPlayers.map((player, index) => (
            <TopPlayerCard
              key={player.gameId}
              rank={index + 1}
              address={player.address}
              username={player.username}
              score={player.score}
              maxTile={player.maxTile}
              moveCount={player.moveCount}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-slate-400">No players yet. Be the first to compete!</p>
        </div>
      )}
    </section>
  )
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V']

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl font-bold leading-none text-[#f0cf52] opacity-60">
          {ROMAN[parseInt(step) - 1]}
        </span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}

function GameModeCard({
  icon,
  title,
  features,
  ctaText,
  ctaLink,
  requiresWallet = false,
  highlighted = false
}: {
  icon: React.ReactNode;
  title: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  requiresWallet?: boolean;
  highlighted?: boolean;
}) {
  const storedWallet = loadStoredWalletAuth()
  const hasWallet = !!storedWallet?.address
  const isDisabled = requiresWallet && !hasWallet

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border bg-card p-4 transition-colors ${
        highlighted
          ? 'border-[#f0cf52]/30 hover:border-[#f0cf52]/50'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Card Content - Grows to fill space */}
      <div className="flex-1">
        <div className={`rounded-xl p-2.5 inline-block ${
          highlighted ? 'bg-[#f0cf52]/15 text-[#f6df84]' : 'bg-white/5 text-slate-300'
        }`}>
          {icon}
        </div>

        <h3 className="mt-3 text-xl font-bold text-white">{title}</h3>

        <ul className="mt-3 space-y-1.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="mt-1 text-[#53a6ff]">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA - Pinned to bottom */}
      <div className="mt-4">
        {isDisabled ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center text-sm text-slate-500">
            Requires wallet
          </div>
        ) : (
          <Link
            to={ctaLink}
            className={`block rounded-xl px-3 py-2 text-center text-sm font-semibold transition ${
              highlighted
                ? 'bg-[#f0cf52] text-[#2e2510] hover:brightness-105'
                : 'border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-[#f6df84]">{value}</p>
        </div>
        <div className="rounded-xl bg-[#f0cf52]/10 p-2.5 text-[#f6df84]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
    >
      <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 inline-block text-[#9fd0ff]">
        {icon}
      </div>
      <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-400">{description}</p>
    </Link>
  )
}

function TopPlayerCard({
  rank,
  address,
  username,
  score,
  maxTile,
  moveCount
}: {
  rank: number;
  address: string;
  username?: string;
  score: number;
  maxTile: number;
  moveCount: number;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-4 transition-colors ${
        rank === 1
          ? 'border-[#f0cf52]/30 hover:border-[#f0cf52]/50'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-black" style={{ color: rankColor(rank) }}>#{rank}</div>
          <Link
            to={`/player/${address}`}
            className="mt-1.5 inline-block text-sm font-semibold text-white transition hover:text-[#53a6ff] hover:underline"
          >
            {username || shortAddress(address)}
          </Link>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-[#f6df84]">{score}</p>
          <p className="mt-0.5 text-xs text-slate-500">points</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span>{moveCount} moves</span>
        <span>•</span>
        <span>tile {maxTile}</span>
      </div>
    </div>
  )
}

function DailyCapProgressCard({ playerStats }: { playerStats: any }) {
  const dailyCap = 2000
  const utcDate = getUtcDateString()
  const hasDaySevenBonus = playerStats.classicPointsBonusUtcDate === utcDate
  const earnedToday = playerStats.classicPointsEarnedToday ?? 0

  return (
    <div
      className={`mt-4 rounded-2xl border p-5 ${
        hasDaySevenBonus
          ? 'border-[#f6df84]/30 bg-[#f6df84]/10'
          : 'border-white/10 bg-card'
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Progress Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className={`rounded-xl p-2.5 ${
              hasDaySevenBonus ? 'bg-[#f6df84]/15 text-[#f6df84]' : 'bg-[#53a6ff]/10 text-[#9fd0ff]'
            }`}>
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                hasDaySevenBonus ? 'text-[#f6df84]' : 'text-slate-400'
              }`}>
                Daily Cap Progress
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{earnedToday}</span>
                <span className="text-lg font-medium text-slate-400">/ {dailyCap}</span>
              </div>
            </div>
          </div>

          <p className={`mt-3 text-sm ${
            hasDaySevenBonus ? 'text-[#f6df84]/80' : 'text-slate-500'
          }`}>
            {hasDaySevenBonus
              ? 'Base Classic Points earned today (bonus adds +20% on top)'
              : 'Classic Points earned today in Classic Mode'}
          </p>

          {/* Progress Bar */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-900/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (earnedToday / dailyCap) * 100)}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className={`h-full ${hasDaySevenBonus ? 'bg-[#f0cf52]' : 'bg-[#53a6ff]'}`}
            />
          </div>

          {hasDaySevenBonus && (
            <p className="mt-2 text-xs text-slate-500">
              With your Day 7 bonus, you can earn up to {Math.floor(dailyCap * 1.2)} points total today
            </p>
          )}
        </div>

        {/* Right: Day 7 Bonus Badge (if active) */}
        {hasDaySevenBonus && (
          <div className="rounded-xl border border-[#f6df84]/30 bg-[#f6df84]/10 px-5 py-3">
            <div className="text-center">
              <Award className="mx-auto h-7 w-7 text-[#f6df84]" />
              <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#f6df84]">
                +20% Bonus Active
              </p>
              <p className="mt-0.5 text-xs text-[#f6df84]/70">Day 7 Reward</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
