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

  const formatCNPY = (amount: number) => {
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
          <h1 className="text-4xl font-bold text-white mb-2">Shop & Redemptions</h1>
          <p className="text-slate-400 text-lg">Platform-wide redemption activity</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Shop Configuration */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Current Rates</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Redemption Rate</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {config?.shopRedemptionRatePoints || 500}:1
                </p>
                <p className="text-xs text-slate-500 mt-1">Points per CNPY</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Min Redemption</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {config?.shopMinRedeemPoints?.toLocaleString() || 500}
                </p>
                <p className="text-xs text-slate-500 mt-1">Points</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Step Size</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {config?.shopRedeemStepPoints?.toLocaleString() || 100}
                </p>
                <p className="text-xs text-slate-500 mt-1">Points</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Daily Points Cap</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {config?.classicDailyPointsCap?.toLocaleString() || 10000}
                </p>
                <p className="text-xs text-slate-500 mt-1">Points</p>
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Redemption Statistics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Redemptions</p>
                    <p className="mt-2 text-3xl font-bold text-white">{totalRedemptions}</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Unique Redeemers</p>
                    <p className="mt-2 text-3xl font-bold text-white">{uniqueRedeemers}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Points Burned</p>
                    <p className="mt-2 text-3xl font-bold text-red-400">
                      {totalPointsBurned.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">CNPY Paid Out</p>
                    <p className="mt-2 text-3xl font-bold text-green-400">
                      {formatCNPY(totalCNPYPaid)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Redemptions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Redemptions {isLoading && <span className="text-sm text-slate-500">(Loading...)</span>}
            </h2>
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30 border-b border-white/5">
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
                            +{formatCNPY(redemption.payoutAmount)} CNPY
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
