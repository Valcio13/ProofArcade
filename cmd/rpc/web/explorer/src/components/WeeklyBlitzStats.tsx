import { Target, Trophy, Zap } from 'lucide-react'
import type { WeeklyBlitzPlayerStatusResponse } from '../lib/api'

interface WeeklyBlitzStatsProps {
  status: WeeklyBlitzPlayerStatusResponse
}

export function WeeklyBlitzStats({ status }: WeeklyBlitzStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {/* Cumulative Score */}
      <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cumulative Score</p>
            <p className="mt-2 text-2xl font-black text-[#f6df84]">{status.cumulativeScore}</p>
          </div>
          <div className="rounded-xl bg-[#f0cf52]/10 p-2.5 text-[#f6df84]">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Best Single Score */}
      <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Best Score</p>
            <p className="mt-2 text-2xl font-black text-[#9fd0ff]">{status.bestSingleScore}</p>
          </div>
          <div className="rounded-xl bg-[#53a6ff]/10 p-2.5 text-[#9fd0ff]">
            <Target className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Run Count */}
      <div className="rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Runs Submitted</p>
            <p className="mt-2 text-2xl font-black text-white">{status.runCount}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 text-slate-300">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
