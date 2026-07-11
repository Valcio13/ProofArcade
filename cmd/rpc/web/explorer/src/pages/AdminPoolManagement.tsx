import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { DAO, Pool } from '../lib/api'
import toast from 'react-hot-toast'
import { loadStoredWalletAuth } from '../lib/walletAuth'

// Pool IDs from contract
const PoolIDs = {
  DAO: 131071,
  PLATFORM: 131072,
  RESERVE: 131073,
  SHOP: 131074,
  DAILY_REWARD: 131075,
  MONTHLY_REWARD: 131076,
}

const PoolNames: Record<number, string> = {
  [PoolIDs.DAO]: 'DAO Pool',
  [PoolIDs.PLATFORM]: 'Platform Pool',
  [PoolIDs.RESERVE]: 'Reserve Pool',
  [PoolIDs.SHOP]: 'Shop Pool',
  [PoolIDs.DAILY_REWARD]: 'Daily Reward Pool',
  [PoolIDs.MONTHLY_REWARD]: 'Monthly Reward Pool',
}

interface PoolBalance {
  id: number
  name: string
  balance: number
  percentage: number
}

interface TransferModalState {
  isOpen: boolean
  fromPoolId: number | null
  toPoolId: number | null
  amount: string
}

interface AuditLogEntry {
  timestamp: Date
  operation: string
  fromPool: string
  toPool?: string
  amount: number
  adminAddress: string
  status: 'success' | 'error'
  message?: string
}

export default function AdminPoolManagementPage() {
  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    fromPoolId: null,
    toPoolId: null,
    amount: '',
  })
  
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])

  // Fetch all pool balances
  const { data: daoPoolData, refetch: refetchDao } = useQuery({
    queryKey: ['dao-pool'],
    queryFn: () => DAO(0, 0),
    refetchInterval: 20000,
  })

  const { data: shopPoolData, refetch: refetchShop } = useQuery({
    queryKey: ['shop-pool'],
    queryFn: () => Pool(0, PoolIDs.SHOP),
    refetchInterval: 20000,
  })

  const { data: reservePoolData, refetch: refetchReserve } = useQuery({
    queryKey: ['reserve-pool'],
    queryFn: () => Pool(0, PoolIDs.RESERVE),
    refetchInterval: 20000,
  })

  const { data: platformPoolData, refetch: refetchPlatform } = useQuery({
    queryKey: ['platform-pool'],
    queryFn: () => Pool(0, PoolIDs.PLATFORM),
    refetchInterval: 20000,
  })

  const { data: dailyRewardPoolData, refetch: refetchDaily } = useQuery({
    queryKey: ['daily-reward-pool'],
    queryFn: () => Pool(0, PoolIDs.DAILY_REWARD),
    refetchInterval: 20000,
  })

  const { data: monthlyRewardPoolData, refetch: refetchMonthly } = useQuery({
    queryKey: ['monthly-reward-pool'],
    queryFn: () => Pool(0, PoolIDs.MONTHLY_REWARD),
    refetchInterval: 20000,
  })

  // Calculate pool balances
  const pools: PoolBalance[] = [
    {
      id: PoolIDs.DAO,
      name: 'DAO Pool',
      balance: daoPoolData?.amount || 0,
      percentage: 0,
    },
    {
      id: PoolIDs.PLATFORM,
      name: 'Platform Pool',
      balance: platformPoolData?.amount || 0,
      percentage: 0,
    },
    {
      id: PoolIDs.RESERVE,
      name: 'Reserve Pool',
      balance: reservePoolData?.amount || 0,
      percentage: 0,
    },
    {
      id: PoolIDs.SHOP,
      name: 'Shop Pool',
      balance: shopPoolData?.amount || 0,
      percentage: 0,
    },
    {
      id: PoolIDs.DAILY_REWARD,
      name: 'Daily Reward Pool',
      balance: dailyRewardPoolData?.amount || 0,
      percentage: 0,
    },
    {
      id: PoolIDs.MONTHLY_REWARD,
      name: 'Monthly Reward Pool',
      balance: monthlyRewardPoolData?.amount || 0,
      percentage: 0,
    },
  ]

  // Calculate percentages
  const totalBalance = pools.reduce((sum, pool) => sum + pool.balance, 0)
  pools.forEach((pool) => {
    pool.percentage = totalBalance > 0 ? (pool.balance / totalBalance) * 100 : 0
  })

  const formatCNPY = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleOpenTransferModal = (fromPoolId: number) => {
    setTransferModal({
      isOpen: true,
      fromPoolId,
      toPoolId: null,
      amount: '',
    })
  }

  const handleCloseTransferModal = () => {
    setTransferModal({
      isOpen: false,
      fromPoolId: null,
      toPoolId: null,
      amount: '',
    })
  }

  const handleTransfer = async () => {
    if (!transferModal.fromPoolId || !transferModal.toPoolId || !transferModal.amount) {
      toast.error('Please fill in all fields')
      return
    }

    const amountNum = parseFloat(transferModal.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount')
      return
    }

    const amountMicro = Math.floor(amountNum * 1_000_000)

    // Get admin address from wallet auth session
    const walletAuth = loadStoredWalletAuth()
    if (!walletAuth?.address) {
      toast.error('Admin address not found. Please log in again.')
      return
    }
    const adminAddress = walletAuth.address

    try {
      const loadingToast = toast.loading('Submitting pool transfer...')
      
      // Call the backend admin endpoint - use ADMIN port from env var
      const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
      const response = await fetch(`${baseUrl}/v1/admin/pool-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Address': adminAddress,
        },
        body: JSON.stringify({
          fromPoolId: transferModal.fromPoolId,
          toPoolId: transferModal.toPoolId,
          amount: amountMicro,
          adminAddress: adminAddress,
        }),
      })

      toast.dismiss(loadingToast)

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Transfer failed')
      }

      // Success!
      toast.success(`Transfer successful! TX: ${data.txHash.substring(0, 12)}...`)
      
      const entry: AuditLogEntry = {
        timestamp: new Date(),
        operation: 'Transfer',
        fromPool: PoolNames[transferModal.fromPoolId],
        toPool: PoolNames[transferModal.toPoolId],
        amount: amountMicro,
        adminAddress: adminAddress,
        status: 'success',
        message: data.message,
      }
      
      setAuditLog([entry, ...auditLog])
      handleCloseTransferModal()
      
      // Refetch all pools
      refetchDao()
      refetchShop()
      refetchReserve()
      refetchPlatform()
      refetchDaily()
      refetchMonthly()
      
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Transfer failed')
      
      // Log error
      const entry: AuditLogEntry = {
        timestamp: new Date(),
        operation: 'Transfer',
        fromPool: PoolNames[transferModal.fromPoolId],
        toPool: transferModal.toPoolId ? PoolNames[transferModal.toPoolId] : undefined,
        amount: amountMicro,
        adminAddress: localStorage.getItem('admin_address') || 'Unknown',
        status: 'error',
        message: error.message,
      }
      setAuditLog([entry, ...auditLog])
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
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/admin"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-white">Pool Management</h1>
          </div>
          <p className="text-slate-400 text-lg">
            View pool balances and manage fund transfers
          </p>
          <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-400 mb-1">Fully Operational</h3>
                <p className="text-sm text-green-300/80">
                  Pool management is fully implemented with live blockchain integration. Pool transfers create on-chain transactions that are processed by the contract. All pool balances are queried from the blockchain state. Please use caution when transferring funds.
                </p>
              </div>
            </div>
          </div>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-400">Total Treasury Balance</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {formatCNPY(totalBalance)} <span className="text-xl text-slate-400">CNPY</span>
                  </p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">DAO Pool</p>
                  <p className="text-white font-medium">{((pools[0]?.percentage || 0)).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Game Pools</p>
                  <p className="text-white font-medium">
                    {((pools[1]?.percentage || 0) + (pools[2]?.percentage || 0) + (pools[3]?.percentage || 0)).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Reward Pools</p>
                  <p className="text-white font-medium">
                    {((pools[4]?.percentage || 0) + (pools[5]?.percentage || 0)).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pool Cards Grid */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Pool Balances</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
                    <div className="rounded-lg bg-purple-500/10 p-2">
                      <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">Balance</p>
                      <p className="text-2xl font-bold text-white">{formatCNPY(pool.balance)}</p>
                      <p className="text-xs text-slate-500">CNPY</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Percentage of Total</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${Math.min(pool.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white">{pool.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenTransferModal(pool.id)}
                      className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    >
                      Transfer From This Pool
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audit Log */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Operations</h2>
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
              {auditLog.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No operations yet. Pool operations will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/30 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Operation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLog.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {entry.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {entry.operation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {entry.fromPool}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {entry.toPool || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCNPY(entry.amount)} CNPY
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.status === 'success'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Transfer Modal */}
        {transferModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Transfer Between Pools</h3>
              
              <div className="space-y-4">
                {/* From Pool */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    From Pool
                  </label>
                  <div className="px-4 py-3 rounded-lg bg-slate-700/50 text-white">
                    {transferModal.fromPoolId ? PoolNames[transferModal.fromPoolId] : ''}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Balance: {formatCNPY(pools.find(p => p.id === transferModal.fromPoolId)?.balance || 0)} CNPY
                  </p>
                </div>

                {/* To Pool */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    To Pool
                  </label>
                  <select
                    value={transferModal.toPoolId || ''}
                    onChange={(e) => setTransferModal({ ...transferModal, toPoolId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select destination pool...</option>
                    {pools
                      .filter(p => p.id !== transferModal.fromPoolId)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (CNPY)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transferModal.amount}
                    onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Warning */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-300">
                    ⚠️ This action will modify pool balances. Please verify the amounts before confirming.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCloseTransferModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={!transferModal.toPoolId || !transferModal.amount}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
