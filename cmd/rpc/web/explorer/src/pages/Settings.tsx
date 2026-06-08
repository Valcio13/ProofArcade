import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  exportRpcKeystoreWallet,
  fetchRpcKeystoreAccounts,
  renameRpcKeystoreWallet,
  type RpcKeystoreAccount,
} from '../lib/rpcChain2048'
import { loadStoredWalletAuth, persistStoredWalletAuth } from '../lib/walletAuth'

function SettingsPage() {
  const [status, setStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Checking backend',
    detail: 'Looking for live wallet support.',
  })
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isExportingWallet, setIsExportingWallet] = useState(false)
  const [isFauceting, setIsFauceting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      if (cancelled) {
        return
      }

      setStatus(client.status)

      if (client.status.mode === 'rpc') {
        const nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }

        const storedAuth = loadStoredWalletAuth()
        const initialAddress = storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)
          ? storedAuth.address
          : nextWallets[0]?.address ?? ''

        setWallets(nextWallets)
        setSelectedAddress(initialAddress)

        const initialWallet = nextWallets.find((wallet) => wallet.address === initialAddress) ?? null
        setUsername(initialWallet?.nickname ?? '')
      }

      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load settings.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === selectedAddress) ?? null,
    [wallets, selectedAddress],
  )

  useEffect(() => {
    setUsername(selectedWallet?.nickname ?? '')
  }, [selectedWallet])

  async function refreshWallets(preferredAddress?: string) {
    const nextWallets = await fetchRpcKeystoreAccounts()
    setWallets(nextWallets)
    const nextAddress = preferredAddress && nextWallets.some((wallet) => wallet.address === preferredAddress)
      ? preferredAddress
      : nextWallets[0]?.address ?? ''
    setSelectedAddress(nextAddress)
    return nextWallets.find((wallet) => wallet.address === nextAddress) ?? null
  }

  async function handleRenameWallet() {
    if (status.mode !== 'rpc') {
      toast.error('Username changes are only available with the live backend.')
      return
    }
    if (!selectedWallet) {
      toast.error('No wallet is selected for this device.')
      return
    }
    const nextUsername = username.trim()
    if (!nextUsername) {
      toast.error('Enter a username first.')
      return
    }
    if (nextUsername === selectedWallet.nickname) {
      toast.error('That username is already in use for this wallet.')
      return
    }

    try {
      setIsSavingName(true)
      const renamed = await renameRpcKeystoreWallet(selectedWallet.address, nextUsername)
      
      // ✅ Refresh wallet list to update UI immediately
      const nextWallets = await fetchRpcKeystoreAccounts()
      setWallets(nextWallets)
      
      // ✅ Find and set the updated wallet
      const refreshed = nextWallets.find((wallet) => wallet.address === renamed.address) ?? null
      if (refreshed) {
        setSelectedAddress(refreshed.address)
        setUsername(refreshed.nickname)
      }
      
      // ✅ Update stored auth if this is the active session wallet
      const storedAuth = loadStoredWalletAuth()
      if (storedAuth?.address === renamed.address) {
        persistStoredWalletAuth({
          ...storedAuth,
          nickname: renamed.nickname,
        })
      }
      
      toast.success(`Username updated to ${renamed.nickname}.`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to update the username.')
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleExportWallet() {
    if (status.mode !== 'rpc') {
      toast.error('Wallet export is only available against the live RPC backend.')
      return
    }
    if (!selectedWallet) {
      toast.error('No wallet is available to export.')
      return
    }

    try {
      setIsExportingWallet(true)
      const backup = await exportRpcKeystoreWallet(selectedWallet.address)
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const safeNickname = (backup.nickname || 'wallet').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
      link.href = url
      link.download = `${safeNickname}-${backup.address.slice(0, 8)}-backup.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Encrypted wallet backup downloaded. Keep it somewhere safe.')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to export this wallet.')
    } finally {
      setIsExportingWallet(false)
    }
  }

  async function handleFaucet() {
    if (status.mode !== 'rpc') {
      toast.error('Faucet is only available with live backend.')
      return
    }
    if (!selectedWallet) {
      toast.error('No wallet selected.')
      return
    }

    try {
      setIsFauceting(true)
      const client = await createGame2048Client()
      await client.addFunds(selectedWallet.address, 1000)
      toast.success('Added 1000 PROOF to your wallet!')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Faucet failed.')
    } finally {
      setIsFauceting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8"
    >
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_22%),linear-gradient(160deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#f6df84]">Settings</p>
            <h1 className="mt-2 font-['Georgia'] text-4xl leading-tight text-white">
              Wallet & Account
            </h1>
            {selectedWallet && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="text-sm font-semibold text-white">{selectedWallet.nickname}</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="font-mono text-xs text-slate-400">{shortAddress(selectedWallet.address)}</span>
              </div>
            )}
          </div>
          <Link
            to="/profile"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Profile
          </Link>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {/* Beta Notice - Reduced prominence */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Beta Feature</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Export your encrypted backup immediately. This is a beta hosted-wallet model—treat it accordingly.
              </p>
            </div>
          </div>
        </div>

        {/* Main Settings Grid */}
        <section className="grid gap-4 lg:grid-cols-2">
          {/* Dev Faucet */}
          {status.mode === 'rpc' && (
            <div className="rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <span className="text-base">💰</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">Dev Faucet</h2>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Get test PROOF tokens for development and testing
              </p>
              <button
                onClick={handleFaucet}
                disabled={!selectedWallet || isFauceting}
                className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFauceting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Requesting...
                  </span>
                ) : (
                  'Get 1000 PROOF'
                )}
              </button>
            </div>
          )}
          
          {/* Profile Name */}
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#53a6ff]/15">
                <span className="text-base">👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white">Profile Name</h2>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Display name for your profile and leaderboards
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleRenameWallet(); }}>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                disabled={!selectedWallet || status.mode !== 'rpc'}
                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#53a6ff] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status.mode !== 'rpc' || !selectedWallet || isSavingName}
                className="mt-3 w-full rounded-xl bg-[#53a6ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingName ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Saving...
                  </span>
                ) : (
                  'Save Name'
                )}
              </button>
            </form>
          </div>

          {/* Backup Wallet */}
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6df84]/15">
                <span className="text-base">📦</span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white">Backup Wallet</h2>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Download encrypted backup file for recovery
            </p>
            <div className="mt-4 flex-1"></div>
            <button
              onClick={handleExportWallet}
              disabled={status.mode !== 'rpc' || !selectedWallet || isExportingWallet}
              className="mt-auto w-full rounded-xl bg-gradient-to-r from-[#f6df84] to-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#2f2418] shadow-[0_4px_12px_rgba(246,223,132,0.25)] transition hover:shadow-[0_6px_16px_rgba(246,223,132,0.35)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isExportingWallet ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-[#2f2418]/30 border-t-[#2f2418]"
                  />
                  Exporting...
                </span>
              ) : (
                'Export Backup'
              )}
            </button>
          </div>
        </section>

        {/* Backup Best Practices */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#53d7a6]/15">
                <span className="text-lg">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Backup Best Practices</p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-400">
                  <li>• Export your backup immediately after creating your wallet</li>
                  <li>• Store the backup file separately from your password</li>
                  <li>• Keep multiple copies in secure locations</li>
                  <li>• Test your backup by restoring on another device</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0cf52]/15">
                <span className="text-lg">🔐</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Security Reminder</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Your backup file stays encrypted. Anyone with both the backup file and your password can restore your wallet. Never share both together.
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  To restore a wallet, use the authentication page during initial setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
