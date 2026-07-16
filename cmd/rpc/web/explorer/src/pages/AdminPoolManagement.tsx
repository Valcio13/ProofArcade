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

interface DepositModalState {
  isOpen: boolean
  amount: string
}

interface TransferModalState {
  isOpen: boolean
  fromPoolId: number | null
  toPoolId: number | null
  amount: string
}

interface WithdrawalModalState {
  isOpen: boolean
  poolId: number | null
  toAddress: string
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
  const [depositModal, setDepositModal] = useState<DepositModalState>({
    isOpen: false,
    amount: '',
  })
  
  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    fromPoolId: null,
    toPoolId: null,
    amount: '',
  })
  
  const [withdrawalModal, setWithdrawalModal] = useState<WithdrawalModalState>({
    isOpen: false,
    poolId: null,
    toAddress: '',
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
        
        // Filter for pool transactions (transfers, deposits, withdrawals)
        const poolTransactions = transactions.filter((tx: any) => {
          const messageType = tx?.messageType || tx?.type || ''
          return (
            messageType === 'poolTransfer' || 
            messageType === 'pool-transfer' ||
            messageType === 'pool_transfer' ||
            messageType === 'PoolTransfer' ||
            messageType === 'poolDeposit' ||
            messageType === 'pool-deposit' ||
            messageType === 'pool_deposit' ||
            messageType === 'PoolDeposit' ||
            messageType === 'poolWithdrawal' ||
            messageType === 'pool-withdrawal' ||
            messageType === 'pool_withdrawal' ||
            messageType === 'PoolWithdrawal' ||
            messageType.toLowerCase().includes('pool')
          )
        })
        
        // Convert to audit log entries
        const entries: AuditLogEntry[] = poolTransactions.map((tx: any) => {
          // Try multiple ways to access the message data
          // The msg might be at tx.msg, tx.message, tx.transaction.msg, etc.
          let msg = tx?.msg || tx?.message || tx?.data || {}
          
          // If msg is empty, try looking in transaction object
          if (Object.keys(msg).length === 0 && tx?.transaction) {
            msg = tx.transaction.msg || tx.transaction.message || {}
          }
          
          // Determine transaction type
          const messageType = tx?.messageType || tx?.type || ''
          const isDeposit = messageType.toLowerCase().includes('deposit')
          const isWithdrawal = messageType.toLowerCase().includes('withdrawal')
          const isTransfer = !isDeposit && !isWithdrawal
          
          // Parse transaction data - handle different formats
          let fromPoolId = 0
          let toPoolId = 0
          let poolId = 0
          let amount = 0
          
          // For deposits and withdrawals, look for poolId field
          if (isDeposit || isWithdrawal) {
            poolId = msg?.poolId || msg?.pool_id || msg?.PoolId || msg?.poolID || msg?.pool_ID || 0
            
            if (poolId === 0 && msg?.value) {
              poolId = msg.value.poolId || msg.value.pool_id || 0
            }
            if (poolId === 0 && msg?.fields) {
              poolId = msg.fields.poolId || msg.fields.pool_id || 0
            }
          }
          
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
          
          // Convert poolId for deposits/withdrawals
          if (typeof poolId === 'string') {
            poolId = parseInt(poolId, 10) || 0
          } else if (typeof poolId === 'object' && poolId !== null) {
            poolId = (poolId as any).toNumber ? (poolId as any).toNumber() : Number(poolId)
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
          
          // Determine operation type and pool names based on transaction type
          let operation: string
          let fromPool: string
          let toPool: string | undefined
          
          if (isDeposit) {
            operation = 'Deposit'
            fromPool = 'External Wallet'
            toPool = PoolNames[poolId] || `Pool ${poolId}`
          } else if (isWithdrawal) {
            operation = 'Withdrawal'
            fromPool = PoolNames[poolId] || `Pool ${poolId}`
            toPool = 'External Wallet'
          } else {
            operation = 'Transfer'
            fromPool = PoolNames[fromPoolId] || `Pool ${fromPoolId}`
            toPool = PoolNames[toPoolId] || `Pool ${toPoolId}`
          }
          
          return {
            timestamp: date,
            operation,
            fromPool,
            toPool,
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

  const handleOpenWithdrawalModal = (poolId: number) => {
    setWithdrawalModal({
      isOpen: true,
      poolId,
      toAddress: '',
      amount: '',
    })
  }

  const handleCloseWithdrawalModal = () => {
    setWithdrawalModal({
      isOpen: false,
      poolId: null,
      toAddress: '',
      amount: '',
    })
  }

  const handleOpenDepositModal = () => {
    setDepositModal({
      isOpen: true,
      amount: '',
    })
  }

  const handleCloseDepositModal = () => {
    setDepositModal({
      isOpen: false,
      amount: '',
    })
  }

  const handleDeposit = async () => {
    if (!depositModal.amount) {
      toast.error('Please enter an amount')
      return
    }

    const amountNum = parseFloat(depositModal.amount)
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
      const loadingToast = toast.loading('Submitting deposit to Reserve Pool...')
      
      // Call the backend admin endpoint
      const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
      const response = await fetch(`${baseUrl}/v1/admin/pool-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Address': adminAddress,
        },
        body: JSON.stringify({
          poolId: PoolIDs.RESERVE,
          amount: amountMicro,
          adminAddress: adminAddress,
        }),
      })

      toast.dismiss(loadingToast)

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Deposit failed')
      }

      // Success!
      toast.success(
        <div>
          Deposit successful!{' '}
          <a 
            href={`/transaction/${data.txHash}`}
            className="underline font-semibold hover:text-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            View TX
          </a>
        </div>
      )
      
      handleCloseDepositModal()
      
      // Refetch reserve pool
      setTimeout(() => {
        refetchReserve()
        refetchAuditLog()
      }, 3000)
      
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Deposit failed')
    }
  }

  const handleWithdrawal = async () => {
    if (!withdrawalModal.poolId || !withdrawalModal.toAddress || !withdrawalModal.amount) {
      toast.error('Please fill in all fields')
      return
    }

    const amountNum = parseFloat(withdrawalModal.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount')
      return
    }

    const amountMicro = Math.floor(amountNum * 1_000_000)

    // Validate address format (basic check)
    if (!withdrawalModal.toAddress.match(/^[0-9a-fA-F]+$/)) {
      toast.error('Invalid address format (must be hex)')
      return
    }

    // Get admin address from wallet auth session
    const walletAuth = loadStoredWalletAuth()
    if (!walletAuth?.address) {
      toast.error('Admin address not found. Please log in again.')
      return
    }
    const adminAddress = walletAuth.address
    
    console.log('[WITHDRAWAL DEBUG] Admin address:', adminAddress)
    console.log('[WITHDRAWAL DEBUG] Pool ID:', withdrawalModal.poolId)
    console.log('[WITHDRAWAL DEBUG] To address:', withdrawalModal.toAddress)
    console.log('[WITHDRAWAL DEBUG] Amount (micro):', amountMicro)

    try {
      const loadingToast = toast.loading('Submitting pool withdrawal...')
      
      // Call the backend admin endpoint
      const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
      const response = await fetch(`${baseUrl}/v1/admin/pool-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Address': adminAddress,
        },
        body: JSON.stringify({
          poolId: withdrawalModal.poolId,
          toAddress: withdrawalModal.toAddress,
          amount: amountMicro,
          adminAddress: adminAddress,
        }),
      })

      toast.dismiss(loadingToast)

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Withdrawal failed')
      }

      // Success!
      toast.success(
        <div>
          Withdrawal successful!{' '}
          <a 
            href={`/transaction/${data.txHash}`}
            className="underline font-semibold hover:text-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            View TX
          </a>
        </div>
      )
      
      handleCloseWithdrawalModal()
      
      // Refetch all pools and audit log
      setTimeout(() => {
        refetchDao()
        refetchShop()
        refetchReserve()
        refetchPlatform()
        refetchDaily()
        refetchMonthly()
        refetchAuditLog()
      }, 3000)
      
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Withdrawal failed')
    }
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
              Pool Management
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          View pool balances and manage fund transfers
        </p>
        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
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
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Treasury Overview */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Overview</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Treasury Overview</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Treasury Balance</p>
                    <p className="text-4xl font-black text-[#f6df84] mt-2">
                      {formatPROOF(totalBalance)} <span className="text-xl text-slate-400">PROOF</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#53a6ff]/10 p-3 text-[#9fd0ff]">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </section>
          </motion.div>

          {/* Pool Cards Grid */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Balances</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Pool Balances</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pools.map((pool) => (
                  <div
                    key={pool.id}
                    className="rounded-2xl border border-white/10 bg-card p-6 transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
                      <div className="rounded-xl bg-[#a78bfa]/10 p-2.5 text-[#c4b5fd]">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Balance</p>
                        <p className="text-2xl font-black text-[#f6df84]">{formatPROOF(pool.balance)}</p>
                        <p className="text-xs text-slate-500">PROOF</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Percentage of Total</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#a78bfa]"
                              style={{ width: `${Math.min(pool.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{pool.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenTransferModal(pool.id)}
                        className="w-full mt-4 px-4 py-2 rounded-xl bg-[#53a6ff]/10 text-[#9fd0ff] hover:bg-[#53a6ff]/20 transition-colors text-sm font-semibold"
                      >
                        Transfer From This Pool
                      </button>
                      {pool.id === PoolIDs.RESERVE && (
                        <button
                          onClick={handleOpenDepositModal}
                          className="w-full mt-2 px-4 py-2 rounded-xl bg-[#f0cf52]/10 text-[#f6df84] hover:bg-[#f0cf52]/20 transition-colors text-sm font-semibold"
                        >
                          Deposit to Reserve Pool
                        </button>
                      )}
                      {pool.id === PoolIDs.PLATFORM && (
                        <button
                          onClick={() => handleOpenWithdrawalModal(pool.id)}
                          className="w-full mt-2 px-4 py-2 rounded-xl bg-[#4ade80]/10 text-[#86efac] hover:bg-[#4ade80]/20 transition-colors text-sm font-semibold"
                        >
                          Withdraw to External Wallet
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Audit Log */}
          <motion.div variants={itemVariants}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Activity</p>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Recent Operations</h2>
                </div>
                {auditLog.length > 0 && (
                  <button
                    onClick={downloadAuditLog}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors text-sm font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
                {auditLog.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No operations yet. Pool operations will appear here.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/20 border-b border-white/10">
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
                      <div className="border-t border-white/10 p-4 text-center">
                        <button
                          onClick={showMoreTransactions}
                          className="px-6 py-3 rounded-xl bg-[#f0cf52] text-[#2e2510] hover:brightness-105 transition-all font-bold text-sm"
                        >
                          Show More
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
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

        {/* Withdrawal Modal */}
        {withdrawalModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Withdraw to External Wallet</h3>
              
              <div className="space-y-4">
                {/* From Pool */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    From Pool
                  </label>
                  <div className="px-4 py-3 rounded-lg bg-slate-700/50 text-white">
                    {withdrawalModal.poolId ? PoolNames[withdrawalModal.poolId] : ''}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Balance: {formatPROOF(pools.find(p => p.id === withdrawalModal.poolId)?.balance || 0)} PROOF
                  </p>
                </div>

                {/* To Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Destination Wallet Address
                  </label>
                  <input
                    type="text"
                    value={withdrawalModal.toAddress}
                    onChange={(e) => setWithdrawalModal({ ...withdrawalModal, toAddress: e.target.value })}
                    placeholder="Enter hex address (without 0x prefix)"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Enter the external wallet address (hex format)
                  </p>
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
                    value={withdrawalModal.amount}
                    onChange={(e) => setWithdrawalModal({ ...withdrawalModal, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none"
                  />
                </div>

                {/* Warning */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-xs text-red-300">
                    ⚠️ This will send PROOF tokens from the pool to an external wallet address. This action is irreversible. Please verify the address carefully.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCloseWithdrawalModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={!withdrawalModal.toAddress || !withdrawalModal.amount}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Deposit Modal */}
        {depositModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Deposit to Reserve Pool</h3>
              
              <div className="space-y-4">
                {/* To Pool */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Destination Pool
                  </label>
                  <div className="px-4 py-3 rounded-lg bg-slate-700/50 text-white">
                    Reserve Pool
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Current Balance: {formatPROOF(pools.find(p => p.id === PoolIDs.RESERVE)?.balance || 0)} PROOF
                  </p>
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
                    value={depositModal.amount}
                    onChange={(e) => setDepositModal({ ...depositModal, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-[#f0cf52] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    This will transfer PROOF from your wallet to the Reserve Pool
                  </p>
                </div>

                {/* Info */}
                <div className="rounded-lg border border-[#f6df84]/20 bg-[#f6df84]/10 p-3">
                  <p className="text-xs text-[#f6df84]">
                    ℹ️ Deposits are only allowed to the Reserve Pool. This helps maintain protocol reserves for emergencies and future development.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCloseDepositModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositModal.amount}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#f0cf52] text-[#2e2510] hover:brightness-105 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deposit
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </motion.div>
  )
}
