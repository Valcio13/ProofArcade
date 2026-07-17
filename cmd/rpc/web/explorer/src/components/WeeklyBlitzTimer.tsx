import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

interface WeeklyBlitzTimerProps {
  expiresAtUnix: number
  onExpire: () => void
}

export function WeeklyBlitzTimer({ expiresAtUnix, onExpire }: WeeklyBlitzTimerProps) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeLeft = Math.max(0, expiresAtUnix - now)
      setRemaining(timeLeft)

      if (timeLeft === 0) {
        onExpire()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 100) // Update every 100ms for smooth countdown

    return () => clearInterval(interval)
  }, [expiresAtUnix, onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isLowTime = remaining <= 30
  const isCritical = remaining <= 10

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-6 py-3 shadow-lg backdrop-blur-sm ${
        isCritical
          ? 'border-red-500/50 bg-red-500/20 text-red-400'
          : isLowTime
          ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-400'
          : 'border-[#53a6ff]/30 bg-[#53a6ff]/10 text-[#9fd0ff]'
      }`}
    >
      <div className="flex items-center gap-3">
        {isCritical ? (
          <Zap className="h-5 w-5 animate-pulse" />
        ) : (
          <Clock className="h-5 w-5" />
        )}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider">remaining</span>
        </div>
      </div>
    </motion.div>
  )
}
