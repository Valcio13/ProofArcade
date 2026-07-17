import { Target, RotateCcw } from 'lucide-react'

interface DailyLimitsDisplayProps {
  officialRunsRemaining: number
  retriesRemaining: number
  className?: string
}

export function DailyLimitsDisplay({
  officialRunsRemaining,
  retriesRemaining,
  className = '',
}: DailyLimitsDisplayProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Official Runs */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-[#f0cf52]/10 p-1.5">
          <Target className="h-4 w-4 text-[#f6df84]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Official Runs</p>
          <p className="text-lg font-black text-[#f6df84]">{officialRunsRemaining}</p>
        </div>
      </div>

      {/* Retries */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-[#53a6ff]/10 p-1.5">
          <RotateCcw className="h-4 w-4 text-[#9fd0ff]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Retries</p>
          <p className="text-lg font-black text-[#9fd0ff]">{retriesRemaining}</p>
        </div>
      </div>
    </div>
  )
}
