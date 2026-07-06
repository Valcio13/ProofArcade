export interface StoredWalletAuth {
  address: string
  nickname: string
  password: string
  loggedInAt: string
  expiresAt: string
  lastActivityAt: string
}

const WALLET_AUTH_STORAGE_KEY = 'canopy-2048-wallet-auth-v1'
const LAST_WALLET_KEY = 'canopy-2048-last-wallet'

// Session timeout configuration
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours

// Heartbeat configuration - update activity every 5 minutes to prevent premature timeout
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
let heartbeatTimer: ReturnType<typeof setInterval> | null = null

/**
 * Update the lastActivityAt timestamp without full reload
 */
function updateActivityTimestamp(): void {
  const raw = sessionStorage.getItem(WALLET_AUTH_STORAGE_KEY)
  if (!raw) return
  
  try {
    const parsed = JSON.parse(raw) as StoredWalletAuth
    if (isSessionExpired(parsed)) {
      sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
      stopHeartbeat()
      return
    }
    
    const updated: StoredWalletAuth = {
      ...parsed,
      lastActivityAt: new Date().toISOString()
    }
    sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('[updateActivityTimestamp] Error:', error)
  }
}

/**
 * Start the activity heartbeat to keep session alive during active use
 */
function startHeartbeat(): void {
  // Clear any existing heartbeat
  stopHeartbeat()
  
  // Set up periodic activity updates
  heartbeatTimer = setInterval(() => {
    updateActivityTimestamp()
  }, HEARTBEAT_INTERVAL_MS)
  
  // Also update on user interactions
  const interactionEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
  interactionEvents.forEach(event => {
    document.addEventListener(event, updateActivityTimestamp, { passive: true, once: true })
  })
}

/**
 * Stop the activity heartbeat
 */
function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

/**
 * Check if a session has expired based on max age or inactivity
 */
function isSessionExpired(auth: StoredWalletAuth): boolean {
  const now = Date.now()
  
  // Check absolute expiration
  if (auth.expiresAt && now > new Date(auth.expiresAt).getTime()) {
    return true
  }
  
  // Check inactivity timeout
  if (auth.lastActivityAt && now - new Date(auth.lastActivityAt).getTime() > INACTIVITY_TIMEOUT_MS) {
    return true
  }
  
  return false
}

export function loadStoredWalletAuth(): StoredWalletAuth | null {
  // Changed to sessionStorage for better security
  const raw = sessionStorage.getItem(WALLET_AUTH_STORAGE_KEY)
  
  if (!raw) {
    stopHeartbeat()
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredWalletAuth
    
    if (!parsed?.address || !parsed?.password) {
      stopHeartbeat()
      return null
    }
    
    // Check if session has expired
    if (isSessionExpired(parsed)) {
      sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
      stopHeartbeat()
      return null
    }
    
    // Update last activity timestamp
    const updated: StoredWalletAuth = {
      ...parsed,
      lastActivityAt: new Date().toISOString()
    }
    sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, JSON.stringify(updated))
    
    // Start heartbeat to keep session alive during active use
    startHeartbeat()
    
    return updated
  } catch (error) {
    console.error('[loadStoredWalletAuth] Parse error:', error)
    stopHeartbeat()
    return null
  }
}

export function persistStoredWalletAuth(auth: Omit<StoredWalletAuth, 'expiresAt' | 'lastActivityAt'>): void {
  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + MAX_SESSION_AGE_MS)
    
    const fullAuth: StoredWalletAuth = {
      ...auth,
      expiresAt: expiresAt.toISOString(),
      lastActivityAt: now.toISOString()
    }
    
    const serialized = JSON.stringify(fullAuth)
    // Changed to sessionStorage for better security (clears on browser close)
    sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, serialized)
    
    // Also save just the address as "last used wallet" in localStorage
    localStorage.setItem(LAST_WALLET_KEY, auth.address)
    
    // Start heartbeat for this new session
    startHeartbeat()
  } catch (error) {
    console.error('[persistStoredWalletAuth] Error saving:', error)
  }
}

export function clearStoredWalletAuth(): void {
  sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY)
  stopHeartbeat()
  // Don't clear LAST_WALLET_KEY - we want to remember which wallet was used
}

export function getLastUsedWalletAddress(): string | null {
  return localStorage.getItem(LAST_WALLET_KEY)
}

/**
 * Get wallet password from provided arg or session storage
 * @throws Error if password not available or session expired
 */
export function getWalletPassword(address: string, providedPassword?: string): string {
  // Try provided password first
  if (providedPassword) {
    return providedPassword
  }
  
  // Try session storage (with expiration check)
  const auth = loadStoredWalletAuth()
  if (auth?.address === address && auth.password) {
    return auth.password
  }
  
  throw new Error('Wallet password required. Please log in again.')
}

/**
 * Get session info for debugging/display purposes
 */
export function getSessionInfo(): { 
  isActive: boolean
  expiresAt?: string
  lastActivityAt?: string
  minutesUntilExpiry?: number
  minutesUntilInactivityTimeout?: number
} | null {
  const auth = loadStoredWalletAuth()
  if (!auth) {
    return { isActive: false }
  }
  
  const now = Date.now()
  const expiresAt = new Date(auth.expiresAt).getTime()
  const lastActivity = new Date(auth.lastActivityAt).getTime()
  
  return {
    isActive: true,
    expiresAt: auth.expiresAt,
    lastActivityAt: auth.lastActivityAt,
    minutesUntilExpiry: Math.floor((expiresAt - now) / (60 * 1000)),
    minutesUntilInactivityTimeout: Math.floor((lastActivity + INACTIVITY_TIMEOUT_MS - now) / (60 * 1000))
  }
}
