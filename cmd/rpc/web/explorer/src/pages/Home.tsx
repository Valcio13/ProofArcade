import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import type { LeaderboardEntry } from '../lib/mockChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'
import { ArrowRight, Zap, Trophy, Target, Shield, Clock, Award } from 'lucide-react'

const MotionLink = motion(Link)

const HomePage = () => {
  const storedWallet = loadStoredWalletAuth()
  const hasLocalSession = !!storedWallet?.address
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([])
  const [playerStats, setPlayerStats] = useState<any>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      const client = await createGame2048Client()
      const leaderboards = await client.getLeaderboards()
      if (!cancelled) {
        // Combine both leaderboards and take top 3 by score
        const combined = [...leaderboards.daily, ...leaderboards.classic]
        const sorted = combined.sort((a, b) => b.score - a.score)
        setTopPlayers(sorted.slice(0, 3))
      }

      // Load player stats if authenticated
      if (hasLocalSession && storedWallet?.address) {
        try {
          const stats = await client.getPlayer(storedWallet.address)
          if (!cancelled) {
            setPlayerStats(stats)
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
      className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8"
    >
      {hasLocalSession ? (
        /* AUTHENTICATED USER VIEW */
        <>
          {/* HERO - Welcome Back */}
          <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(240,207,82,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(83,166,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(201,95,56,0.2),_transparent_24%),linear-gradient(145deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-8 shadow-[0_25px_90px_rgba(0,0,0,0.32)] sm:p-12 xl:p-16">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_100%)]" />
            
            <div className="relative">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs uppercase tracking-[0.32em] text-[#f6df84]"
              >
                Welcome Back
              </motion.p>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 font-['Georgia'] text-5xl leading-tight text-white sm:text-6xl xl:text-7xl"
              >
                {storedWallet?.nickname || 'Player'}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-lg leading-8 text-slate-300"
              >
                Ready to play? Start a daily challenge or continue your classic run.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <MotionLink
                  to="/play?mode=daily"
                  className="flex items-center gap-3 rounded-2xl bg-[#f0cf52] px-8 py-4 text-base font-bold text-[#2e2510] shadow-[0_20px_60px_rgba(240,207,82,0.35)] transition hover:brightness-105 sm:text-lg"
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Clock className="h-5 w-5" />
                  Daily Challenge
                </MotionLink>
                
                <MotionLink
                  to="/play?mode=classic"
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-white/10 sm:text-lg"
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Award className="h-5 w-5" />
                  Classic Mode
                </MotionLink>
              </motion.div>
            </div>
          </section>

          {/* PLAYER STATS */}
          {playerStats && (
            <section>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Your Stats</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Performance</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Best Score"
                  value={Math.max(playerStats.bestDailyScore || 0, playerStats.bestClassicScore || 0).toString()}
                  icon={<Trophy className="h-6 w-6" />}
                />
                <StatCard
                  label="Best Tile"
                  value={playerStats.bestTile?.toString() || '0'}
                  icon={<Target className="h-6 w-6" />}
                />
                <StatCard
                  label="Games Played"
                  value={(playerStats.dailyGamesStarted + playerStats.classicGamesStarted).toString()}
                  icon={<Zap className="h-6 w-6" />}
                />
                <StatCard
                  label="Login Streak"
                  value={playerStats.loginStreak?.toString() || '0'}
                  icon={<Award className="h-6 w-6" />}
                />
              </div>
            </section>
          )}

          {/* QUICK ACTIONS */}
          <section>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick Access</p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Actions</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickActionCard
                to="/play?mode=daily"
                icon={<Clock className="h-8 w-8" />}
                title="Daily Challenge"
                description="Compete for rewards"
              />
              <QuickActionCard
                to="/play?mode=classic"
                icon={<Award className="h-8 w-8" />}
                title="Classic Mode"
                description="Unlimited progression"
              />
              <QuickActionCard
                to="/leaderboard"
                icon={<Trophy className="h-8 w-8" />}
                title="Leaderboard"
                description="See your rank"
              />
              <QuickActionCard
                to="/profile"
                icon={<Shield className="h-8 w-8" />}
                title="Profile"
                description="View achievements"
              />
            </div>
          </section>

          {/* LEADERBOARD PREVIEW */}
          <section>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Top Players</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Current Champions</h2>
              </div>
              <Link 
                to="/leaderboard"
                className="flex items-center gap-2 text-sm font-semibold text-[#f6df84] transition hover:text-[#f0cf52]"
              >
                View Full Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {topPlayers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {topPlayers.map((player, index) => (
                  <TopPlayerCard
                    key={player.gameId}
                    rank={index + 1}
                    address={player.address}
                    score={player.score}
                    maxTile={player.maxTile}
                    moveCount={player.moveCount}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/30 px-8 py-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-4 text-slate-400">No players yet. Be the first to compete!</p>
              </div>
            )}
          </section>
        </>
      ) : (
        /* UNAUTHENTICATED USER VIEW - Original Onboarding */
        <>
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(240,207,82,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(83,166,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(201,95,56,0.2),_transparent_24%),linear-gradient(145deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-8 shadow-[0_25px_90px_rgba(0,0,0,0.32)] sm:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_100%)]" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs uppercase tracking-[0.32em] text-[#f6df84]"
          >
            ProofArcade 2048
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 font-['Georgia'] text-5xl leading-tight text-white sm:text-6xl xl:text-7xl"
          >
            Play 2048. Prove your score onchain.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl"
          >
            Start for free with no wallet required. Create a wallet later when you're ready to compete for rewards and leaderboard rankings.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <MotionLink
              to="/playtest"
              className="group flex items-center gap-3 rounded-2xl bg-[#f0cf52] px-8 py-4 text-base font-bold text-[#2e2510] shadow-[0_20px_60px_rgba(240,207,82,0.35)] transition hover:brightness-105 sm:text-lg"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="h-5 w-5" />
              Play Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </MotionLink>
            
            <MotionLink
              to="/leaderboard"
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-white/10 sm:text-lg"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="h-5 w-5" />
              View Leaderboard
            </MotionLink>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 - HOW IT WORKS */}
      <section>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">How It Works</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Three Simple Steps</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <StepCard
            icon={<Zap className="h-8 w-8" />}
            step="1"
            title="Play Free"
            description="Try 2048 instantly with no wallet, no fees, and no commitment."
          />
          <StepCard
            icon={<Shield className="h-8 w-8" />}
            step="2"
            title="Create a Wallet"
            description="Save progress, track achievements, and join competitive runs."
          />
          <StepCard
            icon={<Trophy className="h-8 w-8" />}
            step="3"
            title="Compete"
            description="Enter daily challenges, climb the leaderboard, and earn rewards."
          />
        </div>
      </section>

      {/* SECTION 3 - GAME MODES */}
      <section>
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Game Modes</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Choose Your Path</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <GameModeCard
            icon={<Target className="h-10 w-10" />}
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
            icon={<Clock className="h-10 w-10" />}
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
            icon={<Award className="h-10 w-10" />}
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

      {/* SECTION 4 - WHY WALLETS EXIST */}
      <section className="rounded-[2rem] border border-[#53a6ff]/20 bg-[linear-gradient(135deg,_rgba(25,40,60,0.5),_rgba(15,20,30,0.8))] p-8 sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto h-12 w-12 text-[#53a6ff]" />
          <h2 className="mt-6 text-3xl font-bold text-white">Why use a wallet?</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Create a wallet when you're ready to compete for rewards, track your progress, and appear on the leaderboard.
          </p>
          
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            <WalletBenefit 
              title="Saves your progress"
              description="Keep your game history and achievements"
            />
            <WalletBenefit 
              title="Tracks leaderboard history"
              description="See how you rank against other players"
            />
            <WalletBenefit 
              title="Enables rewards"
              description="Compete for prizes and earn tokens"
            />
          </div>

          <motion.p 
            whileHover={{ scale: 1.01 }}
            className="mt-8 rounded-xl border border-amber-500/20 bg-amber-950/20 px-6 py-4 text-sm leading-6 text-slate-300"
          >
            ⚠️ Wallets are stored locally on your device. Export a backup after creating one. If you lose both your password and backup, your wallet cannot be recovered.
          </motion.p>

          {!hasLocalSession && (
            <MotionLink
              to="/auth"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border-2 border-[#53a6ff]/40 bg-[#53a6ff]/15 px-8 py-4 text-base font-semibold text-[#9fd0ff] shadow-[0_10px_40px_rgba(83,166,255,0.15)] transition hover:border-[#53a6ff]/60 hover:bg-[#53a6ff]/25 hover:text-white hover:shadow-[0_15px_50px_rgba(83,166,255,0.25)]"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Wallet
              <ArrowRight className="h-5 w-5" />
            </MotionLink>
          )}
        </div>
      </section>

      {/* SECTION 5 - LEADERBOARD PREVIEW */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Top Players</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Current Champions</h2>
          </div>
          <Link 
            to="/leaderboard"
            className="flex items-center gap-2 text-sm font-semibold text-[#f6df84] transition hover:text-[#f0cf52]"
          >
            View Full Leaderboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {topPlayers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {topPlayers.map((player, index) => (
              <TopPlayerCard
                key={player.gameId}
                rank={index + 1}
                address={player.address}
                score={player.score}
                maxTile={player.maxTile}
                moveCount={player.moveCount}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/30 px-8 py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-4 text-slate-400">No players yet. Be the first to compete!</p>
          </div>
        )}
      </section>
      </>
      )}
    </motion.div>
  )
}

// Helper Components

function StepCard({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.2)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(20,25,35,0.9),_rgba(12,16,24,0.9))] p-6"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-[#f0cf52]/10 p-3 text-[#f6df84]">
          {icon}
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Step {step}</div>
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </motion.div>
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
    <motion.div
      whileHover={{ y: -6, borderColor: highlighted ? 'rgba(240,207,82,0.4)' : 'rgba(255,255,255,0.2)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className={`rounded-[1.5rem] border p-6 ${
        highlighted
          ? 'border-[#f0cf52]/30 bg-[linear-gradient(135deg,_rgba(45,38,16,0.6),_rgba(20,21,28,0.8))] shadow-[0_10px_40px_rgba(240,207,82,0.15)]'
          : 'border-white/10 bg-[linear-gradient(135deg,_rgba(20,25,35,0.9),_rgba(12,16,24,0.9))]'
      }`}
    >
      <div className={`rounded-xl p-3 inline-block ${
        highlighted ? 'bg-[#f0cf52]/15 text-[#f6df84]' : 'bg-white/5 text-slate-300'
      }`}>
        {icon}
      </div>
      
      <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>
      
      <ul className="mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
            <span className="mt-1 text-[#53a6ff]">•</span>
            {feature}
          </li>
        ))}
      </ul>

      {isDisabled ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-sm text-slate-500">
          Requires wallet
        </div>
      ) : (
        <MotionLink
          to={ctaLink}
          className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
            highlighted
              ? 'bg-[#f0cf52] text-[#2e2510] hover:brightness-105'
              : 'border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {ctaText}
        </MotionLink>
      )}
    </motion.div>
  )
}

function WalletBenefit({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
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
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(20,25,35,0.9),_rgba(12,16,24,0.9))] p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-[#f6df84]">{value}</p>
        </div>
        <div className="rounded-xl bg-[#f0cf52]/10 p-3 text-[#f6df84]">
          {icon}
        </div>
      </div>
    </motion.div>
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
    <MotionLink
      to={to}
      whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.2)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="block rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(20,25,35,0.9),_rgba(12,16,24,0.9))] p-6"
    >
      <div className="rounded-xl bg-[#53a6ff]/10 p-3 inline-block text-[#9fd0ff]">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </MotionLink>
  )
}

function TopPlayerCard({ 
  rank, 
  address, 
  score, 
  maxTile, 
  moveCount 
}: { 
  rank: number; 
  address: string; 
  score: number; 
  maxTile: number;
  moveCount: number;
}) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[rank - 1]

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(240,207,82,0.4)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className={`rounded-[1.5rem] border p-6 ${
        rank === 1
          ? 'border-[#f0cf52]/30 bg-[linear-gradient(135deg,_rgba(45,38,16,0.6),_rgba(20,21,28,0.8))]'
          : 'border-white/10 bg-black/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl">{medal}</div>
          <p className="mt-2 text-sm font-semibold text-white">{shortAddress(address)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#f6df84]">{score}</p>
          <p className="mt-1 text-xs text-slate-500">points</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span>{moveCount} moves</span>
        <span>•</span>
        <span>tile {maxTile}</span>
      </div>
    </motion.div>
  )
}

export default HomePage
