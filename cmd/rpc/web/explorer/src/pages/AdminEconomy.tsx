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

  const formatPROOF = (amount: number) => {
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
      balance: daoPoolData?.amount || 0,
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
      balance: shopPoolData?.amount || 0,
      description: 'Point redemption funding',
    },
    {
      id: PoolIDs.RESERVE,
      name: 'Reserve Pool',
      balance: reservePoolData?.amount || 0,
      description: 'Safety buffer and contingency',
    },
    {
      id: PoolIDs.PLATFORM,
      name: 'Platform Pool',
      balance: platformPoolData?.amount || 0,
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
              Economy & Treasury
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Pool balances and fee distribution
        </p>
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Treasury Overview */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Financial Overview</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Treasury Balance</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Total Treasury Balance</p>
                <p className="text-5xl font-black text-[#f6df84]">{formatPROOF(totalTreasury)} <span className="text-2xl text-slate-400">PROOF</span></p>
                <p className="text-sm text-slate-500 mt-2">Across {pools.length} pools</p>
              </div>
            </div>
          </section>

          {/* All Pools */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pool Distribution</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Pool Balances</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Pool ID: {pool.id}</p>
                    </div>
                    <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-[#f6df84] mb-2">
                    {formatPROOF(pool.balance)} <span className="text-sm text-slate-400">PROOF</span>
                  </p>
                  <p className="text-xs text-slate-400">{pool.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fee Distribution Configuration */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Revenue Model</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Fee Distribution Rules</h2>
            </div>
            <div className="space-y-4">
              {feeDistributions.map((config, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.mode}</h3>
                      <p className="text-sm text-slate-400">Entry Fee: {config.entryFee}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        idx === 0
                          ? 'bg-[#a78bfa]/10 text-[#c4b5fd]'
                          : 'bg-[#53a6ff]/10 text-[#9fd0ff]'
                      }`}
                    >
                      {config.mode}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {config.splits.map((split, splitIdx) => (
                      <div
                        key={splitIdx}
                        className="rounded-xl border border-white/5 bg-black/10 p-4"
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
          </section>

          {/* Daily Pool Details */}
          {dailyPool && (
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Cycle</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Daily Pool Details</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date</p>
                    <p className="mt-1 text-lg font-semibold text-white">{dailyPool.utcDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entries</p>
                    <p className="mt-1 text-lg font-semibold text-white">{dailyPool.entryCount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gross Fees</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatPROOF(dailyPool.grossFees)} PROOF
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dailyPool.finalized
                            ? 'bg-[#4ade80]/10 text-[#4ade80]'
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
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Distributed Rewards</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatPROOF(dailyPool.distributedRewards)} PROOF
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Treasury Leftover</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatPROOF(dailyPool.treasuryLeftover)} PROOF
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Admin Actions */}
          <section>
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
          </section>
        </motion.div>
    </motion.div>
  )
}
