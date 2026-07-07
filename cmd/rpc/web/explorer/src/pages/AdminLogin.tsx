import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createGame2048Client } from '../lib/chain2048'
import {
  authenticateAdmin,
  isAdminAuthenticated,
  isAdminAddress,
  getAdminAddresses,
} from '../lib/adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [connectedAddress, setConnectedAddress] = useState<string>('')

  // Check if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin')
    }
  }, [navigate])

  // Fetch wallet connection status
  const { data: status } = useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const client = await createGame2048Client()
      return client.status
    },
    refetchInterval: 2000,
  })

  // Try to get connected address from localStorage (set by Auth page)
  useEffect(() => {
    const checkConnection = () => {
      const stored = localStorage.getItem('connected_address')
      if (stored && !connectedAddress) {
        setConnectedAddress(stored)
      }
    }
    checkConnection()
    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [connectedAddress])

  const handleLogin = () => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet first on the Auth page')
      return
    }

    if (!isAdminAddress(connectedAddress)) {
      toast.error('Access denied: Your address is not authorized as admin')
      return
    }

    if (authenticateAdmin(connectedAddress)) {
      toast.success('Admin authentication successful')
      navigate('/admin')
    } else {
      toast.error('Authentication failed')
    }
  }

  const adminAddresses = getAdminAddresses()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-slate-400">
              Connect your wallet to access the admin dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm space-y-6">
            {/* Wallet Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Wallet Connection
              </label>
              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                {connectedAddress ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-white">Connected</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-6)}
                        </p>
                      </div>
                    </div>
                    {isAdminAddress(connectedAddress) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                        Authorized
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        Not Authorized
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">
                        No wallet connected.
                      </p>
                      <button
                        onClick={() => navigate('/auth')}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                      >
                        Go to Auth page to connect →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Backend Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Backend Status
              </label>
              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{status?.label || 'Loading...'}</p>
                    <p className="text-xs text-slate-400">{status?.detail || 'Connecting...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Authorized Admins
              </label>
              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                {adminAddresses.length > 0 ? (
                  <div className="space-y-2">
                    {adminAddresses.map((addr, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs text-slate-400 font-mono">
                          {addr.slice(0, 10)}...{addr.slice(-8)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No admin addresses configured. Add via browser console: <code className="text-xs">localStorage.setItem('proofarcade_admin_addresses', JSON.stringify(['0xYourAddress']))</code>
                  </p>
                )}
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={!connectedAddress || !isAdminAddress(connectedAddress)}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {!connectedAddress
                ? 'Connect Wallet First'
                : !isAdminAddress(connectedAddress)
                ? 'Access Denied'
                : 'Access Admin Dashboard'}
            </button>

            {/* Info */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 text-center">
                Admin access is restricted to authorized wallet addresses only.
                <br />
                Contact system administrator for access requests.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
