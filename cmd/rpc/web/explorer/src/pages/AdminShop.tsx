import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'

export default function AdminShopPage() {
  const [client, setClient] = useState<Awaited<ReturnType<typeof createGame2048Client>> | null>(null)

  useEffect(() => {
    createGame2048Client().then(setClient)
  }, [])

  // Fetch config to display current rates
  const { data: config } = useQuery({
    queryKey: ['game-config'],
    queryFn: () => client?.getConfig(),
    enabled: !!client,
  })

  // Fetch leaderboards to get all players
  const { data: leaderboards } = useQuery({
    queryKey: ['leaderboards'],
    queryFn: () => client?.getLeaderboards(),
    enabled: !!client,
  })

  // Get unique player addresses
  const allPlayers = Array.from(
    new Set([
      ...(leaderboards?.daily.map((e) => e.address) || []),
      ...(leaderboards?.classic.map((e) => e.address) || []),
    ])
  )

  // Fetch redemptions for all players
  const { data: allRedemptions, isLoading } = useQuery({
    queryKey: ['all-redemptions', allPlayers],
    queryFn: async () => {
      if (!client || allPlayers.length === 0) return []

      const redemptionPromises = allPlayers.map(async (address) => {
        try {
          const redemptions = await client.getRedemptions(address)
          return redemptions.redemptions.map((r) => ({
            ...r,
            address,
          }))
        } catch {
          return []
        }
      })

      const results = await Promise.all(redemptionPromises)
      return results.flat().sort((a, b) => b.redeemedAtUnix - a.redeemedAtUnix)
    },
    enabled: !!client && allPlayers.length > 0,
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Calculate statistics
  const totalRedemptions = allRedemptions?.length || 0
  const totalPointsBurned = allRedemptions?.reduce((sum, r) => sum + r.burnPoints, 0) || 0
  const totalCNPYPaid = allRedemptions?.reduce((sum, r) => sum + r.payoutAmount, 0) || 0
  const uniqueRedeemers = new Set(allRedemptions?.map((r) => r.address)).size

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
              Shop & Redemptions
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Platform-wide redemption activity
        </p>
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Shop Configuration */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Configuration</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Current Rates</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Redemption Rate</p>
                      <p className="mt-2 text-2xl font-black text-[#f6df84]">
                        {config?.shopRedemptionRatePoints || 500}:1
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Points per CNPY</p>
                    </div>
                    <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Min Redemption</p>
                      <p className="mt-2 text-2xl font-black text-[#f6df84]">
                        {config?.shopMinRedeemPoints?.toLocaleString() || 500}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Points</p>
                    </div>
                    <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step Size</p>
                      <p className="mt-2 text-2xl font-black text-[#f6df84]">
                        {config?.shopRedeemStepPoints?.toLocaleString() || 100}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Points</p>
                    </div>
                    <div className="rounded-xl bg-[#06b6d4]/10 p-2.5 text-[#67e8f9]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Daily Points Cap</p>
                      <p className="mt-2 text-2xl font-black text-[#f6df84]">
                        {config?.classicDailyPointsCap?.toLocaleString() || 10000}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Points</p>
                    </div>
                    <div className="rounded-xl bg-[#4ade80]/10 p-2.5 text-[#86efac]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Analytics</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Redemption Statistics</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Redemptions</p>
                      <p className="mt-2 text-3xl font-black text-[#f6df84]">{totalRedemptions}</p>
                    </div>
                    <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Unique Redeemers</p>
                      <p className="mt-2 text-3xl font-black text-[#f6df84]">{uniqueRedeemers}</p>
                    </div>
                    <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Points Burned</p>
                      <p className="mt-2 text-3xl font-black text-[#f87171]">
                        {totalPointsBurned.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#ef4444]/10 p-2.5 text-[#f87171]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">CNPY Paid Out</p>
                      <p className="mt-2 text-3xl font-black text-[#86efac]">
                        {formatPROOF(totalCNPYPaid)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#4ade80]/10 p-2.5 text-[#86efac]">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>

          {/* Recent Redemptions */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Activity</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Recent Redemptions {isLoading && <span className="text-sm text-slate-500">(Loading...)</span>}
                </h2>
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
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Points Burned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        CNPY Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allRedemptions && allRedemptions.length > 0 ? (
                      allRedemptions.map((redemption, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/player/${redemption.address}`}
                              className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                            >
                              {redemption.address.slice(0, 8)}...{redemption.address.slice(-6)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {formatDate(redemption.redeemedAtUnix)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">
                            -{redemption.burnPoints.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                            +{formatPROOF(redemption.payoutAmount)} CNPY
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {redemption.txHash ? (
                              <Link
                                to={`/transaction/${redemption.txHash}`}
                                className="text-sm text-blue-400 hover:text-blue-300 font-mono"
                              >
                                {redemption.txHash.slice(0, 8)}...
                              </Link>
                            ) : (
                              <span className="text-sm text-slate-500">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                          {isLoading ? 'Loading redemptions...' : 'No redemptions yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          </motion.div>
        </motion.div>
    </motion.div>
  )
}
