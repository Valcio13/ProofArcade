import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { loadStoredWalletAuth } from '../lib/walletAuth'
import { adminRPCURL } from '../lib/api'

const FAUCET_AMOUNT = 100 // 100 PROOF tokens per day
const FAUCET_COOLDOWN_HOURS = 24

interface FaucetState {
  canClaim: boolean
  lastClaimTime: number | null
  timeUntilNextClaim: string
  isClaiming: boolean
  claimSuccess: boolean
  claimError: string | null
}

export function DailyFaucet() {
  const wallet = loadStoredWalletAuth()
  
  // Check if faucet was hidden after claim
  const getInitialVisibility = () => {
    if (!wallet?.address) return true
    const hiddenKey = `faucet_hidden_${wallet.address}`
    return !localStorage.getItem(hiddenKey)
  }
  
  const [isVisible, setIsVisible] = useState(getInitialVisibility)
  const [faucetState, setFaucetState] = useState<FaucetState>({
    canClaim: true,
    lastClaimTime: null,
    timeUntilNextClaim: '',
    isClaiming: false,
    claimSuccess: false,
    claimError: null,
  })

  // Check local storage for last claim time
  useEffect(() => {
    if (!wallet?.address) return

    const storageKey = `faucet_last_claim_${wallet.address}`
    const hiddenKey = `faucet_hidden_${wallet.address}`
    const lastClaimStr = localStorage.getItem(storageKey)
    
    if (lastClaimStr) {
      const lastClaimTime = parseInt(lastClaimStr, 10)
      const now = Date.now()
      const timeSinceClaim = now - lastClaimTime
      const cooldownMs = FAUCET_COOLDOWN_HOURS * 60 * 60 * 1000
      
      if (timeSinceClaim < cooldownMs) {
        setFaucetState(prev => ({
          ...prev,
          canClaim: false,
          lastClaimTime,
        }))
      } else {
        // Cooldown expired, show the faucet again
        localStorage.removeItem(hiddenKey)
        setIsVisible(true)
      }
    }
  }, [wallet?.address])

  // Update countdown timer
  useEffect(() => {
    if (faucetState.canClaim || !faucetState.lastClaimTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const cooldownMs = FAUCET_COOLDOWN_HOURS * 60 * 60 * 1000
      const timeRemaining = (faucetState.lastClaimTime! + cooldownMs) - now

      if (timeRemaining <= 0) {
        setFaucetState(prev => ({
          ...prev,
          canClaim: true,
          timeUntilNextClaim: '',
        }))
        clearInterval(interval)
      } else {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
        setFaucetState(prev => ({
          ...prev,
          timeUntilNextClaim: `${hours}h ${minutes}m ${seconds}s`,
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [faucetState.canClaim, faucetState.lastClaimTime])

  const handleClaim = async () => {
    if (!wallet?.address) {
      setFaucetState(prev => ({
        ...prev,
        claimError: 'Please create a wallet first',
      }))
      return
    }

    setFaucetState(prev => ({
      ...prev,
      isClaiming: true,
      claimError: null,
      claimSuccess: false,
    }))

    try {
      console.log('[DailyFaucet] Claiming tokens for:', wallet.address)
      console.log('[DailyFaucet] Using admin RPC URL:', adminRPCURL)
      
      const response = await fetch(`${adminRPCURL}/v1/admin/dev-faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet.address,
          amount: FAUCET_AMOUNT,
        }),
      })

      console.log('[DailyFaucet] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[DailyFaucet] Error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[DailyFaucet] Success:', data)

      // Store claim time in local storage
      const now = Date.now()
      const storageKey = `faucet_last_claim_${wallet.address}`
      const hiddenKey = `faucet_hidden_${wallet.address}`
      localStorage.setItem(storageKey, now.toString())
      localStorage.setItem(hiddenKey, 'true')

      setFaucetState(prev => ({
        ...prev,
        isClaiming: false,
        claimSuccess: true,
        canClaim: false,
        lastClaimTime: now,
      }))

      // Hide the card after 3 seconds with a fade out
      setTimeout(() => {
        setIsVisible(false)
      }, 3000)

    } catch (error) {
      console.error('Faucet claim failed:', error)
      setFaucetState(prev => ({
        ...prev,
        isClaiming: false,
        claimError: error instanceof Error ? error.message : 'Failed to claim tokens',
      }))
    }
  }

  if (!wallet?.address || !isVisible) {
    return null // Don't show faucet if no wallet or hidden after claim
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[#4ade80]/30 bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/5 p-6 shadow-lg shadow-[#4ade80]/5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Info */}
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#4ade80]/15 p-3">
            <Coins className="h-7 w-7 text-[#4ade80]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Daily Faucet</h3>
            <p className="mt-1 text-sm text-slate-300">
              Get <span className="font-bold text-[#4ade80]">{FAUCET_AMOUNT} PROOF</span> every 24 hours
            </p>
            {!faucetState.canClaim && faucetState.timeUntilNextClaim && (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                Next claim in: <span className="font-mono">{faucetState.timeUntilNextClaim}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleClaim}
            disabled={!faucetState.canClaim || faucetState.isClaiming}
            className={`relative flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition ${
              faucetState.canClaim && !faucetState.isClaiming
                ? 'bg-[#4ade80] text-[#0f1a14] hover:brightness-105'
                : 'cursor-not-allowed bg-slate-700 text-slate-400'
            }`}
          >
            {faucetState.isClaiming ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Claiming...
              </>
            ) : faucetState.canClaim ? (
              <>
                <Coins className="h-5 w-5" />
                Claim Tokens
              </>
            ) : (
              <>
                <Clock className="h-5 w-5" />
                On Cooldown
              </>
            )}
          </button>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {faucetState.claimSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-xs text-[#4ade80]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Successfully claimed {FAUCET_AMOUNT} PROOF!
              </motion.div>
            )}
            {faucetState.claimError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-xs text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                {faucetState.claimError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
