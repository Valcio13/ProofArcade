import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Gamepad2, ArrowLeft } from 'lucide-react'
import { createGame2048Client } from '../lib/chain2048'
import { shortAddress } from '../lib/address'
import type { RecentRun } from '../lib/mockChain2048'

function GameHistoryPage() {
  const { address } = useParams<{ address: string }>()
  const [gameHistory, setGameHistory] = useState<RecentRun[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      return
    }

    let cancelled = false

    async function loadHistory() {
      try {
        const client = await createGame2048Client()
        const history = await client.getRecentRuns(address)
        
        if (cancelled) {
          return
        }

        setGameHistory(history)
      } catch (error) {
        console.error('Failed to load game history:', error)
        toast.error('Unable to load game history.')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [address])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(83,166,255,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(240,207,82,0.12),_transparent_22%),linear-gradient(160deg,_rgba(15,18,27,1),_rgba(9,12,18,1))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7e69ff]/20">
            <Gamepad2 className="h-6 w-6 text-[#7e69ff]" />
          </div>
          <div>
            <h1 className="font-['Georgia'] text-3xl leading-tight text-white">Game History</h1>
            <p className="mt-1 text-sm text-slate-400">
              Player: <span className="font-mono">{address ? shortAddress(address) : '—'}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <span className="text-slate-400">Total Games:</span>{' '}
            <span className="font-bold text-white">{gameHistory.length}</span>
          </div>
          {gameHistory.length > 0 && (
            <>
              <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-slate-400">Best Score:</span>{' '}
                <span className="font-bold text-white">
                  {Math.max(...gameHistory.map(g => g.score)).toLocaleString()}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-slate-400">Best Tile:</span>{' '}
                <span className="font-bold text-white">
                  {Math.max(...gameHistory.map(g => g.maxTile))}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Game List */}
      <section className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
        {isLoading ? (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto h-8 w-8 rounded-full border-2 border-slate-700 border-t-slate-400"
            />
            <p className="mt-4 text-sm text-slate-400">Loading game history...</p>
          </div>
        ) : gameHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
              <Gamepad2 className="h-8 w-8 text-slate-600" />
            </div>
            <p className="mt-4 text-base font-semibold text-white">No games played yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Start playing to see your game history here
            </p>
            <Link
              to="/play"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#53a6ff] to-[#7e69ff] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(83,166,255,0.3)] transition hover:shadow-[0_6px_16px_rgba(83,166,255,0.4)]"
            >
              Play Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {gameHistory.map((game) => (
              <div
                key={`${game.gameId}-${game.endedAt}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      game.mode === 'daily' 
                        ? 'bg-[#f6df84]/20 text-[#f6df84]' 
                        : 'bg-[#7e69ff]/20 text-[#9fd0ff]'
                    }`}>
                      {game.mode === 'daily' ? 'Daily' : 'Classic'}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      Score: {game.score.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>Tile: {game.maxTile}</span>
                    <span>•</span>
                    <span>{game.moveCount} moves</span>
                    <span>•</span>
                    <span>{formatStopReason(game.stopReason)}</span>
                    <span>•</span>
                    <span>{formatGameTime(game.endedAt)}</span>
                    {game.utcDate && (
                      <>
                        <span>•</span>
                        <span>{game.utcDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

function formatStopReason(reason: string): string {
  switch (reason) {
    case 'player_stopped':
      return 'Manually stopped'
    case 'no_moves':
      return 'No moves available'
    case 'max_moves':
      return 'Move limit reached'
    default:
      return reason
  }
}

function formatGameTime(endedAt: string): string {
  try {
    const date = new Date(endedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  } catch {
    return endedAt
  }
}

export default GameHistoryPage
