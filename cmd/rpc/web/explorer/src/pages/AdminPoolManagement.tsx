import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { DAO, Pool, AllTransactions } from '../lib/api'
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
  status: 'success' | 'error' | 'pending'
  message?: string
  txHash?: string
  blockHeight?: number
}

export default function AdminPoolManagementPage() {
  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    fromPoolId: null,
    toPoolId: null,
    amount: '',
  })
  
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [visibleCount, setVisibleCount] = useState(10)

  // Fetch pool transfer transactions from blockchain
  const { data: poolTransferTxs, refetch: refetchAuditLog } = useQuery({
    queryKey: ['pool-transfer-transactions'],
    queryFn: async () => {
      try {
        // Query all transactions and filter for poolTransfer type
        const result = await AllTransactions(1, 100)
        const transactions = result?.results || []
        
        // Filter for pool transfer transactions
        const poolTransfers = transactions.filter((tx: any) => {
          const messageType = tx?.messageType || tx?.type || ''
          return messageType === 'poolTransfer' || messageType === 'pool-transfer'
        })
        
        // Convert to audit log entries
        const entries: AuditLogEntry[] = poolTransfers.map((tx: any) => {
          // Try multiple ways to access the message data
          // The msg might be at tx.msg, tx.message, tx.transaction.msg, etc.
          let msg = tx?.msg || tx?.message || tx?.data || {}
          
          // If msg is empty, try looking in transaction object
          if (Object.keys(msg).length === 0 && tx?.transaction) {
            msg = tx.transaction.msg || tx.transaction.message || {}
          }
          
          // Parse transaction data - handle different formats
          let fromPoolId = 0
          let toPoolId = 0
          let amount = 0
          
          // Try direct field access (multiple naming conventions)
          fromPoolId = msg?.fromPoolId || msg?.from_pool_id || msg?.FromPoolId || 
                       msg?.fromPoolID || msg?.from_pool_ID || 0
          toPoolId = msg?.toPoolId || msg?.to_pool_id || msg?.ToPoolId || 
                     msg?.toPoolID || msg?.to_pool_ID || 0
          amount = msg?.amount || msg?.Amount || 0
          
          // If still zero, try to parse from nested structures
          if (fromPoolId === 0 && msg?.value) {
            fromPoolId = msg.value.fromPoolId || msg.value.from_pool_id || 0
            toPoolId = msg.value.toPoolId || msg.value.to_pool_id || 0
            amount = msg.value.amount || 0
          }
          
          // Try accessing fields array (protobuf style)
          if (fromPoolId === 0 && msg?.fields) {
            fromPoolId = msg.fields.fromPoolId || msg.fields.from_pool_id || 0
            toPoolId = msg.fields.toPoolId || msg.fields.to_pool_id || 0
            amount = msg.fields.amount || 0
          }
          
          // Handle Long/number types AND string types
          if (typeof fromPoolId === 'string') {
            fromPoolId = parseInt(fromPoolId, 10) || 0
          } else if (typeof fromPoolId === 'object' && fromPoolId !== null) {
            fromPoolId = (fromPoolId as any).toNumber ? (fromPoolId as any).toNumber() : Number(fromPoolId)
          }
          
          if (typeof toPoolId === 'string') {
            toPoolId = parseInt(toPoolId, 10) || 0
          } else if (typeof toPoolId === 'object' && toPoolId !== null) {
            toPoolId = (toPoolId as any).toNumber ? (toPoolId as any).toNumber() : Number(toPoolId)
          }
          
          if (typeof amount === 'string') {
            amount = parseInt(amount, 10) || 0
          } else if (typeof amount === 'object' && amount !== null) {
            amount = (amount as any).toNumber ? (amount as any).toNumber() : Number(amount)
          }
          
          const txHash = tx?.txHash || tx?.hash || ''
          const blockHeight = tx?.blockHeight || tx?.height || 0
          const timestamp = tx?.blockTime || tx?.time || tx?.timestamp || Date.now()
          
          // Convert timestamp to Date
          let date: Date
          if (typeof timestamp === 'number') {
            if (timestamp > 1e15) {
              date = new Date(timestamp / 1000000)
            } else if (timestamp > 1e12) {
              date = new Date(timestamp)
            } else {
              date = new Date(timestamp * 1000)
            }
          } else {
            date = new Date(timestamp)
          }
          
          return {
            timestamp: date,
            operation: 'Transfer',
            fromPool: PoolNames[fromPoolId] || `Pool ${fromPoolId}`,
            toPool: PoolNames[toPoolId] || `Pool ${toPoolId}`,
            amount: amount,
            adminAddress: tx?.sender || tx?.signer || 'Unknown',
            status: 'success' as const,
            txHash: txHash,
            blockHeight: blockHeight,
          }
        })
        
        return entries
      } catch (error) {
        console.error('Failed to fetch pool transfer transactions:', error)
        return []
      }
    },
    refetchInterval: 20000, // Refetch every 20 seconds
  })

  // Load blockchain transactions into audit log
  useEffect(() => {
    if (poolTransferTxs && poolTransferTxs.length > 0) {
      setAuditLog(poolTransferTxs)
      // Reset visible count when new data loads
      setVisibleCount(10)
    }
  }, [poolTransferTxs])

  const showMoreTransactions = () => {
    setVisibleCount(prev => prev + 10)
  }

  const visibleAuditLog = auditLog.slice(0, visibleCount)
  const hasMore = visibleCount < auditLog.length

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

  const formatPROOF = (amount: number) => {
    return (amount / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const downloadAuditLog = () => {
    const csv = [
      ['Timestamp', 'Operation', 'From Pool', 'To Pool', 'Amount (PROOF)', 'Admin Address', 'Status', 'Block Height', 'Transaction Hash'].join(','),
      ...auditLog.map(entry => [
        entry.timestamp.toISOString(),
        entry.operation,
        entry.fromPool,
        entry.toPool || '',
        formatPROOF(entry.amount),
        entry.adminAddress,
        entry.status,
        entry.blockHeight || '',
        entry.txHash || '',
      ].map(field => `"${field}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pool-transfer-audit-log-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Audit log exported successfully')
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
      toast.success(
        <div>
          Transfer successful!{' '}
          <a 
            href={`/transaction/${data.txHash}`}
            className="underline font-semibold hover:text-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            View TX
          </a>
        </div>
      )
      
      // Add pending entry to audit log (will be replaced by blockchain data on next refetch)
      const entry: AuditLogEntry = {
        timestamp: new Date(),
        operation: 'Transfer',
        fromPool: PoolNames[transferModal.fromPoolId],
        toPool: PoolNames[transferModal.toPoolId],
        amount: amountMicro,
        adminAddress: adminAddress,
        status: 'pending',
        message: 'Transaction submitted, waiting for confirmation...',
        txHash: data.txHash,
      }
      
      setAuditLog([entry, ...auditLog])
      handleCloseTransferModal()
      
      // Refetch all pools and audit log
      setTimeout(() => {
        refetchDao()
        refetchShop()
        refetchReserve()
        refetchPlatform()
        refetchDaily()
        refetchMonthly()
        refetchAuditLog()
      }, 3000) // Wait 3 seconds for blockchain to process
      
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
        adminAddress: walletAuth?.address || 'Unknown',
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
                    {formatPROOF(totalBalance)} <span className="text-xl text-slate-400">PROOF</span>
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
                      <p className="text-2xl font-bold text-white">{formatPROOF(pool.balance)}</p>
                      <p className="text-xs text-slate-500">PROOF</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Operations</h2>
              {auditLog.length > 0 && (
                <button
                  onClick={downloadAuditLog}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
              {auditLog.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No operations yet. Pool operations will appear here.
                </div>
              ) : (
                <>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Block
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {visibleAuditLog.map((entry, idx) => (
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
                              {formatPROOF(entry.amount)} PROOF
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  entry.status === 'success'
                                    ? 'bg-green-500/10 text-green-400'
                                    : entry.status === 'pending'
                                    ? 'bg-yellow-500/10 text-yellow-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}
                              >
                                {entry.status === 'pending' && (
                                  <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                                {entry.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {entry.blockHeight ? (
                                <Link
                                  to={`/block/${entry.blockHeight}`}
                                  className="text-blue-400 hover:text-blue-300 underline"
                                >
                                  {entry.blockHeight}
                                </Link>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {entry.txHash ? (
                                <Link
                                  to={`/transaction/${entry.txHash}`}
                                  className="text-blue-400 hover:text-blue-300 underline font-mono"
                                >
                                  {entry.txHash.substring(0, 8)}...{entry.txHash.substring(entry.txHash.length - 6)}
                                </Link>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {hasMore && (
                    <div className="border-t border-white/5 p-4 text-center">
                      <button
                        onClick={showMoreTransactions}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </>
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
                    Balance: {formatPROOF(pools.find(p => p.id === transferModal.fromPoolId)?.balance || 0)} PROOF
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
                      .filter(p => p.id !== transferModal.fromPoolId && p.id !== PoolIDs.PLATFORM) // Block transfers TO platform pool
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  {transferModal.fromPoolId !== PoolIDs.PLATFORM && (
                    <p className="mt-1 text-xs text-amber-400">
                      ⓘ Platform pool cannot receive transfers (it can only send)
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (PROOF)
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
