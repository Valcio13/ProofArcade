import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Blocks } from '../lib/api'

interface BlockMetrics {
  blockTime: number // Average seconds between blocks
  blocksPerMinute: number
  transactionsPerSecond: number
  recentBlocks: any[]
}

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<BlockMetrics>({
    blockTime: 0,
    blocksPerMinute: 0,
    transactionsPerSecond: 0,
    recentBlocks: [],
  })

  // Fetch recent blocks (last 100 for accurate metrics)
  const { data: blocksData } = useQuery({
    queryKey: ['monitoring-blocks'],
    queryFn: () => Blocks(1, 100),
    refetchInterval: 5000, // Update every 5 seconds for live monitoring
  })

  // Calculate metrics when blocks data updates
  useEffect(() => {
    if (!blocksData) return

    const blocks = blocksData?.results || blocksData?.blocks || blocksData?.list || []
    if (!Array.isArray(blocks) || blocks.length < 2) return

    // Calculate average block time
    const timestamps: number[] = []
    const txCounts: number[] = []

    blocks.forEach((block) => {
      const time = block.blockHeader?.time || block.time
      const txCount = block.blockHeader?.totalTxs || block.totalTxs || 0
      
      if (time) {
        // Parse timestamp
        let timestamp: number
        if (typeof time === 'number') {
          timestamp = time > 1e15 ? time / 1000000 : time > 1e12 ? time : time * 1000
        } else {
          timestamp = new Date(time).getTime()
        }
        timestamps.push(timestamp)
        txCounts.push(txCount)
      }
    })

    if (timestamps.length < 2) return

    // Calculate average block time (in seconds)
    const timeDiffs = []
    for (let i = 1; i < timestamps.length; i++) {
      const diff = Math.abs(timestamps[i - 1] - timestamps[i]) / 1000 // Convert to seconds
      if (diff > 0 && diff < 300) { // Ignore outliers (> 5 minutes)
        timeDiffs.push(diff)
      }
    }

    const avgBlockTime = timeDiffs.length > 0
      ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
      : 0

    const blocksPerMinute = avgBlockTime > 0 ? 60 / avgBlockTime : 0

    // Calculate recent TPS (last 10 blocks)
    const recentTxs = txCounts.slice(0, 10)
    const totalRecentTxs = recentTxs.reduce((a, b) => a + b, 0)
    const recentTimeSpan = timestamps[0] - timestamps[Math.min(9, timestamps.length - 1)]
    const tps = recentTimeSpan > 0 ? (totalRecentTxs / (recentTimeSpan / 1000)) : 0

    setMetrics({
      blockTime: avgBlockTime,
      blocksPerMinute,
      transactionsPerSecond: tps,
      recentBlocks: blocks.slice(0, 20),
    })
  }, [blocksData])

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

  // Determine health status based on block time
  const getHealthStatus = () => {
    if (metrics.blockTime === 0) return { color: 'gray', text: 'Unknown', status: 'unknown' }
    if (metrics.blockTime < 6) return { color: 'green', text: 'Excellent', status: 'excellent' }
    if (metrics.blockTime < 10) return { color: 'green', text: 'Good', status: 'good' }
    if (metrics.blockTime < 15) return { color: 'yellow', text: 'Fair', status: 'fair' }
    return { color: 'red', text: 'Slow', status: 'slow' }
  }

  const health = getHealthStatus()

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      let ts: number
      if (typeof timestamp === 'number') {
        ts = timestamp > 1e15 ? timestamp / 1000000 : timestamp > 1e12 ? timestamp : timestamp * 1000
      } else {
        ts = new Date(timestamp).getTime()
      }
      const date = new Date(ts)
      return date.toLocaleTimeString()
    } catch {
      return 'N/A'
    }
  }

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      let ts: number
      if (typeof timestamp === 'number') {
        ts = timestamp > 1e15 ? timestamp / 1000000 : timestamp > 1e12 ? timestamp : timestamp * 1000
      } else {
        ts = new Date(timestamp).getTime()
      }
      const seconds = Math.floor((Date.now() - ts) / 1000)
      if (seconds < 60) return `${seconds}s ago`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      return `${Math.floor(seconds / 3600)}h ago`
    } catch {
      return 'N/A'
    }
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/admin"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-4xl font-bold text-white">Real-Time Monitoring</h1>
              </div>
              <p className="text-slate-400 text-lg">Live blockchain performance metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm text-slate-400">Live Updates</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Live Metrics Cards */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Block Time */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Avg Block Time</p>
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metrics.blockTime > 0 ? metrics.blockTime.toFixed(2) : '—'}
                  <span className="text-lg text-slate-400 ml-1">sec</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">Target: ~5s per block</p>
              </div>

              {/* Blocks Per Minute */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Block Rate</p>
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metrics.blocksPerMinute > 0 ? metrics.blocksPerMinute.toFixed(1) : '—'}
                  <span className="text-lg text-slate-400 ml-1">/ min</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">Target: ~12 blocks/min</p>
              </div>

              {/* TPS */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Throughput</p>
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metrics.transactionsPerSecond >= 0 ? metrics.transactionsPerSecond.toFixed(2) : '—'}
                  <span className="text-lg text-slate-400 ml-1">TPS</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">Transactions per second</p>
              </div>

              {/* Network Health */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Network Health</p>
                  <div className={`rounded-lg bg-${health.color}-500/10 p-2`}>
                    <svg className={`h-5 w-5 text-${health.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className={`text-3xl font-bold text-${health.color}-400`}>
                  {health.text}
                </p>
                <p className="mt-2 text-xs text-slate-500">Based on block production</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Blocks Timeline */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Blocks</h2>
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/30 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Height
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics.recentBlocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          Loading blocks...
                        </td>
                      </tr>
                    ) : (
                      metrics.recentBlocks.map((block, index) => {
                        const height = block.blockHeader?.height || block.height
                        const time = block.blockHeader?.time || block.time
                        const txCount = block.blockHeader?.totalTxs || block.totalTxs || 0
                        const hash = block.blockHeader?.hash || block.hash || ''

                        return (
                          <tr
                            key={index}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-white">{height || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-300">{formatTime(time)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-400">{formatTimeAgo(time)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-300">{txCount}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-mono text-slate-400">
                                {hash ? `${hash.substring(0, 12)}...` : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        )
                      })
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
