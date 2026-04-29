import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import FieldCard from '../components/app/FieldCard'
import PageShell from '../components/app/PageShell'
import ProductHero from '../components/app/ProductHero'
import { shortAddress } from '../lib/address'
import { createGame2048Client, type Game2048ClientStatus } from '../lib/chain2048'
import {
  createRpcKeystoreAccount,
  fetchRpcKeystoreAccounts,
  importRpcKeystoreWallet,
  type RpcKeystoreAccount,
  type RpcWalletBackup,
} from '../lib/rpcChain2048'
import {
  loadStoredWalletAuth,
  persistStoredWalletAuth,
} from '../lib/walletAuth'

type AuthTab = 'login' | 'register'

function AuthPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab: AuthTab = requestedTab === 'register' ? 'register' : 'login'

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

  function switchTab(nextTab: AuthTab) {
    setSearchParams({ tab: nextTab })
  }

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

  function handleLogIn() {
    if (!selectedWallet) {
      toast.error('Choose a wallet first.')
      return
    }
    if (!loginPassword) {
      toast.error('Enter the wallet password first.')
      return
    }

    syncSession(selectedWallet, loginPassword)
    toast.success(`${selectedWallet.nickname} is now signed in on this device.`)
    navigate('/')
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
      switchTab('login')
      toast.success(`Imported ${imported.nickname}. Use the original wallet password to log in.`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Unable to import this wallet backup.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <PageShell maxWidthClass="max-w-[940px]" paddingClass="px-4 py-10 sm:px-6 lg:px-8">
        <ProductHero
          eyebrow="ProofArcade Wallet"
          title="Unlock your wallet and start playing."
          description="Create a wallet, import an encrypted backup, or unlock an existing player on this device. Once signed in, the game, profile, shop, and check-in pages can use it automatically."
        />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => switchTab('login')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === 'login'
                  ? 'bg-[#53a6ff] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === 'register'
                  ? 'bg-[#f0cf52] text-[#2f2418]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Log In</p>
              <h2 className="mt-3 text-[2rem] font-bold text-white">Unlock your wallet</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Pick a saved wallet, enter its password, and stay signed in locally so the game can use it across the product.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FieldCard label="Choose wallet">
                  <select
                    value={selectedAddress}
                    onChange={(event) => setSelectedAddress(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
                  >
                    <option value="">Choose wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.address} value={wallet.address}>
                        {wallet.nickname} ({shortAddress(wallet.address)})
                      </option>
                    ))}
                  </select>
                </FieldCard>

                <FieldCard label="Wallet password">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="Wallet password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
                  />
                </FieldCard>
              </div>

              {selectedWallet ? (
                <div className="mt-4 rounded-[1rem] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Selected wallet</p>
                  <p className="mt-2 text-lg font-bold text-white">{selectedWallet.nickname}</p>
                  <p className="mt-2 break-all text-sm leading-6 text-slate-400">{selectedWallet.address}</p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleLogIn}
                  disabled={status.mode !== 'rpc' || !selectedAddress}
                  className="rounded-2xl bg-[#53a6ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#64b0ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Log In
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Switch to Register
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Register</p>
              <h2 className="mt-3 text-[2rem] font-bold text-white">Create your wallet</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                This creates a wallet in the live node keystore and signs it in locally on this device so you can go straight into the game.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <FieldCard label="Nickname">
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="Nickname"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
                  />
                </FieldCard>
                <FieldCard label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
                  />
                </FieldCard>
                <FieldCard label="Confirm">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
                  />
                </FieldCard>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleRegister}
                  disabled={status.mode !== 'rpc' || isCreating}
                  className="rounded-2xl bg-[#f0cf52] px-5 py-3 text-sm font-semibold text-[#2f2418] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
                </button>
                <button
                  onClick={() => switchTab('login')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Switch to Log In
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Import Backup</p>
            <h3 className="mt-3 text-[1.85rem] font-bold text-white">Import a saved wallet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Restore an encrypted wallet backup on this device. The wallet stays encrypted and still needs its original password before it can sign.
            </p>
            <input
              value={importNickname}
              onChange={(event) => setImportNickname(event.target.value)}
              placeholder="Optional new nickname"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#53a6ff]"
            />
            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-black/50">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportWallet}
                disabled={isImporting}
                className="sr-only"
              />
              {isImporting ? 'Importing Backup...' : 'Import Wallet Backup'}
            </label>
          </section>

          <section className="rounded-[1.4rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Session</p>
            <p className="mt-2 text-lg font-bold text-white">
              {storedWallet ? storedWallet.nickname : 'Guest'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {storedWallet
                ? `${shortAddress(storedWallet.address)} is signed in locally on this device.`
                : 'No wallet is signed in locally yet.'}
            </p>
          </section>
        </aside>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-400">
          Loading wallet access...
        </div>
      ) : null}
      </PageShell>
    </motion.div>
  )
}

export default AuthPage
