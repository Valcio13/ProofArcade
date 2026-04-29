import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import MetricCard from '../components/app/MetricCard'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import { getUtcDateString } from '../lib/game2048'
import type { ClaimableRewardsSummary, DailyPrizePool, LeaderboardEntry, PlayerStats } from '../lib/mockChain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function ProfilePage() {
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({
    daily: [],
    classic: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loginPassword, setLoginPassword] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [dailyPool, setDailyPool] = useState<DailyPrizePool | null>(null)
  const [claimableRewards, setClaimableRewards] = useState<ClaimableRewardsSummary | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      if (cancelled) {
        return
      }

      let nextWallets: RpcKeystoreAccount[] = []
      const storedAuth = loadStoredWalletAuth()
      if (client.status.mode === 'rpc') {
        nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }
        setWallets(nextWallets)
      }

      const initialAddress = storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)
        ? storedAuth.address
        : nextWallets[0]?.address ?? ''
      setSelectedAddress(initialAddress)
      setStoredSessionAddress(storedAuth?.address ?? '')
      setLoginPassword(storedAuth?.address === initialAddress ? storedAuth.password : '')

      const nextLeaderboards = await client.getLeaderboards()
      const nextDailyPool = await client.getDailyPrizePool(getUtcDateString())
      if (cancelled) {
        return
      }
      setLeaderboards(nextLeaderboards)
      setDailyPool(nextDailyPool)

      if (initialAddress) {
        const [nextPlayer, nextRewards] = await Promise.all([
          client.getPlayer(initialAddress),
          client.getClaimableRewards(initialAddress),
        ])
        if (cancelled) {
          return
        }
        setPlayer(nextPlayer)
        setClaimableRewards(nextRewards)
      }

      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load the profile view.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedAddress) {
      setPlayer(null)
      return
    }

    let cancelled = false

    async function refreshSelectedProfile() {
      const client = await createGame2048Client()
      const [nextPlayer, nextLeaderboards, nextRewards, nextDailyPool] = await Promise.all([
        client.getPlayer(selectedAddress),
        client.getLeaderboards(),
        client.getClaimableRewards(selectedAddress),
        client.getDailyPrizePool(getUtcDateString()),
      ])

      if (cancelled) {
        return
      }

      setPlayer(nextPlayer)
      setLeaderboards(nextLeaderboards)
      setClaimableRewards(nextRewards)
      setDailyPool(nextDailyPool)
    }

    refreshSelectedProfile().catch((error) => {
      console.error(error)
      toast.error('Unable to refresh this player profile.')
    })

    return () => {
      cancelled = true
    }
  }, [selectedAddress])

  const selectedWallet = wallets.find((wallet) => wallet.address === selectedAddress) ?? null
  const dailyEntry = useMemo(
    () => leaderboards.daily.find((entry) => entry.address === selectedAddress) ?? null,
    [leaderboards.daily, selectedAddress],
  )
  const classicEntry = useMemo(
    () => leaderboards.classic.find((entry) => entry.address === selectedAddress) ?? null,
    [leaderboards.classic, selectedAddress],
  )

  useEffect(() => {
    const storedAuth = loadStoredWalletAuth()
    if (storedAuth?.address === selectedAddress) {
      setLoginPassword(storedAuth.password)
      setStoredSessionAddress(storedAuth.address)
    } else if (selectedAddress !== storedSessionAddress) {
      setLoginPassword('')
    }
  }, [selectedAddress, storedSessionAddress])

  async function handleClaimReward(utcDate: string) {
    if (!selectedAddress) {
      toast.error('Choose a wallet first.')
      return
    }
    if (!loginPassword) {
      toast.error('Enter the wallet password first.')
      return
    }

    try {
      setIsClaiming(true)
      const client = await createGame2048Client()
      const result = await client.claimDailyReward({
        address: selectedAddress,
        password: loginPassword,
        utcDate,
      })
      const [nextPlayer, nextRewards, nextDailyPool] = await Promise.all([
        client.getPlayer(selectedAddress),
        client.getClaimableRewards(selectedAddress),
        client.getDailyPrizePool(getUtcDateString()),
      ])
      setPlayer(nextPlayer)
      setClaimableRewards(nextRewards)
      setDailyPool(nextDailyPool)
      toast.success(result.txHash ? `Reward claim submitted. ${result.txStage ?? 'submitted'}.` : 'Reward claim submitted.')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to claim daily reward.')
    } finally {
      setIsClaiming(false)
    }
  }

  async function handleCopyAddress() {
    if (!selectedWallet?.address) {
      return
    }
    try {
      await navigator.clipboard.writeText(selectedWallet.address)
      toast.success('Wallet address copied.')
    } catch (error) {
      console.error(error)
      toast.error('Unable to copy the wallet address.')
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Player Profile</p>
            <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">
              {selectedWallet ? selectedWallet.nickname : 'Own your wallet, track your run history.'}
            </h1>
            {selectedWallet ? (
              <button
                onClick={handleCopyAddress}
                className="mt-4 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <span className="font-mono">{selectedWallet.address}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f6df84]">Copy</span>
              </button>
            ) : null}
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              {selectedWallet
                ? `Track how ${selectedWallet.nickname} is performing across points, rewards, leaderboards, and wallet activity on this device.`
                : 'Create or import a wallet, keep it signed in on this device, and track how that account is performing across points, rewards, and leaderboard runs.'}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Snapshot</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label="Daily rank" value={formatPlacement(leaderboards.daily, selectedAddress)} />
              <MetricCard label="Classic rank" value={formatPlacement(leaderboards.classic, selectedAddress)} />
              <MetricCard label="Balance" value={`${player?.balance ?? 0} PROOF`} />
              <MetricCard label="Spendable points" value={`${player?.classicPointsBalance ?? 0}`} />
            </div>
            <Link
              to="/settings"
              className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              Open Settings
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfilePanel
              title="Claimable Rewards"
              description="Daily rewards this wallet can claim. Claim cards use the reward day shown on each card."
              rows={[
                ['Total claimable', `${claimableRewards?.totalClaimable ?? 0} PROOF`],
                ['Unclaimed rewards', `${claimableRewards?.unclaimedCount ?? 0}`],
                ['Reward days', `${claimableRewards?.rewards.length ?? 0}`],
              ]}
            />

            <ProfilePanel
              title="Current UTC Daily Pool"
              description="Live view of today’s reward pot. This is separate from older rewards still waiting to be claimed."
              rows={[
                ['UTC date', dailyPool?.utcDate ?? getUtcDateString()],
                ['Entries', `${dailyPool?.entryCount ?? 0}`],
                ['Gross fees', `${dailyPool?.grossFees ?? 0}`],
                ['Reward pool', `${dailyPool?.rewardPool ?? 0} PROOF`],
              ]}
            />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rewards</p>
            <div className="mt-4 space-y-3">
              {claimableRewards?.rewards.length ? (
                claimableRewards.rewards.map((reward) => (
                  <div
                    key={`${reward.utcDate}-${reward.gameId}`}
                    className="rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {reward.utcDate} • Rank #{reward.rank}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          Score {reward.score} • Tile {reward.maxTile} • {reward.moveCount} moves
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Reward day {reward.utcDate}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#f6df84]">
                          {reward.rewardAmount} PROOF
                        </p>
                      </div>
                      {reward.claimed ? (
                        <div className="rounded-full border border-[#53d7a6]/30 bg-[#53d7a6]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c7ffe9]">
                          Claimed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimReward(reward.utcDate)}
                          disabled={isClaiming || !storedSessionAddress}
                          className="rounded-full bg-[#53a6ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                ))
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-400">
                    No claimable daily rewards for this wallet yet.
                  </div>
                )}
              </div>
            </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ProfilePanel
              title="Run Progress"
              description="Core performance across daily and classic runs."
              rows={[
                ['Games completed', `${player?.gamesCompleted ?? 0}`],
                ['Daily games started', `${player?.dailyGamesStarted ?? 0}`],
                ['Classic games started', `${player?.classicGamesStarted ?? 0}`],
                ['Win rate', formatPercent(player)],
              ]}
            />

            <ProfilePanel
              title="Point Economy"
              description="Spendable and lifetime point totals for this wallet."
              rows={[
                ['Spendable points', `${player?.classicPointsBalance ?? 0}`],
                ['Lifetime points earned', `${player?.classicPointsEarned ?? 0}`],
                ['Balance', `${player?.balance ?? 0} PROOF`],
                ['Total score', `${player?.totalScore ?? 0}`],
              ]}
            />

            <ProfilePanel
              title="Best Runs"
              description="Highest scores, placement, and tile milestones."
              rows={[
                ['Best daily', `${player?.bestDailyScore ?? 0}`],
                ['Best classic', `${player?.bestClassicScore ?? 0}`],
                ['Best tile', `${player?.bestTile ?? 0}`],
                ['Classic live score', classicEntry ? `${classicEntry.score}` : 'Not ranked'],
              ]}
            />
          </div>
        </section>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-400">
          Loading profile data...
        </div>
      ) : null}
    </motion.div>
  )
}

function ProfilePanel({
  title,
  description,
  rows,
  footer,
}: {
  title: string
  description: string
  rows: Array<[string, string]>
  footer?: ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3"
          >
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  )
}

function formatPlacement(entries: LeaderboardEntry[], address: string): string {
  if (!address) {
    return 'No wallet selected'
  }
  const index = entries.findIndex((entry) => entry.address === address)
  return index === -1 ? 'Not ranked' : `#${index + 1}`
}

function formatPercent(player: PlayerStats | null): string {
  if (!player || player.gamesCompleted === 0) {
    return '0%'
  }
  return `${Math.round((player.wins / player.gamesCompleted) * 100)}%`
}

export default ProfilePage
