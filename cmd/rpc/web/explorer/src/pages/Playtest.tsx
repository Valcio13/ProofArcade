import { startTransition, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import {
  canMove,
  createSeedFromText,
  initializeBoard,
  randomSeed,
  replaySession,
  type MoveDirection,
  type StopReason,
} from '../lib/game2048'

const MotionLink = motion(Link)

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

interface PlaytestSession {
  gameId: string
  seed: string
}

const PLAYTEST_STATE_KEY = 'proofarcade-2048-playtest-v1'

interface StoredPlaytestState {
  session: PlaytestSession
  board: number[]
  score: number
  maxTile: number
  moves: MoveDirection[]
  isFinished: boolean
  lastOutcome: { stopReason: StopReason; score: number; maxTile: number } | null
}

function createPlaytestSession(): PlaytestSession {
  return {
    gameId: createSeedFromText(`playtest:${Date.now()}:${Math.random()}`),
    seed: randomSeed(),
  }
}

function createFreshPlaytestState(): StoredPlaytestState {
  const session = createPlaytestSession()
  const board = initializeBoard(session.seed)
  return {
    session,
    board,
    score: 0,
    maxTile: Math.max(...board),
    moves: [],
    isFinished: false,
    lastOutcome: null,
  }
}

function loadPlaytestState(): StoredPlaytestState {
  const raw = localStorage.getItem(PLAYTEST_STATE_KEY)
  if (!raw) {
    return createFreshPlaytestState()
  }

  try {
    const parsed = JSON.parse(raw) as StoredPlaytestState
    if (!parsed?.session?.seed || !Array.isArray(parsed?.board) || !Array.isArray(parsed?.moves)) {
      return createFreshPlaytestState()
    }
    return parsed
  } catch {
    return createFreshPlaytestState()
  }
}

function persistPlaytestState(state: StoredPlaytestState) {
  localStorage.setItem(PLAYTEST_STATE_KEY, JSON.stringify(state))
}

function PlaytestPage() {
  useEffect(() => {
    document.title = 'Playtest | ProofArcade'
  }, [])

  // Always start with a fresh playtest state - clear any previous session
  useEffect(() => {
    // Clear any stored playtest state when entering the page
    localStorage.removeItem(PLAYTEST_STATE_KEY)
  }, [])

  const initialState = createFreshPlaytestState()
  const [session, setSession] = useState<PlaytestSession>(initialState.session)
  const [board, setBoard] = useState<number[]>(initialState.board)
  const [score, setScore] = useState(initialState.score)
  const [maxTile, setMaxTile] = useState(initialState.maxTile)
  const [moves, setMoves] = useState<MoveDirection[]>(initialState.moves)
  const [isFinished, setIsFinished] = useState(initialState.isFinished)
  const [lastOutcome, setLastOutcome] = useState<{ stopReason: StopReason; score: number; maxTile: number } | null>(initialState.lastOutcome)

  const sessionRef = useRef(session)
  const movesRef = useRef(moves)
  const boardRef = useRef(board)
  const scoreRef = useRef(score)
  const maxTileRef = useRef(maxTile)
  const isFinishedRef = useRef(isFinished)

  useEffect(() => {
    sessionRef.current = session
    movesRef.current = moves
    boardRef.current = board
    scoreRef.current = score
    maxTileRef.current = maxTile
    isFinishedRef.current = isFinished
  }, [session, moves, board, score, maxTile, isFinished])

  // Note: Persistence is disabled for Playtest to ensure fresh sessions
  // Uncomment below to re-enable auto-save for debugging purposes
  /*
  useEffect(() => {
    persistPlaytestState({
      session,
      board,
      score,
      maxTile,
      moves,
      isFinished,
      lastOutcome,
    })
  }, [session, board, score, maxTile, moves, isFinished, lastOutcome])
  */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFinishedRef.current) {
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
  }, [])

  function startFreshRun() {
    const nextState = createFreshPlaytestState()
    startTransition(() => {
      setSession(nextState.session)
      setBoard(nextState.board)
      setScore(nextState.score)
      setMaxTile(nextState.maxTile)
      setMoves(nextState.moves)
      setIsFinished(false)
      setLastOutcome(null)
    })
  }

  function finishRun(stopIntent: StopReason, finalMoves = movesRef.current) {
    const expected = replaySession(sessionRef.current.seed, finalMoves, 0, stopIntent)
    setBoard(expected.board)
    setScore(expected.score)
    setMaxTile(expected.maxTile)
    setMoves(finalMoves)
    setIsFinished(true)
    setLastOutcome({
      stopReason: expected.endedReason,
      score: expected.score,
      maxTile: expected.maxTile,
    })
  }

  function playMove(direction: MoveDirection) {
    if (isFinishedRef.current) {
      return
    }

    const currentReplay = replaySession(sessionRef.current.seed, movesRef.current, 0, 'player_stopped')
    const nextMoves = [...movesRef.current, direction]
    const nextReplay = replaySession(sessionRef.current.seed, nextMoves, 0, 'player_stopped')

    if (
      boardsEqual(currentReplay.board, nextReplay.board) &&
      currentReplay.score === nextReplay.score &&
      currentReplay.maxTile === nextReplay.maxTile
    ) {
      return
    }

    setBoard(nextReplay.board)
    setMoves(nextMoves)
    setScore(nextReplay.score)
    setMaxTile(nextReplay.maxTile)

    boardRef.current = nextReplay.board
    movesRef.current = nextMoves
    scoreRef.current = nextReplay.score
    maxTileRef.current = nextReplay.maxTile

    const stuck = nextReplay.endedReason === 'no_moves' || !canMove(nextReplay.board)
    if (stuck) {
      finishRun('no_moves', nextMoves)
    }
  }

  const statusText = !isFinished
    ? `Local playtest run. ${moves.length} moves recorded.`
    : `Finished ${lastOutcome?.score ?? score} score with ${lastOutcome?.maxTile ?? maxTile} tile.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto min-h-screen max-w-[1180px] px-4 py-6 sm:px-6 xl:px-8"
    >
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(83,215,166,0.12),_transparent_22%),linear-gradient(160deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Back To Home
              </Link>
              <div className="rounded-full border border-[#53d7a6]/20 bg-[#53d7a6]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#bdf7e2]">
                No wallet needed
              </div>
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.28em] text-[#53d7a6]">Playtest</p>
            <h1 className="mt-3 font-['Georgia'] text-4xl leading-none text-white sm:text-5xl">
              Try the board first.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Pure local 2048. No wallet, no fee, no points, and no leaderboards.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MiniStat label="Score" value={`${score}`} />
              <MiniStat label="Best Tile" value={`${maxTile}`} />
              <MiniStat label="Moves" value={`${moves.length}`} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="mt-4 rounded-[1.2rem] border border-[#53a6ff]/20 bg-[#53a6ff]/10 px-4 py-3 text-sm leading-6 text-[#d7e9ff]"
              >
                {statusText}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                onClick={startFreshRun}
                className="rounded-2xl bg-[#53d7a6] px-5 py-3 text-sm font-bold text-[#103229] transition hover:bg-[#67ddb3]"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                New Playtest Run
              </motion.button>
              <motion.button
                onClick={() => finishRun('player_stopped')}
                disabled={isFinished}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={isFinished ? undefined : { y: -2 }}
                whileTap={isFinished ? undefined : { scale: 0.98 }}
              >
                Stop Run
              </motion.button>
              <MotionLink
                to="/auth"
                className="rounded-2xl border border-[#f0cf52]/30 bg-[#f0cf52]/10 px-5 py-3 text-sm font-semibold text-[#f6df84] transition hover:bg-[#f0cf52]/20 hover:text-white"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Ready for real runs? Log In
              </MotionLink>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Use arrow keys or WASD. When you are ready, log in to play daily or classic runs.
            </p>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Board</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Local 2048 practice</h2>
            </div>

            <div className="mt-4 mx-auto max-w-[460px] rounded-[1.6rem] border border-white/10 bg-[#171d28] p-4 sm:max-w-[500px] sm:p-5">
              <div className="grid grid-cols-4 gap-3">
                {board.map((value, index) => (
                  <motion.div
                    key={`${index}-${value}`}
                    initial={{ opacity: 0.78, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                    className={`flex aspect-square items-center justify-center rounded-[1rem] border border-black/10 text-lg font-black transition sm:text-[1.5rem] ${tileStyles[value] ?? tileStyles[2048]}`}
                  >
                    {value || ''}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-[460px] rounded-[1.3rem] border border-white/10 bg-slate-950/60 p-4 sm:max-w-[500px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Controls</p>
              <div className="mt-4 grid gap-3">
                <div className="grid place-items-center">
                  <ControlButton label="Up" onClick={() => playMove('up')} disabled={isFinished} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ControlButton label="Left" onClick={() => playMove('left')} disabled={isFinished} />
                  <ControlButton label="Down" onClick={() => playMove('down')} disabled={isFinished} />
                  <ControlButton label="Right" onClick={() => playMove('right')} disabled={isFinished} />
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
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </motion.div>
  )
}

function ControlButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="rounded-[1.05rem] border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {label}
    </motion.button>
  )
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

export default PlaytestPage
