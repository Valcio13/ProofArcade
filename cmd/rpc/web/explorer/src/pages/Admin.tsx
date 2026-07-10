import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import type { ChainConfig, DailyPrizePool, MonthlyPool, RecentRun } from '../lib/mockChain2048'
import { Blocks } from '../lib/api'

export default function AdminPage() {
  const [client, setClient] = useState<Awaited<ReturnType<typeof createGame2048Client>> | null>(null)

  useEffect(() => {
    createGame2048Client().then(setClient)
  }, [])

  // Fetch game config
  const { data: config } = useQuery({
    queryKey: ['game-config'],
    queryFn: () => client?.getConfig(),
    enabled: !!client,
  })

  // Fetch daily prize pool (today)
  const { data: dailyPool } = useQuery({
    queryKey: ['daily-pool'],
    queryFn: () => client?.getDailyPrizePool(),
    enabled: !!client,
  })

  // Fetch monthly pool (current month)
  const { data: monthlyPool } = useQuery({
    queryKey: ['monthly-pool'],
    queryFn: () => client?.getMonthlyPool(),
    enabled: !!client,
  })

  // Fetch leaderboards
  const { data: leaderboards } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: () => client?.getLeaderboards(),
    enabled: !!client,
  })

  // Fetch recent runs
  const { data: recentRuns } = useQuery({
    queryKey: ['recent-runs-all'],
    queryFn: () => client?.getRecentRuns(),
    enabled: !!client,
  })

  // Fetch recent blocks for blockchain stats
  const { data: blocksData } = useQuery({
    queryKey: ['blocks', 1, 10],
    queryFn: () => Blocks(1, 10),
    enabled: true,
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

  // Calculate stats
  const totalPlayers = new Set([
    ...(leaderboards?.daily.map((e) => e.address) || []),
    ...(leaderboards?.classic.map((e) => e.address) || []),
  ]).size

  const dailyActivePlayers = leaderboards?.daily.length || 0
  const classicActivePlayers = leaderboards?.classic.length || 0

  const totalGamesPlayed = (recentRuns?.length || 0)
  const todayGames = recentRuns?.filter((run) => {
    const runDate = new Date(run.endedAt)
    const today = new Date()
    return runDate.toDateString() === today.toDateString()
  }).length || 0

  const formatCNPY = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
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
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400 text-lg">Internal operations and monitoring</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* System Overview Stats */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">System Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Players */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Players</p>
                    <p className="mt-2 text-3xl font-bold text-white">{totalPlayers}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Daily: {dailyActivePlayers} · Classic: {classicActivePlayers}
                </p>
              </div>

              {/* Games Played */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Games Played</p>
                    <p className="mt-2 text-3xl font-bold text-white">{totalGamesPlayed}</p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Today: {todayGames} games</p>
              </div>

              {/* Daily Prize Pool */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Daily Prize Pool</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {dailyPool ? formatCNPY(dailyPool.rewardPool) : '0.00'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {dailyPool?.entryCount || 0} entries
                </p>
              </div>

              {/* Monthly Pool */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Monthly Pool</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {monthlyPool ? formatCNPY(monthlyPool.balance) : '0.00'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{monthlyPool?.monthId || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          {/* Blockchain Stats */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Blockchain Status</h2>
            <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-400">Latest Block</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {(() => {
                      const blocks = blocksData?.results || blocksData?.blocks || blocksData?.list || []
                      const latestBlock = Array.isArray(blocks) && blocks.length > 0 ? blocks[0] : null
                      return latestBlock?.blockHeader?.height || latestBlock?.height || 'Loading...'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Transactions</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {(() => {
                      const blocks = blocksData?.results || blocksData?.blocks || blocksData?.list || []
                      const latestBlock = Array.isArray(blocks) && blocks.length > 0 ? blocks[0] : null
                      return latestBlock?.blockHeader?.totalTxs || blocksData?.totalCount || 'Loading...'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Backend Status</p>
                  <div className="mt-1 flex items-center">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="ml-2 text-sm font-medium text-green-400">{client?.status.mode || 'Loading'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Game Activity</h2>
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Max Tile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentRuns && recentRuns.length > 0 ? (
                      recentRuns.slice(0, 10).map((run, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/player/${run.address}`}
                              className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                            >
                              {run.address.slice(0, 8)}...{run.address.slice(-6)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                            {run.score.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {run.maxTile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {new Date(run.endedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/game-history/${run.address}`}
                              className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                            >
                              View History
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                          No recent activity
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/admin/monitoring"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-red-500/10 p-2">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Monitoring</p>
                    <p className="text-xs text-slate-400">Live metrics</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/pool-management"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-cyan-500/10 p-2">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Pool Management</p>
                    <p className="text-xs text-slate-400">Transfer funds</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/economy"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Economy</p>
                    <p className="text-xs text-slate-400">View pools & treasury</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/competitions"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Competitions</p>
                    <p className="text-xs text-slate-400">Manage daily/monthly</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/players"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Players</p>
                    <p className="text-xs text-slate-400">Search & view stats</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/shop"
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Shop</p>
                    <p className="text-xs text-slate-400">Redemption history</p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
