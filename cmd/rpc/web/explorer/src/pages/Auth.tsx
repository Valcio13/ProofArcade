import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Download, Trash2, X, ChevronDown } from 'lucide-react'

import { adminRPCURL } from '../lib/api'
import FieldCard from '../components/app/FieldCard'
import PageShell from '../components/app/PageShell'
import ProductHero from '../components/app/ProductHero'
import BetaWalletNotice from '../components/app/BetaWalletNotice'
import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  createRpcKeystoreAccount,
  fetchRpcKeystoreAccounts,
  importRpcKeystoreWallet,
  exportRpcKeystoreWallet,
  deleteRpcKeystoreWallet,
  type RpcKeystoreAccount,
  type RpcWalletBackup,
} from '../lib/rpcChain2048'
import {
  loadStoredWalletAuth,
  persistStoredWalletAuth,
  clearStoredWalletAuth,
} from '../lib/walletAuth'

function AuthPage() {
  const navigate = useNavigate()

  const [status, setStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Checking backend',
    detail: 'Looking for live wallet support.',
  })
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [importNickname, setImportNickname] = useState('')
  const [storedSessionAddress, setStoredSessionAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [deleteModalWallet, setDeleteModalWallet] = useState<RpcKeystoreAccount | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [walletMenuOpen, setWalletMenuOpen] = useState<string | null>(null)
  const [isManageWalletsExpanded, setIsManageWalletsExpanded] = useState(false)

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
        setWallets(nextWallets)
        setStoredSessionAddress(storedAuth?.address ?? '')

        const defaultAddress = storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)
          ? storedAuth.address
          : nextWallets[0]?.address ?? ''
        setSelectedAddress(defaultAddress)
        if (storedAuth?.address === defaultAddress) {
          setLoginPassword(storedAuth.password)
        }
      }

      setIsLoading(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to load the auth page.')
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const storedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === storedSessionAddress) ?? null,
    [storedSessionAddress, wallets],
  )

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === selectedAddress) ?? null,
    [selectedAddress, wallets],
  )

  function syncSession(wallet: RpcKeystoreAccount, nextPassword: string) {
    persistStoredWalletAuth({
      address: wallet.address,
      nickname: wallet.nickname,
      password: nextPassword,
      loggedInAt: new Date().toISOString(),
    })
    setStoredSessionAddress(wallet.address)
    setSelectedAddress(wallet.address)
    setLoginPassword(nextPassword)
  }

  async function refreshWallets(preferredAddress?: string) {
    const nextWallets = await fetchRpcKeystoreAccounts()
    setWallets(nextWallets)
    if (preferredAddress && nextWallets.some((wallet) => wallet.address === preferredAddress)) {
      setSelectedAddress(preferredAddress)
      return nextWallets.find((wallet) => wallet.address === preferredAddress) ?? null
    }
    setSelectedAddress((current) => (nextWallets.some((wallet) => wallet.address === current) ? current : nextWallets[0]?.address ?? ''))
    return null
  }

  async function handleRegister() {
    if (status.mode !== 'rpc') {
      toast.error('Wallet creation is only available with the live backend.')
      return
    }
    if (!nickname.trim()) {
      toast.error('Choose a nickname first.')
      return
    }
    if (!password) {
      toast.error('Enter a password for the new wallet.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('The passwords do not match.')
      return
    }

    try {
      setIsCreating(true)
      const created = await createRpcKeystoreAccount({
        nickname,
        password,
      })
      await refreshWallets(created.address)
      syncSession(created, password)
      setNickname('')
      setPassword('')
      setConfirmPassword('')
      toast.success(`${created.nickname} is ready and signed in on this device.`)
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to create a wallet.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleLogIn() {
    console.log('=== handleLogIn CALLED ===')
    console.log('selectedWallet:', selectedWallet)
    console.log('loginPassword length:', loginPassword?.length)
    
    if (!selectedWallet) {
      console.log('ERROR: No wallet selected')
      toast.error('Choose a wallet first.')
      return
    }
    if (!loginPassword) {
      console.log('ERROR: No password entered')
      toast.error('Enter the wallet password first.')
      return
    }

    console.log('=== Starting password verification ===')
    // Verify the password before storing it
    try {
      setIsLoading(true)
      console.log('Creating game client...')
      const client = await createGame2048Client()
      console.log('Client created, mode:', client.status.mode)
      
      if (client.status.mode === 'rpc') {
        console.log('=== MODE IS RPC - Will verify password ===')
        console.log('Verifying password for:', selectedWallet.address)
        // Verify the password with the backend
        const verifyResponse = await fetch(`${adminRPCURL}/v1/admin/wallet-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: selectedWallet.address,
            password: loginPassword,
          }),
        })
        
        console.log('Verification response status:', verifyResponse.status)
        
        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json().catch(() => ({}))
          console.error('Password verification failed:', errorData)
          throw new Error('Incorrect password')
        }
        
        console.log('Password verification succeeded')
      } else {
        console.log('=== MODE IS NOT RPC - Skipping verification ===')
        console.log('Current mode:', client.status.mode)
      }
      
      console.log('=== Calling syncSession ===')
      syncSession(selectedWallet, loginPassword)
      toast.success(`${selectedWallet.nickname} is now signed in on this device.`)
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Incorrect password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleImportWallet(event: ChangeEvent<HTMLInputElement>) {
    if (status.mode !== 'rpc') {
      toast.error('Wallet import is only available with the live backend.')
      event.target.value = ''
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsImporting(true)
      const raw = await file.text()
      const parsed = JSON.parse(raw) as RpcWalletBackup
      const imported = await importRpcKeystoreWallet({
        backup: parsed,
        nickname: importNickname.trim() || undefined,
      })
      await refreshWallets(imported.address)
      setImportNickname('')
      toast.success(`Imported ${imported.nickname}. Use the original wallet password to log in.`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to import this wallet backup.')
    } finally{
      setIsImporting(false)
      event.target.value = ''
    }
  }

  async function handleExportWallet(wallet: RpcKeystoreAccount) {
    try {
      const backup = await exportRpcKeystoreWallet(wallet.address)
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${wallet.nickname}-${shortAddress(wallet.address)}-backup.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Backup exported for ${wallet.nickname}`)
      setWalletMenuOpen(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to export wallet backup.')
    }
  }

  async function handleDeleteWallet() {
    if (!deleteModalWallet || !deletePassword) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteRpcKeystoreWallet(deleteModalWallet.address, deletePassword)
      
      // Clear session if deleting the current wallet
      if (storedSessionAddress === deleteModalWallet.address) {
        clearStoredWalletAuth()
        setStoredSessionAddress('')
      }
      
      await refreshWallets()
      toast.success('Wallet removed from this device.')
      setDeleteModalWallet(null)
      setDeletePassword('')
      setWalletMenuOpen(null)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete wallet.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <PageShell maxWidthClass="max-w-[1000px]">
        <ProductHero
          eyebrow="ProofArcade Wallet"
          title="Unlock your wallet and start playing."
          description="Create a wallet, import an encrypted backup, or unlock an existing player on this device. Once signed in, the game, profile, shop, and check-in pages can use it automatically."
        />

        <BetaWalletNotice />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Login Section */}
          <section className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Log In</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Unlock existing wallet</h2>
              </div>
              {wallets.length > 0 ? (
                <div className="rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fd0ff]">
                  {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Pick a saved wallet and enter its password to sign in locally.
            </p>

            <div className="mt-5 space-y-4">
              {wallets.length > 0 ? (
                <>
                  {/* Selected Wallet Display */}
                  {selectedWallet && (
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Selected Wallet</p>
                      <p className="mt-2 text-base font-semibold text-white">{selectedWallet.nickname}</p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortAddress(selectedWallet.address)}</p>
                      
                      <button
                        onClick={() => setIsManageWalletsExpanded(!isManageWalletsExpanded)}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        Change Wallet
                      </button>
                    </div>
                  )}

                  {/* Manage Wallets Collapsible Section */}
                  <div className="rounded-xl border border-white/10 bg-black/20">
                    <button
                      onClick={() => setIsManageWalletsExpanded(!isManageWalletsExpanded)}
                      className="flex w-full items-center justify-between p-4 text-left transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Manage Wallets</p>
                        <p className="mt-1 text-xs text-slate-400">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} on this device</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isManageWalletsExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isManageWalletsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 p-4 space-y-3">
                            {wallets.map((wallet) => (
                              <div
                                key={wallet.address}
                                className={`relative rounded-lg border p-3 transition ${
                                  selectedAddress === wallet.address
                                    ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
                                    : 'border-white/10 bg-slate-950/50 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white">{wallet.nickname}</p>
                                    <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortAddress(wallet.address)}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {selectedAddress !== wallet.address && (
                                      <button
                                        onClick={() => {
                                          setSelectedAddress(wallet.address)
                                          setIsManageWalletsExpanded(false)
                                        }}
                                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                                      >
                                        Select
                                      </button>
                                    )}
                                    
                                    {/* Wallet Actions Menu */}
                                    <div className="relative">
                                      <button
                                        onClick={() => setWalletMenuOpen(walletMenuOpen === wallet.address ? null : wallet.address)}
                                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:bg-white/10"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                      
                                      {walletMenuOpen === wallet.address && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                          className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl"
                                        >
                                          <button
                                            onClick={() => handleExportWallet(wallet)}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                                          >
                                            <Download className="h-4 w-4" />
                                            Export Backup
                                          </button>
                                          <button
                                            onClick={() => {
                                              setDeleteModalWallet(wallet)
                                              setWalletMenuOpen(null)
                                            }}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Wallet
                                          </button>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-6 py-8 text-center">
                  <p className="text-sm text-slate-400">No wallets found</p>
                  <p className="mt-2 text-xs text-slate-500">Create a wallet or import a backup to get started</p>
                </div>
              )}

              <FieldCard label="Wallet password">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  disabled={!selectedAddress}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </FieldCard>

              <button
                onClick={handleLogIn}
                disabled={status.mode !== 'rpc' || !selectedAddress || !loginPassword || isLoading}
                className="w-full rounded-2xl bg-[#53a6ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </button>
            </div>
          </section>

          {/* Register Section */}
          <section className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Register</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Create new wallet</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Create a wallet in the node keystore and sign in automatically.
            </p>

            <div className="mt-5 space-y-4">
              <FieldCard label="Nickname">
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Choose a nickname"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                />
              </FieldCard>

              <FieldCard label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                />
              </FieldCard>

              <FieldCard label="Confirm password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
                />
              </FieldCard>

              {password && confirmPassword && password !== confirmPassword ? (
                <div className="rounded-[1rem] border border-[#f6df84]/30 bg-[#f6df84]/8 px-4 py-3 text-sm text-[#f8e8a5]">
                  Passwords do not match
                </div>
              ) : null}

              <button
                onClick={handleRegister}
                disabled={
                  status.mode !== 'rpc' ||
                  isCreating ||
                  !nickname.trim() ||
                  !password ||
                  password !== confirmPassword
                }
                className="w-full rounded-2xl bg-[#f0cf52] px-5 py-3 text-sm font-semibold text-[#2f2418] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
              </button>
            </div>
          </section>
        </div>

        {/* Import & Session Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Import Backup</p>
            <h3 className="mt-2 text-xl font-bold text-white">Restore from file</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Restore an encrypted wallet backup. You'll still need the original password to unlock it.
            </p>
            <input
              value={importNickname}
              onChange={(event) => setImportNickname(event.target.value)}
              placeholder="Optional new nickname"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
            />
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-black/50 hover:text-white">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportWallet}
                disabled={isImporting}
                className="sr-only"
              />
              {isImporting ? 'Importing...' : 'Choose Backup File'}
            </label>
          </section>

          <section className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Session</p>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${storedWallet ? 'bg-[#53d7a6]' : 'bg-slate-600'}`}
              />
              <p className="text-xl font-bold text-white">
                {storedWallet ? storedWallet.nickname : 'Guest Mode'}
              </p>
            </div>
            {storedWallet ? (
              <div className="mt-3 space-y-2">
                <div className="rounded-[1rem] border border-white/10 bg-slate-950/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Address</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-300">
                    {storedWallet.address}
                  </p>
                </div>
                <p className="text-xs text-slate-400">Signed in locally on this device</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                No wallet is signed in. Log in or create a wallet to start playing.
              </p>
            )}
          </section>
        </div>

        {isLoading && !isCreating ? (
          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-400">
            Loading wallet access...
          </div>
        ) : null}
      </PageShell>

      {/* Delete Wallet Confirmation Modal */}
      <AnimatePresence>
        {deleteModalWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => !isDeleting && setDeleteModalWallet(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] border border-red-500/30 bg-[linear-gradient(135deg,_rgba(60,20,20,0.95),_rgba(30,10,10,0.98))] p-8 shadow-[0_25px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-500/20 p-3">
                      <Trash2 className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Delete Wallet?</h2>
                    </div>
                  </div>
                </div>
                {!isDeleting && (
                  <button
                    onClick={() => setDeleteModalWallet(null)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Wallet to Delete</p>
                  <p className="mt-2 font-semibold text-white">{deleteModalWallet.nickname}</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortAddress(deleteModalWallet.address)}</p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
                  <p className="text-sm leading-6 text-amber-200">
                    This will remove the wallet from this device.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-amber-200">
                    Make sure you have exported a backup first.
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-amber-300">
                    If you lose both your password and backup, your wallet cannot be recovered.
                  </p>
                </div>

                <FieldCard label="Enter wallet password to confirm">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Password required"
                    disabled={isDeleting}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    autoFocus
                  />
                </FieldCard>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteModalWallet(null)
                      setDeletePassword('')
                    }}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteWallet}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Wallet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AuthPage
