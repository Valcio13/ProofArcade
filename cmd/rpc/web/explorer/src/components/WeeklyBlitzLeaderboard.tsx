import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { shortAddress } from '../lib/address'
import type { WeeklyBlitzLeaderboardEntry } from '../lib/api'

interface WeeklyBlitzLeaderboardProps {
  leaderboard: WeeklyBlitzLeaderboardEntry[]
  currentPlayerAddress?: string
}

function rankColor(rank: number): string {
  if (rank === 1) return '#f0cf52'
  if (rank === 2) return '#c0c0c0'
  if (rank === 3) return '#cd7f32'
  return '#94a3b8'
}

export function WeeklyBlitzLeaderboard({ leaderboard, currentPlayerAddress }: WeeklyBlitzLeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-12 text-center">
        <Trophy className="mx-auto h-12 w-12 text-slate-600" />
        <p className="mt-4 text-slate-400">No players yet. Be the first to compete!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => {
        const isCurrentPlayer = currentPlayerAddress?.toLowerCase() === entry.address.toLowerCase()

        return (
          <div
            key={`${entry.address}-${entry.rank}`}
            className={`rounded-2xl border bg-card p-4 transition-colors ${
              entry.rank === 1
                ? 'border-[#f0cf52]/30 hover:border-[#f0cf52]/50'
                : isCurrentPlayer
                ? 'border-[#53a6ff]/30 bg-[#53a6ff]/5 hover:border-[#53a6ff]/50'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Rank and Player */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-black"
                  style={{
                    backgroundColor: `${rankColor(entry.rank)}20`,
                    color: rankColor(entry.rank),
                  }}
                >
                  {entry.rank}
                </div>

                <div>
                  <Link
                    to={`/player/${entry.address}`}
                    className="inline-block text-base font-semibold text-white transition hover:text-[#53a6ff] hover:underline"
                  >
                    {entry.username || shortAddress(entry.address)}
                  </Link>
                  {isCurrentPlayer && (
                    <span className="ml-2 rounded-full bg-[#53a6ff]/20 px-2 py-0.5 text-xs font-semibold text-[#9fd0ff]">
                      You
                    </span>
                  )}
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                    <span>{entry.runCount} run{entry.runCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Best: {entry.bestSingleScore}</span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-2xl font-black text-[#f6df84]">{entry.cumulativeScore}</p>
                <p className="mt-0.5 text-xs text-slate-500">cumulative</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
