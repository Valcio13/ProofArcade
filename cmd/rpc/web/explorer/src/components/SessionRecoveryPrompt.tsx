/**
 * Session Recovery Prompt Component
 * 
 * Shows mode-specific recovery UI as a modal overlay when an active session is detected:
 * - Daily Challenge: Resume-only (one attempt per day)
 * - Classic Mode: Resume or Discard options
 * - Training Mode: Resume or Discard options
 */

import { motion } from 'framer-motion'
import type { GameSessionRecord } from '../lib/gameSessionRecovery'

export interface SessionRecoveryPromptProps {
  session: GameSessionRecord
  onResume: () => void
  onDiscard?: () => void // Optional for Daily Challenge
}

export function SessionRecoveryPrompt({
  session,
  onResume,
  onDiscard,
}: SessionRecoveryPromptProps) {
  const isDailyChallenge = session.session.mode === 'daily'
  const isClassic = session.session.mode === 'classic'
  const isTraining = session.session.mode === 'training'

  // Format timestamp
  const startedAt = new Date(session.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Calculate moves left for Daily Challenge
  const movesLeft = isDailyChallenge
    ? Math.max(0, session.session.maxMoves - session.moves.length)
    : null

  // Tone-specific styling
  const getToneStyles = () => {
    if (isDailyChallenge) {
      return {
        border: 'border-[#f0cf52]/40',
        bg: 'bg-[#f0cf52]/10',
        icon: '🏆',
        iconBg: 'bg-[#f0cf52]/20',
        title: 'Unfinished Daily Challenge',
        titleColor: 'text-[#f0cf52]',
        buttonBg: 'bg-[#f0cf52]',
        buttonHover: 'hover:bg-[#ffd95c]',
        buttonText: 'text-[#43340a]',
      }
    }
    if (isClassic) {
      return {
        border: 'border-[#53a6ff]/40',
        bg: 'bg-[#53a6ff]/10',
        icon: '⭐',
        iconBg: 'bg-[#53a6ff]/20',
        title: 'Unfinished Classic Run',
        titleColor: 'text-[#53a6ff]',
        buttonBg: 'bg-[#53a6ff]',
        buttonHover: 'hover:bg-[#6db5ff]',
        buttonText: 'text-white',
      }
    }
    // Training
    return {
      border: 'border-white/30',
      bg: 'bg-white/5',
      icon: '🎮',
      iconBg: 'bg-white/10',
      title: 'Unfinished Training Session',
      titleColor: 'text-white',
      buttonBg: 'bg-white',
      buttonHover: 'hover:bg-white/90',
      buttonText: 'text-slate-900',
    }
  }

  const styles = getToneStyles()

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onDiscard} // Click outside to dismiss (only if discard is available)
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-lg overflow-hidden rounded-3xl border ${styles.border} ${styles.bg} backdrop-blur-xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
        >
          <div className="p-6 sm:p-8">
            {/* Header with Icon */}
            <div className="mb-6 flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} text-3xl`}>
                {styles.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-2xl leading-tight ${styles.titleColor}`}>
                  {styles.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Started {startedAt}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Score
                </div>
                <div className="mt-2 font-bold text-2xl text-white">
                  {session.score.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {isDailyChallenge ? 'Moves Left' : 'Moves'}
                </div>
                <div className="mt-2 font-bold text-2xl text-white">
                  {isDailyChallenge ? movesLeft : session.moves.length}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Max Tile
                </div>
                <div className="mt-2 font-bold text-2xl text-white">
                  {session.maxTile}
                </div>
              </div>
            </div>

            {/* Mode-Specific Message */}
            <div className="mb-6 rounded-xl border border-white/10 bg-black/30 px-4 py-4">
              {isDailyChallenge && (
                <p className="text-sm leading-relaxed text-slate-300">
                  You have an active Daily Challenge from today. Daily attempts are limited to{' '}
                  <span className="font-semibold text-white">one per day</span>.
                </p>
              )}
              {isClassic && (
                <p className="text-sm leading-relaxed text-slate-300">
                  You have an active Classic run in progress. Resume to continue or start a new run.
                </p>
              )}
              {isTraining && (
                <p className="text-sm leading-relaxed text-slate-300">
                  You have an unfinished training session. Resume to continue or start fresh.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Resume Button (Primary) */}
              <button
                onClick={onResume}
                className={`flex-1 rounded-xl ${styles.buttonBg} ${styles.buttonHover} px-6 py-4 font-bold text-base uppercase tracking-wider ${styles.buttonText} transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
              >
                {isDailyChallenge ? '🏆 Resume Challenge' : '▶ Resume'}
              </button>

              {/* Discard Button (Secondary) - Not shown for Daily Challenge */}
              {!isDailyChallenge && onDiscard && (
                <button
                  onClick={onDiscard}
                  className="rounded-xl border-2 border-white/20 bg-white/5 px-6 py-4 font-semibold text-base uppercase tracking-wider text-slate-300 transition-all duration-150 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                >
                  {isClassic ? '🆕 Start New' : '✕ Discard'}
                </button>
              )}
            </div>

            {/* Daily Challenge extra emphasis */}
            {isDailyChallenge && (
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  ⚠️ You cannot start a new Daily Challenge until tomorrow
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
