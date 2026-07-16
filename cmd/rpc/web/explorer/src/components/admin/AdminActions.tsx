import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  isDestructive?: boolean
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 mb-6">{message}</p>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isDestructive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

interface AdminActionButtonProps {
  label: string
  description?: string
  onClick: () => Promise<void> | void
  icon?: React.ReactNode
  variant?: 'primary' | 'danger' | 'warning'
  confirmTitle?: string
  confirmMessage?: string
  requiresConfirmation?: boolean
  disabled?: boolean
}

export function AdminActionButton({
  label,
  description,
  onClick,
  icon,
  variant = 'primary',
  confirmTitle,
  confirmMessage,
  requiresConfirmation = false,
  disabled = false,
}: AdminActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = async () => {
    if (requiresConfirmation) {
      setShowConfirm(true)
      return
    }

    await executeAction()
  }

  const executeAction = async () => {
    setIsLoading(true)
    try {
      await onClick()
      toast.success(`${label} completed successfully`)
    } catch (error) {
      toast.error(`Failed to ${label.toLowerCase()}: ${error}`)
      console.error('Admin action error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const variantStyles = {
    primary: 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20',
    danger: 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20',
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`relative rounded-lg border p-4 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          variantStyles[variant]
        }`}
      >
        <div className="flex items-start space-x-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{label}</p>
            {description && <p className="text-xs opacity-70 mt-1">{description}</p>}
          </div>
          {isLoading && (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </div>
      </button>

      {requiresConfirmation && (
        <ConfirmationModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={executeAction}
          title={confirmTitle || `Confirm ${label}`}
          message={confirmMessage || `Are you sure you want to ${label.toLowerCase()}?`}
          confirmText={label}
          isDestructive={variant === 'danger'}
        />
      )}
    </>
  )
}

interface AdminActionsGridProps {
  children: React.ReactNode
  title?: string
}

export function AdminActionsGrid({ children, title }: AdminActionsGridProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  )
}
