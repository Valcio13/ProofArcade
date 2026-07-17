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
  clearGameSession,
  createGameSession,
  loadGameSession,
  markCompleted,
  markSubmitted,
  saveGameSession,
  updateGameState,
  type GameSessionRecord,
} from '../lib/gameSessionRecovery'
import { SessionRecoveryPrompt } from '../components/SessionRecoveryPrompt'
import { WeeklyBlitzTimer } from '../components/WeeklyBlitzTimer'
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
import { formatCNPY, toCNPY } from '../lib/utils'

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
  
  // Set dynamic document title based on selected mode
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'daily') {
      document.title = 'Daily Challenge | ProofArcade'
    } else if (modeParam === 'classic') {
      document.title = 'Classic Mode | ProofArcade'
    } else if (modeParam === 'weekly-blitz') {
      document.title = 'Weekly Blitz | ProofArcade'
    } else {
      document.title = 'Training Mode | ProofArcade'
    }
  }, [searchParams])

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
  const [dailyPrizePool, setDailyPrizePool] = useState<number>(0)
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
  const [pendingRecoverySession, setPendingRecoverySession] = useState<GameSessionRecord | null>(null)
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)
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
      const urlMode: PlayMode | null = 
        modeParam === 'daily' ? 'daily' : 
        modeParam === 'classic' ? 'classic' :
        modeParam === 'weekly-blitz' ? 'weekly-blitz' :
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

      // NEW RECOVERY SYSTEM: Check for existing session FIRST
      const existingSession = loadGameSession(bootstrapAddress)
      
      // If we have a valid existing session, show recovery prompt
      if (existingSession && existingSession.state === 'in-progress') {
        console.log('[Play2048] Found existing session, showing recovery prompt')
        setPendingRecoverySession(existingSession)
        setShowRecoveryPrompt(true)
        // Set mode to match recovered session
        setSelectedMode(existingSession.session.mode)
        setLeaderboardMode(existingSession.session.mode === 'training' ? 'daily' : existingSession.session.mode)
      }

      const [nextPlayer, nextLeaderboards, nextDailyPool] = await Promise.all([
        nextClient.getPlayer(bootstrapAddress),
        nextClient.getLeaderboards(),
        nextClient.getDailyPrizePool(getUtcDateString()),
      ])
      if (cancelled) {
        return
      }
      startTransition(() => {
        setPlayer(nextPlayer)
        setLeaderboards(nextLeaderboards)
        setDailyPrizePool(nextDailyPool?.rewardPool ?? 0)
        
        // Only restore session if no recovery prompt is shown
        if (!existingSession || existingSession.state !== 'in-progress') {
          // Legacy: Try old storage format for backward compatibility
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
  
  // Check if player has already completed today's Daily Challenge
  const todayUtcDate = getUtcDateString()
  const hasCompletedDailyToday = player?.dailyGamesStarted > 0 && 
    leaderboards.daily.some(entry => entry.address === address && entry.utcDate === todayUtcDate)
  
  // Calculate time until next UTC day (reset)
  const getTimeUntilReset = () => {
    const now = new Date()
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) }
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

    const [nextPlayer, nextLeaderboards, nextDailyPool] = await Promise.all([
      activeClient.getPlayer(nextAddress),
      activeClient.getLeaderboards(),
      activeClient.getDailyPrizePool(getUtcDateString()),
    ])

    startTransition(() => {
      setPlayer(nextPlayer)
      setLeaderboards(nextLeaderboards)
      setDailyPrizePool(nextDailyPool?.rewardPool ?? 0)
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
        const initialMaxTile = Math.max(...initialBoard)
        
        // Create new session record
        const sessionRecord = createGameSession(address, nextSession, initialBoard, initialMaxTile)
        saveGameSession(address, sessionRecord)
        
        setSession(nextSession)
        setBoard(initialBoard)
        setScore(0)
        setMaxTile(initialMaxTile)
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

      // Handle Weekly Blitz separately
      if (mode === 'weekly-blitz') {
        const nextSession = await client!.startWeeklyBlitzSession(address, password)
        const initialBoard = initializeBoard(nextSession.seed)
        const initialMaxTile = Math.max(...initialBoard)
        
        // Create new session record
        const sessionRecord = createGameSession(address, nextSession, initialBoard, initialMaxTile)
        saveGameSession(address, sessionRecord)
        
        setSession(nextSession)
        setBoard(initialBoard)
        setScore(0)
        setMaxTile(initialMaxTile)
        setMoves([])
        setIsSubmitted(false)
        setLastOutcome(null)
        setSelectedMode('weekly-blitz')
        setLastStartTx(nextSession.txHash ? {
          hash: nextSession.txHash,
          stage: nextSession.txStage ?? 'submitted',
          detail: nextSession.txDetail ?? 'Hash returned by RPC.',
        } : null)
        setLastActionError(null)
        await refreshPlayerState(client!)
        toast.success(
          nextSession.txHash
            ? `Weekly Blitz started! 5 minutes on the clock. ${nextSession.txStage ?? 'submitted'}.`
            : 'Weekly Blitz started! 5 minutes on the clock.',
        )
        return
      }

      const nextSession = await client!.startSession(address, mode, password)
      const initialBoard = initializeBoard(nextSession.seed)
      const initialMaxTile = Math.max(...initialBoard)
      
      // Debug logging for Daily Challenge with visual board
      if (mode === 'daily') {
        console.log('%c[Daily Challenge Debug]', 'color: #f0cf52; font-weight: bold; font-size: 14px;')
        console.log('%c  UTC Date: ' + nextSession.utcDate, 'color: #53d7a6; font-weight: bold;')
        console.log('%c  Seed: ' + nextSession.seed.substring(0, 16) + '...', 'color: #53a6ff;')
        console.log('%c  Visual Board:', 'color: white; font-weight: bold;')
        
        // Create visual board representation
        const visualBoard = []
        for (let row = 0; row < 4; row++) {
          const rowStr = []
          for (let col = 0; col < 4; col++) {
            const val = initialBoard[row * 4 + col]
            rowStr.push(val === 0 ? '·' : val)
          }
          visualBoard.push('    ' + rowStr.map(v => String(v).padStart(2, ' ')).join('  '))
        }
        console.log('%c' + visualBoard.join('\n'), 'color: #f6df84; font-family: monospace; font-size: 12px; line-height: 1.5;')
        
        // Show tile positions
        const tilePositions = initialBoard
          .map((val, idx) => val !== 0 ? `pos${idx}(${val})` : null)
          .filter(Boolean)
          .join(', ')
        console.log('%c  Tile Positions: ' + tilePositions, 'color: #9fd0ff;')
        console.log('%c  Raw Array: ' + JSON.stringify(initialBoard), 'color: #888;')
      }
      
      // Create new session record
      const sessionRecord = createGameSession(address, nextSession, initialBoard, initialMaxTile)
      saveGameSession(address, sessionRecord)
      
      setSession(nextSession)
      setBoard(initialBoard)
      setScore(0)
      setMaxTile(initialMaxTile)
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

  function handleResumeSession() {
    if (!pendingRecoverySession) {
      return
    }

    console.log('[Play2048] Resuming session from recovery')
    
    // Restore session state
    setSession(pendingRecoverySession.session)
    setBoard(pendingRecoverySession.board)
    setScore(pendingRecoverySession.score)
    setMaxTile(pendingRecoverySession.maxTile)
    setMoves(pendingRecoverySession.moves)
    setSelectedMode(pendingRecoverySession.session.mode)
    setLeaderboardMode(pendingRecoverySession.session.mode === 'training' ? 'daily' : pendingRecoverySession.session.mode)
    setIsSubmitted(pendingRecoverySession.state === 'completed' || pendingRecoverySession.state === 'submitted')
    
    if (pendingRecoverySession.stopReason) {
      setLastOutcome({
        stopReason: pendingRecoverySession.stopReason,
        score: pendingRecoverySession.score,
        maxTile: pendingRecoverySession.maxTile,
      })
    }

    // Close recovery prompt
    setShowRecoveryPrompt(false)
    setPendingRecoverySession(null)
    
    toast.success('Session resumed from last saved state')
  }

  function handleDiscardSession() {
    if (!pendingRecoverySession) {
      return
    }

    console.log('[Play2048] Discarding session from recovery')
    
    // Clear the session
    clearGameSession(address)
    
    // Close recovery prompt
    setShowRecoveryPrompt(false)
    setPendingRecoverySession(null)
    
    toast.success('Previous session discarded')
  }

  function playMove(direction: MoveDirection) {
    const activeSession = sessionRef.current
    if (!activeSession || isSubmittedRef.current) {
      return
    }

    // Check for Weekly Blitz timer expiration
    if (activeSession.mode === 'weekly-blitz' && activeSession.expiresAtUnix) {
      const now = Math.floor(Date.now() / 1000)
      if (now >= activeSession.expiresAtUnix) {
        toast.error('Time expired! Submitting your score...')
        finishRun('timer_expired', movesRef.current)
        return
      }
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

    // Save session after each move
    const existingRecord = loadGameSession(address)
    if (existingRecord && existingRecord.state === 'in-progress') {
      const updatedRecord = updateGameState(existingRecord, {
        board: nextBoard,
        score: nextScore,
        maxTile: nextMaxTile,
        moves: nextMoves,
      })
      saveGameSession(address, updatedRecord)
    }

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
        
        // Mark session as completed
        const existingRecord = loadGameSession(address)
        if (existingRecord && existingRecord.state === 'in-progress') {
          const completedRecord = markCompleted(existingRecord, expected.endedReason)
          saveGameSession(address, completedRecord)
        }
        
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
        
        // Clear session immediately for training mode
        clearGameSession(address)
        
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
      
      // Mark session as submitted
      const existingRecord = loadGameSession(address)
      if (existingRecord && result.txHash) {
        const submittedRecord = markSubmitted(
          existingRecord,
          result.txHash,
          result.txStage ?? 'submitted'
        )
        saveGameSession(address, submittedRecord)
        
        // Clear session only after indexed
        if (result.txStage === 'indexed') {
          clearGameSession(address)
          console.log('[Play2048] Session cleared after successful indexing')
        }
      }
      
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
    clearGameSession(address) // Clear new recovery system
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
      {/* Session Recovery Modal */}
      <AnimatePresence>
        {showRecoveryPrompt && pendingRecoverySession && (
          <SessionRecoveryPrompt
            session={pendingRecoverySession}
            onResume={handleResumeSession}
            onDiscard={pendingRecoverySession.session.mode !== 'daily' ? handleDiscardSession : undefined}
          />
        )}
      </AnimatePresence>

      {/* Weekly Blitz Timer Overlay */}
      {session && session.mode === 'weekly-blitz' && session.expiresAtUnix && !isSubmitted && (
        <WeeklyBlitzTimer
          expiresAtUnix={session.expiresAtUnix}
          onExpire={() => finishRun('timer_expired', moves)}
        />
      )}

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
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-card p-4 sm:p-5">
        <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              {/* Ultra-Compact Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-bold text-2xl leading-none text-white sm:text-3xl">
                    Choose Your Mode
                  </h1>
                </div>

                {/* Compact Inline Stats */}
                {clientStatus.mode === 'rpc' && wallets.length > 0 && player ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 font-semibold text-white">
                      {formatCNPY(toCNPY(player.balance))} PROOF
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 font-semibold text-white">
                      {player.classicPointsBalance} Points
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 font-semibold text-white">
                      {player.loginStreak}d Streak
                    </span>
                  </div>
                ) : clientStatus.mode === 'rpc' && wallets.length > 0 ? (
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-1.5">
                    <p className="text-sm font-semibold text-white">
                      {wallets.find(w => w.address === address)?.nickname || shortAddress(address)}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Compact Mode Cards - Single Row on Desktop */}
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-stretch lg:auto-rows-fr">
                {/* Daily Challenge Card - Featured */}
                <CompactModeCard
                  icon="🏆"
                  title="Daily Challenge"
                  specs={[
                    `${formatCNPY(toCNPY(config.dailyFee))} PROOF entry`,
                    `${config.dailyMaxMoves} move limit`,
                  ]}
                  infoBadges={[
                    `💰 Prize: ${formatCNPY(toCNPY(dailyPrizePool))} PROOF`,
                    `⏱ Resets ${getTimeUntilReset().hours}h ${getTimeUntilReset().minutes}m`,
                    '✓ One attempt per day',
                  ]}
                  ctaLabel={hasCompletedDailyToday ? "Completed" : "Play Daily"}
                  tone="daily"
                  featured={true}
                  selected={selectedMode === 'daily'}
                  disabled={!canStart || isLoadingClient || !canUseLiveWallet || hasCompletedDailyToday}
                  onSelect={() => setSelectedMode('daily')}
                  onStart={() => {
                    if (!hasCompletedDailyToday) start('daily')
                  }}
                />

                {/* Classic Mode Card */}
                <CompactModeCard
                  icon="⭐"
                  title="Classic Mode"
                  specs={[
                    `${formatCNPY(toCNPY(config.classicFee))} PROOF entry`,
                    'Unlimited moves',
                  ]}
                  infoBadges={[
                    '🏅 Earn Classic Points',
                    '📈 All-Time Leaderboard',
                  ]}
                  ctaLabel="Play Classic"
                  tone="classic"
                  selected={selectedMode === 'classic'}
                  disabled={!canStart || isLoadingClient || !canUseLiveWallet}
                  onSelect={() => setSelectedMode('classic')}
                  onStart={() => start('classic')}
                />

                {/* Training Mode Card */}
                <CompactModeCard
                  icon="🎮"
                  title="Training Mode"
                  specs={[
                    'Free practice',
                    'No leaderboard',
                  ]}
                  infoBadges={[
                    '🚫 No rewards',
                    '💻 Local only',
                  ]}
                  ctaLabel="Practice"
                  tone="training"
                  selected={selectedMode === 'training'}
                  disabled={!canStart || isLoadingClient}
                  onSelect={() => setSelectedMode('training')}
                  onStart={() => start('training')}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11161f]/90 p-4 sm:p-5">
                <div className="mx-auto w-full max-w-[800px]">
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

                  <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] xl:items-start xl:justify-center">
                    {/* Left Sidebar - Stats & Actions */}
                    <div className="space-y-2 xl:order-1">
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-lg border border-[#f6df84]/20 bg-[#f6df84]/10 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Score</p>
                          <p className="mt-1 text-3xl font-black text-white">{score}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Best Tile</p>
                          <p className="mt-1 text-3xl font-black text-white">{maxTile}</p>
                        </div>
                        
                        {/* Move Count - Classic & Training Only */}
                        {session?.mode !== 'daily' && (
                          <div className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Moves</p>
                            <p className="mt-1 text-3xl font-black text-white">{moves.length}</p>
                          </div>
                        )}
                        
                        {/* Prize Pool - Daily Only */}
                        {session?.mode === 'daily' && (
                          <div className="rounded-lg border border-[#53d7a6]/20 bg-[#53d7a6]/10 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Prize Pool</p>
                            <p className="mt-1 text-xl font-black text-[#53d7a6]">Active</p>
                            <p className="mt-1 text-xs text-slate-400">Top 10 rewards</p>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px] xl:grid-cols-1">
                        <motion.button
                          onClick={() => start(selectedMode)}
                          disabled={!canStart || isLoadingClient || !canUseLiveWallet || (selectedMode === 'daily' && (hasCompletedDailyToday || session?.mode === 'daily'))}
                          className={`rounded-xl px-3 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            selectedMode === 'daily' 
                              ? 'bg-[#c95f38] hover:bg-[#d36c49]' 
                              : selectedMode === 'classic' 
                                ? 'bg-[#53a6ff] hover:bg-[#64b0ff]' 
                                : 'bg-[#53d7a6] hover:bg-[#67ddb3]'
                          }`}
                        >
                          {selectedMode === 'daily' && hasCompletedDailyToday ? 'Daily Completed' : selectedMode === 'daily' && session?.mode === 'daily' ? 'Daily Active' : selectedMode === 'daily' ? 'Start Daily' : selectedMode === 'classic' ? 'Start Classic' : 'Start Training'}
                        </motion.button>
                        <motion.button
                          onClick={() => finishRun('player_stopped')}
                          disabled={!session || isSubmitted || (session.mode !== 'training' && !canUseLiveWallet)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {session?.mode === 'training' ? 'Stop' : 'Submit'}
                        </motion.button>
                      </div>

                      {/* Daily Challenge Completed Notice */}
                      {selectedMode === 'daily' && hasCompletedDailyToday && !session && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border border-[#53d7a6]/30 bg-[#53d7a6]/10 px-3 py-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-base">✓</span>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-[#53d7a6]">Today's Challenge Complete</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                                New challenge in {(() => {
                                  const { hours, minutes } = getTimeUntilReset()
                                  return `${hours}h ${minutes}m`
                                })()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-sm text-slate-300">Arrow keys or WASD</p>
                      </div>
                    </div>

                    {/* Right Side - Move Banner + Game Board */}
                    <div className="space-y-4 xl:order-2">
                      {/* Move Counter Banner (Daily Challenge Only) */}
                      {session?.mode === 'daily' && session.maxMoves > 0 && (
                        <MoveCounterBanner 
                          currentMoves={moves.length} 
                          maxMoves={session.maxMoves} 
                        />
                      )}
                      
                      {/* Game Board - Much Larger */}
                      <div className="mx-auto w-full max-w-[980px] rounded-2xl border border-white/10 bg-[#171d28] p-5 sm:p-7 lg:p-8">
                        <div className="grid grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
                          {board.map((value, index) => {
                            // Calculate font size based on number of digits
                            const digits = value ? value.toString().length : 0
                            let fontSizeClass = 'text-[2rem] sm:text-[3rem] lg:text-[3.5rem]' // 1-3 digits
                            if (digits >= 4) {
                              fontSizeClass = 'text-[1.5rem] sm:text-[2.25rem] lg:text-[2.75rem]' // 4+ digits (1024, 2048, etc)
                            }
                            if (digits >= 5) {
                              fontSizeClass = 'text-[1.25rem] sm:text-[1.875rem] lg:text-[2.25rem]' // 5+ digits (16384, 32768, etc)
                            }
                            
                            return (
                              <motion.div
                                key={`${index}-${value}`}
                                layout
                                initial={{ scale: 0.92, opacity: 0.78 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                className={`flex aspect-square items-center justify-center rounded-xl border border-black/10 font-black ${fontSizeClass} ${tileStyles[value] ?? 'bg-[#111827] text-white'}`}
                              >
                                {value || ''}
                              </motion.div>
                            )
                          })}
                        </div>
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

function LauncherModeCard(args: {
  title: string
  description: string
  entryFee: number | string
  moveLimit?: number
  features: string[]
  ctaLabel: string
  tone: 'daily' | 'classic' | 'training'
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onStart: () => void
}) {
  const toneConfig = {
    daily: {
      accent: 'border-[#c95f38]/40 bg-[#c95f38]/15',
      button: 'bg-[#c95f38] hover:bg-[#d36c49] text-white',
      icon: '🏆',
    },
    classic: {
      accent: 'border-[#53a6ff]/40 bg-[#53a6ff]/15',
      button: 'bg-[#53a6ff] hover:bg-[#64b0ff] text-white',
      icon: '⭐',
    },
    training: {
      accent: 'border-[#53d7a6]/40 bg-[#53d7a6]/15',
      button: 'bg-[#53d7a6] hover:bg-[#67ddb3] text-[#0f1a14]',
      icon: '🎮',
    },
  }

  const config = toneConfig[args.tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className={`rounded-2xl border p-5 transition ${
        args.selected 
          ? config.accent 
          : 'border-white/10 bg-slate-950/50 hover:border-white/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-xl font-bold text-white">{args.title}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">{args.description}</p>
        </div>
        
        {/* Entry Fee Badge */}
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
          <p className="text-xs font-bold text-white">
            {typeof args.entryFee === 'number' ? `${args.entryFee} PROOF` : args.entryFee}
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-4 space-y-2">
        {args.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-slate-500">•</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={args.selected ? args.onStart : args.onSelect}
        disabled={args.disabled}
        whileHover={!args.disabled ? { scale: 1.02 } : {}}
        whileTap={!args.disabled ? { scale: 0.98 } : {}}
        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${config.button}`}
      >
        {args.selected ? args.ctaLabel : `Select ${args.title}`}
      </motion.button>
    </motion.div>
  )
}

function CompactModeCard(args: {
  icon: string
  title: string
  specs: string[]
  infoBadges?: string[]
  ctaLabel: string
  tone: 'daily' | 'classic' | 'training'
  featured?: boolean
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onStart: () => void
}) {
  const toneConfig = {
    daily: {
      accent: 'border-[#c95f38]/50 bg-[#c95f38]/20',
      button: 'bg-[#c95f38] hover:bg-[#d36c49] text-white',
      badge: 'bg-[#c95f38]/20 border-[#c95f38]/30 text-[#ffcfbf]',
    },
    classic: {
      accent: 'border-[#53a6ff]/50 bg-[#53a6ff]/20',
      button: 'bg-[#53a6ff] hover:bg-[#64b0ff] text-white',
      badge: 'bg-[#53a6ff]/20 border-[#53a6ff]/30 text-[#d7e9ff]',
    },
    training: {
      accent: 'border-[#53d7a6]/50 bg-[#53d7a6]/20',
      button: 'bg-[#53d7a6] hover:bg-[#67ddb3] text-[#0f1a14]',
      badge: 'bg-[#53d7a6]/20 border-[#53d7a6]/30 text-[#bdf5e3]',
    },
  }

  const config = toneConfig[args.tone]

  return (
    <motion.div
      onClick={args.onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col h-full cursor-pointer rounded-xl border p-4 text-left transition ${
        args.selected 
          ? config.accent 
          : 'border-white/10 bg-slate-950/50 hover:border-white/20'
      } ${args.featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Card Content - Grows to fill space */}
      <div className="flex-1">
        {/* Icon + Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{args.icon}</span>
          <h3 className="text-lg font-bold text-white">{args.title}</h3>
          {args.featured && (
            <span className="ml-auto rounded-full border border-[#f0cf52]/40 bg-[#f0cf52]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f6df84]">
              Featured
            </span>
          )}
        </div>

        {/* Compact Specs */}
        <div className="mt-3 space-y-1">
          {args.specs.map((spec, idx) => (
            <p key={idx} className="text-sm font-semibold text-white">
              {spec}
            </p>
          ))}
        </div>

        {/* Info Badges */}
        {args.infoBadges && args.infoBadges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {args.infoBadges.map((badge, idx) => (
              <span
                key={idx}
                className={`rounded-md border px-2 py-1 text-xs font-medium ${config.badge}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA Button - Pinned to bottom */}
      <button
        onClick={(e) => {
          e.stopPropagation() // Prevent card click from firing
          args.onStart()
        }}
        disabled={args.disabled}
        className={`mt-4 w-full rounded-lg px-3 py-2.5 text-center text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${config.button}`}
      >
        {args.ctaLabel}
      </button>
    </motion.div>
  )
}

function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date()
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { hours, minutes }
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

function MoveCounterBanner({ currentMoves, maxMoves }: { currentMoves: number; maxMoves: number }) {
  const remaining = maxMoves - currentMoves
  
  // Determine styling based on remaining moves
  const isDanger = remaining <= 10
  const isWarning = remaining > 10 && remaining <= 20
  const isNormal = remaining > 20
  
  const containerClass = isDanger
    ? 'border-[#c95f38]/50 bg-[#c95f38]/20'
    : isWarning
      ? 'border-[#f0cf52]/50 bg-[#f0cf52]/15'
      : 'border-[#53a6ff]/30 bg-[#53a6ff]/10'
  
  const textClass = isDanger
    ? 'text-[#ffd3c5]'
    : isWarning
      ? 'text-[#fff0b3]'
      : 'text-[#d7e9ff]'
  
  const accentClass = isDanger
    ? 'text-[#ff9375]'
    : isWarning
      ? 'text-[#f6df84]'
      : 'text-[#9fd0ff]'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-6 py-5 ${containerClass}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className={`text-[10px] uppercase tracking-[0.24em] ${textClass} opacity-70`}>
            Moves
          </span>
          <span className={`font-black text-5xl leading-none ${accentClass}`}>
            {currentMoves}
          </span>
          <span className={`font-bold text-3xl ${textClass} opacity-60`}>
            / {maxMoves}
          </span>
        </div>
        <div className="text-right">
          <p className={`text-[11px] uppercase tracking-[0.2em] ${textClass} opacity-70`}>
            Remaining
          </p>
          <p className={`mt-1 font-black text-4xl leading-none ${accentClass}`}>
            {remaining}
          </p>
          {isDanger && (
            <p className="mt-1 text-xs font-semibold text-[#ffd3c5]">
              ⚠️ Final moves!
            </p>
          )}
          {isWarning && (
            <p className="mt-1 text-xs font-semibold text-[#fff0b3]">
              Running low
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
function normalizeActionError(message: string): string {
  const text = message.trim()
  const lower = text.toLowerCase()

  if (lower.includes('player already used their daily attempt') || 
      lower.includes('already played for this address today') ||
      lower.includes('daily challenge already played')) {
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
  if (lower.includes('invalid params') && lower.includes('{}')) {
    return 'This action is not allowed. You may have already completed today\'s Daily Challenge or another validation check failed.'
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



