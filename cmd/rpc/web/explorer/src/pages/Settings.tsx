import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import BetaWalletNotice from '../components/app/BetaWalletNotice'
import SectionCard from '../components/app/SectionCard'
import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  exportRpcKeystoreWallet,
  fetchRpcKeystoreAccounts,
  importRpcKeystoreWallet,
  renameRpcKeystoreWallet,
  type RpcKeystoreAccount,
  type RpcWalletBackup,
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
  const [importNickname, setImportNickname] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isExportingWallet, setIsExportingWallet] = useState(false)
  const [isImportingWallet, setIsImportingWallet] = useState(false)

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
      const refreshed = await refreshWallets(renamed.address)
      const storedAuth = loadStoredWalletAuth()
      if (storedAuth?.address === renamed.address) {
        persistStoredWalletAuth({
          ...storedAuth,
          nickname: renamed.nickname,
        })
      }
      setUsername(refreshed?.nickname ?? renamed.nickname)
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

  async function handleImportWallet(event: ChangeEvent<HTMLInputElement>) {
    if (status.mode !== 'rpc') {
      toast.error('Wallet import is only available against the live RPC backend.')
      event.target.value = ''
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsImportingWallet(true)
      const raw = await file.text()
      const parsed = JSON.parse(raw) as RpcWalletBackup
      const imported = await importRpcKeystoreWallet({
        backup: parsed,
        nickname: importNickname.trim() || undefined,
      })
      const refreshed = await refreshWallets(imported.address)
      setImportNickname('')
      setUsername(refreshed?.nickname ?? imported.nickname)
      toast.success(`Imported ${imported.nickname}. Log in with the wallet password to use it.`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to import this wallet backup.')
    } finally {
      setIsImportingWallet(false)
      event.target.value = ''
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#f6df84]">Account Settings</p>
            <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">
              Keep your wallet yours.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Update your username, export an encrypted backup, or restore a wallet backup on this device.
            </p>
            {selectedWallet ? (
              <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <span className="font-semibold text-white">{selectedWallet.nickname}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono">{shortAddress(selectedWallet.address)}</span>
              </div>
            ) : null}
          </div>
          <Link
            to="/profile"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Back To Profile
          </Link>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <BetaWalletNotice body="Wallet backup and restore are available, but this is still a beta hosted-wallet model. Export your encrypted backup immediately and avoid treating this as fully self-custodial yet." />

        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard
              title="Profile Name"
              description="Change the public name shown on your profile and game pages."
            >
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                disabled={!selectedWallet || status.mode !== 'rpc'}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleRenameWallet}
                disabled={status.mode !== 'rpc' || !selectedWallet || isSavingName}
                className="mt-4 inline-flex rounded-2xl bg-[#53a6ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingName ? 'Saving Username...' : 'Save Username'}
              </button>
            </SectionCard>

            <SectionCard
              title="Export Backup"
              description="Download an encrypted backup file and keep it separate from your password."
            >
              <button
                onClick={handleExportWallet}
                disabled={status.mode !== 'rpc' || !selectedWallet || isExportingWallet}
                className="w-full rounded-2xl bg-[#f0cf52] px-4 py-3 text-sm font-semibold text-[#2f2418] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExportingWallet ? 'Exporting Backup...' : 'Export Wallet Backup'}
              </button>
            </SectionCard>

            <SectionCard
              title="Import Backup"
              description="Restore an encrypted backup on this device and unlock it later with the original password."
            >
              <input
                value={importNickname}
                onChange={(event) => setImportNickname(event.target.value)}
                placeholder="Optional new username"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
              />
              <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-black/50">
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportWallet}
                  disabled={isImportingWallet || status.mode !== 'rpc'}
                  className="sr-only"
                />
                {isImportingWallet ? 'Importing Backup...' : 'Import Wallet Backup'}
              </label>
            </SectionCard>
          </div>
        </section>

        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Safety Note</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Your backup stays encrypted. Anyone with both the backup file and your wallet password can restore the wallet,
            so store them separately. This device is the convenience copy. The exported backup is the recovery copy.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
