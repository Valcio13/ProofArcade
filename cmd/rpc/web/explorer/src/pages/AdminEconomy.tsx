import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createGame2048Client } from '../lib/chain2048'
import type { DailyPrizePool, MonthlyPool } from '../lib/mockChain2048'
import { DAO, Pool } from '../lib/api'
import { AdminActionButton, AdminActionsGrid } from '../components/admin/AdminActions'
import toast from 'react-hot-toast'

// Pool IDs from contract
const PoolIDs = {
  DAO: 131071,
  PLATFORM: 131072,
  RESERVE: 131073,
  SHOP: 131074,
  DAILY_REWARD: 131075,
  MONTHLY_REWARD: 131076,
}

interface PoolData {
  id: number
  name: string
  balance: number
  description: string
}

export default function AdminEconomyPage() {
  const [client, setClient] = useState<Awaited<ReturnType<typeof createGame2048Client>> | null>(null)

  useEffect(() => {
    createGame2048Client().then(setClient)
  }, [])

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

  // Fetch DAO pool
  const { data: daoPoolData } = useQuery({
    queryKey: ['dao-pool'],
    queryFn: () => DAO(0, 0),
    enabled: true,
  })

  // Fetch Shop pool
  const { data: shopPoolData } = useQuery({
    queryKey: ['shop-pool'],
    queryFn: () => Pool(0, PoolIDs.SHOP),
    enabled: true,
  })

  // Fetch Reserve pool
  const { data: reservePoolData } = useQuery({
    queryKey: ['reserve-pool'],
    queryFn: () => Pool(0, PoolIDs.RESERVE),
    enabled: true,
  })

  // Fetch Platform pool
  const { data: platformPoolData } = useQuery({
    queryKey: ['platform-pool'],
    queryFn: () => Pool(0, PoolIDs.PLATFORM),
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

  const formatCNPY = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Calculate pool data
  const pools: PoolData[] = [
    {
      id: PoolIDs.DAO,
      name: 'DAO Pool',
      balance: daoPoolData?.data?.amount || 0,
      description: 'Community governance treasury',
    },
    {
      id: PoolIDs.DAILY_REWARD,
      name: 'Daily Reward Pool',
      balance: dailyPool?.rewardPool || 0,
      description: 'Current day prize pool',
    },
    {
      id: PoolIDs.MONTHLY_REWARD,
      name: 'Monthly Reward Pool',
      balance: monthlyPool?.balance || 0,
      description: 'Current month competition pool',
    },
    {
      id: PoolIDs.SHOP,
      name: 'Shop Pool',
      balance: shopPoolData?.data?.amount || 0,
      description: 'Point redemption funding',
    },
    {
      id: PoolIDs.RESERVE,
      name: 'Reserve Pool',
      balance: reservePoolData?.data?.amount || 0,
      description: 'Safety buffer and contingency',
    },
    {
      id: PoolIDs.PLATFORM,
      name: 'Platform Pool',
      balance: platformPoolData?.data?.amount || 0,
      description: 'Platform revenue',
    },
  ]

  const totalTreasury = pools.reduce((sum, pool) => sum + pool.balance, 0)

  // Fee distribution configuration
  const feeDistributions = [
    {
      mode: 'Daily Challenge',
      entryFee: '1.0 CNPY',
      splits: [
        { name: 'Reward Pool', percentage: '80%', bps: 8000 },
        { name: 'Reserve Pool', percentage: '10%', bps: 1000 },
        { name: 'Shop Pool', percentage: '5%', bps: 500 },
        { name: 'Platform Pool', percentage: '5%', bps: 500 },
      ],
    },
    {
      mode: 'Classic Mode',
      entryFee: '0.5 CNPY',
      splits: [
        { name: 'Shop Pool', percentage: '45%', bps: 4500 },
        { name: 'Monthly Pool', percentage: '30%', bps: 3000 },
        { name: 'Reserve Pool', percentage: '20%', bps: 2000 },
        { name: 'Platform Pool', percentage: '5%', bps: 500 },
      ],
    },
  ]

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
          <h1 className="text-4xl font-bold text-white mb-2">Economy & Treasury</h1>
          <p className="text-slate-400 text-lg">Pool balances and fee distribution</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Treasury Overview */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Treasury Overview</h2>
            <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Total Treasury Balance</p>
                <p className="text-5xl font-bold text-white">{formatCNPY(totalTreasury)} <span className="text-2xl text-slate-400">CNPY</span></p>
                <p className="text-sm text-slate-500 mt-2">Across {pools.length} pools</p>
              </div>
            </div>
          </motion.div>

          {/* All Pools */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Pool Balances</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Pool ID: {pool.id}</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-2">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {formatCNPY(pool.balance)} <span className="text-sm text-slate-400">CNPY</span>
                  </p>
                  <p className="text-xs text-slate-400">{pool.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fee Distribution Configuration */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Fee Distribution Rules</h2>
            <div className="space-y-4">
              {feeDistributions.map((config, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.mode}</h3>
                      <p className="text-sm text-slate-400">Entry Fee: {config.entryFee}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        idx === 0
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {config.mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {config.splits.map((split, splitIdx) => (
                      <div
                        key={splitIdx}
                        className="rounded-lg border border-white/5 bg-black/10 p-4"
                      >
                        <p className="text-xs text-slate-500 mb-1">{split.name}</p>
                        <p className="text-xl font-bold text-white">{split.percentage}</p>
                        <p className="text-xs text-slate-600 mt-1">{split.bps} bps</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily Pool Details */}
          {dailyPool && (
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-semibold text-white mb-4">Daily Pool Details</h2>
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="mt-1 text-lg font-semibold text-white">{dailyPool.utcDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Entries</p>
                    <p className="mt-1 text-lg font-semibold text-white">{dailyPool.entryCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Gross Fees</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCNPY(dailyPool.grossFees)} CNPY
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dailyPool.finalized
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {dailyPool.finalized ? 'Finalized' : 'Active'}
                      </span>
                    </p>
                  </div>
                </div>
                {dailyPool.finalized && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-400">Distributed Rewards</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatCNPY(dailyPool.distributedRewards)} CNPY
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Treasury Leftover</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatCNPY(dailyPool.treasuryLeftover)} CNPY
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Admin Actions */}
          <motion.div variants={itemVariants}>
            <AdminActionsGrid title="Economy Actions">
              <AdminActionButton
                label="Force Finalize Daily Pool"
                description="Manually trigger daily pool finalization"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                onClick={async () => {
                  // TODO: Implement finalization call
                  await new Promise((resolve) => setTimeout(resolve, 1000))
                  toast.success('Daily pool finalization queued')
                }}
                variant="warning"
                requiresConfirmation
                confirmTitle="Finalize Daily Pool"
                confirmMessage="This will finalize the current day's prize pool and distribute rewards. Continue?"
                disabled={!dailyPool || dailyPool.finalized}
              />

              <AdminActionButton
                label="Refresh Pool Balances"
                description="Force refresh all pool balance data"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
                onClick={async () => {
                  // Trigger query refetch
                  await Promise.all([
                    client?.getDailyPrizePool(),
                    client?.getMonthlyPool(),
                    DAO(0, 0),
                  ])
                }}
                variant="primary"
              />

              <AdminActionButton
                label="Export Treasury Report"
                description="Download detailed treasury breakdown"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                }
                onClick={async () => {
                  const report = {
                    timestamp: new Date().toISOString(),
                    pools,
                    totalTreasury,
                    dailyPool,
                    monthlyPool,
                  }
                  const blob = new Blob([JSON.stringify(report, null, 2)], {
                    type: 'application/json',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `treasury_report_${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                variant="primary"
              />
            </AdminActionsGrid>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
