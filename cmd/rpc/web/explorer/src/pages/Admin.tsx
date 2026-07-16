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

  const formatPROOF = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
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
        <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">
          Internal Tools
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Internal operations and monitoring
        </p>
      </section>

        <motion.div variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* System Overview Stats */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">System Overview</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Statistics</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Players */}
              <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Players</p>
                    <p className="mt-2 text-2xl font-black text-[#f6df84]">{totalPlayers}</p>
                  </div>
                  <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Daily: {dailyActivePlayers} · Classic: {classicActivePlayers}
                </p>
              </div>

              {/* Games Played */}
              <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Games Played</p>
                    <p className="mt-2 text-2xl font-black text-[#f6df84]">{totalGamesPlayed}</p>
                  </div>
                  <div className="rounded-xl bg-[#4ade80]/10 p-2.5 text-[#4ade80]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">Today: {todayGames} games</p>
              </div>

              {/* Daily Prize Pool */}
              <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Daily Prize Pool</p>
                    <p className="mt-2 text-2xl font-black text-[#f6df84]">
                      {dailyPool ? formatPROOF(dailyPool.rewardPool) : '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {dailyPool?.entryCount || 0} entries
                </p>
              </div>

              {/* Monthly Pool */}
              <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Monthly Pool</p>
                    <p className="mt-2 text-2xl font-black text-[#f6df84]">
                      {monthlyPool ? formatPROOF(monthlyPool.balance) : '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f0cf52]/10 p-2.5 text-[#f6df84]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{monthlyPool?.monthId || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Blockchain Stats */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Blockchain Status</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Network</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest Block</p>
                  <p className="mt-2 text-2xl font-black text-[#f6df84]">
                    {(() => {
                      const blocks = blocksData?.results || blocksData?.blocks || blocksData?.list || []
                      const latestBlock = Array.isArray(blocks) && blocks.length > 0 ? blocks[0] : null
                      return latestBlock?.blockHeader?.height || latestBlock?.height || 'Loading...'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Transactions</p>
                  <p className="mt-2 text-2xl font-black text-[#f6df84]">
                    {(() => {
                      const blocks = blocksData?.results || blocksData?.blocks || blocksData?.list || []
                      const latestBlock = Array.isArray(blocks) && blocks.length > 0 ? blocks[0] : null
                      return latestBlock?.blockHeader?.totalTxs || blocksData?.totalCount || 'Loading...'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Backend Status</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-base font-semibold text-green-400">{client?.status.mode || 'Loading'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent Activity</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Recent Game Activity</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20 border-b border-white/10">
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
                              className="text-sm text-[#53a6ff] hover:text-[#9fd0ff] font-mono"
                            >
                              {run.address.slice(0, 8)}...{run.address.slice(-6)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                run.mode === 'daily'
                                  ? 'bg-[#a78bfa]/10 text-[#c4b5fd]'
                                  : 'bg-[#53a6ff]/10 text-[#9fd0ff]'
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
                              className="text-sm text-[#53a6ff] hover:text-[#9fd0ff] font-mono"
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
          </section>

          {/* Quick Links */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quick Access</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Actions</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/monitoring"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#ef4444]/10 p-2.5 inline-block text-[#f87171]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Monitoring</h3>
                <p className="mt-1.5 text-sm text-slate-400">Live metrics</p>
              </Link>

              <Link
                to="/admin/pool-management"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#06b6d4]/10 p-2.5 inline-block text-[#67e8f9]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Pool Management</h3>
                <p className="mt-1.5 text-sm text-slate-400">Transfer funds</p>
              </Link>

              <Link
                to="/admin/economy"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 inline-block text-[#9fd0ff]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Economy</h3>
                <p className="mt-1.5 text-sm text-slate-400">View pools & treasury</p>
              </Link>

              <Link
                to="/admin/competitions"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 inline-block text-[#c4b5fd]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Competitions</h3>
                <p className="mt-1.5 text-sm text-slate-400">Manage daily/monthly</p>
              </Link>

              <Link
                to="/admin/players"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#4ade80]/10 p-2.5 inline-block text-[#86efac]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Players</h3>
                <p className="mt-1.5 text-sm text-slate-400">Search & view stats</p>
              </Link>

              <Link
                to="/admin/shop"
                className="block rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
              >
                <div className="rounded-xl bg-[#f0cf52]/10 p-2.5 inline-block text-[#f6df84]">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Shop</h3>
                <p className="mt-1.5 text-sm text-slate-400">Redemption history</p>
              </Link>
            </div>
          </section>
        </motion.div>
    </motion.div>
  )
}
