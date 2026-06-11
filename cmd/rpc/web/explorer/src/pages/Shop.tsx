import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { shortAddress } from '../lib/address'
import { formatCNPY } from '../lib/utils'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import type { ChainConfig, PlayerStats, RedeemPreview, RedemptionHistory, RedemptionHistoryEntry } from '../lib/mockChain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function ShopPage() {
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [config, setConfig] = useState<ChainConfig | null>(null)
  const [preview, setPreview] = useState<RedeemPreview | null>(null)
  const [history, setHistory] = useState<RedemptionHistory | null>(null)
  const [status, setStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Checking backend',
    detail: 'Looking for the live shop backend.',
  })
  const [burnPoints, setBurnPoints] = useState('300')
  const [loginPassword, setLoginPassword] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRedeeming, setIsRedeeming] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      if (cancelled) {
        return
      }

      setStatus(client.status)
      const nextConfig = await client.getConfig()
      if (cancelled) {
        return
      }
      setConfig(nextConfig)

      const storedAuth = loadStoredWalletAuth()
      setStoredSessionAddress(storedAuth?.address ?? '')
      setLoginPassword(storedAuth?.password ?? '')

      // Set selected address to stored session for authenticated users
      const initialAddress = storedAuth?.address ?? ''
      setSelectedAddress(initialAddress)

      // Load wallets for display purposes
      if (client.status.mode === 'rpc') {
        const nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }
        setWallets(nextWallets)
      }

      if (initialAddress) {
        const [nextPlayer, nextPreview, nextHistory] = await Promise.all([
          client.getPlayer(initialAddress),
          client.getRedeemPreview(initialAddress, Number(burnPoints) || 0),
          client.getRedemptions(initialAddress),
        ])
        if (cancelled) {
          return
        }
        setPlayer(nextPlayer)
        setPreview(nextPreview)
        setHistory(nextHistory)
      }

      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load the shop view.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedAddress) {
      setPlayer(null)
      setPreview(null)
      setHistory(null)
      return
    }

    let cancelled = false

    async function refreshShop() {
      const client = await createGame2048Client()
      const burnAmount = Number(burnPoints) || 0
      const [nextPlayer, nextPreview, nextHistory] = await Promise.all([
        client.getPlayer(selectedAddress),
        client.getRedeemPreview(selectedAddress, burnAmount),
        client.getRedemptions(selectedAddress),
      ])
      if (cancelled) {
        return
      }
      
      // DEBUG: Log redemption history data
      console.log('🔍 Shop refresh - redemption history:', nextHistory)
      if (nextHistory?.redemptions?.length > 0) {
        console.log('🔍 First redemption entry:', nextHistory.redemptions[0])
        console.log('🔍 First entry txHash:', nextHistory.redemptions[0].txHash)
        console.log('🔍 txHash type:', typeof nextHistory.redemptions[0].txHash)
        console.log('🔍 txHash length:', nextHistory.redemptions[0].txHash?.length)
      }
      
      setPlayer(nextPlayer)
      setPreview(nextPreview)
      setHistory(nextHistory)
    }

    refreshShop().catch((error) => {
      console.error(error)
      toast.error('Unable to refresh the shop state.')
    })

    return () => {
      cancelled = true
    }
  }, [selectedAddress, burnPoints])

  const selectedWallet = wallets.find((wallet) => wallet.address === storedSessionAddress) ?? null
  const numericBurnPoints = Number(burnPoints) || 0
  const effectivePassword = loadStoredWalletAuth()?.password ?? loginPassword
  const canRedeem = !!storedSessionAddress && !!effectivePassword && !!preview?.valid && !isRedeeming

  // Progress calculations
  const minRedeemPoints = config?.shopMinRedeemPoints ?? 300
  const stepPoints = config?.shopRedeemStepPoints ?? 300
  const currentPoints = player?.classicPointsBalance ?? 0
  const pointsToNextRedemption = currentPoints < minRedeemPoints 
    ? minRedeemPoints - currentPoints
    : stepPoints - ((currentPoints - minRedeemPoints) % stepPoints)
  const progress = currentPoints < minRedeemPoints
    ? (currentPoints / minRedeemPoints) * 100
    : 100
  const canRedeemNow = currentPoints >= minRedeemPoints

  async function handleRedeem() {
    if (!storedSessionAddress) {
      toast.error('Please log in to redeem points.')
      return
    }
    if (!effectivePassword) {
      toast.error('Authentication required. Please log in again.')
      return
    }
    if (!preview?.valid) {
      toast.error(preview?.reason || 'Enter a valid redeem amount first.')
      return
    }

    console.log('=== SHOP REDEMPTION DIAGNOSTIC START ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Selected Address:', storedSessionAddress)
    console.log('Burn Points:', numericBurnPoints)

    // Capture initial state for comparison
    const initialBalance = player?.classicPointsBalance ?? 0
    const initialWalletBalance = player?.balance ?? 0
    const initialRedemptionCount = history?.redemptions.length ?? 0

    console.log('📊 Initial State Snapshot:')
    console.log('  - Classic Points Balance:', initialBalance)
    console.log('  - Wallet Balance:', initialWalletBalance)
    console.log('  - Redemption Count:', initialRedemptionCount)
    console.log('  - Expected Payout:', preview?.payoutAmount)

    try {
      setIsRedeeming(true)
      console.log('✅ Step 1: Set isRedeeming = true')
      
      console.log('⚡ Step 2: Creating client...')
      const client = await createGame2048Client()
      console.log('✅ Step 2 Complete: Client created, mode =', client.status.mode)
      
      console.log('⚡ Step 3: Calling redeemClassicPoints()...')
      const startTime = performance.now()
      const result = await client.redeemClassicPoints({
        address: storedSessionAddress,
        password: effectivePassword,
        burnPoints: numericBurnPoints,
      })
      const redeemDuration = performance.now() - startTime
      console.log(`✅ Step 3 Complete: Redemption succeeded in ${redeemDuration.toFixed(2)}ms`)
      console.log('  - TX Hash:', result.txHash)
      console.log('  - TX Stage:', result.txStage)
      console.log('  - Payout Amount:', result.payoutAmount)
      console.log('  - Submitted:', result.submitted)
      
      // Check if transaction was actually indexed (successful)
      const txIndexed = result.txStage === 'indexed' && result.submitted
      
      if (txIndexed) {
        console.log('✅ Transaction indexed successfully, using optimistic update')
        
        // Optimistically update the UI based on transaction result
        if (player && result.payoutAmount !== undefined) {
          const optimisticPlayer = {
            ...player,
            classicPointsBalance: Math.max(0, player.classicPointsBalance - numericBurnPoints),
            balance: player.balance + result.payoutAmount,
          }
          
          console.log('📊 Optimistic State Update:')
          console.log('  - Old classicPointsBalance:', player.classicPointsBalance)
          console.log('  - New classicPointsBalance:', optimisticPlayer.classicPointsBalance)
          console.log('  - Old balance:', player.balance)
          console.log('  - New balance:', optimisticPlayer.balance)
          
          setPlayer(optimisticPlayer)
          
          // Also create optimistic history entry
          if (history) {
            const optimisticHistory = {
              ...history,
              redemptions: [
                {
                  burnPoints: numericBurnPoints,
                  payoutAmount: result.payoutAmount,
                  redeemedAtUnix: Date.now() * 1000, // microseconds
                  redeemedAt: new Date().toISOString(),
                  txHash: result.txHash,
                },
                ...history.redemptions,
              ],
            }
            setHistory(optimisticHistory)
          }
          
          // Update preview for new balance
          const nextPreview = await client.getRedeemPreview(storedSessionAddress, numericBurnPoints)
          setPreview(nextPreview)
        }
        
        toast.success(`Redeemed ${formatCNPY(result.payoutAmount)} PROOF successfully!`)
      } else {
        console.log('⚠️ Transaction not indexed, falling back to polling...')
        
        // Fall back to polling if transaction wasn't indexed
        let nextPlayer, nextPreview, nextHistory, nextConfig
        let attempts = 0
        const maxAttempts = 35 // 35 × 200ms = 7 seconds (covers ~5s block time)
        const delayMs = 200
        
        while (attempts < maxAttempts) {
          attempts++
          console.log(`  🔄 Polling attempt ${attempts}/${maxAttempts}...`)
          
          const [player, preview, history, config] = await Promise.all([
            client.getPlayer(storedSessionAddress),
            client.getRedeemPreview(storedSessionAddress, numericBurnPoints),
            client.getRedemptions(storedSessionAddress),
            client.getConfig(),
          ])
          
          const pointsDecreased = player.classicPointsBalance < initialBalance
          const walletIncreased = player.balance > initialWalletBalance
          const historyIncreased = history.redemptions.length > initialRedemptionCount
          const dataIsFresh = pointsDecreased || walletIncreased || historyIncreased
          
          console.log(`    - classicPointsBalance: ${player.classicPointsBalance} (initial: ${initialBalance})`)
          console.log(`    - dataIsFresh: ${dataIsFresh}`)
          
          if (dataIsFresh) {
            nextPlayer = player
            nextPreview = preview
            nextHistory = history
            nextConfig = config
            console.log(`  ✅ Fresh data detected on attempt ${attempts}!`)
            break
          }
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          } else {
            nextPlayer = player
            nextPreview = preview
            nextHistory = history
            nextConfig = config
            console.log(`  ⚠️ Max attempts reached, using latest data`)
          }
        }
        
        setPlayer(nextPlayer)
        setPreview(nextPreview)
        setHistory(nextHistory)
        setConfig(nextConfig)
        
        toast.success(result.txHash ? 'Redemption submitted.' : 'Redemption submitted.')
      }
      
      console.log('=== SHOP REDEMPTION DIAGNOSTIC END ===')
    } catch (error) {
      console.error('❌ Error during redemption:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to redeem classic points.')
      console.log('=== SHOP REDEMPTION DIAGNOSTIC END (ERROR) ===')
    } finally {
      console.log('🏁 Finally block: Setting isRedeeming = false')
      setIsRedeeming(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8"
    >
      <section className="rounded-3xl border border-white/10 bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#f6df84]">Shop</p>
        <h1 className="mt-1.5 font-bold text-3xl leading-tight text-white sm:text-4xl">
          Redeem Classic Points
        </h1>
        <div className="mt-3 grid gap-2.5 md:grid-cols-3">
          <StatCard label="Spendable Points" value={`${player?.classicPointsBalance ?? 0}`} />
          <StatCard label="Lifetime Earned" value={`${player?.classicPointsEarned ?? 0}`} />
          <StatCard label="Balance" value={`${formatCNPY(player?.balance ?? 0)} PROOF`} />
        </div>
      </section>

      <section className="mt-4 space-y-4">
        {/* Progress Card - Show when user cannot redeem yet */}
        {!canRedeemNow && (
          <div className="rounded-2xl border border-[#53a6ff]/30 bg-[#53a6ff]/10 p-4">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#53a6ff]/20">
                <span className="text-base">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Keep Playing to Unlock Rewards</h3>
                <p className="mt-0.5 text-xs text-slate-300">
                  You need {pointsToNextRedemption} more Classic Points to reach the minimum redemption of {minRedeemPoints} points
                </p>
                
                {/* Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{currentPoints} points</span>
                    <span>{minRedeemPoints} minimum</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-[#53a6ff]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {Math.round(progress)}% complete
                  </p>
                </div>

                <div className="mt-2.5 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <p className="text-xs text-slate-400">
                    💡 Play Classic Mode to earn points • Redeem at {minRedeemPoints} points for {config?.shopRedemptionRateCnpy ?? 1} PROOF
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div>
            <h2 className="text-sm font-bold text-white">Redeem Points</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {config?.shopRedemptionRatePoints ?? 300} points = {config?.shopRedemptionRateCnpy ?? 1} PROOF • Redeem in {config?.shopRedeemStepPoints ?? 300}-point increments
            </p>
          </div>

          {/* Authenticated User - Streamlined Flow */}
          {storedSessionAddress ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <form onSubmit={(e) => { e.preventDefault(); handleRedeem(); }} className="space-y-2.5">
                {/* Active Wallet Display - Ultra Compact Identity Row */}
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#53a6ff]/5 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#53a6ff]/20">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {selectedWallet?.nickname ?? 'Your Wallet'}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{shortAddress(storedSessionAddress)}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Points to Redeem</label>
                  <input
                    value={burnPoints}
                    onChange={(event) => setBurnPoints(event.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    placeholder={`Minimum ${config?.shopMinRedeemPoints ?? 300}`}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                  />
                </div>
              </form>

              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reward Preview</p>
                
                {numericBurnPoints > 0 ? (
                  <>
                    <div className="mt-2.5 text-center">
                      <div className="inline-flex items-baseline gap-1.5">
                        <p className="text-3xl font-bold text-[#f6df84]">{formatCNPY(preview?.payoutAmount ?? 0)}</p>
                        <span className="text-sm font-semibold uppercase tracking-wide text-[#f6df84]/70">PROOF</span>
                      </div>
                    </div>

                    {/* Redemption Details - Contextual Display */}
                    <div className="mt-2.5 space-y-1 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Redeeming</span>
                        <span className="font-semibold text-white">{numericBurnPoints.toLocaleString()} pts</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Available</span>
                        <span className="font-semibold text-white">{currentPoints.toLocaleString()} pts</span>
                      </div>
                      {numericBurnPoints <= currentPoints && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">After</span>
                          <span className="font-semibold text-slate-300">{(currentPoints - numericBurnPoints).toLocaleString()} pts</span>
                        </div>
                      )}
                      {numericBurnPoints > currentPoints && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Need</span>
                          <span className="font-semibold text-amber-400">{(numericBurnPoints - currentPoints).toLocaleString()} more pts</span>
                        </div>
                      )}
                    </div>

                    <div className={`mt-2.5 rounded-lg border px-2.5 py-1.5 ${
                      preview?.valid
                        ? 'border-[#53d7a6]/30 bg-[#53d7a6]/10'
                        : 'border-amber-500/30 bg-amber-500/10'
                    }`}>
                      <p className={`text-xs font-semibold ${
                        preview?.valid ? 'text-[#53d7a6]' : 'text-amber-400'
                      }`}>
                        {preview?.valid ? '✓ Ready to redeem' : preview?.reason || 'Invalid amount'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="mt-2.5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
                      <span className="text-xl">💎</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">Enter Amount</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Min {minRedeemPoints} pts
                    </p>
                  </div>
                )}

                <button
                  onClick={handleRedeem}
                  disabled={!canRedeem}
                  className="mt-3 w-full rounded-xl bg-[#53a6ff] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRedeeming ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Redeeming...
                    </span>
                  ) : (
                    'Redeem Points'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated - Show Login Flow */
            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-6 py-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#53a6ff]/15">
                <span className="text-xl">🔐</span>
              </div>
              <p className="mt-2.5 text-sm font-bold text-white">Authentication Required</p>
              <p className="mt-1 text-xs text-slate-400">
                Log in to redeem your Classic Points for PROOF
              </p>
              <a
                href="/auth"
                className="mt-4 inline-flex rounded-xl bg-[#53a6ff] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
              >
                Log In to Continue
              </a>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-200">Redemption History</h2>
              <p className="mt-0.5 text-xs text-slate-400">{history?.redemptions.length ?? 0} total</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {history?.redemptions.length ? history.redemptions.map((entry) => (
              <RedemptionRow key={`${entry.redeemedAtUnix}-${entry.burnPoints}`} entry={entry} />
            )) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50">
                  <span className="text-lg">🎁</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">No redemptions yet</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Redeemed points will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-400">
          Loading shop state...
        </div>
      ) : null}
    </motion.div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function RedemptionRow({ entry }: { entry: RedemptionHistoryEntry }) {
  // DEBUG: Log what we're rendering
  console.log('🎨 RedemptionRow rendering:', {
    burnPoints: entry.burnPoints,
    txHash: entry.txHash,
    txHashType: typeof entry.txHash,
    txHashLength: entry.txHash?.length,
    hasTxHash: !!(entry.txHash && entry.txHash.length > 0)
  })
  
  if (entry.txHash && entry.txHash.length > 0) {
    return (
      <Link
        to={`/transaction/${entry.txHash}`}
        className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3.5 py-2 transition hover:border-[#53a6ff]/40 hover:bg-[#53a6ff]/5"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-white group-hover:text-[#9fd0ff]">{entry.burnPoints.toLocaleString()} points redeemed</p>
          <p className="mt-0.5 text-xs text-slate-500">{entry.redeemedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-[#53d7a6]/30 bg-[#53d7a6]/10 px-2.5 py-0.5">
            <p className="text-xs font-bold text-[#53d7a6]">+{formatCNPY(entry.payoutAmount)} PROOF</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-[#53a6ff]" />
        </div>
      </Link>
    )
  }
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3.5 py-2">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{entry.burnPoints.toLocaleString()} points redeemed</p>
        <p className="mt-0.5 text-xs text-slate-500">{entry.redeemedAt}</p>
      </div>
      <div className="rounded-full border border-[#53d7a6]/30 bg-[#53d7a6]/10 px-2.5 py-0.5">
        <p className="text-xs font-bold text-[#53d7a6]">+{formatCNPY(entry.payoutAmount)} PROOF</p>
      </div>
    </div>
  )
}

export default ShopPage
