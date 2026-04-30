import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import { getUtcDateString } from '../lib/game2048'
import type { DailyPrizePool, LeaderboardEntry } from '../lib/mockChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

const MotionLink = motion(Link)

const HomePage = () => {
  const storedWallet = loadStoredWalletAuth()
  const hasLocalSession = !!storedWallet?.address
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({
    daily: [],
    classic: [],
  })
  const [dailyPool, setDailyPool] = useState<DailyPrizePool | null>(null)
  const [countdown, setCountdown] = useState(() => formatUtcCountdown())
  const [isRequestingFaucet, setIsRequestingFaucet] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadLeaderboards() {
      const client = await createGame2048Client()
      const [nextLeaderboards, nextDailyPool] = await Promise.all([
        client.getLeaderboards(),
        client.getDailyPrizePool(getUtcDateString()),
      ])
      if (!cancelled) {
        setLeaderboards(nextLeaderboards)
        setDailyPool(nextDailyPool)
      }
    }

    loadLeaderboards().catch((error) => {
      console.error(error)
    })

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

  async function handleRequestFaucet() {
    if (!storedWallet?.address || isRequestingFaucet) return
    setIsRequestingFaucet(true)
    try {
      const client = await createGame2048Client()
      const result = await client.addFunds(storedWallet.address)
      if (result.txHash) {
        toast.success(`Faucet sent. Tx ${result.txHash.slice(0, 12)}...`)
      } else {
        toast.success('Faucet funds added.')
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Faucet request failed.')
    } finally {
      setIsRequestingFaucet(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-8 sm:px-6 xl:px-8"
    >
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(240,207,82,0.18),_transparent_28%),radial-gradient(circle_at_80%_16%,_rgba(83,166,255,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(201,95,56,0.2),_transparent_24%),linear-gradient(145deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)] sm:p-8 xl:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_100%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-stretch">
          <div className="flex flex-col justify-between gap-8">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#f6df84]">ProofArcade 2048</p>
              <h1 className="mt-4 font-['Georgia'] text-5xl leading-none text-white sm:text-6xl xl:text-7xl">
                Play 2048. Prove your score onchain.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                Train for free, enter paid daily or classic runs when you are ready, and let the chain verify what you actually achieved.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Daily Challenge"
                value="Compete once per UTC day"
                detail="Pay in, land on the leaderboard, and claim from the shared reward pool."
              />
              <InfoCard
                label="Classic + Training"
                value="Play free or grind points"
                detail="Start with Playtest at no cost, then switch to classic when you want spendable progression."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                title="Wallet-Owned Progress"
                detail="Create or import a wallet when you are ready, then carry your points, rewards, and history with you."
              />
              <InfoCard
                title="Playtest for new user"
                detail="No wallet, no chain, no fee. Use it to learn the board before moving into classic or daily runs."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {hasLocalSession ? (
                <>
                  <MotionLink
                    to="/play"
                    className="rounded-2xl bg-[#f0cf52] px-6 py-3 text-sm font-bold text-[#2e2510] transition hover:brightness-105"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Playing
                  </MotionLink>
                  <motion.button
                    type="button"
                    onClick={() => {
                      void handleRequestFaucet()
                    }}
                    disabled={isRequestingFaucet}
                    className="rounded-2xl border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-5 py-3 text-sm font-semibold text-[#9fd0ff] transition hover:bg-[#53a6ff]/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isRequestingFaucet ? 'Requesting...' : 'Get Faucet'}
                  </motion.button>
                </>
              ) : (
                <>
                  <MotionLink
                    to="/playtest"
                    className="rounded-2xl border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-5 py-3 text-sm font-semibold text-[#9fd0ff] transition hover:bg-[#53a6ff]/20 hover:text-white"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Playtest Now
                  </MotionLink>
                </>
              )}
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className="rounded-[1.9rem] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Game Preview</p>
                <h2 className="mt-3 text-2xl font-bold text-white">The product is the board.</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Game-first
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3 rounded-[1.5rem] border border-white/10 bg-[#171d28] p-4">
              {[0, 2, 4, 8, 16, 32, 64, 128, 0, 256, 512, 1024, 0, 0, 2048, 0].map((value, index) => (
                <motion.div
                  key={`${index}-${value}`}
                  initial={{ opacity: 0.78, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.015, type: 'spring', stiffness: 220, damping: 16 }}
                  className={`flex aspect-square items-center justify-center rounded-[1rem] border border-black/10 text-lg font-black sm:text-xl ${
                    value === 0
                      ? 'bg-white/8'
                      : value <= 4
                        ? 'bg-[#f3efe6] text-[#372f24]'
                        : value <= 32
                          ? 'bg-[#d65d3e] text-white'
                          : value <= 256
                            ? 'bg-[#7ebd5d] text-[#173019]'
                            : value <= 1024
                              ? 'bg-[#53a6ff] text-white'
                              : 'bg-[#f0cf52] text-[#43340a]'
                  }`}
                >
                  {value || ''}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2 rounded-[1.8rem] border border-[#f0cf52]/20 bg-[linear-gradient(135deg,_rgba(45,38,16,0.88),_rgba(20,21,28,0.96))] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Daily Challenge Prize Pool</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {dailyPool?.rewardPool ?? 0} PROOF
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                The live pool for today&apos;s UTC board. Each daily entry adds to this reward pot before end-of-day claims.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PoolStat label="UTC Day" value={dailyPool?.utcDate ?? getUtcDateString()} />
              <PoolStat label="Entries" value={`${dailyPool?.entryCount ?? 0}`} />
              <PoolStat label="Gross Fees" value={`${dailyPool?.grossFees ?? 0} PROOF`} />
            </div>
          </div>
          <div className="mt-4 rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Resets In</p>
            <p className="mt-2 text-sm font-semibold text-white">{countdown}</p>
          </div>
        </div>

        <LeaderboardCard
          title="Daily Leaders"
          subtitle="Top submitted daily scores for the current board."
          entries={leaderboards.daily}
          selectedAddress={storedWallet?.address ?? ''}
          emptyText="No daily submissions yet."
        />
        <LeaderboardCard
          title="Classic Leaders"
          subtitle="Highest verified classic runs so far."
          entries={leaderboards.classic}
          selectedAddress={storedWallet?.address ?? ''}
          emptyText="No classic submissions yet."
        />
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(17,22,31,0.96),_rgba(11,15,22,0.96))] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">How It Works</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <JourneyCard step="1" title="Train Or Register" detail="Try the game for free, or create/import a wallet when you want on-chain progress." />
          <JourneyCard step="2" title="Play A Real Run" detail="Start a daily or classic session and let the chain own the session state." />
          <JourneyCard step="3" title="Submit And Verify" detail="The move list is replayed deterministically before rewards, points, and leaderboard changes count." />
        </div>
      </section>
    </motion.div>
  )
}

function InfoCard({
  label,
  title,
  value,
  detail,
}: {
  label?: string
  title?: string
  value?: string
  detail: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.18)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
    >
      {label ? <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p> : null}
      {value ? <p className={`text-lg font-bold text-white ${label ? 'mt-2' : ''}`}>{value}</p> : null}
      {title ? <p className="text-lg font-bold text-white">{title}</p> : null}
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </motion.div>
  )
}

function JourneyCard({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.18)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4"
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f6df84]">Step {step}</p>
      <p className="mt-2 text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </motion.div>
  )
}

function LeaderboardCard({
  title,
  subtitle,
  entries,
  selectedAddress,
  emptyText,
}: {
  title: string
  subtitle: string
  entries: LeaderboardEntry[]
  selectedAddress: string
  emptyText: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      <div className="mt-4 space-y-3">
        {entries.slice(0, 5).length > 0 ? (
          entries.slice(0, 5).map((entry, index) => (
            <motion.div
              key={`${title}-${entry.gameId}`}
              whileHover={{ x: 3, borderColor: entry.address === selectedAddress ? 'rgba(83,166,255,0.45)' : 'rgba(255,255,255,0.18)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`rounded-[1rem] border px-4 py-3 ${
                entry.address === selectedAddress ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10' : 'border-white/10 bg-slate-950/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">#{index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{shortAddress(entry.address)}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.moveCount} moves • tile {entry.maxTile}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#f6df84]">{entry.score}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{entry.utcDate}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[1rem] border border-dashed border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-400">
            {emptyText}
          </div>
        )}
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
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)} until next UTC day`
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

export default HomePage
