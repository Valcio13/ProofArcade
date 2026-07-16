import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminModerationPage() {
  const [targetAddress, setTargetAddress] = useState('')
  const [banReason, setBanReason] = useState('')
  const [unbanReason, setUnbanReason] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleBanPlayer = async () => {
    if (!targetAddress.trim()) {
      toast.error('Player address is required')
      return
    }

    if (!banReason.trim()) {
      toast.error('Ban reason is required')
      return
    }

    setLoading(true)

    try {
      const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
      const response = await fetch(`${baseUrl}/v1/admin/ban-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAddress,
          reason: banReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          <div>
            <p className="font-semibold">Player banned successfully!</p>
            <p className="text-sm mt-1">
              Tx: <a href={`/transaction/${result.txHash}`} className="text-blue-400 hover:text-blue-300">{result.txHash.slice(0, 12)}...</a>
            </p>
          </div>,
          { duration: 5000 }
        )
        setTargetAddress('')
        setBanReason('')
      } else {
        toast.error(result.message || 'Ban operation failed')
      }
    } catch (error) {
      console.error('Ban error:', error)
      toast.error('Failed to submit ban transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleUnbanPlayer = async () => {
    if (!targetAddress.trim()) {
      toast.error('Player address is required')
      return
    }

    if (!unbanReason.trim()) {
      toast.error('Unban reason is required')
      return
    }

    setLoading(true)

    try {
      const baseUrl = import.meta.env.VITE_ADMIN_RPC_URL || 'http://localhost:15003'
      const response = await fetch(`${baseUrl}/v1/admin/unban-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAddress,
          reason: unbanReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          <div>
            <p className="font-semibold">Player unbanned successfully!</p>
            <p className="text-sm mt-1">
              Tx: <a href={`/transaction/${result.txHash}`} className="text-blue-400 hover:text-blue-300">{result.txHash.slice(0, 12)}...</a>
            </p>
          </div>,
          { duration: 5000 }
        )
        setTargetAddress('')
        setUnbanReason('')
      } else {
        toast.error(result.message || 'Unban operation failed')
      }
    } catch (error) {
      console.error('Unban error:', error)
      toast.error('Failed to submit unban transaction')
    } finally {
      setLoading(false)
    }
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
              Player Moderation
            </h1>
          </div>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-300">
          Ban or unban players from gameplay
        </p>
      </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Warning Banner */}
          <section>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">Moderation Policy</h3>
                  <ul className="text-sm text-amber-100 space-y-1">
                    <li>• Banned players cannot start new games</li>
                    <li>• Player funds are never frozen or seized</li>
                    <li>• Leaderboard scores remain visible</li>
                    <li>• Banned players receive no rewards</li>
                    <li>• All bans are recorded on-chain</li>
                    <li>• Reason is required for audit trail</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Target Address Input */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Player Selection</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Target Address</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Target Player Address
              </label>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f0cf52] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter the full address of the player to moderate
              </p>
            </div>
          </section>

          {/* Ban Section */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Moderation Action</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Ban Player</h2>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-card p-6">
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Ban Reason <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Describe the reason for banning this player..."
                rows={4}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-2 mb-4">
                This reason will be recorded on-chain and publicly visible
              </p>
              <button
                onClick={handleBanPlayer}
                disabled={loading || !targetAddress.trim() || !banReason.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ef4444] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-white transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Ban Player
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Unban Section */}
          <section>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Restore Access</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Unban Player</h2>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-card p-6">
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Unban Reason <span className="text-[#4ade80]">*</span>
              </label>
              <textarea
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                placeholder="Describe the reason for unbanning this player..."
                rows={4}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-2 mb-4">
                This reason will be recorded on-chain and publicly visible
              </p>
              <button
                onClick={handleUnbanPlayer}
                disabled={loading || !targetAddress.trim() || !unbanReason.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-[#0f1a14] transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Unban Player
                  </>
                )}
              </button>
            </div>
          </section>
        </motion.div>
    </motion.div>
  )
}
