import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import type { DailyPrizePool, MonthlyLeaderboard, MonthlyPool, LeaderboardEntry } from '../lib/mockChain2048'

export default function AdminCompetitionsPage() {
  const [client, setClient] = useState<Awaited<ReturnType<typeof createGame2048Client>> | null>(null)
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly'>('daily')

  useEffect(() => {
    createGame2048Client().then(setClient)
  }, [])

  // Fetch daily leaderboard
  const { data: leaderboards } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: () => client?.getLeaderboards(),
    enabled: !!client,
  })

  // Fetch daily prize pool (today)
  const { data: dailyPool } = useQuery({
    queryKey: ['daily-pool'],
    queryFn: () => client?.getDailyPrizePool(),
    enabled: !!client,
  })

  // Fetch monthly leaderboard
  const { data: monthlyLeaderboard } = useQuery({
    queryKey: ['monthly-leaderboard'],
    queryFn: () => client?.getMonthlyLeaderboard(),
    enabled: !!client,
  })

  // Fetch monthly pool
  const { data: monthlyPool } = useQuery({
    queryKey: ['monthly-pool'],
    queryFn: () => client?.getMonthlyPool(),
    enabled: !!client,
  })

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

  const formatCNPY = (amount: number) => {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            to="/admin"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Competitions</h1>
          <p className="text-slate-400 text-lg">Daily and monthly competition management</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Competition Tabs */}
          <motion.div variants={itemVariants}>
            <div className="flex space-x-2 rounded-xl border border-white/10 bg-black/20 p-1 backdrop-blur-sm">
              <button
                onClick={() => setSelectedTab('daily')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedTab === 'daily'
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Daily Challenge
              </button>
              <button
                onClick={() => setSelectedTab('monthly')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedTab === 'monthly'
                    ? 'bg-amber-500/20 text-amber-300 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Monthly Competition
              </button>
            </div>
          </motion.div>

          {/* Daily Competition View */}
          {selectedTab === 'daily' && dailyPool && (
            <>
              {/* Daily Overview */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4">Daily Overview</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="mt-2 text-2xl font-bold text-white">{formatDate(dailyPool.utcDate)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Participants</p>
                    <p className="mt-2 text-2xl font-bold text-white">{dailyPool.entryCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Prize Pool</p>
                    <p className="mt-2 text-2xl font-bold text-white">{formatCNPY(dailyPool.rewardPool)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Status</p>
                    <span
                      className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        dailyPool.finalized
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {dailyPool.finalized ? 'Finalized' : 'Active'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Daily Leaderboard */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4">Daily Leaderboard</h2>
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/30 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Max Tile
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Moves
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaderboards?.daily && leaderboards.daily.length > 0 ? (
                          leaderboards.daily.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                    idx === 0
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : idx === 1
                                      ? 'bg-slate-400/20 text-slate-300'
                                      : idx === 2
                                      ? 'bg-amber-700/20 text-amber-400'
                                      : 'bg-slate-700/20 text-slate-400'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={`/player/${entry.address}`}
                                  className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                                >
                                  {entry.username || `${entry.address.slice(0, 8)}...${entry.address.slice(-6)}`}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                {entry.score.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{entry.maxTile}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                {entry.moveCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                {new Date(entry.endedAt).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                              No entries yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

              {/* Finalization Details */}
              {dailyPool.finalized && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-xl font-semibold text-white mb-4">Finalization Details</h2>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-slate-400">Gross Fees</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatCNPY(dailyPool.grossFees)} CNPY
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Distributed Rewards</p>
                        <p className="mt-1 text-lg font-semibold text-green-400">
                          {formatCNPY(dailyPool.distributedRewards)} CNPY
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Treasury Leftover</p>
                        <p className="mt-1 text-lg font-semibold text-slate-300">
                          {formatCNPY(dailyPool.treasuryLeftover)} CNPY
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500">
                        Finalized at:{' '}
                        {dailyPool.finalizedAtUnix
                          ? new Date(dailyPool.finalizedAtUnix * 1000).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Monthly Competition View */}
          {selectedTab === 'monthly' && (
            <>
              {/* Monthly Overview */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4">Monthly Overview</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Month</p>
                    <p className="mt-2 text-2xl font-bold text-white">{monthlyPool?.monthId || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Participants</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {monthlyLeaderboard?.entries.length || 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Prize Pool</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {formatCNPY(monthlyPool?.balance || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm text-slate-400">Status</p>
                    <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Monthly Leaderboard */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-white mb-4">Monthly Leaderboard</h2>
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/30 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Total Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Games Played
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {monthlyLeaderboard?.entries && monthlyLeaderboard.entries.length > 0 ? (
                          monthlyLeaderboard.entries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                    idx === 0
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : idx === 1
                                      ? 'bg-slate-400/20 text-slate-300'
                                      : idx === 2
                                      ? 'bg-amber-700/20 text-amber-400'
                                      : 'bg-slate-700/20 text-slate-400'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                  to={`/player/${entry.address}`}
                                  className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                                >
                                  {entry.username || `${entry.address.slice(0, 8)}...${entry.address.slice(-6)}`}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                {entry.score.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                {/* Note: Game count not available in current data structure */}
                                N/A
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                              No entries yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
