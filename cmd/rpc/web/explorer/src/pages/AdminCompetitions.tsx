import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createGame2048Client } from '../lib/chain2048'
import type { DailyPrizePool, MonthlyLeaderboard, MonthlyPool, LeaderboardEntry } from '../lib/mockChain2048'

export default function AdminCompetitionsPage() {
  const [client, setClient] = useState<Awaited<ReturnType<typeof createGame2048Client>> | null>(null)
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly'>('daily')

  useEffect(() => {
    createGame2048Client().then(setClient)
  }, [])

  // Fetch daily leaderboard
  const { data: leaderboards, refetch: refetchLeaderboards } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: () => client?.getLeaderboards(),
    enabled: !!client,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  })

  // Fetch daily prize pool (today)
  const { data: dailyPool, refetch: refetchDailyPool } = useQuery({
    queryKey: ['daily-pool'],
    queryFn: () => client?.getDailyPrizePool(),
    enabled: !!client,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch monthly leaderboard
  const { data: monthlyLeaderboard } = useQuery({
    queryKey: ['monthly-leaderboard'],
    queryFn: () => client?.getMonthlyLeaderboard(),
    enabled: !!client,
    refetchInterval: 60000, // Refetch every minute
  })

  // Fetch monthly pool
  const { data: monthlyPool } = useQuery({
    queryKey: ['monthly-pool'],
    queryFn: () => client?.getMonthlyPool(),
    enabled: !!client,
    refetchInterval: 60000, // Refetch every minute
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

  // Check if day has ended (UTC midnight has passed)
  const hasDayEnded = (utcDate: string): boolean => {
    const targetDate = new Date(utcDate + 'T23:59:59.999Z')
    const now = new Date()
    return now > targetDate
  }

  // Get competition status with enhanced info
  const getCompetitionStatus = () => {
    if (!dailyPool) return { text: 'Loading', color: 'gray', icon: '⏳' }
    
    if (dailyPool.finalized) {
      return { text: 'Finalized', color: 'green', icon: '✓' }
    }
    
    if (hasDayEnded(dailyPool.utcDate)) {
      return { text: 'Awaiting Finalization', color: 'amber', icon: '⏱' }
    }
    
    return { text: 'Active', color: 'blue', icon: '▶' }
  }

  // Get competition health warning
  const getHealthWarning = () => {
    if (!dailyPool) return null
    
    const warnings = []
    
    if (dailyPool.entryCount < 5) {
      warnings.push({
        level: 'warning',
        message: `Low participation: Only ${dailyPool.entryCount} ${dailyPool.entryCount === 1 ? 'entry' : 'entries'} today`,
      })
    }
    
    if (dailyPool.rewardPool < 50_000_000) { // Less than 50 CNPY
      warnings.push({
        level: 'info',
        message: `Small prize pool: ${formatPROOF(dailyPool.rewardPool)} CNPY`,
      })
    }
    
    if (hasDayEnded(dailyPool.utcDate) && !dailyPool.finalized) {
      warnings.push({
        level: 'info',
        message: 'Day has ended. Pool will finalize when first player claims.',
      })
    }
    
    return warnings.length > 0 ? warnings : null
  }

  // Export daily competition data
  const exportDailyCompetition = () => {
    if (!dailyPool || !leaderboards?.daily) {
      toast.error('No data to export')
      return
    }

    const csv = [
      ['Daily Competition Export', '', '', '', '', ''],
      ['Date', dailyPool.utcDate, '', '', '', ''],
      ['Status', dailyPool.finalized ? 'Finalized' : 'Active', '', '', '', ''],
      ['Participants', dailyPool.entryCount.toString(), '', '', '', ''],
      ['Prize Pool (CNPY)', formatPROOF(dailyPool.rewardPool), '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Rank', 'Player', 'Score', 'Max Tile', 'Moves', 'Time'],
      ...leaderboards.daily.map((entry, idx) => [
        (idx + 1).toString(),
        entry.username || entry.address,
        entry.score.toString(),
        entry.maxTile.toString(),
        entry.moveCount.toString(),
        new Date(entry.endedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-competition-${dailyPool.utcDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Competition data exported')
  }

  const status = getCompetitionStatus()
  const warnings = getHealthWarning()

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
              Competitions
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Daily and monthly competition management
        </p>
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
        {/* Competition Tabs */}
        <motion.div variants={itemVariants}>
          <div className="flex space-x-2 rounded-2xl border border-white/10 bg-card p-1">
            <button
              onClick={() => setSelectedTab('daily')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                selectedTab === 'daily'
                  ? 'bg-[#a78bfa]/20 text-[#c4b5fd] shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Daily Challenge
            </button>
            <button
              onClick={() => setSelectedTab('monthly')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                selectedTab === 'monthly'
                  ? 'bg-[#f6df84]/20 text-[#f6df84] shadow-lg'
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
            {/* Competition Health Warnings */}
            {warnings && warnings.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="space-y-2">
                  {warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 ${
                        warning.level === 'warning'
                          ? 'border-[#f6df84]/20 bg-[#f6df84]/10'
                          : 'border-[#53a6ff]/20 bg-[#53a6ff]/10'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className={`text-lg mr-3 ${
                          warning.level === 'warning' ? 'text-[#f6df84]' : 'text-[#9fd0ff]'
                        }`}>
                          {warning.level === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <p className={`text-sm ${
                          warning.level === 'warning' ? 'text-[#f6df84]/90' : 'text-[#9fd0ff]/90'
                        }`}>
                          {warning.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Daily Overview */}
            <motion.div variants={itemVariants}>
              <section>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Daily Overview</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">{formatDate(dailyPool.utcDate)}</p>
                      </div>
                      <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Participants</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">{dailyPool.entryCount}</p>
                      </div>
                      <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prize Pool</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">{formatPROOF(dailyPool.rewardPool)}</p>
                      </div>
                      <div className="rounded-xl bg-[#4ade80]/10 p-2.5 text-[#86efac]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xl">{status.icon}</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          status.color === 'green'
                            ? 'bg-[#4ade80]/10 text-[#86efac]'
                            : status.color === 'amber'
                            ? 'bg-[#f6df84]/10 text-[#f6df84]'
                            : status.color === 'blue'
                            ? 'bg-[#53a6ff]/10 text-[#9fd0ff]'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>
                    {hasDayEnded(dailyPool.utcDate) && !dailyPool.finalized && (
                      <p className="text-xs text-slate-500 mt-2">
                        Awaiting first claim
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>

            {/* Daily Leaderboard */}
            <motion.div variants={itemVariants}>
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rankings</p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Daily Leaderboard</h2>
                  </div>
                  <button
                    onClick={exportDailyCompetition}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/20 border-b border-white/10">
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
              </section>
            </motion.div>

            {/* Finalization Details */}
            {dailyPool.finalized && (
              <motion.div variants={itemVariants}>
                <section>
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Details</p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Finalization Details</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gross Fees</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatPROOF(dailyPool.grossFees)} CNPY
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Distributed Rewards</p>
                        <p className="mt-1 text-lg font-semibold text-[#86efac]">
                          {formatPROOF(dailyPool.distributedRewards)} CNPY
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Treasury Leftover</p>
                        <p className="mt-1 text-lg font-semibold text-slate-300">
                          {formatPROOF(dailyPool.treasuryLeftover)} CNPY
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-500">
                        Finalized at:{' '}
                        {dailyPool.finalizedAtUnix
                          ? new Date(dailyPool.finalizedAtUnix * 1000).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
            </>
          )}

          {/* Monthly Competition View */}
          {selectedTab === 'monthly' && (
            <>
            {/* Monthly Overview */}
            <motion.div variants={itemVariants}>
              <section>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">This Month</p>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Monthly Overview</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Month</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">{monthlyPool?.monthId || 'N/A'}</p>
                      </div>
                      <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Participants</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">
                          {monthlyLeaderboard?.entries.length || 0}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prize Pool</p>
                        <p className="mt-2 text-2xl font-black text-[#f6df84]">
                          {formatPROOF(monthlyPool?.balance || 0)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#4ade80]/10 p-2.5 text-[#86efac]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#53a6ff]/10 text-[#9fd0ff]">
                      Active
                    </span>
                  </div>
                </div>
              </section>
            </motion.div>

            {/* Monthly Leaderboard */}
            <motion.div variants={itemVariants}>
              <section>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rankings</p>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Monthly Leaderboard</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/20 border-b border-white/10">
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
              </section>
              </motion.div>
            </>
          )}
        </motion.div>
    </motion.div>
  )
}
