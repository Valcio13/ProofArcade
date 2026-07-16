import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createGame2048Client } from '../lib/chain2048'

export default function AdminPlayersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'address' | 'username'>('address')
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null)

  // Fetch player data when search is performed
  const { data: playerData, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ['admin-player', searchedAddress],
    queryFn: async () => {
      if (!searchedAddress) return null
      const client = await createGame2048Client()
      return client.getPlayer(searchedAddress)
    },
    enabled: !!searchedAddress,
  })

  // Fetch recent runs for the player
  const { data: recentRuns } = useQuery({
    queryKey: ['admin-player-runs', searchedAddress],
    queryFn: async () => {
      if (!searchedAddress) return null
      const client = await createGame2048Client()
      return client.getRecentRuns(searchedAddress)
    },
    enabled: !!searchedAddress,
  })

  // Fetch redemption history
  const { data: redemptions } = useQuery({
    queryKey: ['admin-player-redemptions', searchedAddress],
    queryFn: async () => {
      if (!searchedAddress) return null
      const client = await createGame2048Client()
      return client.getRedemptions(searchedAddress)
    },
    enabled: !!searchedAddress,
  })

  // Fetch claimable rewards
  const { data: claimableRewards } = useQuery({
    queryKey: ['admin-player-rewards', searchedAddress],
    queryFn: async () => {
      if (!searchedAddress) return null
      const client = await createGame2048Client()
      return client.getClaimableRewards(searchedAddress)
    },
    enabled: !!searchedAddress,
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    if (searchType === 'address') {
      setSearchedAddress(searchQuery.trim())
    } else {
      // Search by username - need to resolve to address first
      const client = await createGame2048Client()
      const result = await client.getAddressByUsername(searchQuery.trim())
      if (result.address) {
        setSearchedAddress(result.address)
      } else {
        setSearchedAddress(null)
        alert('Username not found')
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  const formatPROOF = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          <Link
            to="/admin"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">Admin Tools</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Player Search
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Search and view player details
        </p>
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Search Box */}
          <motion.div variants={itemVariants}>
            <section className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Type Toggle */}
                <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setSearchType('address')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      searchType === 'address'
                        ? 'bg-[#53a6ff]/20 text-[#9fd0ff]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Address
                  </button>
                  <button
                    onClick={() => setSearchType('username')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      searchType === 'username'
                        ? 'bg-[#53a6ff]/20 text-[#9fd0ff]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Username
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={
                      searchType === 'address'
                        ? 'Enter player address...'
                        : 'Enter username...'
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#53a6ff]/50"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    className="rounded-xl bg-[#f0cf52] px-6 py-2 text-sm font-bold text-[#2e2510] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
            </section>
          </motion.div>

          {/* Player Data Display */}
          {searchedAddress && (
            <>
              {playerLoading && (
                <motion.div variants={itemVariants} className="text-center text-slate-400 py-8">
                  Loading player data...
                </motion.div>
              )}

              {playerError && (
                <motion.div variants={itemVariants} className="text-center text-red-400 py-8">
                  Error loading player data
                </motion.div>
              )}

              {playerData && (
                <>
                  {/* Player Overview */}
                  <motion.div variants={itemVariants}>
                    <section>
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile</p>
                        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Player Overview</h2>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-slate-400">Address</p>
                          <p className="mt-1 text-sm font-mono text-white break-all">{searchedAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Username</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {playerData.username || 'Not set'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Balance</p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {formatPROOF(playerData.balance)} CNPY
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Classic Points</p>
                          <p className="mt-1 text-lg font-bold text-blue-400">
                            {playerData.classicPointsBalance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Best Score</p>
                          <p className="mt-1 text-lg font-bold text-purple-400">
                            {Math.max(playerData.bestDailyScore, playerData.bestClassicScore).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Best Tile</p>
                          <p className="mt-1 text-lg font-bold text-amber-400">{playerData.bestTile}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                  </motion.div>

                  {/* Check-in Status */}
                  <motion.div variants={itemVariants}>
                    <section>
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Activity</p>
                        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Check-in Status</h2>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Streak</p>
                            <p className="mt-1 text-2xl font-black text-[#86efac]">
                              {playerData.loginStreak} {playerData.loginStreak === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last Check-in</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {playerData.lastLoginClaimUtcDate || 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Check-ins</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {playerData.lastLoginClaimUtcDate ? 'Active' : 'None'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>

                  {/* Claimable Rewards */}
                  {claimableRewards && claimableRewards.rewards.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Claimable Rewards ({claimableRewards.rewards.length})
                      </h2>
                      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-black/30 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Reward
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {claimableRewards.rewards.map((reward, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                  <td className="px-6 py-4 text-sm text-white">{reward.utcDate}</td>
                                  <td className="px-6 py-4 text-sm text-white">#{reward.rank}</td>
                                  <td className="px-6 py-4 text-sm text-white">
                                    {reward.score.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-green-400">
                                    {formatPROOF(reward.rewardAmount)} CNPY
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Recent Games */}
                  {recentRuns && recentRuns.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Recent Games ({recentRuns.length})
                      </h2>
                      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-black/30 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Mode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Max Tile
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Moves
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {recentRuns.slice(0, 10).map((run, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        run.mode === 'daily'
                                          ? 'bg-purple-500/10 text-purple-400'
                                          : 'bg-blue-500/10 text-blue-400'
                                      }`}
                                    >
                                      {run.mode}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-medium text-white">
                                    {run.score.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-white">{run.maxTile}</td>
                                  <td className="px-6 py-4 text-sm text-slate-400">{run.moveCount}</td>
                                  <td className="px-6 py-4 text-sm text-slate-400">
                                    {formatDate(run.endedAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Redemption History */}
                  {redemptions && redemptions.redemptions.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Redemption History ({redemptions.redemptions.length})
                      </h2>
                      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-black/30 border-b border-white/5">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  Points Burned
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                                  CNPY Received
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {redemptions.redemptions.map((redemption, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                  <td className="px-6 py-4 text-sm text-white">
                                    {formatDate(redemption.redeemedAt)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-red-400">
                                    -{redemption.burnPoints.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-green-400">
                                    +{formatPROOF(redemption.payoutAmount)} CNPY
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}

          {/* Empty State */}
          {!searchedAddress && (
            <motion.div variants={itemVariants} className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="mt-4 text-slate-400">Search for a player to view their details</p>
            </motion.div>
          )}
        </motion.div>
    </motion.div>
  )
}
