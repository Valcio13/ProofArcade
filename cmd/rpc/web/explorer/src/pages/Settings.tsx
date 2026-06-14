import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  exportRpcKeystoreWallet,
  fetchRpcKeystoreAccounts,
  type RpcKeystoreAccount,
} from '../lib/rpcChain2048'
import { loadStoredWalletAuth } from '../lib/walletAuth'

function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings | ProofArcade'
  }, [])

  const [status, setStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Checking backend',
    detail: 'Looking for live wallet support.',
  })
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [onChainUsername, setOnChainUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [isExportingWallet, setIsExportingWallet] = useState(false)

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

        // Fetch on-chain username
        if (initialAddress) {
          const usernameResponse = await client.getUsernameByAddress(initialAddress)
          setOnChainUsername(usernameResponse.username ?? '')
        }
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
    // Fetch on-chain username when wallet changes
    if (selectedAddress) {
      createGame2048Client().then(async (client) => {
        const usernameResponse = await client.getUsernameByAddress(selectedAddress)
        setOnChainUsername(usernameResponse.username ?? '')
      }).catch((error) => {
        console.error('Failed to load username:', error)
      })
    } else {
      setOnChainUsername('')
    }
  }, [selectedWallet, selectedAddress])

  async function handleSetUsername() {
    if (!selectedWallet) {
      toast.error('No wallet is selected.')
      return
    }
    
    const nextUsername = onChainUsername.trim()
    if (!nextUsername) {
      toast.error('Enter a username first.')
      return
    }
    
    // Validation: 3-20 chars, alphanumeric + underscore
    if (nextUsername.length < 3 || nextUsername.length > 20) {
      toast.error('Username must be 3-20 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nextUsername)) {
      toast.error('Username can only contain letters, numbers, and underscores.')
      return
    }
    
    const storedAuth = loadStoredWalletAuth()
    if (!storedAuth || storedAuth.address !== selectedAddress) {
      toast.error('Please log in to set your username.')
      return
    }

    try {
      setIsSavingUsername(true)
      const client = await createGame2048Client()
      
      const result = await client.setUsername({
        address: selectedAddress,
        password: storedAuth.password,
        username: nextUsername,
      })
      
      if (result.submitted) {
        toast.success(`Username set to ${nextUsername}!`)
      } else {
        toast.error('Username update was not confirmed.')
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to set username.')
    } finally {
      setIsSavingUsername(false)
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#f6df84]">Account Settings</p>
            <h1 className="mt-2 font-['Georgia'] text-4xl leading-tight text-white">
              Identity & Security
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your public identity, secure your wallet, and protect access to your account
            </p>
          </div>
          <Link
            to="/profile"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Profile
          </Link>
        </div>

        {selectedWallet && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="font-mono text-xs text-slate-400">{shortAddress(selectedWallet.address)}</span>
            {onChainUsername && (
              <>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-sm font-semibold text-white">{onChainUsername}</span>
              </>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 space-y-6">
        {/* Beta Wallet Notice - Prominent */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-400">Beta Wallet Notice</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                This is a beta hosted-wallet model. <strong className="text-white">Export your encrypted backup immediately</strong> and store it securely.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Your backup file contains your encrypted keys. Keep it safe along with your password for recovery.
              </p>
            </div>
          </div>
        </div>

        {/* Main Settings Sections - Side by Side */}
        <div className="grid gap-6 lg:auto-rows-fr lg:grid-cols-2">
          {/* Username - Public Identity */}
          <section className="flex flex-col rounded-2xl border border-[#f6df84]/30 bg-[#f6df84]/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f6df84]/20">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Public Username</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Your public identity shown on leaderboards, profiles, and across ProofArcade
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSetUsername(); }} className="mt-6 flex flex-1 flex-col justify-between">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Username
                </label>
                <input
                  value={onChainUsername}
                  onChange={(event) => setOnChainUsername(event.target.value)}
                  placeholder="3-20 characters (a-z, 0-9, _)"
                  disabled={!selectedWallet}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition focus:border-[#f6df84] focus:ring-2 focus:ring-[#f6df84]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={20}
                />
                <p className="text-xs text-slate-500">
                  Letters, numbers, and underscores only. Visible to all players.
                </p>
              </div>

              <button
                type="submit"
                disabled={!selectedWallet || isSavingUsername}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f6df84] to-[#d4af37] px-6 py-3.5 text-base font-bold text-[#2f2418] shadow-[0_4px_16px_rgba(246,223,132,0.3)] transition hover:shadow-[0_6px_20px_rgba(246,223,132,0.4)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isSavingUsername ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 rounded-full border-2 border-[#2f2418]/30 border-t-[#2f2418]"
                    />
                    Setting Username...
                  </span>
                ) : (
                  'Update Username'
                )}
              </button>
            </form>
          </section>

          {/* Wallet Backup - Security */}
          <section className="flex flex-col rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#53a6ff]/15">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Wallet Backup</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Export your encrypted wallet backup for recovery and safekeeping
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-1 flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/5 bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-white">Why Backup?</h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-400">
                    <li>• <strong className="text-slate-300">Recover your wallet</strong> if you lose access to this device</li>
                    <li>• <strong className="text-slate-300">Restore on other devices</strong> to access your account anywhere</li>
                    <li>• <strong className="text-slate-300">Protect your assets</strong> - your backup is your last line of defense</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-500">
                  Backup file stays encrypted. Store separately from your password.
                </p>
              </div>

              <button
                onClick={handleExportWallet}
                disabled={status.mode !== 'rpc' || !selectedWallet || isExportingWallet}
                className="w-full rounded-xl bg-gradient-to-r from-[#53a6ff] to-[#4a8edc] px-6 py-3.5 text-base font-bold text-white shadow-[0_4px_16px_rgba(83,166,255,0.3)] transition hover:shadow-[0_6px_20px_rgba(83,166,255,0.4)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isExportingWallet ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Exporting Backup...
                  </span>
                ) : (
                  'Export Encrypted Backup'
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Recovery Information */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#53d7a6]/15">
                <span className="text-xl">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Backup Best Practices</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#53d7a6]">•</span>
                    <span>Export your backup immediately after creating your wallet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#53d7a6]">•</span>
                    <span>Store the backup file and password separately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#53d7a6]">•</span>
                    <span>Keep multiple copies in secure locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#53d7a6]">•</span>
                    <span>Test your backup by restoring on another device</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6df84]/15">
                <span className="text-xl">🔐</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Recovery Instructions</h3>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">
                  <p>
                    Your backup file contains your encrypted wallet keys. Anyone with both the backup file <strong className="text-slate-300">and</strong> your password can restore your wallet.
                  </p>
                  <p>
                    To restore a wallet, navigate to the{' '}
                    <Link to="/auth" className="font-semibold text-[#53a6ff] transition hover:text-[#7eb8ff] hover:underline">
                      authentication page
                    </Link>{' '}
                    and select "Restore from Backup" during wallet creation.
                  </p>
                  <p className="text-xs text-slate-500">
                    Never share your backup file and password together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
