import { startTransition, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'

import {
  canMove,
  createSeedFromText,
  getUtcDateString,
  initializeBoard,
  randomSeed,
  replaySession,
  type GameMode,
  type LocalSession,
  type MoveDirection,
  type PlayMode,
  type StopReason,
} from '../lib/game2048'
import {
  type ChainConfig,
  type LeaderboardEntry,
  type PlayerStats,
} from '../lib/mockChain2048'
import {
  createGame2048Client,
  type Game2048Client,
  type Game2048ClientStatus,
} from '../lib/chain2048'
import { fetchRpcKeystoreAccounts, type RpcKeystoreAccount } from '../lib/rpcChain2048'
import {
  clearStoredWalletAuth,
  loadStoredWalletAuth,
  persistStoredWalletAuth,
} from '../lib/walletAuth'
import { shortAddress } from '../lib/address'

const tileStyles: Record<number, string> = {
  0: 'bg-white/8 text-white/20',
  2: 'bg-[#f3efe6] text-[#372f24]',
  4: 'bg-[#f4d3ab] text-[#2f2418]',
  8: 'bg-[#e68852] text-white',
  16: 'bg-[#d65d3e] text-white',
  32: 'bg-[#b8453f] text-white',
  64: 'bg-[#7e2b3b] text-white',
  128: 'bg-[#6d7e3b] text-white',
  256: 'bg-[#7ebd5d] text-[#173019]',
  512: 'bg-[#53d7a6] text-[#102d24]',
  1024: 'bg-[#53a6ff] text-white',
  2048: 'bg-[#f0cf52] text-[#43340a]',
}

const ACTIVE_SESSION_KEY = 'canopy-2048-active-session-v2'
const ACTIVE_RUN_STATE_KEY = 'canopy-2048-active-run-state-v2'

interface StoredSessionRecord {
  address: string
  session: LocalSession
}

interface StoredRunState {
  address: string
  board: number[]
  score: number
  maxTile: number
  moves: MoveDirection[]
  selectedMode: PlayMode
  leaderboardMode: GameMode
  selectedBoard?: GameMode
  isSubmitted: boolean
  lastOutcome: { stopReason: StopReason; score: number; maxTile: number } | null
}

interface TxStatusView {
  hash: string
  stage: 'submitted' | 'pending' | 'indexed'
  detail: string
}

interface ActionBannerState {
  tone: 'neutral' | 'info' | 'success' | 'warning'
  title: string
  detail: string
}

function Play2048Page() {
  const [searchParams] = useSearchParams()
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [wallets, setWallets] = useState<RpcKeystoreAccount[]>([])
  const [client, setClient] = useState<Game2048Client | null>(null)
  const [clientStatus, setClientStatus] = useState<Game2048ClientStatus>({
    mode: 'mock',
    label: 'Connecting backend',
    detail: 'Checking whether live 2048 endpoints are available on this node.',
  })
  const [config, setConfig] = useState<ChainConfig>({ dailyFee: 25, classicFee: 2, dailyMaxMoves: 80 })
  const [isLoadingClient, setIsLoadingClient] = useState(true)
  const [player, setPlayer] = useState<PlayerStats | null>(null)
  const [leaderboards, setLeaderboards] = useState<{ daily: LeaderboardEntry[]; classic: LeaderboardEntry[] }>({ daily: [], classic: [] })
  const [session, setSession] = useState<LocalSession | null>(null)
  const [board, setBoard] = useState<number[]>(() => initializeBoard(createSeedFromText('demo')))
  const [score, setScore] = useState(0)
  const [maxTile, setMaxTile] = useState(0)
  const [moves, setMoves] = useState<MoveDirection[]>([])
  const [selectedMode, setSelectedMode] = useState<PlayMode>('training')
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode>('daily')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<{ stopReason: StopReason; score: number; maxTile: number } | null>(null)
  const [lastStartTx, setLastStartTx] = useState<TxStatusView | null>(null)
  const [lastSubmitTx, setLastSubmitTx] = useState<TxStatusView | null>(null)
  const [lastFaucetTx, setLastFaucetTx] = useState<TxStatusView | null>(null)
  const [lastActionError, setLastActionError] = useState<string | null>(null)
  const [classicPointsEarnedToday, setClassicPointsEarnedToday] = useState(0)
  const sessionRef = useRef<LocalSession | null>(null)
  const movesRef = useRef<MoveDirection[]>([])
  const boardRef = useRef<number[]>(board)
  const scoreRef = useRef(0)
  const maxTileRef = useRef(0)
  const isSubmittedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      // Read URL mode parameter as highest priority
      const modeParam = searchParams.get('mode')
      const urlMode: GameMode | null = 
        modeParam === 'daily' ? 'daily' : 
        modeParam === 'classic' ? 'classic' : 
        null
      
      const nextClient = await createGame2048Client()
      if (cancelled) {
        return
      }
      setClient(nextClient)
      setClientStatus(nextClient.status)
      setConfig(await nextClient.getConfig())
      let bootstrapAddress = address
      let rpcWalletCount = 0
      const storedAuth = loadStoredWalletAuth()
      if (nextClient.status.mode === 'rpc') {
        const nextWallets = await fetchRpcKeystoreAccounts()
        if (cancelled) {
          return
        }
        rpcWalletCount = nextWallets.length
        setWallets(nextWallets)
        
        // Only set default mode if NO URL parameter exists
        if (nextWallets.length > 0 && !urlMode) {
          setSelectedMode('classic')
          setLeaderboardMode('classic')
        } else if (urlMode) {
          setSelectedMode(urlMode)
          setLeaderboardMode(urlMode)
        }
        if (
          storedAuth &&
          nextWallets.some((wallet) => wallet.address === storedAuth.address)
        ) {
          bootstrapAddress = storedAuth.address
          setAddress(storedAuth.address)
          setPassword(storedAuth.password)
        } else if ((!bootstrapAddress || !/^[0-9a-f]{40}$/.test(bootstrapAddress)) && nextWallets.length > 0) {
          bootstrapAddress = nextWallets[0].address
          setAddress(bootstrapAddress)
        }
      } else if (!bootstrapAddress) {
        bootstrapAddress = `player-${createSeedFromText('canopy-player').slice(0, 6)}`
        setAddress(bootstrapAddress)
      }
      const rawRestoredSession = loadStoredSession(bootstrapAddress)
      const rawRestoredRunState = loadStoredRunState(bootstrapAddress)
      const restoredMode = rawRestoredRunState?.selectedMode ?? rawRestoredRunState?.selectedBoard
      const restoredTxHash = (rawRestoredSession as (LocalSession & { txHash?: string }) | null)?.txHash
      const shouldIgnoreLocalRestore =
        nextClient.status.mode === 'rpc' &&
        rpcWalletCount > 0 &&
        (
          rawRestoredSession?.mode === 'training' ||
          (rawRestoredSession != null && !restoredTxHash) ||
          (rawRestoredSession == null && restoredMode != null)
        )
      const restoredSession = shouldIgnoreLocalRestore ? null : rawRestoredSession
      const restoredRunState = shouldIgnoreLocalRestore ? null : rawRestoredRunState

      const [nextPlayer, nextLeaderboards] = await Promise.all([
        nextClient.getPlayer(bootstrapAddress),
        nextClient.getLeaderboards(),
      ])
      if (cancelled) {
        return
      }
      startTransition(() => {
        setPlayer(nextPlayer)
        setLeaderboards(nextLeaderboards)
        setSession(restoredSession)
        if (restoredRunState) {
          const restoredMode = restoredRunState.selectedMode ?? restoredRunState.selectedBoard ?? 'training'
          const nextSelectedMode: PlayMode =
            nextClient.status.mode === 'rpc' &&
            rpcWalletCount > 0 &&
            !restoredSession &&
            restoredMode === 'training'
              ? 'classic'
              : restoredMode
          const nextLeaderboardMode: GameMode =
            nextClient.status.mode === 'rpc' &&
            rpcWalletCount > 0 &&
            !restoredSession &&
            restoredMode === 'training'
              ? 'classic'
              : restoredRunState.leaderboardMode ?? 'daily'
          setBoard(restoredRunState.board)
          setScore(restoredRunState.score)
          setMaxTile(restoredRunState.maxTile)
          setMoves(restoredRunState.moves)
          setSelectedMode(nextSelectedMode)
          setLeaderboardMode(nextLeaderboardMode)
          setIsSubmitted(restoredRunState.isSubmitted)
          setLastOutcome(restoredRunState.lastOutcome)
        } else if (restoredSession) {
          const initialBoard = initializeBoard(restoredSession.seed)
          setBoard(initialBoard)
          setScore(0)
          setMaxTile(Math.max(...initialBoard))
          setMoves([])
          setSelectedMode(restoredSession.mode)
          setIsSubmitted(false)
          setLastOutcome(null)
        }
      })
      setIsLoadingClient(false)
    }

    bootstrap().catch((error) => {
      console.error(error)
      toast.error('Unable to initialize the 2048 backend client.')
      setIsLoadingClient(false)
    })

    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    if (!client) {
      return
    }
    refreshPlayerState(client, address)
  }, [client, address])

  // Initialize earned today from player stats when loaded
  useEffect(() => {
    if (player) {
      setClassicPointsEarnedToday(player.classicPointsEarnedToday ?? 0)
    }
  }, [player])

  useEffect(() => {
    if (clientStatus.mode !== 'rpc') {
      return
    }
    const normalizedAddress = address.trim().toLowerCase()
    if (!/^[0-9a-f]{40}$/.test(normalizedAddress) || !password) {
      return
    }

    const nickname = wallets.find((wallet) => wallet.address === normalizedAddress)?.nickname ?? normalizedAddress
    persistStoredWalletAuth({
      address: normalizedAddress,
      nickname,
      password,
      loggedInAt: new Date().toISOString(),
    })
  }, [address, password, wallets, clientStatus.mode])

  useEffect(() => {
    persistSession(address, session)
  }, [address, session])

  useEffect(() => {
    sessionRef.current = session
    movesRef.current = moves
    boardRef.current = board
    scoreRef.current = score
    maxTileRef.current = maxTile
    isSubmittedRef.current = isSubmitted
  }, [session, moves, board, score, maxTile, isSubmitted])

  useEffect(() => {
    persistRunState({
      address,
      board,
      score,
      maxTile,
      moves,
      selectedMode,
      leaderboardMode,
      isSubmitted,
      lastOutcome,
    })
  }, [address, board, score, maxTile, moves, selectedMode, leaderboardMode, isSubmitted, lastOutcome])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!session || isSubmitted) {
        return
      }

      const map: Record<string, MoveDirection | undefined> = {
        ArrowUp: 'up',
        ArrowRight: 'right',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        w: 'up',
        d: 'right',
        s: 'down',
        a: 'left',
      }

      const direction = map[event.key]
      if (direction) {
        event.preventDefault()
        playMove(direction)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [session, isSubmitted, board, moves, score, maxTile])

  const dailyWindowLabel = `${getUtcDateString()} UTC`
  const activeBoard = leaderboardMode === 'daily' ? leaderboards.daily : leaderboards.classic
  const canStart = !session || isSubmitted
  const canUseLiveWallet = selectedMode === 'training' || clientStatus.mode !== 'rpc' || (/^[0-9a-f]{40}$/.test(address.trim().toLowerCase()) && password.length > 0)
  const currentFee = session?.mode === 'daily' ? config.dailyFee : session?.mode === 'classic' ? config.classicFee : 0
  const selectedModeConfig = selectedMode === 'daily'
    ? {
        title: 'Daily Challenge',
        accent: 'bg-[#c95f38]/30',
        actionTone: 'bg-[#c95f38] hover:bg-[#d36c49]',
        fee: config.dailyFee,
        detail: `One attempt per address. Seed changes ${dailyWindowLabel}.`,
        meta: `${config.dailyMaxMoves} move cap`,
      }
    : selectedMode === 'classic' ? {
        title: 'Classic Mode',
        accent: 'bg-[#53a6ff]/30',
        actionTone: 'bg-[#53a6ff] hover:bg-[#64b0ff]',
        fee: config.classicFee,
        detail: 'Unlimited runs with a fresh deterministic seed each paid session.',
        meta: 'No move cap',
      }
    : {
        title: 'Training Mode',
        accent: 'bg-[#53d7a6]/30',
        actionTone: 'bg-[#53d7a6] hover:bg-[#67ddb3]',
        fee: 0,
        detail: 'Free local board for warm-up runs. No wallet, no fee, no blockchain.',
        meta: 'No tx, no rewards',
      }
  const actionBanner = getActionBanner({
    session,
    isSubmitted,
    lastOutcome,
    lastStartTx,
    lastSubmitTx,
    lastFaucetTx,
  })

  async function refreshPlayerState(activeClient = client, nextAddress = address) {
    if (!activeClient) {
      setPassword('')
      return
    }

    const [nextPlayer, nextLeaderboards] = await Promise.all([
      activeClient.getPlayer(nextAddress),
      activeClient.getLeaderboards(),
    ])

    startTransition(() => {
      setPlayer(nextPlayer)
      setLeaderboards(nextLeaderboards)
    })
  }

  async function start(mode: PlayMode) {
    if (!client && mode !== 'training') {
      return
    }

    try {
      if (mode === 'training') {
        const nextSession: LocalSession = {
          gameId: createSeedFromText(`training:${Date.now()}:${Math.random()}`),
          mode: 'training',
          seed: randomSeed(),
          utcDate: getUtcDateString(),
          maxMoves: 0,
        }
        const initialBoard = initializeBoard(nextSession.seed)
        setSession(nextSession)
        setBoard(initialBoard)
        setScore(0)
        setMaxTile(Math.max(...initialBoard))
        setMoves([])
        setIsSubmitted(false)
        setLastOutcome(null)
        setSelectedMode('training')
        setLastStartTx(null)
        setLastSubmitTx(null)
        setLastActionError(null)
        toast.success('Training run started locally.')
        return
      }

      const nextSession = await client!.startSession(address, mode, password)
      const initialBoard = initializeBoard(nextSession.seed)
      setSession(nextSession)
      setBoard(initialBoard)
      setScore(0)
      setMaxTile(Math.max(...initialBoard))
      setMoves([])
      setIsSubmitted(false)
      setLastOutcome(null)
      setSelectedMode(mode)
      setLastStartTx(nextSession.txHash ? {
        hash: nextSession.txHash,
        stage: nextSession.txStage ?? 'submitted',
        detail: nextSession.txDetail ?? 'Hash returned by RPC.',
      } : null)
      setLastActionError(null)
      await refreshPlayerState(client!)
      toast.success(
        nextSession.txHash
          ? `${mode === 'daily' ? 'Daily challenge' : 'Classic run'} started. ${nextSession.txStage ?? 'submitted'}.`
          : `${mode === 'daily' ? 'Daily challenge' : 'Classic run'} started.`,
      )
    } catch (error) {
      const message = normalizeActionError(error instanceof Error ? error.message : 'Unable to start session.')
      setLastActionError(message)
      toast.error(message)
    }
  }

  function playMove(direction: MoveDirection) {
    const activeSession = sessionRef.current
    if (!activeSession || isSubmittedRef.current) {
      return
    }

    const currentMoves = movesRef.current
    const currentReplay = replaySession(activeSession.seed, currentMoves, activeSession.maxMoves, 'player_stopped')
    const nextMoves = [...currentMoves, direction]
    const nextReplay = replaySession(activeSession.seed, nextMoves, activeSession.maxMoves, 'player_stopped')

    if (
      boardsEqual(currentReplay.board, nextReplay.board) &&
      currentReplay.score === nextReplay.score &&
      currentReplay.maxTile === nextReplay.maxTile
    ) {
      return
    }

    const nextScore = nextReplay.score
    const nextBoard = nextReplay.board
    const nextMaxTile = nextReplay.maxTile

    setBoard(nextBoard)
    setMoves(nextMoves)
    setScore(nextScore)
    setMaxTile(nextMaxTile)

    boardRef.current = nextBoard
    movesRef.current = nextMoves
    scoreRef.current = nextScore
    maxTileRef.current = nextMaxTile

    const exceededMoves = nextReplay.endedReason === 'max_moves'
    const stuck = nextReplay.endedReason === 'no_moves' || !canMove(nextBoard)

    if (exceededMoves || stuck) {
      const stopReason: StopReason = exceededMoves
        ? 'max_moves'
        : nextReplay.endedReason === 'no_moves'
          ? 'no_moves'
          : 'no_moves'
      finishRun(stopReason, nextMoves)
    }
  }

  async function finishRun(stopIntent: StopReason, finalMoves = movesRef.current) {
    const activeSession = sessionRef.current
    if (!activeSession || isSubmittedRef.current) {
      return
    }

    try {
      if (activeSession.mode === 'training') {
        const expected = replaySession(activeSession.seed, finalMoves, activeSession.maxMoves, stopIntent)
        setIsSubmitted(true)
        setLastOutcome({ stopReason: expected.endedReason, score: expected.score, maxTile: expected.maxTile })
        setBoard(expected.board)
        setScore(expected.score)
        setMaxTile(expected.maxTile)
        movesRef.current = finalMoves
        boardRef.current = expected.board
        scoreRef.current = expected.score
        maxTileRef.current = expected.maxTile
        isSubmittedRef.current = true
        setLastSubmitTx(null)
        setLastActionError(null)
        toast.success(`Training run finished at ${expected.score} score.`)
        return
      }

      if (!client) {
        return
      }

      const chainSession = activeSession as LocalSession & { mode: GameMode }
      const liveSession = chainSession as LocalSession & { txStage?: 'submitted' | 'pending' | 'indexed' }
      if (clientStatus.mode === 'rpc' && liveSession.txStage && liveSession.txStage !== 'indexed') {
        throw new Error('Wait for the start transaction to finish indexing before submitting the score.')
      }

      const expected = replaySession(chainSession.seed, finalMoves, chainSession.maxMoves, stopIntent)
      const result = await client.submitSession({
        address,
        password,
        session: chainSession,
        moves: finalMoves,
        declaredScore: expected.score,
        declaredMaxTile: expected.maxTile,
        stopReason: expected.endedReason,
      })

      setIsSubmitted(true)
      setLastOutcome({ stopReason: expected.endedReason, score: expected.score, maxTile: expected.maxTile })
      setBoard(expected.board)
      setScore(expected.score)
      setMaxTile(expected.maxTile)
      movesRef.current = finalMoves
      boardRef.current = expected.board
      scoreRef.current = expected.score
      maxTileRef.current = expected.maxTile
      isSubmittedRef.current = true
      setLastSubmitTx(result.txHash ? {
        hash: result.txHash,
        stage: result.txStage ?? 'submitted',
        detail: result.txDetail ?? 'Hash returned by RPC.',
      } : null)
      setLastActionError(null)
      
      // Update today's Classic Points earned for Classic Mode submissions
      if (chainSession.mode === 'classic') {
        const basePoints = Math.floor(expected.score / 24)
        const dailyCap = config.classicDailyPointsCap ?? 2000
        const remainingCap = Math.max(0, dailyCap - classicPointsEarnedToday)
        const cappedBasePoints = Math.min(basePoints, remainingCap)
        const bonusBps = player?.classicPointsBonusUtcDate === getUtcDateString() ? (config.dailyLoginBonusBps ?? 2000) : 0
        const bonusPoints = Math.floor((cappedBasePoints * bonusBps) / 10000)
        
        const newTotal = classicPointsEarnedToday + cappedBasePoints
        setClassicPointsEarnedToday(newTotal)
        
        console.log('Classic Points earned this game:')
        console.log('  - Base points:', basePoints)
        console.log('  - Capped base points:', cappedBasePoints)
        console.log('  - Bonus points:', bonusPoints)
        console.log('  - Total earned today:', newTotal)
      }
      
      await refreshPlayerState(client)
      toast.success(
        result.txHash
          ? `Score ${expected.score} submitted. ${result.txStage ?? 'submitted'}.`
          : `Score ${expected.score} submitted.`,
      )
    } catch (error) {
      const message = normalizeActionError(error instanceof Error ? error.message : 'Submission failed.')
      setLastActionError(message)
      toast.error(message)
    }
  }

  function clearSession() {
    setSession(null)
    setMoves([])
    setScore(0)
    setMaxTile(0)
    setIsSubmitted(true)
    setLastOutcome(null)
    setLastActionError(null)
    setBoard(initializeBoard(createSeedFromText('demo')))
    // Reset daily earned points when date changes (checked on next game start)
  }

  function newIdentity() {
    if (clientStatus.mode === 'rpc') {
      clearStoredWalletAuth()
      setSession(null)
      setMoves([])
      setBoard(initializeBoard(createSeedFromText('demo')))
      setScore(0)
      setMaxTile(0)
      setIsSubmitted(false)
      setLastOutcome(null)
      setLastActionError(null)
      setPassword('')
      return
    }

    const nextAddress = `player-${createSeedFromText(String(Date.now())).slice(0, 6)}`
    setAddress(nextAddress)
    setSession(null)
    setMoves([])
    setBoard(initializeBoard(createSeedFromText('demo')))
    setScore(0)
    setMaxTile(0)
    setIsSubmitted(false)
    setLastOutcome(null)
    setLastActionError(null)
    void refreshPlayerState(client, nextAddress)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto min-h-screen max-w-[1460px] px-4 py-6 sm:px-6 xl:px-8 2xl:px-10"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back To Home
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center rounded-full border border-[#53a6ff]/30 bg-[#53a6ff]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#9fd0ff] transition hover:bg-[#53a6ff]/20 hover:text-white"
          >
            Player Profile
          </Link>
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
          Dedicated Game View
        </div>
      </div>
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-card p-4 sm:p-6 xl:p-8">
        <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f6df84]">ProofArcade 2048</p>
                  <h1 className="mt-2 font-bold text-4xl leading-none text-white sm:text-6xl">
                    Choose Your Mode
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Practice in Training Mode, then compete in Daily Challenge or Classic Mode for rewards.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Session</p>
                  
                  {/* Connected Wallet */}
                  {clientStatus.mode === 'rpc' && wallets.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-400">Connected Wallet</p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {wallets.find(w => w.address === address)?.nickname || 'Unknown'}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{shortAddress(address)}</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-400">Mode</p>
                      <p className="mt-1 text-sm font-bold text-white">Local Only</p>
                    </div>
                  )}

                  {/* Selected Mode */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-400">Selected Mode</p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedMode === 'daily' ? 'Daily Challenge' : selectedMode === 'classic' ? 'Classic Mode' : 'Training Mode'}
                    </p>
                  </div>

                  {/* Entry Fee */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-400">Entry Fee</p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedMode === 'daily' ? `${config.dailyFee} PROOF` : selectedMode === 'classic' ? `${config.classicFee} PROOF` : 'FREE'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${clientStatus.mode === 'rpc' && address && password ? 'bg-[#53d7a6]' : selectedMode === 'training' ? 'bg-[#53d7a6]' : 'bg-amber-500'}`} />
                    <p className="text-xs font-semibold text-slate-400">
                      {clientStatus.mode === 'rpc' && address && password ? 'Connected' : selectedMode === 'training' ? 'Ready' : 'Wallet Required'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {/* COMPETITIVE RUNS SECTION */}
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f6df84]">Competitive Runs</p>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <ModePanel
                      title="Daily Challenge"
                      fee={config.dailyFee}
                      detail={`One attempt per address. Seed changes ${dailyWindowLabel}.`}
                      meta={`${config.dailyMaxMoves} move cap`}
                      selected={selectedMode === 'daily'}
                      disabled={!canStart || isLoadingClient || !canUseLiveWallet}
                      tone="daily"
                      onSelect={() => setSelectedMode('daily')}
                      onStart={() => start('daily')}
                    />
                    <ModePanel
                      title="Classic Mode"
                      fee={config.classicFee}
                      detail="Unlimited runs with a fresh deterministic seed each paid session."
                      meta="Warm-up friendly"
                      selected={selectedMode === 'classic'}
                      disabled={!canStart || isLoadingClient || !canUseLiveWallet}
                      tone="classic"
                      onSelect={() => setSelectedMode('classic')}
                      onStart={() => start('classic')}
                    />
                  </div>
                </div>

                {/* PRACTICE SECTION */}
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#53d7a6]">Practice</p>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>
                  <ModePanel
                    title="Training Mode"
                    fee="free"
                    detail="Practice for free before entering competitive runs. No fees, no submissions, no risk."
                    meta="Local only"
                    selected={selectedMode === 'training'}
                    disabled={!canStart || isLoadingClient}
                    tone="training"
                    onSelect={() => setSelectedMode('training')}
                    onStart={() => start('training')}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11161f]/90 p-4 sm:p-5">
                <div className="mx-auto w-full max-w-[800px]">
                  <div className={`rounded-2xl border border-white/10 ${selectedModeConfig.accent} px-4 py-4`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Selected Mode</p>
                        <h2 className="mt-1 text-2xl font-bold text-white">{selectedModeConfig.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{selectedModeConfig.detail}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Entry Fee</p>
                        <p className="mt-1 text-2xl font-black text-white">{selectedModeConfig.fee}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{selectedModeConfig.meta}</p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {actionBanner ? <ActionBanner key={`${actionBanner.title}-${actionBanner.detail}`} banner={actionBanner} /> : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {lastActionError ? (
                      <motion.div
                        key={lastActionError}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="mt-4 rounded-2xl border border-[#c95f38]/40 bg-[#c95f38]/10 px-4 py-3 text-sm text-[#ffd3c5]"
                      >
                        {lastActionError}
                      </motion.div>
                    ) : null}
                    {!canUseLiveWallet && (selectedMode === 'daily' || selectedMode === 'classic') && clientStatus.mode === 'rpc' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-amber-300">Wallet authentication required</p>
                        <p className="mt-1 text-sm text-amber-200/80">
                          {selectedMode === 'daily' ? 'Daily Challenge' : 'Classic Mode'} requires a signed-in wallet. Please <Link to="/auth" className="underline hover:text-amber-100">log in</Link> to continue.
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(280px,330px)_minmax(0,780px)] xl:items-start xl:justify-center">
                    <div className="space-y-3 xl:order-1">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#f6df84]/20 bg-[#f6df84]/10 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Score</p>
                          <p className="mt-1 text-3xl font-black text-white">{score}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Best Tile</p>
                          <p className="mt-1 text-3xl font-black text-white">{maxTile}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Moves</p>
                          <p className="mt-1 text-3xl font-black text-white">{moves.length}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Mode</p>
                          <p className="mt-1 text-lg font-bold uppercase tracking-[0.18em] text-white">{session?.mode ?? 'idle'}</p>
                          <p className="mt-1 text-xs text-slate-500">{session ? (session.mode === 'training' ? 'No fee, no chain' : `${currentFee} PROOF fee`) : 'Choose a run'}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                        <motion.button
                          onClick={() => start(selectedMode)}
                          disabled={!canStart || isLoadingClient || !canUseLiveWallet}
                          className={`rounded-2xl px-4 py-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedModeConfig.actionTone}`}
                        >
                          {selectedMode === 'daily' ? 'Start Daily Run' : selectedMode === 'classic' ? 'Start Classic Run' : 'Start Training Run'}
                        </motion.button>
                        <motion.button
                          onClick={() => finishRun('player_stopped')}
                          disabled={!session || isSubmitted || (session.mode !== 'training' && !canUseLiveWallet)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {session?.mode === 'training' ? 'Stop Training Run' : 'Stop + Submit'}
                        </motion.button>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-sm text-slate-300">Use arrow keys or WASD to move the board.</p>
                      </div>
                    </div>

                    <div className="mx-auto w-full max-w-[700px] rounded-2xl border border-white/10 bg-[#171d28] p-4 sm:max-w-[740px] sm:p-5 xl:order-2">
                      <div className="grid grid-cols-4 gap-4 sm:gap-5">
                        {board.map((value, index) => (
                          <motion.div
                            key={`${index}-${value}`}
                            layout
                            initial={{ scale: 0.92, opacity: 0.78 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                            className={`flex aspect-square items-center justify-center rounded-xl border border-black/10 text-[1.7rem] font-black sm:text-[2.2rem] ${tileStyles[value] ?? 'bg-[#111827] text-white'}`}
                          >
                            {value || ''}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </section>
    </motion.div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  )
}

function ActionBanner({ banner }: { banner: ActionBannerState }) {
  const toneClass = banner.tone === 'success'
    ? 'border-[#53d7a6]/30 bg-[#53d7a6]/10 text-[#c7ffe9]'
    : banner.tone === 'warning'
      ? 'border-[#f0cf52]/30 bg-[#f0cf52]/10 text-[#fff0b3]'
      : banner.tone === 'info'
        ? 'border-[#53a6ff]/30 bg-[#53a6ff]/10 text-[#d7e9ff]'
        : 'border-white/10 bg-white/5 text-slate-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`mt-4 rounded-xl border px-4 py-3 ${toneClass}`}
    >
      <p className="text-sm font-semibold">{banner.title}</p>
      <p className="mt-1 text-sm leading-6 opacity-90">{banner.detail}</p>
    </motion.div>
  )
}

function ModePanel(args: {
  title: string
  fee: number | string
  detail: string
  meta: string
  selected: boolean
  disabled: boolean
  tone: 'daily' | 'classic' | 'training'
  onSelect: () => void
  onStart: () => void
}) {
  const toneClass = args.tone === 'daily'
    ? 'border-[#c95f38]/30 bg-[#c95f38]/10'
    : args.tone === 'classic'
      ? 'border-[#53a6ff]/30 bg-[#53a6ff]/10'
      : 'border-[#53d7a6]/30 bg-[#53d7a6]/10'

  return (
    <motion.div
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className={`rounded-2xl border p-4 transition ${args.selected ? toneClass : 'border-white/10 bg-slate-950/50'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{args.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{args.detail}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          {args.fee}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{args.meta}</p>
        {args.selected ? (
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
            <span>✓</span>
            <span>Selected</span>
          </div>
        ) : (
          <motion.button
            onClick={args.onSelect}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Select
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

function RankBadge({ index }: { index: number }) {
  const tone = index === 0
    ? 'bg-[#f0cf52]/20 text-[#f6df84]'
    : index === 1
      ? 'bg-slate-200/10 text-slate-200'
      : index === 2
        ? 'bg-[#c95f38]/20 text-[#ffcfbf]'
        : 'bg-white/5 text-slate-400'

  return (
    <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${tone}`}>
      #{index + 1}
    </div>
  )
}

function formatAddress(address: string): string {
  if (!address) {
    return 'No wallet selected'
  }
  if (address.length <= 16) {
    return address
  }
  return `${address.slice(0, 8)}...${address.slice(-4)}`
}

function normalizeActionError(message: string): string {
  const text = message.trim()
  const lower = text.toLowerCase()

  if (lower.includes('player already used their daily attempt') || lower.includes('already played for this address today')) {
    return 'This wallet already used its daily attempt for today’s UTC board.'
  }
  if (lower.includes('wait for the start transaction to finish indexing')) {
    return 'The start transaction is still indexing. Wait for it to turn indexed before submitting.'
  }
  if (lower.includes('live mode expects a 40-character hex address')) {
    return 'Choose a wallet from the keystore and enter its password before starting.'
  }
  if (lower.includes('wallet password')) {
    return 'Enter the wallet password to sign this action.'
  }
  if (lower.includes('not enough') || lower.includes('insufficient')) {
    return 'This wallet does not have enough PROOF to pay the game fee.'
  }
  if (lower.includes('game session not found')) {
    return 'The session could not be found on-chain. Start a fresh run and try again.'
  }
  return text
}

function getActionBanner(args: {
  session: LocalSession | null
  isSubmitted: boolean
  lastOutcome: { stopReason: StopReason; score: number; maxTile: number } | null
  lastStartTx: TxStatusView | null
  lastSubmitTx: TxStatusView | null
  lastFaucetTx: TxStatusView | null
}): ActionBannerState | null {
  if (args.session?.mode === 'training' && args.isSubmitted && args.lastOutcome) {
    return {
      tone: 'success',
      title: 'Training run complete',
      detail: `You finished a local-only run at ${args.lastOutcome.score} score with tile ${args.lastOutcome.maxTile}. Nothing was sent on-chain.`,
    }
  }

  if (args.session?.mode === 'training' && !args.isSubmitted) {
    return {
      tone: 'info',
      title: 'Training mode is local only',
      detail: 'This run does not need a wallet, does not pay a fee, and will not touch leaderboards, points, or treasury state.',
    }
  }

  if (args.lastSubmitTx?.stage === 'indexed' && args.lastOutcome) {
    return {
      tone: 'success',
      title: 'Score locked in',
      detail: `Your ${args.lastOutcome.score} score with tile ${args.lastOutcome.maxTile} is indexed on-chain and should now appear in stats and leaderboards.`,
    }
  }

  if (args.lastSubmitTx?.stage === 'pending' || args.lastSubmitTx?.stage === 'submitted') {
    return {
      tone: 'warning',
      title: 'Submission is still settling',
      detail: args.lastSubmitTx.detail,
    }
  }

  if (args.session && args.lastStartTx?.stage === 'indexed' && !args.isSubmitted) {
    return {
      tone: 'info',
      title: 'Run is live',
      detail: 'The session is indexed. Play normally and submit once you are done.',
    }
  }

  if (args.session && (args.lastStartTx?.stage === 'pending' || args.lastStartTx?.stage === 'submitted')) {
    return {
      tone: 'warning',
      title: 'Start transaction is still settling',
      detail: 'You can look at the seeded board, but score submission should wait until the start tx reaches indexed.',
    }
  }

  if (args.lastFaucetTx?.stage === 'indexed') {
    return {
      tone: 'success',
      title: 'Wallet funded',
      detail: 'The faucet transaction is indexed. Your updated balance is ready for a new run.',
    }
  }

  if (args.lastFaucetTx?.stage === 'pending' || args.lastFaucetTx?.stage === 'submitted') {
    return {
      tone: 'warning',
      title: 'Faucet is still settling',
      detail: args.lastFaucetTx.detail,
    }
  }

  return null
}

function loadStoredSession(address: string): LocalSession | null {
  if (!address) {
    return null
  }
  const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredSessionRecord
    if (parsed?.address !== address || !parsed?.session) {
      return null
    }
    return parsed.session
  } catch {
    return null
  }
}

function persistSession(address: string, session: LocalSession | null): void {
  if (!session || !address) {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
    return
  }

  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ address, session } satisfies StoredSessionRecord))
}

function loadStoredRunState(address: string): StoredRunState | null {
  if (!address) {
    return null
  }
  const raw = localStorage.getItem(ACTIVE_RUN_STATE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredRunState
    if (parsed?.address !== address) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function persistRunState(state: StoredRunState): void {
  localStorage.setItem(ACTIVE_RUN_STATE_KEY, JSON.stringify(state))
}

function boardsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export default Play2048Page
