import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createGame2048Client } from '../lib/chain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'
import {
  authenticateAdmin,
  isAdminAuthenticated,
  isAdminAddress,
  getAdminAddresses,
} from '../lib/adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [connectedAddress, setConnectedAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [adminAddresses, setAdminAddresses] = useState<string[]>([])

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (await isAdminAuthenticated()) {
        navigate('/admin')
      }
    }
    checkAuth()
  }, [navigate])

  // Fetch admin addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const addresses = await getAdminAddresses()
      if (addresses.length > 0) {
        setAdminAddresses(addresses)
      }
    }
    fetchAddresses()
  }, [])

  // Fetch wallet connection status
  const { data: status } = useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const client = await createGame2048Client()
      return client.status
    },
    refetchInterval: 2000,
  })

  // Get connected address from wallet auth
  useEffect(() => {
    const checkConnection = () => {
      const storedAuth = loadStoredWalletAuth()
      if (storedAuth?.address && !connectedAddress) {
        setConnectedAddress(storedAuth.address)
      }
    }
    checkConnection()
    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [connectedAddress])

  const handleLogin = async () => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet first on the Auth page')
      return
    }

    setIsLoading(true)
    
    try {
      // Check if address is authorized
      const isAuthorized = await isAdminAddress(connectedAddress)
      
      if (!isAuthorized) {
        toast.error('Access denied: Only the validator address can access admin panel')
        setIsLoading(false)
        return
      }

      // Get wallet auth to verify user is logged in
      const walletAuth = loadStoredWalletAuth()
      if (!walletAuth || walletAuth.address !== connectedAddress) {
        toast.error('Please sign in with your wallet on the Auth page first')
        setIsLoading(false)
        return
      }

      // Authenticate - using wallet auth timestamp as proof of authentication
      const success = await authenticateAdmin(connectedAddress, walletAuth.loggedInAt)
      
      if (success) {
        toast.success('Admin authentication successful')
        navigate('/admin')
      } else {
        toast.error('Authentication failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto flex max-w-[500px] flex-col gap-6 px-4 py-2 sm:px-6"
    >
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-card p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#53a6ff]/10 mb-4">
          <svg
            className="w-8 h-8 text-[#9fd0ff]"
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
        <p className="text-xs uppercase tracking-[0.18em] text-[#f6df84]">Restricted Access</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-white">Admin Access</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Connect your wallet to access the admin dashboard
        </p>
      </section>

      {/* Login Card */}
      <section className="rounded-2xl border border-white/10 bg-card p-6 space-y-6">
        {/* Wallet Status */}
        <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Wallet Connection
              </label>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
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
                    {adminAddresses.length > 0 && adminAddresses.some(addr => addr.toLowerCase() === connectedAddress.toLowerCase()) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4ade80]/10 text-[#4ade80]">
                        Admin ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ef4444]/10 text-[#f87171]">
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
                        className="text-xs text-[#53a6ff] hover:text-[#9fd0ff] mt-1"
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
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Backend Status
              </label>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{status?.label || 'Loading...'}</p>
                    <p className="text-xs text-slate-400">{status?.detail || 'Connecting...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Addresses Info */}
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                Authorized Admin{adminAddresses.length > 1 ? 's' : ''} ({adminAddresses.length})
              </label>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                {adminAddresses.length > 0 ? (
                  <div className="space-y-2">
                    {adminAddresses.map((addr, idx) => (
                      <div key={addr} className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-[#53a6ff]"
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
                        <p className="text-xs text-slate-400 font-mono">
                          {idx === 0 && <span className="text-[#53a6ff] mr-2">[Validator]</span>}
                          {addr.slice(0, 10)}...{addr.slice(-8)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full" />
                    <p className="text-sm text-slate-500">Loading admin addresses...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !connectedAddress || adminAddresses.length === 0 || !adminAddresses.some(addr => addr.toLowerCase() === connectedAddress.toLowerCase())}
              className="w-full rounded-xl bg-[#f0cf52] px-4 py-3 text-sm font-bold text-[#2e2510] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : !connectedAddress ? (
                'Connect Wallet First'
              ) : adminAddresses.length === 0 ? (
                'Loading...'
              ) : !adminAddresses.some(addr => addr.toLowerCase() === connectedAddress.toLowerCase()) ? (
                'Only Authorized Admins Can Access'
              ) : (
                'Access Admin Dashboard'
              )}
            </button>

            {/* Info */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 text-center">
                Admin access is restricted to authorized addresses only.
                <br />
                {adminAddresses.length > 1 
                  ? `${adminAddresses.length} addresses are currently authorized.`
                  : 'Only the validator address can access admin functions.'}
              </p>
            </div>
          </section>

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
  )
}
