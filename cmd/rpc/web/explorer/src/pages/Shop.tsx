import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { shortAddress } from '../lib/address'
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

      let nextWallets: RpcKeystoreAccount[] = []
      const storedAuth = loadStoredWalletAuth()
      if (client.status.mode === 'rpc') {
        nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }
        setWallets(nextWallets)
      }

      const initialAddress = storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)
        ? storedAuth.address
        : nextWallets[0]?.address ?? storedAuth?.address ?? ''
      setSelectedAddress(initialAddress)
      setStoredSessionAddress(storedAuth?.address ?? '')
      setLoginPassword(storedAuth?.address === initialAddress ? storedAuth.password : '')

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

  useEffect(() => {
    const storedAuth = loadStoredWalletAuth()
    if (storedAuth?.address === selectedAddress) {
      setLoginPassword(storedAuth.password)
      setStoredSessionAddress(storedAuth.address)
    } else if (selectedAddress !== storedSessionAddress) {
      setLoginPassword('')
    }
  }, [selectedAddress, storedSessionAddress])

  const selectedWallet = wallets.find((wallet) => wallet.address === selectedAddress) ?? null
  const numericBurnPoints = Number(burnPoints) || 0
  const effectivePassword = storedSessionAddress === selectedAddress ? (loadStoredWalletAuth()?.password ?? loginPassword) : loginPassword
  const canRedeem = !!selectedAddress && !!effectivePassword && !!preview?.valid && !isRedeeming

  async function handleRedeem() {
    if (!selectedAddress) {
      toast.error('Choose a wallet first.')
      return
    }
    if (!effectivePassword) {
      toast.error('Enter the wallet password first.')
      return
    }
    if (!preview?.valid) {
      toast.error(preview?.reason || 'Enter a valid redeem amount first.')
      return
    }

    try {
      setIsRedeeming(true)
      const client = await createGame2048Client()
      const result = await client.redeemClassicPoints({
        address: selectedAddress,
        password: effectivePassword,
        burnPoints: numericBurnPoints,
      })
      const [nextPlayer, nextPreview, nextHistory] = await Promise.all([
        client.getPlayer(selectedAddress),
        client.getRedeemPreview(selectedAddress, numericBurnPoints),
        client.getRedemptions(selectedAddress),
      ])
      setPlayer(nextPlayer)
      setPreview(nextPreview)
      setHistory(nextHistory)
      toast.success(result.txHash ? `Redeem submitted for ${result.payoutAmount} PROOF.` : 'Redeem submitted.')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to redeem classic points.')
    } finally {
      setIsRedeeming(false)
    }
  }

  const rules = useMemo(() => [
    ['Rate', `${config?.shopRedemptionRatePoints ?? 300} points -> ${config?.shopRedemptionRateCnpy ?? 1} PROOF`],
    ['Minimum', `${config?.shopMinRedeemPoints ?? 300} points`],
    ['Step size', `${config?.shopRedeemStepPoints ?? 300} points`],
    ['Daily point earn cap', `${config?.classicDailyPointsCap ?? 2000} points / UTC day`],
  ], [config])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8"
    >
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_22%),linear-gradient(155deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.25)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#f6df84]">Point Shop</p>
        <h1 className="mt-4 font-['Georgia'] text-5xl leading-none text-white sm:text-6xl">
          Redeem points for PROOF.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          Spend points earned from successful classic runs. Burn points, receive PROOF, and keep the flow simple.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Spendable Points" value={`${player?.classicPointsBalance ?? 0}`} />
          <StatCard label="Lifetime Earned" value={`${player?.classicPointsEarned ?? 0}`} />
          <StatCard label="Balance" value={`${player?.balance ?? 0} PROOF`} />
        </div>
      </section>

      <section className="mt-6 space-y-6">
        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Redeem</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Points to PROOF</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Redeem in {config?.shopRedeemStepPoints ?? 300}-point steps at {config?.shopRedemptionRatePoints ?? 300} points for {config?.shopRedemptionRateCnpy ?? 1} PROOF.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Wallet</label>
                <select
                  value={selectedAddress}
                  onChange={(event) => setSelectedAddress(event.target.value)}
                  disabled={status.mode !== 'rpc' || wallets.length === 0}
                  className="mt-2 w-full rounded-[1rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-[#53a6ff]"
                >
                  {wallets.length === 0 ? <option value="">{status.mode === 'rpc' ? 'No saved wallets' : 'Mock wallet'}</option> : null}
                  {wallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.nickname} ({shortAddress(wallet.address)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Wallet Password</label>
                <input
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  type="password"
                  placeholder={storedSessionAddress === selectedAddress ? 'Using saved local login' : 'Enter wallet password'}
                  className="mt-2 w-full rounded-[1rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Burn Points</label>
                <input
                  value={burnPoints}
                  onChange={(event) => setBurnPoints(event.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder={`${config?.shopMinRedeemPoints ?? 300}`}
                  className="mt-2 w-full rounded-[1rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                />
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Preview</p>
              <p className="mt-3 text-3xl font-black text-white">{preview?.payoutAmount ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">PROOF payout</p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Burning {numericBurnPoints || 0} from {player?.classicPointsBalance ?? 0} spendable points.
              </p>
              <div className={`mt-4 rounded-[0.95rem] border px-3 py-3 text-sm ${
                preview?.valid
                  ? 'border-[#53d7a6]/30 bg-[#53d7a6]/10 text-[#d1ffef]'
                  : 'border-[#f6df84]/20 bg-[#f6df84]/8 text-[#f8e8a5]'
              }`}>
                {preview?.valid ? 'Ready to redeem.' : preview?.reason || 'Enter a redeem amount to preview.'}
              </div>
              <button
                onClick={handleRedeem}
                disabled={!canRedeem}
                className="mt-4 w-full rounded-[1rem] bg-[#53a6ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#66b2ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRedeeming ? 'Submitting...' : 'Redeem Points'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Redemption History</p>
            <p className="text-sm text-slate-500">{history?.redemptions.length ?? 0} total</p>
          </div>
          <div className="mt-4 space-y-3">
            {history?.redemptions.length ? history.redemptions.map((entry) => (
              <RedemptionRow key={`${entry.redeemedAtUnix}-${entry.burnPoints}`} entry={entry} />
            )) : (
              <div className="rounded-[1rem] border border-dashed border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-400">
                No redemptions yet for this wallet.
              </div>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-400">
          Loading shop state...
        </div>
      ) : null}
    </motion.div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function RedemptionRow({ entry }: { entry: RedemptionHistoryEntry }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{entry.burnPoints} points burned</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{entry.redeemedAt}</p>
        </div>
        <div className="rounded-full border border-[#53d7a6]/30 bg-[#53d7a6]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d1ffef]">
          +{entry.payoutAmount} PROOF
        </div>
      </div>
    </div>
  )
}

export default ShopPage
