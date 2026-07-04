import { useEffect, useMemo, useState, type ChangeEvent, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { adminRPCURL } from '../lib/api'
import FieldCard from '../components/app/FieldCard'
import PageShell from '../components/app/PageShell'
import ProductHero from '../components/app/ProductHero'
import BetaWalletNotice from '../components/app/BetaWalletNotice'
import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  loadStoredWalletAuth,
  persistStoredWalletAuth,
  getLastUsedWalletAddress,
  clearStoredWalletAuth,
} from '../lib/walletAuth'

// Simple type for wallet references stored in localStorage
interface EncryptedWallet {
  address: string
  nickname: string
  publicKey: string
  encryptedPrivateKey: string
  salt: string
  iv: string
  version: number
}

interface WalletBackup {
  address: string
  nickname: string
  publicKey: string
  encryptedPrivateKey: string
  salt: string
  iv: string
  version: number
  exportedAt: string
}

// LocalStorage helpers for wallet references
const STORAGE_KEY_PREFIX = 'proofarcade_wallet_'
const WALLET_LIST_KEY = 'proofarcade_wallet_list'

function listWallets(): EncryptedWallet[] {
  const walletList = localStorage.getItem(WALLET_LIST_KEY)
  if (!walletList) {
    return []
  }

  const addresses = JSON.parse(walletList) as string[]
  const wallets: EncryptedWallet[] = []

  for (const address of addresses) {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + address)
    if (stored) {
      wallets.push(JSON.parse(stored) as EncryptedWallet)
    }
  }

  return wallets
}

function importWallet(backup: WalletBackup, nickname?: string): EncryptedWallet {
  if (!backup.address) {
    throw new Error('Invalid wallet backup format')
  }

  const wallet: EncryptedWallet = {
    address: backup.address,
    nickname: nickname || backup.nickname,
    publicKey: backup.publicKey,
    encryptedPrivateKey: backup.encryptedPrivateKey,
    salt: backup.salt,
    iv: backup.iv,
    version: backup.version || 1,
  }

  // Check if wallet already exists
  const existing = localStorage.getItem(STORAGE_KEY_PREFIX + wallet.address)
  if (existing) {
    throw new Error('Wallet already exists on this device')
  }

  // Save wallet
  localStorage.setItem(STORAGE_KEY_PREFIX + wallet.address, JSON.stringify(wallet))

  // Update wallet list
  const walletList = localStorage.getItem(WALLET_LIST_KEY)
  const addresses = walletList ? (JSON.parse(walletList) as string[]) : []
  if (!addresses.includes(wallet.address)) {
    addresses.push(wallet.address)
    localStorage.setItem(WALLET_LIST_KEY, JSON.stringify(addresses))
  }

  return wallet
}

function deleteWalletFromLocalStorage(address: string): void {
  // Remove from individual storage
  localStorage.removeItem(STORAGE_KEY_PREFIX + address)
  
  // Remove from wallet list
  const walletList = localStorage.getItem(WALLET_LIST_KEY)
  if (walletList) {
    const addresses = JSON.parse(walletList) as string[]
    const filtered = addresses.filter(addr => addr !== address)
    localStorage.setItem(WALLET_LIST_KEY, JSON.stringify(filtered))
  }
}

// Separate modal component to prevent parent re-renders from affecting it
const FaucetClaimModal = memo(({ 
  account, 
  onClaim, 
  onSkip, 
  isClaiming 
}: { 
  account: EncryptedWallet
  onClaim: () => void
  onSkip: () => void
  isClaiming: boolean
}) => {
  console.log('[FaucetModal] Rendering with account:', account.address, 'isClaiming:', isClaiming)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-[#53a6ff]/30 bg-card p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[#9fd0ff]">Wallet Created</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Claim test PROOF to start</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {account.nickname} is signed in on this device. Claim some test PROOF and we'll
          register your username on-chain so you can compete on the leaderboards.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Address</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-300">{account.address}</p>
        </div>

        <button
          onClick={onClaim}
          disabled={isClaiming}
          className="mt-5 w-full rounded-xl bg-[#53a6ff] px-5 py-3 text-sm font-semibold text-[#0a0e1a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isClaiming ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a]"
              />
              Claiming...
            </span>
          ) : (
            'Claim PROOF & Set Username'
          )}
        </button>
      </motion.div>
    </motion.div>
  )
})

FaucetClaimModal.displayName = 'FaucetClaimModal'

function AuthPage() {
  useEffect(() => {
    document.title = 'Wallet Auth | ProofArcade'
  }, [])

  const navigate = useNavigate()

  const [status, setStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Checking backend',
    detail: 'Looking for live wallet support.',
  })
  const [wallets, setWallets] = useState<EncryptedWallet[]>([])
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
  const [isManageWalletsExpanded, setIsManageWalletsExpanded] = useState(false)
  const [walletToDelete, setWalletToDelete] = useState<EncryptedWallet | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [justCreated, setJustCreated] = useState<EncryptedWallet | null>(() => {
    // Restore from sessionStorage on mount
    const stored = sessionStorage.getItem('pending-faucet-claim')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  })
  const [isFauceting, setIsFauceting] = useState(false)

  // Persist justCreated to sessionStorage when it changes
  useEffect(() => {
    if (justCreated) {
      sessionStorage.setItem('pending-faucet-claim', JSON.stringify(justCreated))
    } else {
      sessionStorage.removeItem('pending-faucet-claim')
    }
  }, [justCreated])

  // Prevent component re-renders from closing the modal
  // Keep modal open by checking sessionStorage on every render
  useEffect(() => {
    const stored = sessionStorage.getItem('pending-faucet-claim')
    if (stored && !justCreated) {
      try {
        setJustCreated(JSON.parse(stored))
      } catch {
        // Invalid data, clear it
        sessionStorage.removeItem('pending-faucet-claim')
      }
    }
  }, [justCreated])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const client = await createGame2048Client()
      if (cancelled) {
        return
      }

      setStatus(client.status)

      // Load client-side wallets from localStorage
      const storedAuth = loadStoredWalletAuth()
      setStoredSessionAddress(storedAuth?.address ?? '')
      
      const nextWallets = listWallets()
      setWallets(nextWallets)

      // Determine which wallet to select
      let defaultAddress = ''
      
      // Priority 1: If user has active session, select that wallet and pre-fill password
      if (storedAuth?.address && nextWallets.some((wallet) => wallet.address === storedAuth.address)) {
        defaultAddress = storedAuth.address
        setLoginPassword(storedAuth.password)
      } 
      // Priority 2: If no session but user logged out recently, select last used wallet (no password)
      else {
        const lastUsedAddress = getLastUsedWalletAddress()
        if (lastUsedAddress && nextWallets.some((wallet) => wallet.address === lastUsedAddress)) {
          defaultAddress = lastUsedAddress
        } else {
          // Priority 3: Default to first wallet
          defaultAddress = nextWallets[0]?.address ?? ''
        }
      }
      
      setSelectedAddress(defaultAddress)

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

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === selectedAddress) ?? null,
    [selectedAddress, wallets],
  )

  function syncSession(wallet: EncryptedWallet, nextPassword: string) {
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
    const nextWallets = listWallets()
    setWallets(nextWallets)
    if (preferredAddress && nextWallets.some((wallet) => wallet.address === preferredAddress)) {
      setSelectedAddress(preferredAddress)
      return nextWallets.find((wallet) => wallet.address === preferredAddress) ?? null
    }
    setSelectedAddress((current) => (nextWallets.some((wallet) => wallet.address === current) ? current : nextWallets[0]?.address ?? ''))
    return null
  }

  async function handleRegister() {
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
      console.log('[Register] Creating wallet on backend...')
      
      // Create wallet on backend (it has the correct BLS library)
      const createResponse = await fetch(`${adminRPCURL}/v1/admin/keystore-new-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          password: password
        })
      })
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        throw new Error(`Failed to create wallet: ${errorText}`)
      }
      
      const address = (await createResponse.text()).replace(/"/g, '')
      console.log('[Register] Wallet created:', address)
      
      // Create localStorage reference (for UI only, not actual wallet)
      const walletRef: EncryptedWallet = {
        address: address,
        nickname: nickname.trim(),
        publicKey: '', // We don't store actual crypto here anymore
        encryptedPrivateKey: '', // Backend has the real wallet
        salt: '',
        iv: '',
        version: 1
      }
      
      // Save reference to localStorage
      localStorage.setItem(`proofarcade_wallet_${address}`, JSON.stringify(walletRef))
      const walletList = localStorage.getItem('proofarcade_wallet_list')
      const addresses = walletList ? JSON.parse(walletList) : []
      if (!addresses.includes(address)) {
        addresses.push(address)
        localStorage.setItem('proofarcade_wallet_list', JSON.stringify(addresses))
      }
      
      await refreshWallets(address)
      syncSession(walletRef, password)
      setNickname('')
      setPassword('')
      setConfirmPassword('')
      toast.success(`${walletRef.nickname} is ready and signed in on this device.`)
      setJustCreated(walletRef)
    } catch (error) {
      console.error('[Register] Error:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to create a wallet.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleClaimFaucet() {
    if (!justCreated) {
      return
    }
    
    console.log('[Faucet] Starting claim process for:', justCreated.address)
    console.log('[Faucet] Password available:', !!loginPassword)
    
    try {
      setIsFauceting(true)
      const client = await createGame2048Client()
      
      console.log('[Faucet] Client created, adding funds...')
      // Add test funds
      await client.addFunds(justCreated.address, 100)
      console.log('[Faucet] Funds added successfully')
      
      // Set on-chain username using the nickname
      try {
        console.log('[Faucet] Setting username on-chain:', justCreated.nickname)
        await client.setUsername({
          address: justCreated.address,
          password: loginPassword,
          username: justCreated.nickname
        })
        console.log('[Faucet] Username set successfully')
        toast.success('Username registered on-chain!')
      } catch (usernameError) {
        console.error('[Faucet] Failed to set username:', usernameError)
        // Don't fail the whole flow if username fails
        toast('Username registration will be available in Settings', { icon: 'ℹ️' })
      }
      
      toast.success('Test PROOF added to your wallet.')
      setJustCreated(null) // Close the modal
      navigate('/')
    } catch (error) {
      console.error('[Faucet] Error:', error)
      toast.error(error instanceof Error ? error.message : 'Faucet request failed.')
    } finally {
      setIsFauceting(false)
    }
  }

  const [isLoggingIn, setIsLoggingIn] = useState(false)

  async function handleLogIn() {
    if (!selectedWallet) {
      toast.error('Choose a wallet first.')
      return
    }
    if (!loginPassword) {
      toast.error('Enter the wallet password.')
      return
    }

    try {
      setIsLoggingIn(true)
      // Just save session - password will be verified on first transaction
      syncSession(selectedWallet, loginPassword)
      toast.success(`${selectedWallet.nickname} is now signed in on this device.`)
      
      // Small delay to ensure localStorage write completes before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Unable to log in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  async function handleImportWallet(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsImporting(true)
      const raw = await file.text()
      const parsed = JSON.parse(raw) as WalletBackup
      
      // Validate backup structure
      if (!parsed.address || !parsed.encryptedPrivateKey) {
        throw new Error('Invalid wallet backup file')
      }
      
      // Import wallet client-side
      const imported = await importWallet(parsed, importNickname.trim() || undefined)
      await refreshWallets(imported.address)
      setImportNickname('')
      toast.success(`Imported ${imported.nickname}. Use the original wallet password to log in.`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to import this wallet backup.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  async function handleDeleteWallet() {
    if (!walletToDelete) {
      return
    }

    if (!deletePassword) {
      toast.error('Enter the wallet password to confirm deletion.')
      return
    }

    try {
      setIsDeleting(true)
      
      // Try to delete from backend keystore (optional - may fail if not in keystore)
      try {
        const response = await fetch(`${adminRPCURL}/v1/admin/keystore-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletToDelete.address,
            password: deletePassword
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          // If it's just not in keystore, that's OK - continue with localStorage removal
          if (!errorText.includes('not found') && !errorText.includes('does not exist')) {
            throw new Error(`Backend deletion failed: ${errorText}`)
          }
        }
      } catch (backendError) {
        console.warn('Backend deletion failed (continuing with local removal):', backendError)
        // Continue anyway - wallet might only exist locally
      }
      
      // Always remove from localStorage
      deleteWalletFromLocalStorage(walletToDelete.address)
      
      // Clear session if this was the active wallet
      const storedAuth = loadStoredWalletAuth()
      if (storedAuth?.address === walletToDelete.address) {
        clearStoredWalletAuth()
        setStoredSessionAddress('')
        setLoginPassword('')
      }
      
      // Refresh wallet list
      await refreshWallets()
      
      toast.success(`${walletToDelete.nickname} has been removed from this device.`)
      setWalletToDelete(null)
      setDeletePassword('')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to delete wallet.')
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
          description="Create a wallet, import a backup, or unlock an existing player — then compete across all game modes."
        />

        <div className="mt-6">
          <BetaWalletNotice />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Login Section */}
          <section className="rounded-2xl border border-white/15 p-6 flex flex-col">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Returning Player</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Unlock existing wallet</h2>
              </div>
              {wallets.length > 0 ? (
                <div className="rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9fd0ff]">
                  {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                </div>
              ) : null}
            </div>
            <div className="mt-5 space-y-4 flex-1">
              {wallets.length > 0 ? (
                <>
                  {/* Selected Wallet Display */}
                  {selectedWallet && (
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Selected Wallet</p>
                      <div className="mt-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-white">{selectedWallet.nickname}</p>
                          <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortAddress(selectedWallet.address)}</p>
                        </div>
                        {storedSessionAddress === selectedWallet.address && (
                          <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-400">
                            Active
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setIsManageWalletsExpanded(!isManageWalletsExpanded)}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                      >
                        Change Wallet
                      </button>
                    </div>
                  )}

                  {/* Manage Wallets Collapsible Section */}
                  <AnimatePresence>
                    {isManageWalletsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
                          {wallets.map((wallet) => (
                            <div
                              key={wallet.address}
                              className={`relative rounded-lg border p-3 transition ${
                                selectedAddress === wallet.address
                                  ? 'border-[#53a6ff]/40 bg-[#53a6ff]/10'
                                  : 'border-white/10 bg-slate-950/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div 
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => {
                                    if (selectedAddress !== wallet.address) {
                                      setSelectedAddress(wallet.address)
                                      setIsManageWalletsExpanded(false)
                                      
                                      // Keep password if this is the stored session wallet, otherwise clear it
                                      const storedAuth = loadStoredWalletAuth()
                                      if (storedAuth?.address === wallet.address && storedAuth.password) {
                                        setLoginPassword(storedAuth.password)
                                      } else {
                                        setLoginPassword('')
                                      }
                                    }
                                  }}
                                >
                                  <p className="text-sm font-semibold text-white">{wallet.nickname}</p>
                                  <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortAddress(wallet.address)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedAddress === wallet.address && (
                                    <div className="rounded-full bg-[#53a6ff] px-2 py-1 text-[10px] font-semibold text-white">
                                      Selected
                                    </div>
                                  )}
                                  {storedSessionAddress === wallet.address && (
                                    <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-400">
                                      Active
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setWalletToDelete(wallet)
                                    }}
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                                    title="Delete wallet"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password Field */}
                  <FieldCard label="Wallet password">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && selectedAddress && loginPassword && !isLoggingIn) {
                          event.preventDefault()
                          handleLogIn()
                        }
                      }}
                      placeholder="Enter password"
                      disabled={!selectedAddress}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </FieldCard>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-6 py-8 text-center">
                  <p className="text-sm text-slate-400">No wallets found</p>
                  <p className="mt-2 text-xs text-slate-500">Create a wallet or import a backup to get started</p>
                </div>
              )}
            </div>

            {wallets.length > 0 && (
              <button
                onClick={handleLogIn}
                disabled={!selectedAddress || !loginPassword || isLoggingIn}
                className="mt-4 w-full rounded-2xl bg-[#53a6ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Unlocking...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>
            )}
          </section>

          {/* Register Section */}
          <section className="rounded-2xl border border-white/15 p-6 flex flex-col">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">New Player</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Create new wallet</h2>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="mt-5 space-y-4 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
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
                  <div className="rounded-xl border border-[#f6df84]/30 bg-[#f6df84]/8 px-4 py-3 text-sm text-[#f8e8a5]">
                    Passwords do not match
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={
                  isCreating ||
                  !nickname.trim() ||
                  !password ||
                  password !== confirmPassword
                }
                className="w-full rounded-2xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1a14] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-[#0f1a14]/30 border-t-[#0f1a14]"
                    />
                    Creating...
                  </span>
                ) : (
                  'Create Wallet'
                )}
              </button>
            </form>
          </section>
        </div>

        {/* Import Section */}
        <div className="mt-6">
          <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Import Backup</p>
            <h3 className="mt-2 text-xl font-bold text-white">Restore from file</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Restore an encrypted wallet backup. You'll still need the original password to unlock it.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input
                value={importNickname}
                onChange={(event) => setImportNickname(event.target.value)}
                placeholder="Optional new nickname"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#53a6ff]"
              />
            </form>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-black/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportWallet}
                disabled={isImporting}
                className="sr-only"
              />
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-400"
                  />
                  Importing...
                </span>
              ) : (
                'Choose Backup File'
              )}
            </label>
          </section>
        </div>

        {isLoading && !isCreating ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-400">
            Loading wallet access...
          </div>
        ) : null}
      </PageShell>

      {/* Wallet Created — Faucet Step */}
      <AnimatePresence mode="wait">
        {justCreated && (
          <FaucetClaimModal
            account={justCreated}
            onClaim={handleClaimFaucet}
            onSkip={() => {
              setJustCreated(null)
              navigate('/')
            }}
            isClaiming={isFauceting}
          />
        )}
      </AnimatePresence>

      {/* Delete Wallet Confirmation Modal */}
      <AnimatePresence mode="wait">
        {walletToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
            onClick={() => {
              if (!isDeleting) {
                setWalletToDelete(null)
                setDeletePassword('')
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-2xl border border-red-500/30 bg-card p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-red-400">Delete Wallet</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Are you sure?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This will remove <span className="font-semibold text-white">{walletToDelete.nickname}</span> from 
                this device and attempt to delete it from the backend keystore. This action cannot be undone.
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Address</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-300">{walletToDelete.address}</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleDeleteWallet(); }} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Enter wallet password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Wallet password"
                    disabled={isDeleting}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDeleting) {
                        setWalletToDelete(null)
                        setDeletePassword('')
                      }
                    }}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        />
                        Deleting...
                      </span>
                    ) : (
                      'Delete Wallet'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AuthPage
